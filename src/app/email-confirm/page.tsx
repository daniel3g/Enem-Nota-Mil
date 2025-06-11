import Link from "next/link"
import Image from "next/image"
import accountMail from '../../../public/images/account-mail.png'

export default function EmailConfirm() {
  return (
    <div className="flex flex-col sm:flex-row w-[90%] sm:w-1/2 items-center justify-between border-2 rounded-lg m-auto mt-20 p-6 sm:p-10 gap-6 sm:gap-0">
      {/* Texto */}
      <div className="w-full sm:w-1/2 text-center sm:text-left">
        <h1 className="text-2xl font-semibold">Obrigado pelo seu registro!</h1>
        <p className="mt-5 text-base">
          Enviamos um email com um link para confirmação de sua conta.
        </p>
        <p className="text-base">
          Por favor, verifique seu email e clique no link para começar a usar nossa plataforma.
        </p>
        <Link href="/login">
          <button className="bg-customPurple mt-5 py-3 px-8 sm:px-12 rounded-md text-white text-lg">
            Voltar para o login
          </button>
        </Link>
      </div>

      {/* Imagem */}
      <div className="w-full sm:w-auto flex justify-center">
        <Image
          src={accountMail}
          alt="Confirmação de email"
          width={260}
          className="sm:w-[360px] w-[80%] h-auto"
        />
      </div>
    </div>
  )
}
