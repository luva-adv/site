/* ============================================================
   GOOGLE ANALYTICS 4 + CONSENT MODE v2 + BANNER DE COOKIES (LGPD/ANPD)

   Fluxo:
   1. Define gtag/dataLayer e empurra o consentimento padrao como
      "denied" - nenhum cookie e gravado antes da escolha.
   2. Carrega o gtag.js do Google (assincrono) e sobe o GA4.
   3. O banner aparece na 1a visita; a escolha fica no localStorage
      (1a parte, sem cookie) e vira gtag('consent','update', ...).
   4. Em caso de recusa, o GA4 continua mandando pings cookieless
      (Consent Mode), para o trafego nao ser contabilizado como zero.
   ============================================================ */
(function () {
  'use strict';

  var CHAVE = 'ajd_consent';
  var LIBERADO = {
    analytics_storage: 'granted', ad_storage: 'granted', ad_user_data: 'granted',
    ad_personalization: 'granted', functionality_storage: 'granted', personalization_storage: 'granted'
  };
  var NEGADO = {
    analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied',
    ad_personalization: 'denied', functionality_storage: 'denied', personalization_storage: 'denied'
  };

  /* ---------- 1. gtag + consentimento padrao (antes de qualquer script do Google) ---------- */
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function () { window.dataLayer.push(arguments); };
  }
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500
  });

  /* ---------- 2. carregar o GA4 (so se o ID estiver configurado) ---------- */
  var id = window.AJD_GA4_ID || '';
  if (id && id.indexOf('XXXX') === -1) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
    window.gtag('js', new Date());
    window.gtag('config', id, { anonymize_ip: true });
  }

  /* ---------- 3. banner e escolha ---------- */
  function ler() {
    try { return localStorage.getItem(CHAVE); } catch (e) { return null; }
  }
  function gravar(v) {
    try { localStorage.setItem(CHAVE, v); } catch (e) { /* modo privado: so vale nesta aba */ }
  }
  function aplicar(v) {
    window.gtag('consent', 'update', v === 'granted' ? LIBERADO : NEGADO);
  }
  function mostrar() {
    var b = document.getElementById('consentBanner');
    if (!b) return;
    b.removeAttribute('hidden');
    requestAnimationFrame(function () { b.classList.add('visivel'); });
  }
  function esconder() {
    var b = document.getElementById('consentBanner');
    if (!b) return;
    b.classList.remove('visivel');
    setTimeout(function () { b.setAttribute('hidden', ''); }, 400);
  }

  var escolha = ler();
  if (escolha === 'granted' || escolha === 'denied') {
    aplicar(escolha);
  } else {
    window.setTimeout(mostrar, 1200);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var a = document.getElementById('consentAceitar');
    var r = document.getElementById('consentRecusar');
    if (a) {
      a.addEventListener('click', function () { gravar('granted'); aplicar('granted'); esconder(); });
    }
    if (r) {
      r.addEventListener('click', function () { gravar('denied'); aplicar('denied'); esconder(); });
    }
  });
})();
