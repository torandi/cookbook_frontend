'use client';
import React, {useState} from 'react';
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

	const handleDragEnd = (event) => {
		const { active, over } = event;

		if (active.id !== over.id) {
			const oldIndex = items.indexOf(active.id);
			const newIndex = items.indexOf(over.id);

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
