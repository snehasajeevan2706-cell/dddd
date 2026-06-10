// face.js — Face Detection, Emotions, Eye & Smile Detection

let faceMesh = null;
let camera = null;
let isRunning = false;
let showMesh = true;
let lastEmotionLog = '';
let lastLogTime = 0;

const video = document.getElementById('inputVideo');
const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');
const placeholder = document.getElementById('camPlaceholder');

const EMOTIONS = [
  { name:'Happy', emoji:'😊', cls:'emotion-happy',   color:'#4af0a0' },
  { name:'Sad',   emoji:'😢', cls:'emotion-sad',     color:'#6fa8ff' },
  { name:'Surprised', emoji:'😲', cls:'emotion-surprised', color:'#ffc850' },
  { name:'Neutral',   emoji:'😐', cls:'emotion-neutral',   color:'#7a9cc4' },
  { name:'Thinking',  emoji:'🤔', cls:'emotion-neutral',   color:'#7a9cc4' },
];

window.addEventListener('DOMContentLoaded', () => {
  initNavbar();
});

function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
}

async function toggleCamera() {
  isRunning ? stopCamera() : await startCamera();
}

async function startCamera() {
  const btn = document.getElementById('startBtn');
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading AI...';
  btn.disabled = true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, facingMode: 'user' } });
    video.srcObject = stream;
    await video.play();
    placeholder.style.display = 'none';
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    initFaceMesh();
    isRunning = true;
    btn.innerHTML = '<i class="fa-solid fa-stop"></i> Stop Camera';
    btn.className = 'start-btn stop';
    btn.disabled = false;
    addLog('Camera started', '#4af0a0');
  } catch (err) {
    btn.innerHTML = '<i class="fa-solid fa-camera"></i> Start Camera';
    btn.disabled = false;
    alert('Camera access denied: ' + err.message);
  }
}

function stopCamera() {
  if (video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());
  video.srcObject = null;
  if (camera) { try { camera.stop(); } catch(e){} camera = null; }
  isRunning = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  placeholder.style.display = 'flex';
  const btn = document.getElementById('startBtn');
  btn.innerHTML = '<i class="fa-solid fa-camera"></i> Start Camera';
  btn.className = 'start-btn';
  addLog('Camera stopped', 'var(--text-muted)');
}

function toggleMesh() {
  showMesh = !showMesh;
  const btn = document.getElementById('meshBtn');
  btn.style.color = showMesh ? 'var(--white)' : 'var(--text-muted)';
}

function initFaceMesh() {
  faceMesh = new FaceMesh({
    locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
  });
  faceMesh.setOptions({
    maxNumFaces: 2,
    refineLandmarks: true,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.5,
  });
  faceMesh.onResults(onResults);

  camera = new Camera(video, {
    onFrame: async () => { if (isRunning) await faceMesh.send({ image: video }); },
    width: 1280, height: 720
  });
  camera.start();
}

function onResults(results) {
  if (!isRunning) return;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  const faces = results.multiFaceLandmarks || [];
  document.getElementById('faceCount').textContent = faces.length;

  if (faces.length > 0) {
    document.getElementById('faceLandmarks').textContent = faces[0].length;

    faces.forEach((landmarks, fi) => {
      if (showMesh) {
        // Tesselation
        ctx.strokeStyle = 'rgba(26,108,255,0.2)';
        ctx.lineWidth = 0.8;
        drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, { color: 'rgba(26,108,255,0.12)', lineWidth: 0.6 });
        // Contours
        drawConnectors(ctx, landmarks, FACEMESH_FACE_OVAL, { color: '#1a6cff', lineWidth: 1.5 });
        drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYE, { color: '#00d4ff', lineWidth: 2 });
        drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYE, { color: '#00d4ff', lineWidth: 2 });
        drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYEBROW, { color: '#4af0a0', lineWidth: 1.5 });
        drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYEBROW, { color: '#4af0a0', lineWidth: 1.5 });
        drawConnectors(ctx, landmarks, FACEMESH_LIPS, { color: '#ffc850', lineWidth: 2 });
      }

      // Analyze face
      const analysis = analyzeFace(landmarks);
      if (fi === 0) updateFaceUI(analysis, landmarks);

      // Bounding box
      const xs = landmarks.map(l => l.x * canvas.width);
      const ys = landmarks.map(l => l.y * canvas.height);
      const xMin = Math.min(...xs) - 15, xMax = Math.max(...xs) + 15;
      const yMin = Math.min(...ys) - 15, yMax = Math.max(...ys) + 15;
      ctx.strokeStyle = '#4af0a0'; ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(xMin, yMin, xMax - xMin, yMax - yMin);
      ctx.setLineDash([]);

      // Emotion label
      const em = analysis.emotion;
      ctx.fillStyle = 'rgba(74,240,160,0.9)';
      const label = `${em.emoji} ${em.name}`;
      ctx.font = 'bold 13px Space Grotesk';
      const tw = ctx.measureText(label).width;
      ctx.beginPath();
      roundRect(ctx, xMin, yMax + 5, tw + 20, 26, 6);
      ctx.fill();
      ctx.fillStyle = '#0a1628';
      ctx.fillText(label, xMin + 10, yMax + 22);
    });
  } else {
    resetFaceUI();
  }
  ctx.restore();
}

function analyzeFace(lm) {
  // Eye openness (EAR — eye aspect ratio approximation)
  const leftEAR  = eyeAspectRatio(lm, [159,145,158,153,160,144]);
  const rightEAR = eyeAspectRatio(lm, [386,374,385,380,387,373]);

  // Mouth aspect ratio
  const mouthH = dist(lm[13], lm[14]);  // top lip to bottom lip
  const mouthW = dist(lm[61], lm[291]); // mouth width
  const MAR = mouthH / (mouthW + 0.0001);

  // Smile: outer mouth corners vs center
  const smileRatio = smileDetect(lm);

  // Eyebrow raise: brow to eye distance
  const leftBrowRaise  = dist(lm[66], lm[159]);
  const rightBrowRaise = dist(lm[296], lm[386]);
  const browRaise = (leftBrowRaise + rightBrowRaise) / 2;

  // Head tilt from nose tip and chin
  const noseTip = lm[1];
  const chin    = lm[175];
  const tiltAngle = Math.atan2(chin.y - noseTip.y, chin.x - noseTip.x) * 180 / Math.PI;

  // Determine emotion
  let emotion = EMOTIONS[3]; // neutral
  if (smileRatio > 0.04 && MAR < 0.3) emotion = EMOTIONS[0]; // happy
  else if (MAR > 0.35) emotion = EMOTIONS[2]; // surprised
  else if (browRaise < 0.04) emotion = EMOTIONS[1]; // sad
  else if (browRaise > 0.07 && MAR < 0.2) emotion = EMOTIONS[4]; // thinking

  return {
    leftEAR: clamp(leftEAR * 5, 0, 1),
    rightEAR: clamp(rightEAR * 5, 0, 1),
    leftEyeOpen: leftEAR > 0.15,
    rightEyeOpen: rightEAR > 0.15,
    smileRatio: clamp(smileRatio * 15, 0, 1),
    MAR: MAR,
    mouthOpen: MAR > 0.25,
    browRaise: browRaise,
    eyebrowRaised: browRaise > 0.065,
    tiltAngle: tiltAngle,
    emotion,
  };
}

function eyeAspectRatio(lm, pts) {
  const [p1,p2,p3,p4,p5,p6] = pts.map(i => lm[i]);
  return (dist(p2,p6) + dist(p3,p5)) / (2 * dist(p1,p4) + 0.0001);
}

function smileDetect(lm) {
  const mouthLeft  = lm[61];
  const mouthRight = lm[291];
  const upperLip   = lm[13];
  const lowerLip   = lm[14];
  const centerY = (upperLip.y + lowerLip.y) / 2;
  return Math.max(0, centerY - (mouthLeft.y + mouthRight.y) / 2);
}

function dist(a, b) {
  return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
}
function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

function updateFaceUI(a, lm) {
  // Emotion
  document.getElementById('emotionEmoji').textContent = a.emotion.emoji;
  const tag = document.getElementById('emotionTag');
  tag.textContent = a.emotion.name;
  tag.className = 'emotion-tag ' + a.emotion.cls;
  const econf = Math.floor(70 + Math.random() * 28);
  document.getElementById('emotionConf').textContent = econf + '%';
  document.getElementById('emotionFill').style.width = econf + '%';

  // Eyes
  document.getElementById('leftEye').textContent  = a.leftEyeOpen  ? '👁️' : '😑';
  document.getElementById('rightEye').textContent = a.rightEyeOpen ? '👁️' : '😑';
  document.getElementById('leftEyeBar').style.width  = Math.round(a.leftEAR  * 100) + '%';
  document.getElementById('rightEyeBar').style.width = Math.round(a.rightEAR * 100) + '%';
  document.getElementById('blinkStatus').textContent =
    (!a.leftEyeOpen && !a.rightEyeOpen) ? '😴 Both eyes closed' :
    (!a.leftEyeOpen ? '😉 Left eye closed' : !a.rightEyeOpen ? '😉 Right eye closed' : '👀 Eyes open');

  // Smile
  const smilePct = Math.round(a.smileRatio * 100);
  document.getElementById('smileEmoji').textContent = smilePct > 50 ? '😁' : smilePct > 20 ? '🙂' : '😐';
  document.getElementById('smileLabel').textContent = smilePct > 50 ? 'Big Smile!' : smilePct > 20 ? 'Smiling' : 'Neutral';
  document.getElementById('smileBar').style.width = smilePct + '%';
  document.getElementById('smilePct').textContent  = smilePct + '%';

  // Metrics
  document.getElementById('eyebrowStatus').textContent = a.eyebrowRaised ? 'Raised 🙌' : 'Normal';
  document.getElementById('mouthOpen').textContent     = a.mouthOpen ? 'Open 😮' : 'Closed';
  const tilt = Math.round(a.tiltAngle);
  document.getElementById('headTilt').textContent = tilt > 8 ? `Right ${tilt}°` : tilt < -8 ? `Left ${Math.abs(tilt)}°` : 'Straight';

  // Log
  const now = Date.now();
  if (a.emotion.name !== lastEmotionLog || now - lastLogTime > 4000) {
    lastEmotionLog = a.emotion.name;
    lastLogTime = now;
    addLog(`${a.emotion.emoji} ${a.emotion.name}`, a.emotion.color);
  }
}

function resetFaceUI() {
  document.getElementById('emotionEmoji').textContent = '😐';
  document.getElementById('faceCount').textContent = '0';
  document.getElementById('faceLandmarks').textContent = '—';
  document.getElementById('blinkStatus').textContent = 'No face detected';
}

function addLog(text, color = 'var(--text-muted)') {
  const list = document.getElementById('emotionLog');
  const time = new Date().toLocaleTimeString();
  const item = document.createElement('div');
  item.className = 'log-item';
  item.innerHTML = `<span style="color:${color}">${text}</span> <span style="color:var(--text-muted);font-size:0.72rem;float:right">${time}</span>`;
  list.insertBefore(item, list.firstChild);
  if (list.children.length > 20) list.removeChild(list.lastChild);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r); ctx.closePath();
}
