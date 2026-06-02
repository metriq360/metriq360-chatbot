import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  RefreshCw, 
  Sparkles, 
  Smartphone, 
  Monitor, 
  HelpCircle, 
  Building2, 
  Calendar,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { Message, Personality, FAQItem } from "../types";

interface ChatSimulatorProps {
  personality: Personality;
  faqData: FAQItem[];
  isEmbedOnly?: boolean;
}

// Helper to render message text and convert Markdown links into styled clickable tags
function renderMessageText(text: string, linkColorClass: string) {
  const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }
    const linkText = match[1];
    const linkUrl = match[2];
    parts.push(
      <a
        key={matchIndex}
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${linkColorClass} underline hover:opacity-85 font-semibold transition-all inline cursor-pointer pointer-events-auto break-all`}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {linkText}
      </a>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  if (parts.length === 0) {
    return text;
  }

  return <>{parts}</>;
}

export default function ChatSimulator({ personality, faqData, isEmbedOnly = false }: ChatSimulatorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: personality.welcomeMessage,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [simulatedDevice, setSimulatedDevice] = useState<"mobile" | "widget">("mobile");
  const [errorMessage, setErrorMessage] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputMobileRef = useRef<HTMLInputElement>(null);
  const inputWidgetRef = useRef<HTMLInputElement>(null);

  // Restart chat if welcome message or personality changes
  useEffect(() => {
    setMessages([
      {
        id: "welcome-reset-" + Date.now(),
        role: "assistant",
        text: personality.welcomeMessage,
        timestamp: new Date()
      }
    ]);
  }, [personality.welcomeMessage, personality.botName]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Restore focus to input after loading finishes or state changes
  useEffect(() => {
    if (!isTyping) {
      const timer = setTimeout(() => {
        if (simulatedDevice === "mobile") {
          inputMobileRef.current?.focus();
        } else {
          inputWidgetRef.current?.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isTyping, simulatedDevice]);

  // Theme configuration helper
  const getThemeClasses = (color: string) => {
    switch (color) {
      case "sky":
        return {
          bg: "bg-sky-500",
          hoverBg: "hover:bg-sky-600",
          text: "text-sky-400",
          border: "border-sky-500/20",
          gradient: "from-sky-500 to-indigo-500",
          glow: "shadow-sky-500/10",
          ring: "focus:ring-sky-400/50",
          userBubble: "bg-sky-600 text-white"
        };
      case "indigo":
        return {
          bg: "bg-indigo-500",
          hoverBg: "hover:bg-indigo-600",
          text: "text-indigo-400",
          border: "border-indigo-500/20",
          gradient: "from-indigo-500 to-purple-500",
          glow: "shadow-indigo-500/10",
          ring: "focus:ring-indigo-400/50",
          userBubble: "bg-indigo-600 text-white"
        };
      case "rose":
        return {
          bg: "bg-rose-500",
          hoverBg: "hover:bg-rose-600",
          text: "text-rose-400",
          border: "border-rose-500/20",
          gradient: "from-rose-500 to-pink-500",
          glow: "shadow-rose-500/10",
          ring: "focus:ring-rose-400/50",
          userBubble: "bg-rose-600 text-white"
        };
      case "amber":
        return {
          bg: "bg-amber-500",
          hoverBg: "hover:bg-amber-600",
          text: "text-amber-400",
          border: "border-amber-500/20",
          gradient: "from-amber-500 to-orange-500",
          glow: "shadow-amber-500/10",
          ring: "focus:ring-amber-400/50",
          userBubble: "bg-amber-600 text-white"
        };
      case "emerald":
      default:
        return {
          bg: "bg-emerald-500",
          hoverBg: "hover:bg-emerald-600",
          text: "text-emerald-400",
          border: "border-emerald-500/20",
          gradient: "from-emerald-500 to-teal-500",
          glow: "shadow-emerald-500/10",
          ring: "focus:ring-emerald-400/50",
          userBubble: "bg-emerald-600 text-white"
        };
    }
  };

  const theme = getThemeClasses(personality.themeColor);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    setErrorMessage("");
    const userMessage: Message = {
      id: "msg-" + Date.now(),
      role: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      const chatHistory = [...messages, userMessage].map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          personality,
          faqData
        })
      });

      if (!res.ok) {
        let errMsg = "Sunucu bağlantısı kurulamadı. Lütfen Secrets panelinde GEMINI_API_KEY anahtarınızın yüklü olduğunu onaylayın.";
        try {
          const errData = await res.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (e) {
          // Response was not JSON
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      
      setMessages(prev => [...prev, {
        id: "reply-" + Date.now(),
        role: "assistant",
        text: data.text || "Boş bir yanıt alındı.",
        timestamp: new Date()
      }]);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Bir internet hatası oluştu.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "welcome-reset-" + Date.now(),
        role: "assistant",
        text: personality.welcomeMessage,
        timestamp: new Date()
      }
    ]);
    setErrorMessage("");
  };

  // Predefined interactive chips in Turkish
  const interactiveSuggestions = [
    { label: "Fiyatlar & Yatırım Planı 💰", text: "Fiyatlarınız nedir / Paketleriniz ne kadar?" },
    { label: "Reklam İsrafını Saptama 🔍", text: "Reklamlara çok para harcıyorum ama satış/müşteri gelmiyor, neden?" },
    { label: "Ajanslardan Farkınız Ne? 🧪", text: "Sizin diğer dijital pazarlama ajanslarından farkınız ne?" },
    { label: "Nasıl Çalışmaya Başlarız? 🤝", text: "Sizinle çalışmaya nasıl başlarız, süreç nasıl işliyor?" }
  ];

  if (isEmbedOnly) {
    return (
      <div id="standalone-embed-container" className="flex flex-col h-full w-full bg-[#121421] text-xs relative overflow-hidden">
        {/* Bot Header */}
        <div id="embed-header" className={`p-4 bg-gradient-to-r ${theme.gradient} text-white flex items-center justify-between pb-3 shadow-[0_4px_12px_rgba(0,0,0,0.25)] select-none`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <span className="font-display font-black text-sm">🤖</span>
            </div>
            <div>
              <h3 className="font-bold text-xs truncate leading-none">{personality.botName}</h3>
              <span className="text-[9px] text-white/80">{personality.agencyName}</span>
            </div>
          </div>
          <button
            id="btn-reset-embed"
            onClick={handleResetChat}
            className="p-1.5 hover:bg-white/15 rounded-lg transition-colors cursor-pointer pointer-events-auto"
            title="Sohbeti Sıfırla"
          >
            <RefreshCw className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        {/* Discovery Lead banner */}
        <div id="embed-banner" className="bg-slate-900/90 border-b border-slate-800 p-2 text-[10px] flex justify-between items-center text-slate-300 select-none">
          <span className="flex items-center gap-1">
            <Calendar className={`w-3.5 h-3.5 ${theme.text}`} />
            Büyüme Seansı ({personality.teamContact})
          </span>
          <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Aktif</span>
        </div>

        {/* Message List */}
        <div id="embed-msg-list" className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 leading-relaxed text-slate-200 shadow-sm ${
                  m.role === "user"
                    ? `${theme.userBubble} rounded-tr-none font-medium`
                    : "bg-slate-900/90 border border-slate-800/80 rounded-tl-none pr-4"
                }`}
              >
                <p className="whitespace-pre-line text-[11px]">{renderMessageText(m.text, m.role === "user" ? "text-white" : theme.text)}</p>
                <span className="text-[8px] text-slate-500 block text-right mt-1">
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {messages.length === 1 && !isTyping && (
            <div id="embed-onboarding-card" className="bg-slate-900/70 border border-emerald-500/15 rounded-2xl p-3.5 space-y-2.5 mt-1 border-dashed shadow-lg shadow-black/40 animate-fade-in shrink-0">
              <p className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className={`w-3 h-3 ${theme.text} animate-pulse`} />
                En Kritik Büyüme Darboğazınız Nedir?
              </p>
              <div className="flex flex-col gap-1.5">
                <button 
                  onClick={() => sendMessage("Büyüme darboğazım: Müşteri edinmekte ve yeni kitlelere ulaşmakta zorlanıyorum. Metriq360 sistemi bu konuda ne sunuyor?")}
                  type="button"
                  className="w-full text-left text-[10.5px] bg-slate-950/80 hover:bg-emerald-500/10 border border-slate-800/80 hover:border-emerald-500/30 px-3 py-2 rounded-xl transition-all text-slate-300 hover:text-white flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate">🔍 Müşteri Edinme Zorluğu</span>
                  <ArrowRight className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-emerald-400" />
                </button>
                
                <button 
                  onClick={() => sendMessage("Büyüme darboğazım: Ciro artışı hedefliyoruz. Satışları katlamak için funnel ve Meta/Google kampanyalarımızı nasıl optimize edebiliriz?")}
                  type="button"
                  className="w-full text-left text-[10.5px] bg-slate-950/80 hover:bg-emerald-500/10 border border-slate-800/80 hover:border-emerald-500/30 px-3 py-2 rounded-xl transition-all text-slate-300 hover:text-white flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate">💰 Ciro Artışı Hedefleme</span>
                  <ArrowRight className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-emerald-400" />
                </button>
                
                <button 
                  onClick={() => sendMessage("Büyüme darboğazım: Yeterli nitelikli lead / potansiyel talep bulamıyoruz ve satış ekibimiz boş kalıyor. Lead gen sürecimizi ve reklamlarımızı nasıl tasarsınız?")}
                  type="button"
                  className="w-full text-left text-[10.5px] bg-slate-950/80 hover:bg-emerald-500/10 border border-slate-800/80 hover:border-emerald-500/30 px-3 py-2 rounded-xl transition-all text-slate-300 hover:text-white flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate">🎯 Yeterli Lead Bulamama</span>
                  <ArrowRight className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-emerald-400" />
                </button>
                
                <button 
                  onClick={() => sendMessage("Büyüme darboğazım: Dijital reklam bütçemiz boşa gidiyor (yüksek CAC), istediğimiz hedeflere ulaşamıyoruz. Bütçe kaçak durumunu nasıl denetleriz?")}
                  type="button"
                  className="w-full text-left text-[10.5px] bg-slate-950/80 hover:bg-rose-500/10 border border-slate-800/80 hover:border-rose-500/30 px-3 py-2 rounded-xl transition-all text-slate-300 hover:text-white flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate">📉 İstenilen Hedeflere Ulaşamama</span>
                  <ArrowRight className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-rose-400" />
                </button>
                
                <div className="pt-2 border-t border-slate-900 mt-1 flex justify-between items-center bg-slate-950/40 p-1.5 rounded-lg border border-slate-950/60 font-mono text-[9px]">
                  <span className="text-slate-500">Diagnostic Analiz:</span>
                  <button 
                    onClick={() => sendMessage("Bize özel ciro hesaplama aracı ile sayfa hızı/reklam bütçe kayıp teşhis testleriniz hakkında bilgi edinmek ve testleri yapmak istiyorum.")}
                    type="button"
                    className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    ⚡ Büyüme Testini Planla
                  </button>
                </div>
              </div>
            </div>
          )}

          {isTyping && (
            <div className="flex flex-col space-y-1">
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-slate-800/40 rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center space-x-1 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
              <span className="text-[9px] text-slate-500 italic pl-1 animate-pulse">
                ☕ Sunucu uyandırılıyor...
              </span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2 text-[10px] text-rose-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggested Questions Area */}
        <div id="embed-suggestions" className="px-3 pb-1 border-t border-slate-900 bg-slate-950/20 max-h-[100px] overflow-y-auto">
          <span className="text-[9px] text-slate-500 font-bold block py-1 select-none">Sık Sorulan Sorular:</span>
          <div className="flex flex-wrap gap-1.5 pb-2">
            {interactiveSuggestions.map((s, idx) => (
              <button
                key={idx}
                id={`btn-suggestion-embed-${idx}`}
                onClick={() => sendMessage(s.text)}
                type="button"
                className="text-[9.5px] bg-slate-905 border border-slate-800/80 text-slate-300 hover:text-white hover:border-slate-755 hover:bg-slate-800/50 py-1 px-2 rounded-full transition-all text-left pointer-events-auto cursor-pointer"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Bar */}
        <form id="form-chat-embed" onSubmit={handleFormSubmit} className="p-2.5 bg-slate-950 border-t border-slate-900 flex gap-2 items-center">
          <input
            id="input-chat-embed"
            ref={inputMobileRef}
            type="text"
            placeholder="Mesajınızı yazın..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-full px-3.5 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-xs"
          />
          <button
            id="btn-send-embed"
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className={`p-2 rounded-full ${theme.bg} text-white transition-all pointer-events-auto cursor-pointer disabled:opacity-50`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Device View Controller */}
      <div className="flex justify-between items-center bg-slate-900/40 p-1.5 rounded-xl border border-slate-800/60">
        <span className="text-xs text-slate-400 flex items-center gap-1.5 pl-2">
          <Sparkles className={`w-3.5 h-3.5 ${theme.text}`} />
          Simüle Edici Panel
        </span>

        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-slate-400">
          <button
            id="btn-simulate-mobile"
            onClick={() => setSimulatedDevice("mobile")}
            className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1 transition-all ${
              simulatedDevice === "mobile" 
                ? "bg-slate-800 text-emerald-400" 
                : "hover:text-white"
            }`}
          >
            <Smartphone className="w-3 h-3" /> Mobil
          </button>
          <button
            id="btn-simulate-widget"
            onClick={() => setSimulatedDevice("widget")}
            className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1 transition-all ${
              simulatedDevice === "widget" 
                ? "bg-slate-800 text-emerald-400" 
                : "hover:text-white"
            }`}
          >
            <Monitor className="w-3 h-3" /> Canlı Widget
          </button>
        </div>
      </div>

      {/* Simulator Display Screen */}
      <div className="flex-1 flex items-center justify-center bg-slate-950/60 rounded-2xl border border-slate-900 p-4 relative min-h-[460px]">
        
        {simulatedDevice === "mobile" ? (
          // Mobile Phone Shell Mockup
          <div className="w-[320px] h-[540px] bg-slate-950 rounded-[40px] border-[8px] border-slate-800 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] relative flex flex-col overflow-hidden ring-1 ring-slate-800">
            {/* Phone Notch/Speaker */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-full z-20 flex items-center justify-center">
              <span className="w-8 h-1 bg-slate-900 rounded-full"></span>
            </div>

            {/* Simulated Live Phone App Content */}
            <div className="flex-1 flex flex-col h-full bg-[#121421] text-xs pt-4 relative">
              
              {/* Bot Header */}
              <div className={`p-4 bg-gradient-to-r ${theme.gradient} text-white flex items-center justify-between pb-3 shadow-[0_4px_12px_rgba(0,0,0,0.25)] select-none`}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <span className="font-display font-black text-sm">🤖</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xs truncate leading-none">{personality.botName}</h3>
                    <span className="text-[9px] text-white/80">{personality.agencyName}</span>
                  </div>
                </div>
                <button
                  id="btn-reset-mobile"
                  onClick={handleResetChat}
                  className="p-1.5 hover:bg-white/15 rounded-lg transition-colors cursor-pointer pointer-events-auto"
                  title="Sohbeti Sıfırla"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Discovery Lead banner */}
              <div className="bg-slate-900/90 border-b border-slate-800 p-2 text-[10px] flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1">
                  <Calendar className={`w-3.5 h-3.5 ${theme.text}`} />
                  Büyüme Seansı ({personality.teamContact})
                </span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Aktif</span>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 leading-relaxed text-slate-200 shadow-sm ${
                        m.role === "user"
                          ? `${theme.userBubble} rounded-tr-none font-medium`
                          : "bg-slate-900/90 border border-slate-800/80 rounded-tl-none pr-4"
                      }`}
                    >
                      <p className="whitespace-pre-line text-[11px]">{renderMessageText(m.text, m.role === "user" ? "text-white" : theme.text)}</p>
                      <span className="text-[8px] text-slate-500 block text-right mt-1">
                        {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}

                {messages.length === 1 && !isTyping && (
                  <div className="bg-slate-900/70 border border-emerald-500/15 rounded-2xl p-3.5 space-y-2.5 mt-1 border-dashed shadow-lg shadow-black/40 animate-fade-in shrink-0">
                    <p className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className={`w-3 h-3 ${theme.text} animate-pulse`} />
                      En Kritik Büyüme Darboğazınız Nedir?
                    </p>
                    <div className="flex flex-col gap-1.5">
                      <button 
                        onClick={() => sendMessage("Büyüme darboğazım: Müşteri edinmekte ve yeni kitlelere ulaşmakta zorlanıyorum. Metriq360 sistemi bu konuda ne sunuyor?")}
                        type="button"
                        className="w-full text-left text-[10.5px] bg-slate-950/80 hover:bg-emerald-500/10 border border-slate-800/80 hover:border-emerald-500/30 px-3 py-2 rounded-xl transition-all text-slate-300 hover:text-white flex items-center justify-between group cursor-pointer"
                      >
                        <span className="truncate">🔍 Müşteri Edinme Zorluğu</span>
                        <ArrowRight className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-emerald-400" />
                      </button>
                      
                      <button 
                        onClick={() => sendMessage("Büyüme darboğazım: Ciro artışı hedefliyoruz. Satışları katlamak için funnel ve Meta/Google kampanyalarımızı nasıl optimize edebiliriz?")}
                        type="button"
                        className="w-full text-left text-[10.5px] bg-slate-950/80 hover:bg-emerald-500/10 border border-slate-800/80 hover:border-emerald-500/30 px-3 py-2 rounded-xl transition-all text-slate-300 hover:text-white flex items-center justify-between group cursor-pointer"
                      >
                        <span className="truncate">💰 Ciro Artışı Hedefleme</span>
                        <ArrowRight className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-emerald-400" />
                      </button>
                      
                      <button 
                        onClick={() => sendMessage("Büyüme darboğazım: Yeterli nitelikli lead / potansiyel talep bulamıyoruz ve satış ekibimiz boş kalıyor. Lead gen sürecimizi ve reklamlarımızı nasıl tasarlarsınız?")}
                        type="button"
                        className="w-full text-left text-[10.5px] bg-slate-950/80 hover:bg-emerald-500/10 border border-slate-800/80 hover:border-emerald-500/30 px-3 py-2 rounded-xl transition-all text-slate-300 hover:text-white flex items-center justify-between group cursor-pointer"
                      >
                        <span className="truncate">🎯 Yeterli Lead Bulamama</span>
                        <ArrowRight className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-emerald-400" />
                      </button>
                      
                      <button 
                        onClick={() => sendMessage("Büyüme darboğazım: Dijital reklam bütçemiz boşa gidiyor (yüksek CAC), istediğimiz hedeflere ulaşamıyoruz. Bütçe kaçak durumunu nasıl denetleriz?")}
                        type="button"
                        className="w-full text-left text-[10.5px] bg-slate-950/80 hover:bg-rose-500/10 border border-slate-800/80 hover:border-rose-500/30 px-3 py-2 rounded-xl transition-all text-slate-300 hover:text-white flex items-center justify-between group cursor-pointer"
                      >
                        <span className="truncate">📉 İstenilen Hedeflere Ulaşamama</span>
                        <ArrowRight className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-rose-400" />
                      </button>
                      
                      <div className="pt-2 border-t border-slate-900 mt-1 flex justify-between items-center bg-slate-950/40 p-1.5 rounded-lg border border-slate-950/60 font-mono text-[9px]">
                        <span className="text-slate-500">Diagnostic Analiz:</span>
                        <button 
                          onClick={() => sendMessage("Bize özel ciro hesaplama aracı ile sayfa hızı/reklam bütçe kayıp teşhis testleriniz hakkında bilgi edinmek ve testleri yapmak istiyorum.")}
                          type="button"
                          className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                        >
                          ⚡ Büyüme Testini Planla
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isTyping && (
                  <div className="flex flex-col space-y-1">
                    <div className="flex justify-start">
                      <div className="bg-slate-900 border border-slate-800/40 rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center space-x-1 shadow-sm">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-500 italic pl-1 animate-pulse">
                      ☕ Sunucu uyandırılıyor (ilk yanıt 30-50 saniyelik "Cold Start" aşamasındadır, ardından anında yanıt verecektir...)
                    </span>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2 text-[10px] text-rose-400">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Suggested Questions Area */}
              <div className="px-3 pb-1 border-t border-slate-900 bg-slate-950/20 max-h-[100px] overflow-y-auto">
                <span className="text-[9px] text-slate-500 font-bold block py-1">Sık Sorulan Sorular:</span>
                <div className="flex flex-wrap gap-1.5 pb-2">
                  {interactiveSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      id={`btn-suggestion-${idx}`}
                      onClick={() => sendMessage(s.text)}
                      type="button"
                      className="text-[9.5px] bg-slate-900 border border-slate-800/80 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800/50 py-1 px-2 rounded-full transition-all text-left pointer-events-auto"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input Bar */}
              <form id="form-chat-mobile" onSubmit={handleFormSubmit} className="p-2.5 bg-slate-950 border-t border-slate-900 flex gap-2 items-center">
                <input
                  id="input-chat-mobile"
                  ref={inputMobileRef}
                  type="text"
                  placeholder="Mesajınızı yazın..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isTyping}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-full px-3.5 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-xs"
                />
                <button
                  id="btn-send-mobile"
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className={`p-2 rounded-full ${theme.bg} text-white transition-all pointer-events-auto cursor-pointer disabled:opacity-50`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          // Web Widget Live Simulation Layout
          <div className="w-full h-[540px] flex items-end justify-end p-8 relative overflow-hidden bg-slate-900/30 rounded-2xl border border-slate-900">
            
            {/* Background design representing a website */}
            <div className="absolute inset-0 p-8 select-none opacity-20 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="h-6 w-24 bg-slate-800 rounded"></div>
                <div className="flex gap-2">
                  <div className="h-4 w-12 bg-slate-800 rounded"></div>
                  <div className="h-4 w-12 bg-slate-800 rounded"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8 w-2/3 bg-slate-800 rounded"></div>
                <div className="h-4 w-full bg-slate-800 rounded"></div>
                <div className="h-4 w-5/6 bg-slate-800 rounded"></div>
              </div>
              <div className="h-10 w-28 bg-emerald-500/30 rounded"></div>
            </div>

            {/* Chat Bubble Widget Floating in Lower-Right */}
            <div className="w-[300px] h-[440px] bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden ring-1 ring-slate-800/80 z-10">
              
              {/* Widget Header */}
              <div className={`p-3.5 bg-gradient-to-r ${theme.gradient} text-white flex items-center justify-between shadow-[0_3px_10px_rgba(0,0,0,0.2)]`}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <span className="font-display font-black text-xs">🚀</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-2xs truncate leading-none">{personality.botName}</h3>
                    <span className="text-[8.5px] text-white/70">Çevrimiçi Asistan</span>
                  </div>
                </div>
                <button
                  id="btn-reset-widget"
                  onClick={handleResetChat}
                  className="p-1 hover:bg-white/15 rounded-md transition-colors cursor-pointer pointer-events-auto"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>

              {/* Chat Thread Messages */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 scrollbar-thin text-[10.5px]">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-2.5 py-1.5 leading-relaxed text-slate-200 ${
                        m.role === "user"
                          ? `${theme.userBubble} rounded-tr-none font-medium`
                          : "bg-slate-900 border border-slate-800 rounded-tl-none"
                      }`}
                    >
                      <p className="whitespace-pre-line text-2xs">{renderMessageText(m.text, m.role === "user" ? "text-white" : theme.text)}</p>
                    </div>
                  </div>
                ))}

                {messages.length === 1 && !isTyping && (
                  <div className="bg-slate-900/70 border border-emerald-500/15 rounded-xl p-2.5 space-y-2 mt-1 border-dashed shadow-lg shadow-black/40 animate-fade-in text-[10px] shrink-0">
                    <p className="font-bold text-slate-300 flex items-center gap-1">
                      <Sparkles className={`w-3 h-3 ${theme.text} animate-pulse`} />
                      En Büyük Büyüme Sorununuz Nedir?
                    </p>
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => sendMessage("Büyüme darboğazım: Müşteri Edinme Zorluğu. Nasıl çözebiliriz?")}
                        type="button"
                        className="w-full text-left text-2xs bg-slate-950/80 hover:bg-emerald-500/10 border border-slate-800/80 hover:border-emerald-500/30 px-2.5 py-1.5 rounded-lg transition-all text-slate-300 hover:text-white flex items-center justify-between group cursor-pointer"
                      >
                        <span className="truncate">🔍 Müşteri Edinme Zorluğu</span>
                        <ArrowRight className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 transition-all text-emerald-400" />
                      </button>
                      
                      <button 
                        onClick={() => sendMessage("Büyüme darboğazım: Ciro Artışı Hedefleme. Kampanyaları nasıl optimize ederiz?")}
                        type="button"
                        className="w-full text-left text-2xs bg-slate-950/80 hover:bg-emerald-500/10 border border-slate-800/80 hover:border-emerald-500/30 px-2.5 py-1.5 rounded-lg transition-all text-slate-300 hover:text-white flex items-center justify-between group cursor-pointer"
                      >
                        <span className="truncate">💰 Ciro Artışı Hedefleme</span>
                        <ArrowRight className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 transition-all text-emerald-400" />
                      </button>
                      
                      <button 
                        onClick={() => sendMessage("Büyüme darboğazım: Yeterli lead / potansiyel kitle bulamama. Satış sürecini nasıl kurgularız?")}
                        type="button"
                        className="w-full text-left text-2xs bg-slate-950/80 hover:bg-emerald-500/10 border border-slate-800/80 hover:border-emerald-500/30 px-2.5 py-1.5 rounded-lg transition-all text-slate-300 hover:text-white flex items-center justify-between group cursor-pointer"
                      >
                        <span className="truncate">🎯 Yeterli Lead Bulamama</span>
                        <ArrowRight className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 transition-all text-emerald-400" />
                      </button>
                      
                      <button 
                        onClick={() => sendMessage("Büyüme darboğazım: İstediğimiz hedeflere ulaşamama ve bütçe kayıpları. Reklam denetimi nasıl yapılır?")}
                        type="button"
                        className="w-full text-left text-2xs bg-slate-950/80 hover:bg-rose-500/10 border border-slate-800/80 hover:border-rose-500/30 px-2.5 py-1.5 rounded-lg transition-all text-slate-300 hover:text-white flex items-center justify-between group cursor-pointer"
                      >
                        <span className="truncate">📉 İstenilen Hedeflere Ulaşamama</span>
                        <ArrowRight className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 transition-all text-rose-400" />
                      </button>
                      
                      <div className="pt-1.5 border-t border-slate-900 mt-1 flex justify-between items-center text-[8.5px]">
                        <span className="text-slate-500">Diagnostic:</span>
                        <button 
                          onClick={() => sendMessage("Büyüme Testlerinizi (Ciro hesaplayıcı / Netlify araçları) kullanarak bir teşhis yapmak istiyorum.")}
                          type="button"
                          className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                        >
                          ⚡ Büyüme Testini Başlat
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isTyping && (
                  <div className="flex flex-col space-y-1">
                    <div className="flex justify-start">
                      <div className="bg-slate-900 border border-slate-800/40 rounded-xl rounded-tl-none px-3.5 py-2 flex items-center space-x-1">
                        <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce"></span>
                        <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                        <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      </div>
                    </div>
                    <span className="text-[8.5px] text-slate-500 italic pl-1 animate-pulse">
                      ☕ İlk yanıt sunucu uyanması sebebiyle 30-40 saniye sürebilir...
                    </span>
                  </div>
                )}
              </div>

              {/* Chat inputs */}
              <form id="form-chat-widget" onSubmit={handleFormSubmit} className="p-2 bg-slate-950 border-t border-slate-900 flex gap-1.5 items-center">
                <input
                  id="input-chat-widget"
                  ref={inputWidgetRef}
                  type="text"
                  placeholder="Asistana sor..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isTyping}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-2xs"
                />
                <button
                  id="btn-send-widget"
                  type="submit"
                  className={`p-1.5 rounded-lg ${theme.bg} text-white transition-all pointer-events-auto cursor-pointer`}
                >
                  <Send className="w-3 h-3" />
                </button>
              </form>
            </div>

            {/* Simulated Launcher Button Floating lower-right corner */}
            <div className={`shadow-lg shadow-emerald-500/20 absolute bottom-1.5 right-6 w-11 h-11 rounded-full ${theme.bg} flex items-center justify-center cursor-pointer border border-white/10 z-10 select-none animate-pulse`}>
              <span className="text-sm">💬</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
