"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  ColumnFiltersState,
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
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
} from "date-fns";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  FilterIcon,
  ClockIcon,
  PlusIcon,
  ListRestart,
  XIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { z } from "zod";

import { useIsMobile } from "@/components/ui/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const schema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  description: z.string().nullable(),
  owner: z.object({
    id: z.number(),
    login: z.string(),
    avatar_url: z.string(),
  }),
  stars_count: z.number(),
  forks_count: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  archived: z.boolean(),
  private: z.boolean(),
  default_branch: z.string(),
});

type FilterState = {
  search: string;
  owners: string[];
  archived: boolean | null;
  private: boolean | null;
};

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
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  data: z.infer<typeof schema>[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
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
    pageIndex: page - 1,
    pageSize,
  });

  const [filters, setFilters] = React.useState<FilterState>({
    search: "",
    owners: [],
    archived: null,
    private: null,
  });

  const isMobile = useIsMobile();

  const uniqueOwners = Array.from(
    new Set(initialData.map((item) => item.owner.login))
  );

  React.useEffect(() => {
    let result = [...initialData];

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

    if (filters.owners.length > 0) {
      result = result.filter((item) =>
        filters.owners.includes(item.owner.login)
      );
    }

    if (filters.archived !== null) {
      result = result.filter((item) => item.archived === filters.archived);
    }

    if (filters.private !== null) {
      result = result.filter((item) => item.private === filters.private);
    }

    setFilteredData(result);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [filters, initialData]);

  React.useEffect(() => {
    setPagination({
      pageIndex: page - 1,
      pageSize,
    });
  }, [page, pageSize]);

  const handlePaginationChange = (updater: any) => {
    if (typeof updater === "function") {
      const newPagination = updater(pagination);
      onPageChange(newPagination.pageIndex + 1);
      onPageSizeChange(newPagination.pageSize);
    }
  };
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
    },
    getRowId: (row) => row.id.toString(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleOwnerFilter = (owner: string) => {
    setFilters((prev) => {
      const owners = prev.owners.includes(owner)
        ? prev.owners.filter((o) => o !== owner)
        : [...prev.owners, owner];
      return { ...prev, owners };
    });
  };

  const FilterPanel = () => (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Repository Filters</h3>
      </div>

      {/* Owners 筛选组 */}
      <div className="space-y-2 relative">
        <div className="flex items-center justify-between">
          <Label>Owners</Label>
          {filters.owners.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFilterChange("owners", [])}
              className="h-6 gap-1 text-xs text-muted-foreground absolute right-0 top-0"
            >
              <ListRestart className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-6">
          {uniqueOwners.map((owner) => (
            <Badge
              key={owner}
              variant="outline"
              className={`cursor-pointer gap-1 px-2 py-1 transition-all min-w-[80px] text-center justify-center ${
                filters.owners.includes(owner)
                  ? "border-2 border-primary font-medium"
                  : "border-muted-foreground/30"
              }`}
              onClick={() => toggleOwnerFilter(owner)}
            >
              <span className="flex items-center justify-center">
                {owner}
                {filters.owners.includes(owner) && (
                  <XIcon className="h-3 w-3 ml-1" />
                )}
              </span>
            </Badge>
          ))}
        </div>
      </div>

      {/* Archived Status 筛选组 */}
      <div className="space-y-2 relative">
        <div className="flex items-center justify-between">
          <Label>Archived Status</Label>
          {filters.archived !== null && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFilterChange("archived", null)}
              className="h-6 gap-1 text-xs text-muted-foreground absolute right-0 top-0"
            >
              <ListRestart className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-6">
          <Badge
            variant="outline"
            className={`cursor-pointer gap-1 px-2 py-1 transition-all min-w-[80px] text-center justify-center ${
              filters.archived === true
                ? "border-2 border-primary font-medium"
                : "border-muted-foreground/30"
            }`}
            onClick={() =>
              handleFilterChange(
                "archived",
                filters.archived === true ? null : true
              )
            }
          >
            <span className="flex items-center justify-center">
              Archived
              {filters.archived === true && <XIcon className="h-3 w-3 ml-1" />}
            </span>
          </Badge>
          <Badge
            variant="outline"
            className={`cursor-pointer gap-1 px-2 py-1 transition-all min-w-[80px] text-center justify-center ${
              filters.archived === false
                ? "border-2 border-primary font-medium"
                : "border-muted-foreground/30"
            }`}
            onClick={() =>
              handleFilterChange(
                "archived",
                filters.archived === false ? null : false
              )
            }
          >
            <span className="flex items-center justify-center">
              Active
              {filters.archived === false && <XIcon className="h-3 w-3 ml-1" />}
            </span>
          </Badge>
        </div>
      </div>

      {/* Visibility 筛选组 */}
      <div className="space-y-2 relative">
        <div className="flex items-center justify-between">
          <Label>Visibility</Label>
          {filters.private !== null && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFilterChange("private", null)}
              className="h-6 gap-1 text-xs text-muted-foreground absolute right-0 top-0"
            >
              <ListRestart className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-6">
          <Badge
            variant="outline"
            className={`cursor-pointer gap-1 px-2 py-1 transition-all min-w-[80px] text-center justify-center ${
              filters.private === true
                ? "border-2 border-primary font-medium"
                : "border-muted-foreground/30"
            }`}
            onClick={() =>
              handleFilterChange(
                "private",
                filters.private === true ? null : true
              )
            }
          >
            <span className="flex items-center justify-center">
              Private
              {filters.private === true && <XIcon className="h-3 w-3 ml-1" />}
            </span>
          </Badge>
          <Badge
            variant="outline"
            className={`cursor-pointer gap-1 px-2 py-1 transition-all min-w-[80px] text-center justify-center ${
              filters.private === false
                ? "border-2 border-primary font-medium"
                : "border-muted-foreground/30"
            }`}
            onClick={() =>
              handleFilterChange(
                "private",
                filters.private === false ? null : false
              )
            }
          >
            <span className="flex items-center justify-center">
              Public
              {filters.private === false && <XIcon className="h-3 w-3 ml-1" />}
            </span>
          </Badge>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row w-full">
      <div className="hidden lg:block w-96 ml-4 rounded-lg shrink-0">
        <FilterPanel />
      </div>

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
            </TabsList>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <PlusIcon className="w-4 h-4" />
                <span className="hidden lg:inline ml-2">Add Repository</span>
              </Button>
            </div>
          </div>

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
            <div className="flex items-center justify-between px-4">
              <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                Showing {(page - 1) * pageSize + 1}-
                {Math.min(page * pageSize, totalCount)} of {totalCount} results
              </div>
              <div className="flex w-full items-center gap-4 lg:w-auto">
                <div className="hidden items-center gap-2 lg:flex">
                  <Label
                    htmlFor="rows-per-page"
                    className="text-sm font-medium"
                  >
                    Rows per page
                  </Label>
                  <Select
                    value={`${pageSize}`}
                    onValueChange={(value) => {
                      onPageSizeChange(Number(value));
                    }}
                  >
                    <SelectTrigger className="w-20" id="rows-per-page">
                      <SelectValue placeholder={pageSize} />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {[2, 5, 10, 20, 30].map((pageSize) => (
                        <SelectItem key={pageSize} value={`${pageSize}`}>
                          {pageSize}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(1)}
                    disabled={page === 1}
                  >
                    <ChevronsLeftIcon className="h-4 w-4" />
                    <span className="sr-only">First page</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    <span className="sr-only">Previous page</span>
                  </Button>

                  <span className="flex items-center justify-center w-8 text-sm font-medium">
                    {page}
                  </span>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page * pageSize >= totalCount}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                    <span className="sr-only">Next page</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      onPageChange(Math.ceil(totalCount / pageSize))
                    }
                    disabled={page * pageSize >= totalCount} // 最后一页时禁用
                  >
                    <ChevronsRightIcon className="h-4 w-4" />
                    <span className="sr-only">Last page</span>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function RowContent({ item }: { item: z.infer<typeof schema> }) {
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    const minutes = differenceInMinutes(now, date);
    if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;

    const hours = differenceInHours(now, date);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

    const days = differenceInDays(now, date);
    if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;

    const months = differenceInMonths(now, date);
    if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;

    const years = differenceInYears(now, date);
    return `${years} year${years > 1 ? "s" : ""} ago`;
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        {/* 左侧：头像 + 名称 */}
        <div className="flex items-center gap-3">
          <Avatar className="h-6 w-6">
            <AvatarFallback>{getInitials(item.owner.login)}</AvatarFallback>
          </Avatar>

          <TableCellViewer item={item} />
        </div>

        {/* 右侧：Star 按钮 */}
        <Button size="sm" variant="outline" className="gap-1">
          <StarIcon className="h-4 w-4" />
          Star
        </Button>
      </div>

      {/* 描述 */}
      <div className="text-sm text-muted-foreground">
        {item.description || ""}
      </div>

      {/* 底部信息：左对齐 */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        {/* Stars 一组 */}
        <div className="flex items-center gap-1">
          <ClockIcon className="h-4 w-4" />
          <span>Last updated {formatRelativeTime(item.updated_at)}</span>
        </div>
        <div className="flex items-center gap-1">
          <StarIcon className="h-4 w-4" />
          <span>{item.stars_count}</span>
        </div>

        {/* 更新时间一组 */}
      </div>
    </div>
  );
}

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const router = useRouter();

  const handleClick = () => {
    // 跳转到项目详情页
    router.push(`/home/modelhub/${item.owner.login}/${item.name}`);
  };

  return (
    <Button
      variant="link"
      className="w-fit px-0 text-left text-foreground font-semibold text-lg"
      onClick={handleClick}
    >
      {item.full_name}
    </Button>
  );
}
