'use client'

import { useRecipeAddStore } from './state'
import { showSuccessAlert, showErrorAlert } from '@/app/ui/alert-state'
import { addRecipe } from '@/app/backend/recipe'

import Button from '@mui/material/Button';
import { useRouter } from 'next/dist/client/components/navigation';

export const SaveButton = () => {
	const router = useRouter()
	const getData = useRecipeAddStore( state => state.getAll )
	const saveRecipe = () => {
		const data = getData();
		addRecipe(data).then( ({ data, error }) => {
			if (data) {
				showSuccessAlert('Recept sparat')
				router.replace(`/recipe/${data.id}`)
			} else {
				showErrorAlert(error ?? 'Misslyckades att spara recept', 10000)
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

