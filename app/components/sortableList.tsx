'use client';
import React, {useState} from 'react';
import type { DragEndEvent } from '@dnd-kit/core';

import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export function SortableList( { children, onItemsUpdated, items } : {
	children: React.ReactNode,
	onItemsUpdated: Function,
	items: number[] /* array of ids */
}) {

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = items.indexOf(active.id as number);
			const newIndex = items.indexOf(over.id as number);

			onItemsUpdated(arrayMove(items, oldIndex, newIndex));
		}
	}

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
			>
			<SortableContext
				items={items}
				strategy={verticalListSortingStrategy}
				>
				{ children }
			</SortableContext>
		</DndContext>
	)
}
