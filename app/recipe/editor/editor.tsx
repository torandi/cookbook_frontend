'use client'

import { useEffect, useState } from 'react'

import { IngredientsInput } from './ingredients'
import { InstructionsInput } from './instructions'
import { RecipeInfoInput } from './recipeInfo'
import Button from '@mui/material/Button'
import { SaveButton } from './save'
import { RecipeEditorDraft, useRecipeEditorStore } from './state'

import { RecipeType } from '@/app/types/recipe'
import FullCard from '@/app/components/fullcard'

import FormControl from '@mui/material/FormControl'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { useRouter } from 'next/navigation'
import { getRecipeDraftKey, loadRecipeDraft, saveRecipeDraft, clearRecipeDraft } from './draft'

type RecipeEditorPageProps = {
	title: string
	recipeId?: number
	initialRecipe?: RecipeType
}

export default function RecipeEditorPage({ title, recipeId, initialRecipe }: RecipeEditorPageProps) {
	const reset = useRecipeEditorStore((state) => state.reset)
	const setFromRecipe = useRecipeEditorStore((state) => state.setFromRecipe)
	const router = useRouter()
	const draftKey = getRecipeDraftKey(recipeId)
	const [pendingDraft, setPendingDraft] = useState<RecipeEditorDraft | null>(null)
	const [draftDecisionResolved, setDraftDecisionResolved] = useState(false)

	useEffect(() => {
		setDraftDecisionResolved(false)
		setPendingDraft(null)

		const draft = loadRecipeDraft(draftKey)
		if (draft) {
			setPendingDraft(draft)
			return
		}

		if (initialRecipe) {
			setFromRecipe(initialRecipe)
			setDraftDecisionResolved(true)
			return
		}

		reset()
		setDraftDecisionResolved(true)
	}, [draftKey, initialRecipe?.id, reset, setFromRecipe])

	function handleRestoreDraft() {
		if (pendingDraft) {
			useRecipeEditorStore.setState(pendingDraft)
		}
		setPendingDraft(null)
		setDraftDecisionResolved(true)
	}

	function handleDiscardDraft() {
		clearRecipeDraft(recipeId)
		setPendingDraft(null)

		if (initialRecipe) {
			setFromRecipe(initialRecipe)
		} else {
			reset()
		}

		setDraftDecisionResolved(true)
	}

	useEffect(() => {
		if (!draftDecisionResolved) {
			return
		}

		const persistCurrentState = () => {
			const state = useRecipeEditorStore.getState()
			saveRecipeDraft(draftKey, {
				recipe: state.recipe,
				ingredientGroups: state.ingredientGroups,
				ingredients: state.ingredients,
				ingredientGroupOrder: state.ingredientGroupOrder,
				nextIngredientId: state.nextIngredientId,
				nextIngredientGroupId: state.nextIngredientGroupId,
				ingredientsOrder: state.ingredientsOrder,
				instructionGroups: state.instructionGroups,
				instructions: state.instructions,
				instructionGroupOrder: state.instructionGroupOrder,
				nextInstructionId: state.nextInstructionId,
				nextInstructionGroupId: state.nextInstructionGroupId,
				instructionsOrder: state.instructionsOrder,
			})
		}

		persistCurrentState()
		const unsubscribe = useRecipeEditorStore.subscribe(() => {
			persistCurrentState()
		})

		return () => {
			unsubscribe()
		}
	}, [draftDecisionResolved, draftKey])

	return (
		<>
			<Dialog open={pendingDraft !== null} onClose={handleDiscardDraft}>
				<DialogTitle>Aterstalla utkast</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Det finns ett sparat utkast for detta recept. Vill du aterstalla det eller borja fran serverversionen?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDiscardDraft} color="inherit">
						Borja om
					</Button>
					<Button onClick={handleRestoreDraft} variant="contained" autoFocus>
						Aterstall utkast
					</Button>
				</DialogActions>
			</Dialog>

			<FormControl variant="outlined" className="w-full">
				<Stack direction="column" spacing={2}>
					<FullCard className="w-full">
						<Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
							{recipeId !== undefined && (
								<Button
									variant="outlined"
									onClick={() => {
										clearRecipeDraft(recipeId)
										router.push(`/recipe/${recipeId}`)
									}}
								>
									Avbryt
								</Button>
							)}
							<SaveButton recipeId={recipeId} />
						</Stack>
						<Typography variant="h4" component="h1" sx={{ mb: 2 }}>{title}</Typography>
						<RecipeInfoInput />
					</FullCard>
					<Stack direction="row" spacing={2}>
						<FullCard className="w-1/2">
							<Typography variant="h5" component="h1" sx={{ mb: 2 }}>Ingredienser</Typography>
							<IngredientsInput />
						</FullCard>

						<FullCard className="w-1/2">
							<InstructionsInput />
						</FullCard>
					</Stack>
				</Stack>
			</FormControl>
		</>
	)
}
