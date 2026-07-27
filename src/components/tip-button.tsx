'use client';

import { useState, useEffect } from 'react';
import { Coffee, Heart, X, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';

interface TipOption {
  amount: number;
  label: string;
  emoji: string;
}

const TIP_PRESETS: TipOption[] = [
  { amount: 10000, label: 'Rp 10.000', emoji: '☕' },
  { amount: 25000, label: 'Rp 25.000', emoji: '🍰' },
  { amount: 50000, label: 'Rp 50.000', emoji: '🍕' },
  { amount: 100000, label: 'Rp 100.000', emoji: '🚀' },
];

export function TipButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(25000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'saweria' | 'bank' | 'qris'>('saweria');
  const [userNote, setUserNote] = useState('');
  const [copiedBank, setCopiedBank] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const bankAccount = '1234567890 (BCA a.n. Developer VotePlay)';

  const handleCopyBank = () => {
    navigator.clipboard.writeText('1234567890');
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleSendTip = () => {
    if (paymentMethod === 'saweria') {
      window.open('https://saweria.co', '_blank', 'noopener,noreferrer');
    }
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsOpen(false);
    }, 2500);
  };

  const finalAmount = isCustom ? Number(customAmount) || 0 : selectedAmount;

  return (
    <>
      {/* Floating Circular Tip Button */}
      <div className="fixed bottom-6 left-6 z-50 flex items-center group">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Tip Developer"
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30 hover:shadow-pink-500/50 hover:scale-110 active:scale-95 transition-all duration-300 group focus:outline-none focus:ring-4 focus:ring-rose-400/50"
        >
          {/* Pulsing Outer Glow Ring */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 opacity-70 blur-sm group-hover:opacity-100 animate-pulse transition-opacity duration-300" />

          {/* Button Content */}
          <span className="relative z-10 flex items-center justify-center">
            <Coffee className="w-7 h-7 transform group-hover:rotate-12 transition-transform duration-300" />
          </span>

          {/* Badge indicator */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4 z-20">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400 border-2 border-white dark:border-slate-900" />
          </span>
        </button>

        {/* Hover Tooltip */}
        <span className="absolute left-16 ml-2 px-3 py-1.5 rounded-lg bg-slate-900/90 text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-300 pointer-events-none border border-slate-700/50 backdrop-blur-md">
          Traktir Developer ☕
        </span>
      </div>

      {/* Tip Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tip-modal-title"
          >
            {/* Header Banner */}
            <div className="relative bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 p-6 text-white text-center">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mx-auto w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner mb-3 border border-white/30">
                <Coffee className="w-9 h-9 text-white animate-bounce" />
              </div>
              <h2 id="tip-modal-title" className="text-2xl font-bold tracking-tight">
                Dukung Developer ☕
              </h2>
              <p className="text-xs text-rose-100 mt-1 max-w-xs mx-auto">
                Dukunganmu sangat berarti untuk menjaga VotePlay tetap aktif & berkembang!
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {isSubmitted ? (
                <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                    <Heart className="w-9 h-9 fill-current animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Terima Kasih Banyak! ❤️
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
                    Apresiasimu memberikan semangat ekstra bagi tim kami untuk terus berkarya.
                  </p>
                </div>
              ) : (
                <>
                  {/* Preset Tip Nominal */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Pilih Nominal Tip
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {TIP_PRESETS.map((preset) => (
                        <button
                          key={preset.amount}
                          type="button"
                          onClick={() => {
                            setSelectedAmount(preset.amount);
                            setIsCustom(false);
                          }}
                          className={`flex items-center justify-between p-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                            !isCustom && selectedAmount === preset.amount
                              ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 shadow-sm ring-2 ring-rose-500/20'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <span>{preset.label}</span>
                          <span className="text-base">{preset.emoji}</span>
                        </button>
                      ))}
                    </div>

                    {/* Custom Amount Option */}
                    <div className="mt-2.5">
                      <button
                        type="button"
                        onClick={() => setIsCustom(true)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          isCustom
                            ? 'text-rose-600 dark:text-rose-400 font-bold'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                      >
                        {isCustom ? 'Nominal Kustom (Rp):' : '+ Atur Nominal Lainnya'}
                      </button>

                      {isCustom && (
                        <div className="mt-1.5 relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-sm font-medium text-slate-400">
                            Rp
                          </span>
                          <input
                            type="number"
                            min="1000"
                            placeholder="Contoh: 15000"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-rose-500 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Metode Pembayaran
                    </label>
                    <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('saweria')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                          paymentMethod === 'saweria'
                            ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        Saweria / E-Wallet
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('bank')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                          paymentMethod === 'bank'
                            ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        Transfer Bank
                      </button>
                    </div>
                  </div>

                  {/* Payment Detail Content */}
                  {paymentMethod === 'bank' ? (
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-amber-800 dark:text-amber-300">
                        <span>Rekening BCA:</span>
                        <span className="font-mono text-xs">{bankAccount}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyBank}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-xl text-xs font-semibold hover:bg-amber-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        {copiedBank ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span>No. Rekening Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Salin No. Rekening</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                      <span>Mendukung GoPay, OVO, Dana, ShopeePay & QRIS</span>
                      <ExternalLink className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    </div>
                  )}

                  {/* User Note Input */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Pesan Singkat (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Semangat terus bikin fiturnya! 🚀"
                      value={userNote}
                      onChange={(e) => setUserNote(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  {/* Submit / Action Button */}
                  <button
                    type="button"
                    onClick={handleSendTip}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-white font-bold text-sm shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                    <span>
                      Traktir {finalAmount > 0 ? `Rp ${finalAmount.toLocaleString('id-ID')}` : 'Developer'}
                    </span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
