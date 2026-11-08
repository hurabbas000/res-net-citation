import { formatMLACitation } from '../mla-formatter';
import { SourceMetadata } from '@/types/citation';

describe('MLA 9 Formatter', () => {
  describe('Single Author', () => {
    it('should format a single author citation', () => {
      const metadata: SourceMetadata = {
        sourceType: 'journal-article',
        title: 'The effect of exercise on mental health',
        authors: [
          { lastName: 'Smith', firstName: 'John' }
        ],
        journal: 'Journal of Health',
        year: 2020,
        volume: '10',
        issue: '2',
        pages: '123-145',
        doi: '10.1234/joh.2020.10.2.123'
      };

      const result = formatMLACitation(metadata);

      expect(result.reference).toContain('Smith, John');
      expect(result.reference).toContain('"The effect of exercise on mental health"');
      expect(result.reference).toContain('*Journal of Health*');
      expect(result.reference).toContain('vol. 10, no. 2');
      expect(result.reference).toContain('2020');
      expect(result.reference).toContain('pp. 123-145');
      expect(result.inText).toBe('(Smith 123)');
    });
  });

  describe('Two Authors', () => {
    it('should format a two author citation', () => {
      const metadata: SourceMetadata = {
        sourceType: 'journal-article',
        title: 'Climate change impacts',
        authors: [
          { lastName: 'Johnson', firstName: 'Mary' },
          { lastName: 'Williams', firstName: 'Robert' }
        ],
        journal: 'Environmental Science',
        year: 2021,
        volume: '15',
        issue: '3',
        pages: '45-67'
      };

      const result = formatMLACitation(metadata);

      expect(result.reference).toContain('Johnson, Mary, and Robert Williams');
      expect(result.inText).toBe('(Johnson and Williams 45)');
    });
  });

  describe('Multiple Authors (3+)', () => {
    it('should use et al. for 3+ authors', () => {
      const metadata: SourceMetadata = {
        sourceType: 'journal-article',
        title: 'Machine learning applications',
        authors: [
          { lastName: 'Brown', firstName: 'Alice' },
          { lastName: 'Davis', firstName: 'James' },
          { lastName: 'Miller', firstName: 'Sarah' }
        ],
        journal: 'Computer Science Review',
        year: 2022,
        volume: '20',
        issue: '1',
        pages: '100-120'
      };

      const result = formatMLACitation(metadata);

      expect(result.reference).toContain('Brown, Alice, et al.');
      expect(result.inText).toBe('(Brown et al. 100)');
    });
  });

  describe('Missing Fields', () => {
    it('should handle missing DOI', () => {
      const metadata: SourceMetadata = {
        sourceType: 'journal-article',
        title: 'Article without DOI',
        authors: [
          { lastName: 'Lee', firstName: 'Kevin' }
        ],
        journal: 'Journal of Testing',
        year: 2020,
        volume: '5',
        issue: '1',
        pages: '10-20',
        url: 'https://example.com/article'
      };

      const result = formatMLACitation(metadata);

      expect(result.reference).toContain('https://example.com/article');
    });

    it('should handle missing pages', () => {
      const metadata: SourceMetadata = {
        sourceType: 'journal-article',
        title: 'Article without pages',
        authors: [
          { lastName: 'Garcia', firstName: 'Maria' }
        ],
        journal: 'Journal of Examples',
        year: 2021,
        volume: '8',
        issue: '2'
      };

      const result = formatMLACitation(metadata);

      expect(result.reference).not.toContain('pp.');
      expect(result.inText).toBe('(Garcia )');
    });

    it('should handle missing issue', () => {
      const metadata: SourceMetadata = {
        sourceType: 'journal-article',
        title: 'Article without issue',
        authors: [
          { lastName: 'Martinez', firstName: 'Carlos' }
        ],
        journal: 'Journal of Samples',
        year: 2022,
        volume: '12',
        pages: '50-60'
      };

      const result = formatMLACitation(metadata);

      expect(result.reference).toContain('vol. 12');
      expect(result.reference).not.toContain('no.');
    });

    it('should handle missing volume', () => {
      const metadata: SourceMetadata = {
        sourceType: 'journal-article',
        title: 'Article without volume',
        authors: [
          { lastName: 'Anderson', firstName: 'Lisa' }
        ],
        journal: 'Journal of Testing',
        year: 2023,
        issue: '1',
        pages: '30-40'
      };

      const result = formatMLACitation(metadata);

      expect(result.reference).toContain('no. 1');
      expect(result.reference).not.toContain('vol.');
    });
  });

  describe('Organizational Authors', () => {
    it('should handle organizational authors', () => {
      const metadata: SourceMetadata = {
        sourceType: 'journal-article',
        title: 'WHO health guidelines',
        authors: [
          { fullName: 'World Health Organization' }
        ],
        journal: 'Health Policy',
        year: 2020,
        volume: '5',
        issue: '1',
        pages: '1-10'
      };

      const result = formatMLACitation(metadata);

      expect(result.reference).toContain('World Health Organization');
      expect(result.inText).toBe('(World Health Organization 1)');
    });
  });

  describe('Title with Colon', () => {
    it('should use short title for in-text citation when title has colon', () => {
      const metadata: SourceMetadata = {
        sourceType: 'journal-article',
        title: 'Research Methods: A Comprehensive Guide',
        journal: 'Research Journal',
        year: 2020,
        volume: '1',
        issue: '1',
        pages: '1-15'
      };

      const result = formatMLACitation(metadata);

      expect(result.inText).toContain('"Research Methods"');
    });
  });

  describe('No Authors', () => {
    it('should use title for in-text citation when no authors', () => {
      const metadata: SourceMetadata = {
        sourceType: 'journal-article',
        title: 'Anonymous Research Article',
        journal: 'Journal of Studies',
        year: 2020,
        volume: '1',
        issue: '1',
        pages: '1-10'
      };

      const result = formatMLACitation(metadata);

      expect(result.inText).toContain('"Anonymous Research Article"');
    });
  });
});
