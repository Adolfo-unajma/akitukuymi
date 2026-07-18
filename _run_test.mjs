import { JSDOM } from 'jsdom'
const dom = new JSDOM('<!doctype html><body><div id="r"></div></body>',{pretendToBeVisual:true,url:'http://localhost'})
const w = dom.window
for (const k of ['window','document','HTMLElement','Node','Element','SVGElement','getComputedStyle','MutationObserver']) globalThis[k]=w[k]
globalThis.requestAnimationFrame = cb=>setTimeout(()=>cb(Date.now()),16)
globalThis.cancelAnimationFrame = id=>clearTimeout(id)
try { await import('./_bundle_test.mjs') } catch(e){ console.log('IMPORT ERROR:', e.message) }
await new Promise(r=>setTimeout(r,400))
console.log('RESULT SVG=' + w.document.querySelectorAll('#r svg').length + ' paths=' + w.document.querySelectorAll('#r path').length + ' circles=' + w.document.querySelectorAll('#r circle').length)
