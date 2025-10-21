'use client';

import { useState } from 'react';
import { createShareLink, copyToClipboard } from '@/lib/services/export-service';
import { X, Copy, Check, Link as LinkIcon, Clock } from 'lucide-react';

interface Props {
  reportId: string;
  onClose: () => void;
}

export default function ShareDialog({ reportId, onClose }: Props) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expiryDays, setExpiryDays] = useState<number | null>(null);

  const handleCreateLink = () => {
    const url = createShareLink(reportId, expiryDays);
    setShareUrl(url);
  };

  const handleCopy = async () => {
    if (!shareUrl) return;

    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-tech-gray-900 border border-tech-gray-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-tech-gray-100 mb-1">
              Compartilhar Relatório
            </h3>
            <p className="text-sm text-tech-gray-400">
              Crie um link público (read-only) para compartilhar
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-tech-gray-500 hover:text-tech-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {!shareUrl ? (
          <>
            {/* Expiry Options */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-tech-gray-300 mb-3">
                <Clock className="inline w-4 h-4 mr-1" />
                Expiração do Link
              </label>
              <div className="space-y-2">
                {[
                  { label: 'Nunca expira', value: null },
                  { label: '24 horas', value: 1 },
                  { label: '7 dias', value: 7 },
                  { label: '30 dias', value: 30 },
                ].map((option) => (
                  <button
                    key={option.label}
                    onClick={() => setExpiryDays(option.value)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      expiryDays === option.value
                        ? 'border-neon-green bg-neon-green/10 text-neon-green'
                        : 'border-tech-gray-700 bg-background-card text-tech-gray-300 hover:border-neon-green/50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Create Button */}
            <button onClick={handleCreateLink} className="btn-primary w-full">
              <LinkIcon className="w-4 h-4 mr-2" />
              Criar Link de Compartilhamento
            </button>
          </>
        ) : (
          <>
            {/* Share URL Display */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-tech-gray-300 mb-2">
                Link de Compartilhamento
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-4 py-3 bg-background-card border border-tech-gray-700 rounded-lg text-tech-gray-100 text-sm focus:outline-none focus:border-neon-green"
                />
                <button
                  onClick={handleCopy}
                  className={`btn-secondary px-4 ${copied ? 'border-neon-green text-neon-green' : ''}`}
                  title="Copiar link"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
              {copied && (
                <p className="text-sm text-neon-green mt-2">
                  ✓ Link copiado para área de transferência!
                </p>
              )}
            </div>

            {/* Info */}
            <div className="p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg mb-6">
              <p className="text-sm text-tech-gray-300">
                {expiryDays ? (
                  <>
                    Este link expira em <strong className="text-neon-green">{expiryDays} {expiryDays === 1 ? 'dia' : 'dias'}</strong>.
                  </>
                ) : (
                  <>
                    Este link <strong className="text-neon-green">não expira</strong>.
                  </>
                )}
                {' '}Qualquer pessoa com este link poderá visualizar o relatório em modo leitura.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => setShareUrl(null)} className="btn-secondary flex-1">
                Criar Novo Link
              </button>
              <button onClick={onClose} className="btn-primary flex-1">
                Concluído
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
