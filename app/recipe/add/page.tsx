import { Ingredient } from '@/app/types/ingredient'
import { useIngredient, searchIngredient, useIngredients } from '@/app/backend/ingredient'

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
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

const FlexCard = ({ children, sx, className } : { children : React.ReactNode, sx?: any, className?: string }) => (
	<Card sx={{
		py: 2,
		px: 2,
		my: 2,
		...sx
		}}
		className={`flex-1 ${className ?? ""}`}
	>
		{children}
	</Card>
)

export default function Page() {
	return (
		<FormControl className="flex flex-col" variant="outlined">
			<FlexCard className="w-full">
				<Typography variant="h4" component="h1" sx={{mb: 2}}>Nytt recept</Typography>
				<TextField id='recipe-name' label="Titel" className="w-1/2"/>
				<TextField id='recipe-portions' label="Portioner" defaultValue="4" sx={{mx: 2}}/>
			</FlexCard>
			<Box className="flex-1 flex w-full flex-row">
				<FlexCard className="w-1/2 flex-1" sx={{mr: 2}}>
					<Typography variant="h5" component="h1" sx={{mb: 2}}>Ingredienser</Typography>
					<Stack>
					</Stack>
				</FlexCard>

				<FlexCard className="w-1/2 flex-1">
					<Typography variant="h5" component="h1" sx={{mb: 2}}>Instruktioner</Typography>
				</FlexCard>
			</Box>
		</FormControl>
	)
}
