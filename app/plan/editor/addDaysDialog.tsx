'use client'

import { useState } from 'react'

import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

type AddDaysDialogProps = {
	open: boolean
	onClose: () => void
	onAdd: (startDate: string, endDate: string, mealNames: string[]) => void
}

export default function AddDaysDialog({ open, onClose, onAdd }: AddDaysDialogProps) {
	const today = new Date().toISOString().split('T')[0]
	const [startDate, setStartDate] = useState(today)
	const [endDate, setEndDate] = useState(today)
	const [lunch, setLunch] = useState(true)
	const [middag, setMiddag] = useState(true)

	function handleAdd() {
		const mealNames: string[] = []
		if (lunch) mealNames.push('Lunch')
		if (middag) mealNames.push('Middag')
		if (mealNames.length === 0 || !startDate || !endDate) return
		onAdd(startDate, endDate, mealNames)
		onClose()
	}

	const valid = (lunch || middag) && !!startDate && !!endDate && startDate <= endDate

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>Lägg till dagar</DialogTitle>
			<DialogContent>
				<Stack spacing={2} sx={{ mt: 1 }}>
					<Stack direction="row" spacing={2}>
						<TextField
							label="Från"
							type="date"
							value={startDate}
							onChange={(e) => {
								setStartDate(e.target.value)
								if (e.target.value > endDate) setEndDate(e.target.value)
							}}
							size="small"
							slotProps={{ inputLabel: { shrink: true } }}
						/>
						<TextField
							label="Till"
							type="date"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							size="small"
							slotProps={{
								inputLabel: { shrink: true },
								htmlInput: { min: startDate },
							}}
						/>
					</Stack>
					<Typography variant="subtitle2">Måltider</Typography>
					<Stack direction="row" spacing={1}>
						<FormControlLabel
							control={<Checkbox checked={lunch} onChange={(e) => setLunch(e.target.checked)} />}
							label="Lunch"
						/>
						<FormControlLabel
							control={<Checkbox checked={middag} onChange={(e) => setMiddag(e.target.checked)} />}
							label="Middag"
						/>
					</Stack>
					{!lunch && !middag && (
						<Typography color="error" variant="caption">Välj minst en måltidstyp</Typography>
					)}
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Avbryt</Button>
				<Button variant="contained" onClick={handleAdd} disabled={!valid}>
					Lägg till
				</Button>
			</DialogActions>
		</Dialog>
	)
}
