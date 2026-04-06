import Link from 'next/link'

type ErrorPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function ErrorPage({ searchParams }: ErrorPageProps) {
  const params = (await searchParams) ?? {}
  const type = getValue(params.type)
  const message = getValue(params.message)

  const title =
    type === 'signup'
      ? 'Não foi possível concluir o cadastro'
      : type === 'email-confirmation'
        ? 'Não foi possível confirmar seu email'
        : 'Algo deu errado na autenticação'

  const description =
    message ??
    (type === 'email-confirmation'
      ? 'O link de confirmação é inválido, já foi usado ou expirou.'
      : 'Tente novamente em instantes. Se o problema continuar, refaça a operação.')

  return (
    <main className='flex min-h-screen items-center justify-center px-6 py-12'>
      <div className='w-full max-w-xl rounded-2xl border border-red-100 bg-white p-8 shadow-sm'>
        <span className='inline-flex rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700'>
          Falha no acesso
        </span>

        <h1 className='mt-4 text-3xl font-semibold text-gray-900'>{title}</h1>
        <p className='mt-3 text-base leading-7 text-gray-600'>{description}</p>

        <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
          <Link
            href='/login'
            className='rounded-md bg-customPurple px-5 py-3 text-center text-white transition hover:opacity-90'
          >
            Voltar para o login
          </Link>
          <Link
            href='/cadastro'
            className='rounded-md border border-gray-200 px-5 py-3 text-center text-gray-700 transition hover:bg-gray-50'
          >
            Ir para cadastro
          </Link>
        </div>
      </div>
    </main>
  )
}
