'use client';

import { Suspense, useState, useEffect } from 'react';
import { filterRecipes } from '@/app/types/recipe';	
import FullCard from '@/app/components/fullcard';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import { useRecipes } from '@/app/backend/recipe';
import { formatTime } from '@/app/utils';
import TagAutocomplete from '@/app/components/tagAutocomplete';
import type { TagType } from '@/app/types/tag';

function RecipeListContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [search, setSearch] = useState(searchParams?.get('search') ?? '');
	const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
	const { recipes, isLoading, error } = useRecipes();

	// Sync search input if URL param changes (e.g. navigating from global search)
	useEffect(() => {
		setSearch(searchParams?.get('search') ?? '');
	}, [searchParams]);

	const filtered = filterRecipes(recipes, search, selectedTags);
	const totalCount = recipes.length;
	const filteredCount = filtered.length;

	return (
		<Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 900, mx: 'auto' }}>
			<FullCard
				sx={{
					mb: 2,
					background:
						'linear-gradient(135deg, rgba(37,99,235,0.09) 0%, rgba(14,165,233,0.14) 55%, rgba(16,185,129,0.12) 100%)',
				}}
				className="w-full"
			>
				<Stack spacing={2}>
					<Stack
						direction={{ xs: 'column', sm: 'row' }}
						spacing={1.5}
						sx={{
							alignItems: { sm: 'center' },
							justifyContent: 'space-between',
						}}>
						<Stack
							direction="row"
							spacing={1.25}
							sx={{ alignItems: 'center' }}>
							<Avatar
								sx={{
									bgcolor: 'primary.main',
									width: 42,
									height: 42,
									boxShadow: '0 6px 16px rgba(37, 99, 235, 0.35)',
								}}
							>
								<RestaurantMenuRoundedIcon fontSize="small" />
							</Avatar>
							<Box>
								<Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
									Receptsamling
								</Typography>
								<Typography color="text.secondary">
								</Typography>
							</Box>
						</Stack>
						<Chip
							icon={<MenuBookRoundedIcon />}
							label={`${filteredCount} av ${totalCount} recept`}
							color="primary"
							variant="filled"
							sx={{
								fontWeight: 600,
								alignSelf: { xs: 'flex-start', sm: 'center' },
								display: { xs: 'none', sm: 'flex' },
							}}
						/>
					</Stack>
					<Box className="flex flex-col md:flex-row gap-2">
						<TextField
							label="Sök recept"
							value={search}
							onChange={e => setSearch(e.target.value)}
							autoFocus
							fullWidth
							size="small"
							className="w-full md:w-1/2"
							slotProps={{
								input: {
									startAdornment: (
										<InputAdornment position="start">
											<SearchRoundedIcon color="primary" fontSize="small" />
										</InputAdornment>
									),
								},
							}}
							sx={{
								'& .MuiOutlinedInput-root': {
									bgcolor: 'rgba(255,255,255,0.82)',
									backdropFilter: 'blur(6px)',
									borderRadius: 2,
								},
							}}
						/>
						<TagAutocomplete
							label="Taggar"
							value={selectedTags}
							onChange={setSelectedTags}
							creatable={false}
							className="w-full md:w-1/2"
							size="small"
							sx={{
								'& .MuiOutlinedInput-root': {
									bgcolor: 'rgba(255,255,255,0.82)',
									backdropFilter: 'blur(6px)',
									borderRadius: 2,
								},
							}}
						/>
					</Box>
				</Stack>
			</FullCard>
			{isLoading && (
				<Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
					<Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
						<CircularProgress size={24} />
						<Typography color="text.secondary">Laddar recept...</Typography>
					</Stack>
				</Box>
			)}
			{error && (
				<Alert severity="error" sx={{ mb: 2 }}>
					Kunde inte hämta recept
				</Alert>
			)}
			{!isLoading && !error && (
				<FullCard sx={{ overflow: 'hidden' }} className="w-full">
					<List sx={{ py: 0 }}>
					{filtered.map((recipe, index) => (
						<Box key={recipe.id}>
							<ListItemButton
								onClick={() => router.push(`/recipe/${recipe.id}`)}
								sx={{
									py: 1.5,
									borderRadius: 1,
									'&:hover': {
										bgcolor: 'rgba(59,130,246,0.10)',
									},
								}}
							>
								<Box
									sx={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'flex-start',
										gap: 2,
										width: '100%',
									}}
								>
									<Box sx={{ minWidth: 0, flex: 1 }}>
										<ListItemText
											primary={recipe.name}
											secondary={recipe.description?.trim() ?? ''}
											slotProps={{
												primary: {
													sx: { fontWeight: 600 },
												},
												secondary: {
													sx: { color: 'text.secondary' },
												},
											}}
										/>
										{recipe.tags?.length ? (
											<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
												{recipe.tags.map(tag => (
													<Chip
														key={tag.id}
														label={tag.name}
														size="small"
														sx={{
															backgroundColor: tag.color,
															color: (theme) => theme.palette.getContrastText(tag.color),
														}}
													/>
												))}
											</Box>
										) : null}
									</Box>
									{(recipe.totalTime != null || recipe.activeTime != null) && (
										<Stack
											spacing={0.2}
											sx={{
												textAlign: 'right',
												minWidth: { xs: 92, sm: 118 },
												alignSelf: 'center',
											}}
										>
											{recipe.totalTime != null && (
												<Box>
													<Typography variant="caption" color="text.secondary" sx={{ fontWeight: 400 }}>
														Total tid:&nbsp;
													</Typography>
													<Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
														{formatTime(recipe.totalTime)}
													</Typography>
												</Box>
											)}
											{recipe.activeTime != null && (
												<Box>
													<Typography variant="caption" color="text.secondary" sx={{ fontWeight: 400 }}>
														Aktiv tid:&nbsp;
													</Typography>
													<Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
														{formatTime(recipe.activeTime)}
													</Typography>
												</Box>
											)}
										</Stack>
									)}
								</Box>
							</ListItemButton>
							{index < filtered.length - 1 && <Divider component="li" />}
						</Box>
						))}
						{filtered.length === 0 && (
							<Box sx={{ py: 7, px: 3, textAlign: 'center' }}>
								<Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75 }}>
									Inga recept hittades
								</Typography>
								<Typography color="text.secondary">
									Testa ett annat sökord eller rensa sökningen.
								</Typography>
							</Box>
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

