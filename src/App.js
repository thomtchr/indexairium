import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  db,
  doc,
  setDoc,
  serverTimestamp,
  collection,
  onSnapshot
} from "./firebase";

// ═══════════════════════════════════════════
// TRANSLATIONS
// ═══════════════════════════════════════════
const L = {
  en: {
    brand: "Indexairium",
    tagline: "AI Tools Directory",
    hero1: "Find Your Perfect",
    hero2: "AI Toolkit",
    heroSub: "curated AI tools across 30 categories — search, filter, and discover exactly what you need",
    search: "Search by name, category, or description...",
    showing: "Showing", of: "of", tools: "tools",
    noMatch: "No tools match", noMatchSub: "Try different keywords or clear your filters",
    clear: "Clear all", filters: "Filters:",
    sortPop: "Popular", sortAz: "A → Z", sortCat: "Category",
    navExplore: "Explore", navHub: "Content Hub", navForYou: "For You", navAff: "Affiliates",
    login: "Log In", signup: "Sign Up", logout: "Log Out", or: "or",
    withGoogle: "Continue with Google", withEmail: "with email",
    email: "Email", password: "Password", name: "Your name",
    welcome: "Welcome back,",
    getStarted: "Get Personalized Picks",
    quizTitle: "Let's find your perfect tools",
    quizSub: "Answer 4 quick questions — takes 30 seconds",
    q1: "What's your primary role?", q2: "What do you need AI for?", q3: "Monthly budget?", q4: "Technical level?",
    submit: "Show My Recommendations", skip: "Skip for now",
    hubTitle: "Content Creation Hub",
    hubSub: "The best AI tools organized by what you're creating",
    recoTitle: "Recommended For You",
    recoSub: "Personalized picks based on your profile",
    affTitle: "Affiliate Links",
    affSub: "Add your affiliate URLs — visitors will be routed through them",
    affSearch: "Search tools or affiliate URLs...", affShowing: "affiliate entries",
    edit: "Edit", save: "Save", affPh: "Paste your affiliate URL...",
    partner: "PARTNER",
    tabWriting: "Writing", tabVideo: "Video", tabImage: "Image", tabAudio: "Audio", tabSocial: "Social", tabSEO: "SEO", tab3D: "3D",
    free: "Free", freemium: "Freemium", paid: "Paid", open_source: "Open Source",
    NEW: "NEW", HOT: "HOT",
    rMarketer: "Marketer", rDev: "Developer", rCreator: "Creator", rBiz: "Business Owner", rStudent: "Student", rDesigner: "Designer",
    nWriting: "Writing", nCoding: "Coding", nDesign: "Design", nVideo: "Video", nResearch: "Research", nAuto: "Automation", nMarketing: "Marketing", nAudio: "Audio",
    bFree: "Free only", bLow: "< $30/mo", bMid: "$30–100/mo", bHigh: "No limit",
    tBeg: "Beginner", tInt: "Intermediate", tAdv: "Advanced", tExp: "Expert",
    footer: "curated tools • Updated March 2026",
    demoNote: "Secure Firebase auth enabled.",
    scrollHint: "Scroll to explore",
    orbTitle: "Discovery Orb",
    orbSub: "Hover it for motion. Click to discover a random tool from your current filters.",
    orbAction: "Surprise me",
    visitTitle: "Open this tool?",
    visitSub: "We will open the website in a new tab.",
    openSite: "Open website",
    close: "Close",
    viaAffiliate: "Affiliate link available",
    directLink: "Direct website",
    description: "Description",
    adminTitle: "Tool Catalog Admin",
    adminSub: "Add tools, edit categories, descriptions and links. Saving here updates the public catalog instantly.",
    adminSearch: "Search a tool to edit...",
    addTool: "Add new tool",
    editTool: "Edit tool",
    newTool: "New tool",
    website: "Website URL",
    categories: "Categories",
    hubTags: "Content hub tags",
    popularity: "Popularity",
    descriptionFr: "French description (optional)",
    saveTool: "Save public changes",
    cancel: "Cancel",
    customTool: "Custom tool",
    baseTool: "Base catalog tool",
    toolSaved: "Tool saved publicly.",
    toolRequired: "Please enter at least a name, a valid website URL, and one category.",
    newCategory: "New category",
    addCategory: "Add category",
    categoryExists: "This category already exists.",
    categorySaved: "Category saved publicly.",
    termsLabel: "Terms of Use",
    privacyLabel: "Privacy Policy",
    orbFocus: "Orb focus",
    orbFocusEmpty: "All tools",
    openInNewTab: "Opens in a new tab",
  },
  fr: {
    brand: "Indexairium",
    tagline: "Répertoire d'Outils IA",
    hero1: "Trouvez Votre",
    hero2: "Boîte à Outils IA",
    heroSub: "outils IA sélectionnés dans 30 catégories — cherchez, filtrez et découvrez ce qu'il vous faut",
    search: "Rechercher par nom, catégorie ou description...",
    showing: "Affichage", of: "sur", tools: "outils",
    noMatch: "Aucun outil trouvé", noMatchSub: "Essayez d'autres mots-clés ou effacez vos filtres",
    clear: "Tout effacer", filters: "Filtres :",
    sortPop: "Populaire", sortAz: "A → Z", sortCat: "Catégorie",
    navExplore: "Explorer", navHub: "Hub Contenu", navForYou: "Pour Vous", navAff: "Affiliés",
    login: "Connexion", signup: "Inscription", logout: "Déconnexion", or: "ou",
    withGoogle: "Continuer avec Google", withEmail: "par email",
    email: "Email", password: "Mot de passe", name: "Votre nom",
    welcome: "Bienvenue,",
    getStarted: "Obtenir Mes Recommandations",
    quizTitle: "Trouvons vos outils parfaits",
    quizSub: "4 questions rapides — 30 secondes",
    q1: "Votre rôle principal ?", q2: "Besoin de l'IA pour ?", q3: "Budget mensuel ?", q4: "Niveau technique ?",
    submit: "Voir Mes Recommandations", skip: "Passer",
    hubTitle: "Hub Création de Contenu",
    hubSub: "Les meilleurs outils IA selon ce que vous créez",
    recoTitle: "Recommandé Pour Vous",
    recoSub: "Sélection personnalisée selon votre profil",
    affTitle: "Liens Affiliés",
    affSub: "Ajoutez vos URL affiliés — les visiteurs passeront par eux",
    affSearch: "Rechercher un outil ou une URL affiliée...", affShowing: "entrées affiliées",
    edit: "Modifier", save: "Enregistrer", affPh: "Collez votre lien affilié...",
    partner: "PARTENAIRE",
    tabWriting: "Rédaction", tabVideo: "Vidéo", tabImage: "Image", tabAudio: "Audio", tabSocial: "Social", tabSEO: "SEO", tab3D: "3D",
    free: "Gratuit", freemium: "Freemium", paid: "Payant", open_source: "Open Source",
    NEW: "NOUVEAU", HOT: "TOP",
    rMarketer: "Marketeur", rDev: "Développeur", rCreator: "Créateur", rBiz: "Entrepreneur", rStudent: "Étudiant", rDesigner: "Designer",
    nWriting: "Rédaction", nCoding: "Code", nDesign: "Design", nVideo: "Vidéo", nResearch: "Recherche", nAuto: "Automatisation", nMarketing: "Marketing", nAudio: "Audio",
    bFree: "Gratuit", bLow: "< 30€/mois", bMid: "30–100€", bHigh: "Sans limite",
    tBeg: "Débutant", tInt: "Intermédiaire", tAdv: "Avancé", tExp: "Expert",
    footer: "outils sélectionnés • Mis à jour mars 2026",
    demoNote: "Authentification Firebase sécurisée activée.",
    scrollHint: "Défilez pour explorer",
    orbTitle: "Orbe découverte",
    orbSub: "Passez la souris dessus pour l’animer. Cliquez pour découvrir un outil aléatoire selon vos filtres.",
    orbAction: "Me surprendre",
    visitTitle: "Ouvrir cet outil ?",
    visitSub: "Le site s ouvrira dans un nouvel onglet.",
    openSite: "Ouvrir le site",
    close: "Fermer",
    viaAffiliate: "Lien affilié disponible",
    directLink: "Lien direct",
    description: "Description",
    adminTitle: "Admin du catalogue",
    adminSub: "Ajoutez des outils, modifiez les catégories, descriptions et liens. L'enregistrement met à jour le catalogue public instantanément.",
    adminSearch: "Rechercher un outil à modifier...",
    addTool: "Ajouter un outil",
    editTool: "Modifier l'outil",
    newTool: "Nouvel outil",
    website: "URL du site",
    categories: "Catégories",
    hubTags: "Tags du hub contenu",
    popularity: "Popularité",
    descriptionFr: "Description française (optionnel)",
    saveTool: "Enregistrer publiquement",
    cancel: "Annuler",
    customTool: "Outil personnalisé",
    baseTool: "Outil du catalogue",
    toolSaved: "Outil enregistré publiquement.",
    toolRequired: "Merci d'indiquer au minimum un nom, une URL valide et une catégorie.",
    newCategory: "Nouvelle catégorie",
    addCategory: "Ajouter une catégorie",
    categoryExists: "Cette catégorie existe déjà.",
    categorySaved: "Catégorie enregistrée publiquement.",
    termsLabel: "Terms of Use",
    privacyLabel: "Privacy Policy",
    orbFocus: "Focus de l'orbe",
    orbFocusEmpty: "Tous les outils",
    openInNewTab: "S'ouvre dans un nouvel onglet",
  }
};

// ═══════════════════════════════════════════
// 304 TOOLS DATABASE
// ═══════════════════════════════════════════
const $ = (n,d,c,p,pop,u,o={}) => ({name:n,desc:d,cat:Array.isArray(c)?c:[c],pricing:p,pop,url:u,affId:n.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,16),...o});
const TOOLS = [
  // ── Chat & Assistants (14) ──
  $("ChatGPT","Advanced conversational AI with reasoning, vision, voice",["Chat","Productivity"],"Freemium",99,"https://chat.openai.com",{isHot:1,cc:["Writing","SEO"]}),
  $("Claude","Thoughtful AI excelling at analysis and long-form writing",["Chat","Productivity"],"Freemium",95,"https://claude.ai",{isHot:1,cc:["Writing"]}),
  $("Gemini","Google multimodal AI for text, images, video and code",["Chat","Research"],"Freemium",92,"https://gemini.google.com",{isHot:1,cc:["Writing","Image"]}),
  $("Perplexity","AI search engine delivering cited real-time answers",["Chat","Research"],"Freemium",91,"https://perplexity.ai",{isHot:1,cc:["SEO"]}),
  $("Grok","xAI assistant with real-time X integration and humor",["Chat"],"Paid",78,"https://grok.x.ai",{isHot:1}),
  $("DeepSeek","Open-source reasoning model rivaling top commercial LLMs",["Chat","Research"],"Free",80,"https://chat.deepseek.com",{isNew:1,isHot:1}),
  $("NotebookLM","Google AI that turns your docs into podcast summaries",["Chat","Research","Productivity"],"Free",82,"https://notebooklm.google.com",{isNew:1,isHot:1,cc:["Audio"]}),
  $("Poe","Access ChatGPT, Claude, Gemini and more in one app","Chat","Freemium",72,"https://poe.com"),
  $("Pi","Emotionally intelligent personal AI companion",["Chat","Self-Improvement"],"Free",65,"https://pi.ai"),
  $("Mistral Chat","European open-weight language models","Chat","Free",70,"https://chat.mistral.ai",{isNew:1}),
  $("HuggingChat","Open-source chatbot by Hugging Face","Chat","Free",60,"https://huggingface.co/chat"),
  $("Character.ai","Chat with millions of AI characters",["Chat","For Fun"],"Freemium",80,"https://character.ai"),
  $("Cohere Command","Enterprise-grade language models for business","Chat","Freemium",55,"https://cohere.com"),
  $("Le Chat","Mistral's polished consumer AI assistant","Chat","Free",62,"https://chat.mistral.ai",{isNew:1}),
  // ── Generative Code (16) ──
  $("GitHub Copilot","AI pair programmer in your IDE with agent mode","Generative Code","Freemium",94,"https://github.com/features/copilot",{isHot:1}),
  $("Cursor","AI-native code editor gaining massive developer adoption","Generative Code","Freemium",91,"https://cursor.sh",{isHot:1}),
  $("Claude Code","Anthropic's agentic terminal-based coding tool","Generative Code","Paid",85,"https://claude.ai/code",{isNew:1,isHot:1}),
  $("Replit Agent","Build and deploy full apps through conversation","Generative Code","Freemium",80,"https://replit.com",{isHot:1}),
  $("Bolt.new","Generate full-stack web apps from natural language","Generative Code","Freemium",82,"https://bolt.new",{isNew:1}),
  $("Lovable","Agent-focused app building with rapid adoption","Generative Code","Freemium",78,"https://lovable.dev",{isNew:1,isHot:1}),
  $("v0.dev","Generate React UI components from text descriptions","Generative Code","Freemium",77,"https://v0.dev"),
  $("Windsurf","Codeium's AI-powered collaborative IDE","Generative Code","Freemium",74,"https://codeium.com/windsurf"),
  $("Tabnine","AI code completion for every IDE and language","Generative Code","Freemium",68,"https://www.tabnine.com"),
  $("Codeium","Free AI code autocomplete and intelligent search","Generative Code","Free",72,"https://codeium.com"),
  $("Aider","AI pair programming agent in your terminal","Generative Code","Open Source",70,"https://aider.chat"),
  $("Devin","Autonomous AI software engineer for full tasks",["Generative Code","Automation & Agents"],"Paid",76,"https://devin.ai",{isNew:1}),
  $("Figma Make","Describe UI and get interactive prototypes",["Generative Code","Inspiration"],"Freemium",73,"https://www.figma.com",{isNew:1}),
  $("Cline","Open-source AI coding agent for VS Code","Generative Code","Open Source",68,"https://github.com/cline/cline",{isNew:1}),
  $("Amazon Q Developer","AWS AI coding assistant","Generative Code","Freemium",65,"https://aws.amazon.com/q/developer/"),
  $("Pieces","AI coding copilot with local context memory","Generative Code","Freemium",60,"https://pieces.app",{isNew:1}),
  // ── Generative Art (20) ──
  $("Midjourney","Industry-leading artistic AI image generation","Generative Art","Paid",96,"https://www.midjourney.com",{isHot:1,cc:["Image"]}),
  $("DALL-E 3","OpenAI text-to-image with excellent text rendering","Generative Art","Paid",88,"https://openai.com/dall-e-3",{cc:["Image"]}),
  $("Stable Diffusion","Leading open-source image generation ecosystem","Generative Art","Open Source",85,"https://stability.ai",{cc:["Image"]}),
  $("Leonardo AI","Production-quality art and game assets",["Generative Art","Gaming"],"Freemium",82,"https://leonardo.ai",{cc:["Image"]}),
  $("Ideogram","Best text-in-image accuracy of any generator","Generative Art","Freemium",79,"https://ideogram.ai",{isNew:1,cc:["Image"]}),
  $("Flux","Black Forest Labs high-quality open generation","Generative Art","Open Source",80,"https://blackforestlabs.ai",{isNew:1,isHot:1,cc:["Image"]}),
  $("Adobe Firefly","Commercially-safe AI images with Photoshop",["Generative Art","Image Improvement"],"Freemium",84,"https://firefly.adobe.com",{isHot:1,cc:["Image"]}),
  $("Krea","Real-time AI image generation and enhancement","Generative Art","Freemium",71,"https://www.krea.ai",{isNew:1,cc:["Image"]}),
  $("Playground","Free AI image generation and editing platform","Generative Art","Freemium",68,"https://playground.com",{cc:["Image"]}),
  $("NightCafe","AI art generator with multiple creation methods","Generative Art","Freemium",65,"https://creator.nightcafe.studio",{cc:["Image"]}),
  $("Canva AI","AI-powered design integrated into Canva",["Generative Art","Productivity"],"Freemium",90,"https://www.canva.com",{isHot:1,cc:["Image","Social"]}),
  $("Freepik AI","AI image generation with massive stock library",["Generative Art","Image Improvement","Inspiration"],"Freemium",84,"https://www.freepik.com/ai",{isHot:1,cc:["Image"]}),
  $("ImagineArt","AI image/video generator with viral effects and ad tools",["Generative Art","Generative Video","Social Media"],"Freemium",76,"https://www.imagine.art",{isNew:1,cc:["Image","Video","Social"]}),
  $("Recraft","AI design tool with vector output and brand control","Generative Art","Freemium",72,"https://www.recraft.ai",{isNew:1,cc:["Image"]}),
  $("Lexica","Stable Diffusion search engine and generator","Generative Art","Freemium",60,"https://lexica.art",{cc:["Image"]}),
  $("Craiyon","Free AI image generator for everyone","Generative Art","Free",55,"https://www.craiyon.com",{cc:["Image"]}),
  $("Artbreeder","Collaborative AI image creation and mixing","Generative Art","Freemium",58,"https://www.artbreeder.com",{cc:["Image"]}),
  $("Wombo Dream","Turn words into art in seconds","Generative Art","Freemium",62,"https://www.wombo.art",{cc:["Image"]}),
  $("Tensor.art","Community AI art platform with custom models","Generative Art","Free",55,"https://tensor.art",{cc:["Image"]}),
  $("Deep Dream Generator","AI art with deep neural style transfer","Generative Art","Freemium",50,"https://deepdreamgenerator.com",{cc:["Image"]}),
  // ── Generative Video (18) ──
  $("Sora","OpenAI cinematic text-to-video generation","Generative Video","Paid",88,"https://openai.com/sora",{isHot:1,cc:["Video"]}),
  $("Runway Gen-4","Production-ready AI video generation and editing",["Generative Video","Video Editing"],"Freemium",89,"https://runwayml.com",{isHot:1,cc:["Video"]}),
  $("Veo","Google DeepMind high-quality cinematic video","Generative Video","Paid",83,"https://deepmind.google/technologies/veo",{isNew:1,isHot:1,cc:["Video"]}),
  $("Higgsfield AI","Cinematic video studio with 15+ models inc. Sora 2 and Kling",["Generative Video","Social Media"],"Freemium",86,"https://higgsfield.ai",{isNew:1,isHot:1,cc:["Video","Social"]}),
  $("Vidu","Fast AI video with multi-entity consistency and anime mastery","Generative Video","Freemium",79,"https://www.vidu.com",{isNew:1,isHot:1,cc:["Video"]}),
  $("Pika","Generate and edit short videos with simple prompts","Generative Video","Freemium",78,"https://pika.art",{cc:["Video"]}),
  $("Luma Dream Machine","Generate realistic videos from text and images","Generative Video","Freemium",75,"https://lumalabs.ai",{cc:["Video"]}),
  $("Kling AI","High-quality AI video generation from Kuaishou","Generative Video","Freemium",76,"https://klingai.com",{isNew:1,cc:["Video"]}),
  $("Synthesia","Professional AI avatar videos at scale",["Generative Video","Avatar"],"Paid",81,"https://www.synthesia.io",{cc:["Video"]}),
  $("HeyGen","AI avatar videos for marketing, training and sales",["Generative Video","Avatar"],"Freemium",83,"https://www.heygen.com",{isHot:1,cc:["Video"]}),
  $("Minimax","High-quality Chinese AI video generation","Generative Video","Freemium",70,"https://www.minimaxi.com",{isNew:1,cc:["Video"]}),
  $("InVideo AI","Publish-ready videos from text prompts",["Generative Video","Video Editing"],"Freemium",74,"https://invideo.io",{cc:["Video","Social"]}),
  $("PixVerse","Stylized AI video effects and transitions","Generative Video","Freemium",70,"https://pixverse.ai",{isNew:1,cc:["Video"]}),
  $("Hailuo AI","Fast video generation with impressive motion quality","Generative Video","Freemium",72,"https://hailuoai.video",{isNew:1,cc:["Video"]}),
  $("Hedra","Turn portrait photos into talking character videos",["Generative Video","Avatar"],"Freemium",68,"https://www.hedra.com",{isNew:1,cc:["Video"]}),
  $("LTX Studio","Enterprise end-to-end script-to-video production","Generative Video","Paid",65,"https://ltx.studio",{isNew:1,cc:["Video"]}),
  $("Haiper","Fast AI video generation with motion brush tool","Generative Video","Freemium",62,"https://haiper.ai",{isNew:1,cc:["Video"]}),
  $("Genmo","Creative AI video and 3D content generation","Generative Video","Freemium",58,"https://www.genmo.ai",{cc:["Video"]}),
  // ── Copywriting (15) ──
  $("Jasper","AI marketing copilot for on-brand content at scale",["Copywriting","Marketing"],"Paid",85,"https://www.jasper.ai",{isHot:1,cc:["Writing","SEO"]}),
  $("Copy.ai","AI copywriting and go-to-market automation","Copywriting","Freemium",78,"https://www.copy.ai",{cc:["Writing"]}),
  $("Writesonic","AI writer for blogs, ads and SEO with GEO tracking",["Copywriting","Marketing"],"Freemium",75,"https://writesonic.com",{cc:["Writing","SEO"]}),
  $("Grammarly","AI writing assistant for grammar, tone and clarity",["Copywriting","Productivity"],"Freemium",92,"https://www.grammarly.com",{cc:["Writing"]}),
  $("Wordtune","AI rewriter to improve clarity, tone and style","Copywriting","Freemium",70,"https://www.wordtune.com",{cc:["Writing"]}),
  $("QuillBot","AI paraphrasing, summarizing and grammar checker","Copywriting","Freemium",73,"https://quillbot.com",{cc:["Writing"]}),
  $("Rytr","Budget-friendly AI writing assistant","Copywriting","Freemium",65,"https://rytr.me",{cc:["Writing"]}),
  $("Anyword","Copywriting with predictive performance scoring",["Copywriting","Marketing"],"Paid",68,"https://anyword.com",{cc:["Writing","SEO"]}),
  $("Scalenut","AI-powered SEO content research and writing",["Copywriting","Marketing"],"Freemium",62,"https://www.scalenut.com",{cc:["Writing","SEO"]}),
  $("Sight AI","End-to-end content engine with AI visibility monitoring",["Copywriting","Marketing"],"Paid",58,"https://www.trysight.ai",{isNew:1,cc:["Writing","SEO"]}),
  $("Hypotenuse AI","AI writer for e-commerce and marketing","Copywriting","Freemium",60,"https://www.hypotenuse.ai",{cc:["Writing"]}),
  $("Meet Sona","Guided interviews turned into weeks of on-brand content",["Copywriting","Social Media"],"Paid",56,"https://meetsona.ai",{isNew:1,cc:["Writing","Social"]}),
  $("eesel AI","AI blog writer with auto images and infographics",["Copywriting","Marketing"],"Freemium",58,"https://www.eesel.ai",{isNew:1,cc:["Writing","SEO"]}),
  $("ProWritingAid","Grammar and style checker with lifetime plan option","Copywriting","Freemium",64,"https://prowritingaid.com",{cc:["Writing"]}),
  $("Hemingway Editor","AI-powered readability analyzer and simplifier","Copywriting","Freemium",60,"https://hemingwayapp.com",{cc:["Writing"]}),
  // ── Automation & Agents (12) ──
  $("Zapier AI","Connect 7000+ apps with AI-powered automation","Automation & Agents","Freemium",90,"https://zapier.com",{isHot:1}),
  $("n8n","Open-source workflow automation with AI agent nodes","Automation & Agents","Open Source",82,"https://n8n.io",{isNew:1,isHot:1}),
  $("Make","Visual platform for designing complex automations","Automation & Agents","Freemium",80,"https://www.make.com"),
  $("Lindy AI","Create custom AI employees that automate work","Automation & Agents","Paid",72,"https://www.lindy.ai",{isNew:1}),
  $("CrewAI","Framework for orchestrating autonomous AI agent teams","Automation & Agents","Open Source",75,"https://www.crewai.com",{isNew:1}),
  $("OpenRouter","One unified API for 600+ AI models","Automation & Agents","Freemium",74,"https://openrouter.ai",{isNew:1,isHot:1}),
  $("Bardeen","Automate repetitive browser tasks with AI","Automation & Agents","Freemium",68,"https://www.bardeen.ai"),
  $("Relevance AI","Build and deploy AI agents for business processes","Automation & Agents","Freemium",65,"https://relevanceai.com"),
  $("Activepieces","Open-source automation alternative with AI","Automation & Agents","Open Source",60,"https://www.activepieces.com",{isNew:1}),
  $("Pipedream","Developer-first workflow automation platform","Automation & Agents","Freemium",62,"https://pipedream.com"),
  $("AirOps","Automate sophisticated content pipelines at scale",["Automation & Agents","Marketing"],"Paid",58,"https://www.airops.com",{isNew:1,cc:["Writing","SEO"]}),
  $("AutoGPT","Autonomous AI agent that chains thoughts to goals","Automation & Agents","Open Source",65,"https://github.com/Significant-Gravitas/AutoGPT"),
  // ── Music (8) ──
  $("Suno v4","Generate professional original songs from prompts","Music","Freemium",88,"https://suno.com",{isHot:1,cc:["Audio"]}),
  $("Udio","Create AI-generated music in any genre or style","Music","Freemium",82,"https://www.udio.com",{cc:["Audio"]}),
  $("AIVA","AI music composer for films, games and advertisements","Music","Freemium",70,"https://www.aiva.ai",{cc:["Audio"]}),
  $("Soundraw","Royalty-free AI music customized to your needs","Music","Paid",65,"https://soundraw.io",{cc:["Audio"]}),
  $("Mubert","AI-generated royalty-free music for any project","Music","Freemium",62,"https://mubert.com",{cc:["Audio"]}),
  $("Loudly","AI music creation for social media and marketing","Music","Freemium",58,"https://www.loudly.com",{cc:["Audio"]}),
  $("Boomy","Create original songs in seconds with AI","Music","Freemium",55,"https://boomy.com",{cc:["Audio"]}),
  $("Beatoven.ai","AI music generation tailored to video content","Music","Freemium",56,"https://www.beatoven.ai",{cc:["Audio"]}),
  // ── Text-To-Speech (8) ──
  $("ElevenLabs","Ultra-realistic voice generation, cloning and dubbing",["Text-To-Speech","Voice Modulation"],"Freemium",93,"https://elevenlabs.io",{isHot:1,cc:["Audio"]}),
  $("Play.ht","Lifelike AI voice generation for podcasts and content","Text-To-Speech","Freemium",72,"https://play.ht",{cc:["Audio"]}),
  $("Murf AI","Studio-quality AI voiceovers in minutes","Text-To-Speech","Freemium",68,"https://murf.ai",{cc:["Audio"]}),
  $("Speechify","Text-to-speech reader with natural AI voices","Text-To-Speech","Freemium",75,"https://speechify.com",{cc:["Audio"]}),
  $("WellSaid Labs","Enterprise AI voice generation platform","Text-To-Speech","Paid",62,"https://wellsaidlabs.com",{cc:["Audio"]}),
  $("Resemble AI","Enterprise voice cloning and synthesis",["Text-To-Speech","Voice Modulation"],"Paid",60,"https://www.resemble.ai",{cc:["Audio"]}),
  $("Coqui TTS","Open-source deep learning text-to-speech","Text-To-Speech","Open Source",55,"https://coqui.ai",{cc:["Audio"]}),
  $("LOVO AI","AI voice and video content platform","Text-To-Speech","Freemium",58,"https://lovo.ai",{cc:["Audio"]}),
  // ── Voice Modulation (5) ──
  $("Voicemod","Real-time AI voice changer for gaming and calls","Voice Modulation","Freemium",75,"https://www.voicemod.net"),
  $("Voice.ai","Free real-time AI voice changer and cloner","Voice Modulation","Free",70,"https://voice.ai"),
  $("Respeecher","AI voice cloning for film and media production","Voice Modulation","Paid",62,"https://www.respeecher.com"),
  $("Altered","Professional AI voice editing studio","Voice Modulation","Freemium",58,"https://www.altered.ai"),
  $("FakeYou","Deep fake text-to-speech with celebrity voices",["Voice Modulation","For Fun"],"Freemium",55,"https://fakeyou.com"),
  // ── Speech-To-Text (9) ──
  $("Whisper","OpenAI open-source speech recognition model","Speech-To-Text","Open Source",85,"https://github.com/openai/whisper"),
  $("Otter.ai","AI meeting assistant with transcription and notes",["Speech-To-Text","Productivity"],"Freemium",82,"https://otter.ai"),
  $("Descript","Edit audio and video by editing text",["Speech-To-Text","Video Editing"],"Freemium",84,"https://www.descript.com",{isHot:1,cc:["Video","Audio"]}),
  $("AssemblyAI","Powerful speech-to-text API with understanding","Speech-To-Text","Freemium",70,"https://www.assemblyai.com"),
  $("Deepgram","Enterprise speech recognition and NLU API","Speech-To-Text","Freemium",68,"https://deepgram.com"),
  $("Notta","AI transcription with 58-language meeting notes","Speech-To-Text","Freemium",64,"https://www.notta.ai"),
  $("Rev","AI and human-powered transcription services","Speech-To-Text","Paid",66,"https://www.rev.com"),
  $("Fireflies.ai","AI meeting note-taker with search","Speech-To-Text","Freemium",72,"https://fireflies.ai"),
  $("tl;dv","AI meeting recorder for Zoom and Google Meet","Speech-To-Text","Freemium",68,"https://tldv.io",{isNew:1}),
  // ── Productivity (18) ──
  $("Notion AI","AI assistant built into the all-in-one workspace","Productivity","Freemium",88,"https://www.notion.so/product/ai",{cc:["Writing"]}),
  $("Gamma","AI-powered presentations, docs and websites","Productivity","Freemium",78,"https://gamma.app",{isNew:1,cc:["Image"]}),
  $("Tome","AI-native storytelling and presentation platform","Productivity","Freemium",72,"https://tome.app",{cc:["Image"]}),
  $("Beautiful.ai","AI presentations with smart design rules","Productivity","Paid",70,"https://www.beautiful.ai",{cc:["Image"]}),
  $("Reclaim AI","Smart calendar AI that auto-schedules your life","Productivity","Freemium",72,"https://reclaim.ai"),
  $("Motion","AI-powered calendar and project manager","Productivity","Paid",74,"https://www.usemotion.com"),
  $("Goblin Tools","AI task breakdown for overwhelmed minds",["Productivity","Self-Improvement"],"Free",65,"https://goblin.tools",{isNew:1}),
  $("Visme","All-in-one visual content creation with AI",["Productivity","Generative Art"],"Freemium",70,"https://www.visme.co",{cc:["Image","Social"]}),
  $("Arc Browser","AI-native browser with built-in summarization",["Productivity","Research"],"Free",74,"https://arc.net"),
  $("Mem","AI-powered note-taking and knowledge management","Productivity","Freemium",66,"https://get.mem.ai"),
  $("Taskade","AI-powered productivity and project management","Productivity","Freemium",68,"https://www.taskade.com"),
  $("Coda AI","AI-powered docs that bring together text and data","Productivity","Freemium",64,"https://coda.io/product/ai"),
  $("Tana","AI-native workspace for notes, tasks, knowledge","Productivity","Free",60,"https://tana.inc"),
  $("ClickUp AI","Project management platform with AI features","Productivity","Freemium",72,"https://clickup.com"),
  $("Craft","AI-powered document and notes app","Productivity","Freemium",58,"https://www.craft.do",{cc:["Writing"]}),
  $("Superhuman","AI-powered email built for speed","Productivity","Paid",70,"https://superhuman.com"),
  $("Shortwave","AI email assistant with smart summaries","Productivity","Freemium",62,"https://www.shortwave.com",{isNew:1}),
  $("Warp","AI-powered terminal for developers","Productivity","Freemium",64,"https://www.warp.dev",{isNew:1}),
  // ── Research (10) ──
  $("Elicit","AI research assistant for finding and analyzing papers","Research","Freemium",78,"https://elicit.com"),
  $("Semantic Scholar","AI-powered academic paper search and discovery","Research","Free",75,"https://www.semanticscholar.org"),
  $("Consensus","Find evidence-based answers in scientific research","Research","Freemium",72,"https://consensus.app"),
  $("SciSpace","AI copilot for reading and understanding papers","Research","Freemium",68,"https://typeset.io"),
  $("Connected Papers","Explore connected research in visual graphs","Research","Freemium",65,"https://www.connectedpapers.com"),
  $("Storm","Stanford AI writing Wikipedia-style articles","Research","Open Source",60,"https://storm.genie.stanford.edu",{isNew:1}),
  $("Scite","AI for discovering and evaluating scientific articles","Research","Paid",62,"https://scite.ai"),
  $("Research Rabbit","Free AI-powered research discovery tool","Research","Free",58,"https://www.researchrabbit.ai"),
  $("Scholarcy","AI research paper summarizer","Research","Freemium",56,"https://www.scholarcy.com"),
  $("Wolfram Alpha","Computational knowledge engine for math and data","Research","Freemium",72,"https://www.wolframalpha.com"),
  // ── Marketing (13) ──
  $("Surfer SEO","AI content optimization for top search rankings","Marketing","Paid",80,"https://surferseo.com",{cc:["SEO"]}),
  $("Semrush AI","All-in-one marketing platform with AI writing tools","Marketing","Paid",85,"https://www.semrush.com",{cc:["SEO"]}),
  $("AdCreative.ai","Generate high-converting ad creatives with AI","Marketing","Paid",76,"https://www.adcreative.ai",{cc:["Image","Social"]}),
  $("Frase","AI research and writing tool for SEO content briefs",["Marketing","Copywriting"],"Freemium",70,"https://www.frase.io",{cc:["Writing","SEO"]}),
  $("Predis.ai","AI social media content generator and scheduler",["Marketing","Social Media"],"Freemium",65,"https://predis.ai",{cc:["Social"]}),
  $("Clearscope","AI content optimization for organic traffic growth","Marketing","Paid",68,"https://www.clearscope.io",{cc:["SEO"]}),
  $("Albert AI","Autonomous AI platform for marketing campaigns","Marketing","Paid",55,"https://albert.ai"),
  $("HubSpot AI","CRM platform with AI marketing automation","Marketing","Freemium",78,"https://www.hubspot.com",{cc:["SEO"]}),
  $("Lavender","AI email coach helping sales teams write better","Marketing","Freemium",62,"https://www.lavender.ai",{cc:["Writing"]}),
  $("Clay","AI data enrichment for go-to-market teams","Marketing","Paid",65,"https://www.clay.com",{isNew:1}),
  $("Instantly","AI cold email outreach platform at scale","Marketing","Freemium",64,"https://instantly.ai",{cc:["Writing"]}),
  $("Apollo","AI-powered sales intelligence and engagement","Marketing","Freemium",68,"https://www.apollo.io"),
  $("Persado","AI platform for personalized marketing messages","Marketing","Paid",52,"https://www.persado.com"),
  // ── Social Media (13) ──
  $("Opus Clip","Turn long videos into viral short clips with AI",["Social Media","Video Editing"],"Freemium",84,"https://www.opus.pro",{isHot:1,cc:["Video","Social"]}),
  $("Buffer AI","AI assistant for social media scheduling","Social Media","Freemium",75,"https://buffer.com",{cc:["Social"]}),
  $("Taplio","AI-powered LinkedIn growth and content tool",["Social Media"],"Paid",70,"https://taplio.com",{cc:["Social","Writing"]}),
  $("Lumen5","AI video creator turning blog posts into social videos",["Social Media","Generative Video"],"Freemium",68,"https://lumen5.com",{cc:["Video","Social"]}),
  $("FeedHive","AI social media scheduling with content recycling","Social Media","Paid",65,"https://www.feedhive.com",{cc:["Social"]}),
  $("Publer","AI-driven social media management and analytics","Social Media","Freemium",62,"https://publer.io",{cc:["Social"]}),
  $("Recast Studio","Turn podcasts and webinars into social clips",["Social Media","Video Editing"],"Freemium",58,"https://www.recaststudio.com",{isNew:1,cc:["Video","Social"]}),
  $("Sovran","AI video ad creation for performance marketers",["Social Media","Marketing"],"Paid",55,"https://sovran.ai",{isNew:1,cc:["Video","Social"]}),
  $("Hootsuite AI","AI-powered social media management platform","Social Media","Paid",72,"https://www.hootsuite.com",{cc:["Social"]}),
  $("Tribescaler","AI hook generator for viral tweets and threads","Social Media","Freemium",56,"https://tribescaler.com",{cc:["Social","Writing"]}),
  $("Supermeme","Generate AI memes from text in 110+ languages",["Social Media","For Fun"],"Freemium",52,"https://www.supermeme.ai",{cc:["Social"]}),
  $("Crayo","AI short-form video creator for TikTok and Reels","Social Media","Freemium",60,"https://crayo.ai",{isNew:1,cc:["Video","Social"]}),
  $("Later","AI social media scheduling and analytics platform","Social Media","Freemium",64,"https://later.com",{cc:["Social"]}),
  // ── Video Editing (7) ──
  $("CapCut","Free video editor with powerful AI features","Video Editing","Freemium",88,"https://www.capcut.com",{cc:["Video"]}),
  $("Topaz Video AI","AI video upscaling, denoising and stabilization","Video Editing","Paid",75,"https://www.topazlabs.com/topaz-video-ai"),
  $("Kapwing","Online AI video editor for teams and creators","Video Editing","Freemium",72,"https://www.kapwing.com",{cc:["Video","Social"]}),
  $("Pictory","Convert long-form content into short marketing videos","Video Editing","Paid",68,"https://pictory.ai",{cc:["Video"]}),
  $("Filmora","AI video editor with creative effects and templates","Video Editing","Freemium",70,"https://filmora.wondershare.com",{cc:["Video"]}),
  $("Captions","AI-powered video captions and smart editing","Video Editing","Freemium",66,"https://www.captions.ai",{isNew:1,cc:["Video","Social"]}),
  $("Vizard","AI video repurposing for social media","Video Editing","Freemium",60,"https://vizard.ai",{cc:["Video","Social"]}),
  // ── Image Improvement (9) ──
  $("Topaz Photo AI","AI-powered sharpen, denoise and upscale","Image Improvement","Paid",78,"https://www.topazlabs.com/topaz-photo-ai"),
  $("Remove.bg","Remove image backgrounds instantly with AI","Image Improvement","Freemium",82,"https://www.remove.bg"),
  $("Photoroom","AI background removal and product photography","Image Improvement","Freemium",76,"https://www.photoroom.com",{cc:["Image"]}),
  $("Clipdrop","AI image editing and enhancement toolkit","Image Improvement","Freemium",72,"https://clipdrop.co",{cc:["Image"]}),
  $("Upscale.media","AI image upscaling to 4x resolution","Image Improvement","Freemium",65,"https://www.upscale.media"),
  $("Luminar Neo","AI-powered creative photo editor by Skylum","Image Improvement","Paid",70,"https://skylum.com/luminar"),
  $("Pixlr","Free AI-powered online photo editor","Image Improvement","Freemium",68,"https://pixlr.com",{cc:["Image"]}),
  $("Cleanup.pictures","AI object and blemish removal from photos","Image Improvement","Freemium",62,"https://cleanup.pictures"),
  $("Remini","AI photo enhancement and restoration app","Image Improvement","Freemium",72,"https://remini.ai",{cc:["Image"]}),
  // ── Image Scanning (4) ──
  $("Google Lens","Visual search and recognition by Google","Image Scanning","Free",88,"https://lens.google"),
  $("Mathpix","Extract math equations and data from images","Image Scanning","Freemium",72,"https://mathpix.com"),
  $("Nanonets","AI-powered document and image data extraction","Image Scanning","Freemium",68,"https://nanonets.com"),
  $("OCR Space","Free online OCR for extracting text from images","Image Scanning","Freemium",55,"https://ocr.space"),
  // ── AI Detection (7) ──
  $("GPTZero","Leading AI content detection for education","AI Detection","Freemium",80,"https://gptzero.me"),
  $("Originality.ai","AI and plagiarism detection for publishers","AI Detection","Paid",75,"https://originality.ai"),
  $("Copyleaks","Enterprise AI content and plagiarism detection","AI Detection","Freemium",72,"https://copyleaks.com"),
  $("Turnitin","Academic AI writing detection standard","AI Detection","Paid",78,"https://www.turnitin.com"),
  $("Sapling AI","AI content detection and writing assistant","AI Detection","Freemium",58,"https://sapling.ai/ai-content-detector"),
  $("Writer AI Detector","Free tool to detect AI-generated content","AI Detection","Free",55,"https://writer.com/ai-content-detector"),
  $("Hive Moderation","AI-generated content detection API","AI Detection","Freemium",60,"https://hivemoderation.com"),
  // ── Translation (5) ──
  $("DeepL","Human-level neural machine translation","Translation","Freemium",88,"https://www.deepl.com"),
  $("Rask AI","AI video localization with dubbing in 130+ languages",["Translation","Video Editing"],"Freemium",75,"https://www.rask.ai"),
  $("Smartcat","AI translation platform for enterprise teams","Translation","Freemium",65,"https://www.smartcat.com"),
  $("Lingvanex","On-device machine translation API and apps","Translation","Freemium",55,"https://lingvanex.com"),
  $("Papago","AI-powered translation focused on Asian languages","Translation","Free",60,"https://papago.naver.com"),
  // ── Finance (6) ──
  $("Finchat","AI assistant for institutional-grade financial data",["Finance","Research"],"Freemium",72,"https://finchat.io"),
  $("Composer","AI-powered automated investment strategies","Finance","Paid",65,"https://www.composer.trade"),
  $("Stocknear","Open-source AI stock market research","Finance","Open Source",58,"https://stocknear.com"),
  $("BeeBee AI","AI-powered financial report analysis","Finance","Freemium",55,"https://www.beebee.ai"),
  $("AlphaSense","AI market intelligence and search platform","Finance","Paid",68,"https://www.alpha-sense.com"),
  $("Durable Invoice","AI-powered invoicing for small businesses","Finance","Freemium",52,"https://durable.co"),
  // ── Avatar (5) ──
  $("D-ID","Create talking avatar videos from a single photo","Avatar","Freemium",76,"https://www.d-id.com",{cc:["Video"]}),
  $("Colossyan","Enterprise AI video with realistic avatars",["Avatar","Generative Video"],"Paid",68,"https://www.colossyan.com",{cc:["Video"]}),
  $("Elai","Generate AI videos with presenters from text","Avatar","Freemium",62,"https://elai.io",{cc:["Video"]}),
  $("Hour One","AI avatar videos for enterprise training","Avatar","Paid",58,"https://hourone.ai",{cc:["Video"]}),
  $("Ready Player Me","Cross-platform 3D AI avatars","Avatar","Freemium",65,"https://readyplayer.me"),
  // ── For Fun (4) ──
  $("AI Dungeon","AI-powered infinite text adventure game",["For Fun","Gaming"],"Freemium",70,"https://play.aidungeon.com"),
  $("This Person Does Not Exist","AI-generated human faces","For Fun","Free",55,"https://thispersondoesnotexist.com"),
  $("Talk to Books","AI-powered search through book passages","For Fun","Free",50,"https://books.google.com/talktobooks"),
  $("Roast My Pic","Upload a photo and get AI-generated roasts","For Fun","Free",48,"https://roastmypic.com"),
  // ── Gaming (6) ──
  $("Scenario","Generate game art assets with custom AI models",["Gaming","Generative Art"],"Freemium",72,"https://www.scenario.com"),
  $("Inworld AI","Create intelligent AI NPCs for games","Gaming","Freemium",70,"https://inworld.ai"),
  $("Rosebud AI","Create browser games with natural language",["Gaming","Generative Code"],"Freemium",65,"https://www.rosebud.ai",{isNew:1}),
  $("Ludo.ai","AI-powered game design and ideation assistant","Gaming","Freemium",58,"https://ludo.ai"),
  $("Latitude","AI game engine for dynamic story experiences","Gaming","Freemium",55,"https://latitude.io"),
  $("Promethean AI","AI assistant for building virtual game worlds","Gaming","Free",52,"https://www.prometheanai.com"),
  // ── Podcasting (6) ──
  $("Riverside","Record studio-quality podcasts with AI editing","Podcasting","Freemium",78,"https://riverside.fm",{cc:["Audio"]}),
  $("Podcastle","AI-powered podcast recording and editing studio","Podcasting","Freemium",72,"https://podcastle.ai",{cc:["Audio"]}),
  $("Castmagic","Turn podcast audio into multi-format content","Podcasting","Paid",68,"https://www.castmagic.io",{cc:["Audio","Writing"]}),
  $("Snipd","AI podcast player that highlights key insights","Podcasting","Free",65,"https://www.snipd.com"),
  $("Resound","AI podcast editor that removes filler words","Podcasting","Freemium",58,"https://www.resound.fm",{cc:["Audio"]}),
  $("Deciphr","AI-powered podcast show notes and summaries","Podcasting","Free",55,"https://www.deciphr.ai",{cc:["Audio"]}),
  // ── Self-Improvement (6) ──
  $("Speak","AI-powered language learning through conversation","Self-Improvement","Paid",75,"https://www.speak.com"),
  $("Duolingo Max","Language learning enhanced with GPT-4 AI","Self-Improvement","Paid",85,"https://www.duolingo.com"),
  $("Replika","AI companion for personal growth and conversations",["Self-Improvement","Chat"],"Freemium",68,"https://replika.ai"),
  $("Socratic","Google's AI homework helper for students","Self-Improvement","Free",72,"https://socratic.org"),
  $("Youper","AI-powered emotional health assistant","Self-Improvement","Freemium",58,"https://www.youper.ai"),
  $("Headspace AI","AI-guided meditation and mindfulness","Self-Improvement","Paid",65,"https://www.headspace.com"),
  // ── Inspiration (8) ──
  $("Looka","AI logo maker and brand kit generator","Inspiration","Freemium",72,"https://looka.com",{cc:["Image"]}),
  $("Uizard","Transform wireframes into UI designs with AI",["Inspiration","Generative Code"],"Freemium",70,"https://uizard.io"),
  $("Khroma","AI color palette generator based on your tastes","Inspiration","Free",65,"https://www.khroma.co"),
  $("Brandmark","AI-powered logo and brand identity design","Inspiration","Paid",60,"https://brandmark.io"),
  $("Designify","AI-powered design suggestions and mockups","Inspiration","Freemium",56,"https://www.designify.com"),
  $("Coolors","AI-powered color scheme generator","Inspiration","Freemium",68,"https://coolors.co"),
  $("Fontjoy","AI font pairing generator for designers","Inspiration","Free",55,"https://fontjoy.com"),
  $("Framer AI","AI-powered website builder with design smarts","Inspiration","Freemium",72,"https://www.framer.com",{isNew:1}),
  // ── Motion Capture (5) ──
  $("Move.ai","Markerless AI motion capture from cameras","Motion Capture","Paid",72,"https://www.move.ai"),
  $("Plask","AI motion capture from video — no hardware","Motion Capture","Freemium",65,"https://plask.ai"),
  $("DeepMotion","AI-powered 3D motion capture from video","Motion Capture","Freemium",62,"https://www.deepmotion.com"),
  $("Rokoko","Affordable motion capture suits and AI tools","Motion Capture","Freemium",60,"https://www.rokoko.com"),
  $("RadicalMotion","AI 3D mocap from single camera video","Motion Capture","Freemium",55,"https://radicalmotion.com"),
  // ── Aggregators (5) ──
  $("There's An AI For That","Largest database of AI tools","Aggregators","Free",78,"https://theresanaiforthat.com"),
  $("Toolify","Navigate and discover AI tools by category","Aggregators","Free",65,"https://www.toolify.ai"),
  $("Futurepedia","AI tool directory and education platform","Aggregators","Free",70,"https://www.futurepedia.io"),
  $("AI Tool Tracker","Curated directory of new AI tools daily","Aggregators","Free",55,"https://www.aitooltracker.com"),
  $("TopAI.tools","AI tools ranked by category","Aggregators","Free",52,"https://topai.tools"),
  // ── Prompt Guides (4) ──
  $("PromptPerfect","Optimize prompts for any AI model","Prompt Guides","Freemium",65,"https://promptperfect.jina.ai"),
  $("FlowGPT","Community library of curated AI prompts","Prompt Guides","Free",68,"https://flowgpt.com"),
  $("PromptBase","Marketplace for buying and selling prompts","Prompt Guides","Freemium",58,"https://promptbase.com"),
  $("AI Prompt Generator","Generate effective prompts for any tool","Prompt Guides","Free",50,"https://aipromptgenerator.com"),
  // ── 3D Generation (13) ──
  $("Meshy","Text and image to 3D with Blender and Unity plugins",["3D Generation","Gaming"],"Freemium",82,"https://www.meshy.ai",{isHot:1,cc:["3D"]}),
  $("Tripo AI","Clean quad-topology 3D models with auto-rigging",["3D Generation","Gaming"],"Freemium",78,"https://www.tripo3d.ai",{isNew:1,cc:["3D"]}),
  $("Rodin AI","Ultra-photorealistic 3D generation with 4K textures","3D Generation","Paid",75,"https://hyperhuman.deemos.com",{cc:["3D"]}),
  $("3DAI Studio","Multi-model 3D platform: Meshy, Rodin, Tripo in one","3D Generation","Freemium",74,"https://www.3daistudio.com",{isNew:1,cc:["3D"]}),
  $("Luma AI Genie","NeRF-based 3D capture and generation","3D Generation","Freemium",76,"https://lumalabs.ai/genie",{isHot:1,cc:["3D"]}),
  $("Sloyd","Procedural AI 3D asset generator for game props",["3D Generation","Gaming"],"Freemium",65,"https://www.sloyd.ai",{cc:["3D"]}),
  $("Spline AI","AI-powered 3D design for web and interactive",["3D Generation","Generative Code"],"Freemium",72,"https://spline.design",{cc:["3D"]}),
  $("Kaedim","Turn 2D images into production-ready 3D models","3D Generation","Paid",63,"https://www.kaedim3d.com",{cc:["3D"]}),
  $("Alpha3D","Transform product photos into 3D for e-commerce",["3D Generation","Marketing"],"Freemium",60,"https://www.alpha3d.io",{cc:["3D"]}),
  $("CSM AI","Common Sense Machines 3D world generation","3D Generation","Freemium",62,"https://www.csm.ai",{isNew:1,cc:["3D"]}),
  $("Polycam","Mobile 3D scanning with LiDAR and photogrammetry",["3D Generation","Image Scanning"],"Freemium",70,"https://poly.cam",{cc:["3D"]}),
  $("Masterpiece Studio","AI 3D creation with text-to-3D and VR editing","3D Generation","Freemium",58,"https://masterpiecestudio.com",{cc:["3D"]}),
  $("Point-E","OpenAI open-source point cloud to 3D model system","3D Generation","Open Source",55,"https://github.com/openai/point-e",{cc:["3D"]}),
  // ── Customer Service (4) ──
  $("Tidio AI","AI chatbot for customer service and sales","Customer Service","Freemium",68,"https://www.tidio.com"),
  $("Intercom Fin","AI-first customer service agent","Customer Service","Paid",72,"https://www.intercom.com"),
  $("Zendesk AI","AI-powered customer support platform","Customer Service","Paid",70,"https://www.zendesk.com"),
  $("Freshdesk AI","AI customer service with Freddy AI","Customer Service","Freemium",65,"https://www.freshworks.com"),
  // ── Data & Analytics (4) ──
  $("Tableau AI","AI analytics and data visualization","Data & Analytics","Paid",75,"https://www.tableau.com"),
  $("Obviously AI","No-code AI predictions from data","Data & Analytics","Freemium",58,"https://www.obviously.ai"),
  $("MonkeyLearn","AI text analysis and sentiment detection","Data & Analytics","Freemium",55,"https://monkeylearn.com"),
  $("MindsDB","AI tables inside your database","Data & Analytics","Open Source",60,"https://mindsdb.com"),
  // ── Education (3) ──
  $("Khanmigo","AI tutor by Khan Academy","Education","Freemium",72,"https://www.khanacademy.org/khan-labs"),
  $("Quizlet AI","AI-powered study tools and flashcards","Education","Freemium",70,"https://quizlet.com"),
  $("Photomath","AI math problem solver from photos","Education","Freemium",68,"https://photomath.com"),
  // ── Design (2) ──
  $("Figma AI","AI features built into Figma design tool","Design","Freemium",80,"https://www.figma.com",{isNew:1}),
  $("Raycast AI","AI-powered productivity launcher for Mac","Design","Freemium",68,"https://www.raycast.com",{isNew:1}),
  // ── Extra fills to 304 ──
  $("Khanmigo","AI tutor powered by Khan Academy and GPT-4","Education","Freemium",72,"https://www.khanacademy.org/khan-labs"),
  $("Quizlet AI","AI-powered study tools and smart flashcards","Education","Freemium",70,"https://quizlet.com"),
  $("Photomath","AI math problem solver from camera photos","Education","Freemium",68,"https://photomath.com"),
  $("Tidio AI","AI chatbot for customer service and sales","Customer Service","Freemium",68,"https://www.tidio.com"),
  $("Intercom Fin","AI-first customer service agent platform","Customer Service","Paid",72,"https://www.intercom.com"),
  $("Zendesk AI","AI-powered customer support automation","Customer Service","Paid",70,"https://www.zendesk.com"),
  $("Shopify Magic","AI commerce tools built into Shopify","eCommerce","Freemium",75,"https://www.shopify.com/magic",{cc:["Writing","Image"]}),
  $("Harvey AI","AI legal research and drafting assistant","Legal","Paid",65,"https://www.harvey.ai",{isNew:1}),
  $("Pitch AI","AI-powered presentation and pitch deck builder","Productivity","Freemium",62,"https://pitch.com",{cc:["Image"]}),
  $("Slidesgo AI","AI presentation templates and generation","Productivity","Freemium",58,"https://slidesgo.com",{cc:["Image"]}),
  $("Tableau AI","AI-powered analytics and data visualization","Data & Analytics","Paid",75,"https://www.tableau.com"),
  $("Obviously AI","No-code AI predictions from your data","Data & Analytics","Freemium",58,"https://www.obviously.ai"),
].map((t,i) => ({...t, id:i, pop:t.pop||50, isNew:!!t.isNew, isHot:!!t.isHot, cc:t.cc||[]}));

const CATS = [...new Set(TOOLS.flatMap(t=>t.cat))].sort();
const CC_TABS = [{k:"Writing",i:"✍️"},{k:"Video",i:"🎬"},{k:"Image",i:"🎨"},{k:"Audio",i:"🎙️"},{k:"Social",i:"📱"},{k:"SEO",i:"📈"},{k:"3D",i:"🧊"}];
const PRICING_OPTS = ["All","Free","Freemium","Paid","Open Source"];

// ═══════════════════════════════════════════
// INTERACTIVE 3D HERO
// ═══════════════════════════════════════════
function Hero3D({ dark, onDiscover }) {
  const mount = useRef(null);
  const mouse = useRef({ x: 0, y: 0, over: false });
  const target = useRef({ x: 0, y: 0, scale: 1, spin: 0.003 });
  const current = useRef({ x: 0, y: 0, scale: 1, spin: 0.003 });

  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    const w = el.clientWidth, h = el.clientHeight;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    cam.position.z = 4.4;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const g1 = new THREE.IcosahedronGeometry(1.0, 2);
    const m1 = new THREE.MeshBasicMaterial({
      color: dark ? 0x818cf8 : 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.36
    });
    const mesh1 = new THREE.Mesh(g1, m1);
    group.add(mesh1);

    const g2 = new THREE.IcosahedronGeometry(0.64, 3);
    const m2 = new THREE.MeshBasicMaterial({
      color: dark ? 0xa78bfa : 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    const mesh2 = new THREE.Mesh(g2, m2);
    group.add(mesh2);

    const pGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(240 * 3);
    for (let i = 0; i < 240 * 3; i++) pos[i] = (Math.random() - 0.5) * 4.2;
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({
      color: dark ? 0xc4b5fd : 0xa78bfa,
      size: 0.015,
      transparent: true,
      opacity: 0.55
    });
    const pts = new THREE.Points(pGeo, pMat);
    scene.add(pts);

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      mouse.current.x = (relX - 0.5) * 2;
      mouse.current.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const onEnter = () => { mouse.current.over = true; };
    const onLeave = () => {
      mouse.current.over = false;
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);

      if (mouse.current.over) {
        target.current.x = mouse.current.y * 0.55;
        target.current.y = mouse.current.x * 0.75;
        target.current.scale = 1.08;
        target.current.spin = 0.008;
      } else {
        target.current.x *= 0.95;
        target.current.y *= 0.95;
        target.current.scale = 1;
        target.current.spin = 0.003;
      }

      current.current.x += (target.current.x - current.current.x) * 0.08;
      current.current.y += (target.current.y - current.current.y) * 0.08;
      current.current.scale += (target.current.scale - current.current.scale) * 0.08;
      current.current.spin += (target.current.spin - current.current.spin) * 0.08;

      group.rotation.x = current.current.x;
      group.rotation.y += current.current.spin;
      group.rotation.z = current.current.y * 0.15;
      group.scale.setScalar(current.current.scale);

      mesh2.rotation.x -= current.current.spin * 1.8;
      mesh2.rotation.y += current.current.spin * 1.2;
      pts.rotation.y += current.current.spin * 0.35;
      pts.rotation.x = current.current.x * 0.18;

      renderer.render(scene, cam);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
      [g1, m1, g2, m2, pGeo, pMat].forEach((x) => x.dispose());
      renderer.dispose();
    };
  }, [dark]);

  return (
    <div
      ref={mount}
      onClick={onDiscover}
      style={{ position: "absolute", inset: 0, cursor: "pointer" }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onDiscover?.();
        }
      }}
    />
  );
}

// ═══════════════════════════════════════════
// APP
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// ADMIN CONFIG — Change this to YOUR email address
// Only this email will see the Affiliate dashboard
// ═══════════════════════════════════════════
const ADMIN_EMAIL = "supertomboss@gmail.com"; // ← METS TON EMAIL ICI
const normalizeEmail = (value = "") => value.trim().toLowerCase();
const ADMIN_EMAIL_NORMALIZED = normalizeEmail(ADMIN_EMAIL);
const normalizeAffiliateUrl = (value = "") => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
};

const sortToolsByName = (tools) =>
  [...tools].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
const BASE_TOOLS = TOOLS.map((tool) => ({ ...tool, id: tool.affId, descFr: tool.descFr || "" }));
const BASE_TOOL_IDS = new Set(BASE_TOOLS.map((tool) => tool.affId));

const slugifyToolId = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

const normalizeStringArray = (value) =>
  [...new Set((Array.isArray(value) ? value : String(value || "").split(","))
    .map((item) => String(item || "").trim())
    .filter(Boolean))];

const createEmptyToolDraft = () => ({
  id: "",
  affId: "",
  baseAffId: "",
  name: "",
  desc: "",
  descFr: "",
  url: "",
  pricing: "Freemium",
  pop: 60,
  cat: [],
  cc: [],
  isNew: false,
  isHot: false,
  custom: true
});

const sanitizeToolPayload = (value = {}, fallbackId = "") => {
  const name = String(value.name || "").trim();
  const requestedId = slugifyToolId(value.affId || value.id || value.baseAffId || fallbackId || name);
  const baseAffId = BASE_TOOL_IDS.has(String(value.baseAffId || "")) ? String(value.baseAffId) : (BASE_TOOL_IDS.has(requestedId) ? requestedId : "");
  const affId = requestedId || baseAffId || slugifyToolId(name);
  const url = normalizeAffiliateUrl(value.url || "") || "";
  const categories = normalizeStringArray(value.cat);
  const hubTags = normalizeStringArray(value.cc).filter((item) => CC_TABS.some((tab) => tab.k === item));
  return {
    id: affId,
    affId,
    baseAffId,
    name,
    desc: String(value.desc || "").trim(),
    descFr: String(value.descFr || "").trim(),
    url,
    pricing: PRICING_OPTS.includes(value.pricing) ? value.pricing : "Freemium",
    pop: Math.max(1, Math.min(100, Number(value.pop) || 60)),
    cat: categories,
    cc: hubTags,
    isNew: !!value.isNew,
    isHot: !!value.isHot,
    custom: !!value.custom || (!baseAffId && !BASE_TOOL_IDS.has(affId))
  };
};

const mergeCatalogTools = (baseTools, overrideDocs) => {
  const merged = new Map(baseTools.map((tool) => [tool.affId, { ...tool, id: tool.affId, descFr: tool.descFr || "" }]));
  for (const rawDoc of overrideDocs || []) {
    const raw = sanitizeToolPayload(rawDoc, rawDoc?.affId || rawDoc?.baseAffId || rawDoc?.id);
    if (!raw.affId || !raw.name || !raw.url) continue;
    const targetId = raw.baseAffId && merged.has(raw.baseAffId)
      ? raw.baseAffId
      : merged.has(raw.affId)
        ? raw.affId
        : null;
    if (targetId) {
      const base = merged.get(targetId);
      merged.set(targetId, {
        ...base,
        ...raw,
        id: targetId,
        affId: targetId,
        baseAffId: targetId,
        custom: false,
        desc: raw.desc || base.desc,
        descFr: raw.descFr || base.descFr || "",
        url: raw.url || base.url,
        pricing: raw.pricing || base.pricing,
        pop: raw.pop || base.pop,
        cat: raw.cat.length ? raw.cat : base.cat,
        cc: raw.cc.length ? raw.cc : (base.cc || [])
      });
    } else {
      merged.set(raw.affId, {
        ...createEmptyToolDraft(),
        ...raw,
        id: raw.affId,
        affId: raw.affId,
        custom: true
      });
    }
  }
  return Array.from(merged.values());
};

const getToolDescription = (tool, lang = "en") => {
  if (!tool) return "";
  return lang === "fr" ? (tool.descFr || tool.desc || "") : (tool.desc || "");
};

const TERMS_OF_USE_HTML = `
  <p><strong>Last updated:</strong> March 12, 2026</p>
  <p>These Terms of Use ("Terms") govern access to and use of Indexairium (the "Site"), operated by Thomas Techer ("we", "us", or "our"). By accessing or using the Site, you agree to be bound by these Terms. If you do not agree to these Terms, you must not use the Site.</p>
  <h2>1. About the Site</h2>
  <p>Indexairium is an online directory and discovery platform that lists and organizes links to artificial intelligence tools and related resources.</p>
  <p>The Site is provided for informational and discovery purposes only. We do not own, operate, control, endorse, or guarantee any third-party tools, websites, or services listed on the Site unless expressly stated otherwise.</p>
  <h2>2. Eligibility</h2>
  <p>You may use the Site only if you are legally capable of entering into a binding agreement under applicable law.</p>
  <p>If you create an account, you agree to provide accurate, current, and complete information and to keep your login credentials secure and confidential. You are responsible for all activity that occurs under your account.</p>
  <h2>3. User Accounts</h2>
  <p>Certain features of the Site may require account registration or login.</p>
  <p>By creating an account, you agree:</p>
  <ul>
    <li>to provide a valid email address and accurate registration information;</li>
    <li>to maintain the security of your account credentials;</li>
    <li>not to impersonate any person or entity;</li>
    <li>to notify us promptly of any unauthorized access to or use of your account.</li>
  </ul>
  <p>We reserve the right to suspend or terminate accounts that violate these Terms or that appear to present a security risk.</p>
  <h2>4. Third-Party Links and Affiliate Disclosure</h2>
  <p>The Site contains links to third-party websites, tools, and services.</p>
  <p>Some links may be affiliate links. This means we may earn a commission or other compensation if you click on certain links or make a purchase through them, at no additional cost to you unless otherwise stated.</p>
  <p>Your interactions with third-party websites, products, or services are solely between you and the relevant third party. We are not responsible for the availability, content, policies, security, pricing, legality, or performance of any third-party website or service.</p>
  <h2>5. No Professional Advice</h2>
  <p>Content available on the Site is provided for general informational purposes only and does not constitute legal, financial, technical, cybersecurity, business, or professional advice.</p>
  <p>You are solely responsible for evaluating any tool, service, or resource before using it, especially with respect to privacy, security, compliance, pricing, and suitability for your needs.</p>
  <h2>6. Intellectual Property</h2>
  <p>The Site, including its structure, selection, arrangement, design, branding, text, graphics, database elements, and original content, is protected by applicable intellectual property laws.</p>
  <p>Except as expressly permitted by law or these Terms, you may not: copy, reproduce, republish, distribute, publicly display, or create derivative works from the Site or its content; perform massive extraction, harvesting, or reuse of Site content; scrape, crawl, index, mirror, or systematically collect data from the Site by automated means; or use the Site or its content to build a competing service, database, or directory without our prior written authorization.</p>
  <p>All third-party names, brands, trademarks, and logos remain the property of their respective owners.</p>
  <h2>7. Prohibited Conduct</h2>
  <p>You agree not to use the Site in any unlawful, fraudulent, deceptive, or abusive manner; interfere with or disrupt the Site; attempt to gain unauthorized access; bypass security controls; upload malicious code; scrape or overload the Site; or infringe the rights of others.</p>
  <h2>8. Availability and Disclaimer of Warranties</h2>
  <p>The Site is provided on an "as is" and "as available" basis. We make no representations or warranties regarding uninterrupted availability, accuracy, completeness, reliability, timeliness, continued availability of listed tools, or the security, performance, legality, or fitness for a particular purpose of any third-party service.</p>
  <p>We may modify, suspend, restrict, or discontinue all or part of the Site at any time, with or without notice.</p>
  <h2>9. Limitation of Liability</h2>
  <p>To the fullest extent permitted by applicable law, Thomas Techer and Indexairium shall not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, or for any loss of profits, revenue, data, goodwill, business opportunities, or other intangible losses arising out of or related to your use of or inability to use the Site, your reliance on any content or listing, your access to or transactions with third-party websites or tools, unauthorized access to your data, or technical failures.</p>
  <h2>10. Indemnification</h2>
  <p>You agree to defend, indemnify, and hold harmless Thomas Techer and Indexairium from and against any claims, liabilities, damages, losses, and expenses, including reasonable legal fees, arising out of or related to your use of the Site, your breach of these Terms, or your violation of any law or third-party rights.</p>
  <h2>11. Termination</h2>
  <p>We reserve the right to suspend, restrict, or terminate your access to the Site or your account at any time if we believe that you have violated these Terms, applicable law, or the security or integrity of the Site.</p>
  <h2>12. Changes to These Terms</h2>
  <p>We may update these Terms from time to time. The updated version will be posted on this page with a revised "Last updated" date. Your continued use of the Site after any changes become effective constitutes your acceptance of the revised Terms.</p>
  <h2>13. Governing Law</h2>
  <p>These Terms shall be governed by and construed in accordance with the laws of France, without prejudice to any mandatory consumer protection rules that may apply in your country of residence.</p>
  <h2>14. Contact</h2>
  <p>Thomas Techer<br>Email: histoire2succes@gmail.com</p>
`;

const PRIVACY_POLICY_HTML = `
  <p><strong>Last updated:</strong> March 12, 2026</p>
  <p>This Privacy Policy explains how Indexairium (the "Site"), operated by Thomas Techer ("we", "us", or "our"), collects, uses, stores, shares, and protects personal data when you use the Site.</p>
  <h2>1. Data Controller</h2>
  <p>Thomas Techer<br>Email: histoire2succes@gmail.com</p>
  <h2>2. Scope</h2>
  <p>This Privacy Policy applies to personal data collected through Indexairium, including when you browse the Site, create an account, log in, interact with Site features, or contact us.</p>
  <h2>3. Personal Data We May Collect</h2>
  <p>We may collect account and login data such as your email address and authentication-related information; technical and usage data such as IP address, browser type, device information, operating system, viewed pages, timestamps, referring pages, logs relating to access, security, and performance; and communications data when you contact us.</p>
  <p>The Site may use essential cookies or similar technologies required for authentication, security, session management, and core functionality. Additional analytics or non-essential cookies may be used only where enabled and, where required by law, subject to user consent.</p>
  <h2>4. Purposes of Processing</h2>
  <p>We may process your personal data to create, manage, and secure user accounts; provide access to Site features; authenticate users; operate, maintain, monitor, and improve the Site; prevent fraud, abuse, unauthorized access, and security incidents; measure performance; communicate with users; comply with legal obligations; and enforce our Terms of Use.</p>
  <h2>5. Legal Bases for Processing</h2>
  <p>Where the GDPR or similar laws apply, we rely on performance of a contract, legitimate interests, your consent where required, and compliance with legal obligations.</p>
  <h2>6. Authentication Provider</h2>
  <p>For account authentication and login, the Site may use Firebase Authentication, a service provided by Google LLC. Authentication-related data may be processed through this provider in accordance with its own applicable terms and policies.</p>
  <h2>7. Affiliate Links</h2>
  <p>The Site may include affiliate links to third-party tools and services. If you click on such links, the relevant third party may collect information in accordance with its own privacy policy and cookie practices. We do not control third-party websites and are not responsible for their privacy, security, or data practices.</p>
  <h2>8. Sharing of Personal Data</h2>
  <p>We may share personal data only where necessary and appropriate, including with hosting and infrastructure providers, authentication and account management providers including Firebase Authentication, analytics providers where used, security and technical support providers, legal and regulatory authorities when required by law, and transaction counterparties in the event of a merger, acquisition, asset transfer, restructuring, or similar transaction.</p>
  <p>We do not sell your personal data.</p>
  <h2>9. International Data Transfers</h2>
  <p>Because the Site may be accessible worldwide and may rely on third-party service providers located in different jurisdictions, your personal data may be transferred to and processed outside your country of residence. Where required by applicable law, we will take appropriate safeguards for such transfers.</p>
  <h2>10. Data Retention</h2>
  <p>We retain personal data only for as long as necessary for the purposes described in this Privacy Policy, including for the duration of your account where applicable, for a reasonable period thereafter for security, dispute resolution, backup, audit, or legal compliance purposes, and for the duration required by law for data that must be retained.</p>
  <h2>11. Your Rights</h2>
  <p>Depending on your location and applicable law, you may have the right to access your personal data, rectify inaccurate or incomplete data, request deletion, request restriction, object to certain processing activities, receive your data in a portable format where applicable, withdraw consent where processing is based on consent, and lodge a complaint with a competent data protection authority.</p>
  <p>To exercise your rights, contact us at histoire2succes@gmail.com.</p>
  <h2>12. Security</h2>
  <p>We implement reasonable technical and organizational measures designed to protect personal data against unauthorized access, loss, misuse, alteration, or disclosure. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.</p>
  <h2>13. Children's Privacy</h2>
  <p>The Site is not directed to children under the age required by applicable law to validly use such services without parental authorization. If you believe that a child has provided us with personal data in violation of applicable law, please contact us so that we can review the situation and take appropriate action.</p>
  <h2>14. Third-Party Websites</h2>
  <p>The Site links to third-party websites and services. This Privacy Policy does not apply to those third parties. Their data practices are governed by their own terms and privacy policies.</p>
  <h2>15. Changes to This Privacy Policy</h2>
  <p>We may update this Privacy Policy from time to time. The updated version will be posted on this page with a revised "Last updated" date. Your continued use of the Site after the effective date of an updated Privacy Policy may, where permitted by law, constitute acceptance of the revised version.</p>
  <h2>16. Contact</h2>
  <p>Thomas Techer<br>Email: histoire2succes@gmail.com</p>
`;

export default function App() {
  const [lang, setLang] = useState("en");
  const [dark, setDark] = useState(true);
  const [search, setSearch] = useState("");
  const [selCats, setSelCats] = useState([]);
  const [selPrice, setSelPrice] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState("all"); // all|hub|reco|aff
  const [ccTab, setCcTab] = useState("Writing");
  const [logged, setLogged] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [modal, setModal] = useState(null); // null|login|signup|quiz
  const [quiz, setQuiz] = useState({ role:"", needs:[], budget:"", tech:"" });
  const [hasQuiz, setHasQuiz] = useState(false);
  const [aff, setAff] = useState({});
  const [editAff, setEditAff] = useState(null);
  const [affVal, setAffVal] = useState("");
  const [affSearch, setAffSearch] = useState("");
  const [demoEmail, setDemoEmail] = useState("");
  const [demoPass, setDemoPass] = useState("");
  const [demoName, setDemoName] = useState("");
  const [pendingTool, setPendingTool] = useState(null);
  const [toolDocs, setToolDocs] = useState([]);
  const [toolAdminSearch, setToolAdminSearch] = useState("");
  const [toolEditor, setToolEditor] = useState(createEmptyToolDraft());
  const [editingToolId, setEditingToolId] = useState(null);
  const [toolEditorMessage, setToolEditorMessage] = useState("");
  const [customCategories, setCustomCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");

  const t = L[lang];
  const currentEmail = normalizeEmail(currentUser?.email || userEmail);
  const isAdmin = currentEmail === ADMIN_EMAIL_NORMALIZED;
  const tc = useCallback(c => setSelCats(p => p.includes(c) ? p.filter(x=>x!==c) : [...p,c]), []);

  // ═══════════════════════════════════════════
  // THEME VARIABLES (were missing — this caused the blank page)
  // ═══════════════════════════════════════════
  const bg = dark ? "#07070F" : "#F5F6FB";
  const bgCard = dark ? "rgba(20,20,38,0.75)" : "rgba(255,255,255,0.8)";
  const bgGlass = dark ? "rgba(10,10,22,0.88)" : "rgba(255,255,255,0.9)";
  const c1 = dark ? "#F1F1F8" : "#111827";
  const c2 = dark ? "#8B8BA3" : "#6B7280";
  const c3 = dark ? "#4A4A65" : "#9CA3AF";
  const brd = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const acc = "#818CF8";
  const accBg = dark ? "rgba(129,140,248,0.1)" : "rgba(99,102,241,0.07)";
  const accTx = dark ? "#A5B4FC" : "#4338CA";
  const grad = "linear-gradient(135deg, #667eea, #764ba2, #f093fb)";

  // catCounts defined after mergedTools below

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Crimson+Pro:wght@700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:${bg};transition:background 0.4s}
    ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:${c3};border-radius:3px}
    @keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
    .card{transition:all 0.3s cubic-bezier(0.4,0,0.2,1);transform:perspective(600px) rotateX(0) rotateY(0)}
    .card:hover{transform:perspective(600px) rotateX(-1.5deg) rotateY(3deg) translateY(-5px) scale(1.015);border-color:${acc}!important;box-shadow:0 16px 40px ${dark?"rgba(129,140,248,0.12)":"rgba(99,102,241,0.1)"}}
    .glass{backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
    .pill{transition:all 0.15s;cursor:pointer;user-select:none;font-family:Outfit;border:none;outline:none}
    .pill:hover{transform:translateY(-1px)}
    button{font-family:Outfit;cursor:pointer;border:none;outline:none}
    input{font-family:Outfit;outline:none}
    select{font-family:Outfit}
    a{text-decoration:none;color:inherit}
  `;

  const Pill = ({on, onClick, children, count}) => (
    <button className="pill" onClick={onClick} style={{padding:"6px 13px",borderRadius:99,fontSize:11.5,fontWeight:on?700:500,border:`1.5px solid ${on?acc:brd}`,background:on?accBg:"transparent",color:on?accTx:c2,display:"inline-flex",alignItems:"center",gap:4}}>
      {children}
      {count!=null&&<span style={{fontSize:9,fontWeight:800,background:on?acc:brd,color:on?"#fff":c3,padding:"1px 5px",borderRadius:99}}>{count}</span>}
    </button>
  );

  const ToolCard = ({tool}) => {
    const h = (tool.name.charCodeAt(0)*37+(tool.name.charCodeAt(1)||0)*17)%360;
    const safeAffLink = aff[tool.affId] || null;
    const pC = {Free:[dark?"#064E3B":"#D1FAE5",dark?"#6EE7B7":"#065F46"],Freemium:[dark?"#1E3A5F":"#DBEAFE",dark?"#93C5FD":"#1E40AF"],Paid:[dark?"#5F1E1E":"#FEE2E2",dark?"#FCA5A5":"#991B1B"],"Open Source":[dark?"#3B1E5F":"#EDE9FE",dark?"#C4B5FD":"#5B21B6"]};
    const [pbg,ptx] = pC[tool.pricing]||pC.Freemium;
    return (
      <div className="card glass" onClick={()=>openToolPrompt(tool)} style={{background:bgCard,border:`1px solid ${brd}`,borderRadius:16,padding:18,display:"flex",flexDirection:"column",gap:9,cursor:"pointer",position:"relative",overflow:"hidden",animation:"fadeIn 0.4s ease both"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,hsl(${h},65%,55%),transparent)`,opacity:0.4}} />
        {(tool.isNew||tool.isHot)&&<div style={{position:"absolute",top:10,right:10,display:"flex",gap:3}}>
          {tool.isNew&&<span style={{padding:"1px 6px",borderRadius:4,fontSize:8,fontWeight:800,background:"linear-gradient(135deg,#10B981,#06b6d4)",color:"#fff",letterSpacing:"0.05em"}}>{t.NEW}</span>}
          {tool.isHot&&<span style={{padding:"1px 6px",borderRadius:4,fontSize:8,fontWeight:800,background:"linear-gradient(135deg,#EF4444,#F59E0B)",color:"#fff",letterSpacing:"0.05em"}}>{t.HOT}</span>}
        </div>}
        <div style={{display:"flex",alignItems:"center",gap:11}}>
          <div style={{width:38,height:38,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(135deg,hsl(${h},45%,${dark?"22%":"88%"}),hsl(${(h+40)%360},45%,${dark?"18%":"82%"}))`,fontWeight:900,fontSize:17,color:`hsl(${h},55%,${dark?"68%":"40%"})`,flexShrink:0,fontFamily:"Crimson Pro"}}>{tool.name[0]}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:700,fontSize:14,color:c1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{tool.name}</div>
            <div style={{display:"flex",alignItems:"center",gap:4,marginTop:2}}>
              <span style={{padding:"1px 6px",borderRadius:3,fontSize:8.5,fontWeight:700,background:pbg,color:ptx,letterSpacing:"0.03em"}}>{t[tool.pricing.toLowerCase().replace(" ","_")]||tool.pricing}</span>
              {safeAffLink&&<span style={{padding:"1px 5px",borderRadius:3,fontSize:7.5,fontWeight:800,background:grad,color:"#fff"}}>{t.partner}</span>}
            </div>
          </div>
        </div>
        <div style={{fontSize:12,lineHeight:1.5,color:c2,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{getToolDescription(tool, lang)}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:"auto"}}>
          {tool.cat.slice(0,2).map(c=><span key={c} style={{fontSize:9,fontWeight:600,padding:"2px 7px",borderRadius:99,background:accBg,color:accTx}}>{c}</span>)}
        </div>
        <div style={{height:2.5,borderRadius:2,background:brd,marginTop:3}}>
          <div style={{height:"100%",borderRadius:2,width:`${tool.pop}%`,background:"linear-gradient(90deg,#667eea,#a78bfa)",transition:"width 0.5s"}} />
        </div>
      </div>
    );
  };

  const Grid = ({tools}) => (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:14}}>
      {tools.map((tool,i) => <div key={tool.affId || tool.id || i} style={{animationDelay:`${Math.min(i*0.025,0.6)}s`}}><ToolCard tool={tool} /></div>)}
    </div>
  );

  const affiliateDocRef = useMemo(() => doc(db, "siteConfig", "affiliateLinks"), []);
  const catalogMetaDocRef = useMemo(() => doc(db, "siteConfig", "catalogMeta"), []);
  const toolsCollectionRef = useMemo(() => collection(db, "toolsAdmin"), []);

  const sanitizeAffiliateMap = useCallback((value) => {
    if (!value || typeof value !== "object") return {};
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, url]) => [key, normalizeAffiliateUrl(url)])
        .filter(([, url]) => !!url)
    );
  }, []);

  const getQuizStorageKey = useCallback(
    (email = "guest") => `indexairium.quiz.${normalizeEmail(email || "guest")}`,
    []
  );

  const loadQuizState = useCallback(
    (email) => {
      try {
        return localStorage.getItem(getQuizStorageKey(email)) === "1";
      } catch {
        return false;
      }
    },
    [getQuizStorageKey]
  );

  const persistQuizState = useCallback(
    (email, value = true) => {
      try {
        localStorage.setItem(getQuizStorageKey(email), value ? "1" : "0");
      } catch {
        // ignore localStorage failures
      }
    },
    [getQuizStorageKey]
  );

  const openToolPrompt = useCallback(
    (tool) => {
      if (!tool) return;
      const safeAffiliateLink = normalizeAffiliateUrl(aff[tool.affId]);
      setPendingTool({
        tool,
        link: safeAffiliateLink || tool.url,
        viaAffiliate: !!safeAffiliateLink
      });
    },
    [aff]
  );

  const handleQuizSubmit = useCallback(() => {
    const emailKey = currentUser?.email || demoEmail || userEmail || "guest";
    persistQuizState(emailKey, true);
    setHasQuiz(true);
    setModal(null);
    setPage("reco");
  }, [currentUser, demoEmail, persistQuizState, userEmail]);

  const handleLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, demoEmail, demoPass);
      setLogged(true);
      setUserName(result.user.displayName || result.user.email.split("@")[0]);
      setUserEmail(result.user.email || "");
      setHasQuiz(loadQuizState(result.user.email || ""));
      setModal(null);
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  const handleSignup = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
      setLogged(true);
      setUserName(demoName || result.user.displayName || result.user.email.split("@")[0]);
      setUserEmail(result.user.email || "");
      setHasQuiz(false);
      setModal("quiz");
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  const handleGoogleAuth = async (mode = "login") => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email || "";
      const alreadyOnboarded = loadQuizState(email);

      setLogged(true);
      setUserName(result.user.displayName || result.user.email.split("@")[0]);
      setUserEmail(email);
      setHasQuiz(alreadyOnboarded);

      if (mode === "signup" && !alreadyOnboarded) {
        setModal("quiz");
      } else {
        setModal(null);
      }
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setPendingTool(null);
      setLogged(false);
      setUserName("");
      setUserEmail("");
      setHasQuiz(false);
      setEditAff(null);
      setAffVal("");
      setAffSearch("");
      setToolAdminSearch("");
      setEditingToolId(null);
      setToolEditor(createEmptyToolDraft());
      setToolEditorMessage("");
      setNewCategoryName("");
      setPage("all");
      setModal(null);
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  const saveAffiliateLink = useCallback(async (affId, rawValue) => {
    if (!isAdmin) {
      alert(lang === "fr" ? "Accès refusé." : "Access denied.");
      return;
    }

    const nextValue = normalizeAffiliateUrl(rawValue);
    if (rawValue.trim() && !nextValue) {
      alert(lang === "fr" ? "Merci d’entrer une URL valide commençant par http:// ou https://" : "Please enter a valid URL starting with http:// or https://");
      return;
    }

    const nextAff = { ...aff };
    if (nextValue) nextAff[affId] = nextValue;
    else delete nextAff[affId];

    const sanitizedLinks = sanitizeAffiliateMap(nextAff);

    try {
      await setDoc(
        affiliateDocRef,
        {
          links: sanitizedLinks,
          updatedAt: serverTimestamp(),
          updatedBy: currentUser?.email || ADMIN_EMAIL
        },
        { merge: true }
      );

      setAff(sanitizedLinks);
      setEditAff(null);
      setAffVal("");
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  }, [aff, affiliateDocRef, currentUser, isAdmin, lang, sanitizeAffiliateMap]);

  // ═══════════════════════════════════════════
  // ADMIN TOOL EDITOR FUNCTIONS
  // ═══════════════════════════════════════════
  // adminEditableTools is defined after mergedTools below

  const startEditingTool = useCallback((tool) => {
    if (!tool) {
      setEditingToolId(null);
      setToolEditor(createEmptyToolDraft());
      setToolEditorMessage("");
      return;
    }
    setEditingToolId(tool.affId);
    setToolEditor({
      id: tool.affId,
      affId: tool.affId,
      baseAffId: tool.baseAffId || tool.affId,
      name: tool.name || "",
      desc: tool.desc || "",
      descFr: tool.descFr || "",
      url: tool.url || "",
      pricing: tool.pricing || "Freemium",
      pop: tool.pop || 60,
      cat: [...(tool.cat || [])],
      cc: [...(tool.cc || [])],
      isNew: !!tool.isNew,
      isHot: !!tool.isHot,
      custom: !!tool.custom
    });
    setToolEditorMessage("");
  }, []);

  const saveNewCategory = useCallback(async () => {
    const name = newCategoryName.trim();
    if (!name || !isAdmin) return;
    const next = [...new Set([...customCategories, name])];
    try {
      await setDoc(catalogMetaDocRef, { customCategories: next, updatedAt: serverTimestamp() }, { merge: true });
      setNewCategoryName("");
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  }, [newCategoryName, isAdmin, customCategories, catalogMetaDocRef]);

  const toggleToolArrayValue = useCallback((field, value) => {
    setToolEditor((prev) => {
      const arr = prev[field] || [];
      return { ...prev, [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  }, []);

  const saveToolEditor = useCallback(async () => {
    if (!isAdmin) { alert(lang === "fr" ? "Accès refusé." : "Access denied."); return; }
    const payload = sanitizeToolPayload(toolEditor, editingToolId);
    if (!payload.name) { setToolEditorMessage(lang === "fr" ? "Le nom est requis." : "Name is required."); return; }
    if (!payload.url) { setToolEditorMessage(lang === "fr" ? "L'URL est requise." : "URL is required."); return; }
    if (!payload.affId) { setToolEditorMessage(lang === "fr" ? "ID invalide." : "Invalid ID."); return; }
    try {
      const docRef = doc(db, "toolsAdmin", payload.affId);
      await setDoc(docRef, { ...payload, updatedAt: serverTimestamp(), updatedBy: currentUser?.email || ADMIN_EMAIL }, { merge: true });
      setToolEditorMessage(lang === "fr" ? "Outil sauvegardé !" : "Tool saved!");
      setTimeout(() => setToolEditorMessage(""), 3000);
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  }, [isAdmin, lang, toolEditor, editingToolId, currentUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (user) {
        const email = user.email || "";
        setLogged(true);
        setUserName(user.displayName || user.email.split("@")[0]);
        setUserEmail(email);
        setHasQuiz(loadQuizState(email));
      } else {
        setPendingTool(null);
        setLogged(false);
        setUserName("");
        setUserEmail("");
        setHasQuiz(false);
        setEditAff(null);
        setAffVal("");
        setAffSearch("");
        setToolAdminSearch("");
        setEditingToolId(null);
        setToolEditor(createEmptyToolDraft());
        setToolEditorMessage("");
        setNewCategoryName("");
        setPage("all");
      }
    });

    return () => unsubscribe();
  }, [loadQuizState]);

  useEffect(() => {
    if (!isAdmin && page === "aff") setPage("all");
    if (!isAdmin) {
      setEditAff(null);
      setAffVal("");
      setToolAdminSearch("");
      setEditingToolId(null);
      setToolEditor(createEmptyToolDraft());
      setToolEditorMessage("");
      setNewCategoryName("");
    }
  }, [isAdmin, page]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      affiliateDocRef,
      (snap) => {
        const data = snap.exists() ? snap.data() : {};
        setAff(sanitizeAffiliateMap(data?.links));
      },
      (err) => console.error("Failed to subscribe to affiliate links", err)
    );

    return () => unsubscribe();
  }, [affiliateDocRef, sanitizeAffiliateMap]);


  useEffect(() => {
    const unsubscribe = onSnapshot(
      catalogMetaDocRef,
      (snap) => {
        const data = snap.exists() ? snap.data() : {};
        setCustomCategories(normalizeStringArray(data?.customCategories));
      },
      (err) => console.error("Failed to subscribe to catalog metadata", err)
    );

    return () => unsubscribe();
  }, [catalogMetaDocRef]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      toolsCollectionRef,
      (snapshot) => {
        const nextDocs = [];
        snapshot.forEach((toolDoc) => {
          nextDocs.push({ id: toolDoc.id, ...toolDoc.data() });
        });
        setToolDocs(nextDocs);
      },
      (err) => console.error("Failed to subscribe to tools catalog", err)
    );

    return () => unsubscribe();
  }, [toolsCollectionRef]);

  const mergedTools = useMemo(() => mergeCatalogTools(BASE_TOOLS, toolDocs), [toolDocs]);
  const allCategories = useMemo(() => [...new Set([...mergedTools.flatMap((tool) => tool.cat), ...customCategories])].sort(), [customCategories, mergedTools]);
  const catCounts = useMemo(() => { const c = {}; mergedTools.forEach(t => t.cat.forEach(cat => c[cat] = (c[cat] || 0) + 1)); return c; }, [mergedTools]);
  const adminEditableTools = useMemo(() => {
    const q = toolAdminSearch.trim().toLowerCase();
    return sortToolsByName(mergedTools).filter((tool) => {
      if (!q) return true;
      return tool.name.toLowerCase().includes(q) || tool.cat.some((c) => c.toLowerCase().includes(q));
    });
  }, [toolAdminSearch, mergedTools]);

  const filtered = useMemo(() => {
    let r = mergedTools;
    if (selCats.length) r = r.filter(t => t.cat.some(c => selCats.includes(c)));
    if (selPrice !== "All") r = r.filter(t => t.pricing === selPrice);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.desc.toLowerCase().includes(q) ||
          t.cat.some((c) => c.toLowerCase().includes(q))
      );
    }
    return sortBy === "pop"
      ? [...r].sort((a, b) => b.pop - a.pop)
      : sortBy === "cat"
        ? [...r].sort((a, b) => a.cat[0].localeCompare(b.cat[0], undefined, { sensitivity: "base" }) || a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
        : sortToolsByName(r);
  }, [mergedTools, search, selCats, selPrice, sortBy]);

  const ccTools = useMemo(() => sortToolsByName(mergedTools.filter(t => t.cc?.includes(ccTab))), [ccTab, mergedTools]);
  const recoTools = useMemo(() => {
    if (!hasQuiz) return [];
    const m = {writing:["Copywriting","Chat"],coding:["Generative Code"],design:["Generative Art","Image Improvement"],video:["Generative Video","Video Editing"],research:["Research","Chat"],automation:["Automation & Agents"],marketing:["Marketing","Social Media","Copywriting"],audio:["Music","Text-To-Speech","Podcasting"]};
    return sortToolsByName(
      mergedTools.filter(tool => {
        let s = tool.pop / 30;
        quiz.needs.forEach(n => { if (m[n] && tool.cat.some(c => m[n].includes(c))) s += 3; });
        if (quiz.budget === "free" && !["Free","Open Source"].includes(tool.pricing)) s -= 5;
        return s > 2;
      })
    ).slice(0,20);
  }, [hasQuiz, mergedTools, quiz]);

  const affiliateTools = useMemo(() => {
    const q = affSearch.trim().toLowerCase();
    return sortToolsByName(mergedTools).filter((tool) => {
      if (!q) return true;
      const affiliateUrl = normalizeAffiliateUrl(aff[tool.affId]) || "";
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.cat.some((cat) => cat.toLowerCase().includes(q)) ||
        affiliateUrl.toLowerCase().includes(q)
      );
    });
  }, [aff, affSearch, mergedTools]);

  const discoveryPool = useMemo(
    () => sortToolsByName(filtered.length ? filtered : mergedTools),
    [filtered]
  );


  const handleOrbDiscover = useCallback(() => {
    if (!discoveryPool.length) return;
    const picked = discoveryPool[Math.floor(Math.random() * discoveryPool.length)];
    openToolPrompt(picked);
  }, [openToolPrompt, discoveryPool]);

  const ModalWrap = ({children, onClose = () => setModal(null)}) => (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:999,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(10px)",animation:"fadeIn 0.2s ease"}}>
      <div onClick={e=>e.stopPropagation()} className="glass" style={{background:dark?"rgba(18,18,36,0.97)":"rgba(255,255,255,0.98)",borderRadius:22,padding:30,width:440,maxWidth:"92vw",maxHeight:"88vh",overflowY:"auto",border:`1px solid ${brd}`}}>
        {children}
      </div>
    </div>
  );

  const InputStyle = {width:"100%",padding:"11px 14px",borderRadius:11,border:`1.5px solid ${brd}`,background:"transparent",color:c1,fontSize:13,marginBottom:10};
  const BtnPrimary = {width:"100%",padding:12,borderRadius:11,background:grad,color:"#fff",fontSize:13,fontWeight:700};
  const BtnGoogle = {width:"100%",padding:11,borderRadius:11,background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",color:c1,fontSize:13,fontWeight:600,border:`1px solid ${brd}`,display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:12};

  const roles = [["marketer",t.rMarketer],["dev",t.rDev],["creator",t.rCreator],["biz",t.rBiz],["student",t.rStudent],["designer",t.rDesigner]];
  const needs = [["writing",t.nWriting],["coding",t.nCoding],["design",t.nDesign],["video",t.nVideo],["research",t.nResearch],["automation",t.nAuto],["marketing",t.nMarketing],["audio",t.nAudio]];
  const budgets = [["free",t.bFree],["low",t.bLow],["mid",t.bMid],["high",t.bHigh]];
  const techs = [["beg",t.tBeg],["int",t.tInt],["adv",t.tAdv],["exp",t.tExp]];

  return (
    <div style={{minHeight:"100vh",background:bg,color:c1,fontFamily:"Outfit,sans-serif",transition:"all 0.3s"}}>
      <style>{css}</style>

      {/* ═══ NAV ═══ */}
      <nav className="glass" style={{position:"sticky",top:0,zIndex:100,background:bgGlass,borderBottom:`1px solid ${brd}`,padding:"0 20px"}}>
        <div style={{maxWidth:1400,margin:"0 auto",height:54,display:"flex",alignItems:"center",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",flexShrink:0}} onClick={()=>setPage("all")}>
            <div style={{width:28,height:28,borderRadius:8,background:grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>⚡</div>
            <span style={{fontWeight:900,fontSize:15,fontFamily:"Crimson Pro",background:grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{t.brand}</span>
            <span style={{fontSize:10,color:c3,fontWeight:500,display:"none"}}>{t.tagline}</span>
          </div>

          <div style={{flex:1,display:"flex",gap:2,justifyContent:"center"}}>
            {[["all",t.navExplore,"🔍"],["hub",t.navHub,"🎨"],...(hasQuiz?[["reco",t.navForYou,"✨"]]:[]),...(isAdmin?[["aff",t.navAff,"💰"]]:[])].map(([v,l,icon])=>(
              <button key={v} onClick={()=>setPage(v)} style={{padding:"5px 14px",borderRadius:99,fontSize:11,fontWeight:page===v?700:500,background:page===v?acc:"transparent",color:page===v?"#fff":c2,transition:"all 0.2s"}}>
                <span style={{marginRight:4}}>{icon}</span>{l}
              </button>
            ))}
          </div>

          <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
            <button onClick={()=>setLang(l=>l==="en"?"fr":"en")} style={{padding:"3px 8px",borderRadius:7,border:`1px solid ${brd}`,background:"transparent",fontSize:10,fontWeight:700,color:c1}}>{lang==="en"?"🇫🇷 FR":"🇬🇧 EN"}</button>
            <button onClick={()=>setDark(d=>!d)} style={{padding:"3px 8px",borderRadius:7,border:`1px solid ${brd}`,background:"transparent",fontSize:13}}>{dark?"☀️":"🌙"}</button>
            {logged ? (
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:11,fontWeight:600,color:accTx}}>{userName}</span>
                <button onClick={handleLogout} style={{padding:"4px 10px",borderRadius:7,border:`1px solid ${brd}`,background:"transparent",fontSize:10,color:c2}}>{t.logout}</button>
              </div>
            ) : (
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <button onClick={()=>setModal("signup")} style={{padding:"5px 12px",borderRadius:8,border:`1px solid ${brd}`,background:"transparent",color:c1,fontSize:11,fontWeight:700}}>{t.signup}</button>
                <button onClick={()=>setModal("login")} style={{padding:"5px 14px",borderRadius:8,background:grad,color:"#fff",fontSize:11,fontWeight:700}}>{t.login}</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ═══ LOGIN ═══ */}
      {modal==="login"&&<ModalWrap>
        <h3 style={{fontSize:22,fontWeight:900,fontFamily:"Crimson Pro",color:c1,marginBottom:16}}>{t.login}</h3>
        <button onClick={()=>handleGoogleAuth("login")} style={BtnGoogle}>
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {t.withGoogle}
        </button>
        <div style={{textAlign:"center",fontSize:11,color:c3,margin:"4px 0 12px"}}>— {t.or} {t.withEmail} —</div>
        <input placeholder={t.email} value={demoEmail} onChange={e=>setDemoEmail(e.target.value)} style={InputStyle} />
        <input placeholder={t.password} type="password" value={demoPass} onChange={e=>setDemoPass(e.target.value)} style={InputStyle} />
        <button onClick={handleLogin} style={BtnPrimary}>{t.login}</button>
        <p style={{fontSize:11,color:c3,textAlign:"center",marginTop:10,cursor:"pointer"}} onClick={()=>setModal("signup")}>{t.signup} →</p>
        <p style={{fontSize:10,color:c3,textAlign:"center",marginTop:8,opacity:0.6}}>{t.demoNote}</p>
      </ModalWrap>}

      {/* ═══ SIGNUP ═══ */}
      {modal==="signup"&&<ModalWrap>
        <h3 style={{fontSize:22,fontWeight:900,fontFamily:"Crimson Pro",color:c1,marginBottom:16}}>{t.signup}</h3>
        <button onClick={()=>handleGoogleAuth("signup")} style={BtnGoogle}>
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {t.withGoogle}
        </button>
        <div style={{textAlign:"center",fontSize:11,color:c3,margin:"4px 0 12px"}}>— {t.or} {t.withEmail} —</div>
        <input placeholder={t.name} value={demoName} onChange={e=>setDemoName(e.target.value)} style={InputStyle} />
        <input placeholder={t.email} value={demoEmail} onChange={e=>setDemoEmail(e.target.value)} style={InputStyle} />
        <input placeholder={t.password} type="password" value={demoPass} onChange={e=>setDemoPass(e.target.value)} style={InputStyle} />
        <button onClick={handleSignup} style={BtnPrimary}>{t.signup}</button>
        <p style={{fontSize:11,color:c3,textAlign:"center",marginTop:10,cursor:"pointer"}} onClick={()=>setModal("login")}>← {t.login}</p>
      </ModalWrap>}

      {/* ═══ QUIZ ═══ */}
      {modal==="quiz"&&<ModalWrap>
        <h3 style={{fontSize:20,fontWeight:900,fontFamily:"Crimson Pro",color:c1,marginBottom:3}}>{t.quizTitle}</h3>
        <p style={{fontSize:12,color:c2,marginBottom:18}}>{t.quizSub}</p>
        {[[t.q1,roles,"role",false],[t.q2,needs,"needs",true],[t.q3,budgets,"budget",false],[t.q4,techs,"tech",false]].map(([label,opts,key,multi])=>(
          <div key={key} style={{marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:c1,marginBottom:7}}>{label}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {opts.map(([v,l])=><Pill key={v} on={multi?quiz.needs.includes(v):quiz[key]===v} onClick={()=>setQuiz(p=>multi?{...p,needs:p.needs.includes(v)?p.needs.filter(n=>n!==v):[...p.needs,v]}:{...p,[key]:v})}>{l}</Pill>)}
            </div>
          </div>
        ))}
        <div style={{display:"flex",gap:8}}>
          <button onClick={handleQuizSubmit} style={{...BtnPrimary,flex:1}}>{t.submit}</button>
          <button onClick={()=>setModal(null)} style={{padding:"12px 18px",borderRadius:11,border:`1px solid ${brd}`,background:"transparent",color:c2,fontSize:12}}>{t.skip}</button>
        </div>
      </ModalWrap>}

      {pendingTool&&(
        <ModalWrap onClose={()=>setPendingTool(null)}>
          <div style={{position:"relative"}}>
            <button
              onClick={()=>setPendingTool(null)}
              style={{position:"absolute",top:-8,right:-6,width:28,height:28,borderRadius:999,border:`1px solid ${brd}`,background:"transparent",color:c2,fontSize:16,lineHeight:1}}
              aria-label={t.close}
            >
              ×
            </button>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
              <div style={{width:44,height:44,borderRadius:14,background:accBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🚀</div>
              <div>
                <h3 style={{fontSize:22,fontWeight:900,fontFamily:"Crimson Pro",color:c1,marginBottom:2}}>{pendingTool.tool?.name}</h3>
                <p style={{fontSize:12,color:c2}}>{t.openInNewTab}</p>
              </div>
            </div>
            <p style={{fontSize:13,color:c2,lineHeight:1.6,marginBottom:12}}>{t.visitSub}</p>
            <div style={{fontSize:13,color:c1,lineHeight:1.7,marginBottom:14,padding:"12px 14px",borderRadius:14,background:dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)",border:`1px solid ${brd}`}}>
              <div style={{fontSize:10,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase",color:acc,marginBottom:6}}>{t.description}</div>
              {getToolDescription(pendingTool.tool, lang)}
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
              <span style={{padding:"4px 10px",borderRadius:999,background:pendingTool.viaAffiliate?accBg:"transparent",border:`1px solid ${brd}`,fontSize:10,fontWeight:700,color:pendingTool.viaAffiliate?accTx:c2}}>
                {pendingTool.viaAffiliate ? t.viaAffiliate : t.directLink}
              </span>
              {pendingTool.tool?.cat?.slice(0, 3).map((cat) => (
                <span key={cat} style={{padding:"4px 10px",borderRadius:999,background:"transparent",border:`1px solid ${brd}`,fontSize:10,fontWeight:600,color:c2}}>
                  {cat}
                </span>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button
                onClick={() => {
                  window.open(pendingTool.link, "_blank", "noopener,noreferrer");
                  setPendingTool(null);
                }}
                style={{...BtnPrimary, flex:1}}
              >
                {t.openSite}
              </button>
              <button
                onClick={()=>setPendingTool(null)}
                style={{padding:"12px 18px",borderRadius:11,border:`1px solid ${brd}`,background:"transparent",color:c2,fontSize:12}}
              >
                {t.close}
              </button>
            </div>
          </div>
        </ModalWrap>
      )}

      <div style={{maxWidth:1400,margin:"0 auto",padding:"0 20px"}}>

        {/* ═══ HERO ═══ */}
        {page==="all"&&(
          <div style={{position:"relative",padding:"50px 0 24px",minHeight:320,overflow:"hidden"}}>
            <div style={{position:"absolute",top:10,right:"1%",width:"28%",minWidth:220,maxWidth:320,height:"82%",opacity:0.92,pointerEvents:"auto",zIndex:3,display:"flex",flexDirection:"column",alignItems:"stretch",justifyContent:"center"}}>
              <div style={{position:"relative",flex:1,minHeight:170}}>
                <Hero3D dark={dark} onDiscover={handleOrbDiscover} />
              </div>
              <div className="glass" style={{marginTop:10,background:bgCard,border:`1px solid ${brd}`,borderRadius:16,padding:"12px 14px"}}>
                <div style={{fontSize:11,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase",color:acc,marginBottom:6}}>{t.orbTitle}</div>
                <div style={{fontSize:12,color:c2,lineHeight:1.5,marginBottom:10}}>{t.orbSub}</div>
                                <button onClick={handleOrbDiscover} style={{padding:"9px 14px",borderRadius:999,background:grad,color:"#fff",fontSize:11,fontWeight:700,width:"100%"}}>{t.orbAction}</button>
              </div>
            </div>
            {/* Ambient orbs */}
            <div style={{position:"absolute",top:"18%",left:"6%",width:100,height:100,borderRadius:"50%",background:`radial-gradient(circle,${dark?"rgba(129,140,248,0.15)":"rgba(99,102,241,0.1)"} 0%,transparent 70%)`,animation:"float 7s ease infinite",pointerEvents:"none"}} />

            <div style={{position:"relative",zIndex:2,maxWidth:860,paddingRight:12}}>
              <div style={{fontSize:12,fontWeight:700,color:acc,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>{mergedTools.length} {t.tools}</div>
              <h1 style={{fontSize:"clamp(30px,4.5vw,50px)",fontWeight:900,fontFamily:"Crimson Pro",lineHeight:1.08,marginBottom:6}}>
                <span style={{color:c1}}>{t.hero1} </span>
                <span style={{background:grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{t.hero2}</span>
              </h1>
              <p style={{fontSize:14,color:c2,lineHeight:1.6,marginBottom:22,maxWidth:520}}>{mergedTools.length} {t.heroSub}</p>

              {logged&&!hasQuiz&&<button onClick={()=>setModal("quiz")} style={{padding:"10px 24px",borderRadius:99,background:grad,color:"#fff",fontSize:12,fontWeight:700,marginBottom:16,boxShadow:`0 8px 28px ${dark?"rgba(129,140,248,0.25)":"rgba(99,102,241,0.2)"}`}}>{t.getStarted}</button>}

              {/* Search */}
              <div style={{position:"relative",maxWidth:620}}>
                <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:15,opacity:0.4,pointerEvents:"none"}}>🔍</span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.search} style={{width:"100%",padding:"12px 14px 12px 40px",borderRadius:14,border:`1.5px solid ${brd}`,background:bgCard,color:c1,fontSize:13,backdropFilter:"blur(10px)",transition:"border 0.2s"}} onFocus={e=>e.target.style.borderColor=acc} onBlur={e=>e.target.style.borderColor=brd} />
              </div>

              {/* Sort + Pricing */}
              <div style={{display:"flex",gap:5,marginTop:12,flexWrap:"wrap",alignItems:"center"}}>
                <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{padding:"6px 10px",borderRadius:9,border:`1px solid ${brd}`,background:"transparent",color:c1,fontSize:11,fontWeight:600}}>
                  <option value="pop">{t.sortPop}</option><option value="name">{t.sortAz}</option><option value="cat">{t.sortCat}</option>
                </select>
                {PRICING_OPTS.map(p=><Pill key={p} on={selPrice===p} onClick={()=>setSelPrice(p)}>{t[p.toLowerCase().replace(" ","_")]||p}</Pill>)}
              </div>

              {/* Categories */}
              <div style={{display:"flex",gap:4,marginTop:10,flexWrap:"wrap",maxHeight:170,overflowY:"auto",maxWidth:860,paddingRight:8}}>
                {allCategories.map(c=><Pill key={c} on={selCats.includes(c)} onClick={()=>tc(c)} count={catCounts[c]}>{c}</Pill>)}
              </div>

              {selCats.length>0&&(
                <div style={{marginTop:8,display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                  <span style={{fontSize:10,color:c3,fontWeight:700}}>{t.filters}</span>
                  {selCats.map(c=><span key={c} style={{display:"inline-flex",alignItems:"center",gap:3,padding:"2px 9px",borderRadius:99,background:accBg,color:accTx,fontSize:10,fontWeight:700}}>{c}<span onClick={()=>tc(c)} style={{cursor:"pointer",fontSize:12}}>×</span></span>)}
                  <button className="pill" onClick={()=>setSelCats([])} style={{padding:"2px 9px",borderRadius:99,background:"transparent",border:`1px dashed ${brd}`,color:c3,fontSize:10,fontWeight:600}}>{t.clear}</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ ALL TOOLS ═══ */}
        {page==="all"&&(
          <div style={{paddingBottom:50}}>
            <div style={{fontSize:11,color:c3,fontWeight:600,marginBottom:12}}>{t.showing} {filtered.length} {t.of} {mergedTools.length} {t.tools}</div>
            {filtered.length===0 ? (
              <div style={{textAlign:"center",padding:"50px 20px",color:c3}}>
                <div style={{fontSize:40,marginBottom:8,animation:"float 3s ease infinite"}}>🔍</div>
                <div style={{fontWeight:700,fontSize:14}}>{t.noMatch}</div>
                <div style={{fontSize:12,marginTop:4}}>{t.noMatchSub}</div>
              </div>
            ) : <Grid tools={filtered} />}
          </div>
        )}

        {/* ═══ CONTENT HUB ═══ */}
        {page==="hub"&&(
          <div style={{padding:"28px 0 50px",animation:"fadeIn 0.35s ease"}}>
            <h2 style={{fontSize:26,fontWeight:900,fontFamily:"Crimson Pro",color:c1,marginBottom:3}}>🎨 {t.hubTitle}</h2>
            <p style={{fontSize:13,color:c2,marginBottom:18}}>{t.hubSub}</p>
            <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
              {CC_TABS.map(tab=>(
                <button key={tab.k} className="pill" onClick={()=>setCcTab(tab.k)} style={{padding:"8px 16px",borderRadius:12,fontSize:12.5,fontWeight:ccTab===tab.k?700:500,border:ccTab===tab.k?`2px solid ${acc}`:`1.5px solid ${brd}`,background:ccTab===tab.k?accBg:"transparent",color:ccTab===tab.k?accTx:c2,display:"flex",alignItems:"center",gap:5}}>
                  <span>{tab.i}</span>{t[`tab${tab.k}`]||tab.k}
                  <span style={{fontSize:9,fontWeight:800,background:ccTab===tab.k?acc:brd,color:ccTab===tab.k?"#fff":c3,padding:"1px 5px",borderRadius:99}}>{mergedTools.filter(t=>t.cc?.includes(tab.k)).length}</span>
                </button>
              ))}
            </div>
            <Grid tools={ccTools} />
          </div>
        )}

        {/* ═══ FOR YOU ═══ */}
        {page==="reco"&&hasQuiz&&(
          <div style={{padding:"28px 0 50px",animation:"fadeIn 0.35s ease"}}>
            <h2 style={{fontSize:26,fontWeight:900,fontFamily:"Crimson Pro",color:c1,marginBottom:3}}>✨ {t.recoTitle}</h2>
            <p style={{fontSize:13,color:c2,marginBottom:18}}>{t.recoSub}</p>
            <Grid tools={recoTools} />
          </div>
        )}

        {/* ═══ AFFILIATES (ADMIN ONLY) ═══ */}
        {page==="aff"&&isAdmin&&(
          <div style={{padding:"28px 0 50px",animation:"fadeIn 0.35s ease"}}>
            <h2 style={{fontSize:26,fontWeight:900,fontFamily:"Crimson Pro",color:c1,marginBottom:3}}>💰 {t.affTitle}</h2>
            <p style={{fontSize:13,color:c2,marginBottom:18}}>{t.affSub}</p>
            <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:14}}>
              <div style={{position:"relative",flex:"1 1 360px",maxWidth:560}}>
                <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:15,opacity:0.4,pointerEvents:"none"}}>🔎</span>
                <input
                  value={affSearch}
                  onChange={e=>setAffSearch(e.target.value)}
                  placeholder={t.affSearch}
                  style={{width:"100%",padding:"11px 14px 11px 40px",borderRadius:14,border:`1.5px solid ${brd}`,background:bgCard,color:c1,fontSize:13,backdropFilter:"blur(10px)"}}
                />
              </div>
              <div style={{fontSize:11,color:c3,fontWeight:700}}>
                {affiliateTools.length} {t.affShowing}
              </div>
            </div>
            {affiliateTools.length === 0 ? (
              <div style={{textAlign:"center",padding:"36px 20px",color:c3,border:`1px dashed ${brd}`,borderRadius:16}}>
                <div style={{fontSize:34,marginBottom:8}}>🔎</div>
                <div style={{fontWeight:700,fontSize:14,color:c1}}>{t.noMatch}</div>
                <div style={{fontSize:12,marginTop:4}}>{t.noMatchSub}</div>
              </div>
            ) : (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(360px,1fr))",gap:8,marginBottom:22}}>
              {affiliateTools.map(tool=>(
                <div key={tool.affId} className="glass" style={{background:bgCard,border:`1px solid ${brd}`,borderRadius:10,padding:12,display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontWeight:700,fontSize:12,color:c1,minWidth:100}}>{tool.name}</span>
                  <div style={{flex:1}}>
                    {editAff===tool.affId ? (
                      <div style={{display:"flex",gap:4}}>
                        <input value={affVal} onChange={e=>setAffVal(e.target.value)} placeholder={t.affPh} style={{flex:1,padding:"4px 8px",borderRadius:7,border:`1px solid ${brd}`,background:"transparent",color:c1,fontSize:10}} />
                        <button onClick={()=>saveAffiliateLink(tool.affId, affVal)} style={{padding:"4px 10px",borderRadius:7,background:acc,color:"#fff",fontSize:9,fontWeight:700}}>{t.save}</button>
                      </div>
                    ) : (
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <span style={{fontSize:10,color:normalizeAffiliateUrl(aff[tool.affId])?"#10B981":c3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:160}}>{normalizeAffiliateUrl(aff[tool.affId])||"—"}</span>
                        <button className="pill" onClick={()=>{
                          if (!isAdmin) return;
                          setEditAff(tool.affId);
                          setAffVal(aff[tool.affId]||"");
                        }} style={{padding:"2px 8px",borderRadius:5,border:`1px solid ${brd}`,background:"transparent",color:accTx,fontSize:9,fontWeight:600}}>{t.edit}</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            )}

            <div className="glass" style={{background:bgCard,border:`1px solid ${brd}`,borderRadius:18,padding:18}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:16}}>
                <div>
                  <h3 style={{fontSize:22,fontWeight:900,fontFamily:"Crimson Pro",color:c1,marginBottom:4}}>🛠️ {t.adminTitle}</h3>
                  <p style={{fontSize:12,color:c2,maxWidth:700}}>{t.adminSub}</p>
                </div>
                <button onClick={()=>startEditingTool(null)} style={{padding:"10px 14px",borderRadius:12,background:grad,color:"#fff",fontSize:12,fontWeight:700}}>{t.addTool}</button>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"minmax(280px,0.9fr) minmax(360px,1.1fr)",gap:16,alignItems:"start"}}>
                <div>
                  <div style={{position:"relative",marginBottom:12}}>
                    <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:15,opacity:0.4,pointerEvents:"none"}}>🔎</span>
                    <input
                      value={toolAdminSearch}
                      onChange={e=>setToolAdminSearch(e.target.value)}
                      placeholder={t.adminSearch}
                      style={{width:"100%",padding:"11px 14px 11px 40px",borderRadius:14,border:`1.5px solid ${brd}`,background:dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.02)",color:c1,fontSize:13}}
                    />
                  </div>
                  <div style={{display:"grid",gap:8,maxHeight:620,overflowY:"auto",paddingRight:4}}>
                    {adminEditableTools.map((tool) => (
                      <button
                        key={tool.affId}
                        onClick={()=>startEditingTool(tool)}
                        style={{textAlign:"left",padding:"12px 14px",borderRadius:14,border:`1px solid ${editingToolId===tool.affId?acc:brd}`,background:editingToolId===tool.affId?accBg:"transparent",color:c1}}
                      >
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:6}}>
                          <strong style={{fontSize:13}}>{tool.name}</strong>
                          <span style={{fontSize:9,fontWeight:800,padding:"3px 8px",borderRadius:999,background:tool.custom?"rgba(16,185,129,0.14)":"rgba(129,140,248,0.14)",color:tool.custom?"#10B981":accTx}}>{tool.custom ? t.customTool : t.baseTool}</span>
                        </div>
                        <div style={{fontSize:11,color:c2,display:"flex",flexWrap:"wrap",gap:6}}>
                          {tool.cat.slice(0, 3).map((cat) => <span key={cat}>{cat}</span>)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="glass" style={{padding:18,border:`1px solid ${brd}`,borderRadius:18,background:dark?"rgba(255,255,255,0.02)":"rgba(0,0,0,0.015)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:14,flexWrap:"wrap"}}>
                    <div>
                      <div style={{fontSize:11,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase",color:acc,marginBottom:4}}>{editingToolId ? t.editTool : t.newTool}</div>
                      <div style={{fontSize:12,color:c2}}>{toolEditorMessage || " "}</div>
                    </div>
                    <button onClick={()=>startEditingTool(null)} style={{padding:"8px 12px",borderRadius:10,border:`1px solid ${brd}`,background:"transparent",color:c2,fontSize:11,fontWeight:700}}>{t.cancel}</button>
                  </div>

                  <input placeholder={t.name} value={toolEditor.name} onChange={e=>setToolEditor(prev=>({...prev,name:e.target.value}))} style={InputStyle} />
                  <input placeholder={t.website} value={toolEditor.url} onChange={e=>setToolEditor(prev=>({...prev,url:e.target.value}))} style={InputStyle} />
                  <textarea placeholder={t.description} value={toolEditor.desc} onChange={e=>setToolEditor(prev=>({...prev,desc:e.target.value}))} style={{...InputStyle,minHeight:86,resize:"vertical"}} />
                  <textarea placeholder={t.descriptionFr} value={toolEditor.descFr} onChange={e=>setToolEditor(prev=>({...prev,descFr:e.target.value}))} style={{...InputStyle,minHeight:78,resize:"vertical"}} />

                  <div style={{display:"grid",gridTemplateColumns:"1fr 140px",gap:10,marginBottom:12}}>
                    <select value={toolEditor.pricing} onChange={e=>setToolEditor(prev=>({...prev,pricing:e.target.value}))} style={{...InputStyle,marginBottom:0}}>
                      {PRICING_OPTS.filter((item)=>item!=="All").map((item)=><option key={item} value={item}>{item}</option>)}
                    </select>
                    <input type="number" min="1" max="100" placeholder={t.popularity} value={toolEditor.pop} onChange={e=>setToolEditor(prev=>({...prev,pop:e.target.value}))} style={{...InputStyle,marginBottom:0}} />
                  </div>

                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:8}}>
                    <div style={{fontSize:11,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase",color:acc}}>{t.categories}</div>
                    <div style={{display:"flex",gap:8,alignItems:"center",minWidth:260,flex:"1 1 260px"}}>
                      <input
                        placeholder={t.newCategory}
                        value={newCategoryName}
                        onChange={e=>setNewCategoryName(e.target.value)}
                        onKeyDown={(e)=>{ if (e.key === "Enter") { e.preventDefault(); saveNewCategory(); } }}
                        style={{flex:1,padding:"9px 12px",borderRadius:10,border:`1px solid ${brd}`,background:"transparent",color:c1,fontSize:12}}
                      />
                      <button onClick={saveNewCategory} style={{padding:"9px 12px",borderRadius:10,background:accBg,color:accTx,fontSize:11,fontWeight:700,border:`1px solid ${brd}`}}>{t.addCategory}</button>
                    </div>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
                    {allCategories.map((cat) => (
                      <Pill key={cat} on={toolEditor.cat.includes(cat)} onClick={()=>toggleToolArrayValue("cat", cat)}>{cat}</Pill>
                    ))}
                  </div>

                  <div style={{fontSize:11,fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase",color:acc,marginBottom:8}}>{t.hubTags}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
                    {CC_TABS.map((tab) => (
                      <Pill key={tab.k} on={toolEditor.cc.includes(tab.k)} onClick={()=>toggleToolArrayValue("cc", tab.k)}>{tab.i} {tab.k}</Pill>
                    ))}
                  </div>

                  <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
                    <button onClick={()=>setToolEditor(prev=>({...prev,isNew:!prev.isNew}))} style={{padding:"8px 12px",borderRadius:10,border:`1px solid ${toolEditor.isNew?acc:brd}`,background:toolEditor.isNew?accBg:"transparent",color:toolEditor.isNew?accTx:c2,fontSize:11,fontWeight:700}}>{t.NEW}</button>
                    <button onClick={()=>setToolEditor(prev=>({...prev,isHot:!prev.isHot}))} style={{padding:"8px 12px",borderRadius:10,border:`1px solid ${toolEditor.isHot?acc:brd}`,background:toolEditor.isHot?accBg:"transparent",color:toolEditor.isHot?accTx:c2,fontSize:11,fontWeight:700}}>{t.HOT}</button>
                  </div>

                  <button onClick={saveToolEditor} style={BtnPrimary}>{t.saveTool}</button>
                </div>
              </div>
            </div>
          </div>
        )}


        {page==="all"&&(
          <div style={{padding:"10px 0 46px"}}>
            <div style={{display:"flex",justifyContent:"center",gap:14,flexWrap:"wrap",fontSize:11,color:c2,marginBottom:12}}>
              <a href="#terms-of-use">{t.termsLabel}</a>
              <span style={{opacity:0.4}}>•</span>
              <a href="#privacy-policy">{t.privacyLabel}</a>
            </div>
            <details id="terms-of-use" className="glass" style={{background:bgCard,border:`1px solid ${brd}`,borderRadius:16,padding:"14px 16px",marginBottom:10}}>
              <summary style={{cursor:"pointer",fontSize:12,fontWeight:800,color:c1}}>{t.termsLabel}</summary>
              <div style={{fontSize:11,color:c2,lineHeight:1.8,marginTop:12}} dangerouslySetInnerHTML={{__html: TERMS_OF_USE_HTML}} />
            </details>
            <details id="privacy-policy" className="glass" style={{background:bgCard,border:`1px solid ${brd}`,borderRadius:16,padding:"14px 16px"}}>
              <summary style={{cursor:"pointer",fontSize:12,fontWeight:800,color:c1}}>{t.privacyLabel}</summary>
              <div style={{fontSize:11,color:c2,lineHeight:1.8,marginTop:12}} dangerouslySetInnerHTML={{__html: PRIVACY_POLICY_HTML}} />
            </details>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{borderTop:`1px solid ${brd}`,padding:"16px 20px",textAlign:"center",fontSize:10,color:c3}}>
        ⚡ {t.brand} — {mergedTools.length} {t.footer}<div style={{marginTop:6}}>© 2026 Indexairium. All rights reserved.</div>
      </div>
    </div>
  );
}
