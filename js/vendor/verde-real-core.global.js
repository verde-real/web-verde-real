"use strict";
var VerdeRealCore = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    BUCKET_DOCUMENTOS_SELO: () => BUCKET_DOCUMENTOS_SELO,
    CATEGORIAS: () => CATEGORIAS,
    CORES_CATEGORIA: () => CORES_CATEGORIA,
    DATA_ATUALIZACAO_TERMOS: () => DATA_ATUALIZACAO_TERMOS,
    EMAIL_CONTATO_LEGAL: () => EMAIL_CONTATO_LEGAL,
    EXTENSOES_DOCUMENTO_PERMITIDAS: () => EXTENSOES_DOCUMENTO_PERMITIDAS,
    ErroSolicitacaoSelo: () => ErroSolicitacaoSelo,
    ICONE_FONTAWESOME_POR_TIPO: () => ICONE_FONTAWESOME_POR_TIPO,
    ICONE_IONICONS_POR_TIPO: () => ICONE_IONICONS_POR_TIPO,
    LIMITE_NIVEL_EXPLORADOR: () => LIMITE_NIVEL_EXPLORADOR,
    LIMITE_NIVEL_VIGILANTE_AMBIENTAL: () => LIMITE_NIVEL_VIGILANTE_AMBIENTAL,
    MIMES_DOCUMENTO_PERMITIDOS: () => MIMES_DOCUMENTO_PERMITIDOS,
    MIN_DOCUMENTOS_SOLICITACAO: () => MIN_DOCUMENTOS_SOLICITACAO,
    POLITICA_PRIVACIDADE: () => POLITICA_PRIVACIDADE,
    REGEX_USERNAME: () => REGEX_USERNAME,
    ROTULO_METODO_PAGAMENTO: () => ROTULO_METODO_PAGAMENTO,
    ROTULO_STATUS_SOLICITACAO: () => ROTULO_STATUS_SOLICITACAO,
    ROTULO_TIPO_DOCUMENTO: () => ROTULO_TIPO_DOCUMENTO,
    SENHA_MIN_CARACTERES: () => SENHA_MIN_CARACTERES,
    SENHA_RECOMENDADA_CARACTERES: () => SENHA_RECOMENDADA_CARACTERES,
    STATUS_LABEL: () => STATUS_LABEL,
    STATUS_SOLICITACAO_ABERTOS: () => STATUS_SOLICITACAO_ABERTOS,
    TABELA_DOCUMENTOS_SOLICITACAO: () => TABELA_DOCUMENTOS_SOLICITACAO,
    TABELA_SOLICITACOES_SELO: () => TABELA_SOLICITACOES_SELO,
    TAMANHO_MAX_DOCUMENTO_BYTES: () => TAMANHO_MAX_DOCUMENTO_BYTES,
    TERMOS_DE_USO: () => TERMOS_DE_USO,
    TIPOS_EMPRESA: () => TIPOS_EMPRESA,
    UFS_BRASIL: () => UFS_BRASIL,
    VERSAO_TERMOS: () => VERSAO_TERMOS,
    apenasDigitos: () => apenasDigitos,
    avaliarSenha: () => avaliarSenha,
    calcularNivelUsuario: () => calcularNivelUsuario,
    criarServicoComentarios: () => criarServicoComentarios,
    criarServicoCurtidas: () => criarServicoCurtidas,
    criarServicoNotificacoes: () => criarServicoNotificacoes,
    criarServicoPosts: () => criarServicoPosts,
    criarServicoRanking: () => criarServicoRanking,
    criarServicoSeguidores: () => criarServicoSeguidores,
    criarServicoSolicitacaoSelo: () => criarServicoSolicitacaoSelo,
    ehCliente: () => ehCliente,
    ehEmpresa: () => ehEmpresa,
    formatarCNPJ: () => formatarCNPJ,
    formatarTempoRelativo: () => formatarTempoRelativo,
    mapearDocumentoSolicitacao: () => mapearDocumentoSolicitacao,
    mapearNotificacao: () => mapearNotificacao,
    mapearSolicitacaoSelo: () => mapearSolicitacaoSelo,
    mensagemSenhaInsegura: () => mensagemSenhaInsegura,
    podeAcessarSolicitacaoSelo: () => podeAcessarSolicitacaoSelo,
    precisaEscolherUsername: () => precisaEscolherUsername,
    rotuloConquista: () => rotuloConquista,
    solicitacaoEstaAberta: () => solicitacaoEstaAberta,
    temSeloAtivo: () => temSeloAtivo,
    usernameValido: () => usernameValido,
    validarArquivoDocumento: () => validarArquivoDocumento,
    validarAuditoria: () => validarAuditoria,
    validarCNPJ: () => validarCNPJ,
    validarCadastro: () => validarCadastro,
    validarDadosEmpresa: () => validarDadosEmpresa,
    validarDocumentos: () => validarDocumentos,
    validarPlanoPagamento: () => validarPlanoPagamento,
    validarSolicitacaoSelo: () => validarSolicitacaoSelo
  });

  // src/regras/senha.ts
  var SENHA_MIN_CARACTERES = 8;
  var SENHA_RECOMENDADA_CARACTERES = 12;
  var SENHAS_COMUNS = [
    "12345678",
    "123456789",
    "1234567890",
    "87654321",
    "11111111",
    "00000000",
    "password",
    "password1",
    "qwerty123",
    "qwertyui",
    "abc12345",
    "abcd1234",
    "senha123",
    "senha1234",
    "senha@123",
    "mudar123",
    "admin123",
    "brasil123",
    "iloveyou",
    "letmein1"
  ];
  function normalizar(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  function trechosPessoais(contexto) {
    const trechos = [];
    const adicionar = (t) => {
      if (t.length >= 3) trechos.push(t);
    };
    if (contexto.nome) {
      normalizar(contexto.nome).split(/[^a-z0-9]+/).forEach(adicionar);
    }
    if (contexto.email) {
      const local = normalizar(contexto.email.split("@")[0]);
      local.split(/[^a-z0-9]+/).forEach(adicionar);
      adicionar(local.replace(/[^a-z0-9]/g, ""));
    }
    return trechos;
  }
  function avaliarSenha(senha, contexto = {}) {
    const vazia = senha.length === 0;
    const normalizada = normalizar(senha);
    const temDadosPessoais = trechosPessoais(contexto).some((t) => normalizada.includes(t));
    const ehComum = SENHAS_COMUNS.includes(normalizada) || normalizada.includes("verdereal") || /^(.)\1+$/.test(normalizada);
    const requisitos = [
      {
        id: "tamanho",
        texto: `Pelo menos ${SENHA_MIN_CARACTERES} caracteres`,
        atendido: senha.length >= SENHA_MIN_CARACTERES,
        obrigatorio: true
      },
      { id: "minuscula", texto: "Uma letra min\xFAscula", atendido: /[a-zß-öø-ÿ]/.test(senha), obrigatorio: true },
      { id: "maiuscula", texto: "Uma letra mai\xFAscula", atendido: /[A-ZÀ-ÖØ-Þ]/.test(senha), obrigatorio: true },
      { id: "numero", texto: "Um n\xFAmero", atendido: /[0-9]/.test(senha), obrigatorio: true },
      {
        id: "simbolo",
        texto: "Um s\xEDmbolo (ex.: ! @ # $ %)",
        atendido: /[^A-Za-z0-9À-ÿ\s]/.test(senha),
        obrigatorio: true
      },
      {
        id: "dados-pessoais",
        texto: "N\xE3o conter seu nome ou e-mail",
        atendido: !vazia && !temDadosPessoais,
        obrigatorio: true
      },
      { id: "comum", texto: "N\xE3o ser uma senha muito comum", atendido: !vazia && !ehComum, obrigatorio: true },
      {
        id: "recomendado",
        texto: `Recomendado: ${SENHA_RECOMENDADA_CARACTERES} ou mais caracteres`,
        atendido: senha.length >= SENHA_RECOMENDADA_CARACTERES,
        obrigatorio: false
      }
    ];
    const faltando = requisitos.filter((r) => r.obrigatorio && !r.atendido);
    const valida = !vazia && faltando.length === 0;
    let nivel = 0;
    if (!vazia) {
      if (!valida) nivel = 1;
      else nivel = senha.length >= SENHA_RECOMENDADA_CARACTERES ? 3 : 2;
    }
    const rotulos = ["", "Fraca", "M\xE9dia", "Forte"];
    return { requisitos, nivel, rotulo: rotulos[nivel], valida, faltando };
  }
  function mensagemSenhaInsegura(avaliacao) {
    const itens = avaliacao.faltando.map((r) => r.texto.toLowerCase()).join(", ");
    return `Senha fraca. Falta: ${itens}.`;
  }

  // src/types/usuario.ts
  var TIPOS_EMPRESA = ["empresa", "empresa_selo"];
  var REGEX_USERNAME = /^[a-z0-9][a-z0-9._]{1,22}[a-z0-9]$/;
  function usernameValido(username) {
    if (!username) return false;
    const valor = username.trim().toLowerCase();
    if (valor.includes("..")) return false;
    return REGEX_USERNAME.test(valor);
  }
  function precisaEscolherUsername(usuario) {
    return !!usuario && !usuario.username;
  }
  function ehEmpresa(usuario) {
    return !!usuario && (usuario.tipo === "empresa" || usuario.tipo === "empresa_selo");
  }
  function ehCliente(usuario) {
    return !!usuario && usuario.tipo === "cliente";
  }
  function temSeloAtivo(usuario) {
    return !!usuario && usuario.tipo === "empresa_selo";
  }
  var REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function validarCadastro(dados) {
    const erros = [];
    if (!dados.nome || !dados.nome.trim()) {
      erros.push({ campo: "nome", mensagem: "Informe seu nome." });
    } else if (dados.nome.trim().length < 2) {
      erros.push({ campo: "nome", mensagem: "O nome precisa ter pelo menos 2 caracteres." });
    }
    if (!dados.email || !dados.email.trim()) {
      erros.push({ campo: "email", mensagem: "Informe seu e-mail." });
    } else if (!REGEX_EMAIL.test(dados.email.trim())) {
      erros.push({ campo: "email", mensagem: "Informe um e-mail v\xE1lido." });
    }
    if (!dados.senha) {
      erros.push({ campo: "senha", mensagem: "Informe uma senha." });
    } else {
      const avaliacao = avaliarSenha(dados.senha, { nome: dados.nome, email: dados.email });
      if (!avaliacao.valida) {
        erros.push({ campo: "senha", mensagem: mensagemSenhaInsegura(avaliacao) });
      }
    }
    if (dados.senha !== dados.confirmarSenha) {
      erros.push({ campo: "confirmarSenha", mensagem: "As senhas n\xE3o coincidem." });
    }
    if (dados.tipo !== "cliente" && dados.tipo !== "empresa") {
      erros.push({ campo: "tipo", mensagem: "Selecione o tipo de conta." });
    }
    if (!dados.aceitouTermos) {
      erros.push({ campo: "aceitouTermos", mensagem: "Voc\xEA precisa aceitar os termos de uso." });
    }
    return erros;
  }

  // src/types/nivel.ts
  var LIMITE_NIVEL_EXPLORADOR = 6;
  var LIMITE_NIVEL_VIGILANTE_AMBIENTAL = 12;
  function calcularNivelUsuario(totalPosts) {
    const total = totalPosts ?? 0;
    if (total > LIMITE_NIVEL_VIGILANTE_AMBIENTAL) return "Vigilante Ambiental";
    if (total >= LIMITE_NIVEL_EXPLORADOR) return "Explorador";
    return "Iniciante";
  }

  // src/types/post.ts
  var CATEGORIAS = [
    "Desmatamento",
    "Polui\xE7\xE3o",
    "Queimada",
    "Descarte Irregular",
    "\xC1gua",
    "Fauna",
    "Outro"
  ];
  var CORES_CATEGORIA = {
    Desmatamento: "#8D6E4E",
    Polui\u00E7\u00E3o: "#6B7280",
    Queimada: "#E4572E",
    "Descarte Irregular": "#C9963B",
    \u00C1gua: "#2E86AB",
    Fauna: "#A64AC9",
    Outro: "#2F6B4F"
  };
  var STATUS_LABEL = {
    recebida: "Recebida",
    em_analise: "Em an\xE1lise",
    resolvida: "Resolvida",
    rejeitada: "Rejeitada"
  };
  function rotuloConquista(totalDenuncias) {
    return calcularNivelUsuario(totalDenuncias);
  }

  // src/types/notificacao.ts
  function mapearNotificacao(linha) {
    return {
      id: linha.id,
      tipo: linha.tipo,
      mensagem: linha.mensagem,
      lida: linha.lida,
      postId: linha.post_id,
      empresaId: linha.empresa_id,
      atorId: linha.ator_id,
      criadoEm: linha.criado_em
    };
  }
  var ICONE_FONTAWESOME_POR_TIPO = {
    curtida: "fa-heart",
    comentario: "fa-comment",
    status_denuncia: "fa-flag",
    selo_empresa: "fa-award",
    seguidor: "fa-user-plus"
  };
  var ICONE_IONICONS_POR_TIPO = {
    curtida: "heart",
    comentario: "chatbubble",
    status_denuncia: "flag",
    selo_empresa: "ribbon",
    seguidor: "person-add"
  };
  function formatarTempoRelativo(criadoEm) {
    const diffMs = Date.now() - new Date(criadoEm).getTime();
    const minutos = Math.floor(diffMs / 6e4);
    if (minutos < 1) return "agora";
    if (minutos < 60) return `${minutos}min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `${horas}h`;
    const dias = Math.floor(horas / 24);
    return `${dias}d`;
  }

  // src/types/solicitacao-selo.ts
  var ROTULO_STATUS_SOLICITACAO = {
    enviada: "Solicita\xE7\xE3o enviada",
    em_analise: "Em an\xE1lise",
    auditoria_agendada: "Auditoria agendada",
    aguardando_informacoes: "Aguardando informa\xE7\xF5es",
    aprovada: "Aprovada",
    reprovada: "Reprovada",
    cancelada: "Cancelada"
  };
  var STATUS_SOLICITACAO_ABERTOS = [
    "enviada",
    "em_analise",
    "auditoria_agendada",
    "aguardando_informacoes"
  ];
  function solicitacaoEstaAberta(status) {
    return STATUS_SOLICITACAO_ABERTOS.includes(status);
  }
  var ROTULO_METODO_PAGAMENTO = {
    cartao: "Cart\xE3o",
    pix: "Pix",
    boleto: "Boleto"
  };
  var ROTULO_TIPO_DOCUMENTO = {
    certificacao_ambiental: "Certifica\xE7\xE3o ambiental",
    licenca: "Licen\xE7a",
    contrato: "Contrato relevante",
    comprovacao_metas: "Comprova\xE7\xE3o de metas ambientais",
    outro: "Outro documento"
  };
  var MIMES_DOCUMENTO_PERMITIDOS = ["application/pdf", "image/jpeg", "image/png"];
  var EXTENSOES_DOCUMENTO_PERMITIDAS = ["pdf", "jpg", "jpeg", "png"];
  var TAMANHO_MAX_DOCUMENTO_BYTES = 10 * 1024 * 1024;
  var MIN_DOCUMENTOS_SOLICITACAO = 1;
  function podeAcessarSolicitacaoSelo(usuario) {
    return ehEmpresa(usuario);
  }
  var REGEX_EMAIL2 = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var UFS_BRASIL = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO"
  ];
  function apenasDigitos(valor) {
    return (valor ?? "").replace(/\D/g, "");
  }
  function validarCNPJ(cnpj) {
    const d = apenasDigitos(cnpj);
    if (d.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(d)) return false;
    const calcularDigito = (base) => {
      let peso = base.length - 7;
      let soma = 0;
      for (let i = 0; i < base.length; i++) {
        soma += parseInt(base.charAt(i), 10) * peso--;
        if (peso < 2) peso = 9;
      }
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };
    const d1 = calcularDigito(d.substring(0, 12));
    if (d1 !== parseInt(d.charAt(12), 10)) return false;
    const d2 = calcularDigito(d.substring(0, 13));
    return d2 === parseInt(d.charAt(13), 10);
  }
  function formatarCNPJ(cnpj) {
    const d = apenasDigitos(cnpj).slice(0, 14);
    return d.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
  }
  function dataHojeISO() {
    const agora = /* @__PURE__ */ new Date();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");
    return `${agora.getFullYear()}-${mes}-${dia}`;
  }
  function dataISOValida(valor) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
    if (!m) return false;
    const ano = Number(m[1]);
    const mes = Number(m[2]);
    const dia = Number(m[3]);
    const d = new Date(ano, mes - 1, dia);
    return d.getFullYear() === ano && d.getMonth() === mes - 1 && d.getDate() === dia;
  }
  function vazio(valor) {
    return !valor || !valor.trim();
  }
  function validarDadosEmpresa(dados) {
    const erros = [];
    if (vazio(dados.cnpj)) erros.push({ campo: "cnpj", mensagem: "Informe o CNPJ." });
    else if (!validarCNPJ(dados.cnpj)) erros.push({ campo: "cnpj", mensagem: "Informe um CNPJ v\xE1lido." });
    if (vazio(dados.razaoSocial)) erros.push({ campo: "razaoSocial", mensagem: "Informe a raz\xE3o social." });
    if (vazio(dados.nomeFantasia)) erros.push({ campo: "nomeFantasia", mensagem: "Informe o nome fantasia." });
    if (vazio(dados.email)) erros.push({ campo: "email", mensagem: "Informe o e-mail empresarial." });
    else if (!REGEX_EMAIL2.test(dados.email.trim())) erros.push({ campo: "email", mensagem: "Informe um e-mail v\xE1lido." });
    const tel = apenasDigitos(dados.telefone);
    if (!tel) erros.push({ campo: "telefone", mensagem: "Informe o telefone empresarial." });
    else if (tel.length < 10 || tel.length > 11) erros.push({ campo: "telefone", mensagem: "Informe um telefone v\xE1lido com DDD." });
    const cep = apenasDigitos(dados.cep);
    if (!cep) erros.push({ campo: "cep", mensagem: "Informe o CEP." });
    else if (cep.length !== 8) erros.push({ campo: "cep", mensagem: "Informe um CEP v\xE1lido." });
    if (vazio(dados.endereco)) erros.push({ campo: "endereco", mensagem: "Informe o endere\xE7o." });
    if (vazio(dados.cidade)) erros.push({ campo: "cidade", mensagem: "Informe a cidade." });
    if (vazio(dados.estado)) erros.push({ campo: "estado", mensagem: "Informe o estado." });
    else if (!UFS_BRASIL.includes(dados.estado.trim().toUpperCase())) erros.push({ campo: "estado", mensagem: "Informe uma sigla de estado v\xE1lida (ex.: SP)." });
    if (vazio(dados.responsavelNome)) erros.push({ campo: "responsavelNome", mensagem: "Informe o respons\xE1vel pela solicita\xE7\xE3o." });
    if (vazio(dados.responsavelCargo)) erros.push({ campo: "responsavelCargo", mensagem: "Informe o cargo ou fun\xE7\xE3o do respons\xE1vel." });
    return erros;
  }
  function validarArquivoDocumento(arquivo) {
    const erros = [];
    const extensao = (arquivo.nomeArquivo.split(".").pop() ?? "").toLowerCase();
    if (!MIMES_DOCUMENTO_PERMITIDOS.includes(arquivo.mimeType) || !EXTENSOES_DOCUMENTO_PERMITIDAS.includes(extensao)) {
      erros.push({ campo: "documentos", mensagem: `"${arquivo.nomeArquivo}": envie apenas PDF, JPG ou PNG.` });
    }
    if (arquivo.tamanhoBytes <= 0) {
      erros.push({ campo: "documentos", mensagem: `"${arquivo.nomeArquivo}": o arquivo est\xE1 vazio.` });
    } else if (arquivo.tamanhoBytes > TAMANHO_MAX_DOCUMENTO_BYTES) {
      const limiteMb = Math.round(TAMANHO_MAX_DOCUMENTO_BYTES / (1024 * 1024));
      erros.push({ campo: "documentos", mensagem: `"${arquivo.nomeArquivo}": o arquivo passa do limite de ${limiteMb} MB.` });
    }
    return erros;
  }
  function validarDocumentos(documentos) {
    if (!documentos || documentos.length < MIN_DOCUMENTOS_SOLICITACAO) {
      return [{ campo: "documentos", mensagem: "Envie pelo menos um documento para a auditoria." }];
    }
    return documentos.flatMap(validarArquivoDocumento);
  }
  function validarAuditoria(dados) {
    const erros = [];
    if (vazio(dados.dataAuditoria)) {
      erros.push({ campo: "dataAuditoria", mensagem: "Escolha a data da auditoria." });
    } else if (!dataISOValida(dados.dataAuditoria)) {
      erros.push({ campo: "dataAuditoria", mensagem: "Data inv\xE1lida." });
    } else if (dados.dataAuditoria < dataHojeISO()) {
      erros.push({ campo: "dataAuditoria", mensagem: "A data da auditoria n\xE3o pode ser anterior a hoje." });
    }
    if (vazio(dados.localAuditoria)) {
      erros.push({ campo: "localAuditoria", mensagem: "Informe o local da auditoria." });
    }
    const metas = dados.metas ?? [];
    if (metas.length === 0) {
      erros.push({ campo: "metas", mensagem: "Informe pelo menos uma meta de sustentabilidade." });
    } else if (metas.some((m) => vazio(m.descricao))) {
      erros.push({ campo: "metas", mensagem: "Toda meta precisa ter uma descri\xE7\xE3o." });
    }
    return erros;
  }
  function validarPlanoPagamento(dados) {
    const erros = [];
    if (vazio(dados.plano)) erros.push({ campo: "plano", mensagem: "Selecione um plano." });
    if (!dados.metodoPagamento || !(dados.metodoPagamento in ROTULO_METODO_PAGAMENTO)) {
      erros.push({ campo: "metodoPagamento", mensagem: "Selecione o m\xE9todo de pagamento." });
    }
    return erros;
  }
  function validarSolicitacaoSelo(dados) {
    return [
      ...validarDadosEmpresa(dados.empresa),
      ...validarDocumentos(dados.documentos),
      ...validarAuditoria(dados.auditoria),
      ...validarPlanoPagamento(dados.planoPagamento)
    ];
  }

  // src/services/notificacoes.ts
  function criarServicoNotificacoes(supabase) {
    return {
      async buscarNotificacoes(usuarioId, limite = 50) {
        const { data, error } = await supabase.from("notificacoes").select("*").eq("destinatario_id", usuarioId).order("criado_em", { ascending: false }).limit(limite);
        if (error) throw new Error(error.message);
        return (data ?? []).map(mapearNotificacao);
      },
      async contarNaoLidas(usuarioId) {
        const { count, error } = await supabase.from("notificacoes").select("*", { count: "exact", head: true }).eq("destinatario_id", usuarioId).eq("lida", false);
        if (error) throw new Error(error.message);
        return count ?? 0;
      },
      async marcarComoLida(notificacaoId) {
        const { error } = await supabase.from("notificacoes").update({ lida: true }).eq("id", notificacaoId);
        if (error) throw new Error(error.message);
      },
      async marcarTodasComoLidas(usuarioId) {
        const { error } = await supabase.from("notificacoes").update({ lida: true }).eq("destinatario_id", usuarioId).eq("lida", false);
        if (error) throw new Error(error.message);
      },
      async deletarNotificacao(notificacaoId) {
        const { error } = await supabase.from("notificacoes").delete().eq("id", notificacaoId);
        if (error) throw new Error(error.message);
      },
      ouvirNovasNotificacoes(usuarioId, aoReceber) {
        const nomeCanal = `notificacoes:${usuarioId}:${Date.now()}`;
        const canal = supabase.channel(nomeCanal).on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notificacoes",
            filter: `destinatario_id=eq.${usuarioId}`
          },
          (payload) => aoReceber(mapearNotificacao(payload.new))
        ).subscribe();
        return () => {
          supabase.removeChannel(canal);
        };
      }
    };
  }

  // src/services/curtidas.ts
  function criarServicoCurtidas(supabase) {
    return {
      async alternarCurtida(usuarioId, postId, curtidoAtualmente) {
        if (curtidoAtualmente) {
          const { error } = await supabase.from("curtidas").delete().eq("user_id", usuarioId).eq("post_id", postId);
          if (error) throw new Error(error.message);
        } else {
          const { error } = await supabase.from("curtidas").insert({ user_id: usuarioId, post_id: postId });
          if (error) throw new Error(error.message);
        }
      },
      async verificarCurtida(usuarioId, postId) {
        const { data, error } = await supabase.from("curtidas").select("id").eq("post_id", postId).eq("user_id", usuarioId).maybeSingle();
        if (error) return false;
        return !!data;
      }
    };
  }

  // src/services/comentarios.ts
  function mapearComentario(linha) {
    return {
      id: linha.id,
      conteudo: linha.conteudo,
      criadoEm: linha.criado_em,
      autor: { id: linha.autor?.id, nome: linha.autor?.nome ?? "Usu\xE1rio", avatarUrl: linha.autor?.avatar_url ?? null }
    };
  }
  var REGEX_TOKEN_MENCAO = /@([a-zA-Z0-9._]{1,24})/g;
  function extrairUsernamesMencionados(texto) {
    const encontrados = /* @__PURE__ */ new Set();
    let resultado;
    REGEX_TOKEN_MENCAO.lastIndex = 0;
    while ((resultado = REGEX_TOKEN_MENCAO.exec(texto)) !== null) {
      const candidato = resultado[1].toLowerCase();
      if (usernameValido(candidato)) {
        encontrados.add(candidato);
      }
    }
    return Array.from(encontrados);
  }
  async function notificarMencionados(supabase, conteudo, postId, autorId, autorLinha) {
    const usernames = extrairUsernamesMencionados(conteudo);
    if (usernames.length === 0) return;
    const { data: perfis, error: erroBusca } = await supabase.from("profiles").select("id, username").in("username", usernames);
    if (erroBusca) throw new Error(erroBusca.message);
    if (!perfis || perfis.length === 0) return;
    const nomeDoAutor = autorLinha?.username ? `@${autorLinha.username}` : autorLinha?.nome ?? "Algu\xE9m";
    const idsJaProcessados = /* @__PURE__ */ new Set();
    const linhasNovas = [];
    for (const perfil of perfis) {
      if (perfil.id === autorId) continue;
      if (idsJaProcessados.has(perfil.id)) continue;
      idsJaProcessados.add(perfil.id);
      linhasNovas.push({
        destinatario_id: perfil.id,
        tipo: "comentario",
        mensagem: `${nomeDoAutor} mencionou voc\xEA em um coment\xE1rio.`,
        post_id: postId,
        ator_id: autorId,
        lida: false
      });
    }
    if (linhasNovas.length === 0) return;
    const { error: erroInsert } = await supabase.from("notificacoes").insert(linhasNovas);
    if (erroInsert) throw new Error(erroInsert.message);
  }
  function criarServicoComentarios(supabase) {
    return {
      async buscarComentarios(postId) {
        const { data, error } = await supabase.from("comentarios").select("*, autor:profiles!comentarios_autor_id_fkey(*)").eq("post_id", postId).order("criado_em", { ascending: true });
        if (error) throw new Error(error.message);
        return (data ?? []).map(mapearComentario);
      },
      async criarComentario(postId, autorId, conteudo) {
        if (!conteudo || !conteudo.trim()) throw new Error("Digite um coment\xE1rio.");
        const conteudoFinal = conteudo.trim();
        const { data, error } = await supabase.from("comentarios").insert({ post_id: postId, autor_id: autorId, conteudo: conteudoFinal }).select("*, autor:profiles!comentarios_autor_id_fkey(*)").single();
        if (error) throw new Error(error.message);
        const comentario = mapearComentario(data);
        try {
          await notificarMencionados(supabase, conteudoFinal, postId, autorId, data.autor);
        } catch {
        }
        return comentario;
      },
      /**
       * FAÇA 1 — exclui um comentário, mas SOMENTE se `autorId` for
       * realmente o autor dele. A checagem de propriedade é feita na
       * própria query (.eq('autor_id', autorId)), não apenas escondendo
       * um botão no frontend — então mesmo que o app/site sofra alguma
       * adulteração, o Usuário B nunca consegue apagar comentário do A.
       */
      async excluirComentario(comentarioId, autorId) {
        const { error, count } = await supabase.from("comentarios").delete({ count: "exact" }).eq("id", comentarioId).eq("autor_id", autorId);
        if (error) throw new Error(error.message);
        if (!count) {
          throw new Error("N\xE3o foi poss\xEDvel excluir este coment\xE1rio. Voc\xEA s\xF3 pode excluir coment\xE1rios que voc\xEA mesmo escreveu.");
        }
      },
      /**
       * FAÇA 2 — busca de usuários para a lista de sugestão do "@".
       * Busca por PREFIXO do username (equivalente ao padrão já usado em
       * `buscarEmpresas`, em posts.ts, só que por username em vez de nome),
       * então digitar "@ju" já traz @julia.cristina, @juliana, @jucosta.
       */
      async buscarUsuariosParaMencao(termo, usuarioIdAtual) {
        const busca = termo.trim().toLowerCase();
        const { data, error } = await supabase.from("profiles").select("id, nome, username, avatar_url").not("username", "is", null).ilike("username", `${busca}%`).order("username", { ascending: true }).limit(8);
        if (error) throw new Error(error.message);
        return (data ?? []).filter((linha) => linha.id !== usuarioIdAtual).map((linha) => ({
          id: linha.id,
          nome: linha.nome,
          username: linha.username,
          avatarUrl: linha.avatar_url
        }));
      }
    };
  }

  // src/services/posts.ts
  function mapearPost(linha, idsCurtidos) {
    return {
      id: linha.id,
      conteudo: linha.conteudo,
      categoria: linha.categoria,
      status: linha.status,
      midiaUrl: linha.midia_url,
      tipoMidia: linha.tipo_midia,
      latitude: linha.latitude,
      longitude: linha.longitude,
      criadoEm: linha.criado_em,
      autor: {
        id: linha.autor.id,
        nome: linha.autor.nome,
        email: linha.autor.email,
        tipo: linha.autor.tipo,
        avatarUrl: linha.autor.avatar_url,
        username: linha.autor.username
      },
      empresa: linha.empresa ? {
        id: linha.empresa.id,
        nome: linha.empresa.nome,
        email: linha.empresa.email,
        tipo: linha.empresa.tipo,
        avatarUrl: linha.empresa.avatar_url,
        username: linha.empresa.username
      } : null,
      totalCurtidas: linha.curtidas?.[0]?.count ?? 0,
      curtidoPorMim: idsCurtidos.has(linha.id)
    };
  }
  var SELECT_POST = `*,
  autor:profiles!posts_autor_id_fkey(*),
  empresa:profiles!posts_empresa_id_fkey(*),
  curtidas(count)`;
  function criarServicoPosts(supabase) {
    async function idsCurtidosDoUsuario(usuarioId) {
      if (!usuarioId) return /* @__PURE__ */ new Set();
      const { data } = await supabase.from("curtidas").select("post_id").eq("user_id", usuarioId);
      return new Set((data ?? []).map((c) => c.post_id));
    }
    return {
      async buscarPosts(usuarioId, categoria) {
        let query = supabase.from("posts").select(SELECT_POST).order("criado_em", { ascending: false });
        if (categoria) query = query.eq("categoria", categoria);
        const { data, error } = await query;
        if (error) throw new Error(error.message);
        const idsCurtidos = await idsCurtidosDoUsuario(usuarioId);
        return (data ?? []).map((linha) => mapearPost(linha, idsCurtidos));
      },
      async buscarPostPorId(postId, usuarioId) {
        const { data, error } = await supabase.from("posts").select(SELECT_POST).eq("id", postId).single();
        if (error || !data) return null;
        const idsCurtidos = await idsCurtidosDoUsuario(usuarioId);
        return mapearPost(data, idsCurtidos);
      },
      async criarPost(dados) {
        const { data, error } = await supabase.from("posts").insert({
          autor_id: dados.autorId,
          conteudo: dados.conteudo,
          categoria: dados.categoria,
          midia_url: dados.midiaUrl ?? null,
          tipo_midia: dados.tipoMidia ?? null,
          latitude: dados.latitude ?? null,
          longitude: dados.longitude ?? null,
          empresa_id: dados.empresaId ?? null
        }).select(SELECT_POST).single();
        if (error) throw new Error(error.message);
        return mapearPost(data, /* @__PURE__ */ new Set());
      },
      async atualizarPost(postId, autorId, novoConteudo) {
        const conteudo = novoConteudo.trim();
        if (!conteudo) throw new Error("A legenda n\xE3o pode ficar vazia.");
        const { data, error } = await supabase.from("posts").update({ conteudo, status: "recebida" }).eq("id", postId).eq("autor_id", autorId).select(SELECT_POST).single();
        if (error) throw new Error(error.message);
        if (!data) throw new Error("N\xE3o foi poss\xEDvel atualizar esta publica\xE7\xE3o.");
        const idsCurtidos = await idsCurtidosDoUsuario(autorId);
        return mapearPost(data, idsCurtidos);
      },
      async deletarPost(postId, autorId) {
        const { error } = await supabase.from("posts").delete().eq("id", postId).eq("autor_id", autorId);
        if (error) throw new Error(error.message);
      },
      async buscarPostsPorAutor(autorId, usuarioId) {
        const { data, error } = await supabase.from("posts").select(SELECT_POST).eq("autor_id", autorId).order("criado_em", { ascending: false });
        if (error) throw new Error(error.message);
        const idsCurtidos = await idsCurtidosDoUsuario(usuarioId);
        return (data ?? []).map((linha) => mapearPost(linha, idsCurtidos));
      },
      async buscarPostsPorEmpresa(empresaId, usuarioId) {
        const { data, error } = await supabase.from("posts").select(SELECT_POST).eq("empresa_id", empresaId).order("criado_em", { ascending: false });
        if (error) throw new Error(error.message);
        const idsCurtidos = await idsCurtidosDoUsuario(usuarioId);
        return (data ?? []).map((linha) => mapearPost(linha, idsCurtidos));
      },
      async buscarPostsCurtidosPorMim(usuarioId) {
        const { data: curtidas, error: erroCurtidas } = await supabase.from("curtidas").select("post_id").eq("user_id", usuarioId);
        if (erroCurtidas) throw new Error(erroCurtidas.message);
        const idsPosts = (curtidas ?? []).map((c) => c.post_id);
        if (idsPosts.length === 0) return [];
        const { data, error } = await supabase.from("posts").select(SELECT_POST).in("id", idsPosts).order("criado_em", { ascending: false });
        if (error) throw new Error(error.message);
        const idsCurtidosSet = new Set(idsPosts);
        return (data ?? []).map((linha) => mapearPost(linha, idsCurtidosSet));
      },
      async buscarEmpresas(termo) {
        if (!termo.trim()) return [];
        const { data, error } = await supabase.from("profiles").select("id, nome, avatar_url").eq("tipo", "empresa").ilike("nome", `%${termo.trim()}%`).limit(8);
        if (error) throw new Error(error.message);
        return data ?? [];
      }
    };
  }

  // src/services/seguidores.ts
  function mapearPerfilSeguido(linha) {
    const perfil = linha?.empresa;
    if (!perfil) return null;
    return {
      id: perfil.id,
      nome: perfil.nome,
      username: perfil.username ?? null,
      avatarUrl: perfil.avatar_url ?? null,
      tipo: perfil.tipo
    };
  }
  function criarServicoSeguidores(supabase) {
    return {
      async estaSeguindo(seguidorId, empresaId) {
        const { data, error } = await supabase.from("seguidores_empresa").select("id").eq("seguidor_id", seguidorId).eq("empresa_id", empresaId).maybeSingle();
        if (error) throw new Error(error.message);
        return !!data;
      },
      async seguirEmpresa(seguidorId, empresaId) {
        const { error } = await supabase.from("seguidores_empresa").insert({ seguidor_id: seguidorId, empresa_id: empresaId });
        if (error) throw new Error(error.message);
      },
      async deixarDeSeguir(seguidorId, empresaId) {
        const { error } = await supabase.from("seguidores_empresa").delete().eq("seguidor_id", seguidorId).eq("empresa_id", empresaId);
        if (error) throw new Error(error.message);
      },
      async contarSeguidores(empresaId) {
        const { count, error } = await supabase.from("seguidores_empresa").select("*", { count: "exact", head: true }).eq("empresa_id", empresaId);
        if (error) throw new Error(error.message);
        return count ?? 0;
      },
      async contarSeguindo(seguidorId) {
        const { count, error } = await supabase.from("seguidores_empresa").select("*", { count: "exact", head: true }).eq("seguidor_id", seguidorId);
        if (error) throw new Error(error.message);
        return count ?? 0;
      },
      /**
       * Lista (perfil básico) de quem `seguidorId` está seguindo.
       * Mesma tabela `seguidores_empresa` — nenhuma tabela nova.
       * Ordenação alfabética feita aqui, pois a tabela não tem coluna de data confiável.
       */
      async buscarSeguindo(seguidorId) {
        const { data, error } = await supabase.from("seguidores_empresa").select("empresa:profiles!seguidores_empresa_empresa_id_fkey(id, nome, username, avatar_url, tipo)").eq("seguidor_id", seguidorId);
        if (error) throw new Error(error.message);
        return (data ?? []).map(mapearPerfilSeguido).filter((p) => p !== null).sort((a, b) => a.nome.localeCompare(b.nome));
      }
    };
  }

  // src/services/ranking.ts
  function criarServicoRanking(supabase) {
    return {
      async buscarRanking(limite = 50) {
        const { data, error } = await supabase.from("ranking").select("*").limit(limite);
        if (error) throw new Error(error.message);
        return (data ?? []).map((linha) => ({
          id: linha.id,
          nome: linha.nome,
          avatarUrl: linha.avatar_url,
          totalDenuncias: linha.total_denuncias
        }));
      }
    };
  }

  // src/services/solicitacao-selo.ts
  var TABELA_SOLICITACOES_SELO = "solicitacoes_selo";
  var TABELA_DOCUMENTOS_SOLICITACAO = "solicitacoes_selo_documentos";
  var BUCKET_DOCUMENTOS_SELO = "documentos-selo";
  function mapearSolicitacaoSelo(row) {
    return {
      id: row.id,
      empresaId: row.empresa_id,
      status: row.status,
      cnpj: row.cnpj,
      razaoSocial: row.razao_social,
      nomeFantasia: row.nome_fantasia,
      email: row.email,
      telefone: row.telefone,
      cep: row.cep,
      endereco: row.endereco,
      cidade: row.cidade,
      estado: row.estado,
      responsavelNome: row.responsavel_nome,
      responsavelCargo: row.responsavel_cargo,
      informacoesAdicionais: row.informacoes_adicionais ?? null,
      dataAuditoria: row.data_auditoria,
      localAuditoria: row.local_auditoria,
      metas: Array.isArray(row.metas) ? row.metas : [],
      plano: row.plano,
      metodoPagamento: row.metodo_pagamento,
      observacaoAnalise: row.observacao_analise ?? null,
      seloId: row.selo_id ?? null,
      criadoEm: row.criado_em,
      atualizadoEm: row.atualizado_em ?? null
    };
  }
  function mapearDocumentoSolicitacao(row) {
    return {
      id: row.id,
      solicitacaoId: row.solicitacao_id,
      tipo: row.tipo,
      nomeArquivo: row.nome_arquivo,
      caminhoStorage: row.caminho_storage,
      mimeType: row.mime_type,
      tamanhoBytes: row.tamanho_bytes,
      criadoEm: row.criado_em
    };
  }
  var ErroSolicitacaoSelo = class _ErroSolicitacaoSelo extends Error {
    constructor(mensagem, erros = []) {
      super(mensagem);
      this.name = "ErroSolicitacaoSelo";
      this.erros = erros;
      Object.setPrototypeOf(this, _ErroSolicitacaoSelo.prototype);
    }
  };
  function gerarUuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      return (c === "x" ? r : r & 3 | 8).toString(16);
    });
  }
  function extensaoDe(nomeArquivo) {
    return (nomeArquivo.split(".").pop() ?? "").toLowerCase();
  }
  function criarServicoSolicitacaoSelo(supabase) {
    return {
      /** Solicitação mais recente da empresa (ou null). */
      async buscarSolicitacaoAtual(empresaId) {
        const { data, error } = await supabase.from(TABELA_SOLICITACOES_SELO).select("*").eq("empresa_id", empresaId).order("criado_em", { ascending: false }).limit(1);
        if (error) throw new Error(error.message);
        const row = (data ?? [])[0];
        return row ? mapearSolicitacaoSelo(row) : null;
      },
      async buscarHistorico(empresaId) {
        const { data, error } = await supabase.from(TABELA_SOLICITACOES_SELO).select("*").eq("empresa_id", empresaId).order("criado_em", { ascending: false });
        if (error) throw new Error(error.message);
        return (data ?? []).map(mapearSolicitacaoSelo);
      },
      async buscarDocumentos(solicitacaoId) {
        const { data, error } = await supabase.from(TABELA_DOCUMENTOS_SOLICITACAO).select("*").eq("solicitacao_id", solicitacaoId).order("criado_em", { ascending: true });
        if (error) throw new Error(error.message);
        return (data ?? []).map(mapearDocumentoSolicitacao);
      },
      /** Link temporário para abrir um documento (bucket privado — nunca URL pública). */
      async gerarUrlDocumento(caminhoStorage, expiraEmSegundos = 60) {
        const { data, error } = await supabase.storage.from(BUCKET_DOCUMENTOS_SELO).createSignedUrl(caminhoStorage, expiraEmSegundos);
        if (error) throw new Error(error.message);
        return data.signedUrl;
      },
      /**
       * Envia a solicitação. Ela entra como 'enviada' (em análise) — NUNCA concede selo.
       * Ordem: valida → confere regras → envia arquivos → grava a solicitação → grava os documentos.
       * O id é gerado antes para que uma falha no upload não deixe solicitação "aberta" sem documentos.
       */
      async enviarSolicitacao(usuario, dados, arquivos) {
        if (!ehEmpresa(usuario)) {
          throw new ErroSolicitacaoSelo("Apenas contas empresariais podem solicitar o selo.");
        }
        if (temSeloAtivo(usuario)) {
          throw new ErroSolicitacaoSelo('Esta empresa j\xE1 possui um selo. Consulte-o na p\xE1gina "Solicitar Selo".');
        }
        if (arquivos.length !== dados.documentos.length) {
          throw new ErroSolicitacaoSelo("Os documentos informados n\xE3o conferem com os arquivos enviados.");
        }
        const erros = validarSolicitacaoSelo(dados);
        if (erros.length > 0) {
          throw new ErroSolicitacaoSelo("Revise os campos destacados antes de enviar.", erros);
        }
        const atual = await this.buscarSolicitacaoAtual(usuario.id);
        if (atual && solicitacaoEstaAberta(atual.status)) {
          throw new ErroSolicitacaoSelo("Voc\xEA j\xE1 tem uma solicita\xE7\xE3o em andamento.");
        }
        const solicitacaoId = gerarUuid();
        const enviados = [];
        for (const arquivo of arquivos) {
          const caminho = `${usuario.id}/${solicitacaoId}/${gerarUuid()}.${extensaoDe(arquivo.nomeArquivo)}`;
          const { error: error2 } = await supabase.storage.from(BUCKET_DOCUMENTOS_SELO).upload(caminho, arquivo.corpo, { contentType: arquivo.mimeType, upsert: false });
          if (error2) throw new Error(`Falha ao enviar "${arquivo.nomeArquivo}": ${error2.message}`);
          enviados.push({ arquivo, caminho });
        }
        const { empresa, auditoria, planoPagamento } = dados;
        const pDados = {
          cnpj: apenasDigitos(empresa.cnpj),
          razao_social: empresa.razaoSocial.trim(),
          nome_fantasia: empresa.nomeFantasia.trim(),
          email: empresa.email.trim(),
          telefone: apenasDigitos(empresa.telefone),
          cep: apenasDigitos(empresa.cep),
          endereco: empresa.endereco.trim(),
          cidade: empresa.cidade.trim(),
          estado: empresa.estado.trim().toUpperCase(),
          responsavel_nome: empresa.responsavelNome.trim(),
          responsavel_cargo: empresa.responsavelCargo.trim(),
          informacoes_adicionais: empresa.informacoesAdicionais?.trim() || null,
          data_auditoria: auditoria.dataAuditoria,
          local_auditoria: auditoria.localAuditoria.trim(),
          metas: auditoria.metas,
          plano: planoPagamento.plano.trim(),
          metodo_pagamento: planoPagamento.metodoPagamento
        };
        const pDocumentos = enviados.map(({ arquivo, caminho }) => ({
          tipo: arquivo.tipo,
          nome_arquivo: arquivo.nomeArquivo,
          caminho_storage: caminho,
          mime_type: arquivo.mimeType,
          tamanho_bytes: arquivo.tamanhoBytes
        }));
        const { data, error } = await supabase.rpc(
          "enviar_solicitacao_selo",
          {
            p_empresa_id: usuario.id,
            p_dados: pDados,
            p_documentos: pDocumentos
          }
        );
        if (error) {
          await supabase.storage.from(BUCKET_DOCUMENTOS_SELO).remove(enviados.map(({ caminho }) => caminho));
          throw new Error(error.message);
        }
        if (!data) {
          await supabase.storage.from(BUCKET_DOCUMENTOS_SELO).remove(enviados.map(({ caminho }) => caminho));
          throw new Error("A solicita\xE7\xE3o foi enviada, mas o Supabase n\xE3o retornou os dados.");
        }
        return mapearSolicitacaoSelo(data);
      }
    };
  }

  // src/constantes/termos.ts
  var VERSAO_TERMOS = "2026-10-01";
  var DATA_ATUALIZACAO_TERMOS = "1 de outubro de 2026";
  var EMAIL_CONTATO_LEGAL = "contatoverdereal@gmail.com";
  var TERMOS_DE_USO = [
    {
      id: "sobre",
      titulo: "1. O que \xE9 o Verde Real",
      paragrafos: [
        "O Verde Real \xE9 uma rede social de transpar\xEAncia ambiental. Nela, pessoas podem registrar den\xFAncias sobre pr\xE1ticas que parecem greenwashing (propaganda ambiental enganosa), e empresas podem se apresentar e solicitar o Selo Verde."
      ]
    },
    {
      id: "conta",
      titulo: "2. Conta e cadastro",
      paragrafos: [
        "Para publicar e interagir voc\xEA precisa criar uma conta como Cliente ou como Empresa. Voc\xEA se compromete a informar dados verdadeiros e a manter seu e-mail e sua senha em sigilo.",
        "Voc\xEA declara ter capacidade legal para aceitar estes termos. Voc\xEA \xE9 respons\xE1vel pelas atividades feitas na sua conta."
      ]
    },
    {
      id: "denuncias",
      titulo: "3. Den\xFAncias e conte\xFAdo publicado",
      paragrafos: [
        "Den\xFAncias devem ser feitas de boa-f\xE9, baseadas em fatos e, sempre que poss\xEDvel, acompanhadas de provas (imagens, links, documentos).",
        "N\xE3o \xE9 permitido publicar conte\xFAdo falso, ofensivo, discriminat\xF3rio ou difamat\xF3rio, nem expor dados pessoais de terceiros. Quem publica \xE9 o respons\xE1vel pelo que publica.",
        "O Verde Real pode ocultar ou remover conte\xFAdo que viole estes termos ou a lei."
      ]
    },
    {
      id: "empresas",
      titulo: "4. Empresas e Selo Verde",
      paragrafos: [
        "Empresas devem fornecer informa\xE7\xF5es verdadeiras ao solicitar o Selo Verde. O selo \xE9 concedido ap\xF3s an\xE1lise e pode ser retirado se as informa\xE7\xF5es se mostrarem falsas ou se as condi\xE7\xF5es deixarem de ser cumpridas.",
        "O Selo Verde n\xE3o \xE9 uma certifica\xE7\xE3o oficial nem garantia legal de conformidade ambiental."
      ]
    },
    {
      id: "transparencia",
      titulo: "5. Modera\xE7\xE3o e transpar\xEAncia",
      paragrafos: [
        "Empresas citadas em den\xFAncias podem responder dentro da plataforma. Se voc\xEA acredita que um conte\xFAdo ou uma decis\xE3o de modera\xE7\xE3o foi indevida, pode pedir revis\xE3o pelo e-mail de contato abaixo."
      ]
    },
    {
      id: "responsabilidade",
      titulo: "6. Limites de responsabilidade",
      paragrafos: [
        "O conte\xFAdo publicado pelos usu\xE1rios representa a opini\xE3o de quem o publicou, e n\xE3o do Verde Real. Fazemos o poss\xEDvel para manter o servi\xE7o dispon\xEDvel, mas ele pode sofrer interrup\xE7\xF5es."
      ]
    },
    {
      id: "alteracoes",
      titulo: "7. Altera\xE7\xF5es e contato",
      paragrafos: [
        "Podemos atualizar estes termos. Mudan\xE7as relevantes ser\xE3o avisadas na plataforma. D\xFAvidas: " + EMAIL_CONTATO_LEGAL + "."
      ]
    }
  ];
  var POLITICA_PRIVACIDADE = [
    {
      id: "dados",
      titulo: "1. Quais dados coletamos",
      paragrafos: [
        "Dados de cadastro: nome ou raz\xE3o social, e-mail, tipo de perfil (Cliente ou Empresa) e nome de usu\xE1rio (@).",
        "Dados que voc\xEA cria: foto de perfil (se enviar), den\xFAncias, imagens, coment\xE1rios, curtidas e notifica\xE7\xF5es."
      ]
    },
    {
      id: "uso",
      titulo: "2. Para que usamos",
      paragrafos: [
        "Para criar e proteger sua conta, permitir o login, exibir suas publica\xE7\xF5es, enviar notifica\xE7\xF5es da plataforma, moderar conte\xFAdo e cumprir obriga\xE7\xF5es legais."
      ]
    },
    {
      id: "publico",
      titulo: "3. O que \xE9 p\xFAblico",
      paragrafos: [
        "Seu nome, nome de usu\xE1rio, foto e o conte\xFAdo que voc\xEA publica podem ser vistos por outros usu\xE1rios. Sua senha nunca \xE9 exibida nem armazenada em texto leg\xEDvel."
      ]
    },
    {
      id: "compartilhamento",
      titulo: "4. Compartilhamento",
      paragrafos: [
        "N\xE3o vendemos seus dados. Usamos provedores de infraestrutura (banco de dados, autentica\xE7\xE3o e armazenamento) que tratam os dados apenas para o funcionamento do servi\xE7o."
      ]
    },
    {
      id: "direitos",
      titulo: "5. Seus direitos (LGPD)",
      paragrafos: [
        "Voc\xEA pode pedir acesso, corre\xE7\xE3o, exclus\xE3o, portabilidade dos seus dados e revogar consentimentos. Para isso, escreva para " + EMAIL_CONTATO_LEGAL + "."
      ]
    },
    {
      id: "seguranca",
      titulo: "6. Seguran\xE7a e guarda dos dados",
      paragrafos: [
        "Adotamos medidas t\xE9cnicas para proteger seus dados e os mantemos enquanto sua conta existir ou enquanto a lei exigir."
      ]
    }
  ];
  return __toCommonJS(index_exports);
})();