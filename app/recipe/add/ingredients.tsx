'use client'

import { useState, FormEvent, ChangeEvent } from 'react';

import { IngredientType, IngredientEntry, VolumeType, unitOptions, volumeTypes } from '@/app/types/ingredient'
import { useIngredient, addIngredient, useIngredients } from '@/app/backend/ingredient'

import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import IconButton from '@mui/material/IconButton'

import DeleteIcon from '@mui/icons-material/Delete'

interface IngredientInputEntry {
	ingredientType: IngredientType | null,
	quantity: string,
	comment: string,
	volumeUnit: VolumeType | "g" | null, // user can input in grams, will be converted
}

const defaultIngredientEntry = {
	ingredientType: null,
	quantity: '0',
	comment: '',
	volumeUnit: null,
}

// At the moment, this loads all ingredients on first interaction.
// If this becomes to heavy on mobile devices, we could move the search to the backend
function IngredientEntryInput({ id, ingredientsState, setIngredientsState } : {
	id: number,
	ingredientsState: State,
	setIngredientsState: Function
}) {
	const { ingredients, error, isLoading } = useIngredients();
	const filter = createFilterOptions<IngredientType>();

	const [value, setValueState] = useState<IngredientInputEntry | null>(null);
	// wrapper to handle adding new ingredient rows
	const setValue = (v) => {
		if(v && ingredientsState.activeIds.at(-1) == id) {
			// We are the last item, add new
			const newId = ingredientsState.nextId;
			setIngredientsState({
				nextId: newId + 1,
				activeIds: ingredientsState.activeIds.concat(newId)
			})
		}
		setValueState(v);
	}

	const handleDelete = () => {
		if(ingredientsState.activeIds.at(-1) == id)
		{
			// We're the last item, just clear our value
			// (probably won't happen, but best to keep it anyway)
			setValue(null);
		}
		else
		{
			setIngredientsState({
				...ingredientsState,
				activeIds: ingredientsState.activeIds.filter( x => x != id )
			})
		}
	}

	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogValue, setDialogValue] = useState({
		name: '',
		unit: "volume",
		defaultVolumeType: '',
		weightPerUnit: ''
	})

	return (
		<>
			<FormControl>
				<Box className="w-full flex flex-row">
					<Autocomplete
						id = {`ingredient-type-${id}`}
						className = "flex-3"
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
						value={value?.ingredientType ?? null}
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
									setValue({
										...defaultIngredientEntry,
										ingredientType: newValue,
										volumeUnit: newValue.defaultVolumeType
									});
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
					<TextField
						label="Kvantitet"
						value={value?.quantity ?? "0"}
						onChange={ (event: ChangeEvent ) => {
							setValue({
								...value,
								quantity: event.target.value
							})
						}}
						className="flex-1"
						slotProps={{
							input: {
								endAdornment: (
									<InputAdornment position="end">
										{ value?.ingredientType?.unit == "count" ? "st" :
											(value?.ingredientType?.unit == "weight" ? "g" :
												value?.volumeUnit ?? "dl"
											)
										}
									</InputAdornment>
								)
							}
						}}
					/>
					<FormControl
						className="flex-1"
						sx={{
							display: value?.ingredientType?.unit == "volume" ? 'flex' : 'none'
						}}
						>
						<InputLabel id={`ingredient-entry-${id}-unit-label`}>Enhet</InputLabel>
						<Select
							id={`ingredient-entry-${id}-unit`}
							labelId={`ingredient-entry-${id}-unit-label`}
							label="Enhet"
							value={value?.volumeUnit ?? ''}
							onChange={(event : SelectChangeEvent) => {
								setValue({
									...value,
									volumeUnit: event.target.value as string,
								})
							}}
						>
							{
								(
									/* include weight conversion as input if weight conversion value
									 * is included in ingredient type */
									value?.ingredientType?.weightPerUnit !== undefined ?
										volumeTypes.concat("g")
										: volumeTypes
								).map( value => (
									<MenuItem value={value}>{value}</MenuItem>
								))
							}
						</Select>
					</FormControl>
					<TextField
						label="Kommentar"
						value={value?.comment ?? ""}
						onChange={ (event: ChangeEvent ) => {
							setValue({
								...value,
								comment: event.target.value
							})
						}}
						className="flex-2"
					/>
					<IconButton
						className="flex-none self-center justify-self-end"
						onClick={handleDelete}
						tabIndex="-1"
					>
						<DeleteIcon/>
					</IconButton>
				</Box>
			</FormControl>
			<IngredientCreateDialog
				setValue={setValue}
				setDialogValue={setDialogValue}
				setOpen={setDialogOpen}
				value={value}
				dialogValue={dialogValue}
				open={dialogOpen}
			/>
		</>
	)
}

function IngredientCreateDialog({
	setValue, setDialogValue, setOpen, value, dialogValue, open
} : {
	setValue : Function,
	setDialogValue: Function,
	setOpen: Function,
	value: InstructionType,
	dialogValue: any,
	open: boolean
}) {

	const handleClose = () => {
		setDialogValue({
			name: '',
			unit: "volume",
			defaultVolumeType: '',
			weightPerUnit: ''
		})
		setOpen(false);
	}

	const handleSubmit = async (event : FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		let weightPerUnit = dialogValue.weightPerUnit != '' ? parseFloat(dialogValue.weightPerUnit) : undefined;
		if(isNaN(weightPerUnit) === true) {
			weightPerUnit= undefined
		}

		if(weightPerUnit && dialogValue.unit == "volume") {
			// convert from dl to ml as stored in backend
			weightPerUnit /= 100.0;
		}

		const newIngredient = {
			id: null,
			name: dialogValue.name,
			unit: dialogValue.unit,
			defaultVolumeType: dialogValue.defaultVolumeType != '' ? dialogValue.defaultVolumeType : undefined,
			weightPerUnit: weightPerUnit
		};

		const ingredient = await addIngredient(newIngredient);
		setValue({
			...defaultIngredientEntry,
			ingredientType: ingredient,
			volumeUnit: ingredient.defaultVolumeType
		});
		handleClose();
	}

	const [isVolumeType, toggleIsVolumeType] = useState(false);
	const [isWeightType, toggleIsWeightType] = useState(false);

	return (
		<Dialog open={open} onClose={handleClose}>
			<form onSubmit={handleSubmit}>
				<DialogTitle>Skapa ny ingrediens</DialogTitle>
				<DialogContent>
					<FormControl variant="standard" >
						<Stack direction="column" spacing={2} sx={{pt: 2}}>
							<TextField
								autoFocus
								id="ingredient-create-name"
								value={dialogValue.name}
								onChange={(event) =>
										setDialogValue({
										...dialogValue,
										name: event.target.value,
								})}
								label="Namn"
							/>
							<FormControl>
								<InputLabel id="ingredient-create-unit-label">Enhet</InputLabel>
								<Select
									id="ingredient-create-unit"
									labelId="ingredient-create-unit-label"
									label="Enhet"
									value={dialogValue.unit}
									onChange={(event : SelectChangeEvent) => {
										setDialogValue({
											...dialogValue,
											unit: event.target.value as string,
											defaultVolumeType: "ml",
										})
										toggleIsVolumeType(event.target.value == "volume");
										toggleIsWeightType(event.target.value == "weight");
									}}
								>
									{
										Object.entries(unitOptions).map(([key, value]) => (
											<MenuItem value={key}>{value}</MenuItem>
										))
									}
								</Select>
							</FormControl>
							<FormControl sx={{
									display: isVolumeType ? 'flex' : 'none',
								}}>
								<InputLabel id="ingredient-create-volume-default-type-label">Standardenhet</InputLabel>
								<Select
									id="ingredient-create-volume-default-type"
									labelId="ingredient-create-volume-default-type-label"
									label="Standardenhet"
									value={dialogValue.defaultVolumeType}
									onChange={(event : SelectChangeEvent) => {
										setDialogValue({
											...dialogValue,
											defaultVolumeType: event.target.value as string,
										})
									}}
								>
									{
										volumeTypes.map((value) => (
											<MenuItem value={value}>{value}</MenuItem>
										))
									}
								</Select>
							</FormControl>
							<TextField
								id="ingredient-create-weight-per-unit"
								value={dialogValue.weightPerUnit}
								onChange={(event) =>
										setDialogValue({
										...dialogValue,
										weightPerUnit: event.target.value,
								})}
								label={
									dialogValue.unit == "count" ?  "Vikt per styck" : "Vikt per dl"
								}
								sx={{
									display: isWeightType ? 'none' : 'flex'
								}}
							/>
						</Stack>
					</FormControl>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Avbryt</Button>
					<Button type="submit">Skapa</Button>
				</DialogActions>
			</form>
		</Dialog>
	)
}

interface State {
	nextId: number,
	activeIds: number[]
}

const IngredientsInput = () => {
	const [ingredientsState, setIngredientsState] = useState<State>({
		nextId: 1,
		activeIds: [0]
	});

	return (
		<Stack direction="column" spacing={2}>
			{ ingredientsState.activeIds.map((id) => (
				<IngredientEntryInput
					id={id}
					key={id}
					ingredientsState={ingredientsState}
					setIngredientsState={setIngredientsState}
				/>
			))}
		</Stack>
	)
}

export { IngredientsInput }
