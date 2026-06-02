import React, { useState } from "react";
import { 
  Code, 
  Settings, 
  MousePointerClick, 
  HelpCircle, 
  Copy, 
  Check, 
  Building2, 
  CheckCircle2, 
  FileCode,
  Layers,
  Sparkles
} from "lucide-react";
import { Personality } from "../types";

interface SystemeGuideProps {
  personality: Personality;
}

export default function SystemeGuide({ personality }: SystemeGuideProps) {
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  // Derive current URL of the deployment safely
  const devUrl = typeof window !== "undefined" ? window.location.origin : "https://metriq360-bot.ai";

  const generatedScript = `<!-- Metriq360 Yapay Zeka Growth Bot Entegrasyonu -->
<script>
  window.GrowthBotConfig = {
    agencyName: "${personality.agencyName}",
    botName: "${personality.botName}",
    themeColor: "${personality.themeColor}",
    welcomeMessage: "${personality.welcomeMessage.replace(/"/g, '\\"')}",
    markdownBrain: "${(personality.markdownBrain || '').replace(/"/g, '\\"').replace(/\n/g, '\\n')}",
    systemInstructions: "${(personality.systemInstructions || '').replace(/"/g, '\\"').replace(/\n/g, '\\n')}",
    serviceUrl: "${devUrl}"
  };
</script>
<script src="${devUrl}/widget-loader.js" async></script>`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Kopyalama hatası:", err);
    }
  };

  const steps = [
    {
      id: 1,
      title: "Kodu Hazırlayın",
      icon: Code,
      desc: "Yapay zeka robotunuzun sol taraftaki panelde tüm ayarlarını ve Bilgi Tabanı (FAQ) verilerini tamamladıktan sonra buradaki özel entegrasyon kodunu kopyalayın."
    },
    {
      id: 2,
      title: "Systeme.io Sayfa Editörünü Açın",
      icon: Layers,
      desc: "Systeme.io paneline giriş yapın. Funnel (Girişim Hunileri) sekmesinden botu eklemek istediğiniz sayfayı seçin ve sağ üstteki 'Edit Page' (Sayfa Düzenleme) butonuna tıklayın."
    },
    {
      id: 3,
      title: "Sayfa Ayarlarına Girin",
      icon: Settings,
      desc: "Editörde sol menüdeki 'Settings' (Ayarlar) sekmesine gidin. En aşağı doğru kaydırdığınızda 'Header code' veya 'Edit header code' (Üst Başlık Kodu) seçeneğini bulacaksınız."
    },
    {
      id: 4,
      title: "Kodu Yapıştırın ve Kaydedin",
      icon: MousePointerClick,
      desc: "Açılan pencerede bu panodan kopyaladığınız script kodunu yapıştırın. Yapıştırdıktan sonra pencereyi kapatın, sağ üstteki 'Save Changes' (Değişiklikleri Kaydet) butonuna tıklayın. Bot artık yayında!"
    }
  ];

  return (
    <div id="systeme-guide-container" className="bg-growth-dark/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col h-full min-w-0 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <FileCode className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display font-bold text-lg text-white">Systeme.io Entegrasyon Kılavuzu</h2>
          <p className="text-xs text-slate-400">Yapay zeka asistanını funnel sayfanıza 2 dakikada bağlayın</p>
        </div>
      </div>

      {/* Copyable Script Card */}
      <div className="bg-slate-950 rounded-xl border border-slate-800/85 p-4 mb-5 flex flex-col">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Dinleyici Script Kodu (HTML/JS)
          </span>
          <button
            id="btn-copy-script"
            onClick={handleCopyCode}
            className={`cursor-pointer pointer-events-auto text-xs font-semibold py-1.5 px-3.5 rounded-lg flex items-center gap-1.5 transition-all ${
              copied 
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 animate-scaleIn" /> Kopyalandı!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Kodu Kopyala
              </>
            )}
          </button>
        </div>

        {/* Code Block with highlights */}
        <pre id="code-block-embed" className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-[10.5px] font-mono text-slate-300 border border-slate-800/80 leading-relaxed max-h-[160px] overflow-y-auto whitespace-pre-wrap break-all select-all">
          <code>{generatedScript}</code>
        </pre>
      </div>

      {/* Dynamic Steps Pipeline */}
      <div className="flex-1 space-y-4">
        <div className="flex gap-2">
          {steps.map((s) => (
            <button
              key={s.id}
              id={`btn-step-tab-${s.id}`}
              onClick={() => setActiveStep(s.id)}
              className={`flex-1 py-1 text-center font-display font-bold text-xs transition-colors border-b-2 ${
                activeStep === s.id 
                  ? "border-emerald-500 text-emerald-400" 
                  : "border-slate-800 text-slate-500 hover:text-slate-300"
              }`}
            >
              Adım {s.id}
            </button>
          ))}
        </div>

        {/* Current Active Step Box */}
        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl space-y-2.5 transition-all min-h-[150px]">
          {steps.map((s) => {
            if (s.id !== activeStep) return null;
            const IconComponent = s.icon;
            return (
              <div key={s.id} className="space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 text-xs font-bold font-display">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-200 text-sm">{s.title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {s.desc}
                </p>
                
                {s.id === 3 && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10.5px] text-amber-400 flex items-start gap-1.5">
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                    <span><strong>Systeme.io Kuralı:</strong> Script tag'i 'Header Code' alanına ekledikten sonra, Systeme.io sayfa önizleme modlarında scriptler bazen engellenebilir. Canlı sayfa URL'sinde test etmenizi öneririz.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* FAQ helper regarding systeme io customization */}
        <div className="bg-slate-900/20 rounded-xl p-3.5 border border-slate-800/40 text-[11px] text-slate-400 leading-relaxed">
          <p className="font-bold text-slate-300 mb-1 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            Sıkça Sorulabilecek Soru:
          </p>
          <p>
            <strong>"Systeme.io sayfa hızı etkilenir mi?"</strong>
            <br />
            Bot scriptimiz <code>async</code> (eşzamansız) yüklenir. Yani funnel sayfanızın açılış hızına hiçbir olumsuz etki yapmaz; siteniz yüklendikten hemen sonra arkadan sessizce başlatılır.
          </p>
        </div>
      </div>
    </div>
  );
}
