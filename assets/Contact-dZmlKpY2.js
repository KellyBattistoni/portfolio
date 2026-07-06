import{n as e}from"./rolldown-runtime-Bh1tDfsg.js";import{n as t,r as n}from"./vendor-react-Cdmdwe92.js";import{i as r,n as i,r as a,t as o}from"./vendor-gsap-D5tHD54G.js";import{n as s}from"./index-jpNO3Yp6.js";var c=e(r(),1),l=t(),u=`
.contact-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 6rem;
  align-items: start;
}
.contact-method { margin-bottom: 2.5rem; }
.contact-method:last-child { margin-bottom: 0; }
.contact-method-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}
.contact-method-lbl {
  font-size: 0.72rem;
  font-family: var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255,255,255,0.55);
  white-space: nowrap;
}
.contact-method-rule {
  flex: 1;
  height: 1px;
  background: rgba(255,255,255,0.07);
  display: block;
  transform-origin: left center;
}
.contact-email-link {
  font-family: var(--font-display);
  font-size: clamp(1.125rem, 1.8vw, 1.375rem);
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  border-bottom: 1px solid rgba(255,255,255,0.18);
  padding-bottom: 0.1em;
  transition: color 0.2s ease, border-color 0.2s ease;
}
.contact-email-link:hover {
  color: var(--color-brand-accent);
  border-color: var(--color-brand-accent);
}
.contact-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 2rem;
  border: 1px solid var(--color-brand-accent);
  color: var(--color-brand-accent);
  font-family: var(--font-sans);
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  background: transparent;
  cursor: pointer;
  transition: background 0.22s ease, color 0.22s ease;
}
.contact-cta:hover {
  background: var(--color-brand-accent);
  color: #050505;
}
.cv-lang-group {
  display: flex;
  gap: 1.25rem;
  margin-bottom: 1rem;
}
.cv-lang-btn {
  position: relative;
  padding: 0;
  font-size: 0.78rem;
  font-family: var(--font-sans);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.55);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}
.cv-lang-btn:hover { color: rgba(255,255,255,0.85); }
.cv-lang-btn[aria-checked="true"] { color: rgba(255,255,255,1); }
.cv-lang-btn::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -3px;
  height: 1px;
  background: #FF4500;
  transform-origin: left;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}
.cv-lang-btn[aria-checked="true"]::after { transform: scaleX(1); }
@media (max-width: 768px) {
  .contact-columns { grid-template-columns: 1fr; gap: 3.5rem 0; }
}
`;function d(){let{t:e}=n(`contact`),[t,r]=(0,c.useState)(`en`),d=(0,c.useRef)(null),f=(0,c.useRef)(null),p=(0,c.useRef)(null),m=(0,c.useRef)(null),h=(0,c.useRef)(null),g=(0,c.useRef)(null),_=(0,c.useRef)({en:null,es:null}),{prefersReducedMotion:v,isMobile:y}=s(),b=(0,c.useRef)(null);(0,c.useEffect)(()=>{let e=e=>{e.detail===`#contact`&&b.current?.restart()};return window.addEventListener(`section:replay`,e),()=>window.removeEventListener(`section:replay`,e)},[]);let{contextSafe:x}=o(()=>{if(v||y)return;let e=a.matchMedia();return e.add(`(prefers-reduced-motion: no-preference)`,()=>{if(!d.current||!f.current||!p.current||!m.current||!h.current||!g.current)return;let e=Array.from(g.current.querySelectorAll(`[data-method]`));a.set(f.current,{scaleX:0,transformOrigin:`left center`}),a.set(p.current,{opacity:0,y:30}),a.set(m.current,{opacity:0,y:20}),a.set(h.current,{opacity:0,y:16}),e.forEach(e=>{let t=e.querySelector(`.contact-method-lbl`),n=e.querySelector(`.contact-method-rule`),r=e.querySelector(`[data-method-content]`);t&&a.set(t,{opacity:0,x:-8}),n&&a.set(n,{scaleX:0}),r&&a.set(r,{opacity:0,y:10})});let t=a.timeline({paused:!0});return b.current=t,t.to(f.current,{scaleX:1,duration:.45,ease:`power2.out`}).to(p.current,{opacity:1,y:0,duration:.8,ease:`power3.out`},`-=0.15`).to(m.current,{opacity:1,y:0,duration:.55,ease:`power2.out`},`-=0.25`).to(h.current,{opacity:1,y:0,duration:.45,ease:`power2.out`},`-=0.2`).addLabel(`methods`,`-=0.3`),e.forEach((e,n)=>{let r=e.querySelector(`.contact-method-lbl`),i=e.querySelector(`.contact-method-rule`),a=e.querySelector(`[data-method-content]`),o=n*.18;r&&t.to(r,{opacity:1,x:0,duration:.3,ease:`power2.out`},`methods+=${o}`),i&&t.to(i,{scaleX:1,duration:.5,ease:`power2.out`},`methods+=${o+.08}`),a&&t.to(a,{opacity:1,y:0,duration:.35,ease:`power2.out`},`methods+=${o+.22}`)}),i.create({trigger:d.current,start:`top 90%`,toggleActions:`play none none reverse`,animation:t}),()=>{i.getAll().forEach(e=>e.kill())}}),()=>e.revert()},{scope:d,dependencies:[v,y]}),S=x(e=>{if(e===t)return;let n=_.current[e],i=_.current[e===`en`?`es`:`en`];v||(n&&a.timeline().to(n,{scale:.88,duration:.08,ease:`power2.in`}).to(n,{scale:1,duration:.5,ease:`elastic.out(1.3, 0.45)`}),i&&a.to(i,{scale:1,duration:.15,ease:`power2.out`})),r(e)}),C=t===`en`?`/portfolio/Kelly_Battistoni_CV_EN.pdf`:`/portfolio/Kelly_Battistoni_CV_ES.pdf`;return(0,l.jsxs)(`section`,{ref:d,id:`contact`,"aria-label":e(`heading`),style:{position:`relative`,minHeight:`100vh`,padding:`6rem 1.5rem`,display:`flex`,alignItems:`center`},children:[(0,l.jsx)(`style`,{children:u}),(0,l.jsx)(`div`,{"aria-hidden":`true`,style:{position:`absolute`,inset:0,background:`linear-gradient(to top, rgba(255,69,0,0.18) 0%, rgba(255,69,0,0.155) 7%, rgba(255,69,0,0.129) 14%, rgba(255,69,0,0.105) 21%, rgba(255,69,0,0.083) 28%, rgba(255,69,0,0.063) 35%, rgba(255,69,0,0.045) 42%, rgba(255,69,0,0.030) 49%, rgba(255,69,0,0.017) 56%, rgba(255,69,0,0.007) 63%, rgba(255,69,0,0.001) 69%, rgba(255,69,0,0) 73%), linear-gradient(to bottom, rgba(74,31,204,0.10) 0%, rgba(74,31,204,0.078) 8%, rgba(74,31,204,0.058) 16%, rgba(74,31,204,0.040) 24%, rgba(74,31,204,0.025) 33%, rgba(74,31,204,0.013) 42%, rgba(74,31,204,0.005) 51%, rgba(74,31,204,0) 58%)`,pointerEvents:`none`}}),(0,l.jsx)(`div`,{"aria-hidden":`true`,style:{position:`absolute`,inset:0,pointerEvents:`none`,backgroundImage:`url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22200%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20baseFrequency%3D%220.75%22%20type%3D%22fractalNoise%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22%2F%3E%3CfeColorMatrix%20type%3D%22saturate%22%20values%3D%220%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23n)%22%20opacity%3D%220.05%22%2F%3E%3C%2Fsvg%3E")`,backgroundSize:`200px 200px`,opacity:.4}}),(0,l.jsx)(`div`,{style:{position:`relative`,zIndex:1,maxWidth:`min(90rem, 88vw)`,margin:`0 auto`,width:`100%`},children:(0,l.jsxs)(`div`,{className:`contact-columns`,children:[(0,l.jsxs)(`div`,{children:[(0,l.jsx)(`span`,{ref:f,"aria-hidden":`true`,style:{display:`block`,height:`1px`,width:`3rem`,background:`var(--color-brand-accent)`,marginBottom:`1.5rem`}}),(0,l.jsx)(`h2`,{ref:p,style:{fontFamily:`var(--font-display)`,fontSize:`clamp(2rem, 5vw, 3rem)`,marginTop:0,marginBottom:`1.5rem`},children:e(`heading`)}),(0,l.jsx)(`p`,{ref:m,style:{fontSize:`1.125rem`,lineHeight:1.7,marginBottom:`1.25rem`,color:`rgba(255,255,255,0.75)`},children:e(`invite`)}),(0,l.jsx)(`p`,{ref:h,style:{fontSize:`0.875rem`,lineHeight:1.6,color:`rgba(255,255,255,0.55)`,marginBottom:0},children:e(`openTo`)})]}),(0,l.jsxs)(`div`,{ref:g,children:[(0,l.jsxs)(`div`,{className:`contact-method`,"data-method":!0,children:[(0,l.jsxs)(`div`,{className:`contact-method-header`,children:[(0,l.jsx)(`span`,{className:`contact-method-lbl`,children:e(`email.method`)}),(0,l.jsx)(`span`,{className:`contact-method-rule`,"aria-hidden":`true`})]}),(0,l.jsx)(`div`,{"data-method-content":!0,children:(0,l.jsx)(`a`,{href:`mailto:kellybattistoniv@gmail.com`,className:`contact-email-link`,children:e(`email.label`)})})]}),(0,l.jsxs)(`div`,{className:`contact-method`,"data-method":!0,children:[(0,l.jsxs)(`div`,{className:`contact-method-header`,children:[(0,l.jsx)(`span`,{className:`contact-method-lbl`,children:e(`linkedin.method`)}),(0,l.jsx)(`span`,{className:`contact-method-rule`,"aria-hidden":`true`})]}),(0,l.jsx)(`div`,{"data-method-content":!0,children:(0,l.jsx)(`a`,{href:e(`linkedin.url`),target:`_blank`,rel:`noopener noreferrer`,className:`contact-cta`,children:e(`linkedin.label`)})})]}),(0,l.jsxs)(`div`,{className:`contact-method`,"data-method":!0,children:[(0,l.jsxs)(`div`,{className:`contact-method-header`,children:[(0,l.jsx)(`span`,{className:`contact-method-lbl`,children:e(`cv.method`)}),(0,l.jsx)(`span`,{className:`contact-method-rule`,"aria-hidden":`true`})]}),(0,l.jsxs)(`div`,{"data-method-content":!0,children:[(0,l.jsx)(`div`,{role:`radiogroup`,"aria-label":e(`cv.method`),className:`cv-lang-group`,children:[`en`,`es`].map(n=>(0,l.jsx)(`button`,{ref:e=>{_.current[n]=e},type:`button`,role:`radio`,"aria-checked":t===n,onClick:()=>S(n),className:`cv-lang-btn`,children:e(`cv.toggle.${n}`)},n))}),(0,l.jsx)(`a`,{href:C,download:!0,className:`contact-cta`,children:e(`cv.download`)})]})]})]})]})})]})}export{d as Contact};