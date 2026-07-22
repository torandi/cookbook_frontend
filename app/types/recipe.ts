import { DbObject } from '@/app/types/dbobject';
import { IngredientType, RecipeIngredientType } from '@/app/types/ingredient';

export interface RecipeType extends DbObject {
	name : string;
	defaultWeight: boolean;
	portions: number;
	portionName: string;
	activeTime: number | null;
	totalTime: number | null;
	ingredients : RecipeIngredientType[];
	instructions : RecipeInstructionType[];
}


export interface RecipeInstructionType extends DbObject {
	stepNumber: number
	description: string
}