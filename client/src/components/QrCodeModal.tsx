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
  const [fgColor, setFgColor] = useState('#059669'); // Emerald 600 default
  const [bgColor, setBgColor] = useState('#ffffff'); // Clean white default
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const presetFgColors = [
    { name: 'Emerald', hex: '#059669' },
    { name: 'Midnight', hex: '#0f172a' },
    { name: 'Indigo', hex: '#4f46e5' },
    { name: 'Cyan', hex: '#0891b2' },
    { name: 'Violet', hex: '#7c3aed' },
    { name: 'Amber', hex: '#d97706' }
  ];

  const presetBgColors = [
    { name: 'Pure White', hex: '#ffffff' },
    { name: 'Slate Gray', hex: '#0b0f19' },
    { name: 'Soft Mint', hex: '#ecfdf5' }
  ];

  useEffect(() => {
    if (canvasRef.current) {
      drawQrToCanvas(canvasRef.current, shortUrl, fgColor, bgColor, 300);
    }
  }, [shortUrl, fgColor, bgColor]);

  const handleDownload = async () => {
    try {
      const dataUrl = await generateQrDataUrl(shortUrl, fgColor, bgColor, 1024);
      const link = document.createElement('a');
      link.download = `niat-me-qr-${shortCode}.png`;
      link.href = dataUrl;
      link.click();
      if (onShowToast) onShowToast('Downloaded HD QR Code', `Saved 1024px image as niat-me-qr-${shortCode}.png`);
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
        if (onShowToast) onShowToast('Copied QR Code Image', 'Image blob copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      });
    } catch (err) {
      console.error('Failed to copy QR code image', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="w-full max-w-md bg-white dark:bg-[#111726] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 relative transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center">
              <QrIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-display">
                Dynamic QR Studio
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">High-Res ISO/IEC 18004 Exporter</p>
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
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#0b0f19] rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
          <div className="p-3 bg-white dark:bg-[#111726] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
            <canvas ref={canvasRef} className="rounded-xl max-w-full h-auto" />
          </div>

          <div className="mt-3 text-center">
            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 tracking-wide">
              {shortUrl}
            </span>
          </div>
        </div>

        {/* Color Customization Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Pattern Color Accent
            </label>
            <div className="flex items-center gap-2">
              {presetFgColors.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setFgColor(color.hex)}
                  className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                    fgColor === color.hex ? 'border-emerald-600 dark:border-emerald-400 scale-110 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Background Canvas
            </label>
            <div className="flex items-center gap-2">
              {presetBgColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setBgColor(color.hex)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    bgColor === color.hex
                      ? 'bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleCopyImage}
            className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Image'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Download HD</span>
          </button>
        </div>

      </div>
    </div>
  );
};
