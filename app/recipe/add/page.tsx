import { IngredientEntryInput } from '@/app/recipe/add/ingredients';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

function IngredientItem ({ ingredient } : { ingredient : IngredientType }) {
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
			{ingredients.map((ingr : IngredientType) => ( <IngredientItem
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
					<TextField
						id='recipe-portions'
						label="Portioner"
						defaultValue="4"
						sx={{mx: 2}}
						slotProps={{
							htmlInput: {
								className: 'text-right'
							}
						}}
					/>
				</FullCard>
				<Stack direction="row" spacing={2}>
					<FullCard className="w-1/2">
						<Typography variant="h5" component="h1" sx={{mb: 2}}>Ingredienser</Typography>
						<Stack direction="column" spacing={2}>
							<IngredientEntryInput/>
						</Stack>
					</FullCard>

					<FullCard className="w-1/2">
						<Typography variant="h5" component="h1" sx={{mb: 2}}>Instruktioner</Typography>
					</FullCard>
				</Stack>
			</Stack>
		</FormControl>
	)
}
