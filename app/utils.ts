// Returns true if src contains search ignoring case
export function containsIgnoreCase(src : string, search: string) : boolean {
	return src.toLowerCase().search(search.toLowerCase()) != -1;
}

// generates range [min, max)
export function range(min : number, max : number) : number[] {
	return Array.from(new Array(max - min).keys()).map( num => num + min );
}

// Returns copy of object with key removed
export function omit<KeyType, ValueType>(obj : { [KeyType]: ValueType }, key : KeyType) : { [KeyType] : ValueType } {
	const { [key]: _, ...rest } = obj;
	return rest;
}

export function capitalize(str : string) : string {
	return str[0].toUpperCase() + str.slice(1)
}
