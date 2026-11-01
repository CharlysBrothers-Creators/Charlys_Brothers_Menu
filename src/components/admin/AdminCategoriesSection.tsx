import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Eye, EyeOff, Trash2, AlertTriangle, X, Check } from 'lucide-react';
import { AdminCategory, AdminProduct } from '../../types/admin';
import { adminRepository } from '../../services/adminRepository';

interface AdminCategoriesSectionProps {
  categories: AdminCategory[];
  products: AdminProduct[];
  onRefresh: () => void;
}

export const AdminCategoriesSection: React.FC<AdminCategoriesSectionProps> = ({
  categories,
  products,
  onRefresh,
}) => {
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Reorder up
  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    const newOrder = [...categories];
    const temp = newOrder[index - 1];
    newOrder[index - 1] = newOrder[index];
    newOrder[index] = temp;

    const orderedIds = newOrder.map((c) => c.id);
    await adminRepository.reorderCategories(orderedIds);
    onRefresh();
  };

  // Reorder down
  const handleMoveDown = async (index: number) => {
    if (index >= categories.length - 1) return;
    const newOrder = [...categories];
    const temp = newOrder[index + 1];
    newOrder[index + 1] = newOrder[index];
    newOrder[index] = temp;

    const orderedIds = newOrder.map((c) => c.id);
    await adminRepository.reorderCategories(orderedIds);
    onRefresh();
  };

  // Toggle active/visibility
  const handleToggleActive = async (category: AdminCategory) => {
    await adminRepository.updateCategory(category.id, {
      active: category.active === false ? true : false,
    });
    onRefresh();
  };

  // Delete category execution
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminRepository.deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
      onRefresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Header explanation */}
      <div className="p-3 rounded-2xl bg-[#16120E] border border-white/8 text-xs text-stone-300 leading-relaxed">
        <p>
          Organiza el orden de aparición de las secciones en el catálogo del cliente y controla su visibilidad pública.
        </p>
      </div>

      {/* Categories List */}
      <div className="space-y-2.5">
        {categories.map((category, index) => {
          const associatedProductsCount = products.filter((p) => p.categoryId === category.id).length;
          const isVisible = category.active !== false;

          return (
            <div
              key={category.id}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isVisible
                  ? 'bg-[#16120E] border-white/8 hover:border-[#D4AF37]/30'
                  : 'bg-[#14100E]/70 border-white/5 opacity-70'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Order Index Badge */}
                <div className="w-8 h-8 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center font-display text-xs font-bold text-[#D4AF37] flex-shrink-0">
                  {index + 1}
                </div>

                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/50 border border-white/10 flex-shrink-0">
                  <img
                    src={category.image}
                    alt={category.name}
                    className={`w-full h-full object-cover ${!isVisible ? 'grayscale' : ''}`}
                  />
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-sm font-bold text-[#F8E6C1] truncate">
                      {category.name}
                    </h4>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                        isVisible
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-stone-500/15 text-stone-400 border border-stone-500/30'
                      }`}
                    >
                      {isVisible ? 'Visible' : 'Oculta'}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-400 truncate max-w-sm mt-0.5">
                    {category.description}
                  </p>

                  <span className="text-[10px] text-[#D4AF37] font-semibold mt-0.5 block">
                    {associatedProductsCount} {associatedProductsCount === 1 ? 'producto' : 'productos'} en esta categoría
                  </span>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-1.5 self-end sm:self-center">
                {/* Move Up */}
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMoveUp(index)}
                  title="Subir posición"
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border border-white/10 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                {/* Move Down */}
                <button
                  type="button"
                  disabled={index === categories.length - 1}
                  onClick={() => handleMoveDown(index)}
                  title="Bajar posición"
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border border-white/10 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                {/* Toggle Visibility */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(category)}
                  title={isVisible ? 'Ocultar categoría del catálogo' : 'Mostrar categoría en el catálogo'}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    isVisible
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                      : 'bg-stone-800 border-white/10 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span className="hidden min-[400px]:inline">{isVisible ? 'Visible' : 'Oculta'}</span>
                </button>

                {/* Delete Category */}
                <button
                  type="button"
                  onClick={() => setDeleteTarget(category)}
                  title="Eliminar categoría"
                  className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-stone-400 hover:text-red-400 border border-white/10 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Deletion Warning Modal */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 select-none"
        >
          <div className="relative w-full max-w-md rounded-2xl bg-[#18130E] border border-red-500/50 p-5 shadow-2xl text-stone-100 space-y-4">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="absolute top-3.5 right-3.5 p-1 rounded-full text-stone-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-[#F8E6C1]">
                  ¿Eliminar categoría «{deleteTarget.name}»?
                </h3>
                {products.filter((p) => p.categoryId === deleteTarget.id).length > 0 ? (
                  <p className="text-xs text-amber-300 mt-1.5 leading-relaxed font-medium">
                    ⚠️ Advertencia: Existen {products.filter((p) => p.categoryId === deleteTarget.id).length} productos asociados a esta categoría.
                    Si eliminas la categoría, esos platos no tendrán sección visible a menos que los reasignes.
                  </p>
                ) : (
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    Esta categoría no tiene productos asociados y será removida de la carta.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Eliminando...' : 'Sí, eliminar categoría'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
