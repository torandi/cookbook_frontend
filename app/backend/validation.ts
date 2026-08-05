type FastApiValidationIssue = {
	type?: string
	loc?: Array<string | number>
	msg?: string
	input?: unknown
}

function tryParseJson(value: string): unknown {
	try {
		return JSON.parse(value)
	} catch {
		return null
	}
}

function toValidationIssues(value: unknown): FastApiValidationIssue[] | null {
	if (Array.isArray(value)) {
		const allEntriesAreObjects = value.every((entry) => typeof entry === 'object' && entry !== null)
		return allEntriesAreObjects ? value as FastApiValidationIssue[] : null
	}

	if (typeof value === 'string') {
		const parsed = tryParseJson(value)
		if (parsed == null) {
			return null
		}
		return toValidationIssues(parsed)
	}

	if (typeof value === 'object' && value !== null && 'detail' in value) {
		const detail = (value as { detail?: unknown }).detail
		return toValidationIssues(detail)
	}

	return null
}

function recipeFieldLabel(field: string): string {
	const labels: Record<string, string> = {
		name: 'namn',
		description: 'beskrivning',
		portions: 'portioner',
		portionName: 'portionsnamn',
		activeTime: 'aktiv tid',
		totalTime: 'total tid',
		defaultWeight: 'standardvikt',
		ingredients: 'ingredienser',
		instructions: 'instruktioner',
		subRecipes: 'subrecept',
		proportions: 'proportion',
		tags: 'taggar',
		quantity: 'mängd',
		unit: 'enhet',
		comment: 'kommentar',
		optional: 'valfri',
		id: 'id',
	}

	return labels[field] ?? field
}

function formatRecipeLoc(rawLoc: Array<string | number> | undefined): string {
	if (!rawLoc || rawLoc.length === 0) {
		return 'okänt fält'
	}

	const loc = rawLoc[0] === 'body' ? rawLoc.slice(1) : rawLoc

	if (loc[0] === 'ingredients') {
		const groupIndex = typeof loc[1] === 'number' ? loc[1] : null

		if (loc[2] === 'ingredients') {
			const ingredientIndex = typeof loc[3] === 'number' ? loc[3] : null
			const field = typeof loc[4] === 'string' ? loc[4] : null
			const parts = ['ingredienser']

			if (groupIndex != null) {
				parts.push(`grupp ${groupIndex + 1}`)
			}
			if (ingredientIndex != null) {
				parts.push(`rad ${ingredientIndex + 1}`)
			}
			if (field) {
				parts.push(recipeFieldLabel(field))
			}

			return parts.join(' > ')
		}

		if (typeof loc[2] === 'string') {
			const parts = ['ingredienser']
			if (groupIndex != null) {
				parts.push(`grupp ${groupIndex + 1}`)
			}
			parts.push(recipeFieldLabel(loc[2]))
			return parts.join(' > ')
		}
	}

	if (loc[0] === 'instructions') {
		const groupIndex = typeof loc[1] === 'number' ? loc[1] : null

		if (loc[2] === 'instructions') {
			const stepIndex = typeof loc[3] === 'number' ? loc[3] : null
			const parts = ['instruktioner']
			if (groupIndex != null) {
				parts.push(`grupp ${groupIndex + 1}`)
			}
			if (stepIndex != null) {
				parts.push(`steg ${stepIndex + 1}`)
			}
			return parts.join(' > ')
		}

		if (typeof loc[2] === 'string') {
			const parts = ['instruktioner']
			if (groupIndex != null) {
				parts.push(`grupp ${groupIndex + 1}`)
			}
			parts.push(recipeFieldLabel(loc[2]))
			return parts.join(' > ')
		}
	}

	if (loc[0] === 'subRecipes') {
		const subRecipeIndex = typeof loc[1] === 'number' ? loc[1] : null
		const field = typeof loc[2] === 'string' ? loc[2] : null
		const parts = ['subrecept']
		if (subRecipeIndex != null) {
			parts.push(`${subRecipeIndex + 1}`)
		}
		if (field) {
			parts.push(recipeFieldLabel(field))
		}
		return parts.join(' > ')
	}

	return loc
		.map((part) => {
			if (typeof part === 'number') {
				return String(part + 1)
			}
			return recipeFieldLabel(part)
		})
		.join(' > ')
}

export function formatFastApiRecipeValidationError(error: unknown): string | null {
	const issues = toValidationIssues(error)
	if (issues == null || issues.length === 0) {
		return null
	}

	const messages = issues
		.map((issue) => {
			const fieldPath = formatRecipeLoc(issue.loc)
			const message = issue.msg ?? 'Ogiltigt värde'
			return `${fieldPath}: ${message}`
		})
		.filter((message, index, allMessages) => message !== '' && allMessages.indexOf(message) === index)

	if (messages.length === 0) {
		return null
	}

	return `Valideringsfel: ${messages.join('; ')}`
}
