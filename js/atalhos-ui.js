// ============================================================
// atalhos-ui.js — atalhos de navegação (apenas UI)
//  1) Link "Feed" no menu, somente para usuário logado
//  2) Botão discreto "voltar ao topo" depois de rolar a página
// Usa o usuário em cache (aparece sem atraso) e confirma com o auth.
// ============================================================
(function () {
    'use strict';

    // ---------- 1) LINK DO FEED (só logado) ----------
    function lerUsuarioCache() {
        try {
            var bruto = localStorage.getItem('verdeRealUsuario') || sessionStorage.getItem('verdeRealUsuario');
            var u = bruto ? JSON.parse(bruto) : null;
            return u && typeof u.nome === 'string' && u.nome ? u : null;
        } catch (e) {
            return null;
        }
    }

    function hrefFeed(usuario) {
        return usuario && (usuario.tipo === 'empresa' || usuario.tipo === 'empresa_selo')
            ? 'feed-empresa.html'
            : 'feed-cliente.html';
    }

    function paginaAtual() {
        return (window.location.pathname.split('/').pop() || '').toLowerCase();
    }

    function inserirLinkFeed(usuario) {
        var nav = document.querySelector('.nav-links');
        if (!nav) return;

        var href = hrefFeed(usuario);
        var link = document.getElementById('linkFeed');

        if (!link) {
            link = document.createElement('a');
            link.id = 'linkFeed';
            link.textContent = 'Feed';

            // Entra antes do sino, da bolinha de perfil ou do botão Entrar/Sair
            var ancora = nav.querySelector('#sinoNotificacoes, #avatarHeader, .btn-login');
            while (ancora && ancora.parentNode !== nav) ancora = ancora.parentNode;
            if (ancora) nav.insertBefore(link, ancora);
            else nav.appendChild(link);
        }

        link.href = href;
        var estouNoFeed = paginaAtual() === href;
        link.classList.toggle('active', estouNoFeed);
        if (estouNoFeed) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    }

    function removerLinkFeed() {
        var link = document.getElementById('linkFeed');
        if (link) link.remove();
    }

    function iniciarLinkFeed() {
        // Quem ainda não escolheu o @ precisa terminar essa etapa primeiro
        if (paginaAtual().indexOf('escolher-username') === 0) return;

        var cache = lerUsuarioCache();
        if (cache) inserirLinkFeed(cache);

        var tentativas = 0;
        (async function confirmar() {
            if (typeof auth === 'undefined' || !auth) {
                if (++tentativas < 100) setTimeout(confirmar, 100);
                return;
            }
            if (auth.initPromise) await auth.initPromise;
            if (auth.isLogado() && auth.getUsuarioLogado()) inserirLinkFeed(auth.getUsuarioLogado());
            else removerLinkFeed();
        })();
    }

    // ---------- 2) BOTÃO VOLTAR AO TOPO ----------
    function iniciarVoltarTopo() {
        if (document.getElementById('vrVoltarTopo')) return;

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'vrVoltarTopo';
        btn.className = 'vr-voltar-topo';
        btn.setAttribute('aria-label', 'Voltar ao topo');
        btn.innerHTML = '<i class="fas fa-chevron-up" aria-hidden="true"></i>';
        document.body.appendChild(btn);

        var LIMITE = 150; // px rolados para o botão aparecer
        var agendado = false;

        function atualizar() {
            agendado = false;
            btn.classList.toggle('vr-voltar-topo--visivel', window.scrollY > LIMITE);
        }

        window.addEventListener('scroll', function () {
            if (!agendado) {
                agendado = true;
                window.requestAnimationFrame(atualizar);
            }
        }, { passive: true });

        btn.addEventListener('click', function () {
            var reduzir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.scrollTo({ top: 0, behavior: reduzir ? 'instant' : 'smooth' });
            btn.blur();
        });

        atualizar();
    }

    function iniciar() {
        iniciarLinkFeed();
        iniciarVoltarTopo();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
    else iniciar();
})();