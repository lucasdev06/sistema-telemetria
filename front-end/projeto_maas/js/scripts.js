import { Client } from './supabase'

const openBtn = document.getElementById('openModal');
const closeBtn = document.getElementById('closeModal');
const modal = document.getElementById('modalContainer');

// Abre o modal ao clicar no botão
openBtn.addEventListener('click', () => {
  modal.classList.add('active');
});

// Fecha o modal ao clicar no botão Cancelar
closeBtn.addEventListener('click', () => {
  modal.classList.remove('active');
});

// Extra: Fecha o modal se o usuário clicar no fundo escuro (fora da caixa)
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.classList.remove('active');
  }
});

async function buscarUsuarios() {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')

  if (error) {
    console.error('Erro:', error)
  } else {
    console.log('Dados:', data)
  }
}

buscarUsuarios()