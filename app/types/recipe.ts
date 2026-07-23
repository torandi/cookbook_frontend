import { DbObject } from '@/app/types/dbobject';
import { RecipeIngredientType } from '@/app/types/ingredient';

export interface RecipeType extends DbObject {
	name : string;
	description: string;
	defaultWeight: boolean;
	portions: number;
	portionName: string;
	activeTime: number | null;
	totalTime: number | null;
	ingredients : RecipeIngredientType[];
	instructions : string[];
}