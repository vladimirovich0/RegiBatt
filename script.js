const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = document.querySelector(".theme-toggle__icon");
const themeLabel = document.querySelector(".theme-toggle__text");
const themeColor = document.querySelector('meta[name="theme-color"]');
const metaDescription = document.querySelector('meta[name="description"]');
const languageButtons = document.querySelectorAll("[data-language]");
const translatedElements = document.querySelectorAll("[data-i18n]");
const translatedLabels = document.querySelectorAll("[data-i18n-aria-label]");

const pageCopy = {
  ru: {
    title: "RegiBatt — подготовка данных для цифровых паспортов батарей",
    description: "RegiBatt помогает импортёрам и производителям батарей собирать документы, структурировать данные, находить пробелы и готовить CSV/JSON для дальнейшей работы с цифровым паспортом батареи.",
    lightTheme: "Светлая тема",
    darkTheme: "Тёмная тема",
    enableLightTheme: "Включить светлую тему",
    enableDarkTheme: "Включить тёмную тему"
  },
  en: {
    title: "RegiBatt — battery passport data preparation",
    description: "RegiBatt helps battery importers and manufacturers collect documents, structure data, identify gaps, and prepare CSV/JSON for the next step in their digital battery passport workflow.",
    lightTheme: "Light theme",
    darkTheme: "Dark theme",
    enableLightTheme: "Enable light theme",
    enableDarkTheme: "Enable dark theme"
  }
};

const english = {
  skipLink: "Skip to content",
  navSolution: "Solution",
  navWorkflow: "How it works",
  navBenefits: "Business value",
  navFaq: "FAQ",
  requestDemo: "Request a demo",
  discussTask: "Discuss your workflow",
  heroEyebrow: "DATA PREPARATION FOR DPP",
  heroTitle: "Battery passport data — without the chaos of files and spreadsheets",
  heroLead: "RegiBatt helps importers and manufacturers of light means of transport (LMT) batteries collect documents, organise information into one structure, identify gaps early, and prepare data for the next step in their digital battery passport workflow.",
  assuranceOne: "Focused on LMT and the EU market",
  assuranceTwo: "Human-controlled workflow",
  assuranceThree: "CSV and JSON exports",
  workspaceLabel: "WORKSPACE",
  workspaceTitle: "Urban Motion range",
  statusInProgress: "In progress",
  dataCompleteness: "Data completeness",
  readinessHint: "Gaps are visible before an export is generated",
  previewDocuments: "Documents",
  previewDocumentsNote: "Collected in one place",
  previewStructure: "Data structure",
  previewStructureNote: "Fields follow one consistent format",
  previewGaps: "Gap review",
  previewGapsNote: "3 items need attention",
  exportReady: "Output for the next workflow step",
  regulationText: "From this date, an electronic battery passport is required for LMT batteries, industrial batteries above 2 kWh, and electric vehicle batteries placed on the market or put into service in the EU.",
  regulationSource: "Regulation (EU) 2023/1542, Article 77",
  problemEyebrow: "THE PROBLEM",
  problemTitle: "A passport does not start with a QR code. It starts with reliable data.",
  problemLead: "When information is scattered across specifications, certificates, emails, and spreadsheets, teams spend their time finding the latest version and cross-checking it by hand.",
  problemOneTitle: "Scattered sources",
  problemOneText: "Files arrive from multiple suppliers, in different formats, and without a consistent naming standard.",
  problemTwoTitle: "Hidden gaps",
  problemTwoText: "Missing or conflicting information is discovered too late — just before data needs to be handed over.",
  problemThreeTitle: "Manual coordination",
  problemThreeText: "Compliance, Quality, and Operations maintain parallel spreadsheets and repeat the same checks.",
  solutionEyebrow: "THE REGIBATT SOLUTION",
  solutionTitle: "One workspace between source documents and a usable data structure",
  solutionLead: "RegiBatt creates a transparent preparation workflow: each file is linked to a battery, each field can be reviewed, and every gap stays visible until it is resolved.",
  featureDocumentsTitle: "Documents under control",
  featureDocumentsText: "Keep source files, versions, and their connection to a specific battery in one protected company workspace.",
  featureDataTitle: "One data structure",
  featureDataText: "Move information from scattered sources into clear fields without endlessly copying spreadsheets.",
  featureValidationTitle: "Checks before export",
  featureValidationText: "See missing fields and format errors early, so the team can resolve them before handing over the result.",
  featureExportTitle: "Predictable output",
  featureExportText: "Generate versioned CSV and JSON with stable fields for downstream upload and integration.",
  workflowEyebrow: "A CLEAR WORKFLOW",
  workflowTitle: "From the first file to a structured export in four consecutive steps",
  stepOneTitle: "Create a battery record",
  stepOneText: "Collect the core information about a model or product range in one place.",
  stepTwoTitle: "Add data and documents",
  stepTwoText: "Connect specifications and supporting evidence to the relevant fields.",
  stepThreeTitle: "Review completeness",
  stepThreeText: "Get one list of gaps, resolve errors, and have the result confirmed by a person.",
  stepFourTitle: "Export the structure",
  stepFourText: "Prepare CSV or JSON for the next stage of your DPP workflow.",
  benefitsEyebrow: "BUSINESS VALUE",
  benefitsTitle: "Less manual work. More control over data readiness.",
  benefitsLead: "RegiBatt helps reduce operational waste where ordinary folders and spreadsheets stop being enough.",
  benefitOneTitle: "Stop searching for the latest version",
  benefitOneText: "The team works with one data set and its connected documents.",
  benefitTwoTitle: "Stop checking everything twice",
  benefitTwoText: "Statuses and change history preserve the context of completed work.",
  benefitThreeTitle: "Spot risks earlier",
  benefitThreeText: "Missing and incorrectly formatted fields are visible before the final export.",
  benefitFourTitle: "Reuse structured data",
  benefitFourText: "A structured result is easier to move into other systems and workflows.",
  audienceEyebrow: "WHO IT IS FOR",
  audienceTitle: "Built for teams responsible for bringing battery products to the EU market",
  audienceOneTitle: "Importers and manufacturers",
  audienceOneText: "Companies working with batteries for e-bikes, e-scooters, and other light means of transport.",
  audienceTwoTitle: "Compliance and Quality",
  audienceTwoText: "Specialists who need source traceability, complete information, and a controlled review process.",
  audienceThreeTitle: "Operations and Supply Chain",
  audienceThreeText: "Teams coordinating supplier data and responsible for product preparation timelines.",
  trustEyebrow: "CONTROL AND TRANSPARENCY",
  trustTitle: "Company data stays within its workspace boundaries",
  trustLead: "Access to batteries, documents, and exports is based on verified company membership and the user's assigned role.",
  trustOne: "Private document storage",
  trustTwo: "Owner, admin, editor, and viewer roles",
  trustThree: "History of significant changes",
  trustFour: "Access checks before download and export",
  faqEyebrow: "GOOD TO KNOW",
  faqTitle: "A clear view of what RegiBatt does",
  faqOneQuestion: "Does RegiBatt issue the digital battery passport?",
  faqOneAnswer: "RegiBatt prepares and checks the data structure, helps manage supporting documents, and generates CSV/JSON. It is not a government registry or certification body.",
  faqTwoQuestion: "Does the service guarantee legal compliance?",
  faqTwoAnswer: "No. RegiBatt helps identify gaps and technical errors, but the company's authorised specialist remains responsible for the final review and for the accuracy, completeness, and currency of the information.",
  faqThreeQuestion: "Which companies are the initial focus?",
  faqThreeAnswer: "The initial focus is EU-based LMT importers and manufacturers working with e-bikes, e-scooters, and other light electric transport categories.",
  faqFourQuestion: "Can RegiBatt connect to other systems?",
  faqFourAnswer: "CSV and JSON support data transfer. The external API will be released gradually as the relevant features and their documented contracts become ready.",
  ctaEyebrow: "START WITH ONE PRODUCT RANGE",
  ctaTitle: "Find out where your data already needs attention",
  ctaText: "Review one real document set, build a field map, and get a clear list of gaps — before they become an urgent problem.",
  ctaNote: "Start with one product range",
  footerDescription: "Structured data for confident preparation of your digital battery passport workflow.",
  footerScope: "Data preparation · Human control"
};

const englishLabels = {
  homeLabel: "RegiBatt — home",
  mainNavigationLabel: "Main navigation",
  languageLabel: "Language selection",
  assurancesLabel: "Key benefits",
  heroVisualLabel: "Data preparation workflow",
  regulationLabel: "Regulatory context"
};

translatedElements.forEach((element) => {
  element.dataset.ruText = element.textContent.trim();
});

translatedLabels.forEach((element) => {
  element.dataset.ruAriaLabel = element.getAttribute("aria-label") || "";
});

function readSetting(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function saveSetting(key, value) {
  try { localStorage.setItem(key, value); } catch { /* Storage is optional. */ }
}

const savedTheme = readSetting("regibatt.theme") || readSetting("theme");
const savedLanguage = readSetting("regibatt.language");

if (savedTheme === "light" || savedTheme === "dark") root.dataset.theme = savedTheme;
let currentLanguage = savedLanguage === "en" ? "en" : "ru";

function updateThemeToggle() {
  if (!themeToggle || !themeIcon || !themeLabel) return;
  const copy = pageCopy[currentLanguage];
  const isDark = root.dataset.theme === "dark";
  themeIcon.textContent = isDark ? "☀" : "☾";
  themeLabel.textContent = isDark ? copy.lightTheme : copy.darkTheme;
  themeToggle.setAttribute("aria-label", isDark ? copy.enableLightTheme : copy.enableDarkTheme);
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeColor?.setAttribute("content", isDark ? "#0F172A" : "#F8FAFC");
}

function setLanguage(language) {
  if (!pageCopy[language]) return;
  currentLanguage = language;
  root.lang = language;
  document.title = pageCopy[language].title;
  metaDescription?.setAttribute("content", pageCopy[language].description);

  translatedElements.forEach((element) => {
    const key = element.dataset.i18n;
    const value = language === "en" ? english[key] : element.dataset.ruText;
    if (value) element.textContent = value;
  });

  translatedLabels.forEach((element) => {
    const key = element.dataset.i18nAriaLabel;
    const value = language === "en" ? englishLabels[key] : element.dataset.ruAriaLabel;
    if (value) element.setAttribute("aria-label", value);
  });

  languageButtons.forEach((button) => {
    const isActive = button.dataset.language === language;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  updateThemeToggle();
}

themeToggle?.addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  saveSetting("regibatt.theme", root.dataset.theme);
  updateThemeToggle();
});

languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const language = button.dataset.language;
    saveSetting("regibatt.language", language);
    setLanguage(language);
  });
});

window.addEventListener("load", () => {
  if (!window.location.hash) return;

  const target = document.querySelector(window.location.hash);
  if (!target) return;

  const headerOffset = document.querySelector(".topbar")?.offsetHeight || 0;
  const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({ top: targetTop, behavior: "instant" });
});

setLanguage(currentLanguage);
