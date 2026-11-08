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

export type SourceType = 'journal-article' | 'book' | 'book-chapter' | 'conference-paper' | 'preprint' | 'website' | 'report' | 'thesis' | 'unknown';

export interface Author {
  firstName?: string;
  lastName?: string;
  initials?: string;
  fullName?: string;
}

export interface SourceMetadata {
  sourceType: SourceType;
  title?: string;
  authors?: Author[];
  journal?: string;
  journalAbbreviation?: string;
  publicationDate?: string;
  year?: number;
  volume?: string;
  issue?: string;
  pages?: string;
  articleNumber?: string;
  doi?: string;
  pmid?: string;
  publisher?: string;
  url?: string;
}
