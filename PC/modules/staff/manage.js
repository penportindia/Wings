window.init_manage_staff = function(state) {
    const container = document.getElementById('main-content');
    
    container.innerHTML = `
        <style>
            .elite-container { max-width: 1240px; margin: 0 auto; padding: 1rem 2rem; color: #1a1a1a; font-family: 'Inter', sans-serif; }
            input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
            input[type=number] { -moz-appearance: textfield; }
            .staff-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 1.5rem; border-bottom: 1px solid #f0f0f0; margin-bottom: 2rem; }
            .header-icon-box { background: #000; color: #fff; padding: 10px; border-radius: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
            .search-wrapper { display: flex; align-items: center; background: #f4f4f5; padding: 6px 6px 6px 16px; border-radius: 12px; width: 380px; border: 1px solid transparent; transition: all 0.2s; }
            .search-wrapper:focus-within { background: #fff; border-color: #000; box-shadow: 0 0 0 4px rgba(0,0,0,0.05); }
            .search-input { background: transparent; border: none; outline: none; width: 100%; font-size: 0.875rem; font-weight: 600; }
            .glass-card { background: #fff; border: 1px solid #f0f0f0; border-radius: 24px; padding: 2rem; margin-bottom: 2rem; position: relative; }
            .section-title { font-size: 1.1rem; font-weight: 800; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px; color: #18181b; }
            .input-group label { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #a1a1aa; margin-bottom: 6px; }
            .label-name { color: #4f46e5 !important; font-weight: 900 !important; }
            .elite-input { width: 100%; padding: 11px 14px; background: #f8f8f9; border: 1.5px solid transparent; border-radius: 10px; font-weight: 500; transition: all 0.2s; font-size: 0.95rem; }
            .elite-input:focus { background: #fff; border-color: #000; outline: none; }
            .pass-wrapper { position: relative; }
            .pass-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #a1a1aa; }
            .actions-row { display: flex; gap: 12px; margin-top: 1rem; }
            .btn { padding: 12px 24px; border-radius: 12px; font-weight: 700; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; border: none; display: flex; align-items: center; gap: 8px; }
            .btn-save { background: #000; color: #fff; flex: 2; justify-content: center; }
            .btn-save:hover { background: #27272a; }
            .btn-reset { background: #f4f4f5; color: #52525b; flex: 1; justify-content: center; }
            .btn-alumni { background: #fee2e2; color: #ef4444; flex: 1; justify-content: center; display: none; }
            .btn-restore { background: #dcfce7; color: #16a34a; flex: 1; justify-content: center; display: none; }
            .status-badge { position: absolute; top: 2rem; right: 2rem; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 800; text-transform: uppercase; display: none; background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; }
        </style>

        <div class="elite-container">
            <header class="staff-header">
                <div class="header-icon-box"><i data-lucide="user-plus" class="w-6 h-6"></i></div>
                <div class="search-wrapper">
                    <input type="text" id="globalSearch" placeholder=" Search " class="search-input">
                    <button onclick="StaffMgt.fetchEmployee()" class="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold">Search</button>
                </div>
            </header>

            <form id="masterForm">
                <div class="grid grid-cols-12 gap-8">
                    <div class="col-span-12 lg:col-span-8">
                        <div class="glass-card">
                            <div id="statusBadge" class="status-badge">Alumni</div>
                            <h2 class="section-title"><i data-lucide="user-circle" class="w-5 h-5"></i> Personal Profile</h2>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div class="input-group"><label>Staff ID</label><input type="number" id="empId" readonly class="elite-input !bg-zinc-100 font-bold text-zinc-400"></div>
                                <div class="input-group"><label class="label-name">Full Name</label><input type="text" id="name" required class="elite-input"></div>
                                <div class="input-group"><label>Father/Spouse Name</label><input type="text" id="fatherSpouse" class="elite-input"></div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="input-group"><label>Gender</label><select id="gender" class="elite-input"><option>Male</option><option>Female</option><option>Other</option></select></div>
                                    <div class="input-group"><label>Blood Group</label><select id="bloodGroup" class="elite-input"><option>A+</option><option>B+</option><option>O+</option><option>AB+</option><option>A-</option><option>B-</option><option>O-</option></select></div>
                                </div>
                                <div class="input-group"><label>Phone Number</label><input type="text" id="phone" maxlength="10" class="elite-input"></div>
                                <div class="input-group">
                                    <label>Login Password</label>
                                    <div class="pass-wrapper">
                                        <input type="password" id="password" value="123456" class="elite-input">
                                        <i data-lucide="eye" class="pass-toggle w-4 h-4" id="togglePass" onclick="StaffMgt.togglePassword()"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="glass-card">
                            <h2 class="section-title"><i data-lucide="fingerprint" class="w-5 h-5"></i> Identity & Background</h2>
                            <div class="space-y-5">
                                <div class="input-group"><label>Aadhaar Number</label><input type="text" id="aadhaar" maxlength="14" class="elite-input font-mono tracking-widest"></div>
                                <div class="input-group"><label>Residential Address</label><textarea id="address" rows="2" class="elite-input resize-none"></textarea></div>
                                <div class="grid grid-cols-2 gap-5">
                                    <div class="input-group">
                                        <label for="higherQual">Highest Qualification</label>
                                        <select id="higherQual" class="elite-input">
                                            <option value="" selected disabled>Select Qualification</option>
                                            <option value="Non Matric">Non Matric</option>
                                            <option value="Matric">Matric</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Diploma">Diploma</option>
                                            <option value="Graduate">Graduate</option>
                                            <option value="Post Graduate">Post Graduate</option>
                                            <option value="PhD">PhD</option>
                                        </select>
                                    </div>

                                    <div class="input-group">
                                        <label for="profQual">Professional Degree</label>
                                        <input type="text" id="profQual" placeholder="Ex: B.Ed, M.Ed, NTT" class="elite-input">
                                    </div>
                                </div>
                            </div>
                            <div class="actions-row">
                                <button type="submit" class="btn btn-save"><i data-lucide="save" class="w-4 h-4"></i> SAVE STAFF RECORD</button>
                                <button type="button" onclick="StaffMgt.resetForm()" class="btn btn-reset">RESET</button>
                                <button type="button" id="alumniBtn" onclick="StaffMgt.moveToAlumni()" class="btn btn-alumni">ALUMNI</button>
                                <button type="button" id="restoreBtn" onclick="StaffMgt.restoreStaff()" class="btn btn-restore">RESTORE</button>
                            </div>
                        </div>
                    </div>

                    <div class="col-span-12 lg:col-span-4">
                        <div class="glass-card !bg-zinc-900 !text-white !border-none">
                            <h2 class="section-title !mb-6 !text-indigo-400">Deployment</h2>
                            <div class="space-y-5">
                                <div class="input-group"><label class="!text-zinc-500">Assign Branch</label><select id="branch" required class="elite-input !bg-zinc-800 !border-none !text-white"></select></div>
                                <div class="input-group">
                                    <label class="!text-zinc-500">Role / Designation</label>
                                    <select id="designation" class="elite-input !bg-zinc-800 !border-none !text-white">
                                        <option value="" selected disabled>Select Role</option>
                                        
                                        <optgroup label="Management">
                                            <option value="Chairman">Chairman</option>
                                            <option value="Director">Director</option>
                                            <option value="Principal">Principal</option>
                                            <option value="Vice Principal">Vice Principal</option>
                                        </optgroup>

                                        <optgroup label="Academic Staff">
                                            <option value="Coordinator">Coordinator</option>
                                            <option value="Teacher">Teacher</option>
                                            <option value="Special Educator">Special Educator</option>
                                            <option value="Librarian">Librarian</option>
                                            <option value="Lab Assistant">Lab Assistant</option>
                                        </optgroup>

                                        <optgroup label="Administration & Office">
                                            <option value="Accountant">Accountant</option>
                                            <option value="Office Superintendent">Office Superintendent</option>
                                            <option value="Clerk">Clerk</option>
                                            <option value="Admin">Admin</option>
                                            <option value="Receptionist">Receptionist</option>
                                            <option value="Data Operator">Data Operator</option>
                                        </optgroup>

                                        <optgroup label="Logistics & Security">
                                            <option value="Transport Incharge">Transport Incharge</option>
                                            <option value="Driver">Driver</option>
                                            <option value="Conductor">Conductor</option>
                                            <option value="Security Guard">Security Guard</option>
                                        </optgroup>

                                        <optgroup label="Support Staff">
                                            <option value="Peon">Peon</option>
                                            <option value="Helper">Helper</option>
                                            <option value="Cleaner">Cleaner</option>
                                        </optgroup>
                                    </select>
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="input-group"><label class="!text-zinc-500">Join Date</label><input type="date" id="doj" class="elite-input !bg-zinc-800 !border-none !text-white !text-xs"></div>
                                    <div class="input-group"><label class="!text-zinc-500">D.O.B</label><input type="date" id="dob" class="elite-input !bg-zinc-800 !border-none !text-white !text-xs"></div>
                                </div>
                            </div>
                        </div>

                        <div class="glass-card">
                            <h2 class="section-title"><i data-lucide="banknote" class="w-5 h-5 text-emerald-600"></i> Payroll Info</h2>
                            <div class="space-y-4">
                                <div class="input-group"><label>A/C Holder Name</label><input type="text" id="bankingName" class="elite-input text-sm"></div>
                                <div class="input-group"><label>Account Number</label><input type="text" id="accNo" class="elite-input text-sm"></div>
                                <div class="input-group"><label>IFSC Code</label><input type="text" id="ifsc" class="elite-input text-sm uppercase"></div>
                                <div class="input-group pt-4 border-t border-zinc-100"><label>Basic Monthly Salary</label><input type="number" id="basicSalary" class="elite-input !text-emerald-600 font-bold text-lg" placeholder="0.00"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    `;

    lucide.createIcons();
    StaffMgt.init();
};

const StaffMgt = {
    fieldIds: ['empId', 'name', 'fatherSpouse', 'gender', 'branch', 'designation', 'phone', 'password', 'aadhaar', 'address', 'higherQual', 'profQual', 'dob', 'doj', 'bloodGroup', 'bankingName', 'accNo', 'ifsc', 'basicSalary'],

    init() {
        this.loadBranches();
        this.generateId();
        this.setupHandlers();
    },

    togglePassword() {
        const pass = document.getElementById('password');
        const icon = document.getElementById('togglePass');
        const isPass = pass.type === 'password';
        pass.type = isPass ? 'text' : 'password';
        icon.setAttribute('data-lucide', isPass ? 'eye-off' : 'eye');
        lucide.createIcons();
    },

    loadBranches() {
        db.ref('foundation/branches').on('value', snap => {
            const select = document.getElementById('branch');
            if(!select) return;
            let options = '<option value="all">All Branches</option>';
            if(snap.exists()){
                Object.keys(snap.val()).forEach(k => { options += `<option value="${k}">${snap.val()[k].name}</option>`; });
            }
            select.innerHTML = options;
        });
    },

    async generateId() {
        const snap = await db.ref('employees').once('value');
        let nextId = 101;
        if (snap.exists()) {
            const keys = Object.keys(snap.val()).map(Number).filter(n => !isNaN(n));
            if(keys.length > 0) nextId = Math.max(...keys) + 1;
        }
        document.getElementById('empId').value = nextId;
    },

    setupHandlers() {
        document.getElementById('masterForm').onsubmit = (e) => { e.preventDefault(); this.saveData(); };
        document.getElementById('aadhaar').oninput = (e) => {
            let v = e.target.value.replace(/\D/g, '').match(/.{1,4}/g)?.join('-') || "";
            e.target.value = v.substring(0, 14);
        };
        const sBox = document.getElementById('globalSearch');
        sBox.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); this.fetchEmployee(); }
        });
        sBox.focus();
    },

    async fetchEmployee() {
        const id = document.getElementById('globalSearch').value.trim();
        if(!id) return;
        const snap = await db.ref(`employees/${id}`).once('value');
        if(snap.exists()){
            const data = snap.val();
            this.fieldIds.forEach(f => {
                const el = document.getElementById(f);
                if(el) el.value = (f === 'password' && data[f]) ? atob(data[f]) : (data[f] || '');
            });
            const isAlumni = data.status === 'alumni';
            document.getElementById('statusBadge').style.display = isAlumni ? 'block' : 'none';
            document.getElementById('alumniBtn').style.display = isAlumni ? 'none' : 'flex';
            document.getElementById('restoreBtn').style.display = isAlumni ? 'flex' : 'none';
            Swal.fire({ title: 'Success', text: 'Profile Loaded', icon: 'success' });
        } else {
            Swal.fire({ title: 'Error', text: 'ID Not Found', icon: 'error' });
        }
    },

    async saveData() {
        const id = document.getElementById('empId').value;
        const existing = await db.ref(`employees/${id}`).once('value');
        const currentStatus = existing.exists() ? (existing.val().status || 'active') : 'active';
        const payload = { lastUpdate: new Date().toISOString(), status: currentStatus };
        this.fieldIds.forEach(f => {
            const val = document.getElementById(f).value;
            payload[f] = (f === 'password') ? btoa(val) : String(val);
        });
        try {
            await db.ref(`employees/${id}`).update(payload);
            Swal.fire({ title: 'Saved!', icon: 'success' });
            this.resetForm();
        } catch (e) { Swal.fire({ title: 'Error', text: e.message, icon: 'error' }); }
    },

    async moveToAlumni() {
        const id = document.getElementById('empId').value;
        const res = await Swal.fire({ title: 'Move to Alumni?', icon: 'warning', showCancelButton: true });
        if(res.isConfirmed) {
            await db.ref(`employees/${id}`).update({ status: 'alumni' });
            Swal.fire({ title: 'Success', icon: 'success' });
            this.resetForm();
        }
    },

    async restoreStaff() {
        const id = document.getElementById('empId').value;
        const res = await Swal.fire({ title: 'Restore Staff?', icon: 'question', showCancelButton: true });
        if(res.isConfirmed) {
            await db.ref(`employees/${id}`).update({ status: 'active' });
            Swal.fire({ title: 'Restored', icon: 'success' });
            this.resetForm();
        }
    },

    resetForm() {
        document.getElementById('masterForm').reset();
        document.getElementById('alumniBtn').style.display = 'none';
        document.getElementById('restoreBtn').style.display = 'none';
        document.getElementById('statusBadge').style.display = 'none';
        document.getElementById('password').value = "123456";
        document.getElementById('password').type = "password";
        document.getElementById('globalSearch').value = "";
        this.generateId();
        setTimeout(() => document.getElementById('globalSearch').focus(), 100);
    }
};