'use client'

import { config } from '@/app/config'

// useBackend is cached, and should be used for fetching data
// backendCall is uncached fetch api

// todo: will need to add auth token here as well
const backendCall = (url : string, ...args) =>
	fetch(`${config.backend}/${url}/`, ...args).then(res => res.json())

function useBackend<Type>(endpoint : string)
{
	const { data, error, isLoading } = useSWR<Type>(endpoint, backendCall);
	// todo: ... = useSWR([endpoint, token], fetchBackend); (backendCall([url : string, token : string])

	if (error.status == 403) {
		// not authorized
	}

	return { data, error, isLoading };
}

export { backendCall, useBackend }

