import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check, Sparkles, QrCode as QrIcon, Palette, Image as ImageIcon } from 'lucide-react';

interface QrCodeModalProps {
  shortUrl: string;
  shortCode: string;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ shortUrl, shortCode, onClose }) => {
  const [fgColor, setFgColor] = useState('#10b981'); // Emerald 500 default
  const [bgColor, setBgColor] = useState('#090a0d'); // Dark background default
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const presetFgColors = [
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Cyan', hex: '#06b6d4' },
    { name: 'Indigo', hex: '#6366f1' },
    { name: 'Rose', hex: '#f43f5e' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Obsidian', hex: '#020617' }
  ];

  const presetBgColors = [
    { name: 'Dark Void', hex: '#090a0d' },
    { name: 'Pure White', hex: '#ffffff' },
    { name: 'Transparent', hex: '#00000000' },
    { name: 'Slate Gray', hex: '#1e293b' }
  ];

  useEffect(() => {
    generateQr();
  }, [shortUrl, fgColor, bgColor]);

  const generateQr = async () => {
    if (!canvasRef.current) return;

    try {
      await QRCode.toCanvas(canvasRef.current, shortUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor === '#00000000' ? '#00000000' : bgColor
        },
        errorCorrectionLevel: 'H'
      });
    } catch (err) {
      console.error('Failed to generate QR code', err);
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;

    // Create high-res download canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 1024;
    tempCanvas.height = 1024;

    QRCode.toCanvas(tempCanvas, shortUrl, {
      width: 1024,
      margin: 3,
      color: {
        dark: fgColor,
        light: bgColor === '#00000000' ? '#00000000' : bgColor
      },
      errorCorrectionLevel: 'H'
    }, () => {
      const link = document.createElement('a');
      link.download = `niat-me-qr-${shortCode}.png`;
      link.href = tempCanvas.toDataURL('image/png');
      link.click();
    });
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
        setTimeout(() => setCopied(false), 2000);
      });
    } catch (err) {
      console.error('Failed to copy QR code image', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900/[0.03] dark:bg-white/[0.025] p-1.5 rounded-[2.5rem] border border-slate-200/90 dark:border-white/10 ring-1 ring-slate-900/5 dark:ring-white/5 shadow-2xl">
        <div className="bg-white dark:bg-[#090a0d] rounded-[calc(2.5rem-0.375rem)] p-6 sm:p-8 doppelrand-core space-y-6 transition-colors">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <QrIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  Dynamic QR Studio
                </h3>
                <p className="text-[11px] font-mono text-slate-500">Vector & PNG High-Res Exporter</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* QR Canvas Preview Container */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#040507] rounded-2xl border border-slate-200 dark:border-white/10 relative overflow-hidden">
            <div className="p-3 bg-white dark:bg-[#090a0d] rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl">
              <canvas ref={canvasRef} className="rounded-xl max-w-full h-auto" />
            </div>

            <div className="mt-3 text-center">
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wide">
                {shortUrl}
              </span>
            </div>
          </div>

          {/* Color Customization Controls */}
          <div className="space-y-4 font-mono">
            <div>
              <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-emerald-500" /> Pattern Color
              </label>
              <div className="flex items-center gap-2">
                {presetFgColors.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => setFgColor(color.hex)}
                    className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                      fgColor === color.hex ? 'border-emerald-400 scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-400" /> Background Surface
              </label>
              <div className="flex items-center gap-2">
                {presetBgColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setBgColor(color.hex)}
                    className={`px-3 py-1 text-[10px] rounded-full border transition-all cursor-pointer ${
                      bgColor === color.hex
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 font-bold'
                        : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'
                    }`}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2 font-mono">
            <button
              onClick={handleCopyImage}
              className="py-3 px-4 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Image' : 'Copy Image'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="py-3 px-4 rounded-full bg-emerald-500 dark:bg-emerald-400 hover:bg-emerald-400 dark:hover:bg-emerald-300 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Download 1024px</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
