import { lazy, Suspense, useEffect, useRef, useState } from 'react';

// Loaded on demand: visitors who never pick dark mode never download OGL or the shader.
const Prism = lazy(() => import('./Prism'));

const afterPaint = cb => ('requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 400 }) : setTimeout(cb, 50));
const cancelAfterPaint = id => ('cancelIdleCallback' in window ? cancelIdleCallback(id) : clearTimeout(id));

// The React Bits Prism, shown only in dark mode.
// - It mounts only AFTER the circular theme reveal (or intro loader) has finished, because compiling the
//   shader blocks the main thread and used to freeze the reveal. main.js sets <html data-switching> while
//   an animation runs and fires "uisettled" when it is done.
// - It fades in once its first frame is drawn, and is unmounted 0.8s after leaving dark mode.
export default function PrismBackground() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const ready = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setDark(root.dataset.theme === 'dark');
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!dark) {
      setShown(false);
      const id = setTimeout(() => {
        ready.current = false;
        setMounted(false);
      }, 800);
      return () => clearTimeout(id);
    }

    let idle;
    const start = () => {
      idle = afterPaint(() => {
        setMounted(true);
        if (ready.current) setShown(true); // came back to dark before it was unmounted
      });
    };
    if (document.documentElement.hasAttribute('data-switching')) window.addEventListener('uisettled', start, { once: true });
    else start();

    return () => {
      window.removeEventListener('uisettled', start);
      if (idle) cancelAfterPaint(idle);
    };
  }, [dark]);

  return (
    <div id="prism-bg" className={shown ? 'on' : ''} aria-hidden="true">
      {mounted && (
        <Suspense fallback={null}>
          <Prism
            animationType="hover"
            timeScale={0.3}
            height={3.2}
            baseWidth={5.5}
            scale={4.5}
            hueShift={0}
            colorFrequency={1}
            noise={0}
            glow={0.4}
            onReady={() => {
              ready.current = true;
              setShown(document.documentElement.dataset.theme === 'dark');
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
