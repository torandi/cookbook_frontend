'use client'

import { useEffect, useMemo, useState } from 'react'

import { addTag as createTag } from '@/app/backend/tag'
import { showErrorAlert, showSuccessAlert } from '@/app/ui/alert-state'
import type { TagType } from '@/app/types/tag'
import { tagColors } from '@/app/types/tag'

import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckIcon from '@mui/icons-material/Check'

type TagDialogValue = {
	name: string
	color: string
}

type TagCreateDialogProps = {
	open: boolean
	onClose: () => void
	onCreated?: (tag: TagType) => void
	initialName?: string
	title?: string
}

function createDefaultDialogValue(initialName = ''): TagDialogValue {
	return {
		name: initialName,
		color: tagColors[0],
	}
}

export default function TagCreateDialog({
	open,
	onClose,
	onCreated,
	initialName = '',
	title = 'Skapa ny tagg',
}: TagCreateDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [dialogValue, setDialogValue] = useState<TagDialogValue>(createDefaultDialogValue(initialName))

	useEffect(() => {
		if (open) {
			setDialogValue(createDefaultDialogValue(initialName))
		}
	}, [open, initialName])

	const canSubmit = useMemo(() => dialogValue.name.trim().length > 0, [dialogValue.name])

	const handleClose = () => {
		if (isSubmitting) {
			return
		}
		onClose()
	}

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setIsSubmitting(true)

		const newTag: TagType = {
			id: null,
			name: dialogValue.name.trim(),
			color: dialogValue.color,
		}

		const { data, error } = await createTag(newTag)
		setIsSubmitting(false)

		if (error || !data) {
			showErrorAlert(error ?? 'Misslyckades med att skapa tagg')
			return
		}

		onCreated?.(data)
		showSuccessAlert(`Tagg "${data.name}" skapad`)
		onClose()
	}

	return (
		<Dialog open={open} onClose={handleClose} fullWidth>
			{isSubmitting && <CircularProgress />}
			{!isSubmitting && (
				<form onSubmit={handleSubmit}>
					<DialogTitle>{title}</DialogTitle>
					<DialogContent>
						<FormControl variant="standard" fullWidth>
							<Stack direction="column" spacing={2} sx={{ pt: 2 }}>
								<TextField
									autoFocus
									id="tag-create-name"
									value={dialogValue.name}
									onChange={(event) => setDialogValue({ ...dialogValue, name: event.target.value })}
									label="Namn"
								/>
								<Box>
									<Typography variant="subtitle2" sx={{ mb: 1 }}>
										Färg
									</Typography>
									<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
										{tagColors.map((color) => (
											<Box
												key={color}
												onClick={() => setDialogValue({ ...dialogValue, color })}
												sx={{
													width: 32,
													height: 32,
													borderRadius: '50%',
													backgroundColor: color,
													cursor: 'pointer',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													border: (theme) => dialogValue.color === color
														? `2px solid ${theme.palette.text.primary}`
														: '2px solid transparent',
													boxShadow: 1,
												}}
											>
												{dialogValue.color === color ? (
													<CheckIcon sx={{ color: (theme) => theme.palette.getContrastText(color), fontSize: 18 }} />
												) : null}
											</Box>
										))}
									</Box>
								</Box>
							</Stack>
						</FormControl>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleClose} color="inherit">
							Avbryt
						</Button>
						<Button type="submit" variant="contained" disabled={!canSubmit}>
							Skapa
						</Button>
					</DialogActions>
				</form>
			)}
		</Dialog>
	)
}
