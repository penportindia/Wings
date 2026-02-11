window.init_daybook = async function(state) {
    const content = document.getElementById('main-content');
    const today = new Date().toISOString().split('T')[0];
    const currentUser = state.user?.name || "System Admin";
    let activeListener = null;

    // --- 1. FULL UI STRUCTURE & STYLING (MODERNIZED) ---
    content.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=JetBrains+Mono:wght@500&display=swap');
            
            :root { 
                --glass: rgba(255, 255, 255, 0.98); 
                --border: #e2e8f0;
                --slate-900: #0f172a;
                --indigo-600: #4f46e5;
            }

            .daybook-wrapper { 
                font-family: 'Inter', sans-serif; 
                background: transparent; 
                min-height: 100vh; 
                padding-bottom: 80px;
                color: var(--slate-900);
            }

            .dashboard-card { 
                background: white; 
                border-radius: 1.5rem; 
                border: 1px solid var(--border); 
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
            }
            .dashboard-card:hover { 
                transform: translateY(-5px); 
                box-shadow: 0 25px 30px -10px rgba(0,0,0,0.08); 
            }

            .gradient-dark { 
                background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); 
                color: white; 
            }

            .table-container { 
                height: calc(100vh - 580px); 
                min-height: 500px; 
                overflow-y: auto; 
                scrollbar-width: thin;
            }
            .table-container::-webkit-scrollbar { width: 6px; }
            .table-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

            .sticky-header { 
                position: sticky; 
                top: 0; 
                background: rgba(255,255,255,0.9); 
                backdrop-filter: blur(8px); 
                z-index: 20; 
            }

            .staff-badge { 
                background: #f8fafc; color: #475569; padding: 6px 12px; 
                border-radius: 10px; font-size: 10px; font-weight: 900; 
                border: 1px solid #e2e8f0; text-transform: uppercase; 
            }
            .txn-ref { 
                font-family: 'JetBrains Mono', monospace; font-size: 11px; 
                color: #6366f1; background: #eef2ff; padding: 4px 8px; 
                border-radius: 6px; font-weight: 600;
            }
            
            #voucherModal { 
                display:none; position:fixed; inset:0; 
                background:rgba(15, 23, 42, 0.8); backdrop-filter:blur(12px); 
                z-index:9999; align-items:center; justify-content:center; 
            }
            .modal-content { 
                background:white; width:95%; max-width:650px; 
                border-radius:2.5rem; overflow:hidden; 
                animation: modalSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); 
            }

            @keyframes modalSlideUp { 
                from { transform: translateY(100px); opacity: 0; } 
                to { transform: translateY(0); opacity: 1; } 
            }

            @media print {
                .no-print { display: none !important; }
                .daybook-wrapper { background: white; padding: 0; }
                .dashboard-card { border: 1px solid #eee; box-shadow: none; }
                body { background: white; }
                .table-container { height: auto !important; overflow: visible !important; }
            }
        </style>

        <div class="daybook-wrapper">
            <div id="voucherModal" class="no-print">
                <div class="modal-content shadow-2xl">
                    <div class="p-10 border-b bg-slate-50 flex justify-between items-center">
                        <div>
                            <h3 class="text-3xl font-black text-slate-800 tracking-tighter uppercase">Voucher Entry</h3>
                            <p class="text-[11px] text-indigo-600 font-black uppercase mt-1 tracking-widest flex items-center gap-2">
                                <i class="fas fa-user-shield"></i> By: ${currentUser}
                            </p>
                        </div>
                        <button onclick="closeDaybookModal()" class="h-14 w-14 rounded-2xl hover:bg-rose-100 hover:text-rose-600 transition-all text-slate-400 flex items-center justify-center">
                            <i class="fas fa-times text-2xl"></i>
                        </button>
                    </div>

                    <form id="voucherForm" class="p-10 space-y-8">
                        <div class="grid grid-cols-2 gap-6">
                            <div class="col-span-2">
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paid To / Particulars</label>
                                <input type="text" id="v_paidTo" required placeholder="Name of Person or Service" 
                                    class="w-full mt-2 p-5 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                            </div>
                            
                            <div>
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (₹)</label>
                                <input type="number" id="v_amount" required step="any" placeholder="0.00" 
                                    class="w-full mt-2 p-5 bg-slate-50 rounded-2xl border-none font-black text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                            </div>

                            <div>
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                <select id="v_category" class="w-full mt-2 p-5 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 ring-1 ring-slate-200 outline-none">
                                    <optgroup label="Direct Expenses">
                                        <option>Salary</option><option>Fuel</option><option>Maintenance</option>
                                        <option>Stationery</option><option>Handover</option><option>Advance</option><option>Other</option>
                                    </optgroup>
                                    <optgroup label="Contra (Internal Transfer)">
                                        <option value="Bank Deposit">Cash to Bank</option>
                                        <option value="Cash Withdrawal">Bank to Cash</option>
                                    </optgroup>
                                    <optgroup label="Account Setup">
                                        <option value="Opening Cash">Opening Balance (Cash)</option>
                                        <option value="Opening Bank">Opening Balance (Bank)</option>
                                    </optgroup>
                                </select>
                            </div>

                            <div>
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Mode</label>
                                <select id="v_mode" onchange="window.toggleRef()" class="w-full mt-2 p-5 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 ring-1 ring-slate-200 outline-none">
                                    <option value="Cash">Cash</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                </select>
                            </div>

                            <div id="refContainer" class="hidden">
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reference ID</label>
                                <input type="text" id="v_refNo" placeholder="Ref/UTR Number" 
                                    class="w-full mt-2 p-5 bg-blue-50 rounded-2xl border-none font-bold text-blue-700 ring-1 ring-blue-100 outline-none">
                            </div>

                            <div class="col-span-2">
                                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transaction Remarks</label>
                                <textarea id="v_remark" rows="2" placeholder="Describe the purpose..." 
                                    class="w-full mt-2 p-5 bg-slate-50 rounded-2xl border-none font-semibold text-slate-600 ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
                            </div>
                        </div>
                        <button type="submit" class="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl transform active:scale-[0.98]">
                            Post Transaction
                        </button>
                    </form>
                </div>
            </div>

            <div class="p-8 max-w-[1700px] mx-auto">
                <header class="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-8 no-print">
                    <div class="flex items-center gap-6 p-4">
                        <div class="relative group">
                            <div class="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                            
                            <div class="relative h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl transform transition-transform duration-300 hover:scale-105">
                                <i class="fas fa-book-open text-2xl text-indigo-400"></i>
                                <div class="absolute -bottom-1 -right-1 h-6 w-6 bg-emerald-500 rounded-lg border-2 border-white flex items-center justify-center">
                                    <i class="fas fa-check text-[10px] text-white"></i>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-col">
                            <h1 class="text-4xl font-black text-slate-800 tracking-tight uppercase leading-none">
                                Day<span class="text-indigo-600">Book</span>
                            </h1>

                            <div class="flex items-center gap-3 mt-2">
                                <div class="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-md">
                                    <i class="fas fa-calendar-day text-indigo-500 text-[10px]"></i>
                                    <span id="displayDate" class="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                                        Validating...
                                    </span>
                                </div>
                                
                                <span class="relative flex h-2 w-2">
                                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-6 bg-white p-4 rounded-[2rem] border border-slate-200 shadow-xl no-print">
                        <div class="flex items-center px-6 gap-4 border-r border-slate-100">
                             <i class="fas fa-filter text-slate-300"></i>
                             <input type="date" id="selectedDate" value="${today}" onchange="window.reloadEngine()" 
                                class="bg-transparent py-2 font-black text-slate-800 outline-none cursor-pointer text-lg">
                        </div>
                        <button onclick="window.printDaybookReport()" class="h-14 w-14 flex items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                            <i class="fas fa-print text-xl"></i>
                        </button>
                        <button onclick="openDaybookModal()" class="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.15em] hover:bg-indigo-700 hover:shadow-indigo-200 hover:shadow-2xl transition-all active:scale-95">
                            New Voucher
                        </button>
                    </div>
                </header>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    <div class="dashboard-card p-10 border-t-8 border-emerald-500">
                        <div class="flex justify-between items-start mb-8">
                            <p class="text-[12px] font-black text-slate-400 uppercase tracking-widest">Liquid Cash</p>
                            <div class="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shadow-inner"><i class="fas fa-wallet"></i></div>
                        </div>
                        <h2 id="cashBalance" class="text-4xl font-black text-slate-800 tracking-tight">₹0</h2>
                        <div class="mt-8 flex justify-between border-t border-slate-50 pt-6">
                            <div class="flex flex-col"><span class="text-[10px] font-black text-slate-400 uppercase">Cash In</span><span id="todayCashInc" class="text-lg font-black text-emerald-600">+0</span></div>
                            <div class="flex flex-col text-right"><span class="text-[10px] font-black text-slate-400 uppercase">Cash Out</span><span id="todayCashExp" class="text-lg font-black text-rose-500">-0</span></div>
                        </div>
                    </div>

                    <div class="dashboard-card p-10 border-t-8 border-blue-600">
                        <div class="flex justify-between items-start mb-8">
                            <p class="text-[12px] font-black text-slate-400 uppercase tracking-widest">Bank Balance</p>
                            <div class="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-inner"><i class="fas fa-university"></i></div>
                        </div>
                        <h2 id="bankBalance" class="text-4xl font-black text-slate-800 tracking-tight">₹0</h2>
                        <div class="mt-8 flex justify-between border-t border-slate-50 pt-6">
                            <div class="flex flex-col"><span class="text-[10px] font-black text-slate-400 uppercase">Bank In</span><span id="todayBankIn" class="text-lg font-black text-blue-600">+0</span></div>
                            <div class="flex flex-col text-right"><span class="text-[10px] font-black text-slate-400 uppercase">Bank Out</span><span id="todayBankExp" class="text-lg font-black text-rose-500">-0</span></div>
                        </div>
                    </div>

                    <div class="dashboard-card p-10 border-t-8 border-indigo-600">
                        <div class="flex justify-between items-start mb-8">
                            <p class="text-[12px] font-black text-slate-400 uppercase tracking-widest">Today Revenue</p>
                            <div class="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shadow-inner"><i class="fas fa-hand-holding-usd"></i></div>
                        </div>
                        <h2 id="totalDailyInc" class="text-4xl font-black text-slate-800 tracking-tight">₹0</h2>
                        <div class="mt-8">
                            <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div id="incBar" class="bg-indigo-600 h-full w-0 transition-all duration-1000"></div>
                            </div>
                            <p id="incCount" class="text-[10px] font-black text-slate-400 uppercase mt-3">0 RECEIPTS PROCESSED</p>
                        </div>
                    </div>

                    <div class="dashboard-card p-10 gradient-dark border-none shadow-2xl relative">
                        <div class="relative z-10">
                            <p class="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-4">Net Liquidity</p>
                            <h2 id="netBalance" class="text-5xl font-black text-white tracking-tighter mb-8">₹0</h2>
                            <div class="grid grid-cols-2 gap-6 border-t border-white/10 pt-8">
                                <div><p class="text-[10px] text-slate-400 uppercase font-black">Opening</p><p id="dayOpening" class="text-xl font-black text-emerald-400">₹0</p></div>
                                <div class="text-right"><p class="text-[10px] text-slate-400 uppercase font-black">Closing</p><p id="dayClosing" class="text-xl font-black text-blue-400">₹0</p></div>
                            </div>
                        </div>
                        <i class="fas fa-shield-alt absolute -right-6 -bottom-6 text-9xl text-white/5 rotate-12"></i>
                    </div>
                </div>

                <div class="grid grid-cols-1 xl:grid-cols-12 gap-10">
                    <div class="xl:col-span-8">
                        <div class="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full">
                            <div class="px-10 py-8 border-b flex justify-between items-center bg-slate-50/50">
                                <h3 class="font-black text-slate-800 uppercase text-sm tracking-widest">Student Fee Journal</h3>
                                <div class="flex gap-2">
                                    <span class="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span class="h-3 w-3 rounded-full bg-emerald-300"></span>
                                </div>
                            </div>
                            <div class="table-container">
                                <table class="w-full text-left border-collapse">
                                    <thead class="sticky-header shadow-sm">
                                        <tr class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b">
                                            <th class="px-10 py-6">Student Info</th>
                                            <th class="px-10 py-6">Reference</th>
                                            <th class="px-10 py-6">Received By</th>
                                            <th class="px-10 py-6">Method</th>
                                            <th class="px-10 py-6 text-right">Discount</th>
                                            <th class="px-10 py-6 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody id="incomeList" class="divide-y divide-slate-50 text-sm font-bold text-slate-600">
                                        </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div class="xl:col-span-4 space-y-10">
                        <div class="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                            <h3 class="font-black text-slate-800 uppercase text-sm tracking-widest mb-8 flex justify-between">
                                Counter Audit <i class="fas fa-users-cog text-slate-300"></i>
                            </h3>
                            <div id="staffSummary" class="space-y-4">
                                </div>
                        </div>

                        <div class="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                            <div class="px-10 py-8 border-b bg-rose-50/30 flex justify-between items-center">
                                <h3 class="font-black text-rose-900 uppercase text-sm tracking-widest">Vouchers & Contra</h3>
                                <i class="fas fa-receipt text-rose-300"></i>
                            </div>
                            <div id="expenseList" class="divide-y divide-slate-100 overflow-y-auto bg-white" style="max-height: 520px;">
                                </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // --- 2. LOGIC ENGINE & HELPERS ---
        const db = firebase.database();

        window.openDaybookModal = () => document.getElementById('voucherModal').style.display = 'flex';
        window.closeDaybookModal = () => {
            document.getElementById('voucherModal').style.display = 'none';
            document.getElementById('voucherForm').reset();
            window.toggleRef();
        };

        window.toggleRef = () => {
            const mode = document.getElementById('v_mode').value;
            document.getElementById('refContainer').classList.toggle('hidden', mode === 'Cash');
        };

        window.reloadEngine = () => {
            const newDate = document.getElementById('selectedDate').value;
            runEngine(newDate);
        };

        window.printDaybookReport = () => {
            window.print();
        };

        // Voucher Posting Logic
        document.getElementById('voucherForm').onsubmit = async (e) => {
            e.preventDefault();
            const amount = parseFloat(document.getElementById('v_amount').value);
            if(amount <= 0) return alert("Amount must be greater than zero!");

            const now = new Date();
            const currentTime = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: true 
            });

            const voucher = {
                paidTo: document.getElementById('v_paidTo').value,
                amount: amount,
                category: document.getElementById('v_category').value,
                mode: document.getElementById('v_mode').value,
                refNo: document.getElementById('v_refNo').value || 'N/A',
                remark: document.getElementById('v_remark').value || '', 
                date: document.getElementById('selectedDate').value,
                time: currentTime,
                addedBy: currentUser,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };
            
            try {
                await db.ref('expenses').push(voucher);
                closeDaybookModal();
                e.target.reset();
            } catch(err) {
                alert("Database Error!");
            }
        };

        window.deleteVoucher = (id) => {
            if(confirm("CRITICAL: Delete this voucher permanently?")) {
                db.ref(`expenses/${id}`).remove();
            }
        };

        // --- 3. THE DATA ENGINE (CORE LOGIC) ---
        function runEngine(targetDate) {
            if(activeListener) db.ref().off('value', activeListener);

            document.getElementById('displayDate').innerText = new Date(targetDate).toLocaleDateString('en-IN', { 
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
            });

            activeListener = db.ref().on('value', (snap) => {
                const data = snap.val() || {};
                const receipts = data.fee_receipts || {};
                const expenses = data.expenses || {};

                let totals = { openingCash: 0, openingBank: 0, dCashIn: 0, dCashOut: 0, dBankIn: 0, dBankOut: 0, rev: 0, count: 0 };
                let incomeRows = "", expenseRows = "", staffData = {};

                // 1. PROCESS STUDENT RECEIPTS
                Object.values(receipts).forEach(r => {
                    const amt = parseFloat(r.totalCollected || 0);
                    const disc = parseFloat(r.discount || 0);
                    const rDate = (r.date || "").split('T')[0];
                    const isBank = (r.mode !== 'Cash');

                    if (rDate < targetDate) {
                        if (isBank) totals.openingBank += amt; else totals.openingCash += amt;
                    } else if (rDate === targetDate) {
                        totals.rev += amt; 
                        totals.count++;
                        if (isBank) totals.dBankIn += amt; else totals.dCashIn += amt;

                        incomeRows += `
                            <tr class="hover:bg-slate-50 transition-all border-b border-slate-100">
                            <td class="px-10 py-6">
                                <div class="font-bold text-slate-800 uppercase text-[12px] whitespace-nowrap">${r.studentName || 'N/A'}</div>
                                <div class="text-[10px] text-slate-400">Folio: ${r.studentFolio || 'N/A'}</div>
                            </td>
                            <td class="px-10 py-6">
                                <span class="txn-ref whitespace-nowrap">${r.transactionId || 'N/A'}</span>
                            </td>
                            <td class="px-10 py-6">
                                <div class="flex items-center">
                                    <span class="staff-badge whitespace-nowrap inline-block shadow-sm" 
                                        style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 4px 10px; border-radius: 8px;">
                                        <i class="fas fa-user-circle mr-1 opacity-50"></i> 
                                        ${r.collectedBy || 'Admin'}
                                    </span>
                                </div>
                            </td>
                            <td class="px-10 py-6">
                                <div class="flex items-center gap-2 font-bold text-[11px] ${isBank ? 'text-blue-600' : 'text-emerald-600'} whitespace-nowrap">
                                    <i class="fas ${isBank ? 'fa-mobile-alt' : 'fa-money-bill-wave'}"></i> 
                                    ${r.mode || 'Cash'}
                                </div>
                            </td>
                            <td class="px-10 py-6 text-right font-medium ${disc > 0 ? 'text-orange-600' : 'text-slate-300'}">
                                ${disc > 0 ? '₹' + disc.toLocaleString('en-IN') : '-'}
                            </td>
                            <td class="px-10 py-6 text-right">
                                <div class="font-black text-slate-900 text-lg whitespace-nowrap">₹${amt.toLocaleString('en-IN')}</div>
                            </td>
                        </tr>`;

                        const collector = r.collectedBy || 'Admin';
                        if(!staffData[collector]) staffData[collector] = { cash: 0, bank: 0 };
                        if(isBank) staffData[collector].bank += amt; else staffData[collector].cash += amt;
                    }
                });

                // 2. PROCESS VOUCHERS, CONTRA & OPENING
                Object.entries(expenses).forEach(([id, v]) => {
                    const amt = parseFloat(v.amount || 0);
                    const vDate = v.date || "";
                    const isBank = (v.mode !== 'Cash');

                    const updateBalance = (isCurrentDay) => {
                        if (v.category === 'Bank Deposit') {
                            if (isCurrentDay) { totals.dCashOut += amt; totals.dBankIn += amt; }
                            else { totals.openingCash -= amt; totals.openingBank += amt; }
                        } else if (v.category === 'Cash Withdrawal') {
                            if (isCurrentDay) { totals.dCashIn += amt; totals.dBankOut += amt; }
                            else { totals.openingCash += amt; totals.openingBank -= amt; }
                        } else if (v.category === 'Opening Cash') {
                            if (isCurrentDay) totals.dCashIn += amt; else totals.openingCash += amt;
                        } else if (v.category === 'Opening Bank') {
                            if (isCurrentDay) totals.dBankIn += amt; else totals.openingBank += amt;
                        } else {
                            if (isBank) {
                                if (isCurrentDay) totals.dBankOut += amt; else totals.openingBank -= amt;
                            } else {
                                if (isCurrentDay) totals.dCashOut += amt; else totals.openingCash -= amt;
                            }
                        }
                    };

                    if (vDate < targetDate) {
                        updateBalance(false);
                    } else if (vDate === targetDate) {
                        updateBalance(true);
                        const isOpening = v.category.includes('Opening');
                        const entryTime = v.time ? v.time : ""; 
                        const addedByUser = v.addedBy || "Admin"; 

                        expenseRows += `
                            <div class="p-8 hover:bg-slate-50 transition-all group relative border-b border-slate-100">
                                <div class="flex justify-between items-start mb-2">
                                    <div class="flex flex-col">
                                        <div class="flex items-center gap-2 mb-1">
                                            <span class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">${v.category}</span>
                                            <span class="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase">
                                                <i class="far fa-clock mr-1"></i>${entryTime} | <i class="far fa-user ml-1 mr-1"></i>${addedByUser}
                                            </span>
                                        </div>
                                        <span class="font-black text-slate-800 uppercase mt-1 text-[13px]">${v.paidTo}</span>
                                        <span class="text-[9px] font-bold text-slate-400 mt-1 uppercase">Ref: ${v.refNo}</span>
                                    </div>
                                    <div class="text-right">
                                        <div class="font-black ${isOpening ? 'text-emerald-600' : 'text-rose-600'} text-lg">
                                            ${isOpening ? '+' : '-'}₹${amt.toLocaleString('en-IN')}
                                        </div>
                                        <div class="text-[9px] font-black text-slate-400 uppercase">${v.mode}</div>
                                    </div>
                                </div>
                                <p class="text-[11px] italic text-slate-500 leading-relaxed mt-2">${v.remark}</p>
                                <button onclick="deleteVoucher('${id}')" class="absolute top-8 right-4 h-8 w-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all no-print">
                                    <i class="fas fa-trash-alt text-xs"></i>
                                </button>
                            </div>`;
                    }
                });

                // 3. FINAL UI UPDATES
                const closingCash = totals.openingCash + totals.dCashIn - totals.dCashOut;
                const closingBank = totals.openingBank + totals.dBankIn - totals.dBankOut;
                const totalOpening = totals.openingCash + totals.openingBank;
                const totalClosing = closingCash + closingBank;

                document.getElementById('cashBalance').innerText = `₹${closingCash.toLocaleString('en-IN')}`;
                document.getElementById('bankBalance').innerText = `₹${closingBank.toLocaleString('en-IN')}`;
                document.getElementById('todayCashInc').innerText = `+${totals.dCashIn.toLocaleString()}`;
                document.getElementById('todayCashExp').innerText = `-${totals.dCashOut.toLocaleString()}`;
                document.getElementById('todayBankIn').innerText = `+${totals.dBankIn.toLocaleString()}`;
                document.getElementById('todayBankExp').innerText = `-${totals.dBankOut.toLocaleString()}`;
                document.getElementById('totalDailyInc').innerText = `₹${totals.rev.toLocaleString('en-IN')}`;
                document.getElementById('incCount').innerText = `${totals.count} RECEIPTS PROCESSED`;
                document.getElementById('incBar').style.width = `${Math.min(totals.count * 10, 100)}%`;
                document.getElementById('netBalance').innerText = `₹${totalClosing.toLocaleString('en-IN')}`;
                document.getElementById('dayOpening').innerText = `₹${totalOpening.toLocaleString('en-IN')}`;
                document.getElementById('dayClosing').innerText = `₹${totalClosing.toLocaleString('en-IN')}`;
                
                document.getElementById('incomeList').innerHTML = incomeRows || `<tr><td colspan="6" class="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">No Fee Collection Found</td></tr>`;
                document.getElementById('expenseList').innerHTML = expenseRows || `<div class="p-20 text-center text-slate-300 font-bold uppercase tracking-widest">No Vouchers</div>`;

                // Render Staff Summary (Updated for Cash/Bank split)
                let staffHtml = "";
                Object.entries(staffData).forEach(([name, collection]) => {
                    staffHtml += `
                        <div class="p-5 bg-slate-50 rounded-2xl border border-slate-100 mb-3">
                            <div class="flex justify-between items-center mb-3">
                                <div class="flex items-center gap-3">
                                    <div class="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[10px] font-black">${name[0]}</div>
                                    <span class="text-[11px] font-black text-slate-600 uppercase tracking-tighter">${name}</span>
                                </div>
                                <span class="text-sm font-black text-slate-900">₹${(collection.cash + collection.bank).toLocaleString()}</span>
                            </div>
                            <div class="flex gap-4 border-t border-slate-200 pt-3">
                                <div class="flex-1">
                                    <div class="text-[8px] font-bold text-slate-400 uppercase">Cash</div>
                                    <div class="text-[11px] font-black text-emerald-600">₹${collection.cash.toLocaleString()}</div>
                                </div>
                                <div class="flex-1 border-l border-slate-200 pl-4">
                                    <div class="text-[8px] font-bold text-slate-400 uppercase">Bank/Online</div>
                                    <div class="text-[11px] font-black text-blue-600">₹${collection.bank.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>`;
                });
                document.getElementById('staffSummary').innerHTML = staffHtml || `<p class="text-center text-slate-300 py-4 font-bold uppercase text-[10px]">No Staff Activity</p>`;
            });
        }

        // INITIAL ENGINE START
        runEngine(today);
};