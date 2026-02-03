export interface Annotation {
  annotatorEmail: string;
  timestamp: string;
  scores: {
    regionalCulturalAuthenticity: number;
    folkArtStylisticFidelity: number;
    symbolicNarrativeDepth: number;
    visualCoherenceComposition: number;
    emotionalCulturalExpressiveness: number;
  };
  hallucination: boolean;
  done: boolean;
}

export interface ImageDocument {
  id: number;
  round_id: number;
  model: string;
  zone: string;
  status: string;
  image_path: string;
  timestamp_start: string;
  timestamp_end: string;
  duration_seconds: number;
  retries: number;
  error: string | null;
  annotations?: Annotation[];
}

export interface ScaleInfo {
  key: keyof Annotation['scores'];
  title: string;
  description: string;
  rubric: string[];
}

export const EVALUATION_SCALES: ScaleInfo[] = [
  {
    key: 'regionalCulturalAuthenticity',
    title: 'Regional Cultural Authenticity',
    description: 'Measures how accurately the image represents the folk culture, lifestyle, and material elements of the specific Bangladeshi division.',
    rubric: [
      '0 – No recognizable or relevant regional cultural elements are present.',
      '1 – Very weak or incorrect regional representation.',
      '2 – Limited regional cues with noticeable inaccuracies or generic elements.',
      '3 – Moderately accurate representation with some correct regional features.',
      '4 – Strong regional authenticity with minor inaccuracies.',
      '5 – Highly accurate, clear, and distinctive representation of the target division\'s culture.'
    ]
  },
  {
    key: 'folkArtStylisticFidelity',
    title: 'Folk Art Stylistic Fidelity',
    description: 'Evaluates how closely the image adheres to traditional Bangladeshi folk art aesthetics rather than modern or photorealistic styles.',
    rubric: [
      '0 – Entirely photorealistic or modern digital art style.',
      '1 – Minimal folk-art influence.',
      '2 – Partial folk stylization mixed with modern aesthetics.',
      '3 – Clear folk-art inspiration with some modern deviations.',
      '4 – Strong adherence to folk-art stylistic principles.',
      '5 – Highly faithful representation of traditional folk-art style.'
    ]
  },
  {
    key: 'symbolicNarrativeDepth',
    title: 'Symbolic and Narrative Depth',
    description: 'Measures the extent to which the image conveys folkloric narratives, symbolic meaning, rituals, myths, or culturally embedded storytelling.',
    rubric: [
      '0 – No symbolic or narrative content.',
      '1 – Very minimal or unclear symbolic meaning.',
      '2 – Weak narrative or symbolic elements.',
      '3 – Moderately clear symbolic or narrative content.',
      '4 – Strong narrative or symbolic representation.',
      '5 – Rich, layered, and culturally meaningful folkloric narrative.'
    ]
  },
  {
    key: 'visualCoherenceComposition',
    title: 'Visual Coherence and Artistic Composition',
    description: 'Assesses the overall visual quality, coherence, and compositional balance of the image, independent of cultural correctness.',
    rubric: [
      '0 – Visually incoherent, broken, or severely distorted.',
      '1 – Poor composition with major visual issues.',
      '2 – Noticeable compositional or visual flaws.',
      '3 – Acceptable visual coherence with minor issues.',
      '4 – Strong and well-balanced composition.',
      '5 – Excellent visual clarity, balance, and artistic coherence.'
    ]
  },
  {
    key: 'emotionalCulturalExpressiveness',
    title: 'Emotional and Cultural Expressiveness',
    description: 'Evaluates how effectively the image conveys emotional tone, atmosphere, or lived cultural experience associated with folk life.',
    rubric: [
      '0 – Emotionally flat or culturally disengaged.',
      '1 – Very weak emotional or cultural expression.',
      '2 – Limited emotional impact.',
      '3 – Moderate emotional or cultural resonance.',
      '4 – Strong emotional or cultural expressiveness.',
      '5 – Powerful and immersive emotional or cultural impact.'
    ]
  }
];
