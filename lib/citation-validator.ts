import { CitationInputType, ValidationResult } from '@/types/citation';

/**
 * Extracts PMID from a PubMed URL
 * Only allows official PubMed domains
 */
export function extractPMIDFromURL(url: string): string | null {
  // Strict regex to only match official PubMed URLs
  // Accepts with or without trailing slash
  const pmidMatch = url.match(/^https?:\/\/(?:www\.)?pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)\/?$/);
  return pmidMatch ? pmidMatch[1] : null;
}

/**
 * Extracts PMCID from a PMC URL
 * Only allows official PMC domains
 */
export function extractPMCIDFromURL(url: string): string | null {
  // Strict regex to only match official PMC URLs
  const pmcidMatch = url.match(/^https?:\/\/(?:www\.)?pmc\.ncbi\.nlm\.nih\.gov\/articles\/(PMC\d+)/);
  return pmcidMatch ? pmcidMatch[1] : null;
}

const MAX_INPUT_LENGTH = 1000; // Prevent oversized inputs

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

  // Prevent oversized inputs
  if (trimmed.length > MAX_INPUT_LENGTH) {
    return {
      isValid: false,
      type: 'unknown',
      normalized: '',
      error: 'Input is too long (maximum 1000 characters)'
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
 * Accepts: "10.1234/example", "doi:10.1234/example", "https://doi.org/10.1234/example"
 */
function detectDOI(input: string): ValidationResult {
  // Trim whitespace first
  let normalized = input.trim();

  // Remove "doi:" prefix if present (with optional spaces)
  normalized = normalized.replace(/^doi:\s*/i, '');

  // If it's a DOI URL, extract the DOI
  if (normalized.startsWith('https://doi.org/') || normalized.startsWith('http://doi.org/')) {
    normalized = normalized.replace(/^https?:\/\/doi\.org\//i, '');
  }

  // Trim whitespace again
  normalized = normalized.trim();

  // Check if it's a valid DOI
  if (isValidDOI(normalized)) {
    return {
      isValid: true,
      type: 'doi',
      normalized: normalized
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
 * Only allows URLs from allowed domains or DOI URLs
 */
function detectURL(input: string): ValidationResult {
  try {
    // Only add protocol if input looks like a domain (contains dots)
    let url = input;
    if (!/^https?:\/\//i.test(url)) {
      // Check if it looks like a domain (has at least one dot and no spaces)
      if (/\./.test(url) && !/\s/.test(url)) {
        url = `https://${url}`;
      } else {
        // Not a URL-like string
        return {
          isValid: false,
          type: 'url',
          normalized: input,
          error: 'Invalid URL format'
        };
      }
    }

    const urlObj = new URL(url);

    // Validate that it has a proper hostname
    if (!urlObj.hostname || !urlObj.hostname.includes('.')) {
      return {
        isValid: false,
        type: 'url',
        normalized: input,
        error: 'Invalid URL format'
      };
    }

    // Block private/internal IP addresses to prevent SSRF
    const hostname = urlObj.hostname.toLowerCase();
    if (isPrivateIP(hostname)) {
      return {
        isValid: false,
        type: 'url',
        normalized: input,
        error: 'Private/internal addresses are not allowed'
      };
    }

    // Only allow specific domains for URL-based metadata retrieval
    // Currently only PubMed and PMC URLs are supported
    const allowedDomains = [
      'pubmed.ncbi.nlm.nih.gov',
      'pmc.ncbi.nlm.nih.gov',
      'ncbi.nlm.nih.gov',
      'doi.org'
    ];

    const isAllowedDomain = allowedDomains.some(domain =>
      hostname === domain || hostname.endsWith(`.${domain}`)
    );

    if (!isAllowedDomain) {
      // Check if it's a publisher URL and suggest using DOI
      const publisherHints: Record<string, string> = {
        'sciencedirect.com': 'ScienceDirect',
        'springer.com': 'Springer',
        'wiley.com': 'Wiley',
        'nature.com': 'Nature',
        'science.org': 'Science',
        'cell.com': 'Cell Press',
        'acs.org': 'ACS Publications',
        'ieee.org': 'IEEE',
        'tandfonline.com': 'Taylor & Francis',
        'sagepub.com': 'SAGE',
        'elsevier.com': 'Elsevier',
      };

      const publisherName = Object.entries(publisherHints).find(([domain]) =>
        hostname === domain || hostname.endsWith(`.${domain}`)
      )?.[1];

      if (publisherName) {
        return {
          isValid: false,
          type: 'url',
          normalized: input,
          error: `${publisherName} URLs are not supported. Please use the DOI instead. You can usually find the DOI on the article page.`
        };
      }

      return {
        isValid: false,
        type: 'url',
        normalized: input,
        error: `URLs from ${hostname} are not supported. Use PubMed, PMC, or DOI URLs.`
      };
    }

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

/**
 * Checks if a hostname is a private/internal IP address
 */
function isPrivateIP(hostname: string): boolean {
  // Check for localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    return true;
  }

  // Check for private IP ranges (simplified check)
  // In production, use a proper IP validation library
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipPattern.test(hostname)) {
    const parts = hostname.split('.').map(Number);
    const [first, second] = parts;

    // 10.0.0.0/8
    if (first === 10) return true;
    // 172.16.0.0/12
    if (first === 172 && second >= 16 && second <= 31) return true;
    // 192.168.0.0/16
    if (first === 192 && second === 168) return true;
  }

  return false;
}
