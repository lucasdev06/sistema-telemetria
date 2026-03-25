import { client } from "./supabase.js";

const openBtn = document.getElementById('openModal');
const closeBtn = document.getElementById('closeModal');
const modal = document.getElementById('modalContainer');
const btnSalvar = document.querySelector('.btn-primary');


// ===============================
// CARREGA TABELA AO ABRIR A PÁGINA
// ===============================
document.addEventListener('DOMContentLoaded', preencherTabela);

await em_atendimento();
await concluidos();
await agendados();
await cancelados();

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
// BUSCAR DADOS EM ATENDIMENTO
// ===============================

async function em_atendimento() {
  const { data } = await client
    .from('controle_chamados')
    .select('status')

    const ticket_atendimento = data.filter(item => item.status === "Em atendimento");

    document.getElementById('em_atendimento').innerHTML = ticket_atendimento.length;
}

// ===============================
// BUSCAR DADOS CONCLUIDO
// ===============================

async function concluidos() {
  const { data } = await client
    .from('controle_chamados')
    .select('status')

    const ticket_concluidos = data.filter(item => item.status === "Concluído");

    document.getElementById('ticket_concluido').innerHTML = ticket_concluidos.length;
}

// ===============================
// BUSCAR DADOS AGENDADOS
// ===============================

async function agendados() {
  const { data } = await client
    .from('controle_chamados')
    .select('status')

  const ticket_agendados = data.filter(item => item.status === 'Agendado');

  document.getElementById('agendado').innerHTML = ticket_agendados.length;

}


// ===============================
// BUSCAR DADOS CANCELADOS
// ===============================

async function cancelados() {
  const { data } = await client
    .from('controle_chamados')
    .select('status')

  const ticket_cancelados = data.filter(item => item.status === 'Cancelado / Indisponível');

  document.getElementById('Cancelados_Indisponível').innerHTML = ticket_cancelados.length;

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
      <td>
        ${new Date(item.data_hora).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo'
        })}
      </td>
      <td>${item.ticket}</td>
      <td>${item.placa}</td>
      <td>${item.ocorrencia}</td>
      <td>${item.tipo}</td>
      <td>${item.status}</td>
      <td>${item.prazo ? new Date(item.prazo).toLocaleDateString() : ''}</td>
      <td>${item.resultado ?? ''}</td>
      <td>${item.causa_raiz ?? ''}</td>
      <td class="acoes_alterar"><img src="assets/icons/editar.png" style="width: 20px;" alt="açoes_alterar"></td>
    `;

    tbody.appendChild(tr);
  });
}


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
    const input = document.getElementById('data_hora').value;
    const ticket = document.getElementById('ticket').value;
    const placa = document.getElementById('placa').value;
    const ocorrencia = document.getElementById('ocorrencia').value;
    const tipo = document.getElementById('Manutencao').value;
    const status = document.getElementById('status').value;
    const prazo = document.getElementById('data_hora_prazo').value || null;
    const resultado = document.getElementById('resultado_final').value || null;
    const causa_raiz = document.getElementById('causa_raiz').value || null;
    const observacoes = document.getElementById('observacoes').value || null;

    const dateLocal = new Date(input);
    dateLocal.setMinutes(dateLocal.getMinutes() - dateLocal.getTimezoneOffset());

    const dataInput = dateLocal.toISOString();
    const date_computer = new Date()

    const { error } = await client
    .from('controle_chamados')
    .insert([
      {
        data_hora: dataInput, // ✅ corrigido
        ticket,
        ocorrencia,
        placa,
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
// EVENTO SALVAR
// ===============================
btnSalvar.addEventListener('click', async () => {
  await adicionar();
  await preencherTabela();
  modal.classList.remove('active');
});



