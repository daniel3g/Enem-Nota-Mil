import PDFViewer from '@/components/PDFViewer'
import HeaderDashboard from '@/components/HeaderDashboard'
import { createClient } from '../../../../utils/supabase/server'

export default async function EbookPage() {
  const supabase = await createClient()

  const { data } = await supabase.storage
    .from('ebooks')
    .createSignedUrl('as-4-matrizes-de-conhecimento-enem.pdf', 60 * 5) // 5 min

  if (!data?.signedUrl) {
    return <p>Erro ao carregar o PDF</p>
  }

  return (
    <div>
      <HeaderDashboard />
      <main className="flex flex-col w-4/5 m-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Visualizando: As 4 Matrizes de Conhecimento</h1>
        <PDFViewer url={data.signedUrl} />
      </main>
    </div>
  )
}
