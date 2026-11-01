import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, AlertCircle, Check } from 'lucide-react';
import { DBATULE_PROFILE } from '../config/business';
import { Product, Category } from '../types/catalog';
import { ProductDetails } from '../types/productOptions';
import { CartOptionItem } from '../types/cart';
import { productService } from '../services/productService';
import { catalogService } from '../services/catalogService';
import { useCart } from '../context/CartContext';
import { CartButton } from '../components/cart/CartButton';
import { ProductGallery } from '../components/product/ProductGallery';
import { ProductInformation } from '../components/product/ProductInformation';
import { IngredientList } from '../components/product/IngredientList';
import { ProductOptions } from '../components/product/ProductOptions';
import { QuantitySelector } from '../components/product/QuantitySelector';
import { ProductRecommendations } from '../components/product/ProductRecommendations';

export const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Local state for quantity, customizable extras, and selected options
  const [quantity, setQuantity] = useState<number>(1);
  const [extrasRecargo, setExtrasRecargo] = useState<number>(0);
  const [selectedOptions, setSelectedOptions] = useState<CartOptionItem[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [justAdded, setJustAdded] = useState<boolean>(false);

  // Load product data
  useEffect(() => {
    let isMounted = true;
    async function loadProductData() {
      if (!productId) return;
      setLoading(true);
      setQuantity(1);
      setExtrasRecargo(0);

      try {
        const prod = await productService.getProductById(productId);
        if (prod && isMounted) {
          setProduct(prod);

          const [cat, details, recs] = await Promise.all([
            catalogService.getCategoryById(prod.categoryId),
            productService.getProductDetails(prod.id),
            productService.getRecommendedProducts(prod, 3),
          ]);

          if (isMounted) {
            setCategory(cat);
            setProductDetails(details);
            setRecommendations(recs);
            setLoading(false);
          }
        } else if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error cargando ficha de producto:', err);
        if (isMounted) setLoading(false);
      }
    }

    loadProductData();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Gallery images: use productDetails.images if present, fallback to product.image
  const galleryImages = useMemo(() => {
    if (productDetails?.images && productDetails.images.length > 0) {
      return productDetails.images;
    }
    return product?.image ? [product.image] : [];
  }, [productDetails, product]);

  // Calculated estimated total (pure function)
  const calculatedTotal = useMemo(() => {
    if (!product) return 0;
    return productService.calculateTotal(product.price, extrasRecargo, quantity);
  }, [product, extrasRecargo, quantity]);

  const handleAddToCart = async () => {
    if (!product || isAdding) return;
    setIsAdding(true);
    try {
      await addItem(product, quantity, selectedOptions, productDetails?.isDemoData);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1400);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBack = () => {
    if (product) {
      navigate(`/menu/categoria/${product.categoryId}`);
    } else {
      navigate('/menu');
    }
  };

  const handleRecargoChange = useCallback((total: number) => {
    setExtrasRecargo(total);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-stone-400">
        <span className="text-sm font-medium">Cargando detalles del producto...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-[#1A1A1A] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-3">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="font-display text-lg font-bold text-[#F8E6C1] mb-1">
          Producto no encontrado
        </h2>
        <p className="text-xs text-stone-400 max-w-xs mb-4">
          El plato solicitado no existe o fue movido en el catálogo.
        </p>
        <button
          onClick={() => navigate('/menu')}
          className="px-4 py-2 rounded-xl gold-button-gradient text-[#1A1A1A] text-xs font-semibold cursor-pointer"
        >
          Ir al Catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-full flex-1 bg-[#120F0D] text-stone-100 select-none overflow-x-hidden">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-30 bg-[#120F0D]/95 backdrop-blur-md border-b border-[#2B1F14]/90 shadow-lg">
        <div className="w-full px-3.5 sm:px-4 py-2.5 flex items-center justify-between">
          {/* Back button returning to previous category */}
          <button
            onClick={handleBack}
            aria-label={`Volver a ${category?.name || 'Categorías'}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/85 active:scale-95 border border-[#D4AF37]/35 text-[#F8E6C1] transition-all cursor-pointer shadow-xs max-w-[45%]"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2] text-[#D4AF37] flex-shrink-0" />
            <span className="text-xs font-semibold tracking-wide truncate">
              {category?.name || 'Categorías'}
            </span>
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

          {/* Currency indicator & Cart access */}
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[10px] font-semibold text-[#D4AF37] px-2 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 hidden sm:inline">
              CUP
            </span>
            <CartButton />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 px-3.5 sm:px-4 py-4 space-y-4 sm:space-y-5 pb-[max(2rem,env(safe-area-inset-bottom))]">
        {/* 1. Photographic Gallery (Single image or multi-image carousel) */}
        <ProductGallery
          images={galleryImages}
          productName={product.name}
        />

        {/* 2. Product Information (Official name, price, description, DEMO badge, allergens) */}
        <ProductInformation
          product={product}
          categoryName={category?.name}
          description={productDetails?.description}
          allergens={productDetails?.allergens}
          isDemoData={productDetails?.isDemoData}
          allergensUnverifiedDisclaimer={productDetails?.allergensUnverifiedDisclaimer}
        />

        {/* 3. Dynamic Ingredients List (omits section if 0 ingredients) */}
        <IngredientList ingredients={productDetails?.ingredients} />

        {/* 4. Customizable Options (omits section if 0 groups) */}
        <ProductOptions
          groups={productDetails?.customizationGroups}
          onRecargoChange={handleRecargoChange}
          onOptionsChange={(opts) => setSelectedOptions(opts)}
        />

        {/* 5. Quantity & Order Action Block */}
        <div className="pt-2">
          {((product as any)?.available === false || productDetails?.available === false) && (
            <div className="p-3 mb-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>Este plato está marcado temporalmente como no disponible en la cocina.</span>
            </div>
          )}

          <div className="bg-[#16120E] border border-white/8 rounded-2xl p-3.5 sm:p-4 shadow-md space-y-3">
            {/* Quantity Selector Row */}
            <div className="flex items-center justify-between gap-3 min-w-0">
              <span className="text-xs font-semibold text-stone-300">
                Cantidad:
              </span>
              <QuantitySelector
                quantity={quantity}
                onChange={(q) => setQuantity(q)}
              />
            </div>

            {/* Active Order Action Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdding || (product as any)?.available === false || productDetails?.available === false}
              aria-label={`Agregar ${quantity} ${product.name} al pedido por ${calculatedTotal} CUP`}
              className={`w-full py-3 px-3.5 sm:px-4 rounded-xl font-bold text-xs sm:text-sm shadow-[0_4px_16px_rgba(212,175,55,0.3)] flex items-center justify-between gap-2 transition-all ${
                (product as any)?.available === false || productDetails?.available === false
                  ? 'bg-stone-800 text-stone-500 border border-white/5 cursor-not-allowed opacity-60'
                  : justAdded
                  ? 'bg-emerald-500 text-stone-950 scale-[1.01] cursor-pointer'
                  : 'gold-button-gradient text-[#1A1A1A] hover:brightness-110 active:scale-[0.98] cursor-pointer'
              }`}
            >
              {(product as any)?.available === false || productDetails?.available === false ? (
                <div className="w-full flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>No disponible actualmente</span>
                </div>
              ) : justAdded ? (
                <div className="w-full flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>¡Agregado al pedido!</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 truncate">
                    <ShoppingBag className="w-4 h-4 stroke-[2.2] flex-shrink-0" />
                    <span className="truncate">Agregar al pedido</span>
                  </div>
                  <span className="font-extrabold text-xs sm:text-sm flex-shrink-0 bg-black/25 px-2 py-0.5 rounded-lg border border-black/10">
                    ${calculatedTotal.toLocaleString('es-CU')} CUP
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 6. Product Recommendations */}
        <ProductRecommendations products={recommendations} />
      </div>
    </div>
  );
};
