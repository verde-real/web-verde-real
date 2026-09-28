// ============================================================
// meu-perfil.js - Perfil próprio (área logada do usuário)
// Reaproveita: auth-supabase.js, feed-supabase.js (getPublicacoesByUsuario,
// toggleLike, deletarPublicacao, enviarMidia, atualizarAvatar) e
// post-card.js (renderizarPostCard, abrirPerfilUsuario).
// ============================================================

let postsCache = [];

function nomeExibicaoHTML(usuario) {
    return usuario.username
        ? `<h2 style="margin:0.75rem 0 0.25rem;">@${usuario.username}</h2>
           <p style="font-family:'Space Mono',monospace;font-size:0.8rem;color:var(--verde-detalhe2);margin:0 0 0.5rem;">${usuario.nome}</p>`
        : `<h2 style="margin:0.75rem 0 0.5rem;">${usuario.nome}</h2>`;
}

function avatarHTML(usuario) {
    return usuario.avatar_url
        ? `<img src="${usuario.avatar_url}" class="post-avatar" style="width:80px;height:80px;object-fit:cover;">`
        : `<div class="post-avatar" style="width:80px;height:80px;font-size:2rem;">${usuario.nome.charAt(0).toUpperCase()}</div>`;
}

function renderizarPerfil(usuario) {
    const container = document.getElementById('meu-perfil-container');

    container.innerHTML = `
        <div class="sidebar-card" style="text-align:center;">
            <div id="avatarWrapper" style="position:relative;display:inline-block;cursor:pointer;" title="Clique para trocar a foto">
                ${avatarHTML(usuario)}
                <div style="position:absolute;bottom:0;right:0;width:28px;height:28px;border-radius:50%;background:var(--verde-primario);color:#fff;display:flex;align-items:center;justify-content:center;border:2px solid #fff;">
                    <i class="fas fa-camera" style="font-size:0.75rem;"></i>
                </div>
            </div>
            ${nomeExibicaoHTML(usuario)}
            <p style="font-family:'Space Mono',monospace;font-size:0.75rem;color:var(--verde-detalhe2);">${usuario.email}</p>
        </div>

        <h3 style="margin:1.5rem 0 1rem;"><i class="fas fa-pen"></i> Minhas publicações (<span id="totalPosts">0</span>)</h3>
        <div id="postsContainer">
            <p style="color:var(--verde-detalhe2);">Carregando publicações...</p>
        </div>
    `;

    document.getElementById('avatarWrapper').addEventListener('click', function () {
        document.getElementById('inputAvatar').click();
    });
}

function renderizarPosts(posts, usuario) {
    const container = document.getElementById('postsContainer');
    document.getElementById('totalPosts').textContent = posts.length;

    if (posts.length === 0) {
        container.innerHTML = '<p style="color:var(--verde-detalhe2);">Você ainda não fez nenhuma publicação.</p>';
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
            } catch (error) {
                console.error(error);
                alert(error.message || 'Erro ao curtir.');
            }
        });
    });

    // Clicar no card (fora dos botões/avatar) abre o detalhe — mesmo padrão do feed
    container.querySelectorAll('.post-card').forEach((card) => {
        card.addEventListener('click', function (e) {
            if (e.target.closest('.post-user, .action-btn, a, button')) return;
            window.location.href = `denuncia.html?id=${card.dataset.id}`;
        });
    });
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
    } catch (error) {
        console.error(error);
        alert(error.message || 'Erro ao trocar a foto.');
        avatarWrapper.innerHTML = original;
    }
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

    while (!window.feed) {
        await new Promise((r) => setTimeout(r, 100));
    }

    postsCache = await window.feed.getPublicacoesByUsuario(usuario.id);
    renderizarPosts(postsCache, usuario);

    document.getElementById('inputAvatar').addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) trocarAvatar(file);
        e.target.value = '';
    });
}

document.addEventListener('DOMContentLoaded', iniciar);
