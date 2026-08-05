'use client'
import { useState } from 'react'


import RecipeDisplayContent from '@/app/components/recipeDisplayContent'
import { usePublicRecipe } from '@/app/backend/recipe'

export default function PublicRecipeDisplay({ recipeId, shareKey } : { recipeId: number, shareKey: string }) {
	const [portions, setPortions] = useState<number | null>(null)

	const { recipe, error, isLoading } = usePublicRecipe({
		recipeId: recipeId,
		key: shareKey,
		portions: portions ?? undefined,
		allowCups: false
	})

	const footer = (<></>)

	return <RecipeDisplayContent
		recipe={recipe}
		portions={portions}
		setPortions={setPortions}
		allowCups={false}
		error={error}
		isLoading={isLoading}
		footer={footer}
		/>
}
