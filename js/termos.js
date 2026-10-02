(function () {
    function desenhar(secaoEl, secoes) {
        secoes.forEach(function (s) {
            const h = document.createElement('h3');
            h.id = 'sec-' + s.id;
            h.textContent = s.titulo;
            secaoEl.appendChild(h);
            s.paragrafos.forEach(function (texto) {
                const p = document.createElement('p');
                p.textContent = texto;
                secaoEl.appendChild(p);
            });
        });
    }

    function mostrar() {
        const alvo = window.location.hash === '#privacidade' ? 'privacidade' : 'termos';
        ['termos', 'privacidade'].forEach(function (id) {
            document.getElementById(id).classList.toggle('ativa', id === alvo);
        });
        document.getElementById('abaTermos').classList.toggle('ativa', alvo === 'termos');
        document.getElementById('abaPrivacidade').classList.toggle('ativa', alvo === 'privacidade');
    }

    document.addEventListener('DOMContentLoaded', function () {
        const incompleto = typeof VerdeRealCore === 'undefined'
            || !Array.isArray(VerdeRealCore.TERMOS_DE_USO)
            || !Array.isArray(VerdeRealCore.POLITICA_PRIVACIDADE);
        if (incompleto) {
            document.getElementById('termos').textContent = 'Não foi possível carregar o conteúdo. O arquivo js/vendor/verde-real-core.global.js está ausente ou desatualizado (precisa conter TERMOS_DE_USO).';
            document.getElementById('termos').classList.add('ativa');
            document.getElementById('abaTermos').classList.add('ativa');
            return;
        }
        desenhar(document.getElementById('termos'), VerdeRealCore.TERMOS_DE_USO);
        desenhar(document.getElementById('privacidade'), VerdeRealCore.POLITICA_PRIVACIDADE);
        document.getElementById('termosVersao').textContent =
            'Última atualização: ' + VerdeRealCore.DATA_ATUALIZACAO_TERMOS;
        mostrar();
        window.addEventListener('hashchange', mostrar);
    });
})();