import { RecipeIngredientType } from '@/app/types/ingredient'

import { RecipeType } from '@/app/types/recipe'

import { create, StateCreator } from 'zustand'

import { omit } from '@/app/utils'
import { stat } from 'node:fs'

export const defaultIngredientEntry : RecipeIngredientType = {
	id: null,
	ingredient: null,
	quantity: null,
	comment: '',
	unit: null,
	optional: false,
}

// State slices

interface IngredientsSlice {
	ingredients : { [id: number]: RecipeIngredientType | null }
	nextIngredientId: number
	ingredientsOrder: number[]
	addIngredient: () => void
	removeIngredient: (id: number) => void
	setIngredient: (id: number, value: RecipeIngredientType | null ) => void,
	setIngredientsOrder: (newOrder: number[]) => void,
}

interface InstructionsSlice {
	instructions: { [id: number]: string }
	nextInstructionId: number
	instructionsOrder: number[]
	addInstruction: () => void
	removeInstruction: (id: number) => void
	insertInstruction: (index: number) => void
	setInstruction: (id: number, value: string ) => void
	setInstructionsOrder: (newOrder: number[]) => void
	trimInstructions: () => void
}

interface RecipeSlice {
	recipe: RecipeType // ignoring instruction/ingredients fields
	setName: (title: string) => void
	setPortions: (count: number) => void
	setPortionName: (name : string) => void
	setDefaultWeight: (value : boolean) => void
	setActiveTime: (time : number) => void
	setTotalTime: (time : number) => void
}

interface ReadSlice {
	getAll: () => RecipeType
}

type RecipieAddStore = RecipeSlice & IngredientsSlice & InstructionsSlice & ReadSlice

const createIngredientsSlice : StateCreator<
	RecipieAddStore,
	[],
	[],
	IngredientsSlice
	> = (set) => ({
		ingredients: { 0: null },
		nextIngredientId: 1,
		ingredientsOrder: [0],
		addIngredient: () => set((state : any) => ({
			nextIngredientId: state.nextIngredientId + 1,
			ingredientsOrder: state.ingredientsOrder.concat(state.nextIngredientId),
			ingredients: {
				...state.ingredients,
				[state.nextIngredientId]: null,
			}
		})),
		removeIngredient: (id) => set((state : any) => {
			return {
				ingredientsOrder: state.ingredientsOrder.filter((x : number) => x != id),
				ingredients: omit<RecipeIngredientType | null>(state.ingredients, id)
			}
		}),
		setIngredient: (id, value) => set((state : any) => ({
			ingredients: {
				...state.ingredients,
				[id]: value
			}
		})),
		setIngredientsOrder: (newOrder) => set((state : any) => ({
			ingredientsOrder: newOrder,
		})),
	})

const createInstructionsSlice : StateCreator<
	RecipieAddStore,
	[],
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
				instructions: omit<string>(state.instructions, id)
			}
		}),
		insertInstruction: (index) => set((state) => ({
			nextInstructionId: state.nextInstructionId + 1,
			instructionsOrder: state.instructionsOrder.toSpliced(index, 0, state.nextInstructionId),
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
						&& values[order.at(-1) ?? 0].trim() == ""
						&& values[order.at(-2) ?? 0].trim() == "") {
				get().removeInstruction(order.at(-1) ?? 0);
			}
		},
	})

const createRecipeSlice : StateCreator<
	RecipieAddStore,
	[],
	[],
	RecipeSlice
	> = (set) => ({
		recipe: {
			id: null,
			name: "",
			portions: 4,
			defaultWeight: false,
			portionName: "portioner",
			totalTime: null,
			activeTime: null,
			ingredients: [], // not actually used in state
			instructions: [], // not actually used in state
		},
		setName: (name: string) => set( state => ({
			recipe: {
				...state.recipe,
				name: name,
			}
		})),
		setPortions: (count: number) => set( state => ({
			recipe: {
				...state.recipe,
				portions: count,
			}
		})),
		setPortionName: (name: string) => set( state => ({
			recipe: {
				...state.recipe,
				portionName: name,
			}
		})),
		setActiveTime: (time : number) => set( state => ({
			recipe: {
				...state.recipe,
				activeTime: time,
			}
		})),
		setTotalTime: (time : number) => set( state => ({
			recipe: {
				...state.recipe,
				totalTime: time,
			}
		})),
		setDefaultWeight: (value : boolean) => set( state => ({
			recipe: {
				...state.recipe,
				defaultWeight: value,
			}
		})),
	})


const createReadSlice : StateCreator<
	RecipieAddStore,
	[],
	[],
	ReadSlice
	> = (set, get) => ({
		getAll: () => ({
			...get().recipe,
			ingredients: get().ingredientsOrder
				.map(id => get().ingredients[id])
				.filter(i => i != null),
			instructions: get().instructionsOrder
				.map(id => get().instructions[id].trim())
				.filter(i => i != ""),
		})
	})

export const useRecipeAddStore = create<
	RecipieAddStore
>()((...a) => ({
	...createRecipeSlice(...a),
	...createIngredientsSlice(...a),
	...createInstructionsSlice(...a),
	...createReadSlice(...a),
}))
