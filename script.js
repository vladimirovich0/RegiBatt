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
    title: "RegiBatt — подготовка данных для паспорта батареи",
    description: "RegiBatt помогает импортёрам и производителям батарей собрать документы, привести сведения к единой структуре, найти пробелы и подготовить понятный комплект данных для оформления паспорта батареи.",
    lightTheme: "Светлая тема",
    darkTheme: "Тёмная тема",
    enableLightTheme: "Включить светлую тему",
    enableDarkTheme: "Включить тёмную тему"
  },
  en: {
    title: "RegiBatt — battery passport data preparation",
    description: "RegiBatt helps battery importers and manufacturers collect documents, structure information, identify gaps, and prepare a clear data package for battery passport preparation.",
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
  heroEyebrow: "BATTERY PASSPORT DATA PREPARATION",
  heroTitle: "Battery passport data — without the chaos of files and spreadsheets",
  heroLead: "RegiBatt helps battery importers and manufacturers collect documents, organise information into one structure, identify gaps early, and prepare a clear data package for battery passport preparation.",
  assuranceOne: "Focused on batteries and the EU market",
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
  regulationText: "From this date, an electronic battery passport is required for light electric transport batteries, industrial batteries above 2 kWh, and electric vehicle batteries placed on the market or put into service in the EU.",
  regulationSource: "Regulation (EU) 2023/1542, Article 77",
  problemEyebrow: "THE PROBLEM",
  problemTitle: "A passport does not start with a QR code. It starts with reliable data.",
  problemLead: "When information is scattered across specifications, certificates, emails, and spreadsheets, teams spend their time finding the latest version and cross-checking it by hand.",
  problemOneTitle: "Scattered sources",
  problemOneText: "Files arrive from multiple suppliers, in different formats, and without a consistent naming standard.",
  problemTwoTitle: "Hidden gaps",
  problemTwoText: "Missing or conflicting information is discovered too late — just before data needs to be handed over.",
  problemThreeTitle: "Manual coordination",
  problemThreeText: "Compliance, quality, and operations teams maintain parallel spreadsheets and repeat the same checks.",
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
  stepFourText: "Prepare CSV or JSON for the next stage of battery passport preparation.",
  benefitsEyebrow: "SUBSCRIPTION VALUE",
  benefitsTitle: "Data preparation that scales with your product range",
  benefitsLead: "A subscription gives your team one clear process for every new battery — from the first file to a checked data package ready for handoff.",
  benefitOneTitle: "One structure for every model",
  benefitOneText: "Use one clear template to compare batteries and avoid manually reconciling spreadsheets.",
  benefitTwoTitle: "Reuse prepared fields",
  benefitTwoText: "Keep verified information and assemble data for the next model faster.",
  benefitThreeTitle: "Keep the source of every value",
  benefitThreeText: "Link data to documents and immediately see what needs clarification from a supplier.",
  benefitFourTitle: "Prepare new exports without manual assembly",
  benefitFourText: "Get structured CSV or JSON that is easier to pass into the next workflow.",
  audienceEyebrow: "WHO IT IS FOR",
  audienceTitle: "Built for teams responsible for bringing battery products to the EU market",
  audienceOneTag: "BATTERIES",
  audienceOneTitle: "Importers and manufacturers",
  audienceOneText: "Companies working with batteries for e-bikes, e-scooters, and other light means of transport.",
  audienceTwoTag: "QUALITY",
  audienceTwoTitle: "Compliance and quality specialists",
  audienceTwoText: "Specialists who need source traceability, complete information, and a controlled review process.",
  audienceThreeTag: "OPERATIONS",
  audienceThreeTitle: "Operations and supply chain teams",
  audienceThreeText: "Teams coordinating supplier data and responsible for product preparation timelines.",
  trustEyebrow: "CONTROL AND TRANSPARENCY",
  trustTitle: "Every data point, under control",
  trustLead: "Link data to its sources, find gaps quickly, and confirm the result before handoff.",
  trustOne: "A source for every important value",
  trustTwo: "Visible gaps and contradictions",
  trustThree: "Human confirmation of critical data",
  trustFour: "A structured result ready for handoff",
  faqEyebrow: "GOOD TO KNOW",
  faqTitle: "Answers about working with battery data",
  faqOneQuestion: "Which documents can be checked?",
  faqOneAnswer: "Specifications, certificates, spreadsheets, supplier documents, and internal materials containing battery data.",
  faqTwoQuestion: "What does the team receive at the end?",
  faqTwoAnswer: "A data map, field statuses, a list of gaps and contradictions, supplier questions, and structured CSV or JSON.",
  faqThreeQuestion: "Who is RegiBatt for?",
  faqThreeAnswer: "Manufacturers, importers, and teams collecting battery information and preparing it for products entering the EU market.",
  faqFourQuestion: "How does a subscription help with new batteries?",
  faqFourAnswer: "Reuse the prepared structure, compare versions, and prepare data faster for each next model.",
  ctaEyebrow: "START WITH ONE PRODUCT RANGE",
  ctaTitle: "Find out which data your battery is missing",
  ctaText: "Bring one document set and get a clear picture of what is ready, where contradictions exist, and what to request from a supplier.",
  ctaNote: "Start with one product range",
  footerDescription: "Clear document and data preparation for battery passports.",
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
