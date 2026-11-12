export type Usuario = { id: string; nome: string; email: string; papel: 'CLIENTE' | 'PRESTADOR' | 'ADMIN' };
export type Sessao = { id:string; criadoEm:string; expiraEm:string; atual:boolean };
export type Mensagem = { id:string; servicoId:string; autorId:string; texto:string; criadoEm:string };
export type Notificacao = { id:string; usuarioId:string; titulo:string; texto:string; lida:boolean; criadoEm:string };
export type Servico = { id: string; descricao: string; categoria: string; status: string; criadoEm?: string; avaliacao?: { id: string; nota: number; comentario: string | null } | null };
export type MessagePage = { data: Mensagem[]; hasMoreMessages: boolean; nextCursor: string | null };
const unauthorizedListeners = new Set<(token: string) => void>();
export function onUnauthorized(listener: (token: string) => void) {
  unauthorizedListeners.add(listener);
  return () => { unauthorizedListeners.delete(listener); };
}
export class ApiError extends Error {
  constructor(message: string, public code: string, public status: number) { super(message); }
}
const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/v1/facilita';
export async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(base + path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    });
  } catch {
    throw new Error('Não foi possível conectar à API. Confira se o BackEnd está ligado.');
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string };
    if (response.status === 401 && token) for (const listener of unauthorizedListeners) listener(token);
    const messages: Record<string, string> = {
      UNAUTHORIZED: 'Entre na sua conta para continuar.',
      SESSION_EXPIRED: 'Entre na sua conta para continuar.',
      INVALID_CREDENTIALS: 'E-mail ou senha incorretos.',
      EMAIL_IN_USE: 'Este e-mail já está cadastrado.',
      VALIDATION_ERROR: 'Confira os dados informados.',
      FORBIDDEN: 'Você não tem permissão para realizar esta ação.',
      NOT_FOUND: 'O conteúdo solicitado não foi encontrado ou não está disponível para sua conta.',
      ALREADY_REVIEWED: 'Este serviço já foi avaliado.',
      INVALID_RESET_TOKEN: 'Este link de recuperação expirou ou já foi utilizado. Solicite outro.',
      INVALID_CURSOR: 'Não foi possível carregar este trecho da conversa. Abra a conversa novamente.',
      CANNOT_ACCEPT: 'Este serviço não está mais disponível para aceite.',
      CANNOT_CANCEL: 'Este serviço não pode mais ser cancelado.',
      INVALID_TRANSITION: 'O estado do serviço mudou. Atualize a página.',
      CONFLICT: 'Esta operação não pode ser repetida ou o estado do serviço mudou.',
      RATE_LIMITED: 'Muitas tentativas. Aguarde um pouco antes de tentar novamente.',
    };
    if (response.status === 429) throw new Error('Muitas tentativas. Aguarde um pouco antes de tentar novamente.');
    if (response.status >= 500) throw new Error('O servidor está temporariamente indisponível. Tente novamente mais tarde.');
    throw new ApiError(messages[body.error || ''] || 'Não foi possível concluir a solicitação.', body.error || 'UNKNOWN_ERROR', response.status);
  }
  return response.json() as Promise<T>;
}
export const api = {
  registro: (nome: string, email: string, senha: string, papel: 'CLIENTE' | 'PRESTADOR') => request<{data:Usuario}>('/auth/registro', { method:'POST', body:JSON.stringify({nome,email,senha,papel}) }),
  login: (email: string, senha: string) => request<{token:string; usuario:Usuario}>('/auth/login', { method:'POST', body:JSON.stringify({email,senha}) }),
  recuperarSenha: (email:string) => request<{message:string}>('/auth/recuperar-senha', {method:'POST',body:JSON.stringify({email})}),
  redefinirSenha: (token:string, senha:string) => request<{success:boolean}>('/auth/redefinir-senha', {method:'POST',body:JSON.stringify({token,senha})}),
  sessoes: (token:string) => request<{data:Sessao[]}>('/auth/sessoes',{},token),
  revogarSessao: (token:string,id:string) => request<{success:boolean;current:boolean}>(`/auth/sessoes/${encodeURIComponent(id)}`,{method:'DELETE'},token),
  sairDeTodas: (token:string) => request<{success:boolean}>('/auth/sair-de-todas',{method:'POST'},token),
  logout: (token:string) => request<{success:boolean}>('/auth/logout', {method:'POST'}, token),
  me: (token:string) => request<{data:Usuario}>('/auth/me', {}, token),
  servicos: (token: string, page = 1) => request<{data:Servico[];page:number;pageSize:number;hasNextPage:boolean}>(`/servicos?page=${page}`, {}, token),
  criarServico: (token:string, descricao:string, categoria:string) => request<{data:Servico}>('/servicos', {method:'POST',body:JSON.stringify({descricao,categoria})}, token),
  atribuidos: (token:string) => request<{data:Servico[]}>('/servicos/atribuidos', {}, token),
  disponiveis: (token:string) => request<{data:Servico[]}>('/servicos/disponiveis', {}, token),
  aceitarServico: (token:string, id:string) => request<{data:Servico}>(`/servicos/${encodeURIComponent(id)}/aceitar`, { method:'PATCH' }, token),
  mensagens: (token:string,id:string,before?:string) => request<MessagePage>(`/servicos/${encodeURIComponent(id)}/mensagens${before ? '?before=' + encodeURIComponent(before) : ''}`, {}, token),
  enviarMensagem: (token:string,id:string,texto:string) => request<{data:Mensagem}>(`/servicos/${encodeURIComponent(id)}/mensagens`, {method:'POST',body:JSON.stringify({texto})}, token),
  notificacoes: (token:string) => request<{data:Notificacao[]}>('/notificacoes', {}, token),
  marcarLida: (token:string,id:string) => request<{success:boolean}>(`/notificacoes/${encodeURIComponent(id)}/lida`, {method:'PATCH'}, token),
  iniciarServico: (token:string, id:string) => request<{data:Servico}>(`/servicos/${encodeURIComponent(id)}/iniciar`, { method:'PATCH' }, token),
  concluirServico: (token:string, id:string) => request<{data:Servico}>(`/servicos/${encodeURIComponent(id)}/concluir`, { method:'PATCH' }, token),
  avaliarServico: (token:string, id:string, nota:number, comentario:string) => request<{data:NonNullable<Servico['avaliacao']>}>(`/servicos/${encodeURIComponent(id)}/avaliacao`, { method:'POST', body:JSON.stringify({nota,comentario}) }, token),
  cancelarServico: (token:string, id:string) => request<{data:Servico}>(`/servicos/${encodeURIComponent(id)}/cancelar`, { method:'PATCH' }, token)
};
