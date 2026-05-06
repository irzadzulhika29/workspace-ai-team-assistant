import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import {
  Folder, FolderOpen, FileText, ChevronRight,
  Plus, Download
} from 'lucide-react'

/**
 * FolderTree — recursive folder + file tree
 * @param {Array}    props.folders  - tree data
 * @param {Function} props.onFileClick
 */
function FolderTree({ folders = DEFAULT_FOLDERS, onFileClick }) {
  return (
    <div className="space-y-0.5">
      {folders.map((folder) => (
        <MemoFolderNode key={folder.id} node={folder} onFileClick={onFileClick} />
      ))}
    </div>
  )
}

const MemoFolderNode = memo(FolderNode)

function FolderNode({ node, onFileClick, depth = 0 }) {
  const [open, setOpen] = useState(node.defaultOpen ?? true)
  const [localChildren, setLocalChildren] = useState([])
  const [naming, setNaming] = useState(false)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    if (node.type === 'folder') {
      setOpen(node.defaultOpen ?? true)
    }
  }, [node.defaultOpen, node.type])

  const children = useMemo(
    () => [...(node.children ?? []), ...localChildren],
    [localChildren, node.children],
  )

  const fileCount = useMemo(
    () => children.filter((child) => child.type === 'file').length,
    [children],
  )

  const addSubfolder = useCallback(() => {
    if (!newName.trim()) return
    setLocalChildren((c) => [
      ...c,
      { id: crypto.randomUUID(), name: newName.trim(), type: 'folder', children: [] },
    ])
    setNewName('')
    setNaming(false)
  }, [newName])

  const handleToggleOpen = useCallback(() => {
    setOpen((isOpen) => !isOpen)
  }, [])

  const handleFileClick = useCallback(() => {
    onFileClick?.(node)
  }, [node, onFileClick])

  const indent = depth * 16

  if (node.type === 'file') {
    return (
      <button
        onClick={handleFileClick}
        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-slate-600 hover:bg-gray-100 hover:text-slate-800 transition-colors text-left"
        style={{ paddingLeft: `${12 + indent}px` }}
      >
        <FileText size={14} className="text-slate-400 flex-shrink-0" />
        <span className="truncate flex-1">{node.name}</span>
        {node.downloadUrl && (
          <a
            href={node.downloadUrl}
            download
            onClick={(e) => e.stopPropagation()}
            className="text-slate-400 hover:text-brand-600 transition-colors"
          >
            <Download size={13} />
          </a>
        )}
      </button>
    )
  }

  return (
    <div>
      <button
        onClick={handleToggleOpen}
        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-slate-700 hover:bg-gray-100 transition-colors"
        style={{ paddingLeft: `${12 + indent}px` }}
      >
        <ChevronRight
          size={14}
          className={`text-slate-400 flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
        />
        {open
          ? <FolderOpen size={15} className="text-amber-500 flex-shrink-0" />
          : <Folder     size={15} className="text-amber-500 flex-shrink-0" />
        }
        <span className="truncate flex-1 text-left">{node.name}</span>
        <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">
          {fileCount} file
        </span>
      </button>

      {open && (
        <div>
          {children.map((child) => (
            <MemoFolderNode key={child.id} node={child} depth={depth + 1} onFileClick={onFileClick} />
          ))}

          {/* New subfolder */}
          {naming ? (
            <div className="flex items-center gap-2 px-3 py-1" style={{ paddingLeft: `${28 + indent}px` }}>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addSubfolder(); if (e.key === 'Escape') setNaming(false) }}
                placeholder="Nama folder…"
                className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <button onClick={addSubfolder} className="text-xs text-brand-600 font-medium hover:underline">OK</button>
            </div>
          ) : (
            <button
              onClick={() => setNaming(true)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-brand-600 transition-colors px-3 py-1"
              style={{ paddingLeft: `${28 + indent}px` }}
            >
              <Plus size={12} /> Subfolder baru
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default memo(FolderTree)

// Default folder structure
const DEFAULT_FOLDERS = [
  {
    id: 'input',
    name: 'Input (SOP)',
    type: 'folder',
    defaultOpen: true,
    children: [],
  },
  {
    id: 'output',
    name: 'Output (AI Reports)',
    type: 'folder',
    defaultOpen: true,
    children: [],
  },
]
