'use client'

import { useEffect, useState, ChangeEvent } from 'react';

import { defaultIngredientEntry, useRecipeEditorStore } from './state';

import { IngredientType, RecipeIngredientType, volumeTypes, defaultIngredientUnit } from '@/app/types/ingredient'
import { RecipeBackendType } from '@/app/types/recipe'
import { SortableList } from '@/app/components/sortableList'
import IngredientAutocomplete from '@/app/components/ingredientAutocomplete'

import { useSortable } from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
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
import { AddGroupButton, ExtractGroupDialog, GroupEditRow } from './groups';
import { evalNumberExpression } from '@/app/utils';
import { showSuccessAlert, showErrorAlert } from '@/app/ui/alert-state'
import { addRecipe } from '@/app/backend/recipe'

const ingredientSpacing = 1;

function IngredientEntryInput({ id, groupId, isLastItem } : {
	id: number,
	groupId: number,
	isLastItem: boolean,
}) {
	const value = useRecipeEditorStore( state => state.ingredients[id] )
	const setIngredient = useRecipeEditorStore( state => state.setIngredient )
	const setValue = (value : RecipeIngredientType | null) => setIngredient(id, value)
	const addIngredient = useRecipeEditorStore( state => state.addIngredient )
	const removeIngredient = useRecipeEditorStore( state => state.removeIngredient )

	// If we are ever the last item, and value is set to non-null
	// add another item
	useEffect(() => {
		if(isLastItem && value != null) {
			addIngredient(groupId)
		}
	}, [isLastItem, value])

	const handleDelete = () => {
		if(isLastItem) {
			// We're the last item, just clear our value
			setValue(null);
		} else {
			removeIngredient(id, groupId);
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
						sx={{mx: 0}}
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
							sx={{px: 1}}
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
							sx={{px: 1}}
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
	const handleOnChange = (newValue : IngredientType | null) => {
		const currentOptional = value?.optional ?? false

		setValue({
			...defaultIngredientEntry,
			ingredient: newValue,
			unit: newValue ? defaultIngredientUnit(newValue) : null,
			optional: currentOptional, // have to override, to not reset optional when changing ingredient (as optional is not null in default)
		});
	}

	return (
		<IngredientAutocomplete
			id={`ingredient-type-${id}`}
			className="flex-3"
			sx={{mr: ingredientSpacing}}
			value={value?.ingredient ?? null}
			onChange={handleOnChange}
		/>
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
						quantity: evalNumberExpression(event.target.value, null) ?? event.target.value
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
	const groups = useRecipeEditorStore( state => state.ingredientGroups )
	const ingredientGroupOrder = useRecipeEditorStore( state => state.ingredientGroupOrder )
	const setIngredientGroupOrder = useRecipeEditorStore( state => state.setIngredientGroupOrder )
	const setIngredientGroupName = useRecipeEditorStore( state => state.setIngredientGroupName )
	const addIngredientGroup = useRecipeEditorStore( state => state.addIngredientGroup )
	const instructionsGroupOptions = useRecipeEditorStore( state => state.instructionGroups )
	const getIngredientGroup = useRecipeEditorStore( state => state.getIngredientGroup )
	const getInstructionGroup = useRecipeEditorStore( state => state.getInstructionGroup )
	const recipe = useRecipeEditorStore( state => state.recipe )

	// Group extraction logic
	const [extractingGroupId, setExtractingGroupId] = useState<number | null>(null)	

	const setInstructionGroupOrder = useRecipeEditorStore((state) => state.setInstructionGroupOrder)
	const subRecipes = useRecipeEditorStore((state) => state.recipe.subRecipes)
	const setSubRecipes = useRecipeEditorStore((state) => state.setSubRecipes)
	const subRecipeProportions = useRecipeEditorStore((state) => state.subRecipeProportions)
	const setSubRecipeProportions = useRecipeEditorStore((state) => state.setSubRecipeProportions)
	const instructionGroupOrder = useRecipeEditorStore((state) => state.instructionGroupOrder)

	const onExtractGroup = (ingredientGroupId: number, instructionGroupId: number | null, proportions: number, portions: number) => {
		const ingredientGroup = getIngredientGroup(ingredientGroupId)
		ingredientGroup.name = null; // remove name (handled by recipe name)

		// scale ingredients with inverse proportions
		if (proportions !== 1) {
			ingredientGroup.ingredients.forEach((ingredient) => {
				if (typeof ingredient.quantity === 'number') {
					ingredient.quantity = ingredient.quantity / proportions
				}
			})
		}

		const instructionGroup = instructionGroupId !== null ? getInstructionGroup(instructionGroupId) : null
		if (instructionGroup) instructionGroup.name = null
		const newRecipe = {
			id: null,
			name: groups[ingredientGroupId] ?? "",
			description: "",
			defaultWeight: recipe.defaultWeight,
			portions: portions,
			portionName: "portioner",
			activeTime: null,
			totalTime: null,
			ingredients: [ ingredientGroup ],
			instructions: [ instructionGroup ].filter(g => g !== null),
			subRecipes: [],
			tags: [],
		} as RecipeBackendType

		addRecipe(newRecipe)
			.then(({ data: recipeData, error }) => {
				if (recipeData) {
					setSubRecipes([...subRecipes, 
					{
						id: recipeData.id,
						name: recipeData.name,
						description: recipeData.description,
						activeTime: recipeData.activeTime,
						totalTime: recipeData.totalTime
					}])
					setSubRecipeProportions([...subRecipeProportions, proportions])
					setIngredientGroupOrder(
						ingredientGroupOrder.filter((id) => id !== ingredientGroupId)
					)
					if (instructionGroupId !== null) {
						setInstructionGroupOrder(
							instructionGroupOrder.filter((id) => id !== instructionGroupId)
						)
					}
					showSuccessAlert(`Skapade recept "${recipeData.name}"`)
				} else {
					showErrorAlert(error ?? 'Misslyckades att extrahera sektion', 10000)
				}
			})
	
		setExtractingGroupId(null)
	}

	return (
		<Box sx={{marginBottom: 5}} >
			{ ingredientGroupOrder.map((groupId : number) => {
				const groupName = groups[groupId] ?? "";
				return (
					<Stack direction="column" spacing={2} style={{marginBottom: 5}} key={groupId}
							sx={{border: '1px solid #ccc', borderRadius: '4px', p: 1}}>
						<GroupEditRow
							groupId={groupId}
							groupName={groupName}
							groupOrder={ingredientGroupOrder}
							setGroupOrder={setIngredientGroupOrder}
							setGroupName={setIngredientGroupName}
							onExtractGroup={(groupId) => {
								setExtractingGroupId(groupId)
							}}
						/>
						
						<SortableList
							onItemsUpdated={(newOrder: number[]) => setIngredientsOrder(groupId, newOrder)}
							items={ingredientsOrder[groupId]}
						>
							<Stack direction="column" spacing={2}>
								{ ingredientsOrder[groupId].map((id : number) => (
									<IngredientEntryInput
										id = { id }
										key = { id }
										groupId = { groupId }
										isLastItem = { ingredientsOrder[groupId].at(-1) == id }
									/>
								))}
							</Stack>
						</SortableList>
					</Stack>
				)
			})}
			<Box sx={{marginTop: 2}}>
				<AddGroupButton onClick={addIngredientGroup} />
			</Box>

			<ExtractGroupDialog
				open={extractingGroupId !== null}
				groupId={extractingGroupId ?? 0}
				groupName={extractingGroupId !== null ? groups[extractingGroupId] ?? "" : ""}
				otherGroupCategoryName="Instruktion"
				otherGroupOptions={instructionsGroupOptions}
				onExtractGroup={onExtractGroup}
				onClose={() => {
					setExtractingGroupId(null)
				}}
			/>
		</Box>

	)
}