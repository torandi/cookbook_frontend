import { RecipeIngredientType } from '@/app/types/ingredient'
import { TagType } from '@/app/types/tag'

import { InstructionGroupType, IngredientGroupType, RecipeBackendType, RecipeSummaryType, RecipeType } from '@/app/types/recipe'

import { create, StateCreator } from 'zustand'

import { omit } from '@/app/utils'

export const defaultIngredientEntry : RecipeIngredientType = {
	id: null,
	ingredient: null,
	quantity: null,
	comment: null,
	unit: null,
	optional: false,
}

const defaultRecipeState: RecipeType = {
	id: null,
	name: '',
	description: '',
	portions: 4,
	defaultWeight: false,
	portionName: 'portioner',
	totalTime: null,
	activeTime: null,
	ingredients: [],
	instructions: [],
	subRecipes: [],
	tags: [],
}

const createDefaultEditorState = () => ({
	recipe: {
		...defaultRecipeState,
	},
	subRecipeProportions: [] as number[],
	ingredientGroups: { 0: null } as { [id: number]: string | null }, // name for each group
	ingredients: { 0: null } as { [id: number]: RecipeIngredientType | null },
	ingredientGroupOrder: [0],
	nextIngredientId: 1,
	nextIngredientGroupId: 1,
	ingredientsOrder: {0 : [0]} as { [groupId: number]: number[] }, // array of ingredient ids for each group

	instructionGroups: { 0: null } as { [id: number]: string | null }, // name for each group
	instructions: { 0: '' } as { [id: number]: string },
	instructionGroupOrder: [0],
	nextInstructionId: 1,
	nextInstructionGroupId: 1,
	instructionsOrder: { 0: [0] } as { [groupId: number]: number[] }, // array of instruction ids for each group
})

export type RecipeEditorDraft = ReturnType<typeof createDefaultEditorState>

// State slices

interface IngredientsSlice {
	ingredientGroups: { [id: number]: string | null }
	ingredients : { [id: number]: RecipeIngredientType | null }
	nextIngredientId: number
	nextIngredientGroupId: number
	ingredientsOrder: { [groupId: number]: number[] }
	ingredientGroupOrder: number[]
	addIngredient: (groupId: number) => void
	removeIngredient: (id: number, groupId: number) => void
	setIngredient: (id: number, value: RecipeIngredientType | null ) => void,
	setIngredientsOrder: (groupId: number, newOrder: number[]) => void,

	addIngredientGroup: () => void
	removeIngredientGroup: (groupId: number) => void
	setIngredientGroupName: (groupId: number, name: string | null) => void
	moveIngredientGroup: (ingredientId: number, fromGroup: number, toGroup: number) => void
	setIngredientGroupOrder: (newOrder: number[]) => void
}

interface InstructionsSlice {
	instructionGroups: { [id: number]: string | null }
	instructions: { [id: number]: string }
	nextInstructionId: number
	nextInstructionGroupId: number
	instructionsOrder: { [groupId: number]: number[] }
	instructionGroupOrder: number[]

	addInstruction: (groupId: number) => void
	removeInstruction: (id: number, groupId: number) => void
	insertInstruction: (index: number, groupId: number) => void
	setInstruction: (id: number, value: string ) => void
	setInstructionsOrder: (groupId: number, newOrder: number[]) => void
	setInstructionGroupName: (groupId: number, name: string | null) => void
	moveInstructionGroup: (instructionId: number, fromGroup: number, toGroup: number) => void
	addInstructionGroup: () => void
	removeInstructionGroup: (groupId: number) => void
	setInstructionGroupOrder: (newOrder: number[]) => void

	trimInstructions: (groupId: number) => void
}

interface RecipeSlice {
	recipe: RecipeType // ignoring instruction/ingredients fields
	subRecipeProportions: number[] // indexed by subRecipes index
	setName: (title: string) => void
	setDescription: (description: string) => void
	setPortions: (count: number | null) => void
	setPortionName: (name : string) => void
	setDefaultWeight: (value : boolean) => void
	setActiveTime: (time : number | null) => void
	setTotalTime: (time : number | null) => void
	setSubRecipes: (subRecipes: RecipeSummaryType[]) => void
	setSubRecipeProportions: (proportions: number[]) => void
	setTags: (tags: TagType[]) => void
}

interface ReadSlice {
	getForBackend: () => RecipeBackendType
	getIngredientGroup: (groupId: number) => IngredientGroupType
	getInstructionGroup: (groupId: number) => InstructionGroupType
}

interface InitSlice {
	reset: () => void
	setFromRecipe: (recipe: RecipeType) => void
}

type RecipeEditorStore = RecipeSlice & IngredientsSlice & InstructionsSlice & ReadSlice & InitSlice

const createIngredientsSlice : StateCreator<
	RecipeEditorStore,
	[],
	[],
	IngredientsSlice
	> = (set) => ({
		ingredientGroups: { 0: null },
		ingredients: { 0: null },
		nextIngredientId: 1,
		nextIngredientGroupId: 1,
		ingredientsOrder: {0: [0]},
		ingredientGroupOrder: [0],
		addIngredient: (groupId) => set((state : any) => ({
			nextIngredientId: state.nextIngredientId + 1,
			ingredientsOrder: {
				...state.ingredientsOrder,
				[groupId]: state.ingredientsOrder[groupId].concat(state.nextIngredientId),
			},
			ingredients: {
				...state.ingredients,
				[state.nextIngredientId]: null,
			}
		})),
		removeIngredient: (id, groupId) => set((state : any) => ({
			ingredientsOrder: {
				...state.ingredientsOrder,
				[groupId]: state.ingredientsOrder[groupId].filter((x: number) => x != id),
			},
			ingredients: omit<RecipeIngredientType | null>(state.ingredients, id)
		})),
		setIngredient: (id, value) => set((state : any) => ({
			ingredients: {
				...state.ingredients,
				[id]: value
			}
		})),
		setIngredientsOrder: (groupIdx, newOrder) => set((state : any) => ({
			ingredientsOrder: {
				...state.ingredientsOrder,
				[groupIdx]: newOrder,
			},
		})),
		addIngredientGroup: () => set((state : any) => ({
			nextIngredientId: state.nextIngredientId + 1,
			nextIngredientGroupId: state.nextIngredientGroupId + 1,
			ingredientGroups: {
				...state.ingredientGroups,
				[state.nextIngredientGroupId]: null,
			},
			ingredientGroupOrder: state.ingredientGroupOrder.concat(state.nextIngredientGroupId),
			ingredients: {
				...state.ingredients,
				[state.nextIngredientId]: null,
			},
			ingredientsOrder: {
				...state.ingredientsOrder,
				[state.nextIngredientGroupId]: [state.nextIngredientId],
			},
		})),
		removeIngredientGroup: (groupId) => set((state : any) => {
			return {
				ingredientsOrder: omit<number[]>(state.ingredientsOrder, groupId),
				ingredientGroups: omit<string | null>(state.ingredientGroups, groupId),
				ingredientGroupOrder: state.ingredientGroupOrder.filter((id: number) => id != groupId),
			}
		}),
		setIngredientGroupName: (groupId, name) => set((state : any) => ({
			ingredientGroups: {
				...state.ingredientGroups,
				[groupId]: name
			}
		})),
		moveIngredientGroup: (ingredientId, fromGroup, toGroup) => set((state : any) => ({
			ingredientsOrder: {
				...state.ingredientsOrder,
				[fromGroup]: state.ingredientsOrder[fromGroup].filter((id: number) => id !== ingredientId),
				[toGroup]: [
					...state.ingredientsOrder[toGroup],
					ingredientId,
				],
			}
		})),
		setIngredientGroupOrder: (newOrder) => set((state : any) => ({
			ingredientGroupOrder: newOrder,
		})),
	})

const createInstructionsSlice : StateCreator<
	RecipeEditorStore,
	[],
	[],
	InstructionsSlice
	> = (set, get) => ({
		instructionGroups: { 0: null },
		instructions: { 0: "" },
		nextInstructionId: 1,
		nextInstructionGroupId: 1,
		instructionsOrder: { 0: [0] },
		instructionGroupOrder: [0],
		addInstruction: (groupId: number) => set((state) => ({
			nextInstructionId: state.nextInstructionId + 1,
			instructionsOrder: {
				...state.instructionsOrder,
				[groupId]: state.instructionsOrder[groupId].concat(state.nextInstructionId),
			},
			instructions: {
				...state.instructions,
				[state.nextInstructionId]: "",
			}

		})),
		removeInstruction: (id: number, groupId: number) => set((state) => {
			return {
				instructionsOrder: {
					...state.instructionsOrder,
					[groupId]: state.instructionsOrder[groupId].filter(x => x != id),
				},
				instructions: omit<string>(state.instructions, id)
			}
		}),
		insertInstruction: (index, groupId) => set((state) => ({
			nextInstructionId: state.nextInstructionId + 1,
			instructionsOrder: {
				...state.instructionsOrder,
				[groupId]: state.instructionsOrder[groupId].toSpliced(index, 0, state.nextInstructionId),
			},
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
		setInstructionsOrder: (groupId: number, newOrder: number[]) => set((state) => ({
			instructionsOrder: {
				...state.instructionsOrder,
				[groupId]: newOrder,
			},
		})),
		trimInstructions: (groupId: number) => {
			const order = get().instructionsOrder[groupId];
			const values = get().instructions;
			if (order.length > 1
						&& values[order.at(-1) ?? 0].trim() == ""
						&& values[order.at(-2) ?? 0].trim() == "") {
				get().removeInstruction(order.at(-1) ?? 0, groupId);
			}
		},
		addInstructionGroup: () => set((state) => ({
			nextInstructionId: state.nextInstructionId + 1,
			nextInstructionGroupId: state.nextInstructionGroupId + 1,
			instructionGroups: {
				...state.instructionGroups,
				[state.nextInstructionGroupId]: null,
			},
			instructionGroupOrder: state.instructionGroupOrder.concat(state.nextInstructionGroupId),
			instructions: {
				...state.instructions,
				[state.nextInstructionId]: "",
			},
			instructionsOrder: {
				...state.instructionsOrder,
				[state.nextInstructionGroupId]: [state.nextInstructionId],
			},
		})),
		removeInstructionGroup: (groupId) => set((state) => ({
			instructionsOrder: omit<number[]>(state.instructionsOrder, groupId),
			instructionGroups: omit<string | null>(state.instructionGroups, groupId),
			instructionGroupOrder: state.instructionGroupOrder.filter((id) => id != groupId),
		})),
		setInstructionGroupName: (groupId, name) => set((state) => ({
			instructionGroups: {
				...state.instructionGroups,
				[groupId]: name
			}
		})),
		moveInstructionGroup: (instructionId, fromGroup, toGroup) => set((state) => ({
			instructionsOrder: {
				...state.instructionsOrder,
				[fromGroup]: state.instructionsOrder[fromGroup].filter((id) => id !== instructionId),
				[toGroup]: [
					...state.instructionsOrder[toGroup],
					instructionId,
				],
			}
		})),
		setInstructionGroupOrder: (newOrder) => set((state) => ({
			instructionGroupOrder: newOrder,
		})),

	})

const createRecipeSlice : StateCreator<
	RecipeEditorStore,
	[],
	[],
	RecipeSlice
	> = (set) => ({
		recipe: {
			...defaultRecipeState,
		},
		subRecipeProportions: [],
		setName: (name: string) => set( state => ({
			recipe: {
				...state.recipe,
				name: name,
			}
		})),
		setDescription: (description: string) => set( state => ({
			recipe: {
				...state.recipe,
				description,
			}
		})),
		setPortions: (count: number | null) => set( state => ({
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
		setActiveTime: (time : number | null) => set( state => ({
			recipe: {
				...state.recipe,
				activeTime: time,
			}
		})),
		setTotalTime: (time : number | null) => set( state => ({
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
		setSubRecipes: (subRecipes: RecipeSummaryType[]) => set( state => ({
			recipe: {
				...state.recipe,
				subRecipes: subRecipes as RecipeType[],
			}
		})),
		setSubRecipeProportions: (proportions: number[]) => set(state => ({
			subRecipeProportions: proportions,
		})),
		setTags: (tags: TagType[]) => set( state => ({
			recipe: {
				...state.recipe,
				tags,
			}
		})),
	})


const createReadSlice : StateCreator<
	RecipeEditorStore,
	[],
	[],
	ReadSlice
	> = (set, get) => ({
		getIngredientGroup: (groupId) => {
			const ingredientIds = get().ingredientsOrder[groupId];
			return {
				name: get().ingredientGroups[Number(groupId)] ?? '',
				ingredients: ingredientIds.map(id => 
					get().ingredients[id]).filter(i => 
						i != null && i.ingredient != null) as RecipeIngredientType[],
			} as IngredientGroupType
		},
		getInstructionGroup: (groupId) => {
			const instructionIds = get().instructionsOrder[groupId];
			return {
				name: get().instructionGroups[Number(groupId)] ?? '',
				instructions: instructionIds.map(id => get().instructions[id]).filter(i => i != null && i.trim() != '') as string[],
			}
		},
		getForBackend: () => ({
			...get().recipe,
			subRecipes: get().recipe.subRecipes.map((subRecipe, index) => ({
				id: subRecipe.id ?? -1,
				proportions: get().subRecipeProportions[index] ?? 1,
			})),
			ingredients: get().ingredientGroupOrder.map((groupId) => get().getIngredientGroup(groupId)),
			instructions: get().instructionGroupOrder.map((groupId) => get().getInstructionGroup(groupId)),
		})
	})

const createInitSlice : StateCreator<
	RecipeEditorStore,
	[],
	[],
	InitSlice
	> = (set) => ({
		reset: () => {
			set(() => ({ ...createDefaultEditorState() }))
		},
		setFromRecipe: (recipe) => {
			const ingredientEntries = {} as { [id: number] : RecipeIngredientType | null }
			const ingredientGroupEntries = {} as { [id: number] : string | null }
			const ingredientOrder = {} as { [groupId: number]: number[] }
			const ingredientGroupOrder = [] as number[]
			
			let nextIngredientId = 0;
			recipe.ingredients.forEach((group, index) => {
				ingredientGroupEntries[index] = group.name ?? '';
				ingredientGroupOrder.push(index);
				ingredientOrder[index] = [];
				group.ingredients.forEach((ingredient, ingredientIndex) => {
					const id = nextIngredientId++;
					ingredientEntries[id] = {
						...defaultIngredientEntry,
						...ingredient,
						comment: ingredient.comment ?? '',
						optional: ingredient.optional ?? false,
					}
					ingredientOrder[index].push(id);
				})
				// add one empty ingredient at the end of each group
				const id = nextIngredientId++;
				ingredientEntries[id] = null;
				ingredientOrder[index].push(id);
			})

			const instructions = {} as { [id: number]: string }
			const instructionGroupEntries = {} as { [id: number] : string | null }
			const instructionsOrder = {} as { [groupId: number]: number[] }
			const instructionGroupOrder = [] as number[]

			let nextInstructionId = 0;
			recipe.instructions.forEach((group, index) => {
				instructionGroupEntries[index] = group.name ?? '';
				instructionsOrder[index] = [];
				instructionGroupOrder.push(index);
				group.instructions.forEach((instruction, instructionIndex) => {
					const id = nextInstructionId++;
					instructions[id] = instruction;
					instructionsOrder[index].push(id);
				})
				// add one empty instruction at the end of each group
				const id = nextInstructionId++;
				instructions[id] = '';
				instructionsOrder[index].push(id);
			})

			set(() => ({
				recipe: {
					...defaultRecipeState,
					...recipe,
					ingredients: [],
					instructions: [],
				},
				ingredientGroups: ingredientGroupEntries,
				ingredients: ingredientEntries,
				ingredientGroupOrder,
				nextIngredientId,
				nextIngredientGroupId: recipe.ingredients.length,
				ingredientsOrder: ingredientOrder,
				instructions,
				instructionsOrder,
				instructionGroups: instructionGroupEntries,
				instructionGroupOrder,
				nextInstructionGroupId: recipe.instructions.length,
				nextInstructionId,
			}))
		},
	})

export const useRecipeEditorStore = create<
	RecipeEditorStore
>()((...a) => ({
	...createRecipeSlice(...a),
	...createIngredientsSlice(...a),
	...createInstructionsSlice(...a),
	...createReadSlice(...a),
	...createInitSlice(...a),
}))
