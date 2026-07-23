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
				if (incompleteOnly && ingredient.weightPerUnit == null && ingredient.unit != "weight") {
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

				const searchableFields = [
					String(ingredient.id ?? ''),
					ingredient.name ?? '',
					ingredient.unit ?? '',
					ingredient.defaultVolumeInputType ?? '',
					String(ingredient.weightPerUnit ?? ''),
				].join(' ').toLowerCase();

				return searchableFields.includes(searchText);
			})
			.sort((a, b) => a.name.localeCompare(b.name));
	}, [ingredients, search, incompleteOnly]);

	return (
		<Box sx={{ p: 2, maxWidth: 1200, mx: 'auto' }}>
			<Stack spacing={2}>
				<FullCard>
					<Stack spacing={2} direction="row">
						<TextField
							fullWidth
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
							<Typography color="text.secondary">
								{filteredIngredients.length} träffar
							</Typography>
							<TableContainer>
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell>ID</TableCell>
											<TableCell>Namn</TableCell>
											<TableCell>Enhet</TableCell>
											<TableCell>Standard volymenhet</TableCell>
											<TableCell align="right">Vikt per enhet (dl/st)</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{filteredIngredients.map((ingredient) => {
                                            const weightPerUnit = ingredient.unit == "volume" && ingredient.weightPerUnit ?
                                                ingredient.weightPerUnit * 100 : ingredient.weightPerUnit;
											return (
												<TableRow key={ingredient.id ?? ingredient.name} hover>
													<TableCell>{ingredient.id ?? '-'}</TableCell>
													<TableCell>{ingredient.name}</TableCell>
													<TableCell>{ingredient.unit}</TableCell>
													<TableCell>{ingredient.defaultVolumeInputType ?? '-'}</TableCell>
													<TableCell align="right">{weightPerUnit ? weightPerUnit + " g" : '-'}</TableCell>
												</TableRow>
											);
										})}
										{filteredIngredients.length === 0 && (
											<TableRow>
												<TableCell colSpan={6}>
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
