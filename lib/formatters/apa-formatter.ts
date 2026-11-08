import { SourceMetadata, Author } from '@/types/citation';

export interface APAFormattedCitation {
  reference: string;
  inText: string;
}

/**
 * Formats source metadata according to APA 7 citation style
 */
export function formatAPACitation(metadata: SourceMetadata): APAFormattedCitation {
  const reference = formatAPAReference(metadata);
  const inText = formatAPAInTextCitation(metadata);

  return {
    reference,
    inText,
  };
}

/**
 * Formats the full APA 7 reference
 */
function formatAPAReference(metadata: SourceMetadata): string {
  const parts: string[] = [];

  // Authors
  const authors = formatAPAAuthors(metadata.authors);
  if (authors) {
    parts.push(authors);
  }

  // Year in parentheses
  if (metadata.year) {
    parts.push(`(${metadata.year})`);
  }

  // Title in sentence case
  if (metadata.title) {
    parts.push(metadata.title);
  }

  // Journal name in title case (italicized in HTML, but we'll use plain text here)
  if (metadata.journal) {
    parts.push(metadata.journal);
  }

  // Volume (italicized in HTML)
  if (metadata.volume) {
    parts.push(`*${metadata.volume}*`);
  }

  // Issue in parentheses
  if (metadata.issue) {
    parts.push(`(${metadata.issue})`);
  }

  // Pages
  if (metadata.pages) {
    parts.push(metadata.pages);
  }

  // DOI (full URL format)
  if (metadata.doi) {
    parts.push(`https://doi.org/${metadata.doi}`);
  }

  // URL (if no DOI)
  if (!metadata.doi && metadata.url) {
    parts.push(metadata.url);
  }

  return parts.join('. ');
}

/**
 * Formats authors according to APA 7 style
 */
function formatAPAAuthors(authors?: Author[]): string | null {
  if (!authors || authors.length === 0) {
    return null;
  }

  if (authors.length === 1) {
    return formatSingleAPAAuthor(authors[0]);
  }

  if (authors.length === 2) {
    return `${formatSingleAPAAuthor(authors[0])} & ${formatSingleAPAAuthor(authors[1])}`;
  }

  if (authors.length <= 20) {
    return authors.map(formatSingleAPAAuthor).join(', ');
  }

  // 21+ authors: list first 19, then ... , last author
  const firstNineteen = authors.slice(0, 19).map(formatSingleAPAAuthor).join(', ');
  const lastAuthor = formatSingleAPAAuthor(authors[authors.length - 1]);
  return `${firstNineteen}, ... , ${lastAuthor}`;
}

/**
 * Formats a single author: Last, F. M.
 */
function formatSingleAPAAuthor(author: Author): string {
  if (author.fullName) {
    return author.fullName;
  }

  const lastName = author.lastName || '';
  const firstName = author.firstName || '';
  const initials = author.initials || (firstName ? getInitials(firstName) : '');

  // Ensure initials have periods
  const formattedInitials = initials.split(' ').map(init => {
    return init.endsWith('.') ? init : init + '.';
  }).join(' ');

  if (lastName && formattedInitials) {
    return `${lastName}, ${formattedInitials}`;
  }

  if (lastName) {
    return lastName;
  }

  return formattedInitials;
}

/**
 * Gets initials from first name with periods
 */
function getInitials(firstName: string): string {
  return firstName
    .split(' ')
    .map(name => {
      const initial = name.charAt(0).toUpperCase();
      // Add period if not already present
      return initial.endsWith('.') ? initial : initial + '.';
    })
    .join(' ');
}

/**
 * Formats in-text citation according to APA 7 style
 */
function formatAPAInTextCitation(metadata: SourceMetadata): string {
  const authors = metadata.authors;

  if (!authors || authors.length === 0) {
    return formatYearOnly(metadata);
  }

  if (authors.length === 1) {
    const authorName = formatAuthorNameForInText(authors[0]);
    return `(${authorName}${formatYear(metadata)})`;
  }

  if (authors.length === 2) {
    const author1 = formatAuthorNameForInText(authors[0]);
    const author2 = formatAuthorNameForInText(authors[1]);
    return `(${author1} & ${author2}${formatYear(metadata)})`;
  }

  // 3+ authors: use first author + et al.
  const firstAuthor = formatAuthorNameForInText(authors[0]);
  return `(${firstAuthor} et al.${formatYear(metadata)})`;
}

/**
 * Formats author name for in-text citation: Last Name or full name for organizational authors
 */
function formatAuthorNameForInText(author: Author): string {
  if (author.fullName) {
    // For organizational authors, use the full name
    // For individual authors, use last name
    const parts = author.fullName.split(' ');
    if (parts.length > 2) {
      return author.fullName; // Likely organizational
    }
    return parts[parts.length - 1]; // Individual author
  }

  return author.lastName || '';
}

/**
 * Formats year for in-text citation
 */
function formatYear(metadata: SourceMetadata): string {
  if (metadata.year) {
    return `, ${metadata.year}`;
  }
  return '';
}

/**
 * Formats year-only in-text citation (no authors)
 */
function formatYearOnly(metadata: SourceMetadata): string {
  if (metadata.year) {
    return `(${metadata.year})`;
  }
  return '(n.d.)';
}
