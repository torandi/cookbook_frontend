import { config } from '@/app/config'

const AUTH_STORAGE_KEY = 'cookbook-auth'

let accessToken: string | null = null
let tokenType = 'Bearer'

type LoginResponse = {
	accessToken: string
	tokenType?: string
}

type StoredAuth = {
	accessToken: string
	tokenType?: string
}

function readStoredAuth(): StoredAuth | null {
	if (typeof window === 'undefined') {
		return null
	}

	try {
		const stored = window.localStorage.getItem(AUTH_STORAGE_KEY)
		if (!stored) {
			return null
		}

		const parsed = JSON.parse(stored) as StoredAuth
		if (parsed?.accessToken) {
			return parsed
		}
	} catch {
		// Ignore invalid persisted auth data
	}

	return null
}

function persistAuth(token: string | null, type: string = 'Bearer') {
	if (typeof window === 'undefined') {
		return
	}

	if (!token) {
		window.localStorage.removeItem(AUTH_STORAGE_KEY)
		return
	}

	window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ accessToken: token, tokenType: type }))
}

function setAuthToken(token: string | null, type: string = 'Bearer') {
	accessToken = token
	tokenType = type
	persistAuth(token, type)
}

const storedAuth = readStoredAuth()
if (storedAuth) {
	setAuthToken(storedAuth.accessToken, storedAuth.tokenType ?? 'Bearer')
}

export function getAuthHeaders() {
	const headers = new Headers()

	if (accessToken) {
		headers.set('Authorization', `${tokenType} ${accessToken}`)
	}

	return headers
}

export async function login(username: string, password: string) {
	const response = await fetch(`${config.backend}/users/login/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ username, password }),
	})

	if (!response.ok) {
		throw new Error(await response.text() || response.statusText)
	}

	const data = await response.json() as LoginResponse
	setAuthToken(data.accessToken, data.tokenType ?? 'Bearer')
	return data
}

export function clearAuthToken() {
	setAuthToken(null)
}
