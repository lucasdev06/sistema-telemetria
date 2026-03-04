import { client } from "./supabase.js";

const openBtn = document.getElementById('openModal');
const closeBtn = document.getElementById('closeModal');
const modal = document.getElementById('modalContainer');
const btnSalvar = document.querySelector('.btn-primary');

// ===============================
// MODAL
// ===============================
openBtn.addEventListener('click', () => {
  modal.classList.add('active');
});

closeBtn.addEventListener('click', () => {
  modal.classList.remove('active');
});

window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.classList.remove('active');
  }
});

// ===============================
// SALVAR DADOS
// ===============================
async function adicionar() {
  try {
    const data_hora = document.getElementById('data_hora').value;
    const ticket = document.getElementById('ticket').value;
    const placa = document.getElementById('placa').value;
    const ocorrencia = document.getElementById('ocorrencia').value;
    const tipo = document.getElementById('Manutencao').value;
    const status = document.getElementById('status').value;
    const prazo = document.getElementById('data_hora_prazo').value || null;
    const resultado = document.getElementById('resultado_final').value || null;
    const causa_raiz = document.getElementById('causa_raiz').value || null;
    const observacoes = document.getElementById('observacoes').value || null;

    const { error } = await client
      .from('controle_chamados')
      .insert([
        {
          data_hora,
          ticket,
          placa,
          ocorrencia,
          tipo,
          status,
          prazo,
          resultado,
          causa_raiz,
          observacoes
        }
      ]);

    if (error) throw error;

    alert("Salvo com sucesso 🚀");
  } catch (err) {
    console.error(err);
    alert("Erro ao salvar");
  }
}

// ===============================
// BUSCAR DADOS
// ===============================
async function buscar_information() {
  const { data, error } = await client
    .from('controle_chamados')
    .select('*')
    .order('data_hora', { ascending: false });

  if (error) {
    console.error(error);
    alert("Erro ao buscar dados");
    return [];
  }

  return data;
}

// ===============================
// PREENCHER TABELA
// ===============================
async function preencherTabela() {
  const dados = await buscar_information();
  const tbody = document.getElementById('call_tables');

  tbody.innerHTML = '';

  if (!dados.length) {
    tbody.innerHTML = `
      <tr>
        <td class="information_table_td" colspan="10">
          Sem nenhuma informação.
        </td>
      </tr>
    `;
    return;
  }

  dados.forEach(item => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${new Date(item.data_hora).toLocaleString()}</td>
      <td>${item.ticket}</td>
      <td>${item.placa}</td>
      <td>${item.ocorrencia}</td>
      <td>${item.tipo}</td>
      <td>${item.status}</td>
      <td>${item.prazo ? new Date(item.prazo).toLocaleDateString() : ''}</td>
      <td>${item.resultado ?? ''}</td>
      <td>${item.causa_raiz ?? ''}</td>
      <td>${item.observacoes ?? ''}</td>
    `;

    tbody.appendChild(tr);
  });
}

// ===============================
// EVENTO SALVAR
// ===============================
btnSalvar.addEventListener('click', async () => {
  await adicionar();
  await preencherTabela();
  modal.classList.remove('active');
});

// ===============================
// CARREGA TABELA AO ABRIR A PÁGINA
// ===============================
document.addEventListener('DOMContentLoaded', preencherTabela);