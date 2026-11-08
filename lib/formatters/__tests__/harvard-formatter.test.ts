import { formatHarvardCitation } from '../harvard-formatter';
import { SourceMetadata } from '@/types/citation';

describe('Harvard Formatter', () => {
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

      const result = formatHarvardCitation(metadata);

      expect(result.reference).toContain('Smith, J');
      expect(result.reference).toContain('(2020)');
      expect(result.reference).toContain("'The effect of exercise on mental health'");
      expect(result.reference).toContain('*Journal of Health*');
      expect(result.reference).toContain('10(2), pp. 123-145');
      expect(result.inText).toBe('(Smith, 2020)');
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

      const result = formatHarvardCitation(metadata);

      expect(result.reference).toContain('Johnson, M');
      expect(result.reference).toContain('and R Williams');
      expect(result.inText).toBe('(Johnson and Williams, 2021)');
    });
  });

  describe('Three Authors', () => {
    it('should format a three author citation', () => {
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

      const result = formatHarvardCitation(metadata);

      expect(result.reference).toContain('Brown, A');
      expect(result.reference).toContain('J Davis');
      expect(result.reference).toContain('and S Miller');
      expect(result.inText).toBe('(Brown, Davis and Miller, 2022)');
    });
  });

  describe('Multiple Authors (4+)', () => {
    it('should use et al. for 4+ authors', () => {
      const metadata: SourceMetadata = {
        sourceType: 'journal-article',
        title: 'Genetic research advances',
        authors: [
          { lastName: 'Wilson', firstName: 'Emily' },
          { lastName: 'Taylor', firstName: 'Michael' },
          { lastName: 'Anderson', firstName: 'Lisa' },
          { lastName: 'Thomas', firstName: 'David' }
        ],
        journal: 'Genetics Journal',
        year: 2023,
        volume: '25',
        issue: '4',
        pages: '200-220'
      };

      const result = formatHarvardCitation(metadata);

      expect(result.reference).toContain('Wilson, E et al.');
      expect(result.inText).toBe('(Wilson et al., 2023)');
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

      const result = formatHarvardCitation(metadata);

      expect(result.reference).toContain('Available at: https://example.com/article');
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

      const result = formatHarvardCitation(metadata);

      expect(result.reference).not.toContain('pp.');
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

      const result = formatHarvardCitation(metadata);

      expect(result.reference).toContain('12, pp. 50-60');
      expect(result.reference).not.toContain('(2)');
    });

    it('should handle missing year with n.d.', () => {
      const metadata: SourceMetadata = {
        sourceType: 'journal-article',
        title: 'Article without year',
        authors: [
          { lastName: 'Rodriguez', firstName: 'Ana' }
        ],
        journal: 'Journal of Tests',
        volume: '3',
        issue: '1',
        pages: '5-10'
      };

      const result = formatHarvardCitation(metadata);

      expect(result.reference).toContain('(n.d.)');
      expect(result.inText).toBe('(Rodriguez, n.d.)');
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

      const result = formatHarvardCitation(metadata);

      expect(result.reference).toContain('World Health Organization');
      expect(result.inText).toBe('(World Health Organization, 2020)');
    });
  });

  describe('Initials', () => {
    it('should handle authors with initials directly provided', () => {
      const metadata: SourceMetadata = {
        sourceType: 'journal-article',
        title: 'Test article',
        authors: [
          { lastName: 'Chen', firstName: 'Wei', initials: 'W' }
        ],
        journal: 'Test Journal',
        year: 2020,
        volume: '1',
        issue: '1',
        pages: '1-5'
      };

      const result = formatHarvardCitation(metadata);

      expect(result.reference).toContain('Chen, W');
    });
  });
});
