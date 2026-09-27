// ============================================================
// publicar.js - Controlador da página de CRIAR denúncia
// (html/publicar.html)
// ============================================================

class PublicarController {
    constructor() {
        this.user = null;
        this.categoriaSelecionada = 'Outro';
        this.empresaSelecionada = null; // { id, nome }
        this.todasEmpresas = [];
        this.arquivoMidia = null; // File escolhido nesta sessão
        this.localizacao = null; // { latitude, longitude }

        this.init();
    }

    async init() {
        if (typeof auth !== 'undefined' && auth && auth.initPromise) {
            await auth.initPromise;
        }

        if (typeof auth === 'undefined' || !auth.isLogado()) {
            window.location.href = 'login.html';
            return;
        }

        this.user = auth.getUsuarioLogado();

        if (typeof feed === 'undefined') {
            alert('Erro ao carregar serviço de publicações. Tente novamente.');
            return;
        }

        this.configurarEventos();
        this.carregarEmpresas();
        this.selecionarCategoria('Outro');
    }

    paginaFeed() {
        return (typeof VerdeRealCore !== 'undefined' && VerdeRealCore.ehEmpresa(this.user))
            ? 'feed-empresa.html'
            : 'feed-cliente.html';
    }

    // ============================================================
    // CARREGAR DADOS
    // ============================================================
    async carregarEmpresas() {
        try {
            this.todasEmpresas = await feed.listarEmpresas();
        } catch (e) {
            this.todasEmpresas = [];
        }
    }

    // ============================================================
    // EVENTOS
    // ============================================================
    configurarEventos() {
        document.getElementById('publicarVoltar').addEventListener('click', () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = this.paginaFeed();
            }
        });

        document.getElementById('publicarCategorias').addEventListener('click', (e) => {
            const chip = e.target.closest('.publicar-chip');
            if (chip) this.selecionarCategoria(chip.dataset.categoria);
        });

        const buscaEmpresa = document.getElementById('publicarEmpresaBusca');
        buscaEmpresa.addEventListener('input', () => {
            this.filtrarEmpresas(buscaEmpresa.value);
        });

        document.getElementById('publicarEmpresaRemover').addEventListener('click', () => {
            this.empresaSelecionada = null;
            document.getElementById('publicarEmpresaEscolhida').style.display = 'none';
            document.getElementById('publicarEmpresaBusca').style.display = 'block';
            document.getElementById('publicarEmpresaBusca').value = '';
        });

        const midiaInput = document.getElementById('publicarMidiaInput');
        midiaInput.addEventListener('change', () => {
            const arquivo = midiaInput.files && midiaInput.files[0];
            if (!arquivo) return;
            this.arquivoMidia = arquivo;
            const tipo = arquivo.type.startsWith('video') ? 'video' : 'imagem';
            this.mostrarPreviewMidia(URL.createObjectURL(arquivo), tipo);
        });

        document.getElementById('publicarMidiaRemover').addEventListener('click', () => {
            this.arquivoMidia = null;
            document.getElementById('publicarMidiaInput').value = '';
            document.getElementById('publicarMidiaPreview').style.display = 'none';
            document.getElementById('publicarAnexarLabel').style.display = 'flex';
        });

        document.getElementById('publicarLocalizacaoToggle').addEventListener('click', () => {
            this.alternarLocalizacao();
        });

        document.getElementById('publicarForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.publicar();
        });
    }

    // ============================================================
    // CATEGORIA
    // ============================================================
    selecionarCategoria(categoria) {
        this.categoriaSelecionada = categoria;
        document.querySelectorAll('.publicar-chip').forEach((chip) => {
            chip.classList.toggle('publicar-chip--ativo', chip.dataset.categoria === categoria);
        });
    }

    // ============================================================
    // EMPRESA
    // ============================================================
    filtrarEmpresas(termo) {
        const resultadosEl = document.getElementById('publicarEmpresaResultados');
        const busca = termo.trim().toLowerCase();

        if (busca.length < 2) {
            resultadosEl.innerHTML = '';
            return;
        }

        const encontradas = this.todasEmpresas
            .filter((e) => e.nome.toLowerCase().includes(busca))
            .slice(0, 8);

        resultadosEl.innerHTML = encontradas.map((e) =>
            `<div class="publicar-empresa-resultado" data-id="${e.id}" data-nome="${e.nome.replace(/"/g, '&quot;')}">${e.nome}</div>`
        ).join('');

        resultadosEl.querySelectorAll('.publicar-empresa-resultado').forEach((el) => {
            el.addEventListener('click', () => {
                this.definirEmpresaEscolhida({ id: el.dataset.id, nome: el.dataset.nome });
                resultadosEl.innerHTML = '';
            });
        });
    }

    definirEmpresaEscolhida(empresa) {
        this.empresaSelecionada = empresa;
        document.getElementById('publicarEmpresaNome').textContent = empresa.nome;
        document.getElementById('publicarEmpresaEscolhida').style.display = 'flex';
        document.getElementById('publicarEmpresaBusca').style.display = 'none';
        document.getElementById('publicarEmpresaResultados').innerHTML = '';
    }

    // ============================================================
    // MÍDIA
    // ============================================================
    mostrarPreviewMidia(url, tipo) {
        const preview = document.getElementById('publicarMidiaPreview');
        const img = document.getElementById('publicarMidiaImg');
        const video = document.getElementById('publicarMidiaVideo');

        if (tipo === 'video') {
            video.src = url;
            video.style.display = 'block';
            img.style.display = 'none';
        } else {
            img.src = url;
            img.style.display = 'block';
            video.style.display = 'none';
        }

        preview.style.display = 'block';
        document.getElementById('publicarAnexarLabel').style.display = 'none';
    }

    // ============================================================
    // LOCALIZAÇÃO
    // ============================================================
    alternarLocalizacao() {
        const btn = document.getElementById('publicarLocalizacaoToggle');

        if (this.localizacao) {
            this.localizacao = null;
            btn.classList.remove('publicar-localizacao--ativa');
            this.atualizarStatusLocalizacao('');
            return;
        }

        if (!navigator.geolocation) {
            this.atualizarStatusLocalizacao('Seu navegador não permite compartilhar localização.');
            return;
        }

        this.atualizarStatusLocalizacao('Obtendo localização...');
        navigator.geolocation.getCurrentPosition(
            (posicao) => {
                this.localizacao = {
                    latitude: posicao.coords.latitude,
                    longitude: posicao.coords.longitude,
                };
                btn.classList.add('publicar-localizacao--ativa');
                this.atualizarStatusLocalizacao('Localização anexada.');
            },
            () => {
                this.atualizarStatusLocalizacao('Não foi possível obter sua localização.');
            }
        );
    }

    atualizarStatusLocalizacao(texto) {
        document.getElementById('publicarLocalizacaoStatus').textContent = texto;
    }

    // ============================================================
    // PUBLICAR
    // ============================================================
    async publicar() {
        const descricao = document.getElementById('publicarDescricao').value.trim();
        if (!descricao) {
            alert('Descreva a denúncia antes de publicar.');
            return;
        }

        const btn = document.getElementById('publicarSubmitBtn');
        const btnTexto = document.getElementById('publicarSubmitTexto');
        const textoOriginal = btnTexto.textContent;
        btn.disabled = true;
        btnTexto.textContent = 'Publicando...';

        try {
            let midiaUrl = null;
            let tipoMidia = null;

            if (this.arquivoMidia) {
                midiaUrl = await feed.enviarMidia(this.user.id, this.arquivoMidia);
                tipoMidia = this.arquivoMidia.type.startsWith('video') ? 'video' : 'imagem';
            }

            await feed.criarPublicacao(
                null,
                descricao,
                this.categoriaSelecionada,
                null,
                midiaUrl,
                {
                    empresaId: this.empresaSelecionada ? this.empresaSelecionada.id : null,
                    tipoMidia,
                    latitude: this.localizacao ? this.localizacao.latitude : null,
                    longitude: this.localizacao ? this.localizacao.longitude : null,
                }
            );

            window.location.href = this.paginaFeed();
        } catch (error) {
            console.error('❌ Erro ao publicar:', error);
            alert(error.message || 'Não foi possível publicar. Tente novamente.');
            btn.disabled = false;
            btnTexto.textContent = textoOriginal;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.publicarController = new PublicarController();
});