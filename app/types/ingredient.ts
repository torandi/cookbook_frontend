import { DbObject } from '@/app/types/dbobject';

type UnitType = "count" | "volume" | "weight";
type VolumeType = "ml" | "cl" | "dl" | "l" | "krm" | "tsk" | "msk";

interface Ingredient extends DbObject {
	name : string;
	unit : UnitType;
	defaultVolumeType? : VolumeType;
	weightPerUnit?: number; // weight in grams per unit (piece or ml)
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

function toWeight(value : number, ingredient : Ingredient, volumeType? : VolumeType) : number | undefined {
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
	}
	else if(ingredient.unit == "count") {
		return value * ingredient.weightPerUnit;
	}

	console.log(`Unknown ingredient value type ${ingredient.unit}`);

	return undefined;
}

export { Ingredient, UnitType, VolumeType, volumeInMl, toWeight };
