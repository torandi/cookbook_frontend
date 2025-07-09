'use client'

import { useState, useEffect, ChangeEvent } from 'react';

import { SortableList } from '@/app/components/sortableList'

import { useSortable } from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton'

import DeleteIcon from '@mui/icons-material/Delete'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

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

	const isLastInstruction = instructionsState.activeIds.at(-1) == id);

	const handleDelete = () => {
		if(isLastInstruction)
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

	useEffect(() => {
		if(value && isLastInstruction) {
			// We are the last item, add new
			const newId = instructionsState.nextId;
			setInstructionsState({
				nextId: newId + 1,
				activeIds: instructionsState.activeIds.concat(newId)
			})
		}

	}, [isLastInstruction, value]);

	const injectStep = () => {
		const newId = instructionsState.nextId;
		setInstructionsState({
			nextId: newId + 1,
			activeIds: instructionsState.activeIds.toSpliced(index+1, 0, newId)
		})
	}

	// sorting / drag & drop
	const {
		listeners,
		setNodeRef,
		transform,
		transition,
	} = useSortable({id: id});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	// end sorting

	return (
		<Box
			ref={setNodeRef}
			style={style}
			tabIndex={-1}
			className="w-full flex flex-row">
			<TextField
				multiline
				minRows={2}
				className="flex-3"
				value={value}
				onChange={ (event: ChangeEvent ) => {
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
				<Stack
					className="flex-none self-center justify-self-end"
					direction="row"
				>
					<Stack direction="column" >
						<Tooltip title="Ta bort steg">
							<IconButton
								onClick={handleDelete}
								tabIndex="-1"
							>
								<DeleteIcon/>
							</IconButton>
						</Tooltip>
						{ !isLastInstruction &&
						<Tooltip title="Lägg till steg efter">
							<IconButton
								onClick={injectStep}
								tabIndex="-1"
							>
								<PlaylistAddIcon/>
							</IconButton>
						</Tooltip>
						}
					</Stack>
					<Tooltip title="Dra för att sortera">
						<IconButton
							{...listeners}
							tabIndex="-1"
						>
							<DragIndicatorIcon/>
						</IconButton>
					</Tooltip>
				</Stack>
			</Box>
	)
}

const InstructionsInput = () => {
	const [instructionsState, setInstructionsState] = useState<State>({
		nextId: 1,
		activeIds: [0]
	});

	const onItemsUpdated = (newOrder : number[]) => {
		setInstructionsState({
			...instructionsState,
			activeIds: newOrder
		})
	}

	return (
		<SortableList
			onItemsUpdated={onItemsUpdated}
			items={instructionsState.activeIds}
			>
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
		</SortableList>
	)
}

export { InstructionsInput }
