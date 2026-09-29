// ============================================================
// meu-perfil.js - Perfil próprio (área logada do usuário)
// Reaproveita: auth-supabase.js, feed-supabase.js (getPublicacoesByUsuario,
// toggleLike, deletarPublicacao, enviarMidia, atualizarAvatar), post-card.js
// (renderizarPostCard) e VerdeRealCore.criarServicoSeguidores (contagem).
// Layout reorganizado (saudação + estatísticas + CTA + conta), mas usando
// só classes já existentes no site: welcome-banner, sidebar-card, badge,
// btn-acao/btn--escuro, mensagem-feed — sem canto arredondado nem sombra
// nova, pra manter a identidade visual atual do Verde Real.
// ============================================================

let postsCache = [];

function primeiroNome(nomeCompleto) {
    return (nomeCompleto || '').trim().split(' ')[0] || 'usuário';
}

function nomeExibicaoHTML(usuario) {
    return usuario.username
        ? `<h2 style="margin:0 0 0.15rem;">@${usuario.username}</h2>
           <p style="font-family:'Space Mono',monospace;font-size:0.8rem;color:var(--verde-detalhe2);margin:0 0 0.4rem;">${usuario.nome}</p>`
        : `<h2 style="margin:0 0 0.4rem;">${usuario.nome}</h2>`;
}

function avatarHTML(usuario) {
    return usuario.avatar_url
        ? `<img src="${usuario.avatar_url}" class="post-avatar" style="width:80px;height:80px;object-fit:cover;">`
        : `<div class="post-avatar" style="width:80px;height:80px;font-size:2rem;">${usuario.nome.charAt(0).toUpperCase()}</div>`;
}

function badgeContaHTML(usuario) {
    if (usuario.tipo === 'empresa_selo') {
        return `<span class="badge badge-selo"><i class="fas fa-trophy"></i> Empresa com Selo Verde</span>`;
    }
    if (usuario.tipo === 'empresa') {
        return `<span class="badge badge-info"><i class="fas fa-building"></i> Conta Empresa</span>`;
    }
    return `<span class="badge badge-selo"><i class="fas fa-leaf"></i> Guardião Verde</span>`;
}

function renderizarPerfil(usuario) {
    const container = document.getElementById('meu-perfil-container');

    container.innerHTML = `
        <div class="welcome-banner">
            <div>
                <h2><i class="fas fa-hand-sparkles"></i> Olá, ${primeiroNome(usuario.nome)}! 👋</h2>
                <p>Este é o seu espaço no Verde Real.</p>
            </div>
        </div>

        <div class="sidebar-card perfil-topo">
            <div class="perfil-topo-linha">
                <div id="avatarWrapper" class="perfil-avatar-wrapper" title="Clique para trocar a foto">
                    ${avatarHTML(usuario)}
                    <div class="perfil-avatar-editar"><i class="fas fa-camera"></i></div>
                </div>
                <div class="perfil-topo-info">
                    ${nomeExibicaoHTML(usuario)}
                    <p style="font-size:0.85rem;color:var(--verde-detalhe2);"><i class="fas fa-envelope"></i> ${usuario.email}</p>
                    ${badgeContaHTML(usuario)}
                </div>
            </div>

            <button class="btn-acao btn--escuro" id="btnEditarPerfil" style="margin-top:1.25rem;">
                <i class="fas fa-pen"></i> Editar foto de perfil
            </button>

            <div class="perfil-stats">
                <div class="perfil-stat">
                    <i class="fas fa-file-alt"></i>
                    <strong id="statPosts">0</strong>
                    <span>Publicações</span>
                </div>
                <div class="perfil-stat">
                    <i class="fas fa-heart"></i>
                    <strong id="statCurtidas">0</strong>
                    <span>Curtidas</span>
                </div>
                <div class="perfil-stat">
                    <i class="fas ${usuario.tipo === 'cliente' ? 'fa-building' : 'fa-users'}"></i>
                    <strong id="statTerceira">0</strong>
                    <span>${usuario.tipo === 'cliente' ? 'Empresas seguidas' : 'Seguidores'}</span>
                </div>
            </div>
        </div>

        <div class="sidebar-card perfil-cta">
            <div>
                <h3><i class="fas fa-pen"></i> Compartilhe algo com a comunidade</h3>
                <p>Escreva uma ideia, compartilhe uma foto ou conte sua experiência no Verde Real.</p>
            </div>
            <button class="btn-acao btn--escuro" onclick="window.location.href='publicar.html'">
                <i class="fas fa-plus-circle"></i> Criar publicação
            </button>
        </div>

        <h3 class="perfil-posts-titulo"><i class="fas fa-file-alt"></i> Minhas publicações (<span id="totalPosts">0</span>)</h3>
        <div id="postsContainer">
            <p style="color:var(--verde-detalhe2);">Carregando publicações...</p>
        </div>
    `;

    document.getElementById('avatarWrapper').addEventListener('click', abrirSeletorDeArquivo);
    document.getElementById('btnEditarPerfil').addEventListener('click', abrirSeletorDeArquivo);
}

function abrirSeletorDeArquivo() {
    document.getElementById('inputAvatar').click();
}

function renderizarPosts(posts, usuario) {
    const container = document.getElementById('postsContainer');
    document.getElementById('totalPosts').textContent = posts.length;
    document.getElementById('statPosts').textContent = posts.length;

    const totalCurtidas = posts.reduce((soma, p) => soma + (p.curtidas || 0), 0);
    document.getElementById('statCurtidas').textContent = totalCurtidas;

    if (posts.length === 0) {
        container.innerHTML = `
            <div class="mensagem-feed">
                <i class="fas fa-seedling"></i>
                <h3>Você ainda não fez nenhuma publicação.</h3>
                <p>Que tal compartilhar algo com a comunidade? Suas ideias também fazem a diferença!</p>
                <button onclick="window.location.href='publicar.html'" class="btn-acao btn--escuro">
                    <i class="fas fa-plus-circle"></i> Criar publicação
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = posts
        .map((p) => renderizarPostCard(p, usuario, { ocultarComentarios: true }))
        .join('');

    // Editar legenda, comentar e salvar não fazem parte desta página ainda
    // (fora do escopo pedido: ver, trocar foto e excluir). Ficam só curtir e excluir.
    container.querySelectorAll('.edit-btn, .save-btn, .comment-toggle').forEach((el) => el.remove());

    container.querySelectorAll('.delete-btn').forEach((btn) => {
        btn.addEventListener('click', async function () {
            const id = this.dataset.id;
            if (!confirm('Tem certeza que deseja excluir esta publicação?')) return;

            this.disabled = true;
            try {
                await window.feed.deletarPublicacao(id);
                postsCache = postsCache.filter((p) => p.id !== id);
                renderizarPosts(postsCache, usuario);
            } catch (error) {
                console.error(error);
                alert(error.message || 'Erro ao excluir publicação.');
                this.disabled = false;
            }
        });
    });

    container.querySelectorAll('.like-btn').forEach((btn) => {
        btn.addEventListener('click', async function (e) {
            e.stopPropagation();
            const id = this.dataset.id;
            try {
                const resultado = await window.feed.toggleLike(id);
                this.classList.toggle('active-like', resultado.curtido);
                this.innerHTML = `<i class="${resultado.curtido ? 'fas' : 'far'} fa-heart"></i> Curtir`;
                const post = postsCache.find((p) => p.id === id);
                if (post) post.curtido = resultado.curtido;
                document.getElementById('statCurtidas').textContent =
                    postsCache.reduce((soma, p) => soma + (p.curtidas || 0), 0);
            } catch (error) {
                console.error(error);
                alert(error.message || 'Erro ao curtir.');
            }
        });
    });

    container.querySelectorAll('.post-card').forEach((card) => {
        card.addEventListener('click', function (e) {
            if (e.target.closest('.post-user, .action-btn, a, button')) return;
            window.location.href = `denuncia.html?id=${card.dataset.id}`;
        });
    });
}

async function carregarTerceiraEstatistica(usuario) {
    try {
        const servico = VerdeRealCore.criarServicoSeguidores(window.supabase);
        const valor = usuario.tipo === 'cliente'
            ? await servico.contarSeguindo(usuario.id)
            : await servico.contarSeguidores(usuario.id);
        const el = document.getElementById('statTerceira');
        if (el) el.textContent = valor;
    } catch (error) {
        console.error('❌ Erro ao carregar contagem de seguidores/seguindo:', error);
    }
}

async function trocarAvatar(file) {
    const usuario = window.auth.getUsuarioLogado();
    if (!usuario || !file) return;

    const avatarWrapper = document.getElementById('avatarWrapper');
    const original = avatarWrapper.innerHTML;
    avatarWrapper.innerHTML = '<div class="post-avatar" style="width:80px;height:80px;"><i class="fas fa-spinner fa-spin"></i></div>';

    try {
        const url = await window.feed.enviarMidia(usuario.id, file);
        await window.feed.atualizarAvatar(usuario.id, url);

        usuario.avatar_url = url;
        localStorage.setItem('verdeRealUsuario', JSON.stringify(usuario));

        if (window.atualizarAvatarHeader) window.atualizarAvatarHeader(usuario);

        renderizarPerfil(usuario);
        renderizarPosts(postsCache, usuario);
        carregarTerceiraEstatistica(usuario);
    } catch (error) {
        console.error(error);
        alert(error.message || 'Erro ao trocar a foto.');
        avatarWrapper.innerHTML = original;
    }
}

function configurarSair() {
    const btn = document.getElementById('btnSairConta');
    if (!btn) return;
    btn.addEventListener('click', function () {
        if (typeof auth !== 'undefined' && auth.logout) {
            auth.logout();
        }
        window.location.href = 'login.html';
    });
}

async function iniciar() {
    while (!window.auth) {
        await new Promise((r) => setTimeout(r, 100));
    }
    if (window.auth.initPromise) await window.auth.initPromise;

    if (!window.auth.isLogado()) {
        window.location.href = 'login.html';
        return;
    }

    const usuario = window.auth.getUsuarioLogado();
    renderizarPerfil(usuario);
    configurarSair();

    while (!window.feed) {
        await new Promise((r) => setTimeout(r, 100));
    }

    postsCache = await window.feed.getPublicacoesByUsuario(usuario.id);
    renderizarPosts(postsCache, usuario);
    carregarTerceiraEstatistica(usuario);

    document.getElementById('inputAvatar').addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) trocarAvatar(file);
        e.target.value = '';
    });
}

document.addEventListener('DOMContentLoaded', iniciar);
