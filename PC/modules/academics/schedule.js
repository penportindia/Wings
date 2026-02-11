let scheduleState = { branches: {}, classes: {}, employees: {}, subjects: {}, fullSchedules: {} };

async function init_class_schedule() {
    const container = document.getElementById('main-content');
    await loadSyncData();

    container.innerHTML = `
    <div class="min-h-screen bg-[#f8fafc] p-4 lg:p-10 font-sans selection:bg-indigo-100">
        <div class="max-w-[1600px] mx-auto space-y-8">
            
            <header class="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white shadow-sm">
                <div class="flex items-center gap-5">
                    <div class="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <i data-lucide="calendar-range" class="w-7 h-7"></i>
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-3 p-2 bg-slate-100/50 rounded-3xl border border-slate-100">
                    <div class="flex items-center gap-2 px-4 border-r border-slate-200">
                        <select id="sch-mode" class="bg-transparent py-2 text-[11px] font-black text-slate-600 outline-none uppercase cursor-pointer appearance-none">
                            <option value="EDIT">Editor Mode</option>
                            <option value="BRANCH">Branch Analysis</option>
                            <option value="TEACHER">Teacher View</option>
                        </select>
                    </div>

                    <div class="flex items-center gap-2 px-4 border-r border-slate-200">
                        <select id="sch-branch" class="bg-transparent py-2 text-[11px] font-black text-slate-600 outline-none min-w-[140px] cursor-pointer appearance-none">
                            <option value="">Select Branch</option>
                            ${Object.entries(scheduleState.branches).map(([id, b]) => `<option value="${b.name}" data-id="${id}">${b.name}</option>`).join('')}
                        </select>
                    </div>

                    <div id="dynamic-filters" class="flex items-center gap-3 px-2">
                        <select id="sch-class" class="bg-white px-5 py-2.5 rounded-2xl text-[11px] font-black text-slate-700 shadow-sm border border-slate-100 outline-none min-w-[130px] transition-all focus:ring-2 ring-indigo-500/20"><option value="">Class</option></select>
                        <select id="sch-section" class="bg-white px-5 py-2.5 rounded-2xl text-[11px] font-black text-slate-700 shadow-sm border border-slate-100 outline-none min-w-[100px] transition-all focus:ring-2 ring-indigo-500/20"><option value="">Section</option></select>
                    </div>

                    <button id="main-action-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-black text-[11px] transition-all shadow-md active:scale-95 uppercase tracking-wider">
                        Generate
                    </button>
                </div>
            </header>

            <main id="grid-view" class="hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div class="overflow-x-auto pb-10">
                    <table class="w-full border-separate border-spacing-x-4 border-spacing-y-0">
                        <thead id="grid-thead"></thead>
                        <tbody id="period-rows-container"></tbody>
                    </table>
                </div>
            </main>

            <footer id="grid-footer" class="hidden fixed bottom-8 left-1/2 -translate-x-1/2 w-fit bg-slate-900/90 backdrop-blur-2xl px-8 py-4 rounded-[3rem] shadow-2xl flex items-center gap-8 border border-white/10 z-50">
                <div class="flex gap-4">
                    <button class="add-lecture-btn flex items-center gap-2 text-white hover:text-indigo-400 transition-colors text-[10px] font-black uppercase tracking-widest">
                        <i data-lucide="plus-circle" class="w-4 h-4 text-indigo-400"></i> Lecture
                    </button>
                    <div class="w-[1px] h-4 bg-white/10"></div>
                    <button class="add-break-btn flex items-center gap-2 text-white hover:text-amber-400 transition-colors text-[10px] font-black uppercase tracking-widest">
                        <i data-lucide="coffee" class="w-4 h-4 text-amber-400"></i> Break
                    </button>
                </div>
                <button class="save-schedule-btn bg-indigo-500 hover:bg-indigo-400 text-white px-10 py-3 rounded-full font-black text-xs transition-all shadow-xl shadow-indigo-500/20 active:scale-95 uppercase tracking-[0.2em]">
                    Sync Database
                </button>
            </footer>
        </div>
    </div>
    `;
    
    setupEventListeners();
    lucide.createIcons();
}

async function loadSyncData() {
    const [fSnap, eSnap, sSnap] = await Promise.all([
        db.ref('foundation').once('value'),
        db.ref('employees').once('value'),
        db.ref('schedules').once('value')
    ]);
    const f = fSnap.val() || {};
    scheduleState.branches = f.branches || {};
    scheduleState.classes = f.classes || {};
    scheduleState.subjects = f.subjects || {};
    scheduleState.employees = eSnap.val() || {};
    scheduleState.fullSchedules = sSnap.val() || {};
}

function setupEventListeners() {
    document.removeEventListener('click', handleGlobalClicks);
    document.getElementById('sch-mode')?.addEventListener('change', switchViewMode);
    
    document.getElementById('sch-branch')?.addEventListener('change', () => {
        const mode = document.getElementById('sch-mode').value;
        if(mode === 'EDIT' || mode === 'BRANCH') {
            syncClasses();
            syncSections(); // Immediate trigger for live sync
        }
    });

    document.getElementById('sch-class')?.addEventListener('change', syncSections);
    document.getElementById('main-action-btn')?.addEventListener('click', () => {
        const mode = document.getElementById('sch-mode').value;
        if(mode === 'EDIT') renderGrid();
        else if(mode === 'BRANCH') renderBranchView();
        else if(mode === 'TEACHER') renderTeacherView();
    });

    document.addEventListener('click', handleGlobalClicks);
    document.addEventListener('change', e => {
        if (e.target.classList.contains('p-name')) refreshSuggestions(e.target);
        if (e.target.classList.contains('s-val')) updateBooks(e.target);
        if (e.target.classList.contains('t-val')) validateTeacher(e.target);
    });
}

function handleGlobalClicks(e) {
    if (e.target.closest('.add-lecture-btn')) addRow('ACADEMIC');
    if (e.target.closest('.add-break-btn')) addRow('EVENT');
    if (e.target.closest('.save-schedule-btn')) saveToFirebase();
    if (e.target.closest('.bulk-assign-btn')) bulkAssign(e.target.closest('.bulk-assign-btn'));
    if (e.target.closest('[data-action="delete-row"]')) e.target.closest('tr').remove();
}

function syncClasses() {
    const bName = document.getElementById('sch-branch').value;
    const classSelect = document.getElementById('sch-class');
    if (!classSelect) return;
    let html = '<option value="">Select Class</option>';
    Object.entries(scheduleState.classes).forEach(([id, c]) => {
        if (c.branch === bName) html += `<option value="${id}">${c.className}</option>`;
    });
    classSelect.innerHTML = html;
}

function syncSections() {
    const cId = document.getElementById('sch-class').value;
    const secSelect = document.getElementById('sch-section');
    if (!secSelect) return;
    const cData = scheduleState.classes[cId];
    let html = '<option value="">Section</option>';
    if (cData?.sections) {
        cData.sections.split(',').forEach(s => {
            const sec = s.trim();
            html += `<option value="${sec}">${sec}</option>`;
        });
    }
    secSelect.innerHTML = html;
}

function switchViewMode() {
    const mode = document.getElementById('sch-mode').value;
    const filters = document.getElementById('dynamic-filters');
    const btn = document.getElementById('main-action-btn');
    document.getElementById('grid-view').classList.add('hidden');
    document.getElementById('grid-footer').classList.add('hidden');

    if (mode === 'EDIT') {
        filters.innerHTML = `
            <select id="sch-class" class="bg-white px-5 py-2.5 rounded-2xl text-[11px] font-black text-slate-700 shadow-sm border border-slate-100 outline-none min-w-[130px] transition-all focus:ring-2 ring-indigo-500/20"><option value="">Class</option></select>
            <select id="sch-section" class="bg-white px-5 py-2.5 rounded-2xl text-[11px] font-black text-slate-700 shadow-sm border border-slate-100 outline-none min-w-[100px] transition-all focus:ring-2 ring-indigo-500/20"><option value="">Section</option></select>`;
        btn.textContent = 'OPEN EDITOR';
        syncClasses();
    } else if (mode === 'BRANCH') {
        filters.innerHTML = `<select id="sch-day" class="bg-white px-5 py-2.5 rounded-2xl text-[11px] font-black text-indigo-600 shadow-sm border border-slate-100 outline-none min-w-[150px]">${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => `<option value="${d}">${d.toUpperCase()}</option>`).join('')}</select>`;
        btn.textContent = 'ANALYZE';
    } else if (mode === 'TEACHER') {
        const teachers = Object.entries(scheduleState.employees).map(([id, e]) => `<option value="${id}">${e.name}</option>`).join('');
        filters.innerHTML = `
            <select id="sch-teacher" class="bg-white px-5 py-2.5 rounded-2xl text-[11px] font-black text-slate-700 shadow-sm border border-slate-100 outline-none min-w-[150px]"><option value="">Teacher</option>${teachers}</select>
            <select id="sch-day" class="bg-white px-5 py-2.5 rounded-2xl text-[11px] font-black text-slate-700 shadow-sm border border-slate-100 outline-none">${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => `<option value="${d}">${d}</option>`).join('')}</select>`;
        btn.textContent = 'VIEW';
    }
    lucide.createIcons();
}

async function renderGrid() {
    const cId = document.getElementById('sch-class').value;
    const sec = document.getElementById('sch-section').value;
    if (!cId || !sec) return;

    await loadSyncData();
    const data = scheduleState.fullSchedules[cId]?.[sec] || { periods: [] };
    
    document.getElementById('grid-thead').innerHTML = `
        <tr class="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
            <th class="py-10 text-left pl-8 w-64">Sequence & Period</th>
            ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => `<th class="py-10 text-center">${day}</th>`).join('')}
        </tr>`;
    
    const container = document.getElementById('period-rows-container');
    container.innerHTML = '';
    
    if (data.periods?.length > 0) {
        data.periods.forEach(p => addRow(p.type || 'ACADEMIC', p));
    } else {
        addRow('ACADEMIC');
    }

    document.getElementById('grid-view').classList.remove('hidden');
    document.getElementById('grid-footer').classList.remove('hidden');
    lucide.createIcons();
}

function addRow(type = 'ACADEMIC', data = null) {
    const container = document.getElementById('period-rows-container');
    const cId = document.getElementById('sch-class').value;
    const cName = scheduleState.classes[cId]?.className || "";
    const bId = document.getElementById('sch-branch').selectedOptions[0]?.getAttribute('data-id');
    
    const subs = scheduleState.subjects[cName] || {};
    const teas = Object.entries(scheduleState.employees)
        .filter(([id, emp]) => emp.status === 'active' && (emp.branch === 'All' || emp.branch === bId))
        .map(([id, emp]) => ({ id, name: emp.name }));

    const tr = document.createElement('tr');
    tr.className = "group border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-all";
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    let html = `
    <td class="py-6 pl-2">
        <div class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-3 transition-all group-hover:border-indigo-200 group-hover:shadow-md">
            <input type="text" class="p-name bg-transparent font-black text-xs text-indigo-600 outline-none uppercase placeholder:text-slate-300" placeholder="e.g. 09:00 AM" value="${data?.pName || ''}">
            <input type="hidden" class="p-type" value="${type}">
            <div class="flex items-center gap-4 border-t border-slate-50 pt-2">
                <button data-action="delete-row" class="text-slate-300 hover:text-rose-500 transition-colors"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
                <button class="bulk-assign-btn text-slate-300 hover:text-indigo-500 transition-colors"><i data-lucide="layers-3" class="w-3.5 h-3.5"></i></button>
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-tighter">${type}</span>
            </div>
        </div>
    </td>`;

    days.forEach(day => {
        const cell = data?.[day] || {};
        if (type === 'EVENT') {
            html += `
            <td class="p-2" data-day="${day}">
                <input type="text" placeholder="EVENT NAME" 
                    class="e-val w-full h-32 text-center bg-amber-50/30 border-2 border-dashed border-amber-200/50 rounded-3xl text-[10px] font-black text-amber-600 outline-none uppercase focus:bg-amber-50 focus:border-amber-300 transition-all" 
                    value="${cell.eventName || ''}">
            </td>`;
        } else {
            const currentSub = subs[cell.subjectId] || null;
            html += `
            <td class="p-2" data-day="${day}">
                <div class="bg-white border border-slate-100 rounded-[2rem] p-4 shadow-sm group-hover:shadow-md transition-all flex flex-col gap-2 min-w-[160px]">
                    <select class="s-val w-full text-[11px] font-black text-slate-800 outline-none bg-transparent">
                        <option value="">Subject</option>
                        ${Object.entries(subs).map(([id, s]) => `<option value="${id}" ${cell.subjectId === id ? 'selected' : ''}>${s.name}</option>`).join('')}
                    </select>
                    <select class="b-val w-full text-[9px] font-bold text-slate-400 bg-transparent outline-none">
                        <option value="">Resource</option>
                        <option value="TEST" ${cell.bookTitle === 'TEST' ? 'selected' : ''}>TEST</option>
                        <option value="NOTEBOOK" ${cell.bookTitle === 'NOTEBOOK' ? 'selected' : ''}>NOTEBOOK</option>
                        ${currentSub?.books?.map(b => `<option value="${b.title}" ${cell.bookTitle === b.title ? 'selected' : ''}>${b.title}</option>`).join('') || ''}
                    </select>
                    <div class="h-[1px] bg-slate-50 my-1"></div>
                    <div class="relative">
                        <div class="sugg-box text-[8px] font-bold text-emerald-500 mb-0.5 opacity-60">Status...</div>
                        <select class="t-val w-full text-[10px] font-black text-indigo-500 bg-transparent outline-none" data-day="${day}">
                            <option value="">Instructor</option>
                            ${teas.map(t => `<option value="${t.id}" ${cell.teacherId === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </td>`;
        }
    });

    tr.innerHTML = html;
    container.appendChild(tr);
    lucide.createIcons();
    setTimeout(() => updateAllSuggestions(tr), 100);
}

function updateBooks(el) {
    const subId = el.value;
    const cId = document.getElementById('sch-class').value;
    const cName = scheduleState.classes[cId]?.className || "";
    const bookSelect = el.parentElement.querySelector('.b-val');
    const subData = (scheduleState.subjects[cName] || {})[subId];
    
    let html = '<option value="">Resource</option><option value="TEST">TEST</option><option value="NOTEBOOK">NOTEBOOK</option>';
    if (subData?.books) {
        subData.books.forEach(b => {
            html += `<option value="${b.title}">${b.title}</option>`;
        });
    }
    bookSelect.innerHTML = html;
}

async function bulkAssign(btn) {
    const row = btn.closest('tr');
    const type = row.querySelector('.p-type').value;
    const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const { value: formValues } = await Swal.fire({
        title: 'Auto-Sync Tool',
        html: `
            <div class="text-left p-4 space-y-4">
                <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase">Master Source Day</label>
                    <select id="src-day" class="w-full mt-2 p-3 rounded-2xl bg-slate-100 border-none text-sm font-bold outline-none">
                        ${allDays.map(d => `<option value="${d}">${d}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase">Target Days</label>
                    <div class="grid grid-cols-2 gap-2 mt-2">
                        ${allDays.map(d => `
                            <label class="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl cursor-pointer hover:bg-white border border-transparent hover:border-indigo-100 transition-all has-[:checked]:bg-indigo-50">
                                <input type="checkbox" name="target-day" value="${d}" class="w-4 h-4 accent-indigo-600 rounded-lg">
                                <span class="text-[11px] font-black text-slate-600">${d}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>`,
        showCancelButton: true,
        confirmButtonText: 'Replicate Schedule',
        customClass: { popup: 'rounded-[3rem]' }
    });

    if (!formValues) return;
    const src = document.getElementById('src-day').value;
    const targets = Array.from(document.querySelectorAll('input[name="target-day"]:checked')).map(el => el.value);

    targets.forEach(day => {
        if (day === src) return;
        if (type === 'EVENT') {
            row.querySelector(`[data-day="${day}"] .e-val`).value = row.querySelector(`[data-day="${src}"] .e-val`).value;
        } else {
            const s = row.querySelector(`[data-day="${src}"] .s-val`).value;
            const b = row.querySelector(`[data-day="${src}"] .b-val`).value;
            const t = row.querySelector(`[data-day="${src}"] .t-val`).value;
            
            const sSelect = row.querySelector(`[data-day="${day}"] .s-val`);
            const bSelect = row.querySelector(`[data-day="${day}"] .b-val`);
            const tSelect = row.querySelector(`[data-day="${day}"] .t-val`);
            
            if(sSelect && bSelect && tSelect) {
                sSelect.value = s;
                updateBooks(sSelect);
                bSelect.value = b;
                tSelect.value = t;
            }
        }
    });
    updateAllSuggestions(row);
}

function updateAllSuggestions(row) {
    const pName = row.querySelector('.p-name').value;
    if (!pName) return;
    row.querySelectorAll('.t-val').forEach(select => {
        const day = select.getAttribute('data-day');
        const suggBox = select.parentElement.querySelector('.sugg-box');
        let busy = 0;
        Object.values(scheduleState.fullSchedules).forEach(secs => {
            Object.values(secs).forEach(data => {
                data.periods?.forEach(p => { 
                    if (p.pName === pName && p[day]?.teacherId) busy++; 
                });
            });
        });
        const total = Object.keys(scheduleState.employees).length;
        suggBox.textContent = `${total - busy} Experts Free`;
    });
}

function refreshSuggestions(input) { updateAllSuggestions(input.closest('tr')); }

async function validateTeacher(select) {
    const tId = select.value;
    if (!tId) return;
    const day = select.getAttribute('data-day');
    const pName = select.closest('tr').querySelector('.p-name').value;
    let conflict = null;
    
    Object.entries(scheduleState.fullSchedules).forEach(([cId, secs]) => {
        Object.entries(secs).forEach(([sec, data]) => {
            data.periods?.forEach((p, idx) => {
                if (p.pName === pName && p[day]?.teacherId === tId) {
                    conflict = { cId, sec, periodIdx: idx, day };
                }
            });
        });
    });

    if (conflict) {
        const res = await Swal.fire({
            title: 'Conflict Alert',
            text: `${scheduleState.employees[tId].name} is already busy. Overwrite?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes'
        });
        if (res.isConfirmed) {
            await db.ref(`schedules/${conflict.cId}/${conflict.sec}/periods/${conflict.periodIdx}/${conflict.day}/teacherId`).set("");
            await loadSyncData();
            renderGrid(); // Live update
        } else {
            select.value = "";
        }
    }
}

async function renderBranchView() {
    const bName = document.getElementById('sch-branch').value;
    const day = document.getElementById('sch-day').value;
    if (!bName) return;

    document.getElementById('grid-thead').innerHTML = `<tr class="text-slate-400 text-[10px] font-black uppercase tracking-widest"><th class="py-8 pl-8 text-left">Class Identity</th><th class="py-8 text-left">Timeline</th></tr>`;
    const container = document.getElementById('period-rows-container');
    container.innerHTML = '';

    Object.entries(scheduleState.classes).forEach(([cId, c]) => {
        if (c.branch === bName) {
            c.sections.split(',').forEach(s => {
                const sec = s.trim();
                const periods = (scheduleState.fullSchedules[cId]?.[sec]?.periods || []);
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="py-6 pl-2 w-64">
                        <div class="bg-slate-900 p-6 rounded-[2.5rem] text-white">
                            <p class="text-xl font-black">${c.className}</p>
                            <p class="text-indigo-400 font-bold text-[10px] uppercase">Section ${sec}</p>
                        </div>
                    </td>
                    <td class="py-6 pr-2">
                        <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            ${periods.map(p => {
                                const cell = p[day] || {};
                                const sub = scheduleState.subjects[c.className]?.[cell.subjectId];
                                return `
                                <div class="min-w-[200px] p-5 rounded-[2rem] bg-white border border-slate-100 shadow-sm">
                                    <p class="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">${p.pName}</p>
                                    <h4 class="text-xs font-black text-slate-800 mt-1">${p.type==='EVENT' ? (cell.eventName || 'EVENT') : (sub?.name || 'FREE')}</h4>
                                    ${p.type !== 'EVENT' ? `
                                        <p class="text-[9px] font-medium text-slate-400 mt-2">Res: ${cell.bookTitle || 'None'}</p>
                                        <p class="text-[9px] font-black text-emerald-500 mt-1 uppercase">${scheduleState.employees[cell.teacherId]?.name || 'NO STAFF'}</p>
                                    ` : ''}
                                </div>`;
                            }).join('') || '<p class="text-slate-300 py-8 italic font-bold">No Schedule Found</p>'}
                        </div>
                    </td>`;
                container.appendChild(tr);
            });
        }
    });
    document.getElementById('grid-view').classList.remove('hidden');
}

async function renderTeacherView() {
    const tId = document.getElementById('sch-teacher').value;
    const day = document.getElementById('sch-day').value;
    if (!tId) return;

    document.getElementById('grid-thead').innerHTML = `<tr class="text-slate-400 text-[10px] font-black uppercase tracking-widest"><th class="py-8 pl-8 text-left">Period</th><th class="py-8 text-left">Class</th><th class="py-8 text-left">Subject</th><th class="py-8 text-left">Material</th></tr>`;
    const container = document.getElementById('period-rows-container');
    container.innerHTML = '';

    Object.entries(scheduleState.fullSchedules).forEach(([cId, secs]) => {
        const cName = scheduleState.classes[cId]?.className || '';
        Object.entries(secs).forEach(([sec, data]) => {
            data.periods?.forEach(p => {
                if (p[day]?.teacherId === tId) {
                    const sub = scheduleState.subjects[cName]?.[p[day].subjectId];
                    const tr = document.createElement('tr');
                    tr.className = "bg-white border-b border-slate-50";
                    tr.innerHTML = `
                        <td class="py-6 pl-8 font-black text-indigo-600 text-xs">${p.pName}</td>
                        <td class="py-6 font-bold text-xs">${cName}-${sec}</td>
                        <td class="py-6 font-black text-xs">${sub?.name || ''}</td>
                        <td class="py-6 text-slate-400 font-bold text-[10px] uppercase">${p[day].bookTitle || ''}</td>`;
                    container.appendChild(tr);
                }
            });
        });
    });
    document.getElementById('grid-view').classList.remove('hidden');
}

async function saveToFirebase() {
    const cId = document.getElementById('sch-class').value;
    const sec = document.getElementById('sch-section').value;
    if (!cId || !sec) return Swal.fire('Error', 'Please select Class and Section', 'error');

    const rows = document.querySelectorAll('#period-rows-container tr');
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const periods = Array.from(rows).map(row => {
        const type = row.querySelector('.p-type').value;
        const obj = { 
            pName: row.querySelector('.p-name').value.toUpperCase(), // Auto Uppercase
            type 
        };
        days.forEach((day, i) => {
            if (type === 'EVENT') {
                obj[day] = { 
                    eventName: (row.querySelectorAll('.e-val')[i]?.value || '').toUpperCase() // Auto Uppercase
                };
            } else {
                obj[day] = { 
                    subjectId: row.querySelectorAll('.s-val')[i]?.value || '', 
                    bookTitle: (row.querySelectorAll('.b-val')[i]?.value || '').toUpperCase(), // Auto Uppercase
                    teacherId: row.querySelectorAll('.t-val')[i]?.value || '' 
                };
            }
        });
        return obj;
    });

    try {
        await db.ref(`schedules/${cId}/${sec}`).set({ periods, updatedAt: Date.now() });
        await loadSyncData(); // Instant Refresh in memory
        renderGrid(); // Instant Refresh UI
        Swal.fire({ icon: 'success', title: 'Sync Successful', customClass: { popup: 'rounded-[2rem]' }});
    } catch (e) {
        Swal.fire('Error', e.message, 'error');
    }
}