// ============================================================
// post-card.js - Card de publicação reaproveitado no feed
// (feed.js) e na página de detalhe (denuncia.js). Funções puras,
// sem depender de "this" — só de post/usuário/opções recebidos.
// ============================================================

function renderizarStatusPost(post) {
    const mapa = {
        recebida: { icone: 'fa-arrow-down', texto: 'Recebida' },
        em_analise: { icone: 'fa-magnifying-glass', texto: 'Em análise' },
        resolvida: { icone: 'fa-check', texto: 'Resolvida' },
        rejeitada: { icone: 'fa-xmark', texto: 'Rejeitada' },
    };
    const info = mapa[post.status_denuncia] || mapa['recebida'];

    return `
        <div class="status-tag">
            <span>${info.texto}</span>
            <i class="fas ${info.icone}"></i>
        </div>
    `;
}

function renderizarPostCard(post, usuarioAtual, opcoes) {
    opcoes = opcoes || {};

    const data = new Date(post.data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const isNovo = (Date.now() - new Date(post.data).getTime()) < 3600000;
    const ehMeuPost = usuarioAtual && post.usuario_id === usuarioAtual.id;

    const categorias = {
        'Desmatamento': { icone: 'fa-tree', cor: 'var(--dourado)' },
        'Poluição': { icone: 'fa-smog', cor: 'var(--verde-primario)' },
        'Queimada': { icone: 'fa-fire', cor: '#c62828' },
        'Descarte Irregular': { icone: 'fa-trash-alt', cor: 'var(--verde-secundario)' },
        'Água': { icone: 'fa-tint', cor: 'var(--verde-primario)' },
        'Fauna': { icone: 'fa-paw', cor: 'var(--dourado)' },
        'Outro': { icone: 'fa-info-circle', cor: 'var(--verde-detalhe2)' },
    };
    const catInfo = categorias[post.tipo] || categorias['Outro'];

    const avatarHTML = post.usuario_avatar
        ? `<img src="${post.usuario_avatar}" class="post-avatar" style="object-fit:cover;">`
        : `<div class="post-avatar">${(post.usuario_nome || '?').charAt(0).toUpperCase()}</div>`;

    return `
        <div class="post-card" data-id="${post.id}">
            <div class="post-header">
                <div class="post-user" onclick="event.stopPropagation(); abrirPerfilUsuario('${post.usuario_id}')">
                    ${avatarHTML}
                    <div class="post-user-info">
                        <div class="post-user-name">
                            ${post.usuario_nome}
                            ${post.usuario_username ? `<span class="post-user-username">@${post.usuario_username}</span>` : ''}
                            ${post.temSelo ? '<i class="fas fa-check-circle verified-badge" style="color:var(--verde-primario);"></i>' : ''}
                            ${isNovo ? '<span class="badge" style="background:var(--dourado);color:#fff;font-size:0.6rem;padding:0.1rem 0.5rem;">NOVO</span>' : ''}
                        </div>
                        <div class="post-empresa-info">
                            <span>${data}</span>
                            ${post.empresa_alvo ? `<span onclick="event.stopPropagation(); window.location.href='perfil.html?id=${post.empresa_id}'" style="cursor:pointer;text-decoration:underline;"><i class="fas fa-building"></i> ${post.empresa_alvo}</span>` : ''}
                        </div>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:0.5rem;">
                    <span class="badge" style="border:1px solid ${catInfo.cor};color:${catInfo.cor};">
                        <i class="fas ${catInfo.icone}"></i> ${post.tipo}
                    </span>
                    ${(ehMeuPost && !opcoes.ocultarAcoesDono) ? `
                        <button class="action-btn edit-btn" data-id="${post.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" data-id="${post.id}" title="Excluir">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    ` : ''}
                </div>
            </div>

            <div class="post-content">
                <h3>${post.titulo}</h3>
                <p>${post.descricao}</p>
            </div>

            ${renderizarStatusPost(post)}

            ${post.midia_url ? `<img src="${post.midia_url}" class="post-imagem" alt="Prova anexada">` : ''}

            <div class="likes-count">
                <i class="fas fa-heart" style="color:var(--dourado);"></i> ${post.curtidas || 0} curtidas
                ${post.comentarios_count ? `· ${post.comentarios_count} comentários` : ''}
            </div>

            <div class="post-actions">
                <button class="action-btn like-btn ${post.curtido ? 'active-like' : ''}" data-id="${post.id}">
                    <i class="${post.curtido ? 'fas' : 'far'} fa-heart"></i> Curtir
                </button>
                <button class="action-btn comment-toggle" data-id="${post.id}">
                    <i class="far fa-comment"></i> Comentar
                </button>
                <button class="action-btn save-btn ${post.salvo ? 'active-save' : ''}" data-id="${post.id}">
                    <i class="${post.salvo ? 'fas' : 'far'} fa-bookmark"></i> Salvar
                </button>
            </div>

            ${opcoes.ocultarComentarios ? '' : `
                <div class="comments-section" style="display:none;" id="comments-${post.id}">
                    <div id="comentarios-${post.id}">
                        <p style="color:#999;font-size:0.85rem;margin:0.5rem 0;">Carregando comentários...</p>
                    </div>
                    <div class="comment-form">
                        <input type="text" placeholder="Adicione um comentário..." id="comment-input-${post.id}">
                        <button class="add-comment" data-id="${post.id}">Enviar</button>
                    </div>
                </div>
            `}
        </div>
    `;
}

function abrirPerfilUsuario(usuarioId) {
    window.location.href = `perfil.html?id=${usuarioId}`;
}