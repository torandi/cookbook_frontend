'use client';
import { RecipeEditorDraft } from './state';

export function getRecipeDraftKey(recipeId?: number) {
	return recipeId !== undefined
		? `cookbook-editor-draft:recipe:edit:${recipeId}`
		: 'cookbook-editor-draft:recipe:add';
}

export function loadRecipeDraft(key: string): RecipeEditorDraft | null {
	if (typeof window === 'undefined') {
		return null;
	}

	try {
		const raw = window.localStorage.getItem(key);
		if (!raw) {
			return null;
		}

		const parsed = JSON.parse(raw) as RecipeEditorDraft;
		if (!parsed || typeof parsed !== 'object' || !parsed.recipe) {
			return null;
		}

		return parsed;
	} catch {
		return null;
	}
}

export function saveRecipeDraft(key: string, draft: RecipeEditorDraft) {
	if (typeof window === 'undefined') {
		return;
	}

	window.localStorage.setItem(key, JSON.stringify(draft));
}

export function clearRecipeDraft(recipeId?: number) {
	if (typeof window === 'undefined') {
		return;
	}

	const draftKey = recipeId !== undefined
		? `cookbook-editor-draft:recipe:edit:${recipeId}`
		: 'cookbook-editor-draft:recipe:add';

	window.localStorage.removeItem(draftKey);
}

