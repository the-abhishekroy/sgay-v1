"use client"

import { useState, useMemo } from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  getFilteredRowModel,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { House } from "@/lib/types"
import { useAppContext } from "@/lib/app-context"
import { useRouter } from "next/navigation"

export function DataTable({ houses }: { houses: House[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})
  const { user } = useAppContext()
  const router = useRouter()

  // Memoize columns definition to prevent recreation on each render
  const columns = useMemo<ColumnDef<House>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <div className="text-center">{row.getValue("id")}</div>,
      },
      {
        accessorKey: "beneficiaryName",
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Beneficiary
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => <div>{row.getValue("beneficiaryName")}</div>,
      },
      {
        accessorKey: "constituency",
        header: "Constituency",
        cell: ({ row }) => <div>{row.getValue("constituency")}</div>,
      },
      {
        accessorKey: "village",
        header: "Village",
        cell: ({ row }) => <div>{row.getValue("village")}</div>,
      },
      {
        accessorKey: "stage",
        header: "Stage",
        cell: ({ row }) => {
          const stage = row.getValue("stage") as string
          return (
            <Badge
              variant="outline"
              className={
                stage === "Completed"
                  ? "bg-green-100 text-green-800 border-green-300"
                  : stage === "In Progress"
                    ? "bg-blue-100 text-blue-800 border-blue-300"
                    : "bg-red-100 text-red-800 border-red-300"
              }
            >
              {stage}
            </Badge>
          )
        },
      },
      {
        accessorKey: "progress",
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Progress
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const progress = row.getValue("progress") as number
          return (
            <div className="flex items-center gap-2">
              <Progress value={progress} className="h-2 w-24" />
              <span className="text-xs">{progress}%</span>
            </div>
          )
        },
      },
      {
        accessorKey: "fundUtilized",
        header: "Fund Utilized",
        cell: ({ row }) => <div>{row.getValue("fundUtilized")}</div>,
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const house = row.original

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(house.id.toString())}>
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/beneficiaries/${house.id}`)}>
                  View Details
                </DropdownMenuItem>
                {user?.role === "admin" || user?.role === "officer" ? (
                  <DropdownMenuItem onClick={() => router.push(`/manage/update-progress/${house.id}`)}>
                    Update Progress
                  </DropdownMenuItem>
                ) : null}
                {user?.role === "admin" && (
                  <DropdownMenuItem onClick={() => router.push(`/manage/edit/${house.id}`)}>
                    Edit Beneficiary
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [user, router],
  )

  // Memoize table instance to prevent recreation on each render
  const table = useReactTable({
    data: houses,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter beneficiaries..."
          value={(table.getColumn("beneficiaryName")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("beneficiaryName")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuItem
                      key={column.id}
                      className="capitalize"
                      onClick={() => column.toggleVisibility(!column.getIsVisible())}
                    >
                      <Checkbox
                        checked={column.getIsVisible()}
                        className="mr-2"
                        aria-label={`Toggle ${column.id} visibility`}
                      />
                      {column.id}
                    </DropdownMenuItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline">Export</Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

