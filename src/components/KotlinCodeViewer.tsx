import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  FileCode, 
  Layers, 
  Database, 
  Cpu, 
  Layout, 
  Palette, 
  Search, 
  Download, 
  FolderTree,
  CheckCircle2
} from 'lucide-react';
import { ANDROID_KOTLIN_CODEBASE, KotlinSourceFile } from '../data/androidKotlinCode';

export const KotlinCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<KotlinSourceFile>(ANDROID_KOTLIN_CODEBASE[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredFiles = ANDROID_KOTLIN_CODEBASE.filter((f) => {
    const matchesSearch = f.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || f.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.filename.replace(/\s+/g, '_');
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryIcon = (cat: KotlinSourceFile['category']) => {
    switch (cat) {
      case 'toml':
      case 'gradle': return <Cpu className="w-3.5 h-3.5 text-amber-400" />;
      case 'theme': return <Palette className="w-3.5 h-3.5 text-pink-400" />;
      case 'di': return <Layers className="w-3.5 h-3.5 text-indigo-400" />;
      case 'model': return <Layers className="w-3.5 h-3.5 text-blue-400" />;
      case 'db': return <Database className="w-3.5 h-3.5 text-emerald-400" />;
      case 'viewmodel': return <Cpu className="w-3.5 h-3.5 text-purple-400" />;
      case 'ui': return <Layout className="w-3.5 h-3.5 text-cyan-400" />;
      default: return <FileCode className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden max-w-4xl mx-auto w-full">
      {/* Header Banner */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white">
                Android Project: NoFap Day Counter
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Package: com.example.nofapcounter • minSdk 24 • targetSdk 35
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Step Config Ready
          </span>
        </div>

        {/* Search & Category Filter */}
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search source files (e.g. MainActivity, build.gradle, Theme)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto pb-0.5">
            {['all', 'gradle', 'toml', 'theme', 'di', 'ui'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* File Tabs Slider */}
        <div className="flex gap-1.5 overflow-x-auto mt-2.5 pb-1 scrollbar-none">
          {filteredFiles.map((file) => (
            <button
              key={file.path}
              onClick={() => setSelectedFile(file)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
                selectedFile.path === file.path
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {getCategoryIcon(file.category)}
              <span>{file.filename}</span>
            </button>
          ))}
        </div>
      </div>

      {/* File Info Bar */}
      <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-2 truncate max-w-[280px] sm:max-w-md">
          <FolderTree className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="font-mono text-[11px] text-blue-300 truncate">{selectedFile.path}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadSingle}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Save</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy File'}</span>
          </button>
        </div>
      </div>

      {/* Description Snippet */}
      <div className="px-4 py-1.5 bg-slate-900/60 border-b border-slate-800/60 text-[11px] text-slate-400 italic">
        💡 {selectedFile.description}
      </div>

      {/* Code Editor Body */}
      <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs leading-relaxed text-slate-200 select-text">
        <pre className="overflow-x-auto whitespace-pre">
          <code>{selectedFile.code}</code>
        </pre>
      </div>
    </div>
  );
};
