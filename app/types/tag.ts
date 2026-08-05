import { DbObject } from '@/app/types/dbobject';

// Preset colors the user can pick from when creating a tag.
export const tagColors = [
	'#f44336', // red
	'#e91e63', // pink
	'#9c27b0', // purple
	'#673ab7', // deep purple
	'#3f51b5', // indigo
	'#2196f3', // blue
	'#03a9f4', // light blue
	'#00bcd4', // cyan
	'#009688', // teal
	'#4caf50', // green
	'#8bc34a', // light green
	'#cddc39', // lime
	'#ffc107', // amber
	'#ff9800', // orange
	'#ff5722', // deep orange
	'#795548', // brown
	'#9e9e9e', // grey
] as const;

export interface TagType extends DbObject {
	name: string
	color: string
}
