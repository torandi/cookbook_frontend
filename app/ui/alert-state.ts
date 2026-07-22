'use client'

import type { AlertColor } from '@mui/material/Alert'
import { create } from 'zustand'

export type GlobalAlert = {
	id: number
	severity: AlertColor
	message: string
	autoHideMs?: number | null
}

type GlobalAlertInput = Omit<GlobalAlert, 'id'>

type GlobalAlertState = {
	alerts: GlobalAlert[]
	addAlert: (alert: GlobalAlertInput) => number
	dismissAlert: (id: number) => void
	clearAlerts: () => void
}

const DEFAULT_AUTO_HIDE_MS = 4000

let nextAlertId = 1

export const useGlobalAlertStore = create<GlobalAlertState>((set) => ({
	alerts: [],
	addAlert: (alert) => {
		const id = nextAlertId++

		set((state) => ({
			alerts: state.alerts.concat({
				...alert,
				autoHideMs: alert.autoHideMs === undefined ? DEFAULT_AUTO_HIDE_MS : alert.autoHideMs,
				id,
			}),
		}))

		return id
	},
	dismissAlert: (id) => set((state) => ({
		alerts: state.alerts.filter((alert) => alert.id !== id),
	})),
	clearAlerts: () => set({ alerts: [] }),
}))

export const showAlert = (alert: GlobalAlertInput) => useGlobalAlertStore.getState().addAlert(alert)

export const showSuccessAlert = (message: string, autoHideMs?: number | null) => showAlert({
	message,
	severity: 'success',
	autoHideMs,
})

export const showErrorAlert = (message: string, autoHideMs?: number | null) => showAlert({
	message,
	severity: 'error',
	autoHideMs,
})

export const showInfoAlert = (message: string, autoHideMs?: number | null) => showAlert({
	message,
	severity: 'info',
	autoHideMs,
})