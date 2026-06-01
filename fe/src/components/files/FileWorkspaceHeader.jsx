import { FileText, Search, SquarePen, Upload } from 'lucide-react'
import { Button, Input } from '@/components/ui'

export default function FileWorkspaceHeader({
  searchQuery,
  onSearchChange,
  onOpenGenerated,
  onOpenUploaded,
}) {
  return (
    <section>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-[280px]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-2xl text-[#ff623d]">
              <FileText className="h-10 w-10" />
            </div>
            <h1 className="text-[2rem] font-bold leading-tight text-[#ff623d]">
              Document Workspace
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Kelola dokumen generated dan uploaded dalam satu workspace untuk
            download dan tanya isi dokumen dengan AI.
          </p>
        </div>

        <form onSubmit={(event) => event.preventDefault()} className="w-full max-w-[540px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Cari dokumen atau kategori..."
              className="h-auto w-full rounded-2xl bg-white px-4 py-4 pl-14 pr-16 text-sm text-slate-700 placeholder:text-slate-400"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
              Ctrl K
            </span>
          </div>
        </form>

        <div className="flex items-center gap-3">
          <Button
            onClick={onOpenGenerated}
            variant="default"
            size="sm"
            className="gap-2 rounded-2xl border border-[#ff623d] bg-transparent text-sm text-[#ff623d] hover:bg-[#fff0eb]"
          >
            <SquarePen className="h-4 w-4" />
            <span>Create</span>
          </Button>
          <Button
            onClick={onOpenUploaded}
            variant="default"
            size="sm"
            className="gap-2 rounded-2xl bg-[#ff623d] text-sm text-white hover:bg-[#ff744f]"
          >
            <Upload className="h-4 w-4" />
            <span>Upload</span>
          </Button>
        </div>
      </div>
    </section>
  )
}
