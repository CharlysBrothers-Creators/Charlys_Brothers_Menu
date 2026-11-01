import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CatalogHeader } from '../components/catalog/CatalogHeader';
import { SearchBar } from '../components/catalog/SearchBar';
import { CategoryGrid } from '../components/catalog/CategoryGrid';
import { ProductCard } from '../components/catalog/ProductCard';
import { EmptyState } from '../components/catalog/EmptyState';
import { Category, Product } from '../types/catalog';
import { catalogService } from '../services/catalogService';
import { LayoutGrid, Search } from 'lucide-react';

export const MenuCatalog: React.FC = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Load data via catalogService
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
        console.error('Error cargando menú:', err);
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Map category ID to category name for search results
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((cat) => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [categories]);

  // Count products by category
  const productCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    allProducts.forEach((p) => {
      counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
    });
    return counts;
  }, [allProducts]);

  // Global search across all 29 products
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    return allProducts.filter((p) => p.name.toLowerCase().includes(q));
  }, [allProducts, searchQuery]);

  // Navigate to category page
  const handleSelectCategory = (categoryId: string) => {
    navigate(`/menu/categoria/${categoryId}`);
  };

  const handleResetSearch = () => {
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-stone-400">
        <span className="text-sm font-medium">Cargando menú...</span>
      </div>
    );
  }

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="relative flex flex-col min-h-full flex-1 bg-[#120F0D] text-stone-100 select-none overflow-x-hidden">
      {/* Sticky Header with Return to Home button and Search input */}
      <header className="sticky top-0 z-30 bg-[#120F0D]/95 backdrop-blur-md border-b border-[#2B1F14]/90 shadow-lg">
        <CatalogHeader />

        <div className="px-3.5 sm:px-4 pt-2.5 pb-3 bg-[#16120F]/70">
          <SearchBar
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            placeholder="Buscar entre los 29 platos y bebidas..."
            resultsCount={isSearching ? searchResults.length : undefined}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 px-3.5 sm:px-4 py-3.5 space-y-3.5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {!isSearching ? (
          /* Normal State: 6 Categories Grid Only (No products underneath) */
          <section className="space-y-3">
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-[#D4AF37]" />
                <h2 className="font-display text-sm sm:text-base font-semibold text-[#F8E6C1]">
                  Explorar por Categoría
                </h2>
              </div>
              <span className="text-xs text-stone-400 font-medium">
                {categories.length} categorías
              </span>
            </div>

            {/* 2-Column Photographic Grid */}
            <CategoryGrid
              categories={categories}
              selectedCategoryId={null}
              onSelectCategory={handleSelectCategory}
              productCountByCategory={productCountByCategory}
            />
          </section>
        ) : (
          /* Search State: Independent Results View */
          <section className="space-y-3">
            <div className="flex items-center justify-between px-0.5 pt-1">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#D4AF37]" />
                <h2 className="font-display text-sm sm:text-base font-semibold text-[#F8E6C1]">
                  Resultados de búsqueda
                </h2>
              </div>
              <span className="text-xs text-stone-400">
                {searchResults.length}{' '}
                {searchResults.length === 1 ? 'coincidencia' : 'coincidencias'}
              </span>
            </div>

            {searchResults.length > 0 ? (
              <div className="space-y-2.5 sm:space-y-3">
                {searchResults.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    categoryName={categoryMap[product.categoryId]}
                  />
                ))}
              </div>
            ) : (
              <EmptyState searchQuery={searchQuery} onReset={handleResetSearch} />
            )}
          </section>
        )}
      </div>
    </div>
  );
};
