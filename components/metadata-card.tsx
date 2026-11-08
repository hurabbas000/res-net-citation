'use client';

import { useState } from 'react';
import { SourceMetadata, Author } from '@/types/citation';
import { formatAMACitation } from '@/lib/formatters/ama-formatter';
import { formatVancouverCitation } from '@/lib/formatters/vancouver-formatter';
import { formatAPACitation } from '@/lib/formatters/apa-formatter';
import { formatHarvardCitation } from '@/lib/formatters/harvard-formatter';
import { formatMLACitation } from '@/lib/formatters/mla-formatter';
import { formatChicagoCitation } from '@/lib/formatters/chicago-formatter';
import { formatIEEECitation } from '@/lib/formatters/ieee-formatter';

type CitationStyle = 'ama' | 'vancouver' | 'apa' | 'harvard' | 'mla' | 'chicago' | 'ieee';

interface MetadataCardProps {
  metadata: SourceMetadata;
  onUpdate: (updatedMetadata: SourceMetadata) => void;
  onAddToReferenceList?: () => void;
}

export default function MetadataCard({ metadata, onUpdate, onAddToReferenceList }: MetadataCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMetadata, setEditedMetadata] = useState<SourceMetadata>({ ...metadata });
  const [citationStyle, setCitationStyle] = useState<CitationStyle>('ama');
  const [copiedReference, setCopiedReference] = useState(false);
  const [copiedInText, setCopiedInText] = useState(false);

  const handleEdit = () => {
    setEditedMetadata({ ...metadata });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    onUpdate(editedMetadata);
    setIsEditing(false);
  };

  const handleAuthorChange = (index: number, field: keyof Author, value: string) => {
    const updatedAuthors = [...(editedMetadata.authors || [])];
    updatedAuthors[index] = { ...updatedAuthors[index], [field]: value };
    setEditedMetadata({ ...editedMetadata, authors: updatedAuthors });
  };

  const handleAddAuthor = () => {
    const updatedAuthors = [...(editedMetadata.authors || []), { lastName: '', firstName: '' }];
    setEditedMetadata({ ...editedMetadata, authors: updatedAuthors });
  };

  const handleRemoveAuthor = (index: number) => {
    const updatedAuthors = editedMetadata.authors?.filter((_, i) => i !== index);
    setEditedMetadata({ ...editedMetadata, authors: updatedAuthors });
  };

  const handleFieldChange = (field: keyof SourceMetadata, value: string | number | undefined) => {
    setEditedMetadata({ ...editedMetadata, [field]: value });
  };

  const handleStyleChange = (style: CitationStyle) => {
    setCitationStyle(style);
  };

  const formatCitation = () => {
    switch (citationStyle) {
      case 'ama':
        return formatAMACitation(metadata);
      case 'vancouver':
        return formatVancouverCitation(metadata);
      case 'apa':
        return formatAPACitation(metadata);
      case 'harvard':
        return formatHarvardCitation(metadata);
      case 'mla':
        return formatMLACitation(metadata);
      case 'chicago':
        return formatChicagoCitation(metadata);
      case 'ieee':
        return formatIEEECitation(metadata);
      default:
        return formatAMACitation(metadata);
    }
  };

  const handleCopyReference = async () => {
    try {
      const citation = formatCitation();
      await navigator.clipboard.writeText(citation.reference);
      setCopiedReference(true);
      setTimeout(() => setCopiedReference(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers or permission errors
      const citation = formatCitation();
      const textArea = document.createElement('textarea');
      textArea.value = citation.reference;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedReference(true);
        setTimeout(() => setCopiedReference(false), 2000);
      } catch (fallbackError) {
        console.error('Fallback copy also failed:', fallbackError);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleCopyInText = async () => {
    try {
      const citation = formatCitation();
      await navigator.clipboard.writeText(citation.inText);
      setCopiedInText(true);
      setTimeout(() => setCopiedInText(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers or permission errors
      const citation = formatCitation();
      const textArea = document.createElement('textarea');
      textArea.value = citation.inText;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedInText(true);
        setTimeout(() => setCopiedInText(false), 2000);
      } catch (fallbackError) {
        console.error('Fallback copy also failed:', fallbackError);
      }
      document.body.removeChild(textArea);
    }
  };

  const citation = formatCitation();

  if (isEditing) {
    return (
      <div className="mt-6 p-6 bg-white border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#1e3a5f]">Edit Source Details</h3>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-[#1e3a5f] hover:bg-[#152a45] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={editedMetadata.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 focus:border-[#4a90a4] focus:ring-1 focus:ring-[#4a90a4] outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Authors</label>
            <div className="space-y-2">
              {editedMetadata.authors?.map((author, index) => (
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
                  <button
                    onClick={() => handleRemoveAuthor(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddAuthor}
                className="text-sm text-[#4a90a4] hover:text-[#1e3a5f] font-medium"
              >
                + Add Author
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Journal</label>
            <input
              type="text"
              value={editedMetadata.journal || ''}
              onChange={(e) => handleFieldChange('journal', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 focus:border-[#4a90a4] focus:ring-1 focus:ring-[#4a90a4] outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Publication Year</label>
              <input
                type="text"
                value={editedMetadata.year || ''}
                onChange={(e) => handleFieldChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 focus:border-[#4a90a4] focus:ring-1 focus:ring-[#4a90a4] outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Volume</label>
              <input
                type="text"
                value={editedMetadata.volume || ''}
                onChange={(e) => handleFieldChange('volume', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 focus:border-[#4a90a4] focus:ring-1 focus:ring-[#4a90a4] outline-none text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue</label>
              <input
                type="text"
                value={editedMetadata.issue || ''}
                onChange={(e) => handleFieldChange('issue', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 focus:border-[#4a90a4] focus:ring-1 focus:ring-[#4a90a4] outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pages</label>
              <input
                type="text"
                value={editedMetadata.pages || ''}
                onChange={(e) => handleFieldChange('pages', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 focus:border-[#4a90a4] focus:ring-1 focus:ring-[#4a90a4] outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">DOI</label>
            <input
              type="text"
              value={editedMetadata.doi || ''}
              onChange={(e) => handleFieldChange('doi', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 focus:border-[#4a90a4] focus:ring-1 focus:ring-[#4a90a4] outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PMID</label>
            <input
              type="text"
              value={editedMetadata.pmid || ''}
              onChange={(e) => handleFieldChange('pmid', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 focus:border-[#4a90a4] focus:ring-1 focus:ring-[#4a90a4] outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input
              type="text"
              value={editedMetadata.url || ''}
              onChange={(e) => handleFieldChange('url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 focus:border-[#4a90a4] focus:ring-1 focus:ring-[#4a90a4] outline-none text-sm"
            />
          </div>
        </div>
      </div>
    );
  }

  const formatAuthors = (authors?: Author[]) => {
    if (!authors || authors.length === 0) return null;
    return authors.map((author, index) => {
      const name = author.fullName || `${author.lastName}${author.firstName ? `, ${author.firstName}` : ''}`;
      return index === 0 ? name : `, ${name}`;
    });
  };

  const formatVolumeIssue = () => {
    const parts = [];
    if (metadata.volume) parts.push(`Vol. ${metadata.volume}`);
    if (metadata.issue) parts.push(`No. ${metadata.issue}`);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  const getMissingFields = () => {
    const missing: string[] = [];
    const fieldLabels: Record<string, string> = {
      title: 'Title',
      authors: 'Authors',
      journal: 'Journal',
      year: 'Publication Year',
      volume: 'Volume',
      issue: 'Issue',
      pages: 'Pages',
      doi: 'DOI',
      pmid: 'PMID',
    };

    if (!metadata.title) missing.push(fieldLabels.title);
    if (!metadata.authors || metadata.authors.length === 0) missing.push(fieldLabels.authors);
    if (!metadata.journal) missing.push(fieldLabels.journal);
    if (!metadata.year) missing.push(fieldLabels.year);
    if (!metadata.volume) missing.push(fieldLabels.volume);
    if (!metadata.issue) missing.push(fieldLabels.issue);
    if (!metadata.pages) missing.push(fieldLabels.pages);
    if (!metadata.doi) missing.push(fieldLabels.doi);
    if (!metadata.pmid) missing.push(fieldLabels.pmid);

    return missing;
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Citation Style Selector */}
      <div className="bg-white border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1e3a5f]">Citation Style</h3>
          <button
            onClick={handleEdit}
            className="px-4 py-2 text-sm font-medium text-[#4a90a4] hover:text-[#1e3a5f] border border-[#4a90a4] hover:bg-[#e8f4f8] transition-colors"
          >
            Edit Metadata
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStyleChange('ama')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              citationStyle === 'ama'
                ? 'bg-[#1e3a5f] text-white'
                : 'bg-[#f5f5f5] text-gray-700 hover:bg-gray-200'
            }`}
          >
            AMA
          </button>
          <button
            onClick={() => handleStyleChange('vancouver')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              citationStyle === 'vancouver'
                ? 'bg-[#1e3a5f] text-white'
                : 'bg-[#f5f5f5] text-gray-700 hover:bg-gray-200'
            }`}
          >
            Vancouver
          </button>
          <button
            onClick={() => handleStyleChange('apa')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              citationStyle === 'apa'
                ? 'bg-[#1e3a5f] text-white'
                : 'bg-[#f5f5f5] text-gray-700 hover:bg-gray-200'
            }`}
          >
            APA 7
          </button>
          <button
            onClick={() => handleStyleChange('harvard')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              citationStyle === 'harvard'
                ? 'bg-[#1e3a5f] text-white'
                : 'bg-[#f5f5f5] text-gray-700 hover:bg-gray-200'
            }`}
          >
            Harvard
          </button>
          <button
            onClick={() => handleStyleChange('mla')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              citationStyle === 'mla'
                ? 'bg-[#1e3a5f] text-white'
                : 'bg-[#f5f5f5] text-gray-700 hover:bg-gray-200'
            }`}
          >
            MLA 9
          </button>
          <button
            onClick={() => handleStyleChange('chicago')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              citationStyle === 'chicago'
                ? 'bg-[#1e3a5f] text-white'
                : 'bg-[#f5f5f5] text-gray-700 hover:bg-gray-200'
            }`}
          >
            Chicago
          </button>
          <button
            onClick={() => handleStyleChange('ieee')}
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

      {/* Source Details */}
      <div className="bg-white border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-[#4a90a4]"></div>
          <h3 className="text-lg font-semibold text-[#1e3a5f]">Source identified</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">Metadata retrieved successfully</p>

        <div className="space-y-4">
          {metadata.title && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Title</p>
              <p className="text-base text-gray-900 font-medium">{metadata.title}</p>
            </div>
          )}

          {metadata.authors && metadata.authors.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Authors</p>
              <p className="text-sm text-gray-900">{formatAuthors(metadata.authors)}</p>
            </div>
          )}

          {metadata.journal && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Journal</p>
              <p className="text-sm text-gray-900">{metadata.journal}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {metadata.year && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Publication Year</p>
                <p className="text-sm text-gray-900">{metadata.year}</p>
              </div>
            )}

            {formatVolumeIssue() && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Volume/Issue</p>
                <p className="text-sm text-gray-900">{formatVolumeIssue()}</p>
              </div>
            )}
          </div>

          {metadata.pages && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Pages</p>
              <p className="text-sm text-gray-900">{metadata.pages}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {metadata.doi && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">DOI</p>
                <p className="text-sm text-gray-900 font-mono">{metadata.doi}</p>
              </div>
            )}

            {metadata.pmid && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">PMID</p>
                <p className="text-sm text-gray-900 font-mono">{metadata.pmid}</p>
              </div>
            )}
          </div>

          {metadata.url && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">URL</p>
              <a
                href={metadata.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#4a90a4] hover:text-[#1e3a5f] hover:underline"
              >
                {metadata.url}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Formatted Citation */}
      <div className="bg-white border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4">Citation</h3>
        <div className="bg-[#f5f5f5] p-4 mb-3">
          <p className="text-sm text-gray-900 font-mono">{citation.reference}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopyReference}
            className="px-4 py-2 text-sm font-medium text-[#4a90a4] hover:text-[#1e3a5f] border border-[#4a90a4] hover:bg-[#e8f4f8] transition-colors flex items-center gap-2"
            aria-label="Copy citation to clipboard"
          >
            {copiedReference ? 'Copied ✓' : 'Copy Citation'}
          </button>
          {onAddToReferenceList && (
            <button
              onClick={onAddToReferenceList}
              className="px-4 py-2 text-sm font-medium text-white bg-[#1e3a5f] hover:bg-[#152a45] transition-colors"
            >
              Add to Reference List
            </button>
          )}
        </div>
      </div>

      {/* In-Text Citation */}
      <div className="bg-white border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4">In-text citation</h3>
        <div className="bg-[#f5f5f5] p-4 mb-3">
          <p className="text-sm text-gray-900 font-mono">{citation.inText}</p>
        </div>
        <button
          onClick={handleCopyInText}
          className="px-4 py-2 text-sm font-medium text-[#4a90a4] hover:text-[#1e3a5f] border border-[#4a90a4] hover:bg-[#e8f4f8] transition-colors flex items-center gap-2"
          aria-label="Copy in-text citation to clipboard"
        >
          {copiedInText ? 'Copied ✓' : 'Copy'}
        </button>
      </div>

      {/* Citation Verification Notice */}
      <div className="bg-[#e8f4f8] border border-[#4a90a4] p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-[#4a90a4] mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#1e3a5f] mb-1">
              Generated from available source metadata. Please verify the citation details before using it in academic work.
            </p>
            {getMissingFields().length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-[#4a90a4] mb-1">
                  Some source details could not be verified.
                </p>
                <p className="text-xs text-gray-600">
                  Missing fields: {getMissingFields().join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
