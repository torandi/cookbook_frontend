import { useBackend, postBackend } from './backend'

import { RecipeType } from '@/app/types/recipe'

export function useRecipe(id : number, { portions, allowCups } : { portions?: number, allowCups?: boolean } = {}) {
	const query = new URLSearchParams()

	if (portions !== undefined) {
		query.set('portions', String(portions))
	}

	if (allowCups !== undefined) {
		query.set('allow_cups', String(allowCups))
	}

	const url = query.toString() ? `recipes/${id}?${query.toString()}` : `recipes/${id}`
	const { data, error, isLoading } = useBackend<RecipeType>(url)

	return {
		recipe: data,
		error: error,
		isLoading: isLoading
	}
}

export function addRecipe(recipe : RecipeType ) {
	return postBackend<RecipeType>(`recipes/`, recipe, { includeAuth: true })
}

export function updateRecipe(id: number, recipe: RecipeType) {
	return postBackend<RecipeType>(`recipes/${id}`, recipe, { includeAuth: true, method: 'PUT' })
}


