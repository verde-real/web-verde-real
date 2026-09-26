// ============================================================
// denuncia.js - Página de detalhe de uma única denúncia (post)
// Reaproveita renderizarPostCard (post-card.js) e o FeedService
// (feed-supabase.js). Não duplica lógica de curtir/salvar/comentar.
// ============================================================
class DenunciaManager {
    constructor() {
        const params = new URLSearchParams(window.location.search);
        this.postId = params.get('id');
        this.focoComentario = params.get('foco') === 'comentario';
        this.user = null;
        this.post = null;
        this.comentarios = [];
        this.init();
    }

    async init() {
        if (typeof auth !== 'undefined' && auth && auth.initPromise) {
            await auth.initPromise;
        }
        this.user = (typeof auth !== 'undefined' && auth.isLogado()) ? auth.getUsuarioLogado() : null;

        if (!this.postId) {
            this.mostrarErro('Denúncia não especificada.');
            return;
        }
        if (typeof feed === 'undefined') {
            this.mostrarErro('Erro ao carregar a denúncia. Tente novamente.');
            return;
        }

        const [post, comentarios] = await Promise.all([
            feed.getPostById(this.postId),
            feed.getComentarios(this.postId),
        ]);

        if (!post) {
            this.mostrarErro('Denúncia não encontrada.');
            return;
        }

        this.post = post;
        this.comentarios = comentarios || [];
        this.renderizar();

        const inputFixo = document.getElementById('denuncia-input-fixo');
        if (inputFixo) inputFixo.style.display = this.user ? 'flex' : 'none';

        if (this.focoComentario) {
            const input = document.getElementById('denuncia-comment-input');
            if (input) setTimeout(() => input.focus(), 300);
        }
    }

    mostrarErro(texto) {
        const container = document.getElementById('denuncia-conteudo');
        if (container) {
            container.innerHTML = `<p style="text-align:center;color:var(--verde-detalhe2);padding:3rem 1rem;">${texto}</p>`;
        }
        const inputFixo = document.getElementById('denuncia-input-fixo');
        if (inputFixo) inputFixo.style.display = 'none';
    }

    renderizarEtapas() {
        if (this.post.status_denuncia === 'rejeitada') return '';

        const etapas = [
            { chave: 'recebida', texto: 'Recebida' },
            { chave: 'em_analise', texto: 'Em análise' },
            { chave: 'resolvida', texto: 'Resolvida' },
        ];
        const indiceAtual = etapas.findIndex(e => e.chave === this.post.status_denuncia);

        return `
            <div class="denuncia-etapas">
                ${etapas.map((etapa, index) => `
                    <div class="denuncia-etapa ${index <= indiceAtual ? 'denuncia-etapa--ativa' : ''}">
                        <span class="denuncia-etapa-bola"></span>
                        <span class="denuncia-etapa-texto">${etapa.texto.toUpperCase()}</span>
                        ${index < etapas.length - 1 ? '<span class="denuncia-etapa-linha"></span>' : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderizarListaComentarios() {
        if (this.comentarios.length === 0) {
            return '<p style="color:#999;font-size:0.85rem;margin:0.5rem 0;">Nenhum comentário ainda. Seja o primeiro a comentar.</p>';
        }
        return this.comentarios.map(c => {
            const avatarHTML = c.usuario_avatar
                ? `<img src="${c.usuario_avatar}" class="comment-avatar" style="object-fit:cover;">`
                : `<div class="comment-avatar">${(c.usuario_nome || '?').charAt(0).toUpperCase()}</div>`;
            return `
                <div class="comment">
                    ${avatarHTML}
                    <div>
                        <strong>${c.usuario_nome}</strong>
                        <span>${c.texto}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderizar() {
        const container = document.getElementById('denuncia-conteudo');
        if (!container) return;

        container.innerHTML = `
            ${renderizarPostCard(this.post, this.user, { ocultarComentarios: true, ocultarAcoesDono: true })}
            ${this.renderizarEtapas()}
            <div class="denuncia-comentarios">
                <h3><i class="fas fa-comments"></i> Comentários (<span id="denuncia-total">${this.comentarios.length}</span>)</h3>
                <div id="denuncia-lista-comentarios">${this.renderizarListaComentarios()}</div>
            </div>
        `;

        this.configurarEventos();
    }

    configurarEventos() {
        const likeBtn = document.querySelector('.post-card .like-btn');
        if (likeBtn) {
            likeBtn.addEventListener('click', async () => {
                if (!this.user) { window.location.href = 'login.html'; return; }
                try {
                    const result = await feed.toggleLike(this.post.id);
                    likeBtn.classList.toggle('active-like', result.curtido);
                    likeBtn.querySelector('i').className = result.curtido ? 'fas fa-heart' : 'far fa-heart';
                    this.post.curtidas = result.total;
                    const likesCount = document.querySelector('.likes-count');
                    if (likesCount) {
                        likesCount.innerHTML = `<i class="fas fa-heart" style="color:var(--dourado);"></i> ${this.post.curtidas || 0} curtidas`;
                    }
                } catch (error) {
                    alert(error.message || 'Erro ao curtir.');
                }
            });
        }

        const saveBtn = document.querySelector('.post-card .save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                if (!this.user) { window.location.href = 'login.html'; return; }
                try {
                    const result = await feed.toggleSave(this.post.id);
                    saveBtn.classList.toggle('active-save', result.salvo);
                    saveBtn.querySelector('i').className = result.salvo ? 'fas fa-bookmark' : 'far fa-bookmark';
                } catch (error) {
                    alert(error.message || 'Erro ao salvar.');
                }
            });
        }

        const commentToggle = document.querySelector('.post-card .comment-toggle');
        if (commentToggle) {
            commentToggle.addEventListener('click', () => {
                document.querySelector('.denuncia-comentarios')?.scrollIntoView({ behavior: 'smooth' });
                document.getElementById('denuncia-comment-input')?.focus();
            });
        }

        const input = document.getElementById('denuncia-comment-input');
        const btnEnviar = document.getElementById('denuncia-comment-enviar');

        const enviar = async () => {
            if (!this.user) { window.location.href = 'login.html'; return; }
            const texto = input.value.trim();
            if (!texto) return;
            btnEnviar.disabled = true;
            try {
                await feed.adicionarComentario(this.post.id, texto);
                this.comentarios = await feed.getComentarios(this.post.id);
                input.value = '';
                document.getElementById('denuncia-lista-comentarios').innerHTML = this.renderizarListaComentarios();
                const total = document.getElementById('denuncia-total');
                if (total) total.textContent = this.comentarios.length;
            } catch (error) {
                console.error('❌ Erro ao comentar:', error);
                alert(error.message || 'Erro ao adicionar comentário.');
            } finally {
                btnEnviar.disabled = false;
            }
        };

        if (btnEnviar) btnEnviar.addEventListener('click', enviar);
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') { e.preventDefault(); enviar(); }
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    (function tentarIniciar() {
        if (typeof auth !== 'undefined' && typeof feed !== 'undefined') {
            window.denunciaManager = new DenunciaManager();
        } else {
            setTimeout(tentarIniciar, 200);
        }
    })();
});