// ==================== PART 2: CORE JAVASCRIPT ====================
// Config, Auth, Messages, Admin, Notes, Alarm, Timer

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
let messagesDB = JSON.parse(localStorage.getItem('ultra_messages')) || {};
let usersDB = JSON.parse(localStorage.getItem('ultra_users')) || [];
let activityLogs = JSON.parse(localStorage.getItem('ultra_logs')) || [];
let siteSettings = JSON.parse(localStorage.getItem('ultra_site_settings')) || { siteName:'Ultra Suite', announcement:'' };
let mediaRecorder = null, audioChunks = [], recordingStartTime = 0, recordingTimer = null;

// ==================== ADMIN USER ====================
if (!usersDB.find(u => u.username === 'wifey_samia')) {
    usersDB.push({
        id: 'admin_1', username: 'wifey_samia', displayName: 'Wifey Samia',
        password: 'wifeysamia', status: 'active', joined: new Date().toISOString().split('T')[0],
        lastLogin: null, isOnline: false, visits: 0, isAdmin: true, email: '', avatar: null, bio: 'Admin of Ultra Suite 👑'
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
function saveMessages() { localStorage.setItem('ultra_messages', JSON.stringify(messagesDB)); }

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

function handleAuth() {
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
        const user = usersDB.find(u => u.username.toLowerCase() === username);
        if (!user) { errorText.textContent = 'এই ইউজারনেমে অ্যাকাউন্ট নেই। Sign Up করুন।'; errorEl.classList.remove('hidden'); playSound('error'); return; }
        if (user.password !== password) { errorText.textContent = 'ভুল পাসওয়ার্ড!'; errorEl.classList.remove('hidden'); playSound('error'); return; }
        if (user.status === 'banned') { errorText.textContent = 'আপনার অ্যাকাউন্ট ব্যান করা হয়েছে'; errorEl.classList.remove('hidden'); playSound('error'); return; }
        
        currentUser = user;
        user.lastLogin = new Date().toISOString();
        user.isOnline = true;
        user.visits = (user.visits || 0) + 1;
        saveUsers();
        localStorage.setItem('ultra_current_user', user.id);
        addLog(`${user.username} logged in`, 'login');
        playSound('success');
        loginSuccess();
    } else {
        if (usersDB.find(u => u.username.toLowerCase() === username)) {
            errorText.textContent = 'এই ইউজারনেম আগেই নেওয়া হয়েছে'; errorEl.classList.remove('hidden'); playSound('error'); return;
        }
        if (password.length < 4) { errorText.textContent = 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষর'; errorEl.classList.remove('hidden'); return; }
        
        window._pendingUser = {
            id: Date.now().toString(), username, displayName: username, password,
            status: 'active', joined: new Date().toISOString().split('T')[0],
            lastLogin: new Date().toISOString(), isOnline: true, visits: 1,
            isAdmin: false, email: '', avatar: null, bio: ''
        };
        playSound('success');
        openProfileSetup();
    }
}

function openProfileSetup() {
    if (!window._pendingUser) return;
    document.getElementById('setupAvatarLetter').textContent = window._pendingUser.username.charAt(0).toUpperCase();
    document.getElementById('setupDisplayName').value = window._pendingUser.username;
    document.getElementById('setupUsernameDisplay').textContent = window._pendingUser.username;
    document.getElementById('setupAvatarDisplay').style.backgroundImage = '';
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
            const sx = (img.width - size) / 2, sy = (img.height - size) / 2;
            ctx.drawImage(img, sx, sy, size, size, 0, 0, 256, 256);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            window._setupAvatar = dataUrl;
            document.getElementById('setupAvatarDisplay').style.backgroundImage = `url(${dataUrl})`;
            document.getElementById('setupAvatarDisplay').style.backgroundSize = 'cover';
            document.getElementById('setupAvatarLetter').style.display = 'none';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function completeSignup() {
    if (!window._pendingUser) return;
    const displayName = document.getElementById('setupDisplayName').value.trim() || window._pendingUser.username;
    const bio = document.getElementById('setupBio').value.trim() || '';
    const newUser = { ...window._pendingUser, displayName, avatar: window._setupAvatar || null, bio };
    usersDB.push(newUser);
    saveUsers();
    currentUser = newUser;
    localStorage.setItem('ultra_current_user', newUser.id);
    addLog(`New account created: ${newUser.username}`, 'user-plus');
    addNotification(`🎉 Welcome ${displayName}!`, 'user-plus');
    playSound('success');
    document.getElementById('profileSetupModal').classList.add('hidden');
    setTimeout(() => { document.getElementById('loginScreen').style.display = 'flex'; loginSuccess(); }, 300);
    window._pendingUser = null;
    window._setupAvatar = null;
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
            document.getElementById('announcementDisplay').classList.remove('hidden');
            document.getElementById('announcementText').textContent = siteSettings.announcement;
        }
    }, 500);
}

function updateUserUI() {
    if (!currentUser) return;
    const name = currentUser.displayName || currentUser.username;
    document.getElementById('currentUserHeader').textContent = name;
    document.getElementById('userAvatar').textContent = name.charAt(0).toUpperCase();
    document.getElementById('sidebarUserInfo').innerHTML = `<i class="fa-solid fa-user text-emerald-400 mr-1"></i>${currentUser.username}`;
    if (currentUser.avatar) {
        document.getElementById('userAvatar').style.backgroundImage = `url(${currentUser.avatar})`;
        document.getElementById('userAvatar').style.backgroundSize = 'cover';
        document.getElementById('userAvatar').textContent = '';
    }
}

function handleLogout() {
    if (!confirm('Are you sure you want to logout?')) return;
    if (currentUser) {
        const user = usersDB.find(u => u.id === currentUser.id);
        if (user) { user.isOnline = false; user.lastActive = Date.now(); saveUsers(); }
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
(function autoLogin() {
    const savedUserId = localStorage.getItem('ultra_current_user');
    if (!savedUserId) return;
    const user = usersDB.find(u => u.id === savedUserId);
    if (!user || user.status === 'banned') { localStorage.removeItem('ultra_current_user'); return; }
    currentUser = user;
    user.isOnline = true;
    user.lastLogin = new Date().toISOString();
    saveUsers();
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').classList.remove('hidden');
    setTimeout(() => { updateUserUI(); buildSidebar(); buildViews(); }, 100);
})();

// ==================== SIDEBAR MENU ====================
const MENU = [
    { id:'dashboard', icon:'fa-house-laptop', color:'text-indigo-400', name:'Dashboard' },
    { id:'messages', icon:'fa-comments', color:'text-pink-400', name:'Messages', badge:true },
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
            ${m.badgeId ? `<span id="${m.badgeId}" class="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-400 font-mono">${(typeof customApps !== 'undefined' ? customApps.length : 0)}</span>` : ''}
            ${m.badge ? `<span id="messagesBadge" class="hidden px-2 py-0.5 text-[10px] font-bold rounded-md bg-red-500 text-white">0</span>` : ''}
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
    if (id === 'messages') { renderUsers(); if (selectedChatUser) openChat(selectedChatUser); }
    if (id === 'calendar' && typeof renderCalendar === 'function') renderCalendar();
    if (id === 'habits' && typeof renderHabits === 'function') renderHabits();
    if (id === 'notepad') renderNotesList();
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
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            document.getElementById('profileAvatarDisplay').style.backgroundImage = `url(${dataUrl})`;
            document.getElementById('profileAvatarDisplay').style.backgroundSize = 'cover';
            document.getElementById('profileAvatarLetter').style.display = 'none';
            currentUser._tempAvatar = dataUrl;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function saveProfile() {
    if (!currentUser) return;
    const user = usersDB.find(u => u.id === currentUser.id);
    user.displayName = document.getElementById('profileDisplayName').value.trim() || user.username;
    user.bio = document.getElementById('profileBio').value.trim();
    const newPass = document.getElementById('profileNewPassword').value;
    if (newPass) {
        if (newPass.length < 4) return showToast('পাসওয়ার্ড কমপক্ষে ৪ অক্ষর', 'error');
        user.password = newPass;
    }
    if (currentUser._tempAvatar) {
        user.avatar = currentUser._tempAvatar;
        currentUser.avatar = currentUser._tempAvatar;
        delete currentUser._tempAvatar;
    }
    saveUsers();
    updateUserUI();
    closeProfileModal();
    showToast('✅ Profile updated!', 'success');
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

// ==================== MESSAGES ====================
function getChatKey(id1, id2) { return [id1, id2].sort().join('_'); }

function getUnreadCount(otherId) {
    if (!currentUser) return 0;
    const key = getChatKey(currentUser.id, otherId);
    const msgs = messagesDB[key] || [];
    return msgs.filter(m => m.to === currentUser.id && !m.read).length;
}

function renderUsers() {
    const list = document.getElementById('usersList');
    if (!list || !currentUser) return;
    const others = usersDB.filter(u => u.id !== currentUser.id);
    if (others.length === 0) {
        list.innerHTML = `<div class="text-center py-12"><i class="fa-solid fa-user-group text-5xl text-slate-700 mb-4"></i><p class="text-sm text-slate-500">No other users yet</p></div>`;
        return;
    }
    list.innerHTML = others.map(u => {
        const unread = getUnreadCount(u.id);
        const key = getChatKey(currentUser.id, u.id);
        const msgs = messagesDB[key] || [];
        const lastMsg = msgs[msgs.length - 1];
        let lastText = 'No messages yet';
        if (lastMsg) {
            if (lastMsg.type === 'voice') lastText = '🎤 Voice message';
            else if (lastMsg.type === 'image') lastText = '📷 Photo';
            else lastText = (lastMsg.from === currentUser.id ? 'You: ' : '') + (lastMsg.text || '');
        }
        const lastTime = lastMsg ? new Date(lastMsg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        return `
            <div onclick="openChat('${u.id}')" class="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-pink-500/40 hover:bg-slate-900/80 transition ${selectedChatUser === u.id ? 'border-pink-500/60 bg-pink-500/10' : ''}">
                <div class="relative w-12 h-12 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                    ${u.avatar ? `<img src="${u.avatar}" class="w-full h-full object-cover">` : (u.displayName || u.username).charAt(0).toUpperCase()}
                    ${u.isOnline ? '<span class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900"></span>' : ''}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                        <p class="text-sm font-semibold text-white truncate">${u.displayName || u.username} ${u.isAdmin ? '👑' : ''}</p>
                        ${lastTime ? `<span class="text-[10px] text-slate-500 flex-shrink-0">${lastTime}</span>` : ''}
                    </div>
                    <div class="flex items-center justify-between gap-2 mt-0.5">
                        <p class="text-xs text-slate-400 truncate">${lastText}</p>
                        ${unread > 0 ? `<span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white flex-shrink-0">${unread}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterUsers() {
    const q = document.getElementById('searchUsers').value.toLowerCase().trim();
    const list = document.getElementById('usersList');
    const others = usersDB.filter(u => u.id !== currentUser.id && 
        ((u.displayName || u.username).toLowerCase().includes(q) || u.username.toLowerCase().includes(q)));
    if (others.length === 0) {
        list.innerHTML = `<div class="text-center py-12"><i class="fa-solid fa-search text-5xl text-slate-700 mb-4"></i><p class="text-sm text-slate-500">No users found</p></div>`;
        return;
    }
    list.innerHTML = others.map(u => {
        const unread = getUnreadCount(u.id);
        return `
            <div onclick="openChat('${u.id}')" class="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-pink-500/40 transition">
                <div class="relative w-12 h-12 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                    ${u.avatar ? `<img src="${u.avatar}" class="w-full h-full object-cover">` : (u.displayName || u.username).charAt(0).toUpperCase()}
                    ${u.isOnline ? '<span class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900"></span>' : ''}
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-white truncate">${u.displayName || u.username}</p>
                    <p class="text-xs text-slate-400 truncate">@${u.username}</p>
                </div>
                ${unread > 0 ? `<span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white">${unread}</span>` : ''}
            </div>
        `;
    }).join('');
}

function openChat(userId) {
    selectedChatUser = userId;
    const user = usersDB.find(u => u.id === userId);
    if (!user) return;
    document.getElementById('chatAvatar').textContent = (user.displayName || user.username).charAt(0).toUpperCase();
    if (user.avatar) {
        document.getElementById('chatAvatar').style.backgroundImage = `url(${user.avatar})`;
        document.getElementById('chatAvatar').style.backgroundSize = 'cover';
        document.getElementById('chatAvatar').textContent = '';
    } else {
        document.getElementById('chatAvatar').style.backgroundImage = '';
    }
    document.getElementById('chatName').textContent = (user.displayName || user.username) + (user.isAdmin ? ' 👑' : '');
    document.getElementById('chatStatus').innerHTML = user.isOnline 
        ? '<span class="text-emerald-400">🟢 Online</span>' 
        : `<span class="text-slate-500">Last seen: ${user.lastActive ? new Date(user.lastActive).toLocaleString() : 'unknown'}</span>`;
    
    const lv = document.getElementById('messagesListView');
    const cv = document.getElementById('chatView');
    if (window.innerWidth < 768) {
        lv.classList.add('hidden-mobile');
        cv.classList.remove('hidden');
    } else {
        cv.classList.remove('hidden');
    }
    renderChatMessages();
    
    const key = getChatKey(currentUser.id, userId);
    const msgs = messagesDB[key] || [];
    let changed = false;
    msgs.forEach(m => { if (m.to === currentUser.id && !m.read) { m.read = true; changed = true; } });
    if (changed) { saveMessages(); updateMessagesBadge(); }
    
    setTimeout(() => document.getElementById('messageInput').focus(), 100);
}

function closeChat() {
    selectedChatUser = null;
    document.getElementById('messagesListView').classList.remove('hidden-mobile');
    document.getElementById('chatView').classList.add('hidden');
    renderUsers();
}

function renderChatMessages() {
    const box = document.getElementById('chatMessages');
    if (!box || !selectedChatUser || !currentUser) return;
    const key = getChatKey(currentUser.id, selectedChatUser);
    const msgs = messagesDB[key] || [];
    if (msgs.length === 0) {
        box.innerHTML = `<div class="flex items-center justify-center h-full"><div class="text-center"><i class="fa-solid fa-comments text-5xl text-slate-700 mb-4"></i><p class="text-sm text-slate-500">No messages yet</p><p class="text-xs text-slate-600 mt-1">Say hi! 👋</p></div></div>`;
        return;
    }
    let lastDate = '';
    box.innerHTML = msgs.map((m, idx) => {
        const isMe = m.from === currentUser.id;
        const time = new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const date = new Date(m.ts).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        let dateDivider = '';
        if (date !== lastDate) {
            dateDivider = `<div class="flex justify-center my-3"><span class="px-3 py-1 rounded-full bg-slate-800/80 text-[10px] text-slate-400 font-medium">${date}</span></div>`;
            lastDate = date;
        }
        const showAvatar = !isMe && (idx === msgs.length - 1 || msgs[idx + 1]?.from !== m.from);
        const user = usersDB.find(u => u.id === m.from);
        let content = '';
        if (m.type === 'voice' && m.audio) {
            content = `<audio controls src="${m.audio}" class="max-w-full h-10"></audio>`;
        } else if (m.type === 'image' && m.image) {
            content = `<img src="${m.image}" class="max-w-full rounded-lg cursor-pointer" onclick="window.open('${m.image}')" style="max-height:250px">`;
        } else {
            content = escapeHtml(m.text || '');
        }
        return `${dateDivider}
            <div class="flex ${isMe ? 'justify-end' : 'justify-start'} gap-2 items-end">
                ${!isMe && showAvatar ? `<div class="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 overflow-hidden">${user?.avatar ? `<img src="${user.avatar}" class="w-full h-full object-cover">` : (user?.displayName || user?.username || '?').charAt(0).toUpperCase()}</div>` : (!isMe ? '<div class="w-7 flex-shrink-0"></div>' : '')}
                <div class="msg-bubble ${isMe ? 'me' : 'other'}">${content}<div class="msg-time">${time} ${isMe ? (m.read ? '✓✓' : '✓') : ''}</div></div>
            </div>`;
    }).join('');
    setTimeout(() => box.scrollTop = box.scrollHeight, 50);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text || !selectedChatUser || !currentUser) return;
    const key = getChatKey(currentUser.id, selectedChatUser);
    if (!messagesDB[key]) messagesDB[key] = [];
    messagesDB[key].push({
        id: Date.now().toString(), from: currentUser.id, to: selectedChatUser,
        text, ts: Date.now(), read: false, type: 'text'
    });
    saveMessages();
    input.value = '';
    input.style.height = 'auto';
    renderChatMessages();
    playSound('click');
}

function clearChatWithUser() {
    if (!selectedChatUser || !currentUser) return;
    if (!confirm('Delete all messages with this user?')) return;
    const key = getChatKey(currentUser.id, selectedChatUser);
    delete messagesDB[key];
    saveMessages();
    renderChatMessages();
    updateMessagesBadge();
    showToast('Chat cleared', 'info');
}

function updateMessagesBadge() {
    if (!currentUser) return;
    let total = 0;
    usersDB.forEach(u => { if (u.id !== currentUser.id) total += getUnreadCount(u.id); });
    const badge = document.getElementById('messagesBadge');
    if (!badge) return;
    if (total > 0) { badge.textContent = total; badge.classList.remove('hidden'); }
    else badge.classList.add('hidden');
}

// ==================== VOICE RECORDING ====================
function startRecording() {
    if (!navigator.mediaDevices) { showToast('Recording not supported', 'error'); return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        audioChunks = [];
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };
        mediaRecorder.onstop = () => {
            stream.getTracks().forEach(t => t.stop());
            if (recordingCancelled) { recordingCancelled = false; return; }
            const blob = new Blob(audioChunks, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.onload = () => {
                const key = getChatKey(currentUser.id, selectedChatUser);
                if (!messagesDB[key]) messagesDB[key] = [];
                messagesDB[key].push({
                    id: Date.now().toString(), from: currentUser.id, to: selectedChatUser,
                    ts: Date.now(), read: false, type: 'voice', audio: reader.result
                });
                saveMessages();
                renderChatMessages();
                showToast('🎤 Voice message sent', 'success');
            };
            reader.readAsDataURL(blob);
        };
        recordingCancelled = false;
        mediaRecorder.start();
        recordingStartTime = Date.now();
        document.getElementById('recordingBar').classList.remove('hidden');
        document.getElementById('recordingTime').textContent = '0:00';
        recordingTimer = setInterval(() => {
            const s = Math.floor((Date.now() - recordingStartTime) / 1000);
            document.getElementById('recordingTime').textContent = Math.floor(s/60) + ':' + String(s%60).padStart(2,'0');
        }, 500);
    }).catch(() => showToast('Microphone access denied', 'error'));
}
let recordingCancelled = false;
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    clearInterval(recordingTimer);
    document.getElementById('recordingBar').classList.add('hidden');
}
function cancelRecording() {
    recordingCancelled = true;
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    clearInterval(recordingTimer);
    document.getElementById('recordingBar').classList.add('hidden');
}

// ==================== FILE UPLOAD ====================
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file || !selectedChatUser || !currentUser) return;
    if (file.size > 2 * 1024 * 1024) { showToast('File must be under 2MB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => {
        const key = getChatKey(currentUser.id, selectedChatUser);
        if (!messagesDB[key]) messagesDB[key] = [];
        messagesDB[key].push({
            id: Date.now().toString(), from: currentUser.id, to: selectedChatUser,
            ts: Date.now(), read: false, type: 'image', image: reader.result
        });
        saveMessages();
        renderChatMessages();
        showToast('📷 Photo sent', 'success');
    };
    reader.readAsDataURL(file);
    event.target.value = '';
}

// ==================== EMOJI PICKER ====================
const EMOJIS = ['😀','😁','😂','🤣','😊','😍','🥰','😘','😎','🤩','🥳','😏','😢','😭','😡','🤯','😱','🤔','🙄','😴','🤝','🙏','👏','💪','👍','👎','✌️','❤️','💔','💯','🔥','✨','🎉','🎁','🌹','🍕','⚽','🎵','⭐','🌈'];
function toggleEmojiPicker() {
    const p = document.getElementById('emojiPicker');
    if (!p) return;
    p.classList.toggle('hidden');
    if (!p.classList.contains('hidden') && !p.dataset.init) {
        document.getElementById('emojiGrid').innerHTML = EMOJIS.map(e => `<button onclick="addEmoji('${e}')" class="text-2xl hover:scale-125 transition">${e}</button>`).join('');
        p.dataset.init = '1';
    }
}
function addEmoji(e) {
    const input = document.getElementById('messageInput');
    input.value += e;
    input.focus();
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
document.addEventListener('keypress', e => {
    if (e.key === 'Enter' && e.target.id === 'adminPasswordInput') verifyAdminPassword();
    if (e.key === 'Enter' && e.target.id === 'loginPassword') handleAuth();
});

function openAdminPanel() {
    document.getElementById('adminPanel').classList.remove('hidden');
    renderAdminPanel();
}
function closeAdminPanel() { document.getElementById('adminPanel').classList.add('hidden'); }

function renderAdminPanel() {
    const total = usersDB.length;
    const online = usersDB.filter(u => u.isOnline && u.status === 'active').length;
    const banned = usersDB.filter(u => u.status === 'banned').length;
    const totalMsgs = Object.values(messagesDB).reduce((s, arr) => s + arr.length, 0);
    
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
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div class="glass-card p-5 rounded-2xl border border-indigo-500/30"><i class="fa-solid fa-users text-indigo-400 text-2xl mb-2"></i><p class="text-3xl font-heading font-extrabold text-white">${total}</p><p class="text-xs text-slate-400">Total Users</p></div>
            <div class="glass-card p-5 rounded-2xl border border-emerald-500/30"><i class="fa-solid fa-circle text-emerald-400 text-2xl live-pulse mb-2"></i><p class="text-3xl font-heading font-extrabold text-white">${online}</p><p class="text-xs text-slate-400">Online</p></div>
            <div class="glass-card p-5 rounded-2xl border border-slate-500/30"><i class="fa-solid fa-circle text-slate-400 text-2xl mb-2"></i><p class="text-3xl font-heading font-extrabold text-white">${total - online}</p><p class="text-xs text-slate-400">Offline</p></div>
            <div class="glass-card p-5 rounded-2xl border border-amber-500/30"><i class="fa-solid fa-ban text-amber-400 text-2xl mb-2"></i><p class="text-3xl font-heading font-extrabold text-white">${banned}</p><p class="text-xs text-slate-400">Banned</p></div>
            <div class="glass-card p-5 rounded-2xl border border-pink-500/30"><i class="fa-solid fa-comments text-pink-400 text-2xl mb-2"></i><p class="text-3xl font-heading font-extrabold text-white">${totalMsgs}</p><p class="text-xs text-slate-400">Messages</p></div>
        </div>
        <div class="glass-card rounded-2xl border border-emerald-500/30 mb-6 overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-700/60 flex items-center gap-2 bg-emerald-950/20"><span class="w-2 h-2 rounded-full bg-emerald-400 live-pulse"></span><h3 class="font-heading font-bold text-lg text-white">🟢 Online Users</h3></div>
            <div class="p-4 space-y-2">${usersDB.filter(u => u.isOnline).map(u => `
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
            <div class="px-6 py-4 border-b border-slate-700/60 flex items-center justify-between flex-wrap gap-3">
                <h3 class="font-heading font-bold text-lg text-white">User Management</h3>
                <input type="text" id="searchUser" oninput="renderAdminPanel()" placeholder="Search..." class="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 w-48">
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-slate-900/60"><tr class="text-left text-xs text-slate-400 uppercase"><th class="px-6 py-3">User</th><th class="px-6 py-3">Status</th><th class="px-6 py-3">Joined</th><th class="px-6 py-3">Actions</th></tr></thead>
                    <tbody>${usersDB.filter(u => { const q = document.getElementById('searchUser')?.value.toLowerCase() || ''; return !q || u.username.toLowerCase().includes(q) || (u.displayName||'').toLowerCase().includes(q); }).map(u => `
                        <tr class="border-b border-slate-800">
                            <td class="px-6 py-3"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-lg ${u.isAdmin ? 'bg-gradient-to-tr from-pink-600 to-purple-600' : 'bg-slate-700'} flex items-center justify-center text-white text-xs font-bold overflow-hidden">${u.avatar ? `<img src="${u.avatar}" class="w-full h-full object-cover">` : (u.isAdmin ? '👑' : u.username.charAt(0).toUpperCase())}</div><div><p class="text-sm text-white">${u.displayName || u.username}</p><p class="text-[10px] text-slate-500">@${u.username}</p></div></div></td>
                            <td class="px-6 py-3"><span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${u.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}">${u.status === 'active' ? '● Active' : '● Banned'}</span></td>
                            <td class="px-6 py-3 text-xs text-slate-400">${u.joined}</td>
                            <td class="px-6 py-3">${!u.isAdmin ? `<div class="flex gap-2"><button onclick="toggleBan('${u.id}')" class="px-3 py-1 rounded-lg ${u.status === 'active' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'} text-[10px] font-semibold">${u.status === 'active' ? 'Ban' : 'Unban'}</button><button onclick="deleteUser('${u.id}')" class="px-3 py-1 rounded-lg bg-red-500/20 text-red-300 text-[10px]"><i class="fa-solid fa-trash"></i></button></div>` : '<span class="text-[10px] text-pink-300">👑 Admin</span>'}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div class="glass-card rounded-2xl border border-slate-700/60 p-6">
                <h3 class="font-bold text-lg text-white mb-4">Site Settings</h3>
                <input type="text" id="siteNameInput" value="${siteSettings.siteName}" placeholder="Site Name" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 mb-3">
                <button onclick="saveSiteSettings()" class="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"><i class="fa-solid fa-save mr-1"></i> Save</button>
            </div>
            <div class="glass-card rounded-2xl border border-slate-700/60 p-6">
                <h3 class="font-bold text-lg text-white mb-4">Announcement</h3>
                <textarea id="announcementInput" rows="3" placeholder="Type announcement..." class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 resize-none mb-3">${siteSettings.announcement || ''}</textarea>
                <button onclick="postAnnouncement()" class="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"><i class="fa-solid fa-paper-plane mr-1"></i> Post</button>
            </div>
        </div>
        <div class="glass-card rounded-2xl border border-slate-700/60 p-6">
            <div class="flex items-center justify-between mb-4"><h3 class="font-bold text-lg text-white">Activity Log</h3><button onclick="clearLogs()" class="text-xs text-red-400 px-3 py-1 rounded-lg bg-red-500/10">Clear</button></div>
            <div class="space-y-2 max-h-80 overflow-y-auto">${activityLogs.slice(0, 20).map(l => `<div class="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/40 border border-slate-800"><i class="fa-solid fa-info-circle text-indigo-400 text-xs mt-0.5"></i><div class="flex-1"><p class="text-xs text-slate-200">${l.action}</p><p class="text-[10px] text-slate-500 mt-0.5">${l.time} · @${l.user || 'guest'}</p></div></div>`).join('') || '<p class="text-xs text-slate-500 text-center py-3">No activity</p>'}
            </div>
        </div>
    `;
}

function toggleBan(id) {
    const u = usersDB.find(x => x.id === id);
    if (!u) return;
    u.status = u.status === 'active' ? 'banned' : 'active';
    if (u.status === 'banned') u.isOnline = false;
    saveUsers();
    renderAdminPanel();
    addLog(`User ${u.username} ${u.status}`, 'ban');
    showToast(`${u.username} ${u.status}`, u.status === 'banned' ? 'error' : 'success');
}

function deleteUser(id) {
    const u = usersDB.find(x => x.id === id);
    if (!u || !confirm(`Delete "${u.username}"?`)) return;
    usersDB = usersDB.filter(x => x.id !== id);
    saveUsers();
    renderAdminPanel();
}

function saveSiteSettings() {
    siteSettings.siteName = document.getElementById('siteNameInput').value;
    saveSettings();
    showToast('✅ Settings saved!', 'success');
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

function clearLogs() {
    if (!confirm('Clear logs?')) return;
    activityLogs = [];
    saveLogs();
    renderAdminPanel();
}

// ==================== NOTES ====================
function renderNotesList() {
    const list = document.getElementById('notesList');
    if (!list) return;
    if (notes.length === 0) { list.innerHTML = '<p class="text-xs text-slate-500 text-center p-3">No notes yet</p>'; return; }
    list.innerHTML = notes.map(n => `
        <div onclick="loadNote('${n.id}')" class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-yellow-500/40 transition ${n.id === currentNoteId ? 'border-yellow-500/60 bg-yellow-500/10' : ''}">
            <p class="text-xs font-semibold text-white truncate">${n.title || 'Untitled'}</p>
            <p class="text-[10px] text-slate-500 mt-1">${new Date(n.updated).toLocaleDateString()}</p>
        </div>
    `).join('');
}

function newNote() {
    const note = { id: Date.now().toString(), title: '', content: '', updated: new Date().toISOString() };
    notes.unshift(note);
    saveNotes();
    currentNoteId = note.id;
    renderNotesList();
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
    document.getElementById('noteTitle').focus();
}

function loadNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    currentNoteId = id;
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteContent').value = note.content;
    renderNotesList();
}

function autoSaveNote() {
    if (!currentNoteId) return;
    const note = notes.find(n => n.id === currentNoteId);
    if (note) {
        note.title = document.getElementById('noteTitle')?.value || '';
        note.content = document.getElementById('noteContent')?.value || '';
        note.updated = new Date().toISOString();
        saveNotes();
        renderNotesList();
        const st = document.getElementById('noteSavedStatus');
        if (st) st.textContent = '✅ Saved ' + new Date().toLocaleTimeString();
    }
}

function deleteCurrentNote() {
    if (!currentNoteId || !confirm('Delete this note?')) return;
    notes = notes.filter(n => n.id !== currentNoteId);
    saveNotes();
    currentNoteId = null;
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
    renderNotesList();
}

// ==================== CLOCK & ALARM ====================
function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour12: false });
    const date = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const clockEl = document.getElementById('liveClock');
    if (clockEl) { clockEl.textContent = time; document.getElementById('liveDate').textContent = date; }
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
    saveAlarms();
    renderAlarms();
    document.getElementById('alarmTime').value = '';
    document.getElementById('alarmLabel').value = '';
    showToast('⏰ Alarm set for ' + time, 'success');
}

function renderAlarms() {
    const list = document.getElementById('alarmsList');
    if (!list) return;
    if (alarms.length === 0) { list.innerHTML = '<p class="text-[10px] text-slate-500 text-center">No alarms</p>'; return; }
    list.innerHTML = alarms.map(a => `
        <div class="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <div><p class="text-xs font-bold text-white">${a.time}</p><p class="text-[10px] text-slate-400">${a.label}</p></div>
            <button onclick="deleteAlarm('${a.id}')" class="text-red-400 text-xs"><i class="fa-solid fa-trash"></i></button>
        </div>
    `).join('');
}

function deleteAlarm(id) {
    alarms = alarms.filter(a => a.id !== id);
    saveAlarms();
    renderAlarms();
}

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
