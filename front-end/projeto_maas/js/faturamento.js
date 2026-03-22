import { client } from "./supabase.js";

let editando = false;

// ===============================
// INICIAR
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    preencherTabela_fatura();
    configurarEventos();
});

// ===============================
// EVENTOS
// ===============================
function configurarEventos() {
    const openBtn = document.getElementById('gerador_faturas');
    const cancelarBtn = document.getElementById('cancelar_fatura');
    const modal = document.getElementById('modal');
    const salvarBtn = document.getElementById('salvar_fatura');

    openBtn.addEventListener('click', () => {
        limparFormulario();
        editando = false;
        document.getElementById('id_fatura').disabled = false;
        modal.classList.add('active');
    });

    cancelarBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });

    salvarBtn.addEventListener('click', salvarFatura);

    document.querySelector('.call_tables').addEventListener('click', handleTabelaClick);
}

// ==============================
// BUSCAR DADOS
// ==============================
async function buscar_information() {
    const { data, error } = await client
        .from('controle_faturamento')
        .select('*')
        .order('data_emissao', { ascending: false });

    if (error) {
        console.error(error);
        alert('Erro ao buscar dados');
        return [];
    }

    return data;
}

// ==============================
// SALVAR (INSERT / UPDATE + UPLOAD)
// ==============================
async function salvarFatura() {
    try {
        const id_fatura = document.getElementById('id_fatura').value.trim();
        const cliente = document.getElementById('select_contrato').value;
        const fornecedor = document.getElementById('select_fornecedores').value;
        const tipo_servicos = document.getElementById('tipo_servicos').value;
        const qd_aparelhos = parseInt(document.getElementById('qd_aparelhos').value) || 0;
        const valor_fatura = parseFloat(document.getElementById('valor_fatura').value) || 0;
        const data_emissao = document.getElementById('data_emissao').value;
        const data_vencimento = document.getElementById('data_vencimento').value;
        const status_select = document.getElementById('status_select').value;
        const observacoes = document.getElementById('descricao').value;

        const fileInput = document.getElementById('arquivo_input');
        const file = fileInput.files[0];

        if (
            !id_fatura ||
            cliente === "selecione..." ||
            fornecedor === "selecione..." ||
            tipo_servicos === "selecione..." ||
            status_select === "selecione..." ||
            !data_emissao ||
            !data_vencimento
        ) {
            alert("Preencha todos os campos corretamente!");
            return;
        }

        let arquivo_url = null;

        // =========================
        // UPLOAD DO ARQUIVO
        // =========================
        if (file) {
            const fileName = `${id_fatura}_${Date.now()}_${file.name.replace(/\s/g, "_")}`;
            const { error: uploadError } = await client.storage
                .from('faturas')
                .upload(fileName, file, { cacheControl: '3600', upsert: true });

            if (uploadError) {
                console.error("ERRO UPLOAD:", uploadError);
                alert(uploadError.message);
                return;
            }

            const { data: publicUrl } = client.storage
                .from('faturas')
                .getPublicUrl(fileName);

            arquivo_url = publicUrl.publicUrl;
        }

        const payload = {
            cliente,
            fornecedor,
            tipo_servicos,
            qd_aparelhos,
            valor_fatura,
            data_emissao,
            data_vencimento,
            status_select,
            observacoes
        };

        if (arquivo_url) payload.arquivo_url = arquivo_url;

        let error;
        if (editando) {
            const response = await client
                .from('controle_faturamento')
                .update(payload)
                .eq('id_fatura', id_fatura);
            error = response.error;
        } else {
            const response = await client
                .from('controle_faturamento')
                .insert([{ id_fatura, ...payload }]);
            error = response.error;
        }

        if (error) throw error;

        alert("Fatura salva com sucesso 🚀");
        await preencherTabela_fatura();
        document.getElementById('modal').classList.remove('active');
        limparFormulario();

    } catch (err) {
        console.error(err);
        alert("Erro ao salvar fatura.");
    }
}

// ===============================
// PREENCHER TABELA
// ===============================
function formatarData(data) {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

async function preencherTabela_fatura() {
    const dados = await buscar_information();
    const tbody = document.querySelector('.call_tables');
    tbody.innerHTML = '';

    if (!dados.length) {
        tbody.innerHTML = `<tr><td colspan="10">Sem dados</td></tr>`;
        return;
    }

    dados.forEach(item => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${item.id_fatura}</td>
            <td>${item.cliente}</td>
            <td>${item.fornecedor}</td>
            <td>${item.tipo_servicos}</td>
            <td>${item.qd_aparelhos}</td>
            <td>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL'}).format(item.valor_fatura)}</td>
            <td>${formatarData(item.data_emissao)}</td>
            <td>${formatarData(item.data_vencimento)}</td>
            <td>${item.status_select}</td>
            <td>
                <img src="../assets/icons/edit.png" class="btn-editar" data-id="${item.id_fatura}" style="width:25px;cursor:pointer;">
                <img src="../assets/icons/download.png" class="btn-download" data-url="${item.arquivo_url || ''}" style="width:25px;cursor:pointer;">
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// ===============================
// CLICK TABELA (EDITAR + DOWNLOAD)
// ===============================
async function handleTabelaClick(e) {

    // EDITAR
    if (e.target.classList.contains('btn-editar')) {
        const id = e.target.dataset.id;

        const { data, error } = await client
            .from('controle_faturamento')
            .select('*')
            .eq('id_fatura', id)
            .single();

        if (error) {
            console.error(error);
            return;
        }

        document.getElementById('id_fatura').value = data.id_fatura;
        document.getElementById('select_contrato').value = data.cliente;
        document.getElementById('select_fornecedores').value = data.fornecedor;
        document.getElementById('tipo_servicos').value = data.tipo_servicos;
        document.getElementById('qd_aparelhos').value = data.qd_aparelhos;
        document.getElementById('valor_fatura').value = data.valor_fatura;
        document.getElementById('data_emissao').value = data.data_emissao;
        document.getElementById('data_vencimento').value = data.data_vencimento;
        document.getElementById('status_select').value = data.status_select;
        document.getElementById('descricao').value = data.observacoes;

        editando = true;
        document.getElementById('id_fatura').disabled = true;
        document.getElementById('modal').classList.add('active');
    }

    // DOWNLOAD
    if (e.target.classList.contains('btn-download')) {
        const url = e.target.dataset.url;

        if (!url) {
            alert("Nenhum arquivo disponível");
            return;
        }

        const link = document.createElement('a');
        link.href = url;
        link.download = '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// ===============================
// LIMPAR FORMULÁRIO
// ===============================
function limparFormulario() {
    document.getElementById('id_fatura').value = '';
    document.getElementById('select_contrato').value = '';
    document.getElementById('select_fornecedores').value = '';
    document.getElementById('tipo_servicos').value = '';
    document.getElementById('qd_aparelhos').value = '';
    document.getElementById('valor_fatura').value = '';
    document.getElementById('data_emissao').value = '';
    document.getElementById('data_vencimento').value = '';
    document.getElementById('status_select').value = '';
    document.getElementById('descricao').value = '';
    document.getElementById('arquivo_input').value = '';

    document.getElementById('id_fatura').disabled = false;
}