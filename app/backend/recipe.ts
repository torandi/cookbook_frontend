import { useBackend, postBackend } from './backend'

import { DbObject } from '@/app/types/dbobject'
import { RecipeType } from '@/app/types/recipe'

type RecipeIngredientType = {
	id: number
	quantity: number | null
	unit: string | null
	weight: number | null
	comment?: string | null
	optional: boolean
	ingredient: {
		id: number
		name: string
		unit: string
		defaultVolumeInputType: string | null
		weightPerUnit: number | null
	}
}

type RecipeInstructionType = {
	id: number
	stepNumber: number
	description: string
}

export type RecipeDetailType = DbObject & {
	name: string
	portions: number
	portionName: string
	totalTime: string | null
	activeTime: string | null
	ingredients: RecipeIngredientType[]
	instructions: RecipeInstructionType[]
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
	const { data, error, isLoading } = useBackend<RecipeDetailType>(url)

	return {
		recipe: data,
		error: error,
		isLoading: isLoading
	}
}

export function addRecipe(recipe : RecipeType ) {
	return postBackend<RecipeType>(`recipes/`, recipe, { includeAuth: true })
}


