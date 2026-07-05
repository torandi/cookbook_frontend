import { DbObject } from '@/app/types/dbobject';

export interface InstructionType extends DbObject {
    text : string;
    optional : boolean;
}