import config from '@/app/config.json'

// todo: will need to add token here as well
const backendCall = (url : string, ...args) =>
	fetch(`${config.backend}/${url}/`, ...args).then(res => res.json())

function useBackend<Type>(endpoint : string)
{
	const { data, error, isLoading } = useSWR<Type>(endpoint, backendCall);
	// todo: ... = useSWR([endpoint, token], fetchBackend); (backendCall([url : string, token : string])

	return { data, error, isLoading };
}

export { backendCall, useBackend }

