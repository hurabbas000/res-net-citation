import { SourceMetadata, Author } from '@/types/citation';

export interface IEEEFormattedCitation {
  reference: string;
  inText: string;
}

/**
 * Formats source metadata according to IEEE citation style
 */
export function formatIEEECitation(metadata: SourceMetadata): IEEEFormattedCitation {
  const reference = formatIEEEReference(metadata);
  const inText = formatIEEEInTextCitation(metadata);

  return {
    reference,
    inText,
  };
}

/**
 * Formats the full IEEE reference
 */
function formatIEEEReference(metadata: SourceMetadata): string {
  const parts: string[] = [];

  // Authors: Initials. Last Name
  const authors = formatIEEEAuthors(metadata.authors);
  if (authors) {
    parts.push(authors);
  }

  // Title in quotation marks
  if (metadata.title) {
    parts.push(`"${metadata.title}"`);
  }

  // Journal name in italics
  if (metadata.journal) {
    parts.push(`*${metadata.journal}*`);
  }

  // Volume, issue, pages, year
  const volIssuePagesYear = formatVolumeIssuePagesYear(metadata);
  if (volIssuePagesYear) {
    parts.push(volIssuePagesYear);
  }

  // DOI
  if (metadata.doi) {
    parts.push(`doi: ${metadata.doi}`);
  }

  // URL (if no DOI)
  if (!metadata.doi && metadata.url) {
    parts.push(`Available: ${metadata.url}`);
  }

  return parts.join(', ');
}

/**
 * Formats authors according to IEEE style
 */
function formatIEEEAuthors(authors?: Author[]): string | null {
  if (!authors || authors.length === 0) {
    return null;
  }

  if (authors.length === 1) {
    return formatSingleIEEEAuthor(authors[0]);
  }

  if (authors.length <= 6) {
    return authors.map(formatSingleIEEEAuthor).join(', ');
  }

  // 7+ authors: list first 6 + ", et al."
  const firstSix = authors.slice(0, 6).map(formatSingleIEEEAuthor).join(', ');
  return `${firstSix}, et al.`;
}

/**
 * Formats a single author: "A. B. Last" or "A. Last"
 */
function formatSingleIEEEAuthor(author: Author): string {
  if (author.fullName) {
    return author.fullName;
  }

  const lastName = author.lastName || '';
  const firstName = author.firstName || '';
  const initials = author.initials || (firstName ? getInitials(firstName) : '');

  if (initials && lastName) {
    return `${initials} ${lastName}`;
  }

  if (lastName) {
    return lastName;
  }

  return initials;
}

/**
 * Gets initials from first name with periods
 */
function getInitials(firstName: string): string {
  return firstName
    .split(' ')
    .map(name => {
      const initial = name.charAt(0).toUpperCase();
      return initial + '.';
    })
    .join(' ');
}

/**
 * Formats volume, issue, pages, and year: "vol. X, no. Y, pp. Pages, Year"
 */
function formatVolumeIssuePagesYear(metadata: SourceMetadata): string | null {
  const parts: string[] = [];

  if (metadata.volume) {
    parts.push(`vol. ${metadata.volume}`);
  }

  if (metadata.issue) {
    parts.push(`no. ${metadata.issue}`);
  }

  if (metadata.pages) {
    parts.push(`pp. ${metadata.pages}`);
  }

  if (metadata.year) {
    parts.push(metadata.year.toString());
  }

  if (parts.length === 0) {
    return null;
  }

  return parts.join(', ');
}

/**
 * Formats in-text citation according to IEEE style
 * IEEE uses bracketed numbers [1], [2], etc.
 * Since we don't track reference numbers globally, we'll use placeholder
 */
function formatIEEEInTextCitation(metadata: SourceMetadata): string {
  // IEEE uses numbered citations [1], [2]
  // For individual citations without a reference list, we'll indicate it should be numbered
  return '[#]';
}
