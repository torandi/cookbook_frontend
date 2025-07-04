import { Ingredient } from '@/app/types/ingredient'
import { useIngredient, searchIngredient, useIngredients } from '@/app/backend/ingredient'

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

function IngredientItem ({ ingredient } : { ingredient : Ingredient }) {
  return (
    <Box>
      <Chip label={ingredient.name}/>
    </Box>
  )
}

// temporary to test things
function Ingredients() {
  const {ingredients, error, loading} = useIngredients();

  return (
    <Box>
      {ingredients.map((ingr : Ingredient) => ( <IngredientItem
        key={ingr.id}
        ingredient={ingr}
      /> ))}
    </Box>
  )
}

export default function Page() {
  return (
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Typography variant="h4" component="h1" sx={{mb: 2}}>Lägg till recept</Typography>
        <Ingredients/>
      </Box>
  )
}
