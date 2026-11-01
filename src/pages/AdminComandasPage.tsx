import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Search,
  Filter,
  RotateCw,
  Trash2,
  ArrowLeft,
  Info,
  ChefHat,
  CheckCircle2,
  Clock,
  PackageCheck,
  XCircle,
  PlusCircle,
  ChevronDown,
  Check,
  Sliders,
} from 'lucide-react';
import { comandaRepository } from '../services/comandaRepository';
import { Comanda, ComandaStatus, ComandaLineStatus } from '../types/comanda';
import { OrderModalityId } from '../config/orderSettings';
import { ComandaCard } from '../components/admin/ComandaCard';
import { CancelComandaModal } from '../components/admin/CancelComandaModal';

export const AdminComandasPage: React.FC = () => {
  const navigate = useNavigate();

  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<ComandaStatus | 'all' | 'active'>('active');
  const [modalityFilter, setModalityFilter] = useState<OrderModalityId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedForCancel, setSelectedForCancel] = useState<Comanda | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Load comandas from repository
  const loadComandas = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const list = await comandaRepository.listComandas();
      setComandas(list);
    } catch (err) {
      console.error('Error al cargar comandas:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadComandas();
  }, [loadComandas]);

  // Handle comanda macro status change
  const handleUpdateComandaStatus = async (id: string, newStatus: ComandaStatus) => {
    try {
      const updated = await comandaRepository.updateComandaStatus(id, newStatus);
      setComandas((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setNotice(`Comanda ${updated.code} actualizada a estado: ${newStatus}`);
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      console.error('Error al actualizar comanda:', err);
      alert(err instanceof Error ? err.message : 'Error al actualizar comanda');
    }
  };

  // Handle individual product line status change
  const handleUpdateLineStatus = async (
    comandaId: string,
    lineId: string,
    newLineStatus: ComandaLineStatus
  ) => {
    try {
      const updated = await comandaRepository.updateLineStatus(comandaId, lineId, newLineStatus);
      setComandas((prev) => prev.map((c) => (c.id === comandaId ? updated : c)));
    } catch (err) {
      console.error('Error al actualizar plato:', err);
      alert(err instanceof Error ? err.message : 'Error al actualizar plato');
    }
  };

  // Handle cancellation with reason
  const handleConfirmCancel = async (comandaId: string, reason: string) => {
    const updated = await comandaRepository.cancelComanda(comandaId, reason);
    setComandas((prev) => prev.map((c) => (c.id === comandaId ? updated : c)));
    setNotice(`Comanda ${updated.code} cancelada.`);
    setTimeout(() => setNotice(null), 3000);
  };

  // Demo reset
  const handleClearAll = async () => {
    if (window.confirm('¿Seguro que deseas eliminar todas las comandas de prueba registradas?')) {
      await comandaRepository.clearAllComandas();
      await loadComandas();
      setNotice('Todas las comandas de prueba fueron eliminadas.');
      setTimeout(() => setNotice(null), 3000);
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const active = comandas.filter((c) => c.status !== 'completed' && c.status !== 'cancelled').length;
    const news = comandas.filter((c) => c.status === 'new').length;
    const inPrep = comandas.filter((c) => c.status === 'in_preparation').length;
    const partiallyReady = comandas.filter((c) => c.status === 'partially_ready').length;
    const prep = inPrep + partiallyReady;
    const ready = comandas.filter((c) => c.status === 'ready').length;
    const completed = comandas.filter((c) => c.status === 'completed').length;
    const cancelled = comandas.filter((c) => c.status === 'cancelled').length;
    return { active, news, inPrep, partiallyReady, prep, ready, completed, cancelled, total: comandas.length };
  }, [comandas]);

  // Dropdown menu state for "Más estados"
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    if (isMoreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMoreMenuOpen]);

  const moreStatusOptions: { id: ComandaStatus; label: string; count: number }[] = useMemo(() => [
    { id: 'in_preparation', label: 'En preparación', count: stats.inPrep },
    { id: 'partially_ready', label: 'Parcialmente listas', count: stats.partiallyReady },
    { id: 'ready', label: 'Listas', count: stats.ready },
    { id: 'completed', label: 'Completadas', count: stats.completed },
    { id: 'cancelled', label: 'Canceladas', count: stats.cancelled },
  ], [stats]);

  const activeMoreOption = moreStatusOptions.find((opt) => opt.id === statusFilter);

  // Filtered and searched list
  const filteredComandas = useMemo(() => {
    return comandas.filter((c) => {
      // Status filter
      if (statusFilter === 'active') {
        if (c.status === 'completed' || c.status === 'cancelled') return false;
      } else if (statusFilter !== 'all') {
        if (c.status !== statusFilter) return false;
      }

      // Modality filter
      if (modalityFilter !== 'all' && c.customer.modality !== modalityFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = c.code.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
        const matchesName = c.customer.customerName?.toLowerCase().includes(q);
        const matchesTable = c.customer.tableName?.toLowerCase().includes(q) || c.customer.tableId?.toLowerCase().includes(q);
        const matchesPhone = c.customer.phone?.includes(q);
        const matchesProduct = c.items.some((i) => i.productName.toLowerCase().includes(q));
        if (!matchesCode && !matchesName && !matchesTable && !matchesPhone && !matchesProduct) {
          return false;
        }
      }

      return true;
    });
  }, [comandas, statusFilter, modalityFilter, searchQuery]);

  return (
    <div className="flex flex-col min-h-full flex-1 bg-[#120F0D] text-stone-100 select-none pb-24">
      {/* Top Navigation & Brand Header */}
      <header className="sticky top-0 z-30 bg-[#120F0D]/95 backdrop-blur-md border-b border-[#2B1F14]/90 px-4 py-3 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/85 border border-[#D4AF37]/35 text-[#F8E6C1] text-xs font-semibold cursor-pointer transition active:scale-95 flex-shrink-0"
              title="Volver al Portal Administrativo"
            >
              <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
              <span className="hidden sm:inline">Panel Admin</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-[#D4AF37]" />
                <h1 className="font-display text-base sm:text-lg font-bold tracking-wide gold-gradient-text">
                  D’BATULE — Panel de Comandas
                </h1>
              </div>
              <span className="text-[10px] text-stone-400 block">
                Sistema de visualización y preparación en cocina (KDS)
              </span>
            </div>
          </div>

          {/* Demonstration Notice Badge and Actions */}
          <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end min-w-0">
            <span className="text-[10px] font-bold text-[#D4AF37] px-2.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 uppercase tracking-wider truncate max-w-full">
              <span className="sm:hidden">DEMO LOCAL (IndexedDB)</span>
              <span className="hidden sm:inline">DEMOSTRACIÓN INTERNA LOCAL (IndexedDB)</span>
            </span>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={loadComandas}
                disabled={isRefreshing}
                title="Actualizar listado"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white transition cursor-pointer border border-white/10"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#D4AF37]' : ''}`} />
              </button>

              {comandas.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  title="Eliminar comandas de prueba"
                  className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-stone-400 hover:text-red-400 transition cursor-pointer border border-white/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => navigate('/admin/gestion')}
                title="Ir al panel de gestión del propietario"
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border border-white/10 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="hidden sm:inline">Gestión</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/menu')}
                title="Ver la carta pública"
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white font-medium text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <span className="hidden sm:inline">Ver Carta</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Floating toast notification */}
      {notice && (
        <div className="fixed top-16 right-4 z-40 p-3 rounded-xl bg-[#1C1710] border border-[#D4AF37] text-[#F8E6C1] text-xs shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {notice}
        </div>
      )}

      {/* Security and Demo Context Banner */}
      <div className="mx-4 mt-3 p-3 rounded-2xl bg-[#16120E] border border-white/8 text-xs text-stone-300 flex items-start gap-2.5 shadow-xs">
        <Info className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
        <div className="leading-relaxed">
          <p className="text-[11px] text-stone-300">
            <strong>Módulo administrativo interno:</strong> Este panel refleja las órdenes registradas desde el checkout en este dispositivo.
            No requiere autenticación externa en esta fase de demostración local.
          </p>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="mx-4 mt-3 grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
        <div className="p-1.5 sm:p-2.5 rounded-xl bg-[#16120E] border border-white/8 text-center min-w-0">
          <span className="text-[9px] sm:text-[10px] text-stone-400 uppercase tracking-wider block font-medium truncate">Activas</span>
          <span className="font-display text-base sm:text-lg font-bold text-[#D4AF37]">{stats.active}</span>
        </div>
        <div className="p-1.5 sm:p-2.5 rounded-xl bg-[#16120E] border border-white/8 text-center min-w-0">
          <span className="text-[9px] sm:text-[10px] text-stone-400 uppercase tracking-wider block font-medium truncate">Nuevas</span>
          <span className="font-display text-base sm:text-lg font-bold text-blue-400">{stats.news}</span>
        </div>
        <div className="p-1.5 sm:p-2.5 rounded-xl bg-[#16120E] border border-white/8 text-center min-w-0">
          <span className="text-[9px] sm:text-[10px] text-stone-400 uppercase tracking-wider block font-medium truncate">En Cocina</span>
          <span className="font-display text-base sm:text-lg font-bold text-amber-400">{stats.prep}</span>
        </div>
        <div className="p-1.5 sm:p-2.5 rounded-xl bg-[#16120E] border border-white/8 text-center min-w-0">
          <span className="text-[9px] sm:text-[10px] text-stone-400 uppercase tracking-wider block font-medium truncate">Listas</span>
          <span className="font-display text-base sm:text-lg font-bold text-emerald-400">{stats.ready}</span>
        </div>
        <div className="p-1.5 sm:p-2.5 rounded-xl bg-[#16120E] border border-white/8 text-center min-w-0">
          <span className="text-[9px] sm:text-[10px] text-stone-400 uppercase tracking-wider block font-medium truncate">Completadas</span>
          <span className="font-display text-base sm:text-lg font-bold text-stone-400">{stats.completed}</span>
        </div>
        <div className="p-1.5 sm:p-2.5 rounded-xl bg-[#16120E] border border-white/8 text-center min-w-0">
          <span className="text-[9px] sm:text-[10px] text-stone-400 uppercase tracking-wider block font-medium truncate">Canceladas</span>
          <span className="font-display text-base sm:text-lg font-bold text-red-400">{stats.cancelled}</span>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="mx-4 mt-3 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Status Filters: Visible main filters + "Más estados" compact dropdown */}
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            {/* 1. Activas */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter('active');
                setIsMoreMenuOpen(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex-shrink-0 ${
                statusFilter === 'active'
                  ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-xs'
                  : 'bg-[#16120E] text-stone-400 hover:text-stone-200 border border-white/5'
              }`}
            >
              Activas ({stats.active})
            </button>

            {/* 2. Todas */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setIsMoreMenuOpen(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex-shrink-0 ${
                statusFilter === 'all'
                  ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-xs'
                  : 'bg-[#16120E] text-stone-400 hover:text-stone-200 border border-white/5'
              }`}
            >
              Todas ({stats.total})
            </button>

            {/* 3. Nuevas */}
            <button
              type="button"
              onClick={() => {
                setStatusFilter('new');
                setIsMoreMenuOpen(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex-shrink-0 ${
                statusFilter === 'new'
                  ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-xs'
                  : 'bg-[#16120E] text-stone-400 hover:text-stone-200 border border-white/5'
              }`}
            >
              Nuevas ({stats.news})
            </button>

            {/* 4. Compact "Más estados" dropdown selector */}
            <div ref={moreMenuRef} className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeMoreOption
                    ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-xs border border-[#D4AF37]'
                    : 'bg-[#16120E] text-stone-400 hover:text-stone-200 border border-white/5'
                }`}
                aria-expanded={isMoreMenuOpen}
                aria-haspopup="true"
              >
                <span>
                  {activeMoreOption
                    ? `${activeMoreOption.label} (${activeMoreOption.count})`
                    : 'Más estados'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isMoreMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute left-0 top-full mt-1.5 z-40 w-56 rounded-xl bg-[#1A1511] border border-[#D4AF37]/40 shadow-2xl p-1.5 space-y-1 animate-in fade-in duration-150">
                  <div className="px-2 py-1 text-[10px] uppercase font-bold text-stone-400 tracking-wider border-b border-white/5">
                    Filtrar por estado
                  </div>
                  {moreStatusOptions.map((opt) => {
                    const isOptSelected = statusFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setStatusFilter(opt.id);
                          setIsMoreMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                          isOptSelected
                            ? 'bg-[#D4AF37] text-[#1A1A1A] font-bold'
                            : 'text-stone-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {isOptSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                          <span>{opt.label}</span>
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                            isOptSelected
                              ? 'bg-black/20 text-[#1A1A1A]'
                              : 'bg-white/10 text-stone-400'
                          }`}
                        >
                          {opt.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64 flex-shrink-0">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por #, mesa, cliente..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#16120E] border border-white/10 text-stone-100 placeholder-stone-500 text-xs focus:outline-hidden focus:border-[#D4AF37] transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Modality Filter Tabs */}
        <div className="flex items-center gap-1.5 text-xs text-stone-400 flex-wrap">
          <span className="text-[11px] font-medium mr-1 flex-shrink-0">Modalidad:</span>
          {[
            { id: 'all', label: 'Todas' },
            { id: 'dine_in', label: 'En mesa', icon: UtensilsCrossed },
            { id: 'takeaway', label: 'Recogida', icon: ShoppingBag },
            { id: 'delivery', label: 'A domicilio', icon: Bike },
          ].map((item) => {
            const isSelected = modalityFilter === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setModalityFilter(item.id as OrderModalityId | 'all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-white/15 text-[#F8E6C1] border border-white/20'
                    : 'bg-white/5 text-stone-400 hover:text-stone-200 border border-transparent'
                }`}
              >
                {Icon && <Icon className="w-3 h-3 text-[#D4AF37]" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid Content */}
      <main className="mx-4 mt-4 flex-1">
        {loading ? (
          <div className="p-12 text-center text-stone-400 text-sm">
            Cargando comandas desde el almacenamiento local...
          </div>
        ) : filteredComandas.length === 0 ? (
          /* Empty State */
          <div className="p-12 rounded-3xl bg-[#16120E] border border-white/8 text-center max-w-md mx-auto my-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#1F1813] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mx-auto mb-2">
              <ClipboardList className="w-8 h-8 stroke-[1.8]" />
            </div>

            <h3 className="font-display text-base sm:text-lg font-bold text-[#F8E6C1]">
              {searchQuery || statusFilter !== 'active' || modalityFilter !== 'all'
                ? 'No hay comandas que coincidan con los filtros'
                : 'No hay comandas pendientes'}
            </h3>

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm mx-auto">
              {comandas.length === 0
                ? 'Los pedidos que finalices desde la pantalla de Checkout se registrarán como comandas en este panel para gestionar su preparación en cocina.'
                : 'Prueba cambiando o limpiando los filtros de estado y modalidad para ver otras comandas registradas.'}
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/menu')}
                className="px-5 py-2.5 rounded-xl gold-button-gradient text-[#1A1A1A] font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer inline-flex items-center gap-2"
              >
                <span>Crear Pedido desde el Catálogo</span>
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Cards Grid: Responsive across mobile, tablet, desktop */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredComandas.map((comanda) => (
              <ComandaCard
                key={comanda.id}
                comanda={comanda}
                onUpdateComandaStatus={handleUpdateComandaStatus}
                onUpdateLineStatus={handleUpdateLineStatus}
                onRequestCancel={(c) => setSelectedForCancel(c)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Cancellation Modal */}
      <CancelComandaModal
        comanda={selectedForCancel}
        isOpen={Boolean(selectedForCancel)}
        onClose={() => setSelectedForCancel(null)}
        onConfirmCancel={handleConfirmCancel}
      />
    </div>
  );
};
