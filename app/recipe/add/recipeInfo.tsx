'use client'

import { useRecipeAddStore } from './state'

import { useShallow } from 'zustand/react/shallow'

import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

export const RecipeInfoInput = () => {
	const recipeInfo = useRecipeAddStore( 
	 useShallow( state =>
		({
		 title: state.title,
		 portions: state.portions,
		 defaultWeight: state.defaultWeight
		}))
	)
	const setTitle = useRecipeAddStore( state => state.setTitle )
	const setPortions = useRecipeAddStore( state => state.setPortions )
	const setDefaultWeight = useRecipeAddStore( state => state.setDefaultWeight )

	// todo: tags, category etc, probably in a different component
	return (
		<>
				<TextField
					id='recipe-name'
					label="Titel"
					className="w-1/2"
					value={ recipeInfo.title }
					onChange={ (event) => setTitle(event.target.value) }
				/>
				<TextField
					id='recipe-portions'
					label="Portioner"
					value={ recipeInfo.portions ?? "" }
					onChange={ (event) => {
						const num = parseInt(event.target.value)
						setPortions(isNaN(num) ? null : event.target.value)
					}}
					sx={{mx: 2}}
					slotProps={{
						htmlInput: {
							className: 'text-right'
						}
					}}
				/>
				<Tooltip title="Ställer in om receptet ska visas som gram eller volymmått som standard">
					<FormControlLabel control={
						<Switch
							checked={ recipeInfo.defaultWeight }
							onChange={ (event) => setDefaultWeight(event.target.checked) }
						/>} label="Föredra gram" labelPlacement="bottom"/>
				</Tooltip>
		</>
	)
}
