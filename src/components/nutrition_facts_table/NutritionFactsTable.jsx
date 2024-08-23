import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Divider
} from '@mui/material';
import { nft_order, nutrientMatches } from './nft_flaime_nutrients';

const paddingStyle = { padding: '10px' };
const cellPaddingStyle = { padding: '0px' };
const smallFontSizeStyle = { textTransform: 'capitalize', fontSize: 'smaller' };

const getLocalizedNutrients = (nutritionFacts) => nutritionFacts
  .filter(nutritionFact => nutritionFact.nutrient.name !== "ENERGY (KILOCALORIES)")
  .map(nutritionFact => ({
    ...nutritionFact,
    localizedKey: Object.keys(nutrientMatches).find(key =>
      nutrientMatches[key].includes(nutritionFact.nutrient.name)
    ) || nutritionFact.nutrient.name
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
      Serving Size: {product.serving_size ? `${product.serving_size} ${product.serving_size_unit?.name ?? ""}` : 
        (product.raw_serving_size ? `${product.raw_serving_size}` : "Not specified")}
      <br />
      Total size: {product.total_size ?? "Not specified"}
    </Typography>
    {product.nutrition_facts && (
      <Typography variant="body2" style={paddingStyle}>
        {product.nutrition_facts
          .filter(nutritionFact => nutritionFact.nutrient.name === "ENERGY (KILOCALORIES)")
          .map(nutritionFact => `Calories: ${nutritionFact.amount} ${nutritionFact.amount_unit.name}`)
          .join(', ')}
      </Typography>
    )}
    <Divider variant="middle" />
    {product.nutrition_facts && (
      <Table size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>Nutrient</TableCell>
            <TableCell style={cellPaddingStyle}>Amount</TableCell>
            <TableCell style={cellPaddingStyle}>% Daily Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {getLocalizedNutrients(product.nutrition_facts).map((nutritionFact) => (
            <TableRow key={nutritionFact.nutrient.id}>
              <TableCell>
                <span style={smallFontSizeStyle}>
                  {nutritionFact.localizedKey}
                </span>
              </TableCell>
              <TableCell>
                {nutritionFact.amount !== null && `${nutritionFact.amount} ${nutritionFact.amount_unit.name}`}
              </TableCell>
              <TableCell>
                {nutritionFact.daily_value !== null ? `${nutritionFact.daily_value}%` : ""}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )}
  </TableContainer>
);

export default NutritionFactsTable;