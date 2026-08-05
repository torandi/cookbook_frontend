'use client';

import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { mutate } from 'swr';

import { deleteTag, updateTag, useTags } from '@/app/backend/tag';
import TagCreateDialog from '@/app/components/tagCreateDialog';
import FullCard from '@/app/components/fullcard';
import Spinner from '@/app/components/spinner';
import { showErrorAlert, showSuccessAlert } from '@/app/ui/alert-state';
import type { TagType } from '@/app/types/tag';
import { tagColors } from '@/app/types/tag';
import { theme } from '../ui/theme';

export default function TagsPage() {
	const [search, setSearch] = useState('');
	const [editMode, setEditMode] = useState(false);
	const [drafts, setDrafts] = useState<Record<number, string>>({});
	const [skipBlurSave, setSkipBlurSave] = useState<Record<number, boolean>>({});
	const [savingName, setSavingName] = useState<Record<number, boolean>>({});
	const [savingColor, setSavingColor] = useState<Record<number, boolean>>({});
	const [deletingId, setDeletingId] = useState<number | null>(null);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const { tags, isLoading, error } = useTags();

	const resetField = (tag: TagType) => {
		if (tag.id == null) return;
		const id = tag.id;
		setDrafts((prev) => ({ ...prev, [id]: tag.name }));
	};

	const getFieldValue = (tag: TagType) => {
		if (tag.id == null) return tag.name;
		return drafts[tag.id] ?? tag.name;
	};

	const handleNameChange = (tag: TagType, value: string) => {
		if (tag.id == null) return;
		const id = tag.id;
		setDrafts((prev) => ({ ...prev, [id]: value }));
	};

	const handleNameEscape = (tag: TagType) => {
		if (tag.id == null) return;
		const id = tag.id;
		setSkipBlurSave((prev) => ({ ...prev, [id]: true }));
		resetField(tag);
	};

	const handleNameBlur = async (tag: TagType) => {
		if (tag.id == null) return;
		const id = tag.id;

		if (skipBlurSave[id]) {
			setSkipBlurSave((prev) => ({ ...prev, [id]: false }));
			return;
		}

		const newValue = getFieldValue(tag).trim();
		if (newValue === tag.name) {
			return;
		}
		if (!newValue) {
			showErrorAlert('Namn kan inte vara tomt, återställer fältet');
			resetField(tag);
			return;
		}

		setSavingName((prev) => ({ ...prev, [id]: true }));
		const { error: saveError } = await updateTag(id, { ...tag, name: newValue });
		setSavingName((prev) => ({ ...prev, [id]: false }));

		if (saveError) {
			showErrorAlert(saveError || 'Kunde inte spara taggen');
			resetField(tag);
			return;
		}

		setDrafts((prev) => {
			const next = { ...prev };
			delete next[id];
			return next;
		});
		await mutate('tags');
	};

	const handleColorChange = async (tag: TagType, color: string) => {
		if (tag.id == null || color === tag.color) return;
		const id = tag.id;

		setSavingColor((prev) => ({ ...prev, [id]: true }));
		const { error: saveError } = await updateTag(id, { ...tag, color });
		setSavingColor((prev) => ({ ...prev, [id]: false }));

		if (saveError) {
			showErrorAlert(saveError || 'Kunde inte spara färgen');
			return;
		}

		await mutate('tags');
	};

	const handleDeleteTag = async (tag: TagType) => {
		if (tag.id == null || deletingId !== null) return;

		const confirmed = window.confirm(`Ta bort taggen "${tag.name}"?`);
		if (!confirmed) return;

		setDeletingId(tag.id);
		const { error: deleteError } = await deleteTag(tag.id);
		setDeletingId(null);

		if (deleteError) {
			showErrorAlert(deleteError || 'Kunde inte ta bort taggen');
			return;
		}

		showSuccessAlert('Tagg borttagen');
		await mutate('tags');
	};

	const filteredTags = useMemo(() => {
		const searchText = search.trim().toLowerCase();
		const allTags = tags ?? [];

		return allTags
			.filter((tag) => !searchText || tag.name.toLowerCase().includes(searchText))
			.sort((a, b) => a.name.localeCompare(b.name));
	}, [tags, search]);

	return (
		<Box sx={{ p: 2, maxWidth: 900, mx: 'auto' }}>
			<Stack spacing={2}>
				<FullCard>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
						<TextField
							label="Sök tagg"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							autoFocus
						/>
						<Box sx={{ display: 'flex', alignItems: 'center' }}>
							<Tooltip title="Skapa tagg">
								<IconButton
									aria-label="Skapa tagg"
									onClick={() => setCreateDialogOpen(true)}
								>
									<AddIcon />
								</IconButton>
							</Tooltip>
							<Tooltip title={editMode ? 'Avsluta redigering' : 'Redigera'}>
								<IconButton
									aria-label={editMode ? 'Avsluta redigering' : 'Redigera'}
									onClick={() => setEditMode((prev) => !prev)}
								>
									{editMode ? <CheckIcon /> : <EditIcon />}
								</IconButton>
							</Tooltip>
						</Box>
					</Box>
				</FullCard>

				<FullCard>
					{isLoading ? (
						<Spinner sx={{ justifyContent: 'center', py: 2 }} />
					) : error ? (
						<Typography color="error">Kunde inte hämta taggar</Typography>
					) : (
						<Stack spacing={1}>
							<TableContainer>
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell>Namn</TableCell>
											<TableCell>Färg</TableCell>
											<TableCell align="right"></TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{filteredTags.map((tag) => (
											<TableRow key={tag.id ?? tag.name} hover>
												<TableCell>
													{editMode ? (
														<TextField
															size="small"
															sx={{ minWidth: 200 }}
															value={getFieldValue(tag)}
															onChange={(event) => handleNameChange(tag, event.target.value)}
															onBlur={() => handleNameBlur(tag)}
															onKeyDown={(event) => {
																if (event.key === 'Escape') {
																	handleNameEscape(tag);
																	(event.target as HTMLInputElement).blur();
																}
															}}
															disabled={tag.id != null && Boolean(savingName[tag.id])}
														/>
													) : (
														<Chip
															label={tag.name}
															size="small"
															sx={{
																backgroundColor: tag.color,
																color: (theme) => theme.palette.getContrastText(tag.color),
															}}
														/>
													)}
												</TableCell>
												<TableCell>
													{editMode ? (
														<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 260 }}>
															{tagColors.map((tagColor) => (
																<Tooltip key={tagColor.color} title={tagColor.name ?? ''}>
																	<Box
																		onClick={() => handleColorChange(tag, tagColor.color)}
																		sx={{
																			width: 22,
																			height: 22,
																			borderRadius: '50%',
																			backgroundColor: tagColor.color,
																			cursor: 'pointer',
																			display: 'flex',
																			alignItems: 'center',
																			justifyContent: 'center',
																			border: (theme) => tag.color === tagColor.color
																				? `2px solid ${theme.palette.text.primary}`
															                    : (tagColor.name ? `2px dashed ${theme.palette.text.primary}` : '2px solid transparent'),
																			opacity: tag.id != null && savingColor[tag.id] ? 0.5 : 1,
																		}}
																	>
																		{tag.color === tagColor.color ? (
																			<CheckIcon sx={{ color: (theme) => theme.palette.getContrastText(tagColor.color), fontSize: 14 }} />
																		) : null}
																	</Box>
																</Tooltip>
															))}
														</Box>
													) : (
														<Box
															sx={{
																width: 22,
																height: 22,
																borderRadius: '50%',
																backgroundColor: tag.color,
															}}
														/>
													)}
												</TableCell>
												<TableCell align="right">
													<Tooltip title="Ta bort tagg">
														<span>
															<IconButton
																size="small"
																color="error"
																onClick={() => handleDeleteTag(tag)}
																disabled={deletingId === tag.id}
															>
																<DeleteIcon fontSize="small" />
															</IconButton>
														</span>
													</Tooltip>
												</TableCell>
											</TableRow>
										))}
										{filteredTags.length === 0 && (
											<TableRow>
												<TableCell colSpan={3} align="center">
													<Typography color="text.secondary">Inga taggar hittades</Typography>
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</TableContainer>
						</Stack>
					)}
				</FullCard>
			</Stack>
			<TagCreateDialog
				open={createDialogOpen}
				onClose={() => setCreateDialogOpen(false)}
				onCreated={() => {
					void mutate('tags');
				}}
			/>
		</Box>
	);
}
