import re
import json
import requests
from typing import Dict, Any, Tuple, Optional, List
from fastapi import APIRouter
from backend.app.schemas import AssistantChatRequest, AssistantChatResponse
from backend.app.config import settings

router = APIRouter(prefix="/api/assistant", tags=["Lingua AI Assistant"])

def detect_text_script(text: str) -> Optional[str]:
    """Detects Telugu or Devanagari (Hindi) Unicode blocks in the user text."""
    if re.search(r'[\u0C00-\u0C7F]', text):
        return "te"
    if re.search(r'[\u0900-\u097F]', text):
        return "hi"
    return None

# Multilingual Knowledge Responses & Actions
KNOWLEDGE_BASE = {
    "navigate_learn": {
        "en": "Opening the Bamboo Learning Center! Here you can master bamboo cutting, splitting, slicing, weaving, and machine operation awareness.",
        "te": "వెదురు లెర్నింగ్ సెంటర్‌ని తెరుస్తున్నాను! ఇక్కడ మీరు వెదురు కోయడం, చీల్చడం, స్లైసింగ్, బుట్టలు అల్లడం మరియు మెషిన్ నిర్వహణ నేర్చుకోవచ్చు.",
        "hi": "बाँस लर्निंग सेंटर खोल रहे हैं! यहाँ आप बाँस की कटाई, चीरना, स्लाइसिंग, टोकरी बुनाई और मशीन संचालन सीख सकते हैं।",
        "action": "NAVIGATE",
        "action_data": "/learn",
        "chips": {
            "en": ["Basket Weaving Tutorial", "Machine Safety Rules", "Bamboo Splitting"],
            "te": ["బుట్టల అల్లకం ట్యుటోరియల్", "మెషిన్ భద్రతా నియమాలు", "వెదురు చీల్చడం"],
            "hi": ["टोकरी बुनाई सीखें", "मशीन सुरक्षा नियम", "बाँस चीरना"]
        }
    },
    "navigate_products": {
        "en": "Navigating to the Lingrove Marketplace! Explore authentic hand-crafted bamboo baskets, furniture, home decor, raw materials, and thin craft sticks from Lingala artisans.",
        "te": "లింగ్రోవ్ మార్కెట్‌ప్లేస్‌కి వెళ్తున్నాము! లింగాల గ్రామీణ కళాకారులు తయారుచేసిన సాంప్రదాయ వెదురు బుట్టలు, హోమ్ డెకర్, ఫర్నిచర్ మరియు ముడి వెదురు సామగ్రిని చూడండి.",
        "hi": "लिंग्रोव मार्केटप्लेस पर ले जा रहे हैं! लिंगाला कारीगरों द्वारा हस्तनिर्मित बाँस की टोकरियाँ, फर्नीचर, गृह सज्जा और कच्चा माल देखें।",
        "action": "NAVIGATE",
        "action_data": "/products",
        "chips": {
            "en": ["View Bamboo Baskets", "Home Décor Lamps", "Raw Bamboo Poles"],
            "te": ["వెదురు బుట్టలు చూడండి", "లైటింగ్ లాంతర్లు", "ముడి వెదురు కర్రలు"],
            "hi": ["बाँस की टोकरियाँ", "गृह सज्जा लैंप", "कच्चे बाँस के पोल"]
        }
    },
    "navigate_gallery": {
        "en": "Opening our Activities Gallery! Explore real photographs of bamboo machinery demonstrations, village outreach meetings, and CMRTC hands-on workshop training in Lingala.",
        "te": "మా కార్యక్రమాల గ్యాలరీని తెరుస్తున్నాను! లింగాల గ్రామంలోని వెదురు మెషినరీ ప్రదర్శనలు, గ్రామ అవగాహన సమావేశాలు మరియు CMRTC శిక్షణ నిజమైన ఛాయాచిత్రాలను చూడండి.",
        "hi": "हमारी फोटो गैलरी खोल रहे हैं! लिंगाला में बाँस मशीनरी प्रदर्शन, ग्रामीण बैठकें और CMRTC कार्यशाला के वास्तविक फोटोग्राफ देखें।",
        "action": "NAVIGATE",
        "action_data": "/gallery",
        "chips": {
            "en": ["Machine Demonstrations", "Village Outreach", "Workshop Photos"],
            "te": ["మెషిన్ ప్రదర్శనలు", "గ్రామ సమావేశాలు", "వర్క్‌షాప్ ఫోటోలు"],
            "hi": ["मशीनरी प्रदर्शन", "ग्रामीण बैठकें", "कार्यशाला तस्वीरें"]
        }
    },
    "navigate_cart": {
        "en": "Opening your Shopping Cart to review selected bamboo products and proceed to checkout.",
        "te": "మీ షాపింగ్ కార్ట్‌ని తెరుస్తున్నాను, ఇక్కడ మీ వెదురు ఉత్పత్తులను సమీక్షించి చెక్‌అవుట్ చేయవచ్చు.",
        "hi": "आपका शॉपिंग कार्ट खोल रहे हैं ताकि आप चुने गए बाँस उत्पादों की समीक्षा कर सकें।",
        "action": "NAVIGATE",
        "action_data": "/cart",
        "chips": {
            "en": ["Proceed to Checkout", "Continue Shopping"],
            "te": ["చెక్‌అవుట్‌కి వెళ్లండి", "షాపింగ్ కొనసాగించండి"],
            "hi": ["चेकआउट करें", "खरीदारी जारी रखें"]
        }
    },
    "navigate_orders": {
        "en": "Opening your Orders page to track delivery status and purchase history.",
        "te": "మీ ఆర్డర్‌ల పేజీని తెరుస్తున్నాను, ఇక్కడ మీరు డెలివరీ స్థితి మరియు ఆర్డర్ చరిత్రను చూడవచ్చు.",
        "hi": "आपके ऑर्डर्स पेज को खोल रहे हैं जहाँ आप डिलीवरी स्थिति और पिछला इतिहास देख सकते हैं।",
        "action": "NAVIGATE",
        "action_data": "/orders",
        "chips": {
            "en": ["Track Live Status", "Order History"],
            "te": ["ఆర్డర్ స్థితి చూడండి", "ఆర్డర్ చరిత్ర"],
            "hi": ["ऑर्डर स्थिति ट्रैक करें", "ऑर्डर इतिहास"]
        }
    },
    "pricing_calculator": {
        "en": "Opening the Bamboo Cost & Price Calculator! Calculate your raw bamboo culm, artisan labor, finishing, transport costs, and fair profit margin.",
        "te": "వెదురు ధరల కాలిక్యులేటర్‌ని తెరుస్తున్నాను! ముడి వెదురు, కార్మికుల శ్రమ, ఫినిషింగ్, రవాణా ఖర్చులు మరియు న్యాయమైన లాభాల శాతాన్ని లెక్కించండి.",
        "hi": "बाँस लागत और मूल्य कैलकुलेटर खोल रहे हैं! कच्चा माल, कारीगर श्रम, फिनिशिंग, परिवहन लागत और उचित लाभ मार्जिन की गणना करें।",
        "action": "OPEN_CALCULATOR",
        "action_data": None,
        "chips": {
            "en": ["Estimate Harvest Basket", "Calculate Lamp Cost"],
            "te": ["బుట్టల ధర అంచనా", "లాంతరు ఖర్చు లెక్కించండి"],
            "hi": ["टोकरी लागत अनुमान", "लैंप मूल्य गणना"]
        }
    },
    "bulk_orders": {
        "en": "Opening the Bulk Orders enquiry modal for institutional orders (hotels, corporate gifts, exhibitions, and NGOs).",
        "te": "సంస్థాగత బల్క్ ఆర్డర్‌ల విచారణ ఫారమ్‌ను తెరుస్తున్నాను (హోటళ్ళు, ఈవెంట్లు, NGOల కోసం).",
        "hi": "थोक ऑर्डर और संस्थागत पूछताछ फॉर्म खोल रहे हैं (होटल, कार्यालय, प्रदर्शनी और एनजीओ के लिए)।",
        "action": "OPEN_BULK",
        "action_data": None,
        "chips": {
            "en": ["Corporate Gifting", "Hotel Supplies", "Custom Bamboo Décor"],
            "te": ["కార్పొరేట్ కానుకలు", "హోటల్ సామగ్రి", "ప్రత్యేక వెదురు డెకర్"],
            "hi": ["कॉरपोरेट उपहार", "होटल आपूर्ति", "कस्टम बाँस सजावट"]
        }
    },
    "artisan_register": {
        "en": "To sell your bamboo creations, you can register as an artisan right here. You will receive an artisan dashboard, sales tracking, and direct customer reach without middlemen!",
        "te": "మీ వెదురు ఉత్పత్తులను విక్రయించడానికి, మీరు ఇక్కడ కళాకారుడిగా నమోదు చేసుకోవచ్చు. మధ్యవర్తులు లేకుండా నేరుగా ఆర్డర్‌లు మరియు ఆదాయాన్ని పొందవచ్చు!",
        "hi": "अपने बाँस उत्पादों को बेचने के लिए, आप यहाँ कारीगर के रूप में पंजीकरण कर सकते हैं। बिचौलियों के बिना सीधे ग्राहक और बिक्री ट्रैकिंग पाएँ!",
        "action": "NAVIGATE",
        "action_data": "/register?role=artisan",
        "chips": {
            "en": ["Sign Up as Artisan", "Learn Bamboo Skills"],
            "te": ["కళాకారుడిగా చేరండి", "వెదురు నైపుణ్యాలు నేర్చుకోండి"],
            "hi": ["कारीगर के रूप में जुड़ें", "बाँस शिल्प सीखें"]
        }
    },
    "safety": {
        "en": "Crucial Machinery Safety Advisory: Always wear polycarbonate safety goggles, fitted protective gloves, and tuck in loose clothing when operating cross-cutting saws or hydraulic splitters. Always train under certified CMRTC supervision.",
        "te": "ముఖ్యమైన భద్రతా హెచ్చరిక: క్రాస్-కటింగ్ రంపాలు లేదా హైడ్రాలిక్ స్ప్లిట్టర్లు నడుపుతున్నప్పుడు ఎల్లప్పుడూ రక్షణ కళ్లద్దాలు మరియు గట్టి చేతి తొడుగులు ధరించండి. CMRTC నిపుణుల పర్యవేక్షణలో మాత్రమే పని చేయండి.",
        "hi": "महत्वपूर्ण सुरक्षा चेतावनी: कटिंग आरी या हाइड्रोलिक स्प्लिटिंग मशीन चलाते समय हमेशा सुरक्षा चश्मा और फिट दस्ताने पहनें। हमेशा प्रशिक्षित CMRTC पर्यवेक्षण में ही काम करें।",
        "action": "NAVIGATE",
        "action_data": "/learn",
        "chips": {
            "en": ["View Machine Directory", "Safety Protocols"],
            "te": ["మెషిన్ డైరెక్టరీ", "భద్రతా సూత్రాలు"],
            "hi": ["मशीन डायरेक्टरी देखें", "सुरक्षा नियम"]
        }
    },
    "general": {
        "en": "Hello! I am Lingua, your multilingual guide for LINGROVE (Lingala Bamboo Products at CMRTC). I can help you learn bamboo craftsmanship, browse artisan products, explore our community gallery, or calculate product costs. What would you like to do?",
        "te": "నమస్కారం! నేను లింగువా, లింగ్రోవ్ (CMRTC లోని లింగాల వెదురు ఉత్పత్తులు) కు మీ మార్గదర్శిని. వెదురు నైపుణ్యాలు నేర్చుకోవడానికి, ఉత్పత్తులు కొనుగోలు చేయడానికి లేదా గ్యాలరీ చూడటానికి మీకు ఎలా సహాయపడగలను?",
        "hi": "नमस्ते! मैं लिंगुआ हूँ, लिंग्रोव (CMRTC में लिंगाला बाँस उत्पाद) के लिए आपकी बहुभाषी सहायक। मैं बाँस शिल्प सीखने, उत्पाद खरीदने, सामुदायिक गैलरी देखने या मूल्य गणना में आपकी क्या मदद कर सकती हूँ?",
        "action": None,
        "action_data": None,
        "chips": {
            "en": ["Learn Bamboo Craft", "Browse Marketplace", "View Gallery", "Cost Calculator"],
            "te": ["వెదురు నైపుణ్యాలు నేర్చుకోండి", "మార్కెట్‌ప్లేస్ చూడండి", "గ్యాలరీ చూడండి", "ధరల కాలిక్యులేటర్"],
            "hi": ["बाँस शिल्प सीखें", "मार्केटप्लेस देखें", "गैलरी देखें", "लागत कैलकुलेटर"]
        }
    }
}

def rule_based_fallback(message: str, target_lang: str) -> Dict[str, Any]:
    t = message.lower()

    if any(k in t for k in ["gallery", "photo", "image", "picture", "గ్యాలరీ", "ఫోటో", "గ్యాలరి", "गैलरी", "तस्वीर", "फोटो"]):
        matched = KNOWLEDGE_BASE["navigate_gallery"]
    elif any(k in t for k in ["learn", "tutorial", "course", "lesson", "cutting", "weaving", "splitting", "basket making", "నేర్చుకో", "ట్యుటోరియల్", "అల్లకం", "కోయడం", "బుట్టల తయారీ", "చీల్చడం", "सीखना", "ट्यूटोरियल", "बुनाई", "कटाई", "चीरना"]):
        matched = KNOWLEDGE_BASE["navigate_learn"]
    elif any(k in t for k in ["cart", "basket", "buy", "purchase", "shop", "market", "store", "product", "price", "lamp", "furniture", "బుట్ట", "బుట్టలు", "కొనుగోలు", "కొనాల", "షాపింగ్", "ఉత్పత్తులు", "ధర", "మార్కెట్", "లాంతరు", "కొనండి", "टोकरी", "खरीदना", "उत्पाद", "दुकान", "बाजार", "दाम", "फर्नीचर"]):
        matched = KNOWLEDGE_BASE["navigate_products"]
    elif any(k in t for k in ["order", "track", "delivery", "status", "ఆర్డర్", "డెలివరీ", "స్థితి", "ऑर्डर", "डिलीवरी", "स्थिति"]):
        matched = KNOWLEDGE_BASE["navigate_orders"]
    elif any(k in t for k in ["artisan", "sell", "register as artisan", "కళాకారుడు", "అమ్మకం", "రిజిస్టర్", "कारीगर", "बेचना", "पंजीकरण"]):
        matched = KNOWLEDGE_BASE["artisan_register"]
    elif any(k in t for k in ["calculator", "calculate", "cost formula", "margin", "కాలిక్యులేటర్", "ధర లెక్కించు", "లాభం", "कैलकुलेटर", "लागत", "मार्जिन"]):
        matched = KNOWLEDGE_BASE["pricing_calculator"]
    elif any(k in t for k in ["bulk", "wholesale", "corporate", "బల్క్", "హోల్‌సేల్", "సంస్థ", "थोक", "बल्क", "संस्था"]):
        matched = KNOWLEDGE_BASE["bulk_orders"]
    elif any(k in t for k in ["safety", "precaution", "danger", "blade", "machine", "రక్షణ", "భద్రత", "మెషిన్", "ప్రమాదం", "सुरक्षा", "सावधानी", "मशीन", "खतरा"]):
        matched = KNOWLEDGE_BASE["safety"]
    elif "telugu" in t or "తెలుగు" in t:
        return {
            "reply": "నేను తెలుగులోకి మారుతున్నాను. మీకు ఏ విధంగా సహాయం చేయగలను?",
            "language": "te",
            "action": "CHANGE_LANG",
            "action_data": "te",
            "suggested_chips": KNOWLEDGE_BASE["general"]["chips"]["te"]
        }
    elif "hindi" in t or "हिन्दी" in t or "हिंदी" in t:
        return {
            "reply": "मैं हिंदी में स्विच कर रही हूँ। मैं आपकी क्या मदद कर सकती हूँ?",
            "language": "hi",
            "action": "CHANGE_LANG",
            "action_data": "hi",
            "suggested_chips": KNOWLEDGE_BASE["general"]["chips"]["hi"]
        }
    elif "english" in t:
        return {
            "reply": "Switched to English. How can I assist you with Lingrove today?",
            "language": "en",
            "action": "CHANGE_LANG",
            "action_data": "en",
            "suggested_chips": KNOWLEDGE_BASE["general"]["chips"]["en"]
        }
    else:
        matched = KNOWLEDGE_BASE["general"]

    reply_text = matched.get(target_lang, matched["en"])
    chips = matched.get("chips", {}).get(target_lang, matched.get("chips", {}).get("en", []))

    return {
        "reply": reply_text,
        "language": target_lang,
        "action": matched.get("action"),
        "action_data": matched.get("action_data"),
        "suggested_chips": chips
    }

def call_gemini_api(request: AssistantChatRequest, target_lang: str) -> Optional[Dict[str, Any]]:
    """Calls Google Gemini API with system instruction for language-aware response and structured actions."""
    if not settings.GEMINI_API_KEY:
        return None

    lang_names = {"te": "Telugu (తెలుగు)", "hi": "Hindi (हिन्दी)", "en": "English"}
    lang_name = lang_names.get(target_lang, "English")

    system_instruction = f"""You are Lingua, the multilingual AI voice and text assistant for LINGROVE.
Project: LINGROVE
Official Subtitle: Lingala Bamboo Products at CMRTC
Tagline: Learn. Create. Sell. Grow Together.
Mission: Multilingual bamboo craftsmanship learning, workshop machinery safety, and sustainable artisan e-commerce connecting Lingala village artisans with consumers.

CRITICAL INSTRUCTIONS:
1. TARGET RESPONSE LANGUAGE: You MUST respond in {lang_name}.
   - If the user spoke or wrote in Telugu, respond entirely in natural, polite Telugu.
   - If the user spoke or wrote in Hindi, respond entirely in natural, polite Hindi.
   - If the user spoke or wrote in English, respond in English.
   - Never respond in English when {lang_name} is requested or when user speaks Telugu or Hindi.
2. TONE: Warm, village-friendly, respectful, and empowering.
3. PLATFORM NAVIGATION: You can guide the user to pages by returning an action:
   - Learning Center: action "NAVIGATE", action_data "/learn"
   - Marketplace: action "NAVIGATE", action_data "/products"
   - Real Activities Gallery: action "NAVIGATE", action_data "/gallery"
   - Shopping Cart: action "NAVIGATE", action_data "/cart"
   - Order Tracking: action "NAVIGATE", action_data "/orders"
   - Artisan Registration: action "NAVIGATE", action_data "/register?role=artisan"
   - User Profile/Dashboard: action "NAVIGATE", action_data "/profile"
   - Reviews & Community: action "NAVIGATE", action_data "/reviews"
   - Bamboo Cost Calculator: action "OPEN_CALCULATOR", action_data null
   - Bulk Institutional Orders: action "OPEN_BULK", action_data null
4. MACHINERY SAFETY: When cutting, splitting, slicing, or machinery is mentioned, emphasize eye goggles, cut-resistant gloves, and certified CMRTC supervision.
5. HONESTY: Do not invent fake prices or unverified order numbers.

OUTPUT FORMAT: Return ONLY a valid JSON object without markdown fences, matching this structure:
{{
  "reply": "Your response text in {lang_name}",
  "language": "{target_lang}",
  "action": "NAVIGATE" | "OPEN_CALCULATOR" | "OPEN_BULK" | null,
  "action_data": "/route" | null,
  "suggested_chips": ["Chip 1", "Chip 2"]
}}"""

    # Build conversation history
    contents = []
    if request.conversation_history:
        for msg in request.conversation_history[-4:]:
            role = "user" if msg.role == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg.content}]})

    # Add current user message
    user_context_info = f"[Page: {request.current_path or '/'}] {request.message}"
    contents.append({"role": "user", "parts": [{"text": user_context_info}]})

    payload = {
        "contents": contents,
        "systemInstruction": {
            "parts": [{"text": system_instruction}]
        },
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 400,
            "responseMimeType": "application/json"
        }
    }

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
    
    try:
        resp = requests.post(url, json=payload, timeout=6.0)
        if resp.status_code == 200:
            data = resp.json()
            candidates = data.get("candidates", [])
            if candidates:
                raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                raw_text = raw_text.strip()
                # Clean code blocks if present
                if raw_text.startswith("```"):
                    raw_text = re.sub(r"^```(?:json)?\n?", "", raw_text)
                    raw_text = re.sub(r"\n?```$", "", raw_text)
                parsed = json.loads(raw_text)
                if isinstance(parsed, dict) and "reply" in parsed:
                    if not parsed.get("language"):
                        parsed["language"] = target_lang
                    return parsed
        else:
            print(f"Gemini API status {resp.status_code}: {resp.text[:120]}")
    except Exception as e:
        print(f"Gemini API call failed: {e}")

    return None

@router.post("/chat", response_model=AssistantChatResponse)
def assistant_chat(request: AssistantChatRequest):
    # Determine the most accurate language:
    # 1. Native script detection (Telugu or Devanagari Unicode characters)
    detected_script = detect_text_script(request.message)
    if detected_script:
        target_lang = detected_script
    # 2. Explicit user selection in UI
    elif request.language in ["te", "hi"]:
        target_lang = request.language
    elif request.detected_language in ["te", "hi"]:
        target_lang = request.detected_language
    elif request.language in ["en", "te", "hi"]:
        target_lang = request.language
    else:
        target_lang = "en"

    # Try Gemini AI first if configured
    gemini_result = call_gemini_api(request, target_lang)
    if gemini_result:
        return gemini_result

    # Safe intelligent fallback
    return rule_based_fallback(request.message, target_lang)
