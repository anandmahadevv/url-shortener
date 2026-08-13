import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Copy, Check, QrCode as QrIcon, Palette, Image as ImageIcon } from 'lucide-react';
import { drawQrToCanvas, generateQrDataUrl } from '../utils/qrGenerator';

interface QrCodeModalProps {
  shortUrl: string;
  shortCode: string;
  onClose: () => void;
  onShowToast?: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ shortUrl, shortCode, onClose, onShowToast }) => {
  const [fgColor, setFgColor] = useState('#0B63E5'); // Rebrandly Blue default
  const [bgColor, setBgColor] = useState('#ffffff'); // White background default
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const presetFgColors = [
    { name: 'Rebrandly Blue', hex: '#0B63E5' },
    { name: 'Indigo', hex: '#6366f1' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Cyan', hex: '#06b6d4' },
    { name: 'Obsidian', hex: '#020617' }
  ];

  const presetBgColors = [
    { name: 'Pure White', hex: '#ffffff' },
    { name: 'Dark Void', hex: '#090a0d' },
    { name: 'Slate Gray', hex: '#1e293b' }
  ];

  useEffect(() => {
    if (canvasRef.current) {
      drawQrToCanvas(canvasRef.current, shortUrl, fgColor, bgColor, 320);
    }
  }, [shortUrl, fgColor, bgColor]);

  const handleDownload = async () => {
    try {
      const dataUrl = await generateQrDataUrl(shortUrl, fgColor, bgColor, 1024);
      const link = document.createElement('a');
      link.download = `niat-me-qr-${shortCode}.png`;
      link.href = dataUrl;
      link.click();
      if (onShowToast) onShowToast('Downloaded 1024px QR', `niat-me-qr-${shortCode}.png`);
    } catch (err) {
      console.error('Failed to download QR code image', err);
    }
  };

  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopied(true);
        if (onShowToast) onShowToast('Copied QR Image to Clipboard', 'Ready to paste');
        setTimeout(() => setCopied(false), 2000);
      });
    } catch (err) {
      console.error('Failed to copy QR code image', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="w-full max-w-lg bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 flex items-center justify-center">
              <QrIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-display">
                Dynamic QR Studio
              </h3>
              <p className="text-[11px] font-sans text-slate-500">Vector & PNG High-Res Exporter</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Canvas Preview Container */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#0a0e1a] rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
          <div className="p-3 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <canvas ref={canvasRef} className="rounded-xl max-w-full h-auto" />
          </div>

          <div className="mt-3 text-center">
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wide">
              {shortUrl}
            </span>
          </div>
        </div>

        {/* Color Customization Controls */}
        <div className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <Palette className="w-3.5 h-3.5 text-blue-500" /> Pattern Accent Color
            </label>
            <div className="flex items-center gap-2">
              {presetFgColors.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setFgColor(color.hex)}
                  className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                    fgColor === color.hex ? 'border-blue-600 scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" /> Background Surface
            </label>
            <div className="flex items-center gap-2">
              {presetBgColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setBgColor(color.hex)}
                  className={`px-3 py-1 text-[11px] rounded-full border transition-all cursor-pointer font-semibold ${
                    bgColor === color.hex
                      ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-500/20 dark:border-blue-500/40 dark:text-blue-300 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2 font-sans">
          <button
            onClick={handleCopyImage}
            className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Image' : 'Copy Image'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="py-3 px-4 rounded-xl bg-[#0B63E5] hover:bg-[#0252CD] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/25"
          >
            <Download className="w-4 h-4" />
            <span>Download 1024px</span>
          </button>
        </div>

      </div>
    </div>
  );
};
