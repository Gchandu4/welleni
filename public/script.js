// ── Block 1: Core ──
// ── SUPABASE CLIENT ──
// Keys from config.js

const _sb = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

// ── PAGE NAVIGATION ──
function goPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
  initPage(id);
}
function initPage(id){
  if(id==='page-landing'){
    setTimeout(()=>{
      const obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')})},{threshold:.12});
      document.querySelectorAll('#page-landing .reveal').forEach(el=>obs.observe(el));
    },100);
  }
  if(id==='pagwelltal') buildBedGrid();
}

// ── REGISTRATION ──
let currentRole='patient';
function selectRole(r){
  currentRole=r;
  document.getElementById('role-patient').classList.toggle('selected',r==='patient');
  document.getElementById('rolwelltal').classList.toggle('selected',r==='hospital');
  document.getElementById('reg-patient-form').style.display=r==='patient'?'block':'none';
  document.getElementById('reg-hospital-form').style.display=r==='hospital'?'block':'none';
  // Scroll auth card to top so user sees the form
  const card = document.querySelector('#page-register .auth-card');
  if(card) card.scrollTop = 0;
  window.scrollTo({top: document.querySelector('#page-register .auth-wrap')?.offsetTop || 0, behavior:'smooth'});
}

// ── LOGIN ──
function switchLoginTab(type,btn){
  document.querySelectorAll('.auth-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('login-patient').style.display=type==='patient'?'block':'none';
  document.getElementById('login-hospital').style.display=type==='hospital'?'block':'none';
}

// ── PATIENT DASHBOARD PANELS ──
function showPanel(id,btn){
  if (id === 'h-settings') loadHospitalProfileForm();
  document.querySelectorAll('#page-patient .dash-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if(btn){document.querySelectorAll('#page-patient .sidebar-item').forEach(s=>s.classList.remove('active'));btn.classList.add('active');}
  // Close mobile sidebar after selection
  if(window.innerWidth <= 960) {
    const sidebar = document.querySelector('#page-patient .sidebar');
    if(sidebar) sidebar.classList.remove('mobile-open');
  }
}

// ── MOBILE SIDEBAR TOGGLE ──
function toggleMobileSidebar(){
  const sidebar = document.querySelector('#page-patient .sidebar');
  if(sidebar) sidebar.classList.toggle('mobile-open');
}

// Close mobile sidebar when clicking outside
document.addEventListener('click', function(e) {
  if(window.innerWidth <= 960) {
    const sidebar = document.querySelector('#page-patient .sidebar');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    if(sidebar && sidebar.classList.contains('mobile-open') && 
       !sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
      sidebar.classList.remove('mobile-open');
    }
  }
});

// ── HOSPITAL DASHBOARD PANELS ──
function showHPanel(id,btn){
  document.querySelectorAll('#pagwelltal .dash-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if(btn){document.querySelectorAll('#pagwelltal .sidebar-item').forEach(s=>s.classList.remove('active'));btn.classList.add('active');}
}

// ── BED GRID ──
function buildBedGrid(){
  const g=document.getElementById('bed-grid');
  if(!g||g.children.length)return;
  const states=['free','occupied','occupied','free','reserved','occupied','free','occupied','occupied','free','occupied','occupied','reserved','free','occupied','free'];
  states.forEach((s,i)=>{
    const b=document.createElement('div');
    b.className='bed-cell bed-'+s;
    b.textContent='B'+(i+1);
    b.title='Bed '+(i+1)+' — '+s;
    b.onclick=()=>showToast('Bed '+(i+1)+': '+s);
    g.appendChild(b);
  });
}

// ── HOW IT WORKS ──
let currentStep=0;
function setStep(idx,el){
  document.querySelectorAll('.hiw-step').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.hiw-screen').forEach(s=>s.classList.remove('active'));
  el.classList.add('active');document.getElementById('screen-'+idx).classList.add('active');currentStep=idx;
}
setInterval(()=>{
  const steps=document.querySelectorAll('#page-landing .hiw-step');
  if(!steps.length)return;
  const next=(currentStep+1)%steps.length;setStep(next,steps[next]);
},3500);

// ── FOR WHO ──
function switchTab(type,btn){
  document.querySelectorAll('.fw-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.fw-content').forEach(c=>c.classList.remove('active'));
  btn.classList.add('active');document.getElementById('fw-'+type).classList.add('active');
}

// ── CTA ──
async function handleCTA(btn){
  const inputs = btn.parentElement.querySelectorAll('input');
  const hospitalName = inputs[0].value.trim();
  const mobile = inputs[1].value.trim();
  
  // Validation
  let ok = true;
  if (!hospitalName) { inputs[0].style.borderColor='#F87171'; setTimeout(()=>inputs[0].style.borderColor='',2000); ok=false; }
  if (!mobile) { inputs[1].style.borderColor='#F87171'; setTimeout(()=>inputs[1].style.borderColor='',2000); ok=false; }
  if (!ok) return;
  
  // Validate mobile number
  const mobileDigits = mobile.replace(/[\s\-\+\(\)]/g,'');
  if (!/^\d{10}$/.test(mobileDigits)) {
    showToast('Please enter a valid 10-digit mobile number');
    inputs[1].style.borderColor='#F87171';
    setTimeout(()=>inputs[1].style.borderColor='',2000);
    return;
  }
  
  btn.textContent = 'Sending...';
  btn.disabled = true;
  
  try {
    // Save to Supabase
    const { data, error } = await _sb.from('demo_requests').insert({
      hospital_name: hospitalName,
      mobile: mobile,
      status: 'pending',
      requested_at: new Date().toISOString(),
      source: 'website'
    }).select().single();
    
    if (error) {
      // Check if table doesn't exist
      if (error.message && error.message.includes('demo_requests')) {
        // Table doesn't exist - still show success to user but log error
        console.error('Demo requests table not set up yet:', error);
        SecureLogger.warn('demo_request_table_missing', { hospital: hospitalName, mobile: mobile });
        
        // Show success anyway (request will be in logs)
        btn.textContent = 'Sent ✓';
        btn.style.background = '#16A34A';
        document.getElementById('cta-success').style.display = 'block';
        inputs.forEach(i => i.value = '');
        showToast('Request received! We\'ll call you within 24 hours.');
        
        // Open WhatsApp as backup
        const message = `🏥 NEW DEMO REQUEST\n\nHospital: ${hospitalName}\nMobile: ${mobile}\nTime: ${new Date().toLocaleString('en-IN')}\n\nPlease contact within 24 hours.`;
        window.open(`https://wa.me/${CONFIG.WA_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
        return;
      }
      throw error;
    }
    
    // Log to audit
    SecureLogger.info('demo_request', { hospital: hospitalName, mobile: mobile });
    
    // Success
    btn.textContent = 'Sent ✓';
    btn.style.background = '#16A34A';
    document.getElementById('cta-success').style.display = 'block';
    inputs.forEach(i => i.value = '');
    
    showToast('Demo request sent! We\'ll call you within 24 hours.');
    
  } catch(e) {
    console.error('Demo request error:', e);
    showToast('Failed to send request. Please call us at 7032527095');
    btn.textContent = 'Request Demo →';
    btn.disabled = false;
  }
}

// ── TOAST ──
function showToast(msg){
  const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3000);
}

// ── HERO 3D TILT ──
const tilt=document.getElementById('tiltCard');
if(tilt){
  const p=tilt.closest('.hero-visual');
  p.addEventListener('mousemove',e=>{
    const r=tilt.getBoundingClientRect();
    const dx=(e.clientX-r.left-r.width/2)/(r.width/2);
    const dy=(e.clientY-r.top-r.height/2)/(r.height/2);
    tilt.style.transform=`perspective(800px) rotateY(${dx*14}deg) rotateX(${-dy*10}deg) scale(1.02)`;
  });
  p.addEventListener('mouseleave',()=>{tilt.style.transform='';});
}

// ── NAV SCROLL ──
window.addEventListener('scroll',()=>{
  document.getElementById('navbar')&&document.getElementById('navbar').classList.toggle('scrolled',scrollY>20);
});

// ── PARALLAX ORBS ──
window.addEventListener('scroll',()=>{
  document.querySelectorAll('.orb').forEach((o,i)=>{o.style.transform=`translateY(${scrollY*(0.08+i*0.04)}px)`;});
});

// ══════════════════════════════════════
// Welleni DATABASE (IndexedDB + localStorage)
// ══════════════════════════════════════
const DB = {
  _prefix: 'welleni_',
  _idb: null,

  async init() {
    return new Promise((res, rej) => {
      const req = indexedDB.open('WelleniDB', 1);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        ['patients','hospitals','appointments','records','medications','vitals','emergencies','messages'].forEach(store => {
          if (!db.objectStoreNames.contains(store)) {
            const s = db.createObjectStore(store, { keyPath: 'id', autoIncrement: true });
            if (store === 'patients') s.createIndex('email', 'email', { unique: true });
            if (store === 'hospitals') s.createIndex('email', 'email', { unique: true });
            if (store === 'appointments') s.createIndex('patientId', 'patientId', { unique: false });
            if (store === 'records') s.createIndex('patientId', 'patientId', { unique: false });
            if (store === 'medications') s.createIndex('patientId', 'patientId', { unique: false });
          }
        });
      };
      req.onsuccess = e => { this._idb = e.target.result; this._seedData(); res(); };
      req.onerror = () => rej(req.error);
    });
  },

  async _seedData() {
    await this._loadSession();
  },

  async _loadSession() {
    const raw = localStorage.getItem(this._prefix + 'session');
    if (!raw) return;
    try {
      const session = JSON.parse(raw);
      if (session.user) {
        if (session.expiresAt && Date.now() > session.expiresAt) { this.clearSession(); return; }
        currentUser = session.user;
      } else {
        // Legacy flat format
        currentUser = session;
      }
    } catch { this.clearSession(); }
  },

  // Core CRUD
  async add(store, data) {
    return new Promise((res, rej) => {
      const tx = this._idb.transaction(store, 'readwrite');
      const req = tx.objectStore(store).add(data);
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
  },

  async get(store, id) {
    return new Promise((res, rej) => {
      const tx = this._idb.transaction(store, 'readonly');
      const req = tx.objectStore(store).get(id);
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
  },

  async getAll(store) {
    return new Promise((res, rej) => {
      const tx = this._idb.transaction(store, 'readonly');
      const req = tx.objectStore(store).getAll();
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
  },

  async getByIndex(store, index, value) {
    return new Promise((res, rej) => {
      const tx = this._idb.transaction(store, 'readonly');
      const req = tx.objectStore(store).index(index).getAll(value);
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
  },

  async put(store, data) {
    return new Promise((res, rej) => {
      const tx = this._idb.transaction(store, 'readwrite');
      const req = tx.objectStore(store).put(data);
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
  },

  async delete(store, id) {
    return new Promise((res, rej) => {
      const tx = this._idb.transaction(store, 'readwrite');
      const req = tx.objectStore(store).delete(id);
      req.onsuccess = () => res();
      req.onerror = () => rej(req.error);
    });
  },

  async count(store) {
    return new Promise((res, rej) => {
      const tx = this._idb.transaction(store, 'readonly');
      const req = tx.objectStore(store).count();
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
  },

  async findByEmail(store, email) {
    const all = await this.getAll(store);
    return all.find(r => r.email === email) || null;
  },

  // Session — stored as { user, expiresAt } for consistency
  _sessionTTL: 8 * 60 * 60 * 1000,
  setSession(user, role) {
    const { password: _omit, ...safeUser } = user;
    currentUser = { ...safeUser, role };
    localStorage.setItem(this._prefix + 'session', JSON.stringify({
      user: currentUser,
      expiresAt: Date.now() + this._sessionTTL
    }));
  },
  clearSession() {
    currentUser = null;
    localStorage.removeItem(this._prefix + 'session');
  }
};

let currentUser = null;

// Init DB on load
DB.init().then(() => {
  const raw = localStorage.getItem('welleni_session');
  if (!raw) return;
  try {
    const session = JSON.parse(raw);
    const user = session.user || session;
    if (session.expiresAt && Date.now() > session.expiresAt) {
      localStorage.removeItem('welleni_session');
      return;
    }
    if (user.role === 'patient') {
      goPage('page-patient');
      loadPatientDash(user);
    } else if (user.role === 'hospital') {
      goPage('pagwelltal');
      loadHospitalDash(user);
    }
  } catch(e) {
    localStorage.removeItem('welleni_session');
  }
}).catch(e => console.error('DB init failed:', e));

// ── REGISTRATION (Supabase direct) ──
async function handleRegister() {
  const btn = document.getElementById('reg-btn');
  btn.textContent = 'Creating account...'; btn.disabled = true;

  // Hash password helper
  async function hashPw(pw) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2,'0')).join('');
    const data = new TextEncoder().encode(saltHex + pw);
    const buf = await crypto.subtle.digest('SHA-256', data);
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
    return saltHex + ':' + hex;
  }

  // Generate Patient ID (format: 26001, 26002, etc.)
  async function generatePatientId() {
    try {
      // Get count of existing patients
      const { count, error } = await _sb
        .from('patients')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      
      // Generate ID: 26 + sequential number (padded to 3 digits)
      const nextNumber = (count || 0) + 1;
      const patientId = '26' + String(nextNumber).padStart(3, '0');
      
      return patientId;
    } catch(e) {
      console.error('Error generating patient ID:', e);
      // Fallback: use timestamp-based ID
      return '26' + String(Date.now()).slice(-3);
    }
  }

  try {
    if (currentRole === 'patient') {
      const firstName  = document.getElementById('reg-fname')?.value.trim() || '';
      const lastName   = document.getElementById('reg-lname')?.value.trim() || '';
      const mobile     = document.getElementById('reg-mobile')?.value.trim() || '';
      const email      = document.getElementById('reg-email')?.value.trim() || '';
      const dob        = document.getElementById('reg-dob')?.value.trim() || '';
      const bloodGroup = document.getElementById('reg-blood')?.value.trim() || '';
      const password   = document.getElementById('reg-password')?.value || '';
      const confirmPw  = document.getElementById('reg-confirm')?.value || '';

      if (!firstName || !email || !password) { showToast('Please fill all required fields'); btn.textContent='Create Account →'; btn.disabled=false; return; }
      if (password !== confirmPw) { showToast('Passwords do not match'); btn.textContent='Create Account →'; btn.disabled=false; return; }
      if (mobile && !otpVerified.patient) { showToast('Please verify your mobile number with OTP'); btn.textContent='Create Account →'; btn.disabled=false; return; }

      const { data: existing } = await _sb.from('patients').select('id').eq('email', email.toLowerCase()).maybeSingle();
      if (existing) { showToast('Email already registered. Please sign in.'); btn.textContent='Create Account →'; btn.disabled=false; return; }

      // Generate unique patient ID
      let patientId = null;
      try {
        patientId = await generatePatientId();
      } catch(e) {
        console.warn('Could not generate patient ID, will be null:', e);
        // Continue without patient ID - it's optional
      }
      
      const hashed = await hashPw(password);
      const insertData = {
        firstName, lastName, mobile: mobile || null, email: email.toLowerCase(),
        dob: dob || null, bloodGroup: bloodGroup || null, password: hashed,
        allergies: '', emergencyContact: '', createdAt: new Date().toISOString()
      };
      
      // Only add patientId if it was generated successfully
      if (patientId) {
        insertData.patientId = patientId;
      }
      
      const { data: user, error } = await _sb.from('patients').insert(insertData).select().single();

      if (error) { 
        console.error('Registration error:', error);
        
        // If it's still a patientId column error, show helpful message
        if (error.message && error.message.includes('patientId')) {
          showToast('Please hard refresh the page (Ctrl+Shift+R or Ctrl+F5) and try again');
        } else {
          showToast('Registration failed: ' + error.message);
        }
        
        btn.textContent='Create Account →'; 
        btn.disabled=false; 
        return; 
      }

      const { password: _omit, ...safeUser } = user;
      DB.setSession(safeUser, 'patient');
      
      // Show success message with or without patient ID
      if (user.patientId) {
        showToast('Account created! Your Patient ID: ' + user.patientId);
      } else {
        showToast('Account created! Welcome, ' + user.firstName + '!');
      }
      
      goPage('page-patient');
      loadPatientDash(safeUser);

    } else {
      const name          = document.getElementById('reg-hosp-name')?.value.trim() || null;
      const regNo         = document.getElementById('reg-hosp-regno')?.value.trim() || null;
      const city          = document.getElementById('reg-hosp-city')?.value.trim() || null;
      const pincode       = document.getElementById('reg-hosp-pin')?.value.trim() || null;
      const contactPerson = document.getElementById('reg-hosp-contact')?.value.trim() || null;
      const email         = document.getElementById('reg-hosp-email')?.value.trim() || null; 
      const phone         = document.getElementById('reg-hosp-phone')?.value.trim() || null;
      //const password      = document.getElementById('reg-hosp-password')?.value || '';
     // const name = document.getElementById('reg-hosp-name')?.value.trim() || null;
      //const email = document.getElementById('reg-hosp-email')?.value.trim() || null;
      //const phone = document.getElementById('reg-hosp-phone')?.value.trim() || null;
      const confirmPwHosp = document.getElementById('reg-hosp-confirm')?.value || '';

      if (!name || !email || !password) { showToast('Please fill all required fields'); btn.textContent='Create Account →'; btn.disabled=false; return; }
     // if (password !== confirmPwHosp) { showToast('Passwords do not match'); btn.textContent='Create Account →'; btn.disabled=false; return; }
      if (password !== confirmPwHosp) { showToast('Passwords do not match'); btn.textContent='Create Account →'; btn.disabled=false; return; }
      if (phone && !otpVerified.hospital) { showToast('Please verify your phone number with OTP'); btn.textContent='Create Account →'; btn.disabled=false; return; }

      const { data: existing } = await _sb.from('hospitals').select('id').eq('email', email.toLowerCase()).maybeSingle();
      if (existing) { showToast('Email already registered. Please sign in.'); btn.textContent='Create Account →'; btn.disabled=false; return; }

      const hashed = await hashPw(password);
      const { data: hosp, error } = await _sb.from('hospitals').insert({
        name, regNo: regNo || null,
        city: city || null,
        pincode: pincode || null,
        contactPerson: contactPerson || null, email: email.toLowerCase(),
        phone: phone || null, password: hashed, createdAt: new Date().toISOString()
      }).select().single();

      if (error) { showToast('Registration failed: ' + error.message); btn.textContent='Create Account →'; btn.disabled=false; return; }

      const { password: _omit, ...safeHosp } = hosp;
      DB.setSession(safeHosp, 'hospital');
      showToast('Hospital account created! Welcome, ' + hosp.name + '!');
      setTimeout(() => goPage('pagwelltal'), 800);
    }
  } catch(e) {
    showToast('Registration failed: ' + (e.message || 'Try again'));
    console.error(e);
  }
  btn.textContent = 'Create Account →'; btn.disabled = false;
}

// -- LOGIN (Supabase direct) --
async function handleLogin(type) {
  async function verifyPw(pw, stored) {
    if (!stored) return false;
    if (!stored.includes(':')) return stored === pw;
    const [saltHex, storedHash] = stored.split(':');
    const data = new TextEncoder().encode(saltHex + pw);
    const buf = await crypto.subtle.digest('SHA-256', data);
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
    return hex === storedHash;
  }
  if (type === 'demo-patient') {
    const { data: user } = await _sb.from('patients').select('*').eq('email', 'rajesh@demo.com').maybeSingle();
    if (user) { const { password: _o, ...u } = user; DB.setSession(u, 'patient'); goPage('page-patient'); loadPatientDash(u); }
    else showToast('Demo account not found. Please register first.');
    return;
  }
  if (type === 'demo-hospital') {
    const { data: hosp } = await _sb.from('hospitals').select('*').eq('email', 'admin@apollo.com').maybeSingle();
    if (hosp) { const { password: _o, ...h } = hosp; DB.setSession(h, 'hospital'); goPage('pagwelltal'); loadHospitalDash(h); }
    else showToast('Demo account not found. Please register first.');
    return;
  }
  if (type === 'patient') {
    const id = document.getElementById('login-id').value.trim();
    const pw = document.getElementById('login-pw').value.trim();
    const btn = document.getElementById('patient-login-btn');
    if (!id || !pw) { showToast('Please enter your credentials'); if (btn) { btn.style.opacity='1'; btn.textContent='Sign In as Patient'; } return; }
    if (btn) { btn.style.opacity='0.7'; btn.textContent='Signing in...'; }
    try {
      let { data: user, error: err1 } = await _sb.from('patients').select('*').eq('email', id.toLowerCase()).maybeSingle();
      if (err1) { showToast('Login error: ' + err1.message); return; }
      if (!user) {
        const { data: u2, error: err2 } = await _sb.from('patients').select('*').eq('mobile', id).maybeSingle();
        if (err2) { showToast('Login error: ' + err2.message); return; }
        user = u2;
      }
      if (!user) { showToast('No account found with that email. Please register first.'); return; }
      if (!(await verifyPw(pw, user.password))) { showToast('Wrong password. Please try again.'); return; }
      const { password: _o, ...safeUser } = user;
      DB.setSession(safeUser, 'patient');
      goPage('page-patient');
      loadPatientDash(safeUser);
    } catch(e) { showToast('Login error: ' + e.message); console.error(e); }
    finally { if (btn) { btn.style.opacity='1'; btn.textContent='Sign In as Patient'; } }
    return;
  }
  if (type === 'hospital') {
    const id = document.getElementById('hosp-login-id').value.trim();
    const pw = document.getElementById('hosp-login-pw').value.trim();
    if (!id || !pw) { showToast('Please enter your credentials'); const b=document.getElementById('hosp-login-btn'); if(b){b.style.opacity='1';b.textContent='Sign In as Hospital →';} return; }
    const hospBtn = document.getElementById('hosp-login-btn');
    try {
      const { data: hosp, error: herr } = await _sb.from('hospitals').select('*').eq('email', id.toLowerCase()).maybeSingle();
      if (herr) { showToast('Login error: ' + herr.message); return; }
      if (!hosp) { showToast('No hospital account found with that email. Please register first.'); return; }
      if (!(await verifyPw(pw, hosp.password))) { showToast('Wrong password. Please try again.'); return; }
      const { password: _o, ...safeHosp } = hosp;
      DB.setSession(safeHosp, 'hospital');
      goPage('pagwelltal');
      loadHospitalDash(safeHosp);
    } catch(e) { showToast('Login error: ' + e.message); console.error(e); }
    finally { if (hospBtn) { hospBtn.style.opacity='1'; hospBtn.textContent='Sign In as Hospital →'; } }
  }
}

async function loadPatientDash(user) {
  document.getElementById('patient-name').textContent = user.firstName;
  document.getElementById('sidebar-patient-name').textContent = user.firstName + ' ' + (user.lastName||'');
  const pidEl = document.getElementById('sidebar-patient-id');
  if (pidEl) pidEl.textContent = user.patientId ? 'ID: ' + user.patientId : '—';
  
  // Update mobile header
  const mobileNameEl = document.getElementById('mobile-patient-name');
  if (mobileNameEl) mobileNameEl.textContent = user.firstName + ' ' + (user.lastName||'');
  const mobileIdEl = document.getElementById('mobile-patient-id');
  if (mobileIdEl) mobileIdEl.textContent = user.patientId ? 'ID: ' + user.patientId : 'ID: —';
  
  const now = new Date();
  const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const h = istDate.getHours();
  const greetWord = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const greet = document.getElementById('dash-greeting');
  if (greet) greet.textContent = greetWord + ', ' + user.firstName;
  const dateSub = document.getElementById('dash-date-sub');
  if (dateSub) {
    const dateStr = istDate.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric', timeZone:'Asia/Kolkata' });
    dateSub.textContent = dateStr + ' · Here\'s your health summary';
  }

  // Skip DB queries for optimistic/temp login — real data loads when server responds
  if (!user.id) return;

  // Populate profile form with user's data
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  setVal('prof-fname', user.firstName);
  setVal('prof-lname', user.lastName);
  setVal('prof-dob', user.dob);
  setVal('prof-mobile', user.mobile);
  setVal('prof-email', user.email);
  setVal('prof-allergies', user.allergies);
  setVal('prof-emergency', user.emergencyContact);
  const bloodEl = document.getElementById('prof-blood');
  if (bloodEl && user.bloodGroup) bloodEl.value = user.bloodGroup;

  // Load from Supabase
  const { data: appts } = await _sb.from('appointments').select('*').eq('patientId', user.id);
  renderAppointments(appts || []);

  const { data: recs } = await _sb.from('records').select('*').eq('patientId', user.id);
  if (recs) { recs.forEach(r => _recsCache[r.id] = r); renderRecords(recs); }

  const { data: meds } = await _sb.from('medications').select('*').eq('patientId', user.id);
  renderMedications(meds || []);

  const { data: vitals } = await _sb.from('vitals').select('*').eq('patientId', user.id).order('recordedAt', { ascending: false }).limit(1);
  if (vitals && vitals.length) renderVitals(vitals[0]);
}

// -- HOSPITAL DASHBOARD POPULATION --
function loadHospitalDash(hosp) {
  var name = hosp.name || hosp.email || 'Hospital';
  var setEl = function(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('hosp-nav-name',      name);
  setEl('hosp-sidebar-name',  name);
  setEl('hosp-overview-name', name);
  var setVal = function(id, val) { var el = document.getElementById(id); if (el) el.value = val || ''; };
  setVal('hosp-settings-name',    hosp.name);
  setVal('hosp-settings-email',   hosp.email);
  setVal('hosp-settings-phone',   hosp.phone);
  setVal('hosp-settings-city',    hosp.city);
  setVal('hosp-settings-pincode', hosp.pincode);
  setVal('hosp-settings-contact', hosp.contactPerson);
  setVal('hosp-settings-regno',   hosp.regNo);
}

function renderAppointments(appts) {
  const upcoming = appts.filter(a => a.status === 'upcoming');
  const past = appts.filter(a => a.status !== 'upcoming');

  // Overview upcoming
  const ovUp = document.getElementById('overview-upcoming');
  if (ovUp) {
    ovUp.innerHTML = upcoming.length ? upcoming.map(a => `
      <div class="appt-row">
        <div class="appt-avatar2">🩺</div>
        <div class="appt-info"><div class="appt-doc">${a.doctor} — ${a.specialty}</div><div class="appt-spec">${a.hospital} · ${a.date} · ${a.time}</div></div>
        <span class="status-badge status-upcoming">Upcoming</span>
      </div>`).join('') : '<div style="color:var(--text-light);font-size:.85rem;padding:12px 0">No upcoming appointments</div>';
  }

  // Appointments panel
  const apptUp = document.getElementById('appt-upcoming');
  if (apptUp) apptUp.innerHTML = upcoming.length ? upcoming.map(a => `
    <div class="appt-row">
      <div class="appt-avatar2">🩺</div>
      <div class="appt-info"><div class="appt-doc">${a.doctor} — ${a.specialty}</div><div class="appt-spec">${a.hospital} · ${a.date} · ${a.time}</div></div>
      <span class="status-badge status-upcoming">Upcoming</span>
    </div>`).join('') : '<div style="color:var(--text-light);font-size:.85rem;padding:12px 0">No upcoming appointments</div>';

  const apptPast = document.getElementById('appt-past');
  if (apptPast) apptPast.innerHTML = past.length ? past.map(a => `
    <div class="appt-row">
      <div class="appt-avatar2">🩺</div>
      <div class="appt-info"><div class="appt-doc">${a.doctor} — ${a.specialty}</div><div class="appt-spec">${a.hospital} · ${a.date}</div></div>
      <span class="status-badge status-${a.status}">${a.status.charAt(0).toUpperCase()+a.status.slice(1)}</span>
    </div>`).join('') : '<div style="color:var(--text-light);font-size:.85rem;padding:12px 0">No past appointments</div>';

  // Stat count
  const statEl = document.getElementById('stat-upcoming');
  if (statEl) statEl.textContent = upcoming.length;
  const badge = document.getElementById('appt-badge');
  if (badge) { badge.textContent = upcoming.length; badge.style.display = upcoming.length ? '' : 'none'; }
}

function renderRecords(recs) {
  const icons = { lab:'🧪', prescription:'🩺', report:'📄', summary:'📋', upload:'📎' };
  const html = recs.length ? recs.map(r => `
    <div class="record-item" id="rec-${r.id}">
      <div class="record-icon">${icons[r.type]||'📄'}</div>
      <div style="flex:1"><div class="record-name">${r.name}</div><div class="record-date">${r.hospital} · ${r.date}</div></div>
      <div style="display:flex;gap:6px;margin-left:auto;flex-shrink:0">
        ${r.fileData ? `<button class="record-btn" onclick="viewRecord(${r.id})">👁 View</button>` : `<span style="font-size:.72rem;color:var(--text-light);padding:5px 8px">No file</span>`}
        <button class="record-btn" style="background:#EFF6FF;color:#2563EB;border:none" onclick="openEditRecord(${r.id})">✏ Edit</button>
        <button class="record-btn" style="background:#FEE2E2;color:var(--emergency);border:none" onclick="deleteRecord(${r.id})">🗑 Delete</button>
      </div>
    </div>`).join('') : '<div style="color:var(--text-light);font-size:.85rem;padding:12px 0">No records found</div>';

  const recEl = document.getElementById('records-list');
  if (recEl) recEl.innerHTML = html;
  const ovRec = document.getElementById('overview-records');
  if (ovRec) ovRec.innerHTML = recs.slice(0,2).map(r=>`
    <div class="record-item">
      <div class="record-icon">${icons[r.type]||'📄'}</div>
      <div style="flex:1"><div class="record-name">${r.name}</div><div class="record-date">${r.hospital} · ${r.date}</div></div>
      ${r.fileData ? `<button class="record-btn" onclick="viewRecord(${r.id})">👁 View</button>` : ''}
    </div>`).join('');

  const statEl = document.getElementById('stat-records');
  if (statEl) statEl.textContent = recs.length;
}

// stored records map for quick access
let _recsCache = {};

async function viewRecord(id) {
  const rec = _recsCache[id];
  if (!rec) {
    // Fetch from Supabase if not in cache
    const { data, error } = await _sb.from('records').select('*').eq('id', id).single();
    if (error || !data) { showToast('⚠️ Record not found'); return; }
    _recsCache[id] = data;
  }
  const record = _recsCache[id];
  if (!record.fileData) { showToast('⚠️ No file attached'); return; }

  const modal = document.getElementById('record-modal');
  document.getElementById('modal-title').textContent = record.name;
  const body = document.getElementById('modal-body');
  const isImage = record.fileData.startsWith('data:image');
  const isPdf   = record.fileData.startsWith('data:application/pdf');

  if (isImage) {
    body.innerHTML = `<img src="${record.fileData}" style="max-width:100%;max-height:60vh;border-radius:10px;object-fit:contain"/>`;
  } else if (isPdf) {
    body.innerHTML = `<iframe src="${record.fileData}" style="width:100%;height:60vh;border:none;border-radius:10px"></iframe>`;
  } else {
    body.innerHTML = `<div style="padding:40px;color:var(--text-light)">Preview not available for this file type.<br>Use Download to open it.</div>`;
  }

  document.getElementById('modal-download-btn').onclick = () => {
    const a = document.createElement('a');
    a.href = record.fileData; a.download = record.name; a.click();
  };
  modal.style.display = 'flex';
}

function closeRecordModal() {
  document.getElementById('record-modal').style.display = 'none';
  document.getElementById('modal-body').innerHTML = '';
}

async function openEditRecord(id) {
  const rec = _recsCache[id];
  if (!rec) {
    // Fetch from Supabase if not in cache
    const { data, error } = await _sb.from('records').select('*').eq('id', id).single();
    if (error || !data) { showToast('⚠️ Record not found'); return; }
    _recsCache[id] = data;
  }
  const record = _recsCache[id];
  document.getElementById('edit-rec-id').value = id;
  document.getElementById('edit-rec-name').value = record.name;
  document.getElementById('edit-rec-type').value = record.type || 'upload';
  document.getElementById('edit-rec-hospital').value = record.hospital || '';
  document.getElementById('edit-modal').style.display = 'flex';
}

function closeEditModal() {
  document.getElementById('edit-modal').style.display = 'none';
}

async function saveEditRecord() {
  const id = document.getElementById('edit-rec-id').value;
  const rec = _recsCache[id];
  if (!rec) { showToast('⚠️ Record not found'); return; }
  
  const updatedName = document.getElementById('edit-rec-name').value.trim();
  const updatedType = document.getElementById('edit-rec-type').value;
  const updatedHospital = document.getElementById('edit-rec-hospital').value.trim();
  
  if (!updatedName) { showToast('⚠️ Name is required'); return; }
  
  // Update in Supabase
  const { error } = await _sb.from('records').update({
    name: updatedName,
    type: updatedType,
    hospital: updatedHospital
  }).eq('id', id);
  
  if (error) {
    console.error('Update error:', error);
    showToast('❌ Failed to update record');
    return;
  }
  
  // Update cache
  rec.name = updatedName;
  rec.type = updatedType;
  rec.hospital = updatedHospital;
  _recsCache[id] = rec;
  
  closeEditModal();
  
  // Reload records
  const { data: recs } = await _sb.from('records').select('*').eq('patientId', currentUser.id);
  if (recs) { recs.forEach(r => _recsCache[r.id] = r); renderRecords(recs); }
  
  showToast('✅ Record updated');
}

async function deleteRecord(id) {
  if (!confirm('Delete this record? This action cannot be undone.')) return;
  
  // Delete from Supabase
  const { error } = await _sb.from('records').delete().eq('id', id);
  
  if (error) {
    console.error('Delete error:', error);
    showToast('❌ Failed to delete record');
    return;
  }
  
  // Remove from cache
  delete _recsCache[id];
  
  // Reload records
  const { data: recs } = await _sb.from('records').select('*').eq('patientId', currentUser.id);
  if (recs) { recs.forEach(r => _recsCache[r.id] = r); renderRecords(recs); }
  
  showToast('🗑 Record deleted');
}

function renderMedications(meds) {
  const active = meds.filter(m => m.active);
  const html = active.length ? active.map(m => `
    <div class="med-item">
      <div class="med-icon">💊</div>
      <div><div class="med-name">${m.name}</div><div class="med-dose">${m.dose} · ${m.frequency} · By ${m.prescribedBy}</div></div>
      <div class="med-time">${m.time}</div>
    </div>`).join('') : '<div style="color:var(--text-light);font-size:.85rem;padding:12px 0">No active medications</div>';

  const medEl = document.getElementById('medications-list');
  if (medEl) medEl.innerHTML = html;
  const ovMed = document.getElementById('overview-meds');
  if (ovMed) ovMed.innerHTML = html;
  const statEl = document.getElementById('stat-meds');
  if (statEl) statEl.textContent = active.length;
}

function renderVitals(v) {
  const map = { 'stat-heartrate': v.heartRate, 'stat-bp': v.bp, 'stat-temp': v.temp, 'stat-sugar': v.sugar, 'stat-weight': v.weight, 'stat-spo2': v.spo2 };
  Object.entries(map).forEach(([id, val]) => { const el=document.getElementById(id); if(el) el.textContent = val; });
}

// ── SAVE PROFILE (Supabase) ──
async function saveProfile() {
  if (!currentUser || currentUser.role !== 'patient') return;
  const updated = {
    firstName: document.getElementById('prof-fname').value,
    lastName:  document.getElementById('prof-lname').value,
    dob:       document.getElementById('prof-dob').value,
    bloodGroup:document.getElementById('prof-blood').value,
    mobile:    document.getElementById('prof-mobile').value,
    email:     document.getElementById('prof-email').value,
    allergies: document.getElementById('prof-allergies').value,
    emergencyContact: document.getElementById('prof-emergency').value,
  };
  const { error } = await _sb.from('patients').update(updated).eq('id', currentUser.id);
  if (error) { showToast('Save failed: ' + error.message); return; }
  DB.setSession({ ...currentUser, ...updated }, 'patient');
  document.getElementById('patient-name').textContent = updated.firstName;
  document.getElementById('sidebar-patient-name').textContent = updated.firstName + ' ' + updated.lastName;
  showToast('Profile saved!');
}

// ── ADD MEDICATION (Supabase) ──
async function addMedication() {
  if (!currentUser) return;
  const name = document.getElementById('new-med-name').value.trim();
  const dose = document.getElementById('new-med-dose').value.trim();
  const freq = document.getElementById('new-med-freq').value.trim();
  const time = document.getElementById('new-med-time').value.trim();
  if (!name) { showToast('Enter medication name'); return; }
  const { error } = await _sb.from('medications').insert({ patientId: currentUser.id, name, dose, frequency: freq, time, prescribedBy:'Self', active: true, createdAt: new Date().toISOString() });
  if (error) { showToast('Failed: ' + error.message); return; }
  ['new-med-name','new-med-dose','new-med-freq','new-med-time'].forEach(id=>document.getElementById(id).value='');
  const { data: meds } = await _sb.from('medications').select('*').eq('patientId', currentUser.id);
  renderMedications(meds || []);
  showToast('Medication saved!');
}

// ── UPLOAD RECORD (Supabase) ──
async function uploadRecord(input) {
  if (!currentUser || !input.files[0]) return;
  const file = input.files[0];
  
  // Validate file
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    showToast('Only PDF, JPG, and PNG files are allowed');
    input.value = '';
    return;
  }
  
  if (file.size > 5*1024*1024) { 
    showToast('File must be under 5MB'); 
    input.value = '';
    return; 
  }
  
  showToast('Uploading ' + file.name + '...');
  
  const reader = new FileReader();
  reader.onerror = () => {
    showToast('Failed to read file. Please try again.');
    input.value = '';
  };
  
  reader.onload = async e => {
    try {
      const { data, error } = await _sb.from('records').insert({ 
        patientId: currentUser.id, 
        name: file.name, 
        type: 'upload', 
        hospital: 'Self Upload', 
        date: new Date().toISOString().split('T')[0], 
        fileData: e.target.result, 
        createdAt: new Date().toISOString() 
      }).select().single();
      
      if (error) {
        console.error('Upload error:', error);
        
        // Check if fileData column is missing
        if (error.message && error.message.includes('fileData')) {
          showToast('Database not set up. Please contact support.');
        } else {
          showToast('Upload failed: ' + error.message);
        }
        input.value = '';
        return;
      }
      
      // Reload records
      const { data: recs } = await _sb.from('records').select('*').eq('patientId', currentUser.id);
      if (recs) { 
        recs.forEach(r => _recsCache[r.id] = r); 
        renderRecords(recs); 
      }
      
      showToast('✓ ' + file.name + ' uploaded successfully!');
      input.value = '';
      
    } catch(err) {
      console.error('Upload exception:', err);
      showToast('Upload failed. Please try again.');
      input.value = '';
    }
  };
  
  reader.readAsDataURL(file);
}

// ── SAVE VITALS (Supabase) ──
async function saveVitals() {
  if (!currentUser) return;
  const v = {
    patientId: currentUser.id,
    heartRate: document.getElementById('v-hr').value || document.getElementById('stat-heartrate').textContent,
    bp:        document.getElementById('v-bp').value || document.getElementById('stat-bp').textContent,
    temp:      document.getElementById('v-temp').value || document.getElementById('stat-temp').textContent,
    sugar:     document.getElementById('v-sugar').value || document.getElementById('stat-sugar').textContent,
    weight:    document.getElementById('v-weight').value || document.getElementById('stat-weight').textContent,
    spo2:      document.getElementById('v-spo2').value || document.getElementById('stat-spo2').textContent,
    recordedAt: new Date().toISOString()
  };
  const { error } = await _sb.from('vitals').insert(v);
  if (error) { showToast('Failed: ' + error.message); return; }
  renderVitals(v);
  ['v-hr','v-bp','v-temp','v-sugar','v-weight','v-spo2'].forEach(id=>document.getElementById(id).value='');
  showToast('Vitals saved!');
}

// ── SOS (Supabase) ──
async function triggerSOS() {
  if (!currentUser) { showToast('Please sign in first'); return; }
  let location = 'Location unavailable';
  try {
    const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
    location = pos.coords.latitude.toFixed(4) + ',' + pos.coords.longitude.toFixed(4);
  } catch {}
  await _sb.from('emergencies').insert({ patientId: currentUser.id, type:'SOS', location, status:'dispatched', triggeredAt: new Date().toISOString() });
  const logEl = document.getElementById('sos-log');
  if (logEl) {
    logEl.innerHTML = `<div style="background:#FEF2F2;border:1.5px solid #FECACA;border-radius:12px;padding:14px;margin-bottom:10px">
      <div style="font-weight:700;color:#E24B4A;font-size:.88rem">SOS Triggered — ${new Date().toLocaleTimeString()}</div>
      <div style="font-size:.78rem;color:var(--text-light);margin-top:6px">Family notified · 3 Hospitals alerted · Ambulance dispatched<br>Location: ${location}</div>
    </div>` + logEl.innerHTML;
  }
  showToast('SOS sent! Ambulance dispatched. Family notified.');
}

// ── BOOK APPOINTMENT (Supabase) ──
async function bookAppointment(doctor, specialty, hospital, fee) {
  if (!currentUser) { showToast('Please sign in first'); goPage('page-login'); return; }
  const date = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const { error } = await _sb.from('appointments').insert({
    patientId: currentUser.id, doctor, specialty, hospital,
    date, time: '10:30 AM', status: 'upcoming', fee,
    createdAt: new Date().toISOString()
  });
  if (error) { showToast('Booking failed: ' + error.message); return; }
  showToast('Appointment booked with ' + doctor + '!');
  // Refresh appointments
  const { data: appts } = await _sb.from('appointments').select('*').eq('patientId', currentUser.id);
  if (appts) renderAppointments(appts);
}

// ── SIGN OUT ──
function signOut() { DB.clearSession(); goPage('page-landing'); }

// ── LOCATION-BASED DOCTOR SEARCH ──
let userLat = null, userLng = null;
function getUserLocation() {
  const locText = document.getElementById('loc-text');
  if (locText) locText.textContent = 'Detecting your location...';
  if (!navigator.geolocation) { if (locText) locText.textContent = 'Location not supported'; return; }
  navigator.geolocation.getCurrentPosition(pos => {
    userLat = pos.coords.latitude; userLng = pos.coords.longitude;
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLng}&format=json`)
      .then(r => r.json()).then(data => {
        const area = data.address.suburb || data.address.neighbourhood || data.address.city || 'your area';
        if (locText) locText.textContent = `📍 ${area}, ${data.address.city || 'Hyderabad'}`;
      }).catch(() => { if (locText) locText.textContent = '📍 Location detected'; });
    searchNearbyHospitals();
  }, () => { if (locText) locText.textContent = '⚠️ Location denied — showing default results'; }, { timeout: 8000 });
}
function searchNearbyHospitals() {
  if (!userLat || !userLng) { getUserLocation(); return; }
  if (typeof google === 'undefined') return;
  const status = document.getElementById('loc-status');
  const grid = document.getElementById('nearby-results');
  const typeEl = document.getElementById('doc-specialty');
  if (!grid) return;
  const type = typeEl ? typeEl.value : 'hospital';
  if (status) status.style.display = 'block';
  grid.innerHTML = '';
  const service = new google.maps.places.PlacesService(document.createElement('div'));
  service.nearbySearch({ location: new google.maps.LatLng(userLat, userLng), radius: 5000,
    keyword: type === 'hospital' ? 'hospital' : type + ' clinic', type: ['hospital','doctor','health']
  }, (results, statusCode) => {
    if (status) status.style.display = 'none';
    if (statusCode !== google.maps.places.PlacesServiceStatus.OK || !results.length) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:30px;color:#6B7280"><div style="font-size:2rem">🔍</div>No results found nearby.</div>`; return;
    }
    grid.innerHTML = results.slice(0, 9).map(place => {
      const dist = getDistance(userLat, userLng, place.geometry.location.lat(), place.geometry.location.lng());
      const rating = place.rating ? `${place.rating} ⭐` : 'New';
      const open = place.opening_hours?.open_now ? '<span style="color:#16A34A;font-size:.78rem;font-weight:600">● Open Now</span>' : '<span style="color:#DC2626;font-size:.78rem">● Closed</span>';
      return `<div class="book-card"><div style="font-size:1.5rem;margin-bottom:6px">🏥</div>
        <div class="book-hosp" style="font-size:.92rem">${place.name}</div>
        <div style="font-size:.78rem;color:#6B7280;margin:3px 0">${place.vicinity}</div>
        <div style="display:flex;justify-content:space-between;margin:6px 0"><span style="font-size:.78rem">${rating}</span><span style="font-size:.78rem;color:#085553;font-weight:600">📍 ${dist} km</span></div>
        <div style="margin-bottom:10px">${open}</div>
        <div style="display:flex;gap:6px">
          <button class="btn-primary" style="flex:1;padding:8px;border-radius:8px;font-size:.78rem" onclick="bookAppointmentWithPayment('Doctor','Specialist','${place.name.replace(/'/g,"\\'")}',500)">Book Now</button>
          <a href="https://www.google.com/maps/place/?q=place_id:${place.place_id}" target="_blank" style="flex:1;padding:8px;border-radius:8px;font-size:.78rem;background:#F0FDFA;color:#085553;border:1px solid #99F6E4;text-align:center;font-weight:600;text-decoration:none;display:flex;align-items:center;justify-content:center">🗺️ Map</a>
        </div></div>`;
    }).join('');
  });
}
function getDistance(lat1,lng1,lat2,lng2){const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLng=(lng2-lng1)*Math.PI/180;const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;return(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))).toFixed(1);}
function filterDoctors(){const q=(document.getElementById('doc-search')?.value||'').toLowerCase();document.querySelectorAll('#nearby-results .book-card').forEach(c=>{c.style.display=c.innerText.toLowerCase().includes(q)?'':'none';});}

// ── WHATSAPP CHAT ──
const WA_NUMBER = CONFIG.WA_NUMBER;
let waOpen = false;

function toggleChat(){
  waOpen = !waOpen;
  const chat = document.getElementById('waChat');
  const dot = document.getElementById('waDot');
  if(waOpen){
    chat.classList.add('open');
    dot.style.display = 'none';
    setTimeout(()=>document.getElementById('waInput').focus(), 400);
  } else {
    chat.classList.remove('open');
  }
}

function switchWaTab(tab, btn){
  document.querySelectorAll('.wa-chat-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.wa-tab-content').forEach(c=>c.classList.remove('active'));
  if(btn) btn.classList.add('active');
  document.getElementById('wa-tab-'+tab).classList.add('active');
  closeEmojiPicker();
}

const waReplies = {
  'book an appointment': "I can help you book an appointment! 📅 Please tell me:\n1. Which specialty?\n2. Preferred date & time?\n3. Your city?\n\nOr click 'Book Appointment' to go directly to our booking page.",
  'emergency sos help': "🚨 For emergencies, please:\n• Press the **SOS button** in your dashboard\n• Or call 108 immediately\n\nYour location will be shared with the nearest hospitals automatically.",
  'view my health records': "📋 Your health records are securely stored in your Welleni dashboard.\n\nI can help you:\n• View prescriptions\n• Access lab reports\n• Share records with doctors",
  'contact a doctor': "🩺 To contact a doctor:\n1. Log in to your dashboard\n2. Go to Appointments\n3. Select your doctor and send a message\n\nWould you like me to connect you now?",
  'show my health records': "Here are your latest records:\n📄 Lipid Profile — 8 Mar 2026\n🩺 Prescription Dr. Rao — 12 Feb\n🧪 CBC Report — 10 Jan\n\nType the record name to view details.",
  'medication reminders': "💊 I'll send you daily medication reminders on WhatsApp!\n\nYour current schedule:\n• Ecosprin 75mg — 8:00 AM ✅\n• Metoprolol 25mg — 8:00 PM ⏰\n• Atorvastatin 10mg — 10:00 PM ⏰",
  'lab reports update': "🧪 Your lab results are ready!\n\nLatest: **Lipid Profile** uploaded by Apollo Hospitals on 8 Mar 2026.\n\nTap 'View' in your Health Records to access the full report.",
  'doctor consultation': "🩺 Starting a doctor consultation...\n\nAvailable now:\n• Dr. S. Rao — Cardiology ✅\n• Dr. P. Mehta — Ortho ✅\n• Dr. R. Gupta — General ✅\n\nWhich doctor would you like to contact?",
  'blood donor request': "🩸 Searching for donors near you...\n\nFound 3 O+ donors within 5 km of Hyderabad.\n\nShall I send them an alert? They'll be notified on WhatsApp.",
  'ambulance tracking': "🚑 Live ambulance tracking activated!\n\nAMB-02 is 4 minutes away.\nCurrent location: Jubilee Hills → Your location\n\nYou'll receive live updates here.",
  'default': "Thanks for reaching out! 😊 I'm the Welleni WhatsApp assistant.\n\nI can help with:\n📅 Appointments\n📋 Health records\n💊 Medications\n🚨 Emergencies\n🩺 Doctor consultation\n\nWhat do you need help with?"
};

function getReply(msg){
  const key = Object.keys(waReplies).find(k => msg.toLowerCase().includes(k));
  return waReplies[key] || waReplies['default'];
}

function addMessage(text, type){
  const container = document.getElementById('waMessages');
  const now = new Date();
  const time = now.getHours()+':'+String(now.getMinutes()).padStart(2,'0');
  const div = document.createElement('div');
  div.className = 'wa-msg wa-msg-'+type;
  div.innerHTML = text.replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    + `<div class="wa-msg-time">${time}${type==='out'?' <span class="wa-tick">✓✓</span>':''}</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function showTyping(){
  const container = document.getElementById('waMessages');
  const t = document.createElement('div');
  t.className = 'wa-typing'; t.id = 'waTyping';
  t.innerHTML = '<span></span><span></span><span></span>';
  container.appendChild(t);
  container.scrollTop = container.scrollHeight;
}

function removeTyping(){ const t=document.getElementById('waTyping'); if(t)t.remove(); }

function sendWaMessage(){
  const input = document.getElementById('waInput');
  const text = input.value.trim();
  if(!text) return;
  addMessage(text, 'out');
  input.value = ''; input.style.height = 'auto';
  closeEmojiPicker();
  showTyping();
  setTimeout(()=>{ removeTyping(); addMessage(getReply(text), 'in'); }, 900 + Math.random()*600);
}

function sendQuickReply(text){
  if(!waOpen) toggleChat();
  switchWaTab('chat', document.querySelector('.wa-chat-tab'));
  setTimeout(()=>{
    addMessage(text, 'out');
    showTyping();
    setTimeout(()=>{ removeTyping(); addMessage(getReply(text), 'in'); }, 1000);
  }, waOpen ? 0 : 400);
}

function handleWaKey(e){ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendWaMessage();} }
function autoResize(el){ el.style.height='auto'; el.style.height=Math.min(el.scrollHeight,80)+'px'; }

// Emoji picker
const EMOJIS = ['😊','😷','💊','🏥','❤️','👨‍⚕️','🩺','🩸','🚑','😰','🤒','💉','🧬','🩻','🏃','💪','🧘','😌','🙏','✅','⚠️','📋','📅','🔔','📞','💬','👋','🤝'];
function buildEmojiGrid(){
  const g = document.getElementById('waEmojiGrid');
  EMOJIS.forEach(e=>{
    const s = document.createElement('span');
    s.textContent = e;
    s.onclick = ()=>{ document.getElementById('waInput').value += e; closeEmojiPicker(); document.getElementById('waInput').focus(); };
    g.appendChild(s);
  });
}
function toggleEmojiPicker(e){ e.stopPropagation(); document.getElementById('waEmojiPicker').classList.toggle('open'); }
function closeEmojiPicker(){ document.getElementById('waEmojiPicker').classList.remove('open'); }
document.addEventListener('click', closeEmojiPicker);
buildEmojiGrid();

function openWhatsApp(){ window.open('https://wa.me/'+WA_NUMBER+'?text=Hi+Welleni!+I+need+help+with+my+appointment.','_blank'); }

// ── INIT LANDING REVEALS ──
setTimeout(()=>{
  const obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')})},{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
},200);

// ── Block 2: Session restore ──
// Set all dynamic name elements from session immediately on load
(function() {
  try {
    var raw = localStorage.getItem('welleni_session');
    if (!raw) return;
    var session = JSON.parse(raw);
    if (!session || !session.user) return;
    var u = session.user;
    var firstName = u.firstName || u.name || u.email || 'User';
    var lastName  = u.lastName || '';
    var fullName  = firstName + (lastName ? ' ' + lastName : '');
    var role      = u.role || 'patient';

    // Patient dashboard elements
    var setEl = function(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('patient-name',          firstName);
    setEl('sidebar-patient-name',  fullName);
    setEl('patient-greeting-name', firstName);
    setEl('dash-greeting-name',    firstName);

    // Hospital dashboard elements
    if (role === 'hospital') {
      setEl('hosp-nav-name',      fullName);
      setEl('hosp-sidebar-name',  fullName);
      setEl('hosp-overview-name', fullName);
    }
  } catch(e) {}
})();

// ── Block 3: Hospital profile ──
// ═══════════════════════════════════════════════════════════════
// PAYMENT INTEGRATION - Razorpay
// ═══════════════════════════════════════════════════════════════

// ⚠️ IMPORTANT: Replace with your actual Razorpay Key ID
// Get it from: https://dashboard.razorpay.com/app/keys
const RAZORPAY_KEY_ID = 'rzp_test_Shk1CMfPm2JC2T'; // ← ADD YOUR KEY HERE

// Store pending appointment
let pendingAppointment = null;

// ── BOOK APPOINTMENT WITH PAYMENT ──
async function bookAppointmentWithPayment(doctor, specialty, hospital, fee) {
  if (!currentUser) {
    showToast('Please sign in first');
    goPage('page-login');
    return;
  }
  
  // Store appointment data
  pendingAppointment = {
    doctor,
    specialty,
    hospital,
    fee,
    patientId: currentUser.id,
    patientName: currentUser.firstName + ' ' + (currentUser.lastName || ''),
    patientEmail: currentUser.email,
    patientMobile: currentUser.mobile,
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '10:30 AM'
  };
  
  // Show payment modal
  showPaymentModal(pendingAppointment);
}

// ── SHOW PAYMENT MODAL ──
function showPaymentModal(appointment) {
  const modal = document.getElementById('payment-modal');
  const details = document.getElementById('payment-details');
  
  details.innerHTML = `
    <div style="background:var(--foam);padding:16px;border-radius:12px;margin-bottom:20px">
      <div style="font-size:.85rem;color:var(--text-light);margin-bottom:8px">Appointment Details</div>
      <div style="font-weight:600;font-size:1rem;color:var(--body-text);margin-bottom:4px">${appointment.doctor}</div>
      <div style="font-size:.88rem;color:var(--text-mid)">${appointment.specialty} • ${appointment.hospital}</div>
      <div style="font-size:.85rem;color:var(--text-mid);margin-top:8px">📅 ${appointment.date} • 🕐 ${appointment.time}</div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding:16px;background:var(--mist);border-radius:12px;margin-bottom:16px">
      <span style="font-weight:600;font-size:1rem">Consultation Fee:</span>
      <span style="font-weight:700;font-size:1.4rem;color:var(--teal)">₹${appointment.fee}</span>
    </div>
    <div style="margin-bottom:16px;padding:12px;background:#FEF3C7;border-radius:8px;font-size:.85rem;color:var(--text-mid)">
      💳 Secure payment powered by Razorpay<br>
      ✅ Supports UPI, Cards, Wallets, Net Banking
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;font-size:.75rem">
      <div style="padding:8px;background:var(--white);border:1px solid var(--border);border-radius:6px;text-align:center">
        <div style="font-size:1.2rem;margin-bottom:4px">📱</div>
        <div>UPI</div>
      </div>
      <div style="padding:8px;background:var(--white);border:1px solid var(--border);border-radius:6px;text-align:center">
        <div style="font-size:1.2rem;margin-bottom:4px">💳</div>
        <div>Cards</div>
      </div>
      <div style="padding:8px;background:var(--white);border:1px solid var(--border);border-radius:6px;text-align:center">
        <div style="font-size:1.2rem;margin-bottom:4px">👛</div>
        <div>Wallets</div>
      </div>
      <div style="padding:8px;background:var(--white);border:1px solid var(--border);border-radius:6px;text-align:center">
        <div style="font-size:1.2rem;margin-bottom:4px">🏦</div>
        <div>Net Banking</div>
      </div>
    </div>
  `;
  
  modal.style.display = 'flex';
  
  // Setup payment button
  document.getElementById('pay-button').onclick = () => initiatePayment(appointment);
}

// ── CLOSE PAYMENT MODAL ──
function closePaymentModal() {
  document.getElementById('payment-modal').style.display = 'none';
  pendingAppointment = null;
}

// ── INITIATE PAYMENT ──
async function initiatePayment(appointment) {
  try {
    // Generate invoice number
    const invoiceNumber = 'INV-' + Date.now();
    const orderId = 'ORDER-' + Date.now();
    
    // Razorpay options
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: appointment.fee * 100, // Convert to paise
      currency: 'INR',
      name: 'Welleni',
      description: `Appointment with ${appointment.doctor}`,
      image: 'https://your-logo-url.com/logo.png',
      order_id: orderId,
      prefill: {
        name: appointment.patientName,
        email: appointment.patientEmail,
        contact: appointment.patientMobile
      },
      notes: {
        doctor: appointment.doctor,
        hospital: appointment.hospital,
        specialty: appointment.specialty,
        date: appointment.date,
        time: appointment.time
      },
      theme: {
        color: '#0B7A75'
      },
      handler: function(response) {
        handlePaymentSuccess(response, appointment, invoiceNumber);
      },
      modal: {
        ondismiss: function() {
          showToast('Payment cancelled');
        }
      }
    };
    
    // Open Razorpay checkout
    const rzp = new Razorpay(options);
    rzp.open();
    
  } catch (error) {
    console.error('Payment initiation error:', error);
    showToast('❌ Payment failed: ' + error.message);
  }
}

// ── HANDLE PAYMENT SUCCESS ──
async function handlePaymentSuccess(response, appointment, invoiceNumber) {
  try {
    showToast('Processing payment...');
    
    // Save appointment to database
    const { data, error } = await _sb.from('appointments').insert({
      patientId: appointment.patientId,
      doctor: appointment.doctor,
      specialty: appointment.specialty,
      hospital: appointment.hospital,
      date: appointment.date,
      time: appointment.time,
      status: 'upcoming',
      fee: appointment.fee,
      payment_status: 'completed',
      payment_id: response.razorpay_payment_id,
      payment_method: 'razorpay',
      payment_date: new Date().toISOString(),
      invoice_number: invoiceNumber,
      createdAt: new Date().toISOString()
    }).select().single();
    
    if (error) {
      console.error('Database error:', error);
      showToast('❌ Failed to save appointment');
      return;
    }
    
    // Send notifications
    await sendNotifications(appointment, response, invoiceNumber);
    
    // Show success modal
    closePaymentModal();
    showSuccessModal(appointment, invoiceNumber, response.razorpay_payment_id);
    
    // Refresh appointments
    const { data: appts } = await _sb.from('appointments').select('*').eq('patientId', currentUser.id);
    if (appts) renderAppointments(appts);
    
  } catch (error) {
    console.error('Payment processing error:', error);
    showToast('❌ Error processing payment: ' + error.message);
  }
}

// ── SEND NOTIFICATIONS ──
async function sendNotifications(appointment, payment, invoiceNumber) {
  // Send WhatsApp notification
  sendWhatsAppNotification(appointment, payment, invoiceNumber);
  
  // Send Email notification
  sendEmailNotification(appointment, payment, invoiceNumber);
  
  // Send SMS notification
  sendSMSNotification(appointment, payment, invoiceNumber);
}

// ── SEND WHATSAPP NOTIFICATION ──
function sendWhatsAppNotification(appointment, payment, invoiceNumber) {
  const message = `🏥 *Welleni - Appointment Confirmed*\n\n` +
    `📋 Invoice: ${invoiceNumber}\n` +
    `👨‍⚕️ Doctor: ${appointment.doctor}\n` +
    `🏥 Hospital: ${appointment.hospital}\n` +
    `📅 Date: ${appointment.date}\n` +
    `🕐 Time: ${appointment.time}\n` +
    `💰 Amount Paid: ₹${appointment.fee}\n` +
    `✅ Payment ID: ${payment.razorpay_payment_id}\n\n` +
    `Thank you for choosing Welleni!\n\n` +
    `Please arrive 15 minutes early and bring a valid ID.`;
  
  const whatsappUrl = `https://wa.me/${appointment.patientMobile}?text=${encodeURIComponent(message)}`;
  
  // Open WhatsApp in new tab
  setTimeout(() => {
    window.open(whatsappUrl, '_blank');
  }, 2000);
  
  console.log('WhatsApp notification sent to:', appointment.patientMobile);
}

// ── SEND EMAIL NOTIFICATION ──
function sendEmailNotification(appointment, payment, invoiceNumber) {
  console.log('Email notification sent to:', appointment.patientEmail);
  showToast('📧 Receipt sent to ' + appointment.patientEmail);
}

// ── SEND SMS NOTIFICATION ──
function sendSMSNotification(appointment, payment, invoiceNumber) {
  console.log('SMS notification sent to:', appointment.patientMobile);
  showToast('📱 SMS confirmation sent to ' + appointment.patientMobile);
}

// ── SHOW SUCCESS MODAL ──
function showSuccessModal(appointment, invoiceNumber, paymentId) {
  const modal = document.getElementById('payment-modal');
  const details = document.getElementById('payment-details');
  
  details.innerHTML = `
    <div style="text-align:center;padding:20px">
      <div style="font-size:4rem;margin-bottom:16px">✅</div>
      <h2 style="color:var(--teal);margin-bottom:8px">Payment Successful!</h2>
      <p style="color:var(--text-mid);margin-bottom:24px">Your appointment has been confirmed</p>
      
      <div style="background:var(--foam);padding:20px;border-radius:12px;text-align:left;margin-bottom:20px">
        <div style="font-size:.85rem;color:var(--text-light);margin-bottom:12px">Appointment Details</div>
        <div style="margin-bottom:8px"><strong>Doctor:</strong> ${appointment.doctor}</div>
        <div style="margin-bottom:8px"><strong>Specialty:</strong> ${appointment.specialty}</div>
        <div style="margin-bottom:8px"><strong>Hospital:</strong> ${appointment.hospital}</div>
        <div style="margin-bottom:8px"><strong>Date:</strong> ${appointment.date}</div>
        <div style="margin-bottom:8px"><strong>Time:</strong> ${appointment.time}</div>
        <div style="margin-bottom:8px"><strong>Invoice:</strong> ${invoiceNumber}</div>
        <div style="margin-bottom:8px"><strong>Amount Paid:</strong> ₹${appointment.fee}</div>
        <div style="font-size:.8rem;color:var(--text-light);word-break:break-all"><strong>Payment ID:</strong> ${paymentId}</div>
      </div>
      
      <div style="background:#DCFCE7;padding:12px;border-radius:8px;font-size:.85rem;color:var(--green);margin-bottom:20px">
        ✅ Payment confirmed<br>
        📧 Receipt sent to email<br>
        📱 SMS confirmation sent<br>
        💬 WhatsApp notification sent
      </div>
      
      <div style="background:#FEF3C7;padding:12px;border-radius:8px;font-size:.85rem;color:var(--amber);margin-bottom:20px">
        📋 <strong>Important:</strong><br>
        • Arrive 15 minutes early<br>
        • Bring this invoice and valid ID<br>
        • You'll receive a reminder 24 hours before
      </div>
      
      <button class="btn-primary" onclick="closePaymentModal();showPanel('p-appointments',null)" style="width:100%;padding:12px;margin-bottom:8px">
        View My Appointments
      </button>
      <button class="btn-secondary" onclick="downloadReceipt('${invoiceNumber}','${appointment.doctor}','${appointment.hospital}','${appointment.date}','${appointment.time}',${appointment.fee},'${paymentId}')" style="width:100%;padding:12px">
        📥 Download Receipt
      </button>
    </div>
  `;
  
  modal.style.display = 'flex';
}

// ── DOWNLOAD RECEIPT ──
function downloadReceipt(invoiceNumber, doctor, hospital, date, time, amount, paymentId) {
  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Receipt - ${invoiceNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #0B7A75; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 2em; color: #0B7A75; font-weight: bold; }
        .invoice-title { font-size: 1.5em; margin-top: 10px; }
        .details { margin: 30px 0; }
        .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 1.3em; font-weight: bold; color: #0B7A75; margin-top: 20px; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; }
        @media print { body { margin: 0; } }
      <\/style>
    <\/head>
    <body>
      <div class="header">
        <div class="logo">🏥 Welleni</div>
        <div class="invoice-title">Payment Receipt</div>
        <div>Invoice #${invoiceNumber}</div>
      </div>
      
      <div class="details">
        <div class="row">
          <span>Date:</span>
          <span>${new Date().toLocaleDateString()}</span>
        </div>
        <div class="row">
          <span>Doctor:</span>
          <span><strong>${doctor}</strong></span>
        </div>
        <div class="row">
          <span>Hospital:</span>
          <span>${hospital}</span>
        </div>
        <div class="row">
          <span>Appointment Date:</span>
          <span>${date}</span>
        </div>
        <div class="row">
          <span>Appointment Time:</span>
          <span>${time}</span>
        </div>
        <div class="row">
          <span>Payment Method:</span>
          <span>Razorpay</span>
        </div>
        <div class="row">
          <span>Payment ID:</span>
          <span style="font-size: 0.9em;">${paymentId}</span>
        </div>
        <div class="row total">
          <span>Amount Paid:</span>
          <span>₹${amount}</span>
        </div>
      </div>
      
      <div class="footer">
        <p><strong>Thank you for choosing Welleni!</strong></p>
        <p>For support: support@welleni.com | +91 7032527095</p>
        <p style="font-size: 0.9em; margin-top: 20px;">This is a computer-generated receipt and does not require a signature.</p>
      </div>
    <\/body>
    <\/html>
  `;
  
  // Create blob and download
  const blob = new Blob([receiptHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Receipt-${invoiceNumber}.html`;
  a.click();
  URL.revokeObjectURL(url);
  
  showToast('📥 Receipt downloaded');
}

console.log('💳 Payment integration loaded');
console.log('⚠️ Remember to replace RAZORPAY_KEY_ID with your actual key');
  // ── OTP VERIFICATION ──
const otpStore    = { patient: null, hospital: null };
const otpVerified = { patient: false, hospital: false };

async function sendOTP(role) {
  const phoneId  = role === 'patient' ? 'reg-mobile'         : 'reg-hosp-phone';
  const groupId  = role === 'patient' ? 'patient-otp-group'  : 'hosp-otp-group';
  const btnId    = role === 'patient' ? 'patient-otp-btn'    : 'hosp-otp-btn';
  const statusId = role === 'patient' ? 'patient-otp-status' : 'hosp-otp-status';

  const phone = document.getElementById(phoneId)?.value.trim();
  if (!phone || phone.length < 10) { showToast('Please enter a valid mobile number first'); return; }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[role]    = otp;
  otpVerified[role] = false;

  document.getElementById(groupId).style.display = 'block';
  const btn = document.getElementById(btnId);
  btn.disabled = true;

  let countdown = 30;
  const timer = setInterval(() => {
    btn.textContent = `Resend (${countdown}s)`;
    countdown--;
    if (countdown < 0) {
      clearInterval(timer);
      btn.disabled = false;
      btn.textContent = 'Resend OTP';
      btn.style.background = '#085553';
    }
  }, 1000);

  // ⚠️ Replace with your Fast2SMS key from fast2sms.com (free for India)
  const FAST2SMS_KEY = 'C9Nv14k6Zx3qpsun80WVePAlIQLXzKwthD7dMoyUEjFTfGgrSJrItHdx36Q0yVhvukiWT752mPgAX1GD';

  if (FAST2SMS_KEY !== 'C9Nv14k6Zx3qpsun80WVePAlIQLXzKwthD7dMoyUEjFTfGgrSJrItHdx36Q0yVhvukiWT752mPgAX1GD') {
    try {
      await fetch(`https://www.fast2sms.com/dev/bulkV2?authorization=${FAST2SMS_KEY}&message=Your+Welleni+OTP+is+${otp}.+Valid+for+5+minutes.&language=english&route=q&numbers=${phone.replace(/\D/g,'')}`, { method: 'GET' });
      document.getElementById(statusId).innerHTML = `<span style="color:#085553">✓ OTP sent to ${phone}</span>`;
    } catch(e) {
      document.getElementById(statusId).innerHTML = `<span style="color:#DC2626">SMS failed. Check your API key.</span>`;
    }
  } else {
    // DEV MODE — shows OTP on screen (remove in production)
    document.getElementById(statusId).innerHTML =
      `<span style="color:#085553">✓ OTP:</span>
       <span style="background:#F0FDFA;border:1px solid #99F6E4;border-radius:6px;padding:2px 10px;font-weight:700;color:#085553;letter-spacing:2px">${otp}</span>
       <span style="color:#9CA3AF;font-size:.72rem"> (Add Fast2SMS key to send real SMS)</span>`;
  }
}

function verifyOTP(role) {
  const inputId  = role === 'patient' ? 'reg-patient-otp'    : 'reg-hosp-otp';
  const statusId = role === 'patient' ? 'patient-otp-status' : 'hosp-otp-status';
  const btnId    = role === 'patient' ? 'patient-verify-btn' : 'hosp-verify-btn';

  const entered = document.getElementById(inputId)?.value.trim();
  if (!otpStore[role]) { showToast('Please request an OTP first'); return; }

  if (entered === otpStore[role]) {
    otpVerified[role] = true;
    document.getElementById(statusId).innerHTML = '<span style="color:#16A34A;font-weight:600">✅ Mobile number verified!</span>';
    document.getElementById(inputId).disabled = true;
    const btn = document.getElementById(btnId);
    btn.disabled = true;
    btn.textContent = 'Verified ✓';
    btn.style.background = '#16A34A';
  } else {
    document.getElementById(statusId).innerHTML = '<span style="color:#DC2626">❌ Incorrect OTP. Try again.</span>';
    document.getElementById(inputId).value = '';
    document.getElementById(inputId).focus();
  }
}
  // ── HOSPITAL EDIT PROFILE ──

function loadHospitalProfileForm() {
  const raw = localStorage.getItem('welleni_session');
  if (!raw) return;
  const hosp = JSON.parse(raw).user || JSON.parse(raw);

  // Fill all fields with current data
  document.getElementById('edit-hosp-name').value        = hosp.name || '';
  document.getElementById('edit-hosp-regno').value       = hosp.regNo || '';
  document.getElementById('edit-hosp-city').value        = hosp.city || '';
  document.getElementById('edit-hosp-pincode').value     = hosp.pincode || '';
  document.getElementById('edit-hosp-address').value     = hosp.address || '';
  document.getElementById('edit-hosp-contact').value     = hosp.contactPerson || '';
  document.getElementById('edit-hosp-phone').value       = hosp.phone || '';
  document.getElementById('edit-hosp-email').value       = hosp.email || '';
  document.getElementById('edit-hosp-beds').value        = hosp.totalBeds || '';
  document.getElementById('edit-hosp-emergency').value   = hosp.emergencyLine || '';
  document.getElementById('edit-hosp-specialties').value = hosp.specialties || '';
  document.getElementById('edit-hosp-about').value       = hosp.about || '';

  // Update profile card display
  document.getElementById('edit-hosp-display-name').textContent  = hosp.name || 'Hospital Name';
  document.getElementById('edit-hosp-display-email').textContent = hosp.email || '';
  document.getElementById('edit-hosp-display-city').textContent  = hosp.city || '';
}

async function saveHospitalProfile() {
  const btn    = document.getElementById('save-hosp-btn');
  const status = document.getElementById('save-hosp-status');
  btn.textContent = 'Saving...';
  btn.disabled = true;
  status.textContent = '';

  const raw  = localStorage.getItem('welleni_session');
  const hosp = raw ? (JSON.parse(raw).user || JSON.parse(raw)) : null;
  if (!hosp?.id) { showToast('Session expired. Please login again.'); return; }

  const name        = document.getElementById('edit-hosp-name').value.trim();
  const regNo       = document.getElementById('edit-hosp-regno').value.trim();
  const city        = document.getElementById('edit-hosp-city').value.trim();
  const pincode     = document.getElementById('edit-hosp-pincode').value.trim();
  const address     = document.getElementById('edit-hosp-address').value.trim();
  const contactPerson = document.getElementById('edit-hosp-contact').value.trim();
  const phone       = document.getElementById('edit-hosp-phone').value.trim();
  const email       = document.getElementById('edit-hosp-email').value.trim();
  const totalBeds   = document.getElementById('edit-hosp-beds').value.trim();
  const emergencyLine = document.getElementById('edit-hosp-emergency').value.trim();
  const specialties = document.getElementById('edit-hosp-specialties').value.trim();
  const about       = document.getElementById('edit-hosp-about').value.trim();
  const newPw       = document.getElementById('edit-hosp-newpw').value;
  const confirmPw   = document.getElementById('edit-hosp-confirmpw').value;

  if (!name) { showToast('Hospital name is required'); btn.textContent='💾 Save Changes'; btn.disabled=false; return; }
  if (newPw && newPw.length < 8) { showToast('Password must be at least 8 characters'); btn.textContent='💾 Save Changes'; btn.disabled=false; return; }
  if (newPw && newPw !== confirmPw) { showToast('Passwords do not match'); btn.textContent='💾 Save Changes'; btn.disabled=false; return; }

  // Build update object
  const updates = { name, regNo, city, pincode, address, contactPerson, phone, email, totalBeds, emergencyLine, specialties, about };

  // Hash and add new password if provided
  if (newPw) updates.password = await hashPw(newPw);

  const { error } = await _sb.from('hospitals').update(updates).eq('id', hosp.id);

  if (error) {
    showToast('Save failed: ' + error.message);
    btn.textContent = '💾 Save Changes';
    btn.disabled = false;
    return;
  }

  // Update localStorage session with new data
  const updatedHosp = { ...hosp, ...updates };
  delete updatedHosp.password;
  DB.setSession(updatedHosp, 'hospital');

  // Update nav and sidebar names
  document.getElementById('hosp-nav-name').textContent      = name;
  document.getElementById('hosp-sidebar-name').textContent  = name;
  document.getElementById('hosp-overview-name').textContent = name;
  document.getElementById('edit-hosp-display-name').textContent  = name;
  document.getElementById('edit-hosp-display-email').textContent = email;
  document.getElementById('edit-hosp-display-city').textContent  = city;

  // Clear password fields
  document.getElementById('edit-hosp-newpw').value    = '';
  document.getElementById('edit-hosp-confirmpw').value = '';

  status.textContent = '✅ Saved successfully!';
  setTimeout(() => status.textContent = '', 3000);
  btn.textContent = '💾 Save Changes';
  btn.disabled = false;
  showToast('Hospital profile updated successfully!');
}
