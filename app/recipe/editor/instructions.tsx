'use client'

import { useEffect, ChangeEvent } from 'react';

import { useRecipeEditorStore } from './state';

import { SortableList } from '@/app/components/sortableList'

import { useSortable } from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton'

import DeleteIcon from '@mui/icons-material/Delete'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import Typography from '@mui/material/Typography';
import { AddGroupButton, GroupEditRow } from './groups';

function InstructionStepInput({ id, groupId,index, isLastItem } :
															{
	id : number,
	groupId: number,
	index: number,
	isLastItem: boolean,
}) {
	const value = useRecipeEditorStore( state => state.instructions[id] )
	const setInstruction = useRecipeEditorStore( state => state.setInstruction )
	const setValue = (value : string) => setInstruction(id, value)
	const addInstruction = useRecipeEditorStore( state => state.addInstruction )
	const removeInstruction = useRecipeEditorStore( state => state.removeInstruction )
	const insertInstruction = useRecipeEditorStore( state => state.insertInstruction )
	const trimInstructions = useRecipeEditorStore( state => state.trimInstructions )

	const handleDelete = () => {
		if(isLastItem) {
			// We're the last item, just clear our value
			setValue("");
		} else {
			removeInstruction(id, groupId);
		}
	}

	useEffect(() => {
		if(value && isLastItem) {
			addInstruction(groupId)
		} else if(!value && !isLastItem) {
			trimInstructions()
		}
	}, [isLastItem, value]);

	const injectStep = () => {
		insertInstruction(index + 1, groupId)
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
				onChange={ (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
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
								tabIndex={-1}
							>
								<DeleteIcon/>
							</IconButton>
						</Tooltip>
						{ !isLastItem &&
						<Tooltip title="Lägg till steg efter">
							<IconButton
								onClick={injectStep}
								tabIndex={-1}
							>
								<PlaylistAddIcon/>
							</IconButton>
						</Tooltip>
						}
					</Stack>
					<Tooltip title="Dra för att sortera">
						<IconButton
							{...listeners}
							tabIndex={-1}
						>
							<DragIndicatorIcon/>
						</IconButton>
					</Tooltip>
				</Stack>
			</Box>
	)
}

const InstructionsInput = () => {
	const instructionsOrder = useRecipeEditorStore( state => state.instructionsOrder )
	const setInstructionsOrder = useRecipeEditorStore( state => state.setInstructionsOrder )
	const groups = useRecipeEditorStore( state => state.instructionGroups )
	const instructionGroupOrder = useRecipeEditorStore( state => state.instructionGroupOrder )
	const setInstructionGroupOrder = useRecipeEditorStore( state => state.setInstructionGroupOrder )
	const setInstructionGroupName = useRecipeEditorStore( state => state.setInstructionGroupName )
	const addInstructionGroup = useRecipeEditorStore( state => state.addInstructionGroup )

	return (
		<Box sx={{marginBottom: 5}} >
			<Typography sx={{
				color: 'text.secondary',
				mb: 2,
				fontSize: '0.875rem',
				}}>
				Markdown stöds, t.ex. <code>**fetstil**</code> och <code>*kursiv*</code>. <br/>
				Använd <code>{'{portions}'}</code> för att referera till antalet portioner i instruktionerna.
			</Typography>

			{ instructionGroupOrder.map((groupId : number) => {
				const groupName = groups[groupId] ?? "";
				return (
					<Stack direction="column" spacing={2} style={{marginBottom: 5}} key={groupId}
							sx={{border: '1px solid #ccc', borderRadius: '4px', p: 2}}>
								<GroupEditRow
									groupId={groupId}
									groupName={groupName}
									groupOrder={instructionGroupOrder}
									setGroupOrder={setInstructionGroupOrder}
									setGroupName={setInstructionGroupName}
								/>
						<SortableList
							onItemsUpdated={(newOrder: number[]) => setInstructionsOrder(groupId, newOrder)}
							items={instructionsOrder[groupId]}
							>
							<Stack direction="column" spacing={2}>
								{ instructionsOrder[groupId].map((id, index) => (
									<InstructionStepInput
										id={id}
										groupId={groupId}
										key={id}
										index={index}
										isLastItem = { instructionsOrder[groupId].at(-1) == id }
									/>
								))}
							</Stack>
						</SortableList>
					</Stack>
				)
			})}
			<Box sx={{marginTop: 2}}>
				<AddGroupButton onClick={addInstructionGroup}/>
			</Box>
		</Box>
	)
}

export { InstructionsInput }
