'use client'

import { config } from '@/app/config'

import { getAuthHeaders } from './auth'

import useSWR from 'swr'

// backendCall is the authenticated uncached fetch helper.
// unauthorizedBackendCall is for public endpoints such as login.

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
		const json = await response.json()
		const error = new Error(json.detail || response.statusText)
		throw error
	}

	return response.json() as Promise<Type>
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
		return {
			data: result,
			error: null,
		}
	} catch (error: any) {
		return {
			data: null,
			error: error.message ||  'Okänt fel',
		}
	}
}

export { backendCall, unauthorizedBackendCall, useBackend, postBackend }

