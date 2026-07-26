'use client'

import { useRouter } from 'next/navigation'
import { mutate } from 'swr'

import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'

import FullCard from '@/app/components/fullcard'
import Spinner from '@/app/components/spinner'
import { showErrorAlert, showSuccessAlert } from '@/app/ui/alert-state'
import { usePlans, deletePlan } from '@/app/backend/plan'
import { PlanType } from '@/app/types/plan'

function planDateRange(plan: PlanType): string {
	if (plan.days.length === 0) return 'Inga dagar'
	const sorted = plan.days.map((d) => d.date).sort()
	const fmt = (d: string) =>
		new Date(d + 'T00:00:00').toLocaleDateString('sv-SE', {
			day: 'numeric',
			month: 'short',
		})
	if (sorted[0] === sorted[sorted.length - 1]) return fmt(sorted[0])
	return `${fmt(sorted[0])} – ${fmt(sorted[sorted.length - 1])}`
}

export default function PlanListPage() {
	const router = useRouter()
	const { plans, isLoading, error } = usePlans()

	async function handleDelete(e: React.MouseEvent, id: number) {
		e.stopPropagation()
		if (!confirm('Ta bort planen?')) return
		const { error } = await deletePlan(id)
		if (error) {
			showErrorAlert(error)
		} else {
			showSuccessAlert('Planen togs bort')
			mutate('plans/')
		}
	}

	return (
		<Box sx={{ maxWidth: 800, mx: 'auto' }}>
			<FullCard>
				<Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
					<Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
						<Avatar sx={{ bgcolor: 'primary.main', width: 42, height: 42 }}>
							<CalendarMonthIcon fontSize="small" />
						</Avatar>
					<Typography variant="h5" sx={{ fontWeight: 700 }}>
							Planering
						</Typography>
					</Stack>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={() => router.push('/plan/add')}
					>
						Ny plan
					</Button>
				</Stack>

				{isLoading && (
					<Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
						<Spinner />
					</Box>
				)}

				{error && (
					<Alert severity="error">Kunde inte ladda planer: {error.message}</Alert>
				)}

				{!isLoading && !error && plans.length === 0 && (
					<Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
						Inga planer ännu.
					</Typography>
				)}

				{!isLoading && !error && plans.length > 0 && (
					<List disablePadding>
						{plans.map((plan, idx) => (
							<Box key={plan.id}>
								{idx > 0 && <Divider />}
								<ListItem
									disablePadding
									secondaryAction={
										<Stack direction="row" spacing={0.5}>
											<Tooltip title="Redigera">
												<IconButton
													size="small"
													onClick={(e) => {
														e.stopPropagation()
														router.push(`/plan/edit/${plan.id}`)
													}}
												>
													<EditIcon fontSize="small" />
												</IconButton>
											</Tooltip>
											<Tooltip title="Ta bort">
												<IconButton
													size="small"
													color="error"
													onClick={(e) => handleDelete(e, plan.id!)}
												>
													<DeleteIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</Stack>
									}
								>
									<ListItemButton onClick={() => router.push(`/plan/${plan.id}`)}>
										<ListItemText
											primary={plan.name}
											secondary={`${planDateRange(plan)} · ${plan.days.length} dag${plan.days.length !== 1 ? 'ar' : ''}`}
										/>
									</ListItemButton>
								</ListItem>
							</Box>
						))}
					</List>
				)}
			</FullCard>
		</Box>
	)
}
