import { formatIEEECitation } from '../ieee-formatter';
import { SourceMetadata } from '@/types/citation';

describe('IEEE Formatter', () => {
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

      const result = formatIEEECitation(metadata);

      expect(result.reference).toContain('J. Smith');
      expect(result.reference).toContain('"The effect of exercise on mental health"');
      expect(result.reference).toContain('*Journal of Health*');
      expect(result.reference).toContain('vol. 10');
      expect(result.reference).toContain('no. 2');
      expect(result.reference).toContain('pp. 123-145');
      expect(result.reference).toContain('2020');
      expect(result.inText).toBe('[#]');
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

      const result = formatIEEECitation(metadata);

      expect(result.reference).toContain('M. Johnson');
      expect(result.reference).toContain('R. Williams');
      expect(result.inText).toBe('[#]');
    });
  });

  describe('Multiple Authors (up to 6)', () => {
    it('should list all authors up to 6', () => {
      const metadata: SourceMetadata = {
        sourceType: 'journal-article',
        title: 'Multi-author research',
        authors: [
          { lastName: 'Brown', firstName: 'Alice' },
          { lastName: 'Davis', firstName: 'James' },
          { lastName: 'Miller', firstName: 'Sarah' },
          { lastName: 'Wilson', firstName: 'Emily' },
          { lastName: 'Taylor', firstName: 'Michael' },
          { lastName: 'Anderson', firstName: 'Lisa' }
        ],
        journal: 'Multi-Author Journal',
        year: 2022,
        volume: '20',
        issue: '1',
        pages: '100-120'
      };

      const result = formatIEEECitation(metadata);

      expect(result.reference).toContain('A. Brown');
      expect(result.reference).toContain('J. Davis');
      expect(result.reference).toContain('S. Miller');
      expect(result.reference).toContain('E. Wilson');
      expect(result.reference).toContain('M. Taylor');
      expect(result.reference).toContain('L. Anderson');
      expect(result.reference).not.toContain('et al.');
    });
  });

  describe('Multiple Authors (7+)', () => {
    it('should use et al. for 7+ authors', () => {
      const metadata: SourceMetadata = {
        sourceType: 'journal-article',
        title: 'Large author group research',
        authors: [
          { lastName: 'Chen', firstName: 'Wei' },
          { lastName: 'Lee', firstName: 'Kevin' },
          { lastName: 'Garcia', firstName: 'Maria' },
          { lastName: 'Martinez', firstName: 'Carlos' },
          { lastName: 'Rodriguez', firstName: 'Ana' },
          { lastName: 'Kim', firstName: 'Sung' },
          { lastName: 'Patel', firstName: 'Raj' }
        ],
        journal: 'Large Group Journal',
        year: 2023,
        volume: '25',
        issue: '4',
        pages: '200-220'
      };

      const result = formatIEEECitation(metadata);

      expect(result.reference).toContain('W. Chen');
      expect(result.reference).toContain('et al.');
      expect(result.inText).toBe('[#]');
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

      const result = formatIEEECitation(metadata);

      expect(result.reference).toContain('Available: https://example.com/article');
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

      const result = formatIEEECitation(metadata);

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

      const result = formatIEEECitation(metadata);

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

      const result = formatIEEECitation(metadata);

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

      const result = formatIEEECitation(metadata);

      expect(result.reference).toContain('World Health Organization');
      expect(result.inText).toBe('[#]');
    });
  });

  describe('Initials', () => {
    it('should handle authors with initials directly provided', () => {
      const metadata: SourceMetadata = {
        sourceType: 'journal-article',
        title: 'Test article',
        authors: [
          { lastName: 'Chen', firstName: 'Wei', initials: 'W.' }
        ],
        journal: 'Test Journal',
        year: 2020,
        volume: '1',
        issue: '1',
        pages: '1-5'
      };

      const result = formatIEEECitation(metadata);

      expect(result.reference).toContain('W. Chen');
    });
  });
});
