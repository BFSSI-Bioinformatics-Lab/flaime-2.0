export const SODIUM_NUTRIENT_MAPPING = {
    'PROTEIN': {
      amount: 'LProPS',
      dv: 'LProPDV',
      dvPPD: 'LProPDVPPD'
    },
    'FAT (TOTAL LIPIDS)': {
      amount: 'LFatPS',
      dv: 'LFatPDV',
      dvPPD: 'LFatPDVPPD'
    },
    'FATTY ACIDS SATURATED': {
      amount: 'LSatPS',
      dv: 'LSatTrPDV',  // Note: Combined with trans in DV
      dvPPD: 'LSatTrPDVPPD'
    },
    'FATTY ACIDS TRANS': {
      amount: 'LTrPS'
      // Note: DV is combined with saturated
    },
    'FATTY ACIDS POLYUNSATURATED': {
      amount: 'LPolPS'
    },
    'FATTY ACIDS OMEGA 6': {
      amount: 'LOm6PS'
    },
    'FATTY ACIDS OMEGA 3': {
      amount: 'LOm3PS'
    },
    'FATTY ACIDS MONOUNSATURATED': {
      amount: 'LMonPS'
    },
    'CARBOHYDRATE TOTAL (BY DIFFERENCE)': {
      amount: 'LCarPS',
      dv: 'LCarPDV',
      dvPPD: 'LCarPDVPPD'
    },
    'FIBRE TOTAL DIETARY': {
      amount: 'LFiPS',
      dv: 'LFiPDV',
      dvPPD: 'LFiPDVPPD'
    },
    'FIBRE SOLUBLE': {
      amount: 'LFiSolPS'
    },
    'FIBRE INSOLUBLE': {
      amount: 'LFiInsPS'
    },
    'SUGARS TOTAL': {
      amount: 'LSuToPS',
      dv: 'LSuToPDV',
      dvPPD: 'LSuToPDVPPD'
    },
    'SUGARS ALCOHOL': {
      amount: 'LSuAlPS'
    },
    'STARCH': {
      amount: 'LStPS'
    },
    'CHOLESTEROL': {
      amount: 'LChoPS',
      dv: 'LChoPDV',
      dvPPD: 'LChoPDVPPD'
    },
    'SODIUM': {
      amount: 'LSodPS',
      dv: 'LSodPDV',
      dvPPD: 'LSodPDVPPD'
    },
    'POTASSIUM': {
      amount: 'LPotPS',
      dv: 'LPotPDV',
      dvPPD: 'LPotPDVPPD'
    },
    'CALCIUM': {
      amount: 'LCaPS',
      dv: 'LCaPDV',
      dvPPD: 'LCaPDVPPD'
    },
    'IRON': {
      amount: 'LIrPS',
      dv: 'LIrPDV',
      dvPPD: 'LIrPDVPPD'
    },
    'VITAMIN A': {
      amount: 'LAPS',
      dv: 'LAPDV',
      dvPPD: 'LAPDVPPD'
    },
    'VITAMIN C': {
      amount: 'LCPS',
      dv: 'LCPDV',
      dvPPD: 'LCPDVPPD'
    },
    'VITAMIN D': {
      amount: 'LDPS',
      dv: 'LDPDV',
      dvPPD: 'LDPDVPPD'
    },
    'VITAMIN E': {
      amount: 'LEPS',
      dv: 'LEPDV',
      dvPPD: 'LEPDVPPD'
    },
    'VITAMIN K': {
      amount: 'LKPS',
      dv: 'LKPDV',
      dvPPD: 'LKPDVPPD'
    },
    'THIAMIN': {
      amount: 'LThiPS',
      dv: 'LThiPDV',
      dvPPD: 'LThiPDVPPD'
    },
    'RIBOFLAVIN': {
      amount: 'LRibPS',
      dv: 'LRibPDV',
      dvPPD: 'LRibPDVPPD'
    },
    'NIACIN': {
      amount: 'LNiaPS',
      dv: 'LNiaPDV',
      dvPPD: 'LNiaPDVPPD'
    },
    'VITAMIN B6': {
      amount: 'LB6PS',
      dv: 'LB6PDV',
      dvPPD: 'LB6PDVPPD'
    },
    'FOLATE': {
      amount: 'LFolPS',
      dv: 'LFolPDV',
      dvPPD: 'LFolPDVPPD'
    },
    'VITAMIN B12': {
      amount: 'LB12PS',
      dv: 'LB12PDV',
      dvPPD: 'LB12PDVPPD'
    },
    'BIOTIN': {
      amount: 'LBioPS',
      dv: 'LBioPDV',
      dvPPD: 'LBioPDVPPD'
    },
    'PANTOTHENIC ACID': {
      amount: 'LPanPS',
      dv: 'LPanPDV',
      dvPPD: 'LPanPDVPPD'
    },
    'PHOSPHORUS': {
      amount: 'LPhoPS',
      dv: 'LPhoPDV',
      dvPPD: 'LPhoPDVPPD'
    },
    'IODIDE': {
      amount: 'LIodPS',
      dv: 'LIodPDV',
      dvPPD: 'LIodPDVPPD'
    },
    'MAGNESIUM': {
      amount: 'LMagPS',
      dv: 'LMagPDV',
      dvPPD: 'LMagPDVPPD'
    },
    'ZINC': {
      amount: 'LZiPS',
      dv: 'LZiPDV',
      dvPPD: 'LZiPDVPPD'
    },
    'SELENIUM': {
      amount: 'LSelPS',
      dv: 'LSelPDV',
      dvPPD: 'LSelPDVPPD'
    },
    'COPPER': {
      amount: 'LCopPS',
      dv: 'LCopPDV',
      dvPPD: 'LCopPDVPPD'
    },
    'MANGANESE': {
      amount: 'LManPS',
      dv: 'LManPDV',
      dvPPD: 'LManPDVPPD'
    },
    'CHROMIUM': {
      amount: 'LChrPS',
      dv: 'LChrPDV',
      dvPPD: 'LChrPDVPPD'
    },
    'MOLYBDENUM': {
      amount: 'LMolPS',
      dv: 'LMolPDV',
      dvPPD: 'LMolPDVPPD'
    },
    'CHLORIDE': {
      amount: 'LChlPS',
      dv: 'LChlPDV',
      dvPPD: 'LChlPDVPPD'
    },
    'ENERGY (KILOCALORIES)': {
      amount: 'LPSEne',
      dv: 'LPSEnePPD',
      kj: 'LPSEnekJ',
      kjPPD: 'LPSEnekJPPD'
    }
  };