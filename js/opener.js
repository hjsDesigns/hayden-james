// HJS Designs, the opener. His storyboard (notebook 10/30, intro board 11/11): "MacBook closed center of screen. I'm clicking
// the MacBook and it's opening up, and the camera is going down and then into the computer… the MacBook's going to stay still.
// And the screen is just going to have my design on it." Then a portal-like transition, then the city (the website).
// The laptop's look is Aceternity's MacBook (keyboard, deck, trackpad, our saved port); the motion is his:
//   A  closed, his mark on the lid → the lid swings up on its hinge (rotation only, nothing stretches), his real card art lit on
//      the screen; the camera eases down to it.
//   B  the city comes up on the screen, then the camera pushes into the screen. One eased value drives the laptop, the screen's
//      clip and the city together, so the picture never leaves the bezel. Light streaks rush past as the screen fills the view.
//   C  out the other side: the camera rises over the whole city, and the name and the way to reach him arrive.
// Scroll drives every step, so nothing plays at you; a tap on the laptop or "Come on in" does the scrolling for you.
import { createMacbookScroll } from './macbook-scroll.js?v=1';

const html = document.documentElement;
if (html.classList.contains('op') && !matchMedia('(prefers-reduced-motion: reduce)').matches) start();

function start() {
  const section = document.querySelector('.opener');
  const stage = section.querySelector('.stage');
  const host = stage.querySelector('.laptop');
  const world = stage.querySelector('.world');
  const pic = world.querySelector('.world-img');
  const cue = stage.querySelector('.come-in');
  const header = document.getElementById('header');
  const portal = stage.querySelector('.portal'), pctx = portal.getContext('2d');

  // the laptop: Aceternity's deck and keyboard, with our own lid on a real hinge (front: his card; back: his wordmark)
  createMacbookScroll(host, { mode: 'manual', src: '', logo: '' });
  const lidBox = host.querySelector('.mb-lid');
  const lid = document.createElement('div'); lid.className = 'lid';
  lid.innerHTML = '<div class="lid-face lid-front"><div class="glass"><img class="card-art" src="images/card-screen.jpg" alt=""></div></div>' +
                  '<div class="lid-face lid-back"><img src="images/wordmark-white.png" alt=""></div>';
  lidBox.append(lid);
  const glass = lid.querySelector('.glass');
  window.__opReady = true;
  window.__opFrame = () => { last = -1; frame(); };      // lets a check run one frame on demand (hidden panes throttle rAF)

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;   // in-out cubic
  const out = t => 1 - Math.pow(1 - t, 3);
  const wide = () => matchMedia('(min-width: 900px) and (min-aspect-ratio: 1/1)').matches;
  const FX = 0.49, FY = 0.34;                     // where the Needle sits in the picture: the screen frames it first

  // geometry, measured with the lid open and the camera at rest
  let W = 0, H = 0, G = null, rg = 8, Sv = 1, Sg = 1, kCov = 1, K = 1, D = 1, mb = 10, dpr = 1, iw = 16, ih = 9;
  function measure() {
    mb = parseFloat(getComputedStyle(host).getPropertyValue('--mb')) || 10;
    stage.style.setProperty('--lap-h', host.offsetHeight + 'px');
    lid.style.transform = 'rotateX(0deg)'; host.style.transform = 'translate(-50%,0)'; host.style.transformOrigin = '50% 0';
    const st = stage.getBoundingClientRect(), r = glass.getBoundingClientRect(), hr = host.getBoundingClientRect();
    W = st.width; H = st.height;
    G = { l: r.left - st.left, t: r.top - st.top, w: r.width, h: r.height }; G.cx = G.l + G.w / 2; G.cy = G.t + G.h / 2;
    rg = parseFloat(getComputedStyle(glass).borderTopLeftRadius) || 6;
    host.style.transformOrigin = `${(G.cx - (hr.left - st.left)).toFixed(1)}px ${(G.cy - (hr.top - st.top)).toFixed(1)}px`;
    iw = pic.naturalWidth || 16; ih = pic.naturalHeight || 9;
    Sv = Math.max(W / iw, H / ih);                                   // the city filling the view
    Sg = Math.max(G.w / (2 * Math.min(FX, 1 - FX) * iw), G.h / (2 * Math.min(FY, 1 - FY) * ih));   // the city filling the screen, Needle centred
    kCov = Math.max(2 * G.cx / G.w, 2 * (W - G.cx) / G.w, 2 * G.cy / G.h, 2 * (H - G.cy) / G.h);   // when the screen covers the view
    K = kCov * 1.22;
    D = Math.max(1, section.offsetHeight - stage.offsetHeight);
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    portal.width = Math.round(W * dpr); portal.height = Math.round(H * dpr);
    last = -1; frame();
  }

  // the portal: light streaks rushing out of the screen as the camera passes through it (his sketch 4)
  const N = wide() ? 120 : 76, streaks = [];
  for (let i = 0; i < N; i++) streaks.push({ a: (i * 2.399963) % (Math.PI * 2), r: (i * 0.618034) % 1, w: 0.6 + (i % 3) * 0.55, mint: i % 4 !== 0 });
  function drawPortal(t, cx, cy) {
    pctx.clearRect(0, 0, portal.width, portal.height);
    const f = Math.sin(Math.PI * clamp(t)); if (f <= 0.01) return;
    const diag = Math.hypot(W, H) * dpr;
    pctx.globalCompositeOperation = 'lighter';
    for (const s of streaks) {
      const r1 = ((s.r + t * 1.7) % 1) * diag * 0.6, len = diag * (0.05 + 0.24 * f) * (0.5 + s.r);
      const x1 = cx * dpr + Math.cos(s.a) * r1, y1 = cy * dpr + Math.sin(s.a) * r1;
      const x2 = cx * dpr + Math.cos(s.a) * (r1 + len), y2 = cy * dpr + Math.sin(s.a) * (r1 + len);
      const g = pctx.createLinearGradient(x1, y1, x2, y2), c = s.mint ? '180,226,196' : '242,238,229';
      g.addColorStop(0, `rgba(${c},0)`); g.addColorStop(1, `rgba(${c},${(0.6 * f).toFixed(3)})`);
      pctx.strokeStyle = g; pctx.lineWidth = s.w * dpr; pctx.beginPath(); pctx.moveTo(x1, y1); pctx.lineTo(x2, y2); pctx.stroke();
    }
    pctx.globalCompositeOperation = 'source-over';
  }

  // the city's place for a camera scale k: inside the screen (focal point on the screen's centre) or settled full view
  const cityAt = (k, settle) => {
    const sIn = Sg * k / Sv;
    const txIn = G.cx - W / 2 - sIn * (FX - 0.5) * iw * Sv, tyIn = G.cy - H / 2 - sIn * (FY - 0.5) * ih * Sv;
    const s = sIn + (1 - sIn) * settle, tx = txIn * (1 - settle), ty = tyIn * (1 - settle);
    return `translate(${tx.toFixed(1)}px,${ty.toFixed(1)}px) scale(${s.toFixed(4)})`;
  };

  // one scroll position -> every piece
  let last = -1;
  function frame() {
    raf = 0;
    const p = clamp(-section.getBoundingClientRect().top / D);
    if (p === last) return; last = p;
    const a = clamp(p / 0.34), b = clamp((p - 0.34) / 0.46), c = clamp((p - 0.8) / 0.16);
    const o = ease(clamp((a - 0.1) / 0.7));                          // the lid, 0 closed → 1 open
    const cf = clamp(b / 0.18);                                      // his card hands the screen to the city
    const pb = ease(clamp((b - 0.15) / 0.85));                       // the push into the screen
    const k = (0.9 + 0.1 * ease(a)) * (1 + (K - 1) * pb);
    const ty = -10 * mb * (1 - o);                                   // closed, the laptop sits centred; the camera comes down as it opens

    lid.style.transform = `rotateX(${(180 * (1 - o)).toFixed(2)}deg)`;
    host.style.transform = `translate(-50%,${ty.toFixed(1)}px) scale(${k.toFixed(4)})`;
    host.style.visibility = k >= kCov ? 'hidden' : 'visible';
    stage.style.setProperty('--sc', (1 - cf).toFixed(3));

    if (b <= 0) { world.style.clipPath = 'inset(50% 50% 50% 50%)'; world.style.opacity = '0'; }
    else {
      const hw = G.w * k / 2, hh = G.h * k / 2;                      // the screen's rectangle at this camera scale
      const t = Math.max(0, G.cy - hh), l = Math.max(0, G.cx - hw), r = Math.max(0, W - (G.cx + hw)), bo = Math.max(0, H - (G.cy + hh));
      world.style.clipPath = (t + l + r + bo) > 0.5 ? `inset(${t.toFixed(1)}px ${r.toFixed(1)}px ${bo.toFixed(1)}px ${l.toFixed(1)}px round ${(rg * k).toFixed(1)}px)` : 'none';
      world.style.opacity = cf.toFixed(3);
    }
    pic.style.transform = cityAt(b > 0 ? k : 1, ease(c));
    drawPortal((b - 0.42) / 0.55, G.cx + (W / 2 - G.cx) * pb, G.cy + (H / 2 - G.cy) * pb);

    stage.style.setProperty('--a', a.toFixed(3));
    stage.style.setProperty('--b', pb.toFixed(3));
    stage.style.setProperty('--c', out(c).toFixed(3));
    stage.style.setProperty('--cv', c > 0 ? 'visible' : 'hidden');
    stage.style.setProperty('--pe', a > 0.2 ? 'none' : 'auto');
    stage.classList.toggle('moving', a > 0.15);
    header.classList.toggle('cta-off', c > 0.02);                    // one "Text Hayden" on screen at a time, set in the same frame
  }
  let raf = 0;
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(frame); };
  addEventListener('scroll', onScroll, { passive: true });
  let rz = 0; addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(measure); });
  pic.addEventListener('load', measure);
  if (document.fonts) document.fonts.ready.then(measure);
  measure();

  // "Come on in", or a tap on the laptop: the scroll does the walking (about 3 s); any touch, wheel or key hands it back
  let walking = 0;
  const walk = () => {
    const from = scrollY, to = section.offsetTop + D * 0.94, dur = 3000, t0 = performance.now();
    if (to <= from + 4) return;
    const stop = () => { cancelAnimationFrame(walking); walking = 0; ['wheel', 'touchstart', 'keydown'].forEach(e => removeEventListener(e, stop)); };
    ['wheel', 'touchstart', 'keydown'].forEach(e => addEventListener(e, stop, { passive: true }));
    const step = now => { const t = clamp((now - t0) / dur); scrollTo(0, from + (to - from) * ease(t)); walking = t < 1 ? requestAnimationFrame(step) : (stop(), 0); };
    walking = requestAnimationFrame(step);
  };
  cue.addEventListener('click', walk);
  host.addEventListener('click', () => { if (last < 0.3) walk(); });
}
