'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Upload,
  Download,
  RotateCw,
  Image as ImageIcon,
  PenTool,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trash2,
  Copy,
  Printer,
  Fingerprint,
  Check,
} from 'lucide-react';

type ToolMode = 'photo' | 'signature' | 'thumb';
type OutputFormat = 'image/jpeg' | 'image/png';

interface ExamPreset {
  id: string;
  label: string;
  sublabel: string;
  photo: { width: number; height: number; maxKb: number; minKb: number };
  signature: { width: number; height: number; maxKb: number; minKb: number };
  thumb: { width: number; height: number; maxKb: number; minKb: number };
}

const EXAM_PRESETS: ExamPreset[] = [
  {
    id: 'rajasthan',
    label: 'Rajasthan (RPSC / RSSB / SSO)',
    sublabel: 'Photo 50–100 KB · Sign 20–50 KB',
    photo: { width: 240, height: 320, maxKb: 95, minKb: 50 },
    signature: { width: 280, height: 80, maxKb: 45, minKb: 20 },
    thumb: { width: 200, height: 200, maxKb: 45, minKb: 20 },
  },
  {
    id: 'ssc',
    label: 'SSC (CGL / CHSL / GD / MTS)',
    sublabel: 'Photo 20–50 KB · Sign 10–20 KB',
    photo: { width: 276, height: 354, maxKb: 48, minKb: 20 },
    signature: { width: 315, height: 157, maxKb: 19, minKb: 10 },
    thumb: { width: 276, height: 276, maxKb: 48, minKb: 20 },
  },
  {
    id: 'upsc',
    label: 'UPSC (IAS / NDA / CDS)',
    sublabel: 'Photo 20–300 KB · Sign 20–300 KB',
    photo: { width: 550, height: 550, maxKb: 180, minKb: 20 },
    signature: { width: 550, height: 300, maxKb: 120, minKb: 20 },
    thumb: { width: 400, height: 400, maxKb: 120, minKb: 20 },
  },
  {
    id: 'rrb',
    label: 'Railway (RRB NTPC / Group D)',
    sublabel: 'Photo 30–70 KB · Sign 30–70 KB',
    photo: { width: 276, height: 354, maxKb: 65, minKb: 30 },
    signature: { width: 394, height: 157, maxKb: 65, minKb: 30 },
    thumb: { width: 276, height: 276, maxKb: 65, minKb: 30 },
  },
  {
    id: 'banking',
    label: 'Banking (IBPS / SBI PO & Clerk)',
    sublabel: 'Photo 20–50 KB · Sign 10–20 KB',
    photo: { width: 200, height: 230, maxKb: 48, minKb: 20 },
    signature: { width: 140, height: 60, maxKb: 19, minKb: 10 },
    thumb: { width: 240, height: 240, maxKb: 48, minKb: 20 },
  },
  {
    id: 'police',
    label: 'Police (Rajasthan / State)',
    sublabel: 'Photo 50–100 KB · Sign 20–50 KB',
    photo: { width: 240, height: 320, maxKb: 90, minKb: 50 },
    signature: { width: 280, height: 100, maxKb: 45, minKb: 20 },
    thumb: { width: 200, height: 200, maxKb: 45, minKb: 20 },
  },
];

function formatBytesToKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function clampDim(val: number): number {
  return Math.max(30, Math.min(3000, Math.round(val)));
}

function clampKb(val: number): number {
  return Math.max(5, Math.min(500, Math.round(val)));
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: OutputFormat, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      canvas.toBlob((blob) => resolve(blob), mime, quality);
    } catch {
      resolve(null);
    }
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read image data.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to convert image to Data URL.'));
    reader.readAsDataURL(blob);
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Unable to read image file.'));
      }
    };
    reader.onerror = () => reject(new Error('Unable to read image file.'));
    reader.readAsDataURL(file);
  });
}

function getFormattedToday(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export const PhotoSignResizeTool: React.FC = () => {
  const [mode, setMode] = useState<ToolMode>('photo');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('rajasthan');

  const [widthPx, setWidthPx] = useState<number>(240);
  const [heightPx, setHeightPx] = useState<number>(320);
  const [maxKb, setMaxKb] = useState<number>(95);

  const [widthInput, setWidthInput] = useState<string>('240');
  const [heightInput, setHeightInput] = useState<string>('320');
  const [maxKbInput, setMaxKbInput] = useState<string>('95');

  const [format, setFormat] = useState<OutputFormat>('image/jpeg');
  const [rotation, setRotation] = useState<number>(0);
  const [enhanceSignature, setEnhanceSignature] = useState<boolean>(true);

  // Name & Date of Photo (DOP) Strip
  const [addDateStrip, setAddDateStrip] = useState<boolean>(false);
  const [stripName, setStripName] = useState<string>('');
  const [stripDate, setStripDate] = useState<string>('');

  // Source & Output state
  const [sourceToken, setSourceToken] = useState<number>(0);
  const [sourceFileName, setSourceFileName] = useState<string>('');
  const [sourceMeta, setSourceMeta] = useState<{ width: number; height: number; sizeBytes: number } | null>(null);

  const [outputDataUrl, setOutputDataUrl] = useState<string | null>(null);
  const [outputBlobUrl, setOutputBlobUrl] = useState<string | null>(null);
  const [outputMeta, setOutputMeta] = useState<{
    width: number;
    height: number;
    sizeBytes: number;
    qualityPercent: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);

  // Printable Sheet Modal
  const [sheetDataUrl, setSheetDataUrl] = useState<string | null>(null);
  const [showSheetModal, setShowSheetModal] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const loadedImgRef = useRef<HTMLImageElement | null>(null);
  const outputBlobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (outputBlobUrlRef.current) {
        URL.revokeObjectURL(outputBlobUrlRef.current);
      }
    };
  }, []);

  const applyPreset = useCallback((presetId: string, targetMode: ToolMode) => {
    const preset = EXAM_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const cfg = targetMode === 'photo' ? preset.photo : targetMode === 'signature' ? preset.signature : preset.thumb;
    setSelectedPresetId(presetId);
    setWidthPx(cfg.width);
    setHeightPx(cfg.height);
    setMaxKb(cfg.maxKb);
    setWidthInput(String(cfg.width));
    setHeightInput(String(cfg.height));
    setMaxKbInput(String(cfg.maxKb));
    setFormat('image/jpeg');
  }, []);

  const handleModeChange = (nextMode: ToolMode) => {
    setMode(nextMode);
    if (nextMode === 'photo') {
      setEnhanceSignature(false);
      setAddDateStrip(false);
    } else {
      setEnhanceSignature(true);
      setAddDateStrip(false);
    }
    applyPreset(selectedPresetId, nextMode);
  };

  const handleWidthChange = (valStr: string) => {
    setWidthInput(valStr);
    const n = parseInt(valStr, 10);
    if (!Number.isNaN(n) && n > 0) {
      const safeW = clampDim(n);
      setWidthPx(safeW);
    }
  };

  const handleHeightChange = (valStr: string) => {
    setHeightInput(valStr);
    const n = parseInt(valStr, 10);
    if (!Number.isNaN(n) && n > 0) {
      const safeH = clampDim(n);
      setHeightPx(safeH);
    }
  };

  const setMaxKbPreset = (val: number) => {
    const safeKb = clampKb(val);
    setMaxKb(safeKb);
    setMaxKbInput(String(safeKb));
  };

  // Clean, Fast Canvas Processing
  const processImage = useCallback(async () => {
    const img = loadedImgRef.current;
    if (!img || !img.naturalWidth || !img.naturalHeight) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const targetW = clampDim(widthPx);
      const targetH = clampDim(heightPx);
      const targetBytes = clampKb(maxKb) * 1024;

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('ब्राउज़र Canvas प्रोसेसिंग को सपोर्ट नहीं करता।');

      // White background for forms
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetW, targetH);

      // Bottom date strip if enabled for photo
      const stripTextParts = [stripName.trim(), stripDate.trim()].filter(Boolean);
      const showStrip = mode === 'photo' && addDateStrip && stripTextParts.length > 0;
      const stripHeight = showStrip ? Math.max(24, Math.round(targetH * 0.15)) : 0;
      const drawAreaH = Math.max(20, targetH - stripHeight);

      ctx.save();
      ctx.translate(targetW / 2, drawAreaH / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      const isQuarterTurn = rotation % 180 !== 0;
      const srcW = isQuarterTurn ? img.naturalHeight : img.naturalWidth;
      const srcH = isQuarterTurn ? img.naturalWidth : img.naturalHeight;

      // Cover-fit for photo, contain-fit for signature & thumb
      const scale =
        mode === 'signature' || mode === 'thumb'
          ? Math.min(targetW / srcW, drawAreaH / srcH)
          : Math.max(targetW / srcW, drawAreaH / srcH);

      const drawW = img.naturalWidth * scale;
      const drawH = img.naturalHeight * scale;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Signature & Thumb background cleaner & ink contrast
      if (enhanceSignature && (mode === 'signature' || mode === 'thumb')) {
        const imgData = ctx.getImageData(0, 0, targetW, drawAreaH);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] === 0) continue;
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          if (lum > 175) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
          } else {
            data[i] = Math.max(0, Math.round(data[i] * 0.6));
            data[i + 1] = Math.max(0, Math.round(data[i + 1] * 0.6));
            data[i + 2] = Math.max(0, Math.round(data[i + 2] * 0.6));
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // Name & DOP strip
      if (showStrip) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, drawAreaH, targetW, stripHeight);
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, drawAreaH);
        ctx.lineTo(targetW, drawAreaH);
        ctx.stroke();

        ctx.fillStyle = '#0F172A';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (stripTextParts.length === 2) {
          const fontSize = Math.max(9, Math.min(14, Math.floor(stripHeight * 0.35)));
          ctx.font = `700 ${fontSize}px sans-serif`;
          ctx.fillText(stripTextParts[0].toUpperCase(), targetW / 2, drawAreaH + stripHeight * 0.32, targetW - 8);
          ctx.font = `600 ${Math.max(8, fontSize - 1)}px sans-serif`;
          ctx.fillText(`DOP: ${stripTextParts[1]}`, targetW / 2, drawAreaH + stripHeight * 0.72, targetW - 8);
        } else {
          const fontSize = Math.max(10, Math.min(15, Math.floor(stripHeight * 0.45)));
          ctx.font = `700 ${fontSize}px sans-serif`;
          const singleLabel = stripName.trim() ? stripName.trim().toUpperCase() : `DOP: ${stripDate.trim()}`;
          ctx.fillText(singleLabel, targetW / 2, drawAreaH + stripHeight / 2, targetW - 8);
        }
      }

      // Compression loop
      let bestBlob: Blob | null = null;
      let usedQuality = 0.92;

      if (format === 'image/png') {
        bestBlob = await canvasToBlob(canvas, 'image/png');
        usedQuality = 1;
      } else {
        let low = 0.04;
        let high = 0.98;
        const maxQualityBlob = await canvasToBlob(canvas, 'image/jpeg', high);

        if (maxQualityBlob && maxQualityBlob.size <= targetBytes) {
          bestBlob = maxQualityBlob;
          usedQuality = high;
        } else {
          for (let step = 0; step < 12; step++) {
            const mid = (low + high) / 2;
            const candidate = await canvasToBlob(canvas, 'image/jpeg', mid);
            if (!candidate) break;
            if (candidate.size <= targetBytes) {
              bestBlob = candidate;
              usedQuality = mid;
              low = mid;
            } else {
              high = mid;
            }
          }
          if (!bestBlob) {
            bestBlob = await canvasToBlob(canvas, 'image/jpeg', 0.04);
            usedQuality = 0.04;
          }
        }
      }

      if (!bestBlob) {
        const fallbackDataUrl = canvas.toDataURL(format, format === 'image/jpeg' ? 0.75 : undefined);
        const approxBytes = Math.round(((fallbackDataUrl.split(',')[1] || '').length * 3) / 4);
        setOutputDataUrl(fallbackDataUrl);
        setOutputBlobUrl(fallbackDataUrl);
        setOutputMeta({
          width: targetW,
          height: targetH,
          sizeBytes: approxBytes,
          qualityPercent: format === 'image/png' ? 100 : 75,
        });
        return;
      }

      const [nextDataUrl, nextBlobUrl] = await Promise.all([
        blobToDataUrl(bestBlob),
        Promise.resolve(URL.createObjectURL(bestBlob)),
      ]);

      if (outputBlobUrlRef.current) {
        URL.revokeObjectURL(outputBlobUrlRef.current);
      }
      outputBlobUrlRef.current = nextBlobUrl;

      setOutputDataUrl(nextDataUrl);
      setOutputBlobUrl(nextBlobUrl);
      setOutputMeta({
        width: targetW,
        height: targetH,
        sizeBytes: bestBlob.size,
        qualityPercent: Math.round(usedQuality * 100),
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'इमेज प्रोसेस करने में समस्या आई।');
    } finally {
      setIsProcessing(false);
    }
  }, [widthPx, heightPx, maxKb, format, rotation, mode, enhanceSignature, addDateStrip, stripName, stripDate]);

  useEffect(() => {
    if (sourceToken === 0) return;
    const timer = window.setTimeout(() => {
      void processImage();
    }, 40);
    return () => window.clearTimeout(timer);
  }, [sourceToken, processImage]);

  const loadImageFromDataUrl = useCallback((dataUrl: string, fileName: string, fileSizeBytes: number) => {
    const img = new window.Image();
    img.onload = () => {
      loadedImgRef.current = img;
      setSourceFileName(fileName);
      setSourceMeta({
        width: img.naturalWidth,
        height: img.naturalHeight,
        sizeBytes: fileSizeBytes,
      });
      setRotation(0);
      setErrorMsg(null);
      setSourceToken((t) => t + 1);
    };
    img.onerror = () => {
      setErrorMsg('यह इमेज फ़ाइल ब्राउज़र में खोली नहीं जा सकी। कृपया मान्य JPG या PNG फ़ाइल चुनें।');
    };
    img.src = dataUrl;
  }, []);

  const handleFileSelected = async (file: File | null | undefined) => {
    if (!file) return;
    const hasImageMime = file.type ? file.type.startsWith('image/') : false;
    const hasImageExt = /\.(jpe?g|png|webp|gif|bmp|avif|jfif|heic|heif)$/i.test(file.name);
    if (file.type && !hasImageMime && !hasImageExt) {
      setErrorMsg('कृपया केवल JPG, PNG या WebP इमेज फ़ाइल अपलोड करें।');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('फ़ाइल का साइज़ 20 MB से कम होना चाहिए।');
      return;
    }

    setErrorMsg(null);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      loadImageFromDataUrl(dataUrl, file.name, file.size);
    } catch {
      const fallbackUrl = URL.createObjectURL(file);
      loadImageFromDataUrl(fallbackUrl, file.name, file.size);
    }
  };

  const handleReset = () => {
    if (outputBlobUrlRef.current) {
      URL.revokeObjectURL(outputBlobUrlRef.current);
      outputBlobUrlRef.current = null;
    }
    loadedImgRef.current = null;
    setSourceToken(0);
    setOutputDataUrl(null);
    setOutputBlobUrl(null);
    setSourceMeta(null);
    setOutputMeta(null);
    setSourceFileName('');
    setRotation(0);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopyToClipboard = async () => {
    if (!outputBlobUrl) return;
    try {
      const response = await fetch(outputBlobUrl);
      const blob = await response.blob();
      const canvas = document.createElement('canvas');
      const img = new window.Image();
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(async (pngBlob) => {
            if (pngBlob && navigator.clipboard && (window as any).ClipboardItem) {
              await navigator.clipboard.write([
                new (window as any).ClipboardItem({ 'image/png': pngBlob }),
              ]);
              setCopiedNotice(true);
              setTimeout(() => setCopiedNotice(false), 2500);
            }
          }, 'image/png');
        }
      };
      img.src = URL.createObjectURL(blob);
    } catch {}
  };

  const generatePrintSheet = () => {
    if (!outputDataUrl) return;
    const img = new window.Image();
    img.onload = () => {
      const sheet = document.createElement('canvas');
      sheet.width = 1800;
      sheet.height = 1200;
      const sCtx = sheet.getContext('2d');
      if (!sCtx) return;

      sCtx.fillStyle = '#FFFFFF';
      sCtx.fillRect(0, 0, sheet.width, sheet.height);

      sCtx.fillStyle = '#64748B';
      sCtx.font = '600 22px sans-serif';
      sCtx.fillText('Rajasthan Vacancy - Passport Photo Printable Sheet (4x6")', 60, 50);

      const cols = 4;
      const rows = 2;
      const cardW = 380;
      const cardH = 490;
      const startX = 80;
      const startY = 80;
      const gapX = 40;
      const gapY = 40;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = startX + c * (cardW + gapX);
          const y = startY + r * (cardH + gapY);
          sCtx.strokeStyle = '#CBD5E1';
          sCtx.lineWidth = 1;
          sCtx.strokeRect(x - 1, y - 1, cardW + 2, cardH + 2);
          sCtx.drawImage(img, x, y, cardW, cardH);
        }
      }

      setSheetDataUrl(sheet.toDataURL('image/jpeg', 0.98));
      setShowSheetModal(true);
    };
    img.src = outputDataUrl;
  };

  const ext = format === 'image/png' ? 'png' : 'jpg';
  const baseName = (sourceFileName || mode).replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 30) || mode;
  const downloadFileName = `${baseName}-${selectedPresetId}-${mode}-${widthPx}x${heightPx}.${ext}`;

  const activePreset = EXAM_PRESETS.find((p) => p.id === selectedPresetId);
  const presetRange = activePreset
    ? mode === 'photo'
      ? activePreset.photo
      : mode === 'signature'
      ? activePreset.signature
      : activePreset.thumb
    : null;

  const outputKb = outputMeta ? outputMeta.sizeBytes / 1024 : 0;
  const isWithinMinKb = presetRange ? outputKb >= presetRange.minKb - 0.5 : true;
  const isWithinMaxKb = outputMeta ? outputKb <= maxKb + 0.5 : true;
  const isFullyCompliant = isWithinMinKb && isWithinMaxKb;

  return (
    <section
      aria-label="Photo and Signature Resize Tool"
      className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden"
    >
      {/* Sleek Filter Bar for Document Types & Exam Presets */}
      <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 space-y-4">
        {/* Document Type Filters */}
        <div>
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
            दस्तावेज़ प्रकार (Document Type Filter)
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'photo', label: 'पासपोर्ट फोटो (Photo)', icon: ImageIcon },
              { id: 'signature', label: 'हस्ताक्षर (Signature)', icon: PenTool },
              { id: 'thumb', label: 'अंगूठे का निशान (Thumb)', icon: Fingerprint },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = mode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleModeChange(item.id as ToolMode)}
                  className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-xs ${
                    isActive
                      ? 'bg-[#15803d] text-white ring-2 ring-emerald-600/30'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#15803d]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Exam Preset Filters */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              भर्ती परीक्षा प्रीसेट फिल्टर (Exam Presets)
            </span>
            <span className="text-[11px] font-semibold text-[#15803d]">
              {mode === 'photo' ? 'Photo Requirements' : mode === 'signature' ? 'Sign Requirements' : 'Thumb Requirements'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {EXAM_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              const targetCfg = mode === 'photo' ? preset.photo : mode === 'signature' ? preset.signature : preset.thumb;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id, mode)}
                  className={`text-left p-2.5 rounded-xl border transition cursor-pointer relative ${
                    isSelected
                      ? 'border-[#15803d] bg-emerald-50 text-slate-900 shadow-xs ring-2 ring-emerald-600/20'
                      : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-black text-slate-900 truncate">{preset.label.split(' ')[0]}</div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#15803d]" />}
                  </div>
                  <div className="text-[11px] text-slate-600 font-semibold truncate mt-0.5">
                    {preset.label.replace(/^[^()]+\((.+)\)$/, '$1')}
                  </div>
                  <div className="text-[10px] text-emerald-800 font-mono font-bold mt-1 tabular-nums">
                    {targetCfg.width}×{targetCfg.height}px · {targetCfg.maxKb}KB
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simple Upload & Settings */}
        <div className="lg:col-span-6 space-y-5">
          {/* Upload Dropzone */}
          <div className="space-y-2">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                void handleFileSelected(e.dataTransfer.files?.[0]);
              }}
              className={`relative w-full rounded-2xl border-2 border-dashed px-4 py-6 text-center transition ${
                isDragging
                  ? 'border-[#15803d] bg-emerald-50'
                  : 'border-slate-300 bg-slate-50/70 hover:border-[#15803d] hover:bg-emerald-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                id="photo-sign-upload-input"
                type="file"
                accept="image/*"
                aria-label="Upload image"
                onChange={(e) => {
                  const picked = e.target.files?.[0];
                  e.currentTarget.value = '';
                  void handleFileSelected(picked);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <Upload className="w-8 h-8 text-[#15803d] mx-auto mb-2" aria-hidden="true" />
              <div className="text-sm font-extrabold text-slate-900">
                {sourceToken > 0
                  ? 'दूसरी फोटो बदलने के लिए यहाँ क्लिक करें'
                  : mode === 'photo'
                  ? 'अपनी पासपोर्ट फोटो चुनें (Upload Photo)'
                  : mode === 'signature'
                  ? 'अपने हस्ताक्षर की फोटो चुनें (Upload Sign)'
                  : 'अंगूठे के निशान की फोटो चुनें (Upload Thumb)'}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                गैलरी या कैमरा से JPG, PNG इमेज चुनें (अधिकतम 20 MB)
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#15803d] text-white text-xs font-bold shadow-xs">
                <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                <span>फ़ाइल चुनें (Browse Image)</span>
              </div>
              {sourceMeta && (
                <div className="text-xs font-bold text-emerald-800 bg-emerald-100/70 rounded-lg px-2.5 py-1.5 mt-3 inline-block tabular-nums">
                  ओरिजिनल फ़ाइल: {sourceFileName} · {sourceMeta.width} × {sourceMeta.height} px ·{' '}
                  {formatBytesToKb(sourceMeta.sizeBytes)}
                </div>
              )}
            </div>


          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Simple Dimensions & KB Settings */}
          <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
              साइज़ और KB सीमा (Dimensions &amp; File Size)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="resize-width-px" className="block text-xs font-bold text-slate-700 mb-1">
                  चौड़ाई / Width (px)
                </label>
                <input
                  id="resize-width-px"
                  type="number"
                  inputMode="numeric"
                  value={widthInput}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#15803d] tabular-nums"
                />
              </div>

              <div>
                <label htmlFor="resize-height-px" className="block text-xs font-bold text-slate-700 mb-1">
                  ऊंचाई / Height (px)
                </label>
                <input
                  id="resize-height-px"
                  type="number"
                  inputMode="numeric"
                  value={heightInput}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#15803d] tabular-nums"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="resize-format" className="block text-xs font-bold text-slate-700 mb-1">
                  फ़ॉर्मेट
                </label>
                <select
                  id="resize-format"
                  value={format}
                  onChange={(e) => setFormat(e.target.value as OutputFormat)}
                  className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#15803d]"
                >
                  <option value="image/jpeg">JPG / JPEG</option>
                  <option value="image/png">PNG</option>
                </select>
              </div>
            </div>

            {/* Max KB Slider */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <label htmlFor="resize-max-kb" className="text-xs font-bold text-slate-700">
                  अधिकतम KB सीमा (Target Max KB)
                </label>
                <span className="text-xs font-black text-[#15803d] tabular-nums">
                  {maxKb} KB {presetRange ? `(${presetRange.minKb}–${presetRange.maxKb} KB)` : ''}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="resize-max-kb"
                  type="range"
                  min={10}
                  max={300}
                  step={1}
                  value={Math.min(300, Math.max(10, maxKb))}
                  onChange={(e) => setMaxKbPreset(Number(e.target.value))}
                  className="flex-1 accent-[#15803d] cursor-pointer"
                />
                <input
                  type="number"
                  inputMode="numeric"
                  min={5}
                  max={500}
                  value={maxKbInput}
                  onChange={(e) => {
                    setMaxKbInput(e.target.value);
                    const n = parseInt(e.target.value, 10);
                    if (!Number.isNaN(n) && n >= 5 && n <= 500) setMaxKb(n);
                  }}
                  className="w-20 px-2.5 py-1.5 text-sm font-bold border border-slate-300 rounded-xl bg-white tabular-nums focus:outline-none focus:ring-2 focus:ring-[#15803d]"
                />
              </div>


            </div>

            {/* Simple Checkboxes for Signature Clean or Photo Strip */}
            {mode === 'signature' || mode === 'thumb' ? (
              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={enhanceSignature}
                  onChange={(e) => setEnhanceSignature(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#15803d] cursor-pointer"
                />
                <span className="text-xs text-slate-700 font-semibold">
                  <span className="text-slate-900 inline-flex items-center gap-1 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-[#15803d]" />
                    सफ़ेद बैकग्राउंड साफ़ करें व स्याही गहरी करें
                  </span>
                </span>
              </label>
            ) : (
              <div className="space-y-2 pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addDateStrip}
                    onChange={(e) => setAddDateStrip(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#15803d] cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 font-semibold">
                    <span className="text-slate-900 font-bold">फोटो के नीचे नाम और तारीख जोड़ें (Name &amp; DOP Strip)</span>
                  </span>
                </label>

                {addDateStrip && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                    <input
                      type="text"
                      placeholder="अभ्यर्थी का नाम (e.g. RAHUL SHARMA)"
                      value={stripName}
                      onChange={(e) => setStripName(e.target.value)}
                      className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[#15803d]"
                    />
                    <div className="flex gap-1">
                      <input
                        type="text"
                        placeholder="तारीख (e.g. 25/11/2026)"
                        value={stripDate}
                        onChange={(e) => setStripDate(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-[#15803d]"
                      />
                      <button
                        type="button"
                        onClick={() => setStripDate(getFormattedToday())}
                        className="px-2 py-1.5 text-[10px] font-bold bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-800 whitespace-nowrap cursor-pointer"
                      >
                        आज
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rotate & Reset */}
            {sourceToken > 0 && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>90° घुमाएं</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-xl inline-flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>रीसेट</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Preview & Download */}
        <div className="lg:col-span-6 flex flex-col justify-between bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                लाइव प्रीव्यू (Live Preview)
              </h3>
              {outputMeta && (
                <span
                  className={`text-xs font-black tabular-nums inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${
                    isFullyCompliant
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {isFullyCompliant ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-700" />}
                  <span>{formatBytesToKb(outputMeta.sizeBytes)}</span>
                </span>
              )}
            </div>

            {outputDataUrl && outputMeta ? (
              <div className="space-y-4">
                <div className="bg-white border-2 border-slate-300 rounded-xl p-4 flex items-center justify-center min-h-[260px] shadow-inner">
                  <img
                    src={outputDataUrl}
                    alt="Resized preview"
                    referrerPolicy="no-referrer"
                    className="max-h-[280px] max-w-full object-contain border border-slate-200 shadow-sm rounded-xs"
                  />
                </div>

                {/* Specs Table */}
                <div className="grid grid-cols-3 gap-2 text-center bg-white border border-slate-200 rounded-xl p-3">
                  <div>
                    <div className="text-[11px] text-slate-500 font-semibold">आयाम</div>
                    <div className="text-xs sm:text-sm font-black text-slate-900 tabular-nums mt-0.5">
                      {outputMeta.width} × {outputMeta.height} px
                    </div>
                  </div>
                  <div className="border-x border-slate-200">
                    <div className="text-[11px] text-slate-500 font-semibold">तैयार साइज़</div>
                    <div className="text-xs sm:text-sm font-black text-[#15803d] tabular-nums mt-0.5">
                      {formatBytesToKb(outputMeta.sizeBytes)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 font-semibold">क्वालिटी</div>
                    <div className="text-xs sm:text-sm font-black text-slate-900 tabular-nums mt-0.5">
                      {format === 'image/png' ? 'PNG' : `${outputMeta.qualityPercent}%`}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-8 min-h-[280px] flex flex-col items-center justify-center text-center">
                <ImageIcon className="w-12 h-12 text-slate-300 mb-3" aria-hidden="true" />
                <div className="text-sm font-bold text-slate-800">
                  रीसाइज़ की गई इमेज यहाँ दिखाई देगी
                </div>
                <div className="text-xs text-slate-600 mt-1 max-w-xs leading-relaxed">
                  बाईं ओर से अपनी फोटो अपलोड करें — टूल अपने-आप सटीक पिक्सेल और KB में तैयार कर देगा।
                </div>
              </div>
            )}
          </div>

          {/* Download & Actions */}
          <div className="mt-5 pt-4 border-t border-slate-200 space-y-2.5">
            {outputDataUrl && !isProcessing ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href={outputDataUrl}
                    download={downloadFileName}
                    className="no-link-color py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition bg-[#15803d] hover:bg-[#166534] !text-white cursor-pointer shadow-sm no-underline active:scale-98"
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    <span>डाउनलोड करें (Download)</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyToClipboard}
                    className="py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 cursor-pointer shadow-xs"
                  >
                    {copiedNotice ? (
                      <>
                        <Check className="w-4 h-4 text-[#15803d]" />
                        <span className="text-[#15803d]">कॉपी हो गया!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-600" />
                        <span>क्लिपबोर्ड कॉपी</span>
                      </>
                    )}
                  </button>
                </div>

                {mode === 'photo' && (
                  <button
                    type="button"
                    onClick={generatePrintSheet}
                    className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-xs"
                  >
                    <Printer className="w-4 h-4 text-emerald-400" />
                    <span>6/8 फोटो प्रिंट शीट बनाएं (4x6&quot;)</span>
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                disabled
                className="w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 bg-slate-200 text-slate-500 cursor-not-allowed"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                <span>{isProcessing ? 'प्रोसेस हो रहा है...' : 'रीसाइज़ फोटो डाउनलोड करें'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Printable Sheet Modal */}
      {showSheetModal && sheetDataUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                पासपोर्ट फोटो प्रिंट शीट (8 Photos Grid - 4x6 Inch)
              </h3>
              <button
                type="button"
                onClick={() => setShowSheetModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="bg-slate-100 p-3 rounded-xl flex items-center justify-center max-h-[360px] overflow-hidden">
              <img src={sheetDataUrl} alt="Sheet" className="max-h-[340px] max-w-full object-contain bg-white shadow-md" />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSheetModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
              >
                बंद करें
              </button>
              <a
                href={sheetDataUrl}
                download="passport-sheet-4x6.jpg"
                className="no-link-color px-5 py-2 rounded-xl bg-[#15803d] !text-white font-black text-xs flex items-center gap-1.5 cursor-pointer no-underline"
              >
                <Download className="w-4 h-4" />
                <span>शीट डाउनलोड करें</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PhotoSignResizeTool;
