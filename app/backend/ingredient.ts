'use client'

import { IngredientType } from '@/app/types/ingredient';

import { useBackend } from './backend'

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
	// todo: post to backend
	//ingredient.id = ingredients.at(-1).id + 1;
	//ingredients.push(ingredient);
	return ingredient;
}

// https://wellobe.aftonbladet.se/inspiration/kost/EW64qK/vad-vager-1-dl-av

