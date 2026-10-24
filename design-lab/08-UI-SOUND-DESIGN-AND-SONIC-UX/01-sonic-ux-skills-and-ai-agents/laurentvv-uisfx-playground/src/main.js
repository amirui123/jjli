import { createUISFX, CATEGORIES, CUES, PACKS } from 'uisfx';

// Initialiser le moteur UI SFX
const ui = createUISFX({
  pack: 'minimal',
  volume: 0.7,
  enabled: true,
});

// Éléments DOM
const audioStatusEl = document.getElementById('audio-status');
const audioStatusLabel = document.getElementById('audio-status-label');
const volumeSlider = document.getElementById('volume-slider');
const volumeVal = document.getElementById('volume-val');
const toggleMuteBtn = document.getElementById('toggle-mute');
const muteIcon = document.getElementById('mute-icon');
const muteLabel = document.getElementById('mute-label');
const btnStopAll = document.getElementById('btn-stop-all');
const currentPackInfo = document.getElementById('current-pack-info');
const packsContainer = document.getElementById('packs-container');
const categoriesFilter = document.getElementById('categories-filter');
const cuesGrid = document.getElementById('cues-grid');
const cueSearchInput = document.getElementById('cue-search');
const toastEl = document.getElementById('toast');
const activeLoopsBar = document.getElementById('active-loops-bar');
const activeLoopsLabel = document.getElementById('active-loops-label');
const btnStopActiveLoop = document.getElementById('btn-stop-active-loop');

// Suivi des états
let isUnlocked = false;
let currentActiveLoop = null;
let currentLoopName = '';
let activeCategory = 'all';
let searchQuery = '';

// 1. Déverrouillage AudioContext
async function unlockAudio() {
  if (isUnlocked) return;
  const success = await ui.unlock();
  if (success) {
    isUnlocked = true;
    audioStatusEl.classList.add('unlocked');
    audioStatusLabel.textContent = 'AudioContext Actif & Prêt';
  }
}

window.addEventListener('pointerdown', unlockAudio, { once: true });
window.addEventListener('keydown', unlockAudio, { once: true });

// Toast notification
let toastTimeout;
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.remove('hidden');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.classList.add('hidden');
  }, 2200);
}

// 2. Gestion du Volume et Mute
volumeSlider.addEventListener('input', (e) => {
  const vol = Number(e.target.value) / 100;
  volumeVal.textContent = `${e.target.value}%`;
  ui.setVolume(vol);
});

toggleMuteBtn.addEventListener('click', () => {
  const willEnable = !ui.isEnabled();
  ui.setEnabled(willEnable);
  if (willEnable) {
    muteIcon.textContent = '🔊';
    muteLabel.textContent = 'Son Actif';
    toggleMuteBtn.classList.remove('btn-danger');
    toggleMuteBtn.classList.add('btn-secondary');
    showToast('Son réactivé');
  } else {
    muteIcon.textContent = '🔇';
    muteLabel.textContent = 'Son Coupé';
    toggleMuteBtn.classList.remove('btn-secondary');
    toggleMuteBtn.classList.add('btn-danger');
    stopActiveLoop();
    showToast('Son coupé (Mute)');
  }
});

btnStopAll.addEventListener('click', () => {
  ui.stopAll();
  stopActiveLoop();
  showToast('Tous les sons ont été arrêtés');
});

// 3. Boucles d'états (Loops)
function setActiveLoop(handle, cueName) {
  stopActiveLoop();
  currentActiveLoop = handle;
  currentLoopName = cueName;
  activeLoopsLabel.innerHTML = `Boucle en cours : <strong>${cueName}</strong>`;
  activeLoopsBar.classList.remove('hidden');
}

function stopActiveLoop() {
  if (currentActiveLoop) {
    currentActiveLoop.stop();
    currentActiveLoop = null;
  }
  currentLoopName = '';
  activeLoopsBar.classList.add('hidden');
}

btnStopActiveLoop.addEventListener('click', () => {
  stopActiveLoop();
  showToast('Boucle arrêtée');
});

// 4. Rendu des Packs
function renderPacks() {
  packsContainer.innerHTML = '';
  PACKS.forEach((pack) => {
    const card = document.createElement('div');
    card.className = `pack-card ${pack.name === ui.getPack() ? 'active' : ''}`;
    card.dataset.pack = pack.name;

    card.innerHTML = `
      <div>
        <div class="pack-card-header">
          <span class="pack-name">${pack.label}</span>
          <span class="pack-color-pill" style="background-color: ${pack.color || '#388bfd'}"></span>
        </div>
        <p class="pack-desc">${pack.description}</p>
      </div>
      <div style="margin-top: 8px; font-size: 0.7rem; color: var(--text-dim)">
        ${pack.bestFor || ''}
      </div>
    `;

    card.addEventListener('click', async () => {
      await unlockAudio();
      ui.setPack(pack.name);
      document.querySelectorAll('.pack-card').forEach((c) => c.classList.remove('active'));
      card.classList.add('active');
      currentPackInfo.innerHTML = `Pack actuel : <strong>${pack.label}</strong> (${pack.description})`;
      ui.play('select');
      showToast(`Pack activé : ${pack.label}`);
    });

    packsContainer.appendChild(card);
  });
}

// 5. Rendu des Filtres de Catégories
function renderCategoryFilters() {
  CATEGORIES.forEach((cat) => {
    const btn = document.createElement('button');
    btn.className = 'cat-pill';
    btn.dataset.category = cat.id;
    btn.textContent = cat.label;

    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = cat.id;
      renderCues();
    });

    categoriesFilter.appendChild(btn);
  });

  const allBtn = categoriesFilter.querySelector('[data-category="all"]');
  allBtn.addEventListener('click', () => {
    document.querySelectorAll('.cat-pill').forEach((b) => b.classList.remove('active'));
    allBtn.classList.add('active');
    activeCategory = 'all';
    renderCues();
  });
}

// 6. Rendu de la grille des Cues
function renderCues() {
  cuesGrid.innerHTML = '';
  const filtered = CUES.filter((cue) => {
    const matchCategory = activeCategory === 'all' || cue.category === activeCategory;
    const matchSearch =
      cue.name.toLowerCase().includes(searchQuery) ||
      cue.label.toLowerCase().includes(searchQuery) ||
      cue.description.toLowerCase().includes(searchQuery);
    return matchCategory && matchSearch;
  });

  if (filtered.length === 0) {
    cuesGrid.innerHTML = `<div style="grid-column: 1/-1; padding: 20px; text-align: center; color: var(--text-muted)">Aucun son trouvé</div>`;
    return;
  }

  filtered.forEach((cue) => {
    const card = document.createElement('div');
    card.className = `cue-card ${cue.loop ? 'is-loop' : ''}`;
    card.dataset.cue = cue.name;

    card.innerHTML = `
      <div>
        <div class="cue-name">
          <span>${cue.label}</span>
          ${cue.loop ? '<span class="loop-badge">Loop</span>' : ''}
        </div>
        <span class="cue-cat-tag">${cue.category}</span>
      </div>
      <p class="cue-desc">${cue.description}</p>
    `;

    card.addEventListener('click', async () => {
      await unlockAudio();

      if (cue.loop) {
        if (currentLoopName === cue.name) {
          stopActiveLoop();
          showToast(`Boucle ${cue.name} arrêtée`);
        } else {
          const handle = ui.play(cue.name);
          if (handle) {
            setActiveLoop(handle, cue.name);
            showToast(`Boucle lancée : ${cue.name}`);
          }
        }
      } else {
        card.classList.add('pulse-active');
        setTimeout(() => card.classList.remove('pulse-active'), 200);
        ui.play(cue.name);
        showToast(`Joué : ${cue.name} (${ui.getPack()})`);
      }
    });

    cuesGrid.appendChild(card);
  });
}

cueSearchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value.toLowerCase().trim();
  renderCues();
});

// 7. Composants de Simulation Interactive
function setupSimulations() {
  // Save
  document.getElementById('sim-save').addEventListener('click', async () => {
    await unlockAudio();
    ui.play('success');
    showToast('Enregistrement confirmé !');
  });

  // Delete
  document.getElementById('sim-delete').addEventListener('click', async () => {
    await unlockAudio();
    ui.play('delete');
    showToast('Élément supprimé !');
  });

  // Cancel
  document.getElementById('sim-cancel').addEventListener('click', async () => {
    await unlockAudio();
    ui.play('cancel');
    showToast('Action annulée');
  });

  // Copy
  document.getElementById('sim-copy').addEventListener('click', async () => {
    await unlockAudio();
    ui.play('copy');
    showToast('Lien copié dans le presse-papier !');
  });

  // Toggle switch
  const toggleSwitch = document.getElementById('sim-toggle-switch');
  const toggleLabel = document.getElementById('toggle-label');
  toggleSwitch.addEventListener('change', async () => {
    await unlockAudio();
    if (toggleSwitch.checked) {
      ui.play('toggle-on');
      toggleLabel.textContent = 'Mode Sombre (Activé)';
    } else {
      ui.play('toggle-off');
      toggleLabel.textContent = 'Mode Sombre (Désactivé)';
    }
  });

  // Checkbox
  const checkbox = document.getElementById('sim-checkbox');
  checkbox.addEventListener('change', async () => {
    await unlockAudio();
    if (checkbox.checked) {
      ui.play('check');
    } else {
      ui.play('uncheck');
    }
  });

  // Tabs
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach((tab) => {
    tab.addEventListener('click', async () => {
      await unlockAudio();
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      ui.play('select');
      showToast(`Onglet : ${tab.textContent}`);
    });
  });

  // Long Async Process Simulation
  const startProcessBtn = document.getElementById('sim-start-process');
  const cancelProcessBtn = document.getElementById('sim-cancel-process');
  const asyncStatus = document.getElementById('async-status');
  const progressBar = document.getElementById('async-progress-bar');
  let processInterval = null;
  let processLoopHandle = null;

  startProcessBtn.addEventListener('click', async () => {
    await unlockAudio();
    startProcessBtn.disabled = true;
    cancelProcessBtn.disabled = false;
    asyncStatus.textContent = 'Traitement en cours...';
    progressBar.style.width = '0%';

    // Démarrer la boucle sonore "processing"
    processLoopHandle = ui.play('processing');
    setActiveLoop(processLoopHandle, 'processing');

    let progress = 0;
    processInterval = setInterval(() => {
      progress += 20;
      progressBar.style.width = `${progress}%`;

      if (progress < 100) {
        ui.play('progress-step');
      } else {
        clearInterval(processInterval);
        stopActiveLoop();
        ui.play('complete');
        asyncStatus.textContent = 'Traitement terminé avec succès !';
        startProcessBtn.disabled = false;
        cancelProcessBtn.disabled = true;
        showToast('Tâche asynchrone complétée !');
      }
    }, 700);
  });

  cancelProcessBtn.addEventListener('click', async () => {
    if (processInterval) {
      clearInterval(processInterval);
      stopActiveLoop();
      ui.play('cancel');
      asyncStatus.textContent = 'Traitement annulé';
      progressBar.style.width = '0%';
      startProcessBtn.disabled = false;
      cancelProcessBtn.disabled = true;
      showToast('Traitement annulé');
    }
  });

  // Gamification & Rewards
  document.getElementById('sim-reward').addEventListener('click', async () => {
    await unlockAudio();
    ui.play('reward');
    showToast('+50 Points gagnés !');
  });

  document.getElementById('sim-levelup').addEventListener('click', async () => {
    await unlockAudio();
    ui.play('level-up');
    showToast('Niveau Supérieur ! (Level 12)');
  });

  document.getElementById('sim-streak').addEventListener('click', async () => {
    await unlockAudio();
    ui.play('streak');
    showToast('Série active : 7 jours consécutifs !');
  });

  document.getElementById('sim-achievement').addEventListener('click', async () => {
    await unlockAudio();
    ui.play('achievement');
    showToast('Trophée : Maître du Son débloqué !');
  });

  // Drag & Drop
  const dndItem = document.getElementById('dnd-item');
  const validZone = document.getElementById('dnd-valid-zone');
  const invalidZone = document.getElementById('dnd-invalid-zone');

  dndItem.addEventListener('dragstart', async () => {
    await unlockAudio();
    ui.play('drag-start');
  });

  [validZone, invalidZone].forEach((zone) => {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('dragover');
    });
    zone.addEventListener('dragleave', () => {
      zone.classList.remove('dragover');
    });
  });

  validZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    validZone.classList.remove('dragover');
    await unlockAudio();
    ui.play('drop');
    showToast('Déposé avec succès !');
  });

  invalidZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    invalidZone.classList.remove('dragover');
    await unlockAudio();
    ui.play('invalid-drop');
    showToast('Dépôt invalide refusé !');
  });
}

// Initialisation globale
renderPacks();
renderCategoryFilters();
renderCues();
setupSimulations();
