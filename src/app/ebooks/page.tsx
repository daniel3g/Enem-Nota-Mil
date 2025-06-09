import HeaderDashboard from '@/components/HeaderDashboard'
import Image from 'next/image'
import Link from 'next/link'
import capa4matrizes from '../../../public/images/capa-4-matrizes.webp'
import capaRedacaoSucesso from '../../../public/images/capa-escrever-redacao.webp'
import capaCienciasHumanas from '../../../public/images/capa-ciencias-humanas.webp'
import capaLinguaPortuguesa from '../../../public/images/capa-lingua-portuguesa.webp'
import capaFilosofia from '../../../public/images/capa-filosofia.webp'

export default function Ebooks() {
    return (
        <div>
            <HeaderDashboard />
            <div className='flex flex-col w-4/5 m-auto py-10'>
                <div className='flex justify-center gap-5'>
                    <Link href="ebooks/as-4-matrizes-de-conhecimento-enem">
                        <Image 
                            src={capa4matrizes}
                            alt='As 4 Matrizes do Enem'
                            width={200}
                        />
                    </Link>

                    <Link href="ebooks/como-escrever-uma-redacao-de-sucesso">
                        <Image 
                            src={capaRedacaoSucesso}
                            alt='Redação de Sucesso'
                            width={200}
                        />
                    </Link>

                    <Link href="ebooks/ciencias-humanas">
                        <Image 
                            src={capaCienciasHumanas}
                            alt='Ciências Humanas'
                            width={200}
                        />
                    </Link>

                    <Link href="ebooks/lingua-portuguesa">
                        <Image 
                            src={capaLinguaPortuguesa}
                            alt='Línguas Portuguesa'
                            width={200}
                        />
                    </Link>

                    <Link href="ebooks/filosofia">
                        <Image 
                            src={capaFilosofia}
                            alt='Filosofia'
                            width={200}
                        />
                    </Link>
                </div>
            </div>
        </div>
    )
}