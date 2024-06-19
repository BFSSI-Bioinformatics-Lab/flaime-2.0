import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';

// Assuming nft_order and nutrientMatches are imported from your configuration file
import { nft_order, nutrientMatches } from './nft_flaime_nutrients';

// list of possible energy values
const energy = ['ENERGY (KILOCALORIES)', 'ENERGY (KILOJOULES)'];



const NutritionFactsTable = ({ product }) => (
  <TableContainer component={Paper}>
    <Typography variant="h6" style={{ padding: '10px' }}>Nutrition Facts</Typography>
    <Typography variant="body2" style={{ padding: '10px' }}>
      Serving Size: {product.servingSize ? `${product.servingSize} ${product.servingSizeUnitEntity?.name ?? ""}` : 
      (product.raw_serving_size ? `${product.raw_serving_size}` : "Not specified")}
      <br></br>
      Total size: {product.total_size ?? "Not specified"}
    </Typography>
    <Typography variant="body2" style={{ padding: '10px' }}>
        {product.store_product_nutrition_facts[0]
            .filter((nutritionFact) => energy.includes(nutritionFact.nutrients.name))
            .map((nutritionFact) => (
                `Calories : ${nutritionFact.amount}`
            ))}
    </Typography>
    <Divider variant="middle" />
    {product.store_product_nutrition_facts && (
      <Table size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell >Nutrient</TableCell>
            <TableCell style={{ padding: '0px' }}>Amount</TableCell>
            <TableCell style={{ padding: '0px' }}>% Daily Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {product.store_product_nutrition_facts[0]
            .filter((nutritionFact) => !energy.includes(nutritionFact.nutrients.name))
            .map(nutritionFact => {
              const localizedKey = Object.keys(nutrientMatches).find(key =>
                nutrientMatches[key].includes(nutritionFact.nutrients.name)
              ) || nutritionFact.nutrients.name;
              return { ...nutritionFact, localizedKey };
            })
            .sort((a, b) => {
              const aOrder = nft_order[a.localizedKey] || 9999;
              const bOrder = nft_order[b.localizedKey] || 9999;
              return aOrder - bOrder;
            })
            .map(({ id, unit, amount, daily_value, localizedKey }) => (
              <TableRow key={id}>
                <TableCell>
                  <span style={{ textTransform: 'capitalize', fontSize: 'smaller' }}>
                    {localizedKey}
                  </span>
                </TableCell>
                <TableCell>
                  {amount} {unit || ""}
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
