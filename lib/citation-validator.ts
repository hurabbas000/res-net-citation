import { CitationInputType, ValidationResult } from '@/types/citation';

/**
 * Detects and normalizes citation input (URL, DOI, or PMID)
 */
export function detectAndNormalizeInput(input: string): ValidationResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      isValid: false,
      type: 'unknown',
      normalized: '',
      error: 'Input cannot be empty'
    };
  }

  // Check for PMID
  const pmidResult = detectPMID(trimmed);
  if (pmidResult.isValid) {
    return pmidResult;
  }

  // Check for DOI
  const doiResult = detectDOI(trimmed);
  if (doiResult.isValid) {
    return doiResult;
  }

  // Check for URL
  const urlResult = detectURL(trimmed);
  if (urlResult.isValid) {
    return urlResult;
  }

  return {
    isValid: false,
    type: 'unknown',
    normalized: trimmed,
    error: 'Could not recognize input as URL, DOI, or PMID'
  };
}

/**
 * Detects and normalizes PMID
 * Accepts: "12345678", "PMID: 12345678", "pmid 12345678"
 */
function detectPMID(input: string): ValidationResult {
  // Remove PMID prefix if present
  const cleaned = input.replace(/^(?:PMID:?\s*)/i, '').trim();

  // PMID should be 1-8 digits
  const pmidRegex = /^\d{1,8}$/;

  if (pmidRegex.test(cleaned)) {
    return {
      isValid: true,
      type: 'pmid',
      normalized: cleaned
    };
  }

  return {
    isValid: false,
    type: 'pmid',
    normalized: cleaned,
    error: 'Invalid PMID format'
  };
}

/**
 * Detects and normalizes DOI
 * Accepts: "10.1234/example", "https://doi.org/10.1234/example"
 */
function detectDOI(input: string): ValidationResult {
  // If it's a DOI URL, extract the DOI
  if (input.startsWith('https://doi.org/') || input.startsWith('http://doi.org/')) {
    const doi = input.replace(/^https?:\/\/doi\.org\//i, '');
    if (isValidDOI(doi)) {
      return {
        isValid: true,
        type: 'doi',
        normalized: doi
      };
    }
  }

  // Check if it's a direct DOI
  if (isValidDOI(input)) {
    return {
      isValid: true,
      type: 'doi',
      normalized: input
    };
  }

  return {
    isValid: false,
    type: 'doi',
    normalized: input,
    error: 'Invalid DOI format'
  };
}

/**
 * Validates DOI format (e.g., 10.1234/example)
 */
function isValidDOI(doi: string): boolean {
  // DOI pattern: starts with 10. followed by publisher prefix and suffix
  const doiRegex = /^10\.\d{4,9}\/[^\s]+$/;
  return doiRegex.test(doi);
}

/**
 * Detects and normalizes URL
 */
function detectURL(input: string): ValidationResult {
  try {
    // Add protocol if missing
    let url = input;
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    const urlObj = new URL(url);

    return {
      isValid: true,
      type: 'url',
      normalized: urlObj.toString()
    };
  } catch {
    return {
      isValid: false,
      type: 'url',
      normalized: input,
      error: 'Invalid URL format'
    };
  }
}
