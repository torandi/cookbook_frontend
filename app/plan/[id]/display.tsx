'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import EditIcon from '@mui/icons-material/Edit'
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'

import FullCard from '@/app/components/fullcard'
import Spinner from '@/app/components/spinner'
import { usePlan, usePlanShoppingList } from '@/app/backend/plan'

function formatDate(dateStr: string): string {
	const date = new Date(dateStr + 'T00:00:00')
	return date.toLocaleDateString('sv-SE', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
	})
}

function formatQuantity(quantity: number | null, unit: string | null): string {
	if (quantity == null && unit == null) return ''
	if (quantity == null) return unit ?? ''
	if (unit == null) return String(quantity)
	return `${quantity} ${unit}`
}

export default function PlanDisplayPage({ planId }: { planId: number }) {
	const router = useRouter()
	const { plan, error: planError, isLoading: planLoading } = usePlan(planId)
	const { shoppingList, error: listError, isLoading: listLoading } = usePlanShoppingList(planId)

	if (planError) {
		return (
			<FullCard className="w-full">
				<Alert severity="error">Kunde inte ladda planen: {planError.message}</Alert>
			</FullCard>
		)
	}

	if (planLoading || !plan) {
		return (
			<FullCard className="w-full">
				<Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
					<Spinner />
				</Box>
			</FullCard>
		)
	}

	return (
		<Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: 'flex-start' }}>
			{/* Left: days & meals */}
			<FullCard sx={{ flex: 1 }}>
				<Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
					<Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
						{plan.name}
					</Typography>
					<Button
						variant="outlined"
						size="small"
						startIcon={<EditIcon />}
						onClick={() => router.push(`/plan/edit/${planId}`)}
					>
						Redigera
					</Button>
				</Stack>

				<Stack spacing={2}>
					{plan.days
						.slice()
						.sort((a, b) => a.date.localeCompare(b.date))
						.map((day, dayIdx) => (
							<Box key={day.id ?? dayIdx}>
								<Typography
									variant="subtitle1"
									sx={{ textTransform: 'capitalize', mb: 0.5, fontWeight: 600}}
								>
									{formatDate(day.date)}
								</Typography>
								<Stack spacing={0.5} sx={{ pl: 1 }}>
									{day.meals.map((meal, mealIdx) => (
										<Stack
											key={meal.id ?? mealIdx}
											spacing={0.25}
											sx={{ py: 0.25 }}
										>
											<Box
												sx={{
													display: 'grid',
													gridTemplateColumns: '70px minmax(0, 1fr) auto',
													columnGap: 1,
													alignItems: 'center',
												}}
											>
												<Typography variant="body2" sx={{ fontWeight: 500 }}>
													{meal.name.trimEnd() ? meal.name : 'Måltid'}
												</Typography>
												{meal.recipe ? (
													<Link
														href={`/recipe/${meal.recipe.id}`}
														target="_blank"
														rel="noopener noreferrer"
														style={{ display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 0 }}
													>
														<RestaurantMenuRoundedIcon
															fontSize="small"
															sx={{ color: 'primary.main' }}
														/>
														<Typography variant="body2" color="primary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
															{meal.recipe.name}
														</Typography>
													</Link>
												) : (
													<Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
														Inget recept
													</Typography>
												)}
												<Chip
													size="small"
													variant="outlined"
													label={`${meal.portions} port.`}
													sx={{ height: 22, '& .MuiChip-label': { px: 1, fontWeight: 500 } }}
												/>
												{meal.comment ? (
													<Typography
														variant="caption"
														color="text.disabled"
														sx={{ gridColumn: '2 / 4' }}
													>
														{meal.comment}
													</Typography>
												) : null}
											</Box>
										</Stack>
									))}
								</Stack>
								{dayIdx < plan.days.length - 1 && <Divider sx={{ mt: 1.5 }} />}
							</Box>
						))}
				</Stack>
			</FullCard>

			{/* Right: shopping list */}
			<FullCard sx={{ flex: 1 }}>
				<Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
					<ShoppingCartIcon color="primary" />
					<Typography variant="h6" sx={{ fontWeight: 700 }}>
						Inköpslista
					</Typography>
				</Stack>

				{listLoading && (
					<Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
						<Spinner />
					</Box>
				)}

				{listError && (
					<Alert severity="error">Kunde inte ladda inköpslistan: {listError.message}</Alert>
				)}

				{!listLoading && !listError && (!shoppingList || shoppingList.items.length === 0) && (
					<Typography color="text.secondary">Inköpslistan är tom.</Typography>
				)}

				{!listLoading && !listError && shoppingList && shoppingList.items.length > 0 && (
					<List dense disablePadding>
						{shoppingList.items.map((item, idx) => (
							<ListItem
								key={idx}
								disableGutters
								sx={{
									py: 0.75,
									px: 1,
									borderRadius: 1,
									backgroundColor: idx % 2 === 0 ? 'action.hover' : 'action.selected',
								}}
							>
								<ListItemText
									primary={item.ingredientName}
									secondary={item.comment ?? undefined}
								/>
								<Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
									{formatQuantity(item.quantity, item.unit)}
								</Typography>
							</ListItem>
						))}
					</List>
				)}
			</FullCard>
		</Stack>
	)
}
