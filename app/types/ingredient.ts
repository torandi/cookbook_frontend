import { DbObject } from '@/app/types/dbobject';

export type UnitType = "count" | "volume" | "weight";
export const volumeTypes = ["ml", "cl", "krm", "tsk", "msk", "dl", "liter", "cups"] as const;
export type VolumeType = typeof volumeTypes[number];

export const unitOptions = {
	"volume": "Volym",
	"count": "Styck",
	"weight": "Vikt"
}

export interface IngredientType extends DbObject {
	name : string
	unit : UnitType
	defaultVolumeInputType? : VolumeType
	weightPerUnit?: number // weight in grams per unit (piece or ml)
	calories?: number
	protein?: number
	carbohydrates?: number
	fat?: number
}

// A ingredient entry in a recipe
export interface RecipeIngredientType extends DbObject {
	quantity: number | null
	unit: VolumeType | "g" | "st" | null
	weight?: number | null // not provided during creation, provided by backend
	comment?: string | null
	optional: boolean
	ingredient: IngredientType | null;
}

export function defaultIngredientUnit(ingredient : IngredientType) : VolumeType | "g" | "st" | null {
	switch(ingredient?.unit) {
		case "volume":
			return ingredient.defaultVolumeInputType ?? "dl";
		case "count":
			return "st";
		case "weight":
			return "g";
	}
}