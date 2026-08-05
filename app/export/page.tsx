'use client'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

import { useBackend } from '@/app/backend/backend'

export default function RecipeExportPage() {
	const { data, error, isLoading } = useBackend<unknown>('export')

	const handleDownload = () => {
		if (data === undefined) return

		const json = JSON.stringify(data, null, 2)
		const blob = new Blob([json], { type: 'application/json' })
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')

		link.href = url
		link.download = `recipes-export-${new Date().toISOString().slice(0, 10)}.json`
		document.body.appendChild(link)
		link.click()
		link.remove()
		URL.revokeObjectURL(url)
	}

	return (
		<Box sx={{ maxWidth: 1100, mx: 'auto' }}>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
				<Typography variant="h5" sx={{ fontWeight: 700 }}>
					Recipe export
				</Typography>
				<Button
					variant="contained"
					onClick={handleDownload}
					disabled={isLoading || !!error || data === undefined}
				>
					Download json
				</Button>
			</Box>

			{isLoading && (
				<Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
					<CircularProgress />
				</Box>
			)}

			{error && (
				<Alert severity="error">Kunde inte ladda export: {error.message}</Alert>
			)}

			{!isLoading && !error && (
				<Box
					component="pre"
					sx={{
						m: 0,
						p: 2,
						borderRadius: 1,
						border: '1px solid',
						borderColor: 'divider',
						overflowX: 'auto',
						whiteSpace: 'pre-wrap',
						wordBreak: 'break-word',
						fontSize: 13,
						fontFamily: 'monospace',
					}}
				>
					{JSON.stringify(data, null, 2)}
				</Box>
			)}
		</Box>
	)
}
