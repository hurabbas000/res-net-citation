import { SourceMetadata, Author } from '@/types/citation';

export interface MLAFormattedCitation {
  reference: string;
  inText: string;
}

/**
 * Formats source metadata according to MLA 9 citation style
 */
export function formatMLACitation(metadata: SourceMetadata): MLAFormattedCitation {
  const reference = formatMLAReference(metadata);
  const inText = formatMLAInTextCitation(metadata);

  return {
    reference,
    inText,
  };
}

/**
 * Formats the full MLA 9 reference
 */
function formatMLAReference(metadata: SourceMetadata): string {
  const parts: string[] = [];

  // Authors
  const authors = formatMLAAuthors(metadata.authors);
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

  // Volume and issue
  const volumeIssue = formatVolumeIssue(metadata);
  if (volumeIssue) {
    parts.push(volumeIssue);
  }

  // Year
  if (metadata.year) {
    parts.push(metadata.year.toString());
  }

  // Pages
  if (metadata.pages) {
    parts.push(`pp. ${metadata.pages}`);
  }

  // DOI
  if (metadata.doi) {
    parts.push(`doi:${metadata.doi}`);
  }

  // URL (if no DOI)
  if (!metadata.doi && metadata.url) {
    parts.push(metadata.url);
  }

  return parts.join('. ');
}

/**
 * Formats authors according to MLA 9 style
 */
function formatMLAAuthors(authors?: Author[]): string | null {
  if (!authors || authors.length === 0) {
    return null;
  }

  if (authors.length === 1) {
    return formatSingleMLAAuthor(authors[0], true);
  }

  if (authors.length === 2) {
    return `${formatSingleMLAAuthor(authors[0], true)}, and ${formatSingleMLAAuthor(authors[1], false)}`;
  }

  // 3+ authors: list first author + ", et al."
  return `${formatSingleMLAAuthor(authors[0], true)}, et al.`;
}

/**
 * Formats a single author: "Last, First" for first author, "First Last" for subsequent
 */
function formatSingleMLAAuthor(author: Author, isFirst: boolean): string {
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
 * Formats volume and issue: "vol. X, no. Y"
 */
function formatVolumeIssue(metadata: SourceMetadata): string | null {
  const parts: string[] = [];

  if (metadata.volume) {
    parts.push(`vol. ${metadata.volume}`);
  }

  if (metadata.issue) {
    parts.push(`no. ${metadata.issue}`);
  }

  if (parts.length === 0) {
    return null;
  }

  return parts.join(', ');
}

/**
 * Formats in-text citation according to MLA 9 style
 */
function formatMLAInTextCitation(metadata: SourceMetadata): string {
  const authors = metadata.authors;

  if (!authors || authors.length === 0) {
    return formatTitleOnly(metadata);
  }

  if (authors.length === 1) {
    const authorName = formatAuthorNameForInText(authors[0]);
    return `(${authorName} ${formatPage(metadata)})`;
  }

  if (authors.length === 2) {
    const author1 = formatAuthorNameForInText(authors[0]);
    const author2 = formatAuthorNameForInText(authors[1]);
    return `(${author1} and ${author2} ${formatPage(metadata)})`;
  }

  // 3+ authors: use first author + et al.
  const firstAuthor = formatAuthorNameForInText(authors[0]);
  return `(${firstAuthor} et al. ${formatPage(metadata)})`;
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
 * Formats page number for in-text citation
 */
function formatPage(metadata: SourceMetadata): string {
  if (metadata.pages) {
    // Extract first page number
    const firstPage = metadata.pages.split('-')[0];
    return firstPage;
  }
  return '';
}

/**
 * Formats title-only in-text citation (no authors)
 */
function formatTitleOnly(metadata: SourceMetadata): string {
  if (metadata.title) {
    const shortTitle = metadata.title.split(':')[0]; // Use title before colon
    return `("${shortTitle}" ${formatPage(metadata)})`;
  }
  return '';
}
