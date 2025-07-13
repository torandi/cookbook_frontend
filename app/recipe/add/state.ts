import { create, StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {} from '@redux-devtools/extension' // required for devtools typing

import { omit } from '@/app/utils'

export interface IngredientInputEntry {
	ingredientType: IngredientType | null
	quantity: string | null
	comment: string
	unit: VolumeType | "g" | "st" | null
}

export const defaultIngredientEntry : IngredientInputEntry = {
	ingredientType: null,
	quantity: null,
	comment: '',
	unit: null,
}

// State slices

interface IngredientsSlice {
	ingredients : { [number]: IngredientInputEntry | null }
	nextIngredientId: number
	ingredientsOrder: number[]
	addIngredient: () => void
	removeIngredient: (id: number) => void
	setIngredient: (id: number, value: IngredientInputEntry ) => void,
	setIngredientsOrder: (newOrder: number[]) => void,
}

interface ReadSlice {
	getAll: () => { ingredients: { [number] : IngredientInputEntry } },
}

const createIngredientsSlice : StateCreator<
	IngredientsSlice & ReadSlice,
	[["zustand/devtools", never]],
	[],
	IngredientsSlice
	> = (set) => ({
		ingredients: { 0: null },
		nextIngredientId: 1,
		ingredientsOrder: [0],
		addIngredient: () => set((state) => ({
			nextIngredientId: state.nextIngredientId + 1,
			ingredientsOrder: state.ingredientsOrder.concat(state.nextIngredientId),
			ingredients: {
				...state.ingredients,
				[state.nextIngredientId]: null,
			}
		})),
		removeIngredient: (id) => set((state) => {
			return {
				ingredientsOrder: state.ingredientsOrder.filter(x => x != id),
				ingredients: omit<number, IngredientsInputEntry | null>(state.ingredients, id)
			}
		}),
		setIngredient: (id, value) => set((state) => ({
			ingredients: {
				...state.ingredients,
				[id]: value
			}
		})),
		setIngredientsOrder: (newOrder) => set((state) => ({
			ingredientsOrder: newOrder,
		})),
	})

const createReadSlice : StateCreator<
	IngredientsSlice & ReadSlice,
	[["zustand/devtools", never]],
	[],
	ReadSlice
	> = (set, get) => ({
		getAll: () => ({
			ingredients: get().ingredientsOrder
				.map(id => get().ingredients[id])
				.filter(i => i != null)
		})
	})

export const useRecipeAddStore = create<IngredientsSlice & ReadSlice>()((...a) => ({
	...createIngredientsSlice(...a),
	...createReadSlice(...a),
}))
