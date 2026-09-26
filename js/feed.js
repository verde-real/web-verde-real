// ============================================================
// feed.js - Controlador do Feed (COM SUPABASE)
// ============================================================

class FeedManager {
    constructor() {
        this.container = document.querySelector('#feed-container');
        this.user = null;
        this.posts = [];
        this.paginaAtual = 1;
        this.postsPorPagina = 5;
        this.filtros = {
            tipo: 'all',
            ordenacao: 'recent',
            busca: ''
        };
        this.init();
    }

    async preencherListaEmpresas() {
        const datalist = document.getElementById('listaEmpresas');
        if (!datalist || typeof feed === 'undefined') return;
        const empresas = await feed.listarEmpresas();
        datalist.innerHTML = empresas.map((e) => `<option value="${e.nome}"></option>`).join('');
    }

    // ============================================================
    // INICIALIZAÇÃO
    // ============================================================
    async init() {
        console.log('📰 Inicializando FeedManager (com Supabase)...');

        // Aguardar a restauração da sessão terminar (AuthService.init()
        // é assíncrono) antes de checar se está logado — sem isso,
        // isLogado() pode responder "false" cedo demais mesmo com o
        // usuário logado de verdade.
        if (typeof auth !== 'undefined' && auth && auth.initPromise) {
            await auth.initPromise;
        }

        // Verificar autenticação
        if (typeof auth === 'undefined' || !auth.isLogado()) {
            this.mostrarMensagem('Faça login para ver o feed', 'login');
            return;
        }

        this.user = auth.getUsuarioLogado();

        // Verificar se o feed service está disponível
        if (typeof feed === 'undefined') {
            console.error('❌ FeedService não disponível!');
            this.mostrarMensagem('Erro ao carregar feed. Tente novamente.', 'error');
            return;
        }

        // Carregar posts do Supabase
        await this.carregarPosts();

        this.preencherListaEmpresas();

        // Renderizar feed
        this.renderizarFeed();

        // Configurar eventos
        this.configurarEventos();

        // Atualizar perfil e ranking
        this.atualizarPerfil();
        this.atualizarRanking();

        console.log('✅ FeedManager inicializado com Supabase!');
    }

    // ============================================================
    // CARREGAR POSTS DO SUPABASE
    // ============================================================
    async carregarPosts() {
        try {
            // Mostrar loading
            this.container.innerHTML = `
                <div class="mensagem-feed">
                    <i class="fas fa-spinner fa-spin"></i>
                    <h3>Carregando publicações...</h3>
                    <p>Aguarde um momento</p>
                </div>
            `;

            // Buscar posts do Supabase via feed service
            const posts = await feed.carregarPosts(50, 0, this.filtros);
            
            if (posts && posts.length > 0) {
                this.posts = posts;
                console.log(`📦 ${posts.length} posts carregados do Supabase!`);
            } else {
                this.posts = [];
                console.log('📦 Nenhum post encontrado no Supabase.');
            }

            // Atualizar ranking e perfil
            this.atualizarRanking();
            this.atualizarPerfil();

        } catch (error) {
            console.error('❌ Erro ao carregar posts:', error);
            this.posts = [];
            this.mostrarMensagem('Erro ao carregar publicações. Tente novamente.', 'error');
        }
    }

    // ============================================================
    // RENDERIZAR FEED
    // ============================================================
    renderizarFeed(opcoes) {
        if (!this.container) return;
        opcoes = opcoes || {};
        const manterAnteriores = !!opcoes.manterAnteriores;

        // Aplicar filtros locais (já que o Supabase já aplicou os filtros)
        let postsFiltrados = this.posts;

        // Filtro por busca (complementar)
        if (this.filtros.busca) {
            const busca = this.filtros.busca.toLowerCase();
            postsFiltrados = postsFiltrados.filter(p =>
                p.titulo?.toLowerCase().includes(busca) ||
                p.descricao?.toLowerCase().includes(busca) ||
                (p.empresa_alvo && p.empresa_alvo.toLowerCase().includes(busca))
            );
        }

        if (postsFiltrados.length === 0) {
            this.container.innerHTML = `
                <div class="mensagem-feed">
                    <i class="fas fa-info-circle"></i>
                    <h3>Nenhuma publicação encontrada</h3>
                    <p>Seja o primeiro a publicar algo!</p>
                    <button onclick="document.getElementById('form-empresa')?.focus()" class="btn-acao btn--escuro" style="margin-top:1rem;">
                        <i class="fas fa-plus-circle"></i> Nova Publicação
                    </button>
                </div>
            `;
            return;
        }

        // Paginação: "fim" é cumulativo (mantém tudo que já apareceu antes)
        const fim = this.paginaAtual * this.postsPorPagina;

        // Remove o bloco do "Carregar mais" atual, para recriá-lo (ou não) no final
        const wrapperBtnAntigo = document.getElementById('btnCarregarMais');
        if (wrapperBtnAntigo && wrapperBtnAntigo.parentElement) {
            wrapperBtnAntigo.parentElement.remove();
        }

        let elementosNovos = null;

        if (manterAnteriores) {
            // Só renderiza a fatia nova (a página que acabou de ser liberada)
            // e ANEXA ao que já está na tela, sem tocar nos posts já carregados.
            const inicio = (this.paginaAtual - 1) * this.postsPorPagina;
            const novosPosts = postsFiltrados.slice(inicio, fim);

            const temp = document.createElement('div');
            temp.innerHTML = novosPosts.map(post => this.renderizarPost(post)).join('');
            elementosNovos = Array.from(temp.children);
            elementosNovos.forEach(no => this.container.appendChild(no));
        } else {
            // Renderização completa (carga inicial, filtro, edição, exclusão etc.)
            const paginados = postsFiltrados.slice(0, fim);
            this.container.innerHTML = paginados.map(post => this.renderizarPost(post)).join('');
        }

        // Botão "Carregar mais" (só se ainda existirem posts não exibidos)
        if (postsFiltrados.length > fim) {
            const divBtn = document.createElement('div');
            divBtn.style.textAlign = 'center';
            divBtn.style.margin = '2rem 0';
            divBtn.innerHTML = `
                <button class="btn-acao btn--vazado" id="btnCarregarMais">
                    <i class="fas fa-chevron-down"></i> Carregar mais
                </button>
            `;
            this.container.appendChild(divBtn);
        }

        // Se foi anexo incremental, só liga os eventos dos posts NOVOS
        // (evita duplicar listeners nos que já estavam na tela).
        this.configurarEventosPost(elementosNovos);
    }

    // ============================================================
    // RENDERIZAR UM POST
    // ============================================================
    renderizarPost(post) {
        return renderizarPostCard(post, this.user);
    }

    // ============================================================
    // CONFIGURAR EVENTOS
    // ============================================================
        configurarEventos() {
        // Filtros
        const filtroTipo = document.getElementById('filtroTipo');
        const ordenacao = document.getElementById('ordenacao');
        const buscaInput = document.getElementById('buscaInput');

        if (filtroTipo) {
            filtroTipo.addEventListener('change', () => this.aplicarFiltrosUI());
        }
        if (ordenacao) {
            ordenacao.addEventListener('change', () => this.aplicarFiltrosUI());
        }
        if (buscaInput) {
            // Debounce: só filtra depois que a pessoa para de digitar por 350ms,
            // e a busca em si não refaz consulta no banco (só filtra o que já
            // está carregado) — resolve o travamento ao digitar.
            let buscaTimeout = null;
            buscaInput.addEventListener('input', () => {
                clearTimeout(buscaTimeout);
                buscaTimeout = setTimeout(() => this.aplicarFiltrosUI(), 350);
            });
        }

        // Botão de publicar
        const publicarBtn = document.getElementById('publicarDenunciaBtn');
        if (publicarBtn) {
            publicarBtn.addEventListener('click', () => this.publicarPost());
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (typeof auth !== 'undefined' && auth.logout) {
                    await auth.logout();
                }
                window.location.href = 'login.html';
            });
        }

        // Carregar mais (mantém os posts já carregados na tela)
        document.addEventListener('click', (e) => {
            if (e.target.closest('#btnCarregarMais')) {
                this.paginaAtual++;
                this.renderizarFeed({ manterAnteriores: true });
            }
        });
    }

    // ============================================================
    // CONFIGURAR EVENTOS DOS POSTS
    // ============================================================
        // escopo: lista opcional de elementos .post-card recém-adicionados.
    // Quando informado, os listeners são ligados SOMENTE nesses elementos
    // (usado no "Carregar mais", para não duplicar eventos nos posts que
    // já estavam na tela). Sem escopo, mantém o comportamento original
    // (documento inteiro), usado na renderização completa do feed.
    configurarEventosPost(escopo) {
        const buscar = (seletor) => {
            if (!escopo) return document.querySelectorAll(seletor);
            const encontrados = [];
            escopo.forEach(el => {
                if (el.matches && el.matches(seletor)) encontrados.push(el);
                encontrados.push(...el.querySelectorAll(seletor));
            });
            return encontrados;
        };

        buscar('.like-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                await this.toggleLike(id);
            });
        });

        buscar('.save-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                await this.toggleSave(id);
            });
        });

        buscar('.comment-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const div = document.getElementById(`comments-${id}`);
                if (div) {
                    const isVisible = div.style.display === 'block';
                    div.style.display = isVisible ? 'none' : 'block';
                    if (!isVisible) {
                        this.carregarComentarios(id);
                    }
                }
            });
        });

        buscar('.add-comment').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const input = document.getElementById(`comment-input-${id}`);
                if (input && input.value.trim()) {
                    await this.adicionarComentario(id, input.value.trim());
                    input.value = '';
                }
            });
        });

        buscar('.comment-form input').forEach(input => {
            input.addEventListener('keydown', async (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const id = input.id.replace('comment-input-', '');
                    const btn = document.querySelector(`.add-comment[data-id="${id}"]`);
                    if (btn) btn.click();
                }
            });
        });

        buscar('.edit-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                await this.editarPost(id);
            });
        });

        buscar('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                await this.excluirPost(id);
            });
        });

        buscar('.post-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.post-user, .action-btn, .comment-form, .comment-ver-todos, a, button')) {
                    return;
                }
                window.location.href = `denuncia.html?id=${card.dataset.id}`;
            });
        });
    }

    // ============================================================
    // AÇÕES DOS POSTS (COM SUPABASE)
    // ============================================================

    // Curtir
    async toggleLike(postId) {
        try {
            if (typeof feed === 'undefined') {
                alert('Erro: FeedService não disponível.');
                return;
            }

            const result = await feed.toggleLike(postId);
            
            // Atualizar visualmente
            const btn = document.querySelector(`.like-btn[data-id="${postId}"]`);
            if (btn) {
                btn.classList.toggle('active-like');
                const icon = btn.querySelector('i');
                icon.className = result.curtido ? 'fas fa-heart' : 'far fa-heart';
            }

            // Atualizar contagem
            const likesCount = document.querySelector(`.post-card[data-id="${postId}"] .likes-count`);
            if (likesCount) {
                const post = this.posts.find(p => p.id === postId);
                if (post) {
                    likesCount.innerHTML = `<i class="fas fa-heart" style="color:var(--dourado);"></i> ${post.curtidas || 0} curtidas${post.comentarios_count ? ` · ${post.comentarios_count} comentários` : ''}`;
                }
            }

            // Atualizar ranking
            this.atualizarRanking();

        } catch (error) {
            console.error('❌ Erro ao curtir:', error);
            alert(error.message || 'Erro ao curtir publicação.');
        }
    }

    
    // Salvar / remover dos salvos
    async toggleSave(postId) {
        try {
            if (typeof feed === 'undefined') {
                alert('Erro: FeedService não disponível.');
                return;
            }

            const result = await feed.toggleSave(postId);

            const btn = document.querySelector(`.save-btn[data-id="${postId}"]`);
            if (btn) {
                btn.classList.toggle('active-save', result.salvo);
                const icon = btn.querySelector('i');
                icon.className = result.salvo ? 'fas fa-bookmark' : 'far fa-bookmark';
            }

            const post = this.posts.find(p => p.id === postId);
            if (post) post.salvo = result.salvo;

        } catch (error) {
            console.error('❌ Erro ao salvar:', error);
            alert(error.message || 'Erro ao salvar publicação.');
        }
    }

    // Adicionar comentário
    async adicionarComentario(postId, texto) {
        try {
            if (typeof feed === 'undefined') {
                alert('Erro: FeedService não disponível.');
                return;
            }

            await feed.adicionarComentario(postId, texto);
            
            // Recarregar comentários
            await this.carregarComentarios(postId);

            // Atualizar contagem
            const post = this.posts.find(p => p.id === postId);
            if (post) {
                post.comentarios_count = (post.comentarios_count || 0) + 1;
            }

            // Atualizar visualmente a contagem
            const likesCount = document.querySelector(`.post-card[data-id="${postId}"] .likes-count`);
            if (likesCount && post) {
                likesCount.innerHTML = `<i class="fas fa-heart" style="color:var(--dourado);"></i> ${post.curtidas || 0} curtidas · ${post.comentarios_count || 0} comentários`;
            }

        } catch (error) {
            console.error('❌ Erro ao comentar:', error);
            alert(error.message || 'Erro ao adicionar comentário.');
        }
    }

    // Carregar comentários
    async carregarComentarios(postId) {
        try {
            if (typeof feed === 'undefined') return;

            const comentarios = await feed.getComentarios(postId);
            const container = document.getElementById(`comentarios-${postId}`);
            
            if (container) {
                if (!comentarios || comentarios.length === 0) {
                    container.innerHTML = '<p style="color:#999;font-size:0.85rem;margin:0.5rem 0;">Nenhum comentário ainda. Seja o primeiro a comentar.</p>';
                } else {
                    const previa = comentarios.slice(-3);
                    container.innerHTML = previa.map(c => {
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
                    }).join('') + `
                        <a href="denuncia.html?id=${postId}" class="comment-ver-todos">
                            Ver ${comentarios.length === 1 ? 'o comentário' : `os ${comentarios.length} comentários`}
                            <i class="fas fa-chevron-right"></i>
                        </a>
                    `;
                }
            }
        } catch (error) {
            console.error('❌ Erro ao carregar comentários:', error);
        }
    }

    // Editar post
    async editarPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        if (post.usuario_id !== this.user?.id) {
            alert('Você só pode editar seus próprios posts.');
            return;
        }

        const novoTitulo = prompt('Editar título:', post.titulo);
        if (novoTitulo !== null && novoTitulo.trim()) {
            post.titulo = novoTitulo.trim();
        }

        const novaDescricao = prompt('Editar descrição:', post.descricao);
        if (novaDescricao !== null && novaDescricao.trim()) {
            post.descricao = novaDescricao.trim();
        }

        try {
            if (typeof feed !== 'undefined') {
                await feed.atualizarPublicacao(postId, {
                    titulo: post.titulo,
                    descricao: post.descricao
                });
            }
            this.renderizarFeed();
        } catch (error) {
            console.error('❌ Erro ao editar:', error);
            alert(error.message || 'Erro ao editar publicação.');
        }
    }

    // Excluir post
    async excluirPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        if (post.usuario_id !== this.user?.id) {
            alert('Você só pode excluir seus próprios posts.');
            return;
        }

        if (!confirm('Tem certeza que deseja excluir esta publicação?')) return;

        try {
            if (typeof feed !== 'undefined') {
                await feed.deletarPublicacao(postId);
            }
            
            this.posts = this.posts.filter(p => p.id !== postId);
            this.renderizarFeed();
            this.atualizarRanking();
            this.atualizarPerfil();
        } catch (error) {
            console.error('❌ Erro ao excluir:', error);
            alert(error.message || 'Erro ao excluir publicação.');
        }
    }

    // ============================================================
    // PUBLICAR POST
    // ============================================================
        async publicarPost() {
        const empresaInput = document.getElementById('form-empresa');
        const descInput = document.getElementById('form-desc');
        const tipoSelect = document.getElementById('tipoPublicacao');
        const imagemInput = document.getElementById('form-imagem');

        const titulo = empresaInput ? empresaInput.value.trim() : '';
        const descricao = descInput ? descInput.value.trim() : '';
        const tipo = tipoSelect ? tipoSelect.value : 'Outro';

        if (!descricao) {
            alert('Descreva a denúncia!');
            return;
        }
        if (!this.user) {
            alert('Faça login para publicar!');
            return;
        }

        const btn = document.getElementById('publicarDenunciaBtn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';
        }

        try {
            if (typeof feed === 'undefined') {
                alert('Erro: FeedService não disponível.');
                return;
            }

            let midiaUrl = null;
            if (imagemInput && imagemInput.files && imagemInput.files[0]) {
                midiaUrl = await feed.enviarMidia(this.user.id, imagemInput.files[0]);
            }

            const novoPost = await feed.criarPublicacao(titulo, descricao, tipo, titulo || null, midiaUrl);

            if (novoPost) {
                if (empresaInput) empresaInput.value = '';
                if (descInput) descInput.value = '';
                if (imagemInput) imagemInput.value = '';

                await this.carregarPosts();
                this.renderizarFeed();
                this.atualizarRanking();
                this.atualizarPerfil();

                alert('✅ Publicação criada com sucesso!');
            }
        } catch (error) {
            console.error('❌ Erro ao publicar:', error);
            alert(error.message || 'Erro ao criar publicação.');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-paper-plane"></i> Publicar';
            }
        }
    }

    // ============================================================
    // FILTROS
    // ============================================================
        async aplicarFiltrosUI() {
        const tipoSelect = document.getElementById('filtroTipo');
        const ordenacaoSelect = document.getElementById('ordenacao');
        const buscaInput = document.getElementById('buscaInput');

        const novoTipo = tipoSelect ? tipoSelect.value : 'all';
        const tipoMudou = novoTipo !== this.filtros.tipo;

        this.filtros.tipo = novoTipo;
        this.filtros.ordenacao = ordenacaoSelect ? ordenacaoSelect.value : 'recent';
        this.filtros.busca = buscaInput ? buscaInput.value.trim().toLowerCase() : '';

        this.paginaAtual = 1;

        // Só busca de novo no Supabase quando a CATEGORIA muda de verdade
        // (é o único filtro que o banco realmente aplica). Busca por texto
        // é sempre local, sobre o que já está carregado — sem ida ao banco.
        if (tipoMudou) {
            await this.carregarPosts();
        }
        this.renderizarFeed();
    }

    // ============================================================
    // RANKING
    // ============================================================
    async atualizarRanking() {
        const container = document.getElementById('ranking-container');
        if (!container) return;

        try {
            if (typeof feed !== 'undefined') {
                const ranking = await feed.getRanking(5);
                
                if (!ranking || ranking.length === 0) {
                    container.innerHTML = '<p style="color:var(--verde-detalhe2);font-size:0.9rem;">Nenhuma empresa no ranking.</p>';
                } else {
                    container.innerHTML = ranking.map(item => `
                        <div class="ranking-item">
                            <span class="empresa-nome">${item.nome}</span>
                            <span class="score positive">${item.pontos} pts</span>
                        </div>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar ranking:', error);
            container.innerHTML = '<p style="color:var(--verde-detalhe2);font-size:0.9rem;">Erro ao carregar ranking.</p>';
        }
    }

    // ============================================================
    // PERFIL
    // ============================================================
    atualizarPerfil() {
        const container = document.getElementById('userStats');
        if (!container) return;

        if (!this.user) {
            container.innerHTML = '<p style="color:var(--verde-detalhe2);font-size:0.9rem;">Faça login para ver seu perfil.</p>';
            return;
        }

        const meusPosts = this.posts.filter(p => p.usuario_id === this.user.id);
        const totalLikes = meusPosts.reduce((acc, p) => acc + (p.curtidas || 0), 0);

        container.innerHTML = `
            <p><strong>${this.user.nome}</strong></p>
            <p><i class="fas fa-envelope"></i> ${this.user.email}</p>
            <p><i class="fas fa-bullhorn"></i> Publicações: ${meusPosts.length}</p>
            <p><i class="fas fa-heart" style="color:var(--dourado);"></i> Curtidas: ${totalLikes}</p>
            <p><i class="fas fa-tag"></i> Tipo: ${this.user.tipo === 'empresa_selo' ? '🏅 Empresa com Selo' : this.user.tipo === 'empresa' ? '🏢 Empresa' : '👤 Cliente'}</p>
            <a href="perfil.html?id=${this.user.id}" class="btn-acao btn--escuro" style="margin-top:0.75rem;display:inline-flex;">
                <i class="fas fa-bookmark"></i> Ver perfil e salvos
            </a>
        `;
    }

    // ============================================================
    // ABRIR PERFIL DO USUÁRIO
    // ============================================================
    abrirPerfil(usuarioId) {
        window.location.href = `perfil.html?id=${usuarioId}`;
    }

    // ============================================================
    // MENSAGENS
    // ============================================================
    mostrarMensagem(texto, tipo = 'info') {
        if (!this.container) return;

        const icons = {
            info: 'fa-info-circle',
            login: 'fa-lock',
            loading: 'fa-spinner fa-spin',
            error: 'fa-exclamation-circle'
        };

        this.container.innerHTML = `
            <div class="mensagem-feed">
                <i class="fas ${icons[tipo] || icons.info}"></i>
                <h3>${tipo === 'login' ? 'Acesso Restrito' : 'Aviso'}</h3>
                <p>${texto}</p>
                ${tipo === 'login' ? `<a href="login.html" class="btn-acao btn--escuro" style="margin-top:1rem;display:inline-flex;">Fazer Login</a>` : ''}
            </div>
        `;
    }
}

// ============================================================
// INICIALIZAR
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('#feed-container')) {
        console.log('📰 Página de feed detectada, iniciando FeedManager...');
        window.feedManager = new FeedManager();
    }
});

