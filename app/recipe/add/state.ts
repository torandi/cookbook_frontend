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
	setIngredient: (id: number, value: IngredientInputEntry | null ) => void,
	setIngredientsOrder: (newOrder: number[]) => void,
}

interface InstructionsSlice {
	instructions: { [number] : string },
	nextInstructionId: number,
	instructionsOrder: [number],
	addInstruction: () => void
	removeInstruction: (id: number) => void
	insertInstruction: (index: number) => void,
	setInstruction: (id: number, value: string ) => void,
	setInstructionsOrder: (newOrder: number[]) => void,
	trimInstructions: () => void,
}

interface ReadSlice {
	getAll: () => { ingredients: { [number] : IngredientInputEntry } },
}

const createIngredientsSlice : StateCreator<
	IngredientsSlice & IngredientSlice & ReadSlice,
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

const createInstructionsSlice : StateCreator<
	InstructionsSlice & IngredientSlice & ReadSlice,
	[["zustand/devtools", never]],
	[],
	InstructionsSlice
	> = (set, get) => ({
		instructions: { 0: "" },
		nextInstructionId: 1,
		instructionsOrder: [0],
		addInstruction: () => set((state) => ({
			nextInstructionId: state.nextInstructionId + 1,
			instructionsOrder: state.instructionsOrder.concat(state.nextInstructionId),
			instructions: {
				...state.instructions,
				[state.nextInstructionId]: "",
			}
		})),
		removeInstruction: (id) => set((state) => {
			return {
				instructionsOrder: state.instructionsOrder.filter(x => x != id),
				instructions: omit<number, string | null>(state.instructions, id)
			}
		}),
		insertInstruction: (index) => set((state) => ({
			nextInstructionId: state.nextInstructionId + 1,
			instructionsOrder: state.instructionsOrder.toSliced(index, 0, state.nextInstructionId),
			instructions: {
				...state.instructions,
				[state.nextInstructionId]: "",
			}
		})),
		setInstruction: (id, value) => set((state) => ({
			instructions: {
				...state.instructions,
				[id]: value
			}
		})),
		setInstructionsOrder: (newOrder) => set((state) => ({
			instructionsOrder: newOrder,
		})),
		trimInstructions: () => {
			const order = get().instructionsOrder;
			const values = get().instructions;
			if (order.length > 1
						&& values[order.at(-1)].trim() == ""
						&& values[order.at(-2)].trim() == "") {
				get().removeInstruction(order.at(-1));
			}
		},
	})

const createReadSlice : StateCreator<
	IngredientsSlice & IngredientSlice & ReadSlice,
	[["zustand/devtools", never]],
	[],
	ReadSlice
	> = (set, get) => ({
		getAll: () => ({
			ingredients: get().ingredientsOrder
				.map(id => get().ingredients[id])
				.filter(i => i != null),
			instructions: get().instructionsOrder
				.map(id => get().instructions[id].trim())
				.filter(i => i != "")
		})
	})

export const useRecipeAddStore = create<IngredientsSlice & IngredientSlice & ReadSlice>()((...a) => ({
	...createIngredientsSlice(...a),
	...createInstructionsSlice(...a),
	...createReadSlice(...a),
}))
