import type { Servico } from '../api';

type ProviderOpportunitiesProps = {
  services: Servico[];
  busy: boolean;
  onAccept: (id: string) => void;
};

export function ProviderOpportunities({ services, busy, onAccept }: ProviderOpportunitiesProps) {
  return <section className="provider-section">
    <div className="section-heading"><span className="eyebrow">ÁREA DO PRESTADOR</span><h2>Oportunidades <em>disponíveis.</em></h2></div>
    <div className="provider-grid">
      {services.length ? services.map(service => <article className="service-item" key={service.id}>
        <div><span className="category-tag">{service.categoria}</span><h4>{service.descricao}</h4></div>
        <button disabled={busy} className="button button-dark" onClick={() => onAccept(service.id)}>Aceitar</button>
      </article>) : <p>Nenhuma solicitação disponível no momento.</p>}
    </div>
  </section>;
}
