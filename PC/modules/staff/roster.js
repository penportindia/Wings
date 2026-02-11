window.RosterMgt = {
    currentStaffId: null,
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),

    open: async function(staffId) {
        if (!staffId) return Swal.fire('Error', 'Invalid Staff ID', 'error');
        
        this.currentStaffId = staffId;
        this.showLoader();
        
        try {
            const monthKey = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}`;
            
            const [staffSnap, attendanceSnap] = await Promise.all([
                db.ref(`employees/${staffId}`).once('value'),
                db.ref(`attendance/${monthKey}`).once('value')
            ]);

            const staff = staffSnap.val();
            const attendanceRaw = attendanceSnap.val() || {};

            if (!staff) {
                return Swal.fire('Not Found', 'Staff profile does not exist.', 'warning');
            }

            const staffAttendance = this.processAttendanceData(attendanceRaw, staffId);
            this.renderUI(staff, staffAttendance);

        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Failed to fetch records.', 'error');
        }
    },

    processAttendanceData: function(data, staffId) {
        let dailyStatus = {};
        Object.keys(data).forEach(fullDate => {
            const staffNodes = data[fullDate].staff || {};
            Object.values(staffNodes).forEach(idsInBatch => {
                if (idsInBatch[staffId]) {
                    dailyStatus[fullDate] = idsInBatch[staffId];
                }
            });
        });
        return dailyStatus;
    },

    renderUI: function(staff, attendance) {
        Swal.close();
        let modal = document.getElementById('roster-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'roster-modal';
            modal.className = "fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300";
            document.body.appendChild(modal);
        }

        const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(this.currentYear, this.currentMonth));

        modal.innerHTML = `
            <div class="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                <div class="p-8 bg-slate-900 text-white flex justify-between items-center">
                    <div class="flex items-center gap-5">
                        <div class="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center text-2xl font-black shadow-lg">
                            ${staff.name.charAt(0)}
                        </div>
                        <div>
                            <h3 class="text-xl font-black tracking-tight">${staff.name}</h3>
                            <p class="text-slate-400 text-xs font-bold uppercase tracking-widest">${staff.designation || 'Staff'} • ${this.currentStaffId}</p>
                        </div>
                    </div>
                    <button onclick="RosterMgt.close()" class="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                        <i data-lucide="x"></i>
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div class="space-y-6">
                            <div class="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                                <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">${monthName} Summary</h4>
                                <div class="space-y-4">
                                    ${this.renderStatItem('Present', this.count(attendance, 'P'), 'bg-emerald-50 text-emerald-600', 'check-circle')}
                                    ${this.renderStatItem('Absent', this.count(attendance, 'A'), 'bg-rose-50 text-rose-600', 'x-circle')}
                                </div>
                            </div>
                        </div>

                        <div class="lg:col-span-2 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                            <div class="flex justify-between items-center mb-6">
                                <h4 class="font-black text-slate-800 uppercase text-xs tracking-widest">Attendance Sheet</h4>
                                <div class="flex items-center gap-3">
                                    <button onclick="RosterMgt.changeMonth(-1)" class="p-2 hover:bg-slate-100 rounded-lg"><i data-lucide="chevron-left" class="w-4 h-4"></i></button>
                                    <span class="text-xs font-black text-slate-600 min-w-[100px] text-center uppercase">${monthName} ${this.currentYear}</span>
                                    <button onclick="RosterMgt.changeMonth(1)" class="p-2 hover:bg-slate-100 rounded-lg"><i data-lucide="chevron-right" class="w-4 h-4"></i></button>
                                </div>
                            </div>

                            <div class="grid grid-cols-7 gap-2">
                                ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<div class="text-center text-[10px] font-black text-slate-300 uppercase py-2">${d}</div>`).join('')}
                                ${this.generateCalendarDays(attendance)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    generateCalendarDays: function(attendance) {
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        let html = '';

        for (let i = 0; i < firstDay; i++) html += `<div class="aspect-square"></div>`;

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSunday = new Date(this.currentYear, this.currentMonth, day).getDay() === 0;
            const status = attendance[dateStr];

            let statusClass = 'bg-slate-50 text-slate-400';
            
            if (status === 'P') {
                statusClass = 'bg-emerald-500 text-white shadow-lg shadow-emerald-100';
            } else if (status === 'A') {
                statusClass = 'bg-rose-500 text-white shadow-lg shadow-rose-100';
            } else if (isSunday) {
                statusClass = 'bg-amber-100 text-amber-700 border border-amber-200';
            }

            html += `
                <div class="aspect-square rounded-xl ${statusClass} flex flex-col items-center justify-center relative group transition-all hover:scale-110 cursor-default">
                    <span class="text-xs font-black">${day}</span>
                </div>
            `;
        }
        return html;
    },

    renderStatItem: (label, val, cls, icon) => `
        <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-50">
            <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg ${cls}"><i data-lucide="${icon}" class="w-4 h-4"></i></div>
                <span class="text-xs font-bold text-slate-600">${label}</span>
            </div>
            <span class="text-sm font-black text-slate-800">${val}</span>
        </div>`,

    count: (data, type) => Object.values(data).filter(v => v === type).length,

    showLoader: () => Swal.fire({
        title: 'Syncing Data...',
        html: '<div class="p-4"><div class="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mx-auto"></div></div>',
        showConfirmButton: false, allowOutsideClick: false, customClass: { popup: 'rounded-[32px]' }
    }),

    changeMonth: function(dir) {
        this.currentMonth += dir;
        if (this.currentMonth > 11) { this.currentMonth = 0; this.currentYear++; }
        else if (this.currentMonth < 0) { this.currentMonth = 11; this.currentYear--; }
        this.open(this.currentStaffId);
    },

    close: function() {
        const modal = document.getElementById('roster-modal');
        if (modal) {
            modal.classList.add('fade-out');
            setTimeout(() => modal.remove(), 300);
        }
    }
};