import { Ingredient } from '@/app/types/ingredient'
import { useIngredient, searchIngredient, useIngredients } from '@/app/backend/ingredient'

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper'; // maybe instead of card?
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

const FullCard = (props) => (
	<Card {...props}>
		<CardContent>
			{props.children}
		</CardContent>
	</Card>
)

export default function Page() {
	return (
		<FormControl variant="outlined" className="w-full" sx={{my: 4}}>
			<Stack direction="column" spacing={2}>
				<FullCard className="w-full">
					<Typography variant="h4" component="h1" sx={{mb: 2}}>Nytt recept</Typography>
					<TextField id='recipe-name' label="Titel" className="w-1/2"/>
					<TextField id='recipe-portions' label="Portioner" defaultValue="4" sx={{mx: 2}}/>
				</FullCard>
				<Stack direction="row" spacing={2}>
					<FullCard className="w-1/2">
							<Typography variant="h5" component="h1" sx={{mb: 2}}>Ingredienser</Typography>
					</FullCard>

					<FullCard className="w-1/2">
						<Typography variant="h5" component="h1" sx={{mb: 2}}>Instruktioner</Typography>
					</FullCard>
				</Stack>
			</Stack>
		</FormControl>
	)
}
