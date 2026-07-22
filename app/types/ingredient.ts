import { DbObject } from '@/app/types/dbobject';

export type UnitType = "count" | "volume" | "weight";
export const volumeTypes = ["ml", "cl", "dl", "liter", "krm", "tsk", "msk", "cups"] as const;
export type VolumeType = typeof volumeTypes[number];

export const unitOptions = {
	"volume": "Volym",
	"count": "Styck",
	"weight": "Vikt"
}

export interface IngredientType extends DbObject {
	name : string;
	unit : UnitType;
	defaultVolumeInputType? : VolumeType;
	weightPerUnit?: number; // weight in grams per unit (piece or ml)
}

export interface IngredientInputEntry extends DbObject {
	ingredientType: IngredientType | null,
	quantity: number | null,
	comment: string,
	optional: boolean | null,
	unit: VolumeType | "g" | "st" | null
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