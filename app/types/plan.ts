import { DbObject } from './dbobject'
import { IngredientType, VolumeType } from './ingredient'
import { RecipeSummaryType } from './recipe'

export interface MealExtraIngredientType {
	ingredient: IngredientType
	quantity: number
	unit: VolumeType | 'g' | 'st'
}

export interface MealType extends DbObject {
	name: string
	recipe: RecipeSummaryType | null
	portions: number
	comment: string | null
	extraIngredients?: MealExtraIngredientType[]
}

export interface PlanDayType extends DbObject {
	date: string // YYYY-MM-DD
	meals: MealType[]
}

export interface PlanType extends DbObject {
	name: string
	days: PlanDayType[]
}

export interface ShoppingListItemType {
	ingredientName: string
	quantity: number | null
	unit: string | null
	extra: boolean
	comment: string | null
}

export interface ShoppingListType {
	items: ShoppingListItemType[]
}