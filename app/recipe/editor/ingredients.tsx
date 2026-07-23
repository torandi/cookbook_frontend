'use client'

import { useState, useEffect, ChangeEvent, SyntheticEvent } from 'react';

import { defaultIngredientEntry, useRecipeEditorStore } from './state';

import { IngredientType, RecipeIngredientType, volumeTypes, defaultIngredientUnit } from '@/app/types/ingredient'
import { useIngredients } from '@/app/backend/ingredient'
import { SortableList } from '@/app/components/sortableList'
import IngredientCreateDialog from '@/app/components/ingredientCreateDialog'

import { useSortable } from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton'

import DeleteIcon from '@mui/icons-material/Delete'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

const ingredientSpacing = 1;

type IngredientOrNewType = IngredientType | { inputValue: string, title: string };

function IngredientEntryInput({ id, isLastItem } : {
	id: number,
	isLastItem: boolean,
}) {
	const value = useRecipeEditorStore( state => state.ingredients[id] )
	const setIngredient = useRecipeEditorStore( state => state.setIngredient )
	const setValue = (value : RecipeIngredientType | null) => setIngredient(id, value)
	const addIngredient = useRecipeEditorStore( state => state.addIngredient )
	const removeIngredient = useRecipeEditorStore( state => state.removeIngredient )

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
						onChange={ (event: ChangeEvent<HTMLInputElement>) => {
							if (!value) return;
							setValue({
								...value,
								comment: event.currentTarget.value
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
								checked={value?.optional ?? false}
								tabIndex={-1}
								onChange={ (event: ChangeEvent<HTMLInputElement>) => {
									if (!value) return;
									setValue({
										...value,
										optional: event.currentTarget.checked
									})
								}}
							/>
						}
					/>
					<Tooltip title="Ta bort ingrediens">
						<IconButton
							className="flex-none self-center justify-self-end"
							onClick={handleDelete}
							tabIndex={-1}
						>
						<DeleteIcon/>
						</IconButton>
					</Tooltip>
					<Tooltip title="Dra för att sortera">
						<IconButton
							{...listeners}
							className="flex-none self-center justify-self-end"
							tabIndex={-1}
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
	value: RecipeIngredientType | null,
	setValue: Function
}) {
	const { ingredients, isLoading } = useIngredients();

	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogInitialName, setDialogInitialName] = useState('');

	const filter = createFilterOptions<IngredientOrNewType>({
		limit: 100, /* only show 100 first items */
	});
	// Add "Skapa ny" option to ingredient list
	const generateOptions = (options : IngredientOrNewType[], params : any) => {
		const filtered = filter(options, params);

		const { inputValue } = params;

		// Suggest the creation of a new value
		const isExisting = options.some((option) => "title" in option && inputValue === option.title);
		if (inputValue !== '' && !isExisting) {
			filtered.push({
				inputValue,
				title: `Skapa ny ingrediens "${inputValue}"`,
			});
		}
		return filtered;
	}

	const handleOnChange = (event : SyntheticEvent, newValue : IngredientOrNewType | null) => {
		if(newValue && "inputValue" in newValue && newValue.inputValue) {
			setDialogInitialName(newValue.inputValue);
			setDialogOpen(true);
		} else {
			const currentOptional = value?.optional ?? false

			setValue({
				...defaultIngredientEntry,
				ingredient: newValue as IngredientType,
				unit: defaultIngredientUnit(newValue as IngredientType),
				optional: currentOptional, // have to override, to not reset optional when changing ingredient (as optional is not null in default)
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
				options={ ingredients ?? [] }
				getOptionLabel = { (option : IngredientOrNewType ) => {
					// Dynamically created option
					if ("inputValue" in option && option.inputValue) {
						return option.title;
					} else if ("name" in option) {
						return option.name
					}
					return ""
				}}
				isOptionEqualToValue = { (option, value) => (option as IngredientType).name === (value as IngredientType).name }
				value={value?.ingredient ?? null}
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
							...params.slotProps,
							input: {
								...params.slotProps.input,
								endAdornment: (
									<>
										{isLoading ? <CircularProgress color="inherit" size={20} /> : null}
										{params.slotProps.input.endAdornment}
									</>
								),
							},
						}}
					/>
				)}
			/>

			<IngredientCreateDialog
				open={dialogOpen}
				initialName={dialogInitialName}
				onClose={() => setDialogOpen(false)}
				onCreated={(ingredient) => {
					const currentOptional = value?.optional ?? false;
					setValue({
						...defaultIngredientEntry,
						ingredient,
						unit: defaultIngredientUnit(ingredient),
						optional: currentOptional,
					});
				}}
			/>
		</>
	)
}

function QuantityFields({ id, value, setValue } : {
	id: number,
	value: RecipeIngredientType | null,
	setValue: Function
})
{
	const unitType = value?.ingredient?.unit ?? "volume";

	const hasWeightOption = (value?.ingredient?.weightPerUnit ?? 0) > 0;

	let units : string[] = [];
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
				onChange={ (event: ChangeEvent<{ value: string }> ) => {
					setValue({
						...value,
						quantity: event.target.value
					})
				}}
				slotProps={{
					input: {
						endAdornment: !hasUnitOptions && (
							<InputAdornment position="end">
							{ value?.ingredient?.unit == "count" ? "st" :
								(value?.ingredient?.unit == "weight" ? "g" : unit)
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
					renderInput = { (params) => (
						<TextField
							{...params}
							label="Enhet"
							/>
					)}
				/>
			</FormControl> }
			</>
	)
}

export const IngredientsInput = () => {
	const ingredientsOrder = useRecipeEditorStore( state => state.ingredientsOrder )
	const setIngredientsOrder = useRecipeEditorStore( state => state.setIngredientsOrder )

	return (
		<SortableList
			onItemsUpdated={setIngredientsOrder}
			items={ingredientsOrder}
		>
			<Stack direction="column" spacing={2}>
				{ ingredientsOrder.map((id : number) => (
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
