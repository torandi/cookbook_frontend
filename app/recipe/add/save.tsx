'use client'

import { useRecipeAddStore } from './state'
import { showSuccessAlert, showErrorAlert } from '@/app/ui/alert-state'
import { addRecipe } from '@/app/backend/recipe'

import Button from '@mui/material/Button';
import { redirect } from 'next/navigation'

export const SaveButton = () => {
	const getData = useRecipeAddStore( state => state.getAll )
	const saveRecipe = async () => {
		const data = getData();
		const { data: recipeData, error } = await addRecipe(data);
		if (recipeData) {
			showSuccessAlert('Recept sparat')
			redirect(`/recipe/${recipeData.id}`)
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

