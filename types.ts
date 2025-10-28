export interface Expert {
  id: string;
  name: string;
  university: string;
  department: string;
  gender: 'male' | 'female' | 'unknown';
  expertise: string;
  justification?: string;
  imageUrl?: string;
}

export interface ExpertDetails {
  publications: string[];
  projects: string[];
}

export interface Source {
  uri: string;
  title: string;
}

export interface Filters {
  university: string;
  department: string;
  keywords: string;
  country: string;
  state: string;
  zipCode: string;
}