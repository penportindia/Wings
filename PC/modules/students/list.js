window.init_student_list = function(state) {
    const content = document.getElementById('main-content');
    
    content.innerHTML = `
        <div class="erp-container animate-in fade-in duration-500">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-6">
            <div class="flex flex-nowrap items-center gap-3">
                
                <div class="relative w-full max-w-[280px] shrink-0">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <i class="fas fa-search text-xs"></i>
                    </span>
                    <input type="text" id="universalSearch" placeholder=" Search " 
                        class="w-full bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-500 rounded-lg py-2 pl-9 pr-3 text-sm outline-none transition-all">
                </div>

                <div class="flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar flex-1">
                    ${['Branch', 'Class', 'Section', 'Rte', 'Trans', 'Type'].map(filter => `
                        <div class="w-[90px] shrink-0">
                            <select id="sel${filter}" onchange="Directory.firstPageSearch()" 
                                class="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-2 text-[11px] font-bold text-gray-600 outline-none focus:border-indigo-400 transition-all cursor-pointer appearance-none">
                                <option value="">${filter === 'Trans' ? 'Transport' : filter}</option>
                                ${filter === 'Trans' ? '<option value="true">Active</option><option value="false">Inactive</option>' : ''}
                            </select>
                        </div>
                    `).join('')}
                </div>

                <div class="flex items-center gap-2 shrink-0 border-l pl-3 border-gray-100">
                    <button onclick="Directory.firstPageSearch()" 
                        class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-sm">
                        <i class="fas fa-search"></i>
                        <span>Search</span>
                    </button>

                    <button onclick="Directory.resetFilters()" 
                        class="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition-all shadow-sm">
                        <i class="fas fa-sync-alt"></i>
                        <span>Reset</span>
                    </button>
                    
                    <button onclick="Directory.exportFullData()" 
                        class="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-all shadow-sm">
                        <i class="fas fa-file-export"></i>
                        <span>Export</span>
                    </button>
                </div>

            </div>
        </div>

            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto custom-scrollbar">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-indigo-900 text-white/90 text-[11px] uppercase tracking-wider whitespace-nowrap">
                            <tr>
                                <th class="py-3 px-4">Admission</th>
                                <th class="py-3 px-4">Student Profile</th>
                                <th class="py-3 px-4">Academic</th>
                                <th class="py-3 px-4">Father</th>
                                <th class="py-3 px-4">Mother</th>
                                <th class="py-3 px-4 bg-blue-900/40">UDISE</th>
                                <th class="py-3 px-4 bg-emerald-900/40">E-Shikshakosh</th>
                                <th class="py-3 px-4 text-center">Contact</th>
                                <th class="py-3 px-4">Address</th>
                                <th class="py-3 px-4">Transport</th>
                                <th class="py-3 px-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody id="resultBody" class="text-[11px] divide-y divide-gray-50">
                            <tr><td colspan="11" class="p-20 text-center text-gray-300 font-bold uppercase tracking-widest">Loading Database...</td></tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <div id="footerCount" class="text-[11px] font-black text-indigo-900 uppercase">System Ready</div>
                    <div class="flex gap-2" id="paginationControls"></div>
                </div>
            </div>
        </div>
    `;

    if(!document.getElementById('directory-styles')){
        const style = document.createElement('style');
        style.id = 'directory-styles';
        style.innerHTML = `
            .custom-scrollbar::-webkit-scrollbar { height: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #c7d2fe; border-radius: 10px; }
            #resultBody td { white-space: nowrap; padding-left: 1rem; padding-right: 1rem; }
        `;
        document.head.appendChild(style);
    }

    Directory.init();
};

const Directory = {
    allData: [],
    filteredData: [],
    currentPage: 1,
    pageSize: 30,

    async init() {
        try {
            const snapshot = await db.ref('student').once('value');
            const data = snapshot.val();
            if (data) {
                this.allData = Object.keys(data).map(k => ({ id: k, ...data[k] }));
                this.populateDropdowns(this.allData);
                this.firstPageSearch();
            } else {
                document.getElementById('resultBody').innerHTML = '<tr><td colspan="11" class="p-20 text-center text-gray-400 font-bold uppercase">No records in database</td></tr>';
            }
            
            const searchInput = document.getElementById('universalSearch');
            if(searchInput) {
                searchInput.addEventListener('keyup', (e) => {
                    if(e.key === 'Enter') this.firstPageSearch();
                });
            }
        } catch (error) {
            console.error("Firebase Error:", error);
            document.getElementById('resultBody').innerHTML = '<tr><td colspan="11" class="p-20 text-center text-red-400 font-bold uppercase">Database Connection Error</td></tr>';
        }
    },

    populateDropdowns(data) {
        const sets = { Branch: new Set(), Class: new Set(), Section: new Set(), Type: new Set(), Rte: new Set() };
        data.forEach(s => {
            if(s.academic?.branch) sets.Branch.add(s.academic.branch);
            if(s.academic?.class) sets.Class.add(s.academic.class);
            if(s.academic?.section) sets.Section.add(s.academic.section);
            if(s.admission?.type) sets.Type.add(s.admission.type);
            if(s.admission?.rteYear) sets.Rte.add(s.admission.rteYear);
        });
        
        Object.keys(sets).forEach(key => {
            const el = document.getElementById('sel' + key);
            if(el) {
                if(key !== 'Trans') {
                    el.innerHTML = '<option value="">All</option>';
                    Array.from(sets[key]).sort().forEach(v => {
                        el.innerHTML += `<option value="${v}">${v}</option>`;
                    });
                }
            }
        });
    },

    firstPageSearch() {
        this.currentPage = 1;
        this.applySearch();
    },

    applySearch() {
        const query = document.getElementById('universalSearch').value.toLowerCase().trim();
        
        const f = {
            branch: document.getElementById('selBranch')?.value || "",
            class: document.getElementById('selClass')?.value || "",
            section: document.getElementById('selSection')?.value || "",
            type: document.getElementById('selType')?.value || "",
            rte: document.getElementById('selRte')?.value || "",
            trans: document.getElementById('selTrans')?.value || ""
        };

        this.filteredData = this.allData.filter(s => {
            const sName = String(s.profile?.studentName || "").toLowerCase();
            const sFolio = String(s.profile?.folio || "").toLowerCase();
            const sFather = String(s.parents?.father?.name || "").toLowerCase();
            const sPhone = String(s.contact?.phone1 || "");

            const matchesSearch = !query || 
                sName.includes(query) || 
                sFolio.includes(query) || 
                sFather.includes(query) || 
                sPhone.includes(query);

            const matchesFilters = 
                (!f.branch || s.academic?.branch === f.branch) &&
                (!f.class || s.academic?.class === f.class) &&
                (!f.section || s.academic?.section === f.section) &&
                (!f.type || s.admission?.type === f.type) &&
                (!f.rte || s.admission?.rteYear === f.rte) &&
                (!f.trans || String(s.transport?.enabled || "false") === f.trans);

            return matchesSearch && matchesFilters;
        });

        this.renderTable();
        this.renderPagination();
    },

    renderTable() {
        const tbody = document.getElementById('resultBody');
        const start = (this.currentPage - 1) * this.pageSize;
        const paginatedItems = this.filteredData.slice(start, start + this.pageSize);
        document.getElementById('footerCount').innerText = `TOTAL RECORDS: ${this.filteredData.length}`;

        if(paginatedItems.length === 0) {
            tbody.innerHTML = '<tr><td colspan="11" class="p-20 text-center text-gray-400 font-bold uppercase">No records found</td></tr>';
            return;
        }

        tbody.innerHTML = paginatedItems.map(s => `
                <tr class="hover:bg-indigo-50/50 border-b border-gray-50">
                    <td class="py-4 px-6">
                        <div class="font-extrabold text-indigo-900 text-sm">#${s.profile?.folio || '-'}</div>
                        <div class="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold uppercase mt-1 inline-block">${s.admission?.type || '-'}</div>
                        <div class="text-[10px] text-indigo-500 font-bold block mt-1 uppercase">${s.admission?.rteYear || ''}</div>
                    </td>
                    <td class="py-4 px-6">
                        <div class="font-bold text-gray-800 uppercase text-[13px]">${s.profile?.studentName || '-'}</div>
                        <div class="text-[10px] text-indigo-600 font-bold">UID: ${s.profile?.aadhaar || '-'}</div>
                        <div class="text-[9px] text-gray-400 font-bold uppercase mt-1">${s.profile?.gender || '-'} | ${s.profile?.dob || '-'} | ${s.profile?.category || '-'}</div>
                    </td>
                    <td class="py-4 px-6">
                        <div class="font-bold text-gray-700 uppercase tracking-tighter text-[13px]">${s.academic?.class || '-'}-${s.academic?.section || '-'}</div>
                        <div class="text-[10px] text-gray-400 font-bold uppercase">${s.academic?.branch || '-'}</div>
                        <div class="text-[10px] text-indigo-500 font-bold ">${s.academic?.session || '-'}</div>
                    </td>
                    <td class="py-4 px-6 uppercase leading-tight"><div class="font-semibold text-gray-700">${s.parents?.father?.name || '-'}</div><div class="text-[9px] text-gray-400">UID: ${s.parents?.father?.aadhaar || '-'}</div></td>
                    <td class="py-4 px-6 uppercase leading-tight"><div class="font-semibold text-gray-700">${s.parents?.mother?.name || '-'}</div><div class="text-[9px] text-gray-400">UID: ${s.parents?.mother?.aadhaar || '-'}</div></td>
                    
                    <td class="py-4 px-6 bg-blue-50/30">
                        <div class="font-bold text-blue-800 text-[11px] uppercase">${s.govtMapping?.udise?.udiseName || '-'}</div>
                        <div class="text-[9px] font-bold text-gray-600">PEN: ${s.govtMapping?.udise?.penNo || '-'}</div>
                        <div class="text-[9px] text-gray-500 leading-none">APAAR: ${s.govtMapping?.udise?.aapaarId || '-'}</div>
                        <div class="text-[9px] text-blue-500 font-bold">BLOCK: ${s.govtMapping?.udise?.uSection || '-'} | ${s.govtMapping?.udise?.uClass || '-'}</div>
                    </td>

                    <td class="py-4 px-6 bg-emerald-50/30">
                        <div class="font-bold text-emerald-700 uppercase text-[11px]">${s.govtMapping?.eshikshakosh?.eshikshaName || '-'}</div>
                        <div class="text-[9px] font-bold text-gray-600">STATE NO: ${s.govtMapping?.eshikshakosh?.stateNo || '-'}</div>
                        <div class="text-[9px] text-emerald-600 font-bold uppercase">BLOCK: ${s.govtMapping?.eshikshakosh?.eBlock || '-'} | ${s.govtMapping?.eshikshakosh?.eClass || '-'}</div>
                    </td>

                    <td class="py-4 px-6">
                        <div class="text-indigo-600 font-extrabold text-[13px] bg-indigo-50 px-2 py-1 rounded-lg inline-block border border-indigo-100">
                           <i class="fas fa-phone-alt mr-1"></i> ${s.contact?.phone1 || '-'}
                        </div>
                    </td>
                    <td class="py-2 px-3 align-top">
                        <div class="text-[9px] leading-tight text-gray-500 uppercase w-32 break-words whitespace-normal bg-gray-50 p-1.5 rounded border border-gray-100 italic">
                            ${s.contact?.address || '-'}
                        </div>
                    </td>
                    <td class="py-4 px-6">
                        <div class="text-blue-600 font-bold text-[10px]">ROUTE: ${s.transport?.route || 'SELF'}</div>
                        <div class="text-[9px] text-gray-500 font-bold uppercase">${s.transport?.stop || ''}</div>
                    </td>
                    <td class="py-4 px-6 text-center">
                        <button onclick="editStudent('${s.profile?.folio}')" class="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all group">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                                <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
                            </svg>
                        </button>
                    </td>
                </tr>
            `).join('');
    },

    renderPagination() {
        const controls = document.getElementById('paginationControls');
        if (!controls) return;

        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        controls.innerHTML = '';
        if (totalPages <= 1) return;

        const createBtn = (content, isDisabled, onClick) => {
            const b = document.createElement('button');
            b.className = `px-3 py-1 rounded-lg border font-bold transition-all shadow-sm ${
                isDisabled 
                ? "bg-gray-50 text-gray-300 cursor-not-allowed border-gray-200" 
                : "bg-white text-gray-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 active:scale-95"
            }`;
            b.innerHTML = content;
            b.disabled = isDisabled;
            if (!isDisabled) b.onclick = onClick;
            return b;
        };

        controls.appendChild(createBtn("<i class='fas fa-chevron-left text-xs'></i>", this.currentPage === 1, () => { 
            this.currentPage--; 
            this.renderTable(); 
            this.renderPagination(); 
        }));

        const s = document.createElement('span');
        s.className = "px-4 py-1 text-[11px] font-black text-indigo-700 bg-indigo-50 rounded-lg flex items-center border border-indigo-100 mx-1";
        s.innerText = `${this.currentPage} / ${totalPages}`;
        controls.appendChild(s);

        controls.appendChild(createBtn("<i class='fas fa-chevron-right text-xs'></i>", this.currentPage === totalPages, () => { 
            this.currentPage++; 
            this.renderTable(); 
            this.renderPagination(); 
        }));
    },

    exportFullData() {
        const dataToExport = this.filteredData; 
        if (!dataToExport || dataToExport.length === 0) { 
            alert("Pehle data search karein!"); 
            return; 
        }

        const headers = [
            "Folio", "Student Name", "Aadhaar", "DOB", "Gender", "Category", 
            "Branch", "Class", "Section", "Session", "Type", "RTE Year",
            "Father", "Father Aadhaar", "Mother", "Mother Aadhaar",
            "UDISE Name", "PEN No", "APAAR ID", "U-Class", "U-Section",
            "E-Shiksha Name", "State No", "E-Block", "E-Class",
            "Phone1", "Phone2", "Address", "Transport", "Route", "Stop",
            "Bank Holder", "Bank A/C", "IFSC", "Status", "Note"
        ];

        const sanitize = (val) => {
            if (val === undefined || val === null) return "";
            let s = String(val).replace(/"/g, '""').trim(); 
            return s.includes(',') || s.includes('\n') ? `"${s}"` : s;
        };

        const csvRows = [headers.join(",")];

        dataToExport.forEach(s => {
            const row = [
                sanitize(s.profile?.folio || "-"),
                sanitize(s.profile?.studentName),
                `'${s.profile?.aadhaar || ""}`, 
                sanitize(s.profile?.dob),
                sanitize(s.profile?.gender),
                sanitize(s.profile?.category),
                sanitize(s.academic?.branch),
                sanitize(s.academic?.class),
                sanitize(s.academic?.section),
                sanitize(s.academic?.session),
                sanitize(s.admission?.type),
                sanitize(s.admission?.rteYear),
                sanitize(s.parents?.father?.name),
                `'${s.parents?.father?.aadhaar || ""}`,
                sanitize(s.parents?.mother?.name),
                `'${s.parents?.mother?.aadhaar || ""}`,
                sanitize(s.govtMapping?.udise?.udiseName),
                sanitize(s.govtMapping?.udise?.penNo || "-"),
                sanitize(s.govtMapping?.udise?.aapaarId || "-"),
                sanitize(s.govtMapping?.udise?.uClass),
                sanitize(s.govtMapping?.udise?.uSection),
                sanitize(s.govtMapping?.eshikshakosh?.eshikshaName),
                `'${s.govtMapping?.eshikshakosh?.stateNo || ""}`,
                sanitize(s.govtMapping?.eshikshakosh?.eBlock),
                sanitize(s.govtMapping?.eshikshakosh?.eClass),
                sanitize(s.contact?.phone1),
                sanitize(s.contact?.phone2),
                sanitize(s.contact?.address),
                s.transport?.enabled ? "Active" : "Inactive",
                sanitize(s.transport?.route || "-"),
                sanitize(s.transport?.stop || "-"),
                sanitize(s.bank?.accountHolder),
                `'${s.bank?.accountNo || ""}`,
                sanitize(s.bank?.ifsc || "-"),
                sanitize(s.remark?.status || "-"),
                sanitize(s.remark?.note)
            ];
            csvRows.push(row.join(","));
        });

        const blob = new Blob(["\ufeff" + csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    },

    resetFilters() {
        ['universalSearch', 'selBranch', 'selClass', 'selSection', 'selRte', 'selTrans', 'selType'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.value = "";
                if (el.tagName === 'SELECT') el.selectedIndex = 0;
            }
        });
        this.currentPage = 1;
        this.firstPageSearch();
    }
};

window.editStudent = function(folio) {
    if (typeof App !== 'undefined') {
        if (!App.state) App.state = {};
        App.state.editingFolio = folio;
        App.state.isFromList = true; 
        App.loadModule('manage_students', 'modules/students/manage.js', 'Manage Students');
    } else {
        console.error("App object not found!");
    }
};