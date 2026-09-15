'use client';

import React, { useState } from 'react';
import { GOOGLE_APPS_SCRIPT_CODE } from '@/lib/gas-code';
import {
  X,
  Copy,
  Check,
  RefreshCw,
  Database,
  AlertCircle,
  Tag as TagIcon,
  Plus,
  Trash2,
  Edit2,
  Save,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptUrl: string;
  onSaveScriptUrl: (url: string) => void;
  onTestConnection: (url: string) => Promise<boolean>;
  onForceSync: () => void;
  onResetData: () => void;
  tags?: string[];
  onAddTag?: (tag: string) => void;
  onEditTag?: (oldTag: string, newTag: string) => void;
  onDeleteTag?: (tag: string) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  scriptUrl,
  onSaveScriptUrl,
  onTestConnection,
  onForceSync,
  onResetData,
  tags = ['QUICK < 30 MIN', 'HIGH-PROTEIN', 'VEGETARIAN', 'COMFORT', 'SEAFOOD', 'GLUTEN-FREE', 'MEAL-PREP', 'KID-FRIENDLY'],
  onAddTag,
  onEditTag,
  onDeleteTag,
}: SettingsModalProps) {
  const [urlInput, setUrlInput] = useState(scriptUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'sync' | 'tags' | 'code' | 'help'>('sync');

  // Tag management state
  const [newTagInput, setNewTagInput] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editingTagValue, setEditingTagValue] = useState('');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const ok = await onTestConnection(urlInput);
      if (ok) {
        setTestResult({ success: true, msg: 'Connected successfully to Google Sheet endpoint!' });
        onSaveScriptUrl(urlInput);
      } else {
        setTestResult({
          success: false,
          msg: 'Connection failed. Verify Web App is deployed with "Anyone" access.',
        });
      }
    } catch (err: any) {
      setTestResult({ success: false, msg: err.message || 'Error reaching endpoint.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveAndSync = () => {
    onSaveScriptUrl(urlInput);
    onForceSync();
    onClose();
  };

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTagInput.trim().toUpperCase();
    if (!clean) return;
    if (onAddTag) {
      onAddTag(clean);
    }
    setNewTagInput('');
  };

  const handleSaveEditTag = (oldTag: string) => {
    const clean = editingTagValue.trim().toUpperCase();
    if (clean && clean !== oldTag && onEditTag) {
      onEditTag(oldTag, clean);
    }
    setEditingTag(null);
    setEditingTagValue('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#F9F8F3] w-full max-w-lg rounded-3xl border border-[#E5E4DE] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#FFFFFF] border-b border-[#E5E4DE] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#4A6B5D]" />
            <h2 className="font-serif text-xl font-bold text-[#1C1C1E]">
              Settings & Cloud Sync
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F2EFE8] flex items-center justify-center text-[#7C7C80] hover:text-[#1C1C1E] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="flex border-b border-[#E5E4DE] bg-[#FFFFFF] px-6 gap-5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('sync')}
            className={`py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'sync'
                ? 'border-[#4A6B5D] text-[#4A6B5D]'
                : 'border-transparent text-[#7C7C80] hover:text-[#1C1C1E]'
            }`}
          >
            Connection & Sync
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'tags'
                ? 'border-[#4A6B5D] text-[#4A6B5D]'
                : 'border-transparent text-[#7C7C80] hover:text-[#1C1C1E]'
            }`}
          >
            <TagIcon className="w-3.5 h-3.5" />
            <span>Tags ({tags.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'code'
                ? 'border-[#4A6B5D] text-[#4A6B5D]'
                : 'border-transparent text-[#7C7C80] hover:text-[#1C1C1E]'
            }`}
          >
            Apps Script Code
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={`py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'help'
                ? 'border-[#4A6B5D] text-[#4A6B5D]'
                : 'border-transparent text-[#7C7C80] hover:text-[#1C1C1E]'
            }`}
          >
            Setup Guide
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* SYNC TAB */}
          {activeTab === 'sync' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5C5C60] uppercase tracking-wider mb-1.5">
                  Google Apps Script Web App URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E5E4DE] text-xs font-mono text-[#1C1C1E] focus:ring-1 focus:ring-[#4A6B5D] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleTest}
                    disabled={isTesting || !urlInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E5E4DE] text-xs font-semibold text-[#4A6B5D] hover:bg-[#F2F1EA] disabled:opacity-50"
                  >
                    {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Test'}
                  </button>
                </div>
                <p className="text-[11px] text-[#7C7C80] mt-1.5">
                  Plate Expectations operates local-first and mirrors changes automatically to your spreadsheet.
                </p>
              </div>

              {/* Test Result alert */}
              {testResult && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    testResult.success
                      ? 'bg-[#EAF2EE] text-[#4A6B5D] border border-[#D0E2D8]'
                      : 'bg-[#FCEDE8] text-[#E05A47] border border-[#F5CEC7]'
                  }`}
                >
                  {testResult.success ? (
                    <Check className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{testResult.msg}</span>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={handleSaveAndSync}
                  className="w-full py-2.5 rounded-xl bg-[#4A6B5D] text-white text-xs font-semibold hover:bg-[#3F5E4D] shadow-xs flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Save Endpoint & Sync Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset all recipes, pantry, and meal plans to default starter data for Aatish & Faeeza?')) {
                      onResetData();
                      onClose();
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E5E4DE] text-xs font-semibold text-[#7C7C80] hover:text-[#E05A47] hover:bg-[#FFF5F5]"
                >
                  Reset to Starter Recipes & Pantry
                </button>
              </div>
            </div>
          )}

          {/* TAGS MANAGEMENT TAB */}
          {activeTab === 'tags' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-[#5C5C60] uppercase tracking-wider mb-1.5">
                  Add New Tag
                </h3>
                <form onSubmit={handleCreateTag} className="flex gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="e.g. SLOW COOKER, BBQ..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#E5E4DE] text-xs font-medium text-[#1C1C1E] focus:outline-none focus:ring-1 focus:ring-[#4A6B5D]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#4A6B5D] text-white text-xs font-semibold hover:bg-[#3F5E4D] flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </form>
              </div>

              <div>
                <h3 className="text-xs font-bold text-[#5C5C60] uppercase tracking-wider mb-2">
                  Existing Recipe Tags ({tags.length})
                </h3>
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {tags.map((tag) => {
                    const isEditing = editingTag === tag;
                    return (
                      <div
                        key={tag}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E5E4DE]"
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1 mr-2">
                            <input
                              type="text"
                              value={editingTagValue}
                              onChange={(e) => setEditingTagValue(e.target.value)}
                              className="flex-1 px-2.5 py-1 rounded-lg border border-[#4A6B5D] text-xs text-[#1C1C1E] focus:outline-none"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEditTag(tag);
                                if (e.key === 'Escape') setEditingTag(null);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEditTag(tag)}
                              className="p-1.5 rounded-lg bg-[#4A6B5D] text-white"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-[#1C1C1E] px-2 py-0.5 rounded-md bg-[#F4F3ED]">
                            {tag}
                          </span>
                        )}

                        {!isEditing && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTag(tag);
                                setEditingTagValue(tag);
                              }}
                              className="p-1 text-[#7C7C80] hover:text-[#4A6B5D] transition-colors"
                              title="Rename tag"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {onDeleteTag && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Delete tag "${tag}"?`)) {
                                    onDeleteTag(tag);
                                  }
                                }}
                                className="p-1 text-[#7C7C80] hover:text-[#E05A47] transition-colors"
                                title="Delete tag"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* CODE TAB */}
          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5C5C60] uppercase tracking-wider">
                  Code.gs (Copy & Paste to Apps Script)
                </span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-xs font-semibold text-[#4A6B5D] bg-[#FFFFFF] px-3 py-1.5 rounded-lg border border-[#E5E4DE] hover:bg-[#F2F1EA]"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#4A6B5D]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-[#1C1C1E] text-[#A3C9B8] text-[10px] font-mono leading-relaxed overflow-x-auto max-h-72 border border-[#2C2C2E]">
                {GOOGLE_APPS_SCRIPT_CODE}
              </pre>
            </div>
          )}

          {/* HELP TAB */}
          {activeTab === 'help' && (
            <div className="space-y-3 text-xs text-[#2C2C2E] leading-relaxed">
              <h4 className="font-bold text-[#1C1C1E]">
                How to connect your Google Sheet in 60 seconds:
              </h4>
              <ol className="list-decimal pl-4 space-y-2 text-[#5C5C60]">
                <li>
                  Open a new Google Sheet at{' '}
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#4A6B5D] underline font-medium"
                  >
                    sheets.new
                  </a>
                  .
                </li>
                <li>
                  Go to <strong>Extensions &gt; Apps Script</strong>.
                </li>
                <li>
                  Replace the default code with the script from the{' '}
                  <strong>&quot;Apps Script Code&quot;</strong> tab above.
                </li>
                <li>
                  Click <strong>Deploy &gt; New deployment</strong>.
                </li>
                <li>
                  Select type <strong>&quot;Web app&quot;</strong>, set &quot;Execute as:
                  <strong>Me</strong>&quot; and &quot;Who has access: <strong>Anyone</strong>
                  &quot;.
                </li>
                <li>
                  Copy the generated Web App URL and paste it into the Connection tab.
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
