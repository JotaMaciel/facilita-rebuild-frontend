import { useState, useEffect, useRef, type KeyboardEvent, type FormEvent } from 'react';
import { ArrowRight, ArrowUpRight, CheckCircle2, HeartHandshake, Layers3, LogOut, Menu, Plus, ShieldCheck, Sparkles, X } from 'lucide-react';
import { api, type Servico, type Usuario, type Mensagem, type Notificacao, type Sessao } from './api';

const categorias = ['Compras', 'Entrega', 'Manutenção', 'Acompanhamento', 'Outros'];
function combinarMensagens(recebidas: Mensagem[], atuais: Mensagem[]): Mensagem[] {
  const porId = new Map(recebidas.map(mensagem => [mensagem.id, mensagem]));
  for (const mensagem of atuais) if (!porId.has(mensagem.id)) porId.set(mensagem.id, mensagem);
  return [...porId.values()].sort((a, b) => {
    const dateA = Date.parse(a.criadoEm);
    const dateB = Date.parse(b.criadoEm);
    const difference = (Number.isNaN(dateA) ? 0 : dateA) - (Number.isNaN(dateB) ? 0 : dateB);
    return difference || a.id.localeCompare(b.id);
  });
}

export default function App() {
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const accountVersion = useRef(0);
  const paginationInFlight = useRef(false);
  const conversationRequest = useRef(0);
  const [token, setToken] = useState(() => sessionStorage.getItem('facilita-token') || '');
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [sessionRetry, setSessionRetry] = useState(0);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [paginaServicos, setPaginaServicos] = useState(1);
  const [maisServicos, setMaisServicos] = useState(false);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [form, setForm] = useState<'login' | 'registro' | 'recuperar' | 'redefinir' | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tokenRecuperacao, setTokenRecuperacao] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [papel, setPapel] = useState<'CLIENTE'|'PRESTADOR'>('CLIENTE');
  const [disponiveis, setDisponiveis] = useState<Servico[]>([]);
  const [atribuidos, setAtribuidos] = useState<Servico[]>([]);
  const [conversaId, setConversaId] = useState<string | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [textoMensagem, setTextoMensagem] = useState('');
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');
  const [avaliacoesEnviadas, setAvaliacoesEnviadas] = useState<string[]>([]);
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState(categorias[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [menu, setMenu] = useState(false);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [loadingSessoes, setLoadingSessoes] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reset = params.get('reset_token');
    if (reset) {
      setTokenRecuperacao(reset);
      setForm('redefinir');
      window.history.replaceState({}, '', window.location.pathname + window.location.hash);
    }
  }, []);


  useEffect(() => {
    if (!token) return;
    let active = true;
    const version = accountVersion.current;
    async function loadAccount() {
      setError('');
      try {
        const identity = await api.me(token);
        if (!active || version !== accountVersion.current) return;
        setUsuario(identity.data);
        const [services, assigned, available, notifications] = await Promise.allSettled([
          identity.data.papel === 'CLIENTE' ? api.servicos(token) : Promise.resolve({ data: [] as Servico[] }),
          identity.data.papel === 'PRESTADOR' ? api.atribuidos(token) : Promise.resolve({ data: [] as Servico[] }),
          identity.data.papel === 'PRESTADOR' ? api.disponiveis(token) : Promise.resolve({ data: [] as Servico[] }),
          api.notificacoes(token)
        ]);
        if (!active || version !== accountVersion.current) return;
        if (services.status === 'fulfilled') { setServicos(services.value.data); setPaginaServicos(1); setMaisServicos(Boolean('hasNextPage' in services.value && services.value.hasNextPage)); }
        else setError(services.reason instanceof Error ? services.reason.message : 'Erro ao carregar serviços');
        if (assigned.status === 'fulfilled') setAtribuidos(assigned.value.data);
        if (available.status === 'fulfilled') setDisponiveis(available.value.data);
        if (notifications.status === 'fulfilled') setNotificacoes(notifications.value.data);
      } catch (failure) {
        if (!active || version !== accountVersion.current) return;
        const message = failure instanceof Error ? failure.message : 'Não foi possível validar sua sessão.';
        if (message === 'Entre na sua conta para continuar.') {
          sessionStorage.removeItem('facilita-token');
          setToken('');
          clearAccountState();
          setError('Sua sessão expirou. Entre novamente.');
        } else {
          clearAccountState();
          setError(message);
        }
      }
    }
    void loadAccount();
    return () => { active = false; };
  }, [token, sessionRetry]);
  useEffect(() => {
    if (!token || !usuario || !conversaId) return;
    let active = true;
    const version = accountVersion.current;
    const conversation = conversationRequest.current;
    let polling = false;
    const timer = setInterval(() => {
      if (polling) return;
      polling = true;
      api.mensagens(token, conversaId).then(r => {
        if (active && version === accountVersion.current && conversation === conversationRequest.current) {
          setMensagens(current => {
            return combinarMensagens(r.data, current);
          });
        }
      }).catch(() => {}).finally(() => { polling = false; });
    }, 10000);
    return () => { active = false; clearInterval(timer); };
  }, [token, usuario, conversaId]);

  useEffect(() => {
    if (!token || !usuario) return;
    let active = true;
    const version = accountVersion.current;
    let polling = false;
    const timer = setInterval(() => {
      if (polling) return;
      polling = true;
      api.notificacoes(token).then(r => {
        if (active && version === accountVersion.current) {
          setNotificacoes(current => {
            const byId = new Map(r.data.map(item => [item.id, item]));
            for (const item of current) {
              const fresh = byId.get(item.id);
              if (fresh && item.lida) byId.set(item.id, { ...fresh, lida: true });
            }
            return [...byId.values()];
          });
        }
      }).catch(() => {}).finally(() => { polling = false; });
    }, 30000);
    return () => { active = false; clearInterval(timer); };
  }, [token, usuario]);

  useEffect(() => {
    if (!form && !conversaId) return;
    lastFocusedElement.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    const first = dialog?.querySelector<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])');
    first?.focus();
    return () => {
      const previous = lastFocusedElement.current;
      if (previous?.isConnected) queueMicrotask(() => previous.focus());
    };
  }, [form, conversaId]);

  function fecharConversa() {
    conversationRequest.current++;
    setConversaId(null);
    setMensagens([]);
    setTextoMensagem('');
  }
  function onModalKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.preventDefault();
      setForm(null);
      fecharConversa();
      setError('');
      return;
    }
    if (e.key !== 'Tab') return;
    const modal = e.currentTarget;
    const controls = Array.from(modal.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')).filter(el => el.getClientRects().length > 0);
    if (!controls.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function clearAccountState() {
    accountVersion.current++;
    conversationRequest.current++;
    paginationInFlight.current = false;
    setUsuario(null);
    setServicos([]);
    setPaginaServicos(1);
    setMaisServicos(false);
    setCarregandoMais(false);
    setDisponiveis([]);
    setAtribuidos([]);
    setNotificacoes([]);
    setSessoes([]);
    setMensagens([]);
    setConversaId(null);
    setAvaliacoesEnviadas([]);
    setTextoMensagem('');
  }
  function logout() { if (token) void api.logout(token).catch(() => {}); sessionStorage.removeItem('facilita-token'); setToken(''); clearAccountState(); setError(''); }
  async function carregarSessoes() {
    if (!token) return;
    setLoadingSessoes(true);setError('');
    try { setSessoes((await api.sessoes(token)).data); }
    catch(e) { setError(e instanceof Error?e.message:'Erro ao consultar sessões'); }
    finally { setLoadingSessoes(false); }
  }
  async function revogarSessao(id:string, atual:boolean) {
    if (!token || !window.confirm(atual?'Encerrar esta sessão?':'Encerrar esta outra sessão?')) return;
    setBusy(true);setError('');
    try {
      await api.revogarSessao(token,id);
      setSessoes(current=>current.filter(s=>s.id!==id));
      if(atual) { sessionStorage.removeItem('facilita-token');setToken('');clearAccountState(); }
    } catch(e) { setError(e instanceof Error?e.message:'Erro ao encerrar sessão'); }
    finally { setBusy(false); }
  }
  async function encerrarTodas() {
    if (!token || !window.confirm('Encerrar todas as sessões, incluindo esta?')) return;
    setBusy(true);setError('');
    try { await api.sairDeTodas(token);sessionStorage.removeItem('facilita-token');setToken('');clearAccountState(); }
    catch(e) { setError(e instanceof Error?e.message:'Erro ao encerrar sessões'); }
    finally { setBusy(false); }
  }
  async function submitAuth(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setAuthNotice('');
    if (form==='recuperar' || form==='redefinir') {
      try {
        if (form==='recuperar') { const r=await api.recuperarSenha(email); setAuthNotice(r.message); }
        else { await api.redefinirSenha(tokenRecuperacao,senha); setAuthNotice('Senha atualizada. Entre com a nova senha.'); setForm('login');setSenha(''); }
      } catch(e) { setError(e instanceof Error?e.message:'Erro inesperado'); }
      finally { setBusy(false); }
      return;
    }
    try {
      if (form === 'registro') await api.registro(nome, email, senha, papel);
      const result = await api.login(email, senha);
      clearAccountState();
      sessionStorage.setItem('facilita-token', result.token);
      setUsuario(result.usuario); setToken(result.token); setForm(null); setSenha('');
    } catch(e) { setError(e instanceof Error ? e.message : 'Erro inesperado'); }
    finally { setBusy(false); }
  }
  async function carregarMaisServicos() {
    if (!token || !maisServicos || paginationInFlight.current) return;
    paginationInFlight.current = true;
    setCarregandoMais(true); setError('');
    const version = accountVersion.current;
    try {
      const page = paginaServicos + 1;
      const result = await api.servicos(token, page);
      if (version !== accountVersion.current) return;
      setServicos(current => [...current, ...result.data.filter(item => !current.some(existing => existing.id === item.id))]);
      setPaginaServicos(page);
      setMaisServicos(result.hasNextPage);
    } catch (e) { if (version === accountVersion.current) setError(e instanceof Error ? e.message : 'Erro ao carregar mais serviços'); }
    finally { if (version === accountVersion.current) { paginationInFlight.current = false; setCarregandoMais(false); } }
  }
  async function submitServico(e: FormEvent) {
    e.preventDefault(); if(!token) { setForm('login'); return; }
    if (usuario?.papel !== 'CLIENTE') { setError('Apenas clientes podem criar solicitações.'); return; }
    setBusy(true); setError('');
    const version = accountVersion.current;
    try {
      const created = await api.criarServico(token, descricao, categoria);
      if (version !== accountVersion.current) return;
      setServicos(current => current.some(item => item.id === created.data.id) ? current : [created.data,...current]);
      setDescricao('');
    } catch(e) {
      if (version === accountVersion.current) setError(e instanceof Error ? e.message : 'Erro inesperado');
    } finally {
      if (version === accountVersion.current) setBusy(false);
    }
  }
  async function cancelarServico(id: string) {
    if (!token) return;
    const version = accountVersion.current;
    setBusy(true); setError('');
    try {
      const result = await api.cancelarServico(token, id);
      if (version !== accountVersion.current) return;
      setServicos(current => current.map(item => item.id === id ? result.data : item));
    } catch(e) {
      if (version === accountVersion.current) setError(e instanceof Error ? e.message : 'Erro inesperado');
    } finally {
      if (version === accountVersion.current) setBusy(false);
    }
  }
  async function aceitarServico(id:string) {
    if(!token) return;
    const version = accountVersion.current;
    setBusy(true); setError('');
    try {
      const result = await api.aceitarServico(token,id);
      if (version !== accountVersion.current) return;
      setDisponiveis(items => items.filter(s => s.id !== id));
      setAtribuidos(items => items.some(s => s.id === result.data.id) ? items : [result.data,...items]);
    } catch(e) {
      if (version === accountVersion.current) setError(e instanceof Error ? e.message : 'Não foi possível aceitar o serviço');
    } finally {
      if (version === accountVersion.current) setBusy(false);
    }
  }
  async function mudarStatus(id:string, action:'iniciar'|'concluir') {
    if (!token) return;
    setBusy(true); setError('');
    try {
      const result = action === 'iniciar' ? await api.iniciarServico(token,id) : await api.concluirServico(token,id);
      setAtribuidos(current => current.map(s=>s.id===id?result.data:s));
    } catch(e) { setError(e instanceof Error ? e.message : 'Erro inesperado'); }
    finally { setBusy(false); }
  }
  async function avaliar(id:string) {
    if (!token) return;
    setBusy(true); setError('');
    try {
      await api.avaliarServico(token,id,nota,comentario);
      setAvaliacoesEnviadas(current => [...current,id]);
      setComentario('');
    } catch(e) { setError(e instanceof Error ? e.message : 'Erro inesperado'); }
    finally { setBusy(false); }
  }
  async function abrirConversa(id:string) {
    const request = ++conversationRequest.current;
    const version = accountVersion.current;
    setConversaId(id); setMensagens([]); setError('');
    try {
      const result = await api.mensagens(token,id);
      if (request === conversationRequest.current && version === accountVersion.current) {
        setMensagens(current => {
          return combinarMensagens(result.data, current);
        });
      }
    } catch(e) {
      if (request === conversationRequest.current && version === accountVersion.current) setError(e instanceof Error ? e.message : 'Erro ao carregar mensagens');
    }
  }
  async function marcarNotificacaoLida(id: string) {
    const version = accountVersion.current;
    try {
      await api.marcarLida(token, id);
      if (version !== accountVersion.current) return;
      setNotificacoes(items => items.map(item => item.id === id ? {...item, lida: true} : item));
    } catch {
      if (version === accountVersion.current) setError('Falha ao atualizar notificação');
    }
  }
  async function enviarMensagem(e: FormEvent) {
    e.preventDefault();
    if (!conversaId || !textoMensagem.trim()) return;
    setBusy(true); setError('');
    const request = conversationRequest.current;
    const version = accountVersion.current;
    const message = textoMensagem.trim();
    const target = conversaId;
    try {
      const result = await api.enviarMensagem(token,target,message);
      if (request !== conversationRequest.current || version !== accountVersion.current) return;
      setMensagens(current => combinarMensagens([result.data], current));
      setTextoMensagem('');
    } catch(e) {
      if (request === conversationRequest.current && version === accountVersion.current) setError(e instanceof Error ? e.message : 'Erro ao enviar mensagem');
    } finally { setBusy(false); }
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
          {usuario?.papel === 'PRESTADOR' ? <div className="service-form"><h3>Área de atendimento</h3><p>Como prestador, consulte as oportunidades disponíveis e seus serviços atribuídos abaixo.</p></div> : <form className="service-form" onSubmit={submitServico}>
            <div className="form-head"><span className="form-icon"><Plus/></span><div><h3>Nova solicitação</h3><p>Conte como podemos ajudar</p></div></div>
            <label htmlFor="categoria">Categoria</label><select id="categoria" value={categoria} onChange={e=>setCategoria(e.target.value)}>{categorias.map(c=><option key={c}>{c}</option>)}</select>
            <label htmlFor="descricao">O que você precisa?</label><textarea id="descricao" minLength={5} maxLength={500} required value={descricao} onChange={e=>setDescricao(e.target.value)} placeholder="Ex.: Preciso de ajuda com as compras da semana..." rows={4}/>
            <button disabled={busy} className="button button-dark form-submit" type="submit">{busy?'Enviando...':token?'Criar solicitação':'Entrar para solicitar'} <ArrowRight size={17}/></button>
            <small className="helper">Esta é uma versão de desenvolvimento. Ainda não há contratação ou pagamento real.</small>
          </form>}
          <div className="service-list"><h3>{usuario ? `Olá, ${usuario.nome.split(' ')[0]}!` : 'Suas solicitações'} <span>{servicos.length}</span></h3>
            {token ? servicos.length===0 ? <div className="empty"><HeartHandshake size={40}/><h4>Nenhuma solicitação ainda</h4><p>Crie a primeira usando o formulário ao lado.</p></div> :
              <div className="cards">{servicos.map(s=><article className="service-item" key={s.id}><div><span className="category-tag">{s.categoria}</span><h4>{s.descricao}</h4><small>#{s.id.slice(0,8)}</small></div><div className="service-actions"><span className="status">{s.status}</span>{s.status!=='PENDENTE'&&s.status!=='CANCELADO'&&<button className="cancel-button" onClick={()=>abrirConversa(s.id)}>Mensagens</button>}{s.status==='CONCLUIDO'&&!avaliacoesEnviadas.includes(s.id)&&<div className="review-inline"><label htmlFor={`nota-${s.id}`}>Nota</label><select id={`nota-${s.id}`} value={nota} onChange={e=>setNota(Number(e.target.value))}>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n} estrela{n===1?'':'s'}</option>)}</select><input aria-label="Comentário opcional" placeholder="Comentário opcional" value={comentario} onChange={e=>setComentario(e.target.value)}/><button disabled={busy} onClick={()=>avaliar(s.id)} className="cancel-button">Enviar avaliação</button></div>}{s.status==='PENDENTE'&&<button disabled={busy} className="cancel-button" onClick={()=>cancelarServico(s.id)} aria-label={`Cancelar serviço ${s.descricao}`}>Cancelar</button>}</div></article>)}{maisServicos && <button type="button" className="button button-outline" disabled={carregandoMais} onClick={carregarMaisServicos}>{carregandoMais ? 'Carregando...' : 'Carregar mais serviços'}</button>}</div> :
              <div className="empty"><HeartHandshake size={40}/><h4>Seu espaço está aqui</h4><p>Entre na sua conta para visualizar e criar solicitações.</p><button className="button button-outline" onClick={()=>{setError('');setForm('login')}}>Fazer login <ArrowRight size={16}/></button></div>}
          </div>
        </div>
        {usuario?.papel==='PRESTADOR' && <section className="provider-section"><div className="section-heading"><span className="eyebrow">ÁREA DO PRESTADOR</span><h2>Oportunidades <em>disponíveis.</em></h2></div><div className="provider-grid">{disponiveis.length ? disponiveis.map(s=><article className="service-item" key={s.id}><div><span className="category-tag">{s.categoria}</span><h4>{s.descricao}</h4></div><button disabled={busy} className="button button-dark" onClick={()=>aceitarServico(s.id)}>Aceitar</button></article>):<p>Nenhuma solicitação disponível no momento.</p>}</div></section>}
        {error && !form && <p role="alert" className="error">{error}</p>}{token && !usuario && error && <button type="button" className="button button-outline" onClick={()=>setSessionRetry(value=>value+1)}>Tentar novamente</button>}
      </section>
      {usuario?.papel==='PRESTADOR' && <section className="container services"><div className="section-heading"><span className="eyebrow">MEUS ATENDIMENTOS</span><h2>Serviços <em>em andamento.</em></h2></div><div className="provider-grid">{atribuidos.filter(s=>s.status==='ACEITO'||s.status==='EM_ANDAMENTO').map(s=><article className="service-item" key={s.id}><div><span className="category-tag">{s.status}</span><h4>{s.descricao}</h4></div><button type="button" className="cancel-button" onClick={()=>abrirConversa(s.id)}>Mensagens</button><button disabled={busy} className="button button-dark" onClick={()=>mudarStatus(s.id,s.status==='ACEITO'?'iniciar':'concluir')}>{s.status==='ACEITO'?'Iniciar':'Concluir'}</button></article>)}</div></section>}
      {token&&<section className="container account-security"><div className="section-heading"><span className="eyebrow">SEGURANÇA</span><h2>Minha conta <em>e sessões.</em></h2></div><p>Você pode verificar suas sessões ativas e encerrar o acesso em todos os dispositivos.</p><div className="session-actions"><button type="button" className="button button-dark" disabled={loadingSessoes} onClick={carregarSessoes}>{loadingSessoes?'Carregando...':'Ver sessões ativas'}</button><button type="button" className="cancel-button" disabled={busy} onClick={encerrarTodas}>Sair de todos os dispositivos</button></div><div className="session-list">{sessoes.map(s=><article className="session-item" key={s.id}><div><strong>{s.atual?'Esta sessão':'Outra sessão'}</strong><p>Criada em {new Date(s.criadoEm).toLocaleString('pt-BR')} · Expira em {new Date(s.expiraEm).toLocaleString('pt-BR')}</p></div><button type="button" className="cancel-button" disabled={busy} onClick={()=>revogarSessao(s.id,s.atual)}>Encerrar</button></article>)}</div></section>}
      {token&&<section className="container notifications"><div className="section-heading"><span className="eyebrow">CENTRAL</span><h2>Notificações</h2></div>{notificacoes.length===0?<p>Nenhuma notificação por enquanto.</p>:notificacoes.map(n=><article className="notification" key={n.id}><div><strong>{n.titulo}</strong><p>{n.texto}</p></div>{!n.lida&&<button className="cancel-button" onClick={()=>void marcarNotificacaoLida(n.id)}>Marcar como lida</button>}</article>)}</section>}
      <section className="closing" id="sobre"><div className="container closing-inner"><div><span className="eyebrow">FACILITA REBUILD</span><h2>Conexões reais.<br/><em>Impacto positivo.</em></h2><p>Uma nova versão do projeto Facilita, com foco em tecnologia, acessibilidade e evolução contínua.</p></div><a href="#inicio" className="button button-light">Voltar ao início <ArrowUpRight size={18}/></a></div></section>
    </main>
    <footer className="container footer"><a href="#inicio" className="brand">facilita<span className="brand-dot">.</span><small>rebuild</small></a><span>Desenvolvimento Rebuild · João Pedro de França Maciel</span><a href="https://github.com/JotaMaciel/facilita-rebuild-frontend" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14}/></a></footer>
    {conversaId&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)fecharConversa()}}><div className="modal" onKeyDown={onModalKeyDown} role="dialog" aria-modal="true" aria-label="Mensagens do serviço"><button className="modal-close" aria-label="Fechar" onClick={fecharConversa}><X/></button><h2>Mensagens do serviço</h2><button type="button" className="cancel-button" onClick={()=>conversaId&&abrirConversa(conversaId)}>Atualizar mensagens</button><div className="message-list">{mensagens.length?mensagens.map(m=><p key={m.id} className={m.autorId===usuario?.id?'own-message':'message'}>{m.texto}</p>):<p>Sem mensagens ainda.</p>}</div><form onSubmit={enviarMensagem}><label htmlFor="novaMensagem">Mensagem</label><textarea id="novaMensagem" value={textoMensagem} onChange={e=>setTextoMensagem(e.target.value)} maxLength={2000} required/><button disabled={busy} type="submit" className="button button-dark">Enviar</button></form>{error&&<p role="alert" className="error">{error}</p>}</div></div>}
    {form && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setForm(null)}}><div className="modal" onKeyDown={onModalKeyDown} role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="modal-close" aria-label="Fechar" onClick={()=>{setForm(null);setError('')}}><X/></button><div className="brand"><span className="brand-icon"><HeartHandshake size={19}/></span> facilita<span className="brand-dot">.</span></div><h2 id="auth-title">{form==='login'?'Que bom ter você aqui!':form==='registro'?'Vamos criar sua conta':form==='recuperar'?'Recuperar senha':'Criar uma nova senha'}</h2><p>{form==='login'?'Entre para gerenciar suas solicitações.':form==='registro'?'Preencha seus dados para começar.':form==='recuperar'?'Informe seu e-mail. Se o envio estiver configurado, você receberá instruções para criar uma nova senha.':'Informe o token de recuperação obtido em ambiente de testes.'}</p><form onSubmit={submitAuth}>{form==='registro'&&<><label htmlFor="nome">Nome</label><input required id="nome" minLength={2} value={nome} onChange={e=>setNome(e.target.value)} autoComplete="name"/></>}{form==='registro'&&<><label htmlFor="papel">Quero participar como</label><select id="papel" value={papel} onChange={e=>setPapel(e.target.value as 'CLIENTE'|'PRESTADOR')}><option value="CLIENTE">Cliente</option><option value="PRESTADOR">Prestador de serviços</option></select></>}{form!=='redefinir'&&<><label htmlFor="email">E-mail</label><input id="email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></>}{form==='redefinir'&&<><label htmlFor="resetToken">Token de recuperação</label><input id="resetToken" required value={tokenRecuperacao} onChange={e=>setTokenRecuperacao(e.target.value)}/></>}{form!=='recuperar'&&<label htmlFor="senha">Senha</label>}{form!=='recuperar'&&<input id="senha" type="password" minLength={8} required value={senha} onChange={e=>setSenha(e.target.value)} autoComplete={form==='login'?'current-password':'new-password'}/>}{authNotice&&<p role="status" className="auth-notice">{authNotice}</p>}{error&&<p className="error" role="alert">{error}</p>}<button type="submit" disabled={busy} className="button button-dark form-submit">{busy?'Aguarde...':form==='login'?'Entrar':form==='registro'?'Criar conta':form==='recuperar'?'Solicitar recuperação':'Redefinir senha'}<ArrowRight size={17}/></button></form><button className="switch-auth" onClick={()=>{setForm(form==='login'?'registro':'login');setError('')}}>{form==='login'?'Ainda não tem conta? Cadastre-se':'Já tem conta? Faça login'}</button>{form==='login'&&<button className="switch-auth" onClick={()=>{setForm('recuperar');setError('');setAuthNotice('')}}>Esqueci minha senha</button>}{form==='recuperar'&&<button className="switch-auth" onClick={()=>{setForm('redefinir');setError('')}}>Já tenho um token de recuperação</button>}</div></div>}
  </div>;
}
