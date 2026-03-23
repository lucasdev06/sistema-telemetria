import { client } from "./supabase.js";

let editando = false;

// ===============================
// INICIAR
// ===============================
document.addEventListener('DOMContentLoaded', iniciar);

function iniciar() {
    configurarEventos();
    carregarTudo();
}

async function carregarTudo() {
    await aplicarFiltro(); // já carrega com filtro padrão
    await calcular_Despesas();
    await qd_contrato();
    await aplicarfiltros_id()
}

// ===============================
// EVENTOS
// ===============================
function configurarEventos() {
    const openBtn = document.getElementById('gerador_faturas');
    const cancelarBtn = document.getElementById('cancelar_fatura');
    const modal = document.getElementById('modal');
    const salvarBtn = document.getElementById('salvar_fatura');
    const tabela = document.querySelector('.call_tables');
    const selectFiltro = document.getElementById('selection_filtros');

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            limparFormulario();
            editando = false;
            document.getElementById('id_fatura').disabled = false;
            modal.classList.add('active');
        });
    }

    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });

    if (salvarBtn) {
        salvarBtn.addEventListener('click', salvarFatura);
    }

    if (tabela) {
        tabela.addEventListener('click', handleTabelaClick);
    }

    // 🔥 EVENTO DO FILTRO
    if (selectFiltro) {
        selectFiltro.addEventListener('change', () => {
            aplicarFiltro();
        });
    }
}

// ==============================
// FILTRO (🔥 PRINCIPAL)
// ==============================
async function aplicarFiltro() {
    const filtro = document.getElementById('selection_filtros').value;

    let query = client
        .from('controle_faturamento')
        .select('*')
        .order('data_emissao', { ascending: false });

    if (filtro && filtro !== 'selecione') {
        query = query.eq('tipo_servicos', filtro);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Erro filtro:", error);
        return;
    }

    renderTabela(data);
}

async function aplicarfiltros_id() {
    const filtro_id = document.getElementById('barra_pesquisa').value;

    let query = client
        .from('controle_faturamento')
        .select('*')
        .order('data_emissao', { ascending: false })

    if (filtro_id && filtro_id !== '') {
    query = query.eq('id_fatura', filtro_id);
    }

    const {data, error} = await query;

    
    if (error) {
        console.error("Erro filtro:", error);
        return;
    }

    renderTabela(data);


    }

// ==============================
// CALCULAR DESPESAS 💰
// ==============================
async function calcular_Despesas() {
    const { data } = await client
        .from('controle_faturamento')
        .select('*');

    let total = 0;

    data.forEach(item => {
        total += Number(item.valor_fatura) || 0;
    });

    const h1 = document.getElementById('valor_despesa');

    h1.innerText = total.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// ==============================
// TOTAL FATURAS
// ==============================
async function qd_contrato() {
    const { data } = await client
        .from('controle_faturamento')
        .select('*');

    document.getElementById('fatura_recebidas').innerText = data.length;
}

// ==============================
// SALVAR
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

        if (!id_fatura || !cliente) {
            alert("Preencha os campos obrigatórios!");
            return;
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

        let response;

        if (editando) {
            response = await client
                .from('controle_faturamento')
                .update(payload)
                .eq('id_fatura', id_fatura);
        } else {
            response = await client
                .from('controle_faturamento')
                .insert([{ id_fatura, ...payload }]);
        }

        if (response.error) {
            console.error(response.error);
            alert("Erro ao salvar");
            return;
        }

        alert("Fatura salva!");

        await carregarTudo();
        document.getElementById('modal').classList.remove('active');
        limparFormulario();

    } catch (err) {
        console.error(err);
        alert("Erro geral");
    }
}

// ===============================
// TABELA
// ===============================
function formatarData(data) {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

function renderTabela(dados) {
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
            <td style="text-align: right;">${Number(item.valor_fatura).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</td>
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
// CLICK
// ===============================
async function handleTabelaClick(e) {
    if (e.target.classList.contains('btn-editar')) {
        const id = e.target.dataset.id;

        const { data } = await client
            .from('controle_faturamento')
            .select('*')
            .eq('id_fatura', id)
            .single();

        if (!data) return;

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
}

// ===============================
// LIMPAR
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
}