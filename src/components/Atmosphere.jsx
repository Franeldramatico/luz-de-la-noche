export default function Atmosphere() {
  return <div className="atmosphere" aria-hidden="true"><div className="ambient-glow glow-one" /><div className="ambient-glow glow-two" />{Array.from({ length: 35 }, (_, i) => <i className="star" key={i} style={{ '--x': `${(i * 37 + 7) % 100}%`, '--y': `${(i * 23 + 11) % 100}%`, '--delay': `${i % 7}s`, '--size': `${i % 3 === 0 ? 3 : 2}px` }} />)}</div>;
}
