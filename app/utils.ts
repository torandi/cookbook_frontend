// Returns true if src contains search ignoring case
function containsIgnoreCase(src : string, search: string) : boolean {
	return src.toLowerCase().search(search.toLowerCase()) != -1;
}

// generates range [min, max)
function range(min : number, max : number) : number[] {
	return Array.from(new Array(max - min).keys()).map( num => num + min );
}

export { containsIgnoreCase, range };
