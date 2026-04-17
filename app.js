const state = {
  role: null,
};

const statusEl = document.getElementById('connectionStatus');
const logOutputEl = document.getElementById('logOutput');

const btnRoleA = document.getElementById('btnRoleA');
const btnRoleB = document.getElementById('btnRoleB');
const btnResetRole = document.getElementById('btnResetRole');
const btnResetAll = document.getElementById('btnResetAll');

const placeholderButtons = [
  'btnGenerateOffer',
  'btnApplyOffer',
  'btnGenerateAnswer',
  'btnApplyAnswer',
].map((id) => document.getElementById(id));

const placeholderInputs = [
  'offerLocal',
  'offerRemote',
  'answerLocal',
  'answerRemote',
].map((id) => document.getElementById(id));

function nowTime() {
  return new Date().toLocaleTimeString('es-ES', { hour12: false });
}

function addLog(message) {
  const line = `[${nowTime()}] ${message}`;
  logOutputEl.textContent = logOutputEl.textContent
    ? `${logOutputEl.textContent}\n${line}`
    : line;
}

function renderStatus() {
  if (state.role === 'A') {
    statusEl.textContent = 'Estado: rol A seleccionado (UI estática)';
    statusEl.className = 'status status--selected';
    return;
  }

  if (state.role === 'B') {
    statusEl.textContent = 'Estado: rol B seleccionado (UI estática)';
    statusEl.className = 'status status--selected';
    return;
  }

  statusEl.textContent = 'Estado: idle';
  statusEl.className = 'status status--idle';
}

function setRole(nextRole) {
  state.role = nextRole;
  renderStatus();
  addLog(nextRole ? `Rol seleccionado: ${nextRole}` : 'Rol limpiado');
}

function resetAll() {
  state.role = null;
  renderStatus();

  placeholderInputs.forEach((el) => {
    el.value = '';
  });

  logOutputEl.textContent = '';
  addLog('UI reiniciada (Milestone 1).');
}

btnRoleA.addEventListener('click', () => setRole('A'));
btnRoleB.addEventListener('click', () => setRole('B'));
btnResetRole.addEventListener('click', () => setRole(null));
btnResetAll.addEventListener('click', resetAll);

placeholderButtons.forEach((button) => {
  button.addEventListener('click', () => {
    addLog(
      `Acción "${button.textContent.trim()}" aún no implementada. Se activará en Milestone 2.`
    );
  });
});

addLog('App cargada. Milestone 1: solo interfaz estática.');
renderStatus();
