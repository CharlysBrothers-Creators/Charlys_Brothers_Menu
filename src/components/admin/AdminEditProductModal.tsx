import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, AlertCircle, Save, Layers } from 'lucide-react';
import { AdminProduct, AdminCategory } from '../../types/admin';
import { ProductDetails, CustomizationGroup, CustomOption, Ingredient } from '../../types/productOptions';
import { adminRepository } from '../../services/adminRepository';

interface AdminEditProductModalProps {
  product: AdminProduct | null;
  categories: AdminCategory[];
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updatedProduct: AdminProduct) => void;
}

export const AdminEditProductModal: React.FC<AdminEditProductModalProps> = ({
  product,
  categories,
  isOpen,
  onClose,
  onSaved,
}) => {
  const [name, setName] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [available, setAvailable] = useState<boolean>(true);

  // Advanced details: ingredients & customization groups
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [customizationGroups, setCustomizationGroups] = useState<CustomizationGroup[]>([]);
  const [newIngredientName, setNewIngredientName] = useState<string>('');

  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!product || !isOpen) return;

    setName(product.name);
    setCategoryId(product.categoryId);
    setPrice(product.price);
    setDescription(product.description || '');
    setAvailable(product.available !== false);
    setErrorMessage(null);
    setNewIngredientName('');

    let isMounted = true;
    async function loadDetails() {
      if (!product) return;
      setLoadingDetails(true);
      try {
        const details = await adminRepository.getProductDetails(product.id);
        if (isMounted && details) {
          setIngredients(details.ingredients ? [...details.ingredients] : []);
          setCustomizationGroups(details.customizationGroups ? JSON.parse(JSON.stringify(details.customizationGroups)) : []);
          if (details.description && !product.description) {
            setDescription(details.description);
          }
        }
      } catch (e) {
        console.error('Error cargando detalles del producto:', e);
      } finally {
        if (isMounted) setLoadingDetails(false);
      }
    }

    loadDetails();
    return () => {
      isMounted = false;
    };
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  // Add an ingredient
  const handleAddIngredient = () => {
    const trimmed = newIngredientName.trim();
    if (!trimmed) return;
    const newIng: Ingredient = {
      id: `ing_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`,
      name: trimmed,
    };
    setIngredients((prev) => [...prev, newIng]);
    setNewIngredientName('');
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  // Add group
  const handleAddGroup = () => {
    const newGroup: CustomizationGroup = {
      id: `grp_${Date.now().toString(36)}`,
      title: 'Nuevo grupo de opciones',
      type: 'multiple',
      required: false,
      options: [
        {
          id: `opt_${Date.now().toString(36)}_1`,
          name: 'Opción 1',
          type: 'extra',
          priceAdjustment: 0,
        },
      ],
    };
    setCustomizationGroups((prev) => [...prev, newGroup]);
  };

  const handleRemoveGroup = (groupId: string) => {
    setCustomizationGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const handleUpdateGroupTitle = (groupId: string, newTitle: string) => {
    setCustomizationGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, title: newTitle } : g))
    );
  };

  const handleToggleGroupType = (groupId: string) => {
    setCustomizationGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, type: g.type === 'single' ? 'multiple' : 'single' }
          : g
      )
    );
  };

  // Options inside a group
  const handleAddOption = (groupId: string) => {
    const newOpt: CustomOption = {
      id: `opt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`,
      name: 'Nueva opción',
      type: 'extra',
      priceAdjustment: 0,
    };
    setCustomizationGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, options: [...g.options, newOpt] } : g
      )
    );
  };

  const handleRemoveOption = (groupId: string, optionId: string) => {
    setCustomizationGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, options: g.options.filter((o) => o.id !== optionId) }
          : g
      )
    );
  };

  const handleUpdateOption = (
    groupId: string,
    optionId: string,
    updates: Partial<CustomOption>
  ) => {
    setCustomizationGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              options: g.options.map((o) =>
                o.id === optionId ? { ...o, ...updates } : o
              ),
            }
          : g
      )
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('El nombre del producto no puede estar vacío.');
      return;
    }
    if (price < 0 || isNaN(price)) {
      setErrorMessage('El precio debe ser un número entero mayor o igual a 0.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Update basic product
      const updatedProduct = await adminRepository.updateProduct(product.id, {
        name: name.trim(),
        categoryId,
        price: Math.round(price),
        description: description.trim(),
        available,
      });

      // 2. Update extended product details
      await adminRepository.updateProductDetails(product.id, {
        description: description.trim(),
        ingredients,
        customizationGroups,
        available,
      });

      onSaved(updatedProduct);
      onClose();
    } catch (err: unknown) {
      console.error('Error guardando producto:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Error al guardar cambios');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-product-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 select-none overflow-y-auto"
    >
      <div className="relative w-full max-w-xl rounded-2xl bg-[#18130E] border border-[#D4AF37]/40 p-4 sm:p-5 shadow-2xl text-stone-100 space-y-4 my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-2 border-b border-white/8 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-black/60 border border-white/10 flex-shrink-0">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                Editar Producto
              </span>
              <h3 id="edit-product-title" className="font-display text-sm sm:text-base font-bold text-[#F8E6C1] truncate max-w-xs">
                {product.name}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            disabled={isSubmitting}
            className="p-1 rounded-full text-stone-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form id="edit-product-form" onSubmit={handleSave} className="space-y-4 overflow-y-auto flex-1 pr-1 scrollbar-none text-xs">
          {/* 1. Basic Fields */}
          <div className="space-y-3 bg-[#130F0D] p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
              Datos Principales
            </span>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Nombre del plato <span className="text-[#D4AF37]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#1C1712] border border-white/10 text-stone-100 placeholder-stone-500 text-xs focus:outline-hidden focus:border-[#D4AF37] transition"
              />
            </div>

            {/* Category and Price in Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Categoría <span className="text-[#D4AF37]">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1C1712] border border-white/10 text-stone-100 text-xs focus:outline-hidden focus:border-[#D4AF37] transition cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-[#18130E] text-stone-200">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Precio (CUP) <span className="text-[#D4AF37]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-semibold">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-[#1C1712] border border-white/10 text-stone-100 font-bold text-xs focus:outline-hidden focus:border-[#D4AF37] transition"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Descripción del plato <span className="text-[10px] text-stone-400 font-normal">(opcional)</span>
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Indica la presentación o detalles gastronómicos..."
                className="w-full px-3 py-2 rounded-xl bg-[#1C1712] border border-white/10 text-stone-100 placeholder-stone-500 text-xs focus:outline-hidden focus:border-[#D4AF37] transition resize-none"
              />
            </div>

            {/* Availability Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
              <div>
                <span className="font-semibold text-stone-200 block text-xs">
                  Disponibilidad en carta
                </span>
                <span className="text-[10px] text-stone-400">
                  {available ? 'Visible y disponible para ordenar' : 'Marcado como agotado / no disponible'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setAvailable((prev) => !prev)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  available ? 'bg-emerald-500' : 'bg-stone-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    available ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 2. Optional Ingredients Management */}
          <div className="space-y-2.5 bg-[#130F0D] p-3.5 rounded-xl border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Ingredientes ({ingredients.length})
                </span>
                <span className="text-[10px] text-stone-500">
                  Opcional. Permite al cliente conocer la receta base.
                </span>
              </div>
            </div>

            {/* Ingredients list pills */}
            {ingredients.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {ingredients.map((ing) => (
                  <span
                    key={ing.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-stone-300 text-xs"
                  >
                    <span>{ing.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(ing.id)}
                      className="text-stone-400 hover:text-red-400 transition cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-stone-500 italic py-0.5">
                Sin ingredientes específicos desglosados.
              </p>
            )}

            {/* Add ingredient input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newIngredientName}
                onChange={(e) => setNewIngredientName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddIngredient();
                  }
                }}
                placeholder="Añadir ingrediente (ej. Albahaca fresca)..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#1C1712] border border-white/10 text-stone-100 placeholder-stone-500 text-xs focus:outline-hidden focus:border-[#D4AF37]"
              />
              <button
                type="button"
                onClick={handleAddIngredient}
                disabled={!newIngredientName.trim()}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200 text-xs font-semibold transition cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. Optional Customization Groups & Options */}
          <div className="space-y-3 bg-[#130F0D] p-3.5 rounded-xl border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Grupos de Opciones ({customizationGroups.length})
                </span>
                <span className="text-[10px] text-stone-500">
                  Opcional. Para extras, salsas, o variantes exclusivas.
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddGroup}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#F8E6C1] text-[11px] font-semibold hover:bg-[#D4AF37]/25 transition cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#D4AF37]" />
                <span>Nuevo grupo</span>
              </button>
            </div>

            {customizationGroups.length === 0 ? (
              <p className="text-[11px] text-stone-500 italic py-1">
                Este producto no tiene grupos de personalización.
              </p>
            ) : (
              <div className="space-y-3">
                {customizationGroups.map((group) => (
                  <div
                    key={group.id}
                    className="p-3 rounded-xl bg-[#1C1712] border border-white/8 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={group.title}
                        onChange={(e) => handleUpdateGroupTitle(group.id, e.target.value)}
                        placeholder="Título del grupo..."
                        className="flex-1 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-stone-200 font-semibold text-xs focus:outline-hidden focus:border-[#D4AF37]"
                      />

                      <button
                        type="button"
                        onClick={() => handleToggleGroupType(group.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer flex-shrink-0 ${
                          group.type === 'single'
                            ? 'bg-blue-950/60 text-blue-300 border-blue-500/30'
                            : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {group.type === 'single' ? 'Opción única (Radio)' : 'Múltiple (Extras)'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveGroup(group.id)}
                        title="Eliminar grupo"
                        className="p-1 rounded-lg text-stone-400 hover:text-red-400 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Options list inside group */}
                    <div className="space-y-1.5 pl-2 border-l-2 border-white/10">
                      {group.options.map((opt) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={opt.name}
                            onChange={(e) =>
                              handleUpdateOption(group.id, opt.id, { name: e.target.value })
                            }
                            placeholder="Nombre de la opción..."
                            className="flex-1 px-2 py-1 rounded-lg bg-black/30 border border-white/10 text-stone-200 text-xs focus:outline-hidden"
                          />

                          <div className="w-24 relative flex-shrink-0">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-500 text-[10px]">+$</span>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={opt.priceAdjustment}
                              onChange={(e) =>
                                handleUpdateOption(group.id, opt.id, {
                                  priceAdjustment: Math.max(0, Number(e.target.value)),
                                })
                              }
                              placeholder="0"
                              className="w-full pl-6 pr-2 py-1 rounded-lg bg-black/30 border border-white/10 text-stone-200 text-xs text-right focus:outline-hidden"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveOption(group.id, opt.id)}
                            className="text-stone-500 hover:text-red-400 transition cursor-pointer p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => handleAddOption(group.id)}
                        className="text-[10px] font-semibold text-[#D4AF37] hover:underline flex items-center gap-1 pt-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Añadir opción</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/8 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="edit-product-form"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl text-xs font-bold text-[#1A1A1A] gold-button-gradient hover:brightness-110 active:scale-95 transition cursor-pointer shadow-md flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
            <span>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
