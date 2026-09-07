"use client";

import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState, type ReactNode } from "react";
import type { WeekPartView } from "@/lib/schedule";

export type SortableWeekPartsProps = {
  parts: WeekPartView[];
  onReorder: (orderedIds: string[]) => Promise<void>;
  renderPart: (part: WeekPartView) => ReactNode;
};

function SortablePartRow({
  part,
  renderPart,
}: {
  part: WeekPartView;
  renderPart: (part: WeekPartView) => ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: part.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-[var(--space-3)]"
    >
      <div className="flex items-start gap-[var(--space-2)]">
        <button
          type="button"
          ref={setActivatorNodeRef}
          className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-transparent text-[var(--muted)] transition-colors hover:border-[var(--line)] hover:bg-[var(--surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] touch-none"
          aria-label={`Reordenar ${part.partTypeLabel}`}
          {...attributes}
          {...listeners}
        >
          <span aria-hidden className="text-[var(--text-lg)] leading-none">
            ⠿
          </span>
        </button>
        <div className="min-w-0 flex-1">{renderPart(part)}</div>
      </div>
    </li>
  );
}

export function SortableWeekParts({
  parts,
  onReorder,
  renderPart,
}: SortableWeekPartsProps) {
  const [items, setItems] = useState(parts);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    setItems(parts);
  }, [parts]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 8 } }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((p) => p.id === active.id);
    const newIndex = items.findIndex((p) => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const previous = items;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    setReordering(true);

    try {
      await onReorder(next.map((p) => p.id));
    } catch {
      setItems(previous);
    } finally {
      setReordering(false);
    }
  }

  if (items.length === 0) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(event) => void handleDragEnd(event)}
    >
      <SortableContext
        items={items.map((p) => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul
          className="mt-[var(--space-4)] flex flex-col gap-[var(--space-5)]"
          aria-busy={reordering}
        >
          {items.map((part) => (
            <SortablePartRow key={part.id} part={part} renderPart={renderPart} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
