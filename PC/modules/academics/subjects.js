window.init_subjects = function(state) {
    const content = document.getElementById('main-content');
    
    content.innerHTML = `
        <div class="max-w-[1500px] mx-auto animate-slide">
            <div class="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/60">
                <div class="flex items-center gap-4">
                    <div class="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <i data-lucide="book-marked" class="text-white w-7 h-7"></i>
                    </div>
                </div>
                
                <div class="flex items-center gap-3 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200">
                    <span id="displayYear" class="pl-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">YEAR 2025-26</span>
                    <select id="classSelector" class="bg-white border-none rounded-xl px-5 py-2.5 font-bold text-slate-700 shadow-sm outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all min-w-[180px] uppercase">
                        <option value="">SELECT CLASS</option>
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div class="lg:col-span-4">
                    <div class="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/60 sticky top-8 border border-white">
                        <div class="flex items-center justify-between mb-8">
                            <h3 class="text-xl font-extrabold text-slate-800 uppercase">NEW</h3>
                            <span class="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full uppercase">STEP 1</span>
                        </div>
                        
                        <form id="subjectForm" class="space-y-6">
                            <div class="space-y-2">
                                <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">SUBJECT NOMENCLATURE</label>
                                <input type="text" id="subName" placeholder="E.G. QUANTUM PHYSICS" required 
                                    class="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-800 placeholder:text-slate-300 uppercase text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none">
                            </div>

                            <div class="space-y-3">
                                <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">RESOURCE LIBRARY</label>
                                <div id="booksList" class="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scroll">
                                    <div class="book-item group bg-white border border-slate-200 p-5 rounded-2xl hover:border-indigo-300 transition-all shadow-sm">
                                        <input type="text" placeholder="BOOK TITLE" class="b-title w-full font-bold text-slate-700 bg-transparent border-b border-slate-100 pb-2 mb-3 outline-none focus:border-indigo-400 transition-all text-sm uppercase" required>
                                        <textarea placeholder="EDITION OR AUTHOR..." class="b-desc w-full text-[13px] text-slate-500 bg-transparent outline-none h-12 resize-none leading-relaxed uppercase"></textarea>
                                    </div>
                                </div>
                            </div>

                            <button type="button" onclick="addBookInputField()" class="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-xs hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all flex justify-center items-center gap-2 uppercase">
                                <i data-lucide="plus-circle" class="w-4 h-4"></i> ADD RESOURCE
                            </button>

                            <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-indigo-200 transition-all transform hover:-translate-y-1 active:scale-[0.98] text-sm tracking-widest uppercase">
                                ADD
                            </button>
                        </form>
                    </div>
                </div>

                <div class="lg:col-span-8">
                    <div class="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden min-h-[600px] border border-white">
                        <div class="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-white/40">
                            <div>
                                <h3 id="tableHeader" class="font-black text-slate-800 text-xl tracking-tight uppercase">CURRICULUM REGISTRY</h3>
                                <div class="flex items-center gap-2 mt-1">
                                    <span class="flex h-2 w-2 rounded-full bg-green-500"></span>
                                    <p class="text-xs text-slate-400 font-bold uppercase tracking-widest" id="subCount">READY TO SYNC</p>
                                </div>
                            </div>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr class="text-left bg-slate-50/50">
                                        <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">SUBJECT</th>
                                        <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">RESOURCE INVENTORY</th>
                                        <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody id="subjects-table-body" class="divide-y divide-slate-100">
                                    <tr>
                                        <td colspan="3" class="p-32 text-center opacity-30">
                                            <p class="font-black text-xs uppercase tracking-widest">AWAITING DATA SELECTION...</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    lucide.createIcons();
    setupLogic();
};

function setupLogic() {
    const classSelector = document.getElementById('classSelector');
    const tableBody = document.getElementById('subjects-table-body');
    const subjectForm = document.getElementById('subjectForm');

    db.ref('foundation/classes').on('value', snap => {
        const classes = snap.val();
        let options = '<option value="">SELECT CLASS</option>';
        if (classes) {
            const list = [...new Set(Object.values(classes).map(c => c.className.toUpperCase()))].sort();
            list.forEach(c => options += `<option value="${c}">${c}</option>`);
        }
        classSelector.innerHTML = options;
    });

    classSelector.onchange = (e) => {
        const cls = e.target.value;
        if (!cls) return;
        document.getElementById('tableHeader').innerText = `CLASS ${cls}`;
        syncSubjectTable(cls);
    };

    window.addBookInputField = () => {
        const div = document.createElement('div');
        div.className = "book-item group bg-white border border-slate-200 p-5 rounded-2xl hover:border-indigo-300 transition-all shadow-sm relative animate-slide mb-4";
        div.innerHTML = `
            <button type="button" onclick="this.parentElement.remove()" class="absolute right-4 top-4 text-slate-300 hover:text-rose-500 transition-all"><i data-lucide="x" class="w-4 h-4"></i></button>
            <input type="text" placeholder="BOOK TITLE" class="b-title w-full font-bold text-slate-700 bg-transparent border-b border-slate-100 pb-2 mb-3 outline-none focus:border-indigo-400 transition-all text-sm uppercase" required>
            <textarea placeholder="DESCRIPTION..." class="b-desc w-full text-[13px] text-slate-500 bg-transparent outline-none h-12 resize-none leading-relaxed uppercase"></textarea>
        `;
        document.getElementById('booksList').appendChild(div);
        lucide.createIcons();
    };

    function syncSubjectTable(cls) {
        db.ref(`foundation/subjects/${cls}`).on('value', snap => {
            const data = snap.val();
            tableBody.innerHTML = '';
            let count = 0;

            if (data) {
                Object.entries(data).forEach(([id, sub]) => {
                    count++;
                    let booksCards = `<div class="flex gap-3 overflow-x-auto pb-2 max-w-[500px] custom-scroll">`;
                    (sub.books || []).forEach(b => {
                        booksCards += `
                            <div class="flex-none w-40 p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-200 transition-all">
                                <div class="text-[11px] font-black text-slate-700 truncate mb-1 uppercase">${b.title}</div>
                                <div class="text-[10px] text-slate-400 line-clamp-1 leading-tight uppercase">${b.description || 'GENERAL'}</div>
                            </div>`;
                    });
                    booksCards += `</div>`;

                    tableBody.innerHTML += `
                        <tr class="group hover:bg-slate-50/50 transition-all animate-slide">
                            <td class="px-8 py-6 align-middle">
                                <div class="flex items-center gap-3">
                                    <div class="h-8 w-1 bg-indigo-500 rounded-full"></div>
                                    <span class="text-sm font-black text-slate-800 uppercase tracking-tight">${sub.name}</span>
                                </div>
                            </td>
                            <td class="px-8 py-6">${booksCards}</td>
                            <td class="px-8 py-6 text-right">
                                <button onclick="deleteSubjectEntry('${cls}', '${id}')" class="p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                                    <i data-lucide="trash-2" class="w-5 h-5"></i>
                                </button>
                            </td>
                        </tr>`;
                });
                document.getElementById('subCount').innerText = `${count} ACTIVE`;
                lucide.createIcons();
            } else {
                tableBody.innerHTML = `<tr><td colspan="3" class="p-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">NO SUBJECTS CONFIGURED.</td></tr>`;
                document.getElementById('subCount').innerText = `READY TO SYNC`;
            }
        });
    }

    subjectForm.onsubmit = (e) => {
        e.preventDefault();
        const cls = classSelector.value;
        if (!cls) return Swal.fire('ERROR', 'SELECT CLASS!', 'error');

        const books = Array.from(document.querySelectorAll('.book-item')).map(item => ({
            title: item.querySelector('.b-title').value.toUpperCase().trim(),
            description: item.querySelector('.b-desc').value.toUpperCase().trim()
        }));

        const subName = document.getElementById('subName').value.toUpperCase().trim();
        
        db.ref(`foundation/subjects/${cls}`).push({ name: subName, books: books })
            .then(() => {
                e.target.reset();
                document.getElementById('booksList').innerHTML = `
                    <div class="book-item group bg-white border border-slate-200 p-5 rounded-2xl shadow-sm mb-4">
                        <input type="text" placeholder="BOOK TITLE" class="b-title w-full font-bold text-slate-700 bg-transparent border-b border-slate-100 pb-2 mb-3 outline-none text-sm uppercase" required>
                        <textarea placeholder="DESCRIPTION..." class="b-desc w-full text-[13px] text-slate-500 bg-transparent outline-none h-12 resize-none leading-relaxed uppercase"></textarea>
                    </div>`;
                Swal.fire({ icon: 'success', title: 'ADDED', showConfirmButton: false, timer: 1500 });
            });
    };

    window.deleteSubjectEntry = (cls, id) => {
        Swal.fire({
            title: 'DELETE SUBJECT?',
            text: "THIS ACTION IS PERMANENT!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'YES, DELETE'
        }).then((res) => {
            if (res.isConfirmed) db.ref(`foundation/subjects/${cls}/${id}`).remove();
        });
    };
}