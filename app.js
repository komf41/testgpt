const state = {
  role: null,
  pc: null,
  dc: null,
};

const statusEl = document.getElementById('connectionStatus');
const logOutputEl = document.getElementById('logOutput');
const chatMessagesEl = document.getElementById('chatMessages');
const chatFormEl = document.getElementById('chatForm');
const chatInputEl = document.getElementById('chatInput');
const btnSendEl = document.getElementById('btnSend');

const btnRoleA = document.getElementById('btnRoleA');
const btnRoleB = document.getElementById('btnRoleB');
const btnResetRole = document.getElementById('btnResetRole');
const btnResetAll = document.getElementById('btnResetAll');

const offerLocalEl = document.getElementById('offerLocal');
const offerRemoteEl = document.getElementById('offerRemote');
const answerLocalEl = document.getElementById('answerLocal');
const answerRemoteEl = document.getElementById('answerRemote');

const btnGenerateOffer = document.getElementById('btnGenerateOffer');
const btnApplyOffer = document.getElementById('btnApplyOffer');
const btnGenerateAnswer = document.getElementById('btnGenerateAnswer');
const btnApplyAnswer = document.getElementById('btnApplyAnswer');

function nowTime() {
  return new Date().toLocaleTimeString('es-ES', { hour12: false });
}

function addLog(message) {
  const line = `[${nowTime()}] ${message}`;
  logOutputEl.textContent = logOutputEl.textContent
    ? `${logOutputEl.textContent}\n${line}`
    : line;
  logOutputEl.scrollTop = logOutputEl.scrollHeight;
}

function setStatus(text, kind = 'idle') {
  statusEl.textContent = `Estado: ${text}`;
  statusEl.className = `status status--${kind}`;
}

function renderStatus() {
  if (!state.role) {
    setStatus('idle', 'idle');
    return;
  }

  const roleText = `rol ${state.role}`;

  if (state.dc?.readyState === 'open') {
    setStatus(`${roleText} conectado (DataChannel open)`, 'connected');
    return;
  }

  if (state.pc?.connectionState === 'connecting' || state.pc?.iceConnectionState === 'checking') {
    setStatus(`${roleText} conectando...`, 'selected');
    return;
  }

  if (state.pc) {
    setStatus(`${roleText} listo para señalización manual`, 'selected');
    return;
  }

  setStatus(`${roleText} seleccionado`, 'selected');
}

function clearChatMessages() {
  chatMessagesEl.innerHTML = '';
}

function addChatMessage(author, message) {
  const row = document.createElement('div');
  row.className = 'chat-message';
  row.innerHTML = `<strong>${author}:</strong> ${message}`;
  chatMessagesEl.appendChild(row);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

function updateChatAvailability() {
  const isOpen = state.dc?.readyState === 'open';
  chatInputEl.disabled = !isOpen;
  btnSendEl.disabled = !isOpen;

  if (!isOpen) {
    chatInputEl.value = '';
  }
}

function closeConnection() {
  if (state.dc) {
    state.dc.onopen = null;
    state.dc.onclose = null;
    state.dc.onmessage = null;
    state.dc.onerror = null;
    state.dc.close();
  }

  if (state.pc) {
    state.pc.onicecandidate = null;
    state.pc.onconnectionstatechange = null;
    state.pc.oniceconnectionstatechange = null;
    state.pc.ondatachannel = null;
    state.pc.close();
  }

  state.dc = null;
  state.pc = null;
  updateChatAvailability();
}

function resetSignalTextAreas() {
  offerLocalEl.value = '';
  offerRemoteEl.value = '';
  answerLocalEl.value = '';
  answerRemoteEl.value = '';
}

function resetAll() {
  closeConnection();
  state.role = null;
  resetSignalTextAreas();
  clearChatMessages();
  logOutputEl.textContent = '';
  addLog('App reiniciada.');
  renderStatus();
}

function setRole(nextRole) {
  state.role = nextRole;
  closeConnection();
  resetSignalTextAreas();
  clearChatMessages();
  updateChatAvailability();

  addLog(nextRole ? `Rol seleccionado: ${nextRole}` : 'Rol limpiado');
  renderStatus();
}

function createPeerConnection() {
  closeConnection();

  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  });

  pc.onconnectionstatechange = () => {
    addLog(`pc.connectionState = ${pc.connectionState}`);
    renderStatus();
  };

  pc.oniceconnectionstatechange = () => {
    addLog(`pc.iceConnectionState = ${pc.iceConnectionState}`);
    renderStatus();
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      addLog('Nuevo ICE candidate local recopilado.');
    } else {
      addLog('ICE gathering local finalizado.');
    }
  };

  pc.ondatachannel = (event) => {
    addLog(`DataChannel recibido: "${event.channel.label}"`);
    attachDataChannel(event.channel);
  };

  state.pc = pc;
  renderStatus();
  return pc;
}

function attachDataChannel(channel) {
  state.dc = channel;

  channel.onopen = () => {
    addLog('DataChannel abierto. Ya puedes chatear.');
    updateChatAvailability();
    renderStatus();
  };

  channel.onclose = () => {
    addLog('DataChannel cerrado.');
    updateChatAvailability();
    renderStatus();
  };

  channel.onerror = () => {
    addLog('Error en DataChannel.');
  };

  channel.onmessage = (event) => {
    addChatMessage('Peer', event.data);
    addLog(`Mensaje recibido (${event.data.length} chars).`);
  };

  updateChatAvailability();
  renderStatus();
}

function parseSignalJson(raw, expectedType) {
  let parsed;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('JSON inválido. Verifica formato de señalización.');
  }

  if (!parsed || parsed.type !== expectedType || typeof parsed.sdp !== 'string') {
    throw new Error(`El JSON debe incluir {"type":"${expectedType}","sdp":"..."}.`);
  }

  return parsed;
}

function waitForIceGatheringComplete(pc, timeoutMs = 12000) {
  if (pc.iceGatheringState === 'complete') {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout esperando ICE gathering completo.'));
    }, timeoutMs);

    const onStateChange = () => {
      if (pc.iceGatheringState === 'complete') {
        cleanup();
        resolve();
      }
    };

    function cleanup() {
      clearTimeout(timeoutId);
      pc.removeEventListener('icegatheringstatechange', onStateChange);
    }

    pc.addEventListener('icegatheringstatechange', onStateChange);
  });
}

function exportLocalDescriptionToTextArea(targetEl, description) {
  targetEl.value = JSON.stringify(description, null, 2);
}

async function handleGenerateOffer() {
  if (state.role !== 'A') {
    addLog('Primero selecciona rol A para generar offer.');
    return;
  }

  const pc = createPeerConnection();

  const channel = pc.createDataChannel('chat');
  attachDataChannel(channel);
  addLog('DataChannel local creado (A).');

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  addLog('Offer creada y establecida como localDescription. Esperando ICE...');

  await waitForIceGatheringComplete(pc);
  exportLocalDescriptionToTextArea(offerLocalEl, pc.localDescription);
  addLog('Offer local exportada como JSON. Cópiala al peer B.');
}

async function handleApplyOffer() {
  if (state.role !== 'B') {
    addLog('Primero selecciona rol B para aplicar una offer remota.');
    return;
  }

  const raw = offerRemoteEl.value.trim();
  if (!raw) {
    addLog('No hay offer remota para aplicar.');
    return;
  }

  const remoteOffer = parseSignalJson(raw, 'offer');
  const pc = state.pc ?? createPeerConnection();

  await pc.setRemoteDescription(remoteOffer);
  addLog('Offer remota aplicada correctamente en B.');
}

async function handleGenerateAnswer() {
  if (state.role !== 'B') {
    addLog('Primero selecciona rol B para generar answer.');
    return;
  }

  const pc = state.pc;
  if (!pc || !pc.remoteDescription || pc.remoteDescription.type !== 'offer') {
    addLog('Debes aplicar primero una offer remota válida antes de generar answer.');
    return;
  }

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  addLog('Answer creada y establecida como localDescription. Esperando ICE...');

  await waitForIceGatheringComplete(pc);
  exportLocalDescriptionToTextArea(answerLocalEl, pc.localDescription);
  addLog('Answer local exportada como JSON. Cópiala al peer A.');
}

async function handleApplyAnswer() {
  if (state.role !== 'A') {
    addLog('Primero selecciona rol A para aplicar una answer remota.');
    return;
  }

  const pc = state.pc;
  if (!pc) {
    addLog('Primero genera una offer local para crear la conexión en A.');
    return;
  }

  const raw = answerRemoteEl.value.trim();
  if (!raw) {
    addLog('No hay answer remota para aplicar.');
    return;
  }

  const remoteAnswer = parseSignalJson(raw, 'answer');
  await pc.setRemoteDescription(remoteAnswer);
  addLog('Answer remota aplicada correctamente en A.');
}

async function runAction(action, label) {
  try {
    await action();
    renderStatus();
  } catch (error) {
    addLog(`${label}: ${error.message}`);
  }
}

btnRoleA.addEventListener('click', () => setRole('A'));
btnRoleB.addEventListener('click', () => setRole('B'));
btnResetRole.addEventListener('click', () => setRole(null));
btnResetAll.addEventListener('click', resetAll);

btnGenerateOffer.addEventListener('click', () => runAction(handleGenerateOffer, 'Error generando offer'));
btnApplyOffer.addEventListener('click', () => runAction(handleApplyOffer, 'Error aplicando offer'));
btnGenerateAnswer.addEventListener('click', () => runAction(handleGenerateAnswer, 'Error generando answer'));
btnApplyAnswer.addEventListener('click', () => runAction(handleApplyAnswer, 'Error aplicando answer'));

chatFormEl.addEventListener('submit', (event) => {
  event.preventDefault();

  const message = chatInputEl.value.trim();
  if (!message || !state.dc || state.dc.readyState !== 'open') {
    return;
  }

  state.dc.send(message);
  addChatMessage('Yo', message);
  addLog(`Mensaje enviado (${message.length} chars).`);
  chatInputEl.value = '';
  chatInputEl.focus();
});

addLog('App cargada. Milestone 2 listo: señalización manual + chat DataChannel.');
updateChatAvailability();
renderStatus();
