import { IngredientsInput } from './ingredients';
import { InstructionsInput } from './instructions';
import { RecipeInfoInput } from './recipeInfo';
import { SaveButton } from './save';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
//import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const FullCard = (props) => (
	<Card {...props} >
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
					<SaveButton/>
					<Typography variant="h4" component="h1" sx={{mb: 2}}>Nytt recept</Typography>
					<RecipeInfoInput/>
				</FullCard>
				<Stack direction="row" spacing={2}>
					<FullCard className="w-1/2">
						<Typography variant="h5" component="h1" sx={{mb: 2}}>Ingredienser</Typography>
						<IngredientsInput/>
					</FullCard>

					<FullCard className="w-1/2">
						<InstructionsInput/>
					</FullCard>
				</Stack>
			</Stack>
		</FormControl>
	)
}
