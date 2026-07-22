'use client'

import { useRecipeAddStore } from './state'
import { showSuccessAlert, showErrorAlert } from '@/app/ui/alert-state'
import { addRecipe } from '@/app/backend/recipe'

import Button from '@mui/material/Button';

export const SaveButton = () => {
	const getData = useRecipeAddStore( state => state.getAll )
	const saveRecipe = () => {
		const data = getData();
		addRecipe(data).then( ({ data, error }) => {
			if (data) {
				showSuccessAlert('Recept sparat')
				// todo: redirect to recipe page
			} else {
				showErrorAlert(error ?? 'Misslyckades att spara recept')
			}
		})
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

