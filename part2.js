var FS = firebase.firestore();
var AUTH = firebase.auth();// ==================== PART 2: CORE JAVASCRIPT ====================
// Auth, Users, Messages, Admin, Notes, Alarm, Timer

// ==================== CONFIG ====================
const ADMIN_PASSWORD = "wifeysamia";
const CURRENCY = "৳";

// ==================== STATE ====================
let currentUser = null;
let currentAuthTab = 'login';
let soundEnabled = true;
let currentNoteId = null;
let timerInterval = null, stopwatchInterval = null, stopwatchTime = 0;
let alarms = JSON.parse(localStorage.getItem('ultra_alarms')) || [];
let notes = JSON.parse(localStorage.getItem('ultra_notes')) || [];
let notifications = JSON.parse(localStorage.getItem('ultra_notifications')) || [];
let selectedChatUser = null;
let usersDB = JSON.parse(localStorage.getItem('ultra_users')) || [];
let activityLogs = JSON.parse(localStorage.getItem('ultra_logs')) || [];
let siteSettings = JSON.parse(localStorage.getItem('ultra_site_settings')) || { siteName:'Ultra Suite', announcement:'' };
let currentChatUnsubscribe = null;

// ==================== FIREBASE ALIASES ====================
// db এবং auth index.html এ initialized
const FS = window.db;
const AUTH = window.auth;

// ==================== ADMIN USER (localStorage) ====================
if (!usersDB.find(u => u.username === 'wifey_samia')) {
    usersDB.push({
        id: 'admin_1', username: 'wifey_samia', displayName: 'Wifey Samia',
        password: 'wifeysamia', status: 'active', joined: new Date().toISOString().split('T')[0],
        lastLogin: null, isOnline: false, visits: 0, isAdmin: true, email: '', avatar: null, bio: 'Admin of Ultra Suite 👑',
        isPrivate: false, following: [], followers: []
    });
    saveUsers();
}

// ==================== SAVE HELPERS ====================
function saveUsers() { localStorage.setItem('ultra_users', JSON.stringify(usersDB)); }
function saveLogs() { localStorage.setItem('ultra_logs', JSON.stringify(activityLogs.slice(0,100))); }
function saveSettings() { localStorage.setItem('ultra_site_settings', JSON.stringify(siteSettings)); }
function saveNotes() { localStorage.setItem('ultra_notes', JSON.stringify(notes)); }
function saveAlarms() { localStorage.setItem('ultra_alarms', JSON.stringify(alarms)); }
function saveNotifications() { localStorage.setItem('ultra_notifications', JSON.stringify(notifications)); }

function addLog(action, icon='info') {
    activityLogs.unshift({ time: new Date().toLocaleString(), action, icon, user: currentUser ? currentUser.username : 'guest' });
    if (activityLogs.length > 100) activityLogs = activityLogs.slice(0,100);
    saveLogs();
}

function addNotification(text, icon='info') {
    notifications.unshift({ id: Date.now(), text, icon, time: new Date().toLocaleString(), read: false });
    if (notifications.length > 50) notifications = notifications.slice(0,50);
    saveNotifications();
    updateNotifBadge();
}

// ==================== SOUND ====================
function playSound(type='click') {
    if (!soundEnabled) return;
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        const freqs = { click:800, success:1200, error:300, notification:1000, alarm:900 };
        osc.frequency.value = freqs[type] || 800;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(); osc.stop(ctx.currentTime + 0.15);
    } catch(e) {}
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    document.getElementById('soundIcon').className = soundEnabled ? 'fa-solid fa-volume-high text-sm sound-on' : 'fa-solid fa-volume-xmark text-sm sound-off';
    showToast(soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF', 'info');
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    document.getElementById('themeIcon').className = isLight ? 'fa-solid fa-sun text-sm' : 'fa-solid fa-moon text-sm';
    localStorage.setItem('ultra_theme', isLight ? 'light' : 'dark');
}
if (localStorage.getItem('ultra_theme') === 'light') {
    document.body.classList.add('light-mode');
    setTimeout(() => { const ic = document.getElementById('themeIcon'); if(ic) ic.className = 'fa-solid fa-sun text-sm'; }, 100);
}

function showToast(message, type='info') {
    const c = document.getElementById('toastContainer');
    if (!c) return;
    const t = document.createElement('div');
    const colors = { info:'bg-indigo-600/90 text-white', success:'bg-emerald-600/90 text-white', error:'bg-rose-600/90 text-white' };
    t.className = `px-4 py-2.5 rounded-xl shadow-lg backdrop-blur-md text-xs font-semibold flex items-center gap-2 transform transition-all duration-300 translate-y-[-10px] opacity-0 ${colors[type]}`;
    t.innerHTML = `<span>${message}</span>`;
    c.appendChild(t);
    setTimeout(() => t.classList.remove('translate-y-[-10px]', 'opacity-0'), 10);
    setTimeout(() => { t.classList.add('opacity-0', 'translate-y-[-10px]'); setTimeout(() => t.remove(), 300); }, 2500);
}

// ==================== AUTH ====================
function switchAuthTab(tab) {
    currentAuthTab = tab;
    const lt = document.getElementById('authTab-login');
    const st = document.getElementById('authTab-signup');
    if (tab === 'login') {
        lt.className = 'flex-1 py-2 rounded-lg text-xs font-semibold transition bg-indigo-600 text-white';
        st.className = 'flex-1 py-2 rounded-lg text-xs font-semibold transition text-slate-400 hover:text-white';
        document.getElementById('authSubmitText').textContent = 'Login';
        document.getElementById('loginSubtitle').textContent = 'Sign in to continue';
    } else {
        st.className = 'flex-1 py-2 rounded-lg text-xs font-semibold transition bg-indigo-600 text-white';
        lt.className = 'flex-1 py-2 rounded-lg text-xs font-semibold transition text-slate-400 hover:text-white';
        document.getElementById('authSubmitText').textContent = 'Create Account';
        document.getElementById('loginSubtitle').textContent = 'Create a new account';
    }
    document.getElementById('loginError').classList.add('hidden');
    document.getElementById('loginSuccess').classList.add('hidden');
}

function togglePasswordVisibility() {
    const i = document.getElementById('loginPassword');
    const ic = document.getElementById('eyeIcon');
    if (i.type === 'password') { i.type = 'text'; ic.className = 'fa-solid fa-eye-slash text-sm'; }
    else { i.type = 'password'; ic.className = 'fa-solid fa-eye text-sm'; }
}

async function handleAuth() {
    const username = document.getElementById('loginUsername').value.trim().toLowerCase().replace(/\s+/g,' ');
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    const errorText = document.getElementById('loginErrorText');
    const successEl = document.getElementById('loginSuccess');
    const successText = document.getElementById('loginSuccessText');
    errorEl.classList.add('hidden');
    successEl.classList.add('hidden');

    if (!username || !password) {
        errorText.textContent = 'Username এবং Password দুটোই দিন';
        errorEl.classList.remove('hidden');
        playSound('error');
        return;
    }
    if (username.length < 3) {
        errorText.textContent = 'ইউজারনেম কমপক্ষে ৩ অক্ষর';
        errorEl.classList.remove('hidden');
        return;
    }

    if (currentAuthTab === 'login') {
        // Firebase থেকে user খুঁজুন
        try {
            const snap = await FS.collection('users').where('username', '==', username).limit(1).get();
            if (snap.empty) {
                errorText.textContent = 'এই ইউজারনেমে অ্যাকাউন্ট নেই। Sign Up করুন।';
                errorEl.classList.remove('hidden');
                playSound('error');
                return;
            }
            const userDoc = snap.docs[0];
            const user = { id: userDoc.id, ...userDoc.data() };
            if (user.password !== password) {
                errorText.textContent = 'ভুল পাসওয়ার্ড!';
                errorEl.classList.remove('hidden');
                playSound('error');
                return;
            }
            if (user.status === 'banned') {
                errorText.textContent = 'আপনার অ্যাকাউন্ট ব্যান করা হয়েছে';
                errorEl.classList.remove('hidden');
                playSound('error');
                return;
            }
            currentUser = user;
            await FS.collection('users').doc(user.id).update({
                lastLogin: new Date().toISOString(),
                isOnline: true,
                visits: (user.visits || 0) + 1
            });
            localStorage.setItem('ultra_current_user', user.id);
            // Local cache এ update
            const localIdx = usersDB.findIndex(u => u.id === user.id);
            if (localIdx >= 0) usersDB[localIdx] = user; else usersDB.push(user);
            saveUsers();
            addLog(`${user.username} logged in`, 'login');
            playSound('success');
            loginSuccess();
        } catch(e) {
            console.error(e);
            errorText.textContent = 'Connection error: ' + e.message;
            errorEl.classList.remove('hidden');
        }
    } else {
        // SIGN UP - Check username unique
        try {
            const snap = await FS.collection('users').where('username', '==', username).limit(1).get();
            if (!snap.empty) {
                errorText.textContent = 'এই ইউজারনেম আগেই নেওয়া হয়েছে';
                errorEl.classList.remove('hidden');
                playSound('error');
                return;
            }
            if (password.length < 4) {
                errorText.textContent = 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষর';
                errorEl.classList.remove('hidden');
                return;
            }
            
            window._pendingUser = {
                username, displayName: username, password,
                status: 'active', joined: new Date().toISOString().split('T')[0],
                lastLogin: new Date().toISOString(), isOnline: true, visits: 1,
                isAdmin: false, email: '', avatar: null, bio: '',
                isPrivate: false, following: [], followers: []
            };
            playSound('success');
            openProfileSetup();
        } catch(e) {
            console.error(e);
            errorText.textContent = 'Connection error: ' + e.message;
            errorEl.classList.remove('hidden');
        }
    }
}

function openProfileSetup() {
    if (!window._pendingUser) return;
    document.getElementById('setupAvatarLetter').textContent = window._pendingUser.username.charAt(0).toUpperCase();
    document.getElementById('setupDisplayName').value = window._pendingUser.username;
    document.getElementById('setupUsernameDisplay').textContent = window._pendingUser.username;
    document.getElementById('setupAvatarDisplay').style.backgroundImage = '';
    document.getElementById('setupAvatarLetter').style.display = 'block';
    window._setupAvatar = null;
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('profileSetupModal').classList.remove('hidden');
    setTimeout(() => document.getElementById('setupDisplayName').focus(), 200);
}

function handleSetupAvatar(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('ছবি ২MB এর কম হতে হবে', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 256; canvas.height = 256;
            const ctx = canvas.getContext('2d');
            const size = Math.min(img.width, img.height);
            ctx.drawImage(img, (img.width-size)/2, (img.height-size)/2, size, size, 0, 0, 256, 256);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            window._setupAvatar = dataUrl;
            document.getElementById('setupAvatarDisplay').style.backgroundImage = `url(${dataUrl})`;
            document.getElementById('setupAvatarDisplay').style.backgroundSize = 'cover';
            document.getElementById('setupAvatarLetter').style.display = 'none';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

async function completeSignup() {
    if (!window._pendingUser) return;
    const displayName = document.getElementById('setupDisplayName').value.trim() || window._pendingUser.username;
    const bio = document.getElementById('setupBio').value.trim() || '';
    
    try {
        const userData = {
            ...window._pendingUser,
            displayName,
            bio,
            avatar: window._setupAvatar || null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        const docRef = await FS.collection('users').add(userData);
        const newUser = { id: docRef.id, ...userData };
        
        usersDB.push(newUser);
        saveUsers();
        currentUser = newUser;
        localStorage.setItem('ultra_current_user', newUser.id);
        
        addLog(`New account: ${newUser.username}`, 'user-plus');
        addNotification(`🎉 Welcome ${displayName}!`, 'user-plus');
        playSound('success');
        document.getElementById('profileSetupModal').classList.add('hidden');
        setTimeout(() => { document.getElementById('loginScreen').style.display = 'flex'; loginSuccess(); }, 300);
        window._pendingUser = null;
        window._setupAvatar = null;
    } catch(e) {
        showToast('Error: ' + e.message, 'error');
    }
}

function cancelSignup() {
    window._pendingUser = null;
    window._setupAvatar = null;
    document.getElementById('profileSetupModal').classList.add('hidden');
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
}

function loginSuccess() {
    document.getElementById('loginScreen').classList.add('login-fade-out');
    setTimeout(() => {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').classList.remove('hidden');
        updateUserUI();
        buildSidebar();
        buildViews();
        if (siteSettings.announcement) {
            const ad = document.getElementById('announcementDisplay');
            if (ad) { ad.classList.remove('hidden'); document.getElementById('announcementText').textContent = siteSettings.announcement; }
        }
    }, 500);
}

function updateUserUI() {
    if (!currentUser) return;
    const name = currentUser.displayName || currentUser.username;
    const el = document.getElementById('currentUserHeader');
    if (el) el.textContent = name;
    const av = document.getElementById('userAvatar');
    if (av) {
        av.textContent = name.charAt(0).toUpperCase();
        if (currentUser.avatar) {
            av.style.backgroundImage = `url(${currentUser.avatar})`;
            av.style.backgroundSize = 'cover';
            av.textContent = '';
        }
    }
    const si = document.getElementById('sidebarUserInfo');
    if (si) si.innerHTML = `<i class="fa-solid fa-user text-emerald-400 mr-1"></i>${currentUser.username}`;
}

async function handleLogout() {
    if (!confirm('Are you sure you want to logout?')) return;
    if (currentUser) {
        try {
            await FS.collection('users').doc(currentUser.id).update({
                isOnline: false,
                lastActive: Date.now()
            });
        } catch(e) {}
        addLog(`${currentUser.username} logged out`, 'logout');
    }
    currentUser = null;
    localStorage.removeItem('ultra_current_user');
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('loginScreen').classList.remove('login-fade-out');
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginUsername').value = '';
}

// ==================== AUTO LOGIN ====================
(async function autoLogin() {
    const savedUserId = localStorage.getItem('ultra_current_user');
    if (!savedUserId) return;
    try {
        const docSnap = await FS.collection('users').doc(savedUserId).get();
        if (!docSnap.exists) { localStorage.removeItem('ultra_current_user'); return; }
        const user = { id: docSnap.id, ...docSnap.data() };
        if (user.status === 'banned') { localStorage.removeItem('ultra_current_user'); return; }
        currentUser = user;
        await FS.collection('users').doc(user.id).update({ isOnline: true, lastLogin: new Date().toISOString() });
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').classList.remove('hidden');
        setTimeout(() => { updateUserUI(); buildSidebar(); buildViews(); }, 100);
    } catch(e) {
        console.error('Auto-login error:', e);
        localStorage.removeItem('ultra_current_user');
    }
})();

// ==================== SIDEBAR MENU ====================
const MENU = [
    { id:'dashboard', icon:'fa-house-laptop', color:'text-indigo-400', name:'Dashboard' },
    { id:'localgram', icon:'fa-instagram', color:'text-pink-400', name:'LocalGram', tag:'NEW' },
    { id:'quickeditor', icon:'fa-code', color:'text-emerald-400', name:'Live Editor', tag:'NEW' },
    { id:'notepad', icon:'fa-note-sticky', color:'text-yellow-400', name:'Notes Pad' },
    { id:'alarm', icon:'fa-clock', color:'text-red-400', name:'Alarm & Timer' },
    { id:'pomodoro', icon:'fa-stopwatch', color:'text-orange-400', name:'Pomodoro' },
    { id:'qrcode', icon:'fa-qrcode', color:'text-purple-400', name:'QR Generator' },
    { id:'colors', icon:'fa-palette', color:'text-pink-400', name:'Color Palette' },
    { id:'gradient', icon:'fa-fill-drip', color:'text-fuchsia-400', name:'Gradient Maker' },
    { id:'converter', icon:'fa-ruler-combined', color:'text-cyan-400', name:'Unit Converter' },
    { id:'calculator', icon:'fa-calculator', color:'text-blue-400', name:'Calculator' },
    { id:'agecalculator', icon:'fa-cake-candles', color:'text-pink-400', name:'Age Calc' },
    { id:'bmi', icon:'fa-weight-scale', color:'text-lime-400', name:'BMI Calc' },
    { id:'loan', icon:'fa-money-bill-trend-up', color:'text-green-400', name:'Loan Calc' },
    { id:'expense', icon:'fa-wallet', color:'text-emerald-400', name:'Expense' },
    { id:'water', icon:'fa-droplet', color:'text-blue-400', name:'Water' },
    { id:'habits', icon:'fa-fire', color:'text-orange-400', name:'Habits' },
    { id:'calendar', icon:'fa-calendar', color:'text-indigo-400', name:'Calendar' },
    { id:'quotes', icon:'fa-quote-left', color:'text-amber-400', name:'Quotes' },
    { id:'dice', icon:'fa-dice', color:'text-rose-400', name:'Dice & Random' },
    { id:'json', icon:'fa-file-code', color:'text-cyan-400', name:'JSON Format' },
    { id:'base64', icon:'fa-lock', color:'text-emerald-400', name:'Base64' },
    { id:'uuid', icon:'fa-fingerprint', color:'text-purple-400', name:'UUID Gen' },
    { id:'markdown', icon:'fa-markdown', color:'text-blue-400', name:'Markdown' },
    { id:'piano', icon:'fa-music', color:'text-pink-400', name:'Piano' },
    { id:'drum', icon:'fa-drum', color:'text-amber-400', name:'Drum Pad' },
    { id:'metronome', icon:'fa-wave-square', color:'text-cyan-400', name:'Metronome' },
    { id:'game2048', icon:'fa-hashtag', color:'text-orange-400', name:'2048' },
    { id:'sudoku', icon:'fa-table-cells', color:'text-blue-400', name:'Sudoku' },
    { id:'rps', icon:'fa-hand-scissors', color:'text-rose-400', name:'Rock Paper' },
    { id:'slot', icon:'fa-dice-five', color:'text-yellow-400', name:'Slot Machine' },
    { id:'webtools', icon:'fa-rocket', color:'text-pink-400', name:'Web Tools', tag:'7' },
    { id:'customapps', icon:'fa-globe', color:'text-cyan-400', name:'Custom Apps', badgeId:'customAppsCount' },
    { id:'arcade', icon:'fa-gamepad', color:'text-amber-400', name:'Arcade', tag:'4' },
    { id:'videostudio', icon:'fa-film', color:'text-rose-400', name:'Video Studio' },
    { id:'designstudio', icon:'fa-paintbrush', color:'text-purple-400', name:'Design Studio' },
    { id:'developer', icon:'fa-terminal', color:'text-emerald-400', name:'Developer' },
    { id:'tracker', icon:'fa-square-check', color:'text-teal-400', name:'Todo List' }
];

function buildSidebar() {
    const nav = document.getElementById('sidebarNav');
    if (!nav) return;
    nav.innerHTML = MENU.map(m => `
        <button onclick="switchTab('${m.id}')" id="nav-${m.id}" class="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition text-left text-sm font-medium ${m.id==='dashboard' ? 'active-nav-item' : ''}">
            <div class="flex items-center gap-3">
                <i class="fa-solid ${m.icon} ${m.color} w-5 text-center"></i>
                <span>${m.name}</span>
            </div>
            ${m.tag ? `<span class="px-2 py-0.5 text-[10px] font-bold rounded-md bg-pink-500/20 text-pink-300">${m.tag}</span>` : ''}
            ${m.badgeId ? `<span id="${m.badgeId}" class="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-400 font-mono">${customApps.length}</span>` : ''}
        </button>
    `).join('');
}

// ==================== SWITCH TAB ====================
function switchTab(id) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById('view-' + id);
    if (target) target.classList.remove('hidden');
    document.querySelectorAll('aside nav button').forEach(b => b.classList.remove('active-nav-item'));
    const btn = document.getElementById('nav-' + id);
    if (btn) btn.classList.add('active-nav-item');
    closeSidebar();
    playSound('click');
    
    if (id === 'calendar' && typeof renderCalendar === 'function') renderCalendar();
    if (id === 'habits' && typeof renderHabits === 'function') renderHabits();
    if (id === 'notepad' && typeof renderNotesList === 'function') renderNotesList();
    if (id === 'localgram' && typeof loadLocalGramFeed === 'function') loadLocalGramFeed();
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('-translate-x-full');
    document.getElementById('mobileBackdrop').classList.toggle('hidden');
}
function closeSidebar() {
    document.getElementById('sidebar').classList.add('-translate-x-full');
    document.getElementById('mobileBackdrop').classList.add('hidden');
}

// ==================== PROFILE MODAL ====================
function openProfileModal() {
    if (!currentUser) return;
    document.getElementById('profileDisplayName').value = currentUser.displayName || '';
    document.getElementById('profileBio').value = currentUser.bio || '';
    document.getElementById('profileNewPassword').value = '';
    document.getElementById('profileAvatarLetter').textContent = (currentUser.displayName || currentUser.username).charAt(0).toUpperCase();
    document.getElementById('profileAvatarLetter').style.display = 'block';
    if (currentUser.avatar) {
        document.getElementById('profileAvatarDisplay').style.backgroundImage = `url(${currentUser.avatar})`;
        document.getElementById('profileAvatarDisplay').style.backgroundSize = 'cover';
        document.getElementById('profileAvatarLetter').style.display = 'none';
    } else {
        document.getElementById('profileAvatarDisplay').style.backgroundImage = '';
    }
    document.getElementById('profileModal').classList.remove('hidden');
}
function closeProfileModal() { document.getElementById('profileModal').classList.add('hidden'); }

function uploadAvatar(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('ছবি ২MB এর কম হতে হবে', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 256; canvas.height = 256;
            const ctx = canvas.getContext('2d');
            const size = Math.min(img.width, img.height);
            ctx.drawImage(img, (img.width-size)/2, (img.height-size)/2, size, size, 0, 0, 256, 256);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            document.getElementById('profileAvatarDisplay').style.backgroundImage = `url(${dataUrl})`;
            document.getElementById('profileAvatarDisplay').style.backgroundSize = 'cover';
            document.getElementById('profileAvatarLetter').style.display = 'none';
            currentUser._tempAvatar = dataUrl;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

async function saveProfile() {
    if (!currentUser) return;
    const displayName = document.getElementById('profileDisplayName').value.trim() || currentUser.username;
    const bio = document.getElementById('profileBio').value.trim();
    const newPass = document.getElementById('profileNewPassword').value;
    
    const updates = { displayName, bio };
    if (newPass) {
        if (newPass.length < 4) return showToast('পাসওয়ার্ড কমপক্ষে ৪ অক্ষর', 'error');
        updates.password = newPass;
    }
    if (currentUser._tempAvatar) {
        updates.avatar = currentUser._tempAvatar;
    }
    
    try {
        await FS.collection('users').doc(currentUser.id).update(updates);
        Object.assign(currentUser, updates);
        delete currentUser._tempAvatar;
        const localIdx = usersDB.findIndex(u => u.id === currentUser.id);
        if (localIdx >= 0) usersDB[localIdx] = currentUser;
        saveUsers();
        updateUserUI();
        closeProfileModal();
        showToast('✅ Profile updated!', 'success');
    } catch(e) {
        showToast('Error: ' + e.message, 'error');
    }
}

// ==================== NOTIFICATIONS ====================
function toggleNotifications() {
    document.getElementById('notificationsPanel').classList.toggle('hidden');
    renderNotifications();
}

function updateNotifBadge() {
    const unread = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notifBadge');
    if (!badge) return;
    if (unread > 0) { badge.textContent = unread; badge.classList.remove('hidden'); }
    else badge.classList.add('hidden');
}

function renderNotifications() {
    const list = document.getElementById('notificationsList');
    if (!list) return;
    if (notifications.length === 0) { list.innerHTML = '<p class="text-xs text-slate-500 text-center p-4">No notifications</p>'; return; }
    list.innerHTML = notifications.slice(0, 10).map(n => `
        <div class="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
            <p class="text-slate-200">${n.text}</p>
            <p class="text-[10px] text-slate-500 mt-1">${n.time}</p>
        </div>
    `).join('');
    notifications.forEach(n => n.read = true);
    saveNotifications();
    updateNotifBadge();
}

function clearNotifications() {
    notifications = [];
    saveNotifications();
    renderNotifications();
}

// ==================== ADMIN PANEL ====================
function promptAdminPassword() {
    document.getElementById('adminPasswordModal').classList.remove('hidden');
    document.getElementById('adminPasswordInput').value = '';
    document.getElementById('adminPasswordError').classList.add('hidden');
}
function closeAdminPasswordModal() { document.getElementById('adminPasswordModal').classList.add('hidden'); }
function verifyAdminPassword() {
    if (document.getElementById('adminPasswordInput').value === ADMIN_PASSWORD) {
        closeAdminPasswordModal();
        openAdminPanel();
        playSound('success');
    } else {
        document.getElementById('adminPasswordError').classList.remove('hidden');
        document.getElementById('adminPasswordInput').value = '';
        playSound('error');
    }
}

async function openAdminPanel() {
    document.getElementById('adminPanel').classList.remove('hidden');
    await renderAdminPanel();
}
function closeAdminPanel() { document.getElementById('adminPanel').classList.add('hidden'); }

async function renderAdminPanel() {
    let allUsers = [];
    try {
        const snap = await FS.collection('users').get();
        snap.forEach(doc => allUsers.push({ id: doc.id, ...doc.data() }));
    } catch(e) { allUsers = usersDB; }
    
    const total = allUsers.length;
    const online = allUsers.filter(u => u.isOnline && u.status === 'active').length;
    const banned = allUsers.filter(u => u.status === 'banned').length;
    
    document.getElementById('adminPanelContent').innerHTML = `
        <div class="glass-card rounded-2xl p-6 border-2 border-pink-500/40 mb-6 bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-slate-900/60">
            <div class="flex items-center justify-between flex-wrap gap-4">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center shadow-lg admin-pulse"><i class="fa-solid fa-crown text-white text-2xl"></i></div>
                    <div><h2 class="font-heading font-extrabold text-2xl text-white">👑 Wifey Samia</h2><p class="text-xs text-pink-300">Admin Panel</p></div>
                </div>
                <button onclick="closeAdminPanel()" class="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold"><i class="fa-solid fa-xmark"></i> Close</button>
            </div>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="glass-card p-5 rounded-2xl border border-indigo-500/30"><i class="fa-solid fa-users text-indigo-400 text-2xl mb-2"></i><p class="text-3xl font-heading font-extrabold text-white">${total}</p><p class="text-xs text-slate-400">Total Users</p></div>
            <div class="glass-card p-5 rounded-2xl border border-emerald-500/30"><i class="fa-solid fa-circle text-emerald-400 text-2xl live-pulse mb-2"></i><p class="text-3xl font-heading font-extrabold text-white">${online}</p><p class="text-xs text-slate-400">Online</p></div>
            <div class="glass-card p-5 rounded-2xl border border-slate-500/30"><i class="fa-solid fa-circle text-slate-400 text-2xl mb-2"></i><p class="text-3xl font-heading font-extrabold text-white">${total-online}</p><p class="text-xs text-slate-400">Offline</p></div>
            <div class="glass-card p-5 rounded-2xl border border-amber-500/30"><i class="fa-solid fa-ban text-amber-400 text-2xl mb-2"></i><p class="text-3xl font-heading font-extrabold text-white">${banned}</p><p class="text-xs text-slate-400">Banned</p></div>
        </div>
        <div class="glass-card rounded-2xl border border-emerald-500/30 mb-6 overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-700/60 flex items-center gap-2 bg-emerald-950/20"><span class="w-2 h-2 rounded-full bg-emerald-400 live-pulse"></span><h3 class="font-heading font-bold text-lg text-white">🟢 Online Users</h3></div>
            <div class="p-4 space-y-2">${allUsers.filter(u => u.isOnline).map(u => `
                <div class="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-cyan-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden">${u.avatar ? `<img src="${u.avatar}" class="w-full h-full object-cover">` : (u.displayName||u.username).charAt(0).toUpperCase()}</div>
                        <div><p class="text-sm text-white font-medium">${u.displayName || u.username} ${u.isAdmin ? '👑' : ''}</p><p class="text-[10px] text-slate-400">@${u.username}</p></div>
                    </div>
                    <span class="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">🟢 ONLINE</span>
                </div>`).join('') || '<p class="text-xs text-slate-500 text-center py-3">কেউ online নেই</p>'}
            </div>
        </div>
        <div class="glass-card rounded-2xl border border-slate-700/60 overflow-hidden mb-6">
            <div class="px-6 py-4 border-b border-slate-700/60"><h3 class="font-heading font-bold text-lg text-white">User Management</h3></div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-slate-900/60"><tr class="text-left text-xs text-slate-400 uppercase"><th class="px-4 py-3">User</th><th class="px-4 py-3">Status</th><th class="px-4 py-3">Actions</th></tr></thead>
                    <tbody>${allUsers.map(u => `
                        <tr class="border-b border-slate-800">
                            <td class="px-4 py-3"><div class="flex items-center gap-2"><div class="w-8 h-8 rounded-lg ${u.isAdmin ? 'bg-gradient-to-tr from-pink-600 to-purple-600' : 'bg-slate-700'} flex items-center justify-center text-white text-xs font-bold overflow-hidden">${u.avatar ? `<img src="${u.avatar}" class="w-full h-full object-cover">` : (u.isAdmin ? '👑' : u.username.charAt(0).toUpperCase())}</div><div><p class="text-sm text-white">${u.displayName || u.username}</p><p class="text-[10px] text-slate-500">@${u.username}</p></div></div></td>
                            <td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-[10px] font-bold ${u.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}">${u.status === 'active' ? '● Active' : '● Banned'}</span></td>
                            <td class="px-4 py-3">${!u.isAdmin ? `<div class="flex gap-2"><button onclick="adminToggleBan('${u.id}')" class="px-3 py-1 rounded-lg ${u.status === 'active' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'} text-[10px] font-semibold">${u.status === 'active' ? 'Ban' : 'Unban'}</button><button onclick="adminDeleteUser('${u.id}')" class="px-3 py-1 rounded-lg bg-red-500/20 text-red-300 text-[10px]"><i class="fa-solid fa-trash"></i></button></div>` : '<span class="text-[10px] text-pink-300">👑 Admin</span>'}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        <div class="glass-card rounded-2xl border border-slate-700/60 p-6">
            <h3 class="font-bold text-lg text-white mb-4">Announcement</h3>
            <textarea id="announcementInput" rows="3" placeholder="Type announcement..." class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 resize-none mb-3">${siteSettings.announcement || ''}</textarea>
            <button onclick="postAnnouncement()" class="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"><i class="fa-solid fa-paper-plane mr-1"></i> Post</button>
        </div>
    `;
}

async function adminToggleBan(id) {
    try {
        const doc = await FS.collection('users').doc(id).get();
        if (!doc.exists) return;
        const u = doc.data();
        const newStatus = u.status === 'active' ? 'banned' : 'active';
        await FS.collection('users').doc(id).update({ status: newStatus, isOnline: false });
        showToast(`${u.username} ${newStatus}`, newStatus === 'banned' ? 'error' : 'success');
        renderAdminPanel();
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

async function adminDeleteUser(id) {
    if (!confirm('Delete this user permanently?')) return;
    try {
        await FS.collection('users').doc(id).delete();
        showToast('User deleted', 'success');
        renderAdminPanel();
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

function postAnnouncement() {
    const text = document.getElementById('announcementInput').value.trim();
    if (!text) return showToast('কিছু লিখুন', 'error');
    siteSettings.announcement = text;
    saveSettings();
    const ad = document.getElementById('announcementDisplay');
    if (ad) { ad.classList.remove('hidden'); document.getElementById('announcementText').textContent = text; }
    showToast('✅ Posted!', 'success');
}

// ==================== NOTES ====================
function renderNotesList() {
    const list = document.getElementById('notesList');
    if (!list) return;
    if (notes.length === 0) { list.innerHTML = '<p class="text-xs text-slate-500 text-center p-3">No notes yet</p>'; return; }
    list.innerHTML = notes.map(n => `<div onclick="loadNote('${n.id}')" class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-yellow-500/40 ${n.id === currentNoteId ? 'border-yellow-500/60 bg-yellow-500/10' : ''}"><p class="text-xs font-semibold text-white truncate">${n.title || 'Untitled'}</p><p class="text-[10px] text-slate-500 mt-1">${new Date(n.updated).toLocaleDateString()}</p></div>`).join('');
}
function newNote() {
    const note = { id: Date.now().toString(), title: '', content: '', updated: new Date().toISOString() };
    notes.unshift(note); saveNotes(); currentNoteId = note.id; renderNotesList();
    const t = document.getElementById('noteTitle'); const c = document.getElementById('noteContent');
    if (t) t.value = ''; if (c) c.value = '';
    if (t) t.focus();
}
function loadNote(id) {
    const note = notes.find(n => n.id === id); if (!note) return;
    currentNoteId = id;
    const t = document.getElementById('noteTitle'); const c = document.getElementById('noteContent');
    if (t) t.value = note.title; if (c) c.value = note.content;
    renderNotesList();
}
function autoSaveNote() {
    if (!currentNoteId) return;
    const note = notes.find(n => n.id === currentNoteId); if (!note) return;
    const t = document.getElementById('noteTitle'); const c = document.getElementById('noteContent');
    note.title = t ? t.value : ''; note.content = c ? c.value : '';
    note.updated = new Date().toISOString();
    saveNotes(); renderNotesList();
    const st = document.getElementById('noteSavedStatus'); if (st) st.textContent = '✅ Saved ' + new Date().toLocaleTimeString();
}
function deleteCurrentNote() {
    if (!currentNoteId || !confirm('Delete this note?')) return;
    notes = notes.filter(n => n.id !== currentNoteId); saveNotes(); currentNoteId = null;
    const t = document.getElementById('noteTitle'); const c = document.getElementById('noteContent');
    if (t) t.value = ''; if (c) c.value = '';
    renderNotesList();
}

// ==================== CLOCK & ALARM ====================
function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour12: false });
    const date = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const clockEl = document.getElementById('liveClock');
    if (clockEl) { clockEl.textContent = time; const dt = document.getElementById('liveDate'); if (dt) dt.textContent = date; }
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    alarms.forEach(alarm => {
        if (alarm.active && alarm.time === currentTime && !alarm.triggered) {
            alarm.triggered = true;
            triggerAlarm(alarm);
        }
    });
}
setInterval(updateClock, 1000);

function setAlarm() {
    const time = document.getElementById('alarmTime').value;
    const label = document.getElementById('alarmLabel').value || 'Alarm';
    if (!time) return showToast('সময় দিন', 'error');
    alarms.push({ id: Date.now().toString(), time, label, active: true, triggered: false });
    saveAlarms(); renderAlarms();
    document.getElementById('alarmTime').value = '';
    document.getElementById('alarmLabel').value = '';
    showToast('⏰ Alarm set for ' + time, 'success');
}
function renderAlarms() {
    const list = document.getElementById('alarmsList');
    if (!list) return;
    if (alarms.length === 0) { list.innerHTML = '<p class="text-[10px] text-slate-500 text-center">No alarms</p>'; return; }
    list.innerHTML = alarms.map(a => `<div class="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800"><div><p class="text-xs font-bold text-white">${a.time}</p><p class="text-[10px] text-slate-400">${a.label}</p></div><button onclick="deleteAlarm('${a.id}')" class="text-red-400 text-xs"><i class="fa-solid fa-trash"></i></button></div>`).join('');
}
function deleteAlarm(id) { alarms = alarms.filter(a => a.id !== id); saveAlarms(); renderAlarms(); }
function triggerAlarm(alarm) {
    playSound('alarm');
    setTimeout(() => playSound('alarm'), 300);
    setTimeout(() => playSound('alarm'), 600);
    showToast(`⏰ ${alarm.label} (${alarm.time})`, 'success');
    addNotification(`⏰ Alarm: ${alarm.label}`, 'clock');
    alert(`⏰ ALARM: ${alarm.label}\nTime: ${alarm.time}`);
}

// ==================== TIMER ====================
let timerSecondsLeft = 0, timerTotal = 0;
function startTimer() {
    const min = parseInt(document.getElementById('timerMinutes').value) || 0;
    const sec = parseInt(document.getElementById('timerSeconds').value) || 0;
    if (min === 0 && sec === 0) return showToast('সময় দিন', 'error');
    if (!timerInterval) { timerTotal = min * 60 + sec; timerSecondsLeft = timerTotal; }
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        timerSecondsLeft--;
        updateTimerDisplay();
        if (timerSecondsLeft <= 0) {
            clearInterval(timerInterval); timerInterval = null;
            playSound('alarm'); setTimeout(() => playSound('alarm'), 300);
            showToast('⏰ Timer done!', 'success');
            alert('⏰ Timer Complete!');
        }
    }, 1000);
}
function pauseTimer() { clearInterval(timerInterval); timerInterval = null; }
function resetTimer() {
    clearInterval(timerInterval); timerInterval = null;
    timerSecondsLeft = 0; timerTotal = 0;
    updateTimerDisplay();
    const m = document.getElementById('timerMinutes'); if(m) m.value = '';
    const s = document.getElementById('timerSeconds'); if(s) s.value = '';
}
function updateTimerDisplay() {
    const m = Math.floor(timerSecondsLeft / 60).toString().padStart(2, '0');
    const s = (timerSecondsLeft % 60).toString().padStart(2, '0');
    const el = document.getElementById('timerDisplay');
    if (el) el.textContent = `${m}:${s}`;
    const circle = document.getElementById('timerCircle');
    if (circle && timerTotal > 0) circle.style.strokeDashoffset = 283 * (1 - timerSecondsLeft / timerTotal);
}

// ==================== STOPWATCH ====================
function startStopwatch() {
    if (stopwatchInterval) return;
    stopwatchInterval = setInterval(() => {
        stopwatchTime += 10;
        const ms = Math.floor((stopwatchTime % 1000) / 10);
        const s = Math.floor(stopwatchTime / 1000) % 60;
        const m = Math.floor(stopwatchTime / 60000);
        const el = document.getElementById('stopwatchDisplay');
        if (el) el.textContent = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}:${ms.toString().padStart(2,'0')}`;
    }, 10);
}
function lapStopwatch() {
    if (stopwatchTime === 0) return;
    const ms = Math.floor((stopwatchTime % 1000) / 10);
    const s = Math.floor(stopwatchTime / 1000) % 60;
    const m = Math.floor(stopwatchTime / 60000);
    const lap = document.createElement('div');
    lap.className = 'p-2 rounded bg-slate-900/60 text-xs flex justify-between';
    const lapsList = document.getElementById('lapsList');
    if (!lapsList) return;
    lap.innerHTML = `<span class="text-slate-400">Lap ${lapsList.children.length + 1}</span><span class="text-cyan-300 font-mono">${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}:${ms.toString().padStart(2,'0')}</span>`;
    lapsList.prepend(lap);
}
function resetStopwatch() {
    clearInterval(stopwatchInterval); stopwatchInterval = null;
    stopwatchTime = 0;
    const el = document.getElementById('stopwatchDisplay'); if(el) el.textContent = '00:00:00';
    const l = document.getElementById('lapsList'); if(l) l.innerHTML = '';
}

console.log('%c📦 PART 2 Loaded', 'color:#ec4899;font-size:14px;font-weight:bold');
console.log('%c🔥 Firebase Connected', 'color:#f59e0b;font-size:14px');
    
