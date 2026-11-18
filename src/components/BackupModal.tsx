import React, { useState } from 'react';
import { PlanGoal } from '../types';
import { exportDatabaseJSON, importDatabaseJSON, resetDatabaseToSample } from '../db';
import { exportTodayPlanToMarkdown, exportFullCascadeToMarkdown } from '../utils/exportMarkdown';
import {
  X,
  Download,
  Upload,
  FileText,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  Database,
} from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: PlanGoal[];
  onDataChanged: () => void;
  selectedDate: string;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  goals,
  onDataChanged,
  selectedDate,
}) => {
  const [copiedMd, setCopiedMd] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  if (!isOpen) return null;

  // 1. Export JSON
  const handleExportJSON = async () => {
    try {
      const json = await exportDatabaseJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cascadeplan-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to export JSON: ' + err.message);
    }
  };

  // 2. Import JSON
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const res = await importDatabaseJSON(content);
        if (res.success) {
          setIsError(false);
          setImportStatus(`Success! Restored ${res.count} items.`);
          onDataChanged();
          setTimeout(() => {
            setImportStatus(null);
          }, 3000);
        } else {
          setIsError(true);
          setImportStatus('Import failed: ' + res.message);
        }
      } catch (err: any) {
        setIsError(true);
        setImportStatus('Error reading file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // 3. Export Today's Plan to Markdown
  const handleCopyTodayMarkdown = () => {
    const md = exportTodayPlanToMarkdown(goals, selectedDate);
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleDownloadTodayMarkdown = () => {
    const md = exportTodayPlanToMarkdown(goals, selectedDate);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cascadeplan-daily-${selectedDate}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 4. Export Full Cascade to Markdown
  const handleDownloadFullCascadeMarkdown = () => {
    const md = exportFullCascadeToMarkdown(goals);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cascadeplan-full-hierarchy-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 5. Reset to sample data
  const handleResetSample = async () => {
    if (confirm('Are you sure you want to reload sample starter goals? Any unsaved local edits will be replaced.')) {
      await resetDatabaseToSample();
      onDataChanged();
      setImportStatus('Reloaded sample cascading goals.');
      setTimeout(() => setImportStatus(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-2xl transition-all"
        style={{ color: 'var(--text-main)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Data Portability & Backups</h2>
              <p className="text-xs text-[var(--text-muted)]">
                100% Offline & Local-First. Export anytime to JSON or Markdown.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status notification */}
        {importStatus && (
          <div
            className={`mt-4 p-3 rounded-lg text-xs font-medium border flex items-center gap-2 ${isError
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}
          >
            {isError ? <AlertTriangle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            <span>{importStatus}</span>
          </div>
        )}

        <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Section 1: Full JSON Backup */}
          <div className="p-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)]">
            <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
              <Database className="w-4 h-4 text-[var(--accent-primary)]" />
              Complete JSON State Backup
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-3">
              Full offline dump of all 8 horizons, time-slots, notes, and application settings.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportJSON}
                className="px-3.5 py-2 text-xs font-medium rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export to JSON</span>
              </button>

              <label className="px-3.5 py-2 text-xs font-medium rounded-lg bg-[var(--bg-surface-hover)] hover:bg-[var(--border-color)] text-[var(--text-main)] border border-[var(--border-color)] flex items-center gap-1.5 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>Import JSON Backup</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Section 2: Markdown Portability */}
          <div className="p-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)]">
            <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Markdown Export (Obsidian, Logseq, Dev Journals)
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-3">
              Export clean markdown outlines with checkboxes, Pomodoro tallies, and hourly schedules.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCopyTodayMarkdown}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--bg-surface-hover)] hover:bg-[var(--border-color)] text-[var(--text-main)] border border-[var(--border-color)] flex items-center gap-1.5 transition-colors"
              >
                {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMd ? 'Copied Today Markdown!' : "Copy Today's Plan"}</span>
              </button>

              <button
                onClick={handleDownloadTodayMarkdown}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--bg-surface-hover)] hover:bg-[var(--border-color)] text-[var(--text-main)] border border-[var(--border-color)] flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Today (.md)</span>
              </button>

              <button
                onClick={handleDownloadFullCascadeMarkdown}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--bg-surface-hover)] hover:bg-[var(--border-color)] text-[var(--text-main)] border border-[var(--border-color)] flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Full Hierarchy (.md)</span>
              </button>
            </div>
          </div>

          {/* Section 3: Reset / Sample Data */}
          <div className="p-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  Load Starter / Sample Cascade
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Populate with example 8-horizon goals to explore roll-ups and timelines.
                </p>
              </div>
              <button
                onClick={handleResetSample}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors"
              >
                Reset to Sample
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-[var(--border-color)] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[var(--bg-surface-hover)] hover:bg-[var(--border-color)] text-[var(--text-main)] text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
