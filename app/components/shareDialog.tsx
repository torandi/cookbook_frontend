'use client'

import { useEffect, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import DeleteIcon from '@mui/icons-material/Delete'
import { showErrorAlert, showSuccessAlert } from '@/app/ui/alert-state'

type ShareDialogProps = {
	open: boolean
	recipeId: number
	recipeName: string
	shareKey?: string
	onClose: () => void
	onShareKeyGenerated: (key: string) => void
	onShareKeyDeleted: () => void
	onGenerateKey: () => Promise<{ error?: Error | string | null }>
	onDeleteKey: () => Promise<{ error?: Error | string | null }>
}

export default function ShareDialog({
	open,
	recipeId,
	recipeName,
	shareKey,
	onClose,
	onShareKeyGenerated,
	onShareKeyDeleted,
	onGenerateKey,
	onDeleteKey,
}: ShareDialogProps) {
	const [isGenerating, setIsGenerating] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const [origin, setOrigin] = useState<string>('')

	useEffect(() => {
		if (typeof window !== 'undefined') {
			setOrigin(window.location.origin)
		}
	}, [])

	const shareUrl = shareKey && origin
		? `${origin}/recipes/public/${recipeId}/${shareKey}`
		: ''

	const handleGenerateKey = async () => {
		setIsGenerating(true)
		const { error } = await onGenerateKey()
		setIsGenerating(false)

		if (error) {
			const message = typeof error === 'string' ? error : error?.message || 'Misslyckades att generera delningslänk'
			showErrorAlert(message, 5000)
		} else {
			showSuccessAlert('Delningslänk genererad!', 3000)
		}
	}

	const handleDeleteKey = async () => {
		const confirmed = window.confirm('Är du säker på att du vill ta bort delningslänken?')
		if (!confirmed) return

		setIsDeleting(true)
		const { error } = await onDeleteKey()
		setIsDeleting(false)

		if (error) {
			const message = typeof error === 'string' ? error : error?.message || 'Misslyckades att ta bort delningslänken'
			showErrorAlert(message, 5000)
		} else {
			onShareKeyDeleted()
			showSuccessAlert('Delningslänk borttagen', 3000)
		}
	}

	const handleCopyLink = () => {
		navigator.clipboard.writeText(shareUrl)
		showSuccessAlert('Länken kopierades!', 3000)
	}

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>Dela recept: {recipeName}</DialogTitle>
			<DialogContent>
				<Stack spacing={2} sx={{ pt: 1 }}>
					{!shareKey ? (
						<>
							<Typography color="text.secondary">
								Generera en delningslänk för att andra ska kunna se detta recept utan att behöva logga in.
							</Typography>
							<Alert severity="info">
								Länken kan när som helst tas bort för att sluta dela receptet.
							</Alert>
						</>
					) : (
						<>
							<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
								Din delningslänk:
							</Typography>
							<Box sx={{ display: 'flex', gap: 1 }}>
								<TextField
									fullWidth
									size="small"
									value={shareUrl}
									variant="outlined"
									slotProps={{ input: { readOnly: true } }}
								/>
								<Button
									variant="contained"
									startIcon={<FileCopyIcon />}
									onClick={handleCopyLink}
									sx={{ whiteSpace: 'nowrap' }}
								>
									Kopiera
								</Button>
							</Box>
							<Alert severity="success">
								Delningslänken är aktiv och kan delas öppet.
							</Alert>
						</>
					)}
				</Stack>
			</DialogContent>
			<DialogActions>
				{shareKey && (
					<Button
						color="error"
						startIcon={<DeleteIcon />}
						onClick={handleDeleteKey}
						disabled={isDeleting}
					>
						Ta bort länk
					</Button>
				)}
				<Button onClick={onClose}>Stäng</Button>
				{!shareKey && (
					<Button
						variant="contained"
						onClick={handleGenerateKey}
						disabled={isGenerating}
					>
						{isGenerating ? 'Genererar...' : 'Generera länk'}
					</Button>
				)}
			</DialogActions>
		</Dialog>
	)
}
