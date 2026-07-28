'use client';
import { PlanEditorDraft } from './state';

export function getPlanDraftKey(planId?: number) {
	return planId !== undefined
		? `cookbook-editor-draft:plan:edit:${planId}`
		: 'cookbook-editor-draft:plan:add';
}
export function loadPlanDraft(key: string): PlanEditorDraft | null {
	if (typeof window === 'undefined') {
		return null;
	}

	try {
		const raw = window.localStorage.getItem(key);
		if (!raw) {
			return null;
		}
		const parsed = JSON.parse(raw) as PlanEditorDraft;
		if (!parsed || !Array.isArray(parsed.days) || typeof parsed.name !== 'string' || typeof parsed.nextLocalId !== 'number') {
			return null;
		}
		return parsed;
	} catch {
		return null;
	}
}
export function savePlanDraft(key: string, draft: PlanEditorDraft) {
	if (typeof window === 'undefined') {
		return;
	}

	window.localStorage.setItem(key, JSON.stringify(draft));
}
export function clearPlanDraft(planId?: number) {
	if (typeof window === 'undefined') {
		return;
	}

	window.localStorage.removeItem(getPlanDraftKey(planId));
}
