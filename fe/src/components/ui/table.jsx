"use client"

import { ArrowUpDown } from "lucide-react"
import {
  Cell as AriaCell,
  Column as AriaColumn,
  ResizableTableContainer as AriaResizableTableContainer,
  Row as AriaRow,
  Table as AriaTable,
  TableBody as AriaTableBody,
  TableHeader as AriaTableHeader,
  ColumnResizer,
  Group,
  composeRenderProps,
} from "react-aria-components"

import { cn } from "@/lib/utils"

const ResizableTableContainer = AriaResizableTableContainer

const Table = ({ className, ...props }) => (
  <AriaTable
    className={composeRenderProps(className, (resolvedClassName) =>
      cn(
        "w-full caption-bottom text-sm -outline-offset-2 data-[focus-visible]:outline-ring",
        resolvedClassName
      )
    )}
    {...props}
  />
)

const TableHeader = ({ className, ...props }) => (
  <AriaTableHeader
    className={composeRenderProps(className, (resolvedClassName) =>
      cn("[&_tr]:border-b [&_tr]:border-slate-200", resolvedClassName)
    )}
    {...props}
  />
)

const Column = ({ className, children, isResizable = false, ...props }) => (
  <AriaColumn
    className={composeRenderProps(className, (resolvedClassName) =>
      cn(
        "h-12 text-left align-middle font-medium text-slate-500 -outline-offset-2 data-[focus-visible]:outline-ring",
        resolvedClassName
      )
    )}
    {...props}
  >
    {composeRenderProps(children, (resolvedChildren, { allowsSorting }) => (
      <div className="flex items-center">
        <Group
          role="presentation"
          tabIndex={-1}
          className={cn(
            "flex h-10 flex-1 items-center gap-1 overflow-hidden rounded-md px-4 focus-visible:outline-none data-[focus-visible]:outline-ring [&:has([slot=selection])]:pr-0",
            allowsSorting && "data-[hovered]:bg-slate-50 data-[hovered]:text-slate-900"
          )}
        >
          <span className="truncate">{resolvedChildren}</span>
          {allowsSorting ? <ArrowUpDown className="ml-2 h-4 w-4" /> : null}
        </Group>
        {isResizable ? (
          <ColumnResizer className="box-content h-5 w-px translate-x-[8px] cursor-col-resize rounded bg-slate-300 bg-clip-content px-[8px] py-1 focus-visible:outline-none data-[resizing]:w-[2px] data-[resizing]:bg-[#ff623d] data-[resizing]:pl-[7px] data-[focus-visible]:ring-1 data-[focus-visible]:ring-[#ff623d]" />
        ) : null}
      </div>
    ))}
  </AriaColumn>
)

const TableBody = ({ className, ...props }) => (
  <AriaTableBody
    className={composeRenderProps(className, (resolvedClassName) =>
      cn(
        "-outline-offset-2 data-[empty]:h-24 data-[empty]:text-center data-[focus-visible]:outline-ring [&_tr:last-child]:border-0",
        resolvedClassName
      )
    )}
    {...props}
  />
)

const Row = ({ className, ...props }) => (
  <AriaRow
    className={composeRenderProps(className, (resolvedClassName) =>
      cn(
        "border-b border-slate-200 -outline-offset-2 transition-colors data-[hovered]:bg-slate-50 data-[selected]:bg-slate-50 data-[focus-visible]:outline-ring",
        resolvedClassName
      )
    )}
    {...props}
  />
)

const Cell = ({ className, ...props }) => (
  <AriaCell
    className={composeRenderProps(className, (resolvedClassName) =>
      cn(
        "p-4 align-middle -outline-offset-2 data-[focus-visible]:outline-ring [&:has([role=checkbox])]:pr-0",
        resolvedClassName
      )
    )}
    {...props}
  />
)

export {
  Table,
  TableHeader,
  Column,
  TableBody,
  Row,
  Cell,
  ResizableTableContainer,
}
