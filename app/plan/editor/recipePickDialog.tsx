'use client'

import { useState } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import InputAdornment from '@mui/material/InputAdornment'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import TextField from '@mui/material/TextField'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'

import { useRecipes } from '@/app/backend/recipe'
import { RecipeSummaryType } from '@/app/types/recipe'

type RecipePickDialogProps = {
	open: boolean
	onClose: () => void
	onSelect: (recipe: RecipeSummaryType | null) => void
	currentRecipe: RecipeSummaryType | null
}

export default function RecipePickDialog({
	open,
	onClose,
	onSelect,
	currentRecipe,
}: RecipePickDialogProps) {
	const [search, setSearch] = useState('')
	const { recipes, isLoading } = useRecipes()

	const filtered = recipes.filter((r) =>
		r.name.toLowerCase().includes(search.toLowerCase())
	)

	function handleSelect(recipe: RecipeSummaryType) {
		onSelect(recipe)
		setSearch('')
		onClose()
	}

	function handleClear() {
		onSelect(null)
		setSearch('')
		onClose()
	}

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
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
				{currentRecipe && (
					<Button onClick={handleClear} color="error" sx={{ mr: 'auto' }}>
						Ta bort recept
					</Button>
				)}
				<Button onClick={onClose}>Avbryt</Button>
			</DialogActions>
		</Dialog>
	)
}
