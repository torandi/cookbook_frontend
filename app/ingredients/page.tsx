'use client';

import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
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

import { deleteIngredient, updateIngredient, useIngredients } from '@/app/backend/ingredient';
import IngredientCreateDialog from '@/app/components/ingredientCreateDialog';
import FullCard from '@/app/components/fullcard';
import Spinner from '@/app/components/spinner';
import { showErrorAlert, showSuccessAlert } from '@/app/ui/alert-state';
import type { IngredientType, UnitType, VolumeType } from '@/app/types/ingredient';
import { volumeTypes } from '@/app/types/ingredient';

type EditableField =
	| 'name'
	| 'unit'
	| 'defaultVolumeInputType'
	| 'weightPerUnit'
	| 'calories'
	| 'protein'
	| 'carbohydrates'
	| 'fat';

const editableFields: EditableField[] = [
	'name',
	'unit',
	'defaultVolumeInputType',
	'weightPerUnit',
	'calories',
	'protein',
	'carbohydrates',
	'fat',
];

const unitOptions: UnitType[] = ['count', 'volume', 'weight'];

function parseNumberInput(value: string): number | undefined | null {
	const trimmed = value.trim();
	if (!trimmed) {
		return undefined;
	}

	const parsed = Number(trimmed.replace(',', '.'));
	if (Number.isNaN(parsed)) {
		return null;
	}

	return parsed;
}

function displayWeightPerUnit(ingredient: IngredientType): string {
	if (ingredient.weightPerUnit == null) {
		return '';
	}

	if (ingredient.unit === 'volume') {
		return String(ingredient.weightPerUnit * 100);
	}

	return String(ingredient.weightPerUnit);
}

function getFieldDisplayValue(ingredient: IngredientType, field: EditableField): string {
	switch (field) {
		case 'name':
			return ingredient.name;
		case 'unit':
			return ingredient.unit;
		case 'defaultVolumeInputType':
			return ingredient.defaultVolumeInputType ?? '';
		case 'weightPerUnit':
			return displayWeightPerUnit(ingredient);
		case 'calories':
			return ingredient.calories == null ? '' : String(ingredient.calories);
		case 'protein':
			return ingredient.protein == null ? '' : String(ingredient.protein);
		case 'carbohydrates':
			return ingredient.carbohydrates == null ? '' : String(ingredient.carbohydrates);
		case 'fat':
			return ingredient.fat == null ? '' : String(ingredient.fat);
	}
}

function applyFieldValue(ingredient: IngredientType, field: EditableField, value: string): IngredientType | null {
	if (field === 'name') {
		const name = value.trim();
		if (!name) {
			return null;
		}
		return { ...ingredient, name };
	}

	if (field === 'unit') {
		if (!unitOptions.includes(value as UnitType)) {
			return null;
		}
		return {
			...ingredient,
			unit: value as UnitType,
			defaultVolumeInputType: value === 'volume' ? ingredient.defaultVolumeInputType : undefined,
		};
	}

	if (field === 'defaultVolumeInputType') {
		if (!value.trim()) {
			return { ...ingredient, defaultVolumeInputType: undefined };
		}

		if (!volumeTypes.includes(value as VolumeType)) {
			return null;
		}

		return { ...ingredient, defaultVolumeInputType: value as VolumeType };
	}

	const parsedNumber = parseNumberInput(value);
	if (parsedNumber === null) {
		return null;
	}

	if (field === 'weightPerUnit') {
		if (parsedNumber === undefined) {
			return { ...ingredient, weightPerUnit: undefined };
		}

		const storedWeight = ingredient.unit === 'volume'
			? parsedNumber / 100
			: parsedNumber;

		return { ...ingredient, weightPerUnit: storedWeight };
	}

	return {
		...ingredient,
		[field]: parsedNumber === undefined ? undefined : parsedNumber,
	};
}

export default function IngredientsPage() {
	const [search, setSearch] = useState('');
	const [incompleteOnly, setIncompleteOnly] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [drafts, setDrafts] = useState<Record<string, string>>({});
	const [skipBlurSave, setSkipBlurSave] = useState<Record<string, boolean>>({});
	const [savingCell, setSavingCell] = useState<Record<string, boolean>>({});
	const [deletingId, setDeletingId] = useState<number | null>(null);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const { ingredients, isLoading, error } = useIngredients();

	const resetField = (ingredient: IngredientType, field: EditableField) => {
		const key = `${ingredient.id}:${field}`;
		setDrafts((prev) => ({ ...prev, [key]: getFieldDisplayValue(ingredient, field) }));
	};

	const getFieldValue = (ingredient: IngredientType, field: EditableField) => {
		const key = `${ingredient.id}:${field}`;
		return drafts[key] ?? getFieldDisplayValue(ingredient, field);
	};

	const handleCellChange = (ingredient: IngredientType, field: EditableField, value: string) => {
		const key = `${ingredient.id}:${field}`;
		setDrafts((prev) => ({ ...prev, [key]: value }));
	};

	const handleCellEscape = (ingredient: IngredientType, field: EditableField) => {
		const key = `${ingredient.id}:${field}`;
		setSkipBlurSave((prev) => ({ ...prev, [key]: true }));
		resetField(ingredient, field);
	};

	const handleCellBlur = async (ingredient: IngredientType, field: EditableField) => {
		if (ingredient.id == null) {
			return;
		}

		const key = `${ingredient.id}:${field}`;

		if (skipBlurSave[key]) {
			setSkipBlurSave((prev) => ({ ...prev, [key]: false }));
			return;
		}

		const previousValue = getFieldDisplayValue(ingredient, field);
		const newValue = getFieldValue(ingredient, field);
		if (newValue === previousValue) {
			return;
		}

		const payload = applyFieldValue(ingredient, field, newValue);
		if (!payload) {
			showErrorAlert('Ogiltigt värde, återställer fältet');
			resetField(ingredient, field);
			return;
		}

		setSavingCell((prev) => ({ ...prev, [key]: true }));
		const { error: saveError } = await updateIngredient(ingredient.id, payload);
		setSavingCell((prev) => ({ ...prev, [key]: false }));

		if (saveError) {
			showErrorAlert(saveError || 'Kunde inte spara ingrediensen');
			resetField(ingredient, field);
			return;
		}

		setDrafts((prev) => {
			const next = { ...prev };
			delete next[key];
			return next;
		});
		await mutate('ingredients');
	};

	const handleDeleteIngredient = async (ingredient: IngredientType) => {
		if (ingredient.id == null || deletingId !== null) {
			return;
		}

		const confirmed = window.confirm(`Ta bort ingrediensen "${ingredient.name}"?`);
		if (!confirmed) {
			return;
		}

		setDeletingId(ingredient.id);
		const { error: deleteError } = await deleteIngredient(ingredient.id);
		setDeletingId(null);

		if (deleteError) {
			showErrorAlert(deleteError || 'Kunde inte ta bort ingrediensen');
			return;
		}

		showSuccessAlert('Ingrediens borttagen');
		await mutate('ingredients');
	};

	const filteredIngredients = useMemo(() => {
		const searchText = search.trim().toLowerCase();
		const allIngredients = ingredients ?? [];

		return allIngredients
			.filter((ingredient) => {
				if (incompleteOnly 
                    && (
                        (ingredient.weightPerUnit == null && ingredient.unit != "weight")
                        || (ingredient.calories == null)
                        || (ingredient.protein == null)
                        || (ingredient.carbohydrates == null)
                        || (ingredient.fat == null)
                    )
                ) {
					return true;
				}
				if (incompleteOnly) {
					return false;
				}

				return true;
			})
			.filter((ingredient) => {
				if (!searchText) {
					return true;
				}

				return ingredient.name.toLowerCase().includes(searchText);
			})
			.sort((a, b) => a.name.localeCompare(b.name));
	}, [ingredients, search, incompleteOnly]);

	return (
		<Box sx={{ p: 2, maxWidth: 1200, mx: 'auto' }}>
			<Stack spacing={2}>
				<FullCard>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
						<TextField
							label="Sök ingrediens"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							autoFocus
						/>
						<FormControlLabel
							control={
								<Switch
									checked={incompleteOnly}
									onChange={(event) => setIncompleteOnly(event.target.checked)}
								/>
							}
							label="Endast ofullständiga"
						/>
						</Box>
						<Box sx={{ display: 'flex', alignItems: 'center' }}>
							<Tooltip title="Skapa ingrediens">
								<IconButton
									aria-label="Skapa ingrediens"
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
						<Typography color="error">Kunde inte hämta ingredienser</Typography>
					) : (
						<Stack spacing={1}>
							<TableContainer>
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell rowSpan={2}>Namn</TableCell>
											<TableCell rowSpan={2}>Enhet</TableCell>
											<TableCell rowSpan={2}>Standard volymenhet</TableCell>
											<TableCell rowSpan={2}>Vikt per enhet (dl/st)</TableCell>
											<TableCell rowSpan={2} align="center">Kalorier</TableCell>
											<TableCell colSpan={3} align="center">Macros (per 100g)</TableCell>
											<TableCell rowSpan={2} align="right"></TableCell>
										</TableRow>
										<TableRow>
											<TableCell align="right">Protein</TableCell>
											<TableCell align="right">Kolhydrater</TableCell>
											<TableCell align="right">Fett</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{filteredIngredients.map((ingredient) => {
											const rowId = ingredient.id;
											const nameKey = `${rowId}:name`;
											const unitKey = `${rowId}:unit`;
											const volumeKey = `${rowId}:defaultVolumeInputType`;
											const weightKey = `${rowId}:weightPerUnit`;
											const caloriesKey = `${rowId}:calories`;
											const proteinKey = `${rowId}:protein`;
											const carbsKey = `${rowId}:carbohydrates`;
											const fatKey = `${rowId}:fat`;

											const weightPerUnit = ingredient.weightPerUnit != null
												? (ingredient.unit === 'volume' ? ingredient.weightPerUnit * 100 : ingredient.weightPerUnit)
												: null;
											const calories = ingredient.calories;
											const protein = ingredient.protein;
											const carbohydrates = ingredient.carbohydrates;
											const fat = ingredient.fat;
											return (
												<TableRow key={ingredient.id ?? ingredient.name} hover>
													<TableCell>
														{editMode ? (
															<TextField
																size="small"
																sx={{ minWidth: 260 }}
																value={getFieldValue(ingredient, 'name')}
																onChange={(event) => handleCellChange(ingredient, 'name', event.target.value)}
																onBlur={() => handleCellBlur(ingredient, 'name')}
																onKeyDown={(event) => {
																	if (event.key === 'Escape') {
																		handleCellEscape(ingredient, 'name');
																		(event.target as HTMLInputElement).blur();
																	}
																}}
																disabled={Boolean(savingCell[nameKey])}
															/>
														) : ingredient.name}
													</TableCell>
													<TableCell>
														{editMode ? (
															<TextField
																size="small"
																select
																value={getFieldValue(ingredient, 'unit')}
																onChange={(event) => handleCellChange(ingredient, 'unit', event.target.value)}
																onBlur={() => handleCellBlur(ingredient, 'unit')}
																onKeyDown={(event) => {
																	if (event.key === 'Escape') {
																		handleCellEscape(ingredient, 'unit');
																		(event.target as HTMLInputElement).blur();
																	}
																}}
																disabled={Boolean(savingCell[unitKey])}
															>
																{unitOptions.map((option) => (
																	<MenuItem key={option} value={option}>{option}</MenuItem>
																))}
															</TextField>
														) : ingredient.unit}
													</TableCell>
													<TableCell>
														{editMode ? (
															<TextField
																size="small"
																select
																value={getFieldValue(ingredient, 'defaultVolumeInputType')}
																onChange={(event) => handleCellChange(ingredient, 'defaultVolumeInputType', event.target.value)}
																onBlur={() => handleCellBlur(ingredient, 'defaultVolumeInputType')}
																onKeyDown={(event) => {
																	if (event.key === 'Escape') {
																		handleCellEscape(ingredient, 'defaultVolumeInputType');
																		(event.target as HTMLInputElement).blur();
																	}
																}}
																disabled={Boolean(savingCell[volumeKey])}
															>
																<MenuItem value="">-</MenuItem>
																{volumeTypes.map((option) => (
																	<MenuItem key={option} value={option}>{option}</MenuItem>
																))}
															</TextField>
														) : ingredient.defaultVolumeInputType ?? '-'}
													</TableCell>
													<TableCell align="right">
														{editMode ? (
															<TextField
																size="small"
																type="text"
																value={getFieldValue(ingredient, 'weightPerUnit')}
																onChange={(event) => handleCellChange(ingredient, 'weightPerUnit', event.target.value)}
																onBlur={() => handleCellBlur(ingredient, 'weightPerUnit')}
																onKeyDown={(event) => {
																	if (event.key === 'Escape') {
																		handleCellEscape(ingredient, 'weightPerUnit');
																		(event.target as HTMLInputElement).blur();
																	}
																}}
                                                                slotProps={{
                                                                    input: {
                                                                        endAdornment: <InputAdornment position="end">g</InputAdornment>
                                                                    }
                                                                }}
																disabled={Boolean(savingCell[weightKey])}
															/>
														) : weightPerUnit != null ? `${weightPerUnit} g` : '-'}
													</TableCell>
													<TableCell align="right">
														{editMode ? (
															<TextField
																size="small"
																type="text"
																value={getFieldValue(ingredient, 'calories')}
																onChange={(event) => handleCellChange(ingredient, 'calories', event.target.value)}
																onBlur={() => handleCellBlur(ingredient, 'calories')}
																onKeyDown={(event) => {
																	if (event.key === 'Escape') {
																		handleCellEscape(ingredient, 'calories');
																		(event.target as HTMLInputElement).blur();
																	}
																}}
                                                                slotProps={{
                                                                    input: {
                                                                        endAdornment: <InputAdornment position="end">kcal</InputAdornment>
                                                                    }
                                                                }}
																disabled={Boolean(savingCell[caloriesKey])}
															/>
														) : calories != null ? `${calories} kcal` : '-'}
													</TableCell>
													<TableCell align="right">
														{editMode ? (
															<TextField
																size="small"
																type="text"
																value={getFieldValue(ingredient, 'protein')}
																onChange={(event) => handleCellChange(ingredient, 'protein', event.target.value)}
																onBlur={() => handleCellBlur(ingredient, 'protein')}
																onKeyDown={(event) => {
																	if (event.key === 'Escape') {
																		handleCellEscape(ingredient, 'protein');
																		(event.target as HTMLInputElement).blur();
																	}
																}}
                                                                slotProps={{
                                                                    input: {
                                                                        endAdornment: <InputAdornment position="end">g</InputAdornment>
                                                                    }
                                                                }}
																disabled={Boolean(savingCell[proteinKey])}
															/>
														) : protein != null ? `${protein} g` : '-'}
													</TableCell>
													<TableCell align="right">
														{editMode ? (
															<TextField
																size="small"
																type="text"
																value={getFieldValue(ingredient, 'carbohydrates')}
																onChange={(event) => handleCellChange(ingredient, 'carbohydrates', event.target.value)}
																onBlur={() => handleCellBlur(ingredient, 'carbohydrates')}
																onKeyDown={(event) => {
																	if (event.key === 'Escape') {
																		handleCellEscape(ingredient, 'carbohydrates');
																		(event.target as HTMLInputElement).blur();
																	}
																}}
                                                                slotProps={{
                                                                    input: {
                                                                        endAdornment: <InputAdornment position="end">g</InputAdornment>
                                                                    }
                                                                }}
																disabled={Boolean(savingCell[carbsKey])}
															/>
														) : carbohydrates != null ? `${carbohydrates} g` : '-'}
													</TableCell>
													<TableCell align="right">
														{editMode ? (
															<TextField
																size="small"
																type="text"
																value={getFieldValue(ingredient, 'fat')}
																onChange={(event) => handleCellChange(ingredient, 'fat', event.target.value)}
																onBlur={() => handleCellBlur(ingredient, 'fat')}
																onKeyDown={(event) => {
																	if (event.key === 'Escape') {
																		handleCellEscape(ingredient, 'fat');
																		(event.target as HTMLInputElement).blur();
																	}
																}}
                                                                slotProps={{
                                                                    input: {
                                                                        endAdornment: <InputAdornment position="end">g</InputAdornment>
                                                                    }
                                                                }}
																disabled={Boolean(savingCell[fatKey])}
															/>
														) : fat != null ? `${fat} g` : '-'}
													</TableCell>
													<TableCell align="right">
														<Tooltip title="Ta bort ingrediens">
															<span>
																<IconButton
																	size="small"
																	color="error"
																	onClick={() => handleDeleteIngredient(ingredient)}
																	disabled={deletingId === ingredient.id}
																>
																	<DeleteIcon fontSize="small" />
																</IconButton>
															</span>
														</Tooltip>
													</TableCell>
												</TableRow>
											);
										})}
										{filteredIngredients.length === 0 && (
											<TableRow>
												<TableCell colSpan={10} align="center">
													<Typography color="text.secondary">Inga ingredienser hittades</Typography>
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
			<IngredientCreateDialog
				open={createDialogOpen}
				onClose={() => setCreateDialogOpen(false)}
				onCreated={() => {
					void mutate('ingredients');
				}}
			/>
		</Box>
	);
}
