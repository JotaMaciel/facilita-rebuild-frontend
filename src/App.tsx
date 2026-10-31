import { useState, useEffect, type FormEvent } from 'react';
import { ArrowRight, ArrowUpRight, CheckCircle2, HeartHandshake, Layers3, LogOut, Menu, Plus, ShieldCheck, Sparkles, X } from 'lucide-react';
import { api, type Servico, type Usuario } from './api';

const categorias = ['Compras', 'Entrega', 'Manutenção', 'Acompanhamento', 'Outros'];
export default function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem('facilita-token') || '');
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [form, setForm] = useState<'login' | 'registro' | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState(categorias[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (!token) { setServicos([]); return; }
    let active = true;
    api.servicos(token).then(r => { if (active) setServicos(r.data); }).catch(e => { if(active) setError(e.message); });
    return () => { active = false; };
  }, [token]);
  function logout() { sessionStorage.removeItem('facilita-token'); setToken(''); setUsuario(null); setError(''); }
  async function submitAuth(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      if (form === 'registro') await api.registro(nome, email, senha);
      const result = await api.login(email, senha);
      sessionStorage.setItem('facilita-token', result.token);
      setUsuario(result.usuario); setToken(result.token); setForm(null); setSenha('');
    } catch(e) { setError(e instanceof Error ? e.message : 'Erro inesperado'); }
    finally { setBusy(false); }
  }
  async function submitServico(e: FormEvent) {
    e.preventDefault(); if(!token) { setForm('login'); return; }
    setBusy(true); setError('');
    try {
      const created = await api.criarServico(token, descricao, categoria);
      setServicos(current => [created.data,...current]);
      setDescricao('');
    } catch(e) { setError(e instanceof Error ? e.message : 'Erro inesperado'); }
    finally { setBusy(false); }
  }
  async function cancelarServico(id: string) {
    if (!token) return;
    setBusy(true); setError('');
    try {
      const result = await api.cancelarServico(token, id);
      setServicos(current => current.map(item => item.id === id ? result.data : item));
    } catch(e) { setError(e instanceof Error ? e.message : 'Erro inesperado'); }
    finally { setBusy(false); }
  }
  return <div className="app">
    <header className="navbar container">
      <a className="brand" href="#inicio"><span className="brand-icon"><HeartHandshake size={23}/></span> facilita<span className="brand-dot">.</span><small>rebuild</small></a>
      <nav className={menu ? 'nav-links expanded' : 'nav-links'} aria-label="Navegação principal">
        <a href="#como-funciona" onClick={()=>setMenu(false)}>Como funciona</a>
        <a href="#servicos" onClick={()=>setMenu(false)}>Serviços</a>
        <a href="#sobre" onClick={()=>setMenu(false)}>Sobre nós</a>
      </nav>
      <div className="nav-actions">{token ? <button className="text-button" onClick={logout}><LogOut size={16}/> Sair</button> : <button className="button button-dark" onClick={()=>{setError('');setForm('login')}}>Entrar <ArrowUpRight size={16}/></button>}</div>
      <button className="mobile-menu" aria-label="Abrir menu" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button>
    </header>
    <main>
      <section className="hero container" id="inicio">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={14}/> Conexões que fazem a diferença</span>
          <h1>Mais tempo para <em>viver.</em><br/>Mais ajuda para <em>contar.</em></h1>
          <p>Encontre apoio para as tarefas do dia a dia. Uma forma mais simples, humana e segura de conectar quem precisa de ajuda a quem pode oferecer.</p>
          <div className="hero-actions"><a href="#servicos" className="button button-dark">Explorar serviços <ArrowRight size={18}/></a><a href="#como-funciona" className="button button-outline">Como funciona</a></div>
          <div className="hero-meta"><span><CheckCircle2 size={17}/> Experiência simples</span><span><ShieldCheck size={17}/> Foco em confiança</span></div>
        </div>
        <div className="hero-visual" aria-label="Ilustração abstrata representando conexões e cuidado">
          <div className="orb orb-one"/><div className="orb orb-two"/>
          <div className="visual-card floating-one"><span className="mini-icon peach"><HeartHandshake size={19}/></span><div><strong>Conectando pessoas</strong><small>Ajuda quando você precisa</small></div></div>
          <div className="visual-center"><div className="heart-shape"><HeartHandshake size={92} strokeWidth={1.25}/></div><span>Facilitar faz bem.</span></div>
          <div className="visual-card floating-two"><span className="mini-icon green"><CheckCircle2 size={20}/></span><div><strong>Mais tranquilidade</strong><small>Um passo de cada vez</small></div></div>
        </div>
      </section>
      <section className="benefits" id="como-funciona"><div className="container">
        <div className="section-heading"><span className="eyebrow">FEITO PARA VOCÊ</span><h2>O cuidado está nos <em>detalhes.</em></h2><p>Três passos para tornar sua rotina mais leve.</p></div>
        <div className="benefit-grid">
          <article className="benefit"><span className="benefit-icon"><Layers3/></span><span className="number">01</span><h3>Escolha o que precisa</h3><p>Descreva sua tarefa e selecione uma categoria de serviço.</p></article>
          <article className="benefit"><span className="benefit-icon"><HeartHandshake/></span><span className="number">02</span><h3>Encontre apoio</h3><p>Comece sua solicitação e acompanhe os próximos passos.</p></article>
          <article className="benefit"><span className="benefit-icon"><ShieldCheck/></span><span className="number">03</span><h3>Ganhe tempo</h3><p>Deixe as tarefas organizadas e foque no que importa.</p></article>
        </div>
      </div></section>
      <section className="services container" id="servicos">
        <div className="section-heading"><span className="eyebrow">ÁREA DE SERVIÇOS</span><h2>Uma ajuda para <em>cada momento.</em></h2><p>Cadastre uma solicitação e acompanhe seus serviços.</p></div>
        <div className="service-layout">
          <form className="service-form" onSubmit={submitServico}>
            <div className="form-head"><span className="form-icon"><Plus/></span><div><h3>Nova solicitação</h3><p>Conte como podemos ajudar</p></div></div>
            <label htmlFor="categoria">Categoria</label><select id="categoria" value={categoria} onChange={e=>setCategoria(e.target.value)}>{categorias.map(c=><option key={c}>{c}</option>)}</select>
            <label htmlFor="descricao">O que você precisa?</label><textarea id="descricao" minLength={5} maxLength={500} required value={descricao} onChange={e=>setDescricao(e.target.value)} placeholder="Ex.: Preciso de ajuda com as compras da semana..." rows={4}/>
            <button disabled={busy} className="button button-dark form-submit" type="submit">{busy?'Enviando...':token?'Criar solicitação':'Entrar para solicitar'} <ArrowRight size={17}/></button>
            <small className="helper">Esta é uma versão de desenvolvimento. Ainda não há contratação ou pagamento real.</small>
          </form>
          <div className="service-list"><h3>{usuario ? `Olá, ${usuario.nome.split(' ')[0]}!` : 'Suas solicitações'} <span>{servicos.length}</span></h3>
            {token ? servicos.length===0 ? <div className="empty"><HeartHandshake size={40}/><h4>Nenhuma solicitação ainda</h4><p>Crie a primeira usando o formulário ao lado.</p></div> :
              <div className="cards">{servicos.map(s=><article className="service-item" key={s.id}><div><span className="category-tag">{s.categoria}</span><h4>{s.descricao}</h4><small>#{s.id.slice(0,8)}</small></div><div className="service-actions"><span className="status">{s.status}</span>{s.status==='PENDENTE'&&<button disabled={busy} className="cancel-button" onClick={()=>cancelarServico(s.id)} aria-label={`Cancelar serviço ${s.descricao}`}>Cancelar</button>}</div></article>)}</div> :
              <div className="empty"><HeartHandshake size={40}/><h4>Seu espaço está aqui</h4><p>Entre na sua conta para visualizar e criar solicitações.</p><button className="button button-outline" onClick={()=>{setError('');setForm('login')}}>Fazer login <ArrowRight size={16}/></button></div>}
          </div>
        </div>
        {error && !form && <p role="alert" className="error">{error}</p>}
      </section>
      <section className="closing" id="sobre"><div className="container closing-inner"><div><span className="eyebrow">FACILITA REBUILD</span><h2>Conexões reais.<br/><em>Impacto positivo.</em></h2><p>Uma nova versão do projeto Facilita, com foco em tecnologia, acessibilidade e evolução contínua.</p></div><a href="#inicio" className="button button-light">Voltar ao início <ArrowUpRight size={18}/></a></div></section>
    </main>
    <footer className="container footer"><a href="#inicio" className="brand">facilita<span className="brand-dot">.</span><small>rebuild</small></a><span>Desenvolvimento Rebuild · João Pedro de França Maciel</span><a href="https://github.com/JotaMaciel/facilita-rebuild-frontend" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14}/></a></footer>
    {form && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setForm(null)}}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="modal-close" aria-label="Fechar" onClick={()=>{setForm(null);setError('')}}><X/></button><div className="brand"><span className="brand-icon"><HeartHandshake size={19}/></span> facilita<span className="brand-dot">.</span></div><h2 id="auth-title">{form==='login'?'Que bom ter você aqui!':'Vamos criar sua conta'}</h2><p>{form==='login'?'Entre para gerenciar suas solicitações.':'Preencha seus dados para começar.'}</p><form onSubmit={submitAuth}>{form==='registro'&&<><label htmlFor="nome">Nome</label><input required id="nome" minLength={2} value={nome} onChange={e=>setNome(e.target.value)} autoComplete="name"/></>}<label htmlFor="email">E-mail</label><input id="email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/><label htmlFor="senha">Senha</label><input id="senha" type="password" minLength={8} required value={senha} onChange={e=>setSenha(e.target.value)} autoComplete={form==='login'?'current-password':'new-password'}/>{error&&<p className="error" role="alert">{error}</p>}<button type="submit" disabled={busy} className="button button-dark form-submit">{busy?'Aguarde...':form==='login'?'Entrar':'Criar conta'}<ArrowRight size={17}/></button></form><button className="switch-auth" onClick={()=>{setForm(form==='login'?'registro':'login');setError('')}}>{form==='login'?'Ainda não tem conta? Cadastre-se':'Já tem conta? Faça login'}</button></div></div>}
  </div>;
}
