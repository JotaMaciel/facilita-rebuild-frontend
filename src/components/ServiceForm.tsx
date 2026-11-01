import type { FormEvent } from 'react';
import { ArrowRight, Plus } from 'lucide-react';

type ServiceFormProps = {
  isProvider: boolean;
  loggedIn: boolean;
  categoria: string;
  categorias: string[];
  descricao: string;
  busy: boolean;
  onCategoriaChange: (value: string) => void;
  onDescricaoChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ServiceForm({ isProvider, loggedIn, categoria, categorias, descricao, busy, onCategoriaChange, onDescricaoChange, onSubmit }: ServiceFormProps) {
  if (isProvider) return <div className="service-form"><h3>Área de atendimento</h3><p>Como prestador, consulte as oportunidades disponíveis e seus serviços atribuídos abaixo.</p></div>;
  return <form className="service-form" onSubmit={onSubmit}>
    <div className="form-head"><span className="form-icon"><Plus/></span><div><h3>Nova solicitação</h3><p>Conte como podemos ajudar</p></div></div>
    <label htmlFor="categoria">Categoria</label>
    <select id="categoria" value={categoria} onChange={event => onCategoriaChange(event.target.value)}>{categorias.map(item => <option key={item}>{item}</option>)}</select>
    <label htmlFor="descricao">O que você precisa?</label>
    <textarea id="descricao" minLength={5} maxLength={500} required value={descricao} onChange={event => onDescricaoChange(event.target.value)} placeholder="Ex.: Preciso de ajuda com as compras da semana..." rows={4}/>
    <button disabled={busy} className="button button-dark form-submit" type="submit">{busy ? 'Enviando...' : loggedIn ? 'Criar solicitação' : 'Entrar para solicitar'} <ArrowRight size={17}/></button>
    <small className="helper">Esta é uma versão de desenvolvimento. Ainda não há contratação ou pagamento real.</small>
  </form>;
}
