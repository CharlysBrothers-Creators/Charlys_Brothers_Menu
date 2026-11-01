import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already installed or dismissed by user, do not display
  if (isInstalled || dismissed) {
    return null;
  }

  // Only show banner if installable via Chromium prompt or on iOS device
  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-2 left-4 right-4 z-40 max-w-sm mx-auto animate-fade-in">
        <div className="bg-[#1A1A1A]/95 backdrop-blur-md border border-[#D4AF37]/50 rounded-2xl p-3 shadow-[0_10px_25px_rgba(0,0,0,0.8)] flex items-center justify-between gap-3 text-stone-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37] flex-shrink-0 flex items-center justify-center text-[#1A1A1A]">
              <Download className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#F8E6C1] truncate">
                Instalar D’Batule
              </p>
              <p className="text-[11px] text-stone-400 truncate">
                Acceso rápido desde tu pantalla
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isInstallable && (
              <button
                onClick={install}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B88E28] text-[#1A1A1A] font-semibold text-xs hover:brightness-110 active:scale-95 transition"
              >
                Instalar
              </button>
            )}

            {isIOS && (
              <button
                onClick={() => setShowIOSGuide(true)}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B88E28] text-[#1A1A1A] font-semibold text-xs hover:brightness-110 active:scale-95 transition"
              >
                ¿Cómo instalar?
              </button>
            )}

            <button
              onClick={() => setDismissed(true)}
              aria-label="Cerrar aviso de instalación"
              className="p-1 rounded-md text-stone-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-[#1A1A1A] border border-[#D4AF37]/50 p-6 text-stone-100 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowIOSGuide(false)}
              aria-label="Cerrar guía de instalación"
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display text-lg font-semibold text-[#F8E6C1] mb-3">
              Instalar en iPhone o iPad
            </h3>

            <div className="space-y-3 text-xs text-stone-300">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded bg-white/10 text-[#D4AF37] flex-shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <span>
                  1. Toca el botón <strong>Compartir</strong> en la barra de Safari.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded bg-white/10 text-[#D4AF37] flex-shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <span>
                  2. Desliza hacia abajo y selecciona <strong>Agregar a Inicio</strong>.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-[#D4AF37] text-[#1A1A1A] font-semibold text-xs hover:brightness-110 transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
