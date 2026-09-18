/* ============================================================
   REDES — pestaña de redes sociales, módulo universal
   ============================================================
   Agrega una sexta pestaña ("Redes") a los sitios del portafolio, al
   lado de Inicio / Nosotros / Carta / Reseñas / Visítanos, sin tocar el
   HTML de cada proyecto: se engancha al sistema de pestañas que ya tenga
   el sitio y hereda su paleta en runtime, igual que carrito.js.

   Uso: antes de cargar este archivo, el sitio declara SOLO las redes que
   se verificaron de verdad:

     window.REDES = {
       intro: "línea opcional de contexto",
       instagram: { user:"cafe_x", seguidores:"1.147",
                    nota:"Su canal más activo",
                    fotos:["fotos/a.jpg","fotos/b.jpg","fotos/c.jpg"] },
       tiktok:    { user:"cafe_x", seguidores:"320", portada:"fotos/c.jpg",
                    video:"https://tiktok.com/@cafe_x/video/123" },
       facebook:  { url:"https://facebook.com/…", nombre:"Café X" },
       threads:   { user:"cafe_x", seguidores:"19" },
       youtube:   { url:"https://youtube.com/@x", nombre:"Café X" },
       whatsapp:  { numero:"56912345678", nota:"Sólo mensajes" },
       telefono:  { numero:"+56221234567" },
       correo:    { direccion:"hola@cafe.cl", nota:"Para encargos" }
     };

   Si `window.REDES` no existe, el módulo no hace nada: nunca inventa un
   perfil. Lo que no esté en la config, no aparece en la página.

   Los videos NUNCA se incrustan (regla de la bitácora): un reel se
   muestra como foto de portada con un ícono de play que enlaza al post
   real, que pesa muchísimo menos.
   ============================================================ */
(function () {
  'use strict';

  var CFG = window.REDES;
  if (!CFG || typeof CFG !== 'object') return;

  var CLAVE = 'redes';

  /* El portafolio tiene DOS convenciones de pestañas y hay que detectar cuál
     usa este sitio antes de tocar nada:
       a) la común: nav con [data-tab], paneles con [data-tab-panel]
       b) la invertida (al Cubo, Zoliakie, Gigi): nav con [data-tab-link] y
          el [data-tab] puesto en el PANEL, no en el enlace.
     Sin esta distinción, en los de la (b) se clonaba una <section> entera
     creyendo que era un enlace de navegación. */
  var ATTR_NAV = document.querySelector('[data-tab-link]') ? 'data-tab-link' : 'data-tab';
  var SEL_NAV = '[' + ATTR_NAV + ']';

  /* ---------- paleta heredada del sitio (mismo criterio que carrito.js) ---- */
  function colorDe(el, prop) {
    if (!el) return '';
    var c = getComputedStyle(el)[prop];
    return (c && c !== 'transparent' && !/rgba\(0,\s*0,\s*0,\s*0\)/.test(c)) ? c : '';
  }
  function acento() {
    var probes = ['.nav-link.active', '.btn-solid', '.btn.btn-solid', '.menu-tab.active',
                  '.cat-pill.active', '.btn-primary', '.btn', 'button'];
    for (var i = 0; i < probes.length; i++) {
      var el = document.querySelector(probes[i]);
      var c = colorDe(el, 'backgroundColor') || colorDe(el, 'borderColor') || colorDe(el, 'color');
      if (c) return c;
    }
    return '#8a6a43';
  }
  function superficie() {
    return colorDe(document.body, 'backgroundColor') || '#ffffff';
  }
  function esOscuro(rgb) {
    var m = String(rgb).match(/\d+/g);
    if (!m) return false;
    return (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]) / 255 < 0.5;
  }

  function formatearTel(n) {
    var s = String(n).replace(/[^\d]/g, '');
    if (s.length === 11 && s.indexOf('569') === 0) {
      return '+56 9 ' + s.slice(3, 7) + ' ' + s.slice(7);
    }
    if (s.length === 11 && s.indexOf('56') === 0) {
      return '+56 ' + s.slice(2, 3) + ' ' + s.slice(3, 7) + ' ' + s.slice(7);
    }
    return String(n);
  }

  /* ---------- definición de cada red ----------
     El color y el glifo son los de la marca real de cada plataforma; nada
     de esto es un dato inventado del local. */
  var MARCAS = {
    instagram: {
      nombre: 'Instagram',
      degradado: 'linear-gradient(45deg,#F09433,#DC2743,#BC1888)',
      url: function (d) { return 'https://instagram.com/' + d.user; },
      etiqueta: function (d) { return '@' + d.user; },
      icono: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/>'
    },
    tiktok: {
      nombre: 'TikTok',
      degradado: 'linear-gradient(45deg,#25F4EE,#111,#FE2C55)',
      url: function (d) { return 'https://tiktok.com/@' + d.user; },
      etiqueta: function (d) { return '@' + d.user; },
      icono: '<path d="M15 4v8.6a3.4 3.4 0 1 1-3-3.38"/><path d="M15 4a4.6 4.6 0 0 0 4.4 4.4"/>'
    },
    facebook: {
      nombre: 'Facebook',
      degradado: 'linear-gradient(45deg,#1877F2,#0C5DC7)',
      url: function (d) { return d.url; },
      etiqueta: function (d) { return d.nombre || 'Página oficial'; },
      icono: '<path d="M14.6 21.5v-8h2.7l.4-3.1h-3.1V8.4c0-.9.25-1.5 1.55-1.5h1.65V4.13A22 22 0 0 0 15.4 4c-2.4 0-4 1.46-4 4.14V10.4H8.7v3.1h2.7v8z"/><rect x="2.7" y="2.7" width="18.6" height="18.6" rx="4.6"/>'
    },
    threads: {
      nombre: 'Threads',
      degradado: 'linear-gradient(45deg,#4a4a4a,#111)',
      url: function (d) { return 'https://www.threads.net/@' + d.user; },
      etiqueta: function (d) { return '@' + d.user; },
      icono: '<path d="M12 2c5 0 8 3.4 8 9s-2.7 11-8 11-8-3.6-8-9c0-2.6 1-4.4 2.7-4.4 2 0 2.6 1.7 2.6 3.4 0 1.6-.7 2.7-2 2.7"/><path d="M14.5 8.6c2 0 3.3 1.3 3.3 3.6 0 3-2 4.8-4.8 4.8"/>'
    },
    youtube: {
      nombre: 'YouTube',
      degradado: 'linear-gradient(45deg,#FF0000,#C40000)',
      url: function (d) { return d.url; },
      etiqueta: function (d) { return d.nombre || 'Canal oficial'; },
      icono: '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10.5 9.5v5l4.2-2.5z" fill="currentColor" stroke="none"/>'
    },
    whatsapp: {
      nombre: 'WhatsApp',
      degradado: 'linear-gradient(45deg,#25D366,#128C7E)',
      url: function (d) { return 'https://wa.me/' + String(d.numero).replace(/\D/g, ''); },
      etiqueta: function (d) { return formatearTel(d.numero); },
      icono: '<path d="M17 14c-.3-.15-1.75-.86-2-.96-.27-.1-.47-.15-.66.15-.2.3-.76.95-.93 1.15-.17.2-.34.22-.63.08-.3-.15-1.24-.46-2.37-1.46-.87-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.46.13-.6.13-.13.3-.34.44-.5.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.66-1.6-.9-2.18-.24-.58-.48-.5-.66-.5h-.56c-.2 0-.53.08-.8.38-.28.3-1.05 1.02-1.05 2.5s1.07 2.9 1.22 3.1c.15.2 2.1 3.2 5.1 4.5.71.3 1.27.5 1.7.63.72.23 1.37.2 1.9.12.58-.09 1.75-.72 2-1.4.24-.7.24-1.3.17-1.4-.07-.13-.27-.2-.56-.35Z"/><circle cx="12" cy="12" r="9.3"/>'
    },
    telefono: {
      nombre: 'Teléfono',
      degradado: 'linear-gradient(45deg,#6B7280,#374151)',
      url: function (d) { return 'tel:' + String(d.numero).replace(/[^\d+]/g, ''); },
      etiqueta: function (d) { return formatearTel(d.numero); },
      icono: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>'
    },
    correo: {
      nombre: 'Correo',
      degradado: 'linear-gradient(45deg,#D93025,#8A1C14)',
      url: function (d) { return 'mailto:' + String(d.direccion || '').trim(); },
      etiqueta: function (d) { return String(d.direccion || '').trim(); },
      icono: '<rect x="2.5" y="4.5" width="19" height="15" rx="3"/><path d="m3.5 7 8.5 6 8.5-6"/>'
    }
  };
  /* El orden importa: primero donde el local publica, después el contacto.
     El correo va último: es el canal más lento, pero para encargos y
     banqueterías suele ser el que de verdad usan. */
  var ORDEN = ['instagram', 'tiktok', 'facebook', 'threads', 'youtube',
               'whatsapp', 'telefono', 'correo'];

  function svg(paths) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
           'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
  }

  /* ---------- dónde va la pestaña ----------
     Redes va PENÚLTIMA: Visítanos tiene que quedar siempre al final, que es
     la que cierra el recorrido. Cada sitio le pone una clave distinta
     (visitanos, ubicacion, contacto…), así que se busca por las dos vías. */
  var RE_ULTIMA = /(visit|ubicac|contact|donde|encuentr)/i;

  function claveUltima() {
    var encontrada = null;
    Array.prototype.forEach.call(document.querySelectorAll(SEL_NAV), function (l) {
      if (encontrada) return;
      var clave = l.getAttribute(ATTR_NAV) || '';
      var texto = (l.textContent || '').trim();
      if (RE_ULTIMA.test(clave) || RE_ULTIMA.test(texto)) encontrada = clave;
    });
    return encontrada;
  }

  /* ---------- encontrar el sistema de pestañas del sitio ---------- */
  function panelModelo() {
    return document.querySelector('[data-tab-panel]') ||
           document.querySelector('.tab-panel[id]') ||
           document.querySelector('.tab-section[id]') ||
           document.querySelector('.tab-panel');
  }
  function navModelo() {
    return document.querySelector('.nav-link' + SEL_NAV) ||
           document.querySelector('nav ' + SEL_NAV) ||
           document.querySelector(SEL_NAV);
  }

  function crearPanel() {
    var modelo = panelModelo();
    if (!modelo || !modelo.parentNode) return null;

    var panel = document.createElement(modelo.tagName);
    panel.className = String(modelo.className).replace(/\bactive\b/g, '').trim();
    /* Se copia el MISMO mecanismo que usa el sitio para identificar paneles:
       unos usan data-tab-panel, otros el id, otros las dos cosas. */
    if (modelo.hasAttribute('data-tab-panel')) panel.setAttribute('data-tab-panel', CLAVE);
    if (modelo.hasAttribute('data-panel')) panel.setAttribute('data-panel', CLAVE);
    /* En la convención invertida el panel es quien lleva data-tab. */
    if (ATTR_NAV === 'data-tab-link' && modelo.hasAttribute('data-tab')) {
      panel.setAttribute('data-tab', CLAVE);
    }
    if (modelo.id) panel.id = /^tab-/.test(modelo.id) ? 'tab-' + CLAVE : CLAVE;
    panel.setAttribute('data-redes-panel', '');

    /* Se cuelga justo antes del panel de Visítanos para que esa quede
       cerrando; si no se encuentra, al final como antes. */
    var ultima = claveUltima();
    var destino = null;
    if (ultima) {
      destino = document.querySelector('[data-tab-panel="' + ultima + '"]') ||
                document.getElementById(ultima) ||
                document.getElementById('tab-' + ultima) ||
                document.querySelector('.tab-section[data-tab="' + ultima + '"]');
    }
    if (destino && destino.parentNode === modelo.parentNode) {
      modelo.parentNode.insertBefore(panel, destino);
    } else {
      modelo.parentNode.appendChild(panel);
    }
    return panel;
  }

  function crearNav(alClic) {
    var modelo = navModelo();
    if (!modelo) return [];
    /* Varios sitios repiten la navegación (escritorio + móvil): se agrega el
       enlace en TODAS las barras, si no en el teléfono no aparece. */
    var barras = [];
    Array.prototype.forEach.call(document.querySelectorAll(SEL_NAV), function (el) {
      var p = el.parentNode;
      if (!p || barras.indexOf(p) !== -1) return;
      if (p.querySelectorAll(SEL_NAV).length < 3) return;
      /* Tiene que ser una barra de navegación de verdad. Sin esta condición,
         en Yume el enlace se colaba en el bloque de botones del header
         (.header-actions), que también tenía tres elementos con data-tab. */
      var esNav = p.tagName === 'NAV' || p.tagName === 'UL' ||
                  /nav|menu|men[uú]/i.test(String(p.className)) ||
                  /nav|menu/i.test(String(p.id)) ||
                  (p.closest && p.closest('nav'));
      if (esNav) barras.push(p);
    });
    if (!barras.length && modelo.parentNode) barras.push(modelo.parentNode);

    var creados = [];
    barras.forEach(function (barra) {
      if (barra.querySelector('[data-redes-link]')) return;   // ya estaba
      var hermanos = barra.querySelectorAll(SEL_NAV);
      var ultimo = hermanos[hermanos.length - 1];
      if (!ultimo) return;

      /* El enlace de Visítanos es el que tiene que quedar último. */
      var ultima = claveUltima();
      var anclaFinal = null;
      if (ultima) {
        Array.prototype.forEach.call(hermanos, function (h) {
          if (h.getAttribute(ATTR_NAV) === ultima) anclaFinal = h;
        });
      }

      /* Clon profundo para heredar la estructura interna del sitio: varios
         numeran las pestañas con un <span> propio ("01 Inicio"), y un clon
         plano perdía ese span y rompía la simetría de la barra. */
      var link = ultimo.cloneNode(true);
      link.className = String(ultimo.className).replace(/\bactive\b/g, '').trim();
      link.setAttribute(ATTR_NAV, CLAVE);
      link.removeAttribute('aria-current');
      link.setAttribute('data-redes-link', '');
      if (link.tagName === 'A') link.setAttribute('href', '#' + CLAVE);

      /* Se conserva el numerito si el sitio los usa, y se le pone el que toca. */
      var idx = link.querySelector('.nav-idx, [class*="idx"], [class*="num"]');
      /* Si Redes se cuela antes de Visítanos, su número sale del que la
         precede, no del último de la barra. */
      var referencia = anclaFinal && anclaFinal.previousElementSibling &&
                       anclaFinal.previousElementSibling.hasAttribute(ATTR_NAV)
        ? anclaFinal.previousElementSibling : ultimo;
      var idxPrevio = referencia.querySelector('.nav-idx, [class*="idx"], [class*="num"]');
      if (idx && idxPrevio && /^\s*\d+\s*$/.test(idxPrevio.textContent || '')) {
        /* Se numera a partir del último, no contando hermanos: alguna barra
           trae elementos ocultos y la cuenta salía desfasada. */
        idx.textContent = ('0' + (parseInt(idxPrevio.textContent, 10) + 1)).slice(-2);
      } else {
        idx = null;
      }
      Array.prototype.slice.call(link.childNodes).forEach(function (nodo) {
        if (nodo !== idx) link.removeChild(nodo);
      });
      link.appendChild(document.createTextNode('Redes'));

      link.addEventListener('click', function (e) {
        e.preventDefault();
        alClic();
      });
      /* ── Dónde va el enlace ──────────────────────────────────────────
         Muchos menús envuelven cada pestaña en su propia celda (un <li>,
         casi siempre) y el espacio entre pestañas es el `gap` ENTRE esas
         celdas. Si el enlace nuevo se mete dentro de la celda de al lado,
         quedan dos pestañas compartiendo celda y salen pegadas, como si
         "RedesVisítanos" fuera una sola palabra. Pasaba en Café Pixel.

         Así que cuando la pestaña de referencia tiene celda propia, se
         clona la celda vacía y el enlace va dentro de la celda nueva.
         Donde no hay celda —el menú son enlaces sueltos— se inserta como
         siempre. */
      function celdaDe(el) {
        var p = el && el.parentNode;
        if (!p || p === barra) return null;
        if (p.children.length !== 1) return null;
        if (!/^(LI|DIV|SPAN)$/.test(p.tagName)) return null;
        return p;
      }

      var refCelda = celdaDe(anclaFinal || ultimo);

      if (anclaFinal) {
        if (refCelda) {
          var celdaNueva = refCelda.cloneNode(false);
          celdaNueva.appendChild(link);
          refCelda.parentNode.insertBefore(celdaNueva, refCelda);
        } else {
          anclaFinal.parentNode.insertBefore(link, anclaFinal);
        }
        /* Visítanos se corre un número hacia adelante si el sitio los usa. */
        var idxFinal = anclaFinal.querySelector('.nav-idx, [class*="idx"], [class*="num"]');
        if (idx && idxFinal && /^\s*\d+\s*$/.test(idxFinal.textContent || '')) {
          idxFinal.textContent = ('0' + (parseInt(idx.textContent, 10) + 1)).slice(-2);
        }
      } else if (refCelda) {
        var celdaFinal = refCelda.cloneNode(false);
        celdaFinal.appendChild(link);
        refCelda.parentNode.insertBefore(celdaFinal, refCelda.nextSibling);
      } else {
        ultimo.parentNode.insertBefore(link, ultimo.nextSibling);
      }
      creados.push(link);
    });
    return creados;
  }

  /* ---------- contenido de la pestaña ---------- */
  function tarjeta(clave, datos) {
    var m = MARCAS[clave];
    if (!m) return null;
    var href = m.url(datos);
    if (!href) return null;

    var art = document.createElement('article');
    art.className = 'rd-card';
    if ((datos.fotos && datos.fotos.length) || datos.portada) art.className += ' rd-card-ancha';

    var cab = document.createElement('div');
    cab.className = 'rd-cab';

    var ico = document.createElement('span');
    ico.className = 'rd-ico';
    ico.style.background = m.degradado;
    ico.innerHTML = svg(m.icono);
    cab.appendChild(ico);

    var tit = document.createElement('div');
    tit.className = 'rd-tit';
    var h = document.createElement('h3');
    h.textContent = m.nombre;
    var sub = document.createElement('p');
    sub.className = 'rd-user';
    sub.textContent = m.etiqueta(datos);
    tit.appendChild(h);
    tit.appendChild(sub);
    cab.appendChild(tit);

    if (datos.seguidores) {
      var seg = document.createElement('span');
      seg.className = 'rd-seg';
      seg.textContent = datos.seguidores + ' seguidores';
      cab.appendChild(seg);
    }
    art.appendChild(cab);

    if (datos.nota) {
      var nota = document.createElement('p');
      nota.className = 'rd-nota';
      nota.textContent = datos.nota;
      art.appendChild(nota);
    }

    /* Rejilla con fotos reales del propio local. */
    if (datos.fotos && datos.fotos.length) {
      var rej = document.createElement('div');
      rej.className = 'rd-fotos';
      datos.fotos.slice(0, 3).forEach(function (f, i) {
        var enlazada = datos.posts && datos.posts[i];
        var cont = document.createElement(enlazada ? 'a' : 'div');
        cont.className = 'rd-foto';
        if (enlazada) {
          cont.href = datos.posts[i];
          cont.target = '_blank';
          cont.rel = 'noopener';
          cont.setAttribute('aria-label', 'Ver esta publicación en ' + m.nombre);
        }
        var im = document.createElement('img');
        im.src = f;
        im.alt = '';
        im.loading = 'lazy';
        im.decoding = 'async';
        cont.appendChild(im);
        rej.appendChild(cont);
      });
      art.appendChild(rej);
    }

    /* Un video NUNCA se incrusta: portada + play que lleva al post real. */
    if (datos.portada) {
      var vid = document.createElement(datos.video ? 'a' : 'div');
      vid.className = 'rd-video';
      if (datos.video) {
        vid.href = datos.video;
        vid.target = '_blank';
        vid.rel = 'noopener';
        vid.setAttribute('aria-label', 'Ver el video en ' + m.nombre);
      }
      var vim = document.createElement('img');
      vim.src = datos.portada;
      vim.alt = '';
      vim.loading = 'lazy';
      var play = document.createElement('span');
      play.className = 'rd-play';
      play.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
      vid.appendChild(vim);
      vid.appendChild(play);
      art.appendChild(vid);
    }

    var cta = document.createElement('a');
    cta.className = 'rd-cta';
    cta.href = href;
    if (!/^(tel|mailto):/.test(href)) {
      cta.target = '_blank';
      cta.rel = 'noopener';
    }
    cta.style.background = m.degradado;
    cta.textContent = clave === 'whatsapp' ? 'Escribir por WhatsApp'
                    : clave === 'telefono' ? 'Llamar'
                    : clave === 'correo' ? 'Escribir un correo'
                    : 'Ver ' + m.nombre;
    art.appendChild(cta);
    return art;
  }

  function pintar(panel) {
    var acc = acento();
    var oscuro = esOscuro(superficie());
    panel.textContent = '';

    var wrap = document.createElement('div');
    wrap.className = 'rd-wrap';

    var eyebrow = document.createElement('p');
    eyebrow.className = 'rd-eyebrow';
    eyebrow.textContent = 'Redes sociales';
    eyebrow.style.color = acc;
    wrap.appendChild(eyebrow);

    var h2 = document.createElement('h2');
    h2.className = 'rd-h2';
    h2.textContent = 'Dónde seguirnos';
    wrap.appendChild(h2);

    if (CFG.intro) {
      var intro = document.createElement('p');
      intro.className = 'rd-intro';
      intro.textContent = CFG.intro;
      wrap.appendChild(intro);
    }

    var grid = document.createElement('div');
    grid.className = 'rd-grid';
    var n = 0;
    ORDEN.forEach(function (clave) {
      if (!CFG[clave]) return;
      var t = tarjeta(clave, CFG[clave]);
      if (t) { grid.appendChild(t); n++; }
    });
    if (!n) return false;
    wrap.appendChild(grid);
    panel.appendChild(wrap);

    inyectarCSS(acc, oscuro);
    return true;
  }

  function inyectarCSS(acc, oscuro) {
    if (document.getElementById('redes-css')) return;
    var linea = oscuro ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.10)';
    var fondo = oscuro ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.02)';
    var st = document.createElement('style');
    st.id = 'redes-css';
    st.textContent = [
      '.rd-wrap{max-width:1100px;margin:0 auto;padding:clamp(48px,8vw,96px) 22px;}',
      '.rd-eyebrow{font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;margin:0 0 10px;font-weight:700;}',
      '.rd-h2{font-size:clamp(1.9rem,4.4vw,2.9rem);line-height:1.1;margin:0 0 12px;}',
      '.rd-intro{margin:0 0 30px;max-width:62ch;opacity:.75;line-height:1.6;}',
      '.rd-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr));gap:18px;align-items:start;}',
      '.rd-card{border:1px solid ' + linea + ';border-radius:18px;padding:20px;background:' + fondo + ';display:flex;flex-direction:column;gap:14px;}',
      '.rd-card-ancha{grid-column:1/-1;}',
      '.rd-cab{display:flex;align-items:center;gap:13px;flex-wrap:wrap;}',
      '.rd-ico{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;flex:0 0 auto;}',
      '.rd-ico svg{width:22px;height:22px;}',
      '.rd-tit{flex:1 1 auto;min-width:0;}',
      '.rd-tit h3{margin:0;font-size:1.06rem;line-height:1.2;}',
      '.rd-user{margin:2px 0 0;font-size:.86rem;opacity:.7;word-break:break-word;}',
      '.rd-seg{font-size:.75rem;opacity:.6;white-space:nowrap;}',
      '.rd-nota{margin:0;font-size:.9rem;line-height:1.55;opacity:.78;}',
      '.rd-fotos{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}',
      '.rd-foto{display:block;overflow:hidden;border-radius:12px;aspect-ratio:1/1;background:' + linea + ';}',
      '.rd-foto img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s cubic-bezier(.22,1,.36,1);}',
      'a.rd-foto:hover img{transform:scale(1.06);}',
      '.rd-video{position:relative;display:block;overflow:hidden;border-radius:12px;',
      'aspect-ratio:9/16;max-width:260px;margin:0 auto;}',
      '.rd-video img{width:100%;height:100%;object-fit:cover;display:block;}',
      '.rd-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;background:rgba(0,0,0,.28);}',
      '.rd-play svg{width:54px;height:54px;filter:drop-shadow(0 3px 10px rgba(0,0,0,.5));}',
      '.rd-cta{margin-top:auto;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 18px;border-radius:999px;color:#fff;font-weight:600;font-size:.92rem;text-decoration:none;transition:transform .2s ease,filter .2s ease;}',
      '.rd-cta:hover{transform:translateY(-2px);filter:brightness(1.07);}',
      '.rd-cta:focus-visible,.rd-foto:focus-visible,.rd-video:focus-visible{outline:2px solid ' + acc + ';outline-offset:3px;}',
      '@media (prefers-reduced-motion:reduce){.rd-cta,.rd-foto img{transition:none;}}'
    ].join('');
    document.head.appendChild(st);
  }

  /* ---------- activar / desactivar la pestaña ---------- */
  var miPanel = null;
  var misLinks = [];

  function mostrar() {
    /* Se llama primero a la función del propio sitio para que haga lo suyo
       (cerrar el menú móvil, subir el scroll, relanzar las animaciones).
       Varios sitios guardan la lista de paneles en una variable capturada
       ANTES de que exista el nuestro, así que después se corrige a mano. */
    if (typeof window.goToTab === 'function') {
      try { window.goToTab(CLAVE); } catch (e) { /* seguimos igual */ }
    }
    Array.prototype.forEach.call(
      document.querySelectorAll('.tab-panel, [data-tab-panel], .tab-section'),
      function (p) { if (p !== miPanel) p.classList.remove('active'); }
    );
    Array.prototype.forEach.call(document.querySelectorAll(SEL_NAV), function (l) {
      l.classList.toggle('active', l.getAttribute(ATTR_NAV) === CLAVE);
    });
    if (miPanel) miPanel.classList.add('active');
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
  }

  function vigilarOtrasPestanas() {
    /* Cuando el visitante vuelve a otra pestaña, el sitio no sabe apagar la
       nuestra (su lista de paneles es anterior a ella): se apaga acá. */
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target.closest(SEL_NAV) : null;
      if (!t || t.getAttribute(ATTR_NAV) === CLAVE) return;
      if (miPanel) miPanel.classList.remove('active');
      misLinks.forEach(function (l) { l.classList.remove('active'); });
    }, true);
  }

  function arrancar() {
    /* Se comprueban las dos piezas por separado: el arranque corre varias
       veces a propósito (DOMContentLoaded + reintento), y mirar solo el
       panel dejaba pasar una segunda pasada que duplicaba el enlace. */
    if (document.querySelector('[data-redes-panel]') ||
        document.querySelector('[data-redes-link]')) return;
    /* Si el sitio YA tiene su propia pestaña de redes, no se duplica. */
    var yaTiene = Array.prototype.some.call(
      document.querySelectorAll(SEL_NAV),
      function (l) {
        return (l.getAttribute(ATTR_NAV) || '').toLowerCase() === CLAVE ||
               /^\s*redes/i.test(l.textContent || '');
      }
    );
    if (yaTiene) return;

    var panel = crearPanel();
    if (!panel) return;
    if (!pintar(panel)) { panel.remove(); return; }
    miPanel = panel;
    misLinks = crearNav(mostrar);
    if (!misLinks.length) { panel.remove(); miPanel = null; return; }
    vigilarOtrasPestanas();
  }

  function seguro() {
    try { arrancar(); } catch (e) { /* nunca romper la página */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', seguro);
  } else {
    seguro();
  }
  setTimeout(seguro, 900);
})();
