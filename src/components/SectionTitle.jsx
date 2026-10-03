import { useRef } from 'react';
import VariableProximity from './VariableProximity';

// A section title (class "big") using the React Bits VariableProximity effect.
// VariableProximity needs a ref to its container, which .astro files can't create,
// so this small wrapper makes the ref and passes your snippet's settings.
export default function SectionTitle({ label }) {
  const containerRef = useRef(null);

  return (
    <h2 className="big" ref={containerRef} style={{ position: 'relative' }}>
      <VariableProximity
        label={label}
        fromFontVariationSettings="'wght' 400, 'opsz' 9"
        toFontVariationSettings="'wght' 1000, 'opsz' 40"
        containerRef={containerRef}
        radius={100}
        falloff="linear"
      />
    </h2>
  );
}
