'use client'

import { SyntheticEvent, useState } from 'react'

import { useTags } from '@/app/backend/tag'
import TagCreateDialog from '@/app/components/tagCreateDialog'
import type { TagType } from '@/app/types/tag'

import Autocomplete from '@mui/material/Autocomplete'
import { matchSorter } from 'match-sorter'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import { useTheme } from '@mui/material/styles'
import type { SxProps, Theme } from '@mui/material/styles'

type TagAutocompleteCreateOption = {
	inputValue: string
	title: string
}

type TagAutocompleteOption = TagType | TagAutocompleteCreateOption

type TagAutocompleteProps = {
	id?: string
	label?: string
	value: TagType[]
	onChange: (tags: TagType[]) => void
	size?: 'small' | 'medium'
	className?: string
	sx?: SxProps<Theme>
}

export default function TagAutocomplete({
	id,
	label = 'Taggar',
	value,
	onChange,
	size = 'medium',
	className,
	sx,
}: TagAutocompleteProps) {
	const { tags, isLoading } = useTags()
	const theme = useTheme()
	const [dialogOpen, setDialogOpen] = useState(false)
	const [dialogInitialName, setDialogInitialName] = useState('')

	const filter = (items: TagAutocompleteOption[], query: string) =>
		matchSorter(items, query,
			{
				keys: ['name'],
				threshold: matchSorter.rankings.CONTAINS,
			}
		)

	const generateOptions = (options: TagAutocompleteOption[], params: any) => {
		const inputValue = params.inputValue.trim()
		const filtered = filter(options, inputValue)

		const isExisting = options.some(
			(option) => 'name' in option && option.name.toLowerCase() === inputValue.toLowerCase(),
		)
		const isSelected = value.some(
			(tag) => tag.name.toLowerCase() === inputValue.toLowerCase(),
		)

		if (inputValue !== '' && !isExisting && !isSelected) {
			filtered.push({
				inputValue,
				title: `Skapa ny tagg "${inputValue}"`,
			})
		}

		return filtered
	}

	const handleChange = (_event: SyntheticEvent, newValue: TagAutocompleteOption[]) => {
		const createOption = newValue.find(
			(option) => 'inputValue' in option && option.inputValue,
		) as TagAutocompleteCreateOption | undefined

		if (createOption) {
			setDialogInitialName(createOption.inputValue)
			setDialogOpen(true)
			return
		}

		onChange(newValue as TagType[])
	}

	return (
		<>
			<Autocomplete
				multiple
				id={id}
				className={className}
				sx={sx}
				size={size}
				loading={isLoading}
				options={tags ?? []}
				getOptionLabel={(option: TagAutocompleteOption) => {
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
						return option.name.toLowerCase() === selected.name.toLowerCase()
					}
					return false
				}}
				value={value}
				onChange={handleChange}
				clearOnEscape
				autoHighlight
				selectOnFocus
				handleHomeEndKeys
				filterOptions={generateOptions}
				renderValue={ (value: readonly TagAutocompleteOption[], getItemProps) => 
                    // All actual selected tags are TagType, so we can safely cast to TagType[]
					(value as TagType[]).map((option, index) => {
						const { key, ...tagProps } = getItemProps({ index })
						return (
							<Chip
								key={key}
								label={option.name}
								size={size}
								sx={{
									backgroundColor: option.color,
									color: theme.palette.getContrastText(option.color),
								}}
								{...tagProps}
							/>
						)
					})
				}
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

			<TagCreateDialog
				open={dialogOpen}
				initialName={dialogInitialName}
				onClose={() => setDialogOpen(false)}
				onCreated={(tag) => onChange([...value, tag])}
			/>
		</>
	)
}
