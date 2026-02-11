window.init_due_demand = function(appState) {
    const content = document.getElementById('main-content');
    
    const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    const SESSION = "2025-26";
    const TUITION_ID = "-OiR_5s4SLaAmRj4IJfq";
    let RAW_STUDENTS = [], FILTERED = [], FOUNDATION = {}, PAGE_INDEX = 0;
    const PAGE_SIZE = 50;

    content.innerHTML = `
    <style>
        /* Scoped Container to prevent global CSS leakage */
        .due-demand-page {
            --brand: #4f46e5;
            --brand-dark: #3730a3;
            --success: #22c55e;
            --danger: #ef4444;
            --bg: #f8fafc;
            --card: #ffffff;
            --text: #1e293b;
            --muted: #64748b;
            --border: #e2e8f0;
            
            background: var(--bg);
            padding: 16px;
            color: var(--text);
            font-size: 14px;
            width: 100%;
            min-height: 100%;
            box-sizing: border-box;
        }

        .due-demand-page * { 
            box-sizing: border-box; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .due-demand-page .header-panel {
            background: var(--card);
            padding: 20px;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            border: 1px solid var(--border);
            margin-bottom: 20px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 12px;
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .due-demand-page .input-item { 
            display: flex; 
            flex-direction: column; 
            gap: 4px; 
            min-width: 0;
        }
        .due-demand-page .input-item label { 
            font-size: 10px; 
            font-weight: 700; 
            color: var(--brand); 
            text-transform: uppercase; 
            letter-spacing: 0.3px; 
        }
        
        .due-demand-page select, .due-demand-page input {
            padding: 8px 12px;
            border: 1.5px solid var(--border);
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            outline: none;
            background: #fff;
            transition: all 0.2s ease;
            height: 36px;
        }
        .due-demand-page select:focus, .due-demand-page input:focus { 
            border-color: var(--brand); 
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); 
        }

        .due-demand-page .action-btns { 
            display: flex; 
            gap: 8px; 
            align-items: flex-end; 
            grid-column: span 2;
        }
        .due-demand-page .btn {
            height: 36px; 
            padding: 0 14px; 
            border: none; 
            border-radius: 8px;
            font-weight: 600; 
            cursor: pointer; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            gap: 6px;
            font-size: 13px;
            transition: all 0.2s ease;
        }
        .due-demand-page .btn-main { 
            background: var(--brand); 
            color: white; 
            flex-grow: 1; 
        }
        .due-demand-page .btn-main:hover { 
            background: var(--brand-dark); 
            transform: translateY(-1px); 
        }
        .due-demand-page .btn-icon { 
            background: #f1f5f9; 
            color: var(--muted); 
            border: 1.5px solid var(--border); 
            width: 36px;
        }
        .due-demand-page .btn-icon:hover { 
            background: var(--brand); 
            color: white; 
        }

        .due-demand-page .ledger-container {
            background: var(--card);
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            overflow: hidden;
            border: 1px solid var(--border);
            max-height: 75vh;
            overflow-y: auto;
        }
        
        .due-demand-page .table-container {
            overflow-x: auto;
        }
        .due-demand-page table { 
            width: 100%; 
            border-collapse: collapse; 
            min-width: 1000px;
        }
        .due-demand-page th { 
            background: #f8fafc; 
            padding: 14px 16px; 
            font-size: 10px; 
            color: var(--muted); 
            text-transform: uppercase; 
            letter-spacing: 0.8px; 
            text-align: left;
            position: sticky;
            top: 0;
            z-index: 10;
            border-bottom: 2px solid var(--border);
            white-space: nowrap;
        }
        .due-demand-page td { 
            padding: 16px; 
            border-bottom: 1px solid #f1f5f9; 
            vertical-align: top; 
            font-size: 13px;
        }

        .due-demand-page .stu-name { 
            font-size: 15px; 
            font-weight: 700; 
            color: var(--text); 
            margin-bottom: 4px; 
        }
        .due-demand-page .phone-link { 
            color: var(--brand); 
            text-decoration: none; 
            font-size: 12px; 
            font-weight: 600; 
            display: flex; 
            align-items: center; 
            gap: 4px; 
        }

        .due-demand-page .badge { 
            padding: 3px 8px; 
            border-radius: 6px; 
            font-size: 9px; 
            font-weight: 700; 
        }
        .due-demand-page .badge-folio { background: #1e293b; color: white; }
        .due-demand-page .badge-type { background: #e0e7ff; color: #4338ca; }

        .due-demand-page .m-grid { 
            display: grid; 
            grid-template-columns: repeat(6, 1fr); 
            gap: 3px; 
            max-width: 180px; 
        }
        .due-demand-page .m-item { 
            font-size: 8px; 
            text-align: center; 
            padding: 4px 2px; 
            border-radius: 4px; 
            font-weight: 700; 
            border: 1px solid #f1f5f9; 
        }
        .due-demand-page .paid { background: var(--success); color: white; }
        .due-demand-page .due { background: #fee2e2; color: var(--danger); }
        .due-demand-page .empty { background: #f8fafc; color: #cbd5e1; }
        .due-demand-page .disabled { background: #f1f5f9; color: #94a3b8; border-color: #e2e8f0; }

        .due-demand-page .due-total { 
            font-size: 22px; 
            font-weight: 800; 
            color: var(--text); 
            margin-top: 8px;
        }

        .due-demand-page .btn-wa {
            width: 34px; height: 34px; border-radius: 50%; 
            background: #25d366; color: white; border: none; 
            cursor: pointer; display: flex; align-items: center; 
            justify-content: center; float: right; margin-top: 8px;
            box-shadow: 0 2px 8px rgba(37, 211, 102, 0.3);
        }

        @media print {
            .due-demand-page .header-panel, 
            .due-demand-page .btn-wa, 
            .due-demand-page #loadMoreArea { display: none !important; }
            .due-demand-page { padding: 0; background: white; }
            .due-demand-page .ledger-container { border: none; box-shadow: none; max-height: none; }
            .due-demand-page th { position: static; }
        }

        @media (max-width: 768px) {
            .due-demand-page { padding: 12px; }
            .due-demand-page .header-panel { grid-template-columns: 1fr; }
            .due-demand-page .action-btns { grid-column: span 1; }
            .due-demand-page .m-grid { grid-template-columns: repeat(3, 1fr); }
        }
    </style>

    <div class="due-demand-page">
        <div class="header-panel">
            <div class="input-item">
                <label>Search</label>
                <input type="text" id="searchQ" placeholder=" Search " onkeydown="handleEnter(event)">
            </div>
            <div class="input-item">
                <label>Branch</label>
                <select id="branchF" onchange="syncClasses()"><option value="All">All Branches</option></select>
            </div>
            <div class="input-item">
                <label>Class</label>
                <select id="classF" onchange="syncSections()"><option value="All">All Classes</option></select>
            </div>
            <div class="input-item">
                <label>Section</label>
                <select id="sectionF"><option value="All">All Sections</option></select>
            </div>
            <div class="input-item">
                <label>Type</label>
                <select id="typeF">
                    <option value="All">All</option>
                    <option value="GENERAL">GENERAL</option>
                    <option value="RTE">RTE</option>
                    <option value="FREE">FREE</option>
                </select>
            </div>
            <div class="input-item">
                <label>Dues Until</label>
                <select id="monthF"></select>
            </div>
            <div class="input-item">
                <label>Status</label>
                <select id="statusF">
                    <option value="All">All Students</option>
                    <option value="PAID">Paid</option>
                    <option value="DUE">Due</option>
                </select>
            </div>
            <div class="action-btns">
                <button class="btn btn-icon" onclick="resetFilters()" title="Reset" style="width: 100px; height: 40px;">
                    <i data-lucide="refresh-cw" size="18"></i> <span style="font-size: 14px;">RESET</span>
                </button>
                <button class="btn btn-icon" onclick="printFilteredList()" title="Print" style="width: 100px; height: 40px;">
                    <i data-lucide="printer" size="18"></i> <span style="font-size: 14px;">PRINT</span>
                </button>
                <button class="btn btn-main" onclick="initSearch()" style="width: 100px; height: 40px;">
                    <i data-lucide="zap" size="18"></i> <span style="font-size: 14px;">LOAD</span>
                </button>
            </div>
        </div>

        <div class="ledger-container">
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th style="width: 25%;">Student Profile</th>
                            <th style="width: 25%;">Annual Heads</th>
                            <th style="width: 35%;">Monthly Matrix</th>
                            <th style="width: 15%; text-align: right;">Outstanding</th>
                        </tr>
                    </thead>
                    <tbody id="ledgerBody">
                        <tr>
                            <td colspan="4" style="text-align:center; padding: 40px;">Click LOAD to fetch data...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div id="loadMoreArea" style="display:none; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9;">
                <button class="btn btn-main" style="width: 180px;" onclick="renderRows(true)">Load More</button>
            </div>
        </div>
    </div>
    `;
    
    if(window.lucide) {
        lucide.createIcons();
    }


    function showLoading(message = "Loading...") {
        document.getElementById('ledgerBody').innerHTML = `<tr class="loading"><td colspan="4">${message}</td></tr>`;
    }

    function showError(message) {
        document.getElementById('ledgerBody').innerHTML = `<tr class="no-data error"><td colspan="4"><strong>❌ Error:</strong> ${message}</td></tr>`;
    }

    function showNoData(message = "No students found matching your filters") {
        document.getElementById('ledgerBody').innerHTML = `<tr class="no-data"><td colspan="4">${message}</td></tr>`;
        document.getElementById('loadMoreArea').style.display = 'none';
    }

    async function startup() {
        try {
            showLoading("Loading foundation data...");
            const snap = await db.ref('foundation').once('value');
            FOUNDATION = snap.val() || {};
            
            const monthF = document.getElementById('monthF');
            MONTHS.forEach(m => monthF.add(new Option(m, m)));
            monthF.value = "Sep";

            const branchF = document.getElementById('branchF');
            branchF.innerHTML = '<option value="All">All Branches</option>';
            if (FOUNDATION.branches) {
                Object.values(FOUNDATION.branches)
                    .sort((a,b) => (a.name || '').localeCompare(b.name || ''))
                    .forEach(b => branchF.add(new Option(b.name, b.name)));
            }

            syncClasses();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch (e) {
            showError("Failed to load foundation data");
        }
    }

    function syncClasses() {
        const branch = document.getElementById('branchF').value;
        const clsF = document.getElementById('classF');
        
        clsF.innerHTML = '<option value="All">All Classes</option>';
        
        if (FOUNDATION.classes) {
            const filtered = Object.values(FOUNDATION.classes)
                .filter(c => branch === "All" || c.branch === branch);
            const uniqueNames = [...new Set(filtered.map(c => c.className))].sort();
            uniqueNames.forEach(name => clsF.add(new Option(name, name)));
        }
        syncSections();
    }

    function syncSections() {
        const branch = document.getElementById('branchF').value;
        const cls = document.getElementById('classF').value;
        const secF = document.getElementById('sectionF');
        
        secF.innerHTML = '<option value="All">All Sections</option>';

        if (FOUNDATION.classes && cls !== "All") {
            const classEntry = Object.values(FOUNDATION.classes).find(c => 
                c.className === cls && (branch === "All" || c.branch === branch)
            );
            if (classEntry && classEntry.sections) {
                classEntry.sections.split(',').forEach(p => {
                    const sName = p.trim();
                    if (sName) secF.add(new Option(sName, sName));
                });
            }
        }
    }

    function handleEnter(e) { 
        if (e.key === 'Enter') {
            e.preventDefault();
            initSearch();
        }
    }

    async function initSearch() {
        try {
            const branchVal = document.getElementById('branchF').value;
            const classVal = document.getElementById('classF').value;
            
            showLoading("Fetching optimized data...");

            let query = db.ref('student');
            if (classVal !== "All") {
                query = query.orderByChild('academic/class').equalTo(classVal);
            } else if (branchVal !== "All") {
                query = query.orderByChild('academic/branch').equalTo(branchVal);
            }

            const [stuSnap, recSnap] = await Promise.all([
                query.once('value'),
                db.ref('fee_receipts').once('value')
            ]);

            const students = stuSnap.val() || {};
            const allReceipts = Object.values(recSnap.val() || {});

            RAW_STUDENTS = Object.entries(students)
                .filter(([folio, s]) => folio && s)
                .map(([folio, s]) => {
                    const acad = s.academic || {};
                    const adm = s.admission || {};
                    const admDate = new Date(adm.admissionDate || 0);
                    const sessionStartYear = parseInt(SESSION.split('-')[0]);
                    const isRTE = ["RTE", "FREE"].includes(adm.type);
                    const isNew = admDate >= new Date(`${sessionStartYear}-04-01`);

                    const myRecs = allReceipts
                        .filter(r => r?.studentFolio === folio)
                        .sort((a, b) => new Date(a?.date || 0) - new Date(b?.date || 0));

                    let lastLedgerBalance = 0;
                    const paidList = {
                        monthly: new Set(),
                        fixed: new Set(),
                        tuition: new Set(),
                        transport: new Set()
                    };

                    myRecs.forEach(r => {
                        lastLedgerBalance = parseFloat(r.remainingDueInLedger) || 0;
                        if (r.session === SESSION && r.feesCollected) {
                            r.feesCollected.forEach(f => {
                                const cleanM = (f.month && f.month !== 'N/A') ? f.month.replace(/-\d{2}$/, '') : null;
                                if (f.feeHead === 'TUITION FEE' && cleanM) paidList.tuition.add(cleanM);
                                else if (f.feeHead && cleanM) paidList.monthly.add(`${f.feeHead}-${cleanM}`);
                                else if (f.feeKey) paidList.fixed.add(f.feeKey);
                            });
                        }
                    });

                    const annualCharges = [];
                    Object.entries(FOUNDATION.fee_heads || {}).forEach(([id, head]) => {
                        if (head?.rotation !== "Monthly" && !isRTE) {
                            const hName = (head.name || '').toLowerCase();
                            if (!isNew && (hName.includes("admission") || hName.includes("registration"))) return;
                            const amt = parseFloat(FOUNDATION.fee_master?.[SESSION]?.[id]?.amounts?.[acad.class] || 0);
                            if (amt > 0) annualCharges.push({ id, name: head.name, amount: amt });
                        }
                    });

                    const tuitionRate = parseFloat(FOUNDATION.fee_master?.[SESSION]?.[TUITION_ID]?.amounts?.[acad.class] || 0) * (isRTE ? 0 : 1);
                    
                    let transportRate = 0;
                    if (s.transport?.enabled && s.transport?.route && FOUNDATION.transport) {
                        const trKey = Object.keys(FOUNDATION.transport).find(k => FOUNDATION.transport[k]?.groupName === s.transport.route);
                        transportRate = parseFloat(FOUNDATION.transport_master?.[SESSION]?.amounts?.[trKey] || 0);
                    }

                    let startMonthIndex = 0;
                    if (isNew && !isRTE) {
                        const admMonthIndex = MONTHS.indexOf(MONTHS[admDate.getMonth()]);
                        startMonthIndex = (admDate.getDate() || 1) <= 15 ? admMonthIndex : (admMonthIndex + 1) % 12;
                    }

                    return {
                        folio,
                        name: s.profile?.studentName || "Unknown",
                        father: s.parents?.father?.name || "N/A",
                        ph1: s.contact?.phone1 || "",
                        branch: acad.branch || adm.branch || "Unknown",
                        class: acad.class || "N/A",
                        section: acad.section || "",
                        category: isRTE ? adm.type : (isNew ? "NEW" : "OLD"),
                        tuitionRate,
                        transportRate,
                        paidList,
                        paidT: paidList.tuition,
                        paidTr: paidList.transport,
                        paidAnn: paidList.fixed,
                        annualCharges,
                        oldDue: Math.max(0, lastLedgerBalance),
                        startMonthIndex,
                        status: 'PAID'
                    };
                });

            applyFilters();
        } catch (e) {
            showError(`Loading failed: ${e.message}`);
        }
    }

    function applyFilters() {
        const q = (document.getElementById('searchQ').value || '').toLowerCase().trim();
        const status = document.getElementById('statusF').value;
        const br = document.getElementById('branchF').value;
        const cl = document.getElementById('classF').value;
        const sc = document.getElementById('sectionF').value;
        const tp = document.getElementById('typeF').value;
        const monthF = document.getElementById('monthF').value;

        FILTERED = RAW_STUDENTS.filter(s => {
            const matchesSearch = !q || 
                s.name.toLowerCase().includes(q) || 
                s.folio.includes(q) || 
                (s.ph1 || '').includes(q);

            const matchesBranch = br === "All" || s.branch === br;
            const matchesClass = cl === "All" || s.class === cl;
            const matchesSection = sc === "All" || s.section === sc;

            let matchesType = true;
            if (tp !== "All") {
                if (tp === "GENERAL") matchesType = !["RTE", "FREE"].includes(s.category);
                else matchesType = s.category === tp;
            }

            let totalDue = 0;
            s.annualCharges.forEach(h => {
                if (!s.paidAnn.has(h.id)) totalDue += h.amount;
            });

            const mIdx = MONTHS.indexOf(monthF);
            MONTHS.forEach((m, i) => {
                if (i >= s.startMonthIndex && i <= mIdx) {
                    if (!s.paidT.has(m) && s.tuitionRate > 0) totalDue += s.tuitionRate;
                    if (s.transportRate > 0 && !s.paidTr.has(m)) totalDue += s.transportRate;
                }
            });

            const matchesStatus = status === 'All' || (totalDue > 0 ? 'DUE' : 'PAID') === status;
            s.status = totalDue > 0 ? 'DUE' : 'PAID';

            return matchesSearch && matchesStatus && matchesBranch && matchesClass && matchesSection && matchesType;
        }).sort((a,b) => a.name.localeCompare(b.name));

        PAGE_INDEX = 0;
        if (FILTERED.length === 0) {
            showNoData();
        } else {
            renderRows();
        }
    }

    function renderRows(append = false) {
        const monthF = document.getElementById('monthF').value;
        const mIdx = MONTHS.indexOf(monthF);
        const startIdx = PAGE_INDEX * PAGE_SIZE;
        const endIdx = (PAGE_INDEX + 1) * PAGE_SIZE;
        const chunk = FILTERED.slice(startIdx, endIdx);

        const rowsHtml = chunk.map(s => {
            let totalDue = 0;
            const annHtml = s.annualCharges.map(h => {
                const paid = s.paidAnn.has(h.id);
                if (!paid) totalDue += h.amount;

                const isOneTime = h.name.toLowerCase().includes('registration') || h.name.toLowerCase().includes('admission');
                const accentColor = paid ? '#10b981' : '#f43f5e';
                const subLabel = isOneTime ? 'One-Time Fee' : 'Yearly Charge';

                return `
                <div style="display:flex; justify-content:space-between; align-items:center; width: 49%; background:#ffffff; padding:4px 6px; margin-bottom:4px; border-radius:6px; border:1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0,0,0,0.02); font-family: 'Segoe UI', Roboto, sans-serif; box-sizing: border-box;">
                <div style="display:flex; align-items:center; gap:5px; overflow: hidden;">
                    <div style="width:2px; height:18px; background:${accentColor}; border-radius:4px; flex-shrink:0;"></div>
                    <div style="display:flex; align-items:baseline; gap:4px; overflow: hidden; white-space: nowrap;">
                        <span style="font-size:10px; font-weight:700; color:#334155; text-overflow: ellipsis; overflow: hidden;">${h.name}</span>
                        <span style="font-size:8px; color:#94a3b8; font-weight:400;">${subLabel}</span>
                    </div>
                </div>
                <div style="text-align:right; flex-shrink:0;">
                    <div style="font-size:10px; font-weight:800; color:${accentColor}; display:flex; align-items:center; justify-content:end; gap:2px; line-height:1;">
                        ${paid ? '<span style="font-size:10px;">✓</span>' : '₹'}
                        <span>${paid ? 'PAID' : h.amount}</span>
                    </div>
                    <div style="font-size:7px; color:${paid ? '#22c55e' : '#cbd5e1'}; font-weight:bold; transform: scale(0.9); origin: right;">
                        ${paid ? 'CLEARED' : 'DUE'}
                    </div>
                </div>
            </div>`;
            }).join('');

            const tuitionGrid = MONTHS.map((m, i) => {
                let className = 'empty';
                if (i < s.startMonthIndex) {
                    className = 'disabled';
                } else if (i <= mIdx) {
                    if (s.paidT.has(m)) {
                        className = 'paid';
                    } else if (s.tuitionRate > 0) {
                        className = 'due';
                        totalDue += s.tuitionRate;
                    } else {
                        className = 'paid';
                    }
                }
                return `<div class="m-item ${className}">${m}</div>`;
            }).join('');

            const transportGrid = s.transportRate > 0 ? MONTHS.map((m, i) => {
                let className = 'empty';
                if (i < s.startMonthIndex) {
                    className = 'disabled';
                } else if (i <= mIdx) {
                    if (s.paidTr.has(m)) {
                        className = 'paid';
                    } else {
                        className = 'due';
                        totalDue += s.transportRate;
                    }
                }
                return `<div class="m-item ${className}">${m}</div>`;
            }).join('') : '';

            return `<tr>
                <td style="padding: 20px 24px; background: #ffffff;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <span style="font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px;">
                        ${s.name}
                    </span>
                    <span style="font-size: 13px; color: #475569; font-weight: 600; display: flex; align-items: center; gap: 5px;">
                        <i data-lucide="user" size="13" style="color: #94a3b8;"></i> S/o ${s.father}
                    </span>
                    <a href="tel:${s.ph1}" style="text-decoration: none; display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                        <i data-lucide="phone" size="12" style="color: #10b981; stroke-width: 3;"></i>
                        <span style="color: #10b981; font-size: 13px; font-weight: 700;">${s.ph1 || 'N/A'}</span>
                    </a>
                    <div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
                        <div style="display: flex; align-items: center; background: #f1f5f9; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden;">
                            <span style="padding: 4px 10px; font-size: 11px; font-weight: 800; color: #475569; border-right: 1px solid #e2e8f0;">
                                #${s.folio}
                            </span>
                            <span style="padding: 4px 10px; font-size: 10px; font-weight: 900; background: ${s.category === 'RTE' ? '#fff1f2' : '#eff6ff'}; color: ${s.category === 'RTE' ? '#e11d48' : '#2563eb'}; text-transform: uppercase;">
                                ${s.category}
                            </span>
                        </div>
                        <div style="background: #f8fafc; padding: 4px 10px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 5px;">
                            <i data-lucide="layers" size="11" style="color: #64748b;"></i>
                            <span style="color: #1e293b; font-size: 11px; font-weight: 700;">${s.class}-${s.section}</span>
                        </div>
                        <div style="background: #f8fafc; padding: 4px 10px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 5px;">
                            <i data-lucide="map-pin" size="11" style="color: #64748b;"></i>
                            <span style="color: #1e293b; font-size: 11px; font-weight: 700;">${s.branch}</span>
                        </div>
                    </div>
                </div>
                </td>
                <td>${annHtml || '<span style="color:#cbd5e1; font-size:11px;">Exempted</span>'}</td>
                <td>
                    <div class="m-grid">${tuitionGrid}</div>
                    ${s.transportRate>0?`<div style="margin-top:8px" class="m-grid">${transportGrid}</div>`:''}
                </td>
                <td style="text-align:right; vertical-align: middle; padding: 15px 24px;">
                    <div style="font-size:10px; font-weight:800; color: #94a3b8; letter-spacing: 0.5px; margin-bottom: 2px;">TOTAL DUE</div>
                    <div class="due-total" style="font-size: 20px; font-weight: 900; color: #e11d48; margin-bottom: 10px;">
                        ₹${totalDue.toLocaleString('en-IN')}
                    </div>
                    
                    ${totalDue > 0 ? `
                        <button class="btn-wa" 
                            onclick="sendReminder('${s.name.replace(/'/g, "\\'")}', '${s.ph1}', ${totalDue})"
                            style="background: #22c55e; color: white; border: none; width: 42px; height: 42px; border-radius: 12px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);"
                            onmouseover="this.style.transform='scale(1.05)'; this.style.backgroundColor='#1eb353'"
                            onmouseout="this.style.transform='scale(1)'; this.style.backgroundColor='#22c55e'"
                            title="Send WhatsApp Reminder">
                            <i data-lucide="message-circle" size="22" style="stroke-width: 2.5px;"></i>
                        </button>
                    ` : `
                        <div style="color: #10b981; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: flex-end; gap: 4px; padding: 10px 0;">
                            <i data-lucide="check-circle" size="16"></i> PAID
                        </div>
                    `}
                </td>
            </tr>`;
        }).join('');

        const tbody = document.getElementById('ledgerBody');
        if (append) {
            tbody.insertAdjacentHTML('beforeend', rowsHtml);
        } else {
            tbody.innerHTML = rowsHtml;
        }

        PAGE_INDEX++;
        document.getElementById('loadMoreArea').style.display = 
            endIdx < FILTERED.length ? 'block' : 'none';

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function resetFilters() {
        document.getElementById('searchQ').value = '';
        ['statusF', 'branchF', 'classF', 'sectionF', 'typeF'].forEach(id => {
            document.getElementById(id).value = 'All';
        });
        document.getElementById('monthF').value = MONTHS[5];
        syncClasses();
        if (RAW_STUDENTS.length > 0) applyFilters();
    }

    function sendReminder(name, phone, amount) {
        const selectedMonth = document.getElementById('monthF').value;
        const academyName = "The Wings Foundation Academy";

        if (!phone || phone.replace(/\D/g, '').length < 10) {
            alert("❌ Error: Valid phone number not found!");
            return;
        }

        const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);

        const message = `*OFFICIAL FEE NOTIFICATION* 🏛️\n\n` +
                        `Dear Parent,\n\n` +
                        `This is a formal notice regarding the outstanding academic dues for *${name.toUpperCase()}* for the period ending *${selectedMonth}*.\n\n` +
                        `*Total Outstanding:* ₹${amount.toLocaleString('en-IN')}\n\n` +
                        `You are requested to clear this balance at the *Accounts Office* immediately.\n\n` +
                        `*By Order,*\n` +
                        `*Accounts Department*\n` +
                        `*${academyName}*`;

        const encodedMsg = encodeURIComponent(message);
        
        // Yahan change hai: 
        // Pehle koshish karega direct app (Deep Link) se kholne ki
        const appUrl = `whatsapp://send?phone=91${cleanPhone}&text=${encodedMsg}`;
        const webUrl = `https://wa.me/91${cleanPhone}?text=${encodedMsg}`;

        // Redirect Logic
        window.location.href = appUrl;

        // Backup: Agar 500ms tak app nahi khula (Desktop par), to web link pe bhej dega usi tab mein
        setTimeout(() => {
            if (document.hasFocus()) {
                window.location.href = webUrl;
            }
        }, 500);
    }

    window.printFilteredList = function() {
        if (FILTERED.length === 0) {
            alert("Print karne ke liye pehle LOAD button dabayein!");
            return;
        }

        const monthF = document.getElementById('monthF').value;
        const branchVal = document.getElementById('branchF').value;
        const classVal = document.getElementById('classF').value;

        const printWin = window.open('', '_blank');
        let reportHtml = `
        <html>
        <head>
            <title>Fee Demand Report - ${monthF}</title>
            <style>
                body { font-family: sans-serif; padding: 20px; font-size: 12px; }
                .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
                th { background: #f0f0f0; font-size: 11px; text-transform: uppercase; }
                .text-right { text-align: right; }
                .total-row { font-weight: bold; background: #f9f9f9; }
                @media print { @page { margin: 1cm; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h2 style="margin:0">OUTSTANDING FEE REPORT</h2>
                <p style="margin:5px 0">Session: ${SESSION} | Month: ${monthF} | Branch: ${branchVal} | Class: ${classVal}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Folio</th>
                        <th>Student Name</th>
                        <th>Father's Name</th>
                        <th>Class-Sec</th>
                        <th>Branch</th>
                        <th>Contact</th>
                        <th class="text-right">Due Amount</th>
                    </tr>
                </thead>
                <tbody>`;

        let grandTotal = 0;
        const mIdx = MONTHS.indexOf(monthF);

        FILTERED.forEach((s, index) => {
            let currentTotalDue = 0;
            s.annualCharges.forEach(h => {
                if (!s.paidAnn.has(h.id)) currentTotalDue += h.amount;
            });
            MONTHS.forEach((m, i) => {
                if (i >= s.startMonthIndex && i <= mIdx) {
                    if (!s.paidT.has(m) && s.tuitionRate > 0) currentTotalDue += s.tuitionRate;
                    if (s.transportRate > 0 && !s.paidTr.has(m)) currentTotalDue += s.transportRate;
                }
            });
            grandTotal += currentTotalDue;

            reportHtml += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${s.folio}</td>
                    <td><strong>${s.name}</strong></td>
                    <td>${s.father}</td>
                    <td>${s.class}-${s.section}</td>
                    <td>${s.branch}</td>
                    <td>${s.ph1}</td>
                    <td class="text-right">₹${currentTotalDue.toLocaleString()}</td>
                </tr>`;
        });

        reportHtml += `
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="7" class="text-right">GRAND TOTAL:</td>
                        <td class="text-right">₹${grandTotal.toLocaleString()}</td>
                    </tr>
                </tfoot>
            </table>
            <div style="margin-top:20px; font-size:10px; color:#666;">
                Generated on: ${new Date().toLocaleString()}
            </div>
            <script>window.onload = function() { window.print(); };</script>
        </body>
        </html>`;

        printWin.document.write(reportHtml);
        printWin.document.close();
    }

    document.getElementById('searchQ').addEventListener('input', function() {
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(applyFilters, 300);
    });

    ['branchF', 'classF', 'sectionF', 'typeF', 'monthF', 'statusF'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', function() {
                if (id === 'branchF') syncClasses();
                else if (id === 'classF') syncSections();
                if (RAW_STUDENTS.length > 0) setTimeout(applyFilters, 100);
            });
        }
    });

    window.handleEnter = handleEnter;
    window.initSearch = initSearch;
    window.renderRows = renderRows;
    window.resetFilters = resetFilters;
    window.sendReminder = sendReminder;
    window.printFilteredList = printFilteredList;
    window.syncClasses = syncClasses;
    window.syncSections = syncSections;

    startup();
};