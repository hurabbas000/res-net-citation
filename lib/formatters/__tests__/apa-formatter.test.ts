import { formatAPACitation } from '../apa-formatter';
import { SourceMetadata } from '@/types/citation';

describe('APA 7 Formatter', () => {
  test('formats single author', () => {
    const metadata: SourceMetadata = {
      sourceType: 'journal-article',
      title: 'Test Article',
      authors: [{ lastName: 'Smith', firstName: 'John', initials: 'J' }],
      journal: 'Test Journal',
      year: 2020,
      volume: '10',
      issue: '2',
      pages: '123-145',
      doi: '10.1234/test.12345',
    };

    const result = formatAPACitation(metadata);
    expect(result.reference).toContain('Smith, J.');
    expect(result.inText).toBe('(Smith, 2020)');
  });

  test('formats two authors', () => {
    const metadata: SourceMetadata = {
      sourceType: 'journal-article',
      title: 'Test Article',
      authors: [
        { lastName: 'Smith', firstName: 'John', initials: 'J' },
        { lastName: 'Johnson', firstName: 'Jane', initials: 'J' },
      ],
      journal: 'Test Journal',
      year: 2020,
      volume: '10',
      issue: '2',
      pages: '123-145',
    };

    const result = formatAPACitation(metadata);
    expect(result.reference).toContain('Smith, J. & Johnson, J.');
    expect(result.inText).toBe('(Smith & Johnson, 2020)');
  });

  test('formats 3-20 authors', () => {
    const metadata: SourceMetadata = {
      sourceType: 'journal-article',
      title: 'Test Article',
      authors: [
        { lastName: 'Smith', firstName: 'John', initials: 'J' },
        { lastName: 'Johnson', firstName: 'Jane', initials: 'J' },
        { lastName: 'Williams', firstName: 'Bob', initials: 'B' },
      ],
      journal: 'Test Journal',
      year: 2020,
      volume: '10',
      issue: '2',
      pages: '123-145',
    };

    const result = formatAPACitation(metadata);
    expect(result.reference).toContain('Smith, J., Johnson, J., Williams, B.');
    expect(result.inText).toBe('(Smith et al., 2020)');
  });

  test('formats more than 20 authors with ellipsis', () => {
    const authors = Array.from({ length: 22 }, (_, i) => ({
      lastName: `Author${i}`,
      firstName: `Name${i}`,
      initials: `N${i}`,
    }));

    const metadata: SourceMetadata = {
      sourceType: 'journal-article',
      title: 'Test Article',
      authors: authors,
      journal: 'Test Journal',
      year: 2020,
      volume: '10',
      pages: '123-145',
    };

    const result = formatAPACitation(metadata);
    expect(result.reference).toContain('...');
    expect(result.inText).toBe('(Author0 et al., 2020)');
  });

  test('handles organizational author', () => {
    const metadata: SourceMetadata = {
      sourceType: 'journal-article',
      title: 'Test Article',
      authors: [{ fullName: 'WHO' }],
      journal: 'Test Journal',
      year: 2020,
      volume: '10',
      pages: '123-145',
      doi: '10.1234/test.12345',
    };

    const result = formatAPACitation(metadata);
    expect(result.reference).toContain('WHO');
    expect(result.inText).toBe('(WHO, 2020)');
  });

  test('handles missing authors', () => {
    const metadata: SourceMetadata = {
      sourceType: 'journal-article',
      title: 'Test Article',
      journal: 'Test Journal',
      year: 2020,
      volume: '10',
      issue: '2',
      pages: '123-145',
    };

    const result = formatAPACitation(metadata);
    expect(result.reference).not.toContain('undefined');
    expect(result.inText).toBe('(2020)');
  });

  test('handles DOI', () => {
    const metadata: SourceMetadata = {
      sourceType: 'journal-article',
      title: 'Test Article',
      authors: [{ lastName: 'Smith', firstName: 'John', initials: 'J.' }],
      journal: 'Test Journal',
      year: 2020,
      volume: '10',
      issue: '2',
      pages: '123-145',
      doi: '10.1234/test.12345',
    };

    const result = formatAPACitation(metadata);
    expect(result.reference).toContain('https://doi.org/10.1234/test.12345');
  });

  test('handles URL when no DOI', () => {
    const metadata: SourceMetadata = {
      sourceType: 'journal-article',
      title: 'Test Article',
      authors: [{ lastName: 'Smith', firstName: 'John', initials: 'J.' }],
      journal: 'Test Journal',
      year: 2020,
      volume: '10',
      issue: '2',
      pages: '123-145',
      url: 'https://example.com/article',
    };

    const result = formatAPACitation(metadata);
    expect(result.reference).toContain('https://example.com/article');
    expect(result.reference).not.toContain('doi');
  });

  test('handles publication year', () => {
    const metadata: SourceMetadata = {
      sourceType: 'journal-article',
      title: 'Test Article',
      authors: [{ lastName: 'Smith', firstName: 'John', initials: 'J.' }],
      journal: 'Test Journal',
      year: 2020,
      volume: '10',
      pages: '123-145',
    };

    const result = formatAPACitation(metadata);
    expect(result.reference).toContain('(2020)');
  });

  test('handles journal volume, issue, and pages', () => {
    const metadata: SourceMetadata = {
      sourceType: 'journal-article',
      title: 'Test Article',
      authors: [{ lastName: 'Smith', firstName: 'John', initials: 'J.' }],
      journal: 'Test Journal',
      year: 2020,
      volume: '10',
      issue: '2',
      pages: '123-145',
      doi: '10.1234/test.12345',
    };

    const result = formatAPACitation(metadata);
    expect(result.reference).toContain('*10*');
    expect(result.reference).toContain('(2)');
    expect(result.reference).toContain('123-145');
  });

  test('handles missing volume and issue', () => {
    const metadata: SourceMetadata = {
      sourceType: 'journal-article',
      title: 'Test Article',
      authors: [{ lastName: 'Smith', firstName: 'John', initials: 'J.' }],
      journal: 'Test Journal',
      year: 2020,
      pages: '123-145',
      doi: '10.1234/test.12345',
    };

    const result = formatAPACitation(metadata);
    expect(result.reference).toContain('2020');
    expect(result.reference).toContain('123-145');
  });

  test('handles author with only last name', () => {
    const metadata: SourceMetadata = {
      sourceType: 'journal-article',
      title: 'Test Article',
      authors: [{ lastName: 'Smith' }],
      journal: 'Test Journal',
      year: 2020,
      volume: '10',
      pages: '123-145',
    };

    const result = formatAPACitation(metadata);
    expect(result.reference).toContain('Smith');
    expect(result.inText).toBe('(Smith, 2020)');
  });

  test('generates initials with periods from first name', () => {
    const metadata: SourceMetadata = {
      sourceType: 'journal-article',
      title: 'Test Article',
      authors: [{ lastName: 'Smith', firstName: 'John Robert' }],
      journal: 'Test Journal',
      year: 2020,
      volume: '10',
      pages: '123-145',
    };

    const result = formatAPACitation(metadata);
    expect(result.reference).toContain('Smith, J. R.');
  });

  test('handles missing year in in-text citation', () => {
    const metadata: SourceMetadata = {
      sourceType: 'journal-article',
      title: 'Test Article',
      authors: [{ lastName: 'Smith', firstName: 'John', initials: 'J.' }],
      journal: 'Test Journal',
      volume: '10',
      pages: '123-145',
    };

    const result = formatAPACitation(metadata);
    expect(result.inText).toBe('(Smith)');
  });

  test('handles no authors and no year', () => {
    const metadata: SourceMetadata = {
      sourceType: 'journal-article',
      title: 'Test Article',
      journal: 'Test Journal',
      volume: '10',
      pages: '123-145',
    };

    const result = formatAPACitation(metadata);
    expect(result.inText).toBe('(n.d.)');
  });
});
