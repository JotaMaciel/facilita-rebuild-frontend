import type { Notificacao } from '../api';

interface Props {
  notificacoes: Notificacao[];
  onMarkRead: (id: string) => void;
}

export function NotificationsPanel({ notificacoes, onMarkRead }: Props) {
  return <section className="container notifications"><div className="section-heading"><span className="eyebrow">CENTRAL</span><h2>Notificações</h2></div>{notificacoes.length === 0 ? <p>Nenhuma notificação por enquanto.</p> : notificacoes.map(n => <article className="notification" key={n.id}><div><strong>{n.titulo}</strong><p>{n.texto}</p></div>{!n.lida && <button className="cancel-button" onClick={() => onMarkRead(n.id)}>Marcar como lida</button>}</article>)}</section>;
}
