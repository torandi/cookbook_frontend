'use client'

import { ChangeEvent, useState } from 'react'
import { showErrorAlert, showSuccessAlert } from '../ui/alert-state'
import { useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { login } from '@/app/backend/auth'

export default function SignInPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: ChangeEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    login(username, password).then(({ data, error }) => {
      if (data) {
        showSuccessAlert('Inloggning lyckades')
        router.replace('/')
      } else {
        showErrorAlert(error ?? 'Inloggning misslyckades')
      }
    }).finally(() => {
      setIsSubmitting(false)
    })
  }

  return (
    <Box sx={{ maxWidth: 420, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Logga in
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Användarnamn"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            autoComplete="username"
          />

          <TextField
            label="Lösenord"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />

          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Loggar in…' : 'Logga in'}
          </Button>
        </Box>
      </form>
    </Box>
  )
}
