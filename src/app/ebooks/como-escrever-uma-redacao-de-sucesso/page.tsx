import PDFViewer from "@/components/PDFViewer";
import SidebarDashboard from "@/components/SidebarDashboard";
import { createClient } from "../../../../utils/supabase/server";

export default async function EbookPage() {
  const supabase = await createClient();

  const { data } = await supabase.storage
    .from("ebooks")
    .createSignedUrl("ciencias-humanas.pdf", 60 * 5);

  if (!data?.signedUrl) return <p>Erro ao carregar o PDF</p>;

  return (
    <SidebarDashboard>
      <main className="flex flex-col w-4/5 m-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Visualizando: Como escrever uma redação de sucesso</h1>
        <PDFViewer url={data.signedUrl} />
      </main>
    </SidebarDashboard>
  );
}


