'use client'

import { useEffect, useState } from 'react'

import { IngredientsInput } from './ingredients'
import { InstructionsInput } from './instructions'
import { RecipeInfoInput } from './recipeInfo'
import Button from '@mui/material/Button'
import { SaveButton } from './save'
import { RecipeEditorDraft, useRecipeEditorStore } from './state'
import { useUnload } from '@/app/lifetimeHooks'

import { RecipeType } from '@/app/types/recipe'
import FullCard from '@/app/components/fullcard'

import FormControl from '@mui/material/FormControl'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { useRouter } from 'next/navigation'
import { getRecipeDraftKey, loadRecipeDraft, saveRecipeDraft, clearRecipeDraft } from './draft'
import { RecipeIngredientType } from '@/app/types/ingredient'
import { RecipeMultiPicker } from '@/app/components/recipePicker'

type RecipeEditorPageProps = {
	title: string
	recipeId?: number
	initialRecipe?: RecipeType
}

export default function RecipeEditorPage({ title, recipeId, initialRecipe }: RecipeEditorPageProps) {
	const setFromRecipe = useRecipeEditorStore((state) => state.setFromRecipe)
	const router = useRouter()
	const draftKey = getRecipeDraftKey(recipeId)
	const [pendingDraft, setPendingDraft] = useState<RecipeEditorDraft | null>(null)
	const resetState = useRecipeEditorStore((state) => state.reset)
	const subRecipes = useRecipeEditorStore((state) => state.recipe.subRecipes)
	const setSubRecipes = useRecipeEditorStore((state) => state.setSubRecipes)
	const subRecipeProportions = useRecipeEditorStore((state) => state.subRecipeProportions)
	const setSubRecipeProportions = useRecipeEditorStore((state) => state.setSubRecipeProportions)

	const abortEdit = () => {
		clearRecipeDraft(recipeId)
		resetState()
		if (recipeId !== undefined) {
			router.push(`/recipe/${recipeId}`)
		} else {
			router.push('/recipe')
		}
	}
	

	function handleRestoreDraft() {
		const draft = loadRecipeDraft(draftKey) as RecipeEditorDraft | null
		if (draft) {
			useRecipeEditorStore.setState(draft)
		}
		clearRecipeDraft(recipeId)
		setPendingDraft(null)
	}

	function handleDiscardDraft() {
		clearRecipeDraft(recipeId)
		setPendingDraft(null)

		if (initialRecipe) {
			setFromRecipe(initialRecipe)
		} else {
			resetState()
		}
	}

	const saveDraft = () => {
		const state = useRecipeEditorStore.getState()
		if (state.recipe.name.trim() === '' 
			&& Object.entries(state.instructions).filter(([key, instruction]: [string, string]) => instruction.trim() !== '').length === 0
			&& Object.entries(state.ingredients).filter(([key, ingredient]: [string, RecipeIngredientType | null]) => ingredient !== null).length === 0) {
			// don't save if recipe is empty
			return
		}
		saveRecipeDraft(draftKey, state as RecipeEditorDraft)
	}

	// Save draft if tab is closed or page is refreshed
	useUnload((event: BeforeUnloadEvent) => {
		saveDraft()
	})

	useEffect(() => {
		const draft = loadRecipeDraft(draftKey)
		if (draft !== null) {
			setPendingDraft(draft)
		} else if (initialRecipe) {
			setFromRecipe(initialRecipe)
		}
	}, [draftKey, initialRecipe?.id, setFromRecipe])

	return (
		<>
			{pendingDraft !== null && (
			<Dialog open={true} onClose={handleDiscardDraft}>
				<DialogTitle>Återställ utkast?</DialogTitle>
				<DialogContent>
					<DialogContentText>
						{recipeId !== undefined ? 
						`Det finns ett sparat utkast för detta recept. Vill du återställa det?`
						: `Det finns ett sparat utkast för ${pendingDraft.recipe.name}. Vill du återställa det?`
						}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDiscardDraft} color="inherit">
						Ta bort utkast
					</Button>
					<Button onClick={handleRestoreDraft} variant="contained" autoFocus>
						Återställ utkast
					</Button>
				</DialogActions>
			</Dialog>
			)}

			<FormControl variant="outlined" className="w-full">
				<Stack direction="column" spacing={2}>
					<FullCard className="w-full">
						<Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
							<Button
								variant="outlined"
								onClick={abortEdit}
							>
								Avbryt
							</Button>
							<SaveButton recipeId={recipeId} />
						</Stack>
						<Typography variant="h4" component="h1" sx={{ mb: 2 }}>{title}</Typography>
						<RecipeInfoInput />
					</FullCard>
					<FullCard className="w-full">
						<Typography variant="h5" component="h1" sx={{ mb: 2 }}>Subrecept</Typography>
						<Typography variant="body2" color="textSecondary" component="p" sx={{ mb: 2 }}>Subrecept är recept som inkluderas som en del av detta.</Typography>
						<RecipeMultiPicker
							setRecipies={setSubRecipes}
							recipes={subRecipes}
							setProportions={setSubRecipeProportions}
							proportions={subRecipeProportions}
						/>
					</FullCard>
	
					<Box className="flex flex-col lg:flex-row gap-2">
							<FullCard className="w-1/2 md:w-full">
								<Typography variant="h5" component="h1" sx={{ mb: 2 }}>Ingredienser</Typography>
								<IngredientsInput />
							</FullCard>

						<FullCard className="w-1/2 md:w-full">
							<InstructionsInput />
						</FullCard>
					</Box>
				</Stack>
			</FormControl>
		</>
	)
}
