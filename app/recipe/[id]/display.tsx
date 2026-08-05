'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useRecipe, generateShareKey, deleteShareKey } from '@/app/backend/recipe'
import { postBackend } from '@/app/backend/backend'
import { showErrorAlert, showSuccessAlert } from '@/app/ui/alert-state'

import FullCard from '@/app/components/fullcard'
import ShareDialog from '@/app/components/shareDialog'
import RecipeDisplayContent from '@/app/components/recipeDisplayContent'

import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ShareIcon from '@mui/icons-material/Share'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'


type RecipeDisplayProps = {
	recipeId: number
}

export default function RecipeDisplay({ recipeId }: RecipeDisplayProps) {
	const router = useRouter()
	const [isDeleting, setIsDeleting] = useState(false)
	const [shareDialogOpen, setShareDialogOpen] = useState(false)
	const [localShareKey, setLocalShareKey] = useState<string | undefined>(undefined)
	const [portions, setPortions] = useState<number | null>(null)
	const [allowCups, setAllowCups] = useState(true)

	const { recipe, error, isLoading } = useRecipe(recipeId, {
		portions: portions ?? undefined,
		allowCups,
	})

	useEffect(() => {
		if (recipe && localShareKey === undefined) {
			setLocalShareKey(recipe.shareKey)
		}
	}, [recipe, localShareKey])

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

	const handleGenerateShareKey = async () => {
		const result = await generateShareKey(recipeId)
		if (result.error) {
			return { error: result.error }
		}
		setLocalShareKey(result.data?.key)
		return {}
	}

	const handleDeleteShareKey = async () => {
		const result = await deleteShareKey(recipeId)
		if (result.error) {
			return { error: result.error }
		}
		setLocalShareKey(undefined)
		return {}
	}

	const footer = (
		<FullCard className="w-full">
			<Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
				<Button
					variant="outlined"
					startIcon={<ShareIcon />}
					onClick={() => setShareDialogOpen(true)}
				>
					Dela
				</Button>
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
	)

	return (
		<>
			<RecipeDisplayContent
				recipe={recipe}
				portions={portions}
				setPortions={setPortions}
				allowCups={allowCups}
				setAllowCups={setAllowCups}
				error={error}
				isLoading={isLoading}
				footer={footer}
			/>

			{ recipe && (
				<ShareDialog
					open={shareDialogOpen}
					recipeId={recipeId}
					recipeName={recipe.name}
					shareKey={localShareKey}
					onClose={() => setShareDialogOpen(false)}
					onGenerateKey={handleGenerateShareKey}
					onDeleteKey={handleDeleteShareKey}
				/>
			)}
		</>
	)
}