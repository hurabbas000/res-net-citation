import { formatAMACitation } from '../ama-formatter';
import { SourceMetadata } from '@/types/citation';

describe('AMA Formatter', () => {
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

    const result = formatAMACitation(metadata);
    expect(result.reference).toContain('Smith J');
    expect(result.inText).toBe('(Smith J, 2020)');
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

    const result = formatAMACitation(metadata);
    expect(result.reference).toContain('Smith J, Johnson J');
    expect(result.inText).toBe('(Smith J and Johnson J, 2020)');
  });

  test('formats 3-6 authors', () => {
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

    const result = formatAMACitation(metadata);
    expect(result.reference).toContain('Smith J, Johnson J, Williams B');
    expect(result.inText).toBe('(Smith J et al, 2020)');
  });

  test('formats more than 6 authors with et al.', () => {
    const metadata: SourceMetadata = {
      sourceType: 'journal-article',
      title: 'Test Article',
      authors: [
        { lastName: 'Smith', firstName: 'John', initials: 'J' },
        { lastName: 'Johnson', firstName: 'Jane', initials: 'J' },
        { lastName: 'Williams', firstName: 'Bob', initials: 'B' },
        { lastName: 'Brown', firstName: 'Alice', initials: 'A' },
        { lastName: 'Davis', firstName: 'Charlie', initials: 'C' },
        { lastName: 'Miller', firstName: 'David', initials: 'D' },
        { lastName: 'Wilson', firstName: 'Emma', initials: 'E' },
      ],
      journal: 'Test Journal',
      year: 2020,
      volume: '10',
      issue: '2',
      pages: '123-145',
    };

    const result = formatAMACitation(metadata);
    expect(result.reference).toContain('Smith J, Johnson J, Williams B, et al.');
    expect(result.inText).toBe('(Smith J et al, 2020)');
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

    const result = formatAMACitation(metadata);
    expect(result.reference).not.toContain('undefined');
    expect(result.inText).toBe('(2020)');
  });

  test('handles missing DOI', () => {
    const metadata: SourceMetadata = {
      sourceType: 'journal-article',
      title: 'Test Article',
      authors: [{ lastName: 'Smith', firstName: 'John', initials: 'J' }],
      journal: 'Test Journal',
      year: 2020,
      volume: '10',
      issue: '2',
      pages: '123-145',
      url: 'https://example.com/article',
    };

    const result = formatAMACitation(metadata);
    expect(result.reference).not.toContain('doi:');
    expect(result.reference).toContain('https://example.com/article');
  });

  test('handles missing pages with article number', () => {
    const metadata: SourceMetadata = {
      sourceType: 'journal-article',
      title: 'Test Article',
      authors: [{ lastName: 'Smith', firstName: 'John', initials: 'J' }],
      journal: 'Test Journal',
      year: 2020,
      volume: '10',
      issue: '2',
      articleNumber: 'e12345',
      doi: '10.1234/test.12345',
    };

    const result = formatAMACitation(metadata);
    expect(result.reference).toContain('e12345');
    expect(result.reference).not.toContain('pages');
  });

  test('handles missing volume and issue', () => {
    const metadata: SourceMetadata = {
      sourceType: 'journal-article',
      title: 'Test Article',
      authors: [{ lastName: 'Smith', firstName: 'John', initials: 'J' }],
      journal: 'Test Journal',
      year: 2020,
      pages: '123-145',
      doi: '10.1234/test.12345',
    };

    const result = formatAMACitation(metadata);
    expect(result.reference).toContain('2020');
    expect(result.reference).toContain('123-145');
  });

  test('uses journal abbreviation when available', () => {
    const metadata: SourceMetadata = {
      sourceType: 'journal-article',
      title: 'Test Article',
      authors: [{ lastName: 'Smith', firstName: 'John', initials: 'J' }],
      journal: 'Test Journal of Medicine',
      journalAbbreviation: 'Test J Med',
      year: 2020,
      volume: '10',
      issue: '2',
      pages: '123-145',
      doi: '10.1234/test.12345',
    };

    const result = formatAMACitation(metadata);
    expect(result.reference).toContain('Test J Med');
    expect(result.reference).not.toContain('Test Journal of Medicine');
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

    const result = formatAMACitation(metadata);
    expect(result.reference).toContain('Smith');
    expect(result.inText).toBe('(Smith, 2020)');
  });

  test('handles author with full name', () => {
    const metadata: SourceMetadata = {
      sourceType: 'journal-article',
      title: 'Test Article',
      authors: [{ fullName: 'Smith John' }],
      journal: 'Test Journal',
      year: 2020,
      volume: '10',
      pages: '123-145',
    };

    const result = formatAMACitation(metadata);
    expect(result.reference).toContain('Smith John');
  });

  test('generates initials from first name', () => {
    const metadata: SourceMetadata = {
      sourceType: 'journal-article',
      title: 'Test Article',
      authors: [{ lastName: 'Smith', firstName: 'John Robert' }],
      journal: 'Test Journal',
      year: 2020,
      volume: '10',
      pages: '123-145',
    };

    const result = formatAMACitation(metadata);
    expect(result.reference).toContain('Smith JR');
  });

  test('handles missing year in in-text citation', () => {
    const metadata: SourceMetadata = {
      sourceType: 'journal-article',
      title: 'Test Article',
      authors: [{ lastName: 'Smith', firstName: 'John', initials: 'J' }],
      journal: 'Test Journal',
      volume: '10',
      pages: '123-145',
    };

    const result = formatAMACitation(metadata);
    expect(result.inText).toBe('(Smith J)');
  });

  test('handles no authors and no year', () => {
    const metadata: SourceMetadata = {
      sourceType: 'journal-article',
      title: 'Test Article',
      journal: 'Test Journal',
      volume: '10',
      pages: '123-145',
    };

    const result = formatAMACitation(metadata);
    expect(result.inText).toBe('(n.d.)');
  });
});
