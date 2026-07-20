import { useBackend } from './backend'

import { RecipeType } from '@/app/types/recipe'

// note: this should not be used in final version, backend should
// composite the recipe data for us
import { useIngredient } from '@/app/backend/ingredient'

export function useRecipe(id : number) {
	const item = recipes.find(i => i.id == id);

	// conform to useBackend api
	return {
		recipe: item,
		error: item === undefined ? `Ogiltlig recept-id ${id}` : undefined,
		isLoading: false
	}
}

// temp hack, mocking backend data
/*
const recipes : RecipeType[] = [
{
	id: 0,
	name: "Nanbröd",
	defaultWeight: true,
	inWeightUnits: true,
	portions: 6,
	portionName: "bröd",
	ingredients: [{
		ingredientType: useIngredient(0).ingredient,
		quantity: 350,
		unit: "g",
		optional: false,
	},
	{
		ingredientType: useIngredient(1).ingredient,
		quantity: 150,
		unit: "g",
		optional: false,
	},
	{
		ingredientType: useIngredient(2).ingredient,
		quantity: 30,
		unit: "g",
		optional: false,
	},
	{
		ingredientType: useIngredient(3).ingredient,
		quantity: 125,
		comment: "rumstemperatur",
		unit: "g",
		optional: false,
	},
	{
		ingredientType: useIngredient(4).ingredient,
		quantity: 25,
		unit: "g",
		comment: "smält",
		optional: false,
	},
	{
		ingredientType: useIngredient(5).ingredient,
		quantity: 1,
		unit: "st",
		comment: "riven",
		optional: false,
	},
	{
		ingredientType: useIngredient(6).ingredient,
		quantity: 2,
		unit: "tsp",
		optional: false,
	},
	{
		ingredientType: useIngredient(7).ingredient,
		quantity: 1,
		unit: "tsp",
		optional: false,
	},
	{
		ingredientType: useIngredient(8).ingredient,
		quantity: 0.5,
		unit: "tsp",
		optional: false,
	},
	{
		ingredientType: useIngredient(8).ingredient,
		quantity: null,
		unit: null,
		comment: "till pensling",
		optional: false,
	},
	{
		ingredientType: useIngredient(5).ingredient,
		quantity: 1,
		unit: "st",
		comment: "till smöret för pensling",
		optional: true,
	},
	],
	instructions: [
		"Blanda samtliga ingredienser i hushållsassistent.",
		"Knåda i maskin på låg fart i ca 10 minuter.",
		"Låt vila i en timme.",
		"Dela degen i {portions} lika delar, och forma i bollar.", // todo: support templating, maybe in backend?
		"Kavla ut bollarna till ca 15cm i diameter, och låt vila en kort stund.",
		"Stek på hög temperatur utan olja, ca 3-4 minuter per sida",
		"Pensla på smält smör. Kan tillsätta hackad vitlök till det smälta smöret för vitlöks-nan"
	]
},
]*/

export function addRecipe(recipe : RecipeType ) {
	// todo: convert to backend call
	console.log(recipe);
}


