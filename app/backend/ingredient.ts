'use client'

import { IngredientType } from '@/app/types/ingredient';

import { useBackend, postBackend } from './backend'

export function useIngredient(id : number) {
	const { data, error, isLoading } = useBackend<IngredientType>( `ingredients/${id}` );

	return { 
		ingredient: data,
		isLoading,
		error: error
	};
}

export function useIngredients() {
	const { data, error, isLoading } = useBackend<IngredientType[]>( `ingredients` );
	return {
		ingredients: data,
		isLoading,
		error: error
	}
}

export async function addIngredient(ingredient : IngredientType) {
	return postBackend<IngredientType>(`ingredients/`, ingredient, { includeAuth: true })
}

export async function updateIngredient(id: number, ingredient: IngredientType) {
	return postBackend<IngredientType>(`ingredients/${id}`, ingredient, { includeAuth: true, method: 'PUT' })
}

export async function deleteIngredient(id: number) {
	return postBackend<null>(`ingredients/${id}`, null, { includeAuth: true, method: 'DELETE' })
}

// https://wellobe.aftonbladet.se/inspiration/kost/EW64qK/vad-vager-1-dl-av

