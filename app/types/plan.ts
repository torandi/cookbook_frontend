import { DbObject } from './dbobject'
import { RecipeType } from './recipe'

export interface MealType extends DbObject {
	name: string
	recipe: RecipeType | null
	portions: number
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
