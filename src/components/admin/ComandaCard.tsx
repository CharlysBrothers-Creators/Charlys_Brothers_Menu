import React, { useState } from 'react';
import {
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Clock,
  User,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  History,
  XCircle,
  Play,
  Check,
} from 'lucide-react';
import {
  Comanda,
  ComandaStatus,
  ComandaLineStatus,
  ComandaLineItem,
} from '../../types/comanda';
import { formatCUP } from '../../services/cartCalculations';

interface ComandaCardProps {
  comanda: Comanda;
  onUpdateComandaStatus: (id: string, newStatus: ComandaStatus) => Promise<void>;
  onUpdateLineStatus: (
    comandaId: string,
    lineId: string,
    newLineStatus: ComandaLineStatus
  ) => Promise<void>;
  onRequestCancel: (comanda: Comanda) => void;
}

export const ComandaCard: React.FC<ComandaCardProps> = ({
  comanda,
  onUpdateComandaStatus,
  onUpdateLineStatus,
  onRequestCancel,
}) => {
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Relative time helper
  const formatTime = (ts: number) => {
    const date = new Date(ts);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const diffMin = Math.max(0, Math.floor((Date.now() - ts) / 60000));
    const relative = diffMin === 0 ? 'Ahora' : `Hace ${diffMin} min`;
    return `${hours}:${minutes} (${relative})`;
  };

  const getStatusBadge = (status: ComandaStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Nuevo
          </span>
        );
      case 'in_preparation':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <ChefHat className="w-3 h-3" />
            En preparación
          </span>
        );
      case 'partially_ready':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-500/15 text-orange-300 border border-orange-500/30">
            <Clock className="w-3 h-3" />
            Parcialmente listo
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Listo
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-500/15 text-stone-300 border border-white/10">
            <PackageCheck className="w-3 h-3" />
            Completado
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E63946]/15 text-[#E63946] border border-[#E63946]/30">
            <XCircle className="w-3 h-3" />
            Cancelado
          </span>
        );
    }
  };

  const getLineStatusBadge = (status: ComandaLineStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-800 text-stone-400 border border-white/5">
            Pendiente
          </span>
        );
      case 'preparing':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
            En cocina
          </span>
        );
      case 'ready':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Listo
          </span>
        );
      case 'delivered':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            Entregado
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30">
            Cancelado
          </span>
        );
    }
  };

  const getModalityIcon = (mod: string) => {
    switch (mod) {
      case 'dine_in':
        return <UtensilsCrossed className="w-4 h-4 text-[#D4AF37]" />;
      case 'takeaway':
        return <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />;
      case 'delivery':
      default:
        return <Bike className="w-4 h-4 text-[#D4AF37]" />;
    }
  };

  const handleLineStatusClick = async (lineId: string, nextStatus: ComandaLineStatus) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await onUpdateLineStatus(comanda.id, lineId, nextStatus);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComandaStatusClick = async (nextStatus: ComandaStatus) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await onUpdateComandaStatus(comanda.id, nextStatus);
    } finally {
      setIsProcessing(false);
    }
  };

  // Group items by pass if service rhythm is staged
  const isStaged = comanda.customer.serviceRhythm === 'staged';
  const passesGrouped = React.useMemo(() => {
    if (!isStaged) return null;
    const groups: Record<number, ComandaLineItem[]> = {};
    comanda.items.forEach((item) => {
      const pass = item.passNumber || 1;
      if (!groups[pass]) groups[pass] = [];
      groups[pass].push(item);
    });
    return Object.entries(groups)
      .map(([pass, items]) => ({ pass: parseInt(pass, 10), items }))
      .sort((a, b) => a.pass - b.pass);
  }, [comanda.items, isStaged]);

  const renderItemLine = (item: ComandaLineItem) => {
    const isCancelled = item.status === 'cancelled';
    const isDelivered = item.status === 'delivered';
    const isReady = item.status === 'ready';

    return (
      <div
        key={item.id}
        className={`p-2.5 rounded-xl border transition-all ${
          isCancelled
            ? 'bg-black/30 border-white/5 opacity-50'
            : isDelivered
            ? 'bg-[#15120E] border-white/5 opacity-80'
            : isReady
            ? 'bg-emerald-950/20 border-emerald-500/30'
            : 'bg-[#1A1511] border-white/8'
        }`}
      >
        <div className="flex items-start gap-2.5">
          {/* Thumbnail */}
          <div className="w-11 h-11 rounded-lg overflow-hidden bg-black/40 flex-shrink-0 border border-white/5">
            <img
              src={item.productImage}
              alt={item.productName}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Item details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-1">
              <span className="font-display text-xs sm:text-sm font-bold text-[#F8E6C1] truncate">
                {item.quantity}x {item.productName}
              </span>
              <span className="text-xs font-semibold text-stone-300 flex-shrink-0">
                {formatCUP(item.lineTotal)}
              </span>
            </div>

            {/* Customizations */}
            {item.selectedOptions && item.selectedOptions.length > 0 && (
              <div className="text-[10px] text-stone-400 mt-0.5 space-y-0.5">
                {item.selectedOptions.map((opt, idx) => (
                  <span key={`${item.id}-opt-${idx}`} className="inline-block mr-2 text-amber-200/80">
                    {opt.type === 'remove' ? `• Sin ${opt.name.replace(/^Sin\s+/i, '')}` : `• +${opt.name}`}
                  </span>
                ))}
              </div>
            )}

            {/* Line Status Badge and Inline Transition Buttons */}
            <div className="flex items-center justify-between gap-1.5 flex-wrap mt-2 pt-1.5 border-t border-white/5">
              <div className="flex items-center gap-1.5 flex-wrap">
                {getLineStatusBadge(item.status)}
                {isStaged && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/25">
                    {item.passNumber}.º pase
                  </span>
                )}
              </div>

              {/* Progress buttons (only if comanda is active) */}
              {comanda.status !== 'completed' && comanda.status !== 'cancelled' && !isCancelled && (
                <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
                  {item.status === 'pending' && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleLineStatusClick(item.id, 'preparing')}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 text-amber-300 text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 border border-amber-500/30"
                    >
                      <Play className="w-2.5 h-2.5" />
                      <span>Preparar</span>
                    </button>
                  )}
                  {item.status === 'preparing' && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleLineStatusClick(item.id, 'ready')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 text-emerald-300 text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 border border-emerald-500/30"
                    >
                      <Check className="w-2.5 h-2.5" />
                      <span>Listo</span>
                    </button>
                  )}
                  {item.status === 'ready' && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleLineStatusClick(item.id, 'delivered')}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 active:scale-95 text-cyan-300 text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 border border-cyan-500/30"
                    >
                      <PackageCheck className="w-2.5 h-2.5" />
                      <span>Entregar</span>
                    </button>
                  )}
                  {item.status === 'delivered' && (
                    <span className="text-[10px] text-stone-500 italic">
                      Entregado
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl bg-[#16120E] border border-white/8 hover:border-[#D4AF37]/30 transition-all shadow-md flex flex-col justify-between overflow-hidden">
      {/* Top Header Card */}
      <div className="p-3.5 sm:p-4 border-b border-white/8 space-y-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
            <span className="font-mono text-sm sm:text-base font-extrabold text-[#F8E6C1]">
              {comanda.code}
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-xs min-w-0">
              {getModalityIcon(comanda.customer.modality)}
              <span className="font-semibold text-stone-200 truncate">
                {comanda.customer.tableName || comanda.customer.modalityTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {getStatusBadge(comanda.status)}
          </div>
        </div>

        {/* Time and ID metadata */}
        <div className="flex items-center justify-between text-[11px] text-stone-400 pt-0.5">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#D4AF37]" />
            {formatTime(comanda.createdAt)}
          </span>
          <span className="font-mono text-[10px] text-stone-400">
            {comanda.id}
          </span>
        </div>

        {/* Customer & Location Details */}
        <div className="pt-2 border-t border-white/5 space-y-1 text-xs">
          {comanda.customer.customerName && (
            <div className="flex items-center gap-1.5 text-stone-300">
              <User className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              <span className="font-medium text-stone-200">
                {comanda.customer.customerName}
              </span>
              {comanda.customer.phone && (
                <span className="text-stone-400 ml-1">· {comanda.customer.phone}</span>
              )}
            </div>
          )}

          {comanda.customer.address && (
            <div className="flex items-start gap-1.5 text-stone-300">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
              <div>
                <span>{comanda.customer.address}</span>
                {comanda.customer.landmarks && (
                  <span className="block text-[11px] text-stone-400 italic">
                    Ref: {comanda.customer.landmarks}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Service Rhythm Callout */}
          <div className="flex items-center gap-1.5 text-[11px] text-amber-300/90 pt-0.5">
            <Clock className="w-3 h-3 text-[#D4AF37] flex-shrink-0" />
            <span className="font-medium">
              Ritmo de servicio:{' '}
              <span className="text-[#F8E6C1]">{comanda.customer.serviceRhythmLabel}</span>
            </span>
          </div>

          {/* Special notes */}
          {comanda.customer.notes && (
            <div className="p-2 rounded-lg bg-black/40 border border-white/5 text-[11px] text-stone-300 italic mt-1">
              «{comanda.customer.notes}»
            </div>
          )}

          {/* Cancellation reason if cancelled */}
          {comanda.status === 'cancelled' && comanda.cancellationReason && (
            <div className="p-2 rounded-lg bg-[#E63946]/10 border border-[#E63946]/20 text-[11px] text-[#F8E6C1]">
              <strong className="text-[#E63946] block">Cancelado:</strong>
              {comanda.cancellationReason}
            </div>
          )}
        </div>
      </div>

      {/* Items Section: Staged grouped or natural list */}
      <div className="p-3.5 sm:p-4 space-y-3 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-wider">
          <span>Platos ({comanda.summary.totalItemsCount})</span>
          <span>{comanda.items.length} {comanda.items.length === 1 ? 'línea' : 'líneas'}</span>
        </div>

        {isStaged && passesGrouped ? (
          <div className="space-y-3.5">
            {passesGrouped.map(({ pass, items }) => (
              <div key={`pass-group-${pass}`} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-md border border-[#D4AF37]/25">
                    {pass}.º PASE
                  </span>
                  <div className="h-px bg-white/10 flex-1" />
                </div>
                <div className="space-y-2">
                  {items.map(renderItemLine)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {comanda.items.map(renderItemLine)}
          </div>
        )}
      </div>

      {/* Bottom Actions and Summary */}
      <div className="p-3.5 sm:p-4 bg-black/30 border-t border-white/8 space-y-3">
        {/* Total info */}
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-stone-400 font-medium">Total comanda:</span>
          <span className="font-display text-sm sm:text-base font-bold text-[#D4AF37]">
            {formatCUP(comanda.summary.grandTotal)}
          </span>
        </div>

        {/* Macro Transition Buttons */}
        <div className="space-y-1.5">
          {comanda.status === 'new' && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleComandaStatusClick('in_preparation')}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Iniciar Preparación Global</span>
            </button>
          )}

          {(comanda.status === 'in_preparation' || comanda.status === 'partially_ready') && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleComandaStatusClick('ready')}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Marcar Todo Listo para Servir</span>
            </button>
          )}

          {comanda.status === 'ready' && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleComandaStatusClick('completed')}
              className="w-full py-2.5 px-3 rounded-xl gold-button-gradient text-[#1A1A1A] text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <PackageCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Completar y Cerrar Pedido</span>
            </button>
          )}

          {/* Secondary Actions: Cancel / Reopen / View History */}
          <div className="flex items-center justify-between gap-2 pt-1 text-xs">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-200 transition cursor-pointer"
            >
              <History className="w-3 h-3 text-[#D4AF37]" />
              <span>Historial ({comanda.history.length})</span>
              {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {comanda.status !== 'completed' && comanda.status !== 'cancelled' && (
              <button
                type="button"
                onClick={() => onRequestCancel(comanda)}
                className="text-[11px] text-red-400 hover:text-red-300 transition cursor-pointer flex items-center gap-1"
              >
                <XCircle className="w-3 h-3" />
                <span>Cancelar comanda</span>
              </button>
            )}
          </div>

          {/* History Collapsible Panel */}
          {showHistory && (
            <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 space-y-1.5 max-h-40 overflow-y-auto text-[10px] text-stone-300 animate-in fade-in duration-150">
              <span className="font-bold text-[#D4AF37] block uppercase tracking-wider text-[9px]">
                Historial de operaciones:
              </span>
              {comanda.history.map((entry) => (
                <div key={entry.id} className="pb-1 border-b border-white/5 last:border-0">
                  <div className="flex items-center justify-between text-stone-400">
                    <span className="font-semibold text-stone-200">{entry.action}</span>
                    <span>{new Date(entry.timestamp).toLocaleTimeString('es-CU', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {entry.note && (
                    <p className="text-stone-400 italic text-[9px] mt-0.5">{entry.note}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
