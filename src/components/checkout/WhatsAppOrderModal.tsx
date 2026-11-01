import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink,
  ShoppingBag,
  RotateCcw,
  X,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { buildWhatsAppUrl, cleanWhatsAppNumber } from '../../services/whatsappService';

interface WhatsAppOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  referenceId: string;
  whatsappPhone: string;
  orderMessage: string;
  onResetOrder: () => void;
}

export const WhatsAppOrderModal: React.FC<WhatsAppOrderModalProps> = ({
  isOpen,
  onClose,
  referenceId,
  whatsappPhone,
  orderMessage,
  onResetOrder,
}) => {
  const navigate = useNavigate();
  const [hasOpenedWhatsApp, setHasOpenedWhatsApp] = useState<boolean>(false);
  const [userConfirmedSent, setUserConfirmedSent] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);

  if (!isOpen) return null;

  const whatsappUrl = buildWhatsAppUrl(whatsappPhone, orderMessage);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(orderMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleOpenWhatsApp = () => {
    setHasOpenedWhatsApp(true);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleConfirmReset = () => {
    onResetOrder();
    onClose();
    navigate('/menu');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-order-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-150 select-none overflow-y-auto"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-[#16120E] border border-[#D4AF37]/50 p-4 sm:p-5 my-auto max-h-[94vh] overflow-y-auto shadow-2xl text-stone-100 space-y-4">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ventana"
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-white bg-white/5 hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Reference & Icon */}
        <div className="flex flex-col items-center text-center pt-1">
          <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-2.5 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
            <MessageSquare className="w-7 h-7 stroke-[2.2]" />
          </div>

          <h3
            id="whatsapp-order-title"
            className="font-display text-lg font-bold text-[#F8E6C1]"
          >
            Pedido Preparado para Enviar
          </h3>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono font-bold text-[#D4AF37] px-2.5 py-0.5 rounded-md bg-[#D4AF37]/15 border border-[#D4AF37]/30">
              #{referenceId}
            </span>
            <span className="text-[11px] text-stone-400">
              Destino: <strong className="text-stone-200">{whatsappPhone}</strong>
            </span>
          </div>
        </div>

        {/* Honest Explanation Notice (Requirement 5) */}
        <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/35 text-xs text-amber-200/90 space-y-2 leading-relaxed">
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-amber-300 font-semibold block text-xs">
                Aviso honesto sobre el estado del pedido:
              </strong>
              <p className="text-[11px] text-amber-200/80">
                El pedido fue estructurado en tu dispositivo, pero{' '}
                <span className="font-bold underline text-amber-100">
                  el restaurante aún NO lo ha recibido
                </span>
                . La recepción real depende de que abras WhatsApp, envíes el mensaje prellenado y el personal de D'Batule confirme la orden.
              </p>
            </div>
          </div>
        </div>

        {/* WhatsApp Launch Action Button */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-stone-950 font-bold text-sm shadow-[0_4px_20px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2.5 transition active:scale-[0.98] cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 stroke-[2.5]" />
            <span>Abrir WhatsApp y Enviar Pedido</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-80" />
          </button>

          {hasOpenedWhatsApp && (
            <p className="text-[11px] text-center text-emerald-400/90 font-medium animate-in fade-in duration-200">
              ✓ WhatsApp fue abierto con el mensaje estructurado.
            </p>
          )}
        </div>

        {/* Client Honest Confirmation Checkbox */}
        <div className="p-3 rounded-xl bg-[#1C1712] border border-white/8 space-y-2">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={userConfirmedSent}
              onChange={(e) => setUserConfirmedSent(e.target.checked)}
              className="mt-0.5 rounded-sm border-white/20 text-[#D4AF37] focus:ring-[#D4AF37] bg-[#120F0D]"
            />
            <div className="text-xs">
              <span className="font-semibold text-stone-200 block">
                Ya envié el mensaje por WhatsApp
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5 leading-tight">
                Marcas esto para tu propio control personal. No constituye confirmación oficial de recepción por el restaurante ni cobro.
              </span>
            </div>
          </label>
        </div>

        {/* Message Preview Accordion with Copy */}
        <div className="p-3 rounded-xl bg-[#120F0D] border border-white/8 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-400 font-medium text-[11px]">
              Contenido del mensaje preparado:
            </span>
            <button
              type="button"
              onClick={handleCopyMessage}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-stone-300 text-[10px] font-semibold transition cursor-pointer"
              title="Copiar texto del pedido"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[#D4AF37]" />
                  <span>Copiar texto</span>
                </>
              )}
            </button>
          </div>

          <pre className="text-[10px] text-stone-300 font-mono bg-black/50 p-2.5 rounded-lg overflow-x-auto max-h-32 whitespace-pre-wrap leading-relaxed border border-white/5">
            {orderMessage}
          </pre>
        </div>

        {/* Exit Options: Keep Cart vs New Order */}
        {!showConfirmReset ? (
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl gold-button-gradient text-[#1A1A1A] font-bold text-xs shadow-xs hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Conservar pedido y seguir navegando</span>
            </button>

            <button
              type="button"
              onClick={() => setShowConfirmReset(true)}
              className="w-full py-2 px-3 rounded-xl bg-transparent hover:bg-white/5 text-stone-400 hover:text-stone-200 text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Iniciar un nuevo pedido</span>
            </button>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-500/30 space-y-2.5 animate-in fade-in duration-150">
            <span className="text-xs font-bold text-red-200 block">
              ¿Deseas vaciar el pedido actual e iniciar uno nuevo?
            </span>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              Los productos de tu carrito se limpiarán para que puedas realizar una nueva orden.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition cursor-pointer"
              >
                Sí, vaciar y empezar
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
