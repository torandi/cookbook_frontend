import { config } from '@/app/config'

import { postBackend, backendCall } from './backend'
import { showErrorAlert } from '../ui/alert-state'

const AUTH_STORAGE_KEY = 'cookbook-auth'
const AUTH_COOKIE_NAME = 'cookbook-auth'

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

// todo: refactor to session cookies

function readStoredAuth(): StoredAuth | null {
	if (typeof window === 'undefined') {
		return null
	}

	try {
		const stored = window.localStorage.getItem(AUTH_STORAGE_KEY)
		if (stored) {
			const parsed = JSON.parse(stored) as StoredAuth
			if (parsed?.accessToken) {
				return parsed
			}
		}
	} catch {
		// Ignore invalid persisted auth data
	}

	try {
		const cookieValue = document.cookie
			.split('; ')
			.find((entry) => entry.startsWith(`${AUTH_COOKIE_NAME}=`))
			?.split('=')
			.slice(1)
			.join('=')

		if (!cookieValue) {
			return null
		}

		const parsed = JSON.parse(decodeURIComponent(cookieValue)) as StoredAuth
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
		document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
		return
	}

	window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ accessToken: token, tokenType: type }))
	document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(JSON.stringify({ accessToken: token, tokenType: type }))}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
}

function setAuthToken(token: string | null, type: string = 'Bearer') {
	accessToken = token
	tokenType = type
	persistAuth(token, type)
}

async function refreshToken(): Promise<boolean>{
    const response = await backendCall<LoginResponse>('users/refresh');
    if (response?.accessToken) {
        setAuthToken(response.accessToken, response.tokenType ?? 'Bearer')
        return true
    }
    else
    {
        setAuthToken(null)
    }
    return false
}

export function getAuthHeaders() {
	const headers = new Headers()

	if (accessToken) {
		headers.set('Authorization', `${tokenType} ${accessToken}`)
	}

	return headers
}

export async function login(username: string, password: string) {
	const {data, error } = await postBackend<LoginResponse>(`users/login/`, { username, password }, { includeAuth: false })
	if (data) {
		setAuthToken(data.accessToken, data.tokenType ?? 'Bearer')
	}
	return { data, error }
}

export function clearAuthToken() {
	setAuthToken(null)
}

export async function validateAuth() {
    const storedAuth = readStoredAuth()
    if (storedAuth) {
        setAuthToken(storedAuth.accessToken, storedAuth.tokenType ?? 'Bearer')
        try
        {
            const valid = await refreshToken()
            return valid
        }
        catch (error)
        {
			showErrorAlert("Du har blivit utloggad. Logga in igen.")
            setAuthToken(null)
            return false
        }
    }
    return false
}