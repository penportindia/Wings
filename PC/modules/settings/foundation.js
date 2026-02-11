window.init_foundation = function(state) {
    const mainContent = document.getElementById('main-content');
    let activeTab = 'sessions';
    let activeColor = '#6366f1';

    mainContent.innerHTML = `
        <style>
            .tab-btn.active { background: var(--tab-color); color: white !important; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
            .vibrant-input { border: 2px solid #f1f5f9; transition: all 0.3s; background: #f8fafc; }
            .vibrant-input:focus { border-color: var(--tab-color); outline: none; background: white; ring: 4px solid rgba(0,0,0,0.05); }
            .branch-divider { border-left: 4px solid var(--tab-color); }
            
            .session-badge {
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                border-left: 4px solid #10b981;
            }
        </style>

        <div class="max-w-7xl mx-auto">
            <div class="flex flex-col lg:flex-row gap-4 mb-10 items-stretch">
                <nav id="nav-bar" class="flex-grow flex flex-wrap gap-2 bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
                    <button onclick="switchTab('sessions', '#6366f1')" id="btn-sessions" class="tab-btn active px-6 py-3 rounded-2xl font-bold text-sm text-slate-500 transition-all">Sessions</button>
                    <button onclick="switchTab('branches', '#10b981')" id="btn-branches" class="tab-btn px-6 py-3 rounded-2xl font-bold text-sm text-slate-500 transition-all">Branches</button>
                    <button onclick="switchTab('classes', '#3b82f6')" id="btn-classes" class="tab-btn px-6 py-3 rounded-2xl font-bold text-sm text-slate-500 transition-all">Classes</button>
                    <button onclick="switchTab('categories', '#f59e0b')" id="btn-categories" class="tab-btn px-6 py-3 rounded-2xl font-bold text-sm text-slate-500 transition-all">Categories</button>
                    <button onclick="switchTab('admission', '#ec4899')" id="btn-admission" class="tab-btn px-6 py-3 rounded-2xl font-bold text-sm text-slate-500 transition-all">Admission</button>
                    <button onclick="switchTab('transport', '#f43f5e')" id="btn-transport" class="tab-btn px-6 py-3 rounded-2xl font-bold text-sm text-slate-500 transition-all">Transport</button>
                    <button onclick="switchTab('eblock', '#8b5cf6')" id="btn-eblock" class="tab-btn px-6 py-3 rounded-2xl font-bold text-sm text-slate-500 transition-all">E-Block</button>
                    <button onclick="switchTab('ublock', '#06b6d4')" id="btn-ublock" class="tab-btn px-6 py-3 rounded-2xl font-bold text-sm text-slate-500 transition-all">U-Block</button>
                </nav>

                <div class="session-badge min-w-[180px] px-6 py-2 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Current Session</span>
                    <div class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span id="active-session-display" class="text-lg font-black text-slate-800 leading-none">---</span>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div class="lg:col-span-4">
                    <div id="form-card" class="bg-white p-8 rounded-[2.5rem] shadow-xl border-t-[12px] sticky top-8 transition-all border-indigo-500">
                        <div class="flex justify-between items-center mb-6">
                            <h2 id="form-title" class="text-2xl font-black text-slate-800">Add Session</h2>
                            <button id="btn-cancel" onclick="resetFoundationForm()" class="hidden text-[10px] font-black text-red-500 uppercase border border-red-100 px-3 py-1 rounded-full">Cancel</button>
                        </div>
                        
                        <div class="space-y-5">
                            <input type="hidden" id="edit-id">
                            <div>
                                <label id="input-label" class="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block">Starting Year</label>
                                <input type="text" id="main-input" class="vibrant-input w-full p-4 rounded-2xl font-bold text-lg text-slate-700" placeholder="...">
                            </div>

                            <div id="class-only-fields" class="hidden space-y-5">
                                <div>
                                    <label class="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block">Link to Branch</label>
                                    <select id="branch-select" class="vibrant-input w-full p-4 rounded-2xl font-bold bg-slate-50 text-slate-700"></select>
                                </div>
                                <div>
                                    <label class="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block">Sections (A, B, C)</label>
                                    <input type="text" id="section-input" class="vibrant-input w-full p-4 rounded-2xl font-bold" placeholder="e.g. A,B,C">
                                </div>
                            </div>

                            <div id="transport-only-fields" class="hidden space-y-5">
                                <div>
                                    <label class="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block">Distance Range</label>
                                    <input type="text" id="distance-input" class="vibrant-input w-full p-4 rounded-2xl font-bold" placeholder="e.g. 0-5 KM">
                                </div>
                            </div>

                            <button onclick="handleFoundationSubmit()" id="btn-submit" class="w-full text-white p-5 rounded-2xl font-black shadow-lg uppercase tracking-widest transition-all hover:opacity-90 active:scale-95 bg-indigo-500">
                                Save Entry
                            </button>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-8">
                    <div id="foundation-loader" class="text-center py-20 hidden">
                        <div class="w-10 h-10 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                    </div>
                    <div id="foundation-data-list" class="space-y-8"></div>
                </div>
            </div>
        </div>
    `;

    window.switchTab = (tab, color) => {
        activeTab = tab;
        activeColor = color;
        document.documentElement.style.setProperty('--tab-color', color);
        
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(`btn-${tab}`).classList.add('active');
        
        const meta = {
            'sessions': { t: 'Add Session', l: 'Starting Year' },
            'branches': { t: 'Add Branch', l: 'Branch Name' },
            'classes': { t: 'Class Setup', l: 'Class Name' },
            'categories': { t: 'Add Category', l: 'Category Name' },
            'admission': { t: 'Admission Type', l: 'Type Name' },
            'transport': { t: 'Transport Group', l: 'Group Name' },
            'eblock': { t: 'E-Block Setup', l: 'Block Name' },
            'ublock': { t: 'U-Block Setup', l: 'Block Name' }
        };

        document.getElementById('form-card').style.borderColor = color;
        document.getElementById('form-title').innerText = meta[tab].t;
        document.getElementById('input-label').innerText = meta[tab].l;
        document.getElementById('btn-submit').style.backgroundColor = color;
        
        document.getElementById('class-only-fields').classList.toggle('hidden', tab !== 'classes');
        document.getElementById('transport-only-fields').classList.toggle('hidden', tab !== 'transport');
        
        resetFoundationForm(false);
        fetchFoundationData();
    };

    window.handleFoundationSubmit = async () => {
        const mainVal = document.getElementById('main-input').value.trim();
        const editId = document.getElementById('edit-id').value;
        if(!mainVal) return Swal.fire('Error', 'Input required', 'error');

        let data = { name: mainVal };

        if(activeTab === 'sessions') {
            if(!mainVal.includes('-')) data.name = `${mainVal}-${(parseInt(mainVal)+1).toString().slice(-2)}`;
        } else if(activeTab === 'classes') {
            const br = document.getElementById('branch-select').value;
            const sc = document.getElementById('section-input').value.trim();
            if(!br || !sc) return Swal.fire('Error', 'All fields required', 'warning');
            data = { className: mainVal.toUpperCase(), branch: br, sections: sc.toUpperCase() };
        } else if(activeTab === 'transport') {
            const dist = document.getElementById('distance-input').value.trim();
            data = { groupName: mainVal.toUpperCase(), distance: dist.toUpperCase() };
        }

        try {
            if(editId) {
                await db.ref(`foundation/${activeTab}/${editId}`).update(data);
            } else {
                await db.ref(`foundation/${activeTab}`).push(data);
            }
            resetFoundationForm();
        } catch (e) {
            Swal.fire('Error', e.message, 'error');
        }
    };

    const fetchFoundationData = () => {
        const listDiv = document.getElementById('foundation-data-list');
        document.getElementById('foundation-loader').classList.remove('hidden');
        
        db.ref(`foundation/${activeTab}`).on('value', (snap) => {
            document.getElementById('foundation-loader').classList.add('hidden');
            listDiv.innerHTML = "";
            
            if(!snap.exists()) {
                listDiv.innerHTML = `<div class="text-center py-10 text-slate-300 font-bold">No records found</div>`;
                return;
            }

            if(activeTab === 'classes') {
                const groups = {};
                snap.forEach(child => {
                    const d = child.val();
                    if(!groups[d.branch]) groups[d.branch] = [];
                    groups[d.branch].push({id: child.key, ...d});
                });

                for(const bName in groups) {
                    let bHtml = `<div class="mb-8"><div class="branch-divider pl-4 mb-4"><h3 class="text-xl font-black text-slate-800 uppercase">${bName}</h3></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">`;
                    groups[bName].forEach(item => { bHtml += createCard(item.id, item.className, item.sections, item); });
                    bHtml += `</div></div>`;
                    listDiv.innerHTML += bHtml;
                }
            } else {
                let grid = `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">`;
                snap.forEach(child => {
                    const d = child.val();
                    let title = d.name, sub = activeTab;
                    if(activeTab === 'transport') { title = d.groupName; sub = `Distance: ${d.distance}`; }
                    grid += createCard(child.key, title, sub, d);
                });
                grid += `</div>`;
                listDiv.innerHTML = grid;
            }
        });
    };

    function createCard(id, title, sub, fullData) {
        const dataStr = btoa(JSON.stringify(fullData)); 
        return `
            <div class="bg-white p-5 rounded-3xl border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md transition-all">
                <div>
                    <div class="text-lg font-black text-slate-800">${title}</div>
                    <div class="text-[10px] font-bold uppercase text-slate-300">${sub}</div>
                </div>
                <div class="flex gap-2">
                    <button onclick="triggerEdit('${id}', '${dataStr}')" class="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center"><i class="fas fa-pen text-xs"></i></button>
                    <button onclick="handleDelete('${id}')" class="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"><i class="fas fa-trash text-xs"></i></button>
                </div>
            </div>`;
    }

    window.triggerEdit = (id, encodedData) => {
        const data = JSON.parse(atob(encodedData));
        document.getElementById('edit-id').value = id;
        document.getElementById('form-title').innerText = "Update Entry";
        document.getElementById('btn-submit').innerText = "Update Now";
        document.getElementById('btn-cancel').classList.remove('hidden');

        if(activeTab === 'classes') {
            document.getElementById('main-input').value = data.className;
            document.getElementById('branch-select').value = data.branch;
            document.getElementById('section-input').value = data.sections;
        } else if(activeTab === 'transport') {
            document.getElementById('main-input').value = data.groupName;
            document.getElementById('distance-input').value = data.distance;
        } else {
            document.getElementById('main-input').value = data.name;
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.handleDelete = (id) => {
        Swal.fire({
            title: 'Delete record?',
            text: "This action cannot be undone",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete'
        }).then((result) => {
            if (result.isConfirmed) db.ref(`foundation/${activeTab}/${id}`).remove();
        });
    };

    window.resetFoundationForm = (shouldSwitch = true) => {
        document.getElementById('edit-id').value = '';
        document.getElementById('main-input').value = '';
        document.getElementById('section-input').value = '';
        document.getElementById('distance-input').value = '';
        document.getElementById('btn-submit').innerText = "Save Entry";
        document.getElementById('btn-cancel').classList.add('hidden');
        if(shouldSwitch) switchTab(activeTab, activeColor);
    };

    const today = new Date();
    document.getElementById('active-session-display').innerText = today.getMonth() >= 3 ? `${today.getFullYear()}-${(today.getFullYear()+1).toString().slice(-2)}` : `${today.getFullYear()-1}-${today.getFullYear().toString().slice(-2)}`;

    db.ref('foundation/branches').on('value', (snap) => {
        const select = document.getElementById('branch-select');
        if(!select) return;
        select.innerHTML = '<option value="" disabled selected>Select Branch</option>';
        snap.forEach(child => { select.innerHTML += `<option value="${child.val().name}">${child.val().name}</option>`; });
    });

    switchTab('sessions', '#6366f1');
};