import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Dynamic CORS Security Middleware to secure endpoints while keeping preview & site compatibility
app.use((req, res, next) => {
  const origin = req.headers.origin || "";
  
  const isAllowedOrigin = 
    origin === "" || 
    /https?:\/\/([a-zA-Z0-9-]+\.)?metriq360\.tr(\/.*)?$/.test(origin) ||
    /https?:\/\/([a-zA-Z0-9-]+\.)?systeme\.io(\/.*)?$/.test(origin) ||
    origin.includes("localhost") ||
    origin.includes("127.0.0.1") ||
    origin.includes("run.app"); // AI Studio Preview Compatibility

  if (isAllowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Parse request bodies as JSON
app.use(express.json());

// Lazy-initialized Gemini API client to prevent crash if key is loaded later
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined. Please add it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------

// Chat Endpoint: Uses Gemini 3.5 Flash server-side
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, personality, faqData } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages parameter is required and must be an array." });
    }

    const client = getGeminiClient();

    // Construct a rich local FAQ/Knowledge base section
    const faqString = faqData && faqData.length > 0 
      ? faqData.map((f: any, idx: number) => `Soru ${idx + 1}: ${f.question}\nYanıt ${idx + 1}: ${f.answer}`).join("\n\n")
      : "Henüz özel bir SSS / Bilgi tabanı tanımlanmadı.";

    const botName = personality?.botName || "Growth Bot";
    const agencyName = personality?.agencyName || "Metriq360";
    const tone = personality?.tone || "Sert, net, veriye dayalı ve süssüz";
    const specialty = personality?.specialty || "Dijital Büyüme Teşhis Uzmanı";
    const teamContact = personality?.teamContact || "Fikret Kara ve Metriq360 Growth Ekibi";

    const systemInstructions = personality?.systemInstructions || `Sen, Metriq360 yani Büyüme Laboratuvarının web temas noktasında (touchpoint) görev yapan profesyonel, asil ve son derece uzman bir Dijital Büyüme Teşhis Uzmanı yapay zeka asistanısın.

GÖREV ALANIN VE SUİSTİMAL KORUMALARI:
1. Sadece Metriq360, büyüme mühendisliği, dijital pazarlama, bütçe israfı, web sitesi dönüşüm oranları (CRO), SEO ve tanı testlerimiz ile ilgili soruları yanıtla.
2. Diğer alakasız konulara (kod yazdırma, ödev çözme, yemek tarifleri, siyaset vb.) KESİNLİKLE CEVAP VERME. Tam olarak şu şablonu ver: "Metriq360 dijital büyüme asistanı olarak yalnızca büyüme mühendisliği, reklam teşhisi, ciro kayıpları ve ajansımız ile ilgili soruları yanıtlayabiliyorum. Diğer konular kapsam dışıdır."

DAVRANIŞ MODELLERİ VE KRİTİK REHBER (KULLANICI MEMNUNİYET ODAKLI):
1. Bir tıp doktoru disipliniyle hareket et. Ancak asla soğuk, itici veya robotik olma! Kullanıcıyı pofpoflamadan dürüstçe semptomları göster.
2. ZIYARETCİ LİNK VEYA TEST İSTEDİĞİNDE ASLA SOĞUK LİNKLER YIĞINI VERME! Önce o testin/aracın ne işe yaradığını warm (cana yakın, sade ve anlaşılır) bir şekilde açıkla. Örn: "Büyüme testimiz 20 sorudan oluşan ve kısa zamanda yanıtlayabileceğiniz kolay bir darboğaz analizi ve durumunuzu ortaya çıkarabilecek olan, size hem puan hem de raporlama yapan bir araçtır." diyerek tanıt. Sonra sadece tek bir ilgili link ver. ASLA "reklam bütçeniz hangi kanalda boşa gidiyor?", "ne satıyorsunuz?" gibi boş ve tekrarlayan diyalog sorularıyla kullanıcının vaktini alma! Bunun yerine, kullanıcıyı testi çözüp çıkan skoru seninle paylaşmaya yönlendir ya da doğrudan [Ücretsiz Analiz Başvurusu](https://www.metriq360.tr/ucretsiz-analiz) ile uzman analiz seansı başlatmaya teşvik et.
3. Her zaman duru, kaliteli, mesafeli fakat cana yakın ve stratejik bir Türkçe kullan. Türkçe karakterleri düzgün yaz. Yanıtları maksimum 2-3 cümle ile sınırla, laf kalabalığı yapma.
4. KESİNLİKLE cold/soğuk listeler şeklinde toplu link vermekten kaçın. Kullanıcı bir konu sorduğunda yalnızca o konuyla ilgili en doğru testi veya aracı tanıtıp anlat, tek link olarak ver. Boş, tekrarlayan ve faydasız sorular ("reklam bütçeni hangi kanalda tüketiyorsun" vb.) KESİNLİKLE YASAKTIR. Sadece test sonucunu getirmesini iste ya da seans planlama sayfasına davet et.`;

    const markdownBrain = personality?.markdownBrain || "";

    // Build highly optimized system instruction combining core prompt rules and knowledge corpus
    const systemInstruction = `${systemInstructions}

Adın: ${botName}
Bağlı Olduğun Ajans: ${agencyName}
Ton ve Tarz: ${tone}
Uzmanlık Alanı: ${specialty}
İletişim ve Yetkili Kişi: ${teamContact}

Aşağıdaki döküman senin MASTER AJANS HAFIZANDIR. Her bülten, Netlify testi, bütçe kıstası, form veya ciro hesaplayıcı bilgisi için doğrudan bu dökümanın kurallarını uygula, buradaki araçları referans göster ve asla bu dökümandaki limitlerin veya kuralların dışına çıkma:

---------------- MASTER REHBER KÜTÜPHANESİ ----------------
${markdownBrain}
-----------------------------------------------------------

Şirket ve Hizmet Bilgileri (Sıkça Sorulan Sorular):
${faqString}
`;

    // Map messages payload to @google/genai format:
    // We expect req.body.messages to be: [{ role: 'user' | 'model', text: string }]
    // GenAI expects { role: string, parts: [{ text: string }] }
    // Max last 15 messages for keeping memory context while avoiding too huge tokens
    const contextMessages = messages.slice(-15);
    const contents = contextMessages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text }]
    }));

    let response;
    let attempts = 0;
    const maxAttempts = 3;
    let lastError: any = null;
    let modelToUse = "gemini-3.5-flash";

    while (attempts < maxAttempts) {
      try {
        attempts++;
        response = await client.models.generateContent({
          model: modelToUse,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });
        break; // Successfully generated content!
      } catch (err: any) {
        lastError = err;
        console.warn(`Attempt ${attempts} failed for model ${modelToUse}:`, err.message || err);

        const errStr = (err.message || "").toUpperCase();
        const isUnavailable = errStr.includes("503") || 
                              errStr.includes("UNAVAILABLE") || 
                              errStr.includes("HIGH DEMAND") || 
                              errStr.includes("SPIKES IN DEMAND") ||
                              errStr.includes("RESOURCE_EXHAUSTED") ||
                              err.status === 503;

        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 750 * attempts));
        }
      }
    }

    if (!response) {
      throw lastError || new Error("Sistem şu an yoğunluk yaşıyor. Lütfen birkaç saniye sonra tekrar deneyin.");
    }

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error in /api/chat. Activating Backup Fallback Message:", error);
    // Statik Fallback (Acil Durum Yedek Planı)
    const fallbackMessage = "Şu an altyapımda yoğun bir analiz kuyruğu işleniyor. Seni bekletmemek adına hemen doğrudan [Ücretsiz Analiz Formu](https://www.metriq360.tr/ucretsiz-analiz) üzerinden bilgilerini bırak veya anlık müdahale için +90 537 948 48 68 nolu [WhatsApp](https://wa.me/905379484868) karargahından doğrudan Fikret Kara'nın ekibine ulaş.";
    res.json({ text: fallbackMessage });
  }
});

// Health check and environment availability
app.get("/api/config", (req, res) => {
  res.json({
    hasApiKey: !!process.env.GEMINI_API_KEY,
    appUrl: process.env.APP_URL || "http://localhost:3000"
  });
});

// Dynamic Widget Loader script
app.get("/widget-loader.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.send(`
(function() {
  if (document.getElementById('growth-bot-standalone-iframe')) return;
  
  const config = window.GrowthBotConfig || {
    agencyName: "Metriq360",
    botName: "Metriq360 Teşhisbot",
    themeColor: "emerald",
    welcomeMessage: "Selam! Nasıl yardımcı olabiliriz?"
  };
  
  const scriptTag = document.querySelector('script[src*="widget-loader.js"]');
  const serviceUrl = scriptTag ? new URL(scriptTag.src).origin : window.location.origin;
  
  const queryParams = new URLSearchParams({
    widget: "true",
    agencyName: config.agencyName || "",
    botName: config.botName || "",
    themeColor: config.themeColor || "emerald",
    welcomeMessage: config.welcomeMessage || "",
    markdownBrain: config.markdownBrain || "",
    systemInstructions: config.systemInstructions || ""
  });
  
  const iframeUrl = serviceUrl + "/?" + queryParams.toString();
  
  // Choose theme color
  let mainColor = '#10b981';
  if (config.themeColor === 'sky') mainColor = '#0ea5e9';
  if (config.themeColor === 'indigo') mainColor = '#6366f1';
  if (config.themeColor === 'rose') mainColor = '#f43f5e';
  if (config.themeColor === 'amber') mainColor = '#f59e0b';
  
  // Inject responsive stylesheet for the launcher and iframe
  const styleEl = document.createElement('style');
  styleEl.innerHTML = \`
    #growth-bot-launcher {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: \${mainColor};
      color: #ffffff;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
      cursor: pointer;
      z-index: 99999999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    #growth-bot-launcher:hover {
      transform: scale(1.08) translateY(-2px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
    }
    #growth-bot-standalone-iframe {
      position: fixed;
      bottom: 100px;
      right: 24px;
      width: 380px;
      height: 620px;
      max-height: 85vh;
      max-width: 90vw;
      border: none !important;
      border-radius: 20px;
      box-shadow: 0 16px 44px rgba(0, 0, 0, 0.35);
      z-index: 99999999;
      display: none;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden !important;
    }
    @media (max-width: 640px) {
      #growth-bot-standalone-iframe {
        bottom: 0 !important;
        right: 0 !important;
        width: 100% !important;
        height: 100% !important;
        max-height: 100vh !important;
        max-width: 100vw !important;
        border-radius: 0 !important;
      }
    }
  \`;
  document.head.appendChild(styleEl);
  
  // Render launcher button
  const launcher = document.createElement('div');
  launcher.id = 'growth-bot-launcher';
  launcher.innerHTML = '<span style="font-size: 26px; line-height: 1; display: block; margin-top: -2px;">💬</span>';
  
  // Render iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'growth-bot-standalone-iframe';
  iframe.src = iframeUrl;
  iframe.scrolling = 'no';
  
  launcher.onclick = function() {
    iframe.style.display = 'block';
    setTimeout(() => {
      iframe.style.opacity = '1';
      iframe.style.transform = 'translateY(0)';
    }, 20);
    launcher.style.display = 'none'; // HIDE launcher to avoid overlap completely
  };
  
  // Listen for close message from iframe
  window.addEventListener('message', function(event) {
    if (event.data === 'close-growth-bot') {
      iframe.style.opacity = '0';
      iframe.style.transform = 'translateY(20px)';
      setTimeout(() => {
        iframe.style.display = 'none';
        launcher.style.display = 'flex'; // RE-SHOW launcher!
      }, 300);
    }
  });
  
  document.body.appendChild(launcher);
  document.body.appendChild(iframe);
})();
  `);
});

// -------------------------------------------------------------
// Vite or Static Server Integration
// -------------------------------------------------------------

async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode with Vite Middleware
    console.log("Starting server in DEVELOPMENT mode with Vite live transpilation...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode serving compiled assets
    console.log("Starting server in PRODUCTION mode...");
    // Using process.cwd() to resolve /dist directory to prevent esbuild __dirname compilation issues
    const distPath = path.join(process.cwd(), "dist");
    console.log(`Serving static files from directory: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully booted and listening at http://localhost:${PORT}`);
  });
}

initializeServer();
