export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

export interface Personality {
  agencyName: string;
  botName: string;
  tone: string;
  specialty: string;
  teamContact: string;
  welcomeMessage: string;
  themeColor: string; // e.g., 'emerald', 'sky', 'indigo', 'rose', 'amber'
  
  // Corporate Intelligence Fields (Unified system memory structure)
  markdownBrain: string;         // Kapsamlı Akıllı Ajans Hafızası (Markdown Formatı - 1. Bölüm)
  systemInstructions: string;    // Sistem Talimatları Alanı (Yönlendirici Kurallar - 2. Bölüm)
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}
