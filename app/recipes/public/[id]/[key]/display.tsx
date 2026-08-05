'use client'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useState } from 'react'


import FullCard from '@/app/components/fullcard'
import RecipeDisplayContent from '@/app/components/recipeDisplayContent'
import { usePublicRecipe } from '@/app/backend/recipe'

export default function PublicRecipeDisplay({ recipeId, shareKey } : { recipeId: number, shareKey: string }) {
	const [portions, setPortions] = useState<number | null>(null)
	const [allowCups, setAllowCups] = useState(true)

	const { recipe, error, isLoading } = usePublicRecipe({
		recipeId: recipeId,
		key: shareKey,
		portions: portions ?? undefined,
		allowCups: allowCups
	})

	const footer = (<></>)

	return <RecipeDisplayContent
		recipe={recipe}
		portions={portions}
		setPortions={setPortions}
		allowCups={allowCups}
		setAllowCups={setAllowCups}
		error={error}
		isLoading={isLoading}
		footer={footer}
		/>
}
