'use client'

import { useEffect, useMemo, useState } from 'react'

import { addIngredient as createIngredient } from '@/app/backend/ingredient'
import { showErrorAlert, showSuccessAlert } from '@/app/ui/alert-state'
import type { IngredientType, UnitType, VolumeType } from '@/app/types/ingredient'
import { unitOptions, volumeTypes } from '@/app/types/ingredient'

import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

type IngredientDialogValue = {
	name: string
	unit: UnitType
	defaultVolumeInputType?: VolumeType
	weightPerUnit: string
	calories: string
	protein: string
	carbohydrates: string
	fat: string
}

type IngredientCreateDialogProps = {
	open: boolean
	onClose: () => void
	onCreated?: (ingredient: IngredientType) => void
	initialName?: string
	title?: string
}

function createDefaultDialogValue(initialName = ''): IngredientDialogValue {
	return {
		name: initialName,
		unit: 'volume',
		defaultVolumeInputType: 'dl',
		weightPerUnit: '',
		calories: '',
		protein: '',
		carbohydrates: '',
		fat: '',
	}
}

function parseOptionalNumber(value: string): number | undefined {
	if (value.trim() === '') {
		return undefined
	}

	const parsed = Number(value.replace(',', '.'))
	return Number.isNaN(parsed) ? undefined : parsed
}

export default function IngredientCreateDialog({
	open,
	onClose,
	onCreated,
	initialName = '',
	title = 'Skapa ny ingrediens',
}: IngredientCreateDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [dialogValue, setDialogValue] = useState<IngredientDialogValue>(createDefaultDialogValue(initialName))

	useEffect(() => {
		if (open) {
			setDialogValue(createDefaultDialogValue(initialName))
		}
	}, [open, initialName])

	const isVolumeType = dialogValue.unit === 'volume'
	const isWeightType = dialogValue.unit === 'weight'

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

		let weightPerUnit = parseOptionalNumber(dialogValue.weightPerUnit)
		const calories = parseOptionalNumber(dialogValue.calories)
		const protein = parseOptionalNumber(dialogValue.protein)
		const carbohydrates = parseOptionalNumber(dialogValue.carbohydrates)
		const fat = parseOptionalNumber(dialogValue.fat)

		if (weightPerUnit != null && dialogValue.unit === 'volume') {
			// Convert from dl input to ml storage.
			weightPerUnit /= 100
		}

		const newIngredient: IngredientType = {
			id: null,
			name: dialogValue.name.trim(),
			unit: dialogValue.unit,
			defaultVolumeInputType: dialogValue.unit === 'volume' ? dialogValue.defaultVolumeInputType : undefined,
			weightPerUnit,
			calories,
			protein,
			carbohydrates,
			fat,
		}

		const { data, error } = await createIngredient(newIngredient)
		setIsSubmitting(false)

		if (error || !data) {
			showErrorAlert(error ?? 'Misslyckades med att skapa ingrediens')
			return
		}

		onCreated?.(data)
		showSuccessAlert(`Ingrediens "${data.name}" skapad`)
		onClose()
	}

	return (
		<Dialog open={open} onClose={handleClose}>
			{isSubmitting && <CircularProgress />}
			{!isSubmitting && (
				<form onSubmit={handleSubmit}>
					<DialogTitle>{title}</DialogTitle>
					<DialogContent>
						<FormControl variant="standard">
							<Stack direction="column" spacing={2} sx={{ pt: 2 }}>
								<TextField
									autoFocus
									id="ingredient-create-name"
									value={dialogValue.name}
									onChange={(event) => setDialogValue({ ...dialogValue, name: event.target.value })}
									label="Namn"
								/>
								<FormControl>
									<InputLabel id="ingredient-create-unit-label">Enhet</InputLabel>
									<Select
										id="ingredient-create-unit"
										labelId="ingredient-create-unit-label"
										label="Enhet"
										value={dialogValue.unit}
										onChange={(event: SelectChangeEvent) => {
											const unit = event.target.value as UnitType
											setDialogValue({
												...dialogValue,
												unit,
												defaultVolumeInputType: unit === 'volume' ? (dialogValue.defaultVolumeInputType || 'dl') : undefined,
											})
										}}
									>
										{Object.entries(unitOptions).map(([key, value]) => (
											<MenuItem key={key} value={key}>{value}</MenuItem>
										))}
									</Select>
								</FormControl>
								<FormControl sx={{ display: isVolumeType ? 'flex' : 'none' }}>
									<InputLabel id="ingredient-create-volume-default-type-label">Standard inmatnings-enhet</InputLabel>
									<Select
										id="ingredient-create-volume-default-type"
										labelId="ingredient-create-volume-default-type-label"
										label="Standard inmatnings-enhet"
										value={dialogValue.defaultVolumeInputType ?? 'dl'}
										onChange={(event: SelectChangeEvent) => {
											setDialogValue({
												...dialogValue,
												defaultVolumeInputType: event.target.value as VolumeType,
											})
										}}
									>
										{volumeTypes.map((value) => (
											<MenuItem key={value} value={value}>{value}</MenuItem>
										))}
									</Select>
								</FormControl>
								<TextField
									id="ingredient-create-weight-per-unit"
									value={dialogValue.weightPerUnit}
									onChange={(event) => setDialogValue({ ...dialogValue, weightPerUnit: event.target.value })}
									label={dialogValue.unit === 'count' ? 'Vikt per styck' : 'Vikt per dl'}
									sx={{ display: isWeightType ? 'none' : 'flex' }}
									slotProps={{
										input: { endAdornment: <InputAdornment position="end">g</InputAdornment> },
									}}
								/>
								<TextField
									id="ingredient-create-calories"
									value={dialogValue.calories}
									onChange={(event) => setDialogValue({ ...dialogValue, calories: event.target.value })}
									label="Kalorier"
									slotProps={{
										input: { endAdornment: <InputAdornment position="end">kcal</InputAdornment> },
									}}
								/>
								<Typography variant="subtitle2" color="text.secondary">
									Macros (per 100g)
								</Typography>
								<Stack direction="row" spacing={1}>
									<TextField
										id="ingredient-create-protein"
										value={dialogValue.protein}
										onChange={(event) => setDialogValue({ ...dialogValue, protein: event.target.value })}
										label="Protein"
										slotProps={{
											input: { endAdornment: <InputAdornment position="end">g</InputAdornment> },
										}}
									/>
									<TextField
										id="ingredient-create-carbohydrates"
										value={dialogValue.carbohydrates}
										onChange={(event) => setDialogValue({ ...dialogValue, carbohydrates: event.target.value })}
										label="Kolhydrater"
										slotProps={{
											input: { endAdornment: <InputAdornment position="end">g</InputAdornment> },
										}}
									/>
									<TextField
										id="ingredient-create-fat"
										value={dialogValue.fat}
										onChange={(event) => setDialogValue({ ...dialogValue, fat: event.target.value })}
										label="Fett"
										slotProps={{
											input: { endAdornment: <InputAdornment position="end">g</InputAdornment> },
										}}
									/>
								</Stack>
							</Stack>
						</FormControl>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleClose}>Avbryt</Button>
						<Button type="submit" disabled={!canSubmit}>Skapa</Button>
					</DialogActions>
				</form>
			)}
		</Dialog>
	)
}
