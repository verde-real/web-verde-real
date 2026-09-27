// ============================================================
// escolher-username.js - Controlador da tela obrigatória de @
// (html/escolher-username.html)
// ============================================================

// ============================================================
// escolher-username.js - Controlador da tela obrigatória de @
// (html/escolher-username.html)
// ============================================================

// Página não carrega main-supabase.js (pra não duplicar o botão
// "Sair" do header), então define aqui só o essencial do preloader.
function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('preloader--escondido');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
}

class EscolherUsernameController {
    constructor() {
        this.user = null;
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

        // Já tem @ escolhido: não precisa estar aqui
        if (this.user.username) {
            this.irParaFeed();
            return;
        }

        this.configurarEventos();
    }

    irParaFeed() {
        const destino = (this.user.tipo === 'empresa' || this.user.tipo === 'empresa_selo')
            ? 'feed-empresa.html'
            : 'feed-cliente.html';
        window.location.href = destino;
    }

    configurarEventos() {
        const input = document.getElementById('usernameInput');
        const form = document.getElementById('usernameForm');
        const feedback = document.getElementById('usernameFeedback');

        input.addEventListener('input', () => {
            input.value = input.value.toLowerCase().replace(/[^a-z0-9._]/g, '');
            this.validarEmTempoReal(input.value, feedback);
        });

        document.getElementById('logoutBtnEscolher').addEventListener('click', async (e) => {
            e.preventDefault();
            if (typeof auth !== 'undefined' && auth.logout) await auth.logout();
            window.location.href = 'login.html';
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.enviar(input.value, feedback);
        });
    }

    validarEmTempoReal(valor, feedback) {
        if (!valor) {
            feedback.textContent = '';
            return true;
        }
        const valido = typeof VerdeRealCore !== 'undefined' && VerdeRealCore.usernameValido(valor);
        feedback.textContent = valido ? '' : 'Use de 3 a 24 letras minúsculas, números, ponto ou underscore.';
        feedback.style.color = valido ? 'var(--verde-primario)' : '#c62828';
        return valido;
    }

    async enviar(valorBruto, feedback) {
        const valor = valorBruto.trim().toLowerCase();

        if (typeof VerdeRealCore === 'undefined' || !VerdeRealCore.usernameValido(valor)) {
            feedback.textContent = 'Use de 3 a 24 letras minúsculas, números, ponto ou underscore.';
            feedback.style.color = '#c62828';
            return;
        }

        const btn = document.getElementById('usernameSubmitBtn');
        btn.disabled = true;
        btn.textContent = 'Salvando...';

        try {
            const { data: existente } = await window.supabase
                .from('profiles')
                .select('id')
                .eq('username', valor)
                .maybeSingle();

            if (existente) {
                feedback.textContent = 'Esse @ já está em uso. Tente outro.';
                feedback.style.color = '#c62828';
                return;
            }

            const { error } = await window.supabase
                .from('profiles')
                .update({ username: valor })
                .eq('id', this.user.id);

            if (error) {
                feedback.textContent = error.code === '23505'
                    ? 'Esse @ já está em uso. Tente outro.'
                    : 'Não foi possível salvar. Tente novamente.';
                feedback.style.color = '#c62828';
                return;
            }

            await auth.carregarPerfil(this.user.id);
            this.user = auth.getUsuarioLogado();
            this.irParaFeed();
        } catch (erro) {
            console.error('❌ Erro ao salvar @:', erro);
            feedback.textContent = 'Não foi possível salvar. Tente novamente.';
            feedback.style.color = '#c62828';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Confirmar @';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.escolherUsernameController = new EscolherUsernameController();
});