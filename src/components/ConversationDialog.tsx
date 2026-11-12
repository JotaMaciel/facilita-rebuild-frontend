import { useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import type { Mensagem } from '../api';

type ConversationDialogProps = {
  readOnly: boolean;
  hasOlderMessages: boolean;
  loadingOlderMessages: boolean;
  onLoadOlder: () => void;
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
  const { readOnly, hasOlderMessages, loadingOlderMessages, onLoadOlder, mensagens, usuarioId, texto, busy, error, onClose, onRefresh, onSubmit, onTextChange, onKeyDown } = props;
  const refreshButton = useRef<HTMLButtonElement>(null);
  const wasLoadingHistory = useRef(false);
  useEffect(() => {
    // O botão de paginação pode desaparecer ao terminar: mantenha o foco no diálogo.
    if (wasLoadingHistory.current && !loadingOlderMessages) refreshButton.current?.focus();
    wasLoadingHistory.current = loadingOlderMessages;
  }, [loadingOlderMessages]);
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="modal" onKeyDown={onKeyDown} role="dialog" aria-modal="true" aria-label="Mensagens do serviço">
      <button className="modal-close" aria-label="Fechar" onClick={onClose}><X/></button>
      <h2>Mensagens do serviço</h2>
      <button ref={refreshButton} type="button" className="cancel-button" onClick={onRefresh}>Atualizar mensagens</button>
      {hasOlderMessages && <button type="button" className="cancel-button" disabled={loadingOlderMessages} onClick={onLoadOlder}>{loadingOlderMessages ? 'Carregando histórico...' : 'Carregar mensagens anteriores'}</button>}
      <div className="message-list">
        {mensagens.length ? mensagens.map(mensagem => <p key={mensagem.id} className={mensagem.autorId === usuarioId ? 'own-message' : 'message'}>{mensagem.texto}</p>) : <p>Sem mensagens ainda.</p>}
      </div>
      {readOnly ? <p role="status">Atendimento concluído. Esta conversa está disponível somente para leitura.</p> : <form onSubmit={onSubmit}>
        <label htmlFor="novaMensagem">Mensagem</label>
        <textarea id="novaMensagem" value={texto} onChange={event => onTextChange(event.target.value)} maxLength={2000} required/>
        <button disabled={busy} type="submit" className="button button-dark">Enviar</button>
      </form>}
      {error && <p role="alert" className="error">{error}</p>}
    </div>
  </div>;
}
