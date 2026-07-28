'use client'

import { SyntheticEvent, useState } from 'react'

import { useIngredients } from '@/app/backend/ingredient'
import IngredientCreateDialog from '@/app/components/ingredientCreateDialog'
import type { IngredientType } from '@/app/types/ingredient'

import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import type { SxProps, Theme } from '@mui/material/styles'

type IngredientAutocompleteCreateOption = {
	inputValue: string
	title: string
}

type IngredientAutocompleteOption = IngredientType | IngredientAutocompleteCreateOption

type IngredientAutocompleteProps = {
	id?: string
	label?: string
	value: IngredientType | null
	onChange: (ingredient: IngredientType | null) => void
	size?: 'small' | 'medium'
	className?: string
	sx?: SxProps<Theme>
}

export default function IngredientAutocomplete({
	id,
	label = 'Ingrediens',
	value,
	onChange,
	size = 'medium',
	className,
	sx,
}: IngredientAutocompleteProps) {
	const { ingredients, isLoading } = useIngredients()
	const [dialogOpen, setDialogOpen] = useState(false)
	const [dialogInitialName, setDialogInitialName] = useState('')

	const filter = createFilterOptions<IngredientAutocompleteOption>({
		limit: 100,
	})

	const generateOptions = (options: IngredientAutocompleteOption[], params: any ) => {
		const filtered = filter(options, params)
		const inputValue = params.inputValue.trim()

		const isExisting = options.some(
			(option) => 'name' in option && option.name.toLowerCase() === inputValue.toLowerCase(),
		)

		if (inputValue !== '' && !isExisting) {
			filtered.push({
				inputValue,
				title: `Skapa ny ingrediens "${inputValue}"`,
			})
		}

		return filtered
	}

	const handleChange = (_event: SyntheticEvent, newValue: IngredientAutocompleteOption | null) => {
		if (newValue && 'inputValue' in newValue && newValue.inputValue) {
			setDialogInitialName(newValue.inputValue)
			setDialogOpen(true)
			return
		}

		onChange((newValue as IngredientType | null) ?? null)
	}

	return (
		<>
			<Autocomplete
				id={id}
				className={className}
				sx={sx}
				size={size}
				loading={isLoading}
				options={ingredients ?? []}
				getOptionLabel={(option: IngredientAutocompleteOption) => {
					if ('inputValue' in option && option.inputValue) {
						return option.title
					}
					if ('name' in option) {
						return option.name
					}
					return ''
				}}
				isOptionEqualToValue={(option, selected) => {
					if ('name' in option && 'name' in selected) {
						if (option.id !== null && selected.id !== null) {
							return option.id === selected.id
						}
						return option.name === selected.name
					}
					return false
				}}
				value={value}
				onChange={handleChange}
				clearOnEscape
				autoSelect
				autoHighlight
				selectOnFocus
				handleHomeEndKeys
				filterOptions={generateOptions}
				renderInput={(params) => (
					<TextField
						{...params}
						label={label}
						slotProps={{
							...params.slotProps,
							input: {
								...params.slotProps.input,
								endAdornment: (
									<>
										{isLoading ? <CircularProgress color="inherit" size={20} /> : null}
										{params.slotProps.input.endAdornment}
									</>
								),
							},
						}}
					/>
				)}
			/>

			<IngredientCreateDialog
				open={dialogOpen}
				initialName={dialogInitialName}
				onClose={() => setDialogOpen(false)}
				onCreated={(ingredient) => onChange(ingredient)}
			/>
		</>
	)
}
