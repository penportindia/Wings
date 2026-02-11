window.init_fee_setup = async function(state_from_shell) {
    const container = document.getElementById('main-content');
    const database = firebase.database();

    let state = {
        activeTab: 'academic',
        activeId: null,
        feeHeads: [],
        classes: [],
        routes: [],
        tempAmounts: {},
        isSyncing: false
    };

    container.innerHTML = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        #fee-setup-root {
            font-family: 'Inter', sans-serif;
            background: #f1f5f9;
            min-height: 100%;
            color: #1e293b;
        }

        .head-card {
            transition: all 0.2s ease;
            border: 1px solid #e2e8f0;
            background: white;
            min-width: 160px;
            cursor: pointer;
        }

        .head-card.active {
            background: #4f46e5;
            color: white;
            border-color: #4f46e5;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
        }

        .entity-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 12px;
            transition: all 0.2s;
        }

        .entity-card:focus-within {
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        
        .tab-btn { padding: 6px 16px; font-size: 11px; font-weight: 700; border-radius: 8px; transition: all 0.2s; }
        .tab-btn.active { background: white; color: #4f46e5; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    </style>

    <div id="fee-setup-root" class="p-4 flex flex-col gap-4">
        <header class="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <div class="flex items-center gap-6">
                <div class="flex items-center gap-2 border-r pr-6 border-slate-200">
                    <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                        <i class="fas fa-file-invoice-dollar text-sm"></i>
                    </div>
                </div>
                
                <div class="flex bg-slate-100 p-1 rounded-lg">
                    <button onclick="switchTab('academic')" id="tab-academic" class="tab-btn active">ACADEMIC</button>
                    <button onclick="switchTab('transport')" id="tab-transport" class="tab-btn text-slate-500">TRANSPORT</button>
                </div>
            </div>

            <div class="flex items-center gap-3">
                <select id="sessionSelect" class="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg font-bold text-xs outline-none focus:border-indigo-500"></select>
                <button onclick="openModal()" class="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-all">
                    <i class="fas fa-plus mr-1"></i> NEW HEAD
                </button>
                <button id="saveBtn" onclick="saveToCloud()" class="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100">
                    <i class="fas fa-sync-alt mr-1"></i> SYNC
                </button>
            </div>
        </header>

        <div id="headsList" class="flex gap-3 overflow-x-auto pb-2 custom-scrollbar"></div>

        <div id="workspace" class="hidden grid grid-cols-12 gap-4">
            <aside class="col-span-12 lg:col-span-3">
                <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <div class="mb-4">
                        <span id="activeRot" class="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">Monthly</span>
                        <h2 id="activeName" class="text-base font-extrabold text-slate-800 uppercase truncate">Category</h2>
                    </div>
                    
                    <div class="space-y-2">
                        <label class="text-[10px] font-bold text-slate-400 uppercase">Bulk Allocation</label>
                        <div class="flex gap-2">
                            <input type="number" id="bulkVal" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-indigo-500" placeholder="0.00">
                            <button onclick="applyToAll()" class="bg-slate-800 text-white px-3 rounded-lg text-[10px] font-bold hover:bg-black transition-all">SET</button>
                        </div>
                    </div>
                </div>
            </aside>

            <main class="col-span-12 lg:col-span-9">
                <div id="pricingGrid" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar"></div>
            </main>
        </div>
    </div>

    <div id="feeModal" class="fixed inset-0 z-[100] hidden flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
        <div class="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl">
            <h3 class="text-lg font-bold text-slate-900 mb-4">Add Component</h3>
            <div class="space-y-4">
                <div>
                    <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Head Name</label>
                    <input type="text" id="newName" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 uppercase">
                </div>
                <div>
                    <label class="text-[10px] font-bold text-slate-400 uppercase ml-1">Cycle</label>
                    <select id="newRot" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-indigo-500">
                        <option value="Monthly">Monthly</option>
                        <option value="Annual">Annual</option>
                        <option value="One-Time">One-Time</option>
                    </select>
                </div>
                <div class="flex gap-2 pt-2">
                    <button onclick="closeModal()" class="flex-1 py-2.5 font-bold text-slate-400 text-xs">Cancel</button>
                    <button onclick="saveNewHead()" class="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs">Create</button>
                </div>
            </div>
        </div>
    </div>
    `;

    const UI = {
        grid: document.getElementById('pricingGrid'),
        heads: document.getElementById('headsList'),
        workspace: document.getElementById('workspace'),
        saveBtn: document.getElementById('saveBtn')
    };

    const fetchInitialData = async () => {
        const snap = await database.ref('foundation').once('value');
        if (snap.exists()) {
            const data = snap.val();
            const sel = document.getElementById('sessionSelect');
            Object.values(data.sessions || {}).forEach(s => sel.add(new Option(s.name, s.name)));
            sel.value = "2025-26";
            state.classes = data.classes ? [...new Set(Object.values(data.classes).map(c => c.className))].sort((a,b) => a.localeCompare(b, undefined, {numeric: true})) : [];
            state.routes = data.transport ? Object.entries(data.transport).map(([id, v]) => ({id, ...v})) : [];
            await refreshHeads();
        }
    };

    const refreshHeads = async () => {
        const snap = await database.ref('foundation/fee_heads').once('value');
        state.feeHeads = snap.exists() ? Object.entries(snap.val()).map(([id, v]) => ({id, ...v})) : [];
        renderHeads();
    };

    const renderHeads = () => {
        UI.heads.innerHTML = '';
        if (state.activeTab === 'academic') {
            state.feeHeads.forEach(h => {
                const active = state.activeId === h.id ? 'active' : '';
                const el = document.createElement('div');
                el.className = `head-card p-3 rounded-xl flex flex-col justify-between h-16 ${active}`;
                el.onclick = () => selectHead(h);
                el.innerHTML = `
                    <div class="flex justify-between items-start">
                        <span class="text-[8px] font-bold uppercase opacity-70">${h.rotation}</span>
                        <button onclick="event.stopPropagation(); deleteHead('${h.id}')" class="text-[10px] opacity-30 hover:opacity-100 hover:text-red-500"><i class="fas fa-trash"></i></button>
                    </div>
                    <h4 class="font-bold text-[11px] uppercase truncate">${h.name}</h4>
                `;
                UI.heads.appendChild(el);
            });
        } else {
            const active = state.activeId === 'T' ? 'active' : '';
            UI.heads.innerHTML = `<div onclick="selectTransport()" class="head-card p-3 rounded-xl h-16 flex flex-col justify-center gap-1 ${active}"><i class="fas fa-bus text-xs"></i><h4 class="font-bold text-[11px] uppercase">Transport Fleet</h4></div>`;
        }
    };

    window.switchTab = (tab) => {
        state.activeTab = tab;
        state.activeId = null;
        UI.workspace.classList.add('hidden');
        document.getElementById('tab-academic').className = `tab-btn ${tab === 'academic' ? 'active' : 'text-slate-500'}`;
        document.getElementById('tab-transport').className = `tab-btn ${tab === 'transport' ? 'active' : 'text-slate-500'}`;
        renderHeads();
    };

    const selectHead = async (head) => {
        state.activeId = head.id;
        state.tempAmounts = {};
        renderHeads();
        UI.workspace.classList.remove('hidden');
        document.getElementById('activeName').innerText = head.name;
        document.getElementById('activeRot').innerText = head.rotation;
        const snap = await database.ref(`foundation/fee_master/${document.getElementById('sessionSelect').value}/${head.id}`).once('value');
        const existing = snap.val()?.amounts || {};
        UI.grid.innerHTML = '';
        state.classes.forEach(cls => {
            state.tempAmounts[cls] = existing[cls] || '';
            UI.grid.innerHTML += createCard(`CLASS ${cls}`, cls, state.tempAmounts[cls]);
        });
    };

    window.selectTransport = async () => {
        state.activeId = 'T';
        state.tempAmounts = {};
        renderHeads();
        UI.workspace.classList.remove('hidden');
        document.getElementById('activeName').innerText = "Transport";
        document.getElementById('activeRot').innerText = "Monthly";
        const snap = await database.ref(`foundation/transport_master/${document.getElementById('sessionSelect').value}`).once('value');
        const existing = snap.val()?.amounts || {};
        UI.grid.innerHTML = '';
        state.routes.forEach(r => {
            state.tempAmounts[r.id] = existing[r.id] || '';
            UI.grid.innerHTML += createCard(r.groupName, r.id, state.tempAmounts[r.id]);
        });
    };

    const createCard = (title, key, val) => `
        <div class="entity-card">
            <h5 class="font-bold text-slate-700 text-[11px] mb-2 uppercase truncate">${title}</h5>
            <div class="flex items-center bg-slate-50 rounded-lg border border-slate-100 px-2 py-1.5 focus-within:bg-white focus-within:border-indigo-500">
                <span class="text-xs font-bold text-slate-400 mr-1">₹</span>
                <input type="number" value="${val}" oninput="state.tempAmounts['${key}'] = this.value" 
                    class="bg-transparent w-full font-bold text-sm outline-none text-slate-900" placeholder="0">
            </div>
        </div>
    `;

    window.saveToCloud = async () => {
        if (!state.activeId || state.isSyncing) return;
        state.isSyncing = true;
        const btnText = UI.saveBtn.innerHTML;
        UI.saveBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
        const session = document.getElementById('sessionSelect').value;
        const path = state.activeTab === 'academic' ? `foundation/fee_master/${session}/${state.activeId}` : `foundation/transport_master/${session}`;
        try {
            await database.ref(path).update({ amounts: state.tempAmounts, updatedAt: firebase.database.ServerValue.TIMESTAMP });
            alert("Synced!");
        } finally {
            UI.saveBtn.innerHTML = btnText;
            state.isSyncing = false;
        }
    };

    window.applyToAll = () => {
        const val = document.getElementById('bulkVal').value;
        if (!val) return;
        document.querySelectorAll('#pricingGrid input').forEach(i => i.value = val);
        Object.keys(state.tempAmounts).forEach(k => state.tempAmounts[k] = val);
    };

    window.saveNewHead = async () => {
        const name = document.getElementById('newName').value.trim().toUpperCase();
        if (!name) return;
        await database.ref('foundation/fee_heads').push({ name, rotation: document.getElementById('newRot').value });
        closeModal();
        refreshHeads();
    };

    window.deleteHead = async (id) => {
        if (confirm("Delete this head?")) {
            await database.ref(`foundation/fee_heads/${id}`).remove();
            refreshHeads();
        }
    };

    window.openModal = () => document.getElementById('feeModal').classList.remove('hidden');
    window.closeModal = () => document.getElementById('feeModal').classList.add('hidden');

    await fetchInitialData();
};