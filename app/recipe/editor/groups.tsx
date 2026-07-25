'use client'

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import DeleteIcon from '@mui/icons-material/Delete'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'

import { Stack, TextField, IconButton, Tooltip } from '@mui/material'
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
        <Stack direction="row" spacing={2}>
            <TextField
                label="Sektionsnamn"
                value={groupName ?? ""}
                onChange={ (event: ChangeEvent<HTMLInputElement>) => {
                    setGroupName(groupId, event.currentTarget.value)
                }}
            />
            <Tooltip title="Flytta sektion uppåt">
                <IconButton
                    className="float-right self-center justify-self-end"
                    onClick={() => moveGroupUp(groupId)}
                >
                    <KeyboardArrowUpIcon/>
                </IconButton>
            </Tooltip>
            <Tooltip title="Flytta sektion nedåt">
                <IconButton
                    className="float-right self-center justify-self-end"
                    onClick={() => moveGroupDown(groupId)}
                >
                    <KeyboardArrowDownIcon/>
                </IconButton>
            </Tooltip>
            <Tooltip title="Ta bort sektion">
                <IconButton
                    className="float-right self-center justify-self-end"
                    onClick={() => {
                        setGroupOrder(groupOrder.filter(x => x != groupId));
                    }}
                >
                    <DeleteIcon/>
                </IconButton>
            </Tooltip>
        </Stack>
    )
}

export function AddGroupButton({ onClick } : { onClick: () => void }) {
    return (
        <Tooltip title="Lägg till ny sektion">
            <IconButton
                className="float-right self-center justify-self-end"
                onClick={onClick}
            >
                <PlaylistAddIcon/>
            </IconButton>
        </Tooltip>
    )
}