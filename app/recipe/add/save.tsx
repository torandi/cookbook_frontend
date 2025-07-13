'use client'

import { useRecipeAddStore } from './state'

import { addRecipe } from '@/app/backend/recipe'

import Button from '@mui/material/Button';

export const SaveButton = () => {
	const getData = useRecipeAddStore( state => state.getAll )
	const saveRecipe = () => {
		const data = getData();
		addRecipe(data);
		// todo: show spinner and result messages
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

