'use client';

import { useState } from 'react';
import { Report } from '@/lib/types';
import { exportAsJSON, exportAsCSV, printReport } from '@/lib/services/export-service';
import ShareDialog from './ShareDialog';
import { Download, FileJson, FileSpreadsheet, Printer, Share2 } from 'lucide-react';

interface Props {
  report: Report;
  compact?: boolean;
}

export default function ExportButtons({ report, compact = false }: Props) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExportJSON = () => {
    exportAsJSON(report);
    setShowExportMenu(false);
  };

  const handleExportCSV = () => {
    exportAsCSV(report);
    setShowExportMenu(false);
  };

  const handlePrint = () => {
    printReport();
    setShowExportMenu(false);
  };

  if (compact) {
    return (
      <>
        <div className="flex gap-2">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <Download size={16} />
              Exportar
            </button>

            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-tech-gray-900 border border-tech-gray-700 rounded-lg shadow-2xl z-50 py-2">
                  <button
                    onClick={handleExportJSON}
                    className="w-full px-4 py-2 text-left text-sm text-tech-gray-300 hover:bg-tech-gray-800 hover:text-neon-green transition-colors flex items-center gap-2"
                  >
                    <FileJson size={16} />
                    JSON
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="w-full px-4 py-2 text-left text-sm text-tech-gray-300 hover:bg-tech-gray-800 hover:text-neon-green transition-colors flex items-center gap-2"
                  >
                    <FileSpreadsheet size={16} />
                    CSV
                  </button>
                  <button
                    onClick={handlePrint}
                    className="w-full px-4 py-2 text-left text-sm text-tech-gray-300 hover:bg-tech-gray-800 hover:text-neon-green transition-colors flex items-center gap-2"
                  >
                    <Printer size={16} />
                    Imprimir/PDF
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Share Button */}
          <button
            onClick={() => setShowShareDialog(true)}
            className="btn-ghost text-sm flex items-center gap-2"
          >
            <Share2 size={16} />
            Compartilhar
          </button>
        </div>

        {showShareDialog && (
          <ShareDialog
            reportId={report.id}
            onClose={() => setShowShareDialog(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExportJSON}
          className="btn-secondary text-sm flex items-center gap-2"
        >
          <FileJson size={16} />
          Exportar JSON
        </button>

        <button
          onClick={handleExportCSV}
          className="btn-secondary text-sm flex items-center gap-2"
        >
          <FileSpreadsheet size={16} />
          Exportar CSV
        </button>

        <button
          onClick={handlePrint}
          className="btn-secondary text-sm flex items-center gap-2"
        >
          <Printer size={16} />
          Imprimir/PDF
        </button>

        <button
          onClick={() => setShowShareDialog(true)}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Share2 size={16} />
          Compartilhar
        </button>
      </div>

      {showShareDialog && (
        <ShareDialog
          reportId={report.id}
          onClose={() => setShowShareDialog(false)}
        />
      )}
    </>
  );
}
