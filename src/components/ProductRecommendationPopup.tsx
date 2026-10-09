import React from 'react';
import { X, Plus, Sparkles, Check, ArrowUpRight } from 'lucide-react';
import { S19ProductDetails } from '../data/productCatalog';

interface ProductRecommendationPopupProps {
  product: S19ProductDetails;
  onClose: () => void;
  onSelectPhase?: (phaseId: string) => void;
}

// Color accents corresponding to each S.19 capsule cream
const PRODUCT_THEME_MAP: Record<string, { ring: string; badge: string; shadow: string }> = {
  hydrating: {
    ring: 'border-[#0099CC]/40',
    badge: 'bg-[#0099CC] text-white',
    shadow: 'shadow-[0_20px_50px_rgba(0,153,204,0.22)]',
  },
  txa_nia: {
    ring: 'border-[#E52B50]/40',
    badge: 'bg-[#E52B50] text-white',
    shadow: 'shadow-[0_20px_50px_rgba(229,43,80,0.22)]',
  },
  pdrn_collagen: {
    ring: 'border-[#F26A36]/40',
    badge: 'bg-[#F26A36] text-white',
    shadow: 'shadow-[0_20px_50px_rgba(242,106,54,0.22)]',
  },
  sebum_control: {
    ring: 'border-[#EAB308]/40',
    badge: 'bg-[#EAB308] text-[#171715]',
    shadow: 'shadow-[0_20px_50px_rgba(234,179,8,0.22)]',
  },
};

export const ProductRecommendationPopup: React.FC<ProductRecommendationPopupProps> = ({
  product,
  onClose,
  onSelectPhase,
}) => {
  const [added, setAdded] = React.useState(false);

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const theme = PRODUCT_THEME_MAP[product.id] || {
    ring: 'border-[#171715]/30',
    badge: 'bg-[#171715] text-white',
    shadow: 'shadow-2xl',
  };

  return (
    <div
      className={`relative w-full max-w-sm sm:max-w-md bg-[#FAF8F4] border border-[#171715] rounded-2xl overflow-hidden transition-all duration-300 animate-in zoom-in-95 fade-in slide-in-from-bottom-6 ${theme.shadow}`}
    >
      {/* Editorial Top Bar */}
      <div className="bg-[#171715] text-[#FAF8F4] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E27D60] animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#FAF8F4]">
            IXX RECOMMENDED PRODUCT
          </span>
          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${theme.badge}`}>
            {product.code}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[#A6A29A] hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          title="Dismiss recommendation"
          aria-label="Dismiss recommendation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Featured Big Product Photo Pop-out */}
      <div className="relative aspect-[4/3] w-full bg-[#EAE6DF] overflow-hidden group border-b border-[#C9C3B8]/60">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          referrerPolicy="no-referrer"
        />

        {/* Ambient formula badge */}
        <div className="absolute top-3 left-3 bg-[#171715]/85 backdrop-blur-md text-white text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase shadow-md flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#E27D60]" />
          <span>{product.code}</span>
        </div>

        {/* Formula Weight */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-[#171715] text-[10px] font-medium tracking-wider px-2.5 py-0.5 rounded-full uppercase shadow-sm">
          {product.weight}
        </div>
      </div>

      {/* Content & Action Area */}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#171715]">
              {product.name}
            </h3>
            <span className="text-base sm:text-lg font-bold text-[#171715] tracking-tight">
              {product.priceFormatted}
            </span>
          </div>
          <p className="text-xs text-[#6D6A63] italic">
            "{product.tagline}"
          </p>
        </div>

        {/* Key Actives Highlight */}
        <div className="bg-[#F2EEE6] rounded-xl p-3 border border-[#C9C3B8]/50">
          <span className="text-[9px] uppercase tracking-[0.2em] text-[#6D6A63] font-semibold block mb-1">
            CLINICAL ACTIVE COMPLEX
          </span>
          <p className="text-xs text-[#171715] font-medium leading-relaxed">
            {product.activesHighlight}
          </p>
        </div>

        {/* Interactive Buttons */}
        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleAdd}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-sm ${
              added
                ? 'bg-emerald-700 text-white'
                : 'bg-[#171715] hover:bg-black text-[#FAF8F4] active:scale-98'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to bag</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add to bag &bull; {product.priceFormatted}</span>
              </>
            )}
          </button>

          {onSelectPhase && (
            <button
              type="button"
              onClick={() => onSelectPhase(product.phaseId)}
              className="py-3 px-3.5 border border-[#C9C3B8] hover:border-[#171715] rounded-xl text-xs font-medium text-[#171715] hover:bg-[#FAF8F4] transition-colors cursor-pointer flex items-center gap-1"
              title="Learn about this phase"
            >
              <span>Phase</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
