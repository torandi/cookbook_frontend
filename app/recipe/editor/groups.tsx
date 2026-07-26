'use client'

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import DeleteIcon from '@mui/icons-material/Delete'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'

import { Box, Stack, TextField, IconButton, Tooltip } from '@mui/material'
import type { ChangeEvent } from 'react'


export function GroupEditRow({ 
    groupId,
    groupName,
    groupOrder,
    setGroupOrder,
    setGroupName
} : {
    groupId: number,
    groupName: string | null,
    groupOrder: number[],
    setGroupOrder: (newOrder: number[]) => void,
    setGroupName: (groupId: number, newName: string | null) => void
}) {

	const moveGroupUp = (groupId: number) => {
		const index = groupOrder.indexOf(groupId);
		if(index > 0) {
			const newOrder = [...groupOrder];
			newOrder.splice(index, 1);
			newOrder.splice(index - 1, 0, groupId);
			setGroupOrder(newOrder);
		}
	}

	const moveGroupDown = (groupId: number) => {
		const index = groupOrder.indexOf(groupId);
		if(index >= 0 && index < groupOrder.length - 1) {
			const newOrder = [...groupOrder];
			newOrder.splice(index, 1);
			newOrder.splice(index + 1, 0, groupId);
			setGroupOrder(newOrder);
		}
	}


    return (
        <Box className="flex flex-row w-full">
            <TextField
                label="Sektionsnamn"
                value={groupName ?? ""}
                className="flex-grow"
                onChange={ (event: ChangeEvent<HTMLInputElement>) => {
                    setGroupName(groupId, event.currentTarget.value)
                }}
            />
            <Tooltip title="Flytta sektion uppåt">
                <IconButton
                    className="flex-none self-center justify-self-end"
                    sx={{ ml: 6}}
                    tabIndex={-1}
                    onClick={() => moveGroupUp(groupId)}
                >
                    <KeyboardArrowUpIcon/>
                </IconButton>
            </Tooltip>
            <Tooltip title="Flytta sektion nedåt">
                <IconButton
                    className="flex-none self-center justify-self-end"
                    tabIndex={-1}
                    onClick={() => moveGroupDown(groupId)}
                >
                    <KeyboardArrowDownIcon/>
                </IconButton>
            </Tooltip>
            <Tooltip title="Ta bort sektion">
                <IconButton
                    className="flex-none self-center justify-self-end"
                    tabIndex={-1}
                    onClick={() => {
                        setGroupOrder(groupOrder.filter(x => x != groupId));
                    }}
                >
                    <DeleteIcon/>
                </IconButton>
            </Tooltip>
        </Box>
    )
}

export function AddGroupButton({ onClick } : { onClick: () => void }) {
    return (
        <Tooltip title="Lägg till ny sektion">
            <IconButton
                className="float-right self-center justify-self-end"
                onClick={onClick}
                tabIndex={-1}
            >
                <PlaylistAddIcon/>
            </IconButton>
        </Tooltip>
    )
}