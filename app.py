import os
import json
import openai # Değişiklik 1: Gemini yerine OpenAI kütüphanesi
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import re
import traceback

app = Flask(__name__)
CORS(app)

# --- OpenAI API Anahtarı Ayarları ---
# Değişiklik 2: API anahtarı artık OpenAI için ayarlanıyor
# Unutma! Bu anahtarı Komut İstemi'nde 'set OPENAI_API_KEY=SENIN_ANAHTARIN' komutuyla ayarlamalısın.
openai.api_key = os.environ.get('OPENAI_API_KEY')
if not openai.api_key:
    print("UYARI: OPENAI_API_KEY ortam değişkeni ayarlanmamış. Chatbot düzgün çalışmayabilir.")

# --- Model Tanımlamaları ---
# Değişiklik 3: Model isimleri OpenAI modelleri ile güncellendi
CHAT_MODEL_ID = "gpt-3.5-turbo" 
# NOT: Embedding modeli hala Gemini'ye ait. Bilgi tabanını yeniden oluşturduğumuzda bunu da değiştireceğiz.
EMBEDDING_MODEL_OLD_GEMINI = "models/text-embedding-004" 

# --- Bilgi Tabanını Yükleme ---
KNOWLEDGE_BASE = []
KNOWLEDGE_FILE = os.path.join("knowledge_base", "metriq360_knowledge_vectors.json")

if os.path.exists(KNOWLEDGE_FILE):
    with open(KNOWLEDGE_FILE, "r", encoding="utf-8") as f:
        KNOWLEDGE_BASE = json.load(f)
    print(f"'{KNOWLEDGE_FILE}' dosyasından {len(KNOWLEDGE_BASE)} adet bilgi parçası yüklendi.")
else:
    print(f"UYARI: '{KNOWLEDGE_FILE}' bulunamadı. Lütfen önce bilgi tabanını oluşturan script'i çalıştırın.")

# --- Güvenilir Link Havuzu ve Anahtar Kelimeler (Aynı kalıyor) ---
VALID_HTML_LINKS = {
    "Dijital Pazarlama Sağlık Testi": "<a href='https://metriq360-test.netlify.app/' target='_blank'>Dijital Pazarlama Sağlık Testi</a>", 
    "Ücretsiz Analiz Talep Et": "<a href='https://www.metriq360.com/iletisim' target='_blank'>Ücretsiz Analiz Talep Et</a>",
    "WhatsApp Destek": "<a href='https://wa.me/905379484868' target='_blank'>WhatsApp Destek</a>",
    "Metriq360 Web Sitesi": "<a href='https://www.metriq360.com' target='_blank'>Metriq360 Web Sitesi</a>",
    "Blogu Ziyaret Edin": "<a href='https://www.metriq360.com/blog' target='_blank'>Blogu Ziyaret Edin</a>",
    "Tüm Paketler": "<a href='https://www.metriq360.com/paketler' target='_blank'>Tüm Paketler</a>"
}

BOLD_KEYWORDS = [
    "IQ360 Sistemi", "Turuncu Güç", "Yerel SEO", "Google Reklamları", 
    "Sosyal Medya Yönetimi", "E-Posta Pazarlama", "Retargeting", 
    "Satış Hunisi", "Dönüşüm Optimizasyonu", "Web Sitesi Optimizasyonu",
    "IQ Yerel Güç", "IQ Sosyal Büyüme", "IQ Reklam Master", "IQ Süper İkili", "IQ Zirve Paketi",
    "Metriq360", "IQ360 Bot", "IQ360 Asistanı"
]

# --- Yardımcı Fonksiyonlar (Geçici olarak Gemini Embedding ile çalışacak) ---
# NOT: Bu bölüm, create_knowledge_base script'ini güncellediğimizde OpenAI ile değişecek.
def get_embedding_gemini(text):
    # Bu fonksiyonun çalışabilmesi için geçici olarak Gemini anahtarını da ayarlamak gerekebilir.
    # set GEMINI_API_KEY=YOUR_GEMINI_KEY
    import google.generativeai as genai
    gemini_key = os.environ.get('GEMINI_API_KEY')
    if not gemini_key:
        print("UYARI: Geçici Gemini API Anahtarı bulunamadı. Bağlam (context) bulunamayacak.")
        return None
    try:
        genai.configure(api_key=gemini_key)
        response = genai.embed_content(model=EMBEDDING_MODEL_OLD_GEMINI, content=text)
        return response['embedding']
    except Exception as e:
        print(f"Gemini Embedding hatası: {e}")
        return None

def cosine_similarity(vec1, vec2):
    if vec1 is None or vec2 is None: return 0
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

def find_relevant_chunks(query_embedding, knowledge_base, top_k=5):
    if query_embedding is None: return []
    similarities = [(cosine_similarity(query_embedding, item["embedding"]), item["text"]) for item in knowledge_base if item.get("embedding")]
    similarities.sort(key=lambda x: x[0], reverse=True)
    return [text for sim, text in similarities[:top_k]]

def clean_and_format_response(text):
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    text = re.sub(r'[\*_#`~]', '', text) 
    for display_text, html_link_full in VALID_HTML_LINKS.items():
        pattern = re.compile(r'\b' + re.escape(display_text) + r'\b', re.IGNORECASE) 
        text = pattern.sub(html_link_full, text)
    for keyword in BOLD_KEYWORDS:
        pattern = re.compile(r'\b(' + re.escape(keyword) + r')\b(?![^<]*>|[^<]*<\/?a)', re.IGNORECASE)
        text = pattern.sub(r'<strong>\1</strong>', text)
    text = re.sub(r'\n\s*\n+', '<br><br>', text.strip())
    text = text.replace('\n', '<br>')
    return text.strip()

def create_related_questions_from_ai_output(raw_text):
    json_match = re.search(r'\[QUESTIONS_JSON_START\](.*?)\[QUESTIONS_JSON_END\]', raw_text, re.DOTALL)
    if json_match:
        try:
            json_str = json_match.group(1).strip()
            if not json_str.strip() or json_str == "{}": return []
            parsed_json = json.loads(json_str)
            return parsed_json.get("sorular", [])
        except json.JSONDecodeError: return []
    return []

# --- Flask Rotaları ---
@app.route('/')
def home():
    return "Metriq360 Chatbot Backend (OpenAI Motoru) çalışıyor!"

@app.route('/chat', methods=['POST'])
def chat():
    if not request.is_json: return jsonify({"error": "İstek JSON formatında olmalı."}), 400
    data = request.get_json()
    user_message = data.get('message')
    chat_history = data.get('history', [])

    if not user_message: return jsonify({"error": "Mesaj alanı boş olamaz."}), 400
    if not openai.api_key: return jsonify({"response": "Üzgünüm, OpenAI API anahtarım yapılandırılmadığı için şu an yanıt veremiyorum."}), 500

    try:
        # Şimdilik Gemini embedding kullanmaya devam ediyoruz
        query_embedding = get_embedding_gemini(user_message)
        context_info = ""
        if query_embedding and KNOWLEDGE_BASE:
            relevant_chunks = find_relevant_chunks(query_embedding, KNOWLEDGE_BASE)
            if relevant_chunks:
                context_info = "\n\n### Referans Bilgi ###\n" + "\n\n".join(relevant_chunks)
        
        # Değişiklik 4: OpenAI için yeni prompt yapısı
        system_prompt = f"""
        Sen, METRIQ360'ın uzman satış danışmanı IQ360 Asistanı'sın. Konuşma tarzın samimi, güven veren ve proaktif olmalı.
        Tek bir amacın var: Kullanıcıyı ikna edip onu METRIQ360'a yönlendirmek. Verdiğin her cevap ve ürettiğin her soru, kullanıcıyı şu dört hedeften birine yönlendirmeli: "Dijital Pazarlama Sağlık Testi", "Ücretsiz Analiz Talep Et", belirli bir hizmet/paket veya "WhatsApp Destek".
        Cevapların kısa ve öz (en fazla 3-4 cümle) olmalı.
        ASLA link verme, sadece anahtar metinleri kullan.
        Eğer bir soru soruyorsan, buton üretme. Eğer soru sormuyorsan, kullanıcıyı hedeflere yönlendiren 3 soru önerisi üret.
        Önerilecek soruları [QUESTIONS_JSON_START] ve [QUESTIONS_JSON_END] etiketleri arasında bir JSON formatında ver. Örnek: [QUESTIONS_JSON_START]{{"sorular": ["Soru 1", "Soru 2", "Soru 3"]}}[QUESTIONS_JSON_END]
        Konuşma geçmişine bakarak kendini tekrar etme.
        """
        
        messages = [{"role": "system", "content": system_prompt}]
        for item in chat_history:
            role = "user" if item['role'] == 'user' else "assistant"
            messages.append({"role": role, "content": item['message']})
        
        messages.append({"role": "user", "content": f"{context_info}\n\nKullanıcı Sorusu: {user_message}"})

        # === Değişiklik 5: OpenAI API Çağrısı ===
        # Not: openai kütüphanesinin 1.0.0 öncesi sürümü için bu yapı geçerlidir.
        # Yeni versiyonlarda client oluşturmak gerekir. `pip install openai==0.28` ile uyumludur.
        completion = openai.ChatCompletion.create(
            model=CHAT_MODEL_ID,
            messages=messages
        )
        bot_response_raw = completion.choices[0].message['content']

        follow_up_questions_list = create_related_questions_from_ai_output(bot_response_raw)
        
        json_match = re.search(r'\[QUESTIONS_JSON_START\](.*?)\[QUESTIONS_JSON_END\]', bot_response_raw, re.DOTALL)
        response_main_text = bot_response_raw.replace(json_match.group(0), '').strip() if json_match else bot_response_raw.strip()

        final_bot_response = clean_and_format_response(response_main_text)
        
        return jsonify({"response": final_bot_response, "follow_up_questions": follow_up_questions_list})
        
    except Exception as e:
        print(f"!!! KRİTİK HATA: Chat endpoint'inde beklenmedik bir sorun oluştu: {e}")
        traceback.print_exc()
        error_response_text = "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin veya <strong>WhatsApp Destek</strong> ile iletişime geçin."
        return jsonify({"response": error_response_text})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
