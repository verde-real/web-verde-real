// ============================================================
// menu-header.js - Botão hamburger do header (apenas UI)
// Não depende de Supabase, feed, auth ou notificações.
// ============================================================
(function () {
    'use strict';

    var toggle = document.getElementById('vrMenuToggle');
    var painel = document.getElementById('vrMenuPanel');
    if (!toggle || !painel) return;

    var icone = toggle.querySelector('i');

    function estaAberto() {
        return painel.classList.contains('vr-menu--aberto');
    }

    function definir(aberto) {
        painel.classList.toggle('vr-menu--aberto', aberto);
        toggle.setAttribute('aria-expanded', String(aberto));
        toggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
        if (icone) {
            icone.classList.toggle('fa-bars', !aberto);
            icone.classList.toggle('fa-times', aberto);
        }
    }

    // Clique no botão: abre/fecha
    toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        definir(!estaAberto());
    });

    // Clique fora: fecha
    document.addEventListener('click', function (e) {
        if (estaAberto() && !painel.contains(e.target) && !toggle.contains(e.target)) {
            definir(false);
        }
    });

    // Esc: fecha e devolve o foco ao botão
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && estaAberto()) {
            definir(false);
            toggle.focus();
        }
    });

    // Clique em um link do menu: fecha o painel
    painel.addEventListener('click', function (e) {
        if (e.target.closest('a')) definir(false);
    });
})();