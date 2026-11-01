import React from 'react';
import { ShoppingBag, FileText, CheckCircle2 } from 'lucide-react';

export type CheckoutStep = 'cart' | 'details' | 'review';

interface CheckoutProgressProps {
  currentStep: 'details' | 'review';
  onNavigateStep?: (step: 'cart' | 'details') => void;
}

export const CheckoutProgress: React.FC<CheckoutProgressProps> = ({
  currentStep,
  onNavigateStep,
}) => {
  const steps = [
    { id: 'cart', label: 'Carrito', icon: ShoppingBag },
    { id: 'details', label: 'Datos', icon: FileText },
    { id: 'review', label: 'Revisión', icon: CheckCircle2 },
  ];

  return (
    <nav
      aria-label="Progreso del pedido"
      className="w-full bg-[#16120E] border-b border-[#2B1F14]/80 px-4 py-1.5 sm:py-2 select-none"
    >
      <div className="flex items-center justify-between max-w-sm mx-auto">
        {steps.map((step, index) => {
          const isCurrent =
            (step.id === 'details' && currentStep === 'details') ||
            (step.id === 'review' && currentStep === 'review');

          const isCompleted =
            step.id === 'cart' ||
            (step.id === 'details' && currentStep === 'review');

          const isClickable =
            (step.id === 'cart' && onNavigateStep) ||
            (step.id === 'details' && currentStep === 'review' && onNavigateStep);

          const StepIcon = step.icon;

          return (
            <React.Fragment key={step.id}>
              {/* Step indicator */}
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => {
                  if (step.id === 'cart' && onNavigateStep) onNavigateStep('cart');
                  if (step.id === 'details' && onNavigateStep) onNavigateStep('details');
                }}
                className={`flex items-center gap-1.5 transition-all py-1 px-1.5 rounded-lg ${
                  isClickable
                    ? 'cursor-pointer hover:bg-white/5 active:scale-95'
                    : 'cursor-default'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                      : isCompleted
                      ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F8E6C1]'
                      : 'bg-white/5 border border-white/10 text-stone-500'
                  }`}
                >
                  <StepIcon className="w-3.5 h-3.5" />
                </div>
                <span
                  className={`text-[11px] font-semibold tracking-wide ${
                    isCurrent
                      ? 'text-[#F8E6C1]'
                      : isCompleted
                      ? 'text-stone-300'
                      : 'text-stone-500'
                  }`}
                >
                  {step.label}
                </span>
              </button>

              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-[1.5px] mx-1.5 transition-all ${
                    (index === 0 && (currentStep === 'details' || currentStep === 'review')) ||
                    (index === 1 && currentStep === 'review')
                      ? 'bg-[#D4AF37]/60'
                      : 'bg-white/10'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};
