'use client'

import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import IconButton from '@mui/material/IconButton'
import Link from 'next/link'
import Alert from '@mui/material/Alert'
import Spinner from '@/app/components/spinner'

import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

import { capitalize, formatQuantity, formatTime } from '@/app/utils'
import { IngredientGroupType, InstructionGroupType, RecipeType } from '@/app/types/recipe'
import { TagType } from '@/app/types/tag'

import FullCard from '@/app/components/fullcard'
import MarkdownText from '@/app/components/markdownText'

import { useWakeLock } from 'react-screen-wake-lock'

function IngredientGroup({ group, showWeight, recipeSource }: { group: IngredientGroupType, showWeight: boolean, recipeSource?: RecipeType }) {
	return (
		<Box sx={{ mb: 2 }}>
			{group.name || recipeSource !== undefined ? (
				<Typography variant="h6" component="h3" sx={{ mb: 1 }}>
					{recipeSource ? 
						(<Link href={`/recipe/${recipeSource.id}`} className="hover:underline">
							{group.name ? `${recipeSource.name}: ${group.name}` : recipeSource.name}
						</Link>) :
						(group.name ? `${group.name}` : '')
					}
				</Typography>
			) : null}
			<Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
				{group.ingredients.map((item, index) => (
					<IngredientItem
						key={item.id}
						ingredient={item}
						showWeight={showWeight}
						index={index}
					/>
				))}
			</Box>
		</Box>
	)
}

function InstructionGroup({ group, currentPortions, recipeSource }: { group: InstructionGroupType, currentPortions: number, recipeSource?: RecipeType }) {
	return (
		<Box sx={{ mb: 2 }}>
			{group.name || recipeSource !== undefined ? (
				<Typography variant="h6" component="h3" sx={{ mb: 1 }}>
					{recipeSource ? 
						(<Link href={`/recipe/${recipeSource.id}`} className="hover:underline">
							{group.name ? `${recipeSource.name}: ${group.name}` : recipeSource.name}
						</Link>) :
						(group.name ? `${group.name}` : '')
					}
				</Typography>
			) : null}
			<Box component="ol" sx={{ m: 0, pl: 3 }}>
				{group.instructions.map((step, stepIndex) => (
					<Box component="li" key={stepIndex} sx={{ mb: 1 }}>
						<MarkdownText
							text={step.replaceAll('{portions}', String(currentPortions))}
						/>
					</Box>
				))}
			</Box>
		</Box>
	)
}

function RecipeIngredients({ recipe, showWeight, isPrimary }: { recipe: RecipeType, showWeight: boolean, isPrimary: boolean }) {
	return (
		<>
			{recipe.subRecipes.map((subRecipe, index) => (
				<RecipeIngredients
					key={`sub-recipe-${index}`}
					recipe={subRecipe}
					showWeight={showWeight}
					isPrimary={false}
				/>
			))}
			{recipe.ingredients.map((group, groupIndex) => (
				<IngredientGroup
					key={`ingredient-group-${groupIndex}`}
					group={group}
					showWeight={showWeight}
					recipeSource={isPrimary && !(groupIndex == 0 && recipe.subRecipes.length > 0) ? undefined : recipe}
				/>
			))}
		</>
	)
}

function RecipeInstructions({ recipe, currentPortions, isPrimary }: { recipe: RecipeType, currentPortions: number, isPrimary: boolean }) {
	return (
		<>
			{recipe.subRecipes.map((subRecipe, index) => (
				<RecipeInstructions
					key={`sub-recipe-${index}`}
					recipe={subRecipe}
					currentPortions={currentPortions}
					isPrimary={false}
				/>
			))}
			{recipe.instructions.map((group, groupIndex) => (
				<InstructionGroup
					key={`instruction-group-${groupIndex}`}
					group={group}
					currentPortions={currentPortions}
					recipeSource={isPrimary && !(groupIndex == 0 && recipe.subRecipes.length > 0) ? undefined : recipe}
				/>
			))}
		</>
	)
}

function IngredientItem({ ingredient, showWeight, index }: { ingredient: any, showWeight: boolean, index: number }) {
	const showWeightValue = showWeight && ingredient.weight != null
	const primaryQuantity = showWeightValue && ingredient.weight != null
		? formatQuantity(ingredient.weight, 'g')
		: formatQuantity(ingredient.quantity, ingredient.unit)
	const secondaryQuantity = showWeightValue
		? (ingredient.quantity != null && ingredient.unit != null && ingredient.unit !== 'g'
			? formatQuantity(ingredient.quantity, ingredient.unit)
			: null)
		: (ingredient.weight != null && ingredient.unit != null && ingredient.unit !== 'g'
			? formatQuantity(ingredient.weight, 'g')
			: null)

	return (
		<Box
			component="li"
			key={ingredient.id}
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
							{ingredient.ingredient?.name || ''}
						</Typography>
						{ingredient.optional ? (
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
				<Box sx={{ fontWeight: 500, color: 'text.primary', whiteSpace: 'nowrap', textAlign: 'right' }}>
					{ingredient.quantity != null ? (
						<>
							{primaryQuantity}
							{secondaryQuantity ? (
								<Typography component="span" sx={{ color: 'text.secondary', ml: 0.5 }}>
									({secondaryQuantity})
								</Typography>
							) : null}
							{ingredient.comment ? (
								<Typography
									sx={{
										gridColumn: '1 / -1',
										fontSize: '0.875rem',
										color: 'text.secondary',
									}}
								>
									{ingredient.comment}
								</Typography>
							) : null}
						</>
					) : (ingredient.comment && ingredient.comment.trim())
					}
				</Box>
			</Box>
		</Box>
	)
}

function Tags({ tags }: { tags?: TagType[] }) {
	return tags?.length ? (
		<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
			{tags.map((tag) => (
				<Chip
					key={tag.id}
					label={tag.name}
					size="small"
					sx={{
						backgroundColor: tag.color,
						color: (theme) => theme.palette.getContrastText(tag.color),
					}}
				/>
			))}
		</Box>
	) : null
}

export default function RecipeDisplayContent({
    recipe,
    portions, 
    setPortions,
    allowCups,
    setAllowCups,
    error,
    isLoading,
    footer
}: {
    recipe?: RecipeType,
    portions: number | null
    setPortions: (portions: number | null) => void
    allowCups: boolean
    setAllowCups: (allowCups: boolean) => void
    error?: Error
    isLoading: boolean
    footer?: React.ReactNode
}) {
    const [showWeight, setShowWeight] = useState<boolean | null>(null)

	useEffect(() => {
		if (recipe && portions === null) {
			setPortions(recipe.portions)
		}
		if (recipe && showWeight === null) {
			setShowWeight(recipe.defaultWeight)
		}
	}, [recipe, portions, showWeight])

	// keep screen on while viewing recipe
	const { isSupported, released, request, release } = useWakeLock({
		reacquireOnPageVisible: true,
  	})
	useEffect(() => {
		if (isSupported && (released ?? true) === true) {
			request()
		}

		return () => {
			if (isSupported && (released ?? true) !== true) {
				release()
			}
		}
	}, [isSupported, released, request, release])

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


	const currentPortions = portions ?? recipe.portions ?? 1

	return (
		<Stack direction="column" spacing={2}>
			<FullCard className="w-full">
				<Stack direction="column" spacing={2}>
					<Box>
						<Typography variant="h4" component="h1" sx={{ mb: 1 }}>
							{recipe.name}
						</Typography>
						<Tags tags={recipe.tags} />
						{recipe.description?.trim() ? (
							<Box sx={{ mt: 1 }}>
								<MarkdownText text={recipe.description} />
							</Box>
						) : null}
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
					<RecipeIngredients
						recipe={recipe}
						showWeight={showWeight || false}
						isPrimary={true}
					/>
				</FullCard>

				<FullCard className="w-full">
					<Typography variant="h5" component="h2" sx={{ mb: 2 }}>
						Instruktioner
					</Typography>
					<RecipeInstructions
						recipe={recipe}
						currentPortions={currentPortions}
						isPrimary={true}
					/>
				</FullCard>
			</Box>

			{footer}
		</Stack>
	)
}
