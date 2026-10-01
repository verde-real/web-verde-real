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

    function iniciar() {
        if (!window.auth || !window.auth.isLogado()) return;
        const usuario = window.auth.getUsuarioLogado();
        if (!usuario) return;

        const headerAcoes = document.querySelector('.header-acoes');
        if (!headerAcoes || document.getElementById('avatarHeader')) return;

        const toggle = document.getElementById('vrMenuToggle');
        const bolinha = criarBolinha(usuario);

        if (toggle) {
            headerAcoes.insertBefore(bolinha, toggle);
        } else {
            headerAcoes.appendChild(bolinha);
        }
    }

    // Exposta pra meu-perfil.js poder atualizar a foto sem recarregar a página
    window.atualizarAvatarHeader = atualizarBolinha;

    document.addEventListener('DOMContentLoaded', function () {
        async function tentarIniciar() {
            const pronto = typeof auth !== 'undefined';
            if (!pronto) {
                setTimeout(tentarIniciar, 500);
                return;
            }
            if (auth.initPromise) {
                await auth.initPromise;
            }
            iniciar();
        }
        setTimeout(tentarIniciar, 700);
    });
})();

console.log('📦 avatar-header.js carregado!');
