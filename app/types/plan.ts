import { DbObject } from './dbobject'
import { RecipeSummaryType } from './recipe'

export interface MealType extends DbObject {
	name: string
	recipe: RecipeSummaryType | null
	portions: number
	comment: string | null
	// todo: extra ingredients
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
	comment: string | null
}
