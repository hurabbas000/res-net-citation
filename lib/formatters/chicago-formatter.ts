import { SourceMetadata, Author } from '@/types/citation';

export interface ChicagoFormattedCitation {
  reference: string;
  inText: string;
}

/**
 * Formats source metadata according to Chicago Author-Date citation style
 */
export function formatChicagoCitation(metadata: SourceMetadata): ChicagoFormattedCitation {
  const reference = formatChicagoReference(metadata);
  const inText = formatChicagoInTextCitation(metadata);

  return {
    reference,
    inText,
  };
}

/**
 * Formats the full Chicago Author-Date reference
 */
function formatChicagoReference(metadata: SourceMetadata): string {
  const parts: string[] = [];

  // Authors
  const authors = formatChicagoAuthors(metadata.authors);
  if (authors) {
    parts.push(authors);
  }

  // Year in parentheses
  if (metadata.year) {
    parts.push(metadata.year.toString());
  } else {
    parts.push('n.d.');
  }

  // Title in quotation marks for articles
  if (metadata.title) {
    parts.push(`"${metadata.title}"`);
  }

  // Journal name in italics
  if (metadata.journal) {
    parts.push(`*${metadata.journal}*`);
  }

  // Volume(issue):pages
  const volumeIssuePages = formatVolumeIssuePages(metadata);
  if (volumeIssuePages) {
    parts.push(volumeIssuePages);
  }

  // DOI
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
 * Formats authors according to Chicago Author-Date style
 */
function formatChicagoAuthors(authors?: Author[]): string | null {
  if (!authors || authors.length === 0) {
    return null;
  }

  if (authors.length === 1) {
    return formatSingleChicagoAuthor(authors[0], true);
  }

  if (authors.length === 2) {
    return `${formatSingleChicagoAuthor(authors[0], true)} and ${formatSingleChicagoAuthor(authors[1], false)}`;
  }

  if (authors.length === 3) {
    return `${formatSingleChicagoAuthor(authors[0], true)}, ${formatSingleChicagoAuthor(authors[1], false)}, and ${formatSingleChicagoAuthor(authors[2], false)}`;
  }

  // 4+ authors: use first author + et al.
  return `${formatSingleChicagoAuthor(authors[0], true)} et al.`;
}

/**
 * Formats a single author
 * @param isFirst - if true, format as "Last, First"
 * @param isFirst - if false, format as "First Last"
 */
function formatSingleChicagoAuthor(author: Author, isFirst: boolean): string {
  if (author.fullName) {
    return author.fullName;
  }

  const lastName = author.lastName || '';
  const firstName = author.firstName || '';

  if (isFirst) {
    if (lastName && firstName) {
      return `${lastName}, ${firstName}`;
    }
    if (lastName) {
      return lastName;
    }
    return firstName;
  } else {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (lastName) {
      return lastName;
    }
    return firstName;
  }
}

/**
 * Formats volume, issue, and pages: "Volume(Issue):Pages"
 */
function formatVolumeIssuePages(metadata: SourceMetadata): string | null {
  const parts: string[] = [];

  if (metadata.volume) {
    parts.push(metadata.volume);
  }

  if (metadata.issue) {
    parts.push(`(${metadata.issue})`);
  }

  if (metadata.pages) {
    parts.push(`:${metadata.pages}`);
  }

  if (parts.length === 0) {
    return null;
  }

  return parts.join('');
}

/**
 * Formats in-text citation according to Chicago Author-Date style
 */
function formatChicagoInTextCitation(metadata: SourceMetadata): string {
  const authors = metadata.authors;

  if (!authors || authors.length === 0) {
    return formatYearOnly(metadata);
  }

  if (authors.length === 1) {
    const authorName = formatAuthorNameForInText(authors[0]);
    return `(${authorName} ${formatYear(metadata)})`;
  }

  if (authors.length === 2) {
    const author1 = formatAuthorNameForInText(authors[0]);
    const author2 = formatAuthorNameForInText(authors[1]);
    return `(${author1} and ${author2} ${formatYear(metadata)})`;
  }

  if (authors.length === 3) {
    const author1 = formatAuthorNameForInText(authors[0]);
    const author2 = formatAuthorNameForInText(authors[1]);
    const author3 = formatAuthorNameForInText(authors[2]);
    return `(${author1}, ${author2}, and ${author3} ${formatYear(metadata)})`;
  }

  // 4+ authors: use first author + et al.
  const firstAuthor = formatAuthorNameForInText(authors[0]);
  return `(${firstAuthor} et al. ${formatYear(metadata)})`;
}

/**
 * Formats author name for in-text citation: Last Name only
 */
function formatAuthorNameForInText(author: Author): string {
  if (author.fullName) {
    // For organizational authors, use the full name
    const parts = author.fullName.split(' ');
    if (parts.length > 2) {
      return author.fullName;
    }
    return parts[parts.length - 1];
  }

  return author.lastName || '';
}

/**
 * Formats year for in-text citation
 */
function formatYear(metadata: SourceMetadata): string {
  if (metadata.year) {
    return metadata.year.toString();
  }
  return 'n.d.';
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
