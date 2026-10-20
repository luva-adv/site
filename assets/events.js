/* ============================================================
   RASTREAMENTO DE EVENTOS (GA4)
   ------------------------------------------------------------
   GA4 nao gera evento nomeado sozinho para links de saida: um
   <a href="wa.me"> so vira um "click" generico. Aqui os cliques
   de contato viram eventos nomeados, que aparecem em
   Engajamento -> Eventos e podem gerar audiencia e conversao.

   Eventos disparados:
     whatsapp_click   - clique em qualquer botao de WhatsApp
     telefone_click   - clique no telefone
     email_click      - clique no e-mail
     maps_click       - clique em "Como chegar"
     faq_expandida    - abertura de uma pergunta do FAQ
     video_depoimento - reproducao de um depoimento em video

   Respeito ao consentimento: nada e enviado antes de o visitante
   escolher "Aceitar" no banner. Sem GA4 ativo, este arquivo nao
   faz nada.
   ============================================================ */
(function () {
  'use strict';

  var ID = window.AJD_GA4_ID || '';
  if (!ID || ID.indexOf('XXXX') !== -1) return;   // GA4 nao configurado
  if (typeof window.gtag !== 'function') return;

  var CHAVE = 'ajd_consent';

  function consentiu() {
    try { return localStorage.getItem(CHAVE) === 'granted'; } catch (e) { return false; }
  }

  /* ---------- 1. cliques de contato (delegacao no document) ---------- */
  var PADROES = [
    { re: /(^|\/\/)(wa\.me|api\.whatsapp\.com)\//i, nome: 'whatsapp_click', rotulo: 'WhatsApp' },
    { re: /^tel:/i,                                   nome: 'telefone_click', rotulo: 'Telefone' },
    { re: /^mailto:/i,                                nome: 'email_click',    rotulo: 'E-mail' },
    { re: /google\.[a-z.]+\/maps/i,                   nome: 'maps_click',     rotulo: 'Como chegar' }
  ];

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var alvo = null;
    for (var i = 0; i < PADROES.length; i++) {
      if (PADROES[i].re.test(href)) { alvo = PADROES[i]; break; }
    }
    if (!alvo) return;
    if (!consentiu()) return;

    var texto = (a.textContent || '').replace(/\s+/g, ' ').trim();
    var secao = a.closest('section[id]');
    var flutuante = a.closest('#whatsFloat');

    window.gtag('event', alvo.nome, {
      event_category: 'contato',
      event_label: (texto || alvo.rotulo).slice(0, 60),
      link_text: (texto || alvo.rotulo).slice(0, 60),
      link_url: href.slice(0, 200),
      link_location: flutuante ? 'botao_flutuante' : (secao ? secao.id : 'site'),
      outbound: true
    });
  }, true);   // fase de captura: roda antes de qualquer preventDefault

  /* ---------- 2. abertura de pergunta do FAQ ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('.faq-pergunta') : null;
    if (!btn) return;
    if (!consentiu()) return;
    var item = btn.closest('.faq-item');
    var pergunta = (btn.textContent || '').replace(/\s+/g, ' ').trim();
    window.gtag('event', 'faq_expandida', {
      event_category: 'engajamento',
      event_label: pergunta.slice(0, 80),
      faq_pergunta: pergunta.slice(0, 80),
      faq_aberta: item ? item.classList.contains('open') : false
    });
  });   // fase de bolha: o handler do site ja alternou a classe

  /* ---------- 3. reproducao de depoimento ---------- */
  document.addEventListener('play', function (e) {
    var v = e.target;
    if (!v || v.tagName !== 'VIDEO') return;
    if (!consentiu()) return;
    var nome = document.getElementById('depoNome');
    var area = document.getElementById('depoArea');
    window.gtag('event', 'video_depoimento', {
      event_category: 'engajamento',
      event_label: ((nome && nome.textContent) || 'Depoimento').trim().slice(0, 60),
      video_origem: (v.currentSrc || v.src || '').split('/').pop().slice(0, 80),
      video_area: ((area && area.textContent) || '').trim().slice(0, 60)
    });
  }, true);
})();
