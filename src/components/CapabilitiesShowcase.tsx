import React, { useState } from "react";
import { 
  TrendingUp, 
  Target, 
  Map, 
  HelpCircle, 
  CheckCircle,
  Zap,
  Users,
  Search,
  MessageSquare
} from "lucide-react";

export default function CapabilitiesShowcase() {
  const [activeCapability, setActiveCapability] = useState(0);

  const capabilities = [
    {
      title: "Müşteri Eşleştirme (Dynamic Lead Matchmaking)",
      icon: Target,
      tag: "Dönüşüm Oranı Artışı",
      desc: "Ziyaretçilerinizin sektörünü, reklam bütçesini ve şu anki en büyük büyüme sorununu analiz eder. En uygun pazarlama paketini anında tespit edip önerir.",
      benefit: "Sıradan formlara göre %250 daha yüksek form doldurma oranı sunar.",
      example: "Bot: 'Bir e-ticaret siteniz olduğunu belirttiniz. Aylık 50k+ trafik için CRO (Dönüşüm Optimizasyonu) ve Meta Reklam Paketimiz tam size uygun!'",
      color: "from-emerald-500 to-teal-500 text-teal-400"
    },
    {
      title: "7/24 SSS & Hizmet Bilgilendirme",
      icon: HelpCircle,
      tag: "Sınırsız Ölçeklenebilirlik",
      desc: "İster gece saat 3 olsun, ister hafta sonu; ajansınızın fiyat bilgisi, referans projeleri, çalışma metodolojisi ve Systeme.io entegrasyonuyla ilgili tüm soruları anında yanıtlar.",
      benefit: "Soru sorup yanıt bekleyen müşterileri kaçırmadan anında sıcak satışa dönüştürür.",
      example: "Bot: 'Tabii ki! Tüm süreçlerimizi Trello üzerinden şeffaf şekilde yönetiyoruz. Ayda 2 kez detaylı büyüme raporu iletiyoruz.'",
      color: "from-sky-500 to-indigo-500 text-sky-400"
    },
    {
      title: "Akıllı Randevu ve Takvim Yönlendirmesi",
      icon: TrendingUp,
      tag: "Toplantı Otomasyonu",
      desc: "Sohbet esnasında ciddi niyetli olan müşterileri algılar ve onları Calendly / TidyCal gibi rezervasyon linklerinize yönlendirerek doğrudan takviminize toplantı kaydeder.",
      benefit: "Satış temsilcilerinizin e-posta trafiğiyle vakit kaybetmesini önler.",
      example: "Bot: 'Harika görünüyor! Sizleri dinlemek için sabırsızlanıyoruz. Calendly linkimiz üzerinden uygun bir tarih seçip toplantı tanımlayabilirsiniz.'",
      color: "from-indigo-500 to-purple-500 text-indigo-400"
    },
    {
      title: "Pazarlama ve Dönüşüm Denetimi (Growth Audit)",
      icon: Zap,
      tag: "Yüksek Güven İnşası",
      desc: "Sitenizi ziyaret eden girişimcilere ayaküstü hızlı bir dijital büyüme tavsiyesi verir. Dönüşüm oranlarını nasıl arttıracakları konusunda Gemini yapay zeka motoruyla stratejik akıl hocalığı yapar.",
      benefit: "Ziyaretçiye daha tanışmadan devasa bir uzmanlık değeri katarak ajansın otoritesini kanıtlar.",
      example: "Bot: 'Sepete ekleme oranınız %5 ise, ödeme adımlarındaki sürtünmeleri azaltmak için tek tıkla ödeme yöntemlerini entegre etmelisiniz.'",
      color: "from-rose-500 to-pink-500 text-rose-400"
    }
  ];

  return (
    <div id="capabilities-showcase-container" className="bg-growth-dark/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Zap className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="font-display font-bold text-lg text-white">Yapay Zeka Botu Neler Yapabilir?</h2>
          <p className="text-xs text-slate-400">Ajansınızı otomatik pilotta büyütecek 4 süper yetenek</p>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-5 gap-6 flex-1 flex flex-col">
        {/* Capability Selectors */}
        <div className="lg:col-span-2 space-y-2.5 flex flex-col justify-start">
          {capabilities.map((c, idx) => {
            const Icon = c.icon;
            return (
              <button
                key={idx}
                id={`btn-capability-select-${idx}`}
                onClick={() => setActiveCapability(idx)}
                type="button"
                className={`w-full text-left p-3 rounded-xl border transition-all duration-300 flex items-start gap-3 cursor-pointer pointer-events-auto ${
                  activeCapability === idx
                    ? "bg-slate-900 border-slate-700 shadow shadow-emerald-500/5"
                    : "bg-slate-950/40 border-slate-900 text-slate-400 hover:text-white hover:border-slate-800"
                }`}
              >
                <div className={`p-2 rounded-lg ${activeCapability === idx ? "bg-emerald-500/15 text-white" : "bg-slate-900 text-slate-500"} mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-xs truncate leading-snug">{c.title}</h3>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{c.tag}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Capability Presentation Card */}
        <div className="lg:col-span-3 bg-slate-950/80 border border-slate-800/60 rounded-xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-2xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950 border border-emerald-900/40 px-2.5 py-1 rounded-full">
              {capabilities[activeCapability].tag}
            </span>

            <div className="space-y-2">
              <h3 className="font-display font-black text-slate-100 text-base">
                {capabilities[activeCapability].title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {capabilities[activeCapability].desc}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-900">
            {/* Value outcome box */}
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">🎯 ANA FAYDA:</span>
              <p className="text-xs text-emerald-400 font-semibold">{capabilities[activeCapability].benefit}</p>
            </div>

            {/* Conversation mockup snippet */}
            <div className="bg-slate-950 border border-slate-900 p-3 rounded-lg flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-slate-500 mt-1 shrink-0" />
              <div className="text-[10.5px] italic text-slate-300">
                {capabilities[activeCapability].example}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
