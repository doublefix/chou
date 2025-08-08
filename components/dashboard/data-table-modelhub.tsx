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
import { StarIcon, GitBranchIcon } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  name: z.string(), // 仓库名称
  full_name: z.string(), // 完整名称（owner/name）
  description: z.string().nullable(), // 仓库描述
  owner: z.object({
    id: z.number(),
    login: z.string(), // 所有者用户名
    avatar_url: z.string(), // 所有者头像
  }),
  stars_count: z.number(), // 星级数量
  forks_count: z.number(), // Fork 数量
  created_at: z.string(), // 创建时间
  updated_at: z.string(), // 更新时间
  archived: z.boolean(), // 是否归档
  private: z.boolean(), // 是否私有
  default_branch: z.string(), // 新增：默认分支字段
});

// 筛选条件类型定义
type FilterState = {
  search: string;
  owners: string[]; // 按所有者筛选
  archived: boolean | null; // 按归档状态筛选
  private: boolean | null; // 按私有状态筛选
};

// 调整列定义 - 仅保留一个主要列用于渲染三行结构
const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    accessorKey: "main",
    header: "",
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

  // 🌟 关键修改：更新筛选状态为仓库数据适配
  const [filters, setFilters] = React.useState<FilterState>({
    search: "",
    owners: [],
    archived: null,
    private: null,
  });

  const isMobile = useIsMobile();

  // 🌟 关键修改：提取仓库数据的唯一筛选选项
  const uniqueOwners = Array.from(
    new Set(initialData.map((item) => item.owner.login))
  );

  // 🌟 关键修改：更新筛选逻辑为仓库数据适配
  React.useEffect(() => {
    let result = [...initialData];

    // 搜索筛选（名称、描述、所有者）
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          (item.description &&
            item.description.toLowerCase().includes(searchLower)) ||
          item.owner.login.toLowerCase().includes(searchLower)
      );
    }

    // 所有者筛选
    if (filters.owners.length > 0) {
      result = result.filter((item) =>
        filters.owners.includes(item.owner.login)
      );
    }

    // 归档状态筛选
    if (filters.archived !== null) {
      result = result.filter((item) => item.archived === filters.archived);
    }

    // 私有状态筛选
    if (filters.private !== null) {
      result = result.filter((item) => item.private === filters.private);
    }

    setFilteredData(result);
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

  // 🌟 关键修改：更新筛选器处理函数为仓库数据适配
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // 切换所有者筛选
  const toggleOwnerFilter = (owner: string) => {
    setFilters((prev) => {
      const owners = prev.owners.includes(owner)
        ? prev.owners.filter((o) => o !== owner)
        : [...prev.owners, owner];
      return { ...prev, owners };
    });
  };

  // 清除所有筛选
  const clearAllFilters = () => {
    setFilters({
      search: "",
      owners: [],
      archived: null,
      private: null,
    });
  };

  // 🌟 关键修改：更新筛选面板为仓库数据适配
  const FilterPanel = () => (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Repository Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          disabled={
            !filters.search &&
            filters.owners.length === 0 &&
            filters.archived === null &&
            filters.private === null
          }
          className="h-8 gap-1 text-sm text-muted-foreground"
        >
          <XIcon className="h-4 w-4" />
          Clear all
        </Button>
      </div>

      {/* 搜索筛选 */}
      <div className="space-y-2">
        <Label htmlFor="search-filter">Search Repositories</Label>
        <div className="relative">
          <FilterIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search-filter"
            placeholder="Search by name, description, owner..."
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

      {/* 所有者筛选 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Owners</Label>
          <Badge variant="outline" className="h-6 px-1.5 text-xs">
            {filters.owners.length}
          </Badge>
        </div>
        <div className="space-y-2">
          {uniqueOwners.map((owner) => (
            <div key={owner} className="flex items-center space-x-2">
              <Checkbox
                id={`owner-${owner}`}
                checked={filters.owners.includes(owner)}
                onCheckedChange={() => toggleOwnerFilter(owner)}
              />
              <Label
                htmlFor={`owner-${owner}`}
                className="text-sm font-normal leading-none"
              >
                {owner}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* 归档状态筛选 */}
      <div className="space-y-3">
        <Label>Archived Status</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="archived-true"
              checked={filters.archived === true}
              onCheckedChange={(checked) =>
                handleFilterChange("archived", checked ? true : null)
              }
            />
            <Label htmlFor="archived-true" className="text-sm font-normal">
              Archived
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="archived-false"
              checked={filters.archived === false}
              onCheckedChange={(checked) =>
                handleFilterChange("archived", checked ? false : null)
              }
            />
            <Label htmlFor="archived-false" className="text-sm font-normal">
              Active
            </Label>
          </div>
        </div>
      </div>

      <Separator />

      {/* 私有状态筛选 */}
      <div className="space-y-3">
        <Label>Visibility</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="private-true"
              checked={filters.private === true}
              onCheckedChange={(checked) =>
                handleFilterChange("private", checked ? true : null)
              }
            />
            <Label htmlFor="private-true" className="text-sm font-normal">
              Private
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="private-false"
              checked={filters.private === false}
              onCheckedChange={(checked) =>
                handleFilterChange("private", checked ? false : null)
              }
            />
            <Label htmlFor="private-false" className="text-sm font-normal">
              Public
            </Label>
          </div>
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
            <div>
              <Input
                type="search"
                autoComplete="off"
                spellCheck="false"
                placeholder="Search repositories..."
                className="h-9 w-[360px]"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
            {/* 保留原有 TabsList 和按钮组 */}
            <TabsList className="@4xl/main:flex hidden">
              <TabsTrigger value="outline">Repositories</TabsTrigger>
              <TabsTrigger value="past-performance" className="gap-1">
                Stars Trend
                <Badge
                  variant="secondary"
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/30"
                >
                  ↑
                </Badge>
              </TabsTrigger>
              {/* 其他标签页保留 */}
            </TabsList>
            <div className="flex items-center gap-2">
              {/* 保留原有列自定义和添加按钮 */}
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
                  {/* 列自定义内容保留 */}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm">
                <PlusIcon />
                <span className="hidden lg:inline">Add Repository</span>
              </Button>
            </div>
          </div>

          {/* 活跃筛选器标签（适配仓库数据） */}
          {(filters.search ||
            filters.owners.length > 0 ||
            filters.archived !== null ||
            filters.private !== null) && (
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

                {filters.owners.map((owner) => (
                  <Badge
                    key={`badge-owner-${owner}`}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Owner: {owner}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      onClick={() => toggleOwnerFilter(owner)}
                    >
                      <XIcon className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}

                {filters.archived !== null && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {filters.archived ? "Archived" : "Active"}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      onClick={() => handleFilterChange("archived", null)}
                    >
                      <XIcon className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {filters.private !== null && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {filters.private ? "Private" : "Public"}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      onClick={() => handleFilterChange("private", null)}
                    >
                      <XIcon className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* 表格内容区域（主要内容不变，复用原有结构） */}
          <TabsContent
            value="outline"
            className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
          >
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-muted h-12">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} colSpan={header.colSpan}>
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
                        className="h-auto"
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
                        No repositories match your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {/* 🌟 恢复并优化的分页控件 */}
            <div className="flex items-center justify-between px-4">
              <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                Showing {table.getRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} results
              </div>
              <div className="flex w-full items-center gap-4 lg:w-auto">
                {/* 每页行数选择器 */}
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
                      {[5, 10, 20, 30].map((pageSize) => (
                        <SelectItem key={pageSize} value={`${pageSize}`}>
                          {pageSize}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 分页导航按钮 */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <ChevronsLeftIcon className="h-4 w-4" />
                    <span className="sr-only">First page</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    <span className="sr-only">Previous page</span>
                  </Button>

                  {/* 页码显示 */}
                  <span className="flex items-center justify-center w-8 text-sm font-medium">
                    {table.getState().pagination.pageIndex + 1}
                  </span>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                    <span className="sr-only">Next page</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                  >
                    <ChevronsRightIcon className="h-4 w-4" />
                    <span className="sr-only">Last page</span>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          {/* 其他标签页内容保留 */}
        </Tabs>
      </div>
    </div>
  );
}

// 🌟 关键修改：更新行内容为仓库数据适配
// 🌟 优化后的行内容组件
function RowContent({ item }: { item: z.infer<typeof schema> }) {
  // 格式化日期显示
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // 获取所有者名称首字母作为 fallback
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="p-4 space-y-3">
      {/* 第一行：头像、项目名称（大字体）、Star按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* 头像 */}
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={item.owner.avatar_url}
              alt={item.owner.login}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <AvatarFallback>{getInitials(item.owner.login)}</AvatarFallback>
          </Avatar>

          {/* 项目名称（放大字体） */}
          <TableCellViewer item={item} />
        </div>

        {/* 行尾部 Star 按钮 */}
        <Button size="sm" variant="outline" className="gap-1">
          <StarIcon className="h-4 w-4" />
          Star
        </Button>
      </div>

      {/* 第二行：项目描述 */}
      <div className="text-sm text-muted-foreground">
        {item.description || "No description provided"}
      </div>

      {/* 第三行：项目标签 */}
      <div className="flex flex-wrap gap-2">
        <Badge variant={item.private ? "secondary" : "outline"}>
          {item.private ? "Private" : "Public"}
        </Badge>
        {item.archived && <Badge variant="destructive">Archived</Badge>}
        <Badge variant="outline">
          <GitBranchIcon className="h-3 w-3 mr-1" />
          {item.default_branch || "main"}
        </Badge>
      </div>

      {/* 第四行：Star数、最近更新时间 */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <StarIcon className="h-4 w-4 text-yellow-500" />
          <span>{item.stars_count} stars</span>
        </div>
        <div>Last updated: {formatDate(item.updated_at)}</div>
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
        <Button
          variant="link"
          className="w-fit px-0 text-left text-foreground font-semibold text-lg" // 增大字体
        >
          {item.full_name}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader className="gap-1">
          <SheetTitle>{item.full_name}</SheetTitle>
          <SheetDescription>Repository details and statistics</SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4 text-sm">
          {/* 仓库基本信息 */}
          <div className="flex items-center gap-3">
            <img
              src={item.owner.avatar_url}
              alt={item.owner.login}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <div className="font-medium">{item.owner.login}</div>
              <div className="text-muted-foreground">Repository Owner</div>
            </div>
          </div>

          {/* 仓库描述 */}
          <div className="p-3 bg-muted rounded-lg">
            {item.description || "No description provided for this repository."}
          </div>

          {/* 仓库统计信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <div className="text-muted-foreground">Stars</div>
              <div className="flex items-center gap-1 font-medium">
                <StarIcon className="h-4 w-4 text-yellow-500" />
                {item.stars_count}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-muted-foreground">Forks</div>
              <div className="flex items-center gap-1 font-medium">
                <GitBranchIcon className="h-4 w-4" />
                {item.forks_count}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-muted-foreground">Created</div>
              <div className="font-medium">{formatDate(item.created_at)}</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-muted-foreground">Last Updated</div>
              <div className="font-medium">{formatDate(item.updated_at)}</div>
            </div>
          </div>

          {/* 仓库状态标签 */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={item.private ? "secondary" : "outline"}>
              {item.private ? "Private" : "Public"}
            </Badge>
            {item.archived && <Badge variant="destructive">Archived</Badge>}
            <Badge variant="outline">
              <GitBranchIcon className="h-3 w-3 mr-1" />
              {item.default_branch || "main"}
            </Badge>
          </div>
        </div>
        <SheetFooter className="mt-auto flex gap-2">
          <Button>
            <GitBranchIcon className="h-4 w-4 mr-2" />
            Clone Repository
          </Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};
