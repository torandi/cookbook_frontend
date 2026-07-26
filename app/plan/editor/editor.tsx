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

type PlanEditorPageProps = {
	title: string
	planId?: number
	initialPlan?: PlanType
}

function getPlanDraftKey(planId?: number) {
	return planId !== undefined
		? `cookbook-editor-draft:plan:edit:${planId}`
		: 'cookbook-editor-draft:plan:add'
}

function loadPlanDraft(key: string): PlanEditorDraft | null {
	if (typeof window === 'undefined') {
		return null
	}

	try {
		const raw = window.localStorage.getItem(key)
		if (!raw) {
			return null
		}
		const parsed = JSON.parse(raw) as PlanEditorDraft
		if (!parsed || !Array.isArray(parsed.days) || typeof parsed.name !== 'string' || typeof parsed.nextLocalId !== 'number') {
			return null
		}
		return parsed
	} catch {
		return null
	}
}

function savePlanDraft(key: string, draft: PlanEditorDraft) {
	if (typeof window === 'undefined') {
		return
	}

	window.localStorage.setItem(key, JSON.stringify(draft))
}

function clearPlanDraft(key: string) {
	if (typeof window === 'undefined') {
		return
	}

	window.localStorage.removeItem(key)
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
					{meal.name}
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
	const [draftDecisionResolved, setDraftDecisionResolved] = useState(false)
	const router = useRouter()
	const draftKey = getPlanDraftKey(planId)

	const name = usePlanEditorStore((s) => s.name)
	const days = usePlanEditorStore((s) => s.days)
	const nextLocalId = usePlanEditorStore((s) => s.nextLocalId)
	const setName = usePlanEditorStore((s) => s.setName)
	const addDays = usePlanEditorStore((s) => s.addDays)
	const reset = usePlanEditorStore((s) => s.reset)
	const setFromPlan = usePlanEditorStore((s) => s.setFromPlan)

	useEffect(() => {
		setDraftDecisionResolved(false)
		setPendingDraft(null)

		const draft = loadPlanDraft(draftKey)
		if (draft) {
			setPendingDraft(draft)
			return
		}

		if (initialPlan) {
			setFromPlan(initialPlan)
			setDraftDecisionResolved(true)
		} else {
			reset()
			setDraftDecisionResolved(true)
		}
	}, [draftKey, initialPlan?.id, reset, setFromPlan])

	function handleRestoreDraft() {
		if (pendingDraft) {
			usePlanEditorStore.setState({
				name: pendingDraft.name,
				days: pendingDraft.days,
				nextLocalId: pendingDraft.nextLocalId,
			})
		}
		setPendingDraft(null)
		setDraftDecisionResolved(true)
	}

	function handleDiscardDraft() {
		clearPlanDraft(draftKey)
		setPendingDraft(null)

		if (initialPlan) {
			setFromPlan(initialPlan)
		} else {
			reset()
		}

		setDraftDecisionResolved(true)
	}

	useEffect(() => {
		if (!draftDecisionResolved) {
			return
		}

		savePlanDraft(draftKey, { name, days, nextLocalId })
	}, [draftDecisionResolved, draftKey, name, days, nextLocalId])

	async function handleSave() {
		if (!name.trim()) {
			showErrorAlert('Planens namn saknas')
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
		clearPlanDraft(draftKey)
		router.push(data?.id ? `/plan/${data.id}` : '/plan')
	}

	return (
		<Stack spacing={2}>
			<Dialog open={pendingDraft !== null} onClose={handleDiscardDraft}>
				<DialogTitle>Återställ utkast</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Det finns ett sparat utkast för den här planen. Vill du återställa det?
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
						onClick={() => {
							clearPlanDraft(draftKey)
							router.push(planId ? `/plan/${planId}` : '/plan')
						}}
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
