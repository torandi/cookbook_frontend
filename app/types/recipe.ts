import { DbObject } from '@/app/types/dbobject';
import { IngredientEntry} from '@app/types/ingredient';

export interface RecipeType extends DbObject {
	title : string;
	defaultWeight: boolean;
	portions: number;
	ingredients : IngredientEntry[];
	instructions : string[];
}
