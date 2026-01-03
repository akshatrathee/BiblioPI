import React, { useRef, useState, useEffect } from 'react';
import { scanBookImage } from '../services/geminiService';
import { fetchBookByIsbn } from '../services/openLibraryService';
import { Book, BookCondition, ReadStatus } from '../types';
import { generateId, loadState } from '../services/storageService';

interface ScannerProps {
  onScanComplete: (book: Book) => void;
  onClose: () => void;
  onSelectBook?: (book: Book) => void;
  existingBooks: Book[];
}

export const Scanner: React.FC<ScannerProps> = ({ onScanComplete, onClose, onSelectBook, existingBooks }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [mode, setMode] = useState<'barcode' | 'cover' | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const recentAddedBooks = [...existingBooks]
    .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
    .slice(0, 3);

  useEffect(() => {
    if (mode) startCamera();
    return () => stopCamera();
  }, [mode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      if (mode === 'barcode') startBarcodeDetection();
    } catch (e) {
      console.error(e);
      setStatus("Camera access error");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(t => t.stop());
  };

  const startBarcodeDetection = () => {
    // @ts-ignore
    if (!('BarcodeDetector' in window)) return setStatus("Barcode API not supported");
    // @ts-ignore
    const detector = new window.BarcodeDetector({ formats: ['ean_13', 'isbn_13'] });
    const interval = setInterval(async () => {
      if (videoRef.current && !isScanning) {
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            clearInterval(interval);
            handleIsbn(barcodes[0].rawValue);
          }
        } catch { }
      }
    }, 500);
  };

  const handleIsbn = async (isbn: string) => {
    setIsScanning(true);
    setStatus(`Found ISBN: ${isbn}`);
    const book = await fetchBookByIsbn(isbn);
    if (book) {
      finish(book);
    } else {
      setStatus("Book not found via ISBN");
    }
    setIsScanning(false);
  };

  const captureCover = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsScanning(true);
    setStatus("Analyzing cover...");
    const ctx = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx?.drawImage(videoRef.current, 0, 0);
    const image = canvasRef.current.toDataURL('image/jpeg');
    try {
      const state = loadState();
      const book = await scanBookImage(image, state.aiSettings);
      finish(book); // Don't use the camera shot as cover if we have better
    } catch {
      setStatus("Analysis failed");
    }
    setIsScanning(false);
  };

  const finish = (partial: Partial<Book>) => {
    const state = loadState();
    const activeUser = state.users.find(u => u.id === state.currentUser) || state.users[0];

    onScanComplete({
      id: generateId(),
      isbn: partial.isbn || 'UNKNOWN',
      title: partial.title || 'Unknown Title',
      author: partial.author || 'Unknown',
      genres: partial.genres || [],
      tags: [],
      condition: BookCondition.GOOD,
      isFirstEdition: false,
      isSigned: false,
      addedByUserId: activeUser.id,
      addedByUserName: activeUser.name,
      addedDate: new Date().toISOString(),
      status: ReadStatus.UNREAD,
      coverUrl: partial.coverUrl,
      summary: partial.summary,
      estimatedValue: partial.estimatedValue || 0,
      purchasePrice: 0,
      minAge: partial.minAge,
      parentalAdvice: partial.parentalAdvice,
      understandingGuide: partial.understandingGuide,
      mediaAdaptations: partial.mediaAdaptations,
      culturalReference: partial.culturalReference,
      amazonLink: partial.amazonLink || `https://www.amazon.in/s?k=${encodeURIComponent(partial.title || '')}`,
    });
  };

  const handleManualEntry = () => {
    const isbn = prompt("Enter ISBN or Title:");
    if (isbn && isbn.trim()) {
      handleIsbn(isbn.trim());
    }
  };

  if (mode) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in">
        <div className="relative flex-1 bg-black">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-80" />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanner Overlay UI */}
          <div className="absolute inset-0 flex flex-col justify-between p-6">
            <div className="flex justify-between items-center">
              <button onClick={() => setMode(null)} className="size-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
                <span className="material-symbols-outlined">close</span>
              </button>
              <div className="px-4 py-2 rounded-full bg-primary/20 backdrop-blur-md border border-primary/40 text-primary-light text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                {mode === 'barcode' ? 'Scanning Barcode' : 'Cover Analysis'}
              </div>
              <div className="size-12"></div>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="w-72 h-48 border-2 border-primary/50 rounded-2xl relative shadow-[0_0_50px_rgba(25,76,230,0.3)]">
                <div className="absolute inset-x-0 h-0.5 bg-primary animate-scan shadow-[0_0_15px_rgba(25,76,230,0.8)]"></div>
                <div className="absolute top-0 left-0 size-6 border-t-2 border-l-2 border-primary rounded-tl-xl"></div>
                <div className="absolute top-0 right-0 size-6 border-t-2 border-r-2 border-primary rounded-tr-xl"></div>
                <div className="absolute bottom-0 left-0 size-6 border-b-2 border-l-2 border-primary rounded-bl-xl"></div>
                <div className="absolute bottom-0 right-0 size-6 border-b-2 border-r-2 border-primary rounded-br-xl"></div>
              </div>
            </div>

            <div className="text-center space-y-4">
              {status && (
                <div className="inline-block px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md text-white text-sm font-medium border border-white/10 animate-fade-in">
                  {status}
                </div>
              )}
              <div className="flex justify-center gap-6">
                {mode === 'cover' && (
                  <button onClick={captureCover} className="size-20 rounded-full bg-white flex items-center justify-center text-black shadow-2xl active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-4xl">camera</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background-light dark:bg-[#020617] flex flex-col overflow-y-auto no-scrollbar animate-fade-in pb-10">
      <nav className="sticky top-0 z-50 flex items-center justify-between p-5 bg-[#020617]/80 backdrop-blur-md border-b border-white/5">
        <button onClick={onClose} className="flex items-center justify-center size-10 rounded-full hover:bg-white/5 transition-colors active:scale-95">
          <span className="material-symbols-outlined text-white">arrow_back</span>
        </button>
        <span className="text-xs font-bold tracking-[0.2em] text-white/50 uppercase">Inventory Control</span>
        <button onClick={() => setShowHelp(true)} className="size-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors">
          <span className="material-symbols-outlined text-white/40">help_outline</span>
        </button>
      </nav>

      {showHelp && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in" onClick={() => setShowHelp(false)}>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] max-w-sm w-full shadow-2xl space-y-6 relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <span className="material-symbols-outlined text-9xl">help</span>
            </div>
            <div className="space-y-2 relative z-10">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Scanning Guide</h2>
              <p className="text-slate-500 text-sm font-medium">Get the best results for your collection.</p>
            </div>
            <div className="space-y-4 relative z-10">
              <div className="flex gap-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">barcode_scanner</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Barcode Scanner</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Best for modern books with internal ISBNs. Just point and wait for the click.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="size-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-purple-500">shutter_speed</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Snap Cover (AI)</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Perfect for vintage books. Our AI identifies titles, authors, and editions from the cover art.</p>
                </div>
              </div>
            </div>
            <button onClick={() => setShowHelp(false)} className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all">
              Got it!
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center w-full max-w-xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-3 py-4 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-[10px] font-bold uppercase tracking-widest mb-2">
            <span className="material-symbols-outlined text-xs">add_box</span> New Entry
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Add a Book</h1>
          <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed font-medium">
            Sync your physical collection with BiblioPi's AI-powered database.
          </p>
        </div>

        <div className="w-full grid grid-cols-1 gap-4">
          <button onClick={() => setMode('barcode')} className="group relative w-full h-44 rounded-[2rem] overflow-hidden text-left shadow-2xl transition-all active:scale-[0.98] border border-white/5">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&q=80&w=400")' }}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
            <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
              <div className="size-12 rounded-2xl bg-primary/20 backdrop-blur-xl flex items-center justify-center border border-primary/30 text-primary-light">
                <span className="material-symbols-outlined">barcode_scanner</span>
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white">Scan Barcode</h2>
                <p className="text-slate-300 text-xs font-medium opacity-70 tracking-wide uppercase">Fastest for Modern Books</p>
              </div>
            </div>
          </button>

          <button onClick={() => setMode('cover')} className="group relative w-full h-44 rounded-[2rem] overflow-hidden text-left shadow-2xl transition-all active:scale-[0.98] border border-white/5">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400")' }}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-black/80 to-transparent"></div>
            <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
              <div className="size-12 rounded-2xl bg-purple-500/20 backdrop-blur-xl flex items-center justify-center border border-purple-500/30 text-purple-300">
                <span className="material-symbols-outlined">shutter_speed</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-white">Snap Cover</h2>
                  <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg">AI Vision</span>
                </div>
                <p className="text-slate-300 text-xs font-medium opacity-70 tracking-wide uppercase">Best for Vintage & No-ISBN</p>
              </div>
            </div>
          </button>
        </div>

        <button
          onClick={handleManualEntry}
          className="w-full flex items-center justify-center gap-3 text-slate-400 hover:text-white transition-all py-5 px-6 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/5 font-bold text-sm tracking-wide"
        >
          <span className="material-symbols-outlined text-xl">edit_square</span>
          Enter ISBN or Title Manually
        </button>

        {/* Recent Scans Section */}
        <section className="w-full space-y-4 pt-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Recent Scans</h3>
            <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">History</span>
          </div>

          <div className="space-y-3">
            {recentAddedBooks.length > 0 ? recentAddedBooks.map((book, i) => (
              <div
                key={book.id}
                onClick={() => onSelectBook?.(book)}
                className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 hover:border-primary/50 transition-all cursor-pointer group active:scale-[0.98] animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="size-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 relative">
                  {book.coverUrl ? (
                    <img src={book.coverUrl} className="w-full h-full object-cover" alt="Cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <span className="material-symbols-outlined">book</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{book.title}</h4>
                  <p className="text-[10px] font-bold text-primary/80 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                    Recently Added
                  </p>
                </div>
                <span className="material-symbols-outlined text-white/20 group-hover:text-white/60 transition-colors">chevron_right</span>
              </div>
            )) : (
              <div className="py-10 flex flex-col items-center justify-center bg-white/[0.02] rounded-[2rem] border border-dashed border-white/10">
                <span className="material-symbols-outlined text-4xl text-white/10 mb-2">history</span>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">No recent scans yet</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};