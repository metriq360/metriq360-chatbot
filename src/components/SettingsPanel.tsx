import React, { useState } from "react";
import { 
  Building2, 
  MessageSquare, 
  Sparkles, 
  User, 
  Flame, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Brain,
  Target,
  FileCode2,
  Users2,
  Compass,
  AlertTriangle,
  FileSignature,
  Settings2
} from "lucide-react";
import { Personality, FAQItem } from "../types";

interface SettingsPanelProps {
  personality: Personality;
  setPersonality: React.Dispatch<React.SetStateAction<Personality>>;
  faqData: FAQItem[];
  setFaqData: React.Dispatch<React.SetStateAction<FAQItem[]>>;
  onResetToDefaults: () => void;
}

export default function SettingsPanel({
  personality,
  setPersonality,
  faqData,
  setFaqData,
  onResetToDefaults
}: SettingsPanelProps) {
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [activeTab, setActiveTab] = useState<"personality" | "intelligence" | "knowledge">("personality");
  const [intelligenceMode, setIntelligenceMode] = useState<"markdown" | "instructions">("markdown");

  const colors = [
    { name: "Smaragd Yeşil", value: "emerald", bg: "bg-emerald-500", border: "border-emerald-500/30" },
    { name: "Atlantik Mavi", value: "sky", bg: "bg-sky-500", border: "border-sky-500/30" },
    { name: "Kozmik İndigo", value: "indigo", bg: "bg-indigo-500", border: "border-indigo-500/30" },
    { name: "Neon Hibisküs", value: "rose", bg: "bg-rose-500", border: "border-rose-500/30" },
    { name: "Amber Altın", value: "amber", bg: "bg-amber-500", border: "border-amber-500/30" },
  ];

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const newItem: FAQItem = {
      id: Date.now().toString(),
      question: newQuestion.trim(),
      answer: newAnswer.trim()
    };

    setFaqData([...faqData, newItem]);
    setNewQuestion("");
    setNewAnswer("");
  };

  const handleRemoveFaq = (id: string) => {
    setFaqData(faqData.filter(item => item.id !== id));
  };

  const updatePersonalityField = (field: keyof Personality, value: string) => {
    setPersonality(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div id="settings-panel-container" className="bg-growth-dark/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-xl h-full flex flex-col">
      {/* 3-Tab Selectors with responsive text size */}
      <div className="grid grid-cols-3 gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800/85 mb-6">
        <button
          id="btn-tab-personality"
          onClick={() => setActiveTab("personality")}
          className={`py-2 px-1.5 rounded-lg font-semibold text-[11px] sm:text-xs transition-all duration-300 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
            activeTab === "personality"
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/10"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Kimlik</span>
        </button>
        
        <button
          id="btn-tab-intelligence"
          onClick={() => setActiveTab("intelligence")}
          className={`py-2 px-1.5 rounded-lg font-semibold text-[11px] sm:text-xs transition-all duration-300 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
            activeTab === "intelligence"
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/10"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>Strateji & Kriter</span>
        </button>

        <button
          id="btn-tab-knowledge"
          onClick={() => setActiveTab("knowledge")}
          className={`py-2 px-1.5 rounded-lg font-semibold text-[11px] sm:text-xs transition-all duration-300 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
            activeTab === "knowledge"
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/10"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>SSS</span>
        </button>
      </div>

      {activeTab === "personality" && (
        <div className="space-y-5 flex-1 overflow-y-auto pr-1">
          {/* Preset Reset Header */}
          <div className="flex justify-between items-center sm:flex-row flex-col gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/50">
            <span className="text-xs text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Temel Bot ve Karşılama Ayarları
            </span>
            <button
              id="btn-reset-defaults"
              onClick={onResetToDefaults}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors pointer-events-auto"
            >
              Varsayılana Sıfırla
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Ajans Adı
              </label>
              <input
                id="input-agency-name"
                type="text"
                value={personality.agencyName}
                onChange={(e) => updatePersonalityField("agencyName", e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder-slate-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> Bot İsmi
                </label>
                <input
                  id="input-bot-name"
                  type="text"
                  value={personality.botName}
                  onChange={(e) => updatePersonalityField("botName", e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Ekip / Destek Temsilcisi
                </label>
                <input
                  id="input-team-contact"
                  type="text"
                  value={personality.teamContact}
                  onChange={(e) => updatePersonalityField("teamContact", e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-slate-400" /> Ses Tonu ve Yaklaşım
              </label>
              <select
                id="select-tone"
                value={personality.tone}
                onChange={(e) => updatePersonalityField("tone", e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              >
                <option value="Profesyonel, büyüme odaklı, cana yakın ve stratejik">Profesyonel & Stratejik (Growth)</option>
                <option value="Dinamik, enerjik, samimi ve satış/dönüşüm odaklı">Dinamik & Enerjik (Dönüşüm)</option>
                <option value="Sertifikalı pazarlama uzmanı, analitik, verilere dayanan ve ölçülebilir">Analitik & Veriye Dayalı</option>
                <option value="Mizahı güçlü, yaratıcı, sıra dışı fikirler sunan bir growth hacker">Yaratıcı & Growth Hacker</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Ajans Uzmanlık / Niş Alanı
              </label>
              <textarea
                id="textarea-specialty"
                rows={2}
                value={personality.specialty}
                onChange={(e) => updatePersonalityField("specialty", e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Bot Karşılama Mesajı (Ziyaretçiye İlk Selam)
              </label>
              <textarea
                id="textarea-welcome"
                rows={2}
                value={personality.welcomeMessage}
                onChange={(e) => updatePersonalityField("welcomeMessage", e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none text-xs"
              />
            </div>

            {/* Widget Theme Color Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2.5">
                Widget Tema Rengi
              </label>
              <div className="flex flex-wrap gap-3">
                {colors.map((c) => (
                  <button
                    key={c.value}
                    id={`btn-color-${c.value}`}
                    onClick={() => updatePersonalityField("themeColor", c.value)}
                    type="button"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      personality.themeColor === c.value
                        ? "bg-slate-800 text-white border-slate-600 ring-2 ring-emerald-500/40"
                        : "bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${c.bg}`}></span>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "intelligence" && (
        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          {/* Corporate Brain Introduction */}
          <div className="text-xs text-slate-300 bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-xl space-y-1.5 shadow-inner">
            <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Brain className="w-4 h-4 shrink-0" /> Metriq360 Akıllı Ajans Beyni & Hafızası
            </h4>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Yapay zekanın robot gibi çalışmasını engelleyen en sağlıklı yöntem, ona bütünsel ve yapısallaştırılmış bir **Ajans Hafızası** vermektir. Sistem hafızası, asıl genel bilgi kütüphaneniz (Master Hafıza .md) ve yönlendirici kilit kuralları belirleyen sistem talimatları alanından oluşur.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              id="btn-intel-markdown"
              onClick={() => setIntelligenceMode("markdown")}
              type="button"
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-all ${
                intelligenceMode === "markdown"
                  ? "bg-slate-800 text-emerald-400 font-bold border border-emerald-500/10 shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileSignature className="w-3.5 h-3.5" />
              1. Master Hafıza Dosyası (.md)
            </button>
            <button
              id="btn-intel-instructions"
              onClick={() => setIntelligenceMode("instructions")}
              type="button"
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-all ${
                intelligenceMode === "instructions"
                  ? "bg-slate-800 text-emerald-400 font-bold border border-emerald-500/10 shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              2. Sistem Talimatları Alanı
            </button>
          </div>

          {intelligenceMode === "markdown" ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg font-mono">
                <span>📂 Dosya Adı: <strong className="text-emerald-400">metriq360_hafiza.md</strong></span>
                <span>Altyapı: Gemini-3.5 Memory Corpus</span>
              </div>
              <div>
                <textarea
                  id="textarea-markdown-brain"
                  rows={15}
                  placeholder="# Metriq360 Master Kılavuz..."
                  value={personality.markdownBrain}
                  onChange={(e) => updatePersonalityField("markdownBrain", e.target.value)}
                  className="w-full bg-[#04050a] border border-[#161a29] rounded-xl px-4 py-3.5 text-xs text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all leading-relaxed whitespace-pre"
                  style={{ tabSize: 2 }}
                />
              </div>
              <p className="text-[10px] text-slate-500 italic leading-normal">
                💡 İpucu: Bu döküman asistanın bilgi kütüphanesidir. Ciro kaybı simülasyonu ve test yönlendirmeleri buraya yazıldığı an yapay zeka tarafından okunur.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg font-mono">
                <span>🤖 Yönlendirici: <strong className="text-emerald-400">System Instructions</strong></span>
                <span>Altyapı: Gemini Prompt Core</span>
              </div>
              <div>
                <textarea
                  id="textarea-system-instructions"
                  rows={15}
                  placeholder="Asistanın davranış kuralları ve prompt talimatları..."
                  value={personality.systemInstructions}
                  onChange={(e) => updatePersonalityField("systemInstructions", e.target.value)}
                  className="w-full bg-[#04050a] border border-[#161a29] rounded-xl px-4 py-3.5 text-xs text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all leading-relaxed"
                  style={{ tabSize: 2 }}
                />
              </div>
              <p className="text-[10px] text-slate-500 italic leading-normal">
                💡 İpucu: Bu alan asistanın çalışma prensiplerini, suistimal korumalarını ve davranış modellerini belirleyen sistem talimatlarıdır.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "knowledge" && (
        <div className="space-y-5 flex-1 overflow-y-auto pr-1 flex flex-col">
          {/* FAQ Informational text */}
          <div className="text-xs text-slate-400 bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/40 space-y-1">
            <p className="font-semibold text-slate-300">💡 Bilgi Tabanı Nasıl Çalışır?</p>
            <p>Buraya eklediğiniz her soru-cevap çifti, yukarıdaki strateji ve vizyon kurallarını DESTEKLEYİCİ ek detaylar (örneğin sıkça sorulan fiyat, lokasyon veya teknik yetkinlik) olarak doğrudan yapay zeka modelinin hafızasına (knowledge base) eşleşir.</p>
          </div>

          {/* Form to Add FAQ */}
          <form id="form-add-faq" onSubmit={handleAddFaq} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80 space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <Plus className="w-3.5 h-3.5 text-emerald-400" /> Bilgi Tabanına Yeni Veri Ekle
            </h4>
            
            <div>
              <input
                id="input-faq-question"
                type="text"
                placeholder="Örn: En popüler reklam paketiniz hangisi?"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>
            
            <div>
              <textarea
                id="textarea-faq-answer"
                rows={2}
                placeholder="Örn: 360 Derece Büyüme Paketimiz, Meta/Google reklam yönetimi, Landing Page tasarımı ve CRO analizi içerir."
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none"
              />
            </div>

            <button
              id="btn-faq-submit"
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 rounded-lg text-xs font-semibold shadow transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer pointer-events-auto"
            >
              Yapılandırmaya Kaydet
            </button>
          </form>

          {/* List of FAQ items */}
          <div className="flex-1 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                Kayıtlı Bilgi (%{Math.min(100, faqData.length * 15)} Kapasite)
              </h4>
              <span className="text-2xs bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-amber-400">
                {faqData.length} Bilgi Kartı
              </span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {faqData.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
                  Henüz özel bir SSS eklenmedi. Genel pazarlama zekası kullanılacak.
                </div>
              ) : (
                faqData.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-slate-950 border border-slate-800/80 rounded-xl p-3 relative hover:border-slate-700/80 transition-all"
                  >
                    <button
                      id={`btn-remove-faq-${item.id}`}
                      onClick={() => handleRemoveFaq(item.id)}
                      className="absolute top-2 right-2 text-slate-600 hover:text-rose-400 transition-colors p-1"
                      title="Sil"
                      type="button"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <p className="text-xs font-bold text-emerald-400 pr-6 flex items-start gap-1">
                      <span className="text-slate-500">S:</span> {item.question}
                    </p>
                    <p className="text-2xs text-slate-400 mt-1 leading-relaxed pl-3.5">
                      {item.answer}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
