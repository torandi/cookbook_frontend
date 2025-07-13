import { DbObject } from '@/app/types/dbobject';

export type UnitType = "count" | "volume" | "weight";
export const volumeTypes = ["ml", "cl", "dl", "liter", "krm", "tsk", "msk", "cups"] as const; // todo: cups etc
export type VolumeType = typeof volumeTypes[number];

export const unitOptions = {
	"volume": "Volym",
	"count": "Styck",
	"weight": "Vikt"
}

export interface IngredientType extends DbObject {
	name : string;
	unit : UnitType;
	defaultVolumeType? : VolumeType;
	weightPerUnit?: number; // weight in grams per unit (piece or ml)
}

export interface IngredientEntry extends DbObject {
	ingredientType: IngredientType | null,
	quantity: number | null,
	optional: boolean | null,
	unit: VolumeType | "g" | "st" | null
}

export function defaultIngredientUnit(ingredient : IngredientType) : VolumeType | "g" | "st" | null {
	switch(ingredient?.unit) {
		case "volume":
			return ingredient.defaultVolumeType ?? "dl";
		case "count":
			return "st";
		case "weight":
			return "g";
	}
	return null;
}

export function volumeInMl(volume : number, volumeType : VolumeType) : number | undefined {
	switch(volumeType) {
		case "ml":
		case "krm":
			return volume;
		case "cl":
			return volume * 100
		case "dl":
			return volume * 100;
		case "l":
			return volume * 1000;
		case "tsk":
			return volume * 5;
		case "msk":
			return volume * 15;
		case "cups":
			return volume * 236.588;
	}
	console.log(`Unknown volume type ${volumeType}. Can't convert to ml`);
	return undefined;
}

export function toWeight(value : number, ingredient : IngredientType, volumeType? : VolumeType) : number | undefined {
	if (ingredient.unit == "weight")
		return value;

	if (ingredient.weightPerUnit === undefined)
		return undefined;

	if(ingredient.unit == "volume") {
			if(volumeType === undefined)
				return undefined;

		const ml = volumeInMl(value, volumeType);
		if(ml === undefined)
			return undefined;

		return ml * ingredient.weightPerUnit;
	} else if(ingredient.unit == "count") {
		return value * ingredient.weightPerUnit;
	}

	console.log(`Unknown ingredient value type ${ingredient.unit}`);

	return undefined;
}
