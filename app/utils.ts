import { numericQuantity } from 'numeric-quantity'
import Fraction from 'fraction.js'

// Returns true if src contains search ignoring case
export function containsIgnoreCase(src : string, search: string) : boolean {
	return src.toLowerCase().search(search.toLowerCase()) != -1;
}

// generates range [min, max)
export function range(min : number, max : number) : number[] {
	return Array.from(new Array(max - min).keys()).map( num => num + min );
}

// Returns copy of object with key removed
export function omit<ValueType>(obj : { [key: number]: ValueType }, key : number) : { [key: number] : ValueType } {
	const { [key]: _, ...rest } = obj;
	return rest;
}

export function intOrDefault(value: string | null, defaultValue: number | null) : number | null {
	if (value === null) {
		return defaultValue
	}
	const parsed = parseInt(value)
	if (isNaN(parsed)) {
		return defaultValue
	}
	return parsed
}

export function evalNumberExpression(value: string | null, defaultValue: number | null) : number | null {
	if (value === null) {
		return defaultValue
	}

	const evaluated = numericQuantity(value)
	console.log('evaluated', evaluated)
	if (typeof evaluated === 'number' && !isNaN(evaluated)) {
		return evaluated
	}

	return defaultValue
}

export function displayFraction(value: number | null, defaultValue: string = "-"): string {
	if (value === null || value === undefined) {
		return defaultValue
	}

	return new Fraction(value).toFraction()
}

export function intOrDefaultNoNull(value: string | null, defaultValue: number) : number {
	if (value === null) {
		return defaultValue
	}
	const parsed = parseInt(value)
	if (isNaN(parsed)) {
		return defaultValue
	}
	return parsed
}

export function parseTime(value: string | null, defaultValue: number | null) : number | null {
	if (value === null) {
		return defaultValue
	}

	const hourLocation =value.indexOf('h')
	const minuteLocation = value.indexOf('m')
	if (hourLocation === -1) {
		return intOrDefault(value, defaultValue)
	}
	else if(minuteLocation === -1) {
		return defaultValue
	}

	const hours = intOrDefaultNoNull(value.slice(0, hourLocation), 0)
	const minutes = intOrDefault(value.slice(hourLocation + 1, minuteLocation), null)
	if (hours == 0 || minutes === null) {
		return defaultValue
	}
	return hours * 60 + minutes
}

export function capitalize(str : string) : string {
	return str[0].toUpperCase() + str.slice(1)
}

export function formatQuantity(value?: number | null, unit?: string | null) {
	if (value === null || value === undefined || unit === null || unit === undefined) {
		return "-"
	}

	if (unit == 'g') {
		return `${new Intl.NumberFormat('sv-SE', {
			maximumFractionDigits: 1,
		}).format(Math.round(value * 10) / 10.0)} ${unit}`
	}

	const denominatorOptions = [2, 3, 4]
	const absoluteValue = Math.abs(value)
	const whole = Math.floor(absoluteValue)
	const fractionalPart = absoluteValue - whole

	if (fractionalPart < 0.02) {
		return `${whole} ${unit}`
	}

	let bestNumerator = 0
	let bestDenominator = 1
	let bestError = Number.POSITIVE_INFINITY

	for (const denominator of denominatorOptions) {
		const numerator = Math.round(fractionalPart * denominator)
		const approximation = numerator / denominator
		const error = Math.abs(fractionalPart - approximation)

		if (error < bestError) {
			bestError = error
			bestNumerator = numerator
			bestDenominator = denominator
		}
	}

	if (bestNumerator === 0 || bestError > 0.06) {
		return `${Math.round(value)} ${unit}`
	}

	if (bestNumerator === bestDenominator) {
		const roundedWhole = whole + 1
		return `${roundedWhole} ${unit}`
	}

	const gcd = (a: number, b: number): number => {
		let x = a
		let y = b
		while (y !== 0) {
			const temp = y
			y = x % y
			x = temp
		}
		return x
	}

	const divisor = gcd(bestNumerator, bestDenominator)
	const reducedNumerator = bestNumerator / divisor
	const reducedDenominator = bestDenominator / divisor

	if (![2, 3, 4, 8].includes(reducedDenominator)) {
		return `${new Intl.NumberFormat('sv-SE', {
			maximumFractionDigits: 2,
		}).format(value)} ${unit}`
	}

	if (whole === 0) {
		return `${reducedNumerator}/${reducedDenominator} ${unit}`
	}

	return `${whole} ${reducedNumerator}/${reducedDenominator} ${unit}`
}
export function formatTime(value: number | null) {
	if (value === null || value === undefined) {
		return 'Ej angivet'
	}

	let numMinutes = value
	let hours = Math.floor(numMinutes / 60)
	let minutes = numMinutes % 60

	if (hours > 0) {
		if (minutes === 0) {
			return `${hours} tim`
		}
		return `${hours} tim ${minutes} min`
	}
	return `${numMinutes} min`
}