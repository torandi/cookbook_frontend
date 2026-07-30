import { useBackend, postBackend } from './backend'

import { RecipeType, RecipeSummaryType, RecipeBackendType } from '@/app/types/recipe'

export function useRecipes() {
	const { data, error, isLoading } = useBackend<RecipeSummaryType[]>('recipes/')
	return { recipes: data ?? [], error, isLoading }
}

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

export function useRecipeSummary(id: number) {
	const { data, error, isLoading } = useBackend<RecipeSummaryType>(`recipes/${id}/summary`)
	return { recipe: data, error, isLoading }
}

export function addRecipe(recipe : RecipeBackendType ) {
	return postBackend<RecipeType>(`recipes/`, recipe, { includeAuth: true })
}

export function updateRecipe(id: number, recipe: RecipeBackendType) {
	return postBackend<RecipeType>(`recipes/${id}`, recipe, { includeAuth: true, method: 'PUT' })
}


