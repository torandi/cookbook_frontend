'use client'

import { useEffect, useState } from 'react'

import { useRecipe } from '@/app/backend/recipe'
import { postBackend } from '@/app/backend/backend'
import { showErrorAlert, showSuccessAlert } from '@/app/ui/alert-state'

import { capitalize, formatQuantity, formatTime } from '@/app/utils'
import { useRouter } from 'next/navigation'

import FullCard from '@/app/components/fullcard'
import Spinner from '@/app/components/spinner'

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import RemoveIcon from '@mui/icons-material/Remove'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'

type RecipeDisplayProps = {
	recipeId: number
}

export default function RecipeDisplay({ recipeId }: RecipeDisplayProps) {
	const router = useRouter()
	const [portions, setPortions] = useState<number | null>(null)
	const [allowCups, setAllowCups] = useState(true)
	const [showWeight, setShowWeight] = useState<boolean | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)

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
		(item) => item.ingredient?.name,
	)
	const instructions = recipe.instructions

	const goToEdit = () => {
		router.push(`/recipe/edit/${recipeId}`)
	}

	const deleteRecipe = async () => {
		if (isDeleting) {
			return
		}

		const accepted = window.confirm('Är du säker på att du vill ta bort receptet?')
		if (!accepted) {
			return
		}

		setIsDeleting(true)
		const { error: deleteError } = await postBackend<null>(
			`recipes/${recipeId}`,
			null,
			{ method: 'DELETE' },
		)

		if (deleteError) {
			showErrorAlert(deleteError ?? 'Misslyckades att ta bort receptet', 10000)
			setIsDeleting(false)
			return
		}

		showSuccessAlert('Recept borttaget')
		router.replace('/recipe')
	}

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

			<Box
				sx={{
					display: 'grid',
					gap: 2,
					gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
				}}
			>
				<FullCard className="w-full">
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
													{item.ingredient?.name || ""}
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

				<FullCard className="w-full">
					<Typography variant="h5" component="h2" sx={{ mb: 2 }}>
						Instruktioner
					</Typography>
					{instructions.length === 0 ? (
						<Typography color="text.secondary">Inga instruktioner</Typography>
					) : (
						<Box component="ol" sx={{ m: 0, pl: 3 }}>
							{instructions.map((step, stepIndex) => (
								<Typography component="li" key={stepIndex} sx={{ mb: 1 }}>
									{step.replaceAll('{portions}', String(currentPortions))}
								</Typography>
							))}
						</Box>
					)}
				</FullCard>
				
				
			</Box>

			<FullCard className="w-full">
				<Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
					<Button
						variant="outlined"
						startIcon={<EditIcon />}
						onClick={goToEdit}
					>
						Redigera
					</Button>
					<Button
						variant="outlined"
						color="error"
						startIcon={<DeleteIcon />}
						onClick={deleteRecipe}
						disabled={isDeleting}
					>
						Ta bort
					</Button>
				</Box>
			</FullCard>
		</Stack>
	)
}