'use client'

import { Fragment, useEffect, useState } from 'react'
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
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import RemoveIcon from '@mui/icons-material/Remove'

import IngredientAutocomplete from '@/app/components/ingredientAutocomplete'
import FullCard from '@/app/components/fullcard'
import { showErrorAlert, showSuccessAlert } from '@/app/ui/alert-state'
import { addPlan, updatePlan } from '@/app/backend/plan'
import { MealExtraIngredientType, PlanType } from '@/app/types/plan'
import { IngredientType, defaultIngredientUnit, volumeTypes } from '@/app/types/ingredient'
import { RecipeSummaryType } from '@/app/types/recipe'
import {
	usePlanEditorStore,
	editorStateToPlan,
	EditorDay,
	EditorMeal,
	PlanEditorDraft,
} from './state'
import AddDaysDialog from './addDaysDialog'
import { getPlanDraftKey, loadPlanDraft, clearPlanDraft, savePlanDraft } from './draft'
import { RecipeMultiPicker } from '@/app/components/recipePicker'
import { useUnload } from '@/app/lifetimeHooks'
import { evalNumberExpression, formatQuantity } from '@/app/utils'

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

type MealExtraIngredientDialogProps = {
	open: boolean
	onClose: () => void
	onAdd: (ingredient: MealExtraIngredientType) => void
}

type ExtraIngredientUnit = 'st' | 'g' | 'portioner' | typeof volumeTypes[number]

function unitOptionsForIngredient(ingredient: IngredientType | null): ExtraIngredientUnit[] {
	if (!ingredient) {
		return []
	}

	const hasWeightOption = (ingredient.weightPerUnit ?? 0) > 0
	const hasPortionSizeOption = (ingredient.portionSize ?? 0) > 0

	switch (ingredient.unit) {
		case 'volume':
			return (hasWeightOption ? ['g', ...volumeTypes] : [...volumeTypes]).concat(hasPortionSizeOption ? ['portioner'] : []) as ExtraIngredientUnit[]
		case 'count':
			return (hasWeightOption ? ['st', 'g'] : ['st']).concat(hasPortionSizeOption ? ['portioner'] : []) as ExtraIngredientUnit[]
		case 'weight':
			return hasPortionSizeOption ? ['g', 'portioner'] : ['g']
	}
}

function formatExtraIngredientChipLabel(extraIngredient: MealExtraIngredientType) {
	return `${formatQuantity(extraIngredient.quantity, extraIngredient.unit)} ${extraIngredient.ingredient.name}`
}

function MealExtraIngredientDialog({ open, onClose, onAdd }: MealExtraIngredientDialogProps) {
	const [ingredient, setIngredient] = useState<IngredientType | null>(null)
	const [quantityInput, setQuantityInput] = useState('')
	const [unit, setUnit] = useState<ExtraIngredientUnit | ''>('')

	useEffect(() => {
		if (!open) {
			return
		}

		setIngredient(null)
		setQuantityInput('')
		setUnit('')
	}, [open])

	const unitOptions = unitOptionsForIngredient(ingredient)

	useEffect(() => {
		if (!ingredient) {
			setUnit('')
			return
		}

		const defaultUnit = defaultIngredientUnit(ingredient)
		if (!defaultUnit || !unitOptions.includes(defaultUnit)) {
			setUnit(unitOptions[0] ?? '')
			return
		}

		setUnit(defaultUnit)
	}, [ingredient])

	function handleAdd() {
		if (!ingredient) {
			showErrorAlert('Välj en ingrediens')
			return
		}

		const quantity = evalNumberExpression(quantityInput, null)
		if (quantity === null) {
			showErrorAlert('Ange en giltig mängd')
			return
		}

		if (!unit) {
			showErrorAlert('Välj en enhet')
			return
		}

		onAdd({
			ingredient,
			quantity,
			unit,
		})
		onClose()
	}

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>Lägg till ingrediens</DialogTitle>
			<DialogContent>
				<Stack spacing={2} sx={{ pt: 1 }}>
					<IngredientAutocomplete
						id="meal-extra-ingredient"
						value={ingredient}
						onChange={setIngredient}
					/>
					<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
						<TextField
							label="Mängd"
							value={quantityInput}
							onChange={(event) => setQuantityInput(event.target.value)}
							className="flex-1"
						/>
						<TextField
							label="Enhet"
							value={unit}
							onChange={(event) => setUnit(event.target.value as ExtraIngredientUnit)}
							select
							className="flex-1"
							disabled={unitOptions.length === 0}
						>
							{unitOptions.map((value) => (
								<MenuItem key={value} value={value}>{value}</MenuItem>
							))}
						</TextField>
					</Stack>
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Avbryt</Button>
				<Button variant="contained" onClick={handleAdd}>Lägg till</Button>
			</DialogActions>
		</Dialog>
	)
}

function MealRow({ dayLocalId, meal }: MealRowProps) {
	const [editing, setEditing] = useState(false)
	const [editValue, setEditValue] = useState(meal.name)
	const [extraIngredientOpen, setExtraIngredientOpen] = useState(false)
	const [moveMenuAnchor, setMoveMenuAnchor] = useState<null | HTMLElement>(null)

	const days = usePlanEditorStore((s) => s.days)
	const renameMeal = usePlanEditorStore((s) => s.renameMeal)
	const setComment = usePlanEditorStore((s) => s.setComment)
	const removeMeal = usePlanEditorStore((s) => s.removeMeal)
	const setRecipes = usePlanEditorStore((s) => s.setRecipes)
	const setPortions = usePlanEditorStore((s) => s.setPortions)
	const swapMeals = usePlanEditorStore((s) => s.swapMeals)
	const addExtraIngredient = usePlanEditorStore((s) => s.addExtraIngredient)
	const removeExtraIngredient = usePlanEditorStore((s) => s.removeExtraIngredient)

	const hasOtherMeals = days.some((day) => day.meals.some((dayMeal) => dayMeal.localId !== meal.localId || day.localId !== dayLocalId))

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

	function closeMoveMenu() {
		setMoveMenuAnchor(null)
	}

	function handleSwapMeal(targetDayLocalId: number, targetMealLocalId: number) {
		swapMeals(dayLocalId, meal.localId, targetDayLocalId, targetMealLocalId)
		closeMoveMenu()
	}


	return (
		<Stack spacing={0.75}>
			<Box sx={{
				display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, justifyContent: 'space-between',
				flexDirection: 'row'
				}}>
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
						className="flex-1/4"
						sx={{ width: 130 }}
					/>
				) : (
					<Typography
						variant="body2"
						onClick={startEditing}
						className="flex-none"
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

				<RecipeMultiPicker
					key={`recipe-pick-${dayLocalId}-${meal.localId}`}
					recipes={meal.recipes}
					setRecipies={(recipes: RecipeSummaryType[]) => setRecipes(dayLocalId, meal.localId, recipes)}
					sx={{ flex: 1}}
				/>

				<TextField
					size="small"
					label="Tillbehör"
					value={meal.comment ?? ''}
					onChange={(e) => setComment(dayLocalId, meal.localId, e.target.value)}
					className="flex-1/4 justify-self-end justify-content-end"
				/>


				<Stack
					direction="row"
					spacing={0}
					sx={{ alignItems: 'center', justifySelf: 'end', gap: 0.5, justifyContent: 'flex-end' }}
					className="flex-1/4">
					<Button
						size="small"
						onClick={(event) => setMoveMenuAnchor(event.currentTarget)}
						disabled={!hasOtherMeals}
					>
						Flytta måltid
					</Button>
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
			</Box>

			<Stack
				direction="row"
				spacing={0.75}
				className="flex-none"
				sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
				{meal.extraIngredients.map((extraIngredient, index) => (
					<Chip
						key={`${extraIngredient.ingredient.id ?? extraIngredient.ingredient.name}-${index}`}
						sx={{ mb: 10 }}
						size="small"
						label={formatExtraIngredientChipLabel(extraIngredient)}
						onDelete={() => {
							removeExtraIngredient(dayLocalId, meal.localId, index)
						}}
					/>
				))}
				<Chip
					size="small"
					icon={<AddIcon fontSize="small" />}
					label="Lägg till ingrediens"
					sx={{ mb: 10 }}
					variant="outlined"
					onClick={() => setExtraIngredientOpen(true)}
				/>
			</Stack>

			<MealExtraIngredientDialog
				open={extraIngredientOpen}
				onClose={() => setExtraIngredientOpen(false)}
				onAdd={(extraIngredient) => addExtraIngredient(dayLocalId, meal.localId, extraIngredient)}
			/>

			<Menu
				anchorEl={moveMenuAnchor}
				open={moveMenuAnchor !== null}
				onClose={closeMoveMenu}
			>
				{days.flatMap((day) => {
					const targetMeals = day.meals.filter((dayMeal) => dayMeal.localId !== meal.localId || day.localId !== dayLocalId)
					if (targetMeals.length === 0) {
						return []
					}

					const dayLabel = formatDate(day.date)
					const dayItems = [
						<MenuItem key={`day-header-${day.localId}`} disabled sx={{ opacity: 1, fontWeight: 600, textTransform: 'capitalize' }}>
							{dayLabel}
						</MenuItem>,
					]

					for (const targetMeal of targetMeals) {
						dayItems.push(
							<MenuItem
								key={`swap-target-${day.localId}-${targetMeal.localId}`}
								onClick={() => handleSwapMeal(day.localId, targetMeal.localId)}
								sx={{ pl: 3 }}
							>
								{targetMeal.name.trim() ? targetMeal.name : '(namnlös måltid)'}
							</MenuItem>,
						)
					}

					return dayItems
				})}
			</Menu>

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

			<Stack spacing={4}>
				{day.meals.map((meal, index) => (
					<Fragment key={meal.localId}>
						<MealRow dayLocalId={day.localId} meal={meal} />
						{ index != day.meals.length - 1 && <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', my: 1 }} /> }
					</Fragment>
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
		resetState()
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
