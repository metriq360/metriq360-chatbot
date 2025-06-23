import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from google.api_core import exceptions as google_exceptions
import numpy as np
import re
import traceback

app = Flask(__name__)
CORS(app)

# --- Ortam Değişkeni ve API Anahtarı Ayarları ---
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

if not GEMINI_API_KEY:
    print("UYARI: GEMINI_API_KEY ortam değişkeni ayarlanmamış. Chatbot düzgün çalışmayabilir.")

genai.configure(api_key=GEMINI_API_KEY)

# === STABİL 'FLASH' MODEL ===
GENERATIVE_MODEL_ID = 'gemini-2.0-flash' 
EMBEDDING_MODEL = "models/text-embedding-004"

# --- Bilgi Tabanını Yükleme ---
KNOWLEDGE_BASE = []
KNOWLEDGE_FILE = os.path.join("knowledge_base", "metriq360_knowledge_vectors.json")

if os.path.exists(KNOWLEDGE_FILE):
    with open(KNOWLEDGE_FILE, "r", encoding="utf-8") as f:
        KNOWLEDGE_BASE = json.load(f)
    print(f"'{KNOWLEDGE_FILE}' dosyasından {len(KNOWLEDGE_BASE)} adet bilgi parçası yüklendi.")
else:
    print(f"UYARI: '{KNOWLEDGE_FILE}' bulunamadı. Lütfen önce 'create_knowledge_base.py' script'ini çalıştırın.")

# --- Güvenilir Link Havuzu (Backend Kontrollü) ---
VALID_HTML_LINKS = {
    "Dijital Pazarlama Sağlık Testi": "<a href='https://metriq360-test.netlify.app/' target='_blank'>Dijital Pazarlama Sağlık Testi</a>", 
    "Ücretsiz Analiz Talep Et": "<a href='https://www.metriq360.com/iletisim' target='_blank'>Ücretsiz Analiz Talep Et</a>",
    "WhatsApp Destek": "<a href='https://wa.me/905379484868' target='_blank'>WhatsApp Destek</a>",
    "Metriq360 Web Sitesi": "<a href='https://www.metriq360.com' target='_blank'>Metriq360 Web Sitesi</a>",
    "Blogu Ziyaret Edin": "<a href='https://www.metriq360.com/blog' target='_blank'>Blogu Ziyaret Edin</a>",
    "Tüm Paketler": "<a href='https://www.metriq360.com/paketler' target='_blank'>Tüm Paketler</a>"
}

# Otomatik bold yapılacak anahtar kelimeler
BOLD_KEYWORDS = [
    "IQ360 Sistemi", "Turuncu Güç", "Yerel SEO", "Google Reklamları", 
    "Sosyal Medya Yönetimi", "E-Posta Pazarlama", "Retargeting", 
    "Satış Hunisi", "Dönüşüm Optimizasyonu", "Web Sitesi Optimizasyonu",
    "IQ Yerel Güç", "IQ Sosyal Büyüme", "IQ Reklam Master", "IQ Süper İkili", "IQ Zirve Paketi",
    "Metriq360", "IQ360 Bot", "IQ360 Asistanı"
]

# --- Yardımcı Fonksiyonlar ---
def get_embedding(text):
    if not GEMINI_API_KEY: return None
    try:
        response = genai.embed_content(model=EMBEDDING_MODEL, content=text)
        return response['embedding']
    except Exception as e:
        print(f"Metin vektörleştirilirken hata oluştu: {e}")
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
    lines = text.split('<br>')
    html_output_lines = []
    in_list = False
    for line in lines:
        stripped_line = line.strip()
        if (stripped_line.startswith('• ') or stripped_line.startswith('- ')) and not re.search(r'<a\s+href=', stripped_line):
            if not in_list:
                html_output_lines.append('<ul>')
                in_list = True
            html_output_lines.append(f'<li>{stripped_line[2:].strip()}</li>')
        else:
            if in_list: 
                html_output_lines.append('</ul>')
                in_list = False
            if stripped_line: 
                html_output_lines.append(stripped_line)
    if in_list: 
        html_output_lines.append('</ul>')
    final_text = "".join(html_output_lines)
    final_text = re.sub(r'(<br>\s*){2,}', '<br><br>', final_text) 
    final_text = re.sub(r'^\s*<br>\s*|\s*<br>\s*$', '', final_text) 
    final_text = re.sub(r'<ul><br>|</ul><br>|<li><br>|<br>(\s*<li>)|<\/li><br>', lambda m: m.group(0).replace('<br>',''), final_text)
    return final_text.strip()

def create_related_questions_from_ai_output(raw_text):
    json_match = re.search(r'\[QUESTIONS_JSON_START\](.*?)\[QUESTIONS_JSON_END\]', raw_text, re.DOTALL)
    if json_match:
        try:
            json_str = json_match.group(1).strip()
            if not json_str.strip() or json_str == "{}":
                return []
            parsed_json = json.loads(json_str)
            return parsed_json.get("sorular", [])
        except json.JSONDecodeError:
            return []
    return []

# --- Flask Rotaları ---
@app.route('/')
def home():
    return "Metriq360 Chatbot Backend çalışıyor ve Gemini'ye bağlanmaya hazır!"

@app.route('/chat', methods=['POST'])
def chat():
    if not request.is_json: return jsonify({"error": "İstek JSON formatında olmalı."}), 400
    data = request.get_json()
    user_message = data.get('message')
    chat_history = data.get('history', [])

    if not user_message: return jsonify({"error": "Mesaj alanı boş olamaz."}), 400
    if not GEMINI_API_KEY: return jsonify({"response": "Üzgünüm, API anahtarım yapılandırılmadığı için şu an yanıt veremiyorum."}), 500

    try:
        query_embedding = get_embedding(user_message)
        context_info = ""
        if query_embedding and KNOWLEDGE_BASE:
            relevant_chunks = find_relevant_chunks(query_embedding, KNOWLEDGE_BASE)
            if relevant_chunks:
                context_info = "\n\n### Referans Bilgi ###\n" + "\n\n".join(relevant_chunks)
        
        formatted_history = ""
        for item in chat_history:
            formatted_history += f"**{item['role'].capitalize()}:** {item['message']}\n"

        # === FİNAL, HADDİNİ BİLEN VE SATIŞ ODAKLI PROMPT ===
        prompt = f"""
        GÖREV: Kullanıcının sorununu anlayan, onu yönlendiren ve METRIQ360 çözümlerine ikna eden uzman bir satış danışmanı gibi davran.
        KİMLİK: Sen, METRIQ360'ın uzman satış danışmanı IQ360 Asistanı'sın.
        
        ANA DİREKTİF (EN ÖNEMLİ KURAL):
        Senin ilk görevin, müşteriye yardımcı olmak. İkinci görevin, onu METRIQ360'a yönlendirmektir.
        - **KURAL 1 (DİREKT BİLGİ VER):** Eğer kullanıcı senden net bir bilgi istiyorsa (telefon, mail, adres, firma adı, sahip kim gibi), oyalama yapmadan, bahane üretmeden, DOĞRUDAN o bilgiyi "Referans Bilgi" içinden ver.
        - **KURAL 2 (SONRA YÖNLENDİR):** Direkt bir soruya cevap verdikten sonra, nazikçe konuyu tekrar satış hedeflerine bağlayabilirsin. (Örn: "İletişim numaramız bu. Bu arada, size özel bir analiz yapmamızı ister misiniz?")
        
        SATIŞ ODAĞI:
        Yukarıdaki kural dışında, verdiğin her cevap ve ürettiğin her soru, kullanıcıyı şu dört hedeften BİRİNE yönlendirmeli: 
        1. **Dijital Pazarlama Sağlık Testi**'ni çözmeye teşvik etmek.
        2. **Ücretsiz Analiz Talep Et**'meye ikna etmek.
        3. Belirli bir hizmeti/paketi sordurarak satış hunisine çekmek.
        4. **WhatsApp Destek** ile gerçek bir insana bağlamak.
        BU DÖRDÜNÜN DIŞINA ÇIKMA. Kullanıcıyı genel pazarlama teorileriyle oyalama.
        
        YIKILMAZ YARDIMCI KURALLAR:
        - **CEVAP UZUNLUĞU:** Yanıtların HER ZAMAN kısa ve öz olacak (EN FAZLA 3-4 CÜMLE). Lafı geveleme.
        - **LİNK KURALI:** Link için sadece "Dijital Pazarlama Sağlık Testi", "Ücretsiz Analiz Talep Et" gibi anahtar metinleri kullan. `http` veya `[]()` KULLANMA.
        - **KİMLİK KURALI:** ASLA kendini yeniden tanıtma.

        ZEKA TESTİ 7.0 (FİNAL MANTIK):
        Cevabının ardından kullanıcıya soru önerileri sunacaksın. MANTIK ŞU:
        - **KURAL A (CEVAP BEKLEME MODU):** Eğer senin verdiğin cevap, kullanıcıdan bilgi almak için bir soruyla bitiyorsa (Örn: "Ne konuda fikir istersiniz?"), o zaman JSON bloğunu **KESİNLİKLE BOŞ BIRAKACAKSIN.** (`"sorular": []`). Buton üretme. Kullanıcının cevap yazmasını bekle.
        - **KURAL B (SATIŞA YÖNLENDİRME MODU):** Eğer verdiğin cevap bir soru içermiyorsa, o zaman üreteceğin 3 soru, kullanıcıyı ANA GÖREV'deki hedeflere yönlendiren, satış odaklı sorular olmalıdır.
        - **HAFIZA KURALI:** Konuşma geçmişine bakarak aynı şeyleri tekrar etmekten kaçın.

        BU KURALLARA UYMAK ZORUNDASIN.
        
        --- Konuşma Geçmişi ---
        {formatted_history}
        -----------------------

        [QUESTIONS_JSON_START]
        {{"sorular": []}}
        [QUESTIONS_JSON_END]

        {context_info}
        
        ### Son Kullanıcı Mesajı ###
        {user_message}
        """

        model = genai.GenerativeModel(GENERATIVE_MODEL_ID)
        response = model.generate_content(prompt)
        bot_response_raw = response.text
        
        follow_up_questions_list = create_related_questions_from_ai_output(bot_response_raw)
        
        json_match = re.search(r'\[QUESTIONS_JSON_START\](.*?)\[QUESTIONS_JSON_END\]', bot_response_raw, re.DOTALL)
        response_main_text = bot_response_raw.replace(json_match.group(0), '').strip() if json_match else bot_response_raw.strip()

        final_bot_response = clean_and_format_response(response_main_text)
        
        return jsonify({"response": final_bot_response, "follow_up_questions": follow_up_questions_list})
        
    except google_exceptions.ResourceExhausted as e:
        print(f"!!! KOTA HATASI: Gemini API kullanım limiti aşıldı: {e}")
        error_response_text = "Şu anda API sunucuları çok yoğun. Lütfen bir dakika bekleyip tekrar deneyin."
        return jsonify({"response": error_response_text})
    except Exception as e:
        print(f"!!! KRİTİK HATA: Chat endpoint'inde beklenmedik bir sorun oluştu: {e}")
        traceback.print_exc()
        error_response_text = "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin veya <strong>WhatsApp Destek</strong> ile iletişime geçin."
        return jsonify({"response": error_response_text})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
