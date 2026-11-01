import React, { useState, useMemo } from 'react';
import { Search, Edit3, CheckCircle2, XCircle, Filter, Utensils } from 'lucide-react';
import { AdminProduct, AdminCategory } from '../../types/admin';
import { AdminEditProductModal } from './AdminEditProductModal';
import { adminRepository } from '../../services/adminRepository';

interface AdminProductsSectionProps {
  products: AdminProduct[];
  categories: AdminCategory[];
  onRefresh: () => void;
}

export const AdminProductsSection: React.FC<AdminProductsSectionProps> = ({
  products,
  categories,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  // Category lookup
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [categories]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCat = (categoryMap[p.categoryId] || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCat) return false;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery, categoryMap]);

  // Quick toggle availability
  const handleToggleAvailability = async (product: AdminProduct) => {
    const newStatus = product.available === false ? true : false;
    await adminRepository.setProductAvailability(product.id, newStatus);
    onRefresh();
  };

  return (
    <div className="space-y-3.5">
      {/* Controls: Search and Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#16120E] p-3 rounded-2xl border border-white/8">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar producto por nombre..."
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 placeholder-stone-500 text-xs focus:outline-hidden focus:border-[#D4AF37] transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Select Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#1F1813] border border-white/10 text-stone-200 text-xs focus:outline-hidden focus:border-[#D4AF37] transition cursor-pointer min-w-[140px]"
          >
            <option value="all">Todas las categorías ({products.length})</option>
            {categories.map((cat) => {
              const count = products.filter((p) => p.categoryId === cat.id).length;
              return (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Summary indicator */}
      <div className="flex items-center justify-between px-1 text-xs text-stone-400">
        <span>Mostrando {filteredProducts.length} de {products.length} platos</span>
        <span className="text-[11px] text-[#D4AF37]">
          {products.filter((p) => p.available !== false).length} disponibles
        </span>
      </div>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <div className="p-10 rounded-2xl bg-[#16120E] border border-white/8 text-center text-stone-400 text-xs space-y-1">
          <p className="font-semibold text-stone-300">No se encontraron productos con estos criterios.</p>
          <p className="text-[11px]">Prueba cambiando el término de búsqueda o seleccionando otra categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filteredProducts.map((prod) => {
            const isAvailable = prod.available !== false;
            const categoryName = categoryMap[prod.categoryId] || prod.categoryId;

            return (
              <div
                key={prod.id}
                className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  isAvailable
                    ? 'bg-[#16120E] border-white/8 hover:border-[#D4AF37]/30'
                    : 'bg-[#14100E]/70 border-red-500/20 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Image */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black/60 border border-white/10 flex-shrink-0">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className={`w-full h-full object-cover ${!isAvailable ? 'grayscale opacity-70' : ''}`}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-display text-xs sm:text-sm font-bold text-[#F8E6C1] truncate">
                        {prod.name}
                      </h4>
                    </div>

                    <span className="text-[10px] font-semibold text-[#D4AF37] uppercase tracking-wider block mt-0.5 truncate">
                      {categoryName}
                    </span>

                    {/* Price and status */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-[#F8E6C1]">
                        ${prod.price.toLocaleString('es-CU')} <span className="text-[10px] font-normal text-stone-400">CUP</span>
                      </span>

                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          isAvailable
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-red-500/15 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {isAvailable ? 'Disponible' : 'Agotado'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                  {/* Availability quick switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleAvailability(prod)}
                    className={`flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer transition py-1 px-2 rounded-lg ${
                      isAvailable
                        ? 'text-emerald-400 hover:bg-emerald-500/10'
                        : 'text-red-400 hover:bg-red-500/10'
                    }`}
                  >
                    {isAvailable ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Activo</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Pausado</span>
                      </>
                    )}
                  </button>

                  {/* Edit button */}
                  <button
                    type="button"
                    onClick={() => setEditingProduct(prod)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border border-white/10 text-xs font-semibold transition cursor-pointer active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Editar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Product Modal */}
      <AdminEditProductModal
        product={editingProduct}
        categories={categories}
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        onSaved={() => {
          onRefresh();
          setEditingProduct(null);
        }}
      />
    </div>
  );
};
