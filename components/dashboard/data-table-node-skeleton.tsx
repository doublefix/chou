"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function DataTableSkeleton({ pageSize }: { pageSize: number }) {
  // 定义各列的宽度，与实际表格列宽匹配
  const columnWidths = [
    "w-6",    // 拖动列
    "w-10",   // 选择列
    "w-48",   // 名称列
    "w-24",   // 状态列
    "w-16",   // CPU列
    "w-24",   // 内存列
    "w-20",   // 架构列
    "w-28",   // 角色列
    "w-28",   // IP列
    "w-20",   // OS列
    "w-24",   // Runtime列
    "w-24",   // Age列
    "w-10",   // 操作列
  ];

  return (
    <>
      {/* 只渲染表格行的骨架 */}
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