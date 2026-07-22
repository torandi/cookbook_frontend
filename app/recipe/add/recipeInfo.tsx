'use client'

import { useRecipeAddStore } from './state'

import { useShallow } from 'zustand/react/shallow'

import { capitalize } from '@/app/utils'

import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import InputAdornment from '@mui/material/InputAdornment';

export const RecipeInfoInput = () => {
	const recipeInfo = useRecipeAddStore(
	 useShallow( state =>
		({
		 title: state.recipe.title,
		 portions: state.recipe.portions,
		 defaultWeight: state.recipe.defaultWeight,
		 activeTime: state.recipe.activeTime,
		 totalTime: state.recipe.totalTime,
		 portionName: state.recipe.portionName
		}))
	)
	const setTitle = useRecipeAddStore( state => state.setTitle )
	const setPortions = useRecipeAddStore( state => state.setPortions )
	const setPortionName = useRecipeAddStore( state => state.setPortionName )
	const setActiveTime = useRecipeAddStore( state => state.setActiveTime );
	const setTotalTime = useRecipeAddStore( state => state.setTotalTime );

	// todo: tags, category etc, probably in a different component
	return (
		<>
			<Box>
				<TextField
					label="Titel"
					className="w-1/2"
					value={ recipeInfo.title }
					onChange={ (event) => setTitle(event.target.value) }
				/>
				<TextField
					label={ capitalize(recipeInfo.portionName) }
					value={ recipeInfo.portions ?? "" }
					onChange={ (event) => {
						const num = parseInt(event.target.value)
						setPortions(isNaN(num) ? 1 : 4)
					}}
					sx={{mx: 2}}
					slotProps={{
						htmlInput: {
							className: 'text-right'
						}
					}}
				/>
				<TextField
					label="Portions-enhet"
					value={ recipeInfo.portionName }
					onChange={ (event) => setPortionName(event.target.value) }
				/>
			</Box>
			<Box sx={{my: 2}}>
				<TextField
					label="Total tid"
					value={ recipeInfo.totalTime ?? ""}
					onChange={ (event) => setTotalTime(event.target.value) }
					slotProps={{
						input: {
							endAdornment: <InputAdornment position="end">min</InputAdornment>
						}
					}}
				/>
				<TextField
					label="Aktiv tid"
					value={ recipeInfo.activeTime ?? ""}
					onChange={ (event) => setActiveTime(event.target.value) }
					sx={{mx: 2}}
					slotProps={{
						input: {
							endAdornment: <InputAdornment position="end">min</InputAdornment>
						}
					}}
				/>
			</Box>
		</>
	)
}
