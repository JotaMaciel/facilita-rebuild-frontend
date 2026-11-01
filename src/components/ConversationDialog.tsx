import type { FormEvent, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import type { Mensagem } from '../api';

type ConversationDialogProps = {
  mensagens: Mensagem[];
  usuarioId?: string;
  texto: string;
  busy: boolean;
  error: string;
  onClose: () => void;
  onRefresh: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTextChange: (text: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
};

export function ConversationDialog(props: ConversationDialogProps) {
  const { mensagens, usuarioId, texto, busy, error, onClose, onRefresh, onSubmit, onTextChange, onKeyDown } = props;
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="modal" onKeyDown={onKeyDown} role="dialog" aria-modal="true" aria-label="Mensagens do serviço">
      <button className="modal-close" aria-label="Fechar" onClick={onClose}><X/></button>
      <h2>Mensagens do serviço</h2>
      <button type="button" className="cancel-button" onClick={onRefresh}>Atualizar mensagens</button>
      <div className="message-list">
        {mensagens.length ? mensagens.map(mensagem => <p key={mensagem.id} className={mensagem.autorId === usuarioId ? 'own-message' : 'message'}>{mensagem.texto}</p>) : <p>Sem mensagens ainda.</p>}
      </div>
      <form onSubmit={onSubmit}>
        <label htmlFor="novaMensagem">Mensagem</label>
        <textarea id="novaMensagem" value={texto} onChange={event => onTextChange(event.target.value)} maxLength={2000} required/>
        <button disabled={busy} type="submit" className="button button-dark">Enviar</button>
      </form>
      {error && <p role="alert" className="error">{error}</p>}
    </div>
  </div>;
}
