// ============================================================
// solicitacao-selo-supabase.js - conecta o VerdeRealCore ao cliente
// supabase do site para a "Solicitação de Auditoria / Selo Verde Real".
// A lógica de envio, validação e status vive em verde-real-core;
// este arquivo só liga o core ao window.supabase e lê o selo real.
//
// Depende de (nesta ordem): supabase-js, supabase-config.js e o
// core (verde-real-core.global.js). Não depende de selo-supabase.js.
// Este arquivo NÃO altera nada no banco: só leitura.
// ============================================================
(function () {
    'use strict';

    // Colunas que realmente existem na tabela public.selos.
    var COLUNAS_SELO = 'id, nivel, status, certificacoes, metas, observacoes, validade, criado_em, atualizado_em';

    function hojeISO() {
        var d = new Date();
        var mes = String(d.getMonth() + 1).padStart(2, '0');
        var dia = String(d.getDate()).padStart(2, '0');
        return d.getFullYear() + '-' + mes + '-' + dia;
    }

    // "validade" é do tipo date (AAAA-MM-DD). Sem validade = sem prazo definido.
    function seloEstaVigente(selo) {
        if (!selo || selo.status !== 'ativo') return false;
        if (!selo.validade) return true;
        return String(selo.validade).slice(0, 10) >= hojeISO();
    }

    function iniciar() {
        if (typeof window.supabase === 'undefined' || !window.supabase || typeof window.supabase.rpc !== 'function') {
            console.error('❌ solicitacao-selo-supabase: cliente Supabase indisponível (confira a ordem dos scripts).');
            return null;
        }
        if (typeof window.VerdeRealCore === 'undefined' ||
            typeof window.VerdeRealCore.criarServicoSolicitacaoSelo !== 'function') {
            console.error('❌ solicitacao-selo-supabase: VerdeRealCore.criarServicoSolicitacaoSelo não encontrado (core desatualizado ou não carregado).');
            return null;
        }

        var supabase = window.supabase;
        var core = window.VerdeRealCore;
        var servico = core.criarServicoSolicitacaoSelo(supabase);

        // Selos da empresa, do mais recente para o mais antigo.
        async function buscarSelos(empresaId) {
            var resp = await supabase
                .from('selos')
                .select(COLUNAS_SELO)
                .eq('empresa_id', empresaId)
                .order('criado_em', { ascending: false });
            if (resp.error) throw new Error(resp.error.message);
            return resp.data || [];
        }

        // Tudo que a página "Solicitar Selo" precisa para decidir o que mostrar.
        async function obterEstado(empresaId) {
            if (!empresaId) throw new Error('Empresa não identificada.');
            var resultados = await Promise.all([
                buscarSelos(empresaId),
                servico.buscarSolicitacaoAtual(empresaId),
                servico.buscarHistorico(empresaId)
            ]);
            var selos = resultados[0];
            var solicitacaoAtual = resultados[1];
            var historico = resultados[2];

            var seloVigente = selos.find(seloEstaVigente) || null;

            return {
                selos: selos,
                seloVigente: seloVigente,
                temSeloAtivo: !!seloVigente,
                solicitacaoAtual: solicitacaoAtual,
                solicitacaoAberta: !!(solicitacaoAtual && core.solicitacaoEstaAberta(solicitacaoAtual.status)),
                historico: historico
            };
        }

        return {
            servico: servico,
            core: core,
            buscarSelos: buscarSelos,
            seloEstaVigente: seloEstaVigente,
            obterEstado: obterEstado
        };
    }

    window.solicitacaoSelo = iniciar();
    if (window.solicitacaoSelo) {
        console.log('✅ solicitacaoSelo (core compartilhado) disponível!');
    }
})();