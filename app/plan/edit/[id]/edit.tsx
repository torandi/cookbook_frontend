'use client'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'

import PlanEditorPage from '@/app/plan/editor/editor'
import FullCard from '@/app/components/fullcard'
import Spinner from '@/app/components/spinner'
import { usePlan } from '@/app/backend/plan'

export default function PlanEditPage({ planId }: { planId: number }) {
	const { plan, error, isLoading } = usePlan(planId)

	if (error) {
		return (
			<FullCard className="w-full">
				<Alert severity="error">Kunde inte ladda planen: {error.message}</Alert>
			</FullCard>
		)
	}

	if (isLoading || !plan) {
		return (
			<FullCard className="w-full">
				<Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
					<Spinner />
				</Box>
			</FullCard>
		)
	}

	return <PlanEditorPage title="Redigera plan" planId={planId} initialPlan={plan} />
}
