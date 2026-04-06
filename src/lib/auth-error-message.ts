export function getAuthErrorMessage(message?: string | null) {
  if (!message) {
    return 'Não foi possível concluir a operação agora. Tente novamente em instantes.'
  }

  const normalized = message.toLowerCase()

  if (
    normalized.includes('invalid login credentials') ||
    normalized.includes('invalid_credentials')
  ) {
    return 'Email ou senha incorretos. Confira seus dados e tente novamente.'
  }

  if (normalized.includes('email not confirmed')) {
    return 'Seu email ainda não foi confirmado. Verifique sua caixa de entrada e o spam.'
  }

  if (
    normalized.includes('user already registered') ||
    normalized.includes('already registered')
  ) {
    return 'Já existe uma conta com esse email. Tente entrar ou recuperar sua senha.'
  }

  if (
    normalized.includes('password should be at least') ||
    normalized.includes('weak password')
  ) {
    return 'Sua senha não atende aos requisitos mínimos de segurança.'
  }

  if (
    normalized.includes('signup is disabled') ||
    normalized.includes('signups not allowed')
  ) {
    return 'O cadastro está indisponível no momento. Tente novamente mais tarde.'
  }

  if (
    normalized.includes('network') ||
    normalized.includes('fetch failed') ||
    normalized.includes('failed to fetch')
  ) {
    return 'Houve uma falha de conexão. Verifique sua internet e tente novamente.'
  }

  if (
    normalized.includes('otp') ||
    normalized.includes('token') ||
    normalized.includes('expired')
  ) {
    return 'Esse link de autenticação é inválido ou expirou. Solicite um novo e tente novamente.'
  }

  return message
}
