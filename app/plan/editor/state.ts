import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { MealExtraIngredientType, PlanType } from '@/app/types/plan'
import { RecipeSummaryType } from '@/app/types/recipe'

export interface EditorMeal {
	localId: number
	dbId: number | null
	name: string
	recipes: RecipeSummaryType[]
	portions: number
	comment: string | null
	extraIngredients: MealExtraIngredientType[]
}

export interface EditorDay {
	localId: number
	dbId: number | null
	date: string // YYYY-MM-DD
	meals: EditorMeal[]
}

interface PlanEditorState {
	name: string
	days: EditorDay[]
	nextLocalId: number

	setName: (name: string) => void
	addDays: (startDate: string, endDate: string, mealNames: string[], portions: number) => void
	removeDay: (dayLocalId: number) => void
	addMeal: (dayLocalId: number, mealName: string) => void
	removeMeal: (dayLocalId: number, mealLocalId: number) => void
	renameMeal: (dayLocalId: number, mealLocalId: number, name: string) => void
	setComment: (dayLocalId: number, mealLocalId: number, comment: string) => void
	setRecipes: (dayLocalId: number, mealLocalId: number, recipes: RecipeSummaryType[]) => void
	setPortions: (dayLocalId: number, mealLocalId: number, portions: number) => void
	swapMeals: (
		sourceDayLocalId: number,
		sourceMealLocalId: number,
		targetDayLocalId: number,
		targetMealLocalId: number,
	) => void
	addExtraIngredient: (dayLocalId: number, mealLocalId: number, extraIngredient: MealExtraIngredientType) => void
	removeExtraIngredient: (dayLocalId: number, mealLocalId: number, ingredientIndex: number) => void
	reset: () => void
	setFromPlan: (plan: PlanType) => void
}

export type PlanEditorDraft = Pick<PlanEditorState, 'name' | 'days' | 'nextLocalId'>

function datesInRange(startDate: string, endDate: string): string[] {
	const dates: string[] = []
	const current = new Date(startDate + 'T00:00:00')
	const end = new Date(endDate + 'T00:00:00')
	while (current <= end) {
		const year = current.getFullYear()
		const month = String(current.getMonth() + 1).padStart(2, '0')
		const day = String(current.getDate()).padStart(2, '0')
		dates.push(`${year}-${month}-${day}`)
		current.setDate(current.getDate() + 1)
	}
	return dates
}

export const usePlanEditorStore = create<PlanEditorState>()(
	immer((set) => ({
		name: '',
		days: [],
		nextLocalId: 1,

		setName: (name) => set((state) => { state.name = name }),

		addDays: (startDate, endDate, mealNames, portions) => set((state) => {
			const dates = datesInRange(startDate, endDate)
			for (const date of dates) {
				if (state.days.some((d) => d.date === date)) continue
				const dayLocalId = state.nextLocalId++
				const meals: EditorMeal[] = mealNames.map((mealName) => ({
					localId: state.nextLocalId++,
					dbId: null,
					name: mealName,
					recipes: [],
					portions,
					comment: null,
					extraIngredients: [],
				}))
				state.days.push({ localId: dayLocalId, dbId: null, date, meals })
			}
			state.days.sort((a, b) => a.date.localeCompare(b.date))
		}),

		removeDay: (dayLocalId) => set((state) => {
			state.days = state.days.filter((d) => d.localId !== dayLocalId)
		}),

		addMeal: (dayLocalId, mealName) => set((state) => {
			const day = state.days.find((d) => d.localId === dayLocalId)
			if (!day) return
			day.meals.push({
				localId: state.nextLocalId++,
				dbId: null,
				name: mealName,
				recipes: [],
				portions: 2,
				comment: null,
				extraIngredients: [],
			})
		}),

		removeMeal: (dayLocalId, mealLocalId) => set((state) => {
			const day = state.days.find((d) => d.localId === dayLocalId)
			if (!day)
				return
			day.meals = day.meals.filter((m) => m.localId !== mealLocalId)
		}),

		renameMeal: (dayLocalId, mealLocalId, name) => set((state) => {
			const day = state.days.find((d) => d.localId === dayLocalId)
			if (!day)
				return
			const meal = day.meals.find((m) => m.localId === mealLocalId)
			if (meal) meal.name = name
		}),

		setComment: (dayLocalId, mealLocalId, comment) => set((state) => {
			const day = state.days.find((d) => d.localId === dayLocalId)
			if (!day) return
			const meal = day.meals.find((m) => m.localId === mealLocalId)
			if (meal) meal.comment = comment
		}),

		setRecipes: (dayLocalId, mealLocalId, recipes) => set((state) => {
			const day = state.days.find((d) => d.localId === dayLocalId)
			if (!day) return
			const meal = day.meals.find((m) => m.localId === mealLocalId)
			if (meal) meal.recipes = recipes
		}),

		setPortions: (dayLocalId, mealLocalId, portions) => set((state) => {
			const day = state.days.find((d) => d.localId === dayLocalId)
			if (!day) return
			const meal = day.meals.find((m) => m.localId === mealLocalId)
			if (meal) meal.portions = Math.max(1, portions)
		}),

		swapMeals: (sourceDayLocalId, sourceMealLocalId, targetDayLocalId, targetMealLocalId) => set((state) => {
			if (sourceDayLocalId === targetDayLocalId && sourceMealLocalId === targetMealLocalId) {
				return
			}

			const sourceDay = state.days.find((d) => d.localId === sourceDayLocalId)
			const targetDay = state.days.find((d) => d.localId === targetDayLocalId)
			if (!sourceDay || !targetDay) return

			const sourceMealIndex = sourceDay.meals.findIndex((m) => m.localId === sourceMealLocalId)
			const targetMealIndex = targetDay.meals.findIndex((m) => m.localId === targetMealLocalId)
			if (sourceMealIndex < 0 || targetMealIndex < 0) return

			const sourceSlotName = sourceDay.meals[sourceMealIndex].name
			const targetSlotName = targetDay.meals[targetMealIndex].name

			const sourceMeal = sourceDay.meals[sourceMealIndex]
			sourceDay.meals[sourceMealIndex] = targetDay.meals[targetMealIndex]
			targetDay.meals[targetMealIndex] = sourceMeal

			sourceDay.meals[sourceMealIndex].name = sourceSlotName
			targetDay.meals[targetMealIndex].name = targetSlotName
		}),

		addExtraIngredient: (dayLocalId, mealLocalId, extraIngredient) => set((state) => {
			const day = state.days.find((d) => d.localId === dayLocalId)
			if (!day) return
			const meal = day.meals.find((m) => m.localId === mealLocalId)
			if (!meal) return
			meal.extraIngredients.push(extraIngredient)
		}),

		removeExtraIngredient: (dayLocalId, mealLocalId, ingredientIndex) => set((state) => {
			const day = state.days.find((d) => d.localId === dayLocalId)
			if (!day) return
			const meal = day.meals.find((m) => m.localId === mealLocalId)
			if (!meal) return
			meal.extraIngredients = meal.extraIngredients.filter((_value, index) => index !== ingredientIndex)
		}),

		reset: () => set((state) => {
			state.name = ''
			state.days = []
			state.nextLocalId = 1
		}),

		setFromPlan: (plan) => set((state) => {
			state.name = plan.name
			state.nextLocalId = 1
			state.days = plan.days.map((day) => ({
				localId: state.nextLocalId++,
				dbId: day.id,
				date: day.date,
				meals: day.meals.map((meal) => ({
					localId: state.nextLocalId++,
					dbId: meal.id,
					name: meal.name,
					recipes: meal.recipes,
					portions: meal.portions ?? 2,
					comment: meal.comment,
					extraIngredients: meal.extraIngredients ?? [],
				})),
			}))
		}),
	}))
)

export function editorStateToPlan(
	name: string,
	days: EditorDay[],
	existingId: number | null = null,
): PlanType {
	return {
		id: existingId,
		name,
		days: days.map((day) => ({
			id: day.dbId,
			date: day.date,
			meals: day.meals.map((meal) => ({
				id: meal.dbId,
				name: meal.name,
				recipes: meal.recipes,
				portions: meal.portions,
				comment: meal.comment,
				extraIngredients: meal.extraIngredients,
			})),
		})),
	}
}
