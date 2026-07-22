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
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'

function formatQuantity(value: number) {
	return new Intl.NumberFormat('sv-SE', {
		maximumFractionDigits: 2,
	}).format(value)
}

function formatTime(value: string | null) {
	if (!value) {
		return 'Ej angivet'
	}

	if (/^\d+$/.test(value)) {
		return `${value} min`
	}

	return value
}

function formatUnit(value: string | null) {
	if (!value) {
		return ''
	}

	if (value === 'count') {
		return 'st'
	}

	if (value === 'weight') {
		return 'g'
	}

	return value
}

type RecipeDisplayProps = {
	recipeId: number
}

export default function RecipeDisplay({ recipeId }: RecipeDisplayProps) {
	const [portions, setPortions] = useState<number | null>(null)
	const [allowCups, setAllowCups] = useState(false)

	const { recipe, error, isLoading } = useRecipe(recipeId, {
		portions: portions ?? undefined,
		allowCups,
	})

	useEffect(() => {
		if (recipe && portions === null) {
			setPortions(recipe.portions)
		}
	}, [recipe, portions])

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
							gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
						}}
					>
						<Box>
							<Typography variant="overline" color="text.secondary">
								Portioner
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
								<Typography variant="body2" color="text.secondary">
									{capitalize(recipe.portionName)}
								</Typography>
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
					</Box>
				</Stack>
			</FullCard>

			<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
				<FullCard className="w-full md:w-1/2">
					<Typography variant="h5" component="h2" sx={{ mb: 2 }}>
						Ingredienser
					</Typography>
					{ingredientRows.length === 0 ? (
						<Typography color="text.secondary">Inga ingredienser angivna.</Typography>
					) : (
						<Box component="ul" sx={{ m: 0, pl: 3 }}>
							{ingredientRows.map((item) => (
								<Typography component="li" key={item.id} sx={{ mb: 1 }}>
									{formatQuantity(item.quantity ?? 0)} {formatUnit(item.unit)} {item.ingredient.name}
									{item.optional ? ' (valfri)' : ''}
								</Typography>
							))}
						</Box>
					)}
				</FullCard>

				<FullCard className="w-full md:w-1/2">
					<Typography variant="h5" component="h2" sx={{ mb: 2 }}>
						Instruktioner
					</Typography>
					{instructions.length === 0 ? (
						<Typography color="text.secondary">Inga instruktioner angivna.</Typography>
					) : (
						<Box component="ol" sx={{ m: 0, pl: 3 }}>
							{instructions.map((step) => (
								<Typography component="li" key={step.id} sx={{ mb: 1 }}>
									{step.description.replaceAll('{portions}', String(currentPortions))}
								</Typography>
							))}
						</Box>
					)}
				</FullCard>
			</Stack>
		</Stack>
	)
}