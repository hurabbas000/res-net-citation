import { SourceMetadata, Author } from '@/types/citation';

export interface HarvardFormattedCitation {
  reference: string;
  inText: string;
}

/**
 * Formats source metadata according to Harvard citation style
 */
export function formatHarvardCitation(metadata: SourceMetadata): HarvardFormattedCitation {
  const reference = formatHarvardReference(metadata);
  const inText = formatHarvardInTextCitation(metadata);

  return {
    reference,
    inText,
  };
}

/**
 * Formats the full Harvard reference
 */
function formatHarvardReference(metadata: SourceMetadata): string {
  const parts: string[] = [];

  // Authors
  const authors = formatHarvardAuthors(metadata.authors);
  if (authors) {
    parts.push(authors);
  }

  // Year in parentheses
  if (metadata.year) {
    parts.push(`(${metadata.year})`);
  } else {
    parts.push('(n.d.)');
  }

  // Title in single quotes for articles
  if (metadata.title) {
    parts.push(`'${metadata.title}'`);
  }

  // Journal name in italics
  if (metadata.journal) {
    parts.push(`*${metadata.journal}*`);
  }

  // Volume(issue), pages
  const volumeIssuePages = formatVolumeIssuePages(metadata);
  if (volumeIssuePages) {
    parts.push(volumeIssuePages);
  }

  // DOI
  if (metadata.doi) {
    parts.push(`doi: ${metadata.doi}`);
  }

  // URL (if no DOI)
  if (!metadata.doi && metadata.url) {
    parts.push(`Available at: ${metadata.url}`);
  }

  return parts.join('. ');
}

/**
 * Formats authors according to Harvard style
 */
function formatHarvardAuthors(authors?: Author[]): string | null {
  if (!authors || authors.length === 0) {
    return null;
  }

  if (authors.length === 1) {
    return formatSingleHarvardAuthor(authors[0], true);
  }

  if (authors.length === 2) {
    return `${formatSingleHarvardAuthor(authors[0], true)} and ${formatSingleHarvardAuthor(authors[1], false)}`;
  }

  if (authors.length === 3) {
    return `${formatSingleHarvardAuthor(authors[0], true)}, ${formatSingleHarvardAuthor(authors[1], false)} and ${formatSingleHarvardAuthor(authors[2], false)}`;
  }

  // 4+ authors: use first author + et al.
  return `${formatSingleHarvardAuthor(authors[0], true)} et al.`;
}

/**
 * Formats a single author
 * @param isFirst - if true, format as "Last, Initials"
 * @param isFirst - if false, format as "Initials Last"
 */
function formatSingleHarvardAuthor(author: Author, isFirst: boolean): string {
  if (author.fullName) {
    return author.fullName;
  }

  const lastName = author.lastName || '';
  const firstName = author.firstName || '';
  const initials = author.initials || (firstName ? getInitials(firstName) : '');

  if (isFirst) {
    if (lastName && initials) {
      return `${lastName}, ${initials}`;
    }
    if (lastName) {
      return lastName;
    }
    return initials;
  } else {
    if (initials && lastName) {
      return `${initials} ${lastName}`;
    }
    if (lastName) {
      return lastName;
    }
    return initials;
  }
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
 * Formats volume, issue, and pages
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
    parts.push(`pp. ${metadata.pages}`);
  }

  if (parts.length === 0) {
    return null;
  }

  // Harvard style: volume(issue) pages - join without comma for vol(issue), then comma for pages
  if (metadata.volume && metadata.issue && metadata.pages) {
    return `${metadata.volume}(${metadata.issue}), pp. ${metadata.pages}`;
  }
  if (metadata.volume && metadata.issue) {
    return `${metadata.volume}(${metadata.issue})`;
  }
  if (metadata.volume && metadata.pages) {
    return `${metadata.volume}, pp. ${metadata.pages}`;
  }
  if (metadata.issue && metadata.pages) {
    return `(${metadata.issue}), pp. ${metadata.pages}`;
  }
  if (metadata.volume) {
    return metadata.volume;
  }
  if (metadata.issue) {
    return `(${metadata.issue})`;
  }
  if (metadata.pages) {
    return `pp. ${metadata.pages}`;
  }

  return null;
}

/**
 * Formats in-text citation according to Harvard style
 */
function formatHarvardInTextCitation(metadata: SourceMetadata): string {
  const authors = metadata.authors;

  if (!authors || authors.length === 0) {
    return formatYearOnly(metadata);
  }

  if (authors.length === 1) {
    const authorName = formatAuthorNameForInText(authors[0]);
    return `(${authorName}, ${formatYear(metadata)})`;
  }

  if (authors.length === 2) {
    const author1 = formatAuthorNameForInText(authors[0]);
    const author2 = formatAuthorNameForInText(authors[1]);
    return `(${author1} and ${author2}, ${formatYear(metadata)})`;
  }

  if (authors.length === 3) {
    const author1 = formatAuthorNameForInText(authors[0]);
    const author2 = formatAuthorNameForInText(authors[1]);
    const author3 = formatAuthorNameForInText(authors[2]);
    return `(${author1}, ${author2} and ${author3}, ${formatYear(metadata)})`;
  }

  // 4+ authors: use first author + et al.
  const firstAuthor = formatAuthorNameForInText(authors[0]);
  return `(${firstAuthor} et al., ${formatYear(metadata)})`;
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
