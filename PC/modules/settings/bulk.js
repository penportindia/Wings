const studentSchema = [
    { id: 'profile.folio', label: 'Folio (Admission No)', required: true },
    { id: 'profile.studentName', label: 'Student Name' },
    { id: 'profile.aadhaar', label: 'Student Aadhaar', format: 'aadhaar' },
    { id: 'profile.dob', label: 'Date of Birth (YYYY-MM-DD)', format: 'date' },
    { id: 'profile.gender', label: 'Gender' },
    { id: 'profile.category', label: 'Category' },
    { id: 'academic.class', label: 'Class' },
    { id: 'academic.section', label: 'Section' },
    { id: 'academic.rollNo', label: 'Roll Number' },
    { id: 'academic.branch', label: 'Branch/Stream' },
    { id: 'academic.session', label: 'Academic Session' },
    { id: 'parents.father.name', label: 'Father Name' },
    { id: 'parents.father.aadhaar', label: 'Father Aadhaar', format: 'aadhaar' },
    { id: 'parents.mother.name', label: 'Mother Name' },
    { id: 'parents.mother.aadhaar', label: 'Mother Aadhaar', format: 'aadhaar' },
    { id: 'contact.phone1', label: 'Primary Phone' },
    { id: 'contact.phone2', label: 'Secondary Phone' },
    { id: 'contact.address', label: 'Full Address' },
    { id: 'bank.accountHolder', label: 'Bank A/C Holder' },
    { id: 'bank.accountNo', label: 'Bank Account Number' },
    { id: 'bank.ifsc', label: 'Bank IFSC Code' },
    { id: 'admission.admissionDate', label: 'Admission Date', format: 'date' },
    { id: 'admission.type', label: 'Admission Type' },
    { id: 'admission.rteYear', label: 'RTE Year' },
    { id: 'govtMapping.eshikshakosh.stateNo', label: 'e-Shiksha State No' },
    { id: 'govtMapping.eshikshakosh.eBlock', label: 'e-Shiksha Block' },
    { id: 'govtMapping.eshikshakosh.eClass', label: 'e-Shiksha Class' },
    { id: 'govtMapping.eshikshakosh.eshikshaName', label: 'e-Shiksha Student Name' },
    { id: 'govtMapping.udise.penNo', label: 'UDISE PEN Number' },
    { id: 'govtMapping.udise.aapaarId', label: 'APAAR ID' },
    { id: 'govtMapping.udise.udiseName', label: 'UDISE Student Name' },
    { id: 'govtMapping.udise.uClass', label: 'UDISE Class' },
    { id: 'govtMapping.udise.uSection', label: 'UDISE Section' },
    { id: 'transport.route', label: 'Transport Route' },
    { id: 'transport.stop', label: 'Transport Stop' },
    { id: 'transport.enabled', label: 'Transport Enabled' },
    { id: 'remark.status', label: 'Admission Status' },
    { id: 'remark.note', label: 'Internal Note' }
];

const staffSchema = [
    { id: 'empId', label: 'Employee ID', required: true },
    { id: 'name', label: 'Name' },
    { id: 'phone', label: 'Phone' },
    { id: 'aadhaar', label: 'Aadhaar', format: 'aadhaar' },
    { id: 'dob', label: 'Date of Birth', format: 'date' },
    { id: 'doj', label: 'Date of Joining', format: 'date' },
    { id: 'designation', label: 'Designation' },
    { id: 'basicSalary', label: 'Basic Salary' },
    { id: 'gender', label: 'Gender' },
    { id: 'bloodGroup', label: 'Blood Group' },
    { id: 'fatherSpouse', label: 'Father/Spouse Name' },
    { id: 'address', label: 'Full Address' },
    { id: 'accNo', label: 'Bank Account Number' },
    { id: 'ifsc', label: 'Bank IFSC' },
    { id: 'bankingName', label: 'Bank A/C Holder Name' },
    { id: 'higherQual', label: 'Higher Qualification' },
    { id: 'profQual', label: 'Professional Qualification' },
    { id: 'pfNo', label: 'PF Number' },
    { id: 'status', label: 'Status' },
    { id: 'branch', label: 'Branch' }
];

let currentMode = 'student'; 
let activeSchema = studentSchema;
let rawExcel = [];
let excelHeaders = [];
let results = { new: [], update: [] };
let currentTab = 'new';
let existingIds = [];

function init_bulk_entry() {
    const container = document.getElementById('main-content');
    container.innerHTML = `
        <div class="w-full h-screen flex flex-col bg-[#f1f5f9] overflow-hidden font-sans antialiased text-slate-900">
            <header class="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-50 shrink-0">
                <div class="flex bg-slate-100/80 p-1 rounded-2xl border border-slate-200 shadow-inner">
                    <button onclick="switchMode('student')" id="mode-student" class="px-6 py-2 rounded-xl font-bold text-xs transition-all duration-300 bg-white text-indigo-600 shadow-sm ring-1 ring-black/5">
                        Student Mode
                    </button>
                    <button onclick="switchMode('staff')" id="mode-staff" class="px-6 py-2 rounded-xl font-bold text-xs transition-all duration-300 text-slate-500 hover:text-slate-700">
                        Staff Mode
                    </button>
                </div>
                <div class="w-32"></div> 
            </header>

            <div class="grid grid-cols-12 flex-1 overflow-hidden">
                <aside class="col-span-12 lg:col-span-3 bg-white border-r border-slate-200 flex flex-col shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] z-30 overflow-hidden">
                    <div class="p-6">
                        <div id="drop-zone" class="relative group border-2 border-dashed border-slate-200 rounded-[2rem] p-8 transition-all duration-300 hover:border-indigo-400 hover:bg-indigo-50/30 flex flex-col items-center justify-center cursor-pointer text-center bg-slate-50/50">
                            <input type="file" id="bulk-file-input" class="absolute inset-0 opacity-0 cursor-pointer" accept=".xlsx,.xls,.csv">
                            <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <i data-lucide="file-up" class="text-indigo-600 w-7 h-7"></i>
                            </div>
                            <p class="text-slate-700 font-bold text-sm">Drop excel file here</p>
                            <p class="text-slate-400 text-[11px] mt-1 font-medium">or click to browse</p>
                        </div>
                    </div>

                    <div id="mapping-area" class="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar hidden">
                        <div class="flex items-center justify-between mb-6 sticky top-0 bg-white py-2 z-10">
                            <h4 class="text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em]">Field Mapping</h4>
                            <span id="field-count" class="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-bold text-[9px] border border-indigo-100">READY</span>
                        </div>
                        <div id="mapping-grid" class="space-y-3 pb-10"></div>
                    </div>
                </aside>

                <main class="col-span-12 lg:col-span-9 flex flex-col h-full overflow-hidden">
                    <div class="p-6 grid grid-cols-4 gap-6 bg-transparent shrink-0">
                        <div class="bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-sm">
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Rows</p>
                            <h2 id="txtTotal" class="text-3xl font-black text-slate-800 tracking-tight">0</h2>
                        </div>
                        <div class="bg-white p-5 rounded-[1.5rem] border border-emerald-100 shadow-sm">
                            <p class="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-2">New Entries</p>
                            <h2 id="txtNew" class="text-3xl font-black text-emerald-600 tracking-tight">0</h2>
                        </div>
                        <div class="bg-white p-5 rounded-[1.5rem] border border-blue-100 shadow-sm">
                            <p class="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-2">Updates</p>
                            <h2 id="txtUpdate" class="text-3xl font-black text-blue-600 tracking-tight">0</h2>
                        </div>
                        <div class="flex items-center">
                            <button id="process-btn" disabled class="w-full h-[72px] bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-200 text-white font-bold rounded-[1.5rem] transition-all duration-300 shadow-xl shadow-slate-200 disabled:shadow-none flex items-center justify-center gap-3 group">
                                <span>DEPLOY DATA</span>
                                <i data-lucide="zap" class="w-4 h-4 fill-current group-hover:animate-pulse"></i>
                            </button>
                        </div>
                    </div>

                    <div class="flex-1 mx-6 mb-6 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div id="preview-section" class="flex-1 flex flex-col hidden">
                            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                                <div class="flex p-1 bg-slate-200/50 rounded-xl space-x-1">
                                    <button onclick="setTab('new')" id="tab-new" class="px-6 py-2 rounded-lg font-bold text-[11px] uppercase transition-all bg-white text-indigo-600 shadow-sm">New Queue</button>
                                    <button onclick="setTab('update')" id="tab-update" class="px-6 py-2 rounded-lg font-bold text-[11px] uppercase transition-all text-slate-500 hover:bg-white/50">Update Queue</button>
                                </div>
                            </div>
                            <div class="flex-1 overflow-auto custom-scrollbar">
                                <table id="preview-table" class="w-full text-left text-[12px] border-separate border-spacing-0 min-w-[2000px]"></table>
                            </div>
                        </div>

                        <div id="table-placeholder" class="flex-1 flex flex-col items-center justify-center animate-pulse">
                            <div class="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 border border-slate-100">
                                <i data-lucide="layout-grid" class="text-slate-300 w-10 h-10"></i>
                            </div>
                            <h3 class="font-bold text-slate-400 text-sm uppercase tracking-[0.3em]">Awaiting Injection</h3>
                            <p class="text-slate-300 text-xs mt-2">Upload a file to begin the mapping process</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>

        <style>
            .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }

            #preview-table th {
                position: sticky;
                top: 0;
                background: #f8fafc;
                color: #64748b;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                padding: 12px 24px;
                border-bottom: 1px solid #e2e8f0;
                z-index: 10;
            }
            
            #preview-table td {
                padding: 12px 24px;
                border-bottom: 1px solid #f1f5f9;
                color: #334155;
            }

            #preview-table tr:hover td { background-color: #f8fafc; }
        </style>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    setupBulkLogic();
}

function switchMode(mode) {
    currentMode = mode;
    activeSchema = mode === 'student' ? studentSchema : staffSchema;
    
    const sBtn = document.getElementById('mode-student');
    const stBtn = document.getElementById('mode-staff');
    
    const activeClass = "px-8 py-2.5 rounded-xl font-black text-[11px] uppercase bg-white text-blue-600 shadow-sm";
    const inactiveClass = "px-8 py-2.5 rounded-xl font-black text-[11px] uppercase text-slate-400";

    if (mode === 'student') {
        sBtn.className = activeClass;
        stBtn.className = inactiveClass;
    } else {
        stBtn.className = activeClass;
        sBtn.className = inactiveClass;
    }
    
    resetState();
}

function resetState() {
    rawExcel = [];
    results = { new: [], update: [] };
    document.getElementById('mapping-area').classList.add('hidden');
    document.getElementById('preview-section').classList.add('hidden');
    document.getElementById('table-placeholder').classList.remove('hidden');
    document.getElementById('txtTotal').textContent = '0';
    document.getElementById('txtNew').textContent = '0';
    document.getElementById('txtUpdate').textContent = '0';
    document.getElementById('process-btn').disabled = true;
}

function setupBulkLogic() {
    const fileInput = document.getElementById('bulk-file-input');
    if (fileInput) fileInput.addEventListener('change', handleFileUpload);
    
    const processBtn = document.getElementById('process-btn');
    if (processBtn) processBtn.onclick = deployChanges;
}

async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rawExcel = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        
        if (rawExcel.length === 0) {
            alert("No data found in Excel file");
            return;
        }
        
        excelHeaders = Object.keys(rawExcel[0]);
        const targetPath = currentMode === 'student' ? 'student' : 'employees';
        const snap = await db.ref(targetPath).once('value');
        existingIds = Object.keys(snap.val() || {});
        
        showPreview();
        initMapping();
        e.target.value = '';
    } catch (err) {
        console.error('Excel parsing error:', err);
        alert("Invalid Excel file format");
    }
}

function showPreview() {
    document.getElementById('mapping-area').classList.remove('hidden');
    document.getElementById('preview-section').classList.remove('hidden');
    document.getElementById('table-placeholder').classList.add('hidden');
    document.getElementById('process-btn').disabled = false;
}

function initMapping() {
    const grid = document.getElementById('mapping-grid');
    if (!grid) return;
    
    grid.innerHTML = activeSchema.map(field => `
        <div class="group border-b border-slate-50 pb-3 last:border-b-0">
            <label class="text-[9px] font-black text-slate-400 mb-1.5 block uppercase tracking-tighter">
                ${field.label}${field.required ? ' <span class="text-red-500">*</span>' : ''}
            </label>
            <select class="map-select w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[10px] font-bold outline-none focus:ring-2 focus:ring-blue-500" data-schema="${field.id}">
                <option value="">-- UNMAPPED --</option>
                ${excelHeaders.map(h => `<option value="${h}">${h}</option>`).join('')}
            </select>
        </div>
    `).join('');
    
    document.querySelectorAll('.map-select').forEach(sel => {
        sel.addEventListener('change', () => {
            analyze();
            updateFieldCount();
        });
    });
    
    analyze();
    updateFieldCount();
}

function updateFieldCount() {
    const mappedCount = Object.keys(getMapping()).length;
    const totalCount = activeSchema.length;
    document.getElementById('field-count').textContent = `${mappedCount}/${totalCount} Mapped`;
}

function analyze() {
    const mapping = getMapping();
    const idKey = currentMode === 'student' ? 'profile.folio' : 'empId';
    const folioCol = mapping[idKey];
    
    results.new = [];
    results.update = [];
    
    if (!folioCol) {
        updateCounters(0, 0, 0);
        renderTable();
        return;
    }

    rawExcel.forEach(row => {
        const id = String(row[folioCol] || "").trim();
        if (!id) return;
        if (existingIds.includes(id)) {
            results.update.push(row);
        } else {
            results.new.push(row);
        }
    });
    
    updateCounters(rawExcel.length, results.new.length, results.update.length);
    renderTable();
}

function updateCounters(total, newCount, updateCount) {
    document.getElementById('txtTotal').textContent = total;
    document.getElementById('txtNew').textContent = newCount;
    document.getElementById('txtUpdate').textContent = updateCount;
}

function formatDateDB(value) {
    if (!value) return "";
    let date;
    if (typeof value === 'number' && !isNaN(value)) {
        date = new Date((value - 25569) * 86400 * 1000);
    } else {
        date = new Date(value);
    }
    
    if (isNaN(date.getTime())) {
        const parts = String(value).split(/[-/.]/);
        if (parts.length === 3) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1;
            const day = parseInt(parts[2]);
            date = (year.toString().length === 4) ? new Date(year, month, day) : new Date(parseInt(parts[2]), month, day);
        }
    }
    
    if (isNaN(date.getTime())) return String(value).trim();
    
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0');
}

function formatAadhaar(value) {
    return String(value).replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1-').substring(0, 14);
}

function getMapping() {
    const mapping = {};
    document.querySelectorAll('.map-select').forEach(select => {
        if (select.value) mapping[select.dataset.schema] = select.value;
    });
    return mapping;
}

async function deployChanges() {
    const mapping = getMapping();
    const idKey = currentMode === 'student' ? 'profile.folio' : 'empId';
    
    if (!mapping[idKey]) {
        alert(`${currentMode === 'student' ? 'Folio' : 'Employee ID'} column mapping is required!`);
        return;
    }

    const targetRows = [...results.new, ...results.update];
    if (targetRows.length === 0) return;

    const btn = document.getElementById('process-btn');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "PROCESSING...";

    const updates = {};
    const targetPath = currentMode === 'student' ? 'student' : 'employees';
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    try {
        for (const row of targetRows) {
            const id = String(row[mapping[idKey]]).trim();
            if (!id) continue;

            for (const field of activeSchema) {
                const col = mapping[field.id];
                if (!col) continue;

                const rawValue = row[col];
                const valueStr = String(rawValue).trim().toUpperCase();

                if (valueStr === "#EMPTY" || valueStr === "") {
                    updates[`${targetPath}/${id}/${field.id.replace(/\./g, '/')}`] = null;
                    continue;
                }

                let finalValue = rawValue;
                if (field.format === 'aadhaar') finalValue = formatAadhaar(finalValue);
                else if (field.format === 'date') finalValue = formatDateDB(finalValue);

                updates[`${targetPath}/${id}/${field.id.replace(/\./g, '/')}`] = finalValue;
            }

            if (currentMode === 'staff') {
                updates[`${targetPath}/${id}/lastModified`] = timestamp;
                if (results.new.some(r => String(r[mapping[idKey]]).trim() === id)) {
                    updates[`${targetPath}/${id}/password`] = btoa("123456");
                    updates[`${targetPath}/${id}/status`] = "active";
                }
            }
        }

        await db.ref().update(updates);
        alert(`Success: ${targetRows.length} records processed!`);
        location.reload();
    } catch (error) {
        console.error('Deployment error:', error);
        alert("Deployment failed.");
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

function renderTable() {
    const mapping = getMapping();
    const activeData = results[currentTab].slice(0, 50);
    const selectedFields = activeSchema.filter(f => mapping[f.id]);
    const table = document.getElementById('preview-table');
    
    if (!table || activeData.length === 0) {
        if (table) table.innerHTML = `<tr><td class="p-20 text-center font-black text-slate-300 tracking-widest uppercase">No data available</td></tr>`;
        return;
    }

    let html = `<thead><tr class="bg-slate-50 sticky top-0 z-20">`;
    html += selectedFields.map(f => `<th class="p-4 text-[9px] font-black uppercase text-slate-400 border-b border-slate-200">${f.label}</th>`).join('');
    html += `</tr></thead><tbody class="divide-y divide-slate-50">`;
    
    activeData.forEach(row => {
        html += '<tr class="hover:bg-blue-50/30 transition-colors">';
        selectedFields.forEach(field => {
            let value = row[mapping[field.id]] || "-";
            if (value !== "-") {
                if (field.format === 'date') value = formatDateDB(value);
                else if (field.format === 'aadhaar') value = formatAadhaar(value);
            }
            html += `<td class="p-4 font-bold text-slate-600">${escapeHtml(value)}</td>`;
        });
        html += '</tr>';
    });
    
    table.innerHTML = html + '</tbody>';
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

function setTab(tab) {
    currentTab = tab;
    const nBtn = document.getElementById('tab-new');
    const uBtn = document.getElementById('tab-update');
    const active = "px-5 py-2 rounded-lg font-black text-[10px] uppercase transition-all bg-white text-blue-600 shadow-sm";
    const inactive = "px-5 py-2 rounded-lg font-black text-[10px] uppercase transition-all text-slate-400";
    
    nBtn.className = (tab === 'new') ? active : inactive;
    uBtn.className = (tab === 'update') ? active : inactive;
    renderTable();
}