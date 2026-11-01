import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const hasMultipleImages = images && images.length > 1;
  const currentImage = images[currentIndex] || images[0] || '/Charlys_Brothers_Menu/images/dbatule-hero.jpg';

  const goToPrev = () => {
    if (!hasMultipleImages) return;
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    if (!hasMultipleImages) return;
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      goToNext();
    } else if (distance < -minSwipeDistance) {
      goToPrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="w-full space-y-3 select-none">
      {/* Main Large Image Container */}
      <div
        className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-2xl overflow-hidden bg-black/80 border border-white/10 shadow-xl group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={currentImage}
          alt={`${productName} - Imagen ${currentIndex + 1}`}
          loading="eager"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Ambient Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

        {/* Illustrative Photo Tag */}
        <div className="absolute bottom-3 left-3 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15 shadow-md">
          <span className="text-[10px] font-semibold text-[#F8E6C1]/90 tracking-wide uppercase">
            Foto ilustrativa
          </span>
        </div>

        {/* Gallery Counter Badge (only when multiple images exist) */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 right-3 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15 shadow-md">
            <span className="text-[11px] font-bold text-[#D4AF37] tracking-wider">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        )}

        {/* Navigation Arrows (only when multiple images exist) */}
        {hasMultipleImages && (
          <>
            <button
              onClick={goToPrev}
              aria-label="Imagen anterior"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 active:scale-95 text-[#F8E6C1] border border-white/15 backdrop-blur-sm flex items-center justify-center transition-all cursor-pointer shadow-lg"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
            </button>

            <button
              onClick={goToNext}
              aria-label="Imagen siguiente"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 active:scale-95 text-[#F8E6C1] border border-white/15 backdrop-blur-sm flex items-center justify-center transition-all cursor-pointer shadow-lg"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.2]" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row (only rendered when multiple images exist) */}
      {hasMultipleImages && (
        <div className="grid grid-cols-4 gap-2.5 pt-1">
          {images.map((img, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Ver imagen ${idx + 1}`}
                className={`relative aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/40 scale-[1.02] shadow-md'
                    : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                }`}
              >
                <img
                  src={img}
                  alt={`Miniatura ${idx + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
