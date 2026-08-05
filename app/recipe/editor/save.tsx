'use client'

import { useRecipeEditorStore } from './state'
import { showSuccessAlert, showErrorAlert } from '@/app/ui/alert-state'
import { addRecipe, updateRecipe } from '@/app/backend/recipe'
import { formatFastApiRecipeValidationError } from '@/app/backend/validation'

import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation'
import { clearRecipeDraft } from './draft';

export const SaveButton = ({ recipeId }: { recipeId?: number }) => {
	const router = useRouter()
	const getData = useRecipeEditorStore( state => state.getForBackend )
	const resetState = useRecipeEditorStore((state) => state.reset)


	const saveRecipe = async () => {
		const data = getData();
		const { data: recipeData, error, errorDetail } = recipeId != undefined
			? await updateRecipe(recipeId, data)
			: await addRecipe(data);

		if (recipeData) {
			clearRecipeDraft(recipeId)
			resetState()
			showSuccessAlert(recipeId != undefined ? 'Recept uppdaterat' : 'Recept sparat')

			router.push(`/recipe/${recipeData.id}`)
		} else {
			const validationError = formatFastApiRecipeValidationError(errorDetail ?? error)
			showErrorAlert(validationError ?? error ?? 'Misslyckades att spara recept', 10000)
		}
	}

	return (
			<Button
				className="float-right"
				variant="contained"
				onClick={saveRecipe}
			>
				Spara
			</Button>
	)
}

