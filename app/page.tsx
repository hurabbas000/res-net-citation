'use client';

import { useState } from 'react';
import { detectAndNormalizeInput, extractPMIDFromURL, extractPMCIDFromURL } from '@/lib/citation-validator';
import { fetchPubMedMetadata } from '@/lib/pubmed-service';
import { fetchCrossrefMetadata } from '@/lib/crossref-service';
import { fetchPMCMetadata } from '@/lib/pmc-service';
import { ValidationResult, SourceMetadata } from '@/types/citation';
import MetadataCard from '@/components/metadata-card';
import ManualEntryForm from '@/components/manual-entry-form';
import { formatAMACitation } from '@/lib/formatters/ama-formatter';
import { formatVancouverCitation } from '@/lib/formatters/vancouver-formatter';
import { formatAPACitation } from '@/lib/formatters/apa-formatter';
import { formatHarvardCitation } from '@/lib/formatters/harvard-formatter';
import { formatMLACitation } from '@/lib/formatters/mla-formatter';
import { formatChicagoCitation } from '@/lib/formatters/chicago-formatter';
import { formatIEEECitation } from '@/lib/formatters/ieee-formatter';

export default function Home() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [metadata, setMetadata] = useState<SourceMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [referenceList, setReferenceList] = useState<Array<{ id: string; metadata: SourceMetadata }>>([]);
  const [listCitationStyle, setListCitationStyle] = useState<'ama' | 'vancouver' | 'apa' | 'harvard' | 'mla' | 'chicago' | 'ieee'>('ama');

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setValidationResult(null);
    setMetadata(null);
    setError(null);

    const result = detectAndNormalizeInput(input);
    setValidationResult(result);

    if (!result.isValid) {
      setIsLoading(false);
      return;
    }

    // Fetch metadata based on input type
    let fetchedMetadata: SourceMetadata | null = null;

    if (result.type === 'pmid') {
      fetchedMetadata = await fetchPubMedMetadata(result.normalized);
      if (!fetchedMetadata) {
        setError('Could not retrieve metadata from PubMed. Please check the PMID and try again.');
      }
    } else if (result.type === 'doi') {
      fetchedMetadata = await fetchCrossrefMetadata(result.normalized);
      if (!fetchedMetadata) {
        setError('Could not retrieve metadata from Crossref. Please check the DOI and try again.');
      }
    } else if (result.type === 'url') {
      // Check if it's a PubMed URL
      const pmid = extractPMIDFromURL(result.normalized);
      if (pmid) {
        fetchedMetadata = await fetchPubMedMetadata(pmid);
        if (!fetchedMetadata) {
          setError('Could not retrieve metadata from PubMed. Please check the PMID and try again.');
        }
      } else {
        // Check if it's a PMC URL
        const pmcid = extractPMCIDFromURL(result.normalized);
        if (pmcid) {
          fetchedMetadata = await fetchPMCMetadata(pmcid);
          if (!fetchedMetadata) {
            setError('Could not retrieve metadata from PMC. Please check the PMCID and try again.');
          }
        } else {
          setError('Metadata retrieval is currently only available for PubMed IDs, PubMed URLs, PMC URLs, and DOIs.');
        }
      }
    } else {
      setError('Metadata retrieval is currently only available for PubMed IDs, PubMed URLs, PMC URLs, and DOIs.');
    }

    if (fetchedMetadata) {
      setMetadata(fetchedMetadata);
    }

    setIsLoading(false);
  };

  const handleManualEntryClick = () => {
    setIsManualEntry(true);
    setInput('');
    setValidationResult(null);
    setMetadata(null);
    setError(null);
  };

  const handleManualEntryCancel = () => {
    setIsManualEntry(false);
  };

  const handleManualEntryGenerate = (manualMetadata: SourceMetadata) => {
    setMetadata(manualMetadata);
    setIsManualEntry(false);
  };

  const handleAddToReferenceList = () => {
    if (!metadata) return;

    const newReference = {
      id: Date.now().toString(),
      metadata: { ...metadata },
    };

    setReferenceList([...referenceList, newReference]);
    setMetadata(null);
    setInput('');
    setValidationResult(null);
  };

  const handleRemoveFromReferenceList = (id: string) => {
    setReferenceList(referenceList.filter(ref => ref.id !== id));
  };

  const handleEditReference = (id: string) => {
    const reference = referenceList.find(ref => ref.id === id);
    if (reference) {
      setMetadata(reference.metadata);
      setReferenceList(referenceList.filter(ref => ref.id !== id));
    }
  };

  const handleMoveReference = (fromIndex: number, toIndex: number) => {
    const newReferences = [...referenceList];
    const [moved] = newReferences.splice(fromIndex, 1);
    newReferences.splice(toIndex, 0, moved);
    setReferenceList(newReferences);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#1e3a5f] flex items-center justify-center">
                <span className="text-white font-bold text-base">R</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-[#1e3a5f]">Res.Net</h1>
                <p className="text-xs text-gray-500">Research Network</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Hero Section */}
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#1e3a5f] mb-3">
              Citation Generator
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Generate academic citations from PubMed, PMC, DOI, or enter manually.
            </p>
          </div>

          {/* Input Card */}
          <div className="bg-white border border-gray-200 p-6 sm:p-8 mb-8">
            {!isManualEntry ? (
              <div className="space-y-5">
                <div>
                  <label htmlFor="citation-input" className="block text-sm font-medium text-gray-700 mb-2">
                    Paste a URL, DOI, or PMID
                  </label>
                  <textarea
                    id="citation-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="https://pubmed.ncbi.nlm.nih.gov/12345678/"
                    className="w-full px-4 py-3 border border-gray-300 focus:border-[#4a90a4] focus:ring-1 focus:ring-[#4a90a4] outline-none resize-none text-gray-900 placeholder:text-gray-400 text-sm"
                    rows={3}
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !input.trim()}
                  className="w-full sm:w-auto px-8 py-3 bg-[#1e3a5f] text-white font-medium hover:bg-[#152a45] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Generate Citation'
                  )}
                </button>

                <div className="pt-1">
                  <button
                    onClick={handleManualEntryClick}
                    className="text-sm text-[#4a90a4] hover:text-[#1e3a5f] font-medium"
                  >
                    Enter citation manually
                  </button>
                </div>

                {/* Validation Result */}
                {validationResult && (
                  <div className={`mt-4 p-4 border ${
                    validationResult.isValid
                      ? 'bg-[#e8f4f8] border-[#4a90a4]'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      {validationResult.isValid ? (
                        <svg className="w-5 h-5 text-[#4a90a4] mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <div>
                        <p className={`text-sm font-medium ${
                          validationResult.isValid ? 'text-[#1e3a5f]' : 'text-red-800'
                        }`}>
                          {validationResult.isValid
                            ? `Detected: ${validationResult.type.toUpperCase()}`
                            : validationResult.error
                          }
                        </p>
                        {validationResult.isValid && (
                          <span className="block mt-1 text-xs text-gray-600 font-normal">
                            Normalized: {validationResult.normalized}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-4 border border-red-200 bg-red-50 flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-red-800">Error</p>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {/* Metadata Display */}
                {metadata && (
                  <MetadataCard
                    metadata={metadata}
                    onUpdate={setMetadata}
                    onAddToReferenceList={handleAddToReferenceList}
                  />
                )}
              </div>
            ) : (
              <ManualEntryForm
                onCitationGenerated={handleManualEntryGenerate}
                onCancel={handleManualEntryCancel}
              />
            )}
          </div>

          {/* Reference List Section */}
          {referenceList.length > 0 && (
            <div className="bg-white border border-gray-200 p-6 sm:p-8 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h3 className="text-lg font-semibold text-[#1e3a5f]">
                  Reference List ({referenceList.length})
                </h3>
                <select
                  value={listCitationStyle}
                  onChange={(e) => setListCitationStyle(e.target.value as 'ama' | 'vancouver' | 'apa' | 'harvard' | 'mla' | 'chicago' | 'ieee')}
                  className="px-3 py-2 border border-gray-300 focus:border-[#4a90a4] focus:ring-1 focus:ring-[#4a90a4] outline-none text-sm"
                >
                  <option value="ama">AMA</option>
                  <option value="vancouver">Vancouver</option>
                  <option value="apa">APA 7</option>
                  <option value="harvard">Harvard</option>
                  <option value="mla">MLA 9</option>
                  <option value="chicago">Chicago</option>
                  <option value="ieee">IEEE</option>
                </select>
              </div>

              <div className="space-y-3">
                {referenceList.map((ref, index) => {
                  let citation;
                  switch (listCitationStyle) {
                    case 'ama':
                      citation = formatAMACitation(ref.metadata);
                      break;
                    case 'vancouver':
                      citation = formatVancouverCitation(ref.metadata);
                      break;
                    case 'apa':
                      citation = formatAPACitation(ref.metadata);
                      break;
                    case 'harvard':
                      citation = formatHarvardCitation(ref.metadata);
                      break;
                    case 'mla':
                      citation = formatMLACitation(ref.metadata);
                      break;
                    case 'chicago':
                      citation = formatChicagoCitation(ref.metadata);
                      break;
                    case 'ieee':
                      citation = formatIEEECitation(ref.metadata);
                      break;
                    default:
                      citation = formatAMACitation(ref.metadata);
                  }

                  const isNumberedStyle = listCitationStyle === 'ama' || listCitationStyle === 'vancouver' || listCitationStyle === 'ieee';

                  return (
                    <div
                      key={ref.id}
                      className="flex items-start gap-3 p-4 bg-[#f5f5f5] border border-gray-200"
                    >
                      <div className="flex flex-col gap-1 items-center">
                        {index > 0 && (
                          <button
                            onClick={() => handleMoveReference(index, index - 1)}
                            className="text-gray-400 hover:text-gray-600 text-xs"
                            title="Move up"
                          >
                            ↑
                          </button>
                        )}
                        <span className="text-sm font-medium text-[#1e3a5f]">
                          {isNumberedStyle ? index + 1 : ''}
                        </span>
                        {index < referenceList.length - 1 && (
                          <button
                            onClick={() => handleMoveReference(index, index + 1)}
                            className="text-gray-400 hover:text-gray-600 text-xs"
                            title="Move down"
                          >
                            ↓
                          </button>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-mono">
                          {isNumberedStyle ? citation.reference : citation.reference}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditReference(ref.id)}
                          className="text-sm text-[#4a90a4] hover:text-[#1e3a5f]"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemoveFromReferenceList(ref.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                          title="Remove"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Supported Styles */}
          <div className="text-center mb-12">
            <p className="text-sm text-gray-500 mb-3">Supported citation styles</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['AMA', 'Vancouver', 'APA 7', 'Harvard', 'MLA 9', 'Chicago', 'IEEE'].map((style) => (
                <span
                  key={style}
                  className="px-3 py-1 bg-white border border-gray-200 text-sm text-gray-700"
                >
                  {style}
                </span>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white border border-gray-200 p-6 sm:p-8">
            <h3 className="text-xl font-semibold text-[#1e3a5f] mb-6 text-center">How it works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Paste your source', description: 'Enter a URL, DOI, or PMID' },
                { step: '2', title: 'Review source details', description: 'Verify the extracted information' },
                { step: '3', title: 'Choose your citation style', description: 'Select from popular formats' },
                { step: '4', title: 'Copy your citation', description: 'Paste it into your document' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-10 h-10 bg-[#1e3a5f] text-white flex items-center justify-center mx-auto mb-3 font-semibold">
                    {item.step}
                  </div>
                  <h4 className="font-medium text-[#1e3a5f] mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[#1e3a5f] mb-1">Research Network</h3>
            <p className="text-sm text-gray-500">Learn. Research. Publish.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
