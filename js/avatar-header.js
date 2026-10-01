// ============================================================
// avatar-header.js - Bolinha de perfil no header (SITE)
// Injeta a bolinha com a foto do usuário logado dentro de
// .header-acoes, entre o sino de notificações e o hamburger.
// Depende de: window.auth (auth-supabase.js)
// ============================================================

(function () {
    function conteudoBolinha(usuario) {
        return usuario.avatar_url
            ? `<img src="${usuario.avatar_url}" alt="${usuario.nome}">`
            : `<span>${usuario.nome.charAt(0).toUpperCase()}</span>`;
    }

    function criarBolinha(usuario) {
        const link = document.createElement('a');
        link.href = 'meu-perfil.html';
        link.id = 'avatarHeader';
        link.className = 'avatar-header';
        link.setAttribute('aria-label', 'Meu perfil');
        link.title = usuario.nome;
        link.innerHTML = conteudoBolinha(usuario);
        return link;
    }

    function atualizarBolinha(usuario) {
        const existente = document.getElementById('avatarHeader');
        if (!existente) return;
        existente.title = usuario.nome;
        existente.innerHTML = conteudoBolinha(usuario);
    }

    function lerUsuarioCache() {
        try {
            var bruto = localStorage.getItem('verdeRealUsuario') || sessionStorage.getItem('verdeRealUsuario');
            var u = bruto ? JSON.parse(bruto) : null;
            return u && typeof u.nome === 'string' && u.nome ? u : null;
        } catch (e) {
            return null;
        }
    }

    function remover() {
        var el = document.getElementById('avatarHeader');
        if (el) el.remove();
    }

    function iniciar(usuario) {
        if (!usuario) return;
        if (document.getElementById('avatarHeader')) {
            atualizarBolinha(usuario);
            return;
        }

        const bolinha = criarBolinha(usuario);

        const headerAcoes = document.querySelector('.header-acoes');
        if (headerAcoes) {
            // Páginas com hamburger: bolinha fica no header, antes do ☰
            const toggle = document.getElementById('vrMenuToggle');
            if (toggle) {
                headerAcoes.insertBefore(bolinha, toggle);
            } else {
                headerAcoes.appendChild(bolinha);
            }
            return;
        }

        // Páginas públicas: bolinha entra no menu, depois do sino e antes do "Sair"
        const navLinks = document.querySelector('.nav-links');
        if (!navLinks) return;
        const sino = document.getElementById('sinoNotificacoes');
        const logoutBtn = document.getElementById('logoutBtn');
        if (sino) {
            sino.insertAdjacentElement('afterend', bolinha);
        } else if (logoutBtn) {
            navLinks.insertBefore(bolinha, logoutBtn);
        } else {
            navLinks.appendChild(bolinha);
        }
    }

    // Exposta pra meu-perfil.js poder atualizar a foto sem recarregar a página
    window.atualizarAvatarHeader = atualizarBolinha;

    document.addEventListener('DOMContentLoaded', function () {
        // 1) Instantâneo: usa o usuário guardado no navegador
        const cache = lerUsuarioCache();
        if (cache) iniciar(cache);

        // 2) Confirma com a sessão real (corrige foto/nome ou remove se deslogou)
        let tentativas = 0;
        async function confirmar() {
            if (typeof auth === 'undefined') {
                if (++tentativas < 100) setTimeout(confirmar, 100);
                return;
            }
            if (auth.initPromise) await auth.initPromise;
            if (auth.isLogado() && auth.getUsuarioLogado()) {
                iniciar(auth.getUsuarioLogado());
            } else {
                remover();
            }
        }
        confirmar();
    });
})();

console.log('📦 avatar-header.js carregado!');
