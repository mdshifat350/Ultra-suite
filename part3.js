// ==================== PART 3 (FULL) — Message 1 ====================

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

function saveTodos() { localStorage.setItem('ultra_todos', JSON.stringify(todos)); }
function saveCustomApps() { localStorage.setItem('ultra_custom_apps', JSON.stringify(customApps)); }
function saveTransactions() { localStorage.setItem('ultra_transactions', JSON.stringify(transactions)); }
function saveHabits() { localStorage.setItem('ultra_habits', JSON.stringify(habits)); }

// ==================== VIEW BUILDER (MAIN) ====================
function buildViews() {
    const c = document.getElementById('viewsContainer');
    if (!c) { console.error('viewsContainer missing'); return; }
    c.innerHTML = 
        dashboardView() +
        localgramView() +
        lgSettingsView() +
        downloadAppView() +
        quickEditorView() +
        notepadView() +
        alarmView() +
        pomodoroView() +
        qrView() +
        colorsView() +
        gradientView() +
        converterView() +
        calculatorView() +
        ageCalcView() +
        bmiView() +
        loanView() +
        expenseView() +
        waterView() +
        habitsView() +
        calendarView() +
        quotesView() +
        diceView() +
        jsonView() +
        base64View() +
        uuidView() +
        markdownView() +
        pianoView() +
        drumView() +
        metronomeView() +
        game2048View() +
        sudokuView() +
        rpsView() +
        slotView() +
        webToolsView() +
        customAppsView() +
        arcadeView() +
        videoStudioView() +
        designStudioView() +
        developerView() +
        trackerView();
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

// ==================== LOCALGRAM VIEW ====================
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
        <div id="lgScrollArea" class="flex-1 overflow-y-auto bg-slate-950/30">
            <div id="lgFeedContent"></div>
        </div>
        <div class="flex items-center justify-around py-2 border-t border-slate-800 bg-slate-950/80 flex-shrink-0">
            <button onclick="lgSwitchTab('home')" id="lg-tab-home" class="lg-tab text-white text-xl p-2"><i class="fa-solid fa-house"></i></button>
            <button onclick="lgSwitchTab('reels')" id="lg-tab-reels" class="lg-tab text-slate-500 hover:text-white text-xl p-2"><i class="fa-solid fa-clapperboard"></i></button>
            <button onclick="lgOpenCreatePost()" class="lg-tab text-white text-xl p-2"><i class="fa-regular fa-square-plus"></i></button>
            <button onclick="lgSwitchTab('messages')" id="lg-tab-messages" class="lg-tab text-slate-500 hover:text-white text-xl p-2"><i class="fa-solid fa-comments"></i></button>
            <button onclick="lgSwitchTab('profile')" id="lg-tab-profile" class="lg-tab text-slate-500 hover:text-white text-xl p-2"><i class="fa-solid fa-user"></i></button>
        </div>
    </div>`;
}

// ==================== LOCALGRAM FEED LOADER ====================
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
                    <div class="relative w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mb-1">
                        <i class="fa-solid fa-plus text-white text-xl"></i>
                    </div>
                    <p class="text-[10px] text-slate-300 truncate w-16">Your story</p>
                </div>
                ${stories.map(s => `
                    <div onclick="lgViewStory('${s.id}')" class="flex-shrink-0 text-center cursor-pointer">
                        <div class="lg-story-ring mb-1">
                            <div class="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold overflow-hidden">
                                ${s.avatar ? `<img src="${s.avatar}" class="w-full h-full object-cover">` : (s.authorName||'?').charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <p class="text-[10px] text-slate-300 truncate w-16">${s.authorName || 'User'}</p>
                    </div>
                `).join('')}
            </div>
            <div class="px-4 py-3 border-b border-slate-800/60">
                <div class="flex items-center gap-2 mb-2">
                    <i class="fa-solid fa-comment-dots text-pink-400 text-sm"></i>
                    <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Notes</span>
                </div>
                <div class="flex gap-2 overflow-x-auto pb-1">
                    <div onclick="lgOpenCreateNote()" class="flex-shrink-0 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 cursor-pointer hover:border-pink-500/40">
                        💭 Your note...
                    </div>
                    ${lgNotesList.map(n => `
                        <div onclick="lgViewNote('${n.id}')" class="flex-shrink-0 px-4 py-2 rounded-2xl border text-xs cursor-pointer" style="background:${n.color||'#6366f1'}33;border-color:${n.color||'#6366f1'}66;color:#fff">
                            💭 ${n.text.length > 20 ? n.text.slice(0,20)+'...' : n.text}
                        </div>
                    `).join('')}
                </div>
            </div>
            <div>
                ${posts.length === 0 ? '<div class="p-12 text-center text-slate-500"><i class="fa-solid fa-camera text-4xl mb-3 opacity-30"></i><p class="text-sm">No posts yet</p><p class="text-xs mt-1">Be the first to post!</p></div>' : posts.map(p => lgRenderPost(p)).join('')}
            </div>
        `;
    } catch(e) {
        console.error(e);
        container.innerHTML = '<div class="p-12 text-center text-slate-500"><i class="fa-solid fa-exclamation-triangle text-4xl mb-3 opacity-30"></i><p class="text-sm">Connection error: ' + e.message + '</p></div>';
    }
}

function lgRenderPost(p) {
    const isMe = currentUser && p.authorId === currentUser.id;
    const liked = p.likes && p.likes.includes(currentUser?.id);
    return `
        <div class="border-b border-slate-800/60 pb-3 mb-2" data-post-id="${p.id}">
            <div class="flex items-center gap-3 px-4 py-3">
                <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                    ${p.authorAvatar ? `<img src="${p.authorAvatar}" class="w-full h-full object-cover">` : (p.authorName||'?').charAt(0).toUpperCase()}
                </div>
                <div class="flex-1">
                    <p class="text-sm font-bold text-white">${p.authorName || 'User'} ${p.authorIsAdmin ? '👑' : ''}</p>
                    <p class="text-[10px] text-slate-500">${lgTimeAgo(p.createdAt)}</p>
                </div>
                ${isMe ? `<button onclick="lgDeletePost('${p.id}')" class="text-slate-400 text-lg"><i class="fa-solid fa-trash"></i></button>` : ''}
            </div>
            ${p.image ? `<div class="w-full"><img src="${p.image}" class="w-full max-h-[500px] object-cover"></div>` : ''}
            ${p.text ? `<div class="px-4 pt-2 text-sm text-slate-200 whitespace-pre-wrap">${lgEscapeHtml(p.text)}</div>` : ''}
            <div class="flex items-center gap-4 px-4 pt-3 text-2xl text-white">
                <button onclick="lgToggleLike('${p.id}', this)" class="hover:text-pink-400 ${liked ? 'text-pink-500' : ''}">
                    <i class="${liked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                </button>
                <button onclick="lgOpenComments('${p.id}')" class="hover:text-cyan-400"><i class="fa-regular fa-comment"></i></button>
                <button onclick="lgSharePost('${p.id}')" class="hover:text-green-400"><i class="fa-regular fa-paper-plane"></i></button>
                <button class="ml-auto hover:text-yellow-400"><i class="fa-regular fa-bookmark"></i></button>
            </div>
            <div class="px-4 pt-2">
                <p class="text-sm font-bold text-white">${(p.likes||[]).length} likes</p>
                ${p.text ? `<p class="text-sm text-slate-200 mt-1"><b>${p.authorName}</b> ${lgEscapeHtml(p.text.slice(0,100))}${p.text.length>100?'...':''}</p>` : ''}
                <p class="text-xs text-slate-500 mt-1 cursor-pointer" onclick="lgOpenComments('${p.id}')">View all ${(p.comments||[]).length} comments</p>
            </div>
        </div>
    `;
}

function lgTimeAgo(ts) {
    if (!ts) return 'just now';
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s/60) + 'm ago';
    if (s < 86400) return Math.floor(s/3600) + 'h ago';
    return Math.floor(s/86400) + 'd ago';
}
function lgEscapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text || '';
    return d.innerHTML;
}

// ==================== LOCALGRAM ACTIONS ====================
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
    modal.innerHTML = `
        <div class="glass-card w-full max-w-md p-6 rounded-2xl border border-pink-500/30 space-y-4">
            <div class="flex justify-between items-center">
                <h3 class="font-heading font-bold text-lg text-white">Create Post</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <textarea id="lgPostText" rows="4" placeholder="What's on your mind?" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-pink-500"></textarea>
            <input type="file" id="lgPostImage" accept="image/*" class="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-pink-600 file:text-white cursor-pointer w-full">
            <div class="flex gap-2">
                <button onclick="this.closest('.fixed').remove()" class="flex-1 py-2 rounded-xl glass-card text-xs text-slate-300">Cancel</button>
                <button onclick="lgSubmitPost()" class="flex-1 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold">Post</button>
            </div>
        </div>
    `;
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
            authorId: currentUser.id,
            authorName: currentUser.displayName || currentUser.username,
            authorAvatar: currentUser.avatar || null,
            authorIsAdmin: currentUser.isAdmin || false,
            text: text || '',
            image: imageData,
            likes: [],
            comments: [],
            createdAt: Date.now()
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
        modal.innerHTML = `
            <div class="glass-card w-full max-w-md rounded-t-3xl md:rounded-3xl border-t md:border border-slate-700 max-h-[85vh] flex flex-col">
                <div class="flex justify-between items-center p-4 border-b border-slate-800">
                    <h3 class="font-heading font-bold text-white">Comments (${comments.length})</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="flex-1 overflow-y-auto p-4 space-y-3">
                    ${comments.length === 0 ? '<p class="text-center text-slate-500 text-sm py-8">No comments yet</p>' : comments.map(c => `
                        <div class="flex gap-3">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                                ${c.avatar ? `<img src="${c.avatar}" class="w-full h-full object-cover">` : c.name.charAt(0).toUpperCase()}
                            </div>
                            <div class="flex-1">
                                <p class="text-xs font-bold text-white">${c.name}</p>
                                <p class="text-sm text-slate-200 mt-0.5">${lgEscapeHtml(c.text)}</p>
                                <p class="text-[10px] text-slate-500 mt-1">${lgTimeAgo(c.ts)}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="p-3 border-t border-slate-800 flex gap-2">
                    <input type="text" id="lgCommentInput_${postId}" placeholder="Add a comment..." class="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500">
                    <button onclick="lgAddComment('${postId}')" class="px-4 py-2 rounded-xl bg-pink-600 text-white text-xs font-bold">Send</button>
                </div>
            </div>
        `;
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

function lgSharePost(postId) {
    navigator.clipboard.writeText(window.location.href + '#post_' + postId);
    showToast('📋 Link copied', 'success');
}
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
                        authorId: currentUser.id,
                        authorName: currentUser.displayName || currentUser.username,
                        avatar: currentUser.avatar || null,
                        image: dataUrl,
                        createdAt: Date.now(),
                        expiresAt: Date.now() + 24*60*60*1000
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
        <div class="flex gap-1 p-2 absolute top-0 left-0 right-0 z-10">
            ${lgCurrentStoryList.map((_, i) => `<div class="flex-1 h-1 rounded-full ${i <= lgCurrentStoryIndex ? 'bg-white' : 'bg-white/30'}"></div>`).join('')}
        </div>
        <div class="flex items-center gap-3 p-4 absolute top-4 left-0 right-0 z-10">
            <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
                ${story.avatar ? `<img src="${story.avatar}" class="w-full h-full object-cover">` : (story.authorName||'?').charAt(0).toUpperCase()}
            </div>
            <div class="flex-1"><p class="text-sm font-bold text-white">${story.authorName}</p><p class="text-[10px] text-slate-400">${lgTimeAgo(story.createdAt)}</p></div>
            <button onclick="this.closest('.fixed').remove()" class="text-white text-xl p-2"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="flex-1 flex items-center justify-center" onclick="lgNextStory()">
            <img src="${story.image}" class="max-w-full max-h-full object-contain">
        </div>
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
    modal.innerHTML = `
        <div class="glass-card w-full max-w-md p-6 rounded-2xl border border-pink-500/30 space-y-4">
            <div class="flex justify-between items-center">
                <h3 class="font-heading font-bold text-lg text-white">Create Note</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <textarea id="lgNoteText" rows="3" maxlength="150" placeholder="Write a note..." class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-pink-500"></textarea>
            <p class="text-xs text-slate-500 text-right"><span id="lgNoteCount">0</span>/150</p>
            <div class="flex gap-2 items-center">
                <span class="text-xs text-slate-400">Color:</span>
                <div class="flex gap-1">
                    <button onclick="window._lgNoteColor='#ec4899'" class="w-6 h-6 rounded-full bg-pink-500"></button>
                    <button onclick="window._lgNoteColor='#8b5cf6'" class="w-6 h-6 rounded-full bg-purple-500"></button>
                    <button onclick="window._lgNoteColor='#06b6d4'" class="w-6 h-6 rounded-full bg-cyan-500"></button>
                    <button onclick="window._lgNoteColor='#10b981'" class="w-6 h-6 rounded-full bg-emerald-500"></button>
                    <button onclick="window._lgNoteColor='#f59e0b'" class="w-6 h-6 rounded-full bg-amber-500"></button>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="this.closest('.fixed').remove()" class="flex-1 py-2 rounded-xl glass-card text-xs text-slate-300">Cancel</button>
                <button onclick="lgSubmitNote()" class="flex-1 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold">Post Note</button>
            </div>
        </div>
    `;
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
            authorId: currentUser.id,
            authorName: currentUser.displayName || currentUser.username,
            avatar: currentUser.avatar || null,
            text: text.slice(0, 150),
            color: window._lgNoteColor || '#ec4899',
            createdAt: Date.now(),
            expiresAt: Date.now() + 24*60*60*1000
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
        container.innerHTML = `
            <div class="p-4">
                <h3 class="text-sm font-bold text-white mb-3">Results (${results.length})</h3>
                ${results.length === 0 ? '<p class="text-xs text-slate-500 text-center py-8">No users found</p>' : results.map(u => `
                    <div class="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 mb-2">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
                            ${u.avatar ? `<img src="${u.avatar}" class="w-full h-full object-cover">` : (u.displayName||u.username).charAt(0).toUpperCase()}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-bold text-white truncate">${u.displayName || u.username} ${u.isAdmin ? '👑' : ''}</p>
                            <p class="text-xs text-slate-400">@${u.username}</p>
                        </div>
                        ${u.id !== currentUser.id ? `<button onclick="lgOpenChat('${u.id}')" class="px-4 py-1.5 rounded-lg bg-pink-600 text-white text-xs font-bold">Message</button>` : '<span class="text-xs text-slate-500">You</span>'}
                    </div>
                `).join('')}
            </div>
        `;
    } catch(e) { container.innerHTML = '<div class="p-8 text-center text-red-400 text-xs">Error: ' + e.message + '</div>'; }
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
        container.innerHTML = `
            <div class="p-4">
                <h3 class="text-sm font-bold text-white mb-3">Messages</h3>
                ${users.length === 0 ? '<p class="text-xs text-slate-500 text-center py-8">No users yet</p>' : users.map(u => `
                    <div onclick="lgOpenChat('${u.id}')" class="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 mb-2 cursor-pointer hover:border-pink-500/40">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
                            ${u.avatar ? `<img src="${u.avatar}" class="w-full h-full object-cover">` : (u.displayName||u.username).charAt(0).toUpperCase()}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-bold text-white truncate">${u.displayName || u.username} ${u.isAdmin ? '👑' : ''}</p>
                            <p class="text-xs text-slate-400">@${u.username}</p>
                        </div>
                        <i class="fa-solid fa-comment text-pink-400"></i>
                    </div>
                `).join('')}
            </div>
        `;
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
                <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
                    ${user.avatar ? `<img src="${user.avatar}" class="w-full h-full object-cover">` : (user.displayName||user.username).charAt(0).toUpperCase()}
                </div>
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
        lgChatUnsubscribe = FS.collection('chats').doc(chatId).collection('messages')
            .orderBy('ts', 'asc').limit(200)
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
    if (messages.length === 0) {
        box.innerHTML = '<div class="text-center text-slate-500 py-12"><i class="fa-solid fa-comments text-4xl mb-3 opacity-30"></i><p class="text-sm">No messages yet</p></div>';
        return;
    }
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
        await FS.collection('chats').doc(chatId).collection('messages').add({
            from: currentUser.id, to: toUserId, text: text, ts: Date.now()
        });
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
                <div class="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden mb-3">
                    ${u.avatar ? `<img src="${u.avatar}" class="w-full h-full object-cover">` : (u.displayName||u.username).charAt(0).toUpperCase()}
                </div>
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

console.log('%c📦 PART 3 Message 1 Loaded ✅', 'color:#10b981;font-size:14px;font-weight:bold');
