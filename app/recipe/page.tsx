'use client';

import { Suspense, useState, useEffect } from 'react';
import FullCard from '@/app/components/fullcard';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useRecipes } from '@/app/backend/recipe';

function RecipeListContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [search, setSearch] = useState(searchParams?.get('search') ?? '');
	const { recipes, isLoading, error } = useRecipes();

	// Sync search input if URL param changes (e.g. navigating from global search)
	useEffect(() => {
		setSearch(searchParams?.get('search') ?? '');
	}, [searchParams]);

	const filtered = recipes.filter(r =>
		r.name.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<Box sx={{ p: 2, maxWidth: 800, mx: 'auto' }}>
			<FullCard sx={{ mb: 2 }} className="w-full">
				<TextField
					fullWidth
					label="Sök recept"
					value={search}
					onChange={e => setSearch(e.target.value)}
					autoFocus
				/>
			</FullCard>
			{isLoading && <CircularProgress />}
			{error && <Typography color="error">Kunde inte hämta recept</Typography>}
			{!isLoading && !error && (
				<FullCard className="w-full">
					<List>
					{filtered.map(recipe => (
							<ListItemButton
								key={recipe.id}
								onClick={() => router.push(`/recipe/${recipe.id}`)}
							>
								<ListItemText primary={recipe.name} />
							</ListItemButton>
						))}
						{filtered.length === 0 && (
							<Typography color="text.secondary" sx={{ p: 1 }}>
								Inga recept hittades
							</Typography>
						)}
					</List>
				</FullCard>
			)}
		</Box>
	);
}

export default function Page() {
	return (
		<Suspense>
			<RecipeListContent />
		</Suspense>
	);
}

