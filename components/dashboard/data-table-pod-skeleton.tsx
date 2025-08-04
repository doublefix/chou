"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function DataTableSkeleton({ pageSize }: { pageSize: number }) {
  // Define column widths to match the actual table columns
  const columnWidths = [
    "w-6",    // Drag column
    "w-10",   // Select column
    "w-48",   // Name column
    "w-24",   // Namespace column
    "w-24",   // Status column
    "w-24",   // Node column
    "w-28",   // Pod IP column
    "w-16",   // Restarts column
    "w-24",   // Age column
    "w-10",   // Actions column
  ];

  return (
    <>
      {/* Only render table row skeletons */}
      {[...Array(pageSize)].map((_, rowIndex) => (
        <tr 
          key={`row-${rowIndex}`}
          className="border-b border-muted"
        >
          {columnWidths.map((width, colIndex) => (
            <td key={`cell-${rowIndex}-${colIndex}`} className={cn("p-4", width)}>
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}