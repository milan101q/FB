
import React, { useState } from 'react';

interface CopyFieldProps {
  label: string;
  value: string;
  isMultiline?: boolean;
}

export const CopyField: React.FC<CopyFieldProps> = ({ label, value, isMultiline = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-2 w-full mb-5 group">
      <div className="flex justify-between items-center px-1">
        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</label>
        {copied && (
          <span className="text-[10px] text-blue-600 font-black animate-in fade-in slide-in-from-right-2">
            COPIED TO CLIPBOARD!
          </span>
        )}
      </div>
      <div className={`relative transition-all duration-300 ${copied ? 'scale-[1.01]' : ''}`}>
        {isMultiline ? (
          <textarea
            readOnly
            value={value}
            onClick={handleCopy}
            className={`w-full p-4 pr-12 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none transition-all min-h-[160px] resize-none cursor-pointer leading-relaxed ${
              copied ? 'border-blue-500 bg-blue-50/30' : 'hover:border-slate-300'
            }`}
          />
        ) : (
          <input
            type="text"
            readOnly
            value={value}
            onClick={handleCopy}
            className={`w-full p-4 pr-12 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none transition-all cursor-pointer ${
              copied ? 'border-blue-500 bg-blue-50/30 text-blue-700' : 'hover:border-slate-300 text-slate-700'
            }`}
          />
        )}
        <button
          onClick={handleCopy}
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
            copied ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 hover:text-blue-600 hover:shadow-md'
          } ${isMultiline ? 'top-6 translate-y-0' : ''}`}
          title="Copy to clipboard"
        >
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};
