import { useBackend } from './backend'

import { RecipeType } from '@/app/types/recipe'

export function useRecipe(id : number) {
	const { data, error, isLoading } = useBackend<RecipeType>( `recipes/${id}` );

	return {
		recipe: data,
		error: error,
		isLoading: isLoading
	}
}

export function addRecipe(recipe : RecipeType ) {
	// todo: convert to backend call
	console.log(recipe);
}


