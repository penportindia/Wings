window.init_payment_reports = function(state) {
    const content = document.getElementById('main-content');
    
    // 1. Inject Premium CSS
    const styleInject = document.createElement('style');
    styleInject.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .ledger-body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .collapsible-content { max-height: 0; overflow: hidden; transition: all 0.4s cubic-bezier(0, 1, 0, 1); opacity: 0; }
        .collapsible-content.open { max-height: 5000px; opacity: 1; transition: all 0.4s ease-in; padding-bottom: 2rem; }
        .active-filter { background: #2563eb !important; color: white !important; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4); }
        .stat-card:hover { transform: translateY(-5px); transition: all 0.3s ease; }
    `;
    document.head.appendChild(styleInject);

    // 2. Main UI Structure
    content.innerHTML = `
        <div class="ledger-body bg-slate-50 min-h-screen p-4 md:p-8 animate-in fade-in duration-700">
            
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div class="flex items-center gap-4 p-4 bg-white rounded-3xl shadow-sm border border-slate-100">
                    <div class="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                        <i data-lucide="indian-rupee" class="w-8 h-8"></i>
                    </div>
                    <div>
                        <h1 class="text-2xl font-black tracking-tight text-slate-800">Payment Ledger</h1>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Financial Session:</span>
                            <select id="session-selector" onchange="filterReportData()" 
                                class="appearance-none text-sm font-bold text-blue-600 bg-transparent outline-none cursor-pointer border-b-2 border-transparent hover:border-blue-200 focus:border-blue-600 transition-all">
                                <option value="ALL">ALL SESSIONS</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <button onclick="exportToExcel()" class="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-emerald-100 active:scale-95">
                        <i data-lucide="file-spreadsheet" class="w-4 h-4"></i> EXPORT DATA
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" id="stats-container"></div>

            <div class="bg-slate-900 rounded-[3rem] p-6 mb-8 shadow-2xl shadow-slate-300">
                <div class="flex flex-col lg:flex-row gap-6 items-center">
                    <div class="relative w-full lg:w-1/3">
                        <i data-lucide="search" class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500"></i>
                        <input type="text" id="report-search" oninput="filterReportData()" placeholder="Search Student, Father, Folio..." 
                            class="w-full pl-16 pr-6 py-5 rounded-[2rem] bg-slate-800 border-none text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium">
                    </div>
                    <div class="flex flex-wrap gap-2 justify-center" id="month-filters">
                        ${['ALL DATA', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR']
                            .map(m => `<button onclick="setMonthFilter('${m}')" id="btn-${m}" class="month-btn px-5 py-3 rounded-2xl text-[10px] font-bold bg-slate-800 text-slate-400 hover:text-white transition-all uppercase tracking-widest">${m}</button>`).join('')}
                    </div>
                </div>
            </div>

            <div id="report-list" class="space-y-8">
                <div class="p-20 text-center">
                    <div class="inline-block animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                    <p class="text-slate-400 font-bold italic">Synchronizing with Database...</p>
                </div>
            </div>
        </div>
    `;

    lucide.createIcons();
    fetchPaymentReports();
};

let allReceipts = [];
let currentMonthFilter = 'ALL DATA';

window.fetchPaymentReports = async function() {
    try {
        const [receiptSnap, studentSnap] = await Promise.all([
            db.ref('fee_receipts').once('value'),
            db.ref('student').once('value')
        ]);

        const receipts = receiptSnap.val() || {};
        const students = studentSnap.val() || {};

        allReceipts = Object.keys(receipts).map(key => {
            const r = receipts[key];
            const folioId = String(r.studentFolio || '').trim();
            const sData = students[folioId] || null;

            return {
                id: key,
                ...r,
                fatherName: sData?.parents?.father?.name || r.fatherName || "N/A",
                className: sData?.academic?.class || r.class || "N/A",
                sectionName: sData?.academic?.section || r.section || "A",
                stuName: sData?.profile?.studentName || r.studentName || "Unknown Student"
            };
        }).sort((a, b) => new Date(b.date) - new Date(a.date));

        const sessions = [...new Set(allReceipts.map(r => r.session))].filter(Boolean).sort().reverse();
        const selector = document.getElementById('session-selector');
        selector.innerHTML = '<option value="ALL">ALL SESSIONS</option>';
        sessions.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s; opt.textContent = s;
            selector.appendChild(opt);
        });

        setMonthFilter('ALL DATA');
    } catch (err) {
        console.error("Critical Load Error:", err);
        document.getElementById('report-list').innerHTML = `<div class="p-10 text-center text-red-500 font-bold">Error loading database.</div>`;
    }
};

window.setMonthFilter = function(month) {
    currentMonthFilter = month;
    document.querySelectorAll('.month-btn').forEach(btn => btn.classList.remove('active-filter'));
    const targetBtn = document.getElementById(`btn-${month}`);
    if (targetBtn) targetBtn.classList.add('active-filter');
    filterReportData();
};

window.filterReportData = function() {
    const searchQuery = document.getElementById('report-search').value.toLowerCase();
    const sessionQuery = document.getElementById('session-selector').value;

    const filtered = allReceipts.filter(r => {
        const matchSearch = (r.stuName || '').toLowerCase().includes(searchQuery) ||
            (r.fatherName || '').toLowerCase().includes(searchQuery) ||
            (r.studentFolio || '').toString().includes(searchQuery) ||
            (r.receiptNo || '').toString().toLowerCase().includes(searchQuery);

        const matchSession = sessionQuery === 'ALL' || r.session === sessionQuery;

        let matchMonth = true;
        if (currentMonthFilter !== 'ALL DATA') {
            const rMonth = new Date(r.date).toLocaleString('default', { month: 'short' }).toUpperCase();
            matchMonth = rMonth === currentMonthFilter;
        }
        return matchSearch && matchSession && matchMonth;
    });

    renderReport(filtered);
};

window.renderReport = function(receipts) {
    const listContainer = document.getElementById('report-list');
    let stats = { gross: 0, cash: 0, upi: 0, discount: 0 };

    const grouped = receipts.reduce((acc, r) => {
        const d = r.date.split('T')[0];
        if (!acc[d]) acc[d] = [];
        acc[d].push(r);
        return acc;
    }, {});

    let html = '';
    const sortedDates = Object.keys(grouped).sort().reverse();

    sortedDates.forEach((date) => {
        const dayEntries = grouped[date];
        let dayTotal = 0;

        const rows = dayEntries.map(item => {
            const amt = Number(item.totalCollected) || 0;
            const disc = Number(item.discount) || 0;
            dayTotal += amt;
            stats.gross += amt;
            stats.discount += disc;

            const isCash = (item.mode || '').toLowerCase() === 'cash';
            isCash ? (stats.cash += amt) : (stats.upi += amt);

            const feesList = item.feesCollected || [];
            const groupedFees = feesList.reduce((acc, f) => {
                const head = f.feeHead || f.head || 'Fee';
                if (!acc[head]) {
                    acc[head] = { head: head, totalAmount: 0, count: 0, unitPrice: f.amount || 0, months: [] };
                }
                acc[head].totalAmount += Number(f.amount || 0);
                acc[head].count += 1;
                if (f.month) acc[head].months.push(f.month);
                return acc;
            }, {});

            const breakdownHtml = Object.values(groupedFees).map(f => {
                const monthText = f.months.length > 0 ? `(${f.months.join(', ')})` : '';
                const calculationTag = f.count > 1 ?
                    `<span class="text-slate-400 mx-1 font-medium">${f.count} × ₹${f.unitPrice} =</span>` :
                    '';

                return `
                    <div class="text-[10px] bg-white border border-slate-200 pl-2 pr-2.5 py-1.5 rounded-lg shadow-sm flex items-center flex-wrap">
                        <span class="font-bold text-slate-700">${f.head}</span>
                        ${monthText ? `<span class="text-blue-600 font-bold ml-1 text-[9px]">${monthText}</span>` : ''}
                        <div class="ml-2 flex items-center bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                            ${calculationTag}
                            <span class="text-slate-700 font-black">₹${f.totalAmount}</span>
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <tr class="border-b border-slate-100 hover:bg-blue-50/40 transition-all group">
                    <td class="px-6 py-5">
                        <span class="text-[9px] font-mono font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                            #${item.receiptNo || '......'} 
                        </span>
                        <p class="text-sm font-extrabold text-slate-800 mt-1">${item.stuName}</p>
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">S/O: ${item.fatherName}</p>
                        <div class="mt-3 flex items-center gap-1.5">
                           <span class="text-[8px] font-black bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md uppercase">Collector</span>
                           <span class="text-[10px] font-bold text-slate-600">${item.collectedBy || 'N/A'}</span>
                        </div>
                    </td>
                    <td class="px-6 py-5 text-center">
                        <div class="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl text-[10px] font-black w-fit mx-auto uppercase mb-1">
                            ${item.className} - ${item.sectionName}
                        </div>
                        <p class="text-[10px] font-bold text-slate-400">Folio: ${item.studentFolio}</p>
                    </td>
                    <td class="px-6 py-5">
                        <div class="flex flex-wrap gap-2 max-w-[450px] justify-center">
                            ${breakdownHtml}
                        </div>
                    </td>
                    <td class="px-6 py-5">
                        <div class="flex flex-col items-center gap-1">
                            <div class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full ${isCash ? 'bg-emerald-500' : 'bg-blue-600'}"></span>
                                <span class="text-[10px] font-black uppercase text-slate-700">${item.mode || 'N/A'}</span>
                            </div>
                            ${!isCash && item.transactionId && item.transactionId !== 'N/A' ? `
                                <p class="text-[9px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    ID: ${item.transactionId}
                                </p>
                            ` : ''}
                        </div>
                    </td>
                    <td class="px-6 py-5 text-right">
                        <p class="text-base font-black text-slate-900 tracking-tight">₹${amt.toLocaleString('en-IN')}</p>
                        ${disc > 0 ? `<p class="text-[9px] font-bold text-rose-500">Disc: -₹${disc}</p>` : ''}
                    </td>
                </tr>
            `;
        }).join('');

        html += `
            <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 overflow-hidden mb-6">
                <div onclick="this.nextElementSibling.classList.toggle('open')" class="px-8 py-6 flex flex-wrap justify-between items-center cursor-pointer hover:bg-slate-50/80 transition-all">
                    <div class="flex items-center gap-6">
                        <div class="bg-slate-900 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform">
                            <span class="text-[9px] font-bold opacity-40 uppercase leading-none mb-1">${new Date(date).toLocaleString('default', { month: 'short' })}</span>
                            <span class="text-xl font-black">${new Date(date).getDate()}</span>
                        </div>
                        <div>
                            <h3 class="font-black text-slate-800 text-lg uppercase tracking-tight">${new Date(date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric' })}</h3>
                            <div class="flex items-center gap-2">
                                <span class="flex h-2 w-2 rounded-full bg-blue-600"></span>
                                <p class="text-xs font-bold text-blue-600 uppercase tracking-widest">${dayEntries.length} Records</p>
                            </div>
                        </div>
                    </div>
                    <div class="text-right bg-slate-50 px-6 py-2 rounded-2xl border border-slate-100 shadow-inner">
                        <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-0.5">Daily Total</span>
                        <span class="text-2xl font-black text-slate-900">₹${dayTotal.toLocaleString('en-IN')}</span>
                    </div>
                </div>
                <div class="collapsible-content">
                    <div class="overflow-x-auto px-6 pb-6">
                        <table class="w-full text-left border-separate border-spacing-y-2">
                            <thead class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <tr>
                                    <th class="px-6 py-4">Student & Collected By</th>
                                    <th class="px-6 py-4 text-center">Academic</th>
                                    <th class="px-6 py-4 text-center">Fee Breakdown</th>
                                    <th class="px-6 py-4 text-center">Payment Info</th>
                                    <th class="px-6 py-4 text-right">Collected</th>
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    });

    listContainer.innerHTML = html || `<div class="p-20 text-center text-slate-400 font-bold italic">No financial records found.</div>`;
    updateStatsGrid(stats);
    if (window.lucide) lucide.createIcons();
};

window.exportToExcel = function() {
    const searchQuery = document.getElementById('report-search').value.toLowerCase();
    const sessionQuery = document.getElementById('session-selector').value;

    const dataToExport = allReceipts.filter(r => {
        const matchSearch = (r.stuName || '').toLowerCase().includes(searchQuery) ||
            (r.fatherName || '').toLowerCase().includes(searchQuery) ||
            (r.studentFolio || '').toString().includes(searchQuery) ||
            (r.receiptNo || '').toString().toLowerCase().includes(searchQuery);

        const matchSession = sessionQuery === 'ALL' || r.session === sessionQuery;

        let matchMonth = true;
        if (currentMonthFilter !== 'ALL DATA') {
            const rMonth = new Date(r.date).toLocaleString('default', { month: 'short' }).toUpperCase();
            matchMonth = rMonth === currentMonthFilter;
        }
        return matchSearch && matchSession && matchMonth;
    });

    if (dataToExport.length === 0) {
        alert("No data found for the current filters!");
        return;
    }

    let csv = "\ufeff";
    csv += "Receipt No,Date,Student Name,Father Name,Folio,Class,Section,Mode,Transaction ID,Amount,Discount,Collected By\n";

    dataToExport.forEach(r => {
        const cleanDate = new Date(r.date).toLocaleDateString('en-GB');
        const row = [
            r.receiptNo || 'N/A',
            cleanDate,
            r.stuName || 'N/A',
            r.fatherName || 'N/A',
            r.studentFolio || 'N/A',
            r.className || 'N/A',
            r.sectionName || 'N/A',
            r.mode || 'N/A',
            r.transactionId || 'N/A',
            r.totalCollected || 0,
            r.discount || 0,
            r.collectedBy || 'N/A'
        ];
        csv += row.map(val => `"${val}"`).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const dateStamp = new Date().toISOString().split('T')[0];
    const fileName = `Fee_Report_${currentMonthFilter.replace(/\s+/g, '_')}_${dateStamp}.csv`;

    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

function updateStatsGrid(s) {
    const container = document.getElementById('stats-container');
    const gross = s.gross || 0;
    const cashPerc = gross > 0 ? Math.round((s.cash / gross) * 100) : 0;
    const upiPerc = gross > 0 ? Math.round((s.upi / gross) * 100) : 0;
    container.innerHTML = `
        ${renderStatCard('TOTAL GROSS', '₹' + gross.toLocaleString(), 'Net Revenue', 'blue')}
        ${renderStatCard('CASH PAYMENTS', '₹' + s.cash.toLocaleString(), `${cashPerc}% Cash`, 'emerald')}
        ${renderStatCard('UPI / ONLINE', '₹' + s.upi.toLocaleString(), `${upiPerc}% UPI`, 'indigo')}
        ${renderStatCard('TOTAL DISCOUNTS', '₹' + s.discount.toLocaleString(), 'Exemptions', 'rose')}
    `;
}

function renderStatCard(title, value, subtext, color) {
    const colorMap = {
        blue: 'text-blue-600 bg-blue-50',
        emerald: 'text-emerald-600 bg-emerald-50',
        indigo: 'text-indigo-600 bg-indigo-50',
        rose: 'text-rose-600 bg-rose-50'
    };
    return `
        <div class="stat-card bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200/60">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">${title}</p>
            <h2 class="text-3xl font-black text-slate-900">${value}</h2>
            <div class="mt-4 flex items-center gap-2 text-[10px] font-bold ${colorMap[color]} w-fit px-3 py-1 rounded-full uppercase">${subtext}</div>
        </div>
    `;
}