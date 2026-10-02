'use client';

import { useState } from 'react';
import { detectAndNormalizeInput } from '@/lib/citation-validator';
import { ValidationResult } from '@/types/citation';

export default function Home() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setValidationResult(null);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = detectAndNormalizeInput(input);
    setValidationResult(result);
    setIsLoading(false);
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
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">Res.Net</h1>
                <p className="text-xs text-slate-500">Research Network</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Citation Generator
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Generate academic citations from a URL, DOI, or PMID.
            </p>
          </div>

          {/* Input Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="citation-input" className="block text-sm font-medium text-slate-700 mb-2">
                  Paste a URL, DOI, or PMID
                </label>
                <textarea
                  id="citation-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="https://pubmed.ncbi.nlm.nih.gov/12345678/"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none resize-none text-slate-900 placeholder:text-slate-400"
                  rows={3}
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading || !input.trim()}
                className="w-full sm:w-auto px-8 py-3 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Processing...' : 'Generate Citation'}
              </button>

              <div className="pt-2">
                <button className="text-sm text-blue-900 hover:text-blue-800 font-medium">
                  Enter citation manually
                </button>
              </div>

              {/* Validation Result */}
              {validationResult && (
                <div className={`mt-4 p-4 rounded-lg ${
                  validationResult.isValid
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={`text-sm font-medium ${
                    validationResult.isValid ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {validationResult.isValid
                      ? `Detected: ${validationResult.type.toUpperCase()}`
                      : validationResult.error
                  }
                  {validationResult.isValid && (
                    <span className="block mt-1 text-xs text-green-600 font-normal">
                      Normalized: {validationResult.normalized}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Supported Styles */}
          <div className="text-center mb-12">
            <p className="text-sm text-slate-500 mb-3">Supported citation styles</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['AMA', 'Vancouver', 'APA 7', 'Harvard', 'MLA', 'Chicago', 'IEEE'].map((style) => (
                <span
                  key={style}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-700"
                >
                  {style}
                </span>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-6 text-center">How it works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Paste your source', description: 'Enter a URL, DOI, or PMID' },
                { step: '2', title: 'Review source details', description: 'Verify the extracted information' },
                { step: '3', title: 'Choose your citation style', description: 'Select from popular formats' },
                { step: '4', title: 'Copy your citation', description: 'Paste it into your document' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-10 h-10 bg-blue-900 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-semibold">
                    {item.step}
                  </div>
                  <h4 className="font-medium text-slate-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Research Network</h3>
            <p className="text-sm text-slate-500">Learn. Research. Publish.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
