import Link from "next/link"
import Image from "next/image"
import accountMail from '../../../public/images/account-mail.png'

export default function emailConfirm() {
    return (        
            <div className="flex w-1/2 items-center justify-between border-2 rounded-lg m-auto mt-20 p-10">
                <div className="w-1/2">
                    <h1 className="text-2xl">Obrigado pelo seu registro!</h1>
                    <p className="mt-5 text-base">Enviamos um email com um link para confirmação de sua conta</p>
                    <p className="text-base">Por favor, verifique seu email e clique no link para começar a usar nossa plataforma.</p>
                    <Link href="/login">
                        <button className="flex bg-customPurple mt-5 py-3 px-12 rounded-md text-white text-lg">
                            Voltar para o login
                        </button>
                    </Link>
                </div>
                <div>
                    <Image
                    src={accountMail}
                    alt="Confirmação de email"
                    width={360}
                    />
                </div>                
            </div>
    )
} 