'use client';

import { useState } from 'react';
import { SourceMetadata, Author, SourceType } from '@/types/citation';

type CitationStyle = 'ama' | 'vancouver' | 'apa' | 'harvard' | 'mla' | 'chicago' | 'ieee';

interface ManualEntryFormProps {
  onCitationGenerated: (metadata: SourceMetadata) => void;
  onCancel: () => void;
}

export default function ManualEntryForm({ onCitationGenerated, onCancel }: ManualEntryFormProps) {
  const [sourceType, setSourceType] = useState<SourceType>('journal-article');
  const [citationStyle, setCitationStyle] = useState<CitationStyle>('ama');
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState<Author[]>([{ lastName: '', firstName: '' }]);
  const [journal, setJournal] = useState('');
  const [year, setYear] = useState('');
  const [volume, setVolume] = useState('');
  const [issue, setIssue] = useState('');
  const [pages, setPages] = useState('');
  const [doi, setDoi] = useState('');
  const [url, setUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddAuthor = () => {
    setAuthors([...authors, { lastName: '', firstName: '' }]);
  };

  const handleRemoveAuthor = (index: number) => {
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const handleAuthorChange = (index: number, field: keyof Author, value: string) => {
    const updatedAuthors = [...authors];
    updatedAuthors[index] = { ...updatedAuthors[index], [field]: value };
    setAuthors(updatedAuthors);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!journal.trim()) {
      newErrors.journal = 'Journal is required';
    }

    if (!year.trim()) {
      newErrors.year = 'Year is required';
    } else if (!/^\d{4}$/.test(year)) {
      newErrors.year = 'Year must be a 4-digit number';
    }

    const validAuthors = authors.filter(a => a.lastName || a.firstName);
    if (validAuthors.length === 0) {
      newErrors.authors = 'At least one author is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = () => {
    if (!validateForm()) {
      return;
    }

    const metadata: SourceMetadata = {
      sourceType,
      title: title.trim(),
      authors: authors.filter(a => a.lastName || a.firstName),
      journal: journal.trim(),
      year: year ? parseInt(year) : undefined,
      volume: volume.trim() || undefined,
      issue: issue.trim() || undefined,
      pages: pages.trim() || undefined,
      doi: doi.trim() || undefined,
      url: url.trim() || undefined,
    };

    onCitationGenerated(metadata);
  };

  return (
    <div className="mt-6 bg-white border border-gray-200 p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#1e3a5f]">Manual Citation Entry</h3>
        <button
          onClick={onCancel}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
      </div>

      <div className="space-y-6">
        {/* Source Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Source Type</label>
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as SourceType)}
            className="w-full px-3 py-2 border border-gray-300 focus:border-[#4a90a4] focus:ring-1 focus:ring-[#4a90a4] outline-none text-sm"
          >
            <option value="journal-article">Journal Article</option>
            <option value="website">Content-1 Website</option>
            <option value="book">Book</option>
            <option value="book-chapter">Book Chapter</option>
            <option value="report">Report</option>
            <option value="conference-paper">Conference Paper</option>
            <option value="thesis">Thesis/Dissertation</option>
            <option value="preprint">Preprint</option>
          </select>
        </div>

        {/* Citation Style Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Citation Style</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCitationStyle('ama')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                citationStyle === 'ama'
                  ? 'bg-[#1e3a5f] text-white'
                  : 'bg-[#f5f5f5] text-gray-700 hover:bg-gray-200'
              }`}
            >
              AMA
            </button>
            <button
              onClick={() => setCitationStyle('vancouver')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                citationStyle === 'vancouver'
                  ? 'bg-[#1e3a5f] text-white'
                  : 'bg-[#f5f5f5] text-gray-700 hover:bg-gray-200'
              }`}
            >
              Vancouver
            </button>
            <button
              onClick={() => setCitationStyle('apa')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                citationStyle === 'apa'
                  ? 'bg-[#1e3a5f] text-white'
                  : 'bg-[#f5f5f5] text-gray-700 hover:bg-gray-200'
              }`}
            >
              APA 7
            </button>
            <button
              onClick={() => setCitationStyle('harvard')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                citationStyle === 'harvard'
                  ? 'bg-[#1e3a5f] text-white'
                  : 'bg-[#f5f5f5] text-gray-700 hover:bg-gray-200'
              }`}
            >
              Harvard
            </button>
            <button
              onClick={() => setCitationStyle('mla')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                citationStyle === 'mla'
                  ? 'bg-[#1e3a5f] text-white'
                  : 'bg-[#f5f5f5] text-gray-700 hover:bg-gray-200'
              }`}
            >
              MLA 9
            </button>
            <button
              onClick={() => setCitationStyle('chicago')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                citationStyle === 'chicago'
                  ? 'bg-[#1e3a5f] text-white'
                  : 'bg-[#f5f5f5] text-gray-700 hover:bg-gray-200'
              }`}
            >
              Chicago
            </button>
            <button
              onClick={() => setCitationStyle('ieee')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                citationStyle === 'ieee'
                  ? 'bg-[#1e3a5f] text-white'
                  : 'bg-[#f5f5f5] text-gray-700 hover:bg-gray-200'
              }`}
            >
              IEEE
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-3 py-2 border focus:border-[#4a90a4] focus:ring-1 focus:ring-[#4a90a4] outline-none text-sm ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Article title"
          />
          {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
        </div>

        {/* Authors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Authors <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {authors.map((author, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Last name"
                    value={author.lastName || ''}
                    onChange={(e) => handleAuthorChange(index, 'lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#4a90a4] focus:ring-1 focus:ring-[#4a90a4] outline-none text-sm"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="First name"
                    value={author.firstName || ''}
                    onChange={(e) => handleAuthorChange(index, 'firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#4a90a4] focus:ring-1 focus:ring-[#4a90a4] outline-none text-sm"
                  />
                </div>
                {authors.length > 1 && (
                  <button
                    onClick={() => handleRemoveAuthor(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={handleAddAuthor}
              className="text-sm text-[#4a90a4] hover:text-[#1e3a5f] font-medium"
            >
              + Add Author
            </button>
          </div>
          {errors.authors && <p className="text-xs text-red-600 mt-1">{errors.authors}</p>}
        </div>

        {/* Journal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Journal <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            className={`w-full px-3 py-2 border focus:border-[#4a90a4] focus:ring-1 focus:ring-[#4a90a4] outline-none text-sm ${
              errors.journal ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Journal name"
          />
          {errors.journal && <p className="text-xs text-red-600 mt-1">{errors.journal}</p>}
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Year <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={`w-full px-3 py-2 border focus:border-[#4a90a4] focus:ring-1 focus:ring-[#4a90a4] outline-none text-sm ${
              errors.year ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="2020"
          />
          {errors.year && <p className="text-xs text-red-600 mt-1">{errors.year}</p>}
        </div>

        {/* Volume and Issue */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Volume</label>
            <input
              type="text"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 focus:border-[#4a90a4] focus:ring-1 focus:ring-[#4a90a4] outline-none text-sm"
              placeholder="10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Issue</label>
            <input
              type="text"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 focus:border-[#4a90a4] focus:ring-1 focus:ring-[#4a90a4] outline-none text-sm"
              placeholder="2"
            />
          </div>
        </div>

        {/* Pages */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pages</label>
          <input
            type="text"
            value={pages}
            onChange={(e) => setPages(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 focus:border-[#4a90a4] focus:ring-1 focus:ring-[#4a90a4] outline-none text-sm"
            placeholder="123-145"
          />
        </div>

        {/* DOI */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">DOI</label>
          <input
            type="text"
            value={doi}
            onChange={(e) => setDoi(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 focus:border-[#4a90a4] focus:ring-1 focus:ring-[#4a90a4] outline-none text-sm"
            placeholder="10.1234/example"
          />
        </div>

        {/* URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 focus:border-[#4a90a4] focus:ring-1 focus:ring-[#4a90a4] outline-none text-sm"
            placeholder="https://example.com"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          className="w-full px-8 py-3 bg-[#1e3a5f] text-white font-medium hover:bg-[#152a45] transition-colors"
        >
          Generate Citation
        </button>
      </div>
    </div>
  );
}
