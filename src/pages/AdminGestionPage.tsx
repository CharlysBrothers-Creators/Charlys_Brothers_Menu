import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Utensils,
  Layers,
  LayoutGrid,
  Sliders,
  ChefHat,
  ArrowLeft,
  RotateCw,
  RotateCcw,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { AdminProduct, AdminCategory, AdminTable, AdminBusinessSettings } from '../types/admin';
import { DeliveryRate } from '../types/deliveryRate';
import { adminRepository } from '../services/adminRepository';
import { AdminProductsSection } from '../components/admin/AdminProductsSection';
import { AdminCategoriesSection } from '../components/admin/AdminCategoriesSection';
import { AdminTablesSection } from '../components/admin/AdminTablesSection';
import { AdminSettingsSection } from '../components/admin/AdminSettingsSection';
import { AdminDeliveryRatesSection } from '../components/admin/AdminDeliveryRatesSection';
import { RestoreDemoModal } from '../components/admin/RestoreDemoModal';
import { MapPin } from 'lucide-react';

type AdminTab = 'products' | 'categories' | 'tables' | 'delivery' | 'settings';

export const AdminGestionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const validTabs: AdminTab[] = ['products', 'categories', 'tables', 'delivery', 'settings'];
  const tabFromQuery = searchParams.get('tab') as AdminTab | null;
  const initialTab = tabFromQuery && validTabs.includes(tabFromQuery) ? tabFromQuery : 'products';

  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [tables, setTables] = useState<AdminTable[]>([]);
  const [deliveryRates, setDeliveryRates] = useState<DeliveryRate[]>([]);
  const [settings, setSettings] = useState<AdminBusinessSettings | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync tab from URL query params
  useEffect(() => {
    const tabUrl = searchParams.get('tab') as AdminTab | null;
    if (tabUrl && validTabs.includes(tabUrl)) {
      setActiveTab(tabUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: AdminTab) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const loadAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [prods, cats, tbls, sets, rates] = await Promise.all([
        adminRepository.getProducts(),
        adminRepository.getCategories(),
        adminRepository.getTables(),
        adminRepository.getBusinessSettings(),
        adminRepository.getDeliveryRates(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setTables(tbls);
      setSettings(sets);
      setDeliveryRates(rates);
      setLoading(false);
    } catch (e) {
      console.error('Error cargando datos administrativos:', e);
      setLoading(false);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Subscribe to external repository updates
  useEffect(() => {
    return adminRepository.subscribe(() => {
      loadAllData();
    });
  }, [loadAllData]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRestoreDefaults = async () => {
    await adminRepository.restoreOfficialDemoData();
    await loadAllData();
    triggerToast('Se restauraron los datos oficiales de demostración.');
  };

  const tabs: { id: AdminTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'products', label: 'Productos', icon: Utensils },
    { id: 'categories', label: 'Categorías', icon: Layers },
    { id: 'tables', label: 'Mesas', icon: LayoutGrid },
    { id: 'delivery', label: 'Mensajería', icon: MapPin },
    { id: 'settings', label: 'Configuración', icon: Sliders },
  ];

  return (
    <div className="flex flex-col min-h-full flex-1 bg-[#120F0D] text-stone-100 select-none pb-10">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#120F0D]/95 backdrop-blur-md border-b border-[#2B1F14]/90 px-3.5 sm:px-4 py-2.5 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
          {/* Left Brand & Return */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/85 border border-[#D4AF37]/35 text-[#F8E6C1] text-xs font-semibold cursor-pointer transition active:scale-95 flex-shrink-0"
              title="Volver al Portal Administrativo"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Panel Admin</span>
            </button>

            <div>
              <h1 className="font-display text-sm sm:text-base font-bold tracking-wide gold-gradient-text flex items-center gap-2">
                <span>D’BATULE — Panel del Propietario</span>
              </h1>
              <span className="text-[10px] text-stone-400 block">
                Gestión local de catálogo, disponibilidad, mesas y canales
              </span>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-1.5 flex-wrap justify-between md:justify-end">
            <button
              type="button"
              onClick={() => navigate('/admin/comandas')}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-200 border border-white/10 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <ChefHat className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Comandas (KDS)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRestoreModal(true)}
              title="Restaurar datos oficiales originales"
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Restaurar DEMO</span>
            </button>

            <button
              type="button"
              onClick={loadAllData}
              disabled={isRefreshing}
              title="Actualizar datos"
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white transition cursor-pointer border border-white/10"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#D4AF37]' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Security and Demo Context Banner (Prompt 05A explicit requirement) */}
      <div className="mx-3.5 sm:mx-4 mt-3 p-3 rounded-2xl bg-[#16120E] border border-amber-500/30 text-xs text-stone-300 flex items-start gap-2.5 shadow-xs">
        <ShieldAlert className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="leading-relaxed">
          <p className="text-[11px] text-stone-300">
            <strong>Panel administrativo de demostración local. Sin autenticación real:</strong> Los cambios guardados se almacenan en el dispositivo actual (IndexedDB) y se reflejan de inmediato en la carta, el carrito y el checkout.
          </p>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-40 p-3 rounded-xl bg-[#1C1710] border border-[#D4AF37] text-[#F8E6C1] text-xs shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Navigation Tabs (5 Sections) */}
      <div className="mx-3.5 sm:mx-4 mt-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 p-1 rounded-2xl bg-[#16120E] border border-white/8">
          {tabs.map((tab) => {
            const isCurrent = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[40px] ${
                  isCurrent
                    ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-xs'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-[#1A1A1A]' : 'text-[#D4AF37]'}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab View */}
      <main className="mx-3.5 sm:mx-4 mt-3.5 flex-1 pb-16">
        {loading ? (
          <div className="p-12 text-center text-stone-400 text-xs">
            Cargando datos administrativos desde IndexedDB...
          </div>
        ) : (
          <>
            {activeTab === 'products' && (
              <AdminProductsSection
                products={products}
                categories={categories}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'categories' && (
              <AdminCategoriesSection
                categories={categories}
                products={products}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'tables' && (
              <AdminTablesSection
                tables={tables}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'delivery' && (
              <AdminDeliveryRatesSection
                rates={deliveryRates}
                onRefresh={loadAllData}
                onTriggerToast={triggerToast}
              />
            )}

            {activeTab === 'settings' && settings && (
              <AdminSettingsSection
                settings={settings}
                onRefresh={loadAllData}
              />
            )}
          </>
        )}
      </main>

      {/* Restore Demo Modal */}
      <RestoreDemoModal
        isOpen={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        onConfirm={handleRestoreDefaults}
      />
    </div>
  );
};
