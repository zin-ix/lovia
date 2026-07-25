export interface TemplateThemeConfig {
  bg: string
  paper: string
  paperShadow?: string
  accent: string
  accentHover?: string
  ink: string
  inkSoft: string
  line: string
  blossom?: string
  blossomDeep?: string
  fontHeading?: string
  fontBody?: string
  fontScript?: string
  particleType?: 'rose' | 'sakura' | 'stars' | 'hearts' | 'lavender' | 'none'
  envelopeStyle?: 'classic' | 'wax-seal' | 'ribbon' | 'vintage' | 'minimal'
  sealChar?: string
}

export interface TemplatePresetContent {
  relationshipType?: 'lover' | 'best-friend' | 'family' | 'crush' | 'friend' | 'colleague' | 'anyone'
  title?: string
  recipientName?: string
  whisper?: string
  greeting?: string
  heroEyebrow?: string
  heroTitle?: string
  heroSubtitle?: string
  letterEyebrow?: string
  letterBodyText?: string
  signoff?: string
  timelineTitle?: string
  timelineSubtitle?: string
  timelineItems?: { id: string; date: string; text: string }[]
  flipCardsTitle?: string
  flipCards?: { id: string; frontNumber: string; frontTitle: string; backText: string }[]
  closingText?: string
  closingScript?: string
}

export interface Template {
  id: string
  name: string
  slug: string
  description?: string
  category?: 'Romantic' | 'Birthday' | 'Long Distance' | 'Apology' | 'Gratitude' | 'Minimalist' | 'Special'
  tags?: string[]
  theme_config: TemplateThemeConfig
  preset_content?: TemplatePresetContent
  is_premium?: boolean
  created_at?: string
}
