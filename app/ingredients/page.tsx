'use client';

import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useIngredients } from '@/app/backend/ingredient';
import FullCard from '@/app/components/fullcard';
import Spinner from '@/app/components/spinner';

export default function IngredientsPage() {
	const [search, setSearch] = useState('');
	const [incompleteOnly, setIncompleteOnly] = useState(false);
	const { ingredients, isLoading, error } = useIngredients();

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
					<Stack spacing={2} direction="row">
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
					</Stack>
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
											<TableCell rowSpan={2} align="right">Vikt per enhet (dl/st)</TableCell>
											<TableCell rowSpan={2} align="right">Kalorier</TableCell>
											<TableCell colSpan={3} align="center">Macros</TableCell>
										</TableRow>
										<TableRow>
											<TableCell align="right">Protein</TableCell>
											<TableCell align="right">Kolhydrater</TableCell>
											<TableCell align="right">Fett</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{filteredIngredients.map((ingredient) => {
                                            const weightPerUnit = ingredient.unit == "volume" && ingredient.weightPerUnit ?
                                                ingredient.weightPerUnit * 100 : ingredient.weightPerUnit;
											const calories = ingredient.calories;
											const protein = ingredient.protein;
											const carbohydrates = ingredient.carbohydrates;
											const fat = ingredient.fat;
											return (
												<TableRow key={ingredient.id ?? ingredient.name} hover>
													<TableCell>{ingredient.name}</TableCell>
													<TableCell>{ingredient.unit}</TableCell>
													<TableCell>{ingredient.defaultVolumeInputType ?? '-'}</TableCell>
													<TableCell align="right">{weightPerUnit ? weightPerUnit + " g" : '-'}</TableCell>
													<TableCell align="right">{calories != null ? calories : '-'}</TableCell>
													<TableCell align="right">{protein != null ? protein : '-'}</TableCell>
													<TableCell align="right">{carbohydrates != null ? carbohydrates : '-'}</TableCell>
													<TableCell align="right">{fat != null ? fat : '-'}</TableCell>
												</TableRow>
											);
										})}
										{filteredIngredients.length === 0 && (
											<TableRow>
												<TableCell colSpan={9} align="center">
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
		</Box>
	);
}
