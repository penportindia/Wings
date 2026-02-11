window.init_promote = function(appState) {
    const content = document.getElementById('main-content');
    
    content.innerHTML = `
        <div class="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 backdrop-blur-md p-2 pl-6 rounded-3xl border border-white shadow-xl shadow-slate-200/50">
                <div class="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                    <div id="filterStatus" class="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100">
                        <span class="text-[10px] font-black text-slate-400 uppercase mr-2">Status:</span>
                        <span class="text-xs font-black text-indigo-600 uppercase tracking-wider" id="currentMode">Standard Mode</span>
                    </div>
                    <div class="px-6 py-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100 flex items-center gap-3">
                        <span class="text-white font-black text-lg" id="countBadge">0</span>
                        <span class="text-indigo-100 text-[9px] font-bold uppercase tracking-widest">Selected</span>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label class="relative group cursor-pointer">
                    <input type="checkbox" id="upd_main_academic" onchange="toggleFilterUI()" checked class="peer sr-only">
                    <div class="p-4 bg-white border-2 border-transparent peer-checked:border-indigo-500 peer-checked:bg-indigo-50/30 rounded-3xl shadow-sm transition-all duration-300 group-hover:shadow-md">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-xl bg-slate-100 peer-checked:bg-indigo-500 flex items-center justify-center transition-colors">
                                <i data-lucide="graduation-cap" class="w-4 h-4 text-slate-500 group-peer-checked:text-indigo-600"></i>
                            </div>
                            <span class="text-[11px] font-black text-slate-600 uppercase tracking-tight">Academic Class</span>
                        </div>
                    </div>
                </label>

                <label class="relative group cursor-pointer">
                    <input type="checkbox" id="upd_hist" onchange="toggleFilterUI()" checked class="peer sr-only">
                    <div class="p-4 bg-white border-2 border-transparent peer-checked:border-blue-500 peer-checked:bg-blue-50/30 rounded-3xl shadow-sm transition-all duration-300 group-hover:shadow-md">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                                <i data-lucide="history" class="w-4 h-4 text-slate-500"></i>
                            </div>
                            <span class="text-[11px] font-black text-slate-600 uppercase tracking-tight">Session History</span>
                        </div>
                    </div>
                </label>

                <label class="relative group cursor-pointer">
                    <input type="checkbox" id="upd_eshiksha" onchange="toggleFilterUI()" checked class="peer sr-only">
                    <div class="p-4 bg-white border-2 border-transparent peer-checked:border-emerald-500 peer-checked:bg-emerald-50/30 rounded-3xl shadow-sm transition-all duration-300 group-hover:shadow-md">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                                <i data-lucide="cloud-lightning" class="w-4 h-4 text-slate-500"></i>
                            </div>
                            <span class="text-[11px] font-black text-slate-600 uppercase tracking-tight">e-Shikshakosh</span>
                        </div>
                    </div>
                </label>

                <label class="relative group cursor-pointer">
                    <input type="checkbox" id="upd_udise" onchange="toggleFilterUI()" checked class="peer sr-only">
                    <div class="p-4 bg-white border-2 border-transparent peer-checked:border-orange-500 peer-checked:bg-orange-50/30 rounded-3xl shadow-sm transition-all duration-300 group-hover:shadow-md">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                                <i data-lucide="database" class="w-4 h-4 text-slate-500"></i>
                            </div>
                            <span class="text-[11px] font-black text-slate-600 uppercase tracking-tight">UDISE Mapping</span>
                        </div>
                    </div>
                </label>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div class="lg:col-span-3 space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                            <div class="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
                                <i data-lucide="filter" class="w-24 h-24 text-indigo-900"></i>
                            </div>
                            <div class="relative">
                                <label class="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-6 block">Origin Configuration</label>
                                <div class="space-y-4">
                                    <div class="grid grid-cols-2 gap-4">
                                        <select id="fBranch" onchange="loadPromotionClasses('source')" class="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 border-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"></select>
                                        <select id="fClass" onchange="loadPromotionSections('source')" class="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 border-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"></select>
                                    </div>
                                    <div class="flex gap-4">
                                        <select id="fSection" class="flex-1 p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 border-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"></select>
                                        <button onclick="fetchPromotionStudents()" class="bg-indigo-600 text-white w-14 rounded-2xl hover:bg-indigo-700 hover:rotate-180 transition-all duration-500 flex items-center justify-center shadow-lg shadow-indigo-200">
                                            <i data-lucide="refresh-cw" class="w-5 h-5"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                            <div class="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform text-emerald-900">
                                <i data-lucide="rocket" class="w-24 h-24"></i>
                            </div>
                            <div class="relative">
                                <label class="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-6 block">Destination Setup</label>
                                <div class="space-y-4">
                                    <div class="grid grid-cols-2 gap-4">
                                        <select id="pBranch" onchange="loadPromotionClasses('target')" class="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 border-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"></select>
                                        <select id="pClass" onchange="loadPromotionSections('target')" class="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 border-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"></select>
                                    </div>
                                    <div class="flex gap-3">
                                        <select id="pSection" class="w-24 p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 border-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"></select>
                                        <select id="pSession" class="w-32 p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 border-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"></select>
                                        <button onclick="bulkPromote()" class="flex-1 bg-emerald-500 text-white px-4 rounded-2xl font-black text-[10px] hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 uppercase tracking-widest">
                                            Promote
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div class="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                            <div class="relative">
                                <i data-lucide="search" class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                <input type="text" id="stuSearch" onkeyup="filterPromotionTable()" placeholder="Quick Search..." class="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 w-64">
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select All</span>
                                <input type="checkbox" onclick="togglePromotionSelection(this)" class="w-6 h-6 rounded-lg border-slate-300 text-indigo-600 cursor-pointer">
                            </div>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-slate-50/20">
                                        <th class="p-6 w-10"></th>
                                        <th class="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Identity</th>
                                        <th class="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Placement</th>
                                        <th class="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                        <th class="p-6 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody id="studentListBody" class="divide-y divide-slate-50">
                                    <tr><td colspan="5" class="p-24 text-center text-slate-300 font-bold italic uppercase text-xs tracking-widest">Initialize filters to view students</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-1">
                    <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 h-[80vh] flex flex-col overflow-hidden">
                        <div class="p-8 border-b border-slate-50 bg-slate-50/50">
                            <h3 class="font-black text-slate-800 flex items-center gap-3 uppercase text-[10px] tracking-widest">
                                <span class="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                                Live Activity Log
                            </h3>
                        </div>
                        <div id="activityLog" class="flex-1 overflow-y-auto p-6 space-y-4">
                            <div class="text-center p-10 text-slate-300 text-[10px] font-black italic uppercase tracking-widest">Ready for action</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    let foundationData = {};
    let currentBatch = [];
    const db = firebase.database();

    async function initFoundation() {
        const snap = await db.ref("foundation").once("value");
        if (snap.exists()) {
            foundationData = snap.val();
            populateBranches();
            populateSessions(); // Naya function call
            toggleFilterUI();
        }
        lucide.createIcons();
    }

    function populateSessions() {
        const pSession = document.getElementById('pSession');
        pSession.innerHTML = `<option value="">Session</option>`;
        if(foundationData.sessions) {
            Object.values(foundationData.sessions).forEach(s => {
                pSession.innerHTML += `<option value="${s.name}">${s.name}</option>`;
            });
        }
    }

    window.toggleFilterUI = () => {
        const isAcademic = document.getElementById("upd_main_academic").checked;
        const isHistory = document.getElementById("upd_hist").checked;
        const fBranch = document.getElementById("fBranch");
        const fSection = document.getElementById("fSection");
        const pBranch = document.getElementById("pBranch");
        const pSection = document.getElementById("pSection");
        const statusLabel = document.getElementById("currentMode");

        if (!isAcademic && !isHistory) {
            fBranch.classList.add('hidden');
            fSection.classList.add('hidden');
            pBranch.classList.add('hidden');
            pSection.classList.add('hidden');
            statusLabel.innerText = "External Mapping Mode";
            statusLabel.classList.replace('text-indigo-600', 'text-emerald-600');
            loadAllClassesAcrossBranches();
        } else {
            fBranch.classList.remove('hidden');
            fSection.classList.remove('hidden');
            pBranch.classList.remove('hidden');
            pSection.classList.remove('hidden');
            statusLabel.innerText = "Standard Promotion Mode";
            statusLabel.classList.replace('text-emerald-600', 'text-indigo-600');
            populateBranches();
        }
    };

    function loadAllClassesAcrossBranches() {
        ['fClass', 'pClass'].forEach(id => {
            const el = document.getElementById(id);
            el.innerHTML = `<option value="">Select Class</option>`;
            const uniqueClasses = [...new Set(Object.values(foundationData.classes || {}).map(c => c.className))];
            uniqueClasses.forEach(cls => {
                el.innerHTML += `<option value="${cls}">${cls}</option>`;
            });
        });
    }

    function populateBranches() {
        ['fBranch', 'pBranch'].forEach(id => {
            const el = document.getElementById(id);
            el.innerHTML = `<option value="">Branch</option>`;
            if(foundationData.branches) {
                Object.values(foundationData.branches).forEach(b => {
                    el.innerHTML += `<option value="${b.name}">${b.name}</option>`;
                });
            }
        });
    }

    window.loadPromotionClasses = (type) => {
        const branch = document.getElementById(type === 'source' ? 'fBranch' : 'pBranch').value;
        const clsSel = document.getElementById(type === 'source' ? 'fClass' : 'pClass');
        clsSel.innerHTML = `<option value="">Class</option>`;
        if(!branch) return;
        Object.values(foundationData.classes || {}).forEach(c => {
            if(c.branch === branch) {
                clsSel.innerHTML += `<option value="${c.className}" data-secs="${c.sections}">${c.className}</option>`;
            }
        });
    };

    window.loadPromotionSections = (type) => {
        const clsSel = document.getElementById(type === 'source' ? 'fClass' : 'pClass');
        const secSel = document.getElementById(type === 'source' ? 'fSection' : 'pSection');
        const selected = clsSel.options[clsSel.selectedIndex];
        secSel.innerHTML = type === 'source' ? `<option value="">All Sections</option>` : `<option value="SAME">Keep Section</option>`;
        if(selected && selected.dataset.secs) {
            selected.dataset.secs.split(',').forEach(s => {
                secSel.innerHTML += `<option value="${s.trim()}">${s.trim()}</option>`;
            });
        }
    };

    window.fetchPromotionStudents = async () => {
        const isAcademic = document.getElementById("upd_main_academic").checked;
        const isHistory = document.getElementById("upd_hist").checked;
        const branch = document.getElementById("fBranch").value;
        const cls = document.getElementById("fClass").value;
        const sec = document.getElementById("fSection").value;

        if((isAcademic || isHistory) && !branch) return Swal.fire('Wait', 'Please select Branch', 'info');
        if(!cls) return Swal.fire('Wait', 'Please select Class', 'info');

        const tbody = document.getElementById("studentListBody");
        tbody.innerHTML = `<tr><td colspan="5" class="p-32 text-center"><div class="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>`;

        try {
            const snap = await db.ref("student").once("value");
            currentBatch = [];
            let html = "";
            snap.forEach(child => {
                const d = child.val();
                const matchBranch = (isAcademic || isHistory) ? (d.academic && d.academic.branch === branch) : true;
                const matchClass = d.academic && d.academic.class === cls;
                const matchSec = ((isAcademic || isHistory) && sec) ? (d.academic.section === sec) : true;

                if (matchBranch && matchClass && matchSec) {
                    currentBatch.push({ id: child.key, ...d });
                    html += `
                    <tr class="group hover:bg-slate-50 transition-all duration-300">
                        <td class="p-6"><input type="checkbox" class="select-stu w-5 h-5 rounded-lg border-slate-300 text-indigo-600" value="${child.key}"></td>
                        <td class="p-6">
                            <div class="font-black text-slate-700 uppercase text-xs tracking-tight">${d.profile.studentName}</div>
                            <div class="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest italic">ID: ${child.key.slice(-8)}</div>
                        </td>
                        <td class="p-6">
                            <div class="flex items-center gap-2">
                                <span class="px-3 py-1 bg-white border border-slate-100 shadow-sm text-slate-600 rounded-lg text-[10px] font-black">${d.academic.class}</span>
                                <span class="w-1 h-1 bg-slate-200 rounded-full"></span>
                                <span class="text-[10px] font-bold text-slate-400">${d.academic.section || 'NA'}</span>
                            </div>
                        </td>
                        <td class="p-6"><span class="text-[10px] font-black text-indigo-400 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-tighter">${d.academic.session || 'N/A'}</span></td>
                        <td class="p-6 text-right">
                            <button onclick="promoteOne('${child.key}', '${d.profile.studentName}')" class="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:shadow-lg transition-all">
                                <i data-lucide="arrow-right" class="w-4 h-4"></i>
                            </button>
                        </td>
                    </tr>`;
                }
            });
            tbody.innerHTML = html || `<tr><td colspan="5" class="p-24 text-center text-rose-400 font-black tracking-widest uppercase text-xs italic">No matching records</td></tr>`;
            document.getElementById("countBadge").innerText = currentBatch.length;
            lucide.createIcons();
        } catch (e) { Swal.fire('Error', e.message, 'error'); }
    };

    async function executeCorePromotion(id, name, oldData, tBranch, tClass, tSec, tSession) {
        const updates = {};
        const oldSession = (oldData.academic.session || "NA").replace(/\//g, '-');

        if(document.getElementById("upd_hist").checked) {
            updates[`student/${id}/history/${oldSession}`] = {
                branch: oldData.academic.branch,
                class: oldData.academic.class,
                section: oldData.academic.section || "NA",
                timestamp: new Date().toISOString(),
                status: "Promoted"
            };
        }

        if(document.getElementById("upd_main_academic").checked) {
            updates[`student/${id}/academic/branch`] = tBranch || oldData.academic.branch;
            updates[`student/${id}/academic/class`] = tClass;
            updates[`student/${id}/academic/session`] = tSession;
            if(tSec !== "SAME") updates[`student/${id}/academic/section`] = tSec;
        }

        if(document.getElementById("upd_eshiksha").checked) {
            updates[`student/${id}/govtMapping/eshikshakosh/eClass`] = tClass;
        }

        if(document.getElementById("upd_udise").checked) {
            updates[`student/${id}/govtMapping/udise/uClass`] = tClass;
        }

        if(Object.keys(updates).length > 0) {
            await db.ref().update(updates);
            logPromotionActivity(id, name, oldData, tClass, tSession);
        }
    }

    window.promoteOne = async (id, name) => {
        const tB = document.getElementById("pBranch").value;
        const tC = document.getElementById("pClass").value;
        const tS = document.getElementById("pSection").value;
        const tSes = document.getElementById("pSession").value;
        if(!tC || !tSes) return Swal.fire('Target Error', 'Target class/session missing', 'error');

        const student = currentBatch.find(s => s.id === id);
        const { isConfirmed } = await Swal.fire({
            title: 'Verify Move',
            text: `Update ${name} records?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Execute'
        });

        if(isConfirmed) {
            await executeCorePromotion(id, name, student, tB, tC, tS, tSes);
            fetchPromotionStudents();
        }
    };

    window.bulkPromote = async () => {
        const tB = document.getElementById("pBranch").value;
        const tC = document.getElementById("pClass").value;
        const tS = document.getElementById("pSection").value;
        const tSes = document.getElementById("pSession").value;
        const selected = document.querySelectorAll(".select-stu:checked");

        if(!tC || !tSes || selected.length === 0) return Swal.fire('Selection Error', 'Nothing to process', 'error');

        const { isConfirmed } = await Swal.fire({
            title: 'Bulk Execute',
            text: `Update ${selected.length} students?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Confirm All'
        });

        if(isConfirmed) {
            Swal.fire({ title: 'Processing...', didOpen: () => Swal.showLoading() });
            for(let chk of selected) {
                const stu = currentBatch.find(s => s.id === chk.value);
                await executeCorePromotion(chk.value, stu.profile.studentName, stu, tB, tC, tS, tSes);
            }
            Swal.fire('Complete', 'Bulk updates finished', 'success');
            fetchPromotionStudents();
        }
    };

    function logPromotionActivity(id, name, oldData, newCls, newSes) {
        const log = document.getElementById("activityLog");
        if(log.innerText.includes("Ready for action")) log.innerHTML = "";
        const card = document.createElement("div");
        card.className = "p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm space-y-3 animate-in slide-in-from-right";
        const oldJson = JSON.stringify(oldData).replace(/"/g, '&quot;');
        card.innerHTML = `
            <div>
                <div class="text-[11px] font-black text-slate-800 uppercase tracking-tight">${name}</div>
                <div class="text-[9px] font-bold text-slate-400 uppercase mt-1">Moved to Session ${newSes}</div>
            </div>
            <button onclick="undoPromo('${id}', '${name}', ${oldJson}, this)" class="w-full py-2 bg-rose-50 text-rose-500 rounded-xl text-[9px] font-black uppercase hover:bg-rose-600 hover:text-white transition-all tracking-widest">Rollback</button>
        `;
        log.prepend(card);
    }

    window.undoPromo = async (id, name, oldData, btn) => {
        const { isConfirmed } = await Swal.fire({ title: 'Rollback?', text: `Restore ${name}?`, icon: 'warning', showCancelButton: true });
        if(isConfirmed) {
            const rollback = {};
            rollback[`student/${id}/academic`] = oldData.academic;
            if(oldData.govtMapping) rollback[`student/${id}/govtMapping`] = oldData.govtMapping;
            const histSession = (oldData.academic.session || "NA").replace(/\//g, '-');
            rollback[`student/${id}/history/${histSession}`] = null;
            await db.ref().update(rollback);
            btn.closest('div').remove();
            fetchPromotionStudents();
            Swal.fire('Restored', 'Data reverted', 'success');
        }
    };

    window.togglePromotionSelection = (el) => {
        document.querySelectorAll(".select-stu").forEach(c => c.checked = el.checked);
    };

    window.filterPromotionTable = () => {
        const q = document.getElementById("stuSearch").value.toLowerCase();
        document.querySelectorAll("tbody tr").forEach(r => {
            r.style.display = r.innerText.toLowerCase().includes(q) ? "" : "none";
        });
    };

    initFoundation();
};