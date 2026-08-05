import { useBackend, postBackend, useUnauthorizedBackend } from './backend'

import { RecipeType, RecipeSummaryType, RecipeBackendType } from '@/app/types/recipe'

export function useRecipes() {
	const { data, error, isLoading } = useBackend<RecipeSummaryType[]>('recipes/')
	return { recipes: data ?? [], error, isLoading }
}

function buildRecipeUrl(portions?: number, allowCups?: boolean) {
	const query = new URLSearchParams()

	if (portions !== undefined) {
		query.set('portions', String(portions))
	}

	if (allowCups !== undefined) {
		query.set('allow_cups', String(allowCups))
	}

	return query.toString()
}

export function useRecipe(id : number, { portions, allowCups } : { portions?: number, allowCups?: boolean } = {}) {
	const queryUrl = buildRecipeUrl(portions, allowCups)

	const url = queryUrl ? `recipes/${id}?${queryUrl}` : `recipes/${id}`
	const { data, error, isLoading } = useBackend<RecipeType>(url)

	return {
		recipe: data,
		error: error,
		isLoading: isLoading
	}
}

export function usePublicRecipe({recipeId, key, portions, allowCups }:
	{
		recipeId: number,
		key: string,
		portions?: number,
		allowCups?: boolean
	}) {
	const queryUrl = buildRecipeUrl(portions, allowCups)
	const url = queryUrl ? `recipes/public/${recipeId}?key=${key}&${queryUrl}` : `recipes/public/${recipeId}?key=${key}`

	const { data, error, isLoading } = useUnauthorizedBackend<RecipeType>(url)
	return {
		recipe: data,
		error,
		isLoading
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

export async function generateShareKey(recipeId: number) {
	return postBackend<{ key: string }>(`recipes/${recipeId}/share`, {}, { includeAuth: true })
}

export async function deleteShareKey(recipeId: number) {
	return postBackend<null>(`recipes/${recipeId}/share`, null, { includeAuth: true, method: 'DELETE' })
}
