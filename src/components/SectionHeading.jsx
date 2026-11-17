export default function SectionHeading({ number, label, title, accent, description }) {
  return <div className="section-heading"><span className="eyebrow"><span className="section-number">{number}</span>{label}</span><h2>{title} <em>{accent}</em></h2>{description && <p>{description}</p>}</div>;
}
