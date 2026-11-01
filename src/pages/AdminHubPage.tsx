import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChefHat,
  Sliders,
  Utensils,
  Layers,
  LayoutGrid,
  Settings,
  ArrowRight,
  ShieldAlert,
  ExternalLink,
  ClipboardList,
  Sparkles,
  Phone,
  MessageSquare,
  Clock,
  Copy,
  Check,
  Link2,
  MapPin,
} from 'lucide-react';
import { adminRepository } from '../services/adminRepository';
import { comandaRepository } from '../services/comandaRepository';
import { DBATULE_PROFILE } from '../config/business';

export const AdminHubPage: React.FC = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    activeComandas: 0,
    totalProducts: 29,
    activeCategories: 6,
    totalTables: 10,
    totalDeliveryRates: 89,
    hasWhatsApp: false,
    whatsappPhone: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const [comandas, prods, cats, tbls, settings, rates] = await Promise.all([
          comandaRepository.listComandas(),
          adminRepository.getProducts(),
          adminRepository.getActiveCategories(),
          adminRepository.getTables(),
          adminRepository.getBusinessSettings(),
          adminRepository.getDeliveryRates(),
        ]);

        if (isMounted) {
          const activeCount = comandas.filter(
            (c) => c.status !== 'completed' && c.status !== 'cancelled'
          ).length;

          setStats({
            activeComandas: activeCount,
            totalProducts: prods.length,
            activeCategories: cats.length,
            totalTables: tbls.length,
            totalDeliveryRates: rates.length,
            hasWhatsApp: Boolean(settings.whatsappPhone?.trim()),
            whatsappPhone: settings.whatsappPhone || '',
          });
          setLoading(false);
        }
      } catch (err) {
        console.error('Error cargando estadísticas de administración:', err);
        if (isMounted) setLoading(false);
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const adminDirectUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#/admin`
    : '#/admin';

  const handleCopyAdminLink = async () => {
    try {
      await navigator.clipboard.writeText(adminDirectUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="flex flex-col min-h-full flex-1 bg-[#120F0D] text-stone-100 select-none pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#120F0D]/95 backdrop-blur-md border-b border-[#2B1F14]/90 px-3.5 sm:px-6 py-2.5 sm:py-3 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3">
          {/* Brand & Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1F1813] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-xs flex-shrink-0">
              <ChefHat className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display text-base sm:text-lg font-bold tracking-wider gold-gradient-text">
                  D’BATULE
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/35 whitespace-nowrap">
                  Panel Interno
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-stone-400 block tracking-wide truncate">
                Portal Administrativo del Restaurante
              </span>
            </div>
          </div>

          {/* Action buttons (Comfortable 2-column on small screens, flex on desktop) */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto flex-shrink-0">
            {/* Quick Copy Link Button in Header */}
            <button
              type="button"
              onClick={handleCopyAdminLink}
              title="Copiar enlace directo al panel administrativo"
              aria-label="Copiar enlace directo al panel administrativo"
              className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 active:bg-[#D4AF37]/30 text-[#D4AF37] border border-[#D4AF37]/35 text-xs font-semibold transition active:scale-95 cursor-pointer min-h-[38px] select-none"
            >
              {linkCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5] text-emerald-400 flex-shrink-0" />
                  <span className="text-emerald-400 font-bold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Copiar enlace</span>
                </>
              )}
            </button>

            {/* Quick link to preview public customer menu */}
            <button
              type="button"
              onClick={() => navigate('/menu')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-stone-300 hover:text-white text-xs font-semibold transition active:scale-95 cursor-pointer min-h-[38px] select-none"
              title="Abrir la carta pública del cliente"
              aria-label="Ver menú público del cliente"
            >
              <span>Ver Menú</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* Direct Link Share & Bookmark Card (Task 5 requirement) */}
        <div className="p-4 rounded-2xl bg-[#16120E] border border-[#D4AF37]/35 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#F8E6C1]">
              <Link2 className="w-4 h-4 text-[#D4AF37]" />
              <span>Acceso Directo al Panel Administrativo</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed max-w-xl">
              Guarda esta dirección en los marcadores de tu navegador o compártela con el personal para entrar directamente sin pasar por el catálogo de clientes.
            </p>
            <div className="pt-0.5">
              <code className="text-[10px] font-mono text-[#D4AF37] bg-black/60 px-2 py-0.5 rounded border border-white/8 select-all inline-block truncate max-w-full">
                {adminDirectUrl}
              </code>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyAdminLink}
            className="px-4 py-2.5 rounded-xl gold-button-gradient text-[#1A1A1A] font-bold text-xs flex items-center justify-center gap-2 transition hover:brightness-110 active:scale-95 cursor-pointer shadow-xs flex-shrink-0"
          >
            {linkCopied ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>¡Enlace copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 stroke-[2.2]" />
                <span>Copiar enlace al panel</span>
              </>
            )}
          </button>
        </div>

        {/* Transparent Security & Demo Notice (Task 7 requirement) */}
        <aside
          aria-label="Aviso de demostración"
          className="p-3.5 sm:p-4 rounded-2xl bg-amber-950/25 border border-amber-500/35 text-amber-200/90 text-xs shadow-xs"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <strong className="text-amber-300 font-semibold text-xs tracking-wide">
                  ACCESO ADMINISTRATIVO PARA PRUEBAS LOCALES (DEMO)
                </strong>
              </div>
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                Este panel opera exclusivamente en modo demostración local (IndexedDB) para evaluar flujos de personal.
                Actualmente no cuenta con backend remoto ni autenticación por usuario/contraseña. El enlace directo no debe considerarse una medida de seguridad. No introduzcas información confidencial ni datos personales reales de clientes.
              </p>
            </div>
          </div>
        </aside>

        {/* Operational Overview Metrics */}
        <section aria-label="Resumen operativo" className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <div
            onClick={() => navigate('/admin/comandas')}
            className="p-3 sm:p-3.5 rounded-2xl bg-[#16120E] hover:bg-[#1C1611] border border-white/8 hover:border-[#D4AF37]/40 shadow-xs cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-stone-400 mb-1">
              <span className="text-[11px] font-medium">Comandas activas</span>
              <ClipboardList className="w-3.5 h-3.5 text-[#D4AF37]" />
            </div>
            <span className="text-lg sm:text-xl font-bold font-display text-[#F8E6C1]">
              {loading ? '...' : stats.activeComandas}
            </span>
            <span className="text-[10px] text-stone-500 block mt-0.5">En cocina / salón</span>
          </div>

          <div
            onClick={() => navigate('/admin/gestion?tab=products')}
            className="p-3 sm:p-3.5 rounded-2xl bg-[#16120E] hover:bg-[#1C1611] border border-white/8 hover:border-[#D4AF37]/40 shadow-xs cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-stone-400 mb-1">
              <span className="text-[11px] font-medium">Platos en carta</span>
              <Utensils className="w-3.5 h-3.5 text-[#D4AF37]" />
            </div>
            <span className="text-lg sm:text-xl font-bold font-display text-[#F8E6C1]">
              {loading ? '...' : stats.totalProducts}
            </span>
            <span className="text-[10px] text-stone-500 block mt-0.5">Catálogo oficial</span>
          </div>

          <div
            onClick={() => navigate('/admin/gestion?tab=categories')}
            className="p-3 sm:p-3.5 rounded-2xl bg-[#16120E] hover:bg-[#1C1611] border border-white/8 hover:border-[#D4AF37]/40 shadow-xs cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-stone-400 mb-1">
              <span className="text-[11px] font-medium">Categorías</span>
              <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
            </div>
            <span className="text-lg sm:text-xl font-bold font-display text-[#F8E6C1]">
              {loading ? '...' : stats.activeCategories}
            </span>
            <span className="text-[10px] text-stone-500 block mt-0.5">Activas para clientes</span>
          </div>

          <div
            onClick={() => navigate('/admin/gestion?tab=settings')}
            className="p-3 sm:p-3.5 rounded-2xl bg-[#16120E] hover:bg-[#1C1611] border border-white/8 hover:border-[#D4AF37]/40 shadow-xs cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-stone-400 mb-1">
              <span className="text-[11px] font-medium">Canal WhatsApp</span>
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-xs sm:text-sm font-bold font-display text-stone-200 truncate block">
              {loading ? '...' : stats.hasWhatsApp ? 'Configurado' : 'Sin asignar'}
            </span>
            <span className="text-[10px] text-stone-500 block mt-0.5 truncate">
              {stats.hasWhatsApp ? stats.whatsappPhone : 'Tocar para configurar'}
            </span>
          </div>
        </section>

        {/* 2 Primary Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Card 1: KDS Kitchen Comandas */}
          <div
            onClick={() => navigate('/admin/comandas')}
            className="group relative p-5 rounded-2xl bg-gradient-to-br from-[#1C1611] to-[#14100D] border border-[#D4AF37]/30 hover:border-[#D4AF37]/70 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-[0_8px_30px_rgba(212,175,55,0.15)] flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center text-[#D4AF37]">
                  <ChefHat className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-stone-300">
                  Cocina / KDS
                </span>
              </div>

              <div>
                <h2 className="font-display text-lg font-bold text-[#F8E6C1] group-hover:text-white transition">
                  Panel de Comandas
                </h2>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  Visualización de pedidos en tiempo real, gestión de avance por líneas, ritmo de servicio por pases, entregas parciales y cancelaciones.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-white/8 flex items-center justify-between text-xs font-semibold text-[#D4AF37] group-hover:translate-x-0.5 transition-transform">
              <span>Abrir Sistema de Comandas</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: Business Management */}
          <div
            onClick={() => navigate('/admin/gestion')}
            className="group relative p-5 rounded-2xl bg-gradient-to-br from-[#1A1512] to-[#130F0D] border border-white/12 hover:border-[#D4AF37]/60 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-[0_8px_30px_rgba(212,175,55,0.15)] flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-stone-300">
                  <Sliders className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-stone-300">
                  Administración
                </span>
              </div>

              <div>
                <h2 className="font-display text-lg font-bold text-[#F8E6C1] group-hover:text-white transition">
                  Gestión del Negocio
                </h2>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  Control integral de la carta, modificación de precios, disponibilidad de platos, orden de categorías, mesas del salón y configuración del WhatsApp oficial.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-white/8 flex items-center justify-between text-xs font-semibold text-[#D4AF37] group-hover:translate-x-0.5 transition-transform">
              <span>Abrir Panel de Gestión</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* 6 Direct Section Shortcuts (Task 4 requirement) */}
        <div className="space-y-2.5 pt-2">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block px-1">
            Accesos directos a herramientas operativas
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {/* 1. Comandas Shortcut */}
            <button
              type="button"
              onClick={() => navigate('/admin/comandas')}
              className="p-3.5 rounded-xl bg-[#16120E] hover:bg-[#1C1611] border border-white/8 hover:border-[#D4AF37]/40 text-left transition active:scale-[0.99] cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <ClipboardList className="w-4 h-4 text-[#D4AF37]" />
                <ArrowRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
              </div>
              <span className="font-display text-xs font-bold text-[#F8E6C1] block">
                Comandas KDS
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">
                Recepción, preparación y entregas
              </span>
            </button>

            {/* 2. Products Shortcut */}
            <button
              type="button"
              onClick={() => navigate('/admin/gestion?tab=products')}
              className="p-3.5 rounded-xl bg-[#16120E] hover:bg-[#1C1611] border border-white/8 hover:border-[#D4AF37]/40 text-left transition active:scale-[0.99] cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <Utensils className="w-4 h-4 text-[#D4AF37]" />
                <ArrowRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
              </div>
              <span className="font-display text-xs font-bold text-[#F8E6C1] block">
                Productos
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">
                Precios CUP, ingredientes y disponibilidad
              </span>
            </button>

            {/* 3. Categories Shortcut */}
            <button
              type="button"
              onClick={() => navigate('/admin/gestion?tab=categories')}
              className="p-3.5 rounded-xl bg-[#16120E] hover:bg-[#1C1611] border border-white/8 hover:border-[#D4AF37]/40 text-left transition active:scale-[0.99] cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <Layers className="w-4 h-4 text-[#D4AF37]" />
                <ArrowRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
              </div>
              <span className="font-display text-xs font-bold text-[#F8E6C1] block">
                Categorías
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">
                Orden, visibilidad y conteos
              </span>
            </button>

            {/* 4. Tables Shortcut */}
            <button
              type="button"
              onClick={() => navigate('/admin/gestion?tab=tables')}
              className="p-3.5 rounded-xl bg-[#16120E] hover:bg-[#1C1611] border border-white/8 hover:border-[#D4AF37]/40 text-left transition active:scale-[0.99] cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <LayoutGrid className="w-4 h-4 text-[#D4AF37]" />
                <ArrowRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
              </div>
              <span className="font-display text-xs font-bold text-[#F8E6C1] block">
                Mesas y Zonas
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">
                Salón Principal, Terraza y Barra
              </span>
            </button>

            {/* 5. Settings Shortcut */}
            <button
              type="button"
              onClick={() => navigate('/admin/gestion?tab=settings')}
              className="p-3.5 rounded-xl bg-[#16120E] hover:bg-[#1C1611] border border-white/8 hover:border-[#D4AF37]/40 text-left transition active:scale-[0.99] cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <Settings className="w-4 h-4 text-[#D4AF37]" />
                <ArrowRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
              </div>
              <span className="font-display text-xs font-bold text-[#F8E6C1] block">
                Configuración
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">
                Nombre comercial, modalidades y avisos
              </span>
            </button>

            {/* 6. WhatsApp Shortcut */}
            <button
              type="button"
              onClick={() => navigate('/admin/gestion?tab=settings')}
              className="p-3.5 rounded-xl bg-[#16120E] hover:bg-[#1C1611] border border-emerald-500/20 hover:border-emerald-500/50 text-left transition active:scale-[0.99] cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <ArrowRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <span className="font-display text-xs font-bold text-stone-100 flex items-center gap-1.5">
                <span>WhatsApp Restaurante</span>
                {stats.hasWhatsApp && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">
                {stats.hasWhatsApp ? stats.whatsappPhone : 'Configurar número de pedidos'}
              </span>
            </button>

            {/* 7. Delivery Rates Shortcut */}
            <button
              type="button"
              onClick={() => navigate('/admin/gestion?tab=delivery')}
              className="p-3.5 rounded-xl bg-[#16120E] hover:bg-[#1C1611] border border-[#D4AF37]/25 hover:border-[#D4AF37]/60 text-left transition active:scale-[0.99] cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                <ArrowRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
              </div>
              <span className="font-display text-xs font-bold text-[#F8E6C1] block">
                Tarifas de Mensajería
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">
                {stats.totalDeliveryRates} destinos en 14 municipios
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
