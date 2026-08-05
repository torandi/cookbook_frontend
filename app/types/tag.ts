import { DbObject } from '@/app/types/dbobject';

export type TagColorOption = {
	color: string
	name?: string
}

// Preset colors the user can pick from when creating a tag.
export const tagColors: TagColorOption[] = [
	{ color: '#f44336' },
	{ color: '#e91e63' },
	{ color: '#9c27b0' },
	{ color: '#673ab7' },
	{ color: '#3f51b5' },
	{ color: '#2196f3', name: "Kött/typ av rätt (Fläsk, Pasta)" },
	{ color: '#03a9f4' },
	{ color: '#00bcd4' },
	{ color: '#009688' },
	{ color: '#4caf50', name: "Typ av måltid (huvudrätt, tillbehör etc)" },
	{ color: '#8bc34a' },
	{ color: '#cddc39' },
	{ color: '#ffc107', name: "Kök (Italienskt, Thailändskt)" },
	{ color: '#ff9800' },
	{ color: '#ff5722' },
	{ color: '#795548' },
	{ color: '#9e9e9e' },
] 

export interface TagType extends DbObject {
	name: string
	color: string
}
