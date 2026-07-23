'use client'

import { useRecipeEditorStore } from './state'
import { showSuccessAlert, showErrorAlert } from '@/app/ui/alert-state'
import { addRecipe, updateRecipe } from '@/app/backend/recipe'

import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation'

export const SaveButton = ({ recipeId }: { recipeId?: number }) => {
	const router = useRouter()
	const getData = useRecipeEditorStore( state => state.getAll )

	const saveRecipe = async () => {
		const data = getData();
		const { data: recipeData, error } = recipeId != undefined
			? await updateRecipe(recipeId, data)
			: await addRecipe(data);

		if (recipeData) {
			showSuccessAlert(recipeId != undefined ? 'Recept uppdaterat' : 'Recept sparat')
			router.push(`/recipe/${recipeData.id}`)
		} else {
			showErrorAlert(error ?? 'Misslyckades att spara recept', 10000)
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

