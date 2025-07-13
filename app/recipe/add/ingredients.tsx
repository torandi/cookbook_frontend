'use client'

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';

import { defaultIngredientEntry, useRecipeAddStore } from './state';

import { IngredientType, IngredientEntry, VolumeType, unitOptions, volumeTypes, defaultIngredientUnit } from '@/app/types/ingredient'
import { useIngredient, addIngredient, useIngredients } from '@/app/backend/ingredient'
import { SortableList } from '@/app/components/sortableList'

import { useSortable } from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

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
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton'
import Select, { SelectChangeEvent } from '@mui/material/Select';

import DeleteIcon from '@mui/icons-material/Delete'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

const ingredientSpacing = 1;

function IngredientEntryInput({ id, isLastItem } : {
	id: number,
	isLastItem: boolean,
}) {
	const value = useRecipeAddStore( state => state.ingredients[id] )
	const setIngredient = useRecipeAddStore( state => state.setIngredient )
	const setValue = (value : IngredientEntry) => setIngredient(id, value)
	const addIngredient = useRecipeAddStore( state => state.addIngredient )
	const removeIngredient = useRecipeAddStore( state => state.removeIngredient )

	// If we are ever the last item, and value is set to non-null
	// ad another item
	useEffect(() => {
		if(isLastItem && value != null) {
			addIngredient()
		}
	}, [isLastItem, value])

	const handleDelete = () => {
		if(isLastItem) {
			// We're the last item, just clear our value
			setValue(null);
		} else {
			removeIngredient(id)
		}
	}

	// sorting / drag & drop
	const {
		listeners,
		setNodeRef,
		transform,
		transition,
	} = useSortable({id: id});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	// end sorting

	return (
		<Box ref={setNodeRef} style={style} tabIndex={-1}>
			<FormControl>
				<Box className="w-full flex flex-row">
					<IngredientSelectBox
						id={id}
						value={value}
						setValue={setValue}
					/>
					<QuantityFields
						id={id}
						value={value}
						setValue={setValue}
					/>
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
					<FormControlLabel
						label="Ev."
						labelPlacement="top"
						className="flex-none"
						control={
							<Switch
								value={value?.optional ?? false}
								tabIndex={-1}
								onChange={ (event: ChangeEvent ) => {
									setValue({
										...value,
										optional: event.target.value
									})
								}}
							/>
						}
					/>
					<Tooltip title="Ta bort ingrediens">
						<IconButton
							className="flex-none self-center justify-self-end"
							onClick={handleDelete}
							tabIndex="-1"
						>
						<DeleteIcon/>
						</IconButton>
					</Tooltip>
					<Tooltip title="Dra för att sortera">
						<IconButton
							{...listeners}
							className="flex-none self-center justify-self-end"
							tabIndex="-1"
						>
							<DragIndicatorIcon/>
						</IconButton>
					</Tooltip>
				</Box>
			</FormControl>
		</Box>
	)
}

// At the moment, this loads all ingredients on first interaction.
// If this becomes to heavy on mobile devices, we could move the search to the backend
function IngredientSelectBox({id, value, setValue} : {
	id: number,
	value: IngredientEntry | null,
	setValue: Function
}) {
	const { ingredients, error, isLoading } = useIngredients();

	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogValue, setDialogValue] = useState({
		name: '',
		unit: "volume",
		defaultVolumeType: '',
		weightPerUnit: ''
	})

	const filter = createFilterOptions<IngredientType>({
		limit: 100, /* only show 100 first items */
	});
	// Add "Skapa ny" option to ingredient list
	const generateOptions = (options, params) => {
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
	}

	const handleOnChange = (event, newValue) => {
		if(newValue && newValue.inputValue) {
			setDialogOpen(true);
			setDialogValue({
				name: newValue.inputValue,
				unit: "volume",
				defaultVolumeType: '',
				weightPerUnit: ''
			})
		} else {
			setValue({
				...defaultIngredientEntry,
				ingredientType: newValue,
				unit: defaultIngredientUnit(newValue),
			});
		}
	}

	return (
		<>
			<Autocomplete
				id = {`ingredient-type-${id}`}
				className = "flex-3"
				sx={{mr: ingredientSpacing}}
				loading={ isLoading }
				options={ ingredients }
				getOptionLabel = { (option : IngredientType) => {
					// Dynamically created option
					if (option.inputValue) {
						return option.title;
					}

					return option.name
				}}
				isOptionEqualToValue = { (option, value) => option.name === value.name }
				value={value?.ingredientType ?? null}
				onChange={handleOnChange}
				clearOnEscape
				autoSelect
				autoHighlight
				selectOnFocus
				handleHomeEndKeys
				filterOptions={generateOptions}
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

function QuantityFields({ id, value, setValue } : {
	id: number,
	value: IngredientEntry | null,
	setValue: Function
})
{
	const unitType = value?.ingredientType?.unit ?? "volume";

	const hasWeightOption = (value?.ingredientType?.weightPerUnit ?? 0) > 0;

	let units = [];
	const unit = value?.unit ?? "dl";

	switch(unitType)
	{
		case "volume":
			units = (hasWeightOption ? ["g"] : []).concat(volumeTypes); // prepend grams
		break;
		case "count":
			units = hasWeightOption ? ["st", "g"] : [];
		break;
		case "weight":
			units = [];
		break;
	}

	const hasUnitOptions = units.length > 0;

	return (
		<>
			<TextField
				label="#"
				className={ hasUnitOptions ? "flex-1" : "flex-2" }
				sx={{ mr: ingredientSpacing }}
				value={ value?.quantity ?? "" }
				placeholder="-"
				onChange={ (event: ChangeEvent ) => {
					setValue({
						...value,
						quantity: event.target.value
					})
				}}
				slotProps={!hasUnitOptions && {
					input: {
						endAdornment: (
							<InputAdornment position="end">
							{ value?.ingredientType?.unit == "count" ? "st" :
								(value?.ingredientType?.unit == "weight" ? "g" : unit)
							}
							</InputAdornment>
						)
					}
				}}
							/>
			{ hasUnitOptions && <FormControl className="flex-1" >
				<Autocomplete
					id={`ingredient-entry-${id}-unit`}
					sx={{mr: ingredientSpacing}}
					className="flex-1"
					label="Enhet"
					autoSelect
					autoHighlight
					selectOnFocus
					handleHomeEndKeys
					disableClearable
					value={unit}
					options={units}
					onChange={(event, newValue) => {
						setValue({
							...value,
							unit: newValue,
						})
					}}
					renderInput = { (params) => <TextField {...params} /> }
				/>
			</FormControl> }
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
			unit: defaultIngredientUnit(ingredient),
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

export const IngredientsInput = () => {
	const ingredientsOrder = useRecipeAddStore( state => state.ingredientsOrder )
	const setIngredientsOrder = useRecipeAddStore( state => state.setIngredientsOrder )

	return (
		<SortableList
			onItemsUpdated={setIngredientsOrder}
			items={ingredientsOrder}
		>
			<Stack direction="column" spacing={2}>
				{ ingredientsOrder.map((id) => (
					<IngredientEntryInput
						id = { id }
						key = { id }
						isLastItem = { ingredientsOrder.at(-1) == id }
					/>
				))}
			</Stack>
		</SortableList>
	)
}
