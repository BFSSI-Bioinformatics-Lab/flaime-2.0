import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Divider, Box
} from '@mui/material';
import { BILINGUAL_LABELS } from './nft_flaime_nutrients';

const paddingStyle = { padding: '10px' };
const cellPaddingStyle = { padding: '0px' };
const smallFontSizeStyle = { fontSize: 'smaller' };

const getSortedNutrients = (nutritionFacts, supplementedOnly = false) => {
  if (!nutritionFacts) return [];

  return nutritionFacts
    .filter(nutritionFact => 
      // Filter out Energy (Calories) as it is displayed separately in the header
      !['Energy (kcal)', 'Energy (kJ)', 'Energy'].includes(nutritionFact.nutrient.name) &&
      // Filter by supplemented status
      nutritionFact.supplemented === supplementedOnly
    )
    .sort((a, b) => {
      // Sort using DB provided rank. If null, push to the bottom (9999).
      const rankA = a.nutrient.display_rank ?? 9999;
      const rankB = b.nutrient.display_rank ?? 9999;
      return rankA - rankB;
    });
};

const NutritionFactsTable = ({ product }) => {
  const isSupplemented = product.product?.supplemented_food === true;
  const standardNutrients = getSortedNutrients(product.nutrition_facts, false);
  const supplementedNutrients = isSupplemented ? getSortedNutrients(product.nutrition_facts, true) : [];
  const calorieFact = product.nutrition_facts?.find(nf => 
    nf.nutrient.name === 'Energy (kcal)' || nf.nutrient.name === 'Energy'
  );
  

  return (
    <Box>
      <TableContainer component={Paper}>
        <Typography variant="h6" style={paddingStyle}>Nutrition Facts</Typography>
        <Typography variant="body2" style={paddingStyle}>
          Serving Size: {product.serving_size ? `${product.serving_size} ${product.serving_size_unit?.name ?? ""}` :
            (product.raw_serving_size ? `${product.raw_serving_size}` : "Not specified")}
          <br />
          Total size: {product.total_size ?? "Not specified"}
        </Typography>
        {calorieFact && (
          <Typography variant="body2" style={paddingStyle}>
            Calories: {calorieFact.amount} {calorieFact.amount_unit?.name}
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
              {standardNutrients.map((nutritionFact) => (
                <TableRow key={nutritionFact.nutrient.id}>
                  <TableCell>
                    <span style={smallFontSizeStyle}>
                      {BILINGUAL_LABELS[nutritionFact.nutrient.name] || nutritionFact.nutrient.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    {nutritionFact.amount !== null && `${nutritionFact.amount}${nutritionFact.amount_unit?.name ? ` ${nutritionFact.amount_unit.name}` : ''}`}
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

      {isSupplemented && supplementedNutrients.length > 0 && (
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Typography variant="h6" style={paddingStyle}>Supplemented Food Facts</Typography>
          <Table size="small" aria-label="supplemented nutrients table">
            <TableHead>
              <TableRow>
                <TableCell>Nutrient</TableCell>
                <TableCell style={cellPaddingStyle}>Amount</TableCell>
                <TableCell style={cellPaddingStyle}>% Daily Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {supplementedNutrients.map((nutritionFact) => (
                <TableRow key={nutritionFact.nutrient.id}>
                  <TableCell>
                    <span style={smallFontSizeStyle}>
                      {BILINGUAL_LABELS[nutritionFact.nutrient.name] || nutritionFact.nutrient.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    {nutritionFact.amount !== null && `${nutritionFact.amount}${nutritionFact.amount_unit?.name ? ` ${nutritionFact.amount_unit.name}` : ''}`}
                  </TableCell>
                  <TableCell>
                    {nutritionFact.daily_value !== null ? `${nutritionFact.daily_value}%` : ""}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default NutritionFactsTable;