"use client";

import * as React from "react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  ColumnsIcon,
  GripVerticalIcon,
  LoaderIcon,
  MoreVerticalIcon,
  PlusIcon,
  ChevronUpIcon,
} from "lucide-react";
import { DataTableSkeleton } from "@/components/dashboard/data-table-pod-skeleton";

import { Loader2, RefreshCw, RotateCw } from "lucide-react";

import { z } from "zod";

import { useIsMobile } from "@/components/ui/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartConfig } from "@/components/dashboard/chart";
import { Checkbox } from "@/components/ui/checkbox";
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

export const schema = z.object({
  id: z.string(),
  name: z.string(),
  namespace: z.string(),
  status: z.string(),
  nodeName: z.string(),
  podIP: z.string(),
  restarts: z.number(),
  age: z.string(),
  startTime: z.string(),
  containers: z.array(
    z.object({
      name: z.string(),
      image: z.string(),
      ready: z.boolean(),
      restartCount: z.number(),
    })
  ),
});

// Create a separate component for the drag handle
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: "namespace",
    header: "Namespace",
    cell: ({ row }) => (
      <Badge variant="outline" className="px-1.5">
        {row.original.namespace}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3"
      >
        {row.original.status === "Running" ? (
          <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
        ) : (
          <LoaderIcon />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "nodeName",
    header: "Node",
    cell: ({ row }) => (
      <div className="w-24 truncate">{row.original.nodeName}</div>
    ),
  },
  {
    accessorKey: "podIP",
    header: "Pod IP",
    cell: ({ row }) => (
      <div className="w-24 truncate">{row.original.podIP}</div>
    ),
  },
  {
    accessorKey: "restarts",
    header: "Restarts",
    cell: ({ row }) => (
      <div className="text-right">{row.original.restarts}</div>
    ),
  },
  {
    accessorKey: "age",
    header: "Age",
    cell: ({ row }) => {
      const date = new Date(row.original.startTime);
      return <div className="w-24 text-sm">{date.toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    cell: () => (
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
          <DropdownMenuSeparator />
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      return row.original.containers.length > 0 ? (
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => row.toggleExpanded()}
        >
          {row.getIsExpanded() ? (
            <ChevronUpIcon className="size-4" />
          ) : (
            <ChevronDownIcon className="size-4" />
          )}
          <span className="sr-only">Toggle expand</span>
        </Button>
      ) : null;
    },
  },
];

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <>
      {/* Main row */}
      <TableRow
        data-state={row.getIsSelected() && "selected"}
        data-dragging={isDragging}
        ref={setNodeRef}
        className="group relative z-0 bg-background data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
        style={{
          transform: CSS.Transform.toString(transform),
          transition: transition,
        }}
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id} className="py-3">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>

      {/* Expanded content for containers */}
      {row.getIsExpanded() && row.original.containers.length > 0 && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={columns.length} className="p-0">
            <div className="pl-12 pr-4 py-6">
              <div className="space-y-4">
                {row.original.containers.map((container, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 px-3 py-2 text-sm border border-dashed border-muted-foreground/20 hover:border-muted-foreground/50 rounded-lg bg-muted/5 transition-colors"
                  >
                    {/* Container indicator */}
                    <div className="w-6 flex justify-center">
                      <div className="size-1.5 rounded-full bg-muted-foreground/40" />
                    </div>

                    {/* Container content */}
                    <div className="w-32 truncate text-muted-foreground">
                      {container.name}
                    </div>
                    <div className="flex-1 truncate">{container.image}</div>
                    <div className="w-20 text-right text-muted-foreground/80">
                      {container.ready ? "Ready" : "Not Ready"}
                    </div>
                    <div className="w-20 text-right text-muted-foreground/80">
                      {container.restartCount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export function DataTable({
  data: initialData,
  onNextPage,
  onPrevPage,
  onFirstPage,
  onPageSizeChange,
  pageSize: parentPageSize,
  hasNextPage,
  hasPrevPage,
  loading,
  onRefresh,
}: {
  data: z.infer<typeof schema>[];
  onNextPage: () => void;
  onPrevPage: () => void;
  onFirstPage: () => void;
  onPageSizeChange: (size: number) => void;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  loading: boolean;
  onRefresh?: () => void;
}) {
  const [data, setData] = React.useState<z.infer<typeof schema>[]>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: parentPageSize,
  });
  const [expanded, setExpanded] = React.useState({});
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);

  React.useEffect(() => {
    if (initialData && initialData.length > 0) {
      setData(initialData);
      setIsInitialLoad(false);
    } else if (!loading && initialData.length === 0) {
      setIsInitialLoad(false);
    }
  }, [initialData, loading]);

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
      expanded,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  const showSkeleton = loading && isInitialLoad;
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    const start = Date.now();

    try {
      onRefresh?.();
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      const elapsed = Date.now() - start;
      const delay = Math.max(0, 500 - elapsed); // 至少显示 500ms
      setTimeout(() => setIsRefreshing(false), delay);
    }
  };
  const isLoading = loading || isRefreshing;

  return (
    <Tabs
      defaultValue="outline"
      className="flex w-full flex-col justify-start gap-2"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        {/* Mobile View Selector */}
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="outline">
          <SelectTrigger id="view-selector" className="flex w-fit lg:hidden">
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="outline">Outline</SelectItem>
            <SelectItem value="past-performance">Past Performance</SelectItem>
            <SelectItem value="key-personnel">Key Personnel</SelectItem>
            <SelectItem value="focus-documents">Focus Documents</SelectItem>
          </SelectContent>
        </Select>

        {/* Desktop Tabs View */}
        <TabsList className="hidden lg:flex space-x-2">
          <TabsTrigger value="outline">Outline</TabsTrigger>
          <TabsTrigger
            value="past-performance"
            className="flex items-center gap-1"
          >
            Past Performance
            <Badge
              variant="secondary"
              className="h-5 w-5 flex items-center justify-center rounded-full bg-muted-foreground/20 text-xs"
            >
              3
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="key-personnel"
            className="flex items-center gap-1"
          >
            Key Personnel
            <Badge
              variant="secondary"
              className="h-5 w-5 flex items-center justify-center rounded-full bg-muted-foreground/20 text-xs"
            >
              2
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="focus-documents">Focus Documents</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-accent hover:text-accent-foreground"
              >
                <ColumnsIcon className="h-4 w-4" />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <ChevronDownIcon className="h-4 w-4 ml-1" />
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
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize hover:bg-muted/60 focus:bg-muted"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-accent hover:text-accent-foreground"
          >
            <PlusIcon className="h-4 w-4" />
            <span className="hidden lg:inline">Add Section</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
                Refresh
              </>
            ) : (
              <>
                <RefreshCw className="mr-1 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {showSkeleton ? (
                  <DataTableSkeleton pageSize={parentPageSize} />
                ) : table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  const newSize = Number(value);
                  table.setPageSize(newSize);
                  onPageSizeChange(newSize);
                }}
              >
                <SelectTrigger className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[1, 2, 3, 5, 10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => {
                  onFirstPage();
                  table.setPageIndex(0);
                }}
                disabled={!hasPrevPage || loading}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => {
                  onPrevPage();
                  table.previousPage();
                }}
                disabled={!hasPrevPage || loading}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => {
                  onNextPage();
                  table.nextPage();
                }}
                disabled={!hasNextPage || loading}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* other */}
      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
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
          {item.name}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader className="gap-1">
          <SheetTitle>{item.name}</SheetTitle>
          <SheetDescription>Pod details and specifications</SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4 text-sm">
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={item.name} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="namespace">Namespace</Label>
                <Input id="namespace" defaultValue={item.namespace} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue={item.status}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Running">Running</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                    <SelectItem value="Succeeded">Succeeded</SelectItem>
                    <SelectItem value="Unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="nodeName">Node</Label>
                <Input id="nodeName" defaultValue={item.nodeName} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="podIP">Pod IP</Label>
                <Input id="podIP" defaultValue={item.podIP} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="restarts">Restarts</Label>
                <Input id="restarts" defaultValue={item.restarts.toString()} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="age">Age</Label>
                <Input id="age" defaultValue={item.age} />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Containers</Label>
              <div className="rounded-lg border p-4">
                {item.containers.map((container, index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <div className="font-medium">{container.name}</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Image</Label>
                        <div className="text-sm">{container.image}</div>
                      </div>
                      <div>
                        <Label>Ready</Label>
                        <div className="text-sm">
                          {container.ready ? "Yes" : "No"}
                        </div>
                      </div>
                      <div>
                        <Label>Restarts</Label>
                        <div className="text-sm">{container.restartCount}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
        <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
          <Button className="w-full">Save Changes</Button>
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
