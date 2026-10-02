// Garante que o core esteja completo. Se o CDN (jsDelivr) entregar uma versão
// antiga em cache, carrega a cópia local, que contém avaliarSenha e os termos.
(function () {
    var ok = typeof VerdeRealCore !== 'undefined'
        && typeof VerdeRealCore.avaliarSenha === 'function'
        && Array.isArray(VerdeRealCore.TERMOS_DE_USO);
    if (!ok) {
        console.warn('[core] CDN desatualizado ou indisponível; usando cópia local.');
        document.write('<script src="../js/vendor/verde-real-core.global.js"><\/script>');
    }
})();