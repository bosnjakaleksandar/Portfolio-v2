import driverPhoto from "../assets/driver.jpg";
import acliImage from "../assets/projects/acli.png";
import menjacnicaGenesImage from "../assets/projects/menjacnicagenes.png";
import rezervisiTerminImage from "../assets/projects/rezervisitermin.png";

export const SITE = {
  name: "Aleksandar Bošnjak",
  role: "Frontend Developer",
  statement: "Engineering fast, polished and memorable digital experiences.",
  email: "bosnjakaleksandar02@gmail.com",
  linkedin: "https://www.linkedin.com/in/bosnjakaleksandar",
  language: "en",
  themeColor: "#07080a",
  ogImage: "/og-cover.png",
  description:
    "Portfolio of Aleksandar Bošnjak, a frontend developer specializing in motion-driven interfaces, performant WordPress custom themes, and modern Vue/React/Next.js applications.",
} as const;

export const PAGE = {
  screenLabel: "Cockpit",
  notFound: {
    title: "404 — Off track",
    description: "Page not found.",
    eyebrow: "TELEMETRY LOST // CHECKPOINT NOT FOUND",
    code: "404",
    message: "This checkpoint doesn't exist on the circuit.",
    linkLabel: "RETURN TO PIT LANE",
  },
} as const;

export const BOOT = {
  screenLabel: "Ignition",
  ariaLabel: "Ignition sequence",
  ready: "IGNITION READY",
  hint: "SCROLL TO IGNITE",
} as const;

export const HERO = {
  screenLabel: "Hero",
  ariaLabel: "Introduction",
  eyebrow: "DRIVER 02 // SYSTEM ONLINE",
} as const;

export const DRIVER = {
  screenLabel: "Driver profile",
  ariaLabel: "Driver profile",
  image: driverPhoto,
  imageAlt: "Portrait of Aleksandar Bošnjak",
  id: "DRIVER ID // AB-02",
  eyebrow: "DRIVER TELEMETRY",
  title: "Built for speed, tuned for detail.",
  description:
    "Frontend developer focused on refined interfaces, motion-driven layouts and performant systems. From custom WordPress builds to modern Vue and Next.js applications.",
} as const;

export const MODULES_CONTENT = {
  screenLabel: "System modules",
  ariaLabel: "System modules",
  eyebrow: "SYSTEM MODULES",
  online: "ONLINE",
  diagnostics: "ALL DIAGNOSTICS NOMINAL",
  active: "ON",
} as const;

export const RUNS = {
  screenLabel: "Featured runs",
  ariaLabel: "Featured projects",
  inspectionMode: "INSPECTION MODE",
  runLabel: "RUN",
  sessionBrief: "SESSION BRIEF",
  trackConditions: "TRACK CONDITIONS",
  systemSetup: "SYSTEM SETUP",
  roleLabel: "ROLE",
  enterLabel: "ENTER EXPERIENCE",
  displayLabel: "CENTRAL DISPLAY",
  feedLabel: "FEED",
  liveLabel: "LIVE",
  resultLabel: "RESULT",
} as const;

export const PROCESS = {
  screenLabel: "Pit wall process",
  ariaLabel: "Development process",
  eyebrow: "PIT WALL // BUILD SEQUENCE",
  title: "How every build runs.",
  standby: "STANDBY",
  clear: "CLEAR",
} as const;

export const REPORT_CONTENT = {
  screenLabel: "Performance report",
  ariaLabel: "Performance report",
  eyebrow: "PERFORMANCE REPORT",
  title: "Lap complete.",
} as const;

export const CONTACT = {
  screenLabel: "Contact / standby",
  ariaLabel: "Contact",
  eyebrow: "SYSTEM ENTERING STANDBY // NEXT MISSION AVAILABLE",
  title: "Ready for the next build.",
  primaryLabel: "START TRANSMISSION",
  secondaryLabel: "LINKEDIN",
  footerPrefix: "AB-02 SHUTTING DOWN",
  footerSuffix: "SEE YOU ON TRACK",
} as const;

export const HUD = {
  logoLabel: "Aleksandar Bošnjak logo",
  driverId: "AB-02",
  systemStatus: " // SYSTEM ACTIVE",
  speed: "SPD",
  gear: "GEAR",
  neutralGear: "N",
  lap: "LAP",
  trackPosition: "TRACK POS",
} as const;

export const CONTROLS = {
  soundLabel: "Toggle sound",
  motionFull: "MOTION FULL",
  motionReduced: "MOTION REDUCED",
  audio: {
    mp3: "/audio/engine-start.mp3",
    ogg: "/audio/engine-start.ogg",
  },
} as const;

export const NAV = {
  ariaLabel: "Lap checkpoints",
} as const;

export const CURSOR = {
  defaultLabel: "SELECT",
  actions: {
    toggle: "TOGGLE",
    send: "SEND",
    link: "LINK",
    module: "MODULE",
    jump: "JUMP",
    enter: "ENTER",
  },
} as const;

export const ACCENT = "#4ad9e8";
export type LapLength = "SPRINT" | "STANDARD" | "ENDURANCE";
export const LAP_LENGTH: LapLength = "STANDARD";
export const TRACK_VH: Record<LapLength, number> = {
  SPRINT: 1100,
  STANDARD: 1600,
  ENDURANCE: 2100,
};
export const GRAIN_ENABLED = true;

export const BOOT_LINES = [
  { k: "AB-SYS v2.6", v: "INIT" },
  { k: "power unit ..........", v: "OK" },
  { k: "telemetry link ......", v: "OK" },
  { k: "render pipeline .....", v: "OK" },
  { k: "motion systems ......", v: "OK" },
  { k: "grip model ..........", v: "OK" },
  { k: "driver AB-02 ........", v: "LINKED" },
];

export const DRIVER_ROWS = [
  { k: "DRIVER", v: "ALEKSANDAR SAŠA BOŠNJAK" },
  { k: "CLASS", v: "FRONTEND DEVELOPER" },
  { k: "BASE", v: "NOVI SAD · SERBIA" },
  { k: "FOCUS", v: "INTERACTION · PERFORMANCE · UI/UX" },
  { k: "PLATFORMS", v: "VUE · REACT · NEXT.JS · WORDPRESS" },
  { k: "STATUS", v: "AVAILABLE FOR MISSIONS" },
];

export const MODULES = [
  {
    code: "M-01",
    name: "Interface Engineering",
    desc: "Turning detailed designs into semantic, maintainable and production-ready interfaces.",
    tech: "HTML · CSS/SCSS · Tailwind · Bootstrap",
  },
  {
    code: "M-02",
    name: "Motion & Interaction",
    desc: "Purposeful animation systems connected to scroll, input and interface state.",
    tech: "GSAP · ScrollTrigger · Swiper",
  },
  {
    code: "M-03",
    name: "Frontend Architecture",
    desc: "Reusable component systems, typed application logic and scalable frontend structure.",
    tech: "JavaScript · TypeScript · Vue · React · Next.js",
  },
  {
    code: "M-04",
    name: "WordPress Engineering",
    desc: "Custom WordPress websites built from the theme layer instead of assembled from templates.",
    tech: "WordPress · PHP · ACF · WooCommerce",
  },
  {
    code: "M-05",
    name: "Performance & SEO",
    desc: "Fast loading, stable layouts, efficient animation and search-friendly page structure.",
    tech: "Vite · Lazy loading · Core Web Vitals · Technical SEO",
  },
  {
    code: "M-06",
    name: "Delivery Infrastructure",
    desc: "Hands-on project delivery from local containers and staging environments to production.",
    tech: "Git · Docker · Lando · Coolify · Cloudflare",
  },
];

export const PROJECTS = [
  {
    no: "01",
    name: "Rezerviši Termin",
    type: "SAAS BOOKING PLATFORM",
    role: "Fullstack Developer · Product Owner",
    brief:
      "A SaaS platform that allows service businesses to manage availability while their clients book appointments online.",
    cond: "Connect a polished public booking experience, business dashboards, authentication, notifications and production infrastructure into one coherent product.",
    setup:
      "Built the Next.js interface and reusable product system, integrated it with a Laravel API and Filament for CMS, and deployed the stack using Docker, Coolify, Redis queues, Cloudflare and transactional email.",
    tech: "Next.js · TypeScript · Laravel · Filament · Docker · Coolify · Redis",
    result:
      "A deployed product foundation covering public booking, business management, automated notifications and multi-plan SaaS functionality.",
    link: "#",
    image: rezervisiTerminImage,
    imageAlt: "Rezerviši Termin booking platform interface",
  },
  {
    no: "02",
    name: "A-CLI",
    type: "DEVELOPER TOOL",
    role: "Creator · Developer",
    brief:
      "A command-line workflow system designed to standardize project creation, diagnostics, updates and recurring development tasks.",
    cond: "Replace repetitive manual setup with a reliable workflow while keeping the experience fast, understandable and visually distinctive.",
    setup:
      "Designed a guided command structure with project creation, environment checks, update handling, branded terminal states and clear recovery flows for errors and incomplete setups.",
    tech: "JavaScript · Node.js · Git · Shell",
    result:
      "A faster and more repeatable way to create, inspect and maintain development projects through one consistent interface.",
    link: "https://bosnjakaleksandar.github.io/project-setup/",
    image: acliImage,
    imageAlt: "A-CLI developer tool interface",
  },
  {
    no: "03",
    name: "Menjačnica Genes",
    type: "BUSINESS WEBSITE",
    role: "Frontend Developer",
    brief:
      "A modern digital presence for Menjačnica Genes, a Novi Sad exchange office.",
    cond: "Present essential business and currency-exchange information with clarity, trust and strong usability across every device.",
    setup:
      "Built a lightweight responsive Astro experience with clear service paths, reusable content management and an SEO-conscious page structure.",
    tech: "Astro · TypeScript · SCSS · Technical SEO · Supabase",
    result:
      "A clear and credible business website that makes important information easier to find and strengthens the company’s digital presence.",
    link: "https://menjacnicagenes.rs",
    image: menjacnicaGenesImage,
    imageAlt: "Menjačnica Genes website interface",
  },
] as const;

export const PROJECT_COUNT = PROJECTS.length;

export const STEPS = [
  {
    no: "P-1",
    name: "Understand the mission",
    desc: "Define the business goal, audience, constraints and desired outcome.",
  },
  {
    no: "P-2",
    name: "Map the system",
    desc: "Plan the information architecture, page flow, components and content model.",
  },
  {
    no: "P-3",
    name: "Build the interface",
    desc: "Create semantic and reusable UI with responsive behavior built in from the start.",
  },
  {
    no: "P-4",
    name: "Engineer interaction",
    desc: "Add motion and feedback that support the narrative instead of distracting from it.",
  },
  {
    no: "P-5",
    name: "Test every viewport",
    desc: "Inspect layouts, interactions, inputs and edge cases across real screen sizes.",
  },
  {
    no: "P-6",
    name: "Optimize the system",
    desc: "Reduce asset cost, stabilize layouts and keep motion smooth and GPU-friendly.",
  },
  {
    no: "P-7",
    name: "Deploy and refine",
    desc: "Ship through staging, validate the production build and tune the final experience.",
  },
];

export const STEP_COUNT = STEPS.length;

const PROJECT_NAV_START = 0.43;
const PROJECT_NAV_END = 0.71;

export const NAV_CHECKPOINTS = [
  { label: "IGNITION", f: 0.005 },
  { label: "DRIVER", f: 0.105 },
  { label: "PROFILE", f: 0.225 },
  { label: "SYSTEMS", f: 0.335 },
  ...PROJECTS.map((project, index) => ({
    label: `${RUNS.runLabel} ${project.no}`,
    f:
      PROJECT_NAV_START +
      (index / Math.max(1, PROJECT_COUNT - 1)) * (PROJECT_NAV_END - PROJECT_NAV_START),
  })),
  { label: "PIT WALL", f: 0.81 },
  { label: "FINISH", f: 0.97 },
];

const CHECKPOINT_COUNT = String(NAV_CHECKPOINTS.length).padStart(2, "0");

export const REPORT = [
  { k: "CHECKPOINTS", v: `${CHECKPOINT_COUNT} / ${CHECKPOINT_COUNT}` },
  { k: "RUNS INSPECTED", v: String(PROJECT_COUNT).padStart(2, "0") },
  { k: "SYSTEMS", v: "NOMINAL" },
  { k: "MOTION BUDGET", v: "WITHIN LIMITS" },
];
