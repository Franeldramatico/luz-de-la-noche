import waterTexture from '../../nightfall_assets/agua_portada.webp';

export default function WaterScene() {
  return <div className="water-scene underwater-home" aria-hidden="true">
    <img className="underwater-image" src={waterTexture} alt="" />
    <div className="underwater-tint" />
    <div className="water-vignette" />
    <div className="water-grain" />
  </div>;
}
