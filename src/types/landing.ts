export type DemoPhase = 'idle' | 'scan' | 'enhance' | 'assemble' | 'done';

export interface NavCopy {
  logo: string;
  cta: string;
}

export interface HeroCopy {
  kicker: string;
  line1: string;
  line2Prefix: string;
  line2Accent: string;
  line2AccentVariants: string[];
  line2Suffix: string;
  line3: string;
  subtitle: string;
  cta: string;
  freeNote: string;
}

export type DemoPresetStyle = 'listing' | 'story' | 'highlight' | 'minimal';

export interface DemoPreset {
  name: string;
  platform: string;
  format: string;
  headline: string;
  context: string;
  chips: string[];
  price: string;
  cta: string;
  style: DemoPresetStyle;
}

export interface DemoCopy {
  title: string;
  subtitle: string;
  windowTitle: string;
  presetLabel: string;
  contextLabel: string;
  contextPlaceholder: string;
  buttonStart: string;
  buttonReplay: string;
  buttonBusy: string;
  sliderLabel: string;
  outputPackTitle: string;
  outputPackSubtitle: string;
  beforeLabel: string;
  afterLabel: string;
  statusScan: string;
  statusEnhance: string;
  statusAssemble: string;
  statusDone: string;
  platformLabel: string;
  frameLabel: string;
  badgeFeatured: string;
  badgeVerified: string;
  creativeText: string;
  presets: DemoPreset[];
  steps: {
    analysis: string;
    enhancement: string;
    layoutAssembly: string;
  };
}

export interface StatsCopy {
  title: string;
  leadValue: string;
  leadText: string;
  vacancyValue: string;
  vacancyText: string;
  proPhotoValue: string;
  proPhotoText: string;
  speedValue: string;
  speedText: string;
  impactTitle: string;
  impactBullets: string[];
}

export interface HowCopy {
  title: string;
  steps: Array<{
    number: string;
    title: string;
    description: string;
  }>;
}

export interface TrustCopy {
  title: string;
  subtitle: string;
  cards: Array<{
    title: string;
    value: string;
    text: string;
  }>;
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  popular: boolean;
  inverted: boolean;
}

export interface PricingCopy {
  badge: string;
  title: string;
  subtitle: string;
  popularLabel: string;
  plans: PricingPlan[];
}

export interface WaitlistCopy {
  title: string;
  subtitle: string;
  placeholder: string;
  button: string;
  success: string;
  privacy: string;
  consentLabel: string;
  privacyTitle: string;
  privacyPoints: string[];
  errorInvalidEmail: string;
  errorConsentRequired: string;
  errorTurnstileRequired: string;
  errorNetwork: string;
}

export interface FooterCopy {
  logo: string;
  copyright: string;
  telegramHandle: string;
  telegramUrl: string;
  email: string;
}

export interface LandingCopy {
  nav: NavCopy;
  hero: HeroCopy;
  demo: DemoCopy;
  stats: StatsCopy;
  how: HowCopy;
  trust: TrustCopy;
  pricing: PricingCopy;
  waitlist: WaitlistCopy;
  footer: FooterCopy;
}

export interface NavbarProps {
  copy: NavCopy;
  isScrolled: boolean;
}

export interface HeroProps {
  copy: HeroCopy;
}

export interface InteractiveDemoProps {
  copy: DemoCopy;
}

export interface ProblemBentoProps {
  copy: StatsCopy;
}

export interface HowItWorksProps {
  copy: HowCopy;
}

export interface TrustSignalsProps {
  copy: TrustCopy;
}

export interface PricingProps {
  copy: PricingCopy;
}

export interface WaitlistProps {
  copy: WaitlistCopy;
}

export interface FooterProps {
  copy: FooterCopy;
}
