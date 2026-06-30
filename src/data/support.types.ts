export interface FaqItem {
  question: string;
  answer: string;
}

export interface PolicyBlock {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  orderedList?: string[];
}

export interface SupportSection {
  id: string;
  title: string;
  type: 'faq' | 'policy';
  intro: string;
  faq?: FaqItem[];
  blocks?: PolicyBlock[];
}

export interface SupportData {
  hero: {
    tagline: string;
    title: string;
    subtitle: string;
  };
  sections: SupportSection[];
}
