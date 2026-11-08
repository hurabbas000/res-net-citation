import { SourceMetadata, Author, SourceType } from '@/types/citation';

/**
 * PMC (PubMed Central) API service for retrieving bibliographic metadata
 * Uses NCBI E-utilities API
 */

const NCBI_API_BASE = 'https://www.ncbi.nlm.nih.gov/entrez/eutils';
const NCBI_API_KEY = process.env.NCBI_API_KEY || '';
const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Fetches metadata from PMC by PMCID
 */
export async function fetchPMCMetadata(pmcid: string): Promise<SourceMetadata | null> {
  try {
    // Validate PMCID format
    if (!/^PMC\d+$/.test(pmcid)) {
      console.error('Invalid PMCID format:', pmcid);
      return null;
    }

    const fetchUrl = `${NCBI_API_BASE}/efetch.fcgi?db=pmc&id=${pmcid}&retmode=xml${NCBI_API_KEY ? `&api_key=${NCBI_API_KEY}` : ''}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Res.Net Citation Generator (res.net@example.com)',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`PMC API returned ${response.status}: ${response.statusText}`);
    }

    const xmlText = await response.text();

    // Limit response size to prevent DoS
    if (xmlText.length > 1000000) { // 1MB limit
      console.error('PMC response too large');
      return null;
    }

    const metadata = parsePMCXML(xmlText, pmcid);

    return metadata;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('PMC API request timed out');
    } else {
      console.error('Error fetching PMC metadata:', error);
    }
    return null;
  }
}

/**
 * Parses PMC XML response into internal metadata format
 */
function parsePMCXML(xmlText: string, pmcid: string): SourceMetadata | null {
  try {
    const metadata: SourceMetadata = {
      sourceType: 'journal-article',
      pmid: undefined,
    };

    const titleMatch = xmlText.match(/<article-title[^>]*>(.*?)<\/article-title>/s);
    if (titleMatch) {
      metadata.title = decodeHTMLEntities(stripXMLTags(titleMatch[1]).trim());
    }

    const journalMatch = xmlText.match(/<journal-title[^>]*>(.*?)<\/journal-title>/s);
    if (journalMatch) {
      metadata.journal = decodeHTMLEntities(stripXMLTags(journalMatch[1]).trim());
    }

    const isoAbbrMatch = xmlText.match(/<abbrev-journal-title[^>]*>(.*?)<\/abbrev-journal-title>/s);
    if (isoAbbrMatch) {
      metadata.journalAbbreviation = decodeHTMLEntities(stripXMLTags(isoAbbrMatch[1]).trim());
    }

    const pubDateMatch = xmlText.match(/<pub-date[^>]*>.*?<year>(\d{4})<\/year>.*?<\/pub-date>/s);
    if (pubDateMatch) {
      metadata.year = parseInt(pubDateMatch[1], 10);
    }

    const volumeMatch = xmlText.match(/<volume>(.*?)<\/volume>/s);
    if (volumeMatch) {
      metadata.volume = stripXMLTags(volumeMatch[1]).trim();
    }

    const issueMatch = xmlText.match(/<issue>(.*?)<\/issue>/s);
    if (issueMatch) {
      metadata.issue = stripXMLTags(issueMatch[1]).trim();
    }

    const pagesMatch = xmlText.match(/<elocation-id[^>]*>(.*?)<\/elocation-id>/s);
    if (pagesMatch) {
      metadata.pages = stripXMLTags(pagesMatch[1]).trim();
    }

    const doiMatch = xmlText.match(/<article-id[^>]*pub-id-type="doi"[^>]*>(.*?)<\/article-id>/s);
    if (doiMatch) {
      metadata.doi = stripXMLTags(doiMatch[1]).trim();
    }

    const pmidMatch = xmlText.match(/<article-id[^>]*pub-id-type="pmid"[^>]*>(.*?)<\/article-id>/s);
    if (pmidMatch) {
      metadata.pmid = stripXMLTags(pmidMatch[1]).trim();
    }

    const authorsBlock = xmlText.match(/<contrib-group[^>]*>(.*?)<\/contrib-group>/s);
    if (authorsBlock) {
      const authorMatches = authorsBlock[1].matchAll(/<contrib[^>]*>.*?<name[^>]*>.*?<surname>(.*?)<\/surname>.*?<given-names>(.*?)<\/given-names>.*?<\/name>.*?<\/contrib>/gs);
      const authors: Author[] = [];

      for (const match of authorMatches) {
        const author: Author = {
          lastName: stripXMLTags(match[1]).trim(),
          firstName: stripXMLTags(match[2]).trim(),
        };

        if (author.lastName || author.firstName) {
          authors.push(author);
        }
      }

      if (authors.length > 0) {
        metadata.authors = authors;
      }
    }

    const publisherMatch = xmlText.match(/<publisher-name>(.*?)<\/publisher-name>/s);
    if (publisherMatch) {
      metadata.publisher = stripXMLTags(publisherMatch[1]).trim();
    }

    metadata.url = `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcid}/`;

    if (!metadata.title && !metadata.journal) {
      return null;
    }

    return metadata;
  } catch (error) {
    console.error('Error parsing PMC XML:', error);
    return null;
  }
}

function stripXMLTags(str: string): string {
  return str.replace(/<[^>]+>/g, '');
}

function decodeHTMLEntities(str: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&nbsp;': ' ',
  };

  // Only decode known safe entities, leave others as-is
  return str.replace(/&(amp|lt|gt|quot|apos|nbsp);/gi, (match) => entities[match] || match);
}
