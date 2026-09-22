// ============================================================
// notificacoes-supabase.js - agora só conecta o VerdeRealCore
// ao cliente supabase do site. A lógica em si (consultas,
// mapeamento, realtime) vive em verde-real-core.
// ============================================================
(function () {
    function tentarIniciar() {
        if (typeof supabase !== 'undefined' && typeof VerdeRealCore !== 'undefined') {
            window.notificacoesService = VerdeRealCore.criarServicoNotificacoes(supabase);
            console.log('✅ NotificacoesService (core compartilhado) disponível!');
        } else {
            setTimeout(tentarIniciar, 300);
        }
    }
    document.addEventListener('DOMContentLoaded', tentarIniciar);
})();
