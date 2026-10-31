export type Usuario = { id: string; nome: string; email: string; papel: 'CLIENTE' | 'PRESTADOR' | 'ADMIN' };
export type Sessao = { id:string; criadoEm:string; expiraEm:string; atual:boolean };
export type Mensagem = { id:string; servicoId:string; autorId:string; texto:string; criadoEm:string };
export type Notificacao = { id:string; usuarioId:string; titulo:string; texto:string; lida:boolean; criadoEm:string };
export type Servico = { id: string; descricao: string; categoria: string; status: string; criadoEm?: string };
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
    const messages: Record<string, string> = {
      UNAUTHORIZED: 'Entre na sua conta para continuar.',
      INVALID_CREDENTIALS: 'E-mail ou senha incorretos.',
      EMAIL_IN_USE: 'Este e-mail já está cadastrado.',
      VALIDATION_ERROR: 'Confira os dados informados.',
    };
    throw new Error(messages[body.error || ''] || 'Não foi possível concluir a solicitação.');
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
  servicos: (token: string) => request<{data:Servico[]}>('/servicos', {}, token),
  criarServico: (token:string, descricao:string, categoria:string) => request<{data:Servico}>('/servicos', {method:'POST',body:JSON.stringify({descricao,categoria})}, token),
  atribuidos: (token:string) => request<{data:Servico[]}>('/servicos/atribuidos', {}, token),
  disponiveis: (token:string) => request<{data:Servico[]}>('/servicos/disponiveis', {}, token),
  aceitarServico: (token:string, id:string) => request<{data:Servico}>(`/servicos/${encodeURIComponent(id)}/aceitar`, { method:'PATCH' }, token),
  mensagens: (token:string,id:string) => request<{data:Mensagem[]}>(`/servicos/${encodeURIComponent(id)}/mensagens`, {}, token),
  enviarMensagem: (token:string,id:string,texto:string) => request<{data:Mensagem}>(`/servicos/${encodeURIComponent(id)}/mensagens`, {method:'POST',body:JSON.stringify({texto})}, token),
  notificacoes: (token:string) => request<{data:Notificacao[]}>('/notificacoes', {}, token),
  marcarLida: (token:string,id:string) => request<{success:boolean}>(`/notificacoes/${encodeURIComponent(id)}/lida`, {method:'PATCH'}, token),
  iniciarServico: (token:string, id:string) => request<{data:Servico}>(`/servicos/${encodeURIComponent(id)}/iniciar`, { method:'PATCH' }, token),
  concluirServico: (token:string, id:string) => request<{data:Servico}>(`/servicos/${encodeURIComponent(id)}/concluir`, { method:'PATCH' }, token),
  avaliarServico: (token:string, id:string, nota:number, comentario:string) => request<{data:unknown}>(`/servicos/${encodeURIComponent(id)}/avaliacao`, { method:'POST', body:JSON.stringify({nota,comentario}) }, token),
  cancelarServico: (token:string, id:string) => request<{data:Servico}>(`/servicos/${encodeURIComponent(id)}/cancelar`, { method:'PATCH' }, token)
};
