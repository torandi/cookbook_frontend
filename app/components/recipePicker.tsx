'use client'

import { useState } from 'react'

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

import { useRecipes } from '@/app/backend/recipe'
import { RecipeSummaryType } from '@/app/types/recipe'

type RecipePickerProps = {
	onSelect: (recipe: RecipeSummaryType | null) => void
	currentRecipe: RecipeSummaryType | null
	sx?: React.CSSProperties
}

export function RecipePicker({
	onSelect,
	currentRecipe,
	sx
}: RecipePickerProps) {
	const [search, setSearch] = useState('')
	const { recipes, isLoading } = useRecipes()

	const [recipeOpen, setRecipeOpen] = useState(false)

	const filtered = recipes.filter((r) =>
		r.name.toLowerCase().includes(search.toLowerCase())
	)

	const onClose = () => {
		setRecipeOpen(false)
	}

	function handleSelect(recipe: RecipeSummaryType) {
		onSelect(recipe)
		setSearch('')
		onClose()
	}

	return (
		<>
			<Chip
				label={currentRecipe?.name ?? 'Lägg till recept'}
				size="small"
				icon={<RestaurantMenuRoundedIcon fontSize="small" />}
				variant={currentRecipe ? 'filled' : 'outlined'}
				onClick={() => setRecipeOpen(true)}
				onDelete={currentRecipe ? () => onSelect(null) : undefined}
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
								<ListItemText
									primary={recipe.name}
									secondary={recipe.description}
								/>
							</ListItemButton>
						))}
					</List>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>Avbryt</Button>
				</DialogActions>
			</Dialog>
		</>
	)
}

export function RecipeMultiPicker({
	setRecipies,
	recipes,
	sx
}: {
	setRecipies: (recipes: RecipeSummaryType[]) => void
	recipes: RecipeSummaryType[]
	sx?: React.CSSProperties
}) {


	return (
		<Stack direction="row" sx={{ ...sx }}>
			{recipes.map((recipe, index) => (
				<RecipePicker
					key={index}
					currentRecipe={recipe}
					onSelect={(selectedRecipe) => {
						const tmpRecipes : (RecipeSummaryType | null)[] = [...recipes]
						tmpRecipes[index] = selectedRecipe
						setRecipies(tmpRecipes.filter((r) => r !== null))
					}}
				/>
			))}
			{ /* And one extra to add new recipies */ }
			<RecipePicker
				key="add-recipe"
				currentRecipe={null}
				onSelect={(selectedRecipe) => {
					if (selectedRecipe === null) return
					setRecipies([...recipes, selectedRecipe])
				}}
			/>
		</Stack>
	)
}