import { SourceMetadata, Author, SourceType } from '@/types/citation';
import { extractPMIDFromURL } from './citation-validator';

/**
 * PubMed API service for retrieving bibliographic metadata
 * Uses NCBI E-utilities API
 */

const NCBI_API_BASE = 'https://www.ncbi.nlm.nih.gov/entrez/eutils';
const NCBI_API_KEY = process.env.NCBI_API_KEY || '';
const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Fetches metadata from PubMed by PMID
 */
export async function fetchPubMedMetadata(pmid: string): Promise<SourceMetadata | null> {
  try {
    // Validate PMID is numeric only
    if (!/^\d{1,8}$/.test(pmid)) {
      console.error('Invalid PMID format:', pmid);
      return null;
    }

    // Step 1: Fetch article data from PubMed using efetch
    const fetchUrl = `${NCBI_API_BASE}/efetch.fcgi?db=pubmed&id=${pmid}&retmode=xml${NCBI_API_KEY ? `&api_key=${NCBI_API_KEY}` : ''}`;

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
      throw new Error(`PubMed API returned ${response.status}: ${response.statusText}`);
    }

    const xmlText = await response.text();

    // Limit response size to prevent DoS
    if (xmlText.length > 1000000) { // 1MB limit
      console.error('PubMed response too large');
      return null;
    }

    // Parse XML response
    const metadata = parsePubMedXML(xmlText, pmid);

    return metadata;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('PubMed API request timed out');
    } else {
      console.error('Error fetching PubMed metadata:', error);
    }
    return null;
  }
}

/**
 * Parses PubMed XML response into internal metadata format
 */
function parsePubMedXML(xmlText: string, pmid: string): SourceMetadata | null {
  try {
    // Simple XML parsing - in production, consider using a proper XML parser
    // For now, we'll use regex-based extraction for simplicity

    const metadata: SourceMetadata = {
      sourceType: 'journal-article',
      pmid: pmid,
    };

    // Extract title
    const titleMatch = xmlText.match(/<ArticleTitle[^>]*>(.*?)<\/ArticleTitle>/s);
    if (titleMatch) {
      metadata.title = decodeHTMLEntities(stripXMLTags(titleMatch[1]).trim());
    }

    // Extract journal name
    const journalMatch = xmlText.match(/<Title[^>]*>(.*?)<\/Title>/s);
    if (journalMatch) {
      metadata.journal = decodeHTMLEntities(stripXMLTags(journalMatch[1]).trim());
    }

    // Extract journal abbreviation
    const isoAbbrMatch = xmlText.match(/<ISOAbbreviation[^>]*>(.*?)<\/ISOAbbreviation>/s);
    if (isoAbbrMatch) {
      metadata.journalAbbreviation = decodeHTMLEntities(stripXMLTags(isoAbbrMatch[1]).trim());
    }

    // Extract publication date
    const pubDateMatch = xmlText.match(/<PubDate>(.*?)<\/PubDate>/s);
    if (pubDateMatch) {
      const pubDateBlock = pubDateMatch[1];

      // Try to extract year
      const yearMatch = pubDateBlock.match(/<Year>(\d{4})<\/Year>/);
      if (yearMatch) {
        metadata.year = parseInt(yearMatch[1], 10);
      }

      // Try to extract full date
      const dayMatch = pubDateBlock.match(/<Day>(\d{1,2})<\/Day>/);
      const monthMatch = pubDateBlock.match(/<Month>([A-Za-z]+)<\/Month>/);

      if (yearMatch && monthMatch && dayMatch) {
        metadata.publicationDate = `${yearMatch[1]} ${monthMatch[1]} ${dayMatch[1]}`;
      } else if (yearMatch && monthMatch) {
        metadata.publicationDate = `${yearMatch[1]} ${monthMatch[1]}`;
      } else if (yearMatch) {
        metadata.publicationDate = yearMatch[1];
      }
    }

    // Extract volume
    const volumeMatch = xmlText.match(/<Volume>(.*?)<\/Volume>/s);
    if (volumeMatch) {
      metadata.volume = stripXMLTags(volumeMatch[1]).trim();
    }

    // Extract issue
    const issueMatch = xmlText.match(/<Issue>(.*?)<\/Issue>/s);
    if (issueMatch) {
      metadata.issue = stripXMLTags(issueMatch[1]).trim();
    }

    // Extract pages
    const pagesMatch = xmlText.match(/<MedlinePgn>(.*?)<\/MedlinePgn>/s);
    if (pagesMatch) {
      metadata.pages = stripXMLTags(pagesMatch[1]).trim();
    }

    // Extract DOI
    const doiMatch = xmlText.match(/<ArticleId IdType="doi"[^>]*>(.*?)<\/ArticleId>/s);
    if (doiMatch) {
      metadata.doi = stripXMLTags(doiMatch[1]).trim();
    }

    // Extract authors
    const authorsBlock = xmlText.match(/<AuthorList[^>]*>(.*?)<\/AuthorList>/s);
    if (authorsBlock) {
      const authorMatches = authorsBlock[1].matchAll(/<Author[^>]*>(.*?)<\/Author>/gs);
      const authors: Author[] = [];

      for (const match of authorMatches) {
        const authorBlock = match[1];
        const author: Author = {};

        const lastNameMatch = authorBlock.match(/<LastName>(.*?)<\/LastName>/s);
        if (lastNameMatch) {
          author.lastName = stripXMLTags(lastNameMatch[1]).trim();
        }

        const firstNameMatch = authorBlock.match(/<ForeName>(.*?)<\/ForeName>/s);
        if (firstNameMatch) {
          author.firstName = stripXMLTags(firstNameMatch[1]).trim();
        }

        const initialsMatch = authorBlock.match(/<Initials>(.*?)<\/Initials>/s);
        if (initialsMatch) {
          author.initials = stripXMLTags(initialsMatch[1]).trim();
        }

        const collectiveNameMatch = authorBlock.match(/<CollectiveName>(.*?)<\/CollectiveName>/s);
        if (collectiveNameMatch) {
          author.fullName = stripXMLTags(collectiveNameMatch[1]).trim();
        }

        // Only add if we have at least a name
        if (author.lastName || author.fullName) {
          authors.push(author);
        }
      }

      if (authors.length > 0) {
        metadata.authors = authors;
      }
    }

    // Extract publisher (from JournalInfo if available)
    const publisherMatch = xmlText.match(/<PublisherName>(.*?)<\/PublisherName>/s);
    if (publisherMatch) {
      metadata.publisher = stripXMLTags(publisherMatch[1]).trim();
    }

    // Set URL
    metadata.url = `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;

    // Validate that we have at least some useful data
    if (!metadata.title && !metadata.journal) {
      return null;
    }

    return metadata;
  } catch (error) {
    console.error('Error parsing PubMed XML:', error);
    return null;
  }
}

/**
 * Strips XML tags from a string
 */
function stripXMLTags(str: string): string {
  return str.replace(/<[^>]+>/g, '');
}

/**
 * Decodes HTML entities - whitelist only safe entities
 */
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
