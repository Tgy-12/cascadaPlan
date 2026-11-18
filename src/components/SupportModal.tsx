import React, { useState, useEffect } from 'react';
import { SUPPORT_CONFIG, PaymentChannel } from '../config/support';
import { X, Copy, Check, Heart, ShieldCheck, Edit3, RotateCcw, Save } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [channels, setChannels] = useState<PaymentChannel[]>(SUPPORT_CONFIG.channels);
  const [activeTab, setActiveTab] = useState<'all' | 'local' | 'international' | 'crypto'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedChannels, setEditedChannels] = useState<PaymentChannel[]>(SUPPORT_CONFIG.channels);

  // Sync with SUPPORT_CONFIG and localStorage on open
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('cascade_plan_custom_support');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setChannels(parsed);
          setEditedChannels(parsed);
          return;
        } catch {
          // ignore
        }
      }
      setChannels(SUPPORT_CONFIG.channels);
      setEditedChannels(SUPPORT_CONFIG.channels);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (channel: PaymentChannel) => {
    navigator.clipboard.writeText(channel.accountIdentifier);
    setCopiedId(channel.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleSaveEdits = () => {
    setChannels(editedChannels);
    localStorage.setItem('cascade_plan_custom_support', JSON.stringify(editedChannels));
    setIsEditing(false);
  };

  const handleResetDefaults = () => {
    localStorage.removeItem('cascade_plan_custom_support');
    setChannels(SUPPORT_CONFIG.channels);
    setEditedChannels(SUPPORT_CONFIG.channels);
    setIsEditing(false);
  };

  const filteredChannels =
    activeTab === 'all'
      ? channels
      : channels.filter((c) => c.category === activeTab);

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
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{SUPPORT_CONFIG.title}</h2>
              <p className="text-xs text-[var(--text-muted)]">
                Support independent, offline-first open source development
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                isEditing
                  ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                  : 'bg-[var(--bg-main)] hover:bg-[var(--bg-surface-hover)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
              title="Edit your payment handles"
            >
              <Edit3 className="w-4 h-4" />
              <span className="text-[11px] font-medium hidden sm:inline">
                {isEditing ? 'Viewing' : 'Edit Handles'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="my-4 text-xs leading-relaxed text-[var(--text-muted)] bg-[var(--bg-main)] p-3 rounded-lg border border-[var(--border-color)]">
          <p>{SUPPORT_CONFIG.subtitle}</p>
        </div>

        {/* Category Tabs */}
        {!isEditing && (
          <div className="flex gap-1.5 mb-4 p-1 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)]">
            {(['all', 'local', 'international', 'crypto'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 text-xs font-medium rounded capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {tab === 'all' ? 'All Channels' : tab}
              </button>
            ))}
          </div>
        )}

        {/* Channels List or Edit Form */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {isEditing ? (
            <div className="space-y-4">
              <div className="text-xs text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 p-2.5 rounded border border-[var(--accent-primary)]/30 font-medium">
                Tip: You can edit handles here in the UI or directly in <code>src/config/support.ts</code>.
              </div>
              {editedChannels.map((ch, idx) => (
                <div
                  key={ch.id}
                  className="p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{ch.name}</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      {ch.badge}
                    </span>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[var(--text-muted)] mb-0.5">
                      Account / Address / Number:
                    </label>
                    <input
                      type="text"
                      value={ch.accountIdentifier}
                      onChange={(e) => {
                        const copy = [...editedChannels];
                        copy[idx] = { ...copy[idx], accountIdentifier: e.target.value };
                        setEditedChannels(copy);
                      }}
                      className="w-full px-2.5 py-1 text-xs font-mono rounded bg-[var(--bg-main)] border border-[var(--border-color)] focus:outline-none"
                    />
                  </div>
                  {ch.recipientName !== undefined && (
                    <div>
                      <label className="block text-[11px] text-[var(--text-muted)] mb-0.5">
                        Recipient Name:
                      </label>
                      <input
                        type="text"
                        value={ch.recipientName || ''}
                        onChange={(e) => {
                          const copy = [...editedChannels];
                          copy[idx] = { ...copy[idx], recipientName: e.target.value };
                          setEditedChannels(copy);
                        }}
                        className="w-full px-2.5 py-1 text-xs rounded bg-[var(--bg-main)] border border-[var(--border-color)] focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            filteredChannels.map((channel) => {
              const isCopied = copiedId === channel.id;
              return (
                <div
                  key={channel.id}
                  className="p-3.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--border-focus)]/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{channel.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-muted)]">
                          {channel.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {channel.shortDescription}
                      </p>
                    </div>
                  </div>

                  {channel.recipientName && (
                    <div className="text-xs text-[var(--text-muted)] mb-2">
                      <span className="font-medium text-[var(--text-main)]">Account Name:</span>{' '}
                      {channel.recipientName}
                    </div>
                  )}

                  {/* Account / Address with Copy Button */}
                  <div className="flex items-center gap-2 bg-[var(--bg-main)] p-2 rounded border border-[var(--border-color)]">
                    <code className="text-xs font-mono text-[var(--accent-primary)] flex-1 overflow-x-auto whitespace-nowrap scrollbar-none font-bold">
                      {channel.accountIdentifier}
                    </code>
                    <button
                      onClick={() => handleCopy(channel)}
                      className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-all ${
                        isCopied
                          ? 'bg-[var(--accent-success)] text-white'
                          : 'bg-[var(--bg-surface-hover)] hover:bg-[var(--accent-primary)] hover:text-white text-[var(--text-main)]'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {channel.instructions && (
                    <p className="text-[11px] text-[var(--text-muted)] mt-2 italic">
                      ℹ️ {channel.instructions}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Note & Save */}
        <div className="mt-5 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetDefaults}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-main)] text-[var(--text-muted)] flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to support.ts</span>
              </button>
              <button
                onClick={handleSaveEdits}
                className="px-4 py-1.5 rounded-lg bg-[var(--accent-primary)] text-white font-medium flex items-center gap-1 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Handles</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-success)]" />
              <span>Configurable in <code>src/config/support.ts</code></span>
            </div>
          )}

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
