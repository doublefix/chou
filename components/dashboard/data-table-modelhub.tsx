"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ColumnsIcon,
  FilterIcon,
  LoaderIcon,
  MoreVerticalIcon,
  PlusIcon,
  SlidersHorizontalIcon,
  TrendingUpIcon,
  XIcon,
} from "lucide-react";
import { Search } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";
import { z } from "zod";

import { useIsMobile } from "@/components/ui/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/dashboard/chart";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

export const schema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
});

// 筛选条件类型定义
type FilterState = {
  search: string;
  types: string[];
  statuses: string[];
  reviewers: string[];
};

// 调整列定义 - 仅保留一个主要列用于渲染三行结构
const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    accessorKey: "main",
    header: "", // 表头为空
    cell: ({ row }) => {
      return <RowContent item={row.original} />;
    },
    enableHiding: false,
  },
];

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[];
}) {
  const [data, setData] = React.useState(() => initialData);
  const [filteredData, setFilteredData] = React.useState(() => initialData);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // 筛选状态管理
  const [filters, setFilters] = React.useState<FilterState>({
    search: "",
    types: [],
    statuses: [],
    reviewers: [],
  });

  const isMobile = useIsMobile();

  // 提取唯一的筛选选项
  const uniqueTypes = Array.from(new Set(initialData.map((item) => item.type)));
  const uniqueStatuses = Array.from(
    new Set(initialData.map((item) => item.status))
  );
  const uniqueReviewers = Array.from(
    new Set(initialData.map((item) => item.reviewer))
  );

  // 应用筛选
  React.useEffect(() => {
    let result = [...initialData];

    // 搜索筛选
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.header.toLowerCase().includes(searchLower) ||
          item.type.toLowerCase().includes(searchLower) ||
          item.reviewer.toLowerCase().includes(searchLower)
      );
    }

    // 类型筛选
    if (filters.types.length > 0) {
      result = result.filter((item) => filters.types.includes(item.type));
    }

    // 状态筛选
    if (filters.statuses.length > 0) {
      result = result.filter((item) => filters.statuses.includes(item.status));
    }

    // 审核人筛选
    if (filters.reviewers.length > 0) {
      result = result.filter((item) =>
        filters.reviewers.includes(item.reviewer)
      );
    }

    setFilteredData(result);
    // 重置分页到第一页
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [filters, initialData]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // 筛选器变更处理函数
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // 切换类型筛选
  const toggleTypeFilter = (type: string) => {
    setFilters((prev) => {
      const types = prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type];
      return { ...prev, types };
    });
  };

  // 切换状态筛选
  const toggleStatusFilter = (status: string) => {
    setFilters((prev) => {
      const statuses = prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status];
      return { ...prev, statuses };
    });
  };

  // 切换审核人筛选
  const toggleReviewerFilter = (reviewer: string) => {
    setFilters((prev) => {
      const reviewers = prev.reviewers.includes(reviewer)
        ? prev.reviewers.filter((r) => r !== reviewer)
        : [...prev.reviewers, reviewer];
      return { ...prev, reviewers };
    });
  };

  // 清除所有筛选
  const clearAllFilters = () => {
    setFilters({
      search: "",
      types: [],
      statuses: [],
      reviewers: [],
    });
  };

  // 筛选器组件
  const FilterPanel = () => (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          disabled={
            !filters.search &&
            filters.types.length === 0 &&
            filters.statuses.length === 0 &&
            filters.reviewers.length === 0
          }
          className="h-8 gap-1 text-sm text-muted-foreground"
        >
          <XIcon className="h-4 w-4" />
          Clear all
        </Button>
      </div>

      {/* 搜索筛选 */}
      <div className="space-y-2">
        <Label htmlFor="search-filter">Search</Label>
        <div className="relative">
          <FilterIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search-filter"
            placeholder="Search by header, type..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-8"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-6 w-6"
              onClick={() => handleFilterChange("search", "")}
            >
              <XIcon className="h-3 w-3" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
      </div>
      <Separator />

      {/* 类型筛选 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Type</Label>
          <Badge variant="outline" className="h-6 px-1.5 text-xs">
            {filters.types.length}
          </Badge>
        </div>
        <div className="space-y-2">
          {uniqueTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type}`}
                checked={filters.types.includes(type)}
                onCheckedChange={() => toggleTypeFilter(type)}
              />
              <Label
                htmlFor={`type-${type}`}
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* 状态筛选 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Status</Label>
          <Badge variant="outline" className="h-6 px-1.5 text-xs">
            {filters.statuses.length}
          </Badge>
        </div>
        <div className="space-y-2">
          {uniqueStatuses.map((status) => (
            <div key={status} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${status}`}
                checked={filters.statuses.includes(status)}
                onCheckedChange={() => toggleStatusFilter(status)}
              />
              <Label
                htmlFor={`status-${status}`}
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {status}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* 审核人筛选 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Reviewer</Label>
          <Badge variant="outline" className="h-6 px-1.5 text-xs">
            {filters.reviewers.length}
          </Badge>
        </div>
        <div className="space-y-2">
          {uniqueReviewers.map((reviewer) => (
            <div key={reviewer} className="flex items-center space-x-2">
              <Checkbox
                id={`reviewer-${reviewer}`}
                checked={filters.reviewers.includes(reviewer)}
                onCheckedChange={() => toggleReviewerFilter(reviewer)}
              />
              <Label
                htmlFor={`reviewer-${reviewer}`}
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {reviewer}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row w-full">
      {/* 桌面端筛选面板 */}
      <div className="hidden lg:block w-96 ml-4 rounded-lg shrink-0">
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <FilterPanel />
        </ScrollArea>
      </div>

      {/* 主表格区域 */}
      <div className="flex-1">
        <Tabs
          defaultValue="outline"
          className="flex w-full flex-col justify-start gap-4"
        >
          <div className="flex items-center justify-between px-4 lg:px-6">
            <Label htmlFor="view-selector" className="sr-only">
              View
            </Label>
            {/* <Select defaultValue="outline">
              <SelectTrigger
                className="@4xl/main:hidden flex w-fit"
                id="view-selector"
              >
                <SelectValue placeholder="Select a view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="outline">Outline</SelectItem>
                <SelectItem value="past-performance">
                  Past Performance
                </SelectItem>
                <SelectItem value="key-personnel">Key Personnel</SelectItem>
                <SelectItem value="focus-documents">Focus Documents</SelectItem>
              </SelectContent>
            </Select> */}
            <div>
              <Search className="absolute left-6 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                autoComplete="off"
                spellCheck="false"
                placeholder="Search models, datasets, users..."
                className="h-9 w-[360px]"
              />
            </div>
            <TabsList className="@4xl/main:flex hidden">
              <TabsTrigger value="outline">Outline</TabsTrigger>
              <TabsTrigger value="past-performance" className="gap-1">
                Past Performance{" "}
                <Badge
                  variant="secondary"
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/30"
                >
                  3
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="key-personnel" className="gap-1">
                Key Personnel{" "}
                <Badge
                  variant="secondary"
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/30"
                >
                  2
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="focus-documents">Focus Documents</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ColumnsIcon />
                    <span className="hidden lg:inline">Customize Columns</span>
                    <span className="lg:hidden">Columns</span>
                    <ChevronDownIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {table
                    .getAllColumns()
                    .filter(
                      (column) =>
                        typeof column.accessorFn !== "undefined" &&
                        column.getCanHide()
                    )
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm">
                <PlusIcon />
                <span className="hidden lg:inline">Add Section</span>
              </Button>
            </div>
          </div>
          {/* 活跃筛选器标签 */}
          {(filters.search ||
            filters.types.length > 0 ||
            filters.statuses.length > 0 ||
            filters.reviewers.length > 0) && (
            <div className="px-4 lg:px-6">
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Search: {filters.search}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      onClick={() => handleFilterChange("search", "")}
                    >
                      <XIcon className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {filters.types.map((type) => (
                  <Badge
                    key={`badge-type-${type}`}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Type: {type}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      onClick={() => toggleTypeFilter(type)}
                    >
                      <XIcon className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}

                {filters.statuses.map((status) => (
                  <Badge
                    key={`badge-status-${status}`}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Status: {status}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      onClick={() => toggleStatusFilter(status)}
                    >
                      <XIcon className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}

                {filters.reviewers.map((reviewer) => (
                  <Badge
                    key={`badge-reviewer-${reviewer}`}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Reviewer: {reviewer}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      onClick={() => toggleReviewerFilter(reviewer)}
                    >
                      <XIcon className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <TabsContent
            value="outline"
            className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
          >
            <div className="overflow-hidden rounded-lg border">
              <Table>
                {/* 保留表头结构但移除字段文本 */}
                <TableHeader className="sticky top-0 z-10 bg-muted h-12">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {/* 表头内容为空但保留结构 */}
                          <div className="h-full w-full"></div>
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="h-auto" // 自动高度适应内容
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="p-0">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results match your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between px-4">
              <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                {table.getFilteredRowModel().rows.length} row(s) total.
              </div>
              <div className="flex w-full items-center gap-8 lg:w-fit">
                <div className="hidden items-center gap-2 lg:flex">
                  <Label
                    htmlFor="rows-per-page"
                    className="text-sm font-medium"
                  >
                    Rows per page
                  </Label>
                  <Select
                    value={`${table.getState().pagination.pageSize}`}
                    onValueChange={(value) => {
                      table.setPageSize(Number(value));
                    }}
                  >
                    <SelectTrigger className="w-20" id="rows-per-page">
                      <SelectValue
                        placeholder={table.getState().pagination.pageSize}
                      />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {[10, 20, 30, 40, 50].map((pageSize) => (
                        <SelectItem key={pageSize} value={`${pageSize}`}>
                          {pageSize}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex w-fit items-center justify-center text-sm font-medium">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </div>
                <div className="ml-auto flex items-center gap-2 lg:ml-0">
                  <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">Go to first page</span>
                    <ChevronsLeftIcon />
                  </Button>
                  <Button
                    variant="outline"
                    className="size-8"
                    size="icon"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">Go to previous page</span>
                    <ChevronLeftIcon />
                  </Button>
                  <Button
                    variant="outline"
                    className="size-8"
                    size="icon"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Go to next page</span>
                    <ChevronRightIcon />
                  </Button>
                  <Button
                    variant="outline"
                    className="hidden size-8 lg:flex"
                    size="icon"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Go to last page</span>
                    <ChevronsRightIcon />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent
            value="past-performance"
            className="flex flex-col px-4 lg:px-6"
          >
            <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
          </TabsContent>
          <TabsContent
            value="key-personnel"
            className="flex flex-col px-4 lg:px-6"
          >
            <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
          </TabsContent>
          <TabsContent
            value="focus-documents"
            className="flex flex-col px-4 lg:px-6"
          >
            <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// 三行结构的内容组件
function RowContent({ item }: { item: z.infer<typeof schema> }) {
  // 每行两边添加呼吸空间 (padding)
  return (
    <div className="p-4">
      {/* 第一行：行首和行尾有字段信息 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Header:
          </span>
          <TableCellViewer item={item} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Status:
          </span>
          <Badge
            variant="outline"
            className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3"
          >
            {item.status === "Done" ? (
              <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
            ) : (
              <LoaderIcon />
            )}
            {item.status}
          </Badge>
        </div>
      </div>

      {/* 第二行：行首有字段信息 */}
      <div className="flex items-center mb-3">
        <div className="flex items-center gap-2 w-full">
          <span className="text-sm font-medium text-muted-foreground">
            Type:
          </span>
          <Badge variant="outline" className="px-1.5 text-muted-foreground">
            {item.type}
          </Badge>

          {/* 操作按钮保持在右侧 */}
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                  size="icon"
                >
                  <MoreVerticalIcon />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Make a copy</DropdownMenuItem>
                <DropdownMenuItem>Favorite</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* 第三行：行首和行尾有字段信息 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">
            Target/Limit:
          </span>

          {/* Target 输入框 */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.promise(
                new Promise((resolve) => setTimeout(resolve, 1000)),
                {
                  loading: `Saving ${item.header}`,
                  success: "Done",
                  error: "Error",
                }
              );
            }}
          >
            <Label htmlFor={`${item.id}-target`} className="sr-only">
              Target
            </Label>
            <Input
              className="h-8 w-16 border-transparent bg-transparent text-right shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background"
              defaultValue={item.target}
              id={`${item.id}-target`}
            />
          </form>

          {/* Limit 输入框 */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.promise(
                new Promise((resolve) => setTimeout(resolve, 1000)),
                {
                  loading: `Saving ${item.header}`,
                  success: "Done",
                  error: "Error",
                }
              );
            }}
          >
            <Label htmlFor={`${item.id}-limit`} className="sr-only">
              Limit
            </Label>
            <Input
              className="h-8 w-16 border-transparent bg-transparent text-right shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background"
              defaultValue={item.limit}
              id={`${item.id}-limit`}
            />
          </form>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Reviewer:
          </span>
          {item.reviewer !== "Assign reviewer" ? (
            item.reviewer
          ) : (
            <Select>
              <SelectTrigger className="h-8 w-40" id={`${item.id}-reviewer`}>
                <SelectValue placeholder="Assign reviewer" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
                <SelectItem value="Jamik Tashpulatov">
                  Jamik Tashpulatov
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
}

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="link" className="w-fit px-0 text-left text-foreground">
          {item.header}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader className="gap-1">
          <SheetTitle>{item.header}</SheetTitle>
          <SheetDescription>
            Showing total visitors for the last 6 months
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 0,
                    right: 10,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="var(--color-mobile)"
                    fillOpacity={0.6}
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator />
              <div className="grid gap-2">
                <div className="flex gap-2 font-medium leading-none">
                  Trending up by 5.2% this month{" "}
                  <TrendingUpIcon className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Showing total visitors for the last 6 months. This is just
                  some random text to test the layout. It spans multiple lines
                  and should wrap around.
                </div>
              </div>
              <Separator />
            </>
          )}
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="header">Header</Label>
              <Input id="header" defaultValue={item.header} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="type">Type</Label>
                <Select defaultValue={item.type}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Table of Contents">
                      Table of Contents
                    </SelectItem>
                    <SelectItem value="Executive Summary">
                      Executive Summary
                    </SelectItem>
                    <SelectItem value="Technical Approach">
                      Technical Approach
                    </SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Capabilities">Capabilities</SelectItem>
                    <SelectItem value="Focus Documents">
                      Focus Documents
                    </SelectItem>
                    <SelectItem value="Narrative">Narrative</SelectItem>
                    <SelectItem value="Cover Page">Cover Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue={item.status}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Done">Done</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="target">Target</Label>
                <Input id="target" defaultValue={item.target} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="limit">Limit</Label>
                <Input id="limit" defaultValue={item.limit} />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="reviewer">Reviewer</Label>
              <Select defaultValue={item.reviewer}>
                <SelectTrigger id="reviewer" className="w-full">
                  <SelectValue placeholder="Select a reviewer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
                  <SelectItem value="Jamik Tashpulatov">
                    Jamik Tashpulatov
                  </SelectItem>
                  <SelectItem value="Emily Whalen">Emily Whalen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>
        <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
          <Button className="w-full">Submit</Button>
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              Done
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
