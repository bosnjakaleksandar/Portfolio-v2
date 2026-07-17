// Site-wide constants and content for the "Racing Cockpit" portfolio.
// Ported from the Claude Design mockup's `renderVals()` data object.

export const SITE = {
  name: 'Aleksandar Bošnjak',
  role: 'Frontend / Creative Developer',
  statement: 'Engineering fast, polished and memorable digital experiences.',
  email: 'bosnjakaleksandar02@gmail.com',
  linkedin: 'https://www.linkedin.com/in/bosnjakaleksandar',
  description:
    'Portfolio of Aleksandar Bošnjak, a frontend and creative developer specializing in motion-driven interfaces, performant WordPress builds, and modern Vue/React/Next.js applications.',
} as const;

// Design-tool "props" — fixed here instead of a runtime editor.
export const ACCENT = '#4ad9e8';
export type LapLength = 'SPRINT' | 'STANDARD' | 'ENDURANCE';
export const LAP_LENGTH: LapLength = 'STANDARD';
export const TRACK_VH: Record<LapLength, number> = {
  SPRINT: 1100,
  STANDARD: 1600,
  ENDURANCE: 2100,
};
export const GRAIN_ENABLED = true;

export const BOOT_LINES = [
  { k: 'AB-SYS v2.6', v: 'INIT' },
  { k: 'power unit ..........', v: 'OK' },
  { k: 'telemetry link ......', v: 'OK' },
  { k: 'render pipeline .....', v: 'OK' },
  { k: 'motion systems ......', v: 'OK' },
  { k: 'grip model ..........', v: 'OK' },
  { k: 'driver AB-02 ........', v: 'LINKED' },
];

export const DRIVER_ROWS = [
  { k: 'DRIVER', v: 'ALEKSANDAR BOŠNJAK' },
  { k: 'CLASS', v: 'FRONTEND / CREATIVE DEV' },
  { k: 'FOCUS', v: 'INTERFACE · MOTION · PERFORMANCE' },
  { k: 'PLATFORMS', v: 'VUE · REACT · NEXT.JS · WORDPRESS' },
  { k: 'STATUS', v: 'AVAILABLE FOR MISSIONS' },
];

export const MODULES = [
  { code: 'M-01', name: 'Interface Engineering', desc: 'Pixel-accurate, semantic, maintainable UI construction.', tech: 'HTML · CSS/SCSS · Tailwind · Bootstrap' },
  { code: 'M-02', name: 'Motion Systems', desc: 'Choreographed, purposeful animation tied to scroll and input.', tech: 'GSAP · ScrollTrigger · Swiper' },
  { code: 'M-03', name: 'Frontend Architecture', desc: 'Component systems, typed logic and state at scale.', tech: 'JavaScript · TypeScript · Vue · React · Next.js' },
  { code: 'M-04', name: 'Responsive Systems', desc: 'Fluid layouts engineered for every viewport and input.', tech: 'Grid · Flex · Container-first design' },
  { code: 'M-05', name: 'CMS Engineering', desc: 'Custom WordPress experiences, built from the theme up.', tech: 'WordPress · PHP' },
  { code: 'M-06', name: 'Performance Optimization', desc: 'Fast loads, GPU-friendly motion, lean asset pipelines.', tech: 'Vite · Lazy loading · Transforms' },
  { code: 'M-07', name: 'Development Workflow', desc: 'Versioned, containerized, repeatable delivery.', tech: 'Git · Docker' },
];

// TODO: replace placeholder project content with real case studies + screenshots.
export const PROJECTS = [
  { no: '01', name: '[Project Name — Run 01]', type: '[PROJECT TYPE]', role: 'Frontend Developer', brief: '[One-sentence overview of the project — what it is and who it is for.]', cond: '[The core constraint or problem this build had to solve.]', setup: '[The approach — structure, motion system, key technical decisions.]', tech: 'WordPress · PHP · GSAP', result: '[Outcome placeholder]', link: '#' },
  { no: '02', name: '[Project Name — Run 02]', type: '[PROJECT TYPE]', role: 'Frontend Developer', brief: '[One-sentence overview of the project — what it is and who it is for.]', cond: '[The core constraint or problem this build had to solve.]', setup: '[The approach — structure, motion system, key technical decisions.]', tech: 'Vue · Vite · SCSS', result: '[Outcome placeholder]', link: '#' },
  { no: '03', name: '[Project Name — Run 03]', type: '[PROJECT TYPE]', role: 'Frontend Developer', brief: '[One-sentence overview of the project — what it is and who it is for.]', cond: '[The core constraint or problem this build had to solve.]', setup: '[The approach — structure, motion system, key technical decisions.]', tech: 'Next.js · TypeScript · Tailwind', result: '[Outcome placeholder]', link: '#' },
  { no: '04', name: '[Project Name — Run 04]', type: '[PROJECT TYPE]', role: 'Frontend Developer', brief: '[One-sentence overview of the project — what it is and who it is for.]', cond: '[The core constraint or problem this build had to solve.]', setup: '[The approach — structure, motion system, key technical decisions.]', tech: 'React · Swiper · ScrollTrigger', result: '[Outcome placeholder]', link: '#' },
];

export const STEPS = [
  { no: 'P-1', name: 'Understand the problem', desc: 'Read the brief like track data — goals, audience, constraints.' },
  { no: 'P-2', name: 'Plan the structure', desc: 'Information architecture, components, content model.' },
  { no: 'P-3', name: 'Build the interface', desc: 'Semantic, responsive-first construction.' },
  { no: 'P-4', name: 'Create interaction & motion', desc: 'Choreographed animation with narrative purpose.' },
  { no: 'P-5', name: 'Test responsive behavior', desc: 'Every viewport, input and edge case on the grid.' },
  { no: 'P-6', name: 'Optimize performance', desc: 'Asset budgets, lazy loading, GPU-friendly transforms.' },
  { no: 'P-7', name: 'Deliver & refine', desc: 'Ship, measure, and tune the final experience.' },
];

export const REPORT = [
  { k: 'CHECKPOINTS', v: '09 / 09' },
  { k: 'RUNS INSPECTED', v: '04' },
  { k: 'SYSTEMS', v: 'NOMINAL' },
  { k: 'MOTION BUDGET', v: 'WITHIN LIMITS' },
];

// Scroll-progress fractions (0–1) each nav checkpoint jumps to.
export const NAV_CHECKPOINTS = [
  { label: 'IGNITION', f: 0.005 },
  { label: 'DRIVER', f: 0.105 },
  { label: 'PROFILE', f: 0.225 },
  { label: 'SYSTEMS', f: 0.335 },
  { label: 'RUN 01', f: 0.43 },
  { label: 'RUN 02', f: 0.525 },
  { label: 'RUN 03', f: 0.62 },
  { label: 'RUN 04', f: 0.715 },
  { label: 'PIT WALL', f: 0.81 },
  { label: 'FINISH', f: 0.97 },
];
