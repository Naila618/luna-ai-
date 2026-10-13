import { SupportedLanguage } from "@/types";

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు" },
];

export const UI_TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    brand_tagline: "Your space to think.",
    landing_headline: "A little more clarity. A little less noise.",
    landing_subhead:
      "A personal AI companion for the questions you're curious about, the things you're learning, and the ideas you're figuring out.",
    cta_start: "Start a conversation",
    cta_explore: "Explore LUNA",
    cta_meet: "Meet LUNA",
    nav_features: "Features",
    nav_how_it_works: "How it works",
    nav_signin: "Sign in",
    nav_signout: "Sign out",
    nav_settings: "Preferences",
    nav_new_chat: "New conversation",
    nav_history: "Recent conversations",
    welcome_greeting: "Good to see you.",
    welcome_prompt: "What would you like to think through today?",
    input_placeholder: "Ask anything, explore an idea, or paste text...",
    mode_text: "Standard conversation",
    mode_research: "Deep web research",
    mode_voice: "Voice avatar mode",
    research_pill: "Research",
    citations_label: "Sources & Citations",
    send: "Send",
    recording: "Listening...",
    ready: "Ready",
    connecting: "Connecting...",
    end_conversation: "End conversation",
  },
  hi: {
    brand_tagline: "सोचने का आपका अपना स्थान।",
    landing_headline: "थोड़ी अधिक स्पष्टता। थोड़ा कम शोर।",
    landing_subhead:
      "उन सवालों के लिए एक व्यक्तिगत AI साथी जिनके बारे में आप उत्सुक हैं, जो आप सीख रहे हैं, और जिन विचारों को आप समझ रहे हैं।",
    cta_start: "बातचीत शुरू करें",
    cta_explore: "LUNA को जानें",
    cta_meet: "LUNA से मिलें",
    nav_features: "विशेषताएं",
    nav_how_it_works: "यह कैसे काम करता है",
    nav_signin: "साइन इन करें",
    nav_signout: "साइन आउट",
    nav_settings: "प्राथमिकताएं",
    nav_new_chat: "नई बातचीत",
    nav_history: "हाल की बातचीत",
    welcome_greeting: "आपको देखकर अच्छा लगा।",
    welcome_prompt: "आज आप किस विषय पर सोचना चाहते हैं?",
    input_placeholder: "कुछ भी पूछें, किसी विचार पर चर्चा करें, या लिखें...",
    mode_text: "मानक बातचीत",
    mode_research: "गहन वेब शोध",
    mode_voice: "वॉइस अवतार मोड",
    research_pill: "शोध",
    citations_label: "स्रोत एवं संदर्भ",
    send: "भेजें",
    recording: "सुन रहा हूँ...",
    ready: "तैयार",
    connecting: "कनेक्ट हो रहा है...",
    end_conversation: "बातचीत समाप्त करें",
  },
  te: {
    brand_tagline: "మీ ఆలోచనల కోసం ప్రత్యేక స్థలం.",
    landing_headline: "కొంచెం ఎక్కువ స్పష్టత. కొంచెం తక్కువ శబ్దం.",
    landing_subhead:
      "మీరు ఆసక్తిగా ఉన్న ప్రశ్నలు, నేర్చుకుంటున్న విషయాలు మరియు అన్వేషిస్తున్న ఆలోచనల కోసం ఒక వ్యక్తిగత AI సహచరుడు.",
    cta_start: "సంభాషణను ప్రారంభించండి",
    cta_explore: "LUNA గురించి తెలుసుకోండి",
    cta_meet: "LUNA ని కలవండి",
    nav_features: "ఫీచర్లు",
    nav_how_it_works: "ఇది ఎలా పనిచేస్తుంది",
    nav_signin: "సైన్ ఇన్ చేయండి",
    nav_signout: "సైన్ అవుట్",
    nav_settings: "ప్రాధాన్యతలు",
    nav_new_chat: "కొత్త సంభాషణ",
    nav_history: "ఇటీవలి సంభాషణలు",
    welcome_greeting: "మిమ్మల్ని చూడటం ఆనందంగా ఉంది.",
    welcome_prompt: "ఈ రోజు మీరు దేని గురించి ఆలోచించాలనుకుంటున్నారు?",
    input_placeholder: "ఏదైనా అడగండి లేదా ఆలోచనలను పంచుకోండి...",
    mode_text: "సాధారణ సంభాషణ",
    mode_research: "లోతైన వెబ్ పరిశోధన",
    mode_voice: "వాయిస్ అవతార్ మోడ్",
    research_pill: "పరిశోధన",
    citations_label: "మూలాధారాలు & ప్రస్తావనలు",
    send: "పంపండి",
    recording: "వింటున్నాను...",
    ready: "సిద్ధంగా ఉంది",
    connecting: "కనెక్ట్ అవుతోంది...",
    end_conversation: "సంభాషణ ముగించు",
  },
};

export function getTranslation(
  lang: SupportedLanguage,
  key: string,
  fallback?: string
): string {
  return UI_TRANSLATIONS[lang]?.[key] || UI_TRANSLATIONS.en[key] || fallback || key;
}
