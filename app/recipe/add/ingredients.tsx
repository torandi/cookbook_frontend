'use client'

import { useState, FormEvent } from 'react';

import { IngredientType } from '@/app/types/ingredient'
import { useIngredient, addIngredient, useIngredients } from '@/app/backend/ingredient'

import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';


// At the moment, this loads all ingredients on first interaction.
// If this becomes to heavy on mobile devices, we could move the search to the backend
function IngredientEntryInput({ index } : { index: number }) {
	const { ingredients, error, isLoading } = useIngredients();
	const filter = createFilterOptions<IngredientType>();

	const [value, setValue] = useState<IngredientType | null>(null);

	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogValue, setDialogValue] = useState({
		name: '',
		unit: "volume",
		defaultVolumeType: '',
		weightPerUnit: ''
	})

	const handleDialogClose = () => {
		setDialogValue({
			name: '',
			unit: "volume",
			defaultVolumeType: '',
			weightPerUnit: ''
		})
		setDialogOpen(false);
	}

	const handleDialogSubmit = async (event : FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const newIngredient = {
			id: -1,
			name: dialogValue.name,
			unit: dialogValue.unit,
			defaultVolumeType: dialogValue.defaultVolumeType != '' ? dialogValue.defaultVolumeType : undefined,
			weightPerUnit: dialogValue.weightPerUnit != '' ? parseFloat(dialogValue.weightPerUnit) : undefined
		};

		const ingredient = await addIngredient(newIngredient);
		setValue(ingredient);
		handleDialogClose();
	}

	return (
		<FormControl className="w-full">
			<Autocomplete
				id = {`ingredient-type-${index}`}
				loading={ isLoading }
				options={ ingredients }
				getOptionLabel = { (option : IngredientType) => {
					// Dynamically created option
					if (option.inputValue)
						{
							return option.title;
						}

						return option.name
				}}
				isOptionEqualToValue = { (option, value) => option.name === value.name }
				value={value}
				onChange={(event, newValue) => {
					if(newValue && newValue.inputValue) {
						setDialogOpen(true);
						setDialogValue({
							name: newValue.inputValue,
							unit: "volume",
							defaultVolumeType: '',
							weightPerUnit: ''
						})
					}
					else
					{
						setValue(newValue);
					}
				}}
				autoSelect
				autoHighlight
				selectOnFocus
				handleHomeEndKeys
				filterOptions={(options, params) => {
					const filtered = filter(options, params);

					const { inputValue } = params;

					// Suggest the creation of a new value
					const isExisting = options.some((option) => inputValue === option.title);
					if (inputValue !== '' && !isExisting) {
						filtered.push({
							inputValue,
							title: `Skapa ny ingrediens "${inputValue}"`,
						});
					}
					return filtered;
				}}
				renderInput={(params) => (
					<TextField
						{...params}
						label="Ingrediens"
						slotProps={{
							input: {
								...params.InputProps,
								endAdornment: (
									<>
										{isLoading ? <CircularProgress color="inherit" size={20} /> : null}
										{params.InputProps.endAdornment}
									</>
								),
						},
						}}
					/>
				)}
			/>
			<Dialog open={dialogOpen} onClose={handleDialogClose}>
				<form onSubmit={handleDialogSubmit}>
					<DialogTitle>Skapa ny ingrediens</DialogTitle>
					<DialogContent>
						<DialogContentText>
							Lägg till ny ingrediens
						</DialogContentText>
						<TextField
							autoFocus
							margin="dense"
							id="name"
							value={dialogValue.name}
							onChange={(event) =>
								setDialogValue({
								...dialogValue,
								name: event.target.value,
							})
							}
							label="Namn"
							type="text"
							variant="standard"
						/>
						<TextField
							margin="dense"
							id="unit"
							value={dialogValue.year}
							onChange={(event) =>
								setDialogValue({
								...dialogValue,
								unit: event.target.value,
							})
							}
							label="Enhet"
							variant="standard"
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleDialogClose}>Avbryt</Button>
						<Button type="submit">Skapa</Button>
					</DialogActions>
				</form>
			</Dialog>
		</FormControl>
	)
}

/*
 *

				renderValue={(value, getItemProps) => (
					<Chip label={value.name} {...getItemProps()} />
				)}

 */

export { IngredientEntryInput }
