import type { Sessao } from '../api';

type AccountSessionsProps = {
  sessoes: Sessao[];
  loading: boolean;
  busy: boolean;
  onLoad: () => void;
  onLogoutAll: () => void;
  onRevoke: (id: string, current: boolean) => void;
};

export function AccountSessions({ sessoes, loading, busy, onLoad, onLogoutAll, onRevoke }: AccountSessionsProps) {
  return <section className="container account-security">
    <div className="section-heading"><span className="eyebrow">SEGURANÇA</span><h2>Minha conta <em>e sessões.</em></h2></div>
    <p>Você pode verificar suas sessões ativas e encerrar o acesso em todos os dispositivos.</p>
    <div className="session-actions">
      <button type="button" className="button button-dark" disabled={loading} onClick={onLoad}>{loading ? 'Carregando...' : 'Ver sessões ativas'}</button>
      <button type="button" className="cancel-button" disabled={busy} onClick={onLogoutAll}>Sair de todos os dispositivos</button>
    </div>
    <div className="session-list">{sessoes.map(sessao => <article className="session-item" key={sessao.id}>
      <div><strong>{sessao.atual ? 'Esta sessão' : 'Outra sessão'}</strong><p>Criada em {new Date(sessao.criadoEm).toLocaleString('pt-BR')} · Expira em {new Date(sessao.expiraEm).toLocaleString('pt-BR')}</p></div>
      <button type="button" className="cancel-button" disabled={busy} onClick={() => onRevoke(sessao.id, sessao.atual)}>Encerrar</button>
    </article>)}</div>
  </section>;
}
