import { IngredientsInput } from '@/app/recipe/add/ingredients';
import { InstructionsInput } from '@/app/recipe/add/instructions';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
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
					<Tooltip title="Ställer in om receptet ska visas som gram eller volymmått som standard">
						<FormControlLabel control={<Switch id='prefer-grams'/>} label="Föredra gram" labelPlacement="bottom"/>
					</Tooltip>
					<Button
						className="flex-1"
						variant="contained"
						onClick={saveRecipie}
					>
						Spara
					</Button>
				</FullCard>
				<Stack direction="row" spacing={2}>
					<FullCard className="w-1/2">
						<Typography variant="h5" component="h1" sx={{mb: 2}}>Ingredienser</Typography>
						<IngredientsInput/>
					</FullCard>

					<FullCard className="w-1/2">
						<Typography variant="h5" component="h1" sx={{mb: 2}}>Instruktioner</Typography>
						<InstructionsInput/>
					</FullCard>
				</Stack>
			</Stack>
		</FormControl>
	)
}
