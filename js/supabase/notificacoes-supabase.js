// ============================================================
// notificacoes-supabase.js - conecta o VerdeRealCore ao cliente
// supabase do site. A lógica em si vive em verde-real-core.
// ============================================================
(function () {
    function tentarIniciar() {
        if (typeof supabase !== 'undefined' && typeof VerdeRealCore !== 'undefined') {
            window.notificacoesService = VerdeRealCore.criarServicoNotificacoes(supabase);
            window.notificacoesService.inicializado = true; // notificacoes.js espera essa flag
            console.log('✅ NotificacoesService (core compartilhado) disponível!');
        } else {
            setTimeout(tentarIniciar, 300);
        }
    }
    document.addEventListener('DOMContentLoaded', tentarIniciar);
})();