window.init_staff_list = function(state) {
    const container = document.getElementById('main-content');

    container.innerHTML = `
        <div class="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <div class="flex flex-col lg:flex-row items-center gap-4 bg-white/80 backdrop-blur-xl p-4 rounded-[28px] border border-slate-100 shadow-xl sticky top-4 z-40">
                <div class="flex-1 w-full relative group">
                    <i data-lucide="search" class="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors"></i>
                    <input type="text" id="masterSearch" placeholder="Search" 
                        class="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl text-sm font-semibold outline-none transition-all shadow-inner">
                </div>
                
                <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <select id="filterDesignation" class="flex-1 lg:w-44 px-4 py-4 bg-slate-50 border-none rounded-2xl text-[11px] font-black uppercase text-slate-600 outline-none focus:ring-2 ring-indigo-500/20 cursor-pointer"></select>
                    <select id="filterBranch" class="flex-1 lg:w-44 px-4 py-4 bg-slate-50 border-none rounded-2xl text-[11px] font-black uppercase text-slate-600 outline-none focus:ring-2 ring-indigo-500/20 cursor-pointer"></select>
                    
                    <button onclick="window.init_staff_list()" class="h-[56px] w-[56px] bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center active:scale-90" title="Reset Filters">
                        <i data-lucide="refresh-cw" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>

            <div class="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50/50 border-b border-slate-100">
                                <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee Profile</th>
                                <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Position & Unit</th>
                                <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Personal Details</th>
                                <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody id="staff-table-body" class="divide-y divide-slate-50">
                             <tr><td colspan="4" class="p-20 text-center"><div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div></td></tr>
                        </tbody>
                    </table>
                </div>
                <div id="empty-state" class="hidden flex-col items-center justify-center p-20 text-center">
                    <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4"><i data-lucide="users-round" class="w-10 h-10 text-slate-300"></i></div>
                    <h4 class="text-slate-800 font-bold">No Staff Found</h4>
                    <p class="text-slate-400 text-sm">Refine your search parameters</p>
                </div>
            </div>
        </div>

        <div id="passwordModal" class="fixed inset-0 z-[100] hidden items-center justify-center bg-slate-900/40 backdrop-blur-xl p-4 transition-all">
            <div class="bg-white rounded-[40px] w-full max-w-sm p-8 shadow-2xl scale-95 animate-in zoom-in-95">
                <div class="flex justify-between items-center mb-6">
                    <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><i data-lucide="key-round" class="w-6 h-6"></i></div>
                    <button onclick="closeStaffModal()" class="text-slate-300 hover:text-slate-600"><i data-lucide="x" class="w-6 h-6"></i></button>
                </div>
                <h3 class="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight text-center">Credential Vault</h3>
                <div class="space-y-4">
                    <div class="input-group">
                        <label class="text-[9px] font-black text-slate-400 uppercase ml-2 mb-1 block">Staff Password</label>
                        <input type="text" id="viewPass" readonly class="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-mono font-bold text-indigo-600 outline-none text-center">
                    </div>
                    <div class="input-group relative">
                        <label class="text-[9px] font-black text-slate-400 uppercase ml-2 mb-1 block">New Pin</label>
                        <input type="password" id="newPass" placeholder="••••" class="w-full bg-white border-2 border-slate-100 focus:border-indigo-500 rounded-2xl px-6 py-4 font-bold outline-none text-center transition-all">
                        <button onclick="toggleNewPassVisibility()" class="absolute right-4 top-9 text-slate-400 hover:text-indigo-600">
                            <i id="eye-icon" data-lucide="eye" class="w-4 h-4"></i>
                        </button>
                    </div>
                    <button id="updatePassBtn" class="w-full py-5 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-indigo-600 transition-all mt-4">Save Password</button>
                </div>
            </div>
        </div>
    `;

    lucide.createIcons();
    fetchStaffAndBranches();
};

// Toggle Function for New Password visibility
window.toggleNewPassVisibility = () => {
    const input = document.getElementById('newPass');
    const icon = document.getElementById('eye-icon');
    if (input.type === 'password') {
        input.type = 'text';
        icon.setAttribute('data-lucide', 'eye-off');
    } else {
        input.type = 'password';
        icon.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons();
};

async function fetchStaffAndBranches() {
    const branchSnap = await db.ref('foundation/branches').once('value');
    const branchesData = branchSnap.val() || {};

    db.ref('employees').on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) { renderStaffTable([]); return; }

        const staffList = Object.keys(data).map(id => ({ 
            id, 
            ...data[id],
            branchName: branchesData[data[id].branch]?.name || data[id].branch || 'General'
        }));

        populateFilters(staffList);
        renderStaffTable(staffList);

        const triggerFilter = () => {
            const query = document.getElementById('masterSearch').value.toLowerCase();
            const dFilter = document.getElementById('filterDesignation').value;
            const bFilter = document.getElementById('filterBranch').value;

            const filtered = staffList.filter(s => {
                const searchStr = `${s.name} ${s.phone} ${s.empId}`.toLowerCase();
                return searchStr.includes(query) && 
                       (!dFilter || s.designation === dFilter) && 
                       (!bFilter || s.branchName === bFilter);
            });
            renderStaffTable(filtered);
        };

        document.getElementById('masterSearch').oninput = triggerFilter;
        document.getElementById('filterDesignation').onchange = triggerFilter;
        document.getElementById('filterBranch').onchange = triggerFilter;
    });
}

function populateFilters(staff) {
    const desigs = [...new Set(staff.map(s => s.designation))].filter(Boolean);
    const branches = [...new Set(staff.map(s => s.branchName))].filter(Boolean);
    const dSelect = document.getElementById('filterDesignation');
    const bSelect = document.getElementById('filterBranch');
    if(!dSelect.innerHTML) dSelect.innerHTML = '<option value="">Designation</option>' + desigs.map(d => `<option value="${d}">${d}</option>`).join('');
    if(!bSelect.innerHTML) bSelect.innerHTML = '<option value="">Branch</option>' + branches.map(b => `<option value="${b}">${b}</option>`).join('');
}

function renderStaffTable(data) {
    const tbody = document.getElementById('staff-table-body');
    const emptyState = document.getElementById('empty-state');
    tbody.innerHTML = '';

    if (data.length === 0) { emptyState.classList.remove('hidden'); return; }
    emptyState.classList.add('hidden');

    data.forEach(s => {
        const isActive = s.status !== 'disabled';
        const row = document.createElement('tr');
        row.className = `group hover:bg-slate-50 transition-all ${!isActive ? 'bg-slate-50/50' : ''}`;
        row.innerHTML = `
            <td class="px-8 py-6">
                <div class="flex items-center gap-4">
                    <div class="relative">
                        <div class="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg">
                            ${s.name.charAt(0)}
                        </div>
                        <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}"></div>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-0.5">
                            <span class="text-[9px] font-black text-indigo-500 uppercase tracking-tighter">${s.empId}</span>
                            <span class="text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}">
                                ${isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div class="font-extrabold text-slate-800 text-sm leading-tight">${s.name}</div>
                        <div class="text-[11px] text-slate-400 font-bold tracking-tight">${s.phone}</div>
                    </div>
                </div>
            </td>
            <td class="px-8 py-6">
                <div class="font-bold text-slate-700 text-xs mb-1">${s.designation}</div>
                <div class="flex items-center gap-1.5 text-[10px] text-slate-400 font-black uppercase tracking-wide">
                    <i data-lucide="map-pin" class="w-3 h-3 text-indigo-400"></i> ${s.branchName}
                </div>
            </td>
            <td class="px-8 py-6">
                <div class="space-y-1">
                    <div class="text-[11px] text-slate-600 font-bold flex items-center gap-2">
                        <span class="w-14 text-slate-300 text-[9px] uppercase">Aadhaar:</span> 
                        <span class="font-mono tracking-wider">${s.aadhaar || 'N/A'}</span>
                    </div>
                    <div class="text-[11px] text-slate-600 font-bold flex items-center gap-2">
                        <span class="w-14 text-slate-300 text-[9px] uppercase">DOB:</span> 
                        <span>${s.dob || '--'}</span>
                        <span class="px-1.5 py-0.5 rounded bg-rose-50 text-rose-500 text-[8px] font-black">${s.bloodGroup || 'O+'}</span>
                    </div>
                </div>
            </td>
            <td class="px-8 py-6 text-right">
                <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button onclick="RosterMgt.open('${s.id}')" class="w-10 h-10 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 flex items-center justify-center transition-all hover:scale-110 active:scale-95">
                        <i data-lucide="calendar-check" class="w-4 h-4"></i>
                    </button>
                    <button onclick="openStaffPass('${s.id}', '${s.password}')" class="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-all">
                        <i data-lucide="fingerprint" class="w-4 h-4"></i>
                    </button>
                    <button onclick="toggleStaffStatus('${s.id}', '${s.status}')" class="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-amber-500 flex items-center justify-center transition-all">
                        <i data-lucide="power" class="w-4 h-4"></i>
                    </button>
                    <button onclick="deleteStaffMember('${s.id}')" class="w-10 h-10 rounded-xl bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    lucide.createIcons();
}

window.openStaffPass = (id, enc) => {
    try { document.getElementById('viewPass').value = atob(enc); } catch(e) { document.getElementById('viewPass').value = enc; }
    document.getElementById('passwordModal').classList.replace('hidden', 'flex');
    document.getElementById('updatePassBtn').onclick = () => {
        const newVal = document.getElementById('newPass').value;
        if(newVal) db.ref(`employees/${id}`).update({ password: btoa(newVal) }).then(() => { 
            Swal.fire('Updated', 'Staff password changed', 'success'); 
            closeStaffModal(); 
        });
    };
};

window.closeStaffModal = () => {
    document.getElementById('passwordModal').classList.replace('flex', 'hidden');
    document.getElementById('newPass').value = '';
    document.getElementById('newPass').type = 'password';
};
window.toggleStaffStatus = (id, current) => {
    db.ref(`employees/${id}`).update({ status: current === 'active' ? 'disabled' : 'active' });
};
window.deleteStaffMember = (id) => {
    Swal.fire({ title: 'Delete Permanent?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Confirm' })
    .then((r) => { if(r.isConfirmed) db.ref(`employees/${id}`).remove(); });
};