'use client'

import { useEffect, useRef } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'

import { useGlobalAlertStore } from './alert-state'

export default function GlobalAlerts() {
	const alerts = useGlobalAlertStore((state) => state.alerts)
	const dismissAlert = useGlobalAlertStore((state) => state.dismissAlert)
	const timersRef = useRef<Record<number, ReturnType<typeof setTimeout> | undefined>>({})

	useEffect(() => {
		const activeIds = new Set(alerts.map((alert) => alert.id))

		for (const alert of alerts) {
			if (alert.autoHideMs == null || timersRef.current[alert.id] != null) {
				continue
			}

			timersRef.current[alert.id] = setTimeout(() => {
				dismissAlert(alert.id)
				delete timersRef.current[alert.id]
			}, alert.autoHideMs)
		}

		for (const [idText, timerId] of Object.entries(timersRef.current)) {
			const id = Number(idText)
			if (!activeIds.has(id) && timerId != null) {
				clearTimeout(timerId)
				delete timersRef.current[id]
			}
		}
	}, [alerts, dismissAlert])

	useEffect(() => {
		return () => {
			for (const timerId of Object.values(timersRef.current)) {
				if (timerId != null) {
					clearTimeout(timerId)
				}
			}
			timersRef.current = {}
		}
	}, [])

	if (alerts.length === 0) {
		return null
	}

	return (
		<Box sx={{ px: 2, pt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
			{alerts.map((alert) => (
				<Alert
					key={alert.id}
					severity={alert.severity}
					onClose={() => dismissAlert(alert.id)}
				>
					{alert.message}
				</Alert>
			))}
		</Box>
	)
}