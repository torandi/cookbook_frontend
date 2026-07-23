'use client'

import { useRecipeEditorStore } from './state'

import { useShallow } from 'zustand/react/shallow'

import { capitalize } from '@/app/utils'

import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import InputAdornment from '@mui/material/InputAdornment';

export const RecipeInfoInput = () => {
	const recipeInfo = useRecipeEditorStore(
	 useShallow( state =>
		({
		 name: state.recipe.name,
		 portions: state.recipe.portions,
		 defaultWeight: state.recipe.defaultWeight,
		 activeTime: state.recipe.activeTime,
		 totalTime: state.recipe.totalTime,
		 portionName: state.recipe.portionName
		}))
	)
	const setName = useRecipeEditorStore( state => state.setName )
	const setPortions = useRecipeEditorStore( state => state.setPortions )
	const setPortionName = useRecipeEditorStore( state => state.setPortionName )
	const setActiveTime = useRecipeEditorStore( state => state.setActiveTime );
	const setTotalTime = useRecipeEditorStore( state => state.setTotalTime );
	const setDefaultWeight = useRecipeEditorStore( state => state.setDefaultWeight )

	// todo: tags, category etc, probably in a different component
	// and description
	return (
		<>
			<Box>
				<TextField
					label="Namn"
					className="w-1/2"
					value={ recipeInfo.name ?? "" }
					onChange={ (event) => setName(event.target.value) }
				/>
				<TextField
					label={ capitalize(recipeInfo.portionName) }
					value={ recipeInfo.portions ?? "" }
					onChange={ (event) => {
						const num = parseInt(event.target.value)
						setPortions(isNaN(num) ? 1 : num)
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
				
				<Tooltip title="Ställer in om receptet ska visas som gram eller volymmått som standard">
					<FormControlLabel control={
						<Switch
							checked={ recipeInfo.defaultWeight ?? false }
							onChange={ (event) => setDefaultWeight(event.target.checked) }
						/>} label="Föredra gram" labelPlacement="bottom"/>
				</Tooltip>
			</Box>
			<Box sx={{my: 2}}>
				<TextField
					label="Total tid"
					value={ recipeInfo.totalTime ?? ""}
					onChange={ (event) => setTotalTime(parseInt(event.target.value)) }
					slotProps={{
						input: {
							endAdornment: <InputAdornment position="end">min</InputAdornment>
						}
					}}
				/>
				<TextField
					label="Aktiv tid"
					value={ recipeInfo.activeTime ?? ""}
					onChange={ (event) => setActiveTime(parseInt(event.target.value)) }
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
