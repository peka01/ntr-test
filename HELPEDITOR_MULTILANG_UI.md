# Multi-Language Help Editor - UI Components to Add

Since the file has encoding issues with emojis, I'll provide the UI component code to add manually.

## Add this to the render function (around line 1400+, after the header):

```tsx
{/* Language Tabs and Sync Controls */}
<div className="border-b border-slate-200 bg-slate-50 px-6 py-3">
  <div className="flex items-center justify-between">
    {/* Language Tabs */}
    <div className="flex items-center space-x-2">
      <button
        onClick={() => switchLanguageTab('sv')}
        className={`px-4 py-2 rounded-t-lg font-medium transition-colors relative ${
          activeLanguageTab === 'sv'
            ? 'bg-white text-cyan-600 border border-b-0 border-slate-200'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        Svenska (SV)
        {languageChanges.sv && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" title="Unsaved changes"></span>
        )}
      </button>
      <button
        onClick={() => switchLanguageTab('en')}
        className={`px-4 py-2 rounded-t-lg font-medium transition-colors relative ${
          activeLanguageTab === 'en'
            ? 'bg-white text-cyan-600 border border-b-0 border-slate-200'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        English (EN)
        {languageChanges.en && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" title="Unsaved changes"></span>
        )}
      </button>
    </div>

    {/* Sync and Copy Controls */}
    <div className="flex items-center space-x-3">
      {/* Comparison View Toggle */}
      <button
        onClick={() => setShowComparison(!showComparison)}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          showComparison
            ? 'bg-cyan-100 text-cyan-700 border border-cyan-300'
            : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
        }`}
        title="Show side-by-side comparison"
      >
        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
        </svg>
        Compare
      </button>

      {/* Sync Mode Toggle */}
      <button
        onClick={() => setSyncMode(!syncMode)}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          syncMode
            ? 'bg-purple-100 text-purple-700 border border-purple-300'
            : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
        }`}
        title="When enabled, changes apply to all languages simultaneously"
      >
        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Sync Mode {syncMode ? 'ON' : 'OFF'}
      </button>

      {/* Copy Buttons */}
      <div className="flex items-center space-x-1">
        <button
          onClick={() => copyToLanguage('sv', 'en')}
          className="px-2 py-1.5 bg-white text-slate-600 border border-slate-300 rounded text-xs hover:bg-slate-50 transition-colors"
          title="Copy Swedish content to English"
          disabled={activeLanguageTab !== 'sv'}
        >
          SV → EN
        </button>
        <button
          onClick={() => copyToLanguage('en', 'sv')}
          className="px-2 py-1.5 bg-white text-slate-600 border border-slate-300 rounded text-xs hover:bg-slate-50 transition-colors"
          title="Copy English content to Swedish"
          disabled={activeLanguageTab !== 'en'}
        >
          EN → SV
        </button>
      </div>
    </div>
  </div>

  {/* Sync Mode Info Banner */}
  {syncMode && (
    <div className="mt-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded text-sm text-purple-700">
      <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
      <strong>Sync Mode Active:</strong> All changes will be applied to both Swedish and English versions simultaneously
    </div>
  )}
</div>
```

## Replace the editor textarea section with comparison view support:

Find the textarea section (around line 1500) and replace with:

```tsx
{/* Editor/Preview Section */}
<div className="flex-1 flex overflow-hidden">
  {showComparison ? (
    // Side-by-side comparison view
    <div className="flex-1 flex divide-x divide-slate-200">
      {/* Swedish Editor */}
      <div className="flex-1 flex flex-col">
        <div className="px-4 py-2 bg-slate-100 border-b border-slate-200">
          <h4 className="font-medium text-slate-700">Svenska (SV)</h4>
        </div>
        <textarea
          value={languageContents.sv}
          onChange={(e) => {
            const newContents = { ...languageContents, sv: e.target.value };
            setLanguageContents(newContents);
            setLanguageChanges({
              ...languageChanges,
              sv: e.target.value !== languageOriginalContents.sv
            });
            if (activeLanguageTab === 'sv') {
              setMarkdownContent(e.target.value);
              setHasUnsavedChanges(true);
            }
          }}
          className="flex-1 w-full px-4 py-3 font-mono text-sm border-none focus:outline-none resize-none"
          style={{ minHeight: '400px' }}
        />
      </div>

      {/* English Editor */}
      <div className="flex-1 flex flex-col">
        <div className="px-4 py-2 bg-slate-100 border-b border-slate-200">
          <h4 className="font-medium text-slate-700">English (EN)</h4>
        </div>
        <textarea
          value={languageContents.en}
          onChange={(e) => {
            const newContents = { ...languageContents, en: e.target.value };
            setLanguageContents(newContents);
            setLanguageChanges({
              ...languageChanges,
              en: e.target.value !== languageOriginalContents.en
            });
            if (activeLanguageTab === 'en') {
              setMarkdownContent(e.target.value);
              setHasUnsavedChanges(true);
            }
          }}
          className="flex-1 w-full px-4 py-3 font-mono text-sm border-none focus:outline-none resize-none"
          style={{ minHeight: '400px' }}
        />
      </div>
    </div>
  ) : (
    // Normal single editor view
    <>
      <div className="flex-1 overflow-auto">
        <textarea
          ref={editorRef}
          value={markdownContent}
          onChange={(e) => {
            updateContent(e.target.value);
            setCursorPosition(e.target.selectionStart);
          }}
          onSelect={(e) => {
            const target = e.target as HTMLTextAreaElement;
            setCursorPosition(target.selectionStart);
            lastCursorPositionRef.current = target.selectionStart;
          }}
          className="w-full h-full px-6 py-4 font-mono text-sm border-none focus:outline-none resize-none"
          style={{ minHeight: '400px' }}
          placeholder="Enter help content in Markdown format..."
        />
      </div>

      {/* Preview pane - keep existing code */}
      {isPreviewVisible && (
        // ... existing preview code ...
      )}
    </>
  )}
</div>
```

## Update the commit button section to show language status:

Find the commit button area and add this status indicator above it:

```tsx
{/* Changes Summary */}
{(languageChanges.sv || languageChanges.en) && (
  <div className="px-6 py-3 bg-amber-50 border-t border-amber-200">
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center space-x-4">
        <span className="font-medium text-amber-800">Pending changes:</span>
        {languageChanges.sv && (
          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded">Swedish</span>
        )}
        {languageChanges.en && (
          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded">English</span>
        )}
      </div>
      <span className="text-amber-600">
        {(languageChanges.sv && languageChanges.en) ? 'Both' : 'One'} language{(languageChanges.sv && languageChanges.en) ? 's' : ''} will be committed
      </span>
    </div>
  </div>
)}
```

This provides:
1. **Language Tabs** with visual indicators for unsaved changes
2. **Sync Mode** to apply changes to all languages at once
3. **Comparison View** to see both languages side-by-side
4. **Copy Buttons** to quickly copy content between languages
5. **Status Indicators** showing which languages have changes
6. **Multi-language Commit** that commits only changed languages

The UX is intuitive with clear visual feedback!
