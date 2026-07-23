'use client'

import RecipeEditorPage from '@/app/recipe/editor/editor'
import Spinner from '@/app/components/spinner'
import FullCard from '@/app/components/fullcard'
import { useRecipe } from '@/app/backend/recipe'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'

export default function RecipeEditPage({ recipeId }: { recipeId: number }) {
	const { recipe, error, isLoading } = useRecipe(recipeId)

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

	return <RecipeEditorPage title="Redigera recept" recipeId={recipeId} initialRecipe={recipe} />
}
