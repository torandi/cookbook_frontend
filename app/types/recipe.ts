import { DbObject } from '@/app/types/dbobject';
import { IngredientEntry} from '@app/types/ingredient';

export interface RecipeType extends DbObject {
	title : string;
	defaultWeight: boolean;
	inWeightUnits?: boolean; // only set when reading from backend, not when storing
	portions: number;
	portionName: string;
	activeTime: string | null;
	totalTime: string | null;
	ingredients : IngredientEntry[];
	instructions : string[];
}
