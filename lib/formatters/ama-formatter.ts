import { SourceMetadata, Author } from '@/types/citation';

export interface AMAFormattedCitation {
  reference: string;
  inText: string;
}

/**
 * Formats source metadata according to AMA citation style (11th edition)
 */
export function formatAMACitation(metadata: SourceMetadata): AMAFormattedCitation {
  const reference = formatReference(metadata);
  const inText = formatInTextCitation(metadata);

  return {
    reference,
    inText,
  };
}

/**
 * Formats the full AMA reference
 */
function formatReference(metadata: SourceMetadata): string {
  const parts: string[] = [];

  // Authors
  const authors = formatAuthors(metadata.authors);
  if (authors) {
    parts.push(authors);
  }

  // Title
  if (metadata.title) {
    parts.push(metadata.title);
  }

  // Journal
  if (metadata.journal) {
    const journalName = metadata.journalAbbreviation || metadata.journal;
    parts.push(journalName);
  }

  // Year, volume, issue, pages
  const publicationInfo = formatPublicationInfo(metadata);
  if (publicationInfo) {
    parts.push(publicationInfo);
  }

  // DOI
  if (metadata.doi) {
    parts.push(`doi:${metadata.doi}`);
  }

  // URL (if no DOI)
  if (!metadata.doi && metadata.url) {
    parts.push(`Published ${formatDate(metadata.publicationDate)}. ${metadata.url}`);
  }

  return parts.join('. ');
}

/**
 * Formats authors according to AMA style
 */
function formatAuthors(authors?: Author[]): string | null {
  if (!authors || authors.length === 0) {
    return null;
  }

  if (authors.length === 1) {
    return formatSingleAuthor(authors[0]);
  }

  if (authors.length === 2) {
    return `${formatSingleAuthor(authors[0])}, ${formatSingleAuthor(authors[1])}`;
  }

  if (authors.length <= 6) {
    return authors.map(formatSingleAuthor).join(', ');
  }

  // More than 6 authors: list first 3, then et al.
  const firstThree = authors.slice(0, 3).map(formatSingleAuthor).join(', ');
  return `${firstThree}, et al`;
}

/**
 * Formats a single author: Last Initials
 */
function formatSingleAuthor(author: Author): string {
  if (author.fullName) {
    return author.fullName;
  }

  const lastName = author.lastName || '';
  const initials = author.initials || (author.firstName ? getInitials(author.firstName) : '');

  if (lastName && initials) {
    return `${lastName} ${initials}`;
  }

  if (lastName) {
    return lastName;
  }

  return initials;
}

/**
 * Gets initials from first name
 */
function getInitials(firstName: string): string {
  return firstName
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .join('');
}

/**
 * Formats publication info: Year;volume(issue):pages
 */
function formatPublicationInfo(metadata: SourceMetadata): string | null {
  const parts: string[] = [];

  // Year
  if (metadata.year) {
    parts.push(String(metadata.year));
  }

  // Volume and issue
  if (metadata.volume) {
    parts.push(metadata.volume);
    if (metadata.issue) {
      parts[parts.length - 1] = `${metadata.volume}(${metadata.issue})`;
    }
  }

  // Pages or article number
  if (metadata.pages) {
    parts.push(metadata.pages);
  } else if (metadata.articleNumber) {
    parts.push(metadata.articleNumber);
  }

  if (parts.length === 0) {
    return null;
  }

  // Join with appropriate separators
  if (parts.length === 1) {
    return parts[0];
  }

  if (parts.length === 2) {
    return parts.join(';');
  }

  // Year;volume(issue):pages
  return `${parts[0]};${parts[1]}:${parts[2]}`;
}

/**
 * Formats date for online publication
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) {
    return '';
  }

  // Try to parse and format the date
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return dateStr;
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats in-text citation (author-year style)
 */
function formatInTextCitation(metadata: SourceMetadata): string {
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
    return `(${author1} and ${author2}${formatYear(metadata)})`;
  }

  // 3 or more authors: use first author + et al.
  const firstAuthor = formatAuthorNameForInText(authors[0]);
  return `(${firstAuthor} et al${formatYear(metadata)})`;
}

/**
 * Formats author name for in-text citation: Last Initials
 */
function formatAuthorNameForInText(author: Author): string {
  if (author.fullName) {
    const parts = author.fullName.split(' ');
    return parts[parts.length - 1]; // Last word is typically last name
  }

  const lastName = author.lastName || '';
  const initials = author.initials || (author.firstName ? getInitials(author.firstName) : '');

  if (lastName && initials) {
    return `${lastName} ${initials}`;
  }

  return lastName || initials;
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
