import { SourceMetadata, Author, SourceType } from '@/types/citation';

/**
 * Crossref API service for retrieving bibliographic metadata
 * Uses Crossref REST API
 */

const CROSSREF_API_BASE = 'https://api.crossref.org/works';
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RESPONSE_SIZE = 1000000; // 1MB limit

/**
 * Normalizes DOI to canonical format
 * Accepts: "10.xxxx/xxxxx", "doi:10.xxxx/xxxxx", "https://doi.org/10.xxxx/xxxxx"
 */
export function normalizeDOI(doi: string): string {
  // Trim whitespace first
  let normalized = doi.trim();

  // Remove "doi:" prefix if present (with optional spaces)
  normalized = normalized.replace(/^doi:\s*/i, '');

  // Remove https://doi.org/ or http://doi.org/ prefix if present
  normalized = normalized.replace(/^https?:\/\/doi\.org\//i, '');

  // Trim whitespace again
  normalized = normalized.trim();

  return normalized;
}

/**
 * Fetches metadata from Crossref by DOI
 */
export async function fetchCrossrefMetadata(doi: string): Promise<SourceMetadata | null> {
  try {
    const normalizedDOI = normalizeDOI(doi);

    // Validate DOI format before making request
    if (!/^10\.\d{4,9}\/[^\s]+$/.test(normalizedDOI)) {
      console.error('Invalid DOI format:', normalizedDOI);
      return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(`${CROSSREF_API_BASE}/${encodeURIComponent(normalizedDOI)}`, {
      headers: {
        'User-Agent': 'Res.Net Citation Generator (res.net@example.com)',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        console.error('DOI not found in Crossref');
        return null;
      }
      throw new Error(`Crossref API returned ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();

    // Limit response size to prevent DoS
    if (text.length > MAX_RESPONSE_SIZE) {
      console.error('Crossref response too large');
      return null;
    }

    const data = JSON.parse(text);

    if (!data || data.status !== 'ok' || !data.message) {
      console.error('Invalid Crossref API response');
      return null;
    }

    const metadata = parseCrossrefResponse(data.message, normalizedDOI);

    return metadata;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Crossref API request timed out');
    } else {
      console.error('Error fetching Crossref metadata:', error);
    }
    return null;
  }
}

/**
 * Parses Crossref JSON response into internal metadata format
 */
function parseCrossrefResponse(message: unknown, doi: string): SourceMetadata | null {
  try {
    const msg = message as Record<string, unknown>;
    const metadata: SourceMetadata = {
      sourceType: typeof msg.type === 'string' ? determineSourceType(msg.type) : 'journal-article',
      doi: doi,
    };

    // Extract title
    if (msg.title && Array.isArray(msg.title) && msg.title.length > 0 && typeof msg.title[0] === 'string') {
      metadata.title = msg.title[0];
    }

    // Extract authors
    if (msg.author && Array.isArray(msg.author) && msg.author.length > 0) {
      metadata.authors = msg.author.map((crossrefAuthor: unknown) => {
        const author: Author = {};
        const authorData = crossrefAuthor as Record<string, unknown>;

        if (authorData.given && typeof authorData.given === 'string') {
          author.firstName = authorData.given;
        }

        if (authorData.family && typeof authorData.family === 'string') {
          author.lastName = authorData.family;
        }

        return author;
      }).filter((author: Author) => author.lastName || author.firstName);
    }

    // Extract journal/container title
    if (msg['container-title'] && Array.isArray(msg['container-title']) && msg['container-title'].length > 0 && typeof msg['container-title'][0] === 'string') {
      metadata.journal = msg['container-title'][0];
    }

    // Extract journal abbreviation (short-container-title)
    if (msg['short-container-title'] && Array.isArray(msg['short-container-title']) && msg['short-container-title'].length > 0 && typeof msg['short-container-title'][0] === 'string') {
      metadata.journalAbbreviation = msg['short-container-title'][0];
    }

    // Extract publication date
    if (msg.published && typeof msg.published === 'object' && msg.published !== null) {
      const published = msg.published as Record<string, unknown>;
      if (published['date-parts'] && Array.isArray(published['date-parts']) && published['date-parts'].length > 0) {
        const dateParts = published['date-parts'][0];
        if (Array.isArray(dateParts) && dateParts.length > 0 && typeof dateParts[0] === 'number') {
          metadata.year = dateParts[0];
          if (dateParts.length > 1) {
            const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December'];
            const month = dateParts[1];
            if (dateParts.length > 2) {
              metadata.publicationDate = `${dateParts[0]} ${monthNames[month] || month} ${dateParts[2]}`;
            } else {
              metadata.publicationDate = `${dateParts[0]} ${monthNames[month] || month}`;
            }
          } else {
            metadata.publicationDate = String(dateParts[0]);
          }
        }
      }
    }

    // Extract volume
    if (msg.volume && typeof msg.volume === 'string') {
      metadata.volume = msg.volume;
    }

    // Extract issue
    if (msg.issue && typeof msg.issue === 'string') {
      metadata.issue = msg.issue;
    }

    // Extract pages
    if (msg.page && typeof msg.page === 'string') {
      metadata.pages = msg.page;
    }

    // Extract article number
    if (msg.article_number && typeof msg.article_number === 'string') {
      metadata.articleNumber = msg.article_number;
    }

    // Extract publisher
    if (msg.publisher && typeof msg.publisher === 'string') {
      metadata.publisher = msg.publisher;
    }

    // Extract URL
    if (msg.URL && typeof msg.URL === 'string') {
      metadata.url = msg.URL;
    }

    // Validate that we have at least some useful data
    if (!metadata.title && !metadata.journal) {
      return null;
    }

    return metadata;
  } catch (error) {
    console.error('Error parsing Crossref response:', error);
    return null;
  }
}

/**
 * Determines source type from Crossref type field
 */
function determineSourceType(crossrefType: string): SourceType {
  const typeMap: Record<string, SourceType> = {
    'journal-article': 'journal-article',
    'proceedings-article': 'conference-paper',
    'book': 'book',
    'book-chapter': 'book-chapter',
    'monograph': 'book',
    'reference-book': 'book',
    'dataset': 'unknown',
    'posted-content': 'preprint',
  };

  return typeMap[crossrefType] || 'unknown';
}
