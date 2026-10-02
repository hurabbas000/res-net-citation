export type CitationInputType = 'url' | 'doi' | 'pmid' | 'unknown';

export interface CitationInput {
  type: CitationInputType;
  value: string;
  normalized: string;
}

export interface ValidationResult {
  isValid: boolean;
  type: CitationInputType;
  normalized: string;
  error?: string;
}
