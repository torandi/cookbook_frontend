'use client'

import { useEffect } from 'react'

import { IngredientsInput } from './ingredients'
import { InstructionsInput } from './instructions'
import { RecipeInfoInput } from './recipeInfo'
import Button from '@mui/material/Button'
import { SaveButton } from './save'
import { useRecipeEditorStore } from './state'

import { RecipeType } from '@/app/types/recipe'
import FullCard from '@/app/components/fullcard'

import FormControl from '@mui/material/FormControl'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/navigation'

type RecipeEditorPageProps = {
	title: string
	recipeId?: number
	initialRecipe?: RecipeType
}

export default function RecipeEditorPage({ title, recipeId, initialRecipe }: RecipeEditorPageProps) {
	const reset = useRecipeEditorStore((state) => state.reset)
	const setFromRecipe = useRecipeEditorStore((state) => state.setFromRecipe)
	const router = useRouter() 

	useEffect(() => {
		if (initialRecipe) {
			setFromRecipe(initialRecipe)
			return
		}

		reset()
	}, [initialRecipe?.id, reset, setFromRecipe])

	return (
		<FormControl variant="outlined" className="w-full">
			<Stack direction="column" spacing={2}>
				<FullCard className="w-full">
					<Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
						{recipeId !== undefined && (
							<Button
								variant="outlined"
								onClick={() => router.push(`/recipe/${recipeId}`)}
							>
								Avbryt
							</Button>
						)}
						<SaveButton recipeId={recipeId} />
					</Stack>
					<Typography variant="h4" component="h1" sx={{ mb: 2 }}>{title}</Typography>
					<RecipeInfoInput />
				</FullCard>
				<Stack direction="row" spacing={2}>
					<FullCard className="w-1/2">
						<Typography variant="h5" component="h1" sx={{ mb: 2 }}>Ingredienser</Typography>
						<IngredientsInput />
					</FullCard>

					<FullCard className="w-1/2">
						<InstructionsInput />
					</FullCard>
				</Stack>
			</Stack>
		</FormControl>
	)
}
