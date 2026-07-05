import { config } from '@/app/config'

// useBackend is cached, and should be used for fetching data

// todo: will need to add token here as well
const backendCall = (url : string, method: string, ...args) =>
	fetch(`${config.backend}/${url}/`, { method, ...args }).then(res => res.json())

function useBackend<Type>(endpoint : string)
{
	const { data, error, isLoading } = useSWR<Type>(endpoint, backendCall);
	// todo: ... = useSWR([endpoint, token], fetchBackend); (backendCall([url : string, token : string])

	return { data, error, isLoading };
}

export { backendCall, useBackend }

