// lessons.js

const ALPHA_DATA = [
  { letter:'A', emoji:'✊', desc:'Closed fist, thumb on side',   tips:'Keep all fingers tightly curled. Thumb rests against the side, not over the top.' },
  { letter:'B', emoji:'🖐️', desc:'All 4 fingers up, thumb in', tips:'Hold four fingers straight up together. Fold thumb across the palm.' },
  { letter:'C', emoji:'🤚', desc:'Curved hand like letter C',    tips:'Curve all fingers and thumb to form a C shape facing sideways.' },
  { letter:'D', emoji:'☝️', desc:'Index up, others form circle', tips:'Index points up. Other fingers and thumb form a circle touching the index base.' },
  { letter:'E', emoji:'🤜', desc:'All fingers curled down',      tips:'Curl all fingertips down to meet the thumb. Like a claw.' },
  { letter:'F', emoji:'👌', desc:'Index & thumb circle, others up', tips:'Form O with index and thumb, other three fingers point up.' },
  { letter:'G', emoji:'👈', desc:'Index & thumb parallel sideways', tips:'Index points sideways, thumb parallel below it. Like pointing a gun sideways.' },
  { letter:'H', emoji:'✌️', desc:'Index & middle horizontal',   tips:'Hold index and middle finger out together, pointing sideways.' },
  { letter:'I', emoji:'🤙', desc:'Pinky finger up',              tips:'All fingers folded, only pinky extends up. Thumb may be out.' },
  { letter:'J', emoji:'✍️', desc:'Pinky up, draw a J motion',   tips:'Start with I shape, then trace J downward and hook left.' },
  { letter:'K', emoji:'✌️', desc:'Index & middle up, thumb between', tips:'Index and middle point up. Thumb pokes between them.' },
  { letter:'L', emoji:'👈', desc:'L-shape: index up, thumb out', tips:'Index finger points up, thumb points out to form an L shape.' },
  { letter:'M', emoji:'✊', desc:'3 fingers folded over thumb',  tips:'Tuck thumb under and fold index, middle, ring fingers over it.' },
  { letter:'N', emoji:'✊', desc:'2 fingers folded over thumb',  tips:'Same as M but only index and middle fingers fold over the thumb.' },
  { letter:'O', emoji:'👌', desc:'All fingers meet thumb in O',  tips:'Round all fingers to meet thumb in a perfect O. Keep it round, not flat.' },
  { letter:'P', emoji:'👇', desc:'Like K but pointing down',     tips:'Form K shape (index, middle, thumb) but angle your hand downward.' },
  { letter:'Q', emoji:'👇', desc:'Like G but pointing down',     tips:'Form G shape (index, thumb) but angle downward toward the floor.' },
  { letter:'R', emoji:'🤞', desc:'Index & middle crossed',       tips:'Cross your index and middle fingers. Thumb and other fingers folded.' },
  { letter:'S', emoji:'✊', desc:'Closed fist over thumb',       tips:'Make a fist with your thumb tucked under the fingers, not on the side.' },
  { letter:'T', emoji:'✊', desc:'Index bent, thumb between',    tips:'Fold index finger. Push thumb up between index and middle fingers.' },
  { letter:'U', emoji:'✌️', desc:'Index & middle together up',  tips:'Index and middle finger point straight up together, touching side by side.' },
  { letter:'V', emoji:'✌️', desc:'Index & middle up spread',    tips:'Index and middle finger up, spread apart in a V. Also means peace or 2.' },
  { letter:'W', emoji:'🖖', desc:'3 fingers up spread',          tips:'Index, middle, ring fingers spread up. Thumb & pinky fold in.' },
  { letter:'X', emoji:'☝️', desc:'Index finger hooked/bent',    tips:'Extend index finger then bend it at the knuckle into a hook shape.' },
  { letter:'Y', emoji:'🤙', desc:'Thumb & pinky out',            tips:'Extend thumb and pinky out, fold the other three fingers in. Hang loose!' },
  { letter:'Z', emoji:'☝️', desc:'Index draws a Z in the air',  tips:'Point your index finger and draw the letter Z in the air.' },
];

const NUMBERS_DATA = [
  { letter:'0', emoji:'👌', desc:'All fingers form an O with thumb',    tips:'Round fingers and thumb to meet in an O shape.' },
  { letter:'1', emoji:'☝️', desc:'Index finger pointing up',           tips:'Only index finger up. All others and thumb folded in.' },
  { letter:'2', emoji:'✌️', desc:'Index and middle finger up',         tips:'Peace sign / V sign. Also sign for letter V.' },
  { letter:'3', emoji:'🤟', desc:'Thumb, index, middle up',            tips:'Thumb, index, and middle extended. Ring and pinky folded.' },
  { letter:'4', emoji:'🖖', desc:'Four fingers up, thumb folded',      tips:'All four fingers extended together up. Thumb folded across palm.' },
  { letter:'5', emoji:'🖐️', desc:'All five fingers spread open',      tips:'Open palm with all fingers spread. Also means stop or hello.' },
  { letter:'6', emoji:'🤙', desc:'Thumb & pinky extended',             tips:'Connect pinky and thumb, others extended or fold ring, middle, index.' },
  { letter:'7', emoji:'🤙', desc:'Thumb and ring finger touch',        tips:'Bring thumb to ring finger tip. Others extended.' },
  { letter:'8', emoji:'🤌', desc:'Thumb and middle finger touch',      tips:'Bring thumb to middle finger. Index and others may extend slightly.' },
  { letter:'9', emoji:'👌', desc:'Thumb and index touch (hook)',       tips:'Bend index finger to touch thumb forming a small loop. Like letter F.' },
];

const PHRASES_DATA = [
  { letter:'Hello', emoji:'👋', desc:'Open hand wave near forehead',   tips:'Hold open hand near forehead, palm out, and wave or move it away.' },
  { letter:'Thank You', emoji:'🙏', desc:'Fingertips touch lips then move out', tips:'Touch fingers to lips with flat hand, then move hand forward and down.' },
  { letter:'Please', emoji:'🤲', desc:'Flat hand circles on chest',   tips:'Place flat hand on chest and move in a circular motion.' },
  { letter:'Sorry', emoji:'✊', desc:'Fist circles on chest',          tips:'Make a fist and move it in a circular motion over your heart/chest.' },
  { letter:'Yes', emoji:'✊', desc:'Fist nods up and down',            tips:'Make a fist and nod it up and down like a head saying yes.' },
  { letter:'No',  emoji:'✌️', desc:'Index & middle snap to thumb',   tips:'Extend index and middle fingers, then snap them down to meet the thumb.' },
  { letter:'I Love You', emoji:'🤟', desc:'ILY: thumb, index, pinky out', tips:'Extend thumb, index, and pinky fingers. Fold ring and middle fingers in.' },
  { letter:'Help', emoji:'👊', desc:'Fist on flat palm, both move up',tips:'Place closed fist on open palm, then raise both hands together.' },
  { letter:'Good', emoji:'👍', desc:'Flat hand from chin moves forward', tips:'Touch chin with flat hand (like eating), then move hand forward.' },
  { letter:'Bad',  emoji:'👎', desc:'Flat hand tips down away from mouth', tips:'Touch lips with flat hand, then flip hand down and away.' },
  { letter:'Water', emoji:'💧', desc:'W hand taps chin twice',          tips:'Form W shape (3 fingers up), tap chin twice.' },
  { letter:'Eat / Food', emoji:'🍽️', desc:'Flat O taps mouth',          tips:'Bring fingertips together to form a flat O and tap against your mouth.' },
];

let currentTab = 'alpha';
let learnedSigns = new Set(JSON.parse(localStorage.getItem('signbridge_learned') || '[]'));
let quizData = null;

const TIPS = [
  'Practice each sign in front of a mirror to check your form.',
  'Good lighting helps the camera detect your signs accurately.',
  'ASL is a complete language with its own grammar — it\'s not just hand gestures for English words.',
  'Fingerspelling is used for names, places, and words that don\'t have a dedicated sign.',
  'The dominant hand is your main signing hand — use whichever hand feels natural.',
  'ISL (Indian Sign Language) shares some signs with ASL but has its own unique vocabulary.',
  'Practice 5 letters per day to build muscle memory without getting overwhelmed.',
  'Numbers 1–5 are foundational — master them first!',
];

window.addEventListener('DOMContentLoaded', () => {
  renderGrid();
  newQuiz();
  document.getElementById('dailyTip').textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
  updateProgress();
  initNavbar();

  // Responsive lessons layout
  const layout = document.getElementById('lessonsLayout');
  const checkWidth = () => {
    if (window.innerWidth < 900) {
      layout.style.gridTemplateColumns = '1fr';
    } else {
      layout.style.gridTemplateColumns = '1fr 360px';
    }
  };
  checkWidth();
  window.addEventListener('resize', checkWidth);
});

function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
}

function switchTab(tab) {
  currentTab = tab;
  ['alpha','numbers','phrases'].forEach(t => {
    document.getElementById('tab' + t.charAt(0).toUpperCase() + t.slice(1)).classList.toggle('active', t === tab);
  });
  renderGrid();
}

function getCurrentData() {
  return currentTab === 'alpha' ? ALPHA_DATA : currentTab === 'numbers' ? NUMBERS_DATA : PHRASES_DATA;
}

function renderGrid() {
  const grid = document.getElementById('signGrid');
  const data = getCurrentData();
  grid.innerHTML = '';
  data.forEach(item => {
    const tile = document.createElement('div');
    tile.className = 'sign-tile' + (learnedSigns.has(item.letter) ? ' active' : '');
    tile.innerHTML = `
      <div class="sign-emoji">${item.emoji}</div>
      <div class="sign-letter">${item.letter}</div>
      <div class="sign-desc">${item.desc.substring(0,28)}${item.desc.length>28?'…':''}</div>
      ${learnedSigns.has(item.letter) ? '<div style="font-size:0.65rem;color:var(--green);margin-top:3px">✓ Learned</div>' : ''}
    `;
    tile.onclick = () => showDetail(item);
    grid.appendChild(tile);
  });
}

function showDetail(item) {
  document.getElementById('detailContent').innerHTML = `
    <div style="font-size:5rem;margin-bottom:0.5rem;animation:popIn 0.3s ease">${item.emoji}</div>
    <div style="font-family:var(--font-head);font-size:2rem;font-weight:700;color:var(--white);margin-bottom:0.3rem">${item.letter}</div>
    <div style="font-size:0.88rem;color:var(--text-muted);margin-bottom:1rem">${item.desc}</div>
    <div style="background:rgba(26,108,255,0.08);border:1px solid rgba(26,108,255,0.2);border-radius:10px;padding:0.9rem;text-align:left;margin-bottom:1rem">
      <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--cyan);margin-bottom:0.4rem"><i class="fa-solid fa-circle-info"></i> How to form it</div>
      <div style="font-size:0.85rem;color:var(--text-muted);line-height:1.7">${item.tips}</div>
    </div>
    <button onclick="markLearned('${item.letter}')" id="learnBtn_${item.letter}"
      style="width:100%;padding:0.7rem;border-radius:8px;border:1.5px solid ${learnedSigns.has(item.letter) ? 'var(--green)' : 'var(--blue-bright)'};
      background:${learnedSigns.has(item.letter) ? 'rgba(74,240,160,0.1)' : 'rgba(26,108,255,0.1)'};
      color:${learnedSigns.has(item.letter) ? 'var(--green)' : 'var(--blue-light)'};
      font-family:var(--font-head);cursor:pointer;font-size:0.88rem;transition:all 0.2s">
      ${learnedSigns.has(item.letter) ? '✓ Learned!' : '📌 Mark as Learned'}
    </button>
  `;
}

function markLearned(letter) {
  if (learnedSigns.has(letter)) {
    learnedSigns.delete(letter);
  } else {
    learnedSigns.add(letter);
  }
  localStorage.setItem('signbridge_learned', JSON.stringify([...learnedSigns]));
  renderGrid();
  updateProgress();
  // Re-show detail for the current sign
  const data = [...ALPHA_DATA, ...NUMBERS_DATA, ...PHRASES_DATA];
  const item = data.find(d => d.letter === letter);
  if (item) showDetail(item);
}

function updateProgress() {
  const total = ALPHA_DATA.length + NUMBERS_DATA.length + PHRASES_DATA.length;
  const count = learnedSigns.size;
  document.getElementById('progressText').textContent = `${count} / ${total} learned`;
  document.getElementById('progressFill').style.width = (count / total * 100) + '%';
}

function newQuiz() {
  const data = ALPHA_DATA.concat(NUMBERS_DATA);
  const correct = data[Math.floor(Math.random() * data.length)];
  quizData = correct;

  document.getElementById('quizQuestion').textContent = correct.emoji;
  document.getElementById('quizPrompt').textContent = `What does this sign mean?`;

  // Generate 4 options
  const options = [correct];
  while (options.length < 4) {
    const r = data[Math.floor(Math.random() * data.length)];
    if (!options.find(o => o.letter === r.letter)) options.push(r);
  }
  options.sort(() => Math.random() - 0.5);

  const container = document.getElementById('quizOptions');
  container.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt.letter;
    btn.style.cssText = `padding:0.55rem;border-radius:8px;border:1.5px solid var(--border);
      background:var(--bg-deep);color:var(--white);font-family:var(--font-head);
      font-size:1rem;cursor:pointer;transition:all 0.2s;`;
    btn.onmouseover = () => { if (!btn.dataset.answered) btn.style.borderColor = 'var(--blue-bright)'; };
    btn.onmouseout  = () => { if (!btn.dataset.answered) btn.style.borderColor = 'var(--border)'; };
    btn.onclick = () => answerQuiz(opt.letter === correct.letter, btn, container);
    container.appendChild(btn);
  });
}

function answerQuiz(correct, btn, container) {
  // Disable all
  [...container.children].forEach(b => {
    b.dataset.answered = '1';
    b.style.cursor = 'default';
    if (b.textContent === quizData.letter) {
      b.style.borderColor = 'var(--green)';
      b.style.background = 'rgba(74,240,160,0.15)';
      b.style.color = 'var(--green)';
    }
  });
  if (!correct) {
    btn.style.borderColor = '#ff6b6b';
    btn.style.background = 'rgba(255,107,107,0.15)';
    btn.style.color = '#ff6b6b';
  }
  setTimeout(() => newQuiz(), 1800);
}

// CSS animation for detail card
const style = document.createElement('style');
style.textContent = '@keyframes popIn { 0%{transform:scale(0.7);opacity:0} 100%{transform:scale(1);opacity:1} }';
document.head.appendChild(style);
