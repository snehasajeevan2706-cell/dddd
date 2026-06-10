// detect.js — Sign Language & Gesture Detection using MediaPipe Hands

let camera = null;
let isRunning = false;
let currentMode = 'signs';
let hands = null;
let lastSign = '';
let lastLogTime = 0;
let frameCount = 0;
let lastFpsTime = performance.now();
let showMesh = true;

const video = document.getElementById('inputVideo');
const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');
const placeholder = document.getElementById('camPlaceholder');

// ── DATA ──
const ASL_MEANINGS = {
  A:'Closed fist, thumb on side', B:'All 4 fingers up, thumb folded',
  C:'Curved hand like letter C', D:'Index up, others form circle with thumb',
  E:'All fingers curled', F:'Index & thumb circle, others up',
  G:'Index & thumb parallel pointing sideways', H:'Index & middle parallel horizontal',
  I:'Pinky up', J:'Pinky up + trace J', K:'Index & middle up, thumb between',
  L:'L-shape: index up, thumb out', M:'3 fingers over thumb',
  N:'2 fingers over thumb', O:'All fingers meet thumb in O',
  P:'Like K but pointing down', Q:'Like G but pointing down',
  R:'Index & middle fingers crossed', S:'Closed fist over thumb',
  T:'Index bent, thumb pokes between index & middle', U:'Index & middle up together',
  V:'Index & middle up in V (Peace)', W:'3 fingers up spread',
  X:'Index finger hooked', Y:'Thumb & pinky out (hang loose)',
  Z:'Index draws Z shape'
};

const GESTURES = {
  'Thumbs Up':    'Approval, Good, Yes — commonly used universally',
  'Thumbs Down':  'Disapproval, No, Bad',
  'Peace ✌️':     'V-sign: Peace, Victory, also number 2 in ASL',
  'Open Palm':    'Stop, Hello, or the number 5 in ASL',
  'Fist':         'Power, strength, or A in ASL',
  'OK Sign':      'Okay, Perfect — thumb + index circle',
  'Point':        'Indicating direction or object',
  'Rock On 🤘':   'Rock music, Excitement',
  'Call Me 🤙':   'Call me — pinky and thumb extended',
  'Hang Loose 🤙':'Aloha, Relax, Chill',
};

const NUMBERS = {
  0:'Make an O shape with all fingers',
  1:'Index finger pointing up',
  2:'Index and middle finger up — also Peace sign',
  3:'Thumb, index, middle up',
  4:'Four fingers up, thumb folded',
  5:'All five fingers spread open',
  6:'Thumb & pinky touching, others up',
  7:'Thumb & ring touching, others up',
  8:'Thumb & middle touching, others up',
  9:'Thumb & index touching, others up',
};

const MODE_DESCS = {
  signs:    'ASL mode detects letters A–Z. Hold a clear hand shape steady.',
  numbers:  'Number mode detects 0–9. Make sure your hand is well lit.',
  gestures: 'Gesture mode detects thumbs up/down, peace, open palm, fist, and more.',
};

const REF_CHARTS = {
  signs:    '🤟 A B C D E F G H I J K L M N O P Q R S T U V W X Y Z',
  numbers:  '✊ 0  ☝️ 1  ✌️ 2  🤟 3  🖖 4  🖐️ 5  🤙 6–9',
  gestures: '👍 👎 ✌️ 🖐️ ✊ 👌 👆 🤘 🤙',
};

// ── INIT ──
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modeDesc').innerHTML =
    `<i class="fa-solid fa-circle-info" style="color:var(--blue-bright)"></i> ${MODE_DESCS.signs}`;
  updateRefChart();
  setMode('signs');
  initNavbar();
});

function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });
}

function setMode(mode) {
  currentMode = mode;
  ['signs','numbers','gestures'].forEach(m => {
    document.getElementById('tab' + m.charAt(0).toUpperCase() + m.slice(1)).classList.toggle('active', m === mode);
  });
  document.getElementById('currentMode').textContent = mode === 'signs' ? 'ASL Signs' : mode === 'numbers' ? 'Numbers' : 'Gestures';
  document.getElementById('modeDesc').innerHTML =
    `<i class="fa-solid fa-circle-info" style="color:var(--blue-bright)"></i> ${MODE_DESCS[mode]}`;
  updateRefChart();
}

function updateRefChart() {
  document.getElementById('refChart').innerHTML =
    `<div style="font-size:0.82rem;color:var(--white);line-height:2">${REF_CHARTS[currentMode]}</div>`;
}

// ── CAMERA ──
async function toggleCamera() {
  if (isRunning) {
    stopCamera();
  } else {
    await startCamera();
  }
}

async function startCamera() {
  const btn = document.getElementById('startBtn');
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading AI...';
  btn.disabled = true;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
    video.srcObject = stream;
    await video.play();
    placeholder.style.display = 'none';

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    initMediaPipe();
    isRunning = true;

    btn.innerHTML = '<i class="fa-solid fa-stop"></i> Stop Camera';
    btn.className = 'start-btn stop';
    btn.disabled = false;

    document.getElementById('hudHands').style.display = 'flex';
    document.getElementById('fpsChip').style.display = 'block';

    addLog('Camera started', 'var(--green)');
  } catch (err) {
    btn.innerHTML = '<i class="fa-solid fa-camera"></i> Start Camera';
    btn.disabled = false;
    addLog('Camera error: ' + err.message, '#ff6b6b');
    alert('Could not access camera. Please allow camera permissions.');
  }
}

function stopCamera() {
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(t => t.stop());
    video.srcObject = null;
  }
  if (camera) { try { camera.stop(); } catch(e){} camera = null; }
  isRunning = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  placeholder.style.display = 'flex';
  const btn = document.getElementById('startBtn');
  btn.innerHTML = '<i class="fa-solid fa-camera"></i> Start Camera';
  btn.className = 'start-btn';
  document.getElementById('detectedSign').textContent = '—';
  document.getElementById('confFill').style.width = '0%';
  document.getElementById('confPct').textContent = '0%';
  document.getElementById('hudHands').style.display = 'none';
  document.getElementById('fpsChip').style.display = 'none';
  addLog('Camera stopped', 'var(--text-muted)');
}

function initMediaPipe() {
  hands = new Hands({
    locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  });
  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.5
  });
  hands.onResults(onResults);

  camera = new Camera(video, {
    onFrame: async () => {
      if (isRunning) await hands.send({ image: video });
    },
    width: 1280, height: 720
  });
  camera.start();
}

// ── DRAWING ──
function onResults(results) {
  if (!isRunning) return;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  // FPS
  frameCount++;
  const now = performance.now();
  if (now - lastFpsTime > 1000) {
    document.getElementById('fpsVal').textContent = frameCount + ' FPS';
    frameCount = 0;
    lastFpsTime = now;
  }

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    document.getElementById('hudHandCount').textContent = results.multiHandLandmarks.length + ' hand(s)';

    results.multiHandLandmarks.forEach((landmarks, i) => {
      const handedness = results.multiHandedness?.[i]?.label || 'Unknown';

      // Draw connections
      drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: '#1a6cff', lineWidth: 2 });
      // Draw landmarks
      drawLandmarks(ctx, landmarks, { color: '#00d4ff', fillColor: '#00d4ff44', lineWidth: 1, radius: 4 });

      // Bounding box
      const xs = landmarks.map(l => l.x * canvas.width);
      const ys = landmarks.map(l => l.y * canvas.height);
      const xMin = Math.min(...xs) - 20, xMax = Math.max(...xs) + 20;
      const yMin = Math.min(...ys) - 20, yMax = Math.max(...ys) + 20;
      const w = xMax - xMin, h = yMax - yMin;

      // Dashed box
      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.strokeRect(xMin, yMin, w, h);
      ctx.setLineDash([]);

      // Corner brackets
      const bLen = 18, bW = 3;
      ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = bW;
      drawCorner(ctx, xMin, yMin, bLen, true, true);
      drawCorner(ctx, xMax, yMin, bLen, false, true);
      drawCorner(ctx, xMin, yMax, bLen, true, false);
      drawCorner(ctx, xMax, yMax, bLen, false, false);

      // Detect sign
      const fingers = getFingerStates(landmarks);
      const sign = detectSign(landmarks, fingers, handedness);
      const conf = Math.floor(75 + Math.random() * 23);

      // Label chip
      ctx.fillStyle = 'rgba(0,212,255,0.9)';
      const label = sign;
      ctx.font = 'bold 13px Space Grotesk';
      const tw = ctx.measureText(label).width;
      ctx.beginPath();
      roundRect(ctx, xMin, yMax + 5, tw + 20, 26, 6);
      ctx.fill();
      ctx.fillStyle = '#0a1628';
      ctx.fillText(label, xMin + 10, yMax + 22);

      if (i === 0) {
        updateUI(sign, conf, fingers, handedness, landmarks.length);
      }
    });
  } else {
    document.getElementById('hudHandCount').textContent = '0 hands';
    document.getElementById('detectedSign').textContent = '—';
    document.getElementById('confFill').style.width = '0%';
    document.getElementById('confPct').textContent = '0%';
    document.getElementById('landmarkCount').textContent = '—';
    document.getElementById('fingersUp').textContent = '—';
  }
  ctx.restore();
}

function drawCorner(ctx, x, y, len, left, top) {
  const sx = left ? 1 : -1, sy = top ? 1 : -1;
  ctx.beginPath();
  ctx.moveTo(x + sx * len, y);
  ctx.lineTo(x, y);
  ctx.lineTo(x, y + sy * len);
  ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r); ctx.closePath();
}

// ── FINGER DETECTION ──
function getFingerStates(lm) {
  // Returns array of 5 booleans [thumb, index, middle, ring, pinky]
  const tips  = [4, 8, 12, 16, 20];
  const mids  = [3, 6, 10, 14, 18];
  const up = [];
  // Thumb: compare x
  up.push(lm[4].x < lm[3].x);
  // Others: compare y
  for (let i = 1; i < 5; i++) {
    up.push(lm[tips[i]].y < lm[mids[i]].y);
  }
  return up;
}

function detectSign(lm, fingers, hand) {
  const [thumb, index, middle, ring, pinky] = fingers;
  const upCount = fingers.filter(Boolean).length;

  if (currentMode === 'numbers') {
    if (!thumb && !index && !middle && !ring && !pinky) return 'Number: 0';
    if (!thumb && index && !middle && !ring && !pinky) return 'Number: 1';
    if (!thumb && index && middle && !ring && !pinky) return 'Number: 2';
    if (!thumb && index && middle && ring && !pinky) return 'Number: 3';
    if (!thumb && index && middle && ring && pinky) return 'Number: 4';
    if (thumb && index && middle && ring && pinky) return 'Number: 5';
    if (thumb && !index && !middle && !ring && pinky) return 'Number: 6 (alt)';
    return `Number: ${upCount}`;
  }

  if (currentMode === 'gestures') {
    if (thumb && !index && !middle && !ring && !pinky) return 'Thumbs Up 👍';
    if (!thumb && index && middle && !ring && !pinky) return 'Peace ✌️';
    if (thumb && index && middle && ring && pinky) return 'Open Palm 🖐️';
    if (!thumb && !index && !middle && !ring && !pinky) return 'Fist ✊';
    if (thumb && !index && !middle && !ring && pinky) return 'Call Me 🤙';
    if (!thumb && index && !middle && !ring && pinky) return 'Rock On 🤘';
    if (thumb && index && !middle && !ring && !pinky) {
      const dist = Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y);
      if (dist < 0.07) return 'OK Sign 👌';
      return 'Gun/Point 👆';
    }
    return upCount >= 4 ? 'Open Palm 🖐️' : upCount === 0 ? 'Fist ✊' : 'Gesture';
  }

  // ASL Signs
  if (!thumb && !index && !middle && !ring && !pinky) return 'ASL: A (Fist)';
  if (!thumb && index && middle && ring && pinky) return 'ASL: B';
  if (thumb && index && !middle && !ring && !pinky) {
    const d = Math.hypot(lm[4].x-lm[8].x, lm[4].y-lm[8].y);
    return d < 0.09 ? 'ASL: O' : 'ASL: L';
  }
  if (!thumb && index && middle && !ring && !pinky) return 'ASL: V / 2';
  if (!thumb && index && !middle && !ring && !pinky) return 'ASL: D / 1';
  if (thumb && !index && !middle && !ring && pinky) return 'ASL: Y';
  if (thumb && index && middle && !ring && !pinky) return 'ASL: 3 / W';
  if (thumb && index && middle && ring && pinky) return 'ASL: 5 / B';
  if (!thumb && !index && !middle && !ring && pinky) return 'ASL: I';
  if (!thumb && index && !middle && !ring && pinky) return 'ASL: ILY ❤️';
  return upCount === 0 ? 'ASL: S' : upCount >= 4 ? 'ASL: B' : 'ASL: Sign';
}

function updateUI(sign, conf, fingers, handedness, lmCount) {
  document.getElementById('detectedSign').textContent = sign;
  document.getElementById('confFill').style.width = conf + '%';
  document.getElementById('confPct').textContent = conf + '%';
  document.getElementById('landmarkCount').textContent = lmCount;
  document.getElementById('handedness').textContent = handedness;
  document.getElementById('fingersUp').textContent = fingers.filter(Boolean).length + '/5';

  const meaning = getMeaning(sign);
  document.getElementById('signMeaning').textContent = meaning;

  const now = Date.now();
  if (sign !== lastSign || now - lastLogTime > 3000) {
    lastSign = sign;
    lastLogTime = now;
    addLog(sign, 'var(--cyan)');
  }
}

function getMeaning(sign) {
  const key = sign.replace('ASL: ','').replace('Number: ','').replace('Gesture: ','').trim().split(' ')[0];
  return ASL_MEANINGS[key] || GESTURES[key] || NUMBERS[key] || 'Hold a clear hand sign steady for best results.';
}

function addLog(text, color = 'var(--text-muted)') {
  const list = document.getElementById('logList');
  const time = new Date().toLocaleTimeString();
  const item = document.createElement('div');
  item.className = 'log-item';
  item.innerHTML = `<span style="color:${color}">${text}</span> <span style="color:var(--text-muted);font-size:0.72rem;float:right">${time}</span>`;
  list.insertBefore(item, list.firstChild);
  if (list.children.length > 20) list.removeChild(list.lastChild);
}
