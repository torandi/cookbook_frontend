'use client'

import { useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import InputAdornment from '@mui/material/InputAdornment'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import TextField from '@mui/material/TextField'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded'
import { FormControl } from '@mui/material'

import { useRecipes } from '@/app/backend/recipe'
import { RecipeSummaryType } from '@/app/types/recipe'
import { evalNumberExpression, displayFraction } from '@/app/utils'

type RecipePickerProps = {
	onSelect: (recipe: RecipeSummaryType | null, priority: number | null) => void
	currentRecipe: RecipeSummaryType | null
	proportion?: number
	sx?: React.CSSProperties
}

export function RecipePicker({
	onSelect,
	currentRecipe,
	proportion,
	sx
}: RecipePickerProps) {
	const [search, setSearch] = useState('')
	const { recipes, isLoading } = useRecipes()
	const [proportionValue, setProportionValue] = useState<number | string>(proportion ?? 1)

	const getProportionValue = () => {
		if (typeof proportionValue === 'number') return proportionValue
		const parsed = evalNumberExpression(proportionValue, null)
		return parsed ?? 1
	}

	const [recipeOpen, setRecipeOpen] = useState(false)

	const filtered = recipes.filter((r) =>
		r.name.toLowerCase().includes(search.toLowerCase())
	)

	const onClose = () => {
		setRecipeOpen(false)
	}

	function handleSelect(recipe: RecipeSummaryType) {
		onSelect(recipe, getProportionValue())
		setSearch('')
		onClose()
	}
	
	const onSave = () => {
		if (currentRecipe) {
			onSelect(currentRecipe, getProportionValue())
		}
		onClose()
	}
	
	const label = currentRecipe ? ( proportion !== undefined ? `${displayFraction(proportion, "1")} ${currentRecipe.name}` : currentRecipe.name ) : 'Lägg till recept'

	return (
		<>
			<Chip
				label={label}
				size="small"
				icon={<RestaurantMenuRoundedIcon fontSize="small" />}
				variant={currentRecipe ? 'filled' : 'outlined'}
				onClick={() => setRecipeOpen(true)}
				onDelete={currentRecipe ? () => onSelect(null, null) : undefined}
				sx={{ cursor: 'pointer', maxWidth: 260, ...sx }}
			/>
			<Dialog open={recipeOpen} onClose={onClose} fullWidth maxWidth="sm">
				<DialogTitle>Välj recept</DialogTitle>
				<DialogContent sx={{ pb: 0 }}>
					<TextField
						fullWidth
						size="small"
						placeholder="Sök recept..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						sx={{ mb: 1, mt: 0.5 }}
						slotProps={{
							input: {
								startAdornment: (
									<InputAdornment position="start">
										<SearchRoundedIcon fontSize="small" />
									</InputAdornment>
								),
							},
						}}
					/>
					<List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
						{isLoading && (
							<ListItemButton disabled>
								<ListItemText primary="Laddar recept..." />
							</ListItemButton>
						)}
						{!isLoading && filtered.length === 0 && (
							<ListItemButton disabled>
								<ListItemText primary="Inga recept hittades" />
							</ListItemButton>
						)}
						{filtered.map((recipe) => (
							<ListItemButton
								key={recipe.id}
								selected={currentRecipe?.id === recipe.id}
								onClick={() => handleSelect(recipe)}
							>
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%' }}>
									<ListItemText
										primary={recipe.name}
										secondary={recipe.description}
									/>
									{recipe.tags?.length ? (
										<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
											{recipe.tags.map((tag) => (
												<Chip
													key={tag.id}
													label={tag.name}
													size="small"
													sx={{
														backgroundColor: tag.color,
														color: (theme) => theme.palette.getContrastText(tag.color),
													}}
												/>
											))}
										</Box>
									) : null}
								</Box>
							</ListItemButton>
						))}
					</List>
					{ proportion !== undefined && (
						<FormControl variant="outlined" size="small" sx={{ mt: 1, width: 100 }}>
							<TextField
								label="Proportion: "
								value={proportionValue}
								onChange={(event) => {
									setProportionValue(evalNumberExpression(event.target.value, null) ?? event.target.value)
								}}
							/>
						</FormControl>
					)}	
				</DialogContent>
				<DialogActions>
					{ proportion !== undefined && <Button onClick={onSave}>Spara</Button> }
					<Button onClick={onClose}>Avbryt</Button>
				</DialogActions>
			</Dialog>
		</>
	)
}

export function RecipeMultiPicker({
	setRecipies,
	recipes,
	sx,
	setProportions,
	proportions
}: {
	setRecipies: (recipes: RecipeSummaryType[]) => void
	recipes: RecipeSummaryType[]
	sx?: React.CSSProperties
	proportions?: number[]
	setProportions?: (proportions: number[]) => void
}) {
	const showProportions = proportions !== undefined && setProportions !== undefined

	return (
		<Stack direction="row" sx={{ ...sx }}>
			{recipes.map((recipe, index) => (
				<RecipePicker
					key={index}
					currentRecipe={recipe}
					proportion={showProportions ? proportions[index] : undefined}
					onSelect={(selectedRecipe: RecipeSummaryType | null, priority: number | null) => {
						const tmpRecipes : (RecipeSummaryType | null)[] = [...recipes]
						tmpRecipes[index] = selectedRecipe
						setRecipies(tmpRecipes.filter((r) => r !== null))
						if (showProportions) {
							const tmpProportions : (number | null)[] = [...(proportions ?? [])]
							tmpProportions[index] = priority
							setProportions!(tmpProportions.filter(r => r !== null))
						}
					}}
				/>
			))}
			{ /* And one extra to add new recipies */ }
			<RecipePicker
				key="add-recipe"
				currentRecipe={null}
				proportion={showProportions ? 1 : undefined}
				onSelect={(selectedRecipe: RecipeSummaryType | null, priority: number | null) => {
					if (selectedRecipe === null) return
					setRecipies([...recipes, selectedRecipe])
					if (showProportions && priority !== null) {
						setProportions!([...proportions, priority])
					}
				}}
			/>
		</Stack>
	)
}