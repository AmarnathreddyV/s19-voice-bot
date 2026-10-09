import hydratingJarImg from '../assets/images/s19_hydrating_cream_1791465391795.jpg';
import txaNiaJarImg from '../assets/images/s19_txa_nia_cream_1791465403204.jpg';
import sebumJarImg from '../assets/images/s19_sebum_control_cream_1791465436614.jpg';
import pdrnJarImg from '../assets/images/s19_pdrn_collagen_cream_1791465419922.jpg';

export interface S19ProductDetails {
  id: string;
  name: string;
  code: string;
  weight: string;
  priceFormatted: string;
  priceNumeric: number;
  tagline: string;
  image: string;
  phaseId: 'DEHYDRATION' | 'UNEVEN_TONE' | 'OIL_IMBALANCE' | 'RECOVERY';
  activesHighlight: string;
}

export const S19_PRODUCTS: Record<string, S19ProductDetails> = {
  HYDRATING: {
    id: 'hydrating',
    name: 'Hydrating Capsule Cream',
    code: 'S19 / 01',
    weight: 'S19 SKINLABS · 65.0 G',
    priceFormatted: '₹1,300',
    priceNumeric: 1300,
    tagline: 'For Extra Hydration Boost.',
    image: hydratingJarImg,
    phaseId: 'DEHYDRATION',
    activesHighlight: '5% 13D Hyaluronic Acid · 2% Hydroviton · 2% Pentavitin',
  },
  TXA_NIA: {
    id: 'txa_nia',
    name: 'TXA + NIA Capsule Cream',
    code: 'S19 / 02',
    weight: 'S19 SKINLABS · 65.0 G',
    priceFormatted: '₹1,300',
    priceNumeric: 1300,
    tagline: 'Your tone. More in tune.',
    image: txaNiaJarImg,
    phaseId: 'UNEVEN_TONE',
    activesHighlight: '4% Tranexamic Acid · 2% Niacinamide · 2% Rose PDRN',
  },
  PDRN_COLLAGEN: {
    id: 'pdrn_collagen',
    name: 'PDRN Collagen Capsule Cream',
    code: 'S19 / 03',
    weight: 'S19 SKINLABS · 65.0 G',
    priceFormatted: '₹1,650',
    priceNumeric: 1650,
    tagline: 'A little care. A new phase.',
    image: pdrnJarImg,
    phaseId: 'RECOVERY',
    activesHighlight: '3% Salmon PDRN · 2% Peptides · Cellular Collagen Matrix',
  },
  SEBUM_CONTROL: {
    id: 'sebum_control',
    name: 'Sebum Control Capsule Cream',
    code: 'S19 / 04',
    weight: 'S19 SKINLABS · 65.0 G',
    priceFormatted: '₹1,250',
    priceNumeric: 1250,
    tagline: 'Find your own balance.',
    image: sebumJarImg,
    phaseId: 'OIL_IMBALANCE',
    activesHighlight: '3% Encapsulated Salicylic Acid · 2% Tranexamic Acid · 0.5% Sebum Control Complex',
  },
};

/**
 * Helper to match product by name or keyword from IXX's speech / recommendation
 */
export function matchProductFromText(text: string): S19ProductDetails | null {
  const lower = text.toLowerCase();
  if (
    lower.includes('pdrn') ||
    lower.includes('collagen') ||
    lower.includes('1,650') ||
    lower.includes('1650') ||
    lower.includes('s19 / 03') ||
    lower.includes('recovery') ||
    lower.includes('sensitive') ||
    lower.includes('irritat') ||
    lower.includes('barrier') ||
    lower.includes('burn')
  ) {
    return S19_PRODUCTS.PDRN_COLLAGEN;
  }
  if (
    lower.includes('sebum') ||
    lower.includes('oil') ||
    lower.includes('salicylic') ||
    lower.includes('1,250') ||
    lower.includes('1250') ||
    lower.includes('s19 / 04') ||
    lower.includes('shine') ||
    lower.includes('pore') ||
    lower.includes('greas')
  ) {
    return S19_PRODUCTS.SEBUM_CONTROL;
  }
  if (
    lower.includes('txa') ||
    lower.includes('nia') ||
    lower.includes('uneven') ||
    lower.includes('dark spot') ||
    lower.includes('tranexamic') ||
    lower.includes('1,300') ||
    lower.includes('s19 / 02') ||
    lower.includes('pigment') ||
    lower.includes('tone') ||
    lower.includes('blemish') ||
    lower.includes('marks')
  ) {
    return S19_PRODUCTS.TXA_NIA;
  }
  if (
    lower.includes('hydrat') ||
    lower.includes('dehydrat') ||
    lower.includes('hyaluronic') ||
    lower.includes('dry') ||
    lower.includes('tight') ||
    lower.includes('s19 / 01') ||
    lower.includes('moisture') ||
    lower.includes('parched')
  ) {
    return S19_PRODUCTS.HYDRATING;
  }
  return null;
}
