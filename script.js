/* ════════════════════════════════════════════════
   La Pasarela — Huechuraba
   SPA por pestañas + reveal + menú móvil.
   ════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 1. Pantalla de carga: se va rápido, y pase lo que pase se va ── */
  var loader = document.getElementById('loader');
  function cerrarLoader() { if (loader) loader.classList.add('off'); }
  window.addEventListener('load', function () { setTimeout(cerrarLoader, 380); });
  // red de seguridad: si 'load' no dispara (imagen colgada), igual se cierra
  setTimeout(cerrarLoader, 1400);

  /* ── 2. Pestañas ── */
  var links  = document.querySelectorAll('[data-tab]');
  var burger = document.getElementById('burger');
  var nav    = document.getElementById('nav');

  function goToTab(id) {
    // Se consultan en vivo, no capturados al cargar: así un panel
    // inyectado después por un módulo universal también se apaga bien.
    document.querySelectorAll('[data-tab-panel]').forEach(function (p) {
      p.classList.toggle('on', p.getAttribute('data-tab-panel') === id);
    });
    document.querySelectorAll('.nav-links [data-tab]').forEach(function (a) {
      a.classList.toggle('on', a.getAttribute('data-tab') === id);
    });

    cerrarMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    revelar();                                  // relanza las animaciones
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  }
  window.goToTab = goToTab;

  links.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      goToTab(a.getAttribute('data-tab'));
    });
  });

  /* ── 3. Menú hamburguesa ── */
  function cerrarMenu() {
    if (!nav) return;
    nav.classList.remove('open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var abierto = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      burger.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') cerrarMenu();
  });

  /* ── 4. Scroll reveal, con red de seguridad ── */
  var io = null;
  function revelar() {
    var items = document.querySelectorAll('.reveal:not(.seen)');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('seen'); });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('seen'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    }
    items.forEach(function (el) { io.observe(el); });
  }
  revelar();

  // Red de seguridad: si algo no disparó en 2,2 s, se muestra igual.
  // Vale más un reveal que no se ve que una sección invisible.
  setTimeout(function () {
    document.querySelectorAll('.reveal:not(.seen)').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 1.2) el.classList.add('seen');
    });
  }, 2200);

  /* ── 5. Día de hoy marcado en el horario (fallback si horario.js no corre) ── */
  var hoy = new Date().getDay();               // 0 = domingo
  document.querySelectorAll('#horario-lista li').forEach(function (li) {
    if (parseInt(li.getAttribute('data-dia'), 10) === hoy) li.classList.add('hoy');
  });

  /* ── 6. Botón volver arriba ── */
  var toTop = document.getElementById('toTop');
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('show', window.scrollY > 520);
    }, { passive: true });
  }


  /* ── ESTÁNDAR 15-09-2026: movimiento extra ──────────────────────
     Va igual en las tres cafeterías. Todo dentro de try/catch: si algo
     falla, la página se ve igual, sólo sin la animación. */
  try {
    /* Reveal escalonado: se numera cada hijo para que entren en cascada
       en vez de todos de golpe. */
    document.querySelectorAll('.stagger').forEach(function (grupo) {
      Array.prototype.forEach.call(grupo.children, function (hijo, i) {
        hijo.style.setProperty('--i', i);
      });
    });

    /* Los números de las cifras suben hasta su valor al aparecer.
       Se respeta el texto original (con puntos, comas, $, "mil"), así que
       no hay riesgo de que muestre un número distinto al real. */
    var cifras = document.querySelectorAll('[data-contar]');
    if (cifras.length && 'IntersectionObserver' in window &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var obsN = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (en) {
          if (!en.isIntersecting) return;
          obsN.unobserve(en.target);
          var el = en.target;
          var texto = el.textContent;
          var num = parseFloat(texto.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, ''));
          if (!isFinite(num) || num <= 0) return;
          var t0 = null, dur = 900;
          function paso(t) {
            if (t0 === null) t0 = t;
            var p = Math.min((t - t0) / dur, 1);
            var e = 1 - Math.pow(1 - p, 3);          // easing suave al final
            if (p < 1) {
              var v = num * e;
              el.textContent = texto.indexOf(',') > -1
                ? v.toFixed(1).replace('.', ',')
                : Math.round(v).toLocaleString('es-CL');
              requestAnimationFrame(paso);
            } else {
              el.textContent = texto;               // se restaura el original
            }
          }
          requestAnimationFrame(paso);
        });
      }, { threshold: 0.6 });
      cifras.forEach(function (c) { obsN.observe(c); });
    }
  } catch (e) { /* si falla, la página sigue igual */ }

  /* ── 7. Abrir en la pestaña del hash, si viene una válida ── */
  var hash = (location.hash || '').replace('#', '');
  if (hash && document.querySelector('[data-tab-panel="' + hash + '"]')) goToTab(hash);
})();
