'use client'

import { useState, ChangeEvent } from 'react';

import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton'

import DeleteIcon from '@mui/icons-material/Delete'

interface State {
	nextId: number,
	activeIds: number[]
}

function InstructionStepInput({ id, index, instructionsState, setInstructionsState } :
	{
		id : number,
		index: number,
		instructionsState : State,
		setInstructionsState : Function
	}) {
	const [value, setValue] = useState("");

	const handleDelete = () => {
		if(instructionsState.activeIds.at(-1) == id)
		{
			// We're the last item, just clear our value
			// (probably won't happen, but best to keep it anyway)
			setValue("");
		}
		else
		{
			setInstructionsState({
				...instructionsState,
				activeIds: instructionsState.activeIds.filter( x => x != id )
			})
		}
	}

	// todo: stöd för att lägga till instruktion mitt i

	return (
		<Box className="w-full flex flex-row">
		<TextField
			multiline
			minRows={2}
			className="flex-3"
			value={value}
			onChange={ (event: ChangeEvent ) => {
				if(event.target.value && instructionsState.activeIds.at(-1) == id)
				{
					// We are the last item, add new
					const newId = instructionsState.nextId;
					setInstructionsState({
						nextId: newId + 1,
						activeIds: instructionsState.activeIds.concat(newId)
					})
				}

				setValue(event.target.value)
			}}
			slotProps={{
				input: {
					startAdornment: (<InputAdornment
						className="self-start"
						position="start"
					>{index+1}.</InputAdornment>)
				}
			}}
			/>
			<IconButton
				onClick={handleDelete}
				className="flex-none self-center justify-self-end"
				tabIndex="-1"
			>
				<DeleteIcon/>
			</IconButton>
		</Box>
	)
}

const InstructionsInput = () => {
	const [instructionsState, setInstructionsState] = useState<State>({
		nextId: 1,
		activeIds: [0]
	});

	return (
		<Stack direction="column" spacing={2}>
			{ instructionsState.activeIds.map((id, index) => (
				<InstructionStepInput
					id={id}
					key={id}
					index={index}
					instructionsState={instructionsState}
					setInstructionsState={setInstructionsState}
				/>
			))}
		</Stack>
	)
}

export { InstructionsInput }
