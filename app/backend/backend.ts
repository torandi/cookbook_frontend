'use client'

import config from '@/config.json'

import { getAuthHeaders } from './auth'

import useSWR, { mutate } from 'swr'

type BackendRequestError = Error & {
	detail?: unknown
}

// backendCall is the authenticated uncached fetch helper.
// unauthorizedBackendCall is for public endpoints such as login.

const buildUrl = (url: string) => `${config.backend}/${url}`

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
		let detail: unknown = null

		try {
			const json = await response.json()
			detail = json?.detail
		} catch {
			detail = null
		}

		const message =
			typeof detail === 'string'
				? detail
				: detail != null
					? JSON.stringify(detail)
					: response.statusText

		const error: BackendRequestError = new Error(message)
		error.detail = detail
		throw error
	}

	if (response.status === 204) {
		return null as Type
	}

	const responseText = await response.text()
	if (!responseText) {
		return null as Type
	}

	return JSON.parse(responseText) as Type
}

const backendCall = <Type>(url: string, options: RequestInit = {}) =>
	requestBackend<Type>(url, options, true)

const unauthorizedBackendCall = <Type>(url: string, options: RequestInit = {}) =>
	requestBackend<Type>(url, options, false)

function useBackend<Type>(url: string)
{
	const { data, error, isLoading } = useSWR<Type>(url, backendCall)

	return {
		data,
		isLoading,
		error
	}
}

function useUnauthorizedBackend<Type>(url: string)
{
	const { data, error, isLoading } = useSWR<Type>(url, unauthorizedBackendCall)

	return {
		data,
		isLoading,
		error
	}
}

async function postBackend<Type>(url: string, data: any, 
	{ includeAuth = true, method = 'POST' }: { includeAuth?: boolean, method?: string } = {}) {

	try
	{
		const result = await requestBackend<Type>(url, {
			method: method,
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		}, includeAuth)

		// Invalided the cache for this url (put/delete updates the resource)
		mutate(url)
		return {
			data: result,
			error: null,
			errorDetail: null,
		}
	} catch (error: any) {
		const backendError = error as BackendRequestError
		return {
			data: null,
			error: backendError.message ||  'Okänt fel',
			errorDetail: backendError.detail ?? null,
		}
	}
}

export { backendCall, unauthorizedBackendCall, useBackend, useUnauthorizedBackend, postBackend }

