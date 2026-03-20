const openBtn_formulario = document.getElementById('gerador_faturas');

const cancelar_formulario = document.getElementById('cancelar_fatura');

const modal = document.getElementById('modal');

// ===============================
// MODAL
// ===============================

openBtn_formulario.addEventListener('click', () => {
    modal.classList.add('active');
});

window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.classList.remove('active');
  }
});