"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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

  const clearAllFilters = () => {
    setFilters({
      search: "",
      owners: [],
      archived: null,
      private: null,
    });
  };

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
      <div className="hidden lg:block w-96 ml-4 rounded-lg shrink-0">
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <FilterPanel />
        </ScrollArea>
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
              <Button variant="outline" size="sm">
                <PlusIcon />
                <span className="hidden lg:inline">Add Repository</span>
              </Button>
            </div>
          </div>
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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials(item.owner.login)}</AvatarFallback>
          </Avatar>

          <TableCellViewer item={item} />
        </div>

        <Button size="sm" variant="outline" className="gap-1">
          <StarIcon className="h-4 w-4" />
          Star
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        {item.description || "No description provided"}
      </div>

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
  const router = useRouter();

  const handleClick = () => {
    // 跳转到项目详情页
    router.push(`/home/modelhub/${item.id}`);
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};
