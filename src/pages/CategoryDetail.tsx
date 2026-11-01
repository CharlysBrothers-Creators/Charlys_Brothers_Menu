import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Utensils, SearchX } from 'lucide-react';
import { DBATULE_PROFILE } from '../config/business';
import { Category, Product } from '../types/catalog';
import { catalogService } from '../services/catalogService';
import { SearchBar } from '../components/catalog/SearchBar';
import { CategoryCircleTabs } from '../components/catalog/CategoryCircleTabs';
import { ProductCard } from '../components/catalog/ProductCard';
import { CartButton } from '../components/cart/CartButton';

export const CategoryDetail: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Load all categories and products via decoupled service
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [cats, prods] = await Promise.all([
          catalogService.getCategories(),
          catalogService.getAllProducts(),
        ]);
        if (isMounted) {
          setCategories(cats);
          setAllProducts(prods);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error cargando categoría:', err);
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Current category based on categoryId param (fallback to first category if invalid)
  const currentCategory = useMemo(() => {
    if (!categories.length) return null;
    return categories.find((c) => c.id === categoryId) || categories[0];
  }, [categories, categoryId]);

  // Products belonging exclusively to this category
  const categoryProducts = useMemo(() => {
    if (!currentCategory) return [];
    return allProducts.filter((p) => p.categoryId === currentCategory.id);
  }, [allProducts, currentCategory]);

  // Filtered by search query if user types in search bar
  const displayedProducts = useMemo(() => {
    if (!searchQuery.trim()) return categoryProducts;
    const q = searchQuery.trim().toLowerCase();
    return categoryProducts.filter((p) => p.name.toLowerCase().includes(q));
  }, [categoryProducts, searchQuery]);

  // Switch category
  const handleSelectCategory = (newCatId: string) => {
    setSearchQuery('');
    navigate(`/menu/categoria/${newCatId}`);
  };

  if (loading || !currentCategory) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-stone-400">
        <span className="text-sm font-medium">Cargando menú...</span>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-full flex-1 bg-[#120F0D] text-stone-100 select-none overflow-x-hidden">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-30 bg-[#120F0D]/95 backdrop-blur-md border-b border-[#2B1F14]/90 shadow-lg">
        {/* Navigation Bar */}
        <div className="w-full px-3.5 sm:px-4 py-2.5 flex items-center justify-between border-b border-[#2B1F14]/60">
          {/* Return Button to Categories */}
          <button
            onClick={() => navigate('/menu')}
            aria-label="Volver a Categorías"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/85 active:scale-95 border border-[#D4AF37]/35 text-[#F8E6C1] transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2] text-[#D4AF37]" />
            <span className="text-xs font-semibold tracking-wide">Categorías</span>
          </button>

          {/* Center Brand Identity */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <svg
                className="w-4.5 h-4.5 text-[#D4AF37]"
                viewBox="0 0 64 64"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M32 10C26 10 22 14.5 20 18.5C16 18.5 12 22 12 27C12 31.5 14.5 35 18 36.5V48C18 49.6 19.4 51 21 51H43C44.6 51 46 49.6 46 48V36.5C49.5 35 52 31.5 52 27C52 22 48 18.5 44 18.5C42 14.5 38 10 32 10Z" />
                <line x1="18" y1="43" x2="46" y2="43" strokeWidth="2.5" />
              </svg>
              <span className="font-display text-base sm:text-lg font-bold tracking-wider gold-gradient-text">
                {DBATULE_PROFILE.name}
              </span>
            </div>
            <span className="text-[9px] tracking-[0.25em] text-[#F8E6C1]/70 uppercase">
              {DBATULE_PROFILE.category}
            </span>
          </div>

          {/* Currency indicator & Cart Access */}
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[10px] font-semibold text-[#D4AF37] px-2 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 hidden sm:inline">
              CUP
            </span>
            <CartButton />
          </div>
        </div>

        {/* Search Input and Horizontal Circular Category Carousel */}
        <div className="px-3.5 sm:px-4 pt-2.5 pb-2.5 space-y-2.5 bg-[#16120F]/70">
          <SearchBar
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            placeholder={`Buscar en ${currentCategory.name}...`}
            resultsCount={searchQuery ? displayedProducts.length : undefined}
          />

          {/* Circular Category Selector */}
          <CategoryCircleTabs
            categories={categories}
            activeCategoryId={currentCategory.id}
            onSelectCategory={handleSelectCategory}
          />
        </div>
      </header>

      {/* Main Content: Category Banner and Exclusive Products List */}
      <div className="flex-1 px-3.5 sm:px-4 py-4 space-y-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
        {/* Selected Category Feature Banner */}
        {!searchQuery && (
          <div className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/35 shadow-lg bg-[#14100D]">
            <div className="relative h-32 sm:h-36 w-full flex items-center justify-between overflow-hidden">
              {/* Left textual banner content */}
              <div className="relative z-10 p-4 sm:p-5 flex flex-col justify-center max-w-[62%] sm:max-w-[60%]">
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mb-0.5">
                  CATEGORÍA
                </span>
                <h1 className="font-display text-xl sm:text-2xl font-bold text-[#F8E6C1] leading-tight drop-shadow-sm">
                  {currentCategory.name}
                </h1>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed line-clamp-2">
                  {currentCategory.description}
                </p>
              </div>

              {/* Right photographic visual fading smoothly to left */}
              <div className="absolute right-0 top-0 bottom-0 w-[55%] sm:w-[50%] h-full">
                <img
                  src={currentCategory.image}
                  alt={currentCategory.name}
                  className="w-full h-full object-cover object-center"
                />
                {/* Smooth horizontal gradient mask */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#14100D] via-[#14100D]/60 to-transparent" />
              </div>
            </div>
          </div>
        )}

        {/* Section Header: Icon, Category Name and Count */}
        <div className="flex items-center justify-between pt-1 px-0.5">
          <div className="flex items-center gap-2">
            <Utensils className="w-4.5 h-4.5 text-[#D4AF37]" strokeWidth={2} />
            <h2 className="font-display text-base sm:text-lg font-bold text-[#F8E6C1]">
              {searchQuery ? 'Resultados' : currentCategory.name}
            </h2>
          </div>

          <span className="text-xs font-semibold text-stone-400">
            {displayedProducts.length}{' '}
            {displayedProducts.length === 1 ? 'producto' : 'productos'}
          </span>
        </div>

        {/* Product Cards List (Exclusively for this Category) */}
        {displayedProducts.length > 0 ? (
          <div className="space-y-3">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categoryName={currentCategory.name}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 px-4 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-[#1A1A1A] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-3">
              <SearchX className="w-7 h-7 stroke-[1.8]" />
            </div>
            <h3 className="font-display text-base font-semibold text-[#F8E6C1] mb-1">
              Sin coincidencias
            </h3>
            <p className="text-xs text-stone-400 max-w-xs mb-4">
              No encontramos platos con «{searchQuery}» en {currentCategory.name}.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-xl bg-black/60 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold hover:border-[#D4AF37] transition cursor-pointer"
            >
              Mostrar todos en {currentCategory.name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
