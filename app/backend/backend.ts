'use client'

import { config } from '@/app/config'
import useSWR from 'swr'

import { getAuthHeaders } from './auth'

// useBackend is cached and should be used for fetching data.
// backendCall is the authenticated uncached fetch helper.
// unauthorizedBackendCall is for public endpoints such as login.

type BackendError = Error & {
	status?: number
	statusText?: string
}

const buildUrl = (url: string) => `${config.backend}/${url.replace(/^\/+/, '')}/`

async function requestBackend<Type>(url: string, options: RequestInit = {}, includeAuth: boolean)
{
	const headers = new Headers(options.headers ?? {})

	if (includeAuth) {
		const authHeaders = getAuthHeaders()
		for (const [key, value] of authHeaders.entries()) {
			headers.set(key, value)
		}
	}

	const response = await fetch(buildUrl(url), {
		...options,
		headers,
	})

	if (!response.ok) {
		const error = new Error(await response.text() || response.statusText) as BackendError
		error.status = response.status
		error.statusText = response.statusText
		throw error
	}

	return response.json() as Promise<Type>
}

const backendCall = <Type>(url: string, options: RequestInit = {}) =>
	requestBackend<Type>(url, options, true)

const unauthorizedBackendCall = <Type>(url: string, options: RequestInit = {}) =>
	requestBackend<Type>(url, options, false)

function useBackend<Type>(endpoint: string)
{
	const { data, error, isLoading } = useSWR<Type>(endpoint, (url: string) => backendCall<Type>(url))

	if (error?.status === 403) {
		// not authorized
	}

	return { data, error, isLoading }
}

export { backendCall, unauthorizedBackendCall, useBackend }

