import React from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Typography, Divider 
} from '@mui/material';

import { nft_order, nutrientMatches } from './nft_flaime_nutrients';

const paddingStyle = { padding: '10px' };
const cellPaddingStyle = { padding: '0px' };
const smallFontSizeStyle = { textTransform: 'capitalize', fontSize: 'smaller' };

const getLocalizedNutrients = (nutritionDetails) => nutritionDetails
  .filter(nutritionFact => nutritionFact.nutrient_name !== "ENERGY (KILOCALORIES)")
  .map(nutritionFact => ({
    ...nutritionFact,
    localizedKey: Object.keys(nutrientMatches).find(key =>
      nutrientMatches[key].includes(nutritionFact.nutrient_name)
    ) || nutritionFact.nutrient_name
  }))
  .sort((a, b) => {
    const aOrder = nft_order[a.localizedKey] || 9999;
    const bOrder = nft_order[b.localizedKey] || 9999;
    return aOrder - bOrder;
  });

const NutritionFactsTable = ({ product }) => (
  <TableContainer component={Paper}>
    <Typography variant="h6" style={paddingStyle}>Nutrition Facts</Typography>
    <Typography variant="body2" style={paddingStyle}>
      Serving Size: {product.servingSize ? `${product.servingSize} ${product.servingSizeUnitEntity?.name ?? ""}` : 
      (product.raw_serving_size ? `${product.raw_serving_size}` : "Not specified")}
      <br />
      Total size: {product.total_size ?? "Not specified"}
    </Typography>
      {product.nutrition_details && (
        <Typography variant="body2" style={paddingStyle}>
          {product.nutrition_details
            .filter(nutritionFact => nutritionFact.nutrient_name === "ENERGY (KILOCALORIES)")
            .map(nutritionFact => `Calories: ${nutritionFact.amount} ${nutritionFact.unit}`)
            .join(', ')}
        </Typography>
      )}
    <Divider variant="middle" />
      {product.nutrition_details && (
        <Table size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>Nutrient</TableCell>
              <TableCell style={cellPaddingStyle}>Amount</TableCell>
              <TableCell style={cellPaddingStyle}>% Daily Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getLocalizedNutrients(product.nutrition_details).map(({ id, unit, amount, daily_value, localizedKey }) => (
              <TableRow key={id}>
                <TableCell>
                  <span style={smallFontSizeStyle}>
                    {localizedKey}
                  </span>
                </TableCell>
                <TableCell>
                  {amount && `${amount} ${unit}`}
                </TableCell>
                <TableCell>
                  {daily_value !== null ? `${daily_value}%` : ""}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
  </TableContainer>
);

export default NutritionFactsTable;
