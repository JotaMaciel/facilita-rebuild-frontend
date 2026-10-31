export type Usuario = { id: string; nome: string; email: string; papel: 'CLIENTE' | 'PRESTADOR' | 'ADMIN' };
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
  servicos: (token: string) => request<{data:Servico[]}>('/servicos', {}, token),
  criarServico: (token:string, descricao:string, categoria:string) => request<{data:Servico}>('/servicos', {method:'POST',body:JSON.stringify({descricao,categoria})}, token),
  disponiveis: (token:string) => request<{data:Servico[]}>('/servicos/disponiveis', {}, token),
  aceitarServico: (token:string, id:string) => request<{data:Servico}>(`/servicos/${encodeURIComponent(id)}/aceitar`, { method:'PATCH' }, token),
  cancelarServico: (token:string, id:string) => request<{data:Servico}>(`/servicos/${encodeURIComponent(id)}/cancelar`, { method:'PATCH' }, token)
};
