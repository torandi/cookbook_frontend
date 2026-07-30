import { useState } from 'react'

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import DeleteIcon from '@mui/icons-material/Delete'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'

import { Box, TextField, IconButton, Tooltip, Select, FormControl } from '@mui/material'
import type { ChangeEvent } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import FormHelperText from '@mui/material/FormHelperText'
import MenuItem from '@mui/material/MenuItem'
import { evalNumberExpression } from '@/app/utils'


export function GroupEditRow({ 
    groupId,
    groupName,
    groupOrder,
    setGroupOrder,
    setGroupName,
    onExtractGroup,
} : {
    groupId: number,
    groupName: string | null,
    groupOrder: number[],
    setGroupOrder: (newOrder: number[]) => void,
    setGroupName: (groupId: number, newName: string | null) => void,
    onExtractGroup?: (groupId: number) => void
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
            { onExtractGroup && groupName != '' && (
                <Tooltip title="Extrahera sektion till nytt recept">
                    <IconButton
                        className="flex-none self-center justify-self-end"
                        tabIndex={-1}
                        onClick={() => onExtractGroup(groupId)}
                    >
                        <ExitToAppIcon/>
                    </IconButton>
                </Tooltip>
            )}
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

export function ExtractGroupDialog({
    open,
    groupId,
    groupName,
    otherGroupCategoryName,
    otherGroupOptions,
    onExtractGroup,
    onClose
} : {
    open: boolean,
    groupId: number,
    groupName: string | null,
    otherGroupCategoryName: string,
    otherGroupOptions: { [key: number]: string | null },
    onExtractGroup: (groupId: number, otherGroupId: number | null, proportions: number, portions: number) => void,
    onClose: () => void
}) {
    const [otherGroupId, setOtherGroupId] = useState<number | null>(null)
    const [portionCount, setPortionCount] = useState<number>(4)
    const [proportions, setProportions] = useState<number | string>(1)

    const getProportions = () => {
        if (typeof proportions === 'number') return proportions
        const parsed = evalNumberExpression(proportions, null)
        return parsed ?? 1
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Extrahera sektion</DialogTitle>
            <DialogContent>
                <Typography variant="body1" gutterBottom>
                    Extrahera "{groupName}" till ett nytt recept.
                </Typography>
                <FormControl>
                    <Select
                        value={otherGroupId ?? -1}
                        label={otherGroupCategoryName}
                        onChange={(e) => setOtherGroupId(e.target.value == -1 ? null : Number(e.target.value))}
                    >
                        <MenuItem value={-1}>(inget)</MenuItem>
                        {Object.entries(otherGroupOptions).map(([id, name]) => (
                            <MenuItem key={id} value={id}>{name ?? "Onamngiven sektion"}</MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>
                        {otherGroupCategoryName} att inkludera i det nya receptet (eller lämna tomt)
                    </FormHelperText>
                </FormControl>
                <FormControl>
                    <TextField
                        label="Portioner"
                        type="number"
                        value={portionCount}
                        onChange={(e) => setPortionCount(Number(e.target.value))}
                    />
                    <FormHelperText>
                        Ange hur många portioner det nya receptet ska gälla
                    </FormHelperText>
                </FormControl>
                <FormControl>  
                    <TextField
                        label="Proportion"
                        value={proportions}
                        onChange={(e) => setProportions(evalNumberExpression(e.target.value, null) ?? e.target.value)}
                    />
                    <FormHelperText>
                        Ange hur stor del av receptet som ska utgöras av denna sektion (t.ex. 0.5 för hälften, 2 för dubbelt).
                        Det nya receptet skalas med inversen av detta (ie 1 / proportion) för att ge samma mängd som originalreceptet.
                    </FormHelperText>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Avbryt</Button>
                <Button onClick={() => onExtractGroup(groupId, otherGroupId, getProportions(), portionCount)} color="primary">
                    Extrahera
                </Button>
            </DialogActions>
        </Dialog>
    )
}