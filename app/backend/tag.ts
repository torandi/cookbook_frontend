'use client'

import { TagType } from '@/app/types/tag';

import { useBackend, postBackend } from './backend'

export function useTags() {
	const { data, error, isLoading } = useBackend<TagType[]>(`tags`);
	return {
		tags: data,
		isLoading,
		error: error
	}
}

export async function addTag(tag: TagType) {
	return postBackend<TagType>(`tags/`, tag, { includeAuth: true })
}

export async function updateTag(id: number, tag: TagType) {
	return postBackend<TagType>(`tags/${id}`, tag, { includeAuth: true, method: 'PUT' })
}

export async function deleteTag(id: number) {
	return postBackend<null>(`tags/${id}`, null, { includeAuth: true, method: 'DELETE' })
}
