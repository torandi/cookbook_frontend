import { DbObject } from '@/app/types/dbobject';

type UnitType = "count" | "volume" | "weight";
const volumeTypes = ["ml", "cl", "dl", "liter", "krm", "tsk", "msk"] as const; // todo: cups etc
type VolumeType = typeof volumeTypes[number];

const unitOptions = {
	"volume": "Volym",
	"count": "Styck",
	"weight": "Vikt"
}

interface IngredientType extends DbObject {
	name : string;
	unit : UnitType;
	defaultVolumeType? : VolumeType;
	weightPerUnit?: number; // weight in grams per unit (piece or ml)
}

interface IngredientEntry extends DbObject {
	ingredientType: IngredientType,
	quantity: number,
	unit: VolumeType | "g" | "st"
}

function defaultIngredientUnit(ingredient : IngredientType) : VolumeType | "g" | "st" | null {
	switch(ingredient.unit) {
		case "volume":
			return ingredient.defaultVolumeType ?? "dl";
		case "count":
			return "st";
		case "weight":
			return "g";
	}
	return null;
}

function volumeInMl(volume : number, volumeType : VolumeType) : number | undefined {
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
	}
	console.log(`Unknown volume type ${volumeType}. Can't convert to ml`);
	return undefined;
}

function toWeight(value : number, ingredient : IngredientType, volumeType? : VolumeType) : number | undefined {
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

export { IngredientType, IngredientEntry, unitOptions, VolumeType, volumeTypes, defaultIngredientUnit, UnitOptions, volumeInMl, toWeight };
