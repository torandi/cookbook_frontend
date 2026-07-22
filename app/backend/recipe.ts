import { useBackend, postBackend } from './backend'

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
	return postBackend<RecipeType>(`recipes/`, recipe, { includeAuth: true })
}


