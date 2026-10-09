import React from 'react';
import { X, Plus, Sparkles, Check } from 'lucide-react';
import { S19ProductDetails } from '../data/productCatalog';

interface ProductRecommendationPopupProps {
  product: S19ProductDetails;
  onClose: () => void;
  onSelectPhase?: (phaseId: string) => void;
}

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

  return (
    <div className="mx-3 my-2.5 bg-[#FAF8F4] border border-[#D1D5DB] shadow-2xl overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95">
      {/* Eyebrow strip */}
      <div className="bg-[#171715] text-[#FAF8F4] px-3.5 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#E27D60]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FAF8F4]">
            IXX RECOMMENDATION &bull; {product.code}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[#A6A29A] hover:text-white p-0.5 transition-colors"
          title="Dismiss card"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3.5 flex gap-3.5 items-center">
        {/* Product photo */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 bg-[#EFECE6] border border-[#C9C3B8] overflow-hidden group">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute top-1 left-1 bg-white/90 backdrop-blur-xs text-[#171715] text-[8px] font-bold tracking-wider px-1.5 py-0.5 uppercase">
            {product.code}
          </span>
        </div>

        {/* Product details and price */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="text-[9px] uppercase tracking-[0.18em] text-[#6D6A63] font-medium">
            {product.weight}
          </div>
          <h4 className="text-sm font-bold tracking-tight text-[#171715] leading-snug line-clamp-2">
            {product.name}
          </h4>
          <p className="text-[11px] text-[#6D6A63] italic leading-tight">
            "{product.tagline}"
          </p>
          <p className="text-[10px] text-[#C86D51] font-medium line-clamp-1 pt-0.5">
            {product.activesHighlight}
          </p>

          <div className="flex items-baseline justify-between pt-1.5">
            <div className="text-base font-bold text-[#171715] tracking-tight">
              {product.priceFormatted}
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-1 transition-all duration-200 ${
                added
                  ? 'bg-emerald-700 text-white'
                  : 'bg-[#171715] hover:bg-black text-[#FAF8F4]'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3" />
                  <span>Add to bag</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
