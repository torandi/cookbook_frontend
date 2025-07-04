// Returns true if src contains search ignoring case
function containsIgnoreCase(src : string, search: string) : boolean {
	return src.toLowerCase().search(search.toLowerCase()) != -1;
}

export { containsIgnoreCase };
