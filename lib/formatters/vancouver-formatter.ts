import { SourceMetadata, Author } from '@/types/citation';

export interface VancouverFormattedCitation {
  reference: string;
  inText: string;
}

/**
 * Formats source metadata according to Vancouver citation style
 */
export function formatVancouverCitation(metadata: SourceMetadata): VancouverFormattedCitation {
  const reference = formatVancouverReference(metadata);
  const inText = formatVancouverInTextCitation(metadata);

  return {
    reference,
    inText,
  };
}

/**
 * Formats the full Vancouver reference
 */
function formatVancouverReference(metadata: SourceMetadata): string {
  const parts: string[] = [];

  // Authors
  const authors = formatVancouverAuthors(metadata.authors);
  if (authors) {
    parts.push(authors);
  }

  // Title
  if (metadata.title) {
    parts.push(metadata.title);
  }

  // Journal (always use abbreviation if available)
  if (metadata.journal) {
    const journalName = metadata.journalAbbreviation || metadata.journal;
    parts.push(journalName);
  }

  // Year, volume, issue, pages
  const publicationInfo = formatVancouverPublicationInfo(metadata);
  if (publicationInfo) {
    parts.push(publicationInfo);
  }

  // DOI
  if (metadata.doi) {
    parts.push(`doi: ${metadata.doi}`);
  }

  // URL (if no DOI)
  if (!metadata.doi && metadata.url) {
    parts.push(`Available from: ${metadata.url}`);
  }

  return parts.join('. ');
}

/**
 * Formats authors according to Vancouver style
 */
function formatVancouverAuthors(authors?: Author[]): string | null {
  if (!authors || authors.length === 0) {
    return null;
  }

  if (authors.length === 1) {
    return formatSingleVancouverAuthor(authors[0]);
  }

  if (authors.length === 2) {
    return `${formatSingleVancouverAuthor(authors[0])} and ${formatSingleVancouverAuthor(authors[1])}`;
  }

  if (authors.length <= 6) {
    return authors.map(formatSingleVancouverAuthor).join(', ');
  }

  // More than 6 authors: list first 6, then et al.
  const firstSix = authors.slice(0, 6).map(formatSingleVancouverAuthor).join(', ');
  return `${firstSix}, et al.`;
}

/**
 * Formats a single author: Last Initials
 */
function formatSingleVancouverAuthor(author: Author): string {
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
function formatVancouverPublicationInfo(metadata: SourceMetadata): string | null {
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
 * Formats in-text citation (numeric style - Vancouver uses superscript numbers)
 * Since we don't have citation numbering, we'll use author-year as fallback
 */
function formatVancouverInTextCitation(metadata: SourceMetadata): string {
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
 * Formats author name for in-text citation: Last Name
 */
function formatAuthorNameForInText(author: Author): string {
  if (author.fullName) {
    const parts = author.fullName.split(' ');
    return parts[parts.length - 1];
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
