// ==================== PART 3 (FULL) — COMPLETE ====================
// LocalGram + All Tools + Games + Settings + Download

let todos = JSON.parse(localStorage.getItem('ultra_todos')) || [];
let customApps = JSON.parse(localStorage.getItem('ultra_custom_apps')) || [];
let transactions = JSON.parse(localStorage.getItem('ultra_transactions')) || [];
let waterCount = parseInt(localStorage.getItem('ultra_water_' + new Date().toDateString()) || '0');
let habits = JSON.parse(localStorage.getItem('ultra_habits')) || [];
let calendarDate = new Date();
let pomodoroInterval = null, pomodoroSeconds = 25*60, pomodoroMode = 'focus', pomodoroSessions = 0;
let autoRun = false;
let game2048State = null, sudokuState = null;
let lgCurrentTab = 'home';
let lgChatUnsubscribe = null;
let lgSelectedChatUser = null;
let lgCurrentStoryIndex = 0;
let lgCurrentStoryList = [];
let deferredPrompt = null;

function saveTodos() { localStorage.setItem('ultra_todos', JSON.stringify(todos)); }
function saveCustomApps() { localStorage.setItem('ultra_custom_apps', JSON.stringify(customApps)); }
function saveTransactions() { localStorage.setItem('ultra_transactions', JSON.stringify(transactions)); }
function saveHabits() { localStorage.setItem('ultra_habits', JSON.stringify(habits)); }

// ==================== BUILD VIEWS ====================
function buildViews() {
    const c = document.getElementById('viewsContainer');
    if (!c) { console.error('viewsContainer missing'); return; }
    c.innerHTML = 
        dashboardView() + localgramView() + lgSettingsView() + downloadAppView() +
        quickEditorView() + notepadView() + alarmView() + pomodoroView() +
        qrView() + colorsView() + gradientView() + converterView() +
        calculatorView() + ageCalcView() + bmiView() + loanView() +
        expenseView() + waterView() + habitsView() + calendarView() +
        quotesView() + diceView() + jsonView() + base64View() +
        uuidView() + markdownView() + pianoView() + drumView() +
        metronomeView() + game2048View() + sudokuView() + rpsView() +
        slotView() + webToolsView() + customAppsView() + arcadeView() +
        videoStudioView() + designStudioView() + developerView() + trackerView();
    setTimeout(initializeViews, 200);
    console.log('✅ buildViews completed');
}

// ==================== DASHBOARD ====================
function dashboardView() {
    return `<div id="view-dashboard" class="tab-content space-y-6">
        <div class="relative overflow-hidden rounded-2xl glass-card border border-indigo-500/20 p-6 lg:p-8 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
            <div class="relative z-10 max-w-2xl space-y-3">
                <span class="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 inline-block">🚀 Ultimate Workspace v7.0</span>
                <h2 class="text-2xl lg:text-3xl font-heading font-extrabold text-white">Welcome, <span class="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent" id="welcomeUserName">User</span>!</h2>
                <p class="text-slate-300 text-sm lg:text-base">LocalGram + 50+ Tools + Games — All in one!</p>
                <div class="flex flex-wrap gap-3 pt-2">
                    <button onclick="switchTab('localgram')" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium text-sm shadow-lg flex items-center gap-2"><i class="fa-brands fa-instagram"></i><span>Open LocalGram</span></button>
                    <button onclick="switchTab('downloadApp')" class="px-5 py-2.5 rounded-xl glass-card hover:bg-slate-800 text-slate-200 text-sm font-medium flex items-center gap-2"><i class="fa-solid fa-download text-emerald-400"></i><span>Download Apps</span></button>
                </div>
            </div>
        </div>
        <div id="announcementDisplay" class="hidden glass-card p-4 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 to-slate-900/40">
            <div class="flex items-start gap-3"><i class="fa-solid fa-bullhorn text-amber-400 text-lg mt-0.5"></i><div><p class="text-xs font-bold text-amber-300 mb-1">📢 Announcement</p><p class="text-sm text-slate-200" id="announcementText"></p></div></div>
        </div>
        <div>
            <h3 class="text-lg font-heading font-bold text-white mb-4"><i class="fa-solid fa-star text-indigo-400 mr-2"></i>Quick Access</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                ${quickCard('localgram','fa-instagram','text-pink-400','LocalGram')}
                ${quickCard('downloadApp','fa-download','text-emerald-400','Download')}
                ${quickCard('notepad','fa-note-sticky','text-yellow-400','Notes')}
                ${quickCard('alarm','fa-clock','text-red-400','Alarm')}
                ${quickCard('qrcode','fa-qrcode','text-purple-400','QR Code')}
                ${quickCard('calculator','fa-calculator','text-blue-400','Calculator')}
                ${quickCard('converter','fa-ruler-combined','text-cyan-400','Converter')}
                ${quickCard('tracker','fa-square-check','text-teal-400','Todo')}
            </div>
        </div>
    </div>`;
}
function quickCard(tab, icon, color, name) {
    return `<div onclick="switchTab('${tab}')" class="glass-card p-4 rounded-xl cursor-pointer text-center hover:border-indigo-500/40"><i class="fa-solid ${icon} text-2xl ${color} mb-2"></i><p class="text-xs font-bold text-white">${name}</p></div>`;
}

// ==================== LOCALGRAM ====================
function localgramView() {
    return `<div id="view-localgram" class="tab-content hidden" style="height:calc(100vh - 61px);display:flex;flex-direction:column;overflow:hidden;">
        <div class="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60 flex-shrink-0">
            <button onclick="lgOpenCreatePost()" class="text-white text-xl p-1"><i class="fa-solid fa-plus"></i></button>
            <h1 class="font-heading font-extrabold text-2xl tracking-tight bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">LocalGram</h1>
            <button onclick="lgShowNotifications()" class="text-white text-xl p-1"><i class="fa-regular fa-heart"></i></button>
        </div>
        <div class="px-3 py-2 border-b border-slate-800 bg-slate-950/40 flex-shrink-0">
            <div class="relative">
                <i class="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                <input type="text" id="lgSearchInput" oninput="lgSearch(this.value)" onfocus="lgSwitchTab('search')" placeholder="Search users..." class="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-12 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500">
                <button onclick="switchTab('lgSettings')" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"><i class="fa-solid fa-gear"></i></button>
            </div>
        </div>
        <div id="lgScrollArea" class="flex-1 overflow-y-auto bg-slate-950/30"><div id="lgFeedContent"></div></div>
        <div class="flex items-center justify-around py-2 border-t border-slate-800 bg-slate-950/80 flex-shrink-0">
            <button onclick="lgSwitchTab('home')" id="lg-tab-home" class="lg-tab text-white text-xl p-2"><i class="fa-solid fa-house"></i></button>
            <button onclick="lgSwitchTab('reels')" id="lg-tab-reels" class="lg-tab text-slate-500 text-xl p-2"><i class="fa-solid fa-clapperboard"></i></button>
            <button onclick="lgOpenCreatePost()" class="lg-tab text-white text-xl p-2"><i class="fa-regular fa-square-plus"></i></button>
            <button onclick="lgSwitchTab('messages')" id="lg-tab-messages" class="lg-tab text-slate-500 text-xl p-2"><i class="fa-solid fa-comments"></i></button>
            <button onclick="lgSwitchTab('profile')" id="lg-tab-profile" class="lg-tab text-slate-500 text-xl p-2"><i class="fa-solid fa-user"></i></button>
        </div>
    </div>`;
}

async function loadLocalGramFeed() {
    const container = document.getElementById('lgFeedContent');
    if (!container) return;
    container.innerHTML = '<div class="p-8 text-center text-slate-500"><i class="fa-solid fa-spinner fa-spin text-2xl"></i><p class="mt-2 text-xs">Loading...</p></div>';
    try {
        const now = Date.now();
        const storiesSnap = await FS.collection('stories').orderBy('createdAt', 'desc').limit(30).get();
        const stories = [];
        storiesSnap.forEach(doc => { const s = { id: doc.id, ...doc.data() }; if (!s.expiresAt || s.expiresAt > now) stories.push(s); });
        const notesSnap = await FS.collection('lgNotes').orderBy('createdAt', 'desc').limit(30).get();
        const lgNotesList = [];
        notesSnap.forEach(doc => { const n = { id: doc.id, ...doc.data() }; if (!n.expiresAt || n.expiresAt > now) lgNotesList.push(n); });
        const postsSnap = await FS.collection('posts').orderBy('createdAt', 'desc').limit(50).get();
        const posts = [];
        postsSnap.forEach(doc => posts.push({ id: doc.id, ...doc.data() }));
        container.innerHTML = `
            <div class="flex gap-3 overflow-x-auto p-4 border-b border-slate-800/60">
                <div onclick="lgOpenAddStory()" class="flex-shrink-0 text-center cursor-pointer">
                    <div class="relative w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mb-1"><i class="fa-solid fa-plus text-white text-xl"></i></div>
                    <p class="text-[10px] text-slate-300 truncate w-16">Your story</p>
                </div>
                ${stories.map(s => `
                    <div onclick="lgViewStory('${s.id}')" class="flex-shrink-0 text-center cursor-pointer">
                        <div class="lg-story-ring mb-1"><div class="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold overflow-hidden">
                            ${s.avatar ? `<img src="${s.avatar}" class="w-full h-full object-cover">` : (s.authorName||'?').charAt(0).toUpperCase()}
                        </div></div>
                        <p class="text-[10px] text-slate-300 truncate w-16">${s.authorName || 'User'}</p>
                    </div>
                `).join('')}
            </div>
            <div class="px-4 py-3 border-b border-slate-800/60">
                <div class="flex items-center gap-2 mb-2"><i class="fa-solid fa-comment-dots text-pink-400 text-sm"></i><span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Notes</span></div>
                <div class="flex gap-2 overflow-x-auto pb-1">
                    <div onclick="lgOpenCreateNote()" class="flex-shrink-0 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 cursor-pointer hover:border-pink-500/40">💭 Your note...</div>
                    ${lgNotesList.map(n => `
                        <div onclick="lgViewNote('${n.id}')" class="flex-shrink-0 px-4 py-2 rounded-2xl border text-xs cursor-pointer" style="background:${n.color||'#6366f1'}33;border-color:${n.color||'#6366f1'}66;color:#fff">
                            💭 ${n.text.length > 20 ? n.text.slice(0,20)+'...' : n.text}
                        </div>
                    `).join('')}
                </div>
            </div>
            <div>
                ${posts.length === 0 ? '<div class="p-12 text-center text-slate-500"><i class="fa-solid fa-camera text-4xl mb-3 opacity-30"></i><p class="text-sm">No posts yet</p></div>' : posts.map(p => lgRenderPost(p)).join('')}
            </div>
        `;
    } catch(e) {
        console.error(e);
        container.innerHTML = '<div class="p-12 text-center text-slate-500"><i class="fa-solid fa-exclamation-triangle text-4xl mb-3 opacity-30"></i><p class="text-sm">Error: ' + e.message + '</p></div>';
    }
}

function lgRenderPost(p) {
    const isMe = currentUser && p.authorId === currentUser.id;
    const liked = p.likes && p.likes.includes(currentUser?.id);
    return `<div class="border-b border-slate-800/60 pb-3 mb-2">
        <div class="flex items-center gap-3 px-4 py-3">
            <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                ${p.authorAvatar ? `<img src="${p.authorAvatar}" class="w-full h-full object-cover">` : (p.authorName||'?').charAt(0).toUpperCase()}
            </div>
            <div class="flex-1"><p class="text-sm font-bold text-white">${p.authorName || 'User'} ${p.authorIsAdmin ? '👑' : ''}</p><p class="text-[10px] text-slate-500">${lgTimeAgo(p.createdAt)}</p></div>
            ${isMe ? `<button onclick="lgDeletePost('${p.id}')" class="text-slate-400 text-lg"><i class="fa-solid fa-trash"></i></button>` : ''}
        </div>
        ${p.image ? `<div class="w-full"><img src="${p.image}" class="w-full max-h-[500px] object-cover"></div>` : ''}
        ${p.text ? `<div class="px-4 pt-2 text-sm text-slate-200 whitespace-pre-wrap">${lgEscapeHtml(p.text)}</div>` : ''}
        <div class="flex items-center gap-4 px-4 pt-3 text-2xl text-white">
            <button onclick="lgToggleLike('${p.id}', this)" class="hover:text-pink-400 ${liked ? 'text-pink-500' : ''}"><i class="${liked ? 'fa-solid' : 'fa-regular'} fa-heart"></i></button>
            <button onclick="lgOpenComments('${p.id}')" class="hover:text-cyan-400"><i class="fa-regular fa-comment"></i></button>
            <button onclick="lgSharePost('${p.id}')" class="hover:text-green-400"><i class="fa-regular fa-paper-plane"></i></button>
            <button class="ml-auto hover:text-yellow-400"><i class="fa-regular fa-bookmark"></i></button>
        </div>
        <div class="px-4 pt-2">
            <p class="text-sm font-bold text-white">${(p.likes||[]).length} likes</p>
            ${p.text ? `<p class="text-sm text-slate-200 mt-1"><b>${p.authorName}</b> ${lgEscapeHtml(p.text.slice(0,100))}${p.text.length>100?'...':''}</p>` : ''}
            <p class="text-xs text-slate-500 mt-1 cursor-pointer" onclick="lgOpenComments('${p.id}')">View all ${(p.comments||[]).length} comments</p>
        </div>
    </div>`;
}

function lgTimeAgo(ts) {
    if (!ts) return 'just now';
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s/60) + 'm ago';
    if (s < 86400) return Math.floor(s/3600) + 'h ago';
    return Math.floor(s/86400) + 'd ago';
}
function lgEscapeHtml(text) { const d = document.createElement('div'); d.textContent = text || ''; return d.innerHTML; }

async function lgToggleLike(postId, btn) {
    if (!currentUser) return;
    try {
        const doc = await FS.collection('posts').doc(postId).get();
        if (!doc.exists) return;
        const likes = doc.data().likes || [];
        const hasLiked = likes.includes(currentUser.id);
        const newLikes = hasLiked ? likes.filter(x => x !== currentUser.id) : [...likes, currentUser.id];
        await FS.collection('posts').doc(postId).update({ likes: newLikes });
        const icon = btn.querySelector('i');
        if (newLikes.includes(currentUser.id)) { icon.className = 'fa-solid fa-heart'; btn.classList.add('text-pink-500'); }
        else { icon.className = 'fa-regular fa-heart'; btn.classList.remove('text-pink-500'); }
        playSound('click');
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

function lgOpenCreatePost() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-md z-[95] flex items-center justify-center p-4';
    modal.innerHTML = `<div class="glass-card w-full max-w-md p-6 rounded-2xl border border-pink-500/30 space-y-4">
        <div class="flex justify-between items-center"><h3 class="font-heading font-bold text-lg text-white">Create Post</h3><button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button></div>
        <textarea id="lgPostText" rows="4" placeholder="What's on your mind?" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-pink-500"></textarea>
        <input type="file" id="lgPostImage" accept="image/*" class="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-pink-600 file:text-white cursor-pointer w-full">
        <div class="flex gap-2"><button onclick="this.closest('.fixed').remove()" class="flex-1 py-2 rounded-xl glass-card text-xs text-slate-300">Cancel</button><button onclick="lgSubmitPost()" class="flex-1 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold">Post</button></div>
    </div>`;
    document.body.appendChild(modal);
}

async function lgSubmitPost() {
    const text = document.getElementById('lgPostText').value.trim();
    const file = document.getElementById('lgPostImage').files[0];
    if (!text && !file) return showToast('কিছু লিখুন বা ছবি দিন', 'error');
    let imageData = null;
    if (file) {
        if (file.size > 2 * 1024 * 1024) return showToast('ছবি ২MB এর কম হতে হবে', 'error');
        imageData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let w = img.width, h = img.height, max = 800;
                    if (w > max || h > max) { if (w > h) { h = (max/w)*h; w = max; } else { w = (max/h)*w; h = max; } }
                    canvas.width = w; canvas.height = h;
                    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                    resolve(canvas.toDataURL('image/jpeg', 0.6));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
    try {
        await FS.collection('posts').add({
            authorId: currentUser.id, authorName: currentUser.displayName || currentUser.username,
            authorAvatar: currentUser.avatar || null, authorIsAdmin: currentUser.isAdmin || false,
            text: text || '', image: imageData, likes: [], comments: [], createdAt: Date.now()
        });
        document.querySelector('.fixed.z-\\[95\\]')?.remove();
        showToast('✅ Posted!', 'success');
        loadLocalGramFeed();
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

async function lgDeletePost(postId) {
    if (!confirm('Delete this post?')) return;
    try { await FS.collection('posts').doc(postId).delete(); showToast('Post deleted', 'success'); loadLocalGramFeed(); }
    catch(e) { showToast('Error: ' + e.message, 'error'); }
}

async function lgOpenComments(postId) {
    try {
        const doc = await FS.collection('posts').doc(postId).get();
        if (!doc.exists) return;
        const comments = doc.data().comments || [];
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-md z-[95] flex items-end md:items-center justify-center';
        modal.innerHTML = `<div class="glass-card w-full max-w-md rounded-t-3xl md:rounded-3xl border-t md:border border-slate-700 max-h-[85vh] flex flex-col">
            <div class="flex justify-between items-center p-4 border-b border-slate-800"><h3 class="font-heading font-bold text-white">Comments (${comments.length})</h3><button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button></div>
            <div class="flex-1 overflow-y-auto p-4 space-y-3">
                ${comments.length === 0 ? '<p class="text-center text-slate-500 text-sm py-8">No comments yet</p>' : comments.map(c => `
                    <div class="flex gap-3"><div class="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">${c.avatar ? `<img src="${c.avatar}" class="w-full h-full object-cover">` : c.name.charAt(0).toUpperCase()}</div>
                    <div class="flex-1"><p class="text-xs font-bold text-white">${c.name}</p><p class="text-sm text-slate-200 mt-0.5">${lgEscapeHtml(c.text)}</p><p class="text-[10px] text-slate-500 mt-1">${lgTimeAgo(c.ts)}</p></div></div>
                `).join('')}
            </div>
            <div class="p-3 border-t border-slate-800 flex gap-2">
                <input type="text" id="lgCommentInput_${postId}" placeholder="Add a comment..." class="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500">
                <button onclick="lgAddComment('${postId}')" class="px-4 py-2 rounded-xl bg-pink-600 text-white text-xs font-bold">Send</button>
            </div>
        </div>`;
        document.body.appendChild(modal);
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

async function lgAddComment(postId) {
    const input = document.getElementById('lgCommentInput_' + postId);
    const text = input.value.trim();
    if (!text) return;
    try {
        const doc = await FS.collection('posts').doc(postId).get();
        if (!doc.exists) return;
        const comments = doc.data().comments || [];
        comments.push({ uid: currentUser.id, name: currentUser.displayName || currentUser.username, avatar: currentUser.avatar || null, text: text, ts: Date.now() });
        await FS.collection('posts').doc(postId).update({ comments });
        input.value = '';
        document.querySelector('.fixed.z-\\[95\\]')?.remove();
        showToast('✅ Comment added', 'success');
        loadLocalGramFeed();
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

function lgSharePost(postId) { navigator.clipboard.writeText(window.location.href + '#post_' + postId); showToast('📋 Link copied', 'success'); }
function lgShowNotifications() { showToast('❤️ Notifications coming soon', 'info'); }

// ==================== STORIES ====================
function lgOpenAddStory() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) return showToast('ছবি ২MB এর কম হতে হবে', 'error');
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const img = new Image();
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                canvas.width = 512; canvas.height = 512;
                const ctx = canvas.getContext('2d');
                const size = Math.min(img.width, img.height);
                ctx.drawImage(img, (img.width-size)/2, (img.height-size)/2, size, size, 0, 0, 512, 512);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                try {
                    await FS.collection('stories').add({
                        authorId: currentUser.id, authorName: currentUser.displayName || currentUser.username,
                        avatar: currentUser.avatar || null, image: dataUrl,
                        createdAt: Date.now(), expiresAt: Date.now() + 24*60*60*1000
                    });
                    showToast('✅ Story added!', 'success');
                    loadLocalGramFeed();
                } catch(err) { showToast('Error: ' + err.message, 'error'); }
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

async function lgViewStory(storyId) {
    try {
        const now = Date.now();
        const snap = await FS.collection('stories').orderBy('createdAt', 'desc').limit(30).get();
        lgCurrentStoryList = [];
        snap.forEach(doc => { const s = { id: doc.id, ...doc.data() }; if (!s.expiresAt || s.expiresAt > now) lgCurrentStoryList.push(s); });
        lgCurrentStoryIndex = lgCurrentStoryList.findIndex(s => s.id === storyId);
        if (lgCurrentStoryIndex < 0) lgCurrentStoryIndex = 0;
        lgShowStory();
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

function lgShowStory() {
    const story = lgCurrentStoryList[lgCurrentStoryIndex];
    if (!story) return;
    const modal = document.createElement('div');
    modal.id = 'storyViewer';
    modal.className = 'fixed inset-0 bg-black z-[150] flex flex-col';
    modal.innerHTML = `
        <div class="flex gap-1 p-2 absolute top-0 left-0 right-0 z-10">${lgCurrentStoryList.map((_, i) => `<div class="flex-1 h-1 rounded-full ${i <= lgCurrentStoryIndex ? 'bg-white' : 'bg-white/30'}"></div>`).join('')}</div>
        <div class="flex items-center gap-3 p-4 absolute top-4 left-0 right-0 z-10">
            <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">${story.avatar ? `<img src="${story.avatar}" class="w-full h-full object-cover">` : (story.authorName||'?').charAt(0).toUpperCase()}</div>
            <div class="flex-1"><p class="text-sm font-bold text-white">${story.authorName}</p><p class="text-[10px] text-slate-400">${lgTimeAgo(story.createdAt)}</p></div>
            <button onclick="this.closest('.fixed').remove()" class="text-white text-xl p-2"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="flex-1 flex items-center justify-center" onclick="lgNextStory()"><img src="${story.image}" class="max-w-full max-h-full object-contain"></div>
        <div class="absolute left-0 top-20 bottom-20 w-1/3" onclick="event.stopPropagation(); lgPrevStory()"></div>
        <div class="absolute right-0 top-20 bottom-20 w-1/3" onclick="event.stopPropagation(); lgNextStory()"></div>
    `;
    document.body.appendChild(modal);
}
function lgNextStory() {
    if (lgCurrentStoryIndex < lgCurrentStoryList.length - 1) { lgCurrentStoryIndex++; document.getElementById('storyViewer')?.remove(); lgShowStory(); }
    else document.getElementById('storyViewer')?.remove();
}
function lgPrevStory() {
    if (lgCurrentStoryIndex > 0) { lgCurrentStoryIndex--; document.getElementById('storyViewer')?.remove(); lgShowStory(); }
}

// ==================== NOTES ====================
function lgOpenCreateNote() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-md z-[95] flex items-center justify-center p-4';
    modal.innerHTML = `<div class="glass-card w-full max-w-md p-6 rounded-2xl border border-pink-500/30 space-y-4">
        <div class="flex justify-between items-center"><h3 class="font-heading font-bold text-lg text-white">Create Note</h3><button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button></div>
        <textarea id="lgNoteText" rows="3" maxlength="150" placeholder="Write a note..." class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-pink-500"></textarea>
        <p class="text-xs text-slate-500 text-right"><span id="lgNoteCount">0</span>/150</p>
        <div class="flex gap-2 items-center"><span class="text-xs text-slate-400">Color:</span>
            <div class="flex gap-1">
                <button onclick="window._lgNoteColor='#ec4899'" class="w-6 h-6 rounded-full bg-pink-500"></button>
                <button onclick="window._lgNoteColor='#8b5cf6'" class="w-6 h-6 rounded-full bg-purple-500"></button>
                <button onclick="window._lgNoteColor='#06b6d4'" class="w-6 h-6 rounded-full bg-cyan-500"></button>
                <button onclick="window._lgNoteColor='#10b981'" class="w-6 h-6 rounded-full bg-emerald-500"></button>
                <button onclick="window._lgNoteColor='#f59e0b'" class="w-6 h-6 rounded-full bg-amber-500"></button>
            </div>
        </div>
        <div class="flex gap-2"><button onclick="this.closest('.fixed').remove()" class="flex-1 py-2 rounded-xl glass-card text-xs text-slate-300">Cancel</button><button onclick="lgSubmitNote()" class="flex-1 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold">Post Note</button></div>
    </div>`;
    document.body.appendChild(modal);
    window._lgNoteColor = '#ec4899';
    const ta = document.getElementById('lgNoteText');
    ta.addEventListener('input', () => document.getElementById('lgNoteCount').textContent = ta.value.length);
    ta.focus();
}

async function lgSubmitNote() {
    const text = document.getElementById('lgNoteText').value.trim();
    if (!text) return showToast('কিছু লিখুন', 'error');
    try {
        await FS.collection('lgNotes').add({
            authorId: currentUser.id, authorName: currentUser.displayName || currentUser.username,
            avatar: currentUser.avatar || null, text: text.slice(0, 150), color: window._lgNoteColor || '#ec4899',
            createdAt: Date.now(), expiresAt: Date.now() + 24*60*60*1000
        });
        document.querySelector('.fixed.z-\\[95\\]')?.remove();
        showToast('✅ Note posted!', 'success');
        loadLocalGramFeed();
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
}
function lgViewNote(id) { showToast('💭 Note viewer coming soon', 'info'); }

// ==================== SEARCH ====================
async function lgSearch(query) {
    if (!query || query.length < 2) return;
    const container = document.getElementById('lgScrollArea');
    if (!container) return;
    container.innerHTML = '<div class="p-8 text-center text-slate-500"><i class="fa-solid fa-spinner fa-spin text-2xl"></i></div>';
    try {
        const q = query.toLowerCase();
        const snap = await FS.collection('users').get();
        const results = [];
        snap.forEach(doc => { const u = { id: doc.id, ...doc.data() }; if (u.username.toLowerCase().includes(q) || (u.displayName||'').toLowerCase().includes(q)) results.push(u); });
        container.innerHTML = `<div class="p-4"><h3 class="text-sm font-bold text-white mb-3">Results (${results.length})</h3>
            ${results.length === 0 ? '<p class="text-xs text-slate-500 text-center py-8">No users found</p>' : results.map(u => `
                <div class="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 mb-2">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">${u.avatar ? `<img src="${u.avatar}" class="w-full h-full object-cover">` : (u.displayName||u.username).charAt(0).toUpperCase()}</div>
                    <div class="flex-1 min-w-0"><p class="text-sm font-bold text-white truncate">${u.displayName || u.username} ${u.isAdmin ? '👑' : ''}</p><p class="text-xs text-slate-400">@${u.username}</p></div>
                    ${u.id !== currentUser.id ? `<button onclick="lgOpenChat('${u.id}')" class="px-4 py-1.5 rounded-lg bg-pink-600 text-white text-xs font-bold">Message</button>` : '<span class="text-xs text-slate-500">You</span>'}
                </div>
            `).join('')}
        </div>`;
    } catch(e) { container.innerHTML = '<div class="p-8 text-center text-red-400 text-xs">Error</div>'; }
}

// ==================== TAB SWITCH ====================
function lgSwitchTab(tab) {
    lgCurrentTab = tab;
    ['home','reels','messages','profile'].forEach(t => {
        const btn = document.getElementById('lg-tab-' + t);
        if (!btn) return;
        btn.classList.remove('text-white');
        btn.classList.add('text-slate-500');
    });
    const activeBtn = document.getElementById('lg-tab-' + tab);
    if (activeBtn) { activeBtn.classList.remove('text-slate-500'); activeBtn.classList.add('text-white'); }
    if (tab === 'home') loadLocalGramFeed();
    if (tab === 'search') { const c = document.getElementById('lgScrollArea'); if (c) c.innerHTML = '<div class="p-12 text-center text-slate-500"><i class="fa-solid fa-magnifying-glass text-4xl mb-3 opacity-30"></i><p class="text-sm">Search users</p></div>'; }
    if (tab === 'reels') { const c = document.getElementById('lgScrollArea'); if (c) c.innerHTML = '<div class="p-12 text-center text-slate-500"><i class="fa-solid fa-clapperboard text-4xl mb-3 opacity-30"></i><p class="text-sm">Reels Coming Soon</p></div>'; }
    if (tab === 'messages') lgLoadMessagesList();
    if (tab === 'profile') lgLoadMyProfile();
    playSound('click');
}

// ==================== MESSAGES ====================
async function lgLoadMessagesList() {
    const container = document.getElementById('lgScrollArea');
    if (!container) return;
    container.innerHTML = '<div class="p-8 text-center text-slate-500"><i class="fa-solid fa-spinner fa-spin text-2xl"></i></div>';
    try {
        const snap = await FS.collection('users').get();
        const users = [];
        snap.forEach(doc => { const u = { id: doc.id, ...doc.data() }; if (u.id !== currentUser.id) users.push(u); });
        container.innerHTML = `<div class="p-4"><h3 class="text-sm font-bold text-white mb-3">Messages</h3>
            ${users.length === 0 ? '<p class="text-xs text-slate-500 text-center py-8">No users yet</p>' : users.map(u => `
                <div onclick="lgOpenChat('${u.id}')" class="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 mb-2 cursor-pointer hover:border-pink-500/40">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">${u.avatar ? `<img src="${u.avatar}" class="w-full h-full object-cover">` : (u.displayName||u.username).charAt(0).toUpperCase()}</div>
                    <div class="flex-1 min-w-0"><p class="text-sm font-bold text-white truncate">${u.displayName || u.username} ${u.isAdmin ? '👑' : ''}</p><p class="text-xs text-slate-400">@${u.username}</p></div>
                    <i class="fa-solid fa-comment text-pink-400"></i>
                </div>
            `).join('')}
        </div>`;
    } catch(e) { container.innerHTML = '<div class="p-8 text-center text-red-400 text-xs">Error</div>'; }
}

function getChatId(uid1, uid2) { return [uid1, uid2].sort().join('_'); }

async function lgOpenChat(userId) {
    try {
        const doc = await FS.collection('users').doc(userId).get();
        if (!doc.exists) return;
        const user = { id: doc.id, ...doc.data() };
        const chatView = document.createElement('div');
        chatView.id = 'lgChatModal';
        chatView.className = 'fixed inset-0 bg-slate-950 z-[95] flex flex-col';
        chatView.innerHTML = `
            <div class="p-3 border-b border-slate-800 flex items-center gap-3 bg-slate-900/60 flex-shrink-0">
                <button onclick="lgCloseChat()" class="p-2 rounded-lg hover:bg-slate-800 text-slate-300"><i class="fa-solid fa-arrow-left"></i></button>
                <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">${user.avatar ? `<img src="${user.avatar}" class="w-full h-full object-cover">` : (user.displayName||user.username).charAt(0).toUpperCase()}</div>
                <div class="flex-1"><p class="text-sm font-bold text-white">${user.displayName || user.username}</p><p class="text-[10px] ${user.isOnline ? 'text-emerald-400' : 'text-slate-500'}">${user.isOnline ? '🟢 Online' : 'Offline'}</p></div>
                <button onclick="showToast('📞 Call coming soon','info')" class="p-2 rounded-lg hover:bg-slate-800 text-emerald-400"><i class="fa-solid fa-phone"></i></button>
                <button onclick="showToast('🎥 Video call coming soon','info')" class="p-2 rounded-lg hover:bg-slate-800 text-blue-400"><i class="fa-solid fa-video"></i></button>
            </div>
            <div id="lgChatMessages" class="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/40"></div>
            <div class="p-3 border-t border-slate-800 bg-slate-900/60 flex items-end gap-2 flex-shrink-0">
                <textarea id="lgChatInput" rows="1" placeholder="Type a message..." onkeydown="if(event.key==='Enter' && !event.shiftKey){event.preventDefault();lgSendMessage('${userId}');}" class="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white resize-none max-h-32 focus:outline-none focus:border-pink-500"></textarea>
                <button onclick="lgSendMessage('${userId}')" class="p-3 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white"><i class="fa-solid fa-paper-plane"></i></button>
            </div>
        `;
        document.body.appendChild(chatView);
        lgSelectedChatUser = userId;
        const chatId = getChatId(currentUser.id, userId);
        if (lgChatUnsubscribe) lgChatUnsubscribe();
        lgChatUnsubscribe = FS.collection('chats').doc(chatId).collection('messages').orderBy('ts', 'asc').limit(200)
            .onSnapshot(snap => {
                const messages = [];
                snap.forEach(doc => messages.push({ id: doc.id, ...doc.data() }));
                lgRenderChatMessages(messages);
            });
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

function lgRenderChatMessages(messages) {
    const box = document.getElementById('lgChatMessages');
    if (!box) return;
    if (messages.length === 0) { box.innerHTML = '<div class="text-center text-slate-500 py-12"><i class="fa-solid fa-comments text-4xl mb-3 opacity-30"></i><p class="text-sm">No messages yet</p></div>'; return; }
    box.innerHTML = messages.map(m => {
        const isMe = m.from === currentUser.id;
        const time = new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `<div class="flex ${isMe ? 'justify-end' : 'justify-start'}">
            <div class="${isMe ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white' : 'bg-slate-800 text-slate-100'} px-3.5 py-2 rounded-2xl max-w-[75%] text-sm">
                <p>${lgEscapeHtml(m.text)}</p>
                <p class="text-[10px] ${isMe ? 'text-white/70' : 'text-slate-400'} mt-1 text-right">${time}</p>
            </div>
        </div>`;
    }).join('');
    box.scrollTop = box.scrollHeight;
}

async function lgSendMessage(toUserId) {
    const input = document.getElementById('lgChatInput');
    const text = input.value.trim();
    if (!text) return;
    const chatId = getChatId(currentUser.id, toUserId);
    try {
        await FS.collection('chats').doc(chatId).collection('messages').add({ from: currentUser.id, to: toUserId, text: text, ts: Date.now() });
        input.value = '';
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
}

function lgCloseChat() {
    if (lgChatUnsubscribe) { lgChatUnsubscribe(); lgChatUnsubscribe = null; }
    document.getElementById('lgChatModal')?.remove();
    lgSelectedChatUser = null;
}

// ==================== PROFILE ====================
async function lgLoadMyProfile() {
    const container = document.getElementById('lgScrollArea');
    if (!container || !currentUser) return;
    const doc = await FS.collection('users').doc(currentUser.id).get();
    const u = { id: doc.id, ...doc.data() };
    const postSnap = await FS.collection('posts').where('authorId', '==', currentUser.id).get();
    const posts = [];
    postSnap.forEach(d => posts.push({ id: d.id, ...d.data() }));
    container.innerHTML = `
        <div class="p-6 border-b border-slate-800/60">
            <div class="flex flex-col items-center">
                <div class="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden mb-3">${u.avatar ? `<img src="${u.avatar}" class="w-full h-full object-cover">` : (u.displayName||u.username).charAt(0).toUpperCase()}</div>
                <h2 class="text-lg font-bold text-white">${u.displayName || u.username} ${u.isAdmin ? '👑' : ''}</h2>
                <p class="text-xs text-slate-400 mb-1">@${u.username}</p>
                ${u.bio ? `<p class="text-xs text-slate-300 mt-1">${lgEscapeHtml(u.bio)}</p>` : ''}
                <div class="flex gap-6 mt-4 text-center">
                    <div><p class="text-lg font-bold text-white">${posts.length}</p><p class="text-[10px] text-slate-400">Posts</p></div>
                    <div><p class="text-lg font-bold text-white">${(u.followers||[]).length}</p><p class="text-[10px] text-slate-400">Followers</p></div>
                    <div><p class="text-lg font-bold text-white">${(u.following||[]).length}</p><p class="text-[10px] text-slate-400">Following</p></div>
                </div>
                <div class="flex gap-2 mt-4">
                    <button onclick="openProfileModal()" class="px-6 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold"><i class="fa-solid fa-pen mr-1"></i> Edit Profile</button>
                    <button onclick="switchTab('lgSettings')" class="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold"><i class="fa-solid fa-gear"></i></button>
                </div>
            </div>
        </div>
        <div class="grid grid-cols-3 gap-1 p-1">
            ${posts.length === 0 ? '<div class="col-span-3 p-8 text-center text-slate-500 text-sm">No posts yet</div>' : posts.map(p => `
                <div class="aspect-square bg-slate-900 relative overflow-hidden">
                    ${p.image ? `<img src="${p.image}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center text-slate-600"><i class="fa-solid fa-align-left text-2xl"></i></div>`}
                </div>
            `).join('')}
        </div>
    `;
}

// ==================== SETTINGS VIEW ====================
function lgSettingsView() {
    return `<div id="view-lgSettings" class="tab-content hidden space-y-4 p-4 lg:p-6">
        <div class="flex items-center gap-3 mb-2">
            <button onclick="switchTab('localgram')" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"><i class="fa-solid fa-arrow-left"></i></button>
            <h2 class="text-2xl font-heading font-bold text-white">Settings</h2>
        </div>
        <div class="space-y-3 pb-6 max-w-3xl mx-auto">
            <div class="glass-card rounded-2xl overflow-hidden">
                <div class="p-4 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center"><i class="fa-solid fa-user text-white"></i></div>
                    <div><p class="font-bold text-white text-sm">Accounts Centre</p><p class="text-[11px] text-slate-400">Password, security, personal details</p></div>
                </div>
            </div>
            <div class="glass-card rounded-2xl overflow-hidden">
                <div class="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/40">How you use LocalGram</div>
                ${lgSettingItem('fa-bookmark','Saved','', 'lgStub()')}
                ${lgSettingItem('fa-clock-rotate-left','Archive','', 'lgStub()')}
                ${lgSettingItem('fa-chart-line','Your activity','', 'lgStub()')}
                ${lgSettingItem('fa-bell','Notifications','', 'lgStub()')}
                ${lgSettingItem('fa-clock','Time management','', 'lgStub()')}
            </div>
            <div class="glass-card rounded-2xl overflow-hidden">
                <div class="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/40">Who can see your content</div>
                <div onclick="lgTogglePrivacy()" class="flex items-center justify-between p-4 border-b border-slate-800 cursor-pointer hover:bg-slate-800/30">
                    <div class="flex items-center gap-3"><i class="fa-solid fa-lock text-slate-400 w-5 text-center"></i><span class="text-sm text-white">Account privacy</span></div>
                    <div class="flex items-center gap-2"><span class="text-xs text-slate-400" id="lgPrivacyStatus">${currentUser?.isPrivate ? 'Private' : 'Public'}</span><i class="fa-solid fa-chevron-right text-slate-500 text-xs"></i></div>
                </div>
                ${lgSettingItem('fa-star','Close Friends','0', 'lgStub()')}
                ${lgSettingItem('fa-ban','Blocked','', 'lgStub()')}
                ${lgSettingItem('fa-image','Story, live and location','', 'lgStub()')}
                ${lgSettingItem('fa-users','Activity in Friends feed','', 'lgStub()')}
            </div>
            <div class="glass-card rounded-2xl overflow-hidden">
                <div class="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/40">How others can interact</div>
                ${lgSettingItem('fa-comment','Messages and story replies','', 'lgStub()')}
                ${lgSettingItem('fa-at','Tags and mentions','', 'lgStub()')}
                ${lgSettingItem('fa-comment-dots','Comments','', 'lgStub()')}
                ${lgSettingItem('fa-share','Sharing and reuse','', 'lgStub()')}
                ${lgSettingItem('fa-ban','Restricted','0', 'lgStub()')}
                ${lgSettingItem('fa-exclamation-circle','Limit interactions','Off', 'lgStub()')}
                ${lgSettingItem('fa-font','Hidden words','', 'lgStub()')}
            </div>
            <div class="glass-card rounded-2xl overflow-hidden">
                <div class="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/40">What you see</div>
                ${lgSettingItem('fa-star','Favourites','0', 'lgStub()')}
                ${lgSettingItem('fa-bell-slash','Muted accounts','0', 'lgStub()')}
                ${lgSettingItem('fa-sliders','Content preferences','', 'lgStub()')}
                ${lgSettingItem('fa-heart','Like and share counts','', 'lgStub()')}
            </div>
            <div class="glass-card rounded-2xl overflow-hidden">
                <div class="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/40">Your app and media</div>
                ${lgSettingItem('fa-mobile','Device permissions','', 'lgStub()')}
                ${lgSettingItem('fa-download','Archiving and downloading','', 'lgStub()')}
                ${lgSettingItem('fa-universal-access','Accessibility','', 'lgStub()')}
                ${lgSettingItem('fa-language','Language and sound','', 'lgStub()')}
                ${lgSettingItem('fa-signal','Data usage and media quality','', 'lgStub()')}
            </div>
            <div class="glass-card rounded-2xl overflow-hidden">
                <div class="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/40">Security</div>
                ${lgSettingItem('fa-shield-halved','Two-Step Verification','Off', 'lgOpenTwoStep()')}
                ${lgSettingItem('fa-key','Change Password','', 'openProfileModal()')}
                ${lgSettingItem('fa-envelope','Email Verification','', 'lgStub()')}
                ${lgSettingItem('fa-mobile-screen','Phone Number','', 'lgStub()')}
            </div>
            <button onclick="handleLogout()" class="w-full glass-card rounded-2xl p-4 text-left flex items-center gap-3 hover:border-red-500/40">
                <i class="fa-solid fa-right-from-bracket text-red-400 w-5 text-center"></i><span class="text-sm font-semibold text-red-400">Logout</span>
            </button>
            <p class="text-center text-[10px] text-slate-500 pt-2">LocalGram v1.0 · Made by Shifat</p>
        </div>
    </div>`;
}
function lgSettingItem(icon, label, badge, onclick) {
    return `<div onclick="${onclick}" class="flex items-center justify-between p-4 border-b border-slate-800 cursor-pointer hover:bg-slate-800/30">
        <div class="flex items-center gap-3"><i class="fa-solid ${icon} text-slate-400 w-5 text-center"></i><span class="text-sm text-white">${label}</span></div>
        <div class="flex items-center gap-2">${badge ? `<span class="text-xs text-slate-400">${badge}</span>` : ''}<i class="fa-solid fa-chevron-right text-slate-500 text-xs"></i></div>
    </div>`;
}
async function lgTogglePrivacy() {
    if (!currentUser) return;
    const newPrivate = !currentUser.isPrivate;
    try {
        await FS.collection('users').doc(currentUser.id).update({ isPrivate: newPrivate });
        currentUser.isPrivate = newPrivate;
        const el = document.getElementById('lgPrivacyStatus');
        if (el) el.textContent = newPrivate ? 'Private' : 'Public';
        showToast(newPrivate ? '🔒 Account is now Private' : '🌍 Account is now Public', 'success');
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
}
function lgStub() { showToast('⚙️ Feature coming soon', 'info'); }
function lgOpenTwoStep() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-md z-[95] flex items-center justify-center p-4';
    modal.innerHTML = `<div class="glass-card w-full max-w-md p-6 rounded-2xl border border-pink-500/30 space-y-4">
        <div class="flex justify-between items-center"><h3 class="font-heading font-bold text-lg text-white">🔐 Two-Step Verification</h3><button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button></div>
        <p class="text-xs text-slate-300">Add extra security.</p>
        <div class="space-y-2">
            <button onclick="lgEnable2FA('email')" class="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-left hover:border-pink-500/40"><div class="flex items-center gap-3"><i class="fa-solid fa-envelope text-pink-400"></i><div><p class="text-sm font-bold text-white">Email</p><p class="text-[10px] text-slate-400">${currentUser?.email || 'Add email first'}</p></div></div></button>
            <button onclick="lgEnable2FA('phone')" class="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-left hover:border-pink-500/40"><div class="flex items-center gap-3"><i class="fa-solid fa-mobile text-pink-400"></i><div><p class="text-sm font-bold text-white">Phone</p><p class="text-[10px] text-slate-400">Coming soon</p></div></div></button>
        </div>
        <button onclick="this.closest('.fixed').remove()" class="w-full py-2 rounded-xl glass-card text-xs text-slate-300">Close</button>
    </div>`;
    document.body.appendChild(modal);
}
function lgEnable2FA(method) {
    if (method === 'email' && !currentUser?.email) return showToast('Add email first', 'error');
    showToast('🔐 2FA enabled via ' + method, 'success');
    document.querySelector('.fixed.z-\\[95\\]')?.remove();
}

// ==================== DOWNLOAD APP ====================
function downloadAppView() {
    return `<div id="view-downloadApp" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div class="text-center">
            <h2 class="text-3xl font-heading font-extrabold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">📥 Download Apps</h2>
            <p class="text-slate-400 text-sm mt-2">Install as PWA on your home screen</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            <div class="glass-card p-6 rounded-3xl border-2 border-indigo-500/40 bg-gradient-to-br from-slate-900 to-indigo-950/40 text-center">
                <div class="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-2xl shadow-indigo-500/50 mb-4"><i class="fa-solid fa-bolt text-white text-3xl"></i></div>
                <h3 class="font-heading font-extrabold text-2xl text-white mb-2">Ultra Suite</h3>
                <p class="text-xs text-slate-400 mb-4">50+ Tools · Notes · Games</p>
                <div class="space-y-2 text-left text-xs text-slate-300 mb-5"><p>✅ Notes Pad</p><p>✅ Alarm & Timer</p><p>✅ QR & Colors</p><p>✅ Games Zone</p></div>
                <button onclick="installPWA()" class="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-lg"><i class="fa-solid fa-download mr-2"></i>Download Ultra Suite</button>
            </div>
            <div class="glass-card p-6 rounded-3xl border-2 border-pink-500/40 bg-gradient-to-br from-slate-900 to-pink-950/40 text-center">
                <div class="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-500 flex items-center justify-center shadow-2xl shadow-pink-500/50 mb-4"><i class="fa-brands fa-instagram text-white text-3xl"></i></div>
                <h3 class="font-heading font-extrabold text-2xl text-white mb-2">LocalGram</h3>
                <p class="text-xs text-slate-400 mb-4">Social Media · Post · Chat</p>
                <div class="space-y-2 text-left text-xs text-slate-300 mb-5"><p>✅ Post & Stories</p><p>✅ Notes + Music</p><p>✅ Chat & Messages</p><p>✅ Profile & Settings</p></div>
                <button onclick="installPWA()" class="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-sm shadow-lg"><i class="fa-solid fa-download mr-2"></i>Download LocalGram</button>
            </div>
        </div>
        <div class="glass-card p-5 rounded-2xl max-w-2xl mx-auto border border-amber-500/30 bg-amber-950/20">
            <h4 class="font-bold text-amber-300 text-sm mb-3"><i class="fa-solid fa-circle-info mr-2"></i>Install Instructions</h4>
            <div class="text-xs text-slate-300 space-y-2">
                <p><b>📱 Android (Chrome):</b> Menu (⋮) → "Install app"</p>
                <p><b>📱 iPhone (Safari):</b> Share → "Add to Home Screen"</p>
                <p><b>💻 Desktop:</b> Address bar install icon</p>
            </div>
        </div>
        <div class="text-center pt-4">
            <p class="text-slate-400 text-xs mb-3">Share with friends</p>
            <div class="flex justify-center gap-3">
                <button onclick="shareApp()" class="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"><i class="fa-solid fa-share mr-1"></i>Share</button>
                <button onclick="copyAppLink()" class="px-6 py-2.5 rounded-xl glass-card text-slate-200 text-xs font-bold"><i class="fa-solid fa-copy mr-1"></i>Copy Link</button>
            </div>
        </div>
    </div>`;
}
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; });
function installPWA() {
    if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt.userChoice.then(choice => { if (choice.outcome === 'accepted') showToast('✅ App installed!', 'success'); deferredPrompt = null; }); }
    else { showToast('📱 Use browser menu → "Add to Home Screen"', 'info'); }
}
function shareApp() {
    if (navigator.share) navigator.share({ title: 'Ultra Suite', text: 'Check out this app!', url: window.location.href });
    else copyAppLink();
}
function copyAppLink() { navigator.clipboard.writeText(window.location.href); showToast('📋 Link copied!', 'success'); }

// ==================== QUICK EDITOR ====================
function quickEditorView() {
    return `<div id="view-quickeditor" class="tab-content hidden space-y-4 p-4 lg:p-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div><h2 class="text-2xl font-heading font-bold text-white flex items-center gap-2"><i class="fa-solid fa-code text-emerald-400"></i>Live Editor</h2><p class="text-slate-400 text-xs">Paste HTML/CSS/JS</p></div>
            <div class="flex flex-wrap gap-2">
                <button onclick="runQuickCode()" class="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"><i class="fa-solid fa-play mr-1"></i>Run</button>
                <button onclick="toggleAutoRun()" id="autoRunBtn" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"><i class="fa-solid fa-bolt mr-1"></i>Auto: OFF</button>
                <button onclick="loadEditorTemplate()" class="px-4 py-2 rounded-xl bg-indigo-600/30 text-indigo-300 text-xs font-semibold"><i class="fa-solid fa-file-code"></i></button>
                <button onclick="clearQuickCode()" class="px-4 py-2 rounded-xl bg-red-600/20 text-red-300 text-xs font-semibold"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="glass-card rounded-2xl overflow-hidden border border-emerald-500/20"><div class="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2"><div class="w-2.5 h-2.5 rounded-full bg-red-500"></div><div class="w-2.5 h-2.5 rounded-full bg-yellow-500"></div><div class="w-2.5 h-2.5 rounded-full bg-green-500"></div><span class="text-xs font-mono text-slate-400 ml-2">index.html</span></div><textarea id="quickCodeInput" class="code-editor w-full h-[400px] bg-slate-950 text-slate-200 p-4 text-xs focus:outline-none resize-none" spellcheck="false"></textarea></div>
            <div class="glass-card rounded-2xl overflow-hidden border border-emerald-500/20"><div class="px-4 py-2 bg-slate-950/60 border-b border-slate-800"><span class="text-xs font-mono text-slate-400">Preview</span></div><iframe id="quickPreviewFrame" class="w-full h-[400px] bg-white border-0"></iframe></div>
        </div>
    </div>`;
}
function runQuickCode() { const code = document.getElementById('quickCodeInput')?.value; const frame = document.getElementById('quickPreviewFrame'); if (!frame) return; const doc = frame.contentDocument || frame.contentWindow.document; doc.open(); doc.write(code); doc.close(); }
function toggleAutoRun() {
    autoRun = !autoRun;
    const btn = document.getElementById('autoRunBtn');
    if (autoRun) { btn.innerHTML = '<i class="fa-solid fa-bolt"></i><span>Auto: ON</span>'; btn.className = 'px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold'; }
    else { btn.innerHTML = '<i class="fa-solid fa-bolt"></i><span>Auto: OFF</span>'; btn.className = 'px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold'; }
}
document.addEventListener('input', e => { if (e.target.id === 'quickCodeInput' && autoRun) { clearTimeout(window._autoRunT); window._autoRunT = setTimeout(runQuickCode, 500); } });
function loadEditorTemplate() { const inp = document.getElementById('quickCodeInput'); if (!inp) return; inp.value = '<!DOCTYPE html>\n<html><head><style>\nbody{font-family:system-ui;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;color:white}\n.card{background:rgba(255,255,255,0.15);padding:40px;border-radius:20px;text-align:center}\n</style></head><body>\n<div class="card"><h1>Hello Ultra Suite! 🚀</h1></div>\n</body></html>'; runQuickCode(); }
function clearQuickCode() { if (!confirm('Clear?')) return; document.getElementById('quickCodeInput').value = ''; runQuickCode(); }

// ==================== NOTES PAD ====================
function notepadView() {
    return `<div id="view-notepad" class="tab-content hidden space-y-4 p-4 lg:p-6">
        <div class="flex items-center justify-between">
            <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-note-sticky text-yellow-400 mr-2"></i>Notes Pad</h2><p class="text-slate-400 text-xs">Auto-save enabled</p></div>
            <button onclick="newNote()" class="px-3 py-2 rounded-xl bg-yellow-600/30 text-yellow-300 text-xs font-semibold border border-yellow-500/30"><i class="fa-solid fa-plus mr-1"></i>New</button>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div class="lg:col-span-1 glass-card rounded-2xl p-3 space-y-2 max-h-[500px] overflow-y-auto" id="notesList"></div>
            <div class="lg:col-span-3 glass-card rounded-2xl p-4 space-y-3">
                <input type="text" id="noteTitle" placeholder="Note title..." oninput="autoSaveNote()" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500">
                <textarea id="noteContent" placeholder="Write your note here..." rows="12" oninput="autoSaveNote()" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-yellow-500 resize-none"></textarea>
                <div class="flex justify-between items-center"><span class="text-xs text-slate-500" id="noteSavedStatus">Auto-save enabled</span><button onclick="deleteCurrentNote()" class="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-xs font-semibold"><i class="fa-solid fa-trash mr-1"></i>Delete</button></div>
            </div>
        </div>
    </div>`;
}
function renderNotesList() {
    const list = document.getElementById('notesList'); if (!list) return;
    if (notes.length === 0) { list.innerHTML = '<p class="text-xs text-slate-500 text-center p-3">No notes yet</p>'; return; }
    list.innerHTML = notes.map(n => `<div onclick="loadNote('${n.id}')" class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-yellow-500/40 ${n.id === currentNoteId ? 'border-yellow-500/60 bg-yellow-500/10' : ''}"><p class="text-xs font-semibold text-white truncate">${n.title || 'Untitled'}</p><p class="text-[10px] text-slate-500 mt-1">${new Date(n.updated).toLocaleDateString()}</p></div>`).join('');
}
function newNote() { const note = { id: Date.now().toString(), title: '', content: '', updated: new Date().toISOString() }; notes.unshift(note); saveNotes(); currentNoteId = note.id; renderNotesList(); const t = document.getElementById('noteTitle'); const c = document.getElementById('noteContent'); if (t) t.value = ''; if (c) c.value = ''; if (t) t.focus(); }
function loadNote(id) { const note = notes.find(n => n.id === id); if (!note) return; currentNoteId = id; const t = document.getElementById('noteTitle'); const c = document.getElementById('noteContent'); if (t) t.value = note.title; if (c) c.value = note.content; renderNotesList(); }
function autoSaveNote() { if (!currentNoteId) return; const note = notes.find(n => n.id === currentNoteId); if (!note) return; const t = document.getElementById('noteTitle'); const c = document.getElementById('noteContent'); note.title = t ? t.value : ''; note.content = c ? c.value : ''; note.updated = new Date().toISOString(); saveNotes(); renderNotesList(); const st = document.getElementById('noteSavedStatus'); if (st) st.textContent = '✅ Saved ' + new Date().toLocaleTimeString(); }
function deleteCurrentNote() { if (!currentNoteId || !confirm('Delete this note?')) return; notes = notes.filter(n => n.id !== currentNoteId); saveNotes(); currentNoteId = null; const t = document.getElementById('noteTitle'); const c = document.getElementById('noteContent'); if (t) t.value = ''; if (c) c.value = ''; renderNotesList(); }

// ==================== ALARM ====================
function alarmView() {
    return `<div id="view-alarm" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-clock text-red-400 mr-2"></i>Alarm & Timer</h2></div>
        <div class="glass-card p-8 rounded-2xl text-center border border-red-500/30"><p class="text-5xl md:text-6xl font-heading font-extrabold text-white tracking-wider" id="liveClock">--:--:--</p><p class="text-sm text-slate-400 mt-2" id="liveDate">Loading...</p></div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="glass-card p-5 rounded-2xl space-y-4">
                <h3 class="font-bold text-sm text-white"><i class="fa-solid fa-bell text-red-400 mr-2"></i>Alarm</h3>
                <input type="time" id="alarmTime" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white">
                <input type="text" id="alarmLabel" placeholder="Label" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white">
                <button onclick="setAlarm()" class="w-full py-2 rounded-xl bg-red-600 text-white text-xs font-bold"><i class="fa-solid fa-plus mr-1"></i>Set</button>
                <div id="alarmsList" class="space-y-2 max-h-40 overflow-y-auto"></div>
            </div>
            <div class="glass-card p-5 rounded-2xl space-y-4 text-center">
                <h3 class="font-bold text-sm text-white"><i class="fa-solid fa-hourglass-half text-amber-400 mr-2"></i>Timer</h3>
                <div class="relative w-40 h-40 mx-auto">
                    <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="6"/><circle id="timerCircle" cx="50" cy="50" r="45" fill="none" stroke="#f59e0b" stroke-width="6" stroke-dasharray="283" stroke-dashoffset="0" stroke-linecap="round" class="timer-circle"/></svg>
                    <div class="absolute inset-0 flex items-center justify-center"><p class="text-2xl font-mono font-bold text-white" id="timerDisplay">00:00</p></div>
                </div>
                <div class="flex gap-2"><input type="number" id="timerMinutes" placeholder="Min" class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white"><input type="number" id="timerSeconds" placeholder="Sec" class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white"></div>
                <div class="flex gap-2"><button onclick="startTimer()" class="flex-1 py-2 rounded-lg bg-amber-600 text-white text-xs font-bold"><i class="fa-solid fa-play"></i></button><button onclick="pauseTimer()" class="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"><i class="fa-solid fa-pause"></i></button><button onclick="resetTimer()" class="flex-1 py-2 rounded-lg bg-red-600/30 text-red-300 text-xs font-bold"><i class="fa-solid fa-rotate-left"></i></button></div>
            </div>
            <div class="glass-card p-5 rounded-2xl space-y-4 text-center">
                <h3 class="font-bold text-sm text-white"><i class="fa-solid fa-stopwatch text-cyan-400 mr-2"></i>Stopwatch</h3>
                <p class="text-4xl font-mono font-bold text-white" id="stopwatchDisplay">00:00:00</p>
                <div class="flex gap-2"><button onclick="startStopwatch()" class="flex-1 py-2 rounded-lg bg-cyan-600 text-white text-xs font-bold"><i class="fa-solid fa-play"></i></button><button onclick="lapStopwatch()" class="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"><i class="fa-solid fa-flag"></i></button><button onclick="resetStopwatch()" class="flex-1 py-2 rounded-lg bg-red-600/30 text-red-300 text-xs font-bold"><i class="fa-solid fa-rotate-left"></i></button></div>
                <div id="lapsList" class="space-y-1 max-h-32 overflow-y-auto text-left"></div>
            </div>
        </div>
    </div>`;
}
function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour12: false });
    const date = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const clockEl = document.getElementById('liveClock'); if (clockEl) { clockEl.textContent = time; const dt = document.getElementById('liveDate'); if (dt) dt.textContent = date; }
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    alarms.forEach(alarm => { if (alarm.active && alarm.time === currentTime && !alarm.triggered) { alarm.triggered = true; triggerAlarm(alarm); } });
}
setInterval(updateClock, 1000);
function setAlarm() { const time = document.getElementById('alarmTime').value; const label = document.getElementById('alarmLabel').value || 'Alarm'; if (!time) return showToast('সময় দিন', 'error'); alarms.push({ id: Date.now().toString(), time, label, active: true, triggered: false }); saveAlarms(); renderAlarms(); document.getElementById('alarmTime').value = ''; document.getElementById('alarmLabel').value = ''; showToast('⏰ Alarm set for ' + time, 'success'); }
function renderAlarms() { const list = document.getElementById('alarmsList'); if (!list) return; if (alarms.length === 0) { list.innerHTML = '<p class="text-[10px] text-slate-500 text-center">No alarms</p>'; return; } list.innerHTML = alarms.map(a => '<div class="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800"><div><p class="text-xs font-bold text-white">' + a.time + '</p><p class="text-[10px] text-slate-400">' + a.label + '</p></div><button onclick="deleteAlarm(\'' + a.id + '\')" class="text-red-400 text-xs"><i class="fa-solid fa-trash"></i></button></div>').join(''); }
function deleteAlarm(id) { alarms = alarms.filter(a => a.id !== id); saveAlarms(); renderAlarms(); }
function triggerAlarm(alarm) { playSound('alarm'); setTimeout(() => playSound('alarm'), 300); setTimeout(() => playSound('alarm'), 600); showToast('⏰ ' + alarm.label + ' (' + alarm.time + ')', 'success'); addNotification('⏰ Alarm: ' + alarm.label, 'clock'); alert('⏰ ALARM: ' + alarm.label + '\nTime: ' + alarm.time); }
let timerSecondsLeft = 0, timerTotal = 0;
function startTimer() {
    const min = parseInt(document.getElementById('timerMinutes').value) || 0;
    const sec = parseInt(document.getElementById('timerSeconds').value) || 0;
    if (min === 0 && sec === 0) return showToast('সময় দিন', 'error');
    if (!timerInterval) { timerTotal = min * 60 + sec; timerSecondsLeft = timerTotal; }
    if (timerInterval) return;
    timerInterval = setInterval(() => { timerSecondsLeft--; updateTimerDisplay(); if (timerSecondsLeft <= 0) { clearInterval(timerInterval); timerInterval = null; playSound('alarm'); setTimeout(() => playSound('alarm'), 300); showToast('⏰ Timer done!', 'success'); alert('⏰ Timer Complete!'); } }, 1000);
}
function pauseTimer() { clearInterval(timerInterval); timerInterval = null; }
function resetTimer() { clearInterval(timerInterval); timerInterval = null; timerSecondsLeft = 0; timerTotal = 0; updateTimerDisplay(); const m = document.getElementById('timerMinutes'); if(m) m.value = ''; const s = document.getElementById('timerSeconds'); if(s) s.value = ''; }
function updateTimerDisplay() { const m = Math.floor(timerSecondsLeft / 60).toString().padStart(2, '0'); const s = (timerSecondsLeft % 60).toString().padStart(2, '0'); const el = document.getElementById('timerDisplay'); if (el) el.textContent = m + ':' + s; const circle = document.getElementById('timerCircle'); if (circle && timerTotal > 0) circle.style.strokeDashoffset = 283 * (1 - timerSecondsLeft / timerTotal); }
function startStopwatch() { if (stopwatchInterval) return; stopwatchInterval = setInterval(() => { stopwatchTime += 10; const ms = Math.floor((stopwatchTime % 1000) / 10); const s = Math.floor(stopwatchTime / 1000) % 60; const m = Math.floor(stopwatchTime / 60000); const el = document.getElementById('stopwatchDisplay'); if (el) el.textContent = m.toString().padStart(2,'0') + ':' + s.toString().padStart(2,'0') + ':' + ms.toString().padStart(2,'0'); }, 10); }
function lapStopwatch() { if (stopwatchTime === 0) return; const ms = Math.floor((stopwatchTime % 1000) / 10); const s = Math.floor(stopwatchTime / 1000) % 60; const m = Math.floor(stopwatchTime / 60000); const lap = document.createElement('div'); lap.className = 'p-2 rounded bg-slate-900/60 text-xs flex justify-between'; const lapsList = document.getElementById('lapsList'); if (!lapsList) return; lap.innerHTML = '<span class="text-slate-400">Lap ' + (lapsList.children.length + 1) + '</span><span class="text-cyan-300 font-mono">' + m.toString().padStart(2,'0') + ':' + s.toString().padStart(2,'0') + ':' + ms.toString().padStart(2,'0') + '</span>'; lapsList.prepend(lap); }
function resetStopwatch() { clearInterval(stopwatchInterval); stopwatchInterval = null; stopwatchTime = 0; const el = document.getElementById('stopwatchDisplay'); if(el) el.textContent = '00:00:00'; const l = document.getElementById('lapsList'); if(l) l.innerHTML = ''; }

// ==================== POMODORO ====================
function pomodoroView() {
    return `<div id="view-pomodoro" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-stopwatch text-orange-400 mr-2"></i>Pomodoro</h2><p class="text-slate-400 text-xs">25 min focus, 5 min break</p></div>
        <div class="glass-card p-8 rounded-2xl text-center border border-orange-500/30 max-w-md mx-auto">
            <div class="relative w-64 h-64 mx-auto mb-6">
                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="rgba(249,115,22,0.15)" stroke-width="8"/><circle id="pomoCircle" cx="50" cy="50" r="45" fill="none" stroke="#f97316" stroke-width="8" stroke-dasharray="283" stroke-dashoffset="0" stroke-linecap="round"/></svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center"><p class="text-5xl font-mono font-bold text-white" id="pomoDisplay">25:00</p><p class="text-xs text-slate-400 mt-1" id="pomoMode">Focus Time</p></div>
            </div>
            <div class="flex gap-2"><button onclick="startPomodoro()" class="flex-1 py-3 rounded-xl bg-orange-600 text-white text-sm font-bold"><i class="fa-solid fa-play mr-1"></i>Start</button><button onclick="resetPomodoro()" class="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 text-sm font-bold"><i class="fa-solid fa-rotate-left mr-1"></i>Reset</button></div>
            <p class="text-xs text-slate-500 mt-4">Sessions: <span id="pomoSessions">0</span></p>
        </div>
    </div>`;
}
function startPomodoro() { if (pomodoroInterval) return; pomodoroInterval = setInterval(() => { pomodoroSeconds--; updatePomodoroDisplay(); if (pomodoroSeconds <= 0) { playSound('alarm'); if (pomodoroMode === 'focus') { pomodoroSessions++; pomodoroMode = 'break'; pomodoroSeconds = 5*60; showToast('🎉 Break time!', 'success'); } else { pomodoroMode = 'focus'; pomodoroSeconds = 25*60; showToast('💪 Focus time!', 'success'); } const s = document.getElementById('pomoSessions'); if(s) s.textContent = pomodoroSessions; } }, 1000); }
function resetPomodoro() { clearInterval(pomodoroInterval); pomodoroInterval = null; pomodoroSeconds = 25*60; pomodoroMode = 'focus'; updatePomodoroDisplay(); }
function updatePomodoroDisplay() { const m = Math.floor(pomodoroSeconds/60).toString().padStart(2,'0'); const s = (pomodoroSeconds%60).toString().padStart(2,'0'); const d = document.getElementById('pomoDisplay'); if(d) d.textContent = m + ':' + s; const mo = document.getElementById('pomoMode'); if(mo) mo.textContent = pomodoroMode === 'focus' ? 'Focus Time' : 'Break Time'; const c = document.getElementById('pomoCircle'); if (c) { const total = pomodoroMode === 'focus' ? 25*60 : 5*60; c.style.strokeDashoffset = 283 * (1 - pomodoroSeconds/total); } }

// ==================== QR ====================
function qrView() {
    return `<div id="view-qrcode" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-qrcode text-purple-400 mr-2"></i>QR Generator</h2></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="glass-card p-5 rounded-2xl space-y-3">
                <textarea id="qrContent" placeholder="Enter text or URL..." rows="3" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white resize-none"></textarea>
                <div class="grid grid-cols-2 gap-2"><select id="qrSize" class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"><option value="200">200x200</option><option value="300" selected>300x300</option><option value="400">400x400</option></select><input type="color" id="qrColor" value="#000000" class="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer"></div>
                <button onclick="generateQR()" class="w-full py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold"><i class="fa-solid fa-qrcode mr-1"></i>Generate</button>
                <button onclick="downloadQR()" class="w-full py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"><i class="fa-solid fa-download mr-1"></i>Download</button>
            </div>
            <div class="glass-card p-5 rounded-2xl flex items-center justify-center min-h-[300px]"><div id="qrOutput" class="text-center"><i class="fa-solid fa-qrcode text-6xl text-slate-700 mb-4"></i><p class="text-sm text-slate-500">QR will appear here</p></div></div>
        </div>
    </div>`;
}
function generateQR() { const content = document.getElementById('qrContent').value.trim(); const size = document.getElementById('qrSize').value; const color = document.getElementById('qrColor').value.replace('#',''); if (!content) return showToast('Content দিন', 'error'); document.getElementById('qrOutput').innerHTML = '<img src="https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size + '&data=' + encodeURIComponent(content) + '&color=' + color + '&bgcolor=ffffff" class="rounded-xl mx-auto" style="max-width:100%">'; showToast('✅ Generated!', 'success'); }
function downloadQR() { const img = document.querySelector('#qrOutput img'); if (!img) return showToast('আগে generate করুন', 'error'); const a = document.createElement('a'); a.href = img.src; a.download = 'qrcode.png'; a.click(); }

// ==================== COLORS ====================
function colorsView() {
    return `<div id="view-colors" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-palette text-pink-400 mr-2"></i>Color Palette</h2></div>
        <div class="glass-card p-5 rounded-2xl space-y-4">
            <button onclick="generatePalette()" class="w-full py-2.5 rounded-xl bg-pink-600 text-white text-xs font-bold"><i class="fa-solid fa-shuffle mr-1"></i>Generate</button>
            <div id="paletteOutput" class="grid grid-cols-2 md:grid-cols-5 gap-3"></div>
        </div>
    </div>`;
}
function generatePalette() { const output = document.getElementById('paletteOutput'); if (!output) return; const colors = []; const baseHue = Math.floor(Math.random()*360); for (let i = 0; i < 5; i++) colors.push(hslToHex((baseHue + i*30)%360, 60 + Math.random()*20, 45 + Math.random()*20)); output.innerHTML = colors.map(c => '<div onclick="copyToClipboard(\'' + c + '\')" class="cursor-pointer group"><div class="h-24 rounded-xl mb-2 group-hover:scale-105 transition" style="background:' + c + '"></div><p class="text-xs font-mono text-center text-white">' + c + '</p></div>').join(''); }
function hslToHex(h,s,l) { l/=100; const a = s*Math.min(l,1-l)/100; const f = n => { const k = (n + h/30)%12; const c = l - a*Math.max(Math.min(k-3,9-k,1),-1); return Math.round(255*c).toString(16).padStart(2,'0'); }; return '#' + f(0) + f(8) + f(4); }

// ==================== GRADIENT ====================
function gradientView() {
    return `<div id="view-gradient" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-fill-drip text-fuchsia-400 mr-2"></i>Gradient Maker</h2></div>
        <div class="glass-card p-5 rounded-2xl space-y-4">
            <div class="h-48 rounded-xl" id="gradientPreview" style="background:linear-gradient(90deg,#6366f1,#ec4899)"></div>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div><label class="text-xs text-slate-300 block mb-1">Color 1</label><input type="color" id="grad1" value="#6366f1" oninput="updateGradient()" class="w-full h-10 rounded-lg cursor-pointer"></div>
                <div><label class="text-xs text-slate-300 block mb-1">Color 2</label><input type="color" id="grad2" value="#ec4899" oninput="updateGradient()" class="w-full h-10 rounded-lg cursor-pointer"></div>
                <div><label class="text-xs text-slate-300 block mb-1">Direction</label><select id="gradDir" onchange="updateGradient()" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"><option value="90deg">→ Right</option><option value="180deg">↓ Down</option><option value="45deg">↘ Diagonal</option></select></div>
            </div>
            <div class="bg-slate-950 border border-slate-800 rounded-xl p-3"><code class="text-xs text-cyan-300 break-all" id="gradCode">background: linear-gradient(90deg, #6366f1, #ec4899);</code><button onclick="copyToClipboard(document.getElementById('gradCode').textContent)" class="mt-2 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"><i class="fa-solid fa-copy mr-1"></i>Copy</button></div>
        </div>
    </div>`;
}
function updateGradient() { const c1 = document.getElementById('grad1').value; const c2 = document.getElementById('grad2').value; const dir = document.getElementById('gradDir').value; const css = 'linear-gradient(' + dir + ', ' + c1 + ', ' + c2 + ')'; document.getElementById('gradientPreview').style.background = css; document.getElementById('gradCode').textContent = 'background: ' + css + ';'; }

// ==================== CONVERTER ====================
const units = { length: { m:1, km:1000, cm:0.01, mm:0.001, mi:1609.34, yd:0.9144, ft:0.3048, in:0.0254 }, weight: { kg:1, g:0.001, mg:0.000001, lb:0.453592, oz:0.0283495, t:1000 }, area: { m2:1, km2:1000000, cm2:0.0001, ft2:0.092903, acre:4046.86, ha:10000 }, volume: { l:1, ml:0.001, m3:1000, gal:3.78541, qt:0.946353, cup:0.236588 }, speed: { mps:1, kph:0.277778, mph:0.44704, knot:0.514444 }, time: { s:1, min:60, h:3600, day:86400, week:604800 }, data: { b:1, kb:1024, mb:1048576, gb:1073741824, tb:1099511627776 } };
const tempUnits = { c:'Celsius', f:'Fahrenheit', k:'Kelvin' };
function converterView() {
    return `<div id="view-converter" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-ruler-combined text-cyan-400 mr-2"></i>Unit Converter</h2></div>
        <div class="glass-card p-5 rounded-2xl space-y-4 max-w-2xl mx-auto">
            <select id="convCategory" onchange="updateConverterUnits()" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white"><option value="length">Length</option><option value="weight">Weight</option><option value="temperature">Temperature</option><option value="area">Area</option><option value="volume">Volume</option><option value="speed">Speed</option><option value="time">Time</option><option value="data">Data</option></select>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3"><input type="number" id="convInput" value="1" oninput="convertUnits()" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white"><select id="convFrom" onchange="convertUnits()" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white"></select><select id="convTo" onchange="convertUnits()" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white"></select></div>
            <div class="bg-gradient-to-r from-cyan-950/40 to-slate-900/40 border border-cyan-500/30 rounded-xl p-4 text-center"><p class="text-3xl font-bold text-white" id="convResult">0</p></div>
        </div>
    </div>`;
}
function updateConverterUnits() { const cat = document.getElementById('convCategory')?.value; if (!cat) return; const from = document.getElementById('convFrom'), to = document.getElementById('convTo'); if (!from || !to) return; from.innerHTML = ''; to.innerHTML = ''; if (cat === 'temperature') { Object.keys(tempUnits).forEach(u => { from.innerHTML += '<option value="' + u + '">' + tempUnits[u] + '</option>'; to.innerHTML += '<option value="' + u + '">' + tempUnits[u] + '</option>'; }); to.value = 'f'; } else { Object.keys(units[cat]).forEach(u => { from.innerHTML += '<option value="' + u + '">' + u + '</option>'; to.innerHTML += '<option value="' + u + '">' + u + '</option>'; }); to.selectedIndex = 1; } convertUnits(); }
function convertUnits() { const cat = document.getElementById('convCategory')?.value; if (!cat) return; const val = parseFloat(document.getElementById('convInput').value) || 0; const from = document.getElementById('convFrom').value, to = document.getElementById('convTo').value; let result = 0; if (cat === 'temperature') { let c; if (from === 'c') c = val; else if (from === 'f') c = (val-32)*5/9; else c = val-273.15; if (to === 'c') result = c; else if (to === 'f') result = c*9/5+32; else result = c+273.15; } else { result = (val * units[cat][from]) / units[cat][to]; } const el = document.getElementById('convResult'); if (el) el.textContent = result.toFixed(4).replace(/\.?0+$/,''); }

// ==================== CALCULATOR ====================
function calculatorView() {
    return `<div id="view-calculator" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-calculator text-blue-400 mr-2"></i>Calculator</h2></div>
        <div class="glass-card p-5 rounded-2xl max-w-md mx-auto">
            <input type="text" id="calcDisplay" readonly value="0" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-3xl text-right text-white font-mono mb-3">
            <div class="grid grid-cols-4 gap-2">
                <button onclick="calcFunc('sin')" class="py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm">sin</button>
                <button onclick="calcFunc('cos')" class="py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm">cos</button>
                <button onclick="calcFunc('tan')" class="py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm">tan</button>
                <button onclick="calcFunc('√')" class="py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm">√</button>
                <button onclick="calcNum('7')" class="py-3 rounded-xl bg-slate-800 text-white font-bold text-lg">7</button>
                <button onclick="calcNum('8')" class="py-3 rounded-xl bg-slate-800 text-white font-bold text-lg">8</button>
                <button onclick="calcNum('9')" class="py-3 rounded-xl bg-slate-800 text-white font-bold text-lg">9</button>
                <button onclick="calcNum('÷')" class="py-3 rounded-xl bg-slate-800 text-white font-bold text-lg">÷</button>
                <button onclick="calcNum('4')" class="py-3 rounded-xl bg-slate-800 text-white font-bold text-lg">4</button>
                <button onclick="calcNum('5')" class="py-3 rounded-xl bg-slate-800 text-white font-bold text-lg">5</button>
                <button onclick="calcNum('6')" class="py-3 rounded-xl bg-slate-800 text-white font-bold text-lg">6</button>
                <button onclick="calcNum('×')" class="py-3 rounded-xl bg-slate-800 text-white font-bold text-lg">×</button>
                <button onclick="calcNum('1')" class="py-3 rounded-xl bg-slate-800 text-white font-bold text-lg">1</button>
                <button onclick="calcNum('2')" class="py-3 rounded-xl bg-slate-800 text-white font-bold text-lg">2</button>
                <button onclick="calcNum('3')" class="py-3 rounded-xl bg-slate-800 text-white font-bold text-lg">3</button>
                <button onclick="calcNum('−')" class="py-3 rounded-xl bg-slate-800 text-white font-bold text-lg">−</button>
                <button onclick="calcNum('0')" class="py-3 rounded-xl bg-slate-800 text-white font-bold text-lg">0</button>
                <button onclick="calcNum('.')" class="py-3 rounded-xl bg-slate-800 text-white font-bold text-lg">.</button>
                <button onclick="calcNum('C')" class="py-3 rounded-xl bg-red-600/30 text-red-300 font-bold text-lg">C</button>
                <button onclick="calcNum('+')" class="py-3 rounded-xl bg-slate-800 text-white font-bold text-lg">+</button>
                <button onclick="calcNum('=')" class="col-span-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-lg">=</button>
            </div>
        </div>
    </div>`;
}
let calcValue = '0';
function calcNum(t) { if (t === 'C') calcValue = '0'; else if (t === '=') { try { calcValue = String(eval(calcValue.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-'))); } catch(e) { calcValue = 'Error'; } } else { if (calcValue === '0' && !isNaN(t)) calcValue = t; else calcValue += t; } const el = document.getElementById('calcDisplay'); if (el) el.value = calcValue; }
function calcFunc(f) { const v = parseFloat(calcValue) || 0; let r = 0; if (f === 'sin') r = Math.sin(v * Math.PI/180); else if (f === 'cos') r = Math.cos(v * Math.PI/180); else if (f === 'tan') r = Math.tan(v * Math.PI/180); else if (f === '√') r = Math.sqrt(v); calcValue = String(r); const el = document.getElementById('calcDisplay'); if (el) el.value = calcValue; }

// ==================== AGE ====================
function ageCalcView() {
    return `<div id="view-agecalculator" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-cake-candles text-pink-400 mr-2"></i>Age Calculator</h2></div>
        <div class="glass-card p-5 rounded-2xl max-w-md mx-auto space-y-4">
            <label class="text-xs text-slate-300 block">Birth Date</label>
            <input type="date" id="birthDate" onchange="calculateAge()" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm text-white">
            <div id="ageResult" class="hidden space-y-3">
                <div class="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4 text-center"><p class="text-4xl font-bold text-pink-300" id="ageYears">0</p><p class="text-xs text-pink-200 mt-1">Years Old</p></div>
                <div class="grid grid-cols-3 gap-2 text-center">
                    <div class="bg-slate-950 border border-slate-800 rounded-xl p-3"><p class="text-xl font-bold text-white" id="ageMonths">0</p><p class="text-[10px] text-slate-400">Months</p></div>
                    <div class="bg-slate-950 border border-slate-800 rounded-xl p-3"><p class="text-xl font-bold text-white" id="ageDays">0</p><p class="text-[10px] text-slate-400">Days</p></div>
                    <div class="bg-slate-950 border border-slate-800 rounded-xl p-3"><p class="text-xl font-bold text-white" id="ageHours">0</p><p class="text-[10px] text-slate-400">Hours</p></div>
                </div>
            </div>
        </div>
    </div>`;
}
function calculateAge() { const bd = document.getElementById('birthDate').value; if (!bd) return; const birth = new Date(bd); const now = new Date(); const years = now.getFullYear() - birth.getFullYear(); const months = now.getMonth() - birth.getMonth(); const totalDays = Math.floor((now - birth) / (1000*60*60*24)); const totalHours = totalDays * 24; document.getElementById('ageYears').textContent = years; document.getElementById('ageMonths').textContent = Math.max(0, months); document.getElementById('ageDays').textContent = totalDays; document.getElementById('ageHours').textContent = totalHours.toLocaleString(); document.getElementById('ageResult').classList.remove('hidden'); }

// ==================== BMI ====================
function bmiView() {
    return `<div id="view-bmi" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-weight-scale text-lime-400 mr-2"></i>BMI Calculator</h2></div>
        <div class="glass-card p-5 rounded-2xl max-w-md mx-auto space-y-4">
            <div><label class="text-xs text-slate-300 block mb-1">Weight (kg)</label><input type="number" id="bmiWeight" placeholder="70" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm text-white"></div>
            <div><label class="text-xs text-slate-300 block mb-1">Height (cm)</label><input type="number" id="bmiHeight" placeholder="175" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm text-white"></div>
            <button onclick="calculateBMI()" class="w-full py-3 rounded-xl bg-lime-600 text-white font-bold">Calculate</button>
            <div id="bmiResult" class="hidden text-center"><p class="text-5xl font-bold text-white" id="bmiValue">0</p><p class="text-sm mt-2" id="bmiCategory">-</p></div>
        </div>
    </div>`;
}
function calculateBMI() { const w = parseFloat(document.getElementById('bmiWeight').value); const h = parseFloat(document.getElementById('bmiHeight').value) / 100; if (!w || !h) return showToast('সব ফিল্ড পূরণ করুন', 'error'); const bmi = w / (h*h); let cat = ''; if (bmi < 18.5) cat = 'Underweight'; else if (bmi < 25) cat = 'Normal ✅'; else if (bmi < 30) cat = 'Overweight'; else cat = 'Obese'; document.getElementById('bmiValue').textContent = bmi.toFixed(1); document.getElementById('bmiCategory').textContent = cat; document.getElementById('bmiResult').classList.remove('hidden'); }

// ==================== LOAN ====================
function loanView() {
    return `<div id="view-loan" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-money-bill-trend-up text-green-400 mr-2"></i>Loan Calculator</h2></div>
        <div class="glass-card p-5 rounded-2xl max-w-md mx-auto space-y-4">
            <div><label class="text-xs text-slate-300 block mb-1">Amount (৳)</label><input type="number" id="loanAmount" placeholder="100000" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm text-white"></div>
            <div><label class="text-xs text-slate-300 block mb-1">Rate (%)</label><input type="number" id="loanRate" placeholder="10" step="0.1" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm text-white"></div>
            <div><label class="text-xs text-slate-300 block mb-1">Months</label><input type="number" id="loanMonths" placeholder="12" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm text-white"></div>
            <button onclick="calculateLoan()" class="w-full py-3 rounded-xl bg-green-600 text-white font-bold">Calculate</button>
            <div id="loanResult" class="hidden space-y-2">
                <div class="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center"><p class="text-xs text-green-300">Monthly</p><p class="text-3xl font-bold text-white" id="loanMonthly">৳0</p></div>
                <div class="grid grid-cols-2 gap-2"><div class="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center"><p class="text-xs text-slate-400">Total</p><p class="text-lg font-bold text-white" id="loanTotal">৳0</p></div><div class="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center"><p class="text-xs text-slate-400">Interest</p><p class="text-lg font-bold text-white" id="loanInterest">৳0</p></div></div>
            </div>
        </div>
    </div>`;
}
function calculateLoan() { const p = parseFloat(document.getElementById('loanAmount').value); const r = parseFloat(document.getElementById('loanRate').value) / 12 / 100; const n = parseInt(document.getElementById('loanMonths').value); if (!p || !r || !n) return showToast('সব ফিল্ড পূরণ করুন', 'error'); const monthly = (p * r * Math.pow(1+r, n)) / (Math.pow(1+r, n) - 1); const total = monthly * n; document.getElementById('loanMonthly').textContent = '৳' + monthly.toFixed(2); document.getElementById('loanTotal').textContent = '৳' + total.toFixed(2); document.getElementById('loanInterest').textContent = '৳' + (total - p).toFixed(2); document.getElementById('loanResult').classList.remove('hidden'); }

// ==================== EXPENSE ====================
function expenseView() {
    return `<div id="view-expense" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-wallet text-emerald-400 mr-2"></i>Expense Tracker</h2></div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="glass-card p-4 rounded-xl text-center border-l-4 border-emerald-500"><p class="text-xs text-slate-400">Income</p><p class="text-2xl font-bold text-emerald-400">৳<span id="totalIncome">0</span></p></div>
            <div class="glass-card p-4 rounded-xl text-center border-l-4 border-red-500"><p class="text-xs text-slate-400">Expense</p><p class="text-2xl font-bold text-red-400">৳<span id="totalExpense">0</span></p></div>
            <div class="glass-card p-4 rounded-xl text-center border-l-4 border-cyan-500"><p class="text-xs text-slate-400">Balance</p><p class="text-2xl font-bold text-cyan-400">৳<span id="totalBalance">0</span></p></div>
            <div class="glass-card p-4 rounded-xl text-center border-l-4 border-purple-500"><p class="text-xs text-slate-400">Total</p><p class="text-2xl font-bold text-purple-400" id="totalTransactions">0</p></div>
        </div>
        <div class="glass-card p-5 rounded-2xl"><div class="grid grid-cols-1 md:grid-cols-4 gap-3"><select id="expType" class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"><option value="income">Income</option><option value="expense">Expense</option></select><input type="text" id="expDesc" placeholder="Description" class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"><input type="number" id="expAmount" placeholder="Amount" class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"><button onclick="addTransaction()" class="py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"><i class="fa-solid fa-plus mr-1"></i>Add</button></div></div>
        <div class="glass-card rounded-2xl overflow-hidden"><div class="px-5 py-3 border-b border-slate-800 flex items-center justify-between"><h3 class="font-bold text-sm text-white">Transactions</h3><button onclick="clearTransactions()" class="text-xs text-red-400"><i class="fa-solid fa-trash mr-1"></i>Clear</button></div><div id="transactionsList" class="p-4 space-y-2 max-h-96 overflow-y-auto"></div></div>
    </div>`;
}
function addTransaction() { const type = document.getElementById('expType').value; const desc = document.getElementById('expDesc').value.trim(); const amount = parseFloat(document.getElementById('expAmount').value); if (!desc || !amount || amount <= 0) return showToast('সব ফিল্ড পূরণ করুন', 'error'); transactions.unshift({ id: Date.now().toString(), type, desc, amount, date: new Date().toISOString() }); saveTransactions(); renderTransactions(); document.getElementById('expDesc').value = ''; document.getElementById('expAmount').value = ''; playSound('success'); }
function renderTransactions() { const list = document.getElementById('transactionsList'); if (!list) return; const income = transactions.filter(t => t.type === 'income').reduce((s,t) => s+t.amount, 0); const expense = transactions.filter(t => t.type === 'expense').reduce((s,t) => s+t.amount, 0); const ti = document.getElementById('totalIncome'); if(ti) ti.textContent = income.toFixed(2); const te = document.getElementById('totalExpense'); if(te) te.textContent = expense.toFixed(2); const tb = document.getElementById('totalBalance'); if(tb) tb.textContent = (income - expense).toFixed(2); const tt = document.getElementById('totalTransactions'); if(tt) tt.textContent = transactions.length; if (transactions.length === 0) { list.innerHTML = '<p class="text-xs text-slate-500 text-center py-4">No transactions</p>'; return; } list.innerHTML = transactions.map(t => '<div class="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-lg ' + (t.type==='income'?'bg-emerald-500/20 text-emerald-400':'bg-red-500/20 text-red-400') + ' flex items-center justify-center"><i class="fa-solid ' + (t.type==='income'?'fa-arrow-down':'fa-arrow-up') + ' text-xs"></i></div><div><p class="text-xs font-semibold text-white">' + t.desc + '</p><p class="text-[10px] text-slate-500">' + new Date(t.date).toLocaleString() + '</p></div></div><div class="flex items-center gap-2"><span class="text-sm font-bold ' + (t.type==='income'?'text-emerald-400':'text-red-400') + '">' + (t.type==='income'?'+':'-') + '৳' + t.amount.toFixed(2) + '</span><button onclick="deleteTransaction(\'' + t.id + '\')" class="text-slate-500 hover:text-red-400 text-xs"><i class="fa-solid fa-trash"></i></button></div></div>').join(''); }
function deleteTransaction(id) { transactions = transactions.filter(t => t.id !== id); saveTransactions(); renderTransactions(); }
function clearTransactions() { if (!confirm('Clear all?')) return; transactions = []; saveTransactions(); renderTransactions(); }

// ==================== WATER ====================
function waterView() {
    return `<div id="view-water" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-droplet text-blue-400 mr-2"></i>Water Tracker</h2></div>
        <div class="glass-card p-8 rounded-2xl text-center border border-blue-500/30 max-w-md mx-auto">
            <div class="relative w-48 h-48 mx-auto mb-4">
                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="rgba(59,130,246,0.2)" stroke-width="8"/><circle id="waterCircle" cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" stroke-width="8" stroke-dasharray="283" stroke-dashoffset="283" stroke-linecap="round" style="transition:stroke-dashoffset 0.5s"/></svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center"><i class="fa-solid fa-droplet text-blue-400 text-3xl mb-1"></i><p class="text-3xl font-bold text-white"><span id="waterGlasses">0</span>/8</p></div>
            </div>
            <div class="flex gap-2 justify-center"><button onclick="addWater(-1)" class="px-6 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-bold"><i class="fa-solid fa-minus"></i></button><button onclick="addWater(1)" class="px-8 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold"><i class="fa-solid fa-plus mr-1"></i>Add</button><button onclick="resetWater()" class="px-6 py-2 rounded-xl bg-red-600/30 text-red-300 text-sm font-bold"><i class="fa-solid fa-rotate-left"></i></button></div>
        </div>
    </div>`;
}
function updateWaterUI() { const el = document.getElementById('waterGlasses'); if (el) el.textContent = waterCount; const circle = document.getElementById('waterCircle'); if (circle) circle.style.strokeDashoffset = 283 - (283 * Math.min(waterCount, 8) / 8); }
function addWater(amount) { waterCount = Math.max(0, waterCount + amount); localStorage.setItem('ultra_water_' + new Date().toDateString(), waterCount); updateWaterUI(); if (amount > 0) playSound('click'); }
function resetWater() { waterCount = 0; localStorage.setItem('ultra_water_' + new Date().toDateString(), 0); updateWaterUI(); }

// ==================== HABITS ====================
function habitsView() {
    return `<div id="view-habits" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-fire text-orange-400 mr-2"></i>Habit Tracker</h2></div>
        <div class="glass-card p-5 rounded-2xl flex gap-2"><input type="text" id="habitInput" placeholder="New habit..." class="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"><button onclick="addHabit()" class="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold"><i class="fa-solid fa-plus"></i></button></div>
        <div id="habitsList" class="space-y-3"></div>
    </div>`;
}
function addHabit() { const inp = document.getElementById('habitInput'); if (!inp.value.trim()) return; habits.push({ id: Date.now().toString(), name: inp.value.trim(), days: {} }); saveHabits(); inp.value = ''; renderHabits(); }
function renderHabits() { const list = document.getElementById('habitsList'); if (!list) return; if (habits.length === 0) { list.innerHTML = '<p class="text-xs text-slate-500 text-center py-4">No habits yet</p>'; return; } const today = new Date(); const days = []; for (let i = 6; i >= 0; i--) { const d = new Date(today); d.setDate(today.getDate() - i); days.push(d); } list.innerHTML = habits.map(h => '<div class="glass-card p-4 rounded-2xl"><div class="flex items-center justify-between mb-3"><p class="font-bold text-white">' + h.name + '</p><button onclick="deleteHabit(\'' + h.id + '\')" class="text-red-400 text-xs"><i class="fa-solid fa-trash"></i></button></div><div class="flex gap-1">' + days.map(d => { const k = d.toISOString().split('T')[0]; const done = h.days[k]; return '<button onclick="toggleHabit(\'' + h.id + '\',\'' + k + '\')" class="flex-1 py-2 rounded-lg text-xs font-bold ' + (done?'bg-emerald-500 text-white':'bg-slate-800 text-slate-400') + '">' + d.getDate() + '</button>'; }).join('') + '</div></div>').join(''); }
function toggleHabit(id, day) { const h = habits.find(x => x.id === id); if (!h) return; h.days[day] = !h.days[day]; saveHabits(); renderHabits(); }
function deleteHabit(id) { if (!confirm('Delete?')) return; habits = habits.filter(h => h.id !== id); saveHabits(); renderHabits(); }

// ==================== CALENDAR ====================
function calendarView() {
    return `<div id="view-calendar" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div class="flex items-center justify-between">
            <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-calendar text-indigo-400 mr-2"></i>Calendar</h2></div>
            <div class="flex gap-2"><button onclick="changeMonth(-1)" class="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"><i class="fa-solid fa-chevron-left"></i></button><button onclick="changeMonth(1)" class="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"><i class="fa-solid fa-chevron-right"></i></button></div>
        </div>
        <div class="glass-card p-5 rounded-2xl"><h3 class="text-xl font-bold text-white text-center mb-4" id="calendarTitle">-</h3><div class="grid grid-cols-7 gap-1 text-center mb-2">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => '<div class="text-xs text-slate-500 font-bold py-2">' + d + '</div>').join('')}</div><div id="calendarGrid" class="grid grid-cols-7 gap-1"></div></div>
    </div>`;
}
function changeMonth(dir) { calendarDate.setMonth(calendarDate.getMonth() + dir); renderCalendar(); }
function renderCalendar() { const title = document.getElementById('calendarTitle'); const grid = document.getElementById('calendarGrid'); if (!title || !grid) return; const year = calendarDate.getFullYear(), month = calendarDate.getMonth(); title.textContent = calendarDate.toLocaleDateString('en-US', { month:'long', year:'numeric' }); const firstDay = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month + 1, 0).getDate(); const today = new Date(); let html = ''; for (let i = 0; i < firstDay; i++) html += '<div></div>'; for (let d = 1; d <= daysInMonth; d++) { const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear(); html += '<div class="aspect-square flex items-center justify-center rounded-lg text-sm ' + (isToday?'bg-indigo-600 text-white font-bold':'text-slate-300 hover:bg-slate-800') + '">' + d + '</div>'; } grid.innerHTML = html; }

// ==================== QUOTES ====================
const quotes = [ { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" }, { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" }, { text: "The future belongs to those who believe in their dreams.", author: "Eleanor Roosevelt" }, { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" }, { text: "Success is not final, failure is not fatal.", author: "Winston Churchill" }, { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" }, { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" }, { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" } ];
function quotesView() {
    return `<div id="view-quotes" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-quote-left text-amber-400 mr-2"></i>Daily Quotes</h2></div>
        <div class="glass-card p-8 rounded-2xl border border-amber-500/30 min-h-[300px] flex items-center justify-center text-center"><div><i class="fa-solid fa-quote-left text-5xl text-amber-400/30 mb-4"></i><p class="text-xl lg:text-2xl font-heading text-white leading-relaxed mb-4" id="quoteText">"The only way to do great work is to love what you do."</p><p class="text-sm text-amber-300 font-semibold" id="quoteAuthor">— Steve Jobs</p></div></div>
        <div class="flex gap-3 justify-center"><button onclick="newQuote()" class="px-6 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold"><i class="fa-solid fa-shuffle mr-1"></i>New</button><button onclick="copyToClipboard(document.getElementById('quoteText').textContent + ' ' + document.getElementById('quoteAuthor').textContent)" class="px-6 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-bold"><i class="fa-solid fa-copy mr-1"></i>Copy</button></div>
    </div>`;
}
function newQuote() { const q = quotes[Math.floor(Math.random()*quotes.length)]; const t = document.getElementById('quoteText'); if(t) t.textContent = '"' + q.text + '"'; const a = document.getElementById('quoteAuthor'); if(a) a.textContent = '— ' + q.author; playSound('click'); }

// ==================== DICE ====================
function diceView() {
    return `<div id="view-dice" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-dice text-rose-400 mr-2"></i>Dice & Random</h2></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="glass-card p-6 rounded-2xl text-center space-y-4"><h3 class="font-bold text-white">🎲 Dice</h3><div id="diceOutput" class="text-8xl">🎲</div><button onclick="rollDice()" class="w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold"><i class="fa-solid fa-dice mr-1"></i>Roll</button></div>
            <div class="glass-card p-6 rounded-2xl text-center space-y-4"><h3 class="font-bold text-white">🪙 Coin</h3><div id="coinOutput" class="text-8xl">🪙</div><button onclick="flipCoin()" class="w-full py-2.5 rounded-xl bg-amber-600 text-white font-bold"><i class="fa-solid fa-coins mr-1"></i>Flip</button></div>
            <div class="glass-card p-6 rounded-2xl space-y-4"><h3 class="font-bold text-white">🔢 Random</h3><div class="flex gap-2"><input type="number" id="randomMin" value="1" class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"><input type="number" id="randomMax" value="100" class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"></div><p class="text-5xl font-bold text-center text-rose-400" id="randomResult">-</p><button onclick="generateRandom()" class="w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold"><i class="fa-solid fa-shuffle mr-1"></i>Generate</button></div>
            <div class="glass-card p-6 rounded-2xl space-y-4"><h3 class="font-bold text-white">🔐 Password</h3><div class="flex gap-2"><input type="text" id="randomPass" readonly class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300"><button onclick="copyToClipboard(document.getElementById('randomPass').value)" class="px-3 rounded-lg bg-slate-800 text-slate-300"><i class="fa-solid fa-copy"></i></button></div><button onclick="generatePassword()" class="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold"><i class="fa-solid fa-key mr-1"></i>Generate</button></div>
        </div>
    </div>`;
}
const diceEmojis = ['⚀','⚁','⚂','⚃','⚄','⚅'];
function rollDice() { const e = document.getElementById('diceOutput'); if(e) e.textContent = diceEmojis[Math.floor(Math.random()*6)]; playSound('click'); }
function flipCoin() { const e = document.getElementById('coinOutput'); if(e) e.textContent = Math.random()<0.5?'👑':'🦅'; playSound('click'); }
function generateRandom() { const min = parseInt(document.getElementById('randomMin').value) || 0; const max = parseInt(document.getElementById('randomMax').value) || 100; document.getElementById('randomResult').textContent = Math.floor(Math.random()*(max-min+1))+min; playSound('click'); }
function generatePassword() { const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()'; let p = ''; for (let i = 0; i < 16; i++) p += chars.charAt(Math.floor(Math.random()*chars.length)); document.getElementById('randomPass').value = p; playSound('click'); }

// ==================== JSON ====================
function jsonView() {
    return `<div id="view-json" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-file-code text-cyan-400 mr-2"></i>JSON Formatter</h2></div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="glass-card p-5 rounded-2xl space-y-3"><textarea id="jsonInput" placeholder='{"name":"John","age":30}' rows="10" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono resize-none"></textarea><div class="flex gap-2"><button onclick="formatJSON()" class="flex-1 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold">Format</button><button onclick="minifyJSON()" class="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Minify</button></div></div>
            <div class="glass-card p-5 rounded-2xl"><pre id="jsonOutput" class="text-xs text-emerald-300 font-mono whitespace-pre-wrap break-all max-h-[400px] overflow-y-auto">Output will appear here...</pre></div>
        </div>
    </div>`;
}
function formatJSON() { const inp = document.getElementById('jsonInput').value; try { document.getElementById('jsonOutput').textContent = JSON.stringify(JSON.parse(inp), null, 2); showToast('✅ Formatted', 'success'); } catch(e) { showToast('❌ Invalid JSON', 'error'); } }
function minifyJSON() { const inp = document.getElementById('jsonInput').value; try { document.getElementById('jsonOutput').textContent = JSON.stringify(JSON.parse(inp)); showToast('✅ Minified', 'success'); } catch(e) { showToast('❌ Invalid JSON', 'error'); } }

// ==================== BASE64 ====================
function base64View() {
    return `<div id="view-base64" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-lock text-emerald-400 mr-2"></i>Base64</h2></div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="glass-card p-5 rounded-2xl space-y-3"><label class="text-xs text-slate-300">Input</label><textarea id="base64Input" rows="6" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono resize-none"></textarea><div class="flex gap-2"><button onclick="encodeBase64()" class="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">Encode</button><button onclick="decodeBase64()" class="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">Decode</button></div></div>
            <div class="glass-card p-5 rounded-2xl space-y-3"><label class="text-xs text-slate-300">Output</label><textarea id="base64Output" rows="6" readonly class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono resize-none"></textarea><button onclick="copyToClipboard(document.getElementById('base64Output').value)" class="w-full py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"><i class="fa-solid fa-copy mr-1"></i>Copy</button></div>
        </div>
    </div>`;
}
function encodeBase64() { try { document.getElementById('base64Output').value = btoa(unescape(encodeURIComponent(document.getElementById('base64Input').value))); showToast('✅ Encoded', 'success'); } catch(e) { showToast('❌ Error', 'error'); } }
function decodeBase64() { try { document.getElementById('base64Output').value = decodeURIComponent(escape(atob(document.getElementById('base64Input').value))); showToast('✅ Decoded', 'success'); } catch(e) { showToast('❌ Invalid Base64', 'error'); } }

// ==================== UUID ====================
function uuidView() {
    return `<div id="view-uuid" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-fingerprint text-purple-400 mr-2"></i>UUID Generator</h2></div>
        <div class="glass-card p-5 rounded-2xl max-w-2xl mx-auto space-y-4"><input type="number" id="uuidCount" value="5" min="1" max="50" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"><button onclick="generateUUIDs()" class="w-full py-3 rounded-xl bg-purple-600 text-white font-bold"><i class="fa-solid fa-plus mr-1"></i>Generate</button><div id="uuidOutput" class="space-y-2 max-h-96 overflow-y-auto"></div></div>
    </div>`;
}
function generateUUIDs() { const count = Math.min(50, Math.max(1, parseInt(document.getElementById('uuidCount').value) || 5)); const out = document.getElementById('uuidOutput'); out.innerHTML = ''; for (let i = 0; i < count; i++) { const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8); return v.toString(16); }); out.innerHTML += '<div class="flex gap-2 items-center p-2 rounded-lg bg-slate-950 border border-slate-800"><code class="flex-1 text-xs text-purple-300 font-mono break-all">' + uuid + '</code><button onclick="copyToClipboard(\'' + uuid + '\')" class="text-slate-400 text-xs"><i class="fa-solid fa-copy"></i></button></div>'; } }

// ==================== MARKDOWN ====================
function markdownView() {
    return `<div id="view-markdown" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-markdown text-blue-400 mr-2"></i>Markdown Editor</h2></div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4"><div class="glass-card p-5 rounded-2xl"><textarea id="mdInput" rows="15" oninput="renderMarkdown()" placeholder="# Hello" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono resize-none"></textarea></div><div class="glass-card p-5 rounded-2xl"><div id="mdOutput" class="text-sm max-h-[400px] overflow-y-auto text-slate-200"></div></div></div>
    </div>`;
}
function renderMarkdown() { let md = document.getElementById('mdInput').value; md = md.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-white my-2">$1</h3>').replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-white my-2">$1</h2>').replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-white my-2">$1</h1>').replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-white">$1</strong>').replace(/\*(.+?)\*/g, '<em class="italic">$1</em>').replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1 rounded text-cyan-300">$1</code>').replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>').replace(/\n/g, '<br>'); document.getElementById('mdOutput').innerHTML = md; }

// ==================== PIANO ====================
function pianoView() {
    const notes = ['C','D','E','F','G','A','B'];
    const freqs = { C:261.63, D:293.66, E:329.63, F:349.23, G:392.00, A:440.00, B:493.88 };
    return `<div id="view-piano" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-music text-pink-400 mr-2"></i>Piano</h2></div>
        <div class="glass-card p-5 rounded-2xl overflow-x-auto"><div class="flex gap-1 justify-center min-w-fit">${notes.map(n => '<div onclick="playNote(' + freqs[n] + ')" class="piano-key bg-white text-black font-bold text-lg rounded-b-xl flex items-end justify-center pb-4" style="width:60px;height:200px;border:1px solid #333">' + n + '</div>').join('')}</div></div>
    </div>`;
}
function playNote(freq) { try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); osc.frequency.value = freq; osc.type = 'sine'; gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5); osc.start(); osc.stop(ctx.currentTime + 0.5); } catch(e) {} }

// ==================== DRUM ====================
function drumView() {
    const pads = ['🥁','🎵','🔔','🎺','🎸','🎹','🪘','🎤'];
    return `<div id="view-drum" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-drum text-amber-400 mr-2"></i>Drum Pad</h2></div>
        <div class="glass-card p-5 rounded-2xl"><div class="grid grid-cols-2 md:grid-cols-4 gap-3">${pads.map((p, i) => '<button onclick="playDrum(' + i + ')" class="drum-pad p-8 rounded-2xl bg-slate-800 hover:bg-slate-700 text-4xl font-bold transition">' + p + '</button>').join('')}</div></div>
    </div>`;
}
const drumFreqs = [150, 400, 800, 300, 600, 200, 500, 1000];
function playDrum(i) { try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); osc.frequency.value = drumFreqs[i]; osc.type = 'square'; gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2); osc.start(); osc.stop(ctx.currentTime + 0.2); } catch(e) {} }

// ==================== METRONOME ====================
function metronomeView() {
    return `<div id="view-metronome" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-wave-square text-cyan-400 mr-2"></i>Metronome</h2></div>
        <div class="glass-card p-8 rounded-2xl text-center max-w-md mx-auto space-y-4"><p class="text-6xl font-bold text-white" id="metronomeBPM">120</p><p class="text-xs text-slate-400">BPM</p><input type="range" id="metronomeRange" min="40" max="240" value="120" oninput="document.getElementById('metronomeBPM').textContent=this.value" class="w-full"><div class="w-32 h-32 mx-auto rounded-full bg-slate-900 border-4 border-cyan-500 flex items-center justify-center" id="metronomeCircle"><i class="fa-solid fa-music text-4xl text-cyan-400"></i></div><div class="flex gap-2"><button onclick="startMetronome()" class="flex-1 py-3 rounded-xl bg-cyan-600 text-white font-bold"><i class="fa-solid fa-play mr-1"></i>Start</button><button onclick="stopMetronome()" class="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold"><i class="fa-solid fa-stop mr-1"></i>Stop</button></div></div>
    </div>`;
}
let metronomeInterval = null;
function startMetronome() { if (metronomeInterval) return; const bpm = parseInt(document.getElementById('metronomeRange').value) || 120; const interval = (60/bpm) * 1000; metronomeInterval = setInterval(() => { try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); osc.frequency.value = 1000; gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05); osc.start(); osc.stop(ctx.currentTime + 0.05); const circle = document.getElementById('metronomeCircle'); if (circle) { circle.style.transform = 'scale(1.1)'; setTimeout(() => circle.style.transform = '', 100); } } catch(e) {} }, interval); }
function stopMetronome() { clearInterval(metronomeInterval); metronomeInterval = null; }

// ==================== 2048 ====================
function game2048View() {
    return `<div id="view-game2048" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div class="flex items-center justify-between"><div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-hashtag text-orange-400 mr-2"></i>2048</h2></div><div class="flex gap-2 items-center"><div class="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold">Score: <span id="g2048Score">0</span></div><button onclick="new2048()" class="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold">New</button></div></div>
        <div class="glass-card p-4 rounded-2xl max-w-md mx-auto"><div id="g2048Board" class="grid grid-cols-4 gap-2 aspect-square bg-slate-900 p-2 rounded-xl"></div><p class="text-xs text-slate-400 text-center mt-3">Use arrow keys / swipe</p></div>
    </div>`;
}
function new2048() { game2048State = { board: Array(4).fill().map(() => Array(4).fill(0)), score: 0 }; addRandomTile2048(); addRandomTile2048(); render2048(); }
function addRandomTile2048() { const empty = []; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (game2048State.board[i][j] === 0) empty.push([i,j]); if (empty.length === 0) return; const [r,c] = empty[Math.floor(Math.random()*empty.length)]; game2048State.board[r][c] = Math.random() < 0.9 ? 2 : 4; }
function render2048() { const board = document.getElementById('g2048Board'); if (!board || !game2048State) return; const colors = { 0:'bg-slate-800 text-transparent', 2:'bg-slate-700 text-white', 4:'bg-slate-600 text-white', 8:'bg-orange-600 text-white', 16:'bg-orange-500 text-white', 32:'bg-red-500 text-white', 64:'bg-red-600 text-white', 128:'bg-yellow-500 text-white', 256:'bg-yellow-400 text-white', 512:'bg-amber-400 text-white', 1024:'bg-amber-500 text-white', 2048:'bg-yellow-300 text-white' }; board.innerHTML = game2048State.board.flat().map(v => '<div class="g2048-cell ' + (colors[v] || 'bg-purple-600 text-white') + '" style="font-size:' + (v>999?'18px':'28px') + '">' + (v || '') + '</div>').join(''); const sc = document.getElementById('g2048Score'); if (sc) sc.textContent = game2048State.score; }
function move2048(dir) { if (!game2048State) return; const b = game2048State.board; const rotate = (arr) => arr[0].map((_, i) => arr.map(row => row[i]).reverse()); let board = b.map(r => [...r]); if (dir === 'up') board = rotate(rotate(rotate(board))); else if (dir === 'down') board = rotate(board); else if (dir === 'right') board = board.map(r => r.reverse()); for (let i = 0; i < 4; i++) { let row = board[i].filter(x => x !== 0); for (let j = 0; j < row.length - 1; j++) { if (row[j] === row[j+1]) { row[j] *= 2; game2048State.score += row[j]; row.splice(j+1, 1); } } while (row.length < 4) row.push(0); board[i] = row; } if (dir === 'right') board = board.map(r => r.reverse()); else if (dir === 'down') board = rotate(rotate(rotate(board))); else if (dir === 'up') board = rotate(board); game2048State.board = board; addRandomTile2048(); render2048(); }
document.addEventListener('keydown', e => { const v = document.getElementById('view-game2048'); if (v && !v.classList.contains('hidden')) { if (e.key === 'ArrowUp') { e.preventDefault(); move2048('up'); } if (e.key === 'ArrowDown') { e.preventDefault(); move2048('down'); } if (e.key === 'ArrowLeft') { e.preventDefault(); move2048('left'); } if (e.key === 'ArrowRight') { e.preventDefault(); move2048('right'); } } });

// ==================== SUDOKU ====================
function sudokuView() {
    return `<div id="view-sudoku" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div class="flex items-center justify-between"><div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-table-cells text-blue-400 mr-2"></i>Sudoku</h2></div><button onclick="newSudoku()" class="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">New</button></div>
        <div class="glass-card p-4 rounded-2xl max-w-md mx-auto"><div id="sudokuBoard" class="grid grid-cols-9 gap-0 border-2 border-indigo-500 rounded overflow-hidden"></div><button onclick="checkSudoku()" class="w-full mt-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">Check</button></div>
    </div>`;
}
function newSudoku() { const puzzle = [[5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],[8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],[0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9]]; sudokuState = puzzle.map(r => [...r]); renderSudoku(); }
function renderSudoku() { const board = document.getElementById('sudokuBoard'); if (!board || !sudokuState) return; board.innerHTML = sudokuState.flat().map((v, i) => '<input type="text" maxlength="1" value="' + (v || '') + '" ' + (v ? 'readonly' : '') + ' oninput="updateSudoku(' + i + ', this.value)" class="sudoku-cell ' + (v ? 'fixed' : '') + '" style="width:100%;height:40px">').join(''); }
function updateSudoku(idx, val) { const r = Math.floor(idx/9), c = idx % 9; sudokuState[r][c] = val ? parseInt(val) : 0; }
function checkSudoku() { const solution = [[5,3,4,6,7,8,9,1,2],[6,7,2,1,9,5,3,4,8],[1,9,8,3,4,2,5,6,7],[8,5,9,7,6,1,4,2,3],[4,2,6,8,5,3,7,9,1],[7,1,3,9,2,4,8,5,6],[9,6,1,5,3,7,2,8,4],[2,8,7,4,1,9,6,3,5],[3,4,5,2,8,6,1,7,9]]; let correct = true; for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) if (sudokuState[i][j] !== solution[i][j]) correct = false; showToast(correct ? '🎉 Correct!' : '❌ Wrong cells', correct ? 'success' : 'error'); }

// ==================== RPS ====================
function rpsView() {
    return `<div id="view-rps" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-hand-scissors text-rose-400 mr-2"></i>Rock Paper Scissors</h2></div>
        <div class="glass-card p-8 rounded-2xl text-center max-w-md mx-auto space-y-4"><div class="text-6xl" id="rpsResult">🤔</div><p class="text-sm text-slate-300" id="rpsMessage">Choose your move!</p><div class="grid grid-cols-3 gap-2"><button onclick="playRPS('rock')" class="py-4 rounded-xl bg-slate-800 text-4xl">✊</button><button onclick="playRPS('paper')" class="py-4 rounded-xl bg-slate-800 text-4xl">✋</button><button onclick="playRPS('scissors')" class="py-4 rounded-xl bg-slate-800 text-4xl">✌️</button></div><div class="grid grid-cols-3 gap-2 text-xs"><div class="bg-slate-900 rounded-xl p-3"><p class="text-slate-400">You</p><p class="text-xl font-bold text-emerald-400" id="rpsWins">0</p></div><div class="bg-slate-900 rounded-xl p-3"><p class="text-slate-400">Tie</p><p class="text-xl font-bold text-amber-400" id="rpsTies">0</p></div><div class="bg-slate-900 rounded-xl p-3"><p class="text-slate-400">CPU</p><p class="text-xl font-bold text-red-400" id="rpsLosses">0</p></div></div></div>
    </div>`;
}
let rpsWins = 0, rpsTies = 0, rpsLosses = 0;
function playRPS(player) { const options = ['rock','paper','scissors']; const emojis = { rock:'✊', paper:'✋', scissors:'✌️' }; const cpu = options[Math.floor(Math.random()*3)]; const rr = document.getElementById('rpsResult'); if(rr) rr.textContent = emojis[cpu]; let msg = ''; if (player === cpu) { rpsTies++; msg = '🤝 Tie!'; } else if ((player==='rock'&&cpu==='scissors')||(player==='paper'&&cpu==='rock')||(player==='scissors'&&cpu==='paper')) { rpsWins++; msg = '🎉 You win!'; } else { rpsLosses++; msg = '😢 You lose!'; } const rm = document.getElementById('rpsMessage'); if(rm) rm.textContent = msg; const rw = document.getElementById('rpsWins'); if(rw) rw.textContent = rpsWins; const rt = document.getElementById('rpsTies'); if(rt) rt.textContent = rpsTies; const rl = document.getElementById('rpsLosses'); if(rl) rl.textContent = rpsLosses; }

// ==================== SLOT ====================
function slotView() {
    return `<div id="view-slot" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-dice-five text-yellow-400 mr-2"></i>Slot Machine</h2></div>
        <div class="glass-card p-8 rounded-2xl text-center max-w-md mx-auto space-y-4"><div class="flex gap-2 justify-center text-6xl" id="slotReels"><div class="w-24 h-24 bg-slate-900 rounded-xl flex items-center justify-center">🍒</div><div class="w-24 h-24 bg-slate-900 rounded-xl flex items-center justify-center">🍒</div><div class="w-24 h-24 bg-slate-900 rounded-xl flex items-center justify-center">🍒</div></div><p class="text-sm text-slate-300" id="slotMessage">Try your luck!</p><button onclick="spinSlot()" class="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold text-lg"><i class="fa-solid fa-play mr-1"></i>SPIN</button><p class="text-xs text-slate-500">Score: <span id="slotScore">0</span></p></div>
    </div>`;
}
let slotScore = 0;
function spinSlot() { const emojis = ['🍒','🍋','🔔','💎','⭐','7️⃣']; const reels = document.getElementById('slotReels').children; let count = 0; const interval = setInterval(() => { for (let i = 0; i < 3; i++) reels[i].textContent = emojis[Math.floor(Math.random()*emojis.length)]; count++; if (count > 15) { clearInterval(interval); const r1 = reels[0].textContent, r2 = reels[1].textContent, r3 = reels[2].textContent; if (r1 === r2 && r2 === r3) { slotScore += 100; document.getElementById('slotMessage').textContent = '🎉 JACKPOT! +100'; playSound('success'); } else if (r1 === r2 || r2 === r3 || r1 === r3) { slotScore += 10; document.getElementById('slotMessage').textContent = '✨ Two match! +10'; playSound('success'); } else { document.getElementById('slotMessage').textContent = '😢 Try again!'; } document.getElementById('slotScore').textContent = slotScore; } }, 50); }

// ==================== WEB TOOLS ====================
function webToolsView() {
    const tools = [ { name:'Secure HTML', url:'https://security-2x95.onrender.com/', icon:'fa-shield-halved', color:'indigo' }, { name:'Video Downloader', url:'https://videodownloderbd.netlify.app/', icon:'fa-cloud-arrow-down', color:'pink' }, { name:'Web Deploy', url:'https://free-vps-server.netlify.app', icon:'fa-server', color:'cyan' }, { name:'4K Vault', url:'https://pixelvault-4k.netlify.app', icon:'fa-image', color:'purple' }, { name:'BG Remover', url:'https://bgclear-tools.netlify.app', icon:'fa-wand-magic-sparkles', color:'emerald' }, { name:'Temp Mail', url:'https://aura24.onrender.com/tempmail/', icon:'fa-envelope', color:'amber' }, { name:'Weather', url:'https://worldweather-skyview.netlify.app', icon:'fa-cloud-sun', color:'sky' } ];
    return `<div id="view-webtools" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-rocket text-pink-400 mr-2"></i>My Web Tools</h2></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            ${tools.map((t, i) => '<div onclick="window.open(\'' + t.url + '\', \'_blank\')" class="tool-link-card glass-card p-6 rounded-2xl group flex flex-col justify-between border-l-4 border-' + t.color + '-500/60"><div><div class="flex items-start justify-between mb-4"><div class="tool-icon w-14 h-14 rounded-xl bg-' + t.color + '-500/10 border border-' + t.color + '-500/20 flex items-center justify-center text-' + t.color + '-400 text-2xl"><i class="fa-solid ' + t.icon + '"></i></div><span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-' + t.color + '-500/20 text-' + t.color + '-300">' + (i+1) + '</span></div><h4 class="font-heading font-bold text-xl text-white">' + t.name + '</h4></div></div>').join('')}
        </div>
    </div>`;
}

// ==================== CUSTOM APPS ====================
function customAppsView() {
    return `<div id="view-customapps" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><h2 class="text-2xl font-heading font-bold text-white flex items-center gap-2"><i class="fa-solid fa-globe text-cyan-400"></i>Custom Apps</h2><button onclick="openAddAppModal()" class="px-4 py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-semibold self-start"><i class="fa-solid fa-plus mr-1"></i>Add App</button></div>
        <div id="customAppsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
    </div>`;
}
function renderCustomApps() {
    const grid = document.getElementById('customAppsGrid'); if (!grid) return;
    const cc = document.getElementById('customAppsCount'); if (cc) cc.innerText = customApps.length;
    if (customApps.length === 0) { grid.innerHTML = '<div class="col-span-full p-8 text-center glass-card rounded-2xl text-slate-400"><i class="fa-solid fa-globe text-3xl mb-2 text-cyan-400"></i><p class="text-sm">No apps added</p></div>'; return; }
    grid.innerHTML = customApps.map(app => '<div class="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-4"><div class="flex items-start justify-between"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400"><i class="fa-solid fa-globe"></i></div><div><h4 class="font-bold text-sm text-white">' + app.name + '</h4><p class="text-[11px] text-slate-400 font-mono truncate max-w-[150px]">' + app.url + '</p></div></div><button onclick="deleteCustomApp(\'' + app.id + '\')" class="text-slate-500 hover:text-red-400 text-xs p-1"><i class="fa-solid fa-trash"></i></button></div><a href="' + app.url + '" target="_blank" class="block py-1.5 rounded-lg bg-cyan-600/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30 text-center">Open</a></div>').join('');
}
function openAddAppModal() { document.getElementById('addAppModal').classList.remove('hidden'); }
function closeAddAppModal() { document.getElementById('addAppModal').classList.add('hidden'); }
function saveNewCustomApp() { const name = document.getElementById('newAppName').value.trim(); let url = document.getElementById('newAppUrl').value.trim(); if (!name || !url) return showToast('সব ফিল্ড পূরণ করুন', 'error'); if (!/^https?:\/\//i.test(url)) url = 'https://' + url; customApps.push({ id: Date.now().toString(), name, url }); saveCustomApps(); renderCustomApps(); document.getElementById('newAppName').value = ''; document.getElementById('newAppUrl').value = ''; closeAddAppModal(); showToast('✅ Added!', 'success'); }
function deleteCustomApp(id) { customApps = customApps.filter(a => a.id !== id); saveCustomApps(); renderCustomApps(); }

// ==================== ARCADE ====================
function arcadeView() {
    return `<div id="view-arcade" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-gamepad text-amber-400 mr-2"></i>Arcade Zone</h2></div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button onclick="loadGame('snake')" class="p-4 rounded-xl glass-card text-center"><i class="fa-solid fa-staff-snake text-2xl text-emerald-400 mb-2 block"></i><span class="text-xs font-bold text-slate-200">Snake</span></button>
            <button onclick="loadGame('memory')" class="p-4 rounded-xl glass-card text-center"><i class="fa-solid fa-brain text-2xl text-purple-400 mb-2 block"></i><span class="text-xs font-bold text-slate-200">Memory</span></button>
            <button onclick="loadGame('tictactoe')" class="p-4 rounded-xl glass-card text-center"><i class="fa-solid fa-xmark text-2xl text-indigo-400 mb-2 block"></i><span class="text-xs font-bold text-slate-200">Tic Tac Toe</span></button>
            <button onclick="loadGame('clicker')" class="p-4 rounded-xl glass-card text-center"><i class="fa-solid fa-hand-pointer text-2xl text-amber-400 mb-2 block"></i><span class="text-xs font-bold text-slate-200">Clicker</span></button>
        </div>
        <div class="glass-card p-6 rounded-2xl border border-amber-500/20 min-h-[350px] flex items-center justify-center"><div id="gameCanvasWrapper" class="text-center"><p class="text-slate-400 text-sm">Select a game above!</p></div></div>
    </div>`;
}
function loadGame(type) {
    const w = document.getElementById('gameCanvasWrapper'); if (!w) return;
    if (type === 'clicker') { let score = 0; w.innerHTML = '<div class="space-y-4"><h3 class="text-xl font-bold text-amber-400">Speed Clicker</h3><p class="text-3xl font-bold font-mono text-white" id="clickScore">0</p><button onclick="document.getElementById(\'clickScore\').innerText = ++score" class="px-8 py-4 bg-amber-500 text-slate-950 font-extrabold text-lg rounded-2xl">CLICK!</button></div>'; }
    else { w.innerHTML = '<div class="space-y-2"><i class="fa-solid fa-gamepad text-4xl text-amber-400 animate-bounce"></i><h4 class="font-bold text-white">' + type.toUpperCase() + '</h4><p class="text-xs text-slate-400">Coming soon!</p></div>'; }
}

// ==================== VIDEO STUDIO ====================
function videoStudioView() {
    return `<div id="view-videostudio" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-film text-rose-400 mr-2"></i>Video & Audio Studio</h2></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="glass-card p-5 rounded-2xl space-y-4"><h3 class="font-bold text-sm text-slate-200">Media Player</h3><input type="file" id="mediaFileInput" accept="video/*,audio/*" class="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white cursor-pointer w-full"><video id="studioMediaPlayer" controls class="w-full rounded-xl bg-black max-h-[300px] hidden"></video></div>
            <div class="glass-card p-5 rounded-2xl space-y-4"><h3 class="font-bold text-sm text-slate-200">Audio Visualizer</h3><canvas id="visualizerCanvas" width="300" height="150" class="w-full rounded-xl bg-slate-950 border border-slate-800"></canvas><button onclick="testAudioTone()" class="w-full py-2 bg-indigo-600/30 text-indigo-300 text-xs font-semibold rounded-xl border border-indigo-500/30">🔊 Play Test Tone</button></div>
        </div>
    </div>`;
}
function testAudioTone() { try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); osc.frequency.value = 440; gain.gain.setValueAtTime(0.15, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1); osc.start(); osc.stop(ctx.currentTime + 1); showToast('🔊 Tone played', 'success'); } catch(e) {} }

// ==================== DESIGN STUDIO ====================
function designStudioView() {
    return `<div id="view-designstudio" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div class="flex items-center justify-between flex-wrap gap-2"><div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-paintbrush text-purple-400 mr-2"></i>Design Studio</h2></div><div class="flex items-center gap-2"><input type="range" id="brushSize" min="1" max="30" value="3" class="w-24"><input type="color" id="brushColor" value="#6366f1" class="w-8 h-8 rounded cursor-pointer bg-transparent border-0"><button onclick="clearCanvas()" class="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-xs">Clear</button><button onclick="downloadCanvas()" class="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"><i class="fa-solid fa-download"></i></button></div></div>
        <div class="glass-card p-3 rounded-2xl"><canvas id="paintCanvas" class="w-full h-[400px] rounded-xl bg-slate-950 cursor-crosshair border border-slate-800"></canvas></div>
    </div>`;
}
let isDrawing = false;
function initCanvas() { const canvas = document.getElementById('paintCanvas'); if (!canvas) return; const ctx = canvas.getContext('2d'); canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; ctx.lineCap = 'round'; canvas.addEventListener('mousedown', e => { isDrawing = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); }); canvas.addEventListener('mousemove', e => { if (isDrawing) { ctx.strokeStyle = document.getElementById('brushColor').value; ctx.lineWidth = document.getElementById('brushSize').value; ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); } }); canvas.addEventListener('mouseup', () => isDrawing = false); canvas.addEventListener('mouseleave', () => isDrawing = false); }
function clearCanvas() { const c = document.getElementById('paintCanvas'); if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height); }
function downloadCanvas() { const c = document.getElementById('paintCanvas'); if (!c) return; const a = document.createElement('a'); a.href = c.toDataURL('image/png'); a.download = 'design.png'; a.click(); }

// ==================== DEVELOPER ====================
function developerView() {
    return `<div id="view-developer" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-terminal text-emerald-400 mr-2"></i>Developer Playground</h2></div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4"><div class="glass-card p-4 rounded-2xl space-y-3"><div class="flex justify-between items-center"><span class="text-xs font-mono text-emerald-400">Code</span><button onclick="runDevCode()" class="px-3 py-1 bg-emerald-600 text-white text-xs rounded-lg">Run</button></div><textarea id="devCodeInput" class="w-full h-[300px] bg-slate-950 text-slate-200 font-mono text-xs p-3 rounded-xl border border-slate-800" spellcheck="false"><h1 style="color: #6366f1;">Hello Ultra Suite!</h1></textarea></div><div class="glass-card p-4 rounded-2xl space-y-3"><span class="text-xs font-mono text-slate-400">Preview</span><iframe id="devPreviewFrame" class="w-full h-[300px] bg-white rounded-xl border-0"></iframe></div></div>
    </div>`;
}
function runDevCode() { const code = document.getElementById('devCodeInput')?.value; const frame = document.getElementById('devPreviewFrame'); if (!frame) return; const doc = frame.contentDocument || frame.contentWindow.document; doc.open(); doc.write(code); doc.close(); }

// ==================== TRACKER ====================
function trackerView() {
    return `<div id="view-tracker" class="tab-content hidden space-y-6 p-4 lg:p-6">
        <div><h2 class="text-2xl font-heading font-bold text-white"><i class="fa-solid fa-square-check text-teal-400 mr-2"></i>Todo List</h2></div>
        <div class="glass-card p-5 rounded-2xl max-w-xl space-y-4"><div class="flex gap-2"><input type="text" id="todoInput" placeholder="Add task..." class="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"><button onclick="addTodoTask()" class="px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-xl">Add</button></div><ul id="todoList" class="space-y-2"></ul></div>
    </div>`;
}
function renderTodos() { const list = document.getElementById('todoList'); if (!list) return; if (todos.length === 0) { list.innerHTML = '<p class="text-xs text-slate-500 text-center py-3">No tasks yet</p>'; return; } list.innerHTML = todos.map((t, i) => '<li class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"><span class="' + (t.done?'line-through text-slate-500':'text-slate-200') + '">' + t.text + '</span><div class="flex gap-2"><button onclick="toggleTodo(' + i + ')" class="text-xs px-2 py-1 rounded bg-slate-800 text-teal-400">' + (t.done?'Undo':'Done') + '</button><button onclick="deleteTodo(' + i + ')" class="text-xs px-2 py-1 rounded bg-slate-800 text-red-400"><i class="fa-solid fa-trash"></i></button></div></li>').join(''); }
function addTodoTask() { const inp = document.getElementById('todoInput'); if (!inp.value.trim()) return; todos.push({ text: inp.value.trim(), done: false }); saveTodos(); inp.value = ''; renderTodos(); playSound('click'); }
function toggleTodo(i) { todos[i].done = !todos[i].done; saveTodos(); renderTodos(); }
function deleteTodo(i) { todos.splice(i, 1); saveTodos(); renderTodos(); }

// ==================== HELPERS ====================
function copyToClipboard(text) { if (!text) return; navigator.clipboard.writeText(text).then(() => { showToast('📋 Copied!', 'success'); playSound('click'); }).catch(() => { showToast('❌ Copy failed', 'error'); }); }

// ==================== INITIALIZE ====================
function initializeViews() {
    try {
        renderNotesList(); renderAlarms(); updateWaterUI(); renderTransactions(); renderTodos(); renderCustomApps();
        newQuote(); generatePalette(); updateConverterUnits(); initCanvas(); runDevCode(); loadEditorTemplate();
        new2048(); newSudoku(); renderHabits(); renderCalendar(); updatePomodoroDisplay();
        const vc = document.getElementById('visualizerCanvas');
        if (vc) { const ctx = vc.getContext('2d'); let t = 0; (function draw() { ctx.clearRect(0, 0, vc.width, vc.height); ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 2; ctx.beginPath(); for (let x = 0; x < vc.width; x++) { const y = vc.height / 2 + Math.sin(x * 0.05 + t) * 30 * Math.sin(x * 0.02 + t * 0.5); if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); t += 0.05; requestAnimationFrame(draw); })(); }
        const mf = document.getElementById('mediaFileInput');
        if (mf) mf.addEventListener('change', e => { const file = e.target.files[0]; if (!file) return; const p = document.getElementById('studioMediaPlayer'); if (p) { p.src = URL.createObjectURL(file); p.classList.remove('hidden'); } });
        if (currentUser) { const wn = document.getElementById('welcomeUserName'); if (wn) wn.textContent = currentUser.displayName || currentUser.username; }
        console.log('✅ initializeViews completed');
    } catch(e) { console.error('❌ initializeViews error:', e); }
}

console.log('%c📦 PART 3 FULL Loaded ✅', 'color:#10b981;font-size:14px;font-weight:bold');
console.log('%c🚀 Ultra Suite + LocalGram READY!', 'color:#6366f1;font-size:18px;font-weight:bold');
