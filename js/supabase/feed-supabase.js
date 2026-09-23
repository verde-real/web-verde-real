// ============================================================
// feed-supabase.js - Feed com Supabase (schema real: posts/curtidas/comentarios)
// ============================================================

class FeedService {
    constructor() {
        this.supabase = window.supabase;
        this.auth = window.auth;
        this.posts = [];
        this.inicializado = false;
        this.init();
    }

    async init() {
        if (!this.supabase) {
            console.error('❌ Supabase não disponível');
            return;
        }
        this.inicializado = true;
        console.log('✅ FeedService inicializado!');
    }

    // ============================================================
    // MAPEAMENTO: schema real (posts) -> formato que o feed.js espera
    // ============================================================
    formatarPostParaUI(post) {
        return {
            id: post.id,
            titulo: post.empresa ? post.empresa.nome : post.categoria,
            descricao: post.conteudo,
            tipo: post.categoria,
            empresa_alvo: post.empresa ? post.empresa.nome : null,
            empresa_id: post.empresaId,
            status_denuncia: post.status,
            midia_url: post.midiaUrl,
            data: post.criadoEm,
            usuario_id: post.autor.id,
            usuario_nome: post.autor.nome,
            usuario_avatar: post.autor.avatarUrl,
            curtidas: post.totalCurtidas,
            comentarios_count: 0, // o core não traz esse count ainda; recarregado ao abrir o post
            curtido: post.curtidoPorMim,
            temSelo: false,
        };
    }

    async carregarPosts(limite = 50, offset = 0, filtros = {}) {
        try {
            const usuario = this.auth && this.auth.isLogado() ? this.auth.getUsuarioLogado() : null;
            const categoria = filtros.tipo && filtros.tipo !== 'all' ? filtros.tipo : null;

            const servico = VerdeRealCore.criarServicoPosts(this.supabase);
            let posts = await servico.buscarPosts(usuario ? usuario.id : null, categoria);

            // Busca por texto e paginação continuam no site, por enquanto (o core ainda não tem)
            if (filtros.busca) {
                const termo = filtros.busca.toLowerCase();
                posts = posts.filter((p) => p.conteudo.toLowerCase().includes(termo));
            }
            posts = posts.slice(offset, offset + limite);

            const enriched = posts.map((post) => this.formatarPostParaUI(post));
            this.posts = enriched;
            return enriched;
        } catch (error) {
            console.error('❌ Erro ao carregar posts:', error);
            return [];
        }
    }

    async getPostById(id) {
        try {
            const usuario = this.auth && this.auth.isLogado() ? this.auth.getUsuarioLogado() : null;
            const post = await VerdeRealCore.criarServicoPosts(this.supabase).buscarPostPorId(id, usuario ? usuario.id : null);
            return post ? this.formatarPostParaUI(post) : null;
        } catch (error) {
            console.error('❌ Erro ao buscar post:', error);
            return null;
        }
    }

    // ============================================================
    // CRIAR / EDITAR / EXCLUIR
    // ============================================================
    async criarPublicacao(titulo, descricao, tipo = 'Outro', empresaAlvo = null, midiaUrl = null) {
        if (!this.auth || !this.auth.isLogado()) {
            throw new Error('Você precisa estar logado para publicar.');
        }
        if (!descricao) {
            throw new Error('Preencha todos os campos obrigatórios.');
        }

        const usuario = this.auth.getUsuarioLogado();
        const servico = VerdeRealCore.criarServicoPosts(this.supabase);

        let empresaId = null;
        if (empresaAlvo) {
            const encontradas = await servico.buscarEmpresas(empresaAlvo);
            if (encontradas.length > 0) empresaId = encontradas[0].id;
        }

        try {
            const postCriado = await servico.criarPost({
                autorId: usuario.id,
                conteudo: descricao.trim(),
                categoria: tipo || 'Outro',
                empresaId,
                midiaUrl,
                tipoMidia: midiaUrl ? 'imagem' : null,
            });

            const post = this.formatarPostParaUI(postCriado);
            this.posts.unshift(post);
            console.log('✅ Publicação criada!');
            return post;
        } catch (error) {
            console.error('❌ Erro ao criar publicação:', error);
            throw error;
        }
    }

    async atualizarPublicacao(id, dados) {
        if (!this.auth || !this.auth.isLogado()) throw new Error('Você precisa estar logado.');

        try {
            const patch = {};
            if (dados.descricao !== undefined) patch.conteudo = dados.descricao;

            const { data, error } = await this.supabase
                .from('posts')
                .update(patch)
                .eq('id', id)
                .select(`*, autor:profiles!posts_autor_id_fkey(*), empresa:profiles!posts_empresa_id_fkey(*)`)
                .single();

            if (error) throw new Error('Erro ao atualizar publicação: ' + error.message);

            const post = this.mapearPost(data, new Set());
            const index = this.posts.findIndex((p) => p.id === id);
            if (index !== -1) this.posts[index] = post;

            console.log('✅ Publicação atualizada!');
            return post;
        } catch (error) {
            console.error('❌ Erro ao atualizar publicação:', error);
            throw error;
        }
    }

    async deletarPublicacao(id) {
        if (!this.auth || !this.auth.isLogado()) throw new Error('Você precisa estar logado.');

        try {
            const { error } = await this.supabase.from('posts').delete().eq('id', id);
            if (error) throw new Error('Erro ao deletar publicação: ' + error.message);

            this.posts = this.posts.filter((p) => p.id !== id);
            console.log('✅ Publicação deletada!');
            return { success: true };
        } catch (error) {
            console.error('❌ Erro ao deletar publicação:', error);
            throw error;
        }
    }

    // ============================================================
    // CURTIDAS
    // ============================================================
    async toggleLike(postId) {
        if (!this.auth || !this.auth.isLogado()) throw new Error('Faça login para curtir.');
        const usuario = this.auth.getUsuarioLogado();
        const servico = VerdeRealCore.criarServicoCurtidas(this.supabase);

        const post = this.posts.find((p) => p.id === postId);
        const curtidoAtualmente = post ? !!post.curtido : await servico.verificarCurtida(usuario.id, postId);

        try {
            await servico.alternarCurtida(usuario.id, postId, curtidoAtualmente);
            if (post) {
                post.curtido = !curtidoAtualmente;
                post.curtidas = Math.max(0, (post.curtidas || 0) + (curtidoAtualmente ? -1 : 1));
            }
            return { curtido: !curtidoAtualmente, total: post ? post.curtidas : 0 };
        } catch (error) {
            console.error('❌ Erro ao curtir:', error);
            throw error;
        }
    }

    async verificarCurtida(postId, usuarioId = null) {
        if (!this.auth || !this.auth.isLogado()) return false;
        const uid = usuarioId || this.auth.getUsuarioLogado().id;
        return VerdeRealCore.criarServicoCurtidas(this.supabase).verificarCurtida(uid, postId);
    }

    // ============================================================
    // COMENTÁRIOS
    // ============================================================
    async adicionarComentario(postId, texto) {
        if (!this.auth || !this.auth.isLogado()) throw new Error('Faça login para comentar.');
        const usuario = this.auth.getUsuarioLogado();
        const servico = VerdeRealCore.criarServicoComentarios(this.supabase);

        try {
            const comentario = await servico.criarComentario(postId, usuario.id, texto);

            const post = this.posts.find((p) => p.id === postId);
            if (post) post.comentarios_count = (post.comentarios_count || 0) + 1;

            console.log('✅ Comentário adicionado!');
            return {
                id: comentario.id,
                texto: comentario.conteudo,
                usuario_nome: comentario.autor.nome,
                usuario_avatar: comentario.autor.avatarUrl,
                data: comentario.criadoEm,
            };
        } catch (error) {
            console.error('❌ Erro ao adicionar comentário:', error);
            throw error;
        }
    }

    async getComentarios(postId) {
        try {
            const comentarios = await VerdeRealCore.criarServicoComentarios(this.supabase).buscarComentarios(postId);
            return comentarios.map((c) => ({
                id: c.id,
                texto: c.conteudo,
                usuario_nome: c.autor.nome,
                usuario_avatar: c.autor.avatarUrl,
                data: c.criadoEm,
            }));
        } catch (error) {
            console.error('❌ Erro ao buscar comentários:', error);
            return [];
        }
    }

    async deletarComentario(id) {
        if (!this.auth || !this.auth.isLogado()) throw new Error('Você precisa estar logado.');
        try {
            const { error } = await this.supabase.from('comentarios').delete().eq('id', id);
            if (error) throw new Error('Erro ao deletar comentário: ' + error.message);
            console.log('✅ Comentário deletado!');
            return { success: true };
        } catch (error) {
            console.error('❌ Erro ao deletar comentário:', error);
            throw error;
        }
    }

    // ============================================================
    // RANKING (mesma "view" que o app usa — ranking de guardiões)
    // ============================================================
    async getRanking(limite = 5) {
        try {
            const ranking = await VerdeRealCore.criarServicoRanking(this.supabase).buscarRanking(limite);
            return ranking.map((r) => ({ nome: r.nome, pontos: r.totalDenuncias }));
        } catch (error) {
            console.error('❌ Erro ao calcular ranking:', error);
            return [];
        }
    }

    async listarEmpresas() {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('id, nome')
                .eq('tipo', 'empresa')
                .order('nome');
            if (error) throw new Error(error.message);
            return data || [];
        } catch (error) {
            console.error('❌ Erro ao listar empresas:', error);
            return [];
        }
    }

    async enviarMidia(usuarioId, file) {
        try {
            const extensao = file.name.split('.').pop() || 'jpg';
            const caminho = `${usuarioId}/${Date.now()}.${extensao}`;
            const { error } = await this.supabase.storage.from('midias').upload(caminho, file, {
                contentType: file.type,
                upsert: false,
            });
            if (error) throw new Error(error.message);
            const { data } = this.supabase.storage.from('midias').getPublicUrl(caminho);
            return data.publicUrl;
        } catch (error) {
            console.error('❌ Erro ao enviar mídia:', error);
            throw error;
        }
    }

    // ============================================================
    // ESTATÍSTICAS (usadas na home)
    // ============================================================
    async getEstatisticas() {
        try {
            const { count: totalDenuncias } = await this.supabase
                .from('posts')
                .select('*', { count: 'exact', head: true });

            const { count: totalSelos } = await this.supabase
                .from('selos')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'ativo');

            const { count: totalUsuarios } = await this.supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            const { count: totalCurtidas } = await this.supabase
                .from('curtidas')
                .select('*', { count: 'exact', head: true });

            return {
                totalPublicacoes: totalDenuncias || 0,
                totalDenuncias: totalDenuncias || 0,
                totalSelos: totalSelos || 0,
                totalUsuarios: totalUsuarios || 0,
                totalCurtidas: totalCurtidas || 0,
            };
        } catch (error) {
            console.error('❌ Erro ao buscar estatísticas:', error);
            return { totalPublicacoes: 0, totalDenuncias: 0, totalSelos: 0, totalUsuarios: 0, totalCurtidas: 0 };
        }
    }

    // ============================================================
    // AUXILIARES
    // ============================================================
    async getPublicacoesByUsuario(usuarioId, limite = 20) {
        try {
            const posts = await VerdeRealCore.criarServicoPosts(this.supabase).buscarPostsPorAutor(usuarioId, usuarioId);
            return posts.slice(0, limite).map((post) => this.formatarPostParaUI(post));
        } catch (error) {
            console.error('❌ Erro ao buscar publicações do usuário:', error);
            return [];
        }
    }

    async buscarPublicacoes(termo, limite = 20) {
        if (!termo || termo.length < 2) return [];
        try {
            const { data, error } = await this.supabase
                .from('posts')
                .select(`*, autor:profiles!posts_autor_id_fkey(*), empresa:profiles!posts_empresa_id_fkey(*)`)
                .ilike('conteudo', `%${termo}%`)
                .order('criado_em', { ascending: false })
                .limit(limite);
            if (error) throw new Error('Erro ao buscar publicações: ' + error.message);
            return (data || []).map((linha) => this.mapearPost(linha, new Set()));
        } catch (error) {
            console.error('❌ Erro ao buscar publicações:', error);
            return [];
        }
    }

    getPosts() {
        return this.posts;
    }

    async recarregarPosts(filtros = {}) {
        return await this.carregarPosts(50, 0, filtros);
    }
}

// ============================================================
// INICIALIZAR
// ============================================================
let feedService = null;

document.addEventListener('DOMContentLoaded', function () {
    if (typeof supabase !== 'undefined' && typeof auth !== 'undefined') {
        feedService = new FeedService();
        window.feed = feedService;
        console.log('✅ FeedService disponível globalmente!');
    } else {
        setTimeout(() => {
            if (typeof supabase !== 'undefined' && typeof auth !== 'undefined' && !feedService) {
                feedService = new FeedService();
                window.feed = feedService;
                console.log('✅ FeedService disponível globalmente!');
            }
        }, 1000);
    }
});

console.log('📦 feed-supabase.js carregado!');