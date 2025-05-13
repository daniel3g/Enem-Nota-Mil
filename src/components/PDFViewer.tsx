'use client'

export default function PDFViewer({ url }: { url: string }) {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe
        src={url}
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        title="Visualização de PDF"
      />
    </div>
  )
}
