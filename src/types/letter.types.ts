export type RelationshipType = 'lover' | 'best-friend' | 'family' | 'crush' | 'friend' | 'colleague' | 'anyone'

export interface TimelineItem {
  id: string
  date: string
  text: string
}

export interface PolaroidItem {
  id: string
  imageUrl: string
  caption: string
}

export interface FlipCardItem {
  id: string
  frontNumber: string
  frontTitle: string
  backText: string
}

export interface CountdownConfig {
  targetDate: string // YYYY-MM-DD
  label: string
}

export interface LetterContent {
  whisper?: string
  greeting?: string
  heroEyebrow?: string
  heroTitle?: string
  heroSubtitle?: string
  letterEyebrow?: string
  letterBodyParagraphs?: string[]
  signoff?: string
  timelineTitle?: string
  timelineSubtitle?: string
  timelineItems?: TimelineItem[]
  polaroids?: PolaroidItem[]
  flipCardsTitle?: string
  flipCards?: FlipCardItem[]
  countdown?: CountdownConfig
  closingText?: string
  closingScript?: string
  recipientType?: RelationshipType
  particleType?: 'rose' | 'sakura' | 'stars' | 'hearts' | 'lavender' | 'none'
  envelopeStyle?: 'classic' | 'wax-seal' | 'ribbon' | 'vintage' | 'minimal'
  sealChar?: string
  templateSlug?: string
  passcode?: string
}

export interface Letter {
  id: string
  user_id: string
  slug: string
  title: string
  recipient_name: string
  template_id?: string | null
  template_slug?: string
  recipient_type?: RelationshipType
  content: LetterContent
  music_url?: string
  music_title?: string
  expires_at?: string | null
  is_active: boolean
  view_count: number
  created_at: string
  updated_at: string
}
