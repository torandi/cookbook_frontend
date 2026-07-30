import { DbObject } from '@/app/types/dbobject';
import { RecipeIngredientType } from '@/app/types/ingredient';

export interface InstructionGroupType {
	name: string | null;
	instructions: string[];
}

export interface IngredientGroupType {
	name: string | null;
	ingredients: RecipeIngredientType[];
}

export interface RecipeType extends DbObject {
	name : string;
	description: string;
	defaultWeight: boolean;
	portions: number | null;
	portionName: string;
	activeTime: number | null;
	totalTime: number | null;
	ingredients : IngredientGroupType[];
	instructions : InstructionGroupType[];
	subRecipes: RecipeType[];
}

export interface RecipeReferenceType {
	id: number;
	proportions: number;
}

export type RecipeBackendType = Omit<RecipeType, 'subRecipes'> & {
	subRecipes: RecipeReferenceType[]; 
};

export interface RecipeSummaryType extends DbObject {
	name : string;
	description: string;
	activeTime: number | null;
	totalTime: number | null;
}