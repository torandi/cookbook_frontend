'use client'

import { useState } from 'react'
import { I18nProvider } from 'react-aria-components'
import type { DateValue, RangeValue } from 'react-aria-components'

import {
	RangeCalendar,
	RangeCalendarHeader,
	RangeNavButton,
	RangeCalendarYearPicker,
	RangeCalendarGrid,
	RangeCalendarGridHeader,
	RangeCalendarGridBody,
	RangeCalendarCell,
} from '@/libs/tailgrids/core/range-calendar'

import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type AddDaysDialogProps = {
	open: boolean
	onClose: () => void
	onAdd: (startDate: string, endDate: string, mealNames: string[]) => void
}

export default function AddDaysDialog({ open, onClose, onAdd }: AddDaysDialogProps) {
	const [range, setRange] = useState<RangeValue<DateValue> | null>(null)
	const [lunch, setLunch] = useState(true)
	const [middag, setMiddag] = useState(true)

	function handleAdd() {
		const mealNames: string[] = []
		if (lunch) mealNames.push('Lunch')
		if (middag) mealNames.push('Middag')
		if (mealNames.length === 0 || !range) return
		onAdd(range.start.toString(), range.end.toString(), mealNames)
		onClose()
	}

	const valid = (lunch || middag) && range != null

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>Lägg till dagar</DialogTitle>
			<DialogContent>
				<Stack spacing={2} sx={{ mt: 1 }}>
					<I18nProvider locale="sv-SE">
						<RangeCalendar
							aria-label="Välj datumintervall"
							value={range}
							onChange={setRange}
						>
							<RangeCalendarHeader>
								<RangeNavButton slot="previous" />
								<RangeCalendarYearPicker />
								<RangeNavButton slot="next" />
							</RangeCalendarHeader>
							<RangeCalendarGrid>
								<RangeCalendarGridHeader />
								<RangeCalendarGridBody>
									{(date) => <RangeCalendarCell date={date} />}
								</RangeCalendarGridBody>
							</RangeCalendarGrid>
						</RangeCalendar>
					</I18nProvider>

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
