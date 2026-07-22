'use client'

import { useEffect, useState } from 'react'

import { useRecipe } from '@/app/backend/recipe'

import { capitalize } from '@/app/utils'

import FullCard from '@/app/components/fullcard'
import Spinner from '@/app/components/spinner'

import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'


function formatQuantity(value: number | null, unit: string | null) {
	if (value === null || unit === null) {
		return ""
	}

	if (unit == 'g') {
		return `${new Intl.NumberFormat('sv-SE', {
			maximumFractionDigits: 2,
		}).format(value)} ${unit}`
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
		return `${new Intl.NumberFormat('sv-SE', {
			maximumFractionDigits: 2,
		}).format(value)} ${unit}`
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

function formatTime(value: number | null) {
	if (value === null || value === undefined) {
		return 'Ej angivet'
	}

	let numMinutes = value
	let hours = Math.floor(numMinutes / 60)
	let minutes = numMinutes % 60

	if (hours > 0) {
		return `${hours} tim ${minutes} min`
	}
	return `${numMinutes} min`
}

type RecipeDisplayProps = {
	recipeId: number
}

export default function RecipeDisplay({ recipeId }: RecipeDisplayProps) {
	const [portions, setPortions] = useState<number | null>(null)
	const [allowCups, setAllowCups] = useState(true)
	const [showWeight, setShowWeight] = useState<boolean | null>(null)

	const { recipe, error, isLoading } = useRecipe(recipeId, {
		portions: portions ?? undefined,
		allowCups,
	})

	useEffect(() => {
		if (recipe && portions === null) {
			setPortions(recipe.portions)
		}
		if (recipe && showWeight === null) {
			setShowWeight(recipe.defaultWeight)
		}
	}, [recipe, portions, showWeight])

	if (error) {
		return (
			<FullCard className="w-full">
				<Alert severity="error">Kunde inte ladda receptet: {error.message}</Alert>
			</FullCard>
		)
	}

	if (isLoading || !recipe) {
		return (
			<FullCard className="w-full">
				<Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
					<Spinner />
				</Box>
			</FullCard>
		)
	}

	const currentPortions = portions ?? recipe.portions
	const ingredientRows = recipe.ingredients.filter(
		(item) => item.quantity != null && item.unit != null && item.ingredient?.name,
	)
	const instructions = recipe.instructions
		.slice()
		.sort((left, right) => left.stepNumber - right.stepNumber)

	return (
		<Stack direction="column" spacing={2}>
			<FullCard className="w-full">
				<Stack spacing={2}>
					<Box>
						<Typography variant="h4" component="h1" sx={{ mb: 1 }}>
							{recipe.name}
						</Typography>
					</Box>

					<Box
						sx={{
							display: 'grid',
							gap: 2,
							gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(5, minmax(0, 1fr))' },
						}}
					>
						<Box>
							<Typography variant="overline" color="text.secondary">
								{capitalize(recipe.portionName)}
							</Typography>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<IconButton
									aria-label="Minska portioner"
									onClick={() => setPortions(Math.max(1, currentPortions - 1))}
									disabled={currentPortions <= 1}
								>
									<RemoveIcon />
								</IconButton>
								<Typography variant="h5" component="div" sx={{ minWidth: 32, textAlign: 'center' }}>
									{currentPortions}
								</Typography>
								<IconButton
									aria-label="Öka portioner"
									onClick={() => setPortions(currentPortions + 1)}
								>
									<AddIcon />
								</IconButton>
							</Box>
						</Box>

						<Box>
							<Typography variant="overline" color="text.secondary">
								Total tid
							</Typography>
							<Typography variant="h6">{formatTime(recipe.totalTime)}</Typography>
						</Box>

						<Box>
							<Typography variant="overline" color="text.secondary">
								Aktiv tid
							</Typography>
							<Typography variant="h6">{formatTime(recipe.activeTime)}</Typography>
						</Box>

						<FormControlLabel
							control={
								<Switch
									checked={allowCups}
									onChange={(event) => setAllowCups(event.target.checked)}
								/>
							}
							label="Tillåt cups"
						/>

						<FormControlLabel
							control={
								<Switch
									checked={showWeight || false}
									onChange={(event) => setShowWeight(event.target.checked)}
								/>
							}
							label="Visa i vikt"
						/>

					</Box>
				</Stack>
			</FullCard>

			<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
				<FullCard className="w-1/3 md:w-1/3">
					<Typography variant="h5" component="h2" sx={{ mb: 2 }}>
						Ingredienser
					</Typography>
					{ingredientRows.length === 0 ? (
						<Typography color="text.secondary">Inga ingredienser</Typography>
					) : (
						<Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
							{ingredientRows.map((item, index) => (
								(() => {
									const showWeightValue = showWeight && item.weight != null
									const primaryQuantity = showWeightValue && item.weight != null
										? formatQuantity(item.weight, 'g')
										: formatQuantity(item.quantity, item.unit)
									const secondaryQuantity = showWeightValue
										? (item.quantity != null && item.unit != null && item.unit !== 'g'
											? formatQuantity(item.quantity, item.unit)
											: null)
										: (item.weight != null && item.unit != null && item.unit !== 'g'
											? formatQuantity(item.weight, 'g')
											: null)

									return (
								<Box
									component="li"
									key={item.id}
									sx={{
										py: 1.25,
										px: 1,
										borderRadius: 1,
										backgroundColor: index % 2 === 0 ? 'action.hover' : 'action.selected',
									}}
								>
									<Box
										sx={{
											display: 'grid',
											gridTemplateColumns: 'minmax(0, 1fr) auto',
											columnGap: 2,
											rowGap: 0.5,
											alignItems: 'start',
										}}
									>
										<Box sx={{ minWidth: 0 }}>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
												<Typography sx={{ fontWeight: 500, color: 'grey.800' }}>
													{item.ingredient.name}
												</Typography>
												{item.optional ? (
													<Chip
														label="Valfri"
														size="small"
														variant="outlined"
														sx={{
															borderColor: 'divider',
															backgroundColor: 'background.paper',
															color: 'text.secondary',
														}}
													/>
												) : null}
											</Box>
										</Box>
										<Typography sx={{ fontWeight: 500, color: 'text.primary', whiteSpace: 'nowrap', textAlign: 'right' }}>
											{primaryQuantity}
											{secondaryQuantity ? (
												<Typography component="span" sx={{ color: 'text.secondary', ml: 0.5 }}>
													({secondaryQuantity})
												</Typography>
											) : null}
										</Typography>
										{item.comment ? (
											<Typography
												sx={{
													gridColumn: '1 / -1',
													fontSize: '0.875rem',
													color: 'text.secondary',
												}}
											>
												{item.comment}
											</Typography>
										) : null}
									</Box>
								</Box>
									)
								})()
							))}
						</Box>
					)}
				</FullCard>

				<FullCard className="w-2/3 md:w-2/3">
					<Typography variant="h5" component="h2" sx={{ mb: 2 }}>
						Instruktioner
					</Typography>
					{instructions.length === 0 ? (
						<Typography color="text.secondary">Inga instruktioner</Typography>
					) : (
						<Box component="ol" sx={{ m: 0, pl: 3 }}>
							{instructions.map((step) => (
								<Typography component="li" sx={{ mb: 1 }}>
									{step.replaceAll('{portions}', String(currentPortions))}
								</Typography>
							))}
						</Box>
					)}
				</FullCard>
			</Stack>
		</Stack>
	)
}