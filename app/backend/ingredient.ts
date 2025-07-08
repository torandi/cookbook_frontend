import { IngredientType } from '@/app/types/ingredient';
import { containsIgnoreCase } from '@/app/utils';

// temp hack to have some data to test with
const ingredients : IngredientType[] = [{
	id: 0,
	name: "Mjöl",
	unit: "volume",
	defaultVolumeType: "dl",
	weightPerUnit: 0.6
},
{
	id: 1,
	name: "Yoghurt (fet)",
	unit: "volume",
	defaultVolumeType: "dl",
	weightPerUnit: 1
},
{
	id: 2,
	name: "Jäst (färsk)",
	unit: "weight"
},
{
	id: 3,
	name: "Vatten",
	unit: "volume",
	defaultVolumeType: "dl",
	weightPerUnit: 1
},
{
	id: 4,
	name: "Smör",
	unit: "weight"
},
{
	id: 5,
	name: "Vitlök",
	unit: "count"
},
{
	id: 6,
	name: "Strösocker",
	unit: "volume",
	defaultVolumeType: "dl",
	weightPerUnit: 0.9
},
{
	id: 7,
	name: "Salt",
	unit: "volume",
	defaultVolumeType: "tsk",
	weightPerUnit: 1.2
},
{
	id: 8,
	name: "Bakpulver",
	unit: "volume",
	defaultVolumeType: "tsk",
	weightPerUnit: 0.6
},
{
	id: 9,
	name: "Rödlök",
	unit: "count",
	weightPerUnit: 60
}
]

// https://wellobe.aftonbladet.se/inspiration/kost/EW64qK/vad-vager-1-dl-av

function useIngredient(id : number) {
	const ingr = ingredients.find(i => i.id == id);

	// conform to useBackend api
	return {
		ingredient: ingr,
		error: ingr === undefined ? `Ogiltlig ingrediens-id ${id}` : undefined,
		isLoading: false
	}
}

function useIngredients() {
	// conform to useBackend api
	return {
		ingredients,
		error: undefined,
		isLoading: false
	}
}

async function addIngredient(ingredient : IngredientType) {
	// todo: post to backend
	ingredient.id = ingredients.at(-1).id + 1;
	ingredients.push(ingredient);
	return ingredient;
}

function searchIngredient(name : string) {
	return {
		ingredients: ingredients.filter(i => containsIgnoreCase(i.name, name)),
		error: undefined,
		isLoading: false
	}
}

export { useIngredient, useIngredients, searchIngredient, addIngredient }
