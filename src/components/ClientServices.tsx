import { ArrowRight, HeartHandshake } from 'lucide-react';
import type { Servico, Usuario } from '../api';

type ClientServicesProps = {
  usuario: Usuario | null;
  loggedIn: boolean;
  servicos: Servico[];
  avaliacoesEnviadas: string[];
  nota: number;
  comentario: string;
  busy: boolean;
  maisServicos: boolean;
  carregandoMais: boolean;
  onNotaChange: (value: number) => void;
  onComentarioChange: (value: string) => void;
  onOpenConversation: (id: string) => void;
  onReview: (id: string) => void;
  onCancel: (id: string) => void;
  onLoadMore: () => void;
  onLogin: () => void;
};

export function ClientServices(props: ClientServicesProps) {
  const { usuario, loggedIn, servicos, avaliacoesEnviadas, nota, comentario, busy, maisServicos, carregandoMais, onNotaChange, onComentarioChange, onOpenConversation, onReview, onCancel, onLoadMore, onLogin } = props;
  return <div className="service-list">
    <h3>{usuario ? `Olá, ${usuario.nome.split(' ')[0]}!` : 'Suas solicitações'} <span>{servicos.length}</span></h3>
    {loggedIn ? servicos.length === 0 ?
      <div className="empty"><HeartHandshake size={40}/><h4>Nenhuma solicitação ainda</h4><p>Crie a primeira usando o formulário ao lado.</p></div> :
      <div className="cards">
        {servicos.map(servico => <article className="service-item" key={servico.id}>
          <div><span className="category-tag">{servico.categoria}</span><h4>{servico.descricao}</h4><small>#{servico.id.slice(0,8)}</small></div>
          <div className="service-actions">
            <span className="status">{servico.status}</span>
            {servico.status !== 'PENDENTE' && servico.status !== 'CANCELADO' && <button className="cancel-button" onClick={() => onOpenConversation(servico.id)}>Mensagens</button>}
            {servico.status === 'CONCLUIDO' && !avaliacoesEnviadas.includes(servico.id) && <div className="review-inline">
              <label htmlFor={`nota-${servico.id}`}>Nota</label>
              <select id={`nota-${servico.id}`} value={nota} onChange={event => onNotaChange(Number(event.target.value))}>{[1,2,3,4,5].map(value => <option key={value} value={value}>{value} estrela{value === 1 ? '' : 's'}</option>)}</select>
              <input aria-label="Comentário opcional" placeholder="Comentário opcional" value={comentario} onChange={event => onComentarioChange(event.target.value)}/>
              <button disabled={busy} onClick={() => onReview(servico.id)} className="cancel-button">Enviar avaliação</button>
            </div>}
            {servico.status === 'PENDENTE' && <button disabled={busy} className="cancel-button" onClick={() => onCancel(servico.id)} aria-label={`Cancelar serviço ${servico.descricao}`}>Cancelar</button>}
          </div>
        </article>)}
        {maisServicos && <button type="button" className="button button-outline" disabled={carregandoMais} onClick={onLoadMore}>{carregandoMais ? 'Carregando...' : 'Carregar mais serviços'}</button>}
      </div> :
      <div className="empty"><HeartHandshake size={40}/><h4>Seu espaço está aqui</h4><p>Entre na sua conta para visualizar e criar solicitações.</p><button className="button button-outline" onClick={onLogin}>Fazer login <ArrowRight size={16}/></button></div>}
  </div>;
}
