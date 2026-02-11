let rollModuleState = { foundation: {}, students: {} };

// CSS to remove number input arrows (Toggle Buttons)
const style = document.createElement('style');
style.innerHTML = `
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { 
        -webkit-appearance: none; 
        margin: 0; 
    }
    input[type=number] { -moz-appearance: textfield; }
`;
document.head.appendChild(style);

async function init_roll_assign() {
    const content = document.getElementById('main-content');
    
    content.innerHTML = `
    <div class="animate-up p-4 md:p-8">
        <div class="flex p-1.5 bg-slate-200/50 rounded-2xl w-fit mb-8 border border-slate-200">
            <button onclick="switchRollTab('bulk')" id="btn-bulk" class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 tab-active shadow-lg bg-indigo-600 text-white">
                <i class="fas fa-users-viewfinder"></i> Bulk Manager
            </button>
            <button onclick="switchRollTab('search')" id="btn-search" class="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 transition-all flex items-center gap-2">
                <i class="fas fa-magnifying-glass"></i> Smart Search
            </button>
        </div>

        <div id="bulk-section" class="block space-y-8">
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase ml-1">Branch</label>
                    <select id="b_select" onchange="syncClassesLocal('b_select','c_select')" class="w-full bg-slate-50 border-none rounded-2xl p-3.5 focus:ring-2 ring-indigo-500 transition-all outline-none text-sm font-semibold"></select>
                </div>
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase ml-1">Class</label>
                    <select id="c_select" onchange="syncSectionsLocal('c_select','s_select')" class="w-full bg-slate-50 border-none rounded-2xl p-3.5 focus:ring-2 ring-indigo-500 transition-all outline-none text-sm font-semibold"><option value="">Select Branch</option></select>
                </div>
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase ml-1">Section</label>
                    <select id="s_select" class="w-full bg-slate-50 border-none rounded-2xl p-3.5 focus:ring-2 ring-indigo-500 transition-all outline-none text-sm font-semibold"><option value="">Select Class</option></select>
                </div>
                <div class="flex items-end">
                    <button onclick="loadBulkList()" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2">
                        <span>Fetch Records</span> <i class="fas fa-arrow-right text-xs"></i>
                    </button>
                </div>
            </div>

            <div class="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
                <div class="p-6 border-b flex flex-wrap justify-between items-center gap-4 bg-slate-50/50">
                    <div class="relative max-w-xs w-full">
                        <i class="fas fa-filter absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input type="text" id="tableFilter" onkeyup="filterRollTable()" placeholder="Quick filter names..." class="w-full pl-11 pr-4 py-3 rounded-2xl border-none bg-white shadow-inner focus:ring-2 ring-indigo-500 outline-none text-sm">
                    </div>
                    <div class="flex gap-3">
                        <button onclick="resetAllRolls()" class="bg-rose-50 text-rose-600 hover:bg-rose-100 px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 border border-rose-100">
                            <i class="fas fa-undo"></i> Reset
                        </button>
                        <button onclick="saveBulkRolls()" id="updateAllBtn" class="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-100">
                            <i class="fas fa-check-double"></i> Save Updates
                        </button>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full" id="studentsTable">
                        <thead>
                            <tr class="text-left text-slate-400 text-[11px] uppercase tracking-widest border-b bg-white">
                                <th class="px-8 py-5">Folio</th>
                                <th class="px-8 py-5">Student Name</th>
                                <th class="px-8 py-5">Father's Name</th>
                                <th class="px-8 py-5 text-indigo-600">Roll No</th>
                            </tr>
                        </thead>
                        <tbody id="bulkBody" class="divide-y divide-slate-100">
                            <tr><td colspan="4" class="py-20 text-center text-slate-400 font-medium italic">Select filters to display students</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div id="search-section" class="hidden space-y-10">
             <div class="max-w-3xl mx-auto">
                <div class="bg-white p-2 rounded-[2.5rem] shadow-2xl border border-slate-200 mb-6">
                    <div class="relative">
                        <input type="text" id="globalSearch" onkeyup="debounceRollSearch(this.value)" placeholder="Search Name, Folio..." class="w-full p-6 pl-16 rounded-[2rem] border-none focus:ring-0 text-xl font-medium">
                        <i class="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-2xl text-indigo-500"></i>
                    </div>
                </div>
                <div id="searchSuggestions" class="grid gap-4 mb-10"></div>
                <div id="editCard" class="hidden bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-up">
                    <div class="bg-slate-900 p-8 text-white relative">
                        <div class="flex justify-between items-start">
                            <div>
                                <span class="bg-indigo-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">Editor</span>
                                <h2 id="e_name" class="text-3xl font-black mt-2">---</h2>
                                <p id="e_id" class="opacity-60 font-mono mt-1"></p>
                            </div>
                            <button onclick="closeRollEditor()" class="h-10 w-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                    <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase">Branch</label>
                            <select id="e_branch" onchange="syncClassesLocal('e_branch','e_class')" class="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 outline-none"></select>
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase">Roll No</label>
                            <input type="number" id="e_roll" class="w-full bg-indigo-50 border-2 border-indigo-100 rounded-2xl p-4 font-black text-indigo-700 outline-none">
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase">Class</label>
                            <select id="e_class" onchange="syncSectionsLocal('e_class','e_section')" class="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 outline-none"></select>
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase">Section</label>
                            <select id="e_section" class="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 outline-none"></select>
                        </div>
                    </div>
                    <div class="p-8 bg-slate-50">
                        <button onclick="updateIndividualRecord()" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl transition-all">Apply Changes</button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    firebase.database().ref().on('value', (snapshot) => {
        const data = snapshot.val() || {};
        rollModuleState.foundation = data.foundation || {};
        rollModuleState.students = data.student || {};
        populateRollDropdowns();
    });
}

window.checkRollConflictOnBlur = async (input) => {
    const val = input.value.trim();
    const currentFid = input.dataset.fid;
    if(!val) return;

    const b = document.getElementById('b_select').value;
    const c = document.getElementById('c_select').value;
    const s = document.getElementById('s_select').value;

    const inputs = document.querySelectorAll('.bulk-roll-input');
    for(let other of inputs) {
        if(other.dataset.fid !== currentFid && other.value.trim() === val) {
            const name = other.closest('tr').cells[1].innerText;
            const res = await Swal.fire({
                title: 'Duplicate Detected',
                text: `Roll ${val} is already used by ${name}. Overwrite?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Overwrite',
                cancelButtonText: 'Cancel'
            });
            if(res.isConfirmed) {
                other.value = '';
            } else {
                input.value = '';
            }
            return;
        }
    }
};

window.loadBulkList = () => {
    const [b, c, s] = ['b_select', 'c_select', 's_select'].map(id => document.getElementById(id).value);
    if(!b || !c || !s) return Swal.fire('Error', 'Selection missing', 'error');

    const body = document.getElementById('bulkBody');
    body.innerHTML = '';
    const filtered = Object.entries(rollModuleState.students)
        .filter(([_, stu]) => stu.academic?.branch === b && stu.academic?.class === c && stu.academic?.section === s)
        .sort((a, b) => (parseInt(a[1].academic?.rollNo) || 999) - (parseInt(b[1].academic?.rollNo) || 999));

    if (filtered.length === 0) {
        body.innerHTML = '<tr><td colspan="4" class="py-20 text-center text-slate-400 font-bold">No Records</td></tr>';
        return;
    }

    filtered.forEach(([id, stu]) => {
        const tr = document.createElement('tr');
        tr.className = "row-item hover:bg-slate-50 border-b";
        tr.innerHTML = `
            <td class="px-8 py-5 font-mono text-xs text-slate-400">${id}</td>
            <td class="px-8 py-5 font-bold text-slate-700">${stu.profile?.studentName}</td>
            <td class="px-8 py-5 text-slate-500 text-sm">${stu.parents?.father?.name || 'N/A'}</td>
            <td class="px-8 py-5">
                <input type="number" 
                       onblur="checkRollConflictOnBlur(this); sortTableLive()"
                       data-fid="${id}" 
                       value="${stu.academic?.rollNo || ''}" 
                       class="bulk-roll-input w-24 p-2 bg-slate-100 border-2 border-transparent rounded-xl text-center focus:bg-white focus:border-indigo-500 outline-none font-black text-indigo-600 transition-all">
            </td>`;
        body.appendChild(tr);
    });
};

window.sortTableLive = () => {
    const body = document.getElementById('bulkBody');
    const rows = Array.from(body.querySelectorAll('tr.row-item'));
    rows.sort((a, b) => {
        const valA = parseInt(a.querySelector('.bulk-roll-input').value) || 9999;
        const valB = parseInt(b.querySelector('.bulk-roll-input').value) || 9999;
        return valA - valB;
    });
    rows.forEach(row => body.appendChild(row));
};

window.saveBulkRolls = async () => {
    const inputs = document.querySelectorAll('.bulk-roll-input');
    const updates = {};
    inputs.forEach(i => updates[`student/${i.dataset.fid}/academic/rollNo`] = i.value.trim());
    try {
        await firebase.database().ref().update(updates);
        Swal.fire('Saved', 'All records updated successfully', 'success');
    } catch (e) { Swal.fire('Error', e.message, 'error'); }
};

window.switchRollTab = (tab) => {
    const isBulk = tab === 'bulk';
    document.getElementById('bulk-section').classList.toggle('hidden', !isBulk);
    document.getElementById('search-section').classList.toggle('hidden', isBulk);
    const active = 'px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 bg-indigo-600 text-white shadow-lg';
    const inactive = 'px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 transition-all flex items-center gap-2';
    document.getElementById('btn-bulk').className = isBulk ? active : inactive;
    document.getElementById('btn-search').className = !isBulk ? active : inactive;
};

window.populateRollDropdowns = () => {
    const classes = rollModuleState.foundation.classes || {};
    const branches = [...new Set(Object.values(classes).map(c => c.branch))].filter(Boolean);
    ['b_select', 'e_branch'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<option value="">Select Branch</option>' + branches.map(b => `<option value="${b}">${b}</option>`).join('');
    });
};

window.syncClassesLocal = (bId, cId) => {
    const branch = document.getElementById(bId).value;
    const cEl = document.getElementById(cId);
    const classes = Object.values(rollModuleState.foundation.classes || {}).filter(c => c.branch === branch);
    cEl.innerHTML = '<option value="">Select Class</option>' + classes.map(c => `<option value="${c.className}" data-sec="${c.sections}">${c.className}</option>`).join('');
};

window.syncSectionsLocal = (cId, sId) => {
    const cEl = document.getElementById(cId);
    const sEl = document.getElementById(sId);
    const secStr = cEl.options[cEl.selectedIndex]?.getAttribute('data-sec') || "";
    sEl.innerHTML = '<option value="">Select Section</option>' + secStr.split(',').filter(s => s.trim()).map(s => `<option value="${s.trim()}">${s.trim()}</option>`).join('');
};

window.filterRollTable = () => {
    const filter = document.getElementById("tableFilter").value.toLowerCase();
    document.querySelectorAll("#bulkBody tr.row-item").forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(filter) ? "" : "none";
    });
};

let rollSearchTimer;
window.debounceRollSearch = (val) => {
    clearTimeout(rollSearchTimer);
    rollSearchTimer = setTimeout(() => {
        const sug = document.getElementById('searchSuggestions');
        sug.innerHTML = '';
        if(val.length < 2) return;
        Object.entries(rollModuleState.students).forEach(([id, stu]) => {
            const name = stu.profile?.studentName?.toLowerCase() || '';
            const father = stu.parents?.father?.name?.toLowerCase() || '';
            if(name.includes(val.toLowerCase()) || id.includes(val.toLowerCase()) || father.includes(val.toLowerCase())) {
                const div = document.createElement('div');
                div.className = "p-4 bg-white border rounded-2xl cursor-pointer hover:border-indigo-500 shadow-sm flex justify-between items-center";
                div.onclick = () => openRollEditor(id);
                div.innerHTML = `<div><p class="font-bold">${stu.profile.studentName}</p><p class="text-xs text-slate-400">F/N: ${stu.parents?.father?.name || 'N/A'}</p></div><span class="font-mono text-xs bg-slate-100 p-2 rounded-lg">${id}</span>`;
                sug.appendChild(div);
            }
        });
    }, 250);
};

window.openRollEditor = (id) => {
    const s = rollModuleState.students[id];
    if(!s) return;
    document.getElementById('editCard').classList.remove('hidden');
    document.getElementById('e_name').innerText = s.profile.studentName;
    document.getElementById('e_id').innerText = id;
    document.getElementById('e_id').dataset.folio = id;
    document.getElementById('e_branch').value = s.academic?.branch || '';
    syncClassesLocal('e_branch', 'e_class');
    document.getElementById('e_class').value = s.academic?.class || '';
    syncSectionsLocal('e_class', 'e_section');
    document.getElementById('e_section').value = s.academic?.section || '';
    document.getElementById('e_roll').value = s.academic?.rollNo || '';
};

window.closeRollEditor = () => {
    document.getElementById('editCard').classList.add('hidden');
    document.getElementById('searchSuggestions').innerHTML = '';
};

window.updateIndividualRecord = async () => {
    const id = document.getElementById('e_id').dataset.folio;
    const updates = {
        [`student/${id}/academic/branch`]: document.getElementById('e_branch').value,
        [`student/${id}/academic/class`]: document.getElementById('e_class').value,
        [`student/${id}/academic/section`]: document.getElementById('e_section').value,
        [`student/${id}/academic/rollNo`]: document.getElementById('e_roll').value.trim()
    };
    await firebase.database().ref().update(updates);
    Swal.fire('Success', 'Profile Updated', 'success');
    closeRollEditor();
};

window.resetAllRolls = () => document.querySelectorAll('.bulk-roll-input').forEach(i => i.value = '');