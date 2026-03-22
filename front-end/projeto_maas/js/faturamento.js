import { client } from "./supabase.js";

const openBtn_formulario = document.getElementById('gerador_faturas');
const cancelar_formulario = document.getElementById('cancelar_fatura');
const modal = document.getElementById('modal');
const salvar_fatura = document.getElementById('salvar_fatura');

// ===============================
// MODAL
// ===============================
openBtn_formulario.addEventListener('click', () => {
    modal.classList.add('active');
});

cancelar_formulario.addEventListener('click', () => {
    modal.classList.remove('active');
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.classList.remove('active');
    }
});

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
// ADICIONAR FATURA
// ==============================
async function adicionar_fatura() {
    try {
        const id_fatura = document.getElementById('id_fatura').value;
        const fornecedor = document.getElementById('select_contrato').value;
        const tipo_servicos = document.getElementById('tipo_servicos').value;
        const qd_aparelhos = document.getElementById('qd_aparelhos').value;
        const valor_fatura = document.getElementById('valor_fatura').value;

        const data_input = document.getElementById('data_emissao').value;
        const data_vencimento = document.getElementById('data_vencimento').value;

        const status_select = document.getElementById('status_select').value;
        const observacoes = document.getElementById('descricao').value;

        const data_emissao = new Date(data_input);
        data_emissao.setMinutes(data_emissao.getMinutes() - data_emissao.getTimezoneOffset());

        const data_venc = new Date(data_vencimento);
        data_venc.setMinutes(data_venc.getMinutes() - data_venc.getTimezoneOffset());

        const { error } = await client
            .from('controle_faturamento')
            .insert([{
                id_fatura,
                fornecedor,
                tipo_servicos,
                qd_aparelhos,
                valor_fatura,
                data_emissao: data_emissao.toISOString(),
                data_vencimento: data_venc.toISOString(),
                status_select,
                observacoes
            }]);

        if (error) throw error;

        alert("Salvo com sucesso 🚀");

    } catch (err) {
        console.error(err);
        alert('Erro ao salvar!');
    }
}

// ===============================
// PREENCHER TABELA
// ===============================
async function preencherTabela_fatura() {
    const dados = await buscar_information();
    const tbody = document.querySelector('.call_tables');

    tbody.innerHTML = '';

    if (!dados.length) {
        tbody.innerHTML = `
            <tr>
                <td class="table_td" colspan="9">Sem nenhuma informação.</td>
            </tr>
        `;
        return;
    }

    dados.forEach(item => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td class="table_td">${item.id_fatura}</td>
            <td class="table_td">${item.fornecedor}</td>
            <td class="table_td">${item.tipo_servicos}</td>
            <td class="table_td">${item.qd_aparelhos}</td>
            <td class="table_td">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL'}).format(item.valor_fatura)}</td>
            <td class="table_td">${new Date(item.data_emissao).toLocaleDateString('pt-BR')}</td>
            <td class="table_td">${new Date(item.data_vencimento).toLocaleDateString('pt-BR')}</td>
            <td class="table_td">${item.status_select}</td>
            <td class="table_td">${item.observacoes || ''}</td>
        `;

        tbody.appendChild(tr);
    });
}

// ===============================
// EVENTO SALVAR
// ===============================
salvar_fatura.addEventListener('click', async () => {
    await adicionar_fatura();
    await preencherTabela_fatura();
    modal.classList.remove('active');
});

// ===============================
// CARREGAR AO INICIAR
// ===============================
preencherTabela_fatura();