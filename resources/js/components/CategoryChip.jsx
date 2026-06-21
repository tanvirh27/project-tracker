import React from 'react';

export default function CategoryChip({ category }) {
    if (!category) return null;

    return (
        <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
                backgroundColor: category.color + '20',
                color: category.color,
            }}
        >
            <span
                className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color }}
            />
            {category.name}
        </span>
    );
}
