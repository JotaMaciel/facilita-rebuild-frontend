import type { FormEvent, KeyboardEvent } from 'react';
import { ArrowRight, HeartHandshake, X } from 'lucide-react';

export type AuthMode = 'login' | 'registro' | 'recuperar' | 'redefinir';

type Props = {
  mode: AuthMode; nome: string; email: string; senha: string; tokenRecuperacao: string;
  papel: 'CLIENTE' | 'PRESTADOR'; authNotice: string; error: string; busy: boolean;
  onNome: (value: string) => void; onEmail: (value: string) => void; onSenha: (value: string) => void;
  onTokenRecuperacao: (value: string) => void; onPapel: (value: 'CLIENTE' | 'PRESTADOR') => void;
  onClose: () => void; onSwitch: (mode: AuthMode) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
};

export function AuthDialog(props: Props) {
  const { mode, nome, email, senha, tokenRecuperacao, papel, authNotice, error, busy, onNome, onEmail, onSenha, onTokenRecuperacao, onPapel, onClose, onSwitch, onSubmit, onKeyDown } = props;
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="modal" onKeyDown={onKeyDown} role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <button className="modal-close" aria-label="Fechar" onClick={onClose}><X/></button>
      <div className="brand"><span className="brand-icon"><HeartHandshake size={19}/></span> facilita<span className="brand-dot">.</span></div>
      <h2 id="auth-title">{mode === 'login' ? 'Que bom ter você aqui!' : mode === 'registro' ? 'Vamos criar sua conta' : mode === 'recuperar' ? 'Recuperar senha' : 'Criar uma nova senha'}</h2>
      <p>{mode === 'login' ? 'Entre para gerenciar suas solicitações.' : mode === 'registro' ? 'Preencha seus dados para começar.' : mode === 'recuperar' ? 'Informe seu e-mail. Se o envio estiver configurado, você receberá instruções para criar uma nova senha.' : 'Informe o token de recuperação obtido em ambiente de testes.'}</p>
      <form onSubmit={onSubmit}>
        {mode === 'registro' && <><label htmlFor="nome">Nome</label><input required id="nome" minLength={2} value={nome} onChange={event => onNome(event.target.value)} autoComplete="name"/><label htmlFor="papel">Quero participar como</label><select id="papel" value={papel} onChange={event => onPapel(event.target.value as 'CLIENTE' | 'PRESTADOR')}><option value="CLIENTE">Cliente</option><option value="PRESTADOR">Prestador de serviços</option></select></>}
        {mode !== 'redefinir' ? <><label htmlFor="email">E-mail</label><input id="email" type="email" required value={email} onChange={event => onEmail(event.target.value)} autoComplete="email"/></> : <><label htmlFor="resetToken">Token de recuperação</label><input id="resetToken" required value={tokenRecuperacao} onChange={event => onTokenRecuperacao(event.target.value)}/></>}
        {mode !== 'recuperar' && <><label htmlFor="senha">Senha</label><input id="senha" type="password" minLength={8} required value={senha} onChange={event => onSenha(event.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'}/></>}
        {authNotice && <p role="status" className="auth-notice">{authNotice}</p>}
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" disabled={busy} className="button button-dark form-submit">{busy ? 'Aguarde...' : mode === 'login' ? 'Entrar' : mode === 'registro' ? 'Criar conta' : mode === 'recuperar' ? 'Solicitar recuperação' : 'Redefinir senha'}<ArrowRight size={17}/></button>
      </form>
      <button className="switch-auth" onClick={() => onSwitch(mode === 'login' ? 'registro' : 'login')}>{mode === 'login' ? 'Ainda não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}</button>
      {mode === 'login' && <button className="switch-auth" onClick={() => onSwitch('recuperar')}>Esqueci minha senha</button>}
      {mode === 'recuperar' && <button className="switch-auth" onClick={() => onSwitch('redefinir')}>Já tenho um token de recuperação</button>}
    </div>
  </div>;
}
