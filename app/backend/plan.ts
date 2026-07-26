import { useBackend, postBackend } from './backend'
import { PlanType, ShoppingListType} from '@/app/types/plan'

export function usePlans() {
	const { data, error, isLoading } = useBackend<PlanType[]>('plans/')
	return { plans: data ?? [], error, isLoading }
}

export function usePlan(id: number) {
	const { data, error, isLoading } = useBackend<PlanType>(`plans/${id}`)
	return { plan: data, error, isLoading }
}

export function usePlanShoppingList(id: number) {
	const { data, error, isLoading } = useBackend<ShoppingListType>(`plans/${id}/shopping_list`)
	return { shoppingList: data, error, isLoading }
}

export function addPlan(plan: PlanType) {
	return postBackend<PlanType>('plans/', plan, { includeAuth: true })
}

export function updatePlan(id: number, plan: PlanType) {
	return postBackend<PlanType>(`plans/${id}`, plan, { includeAuth: true, method: 'PUT' })
}

export function deletePlan(id: number) {
	return postBackend<null>(`plans/${id}`, {}, { includeAuth: true, method: 'DELETE' })
}
