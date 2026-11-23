'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Upload,
  Download,
  RotateCw,
  RefreshCw,
  Image as ImageIcon,
  PenTool,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trash2,
  ExternalLink,
} from 'lucide-react';

type ToolMode = 'photo' | 'signature';
type OutputFormat = 'image/jpeg' | 'image/png';

interface ExamPreset {
  id: string;
  label: string;
  sublabel: string;
  photo: { width: number; height: number; maxKb: number; minKb: number };
  signature: { width: number; height: number; maxKb: number; minKb: number };
}

const EXAM_PRESETS: ExamPreset[] = [
  {
    id: 'rajasthan',
    label: 'Rajasthan (RPSC / RSSB / SSO)',
    sublabel: 'Photo 50–100 KB · Sign 20–50 KB',
    photo: { width: 240, height: 320, maxKb: 95, minKb: 50 },
    signature: { width: 280, height: 80, maxKb: 45, minKb: 20 },
  },
  {
    id: 'ssc',
    label: 'SSC (CGL / CHSL / GD / MTS)',
    sublabel: 'Photo 20–50 KB · Sign 10–20 KB',
    photo: { width: 276, height: 354, maxKb: 48, minKb: 20 },
    signature: { width: 315, height: 157, maxKb: 19, minKb: 10 },
  },
  {
    id: 'upsc',
    label: 'UPSC (IAS / NDA / CDS)',
    sublabel: 'Photo 20–300 KB · Sign 20–300 KB',
    photo: { width: 550, height: 550, maxKb: 180, minKb: 20 },
    signature: { width: 550, height: 300, maxKb: 120, minKb: 20 },
  },
  {
    id: 'rrb',
    label: 'Railway (RRB NTPC / Group D)',
    sublabel: 'Photo 30–70 KB · Sign 30–70 KB',
    photo: { width: 276, height: 354, maxKb: 65, minKb: 30 },
    signature: { width: 394, height: 157, maxKb: 65, minKb: 30 },
  },
  {
    id: 'banking',
    label: 'Banking (IBPS / SBI)',
    sublabel: 'Photo 20–50 KB · Sign 10–20 KB',
    photo: { width: 200, height: 230, maxKb: 48, minKb: 20 },
    signature: { width: 140, height: 60, maxKb: 19, minKb: 10 },
  },
];

function formatBytesToKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function clampDim(val: number): number {
  return Math.max(40, Math.min(3000, Math.round(val)));
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
  const [lockAspect, setLockAspect] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [enhanceSignature, setEnhanceSignature] = useState<boolean>(false);
  const [addDateStrip, setAddDateStrip] = useState<boolean>(false);
  const [stripName, setStripName] = useState<string>('');
  const [stripDate, setStripDate] = useState<string>('');

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
    const cfg = targetMode === 'photo' ? preset.photo : preset.signature;
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
    if (nextMode === 'signature') {
      setAddDateStrip(false);
    } else {
      setEnhanceSignature(false);
    }
    applyPreset(selectedPresetId, nextMode);
  };

  const handleWidthTextChange = (raw: string) => {
    setWidthInput(raw);
    const parsed = parseInt(raw, 10);
    if (!Number.isNaN(parsed) && parsed >= 40 && parsed <= 3000) {
      setWidthPx(parsed);
      if (lockAspect && sourceMeta && sourceMeta.width > 0) {
        const ratio = sourceMeta.height / sourceMeta.width;
        const linkedH = clampDim(parsed * ratio);
        setHeightPx(linkedH);
        setHeightInput(String(linkedH));
      }
    }
  };

  const handleWidthBlur = () => {
    const parsed = parseInt(widthInput, 10);
    const safeW = Number.isNaN(parsed) ? 240 : clampDim(parsed);
    setWidthPx(safeW);
    setWidthInput(String(safeW));
    if (lockAspect && sourceMeta && sourceMeta.width > 0) {
      const ratio = sourceMeta.height / sourceMeta.width;
      const linkedH = clampDim(safeW * ratio);
      setHeightPx(linkedH);
      setHeightInput(String(linkedH));
    }
  };

  const handleHeightTextChange = (raw: string) => {
    setHeightInput(raw);
    const parsed = parseInt(raw, 10);
    if (!Number.isNaN(parsed) && parsed >= 40 && parsed <= 3000) {
      setHeightPx(parsed);
      if (lockAspect && sourceMeta && sourceMeta.height > 0) {
        const ratio = sourceMeta.width / sourceMeta.height;
        const linkedW = clampDim(parsed * ratio);
        setWidthPx(linkedW);
        setWidthInput(String(linkedW));
      }
    }
  };

  const handleHeightBlur = () => {
    const parsed = parseInt(heightInput, 10);
    const safeH = Number.isNaN(parsed) ? 320 : clampDim(parsed);
    setHeightPx(safeH);
    setHeightInput(String(safeH));
    if (lockAspect && sourceMeta && sourceMeta.height > 0) {
      const ratio = sourceMeta.width / sourceMeta.height;
      const linkedW = clampDim(safeH * ratio);
      setWidthPx(linkedW);
      setWidthInput(String(linkedW));
    }
  };

  const handleMaxKbTextChange = (raw: string) => {
    setMaxKbInput(raw);
    const parsed = parseInt(raw, 10);
    if (!Number.isNaN(parsed) && parsed >= 5 && parsed <= 500) {
      setMaxKb(parsed);
    }
  };

  const handleMaxKbBlur = () => {
    const parsed = parseInt(maxKbInput, 10);
    const safeKb = Number.isNaN(parsed) ? 50 : clampKb(parsed);
    setMaxKb(safeKb);
    setMaxKbInput(String(safeKb));
  };

  const setMaxKbPreset = (val: number) => {
    const safeKb = clampKb(val);
    setMaxKb(safeKb);
    setMaxKbInput(String(safeKb));
  };

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
      if (!ctx) throw new Error('आपका ब्राउज़र Canvas इमेज प्रोसेसिंग को सपोर्ट नहीं करता।');

      // White background (required for JPEG & Sarkari exam portals)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetW, targetH);

      // Reserve bottom strip height if Name + Date of Photo strip is enabled
      const stripTextParts = [stripName.trim(), stripDate.trim()].filter(Boolean);
      const showStrip = mode === 'photo' && addDateStrip && stripTextParts.length > 0;
      const stripHeight = showStrip ? Math.max(24, Math.round(targetH * 0.14)) : 0;
      const drawAreaH = Math.max(20, targetH - stripHeight);

      ctx.save();
      ctx.translate(targetW / 2, drawAreaH / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      const isQuarterTurn = rotation % 180 !== 0;
      const srcW = isQuarterTurn ? img.naturalHeight : img.naturalWidth;
      const srcH = isQuarterTurn ? img.naturalWidth : img.naturalHeight;

      // Cover-fit for passport photo, contain-fit for signature so strokes are never cut
      const scale =
        mode === 'signature'
          ? Math.min(targetW / srcW, drawAreaH / srcH)
          : Math.max(targetW / srcW, drawAreaH / srcH);

      const drawW = img.naturalWidth * scale;
      const drawH = img.naturalHeight * scale;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Optional Signature white-background cleanup & ink contrast boost
      if (mode === 'signature' && enhanceSignature) {
        const imgData = ctx.getImageData(0, 0, targetW, drawAreaH);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          if (lum > 175) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
          } else {
            data[i] = Math.max(0, Math.round(data[i] * 0.65));
            data[i + 1] = Math.max(0, Math.round(data[i + 1] * 0.65));
            data[i + 2] = Math.max(0, Math.round(data[i + 2] * 0.65));
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // Optional Name & Date of Photo strip at bottom
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
          const fontSize = Math.max(9, Math.min(14, Math.floor(stripHeight * 0.36)));
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
        // Fallback via canvas.toDataURL if toBlob failed
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
      setErrorMsg(err instanceof Error ? err.message : 'इमेज प्रोसेस करने में समस्या आई। कृपया दूसरी फोटो चुनें।');
    } finally {
      setIsProcessing(false);
    }
  }, [widthPx, heightPx, maxKb, format, rotation, mode, enhanceSignature, addDateStrip, stripName, stripDate]);

  useEffect(() => {
    if (sourceToken === 0) return;
    const timer = window.setTimeout(() => {
      void processImage();
    }, 60);
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
      setErrorMsg('यह इमेज फ़ाइल ब्राउज़र में खोली नहीं जा सकी। कृपया मान्य JPG या PNG फ़ोटो चुनें।');
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
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('फ़ाइल का साइज़ 15 MB से कम होना चाहिए।');
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

  const handleLoadSampleImage = () => {
    const sampleCanvas = document.createElement('canvas');
    const isSign = mode === 'signature';
    sampleCanvas.width = isSign ? 600 : 480;
    sampleCanvas.height = isSign ? 200 : 640;
    const ctx = sampleCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = isSign ? '#F8FAFC' : '#EFF6FF';
    ctx.fillRect(0, 0, sampleCanvas.width, sampleCanvas.height);

    if (isSign) {
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(70, 125);
      ctx.bezierCurveTo(130, 40, 175, 155, 240, 95);
      ctx.bezierCurveTo(295, 45, 345, 145, 420, 88);
      ctx.bezierCurveTo(465, 60, 495, 130, 535, 95);
      ctx.stroke();
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(85, 150);
      ctx.lineTo(500, 142);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(24, 24, 432, 592);
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.arc(240, 225, 92, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#15803D';
      ctx.beginPath();
      ctx.ellipse(240, 495, 150, 125, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FDE68A';
      ctx.beginPath();
      ctx.arc(240, 232, 74, 0, Math.PI * 2);
      ctx.fill();
    }

    const dataUrl = sampleCanvas.toDataURL('image/jpeg', 0.95);
    const approxBytes = Math.round(((dataUrl.split(',')[1] || '').length * 3) / 4);
    loadImageFromDataUrl(dataUrl, isSign ? 'sample-signature.jpg' : 'sample-passport-photo.jpg', approxBytes);
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

  const ext = format === 'image/png' ? 'png' : 'jpg';
  const baseName = (sourceFileName || mode).replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 30) || mode;
  const downloadFileName = `${baseName}-${selectedPresetId}-${mode}-${widthPx}x${heightPx}.${ext}`;

  const activePreset = EXAM_PRESETS.find((p) => p.id === selectedPresetId);
  const presetRange = activePreset ? (mode === 'photo' ? activePreset.photo : activePreset.signature) : null;
  const outputKb = outputMeta ? outputMeta.sizeBytes / 1024 : 0;
  const isWithinMaxKb = outputMeta ? outputKb <= maxKb + 0.5 : true;

  return (
    <section
      aria-label="Photo and Signature Resize Tool"
      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
    >
      {/* Top Mode Bar */}
      <div className="px-4 sm:px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            1. मोड और परीक्षा प्रीसेट चुनें (Select Mode &amp; Exam Preset)
          </h2>
          <div className="text-xs sm:text-sm text-slate-600 mt-0.5">
            100% ब्राउज़र में प्रोसेसिंग — आपकी फोटो किसी सर्वर पर अपलोड नहीं होती।
          </div>
        </div>

        {/* Segmented Mode Control */}
        <div className="inline-flex p-1 bg-slate-200/80 rounded-lg self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => handleModeChange('photo')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-md transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'photo'
                ? 'bg-[#15803d] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-4 h-4" aria-hidden="true" />
            <span>पासपोर्ट फोटो (Photo)</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('signature')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-md transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'signature'
                ? 'bg-[#15803d] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-4 h-4" aria-hidden="true" />
            <span>हस्ताक्षर (Signature)</span>
          </button>
        </div>
      </div>

      {/* Exam Preset Buttons */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {EXAM_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id, mode)}
                className={`text-left px-3 py-2.5 rounded-lg border transition cursor-pointer ${
                  isSelected
                    ? 'border-[#15803d] bg-emerald-50/70 text-slate-900'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 truncate">{preset.label}</div>
                <div className="text-[11px] text-slate-600 mt-0.5 tabular-nums truncate">{preset.sublabel}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tool Workspace */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Settings */}
        <div className="lg:col-span-6 space-y-5">
          {/* Upload Zone with Full-Cover Native File Input for 100% Mobile/Desktop Reliability */}
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
              className={`relative w-full rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
                isDragging
                  ? 'border-[#15803d] bg-emerald-50'
                  : 'border-slate-300 bg-slate-50/60 hover:border-[#15803d] hover:bg-emerald-50/40'
              }`}
            >
              <input
                ref={fileInputRef}
                id="photo-sign-upload-input"
                type="file"
                accept="image/*"
                aria-label={mode === 'photo' ? 'Upload passport photo' : 'Upload signature photo'}
                onChange={(e) => {
                  const picked = e.target.files?.[0];
                  e.currentTarget.value = '';
                  void handleFileSelected(picked);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <Upload className="w-7 h-7 text-[#15803d] mx-auto mb-2" aria-hidden="true" />
              <div className="text-sm font-bold text-slate-900">
                {sourceToken > 0
                  ? 'दूसरी फोटो / सिग्नेचर चुनने के लिए टैप करें'
                  : mode === 'photo'
                  ? 'अपनी पासपोर्ट फोटो चुनें (Tap to Upload Photo)'
                  : 'अपने हस्ताक्षर की फोटो चुनें (Tap to Upload Sign)'}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                मोबाइल गैलरी या कंप्यूटर से JPG, PNG इमेज चुनें (अधिकतम 15 MB)
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#15803d] text-white text-xs font-bold shadow-xs">
                <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                <span>फ़ाइल चुनें (Browse Image)</span>
              </div>
              {sourceMeta && (
                <div className="text-xs font-semibold text-emerald-800 mt-2.5 tabular-nums">
                  अपलोड फ़ाइल: {sourceFileName} · {sourceMeta.width} × {sourceMeta.height} px ·{' '}
                  {formatBytesToKb(sourceMeta.sizeBytes)}
                </div>
              )}
            </div>

            {sourceToken === 0 && (
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleLoadSampleImage}
                  className="text-xs font-semibold text-[#15803d] hover:underline cursor-pointer"
                >
                  {mode === 'photo' ? 'सैंपल फोटो के साथ टेस्ट करें (Try Sample Photo)' : 'सैंपल सिग्नेचर के साथ टेस्ट करें (Try Sample Sign)'}
                </button>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Dimensions & Target KB Controls */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                2. साइज़ और KB सेटिंग्स (Dimensions &amp; KB Limit)
              </h3>
              <button
                type="button"
                onClick={() => setLockAspect((v) => !v)}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                {lockAspect ? <Lock className="w-3.5 h-3.5 text-[#15803d]" /> : <Unlock className="w-3.5 h-3.5 text-slate-500" />}
                <span>{lockAspect ? 'Ratio Locked' : 'Free Ratio'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="resize-width-px" className="block text-xs font-semibold text-slate-700 mb-1">
                  चौड़ाई / Width (px)
                </label>
                <input
                  id="resize-width-px"
                  type="number"
                  inputMode="numeric"
                  min={40}
                  max={3000}
                  value={widthInput}
                  onChange={(e) => handleWidthTextChange(e.target.value)}
                  onBlur={handleWidthBlur}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803d] tabular-nums"
                />
              </div>

              <div>
                <label htmlFor="resize-height-px" className="block text-xs font-semibold text-slate-700 mb-1">
                  ऊंचाई / Height (px)
                </label>
                <input
                  id="resize-height-px"
                  type="number"
                  inputMode="numeric"
                  min={40}
                  max={3000}
                  value={heightInput}
                  onChange={(e) => handleHeightTextChange(e.target.value)}
                  onBlur={handleHeightBlur}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803d] tabular-nums"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="resize-format" className="block text-xs font-semibold text-slate-700 mb-1">
                  फ़ाइल फॉर्मेट
                </label>
                <select
                  id="resize-format"
                  value={format}
                  onChange={(e) => setFormat(e.target.value as OutputFormat)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#15803d]"
                >
                  <option value="image/jpeg">JPG / JPEG (Best)</option>
                  <option value="image/png">PNG</option>
                </select>
              </div>
            </div>

            {/* Target Max KB Slider + Input */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <label htmlFor="resize-max-kb" className="text-xs font-semibold text-slate-700">
                  अधिकतम फ़ाइल साइज़ (Target Max KB)
                </label>
                <span className="text-xs font-bold text-[#15803d] tabular-nums">
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
                  aria-label="Target Max KB Value"
                  min={5}
                  max={500}
                  value={maxKbInput}
                  onChange={(e) => handleMaxKbTextChange(e.target.value)}
                  onBlur={handleMaxKbBlur}
                  className="w-20 px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-[#15803d]"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[15, 20, 45, 50, 70, 95, 200].map((kbVal) => (
                  <button
                    key={kbVal}
                    type="button"
                    onClick={() => setMaxKbPreset(kbVal)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition tabular-nums cursor-pointer ${
                      maxKb === kbVal
                        ? 'bg-[#15803d] text-white border-[#15803d]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {kbVal} KB
                  </button>
                ))}
              </div>
            </div>

            {/* Extra Practical Options */}
            <div className="pt-2 border-t border-slate-200 space-y-3">
              {mode === 'signature' ? (
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enhanceSignature}
                    onChange={(e) => setEnhanceSignature(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#15803d]"
                  />
                  <span className="text-xs sm:text-sm text-slate-700">
                    <strong className="text-slate-900 inline-flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#15803d]" aria-hidden="true" />
                      सफ़ेद बैकग्राउंड साफ़ करें (Clean White Signature Background)
                    </strong>
                    <span className="block text-xs text-slate-600 mt-0.5">
                      कागज़ की हल्की छाया हटाकर हस्ताक्षर को साफ़ और गहरा बनाता है।
                    </span>
                  </span>
                </label>
              ) : (
                <div className="space-y-2.5">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addDateStrip}
                      onChange={(e) => setAddDateStrip(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[#15803d]"
                    />
                    <span className="text-xs sm:text-sm text-slate-700">
                      <strong className="text-slate-900">फोटो के नीचे नाम और तारीख लिखें (Name &amp; Date of Photo)</strong>
                      <span className="block text-xs text-slate-600 mt-0.5">
                        SSC / RPSC / Railway फॉर्म के लिए वैकल्पिक Name &amp; DOP स्ट्रिप जोड़ें।
                      </span>
                    </span>
                  </label>
                  {addDateStrip && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-6">
                      <input
                        type="text"
                        placeholder="अभ्यर्थी का नाम (e.g. RAHUL SHARMA)"
                        value={stripName}
                        onChange={(e) => setStripName(e.target.value)}
                        className="px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803d]"
                      />
                      <input
                        type="text"
                        placeholder="तारीख (e.g. 22/11/2026)"
                        value={stripDate}
                        onChange={(e) => setStripDate(e.target.value)}
                        className="px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803d] tabular-nums"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Quick Actions: Rotate & Reset */}
              {sourceToken > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>90° घुमाएं (Rotate)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void processImage()}
                    className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} aria-hidden="true" />
                    <span>री-प्रोसेस करें</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-2 text-xs font-semibold text-red-700 bg-white border border-red-200 hover:bg-red-50 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>साफ़ करें (Reset)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview & Download */}
        <div className="lg:col-span-6 flex flex-col justify-between bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                3. लाइव प्रीव्यू और डाउनलोड (Live Preview &amp; Download)
              </h3>
              {outputMeta && (
                <span
                  className={`text-xs font-bold tabular-nums inline-flex items-center gap-1 ${
                    isWithinMaxKb ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{formatBytesToKb(outputMeta.sizeBytes)}</span>
                </span>
              )}
            </div>

            {outputDataUrl && outputMeta ? (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-center min-h-[240px]">
                  <img
                    src={outputDataUrl}
                    alt={`Resized ${mode} preview`}
                    referrerPolicy="no-referrer"
                    className="max-h-[260px] max-w-full object-contain border border-slate-200 shadow-xs"
                  />
                </div>

                {/* Output Specs Summary Table */}
                <div className="grid grid-cols-3 gap-2 text-center bg-white border border-slate-200 rounded-lg p-3">
                  <div>
                    <div className="text-[11px] text-slate-500">आयाम (Dimensions)</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums mt-0.5">
                      {outputMeta.width} × {outputMeta.height} px
                    </div>
                  </div>
                  <div className="border-x border-slate-200">
                    <div className="text-[11px] text-slate-500">नया साइज़ (File Size)</div>
                    <div className="text-xs sm:text-sm font-bold text-[#15803d] tabular-nums mt-0.5">
                      {formatBytesToKb(outputMeta.sizeBytes)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">फ़ॉर्मेट / क्वालिटी</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums mt-0.5">
                      {format === 'image/png' ? 'PNG' : `JPG · ${outputMeta.qualityPercent}%`}
                    </div>
                  </div>
                </div>

                {!isWithinMaxKb && format === 'image/png' && (
                  <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    PNG फ़ाइल का साइज़ अधिक होता है। सटीक KB सीमा ({maxKb} KB) के लिए फ़ॉर्मेट को <strong>JPG / JPEG</strong> चुनें।
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-lg p-6 min-h-[260px] flex flex-col items-center justify-center text-center">
                <ImageIcon className="w-10 h-10 text-slate-300 mb-3" aria-hidden="true" />
                <div className="text-sm font-semibold text-slate-800">
                  रीसाइज़ की गई इमेज यहाँ दिखाई देगी
                </div>
                <div className="text-xs text-slate-600 mt-1 max-w-xs">
                  बाईं ओर से अपनी पासपोर्ट फोटो या हस्ताक्षर चुनें — टूल अपने-आप सटीक पिक्सेल और KB में तैयार कर देगा।
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200 space-y-2">
            {outputDataUrl && !isProcessing ? (
              <>
                <a
                  href={outputDataUrl}
                  download={downloadFileName}
                  className="no-link-color w-full py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition bg-[#15803d] hover:bg-[#166534] !text-white cursor-pointer shadow-xs no-underline"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {mode === 'photo'
                      ? 'रीसाइज़ फोटो डाउनलोड करें (Download Photo)'
                      : 'रीसाइज़ सिग्नेचर डाउनलोड करें (Download Signature)'}
                  </span>
                </a>
                {outputBlobUrl && (
                  <div className="text-center">
                    <a
                      href={outputBlobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                    >
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      <span>यदि डाउनलोड अपने-आप शुरू न हो तो नई टैब में खोलें (Open Image)</span>
                    </a>
                  </div>
                )}
              </>
            ) : (
              <button
                type="button"
                disabled
                className="w-full py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 bg-slate-200 text-slate-500 cursor-not-allowed"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                <span>
                  {isProcessing
                    ? 'प्रोसेस हो रहा है...'
                    : mode === 'photo'
                    ? 'रीसाइज़ फोटो डाउनलोड करें (Download Photo)'
                    : 'रीसाइज़ सिग्नेचर डाउनलोड करें (Download Signature)'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PhotoSignResizeTool;
