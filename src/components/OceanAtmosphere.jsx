import { useEffect, useRef } from 'react';
import { mountOcean } from '../ocean-effects';
import '../menu-scene.css';
import '../menu-motion.css';

export default function OceanAtmosphere({ paused }) {
  const svgRef = useRef(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  useEffect(() => mountOcean(svgRef.current, { isPaused: () => pausedRef.current }), []);
  return <svg ref={svgRef} className={`ocean-atmosphere homepage-ocean ${paused ? 'effects-paused' : ''}`} aria-hidden="true" fill="none" preserveAspectRatio="none">
    <defs>
      <radialGradient id="bubble-pearl" cx=".32" cy=".28" r=".75"><stop stopColor="var(--bubble-highlight)" stopOpacity=".24" /><stop offset=".35" stopColor="var(--bubble-highlight)" stopOpacity=".025" /><stop offset=".77" stopColor="#36d0f5" stopOpacity=".015" /><stop offset="1" stopColor="var(--bubble-highlight)" stopOpacity=".3" /></radialGradient>
      <linearGradient id="home-shaft" x2=".3" y2="1"><stop stopColor="var(--bubble-highlight)" stopOpacity=".42" /><stop offset="1" stopColor="var(--ray)" stopOpacity="0" /></linearGradient>
      <linearGradient id="home-edge" x2="0" y2="1"><stop stopColor="var(--bubble-highlight)" stopOpacity=".2" /><stop offset=".55" stopColor="var(--ray)" stopOpacity="0" /></linearGradient>
    </defs>
    <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="none">
      <g className="ocean-ray"><path d="M600-50h70L420 1050H200Z" fill="url(#home-shaft)" /><path d="M720-50h35L700 1050H590Z" fill="url(#home-shaft)" /></g>
      <g className="ocean-ray second"><path d="M900-50h70L920 1050H770Z" fill="url(#home-shaft)" /></g>
      <g className="ocean-caustic" stroke="var(--bubble-highlight)" strokeWidth="1"><path d="M0 125Q160 65 260 115T540 85T850 130T1100 80M-50 190Q120 120 280 170T560 140T860 200T1100 150M30 85Q240 30 400 75T780 50T1100 95" /></g>
      <g className="ocean-current" stroke="var(--bubble-highlight)" strokeWidth=".8"><path d="M650 600C780 545 935 580 1020 520M720 622C840 579 925 620 1040 568M790 657C920 610 1000 655 1100 595" /></g>
      <g className="ocean-current second" stroke="var(--bubble-highlight)" strokeWidth=".7"><path d="M440 870C610 820 780 900 1050 810M480 900C670 850 810 930 1080 855M720 955C860 900 1020 970 1120 920" /></g>
      <path fill="url(#home-edge)" d="M0 0H1000V1000H0Z" />
    </svg>
    <g className="ocean-dust" /><g className="ocean-bubbles" /><g className="ocean-details" /><g className="ocean-interactions" />
  </svg>;
}
