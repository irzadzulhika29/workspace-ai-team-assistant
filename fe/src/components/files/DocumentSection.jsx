import DocumentCard from '@/components/files/DocumentCard'

export default function DocumentSection({
  title,
  documents,
  selectedDocument,
  onSelectDocument,
  variant = 'grid',
  showBadge = false,
  wrapperClassName = '',
}) {
  const layoutClassName =
    variant === 'single-row'
      ? 'flex flex-nowrap items-stretch gap-4 overflow-x-hidden'
      : 'grid grid-cols-2 gap-4 md:grid-cols-4'

  return (
    <div className={wrapperClassName}>
      {title ? (
        <h3 className="mb-4 text-4xl font-semibold text-neutral-700">{title}</h3>
      ) : null}
      <div className={layoutClassName}>
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            doc={doc}
            isSelected={selectedDocument?.id === doc.id}
            onSelect={onSelectDocument}
            showBadge={showBadge}
            variant={variant}
          />
        ))}
      </div>
    </div>
  )
}
