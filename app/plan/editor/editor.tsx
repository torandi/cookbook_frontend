'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import RemoveIcon from '@mui/icons-material/Remove'
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded'

import FullCard from '@/app/components/fullcard'
import { showErrorAlert, showSuccessAlert } from '@/app/ui/alert-state'
import { addPlan, updatePlan } from '@/app/backend/plan'
import { PlanType } from '@/app/types/plan'
import { RecipeSummaryType } from '@/app/types/recipe'
import {
	usePlanEditorStore,
	editorStateToPlan,
	EditorDay,
	EditorMeal,
	PlanEditorDraft,
} from './state'
import AddDaysDialog from './addDaysDialog'
import RecipePickDialog from './recipePickDialog'
import { getPlanDraftKey, loadPlanDraft, clearPlanDraft, savePlanDraft } from './draft'
import { useUnload } from '@/app/lifetimeHooks'

type PlanEditorPageProps = {
	title: string
	planId?: number
	initialPlan?: PlanType
}

function formatDate(dateStr: string): string {
	const date = new Date(dateStr + 'T00:00:00')
	return date.toLocaleDateString('sv-SE', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
	})
}

type MealRowProps = {
	dayLocalId: number
	meal: EditorMeal
}

function MealRow({ dayLocalId, meal }: MealRowProps) {
	const [editing, setEditing] = useState(false)
	const [editValue, setEditValue] = useState(meal.name)
	const [recipeOpen, setRecipeOpen] = useState(false)

	const renameMeal = usePlanEditorStore((s) => s.renameMeal)
	const setComment = usePlanEditorStore((s) => s.setComment)
	const removeMeal = usePlanEditorStore((s) => s.removeMeal)
	const setRecipe = usePlanEditorStore((s) => s.setRecipe)
	const setPortions = usePlanEditorStore((s) => s.setPortions)

	function commitRename() {
		const trimmed = editValue.trim()
		if (trimmed) {
			renameMeal(dayLocalId, meal.localId, trimmed)
		} else {
			setEditValue(meal.name)
		}
		setEditing(false)
	}

	function startEditing() {
		setEditValue(meal.name)
		setEditing(true)
	}

	return (
		<Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
			{editing ? (
				<TextField
					size="small"
					value={editValue}
					onChange={(e) => setEditValue(e.target.value)}
					onBlur={commitRename}
					onKeyDown={(e) => {
						if (e.key === 'Enter') commitRename()
						if (e.key === 'Escape') { setEditValue(meal.name); setEditing(false) }
					}}
					autoFocus
					sx={{ width: 130 }}
				/>
			) : (
				<Typography
					variant="body2"
					onClick={startEditing}
					sx={{
						fontWeight: 600,
						minWidth: 60,
						cursor: 'pointer',
						'&:hover': { textDecoration: 'underline' },
					}}
				>
					{meal.name.trim() ? meal.name : '(namnlös måltid)'}
				</Typography>
			)}

			<Chip
				label={meal.recipe?.name ?? 'Inget recept'}
				size="small"
				icon={<RestaurantMenuRoundedIcon fontSize="small" />}
				variant={meal.recipe ? 'filled' : 'outlined'}
				onClick={() => setRecipeOpen(true)}
				sx={{ cursor: 'pointer', maxWidth: 260 }}
			/>

			<TextField
				size="small"
				label="Tillbehör"
				value={meal.comment ?? ''}
				onChange={(e) => setComment(dayLocalId, meal.localId, e.target.value)}
				sx={{ minWidth: 220, flex: 1 }}
			/>

		<Stack direction="row" spacing={0} sx={{ alignItems: 'center' }}>
			<IconButton size="small" onClick={() => setPortions(dayLocalId, meal.localId, meal.portions - 1)}>
				<RemoveIcon fontSize="small" />
			</IconButton>
			<Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
				{meal.portions}
			</Typography>
			<IconButton size="small" onClick={() => setPortions(dayLocalId, meal.localId, meal.portions + 1)}>
				<AddIcon fontSize="small" />
			</IconButton>
			<IconButton
				size="small"
				color="error"
				onClick={() => removeMeal(dayLocalId, meal.localId)}
			>
				<DeleteIcon fontSize="small" />
			</IconButton>
		</Stack>

			<RecipePickDialog
				open={recipeOpen}
				onClose={() => setRecipeOpen(false)}
				currentRecipe={meal.recipe}
				onSelect={(recipe: RecipeSummaryType | null) => setRecipe(dayLocalId, meal.localId, recipe)}
			/>
		</Stack>
	)
}

type DayCardProps = {
	day: EditorDay
}

function DayCard({ day }: DayCardProps) {
	const removeDay = usePlanEditorStore((s) => s.removeDay)
	const addMeal = usePlanEditorStore((s) => s.addMeal)

	return (
		<Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
			<Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
				<Typography variant="subtitle1" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
					{formatDate(day.date)}
				</Typography>
				<IconButton size="small" color="error" onClick={() => removeDay(day.localId)}>
					<DeleteIcon fontSize="small" />
				</IconButton>
			</Stack>

			<Stack spacing={0.75}>
				{day.meals.map((meal) => (
					<MealRow key={meal.localId} dayLocalId={day.localId} meal={meal} />
				))}
			</Stack>

			<Button
				size="small"
				startIcon={<AddIcon />}
				sx={{ mt: 1 }}
				onClick={() => addMeal(day.localId, 'Måltid')}
			>
				Lägg till måltid
			</Button>
		</Box>
	)
}

export default function PlanEditorPage({ title, planId, initialPlan }: PlanEditorPageProps) {
	const [addDaysOpen, setAddDaysOpen] = useState(false)
	const [saving, setSaving] = useState(false)
	const [pendingDraft, setPendingDraft] = useState<PlanEditorDraft | null>(null)
	const router = useRouter()
	const draftKey = getPlanDraftKey(planId)

	const name = usePlanEditorStore((s) => s.name)
	const days = usePlanEditorStore((s) => s.days)
	const setName = usePlanEditorStore((s) => s.setName)
	const addDays = usePlanEditorStore((s) => s.addDays)
	const setFromPlan = usePlanEditorStore((s) => s.setFromPlan)
	const resetState = usePlanEditorStore((state) => state.reset)

	const abortEdit = () => {
		clearPlanDraft(planId)
		resetState()
		if (planId !== undefined) {
			router.push(`/plan/${planId}`)
		} else {
			router.push('/plan')
		}
	}

	function handleRestoreDraft() {
		const draft = loadPlanDraft(draftKey)
		if (draft) {
			usePlanEditorStore.setState(draft)
		}
		clearPlanDraft(planId)
		setPendingDraft(null)
	}

	function handleDiscardDraft() {
		clearPlanDraft(planId)
		setPendingDraft(null)

		if (initialPlan) {
			setFromPlan(initialPlan)
		}
	}

	const saveDraft = () => {
		const state = usePlanEditorStore.getState()
		if (state.name.trim() === '' && state.days.length === 0) {
			// don't save if plan is empty
			return
		}
		savePlanDraft(draftKey, state as PlanEditorDraft)
	}

	// Save draft if tab is closed or page is refreshed
	useUnload((event: BeforeUnloadEvent) => {
		saveDraft()
	})

	useEffect(() => {
		const draft = loadPlanDraft(draftKey)
		if (draft !== null) {
			setPendingDraft(draft)
		} else if (initialPlan) {
			setFromPlan(initialPlan)
		}
	}, [draftKey, initialPlan?.id, setFromPlan])

	async function handleSave() {
		if (!name.trim()) {
			showErrorAlert('Planen saknar namn')
			return
		}
		setSaving(true)
		const planData = editorStateToPlan(name, days, planId ?? null)
		const { data, error } = planId
			? await updatePlan(planId, planData)
			: await addPlan(planData)
		setSaving(false)

		if (error) {
			showErrorAlert(error)
			return
		}

		showSuccessAlert('Planen sparades')
		clearPlanDraft(planId)
		router.push(data?.id ? `/plan/${data.id}` : '/plan')
	}

	return (
		<Stack spacing={2}>
			<Dialog open={pendingDraft !== null} onClose={handleDiscardDraft}>
				<DialogTitle>Återställ utkast</DialogTitle>
				<DialogContent>
					<DialogContentText>
						{ planId !== undefined ?
						`Det finns ett sparat utkast för denna plan. Vill du återställa det?`
						: `Det finns ett sparat utkast för ${pendingDraft?.name ?? 'planen'}. Vill du återställa det?`
						}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDiscardDraft} color="inherit">
						Ta bort utkast
					</Button>
					<Button onClick={handleRestoreDraft} variant="contained" autoFocus>
						Återställ utkast
					</Button>
				</DialogActions>
			</Dialog>

			<FullCard>
				<Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', mb: 2 }}>
					<Button
						variant="outlined"
						onClick={abortEdit}
					>
						Avbryt
					</Button>
					<Button variant="contained" onClick={handleSave} disabled={saving}>
						{saving ? 'Sparar...' : 'Spara'}
					</Button>
				</Stack>

				<Typography variant="h4" component="h1" sx={{ mb: 2 }}>
					{title}
				</Typography>

				<Stack spacing={2}>
					<TextField
						label="Plannamn"
						value={name}
						onChange={(e) => setName(e.target.value)}
						size="small"
						sx={{ maxWidth: 400 }}
					/>
					<Box>
						<Button
							variant="outlined"
							startIcon={<AddIcon />}
							onClick={() => setAddDaysOpen(true)}
						>
							Lägg till dagar
						</Button>
					</Box>
				</Stack>
			</FullCard>

			{days.length > 0 && (
				<FullCard>
					<Typography variant="h6" sx={{ mb: 2 }}>
						Dagar ({days.length})
					</Typography>
					<Stack spacing={1.5}>
						{days.map((day) => (
							<DayCard key={day.localId} day={day} />
						))}
					</Stack>
				</FullCard>
			)}

			<AddDaysDialog
				open={addDaysOpen}
				onClose={() => setAddDaysOpen(false)}
				onAdd={addDays}
			/>
		</Stack>
	)
}
