const MAX_ROADS = 4;
const trafficData = [10, 10, 10, 10];
const signalState = ['RED', 'RED', 'RED', 'RED'];

let currentGreen = 0;
let nextRoad = 0;
let timer = 10;
let phase = 0; // 0 = GREEN, 1 = YELLOW
let manualMode = false;
let manualRoad = -1;

const roadsGrid = document.getElementById('roadsGrid');
const modeLabel = document.getElementById('modeLabel');
const timerLabel = document.getElementById('timerLabel');
const modeButtons = document.querySelectorAll('.mode-btn');

function setSignalColor(roadIndex, color) {
  const signal = document.querySelector(`.signal[data-road="${roadIndex}"]`);
  if (!signal) return;

  const lights = signal.querySelectorAll('.light');
  lights.forEach((light) => {
    light.classList.remove('active');
  });

  const selected = signal.querySelector(`.light.${color.toLowerCase()}`);
  if (selected) selected.classList.add('active');
}

function refreshSignalDisplay() {
  for (let i = 0; i < MAX_ROADS; i++) {
    const state = signalState[i].toLowerCase();
    const signal = document.querySelector(`.signal[data-road="${i}"]`);
    if (signal) {
      signal.querySelectorAll('.light').forEach((light) => light.classList.remove('active'));
      const activeLight = signal.querySelector(`.light.${state}`);
      if (activeLight) activeLight.classList.add('active');
    }
  }
}

function controlSignals() {
  for (let i = 0; i < MAX_ROADS; i++) {
    signalState[i] = 'RED';
  }

  if (manualMode && manualRoad >= 0) {
    signalState[manualRoad] = 'GREEN';
    refreshSignalDisplay();
    return;
  }

  if (phase === 0) {
    signalState[currentGreen] = 'GREEN';
  } else {
    signalState[currentGreen] = 'YELLOW';
  }

  refreshSignalDisplay();
}

function selectNextRoad() {
  let maxTraffic = 0;
  let selected = currentGreen;

  for (let i = 0; i < MAX_ROADS; i++) {
    if (trafficData[i] > maxTraffic) {
      maxTraffic = trafficData[i];
      selected = i;
    }
  }

  if (maxTraffic < 30) {
    selected = (currentGreen + 1) % MAX_ROADS;
  }

  nextRoad = selected;
}

function renderRoads() {
  roadsGrid.innerHTML = '';

  for (let i = 0; i < MAX_ROADS; i++) {
    const card = document.createElement('div');
    card.className = 'road-card';

    const status = signalState[i];
    const badgeClass = status.toLowerCase();

    card.innerHTML = `
      <div class="road-card-header">
        <h3>Road ${i + 1}</h3>
        <span class="badge ${badgeClass}">${status}</span>
      </div>
      <div class="traffic-bar">
        <div class="traffic-fill" style="width: ${Math.min(trafficData[i], 100)}%"></div>
      </div>
      <div class="traffic-card">Traffic: ${trafficData[i]} vehicles</div>
    `;

    roadsGrid.appendChild(card);
  }

  timerLabel.textContent = `Timer: ${timer}s`;
  modeLabel.textContent = manualMode ? 'MANUAL' : 'AUTO';
}

function setMode(mode, roadIndex = -1) {
  if (mode === 'auto') {
    manualMode = false;
    manualRoad = -1;
  } else {
    manualMode = true;
    manualRoad = roadIndex;
  }

  modeButtons.forEach((button) => {
    const isAuto = button.dataset.mode === 'auto';
    if (isAuto) {
      button.classList.toggle('active', !manualMode);
    } else {
      const roadNum = Number(button.dataset.road);
      button.classList.toggle('active', manualMode && manualRoad === roadNum);
    }
  });

  controlSignals();
  renderRoads();
}

function advanceCycle() {
  if (manualMode) {
    renderRoads();
    return;
  }

  timer -= 1;

  if (timer === 3 && phase === 0) {
    phase = 1;
  }

  if (timer <= 0) {
    selectNextRoad();
    currentGreen = nextRoad;
    phase = 0;
    timer = 10;
  }

  controlSignals();
  renderRoads();
}

function randomizeTraffic() {
  for (let i = 0; i < MAX_ROADS; i++) {
    const change = Math.floor(Math.random() * 9) - 2;
    trafficData[i] = Math.max(5, Math.min(100, trafficData[i] + change));
  }
}

modeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (button.dataset.mode === 'auto') {
      setMode('auto');
    } else {
      setMode('manual', Number(button.dataset.road));
    }
  });
});

setInterval(() => {
  randomizeTraffic();
  advanceCycle();
}, 1000);

controlSignals();
renderRoads();
