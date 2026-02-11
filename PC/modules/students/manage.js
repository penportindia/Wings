window.init_manage_students = function(appState) {
    const content = document.getElementById('main-content');
    let foundationData = {};

    content.innerHTML = `
        <style>
                :root {
                    --primary: #0f172a;
                    --accent: #2563eb;
                    --update: #f59e0b;
                    --bg: #f1f5f9;
                    --card-bg: #ffffff;
                    --border: #e2e8f0;
                    --text-dark: #1e293b;
                    --text-light: #64748b;
                    --success: #10b981;
                    --danger: #ef4444;
                    --shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
                    --shadow-md: 0 10px 15px -3px rgba(0,0,0,0.1);
                    --radius: 12px;
                }

                * { box-sizing: border-box; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
                
                body { 
                    font-family: 'Plus Jakarta Sans', sans-serif; 
                    background: var(--bg); 
                    color: var(--text-dark); 
                    margin: 0; 
                    padding: 0;
                    line-height: 1.5;
                }

                /* Professional Scrollbar */
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: #f1f1f1; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

                .container { max-width: 1550px; margin: 0 auto; padding: 20px; }

                /* Header UI */
                .top-nav {
                    background: var(--primary);
                    color: white;
                    padding: 20px 30px;
                    border-radius: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    flex-wrap: wrap;
                    gap: 20px;
                }

                .brand { display: flex; align-items: center; gap: 15px; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
                .brand i { background: var(--accent); padding: 10px; border-radius: 12px; box-shadow: 0 0 20px rgba(37,99,235,0.4); }

                .search-area { 
                    display: flex; 
                    gap: 8px; 
                    background: rgba(255,255,255,0.15); 
                    padding: 6px; 
                    border-radius: 14px; 
                    border: 1px solid rgba(255,255,255,0.2);
                    width: 100%;
                    max-width: 450px;
                }
                .search-area:focus-within { background: white; border-color: var(--accent); }
                .search-area input { 
                    background: transparent; border: none; color: white; 
                    padding: 10px 15px; width: 100%; outline: none; font-size: 15px;
                }
                .search-area:focus-within input { color: var(--primary); }
                .btn-search { 
                    background: var(--accent); color: white; border: none; 
                    padding: 10px 24px; border-radius: 10px; font-weight: 700; 
                    cursor: pointer; display: flex; align-items: center; gap: 10px;
                }
                .btn-search:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(37,99,235,0.4); }

                /* Grid Layout */
                .main-grid { display: grid; grid-template-columns: 1fr 380px; gap: 30px; }

                /* Card Styling */
                .card { 
                    background: var(--card-bg); 
                    border-radius: 20px; 
                    border: 1px solid var(--border); 
                    padding: 24px; 
                    margin-bottom: 25px; 
                    position: relative;
                    box-shadow: var(--shadow-sm);
                }
                .card:hover { box-shadow: var(--shadow-md); }
                
                .card-header { 
                    display: flex; 
                    align-items: center; 
                    gap: 12px; 
                    margin-bottom: 24px; 
                    padding-bottom: 15px; 
                    border-bottom: 1px solid #f1f5f9; 
                }
                .card-header i { color: var(--accent); font-size: 18px; }
                .card-header h3 { margin: 0; font-size: 15px; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 0.5px; }

                /* Form Inputs */
                .input-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
                .group { display: flex; flex-direction: column; gap: 8px; }
                label { font-size: 11px; font-weight: 700; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; }
                
                input, select { 
                    padding: 12px 16px; 
                    border: 1.5px solid var(--border); 
                    border-radius: 12px; 
                    font-size: 14px; 
                    color: var(--text-dark);
                    background: #fdfdfd;
                    font-family: inherit;
                    font-weight: 500;
                }
                input:focus, select:focus { 
                    border-color: var(--accent); 
                    outline: none; 
                    background: white;
                    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); 
                }

                .span-2 { grid-column: span 2; }
                .span-4 { grid-column: span 4; }

                /* Buttons UI */
                .action-bar { position: sticky; top: 20px; display: flex; flex-direction: column; gap: 15px; }
                
                .btn-main { 
                    border: none; padding: 18px; border-radius: 15px; font-weight: 800; 
                    cursor: pointer; font-size: 15px; display: flex; align-items: center; 
                    justify-content: center; gap: 12px; width: 100%;
                    text-transform: uppercase; letter-spacing: 1px;
                }
                
                .btn-save { background: var(--accent); color: white; box-shadow: 0 10px 20px rgba(37,99,235,0.2); }
                .btn-update { background: var(--update); color: white; box-shadow: 0 10px 20px rgba(245,158,11,0.2); }
                
                .btn-sec-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .btn-sec { 
                    padding: 14px; border-radius: 12px; border: 1.5px solid var(--border); 
                    font-weight: 700; cursor: pointer; background: white; font-size: 13px;
                }
                .btn-sec:hover { background: #f8fafc; border-color: #cbd5e1; }

                /* Badge & Alerts */
                .alumni-badge { 
                    position: absolute; top: -12px; right: 20px; 
                    background: var(--danger); color: white; padding: 6px 16px; 
                    border-radius: 30px; font-size: 11px; font-weight: 800; 
                    display: none; box-shadow: 0 4px 10px rgba(239,68,68,0.3);
                }

                .match-success { border-color: var(--success) !important; background: #f0fdf4 !important; }
                .match-error { border-color: var(--danger) !important; background: #fef2f2 !important; }

                #toast { 
                    position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); 
                    padding: 16px 35px; border-radius: 50px; color: white; display: none; 
                    z-index: 9999; font-weight: 700; box-shadow: 0 15px 30px rgba(0,0,0,0.2);
                    animation: slideUp 0.4s ease;
                }

                @keyframes slideUp { from { bottom: -50px; opacity: 0; } to { bottom: 30px; opacity: 1; } }

                @media (max-width: 1100px) {
                    .main-grid { grid-template-columns: 1fr; }
                    .action-bar { position: relative; top: 0; }
                    .span-2, .span-4 { grid-column: span 1; }
                }
            </style>

            <div class="container">
                <div id="toast"></div>
                
                <header class="top-nav">
                    <div class="brand">
                        <i class="fas fa-shield-halved"></i>
                        Student Profile
                    </div>
                    <div class="search-area" id="searchBox">
                        <input type="text" id="searchKey" placeholder="Search Folio or PEN">
                        <button class="btn-search" onclick="searchStudent()">
                            <i class="fas fa-search" id="searchIcon"></i>
                            <span id="searchText">SEARCH</span>
                        </button>
                    </div>
                </header>

                <form id="stuForm">
                    <div class="main-grid">
                        <div class="left-panel">
                            <div class="card">
                                <div class="alumni-badge" id="alumniLabel"><i class="fas fa-history"></i> ALUMNI RECORD</div>
                                <div class="card-header"><i class="fas fa-user-graduate"></i><h3>Academic & Core Details</h3></div>
                                <div class="input-row">
                                    <div class="group"><label>Folio No.</label><input type="text" id="folio" placeholder="Required" required></div>
                                    <div class="group"><label>Session</label><select id="session"></select></div>
                                    <div class="group"><label>Branch</label><select id="branch" onchange="filterClasses()"></select></div>
                                    <div class="group"><label id="lbl_class">Class</label><select id="class" onchange="filterSections()"></select></div>
                                    <div class="group"><label>Section</label><select id="section"><option value="">SELECT</option></select></div>
                                    <div class="group span-2" style="font-weight: bold;"><label id="lbl_name">Student Full Name</label><input type="text" id="studentName" required style="font-weight: bold;"></div>
                                    <div class="group"><label>Gender</label><select id="gender"><option value="MALE">MALE</option><option value="FEMALE">FEMALE</option></select></div>
                                    <div class="group span-2"><label>Aadhaar Number</label><input type="text" id="aadhaar" class="aadhaar-input" maxlength="14" placeholder="0000-0000-0000"></div>
                                    <div class="group"><label>Date of Birth</label><input type="date" id="dob_raw"></div>
                                    <div class="group"><label>Category</label><select id="category"></select></div>
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header"><i class="fas fa-users"></i><h3>Parents & Residential Details</h3></div>
                                <div class="input-row">
                                    <div class="group span-2"><label>Father Name</label><input type="text" id="fatherName"></div>
                                    <div class="group span-2"><label>Father Aadhaar</label><input type="text" id="fatherAadhaar" class="aadhaar-input" maxlength="14"></div>
                                    <div class="group span-2"><label>Mother Name</label><input type="text" id="motherName"></div>
                                    <div class="group span-2"><label>Mother Aadhaar</label><input type="text" id="motherAadhaar" class="aadhaar-input" maxlength="14"></div>
                                    <div class="group span-4"><label>Current Full Address</label><input type="text" id="address"></div>
                                    <div class="group"><label>Primary Phone</label><input type="text" id="phone1"></div>
                                    <div class="group"><label>Secondary Phone</label><input type="text" id="phone2"></div>
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header"><i class="fas fa-id-card-clip"></i><h3>Admission & Status</h3></div>
                                <div class="input-row">
                                    <div class="group"><label>Admission Date</label><input type="date" id="admissionDate"></div>
                                    <div class="group"><label>Adm. Type</label><select id="admType"></select></div>
                                    <div class="group"><label>RTE Year</label><select id="rteYear"></select></div>
                                    <div class="group"><label>Entry Status</label><select id="status"><option value="RECEIVED">RECEIVED</option><option value="ALL DONE">ALL DONE</option><option value="CORRECTION">CORRECTION</option><option value="ERROR">ERROR</option><option value="STAY-HOLD">STAY-HOLD</option><option value="DROPOUT">DROPOUT</option><option value="TAKE TC">TAKE TC</option></select></div>
                                    <div class="group span-4"><label>Internal Remark</label><input type="text" id="remark" placeholder="Any specific notes..."></div>
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header"><i class="fas fa-bus-front"></i><h3>Transport Management</h3></div>
                                <div style="background: #f8fafc; padding: 15px; border-radius: 12px; margin-bottom: 20px; border: 1px dashed var(--border);">
                                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: var(--primary);">
                                        <input type="checkbox" id="isTransport" onchange="toggleTransportFields()" style="width: 20px; height: 20px; accent-color: var(--accent);">
                                        <b>Enable School Transport Service</b>
                                    </label>
                                </div>
                                <div class="input-row" id="transportBox">
                                    <div class="group span-2"><label>Route</label><select id="transRoute" class="disabled-field" style="opacity: 0.5; pointer-events: none;"></select></div>
                                    <div class="group span-2"><label>Stop Name</label><input type="text" id="stopName" class="disabled-field" style="opacity: 0.5; pointer-events: none;"></div>
                                </div>
                            </div>
                        </div>

                        <div class="right-panel">
                            <div class="action-bar">
                                <button type="submit" class="btn-main btn-save" id="saveBtn">
                                    <i class="fas fa-save"></i> <span> SAVE </span>
                                </button>

                                <button type="button" class="btn-main" style="background:var(--success); color:white; display:none;" id="restoreBtn" onclick="restoreStudent()">
                                    <i class="fas fa-sync"></i> RESTORE 
                                </button>
                                
                                <div class="btn-sec-row">
                                    <button type="button" class="btn-sec" onclick="clearFullForm()">CLEAR</button>
                                    <button type="button" class="btn-sec" style="color:var(--danger)" id="aluActionBtn" onclick="moveToAlumni()">ALUMNI</button>
                                </div>

                                <div class="card">
                                    <div class="card-header"><i class="fas fa-link"></i><h3>E-Shikshakosh</h3></div>
                                    <div class="group"><label id="lbl_ename">E-Name</label><input type="text" id="eName"></div>
                                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:15px;">
                                        <div class="group"><label id="lbl_eclass">E-Class</label><select id="eClass"></select></div>
                                        <div class="group"><label id="lbl_eblock">E-Block</label><select id="eBlock"></select></div>
                                    </div>
                                    <div class="group" style="margin-top:15px;"><label>State ID</label><input type="text" id="stateNo"></div>
                                </div>

                                <div class="card">
                                    <div class="card-header"><i class="fas fa-fingerprint"></i><h3>U-DISE Portal</h3></div>
                                    <div class="group"><label id="lbl_uname">U-Name</label><input type="text" id="uName"></div>
                                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:15px;">
                                        <div class="group"><label id="lbl_uclass">U-Class</label><select id="uClass"></select></div>
                                        <div class="group"><label id="lbl_ublock">U-Section</label><select id="uSection"></select></div>
                                    </div>
                                    <div class="group" style="margin-top:15px;"><label>PEN Number</label><input type="text" id="penNo"></div>
                                    <div class="group" style="margin-top:15px;"><label>APAAR ID</label><input type="text" id="aapaarId"></div>
                                </div>

                                <div class="card">
                                    <div class="card-header"><i class="fas fa-building-columns"></i><h3>Bank Details</h3></div>
                                    <div class="group"><label>Acc Holder Name</label><input type="text" id="accHolder"></div>
                                    <div class="group" style="margin-top:15px;"><label>Account Number</label><input type="text" id="accNo"></div>
                                    <div class="group" style="margin-top:15px;"><label>IFSC Code</label><input type="text" id="ifsc"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
    `;
// --- FULL-PROOF LOGIC SECTION ---

    // 1. Internal State & Helpers
    const getV = (id) => document.getElementById(id)?.value?.trim()?.toUpperCase() || "";
    const setV = (id, val) => { 
        const el = document.getElementById(id);
        if(el) el.value = (val !== undefined && val !== null && val !== "") ? val : ''; 
    };

    const msg = (title, icon = 'success') => {
        Swal.fire({ title, icon, toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
    };

    // 2. Clear Form & Reset UI (With Auto-Focus)
    window.clearFullForm = function() {
        const form = document.getElementById('stuForm');
        if(form) form.reset();
        
        const searchBox = document.getElementById('searchKey');
        if(searchBox) {
            searchBox.value = "";
            setTimeout(() => searchBox.focus(), 50); // Small delay to ensure DOM stability
        }

        // Reset UI Elements
        document.getElementById('alumniLabel').style.display = 'none';
        document.getElementById('restoreBtn').style.display = 'none';
        document.getElementById('aluActionBtn').style.display = 'block';
        
        const saveBtn = document.getElementById('saveBtn');
        saveBtn.className = "btn-main btn-save";
        saveBtn.style.display = 'flex';
        saveBtn.innerHTML = `<i class="fas fa-save"></i> <span> SAVE </span>`;
        
        toggleTransportFields();
        checkMatches();
    };

    // 3. Search Logic
    window.searchStudent = async function(manualKey = null) {
        const key = manualKey || getV('searchKey');
        if (!key) return msg("Enter Folio or PEN", "warning");

        const icon = document.getElementById('searchIcon');
        const text = document.getElementById('searchText');
        if (icon) icon.className = "fas fa-circle-notch fa-spin";
        if (text) text.innerText = "LOADING...";

        try {
            let d = null, isAlu = false;

            let snap = await db.ref(`student/${key}`).once('value');
            if (snap.exists()) {
                d = snap.val();
            } else {
                const penSnap = await db.ref('student').orderByChild('govtMapping/udise/penNo').equalTo(key).once('value');
                if (penSnap.exists()) penSnap.forEach(c => d = c.val());
            }

            if (!d) {
                let alSnap = await db.ref(`alumni/${key}`).once('value');
                if (alSnap.exists()) {
                    d = alSnap.val();
                    isAlu = true;
                } else {
                    const alPenSnap = await db.ref('alumni').orderByChild('govtMapping/udise/penNo').equalTo(key).once('value');
                    if (alPenSnap.exists()) {
                        alPenSnap.forEach(c => d = c.val());
                        isAlu = true;
                    }
                }
            }

            if (d) {
                fillForm(d, isAlu);
            } else {
                msg("No record found", "error");
            }
        } catch (e) {
            console.error(e);
            msg("Search Error", "error");
        } finally {
            if (icon) icon.className = "fas fa-search";
            if (text) text.innerText = "SEARCH";
        }
    };

    function fillForm(d, isAlu) {
        if (!d) return;

        setV('folio', d.profile?.folio);
        setV('session', d.academic?.session);
        setV('studentName', d.profile?.studentName);
        setV('gender', d.profile?.gender);
        setV('category', d.profile?.category);
        setV('aadhaar', formatAadhaar(d.profile?.aadhaar));
        setDateInput('dob_raw', d.profile?.dob);
        setV('branch', d.academic?.branch);

        if (window.filterClasses) window.filterClasses();
        setV('class', d.academic?.class);

        if (window.filterSections) window.filterSections();
        setV('section', d.academic?.section);

        setV('fatherName', d.parents?.father?.name);
        setV('fatherAadhaar', formatAadhaar(d.parents?.father?.aadhaar));
        setV('motherName', d.parents?.mother?.name);
        setV('motherAadhaar', formatAadhaar(d.parents?.mother?.aadhaar));

        setV('address', d.contact?.address);
        setV('phone1', d.contact?.phone1);
        setV('phone2', d.contact?.phone2);

        const transCheck = document.getElementById('isTransport');
        if (transCheck) {
            transCheck.checked = !!d.transport?.enabled;
            if (window.toggleTransportFields) window.toggleTransportFields();
            setTimeout(() => {
                setV('transRoute', d.transport?.route);
                setV('stopName', d.transport?.stop);
            }, 50);
        }

        setV('eName', d.govtMapping?.eshikshakosh?.eshikshaName);
        setV('eClass', d.govtMapping?.eshikshakosh?.eClass);
        setV('eBlock', d.govtMapping?.eshikshakosh?.eBlock);
        setV('stateNo', d.govtMapping?.eshikshakosh?.stateNo);
        setV('uName', d.govtMapping?.udise?.udiseName);
        setV('uClass', d.govtMapping?.udise?.uClass);
        setV('uSection', d.govtMapping?.udise?.uSection);
        setV('penNo', d.govtMapping?.udise?.penNo);
        setV('aapaarId', d.govtMapping?.udise?.aapaarId);

        setV('accHolder', d.bank?.accountHolder);
        setV('accNo', d.bank?.accountNo);
        setV('ifsc', d.bank?.ifsc);
        setDateInput('admissionDate', d.admission?.admissionDate);
        setV('admType', d.admission?.type);
        setV('rteYear', d.admission?.rteYear);
        setV('status', d.remark?.status);
        setV('remark', d.remark?.note);

        const el = (id) => document.getElementById(id);
        const elements = {
            alumniLabel: el('alumniLabel'),
            restoreBtn: el('restoreBtn'),
            aluActionBtn: el('aluActionBtn'),
            saveBtn: el('saveBtn')
        };

        if (elements.alumniLabel) elements.alumniLabel.style.display = isAlu ? 'block' : 'none';
        if (elements.restoreBtn) elements.restoreBtn.style.display = isAlu ? 'flex' : 'none';
        if (elements.aluActionBtn) elements.aluActionBtn.style.display = isAlu ? 'none' : 'block';

        if (elements.saveBtn) {
            elements.saveBtn.style.display = isAlu ? 'none' : 'flex';
            if (!isAlu) {
                elements.saveBtn.className = "btn-main btn-update";
                elements.saveBtn.innerHTML = `<i class="fas fa-sync-alt"></i> <span> UPDATE </span>`;
            }
        }

        if (window.checkMatches) window.checkMatches();
    }

    // 4. Transport & Filters
    window.toggleTransportFields = function() {
        const isChecked = document.getElementById('isTransport').checked;
        const fields = ['transRoute', 'stopName'];
        fields.forEach(id => {
            const el = document.getElementById(id);
            if(el) {
                el.style.opacity = isChecked ? "1" : "0.5";
                el.style.pointerEvents = isChecked ? "auto" : "none";
                if(!isChecked) setV(id, "");
            }
        });
    };

    window.filterClasses = function() {
        const branch = getV('branch');
        const classEl = document.getElementById('class');
        if(!classEl) return;
        const cur = classEl.value;
        classEl.innerHTML = '<option value="">CLASS</option>';
        if (!branch || !foundationData.classes) return;
        const filtered = Object.values(foundationData.classes).filter(i => i.branch === branch);
        [...new Set(filtered.map(i => i.className))].forEach(c => {
            classEl.innerHTML += `<option value="${c}">${c}</option>`;
        });
        classEl.value = cur;
    };

    window.filterSections = function() {
        const br = getV('branch'), cl = getV('class'), secEl = document.getElementById('section');
        if(!secEl) return;
        const cur = secEl.value;
        secEl.innerHTML = '<option value="">SEC</option>';
        if (!br || !cl) return;
        const match = Object.values(foundationData.classes).find(i => i.branch === br && i.className === cl);
        if (match && match.sections) {
            match.sections.split(',').forEach(s => {
                secEl.innerHTML += `<option value="${s.trim()}">${s.trim()}</option>`;
            });
        }
        secEl.value = cur;
    };

    // 5. Save / Move / Restore
    document.getElementById('stuForm').onsubmit = async (e) => {
        e.preventDefault();
        const f = getV('folio');
        if(!f) return msg("Folio required", "error");

        const dbData = {
            profile: { folio: f, studentName: getV('studentName'), aadhaar: getV('aadhaar').replace(/-/g,''), dob: getV('dob_raw'), gender: getV('gender'), category: getV('category') },
            academic: { session: getV('session'), branch: getV('branch'), class: getV('class'), section: getV('section') },
            parents: { 
                father: { name: getV('fatherName'), aadhaar: getV('fatherAadhaar').replace(/-/g,'') }, 
                mother: { name: getV('motherName'), aadhaar: getV('motherAadhaar').replace(/-/g,'') } 
            },
            contact: { phone1: getV('phone1'), phone2: getV('phone2'), address: getV('address') },
            transport: { enabled: document.getElementById('isTransport').checked, route: getV('transRoute'), stop: getV('stopName') },
            bank: { accountHolder: getV('accHolder'), accountNo: getV('accNo'), ifsc: getV('ifsc') },
            admission: { admissionDate: getV('admissionDate'), type: getV('admType'), rteYear: getV('rteYear') },
            remark: { status: getV('status'), note: getV('remark') },
            govtMapping: {
                eshikshakosh: { eshikshaName: getV('eName'), eClass: getV('eClass'), eBlock: getV('eBlock'), stateNo: getV('stateNo') },
                udise: { udiseName: getV('uName'), uClass: getV('uClass'), uSection: getV('uSection'), penNo: getV('penNo'), aapaarId: getV('aapaarId') }
            }
        };

        try {
            await db.ref(`student/${f}`).set(dbData);
            msg("Record Saved!"); 
            window.clearFullForm();
        } catch(e) { msg("Save Error", "error"); }
    };

    window.moveToAlumni = async function() {
        const f = getV('folio');
        if(!f) return msg("Folio Required", "error");
        const confirm = await Swal.fire({ title: 'Archive Student?', text: "Move to Alumni list?", icon: 'warning', showCancelButton: true });
        if(confirm.isConfirmed) {
            try {
                const snap = await db.ref(`student/${f}`).once('value');
                if(snap.exists()) {
                    await db.ref(`alumni/${f}`).set(snap.val());
                    await db.ref(`student/${f}`).remove();
                    msg("Moved to Alumni");
                    window.clearFullForm();
                }
            } catch(e) { msg("Error", "error"); }
        }
    };

    window.restoreStudent = async function() {
        const f = getV('folio');
        try {
            const snap = await db.ref(`alumni/${f}`).once('value');
            if(snap.exists()) {
                await db.ref(`student/${f}`).set(snap.val());
                await db.ref(`alumni/${f}`).remove();
                msg("Student Restored");
                window.clearFullForm();
            }
        } catch(e) { msg("Restore Error", "error"); }
    };

    // 6. Utils & Formatting
    function formatAadhaar(val) {
        if(!val) return "";
        let clean = val.toString().replace(/\D/g, '');
        let res = "";
        for(let i=0; i<clean.length && i<12; i++) { if(i>0 && i%4===0) res+='-'; res+=clean[i]; }
        return res;
    }

    function setDateInput(id, val) {
        const el = document.getElementById(id);
        if (!el) return;

        if (!val) {
            el.value = "";
            return;
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
            el.value = val;
        } else {
            el.value = "";
        }
    }


    window.checkMatches = function() {
        const matchGroups = [
            {
                fields: ['studentName', 'eName', 'uName'],
                type: 'text'
            },
            {
                fields: ['class', 'eClass', 'uClass'],
                type: 'dropdown'
            },
            {
                fields: ['eBlock', 'uSection'],
                type: 'dropdown'
            }
        ];

        matchGroups.forEach(group => {
            const values = group.fields.map(id => getV(id));
            const isFilled = values[0] !== "";
            const isMatch = isFilled && values.every(v => v === values[0]);

            group.fields.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    const filledCount = values.filter(v => v !== "").length;
                    
                    el.classList.toggle('match-success', isMatch);
                    el.classList.toggle('match-error', !isMatch && filledCount >= 2);
                }
            });
        });
    };

    // 7. Initialize
    async function init() {
        // 1. Foundation Data Load Karein
        const snap = await db.ref('foundation').once('value');
        foundationData = snap.val() || {};
        
        // Dropdown fill karne ka helper function
        const fill = (id, list, fld = 'name') => {
            const el = document.getElementById(id); if(!el) return;
            el.innerHTML = '<option value="">SELECT</option>';
            if(list) Object.values(list).forEach(i => el.innerHTML += `<option value="${i[fld]}">${i[fld]}</option>`);
        };

        // 2. Saare Dropdowns Fill Karein
        fill('session', foundationData.sessions);
        fill('branch', foundationData.branches);
        fill('category', foundationData.categories);
        fill('admType', foundationData.admission);
        fill('rteYear', foundationData.sessions);
        fill('eBlock', foundationData.eblock);
        fill('uSection', foundationData.ublock);
        fill('transRoute', foundationData.transport, 'groupName');

        const cls = [...new Set(Object.values(foundationData.classes || {}).map(x => x.className))];
        ['eClass','uClass'].forEach(id => {
            const el = document.getElementById(id);
            if(el) {
                el.innerHTML = '<option value="">SELECT</option>';
                cls.forEach(c => el.innerHTML += `<option value="${c}">${c}</option>`);
            }
        });

        // 3. Edit Logic: Check karein ki kya koi student edit mode mein hai
        // Hum pehle App.state check karenge, phir URL
        const editingFolio = (App.state && App.state.editingFolio) || new URLSearchParams(window.location.search).get('folio');

        if (editingFolio) {
            console.log("Editing Student Folio:", editingFolio);
            
            // Input field mein folio set karein (agar search box hai)
            const searchInp = document.getElementById('searchKey');
            if(searchInp) searchInp.value = editingFolio;

            // Student ka data fetch aur fill karein
            await window.searchStudent(editingFolio);

            // Kaam khatam hone ke baad state clean karein taaki refresh pe naya form khule
            if(App.state) App.state.editingFolio = null; 
        }

        // 4. Search Input Listeners
        const searchInp = document.getElementById('searchKey');
        if(searchInp) {
            searchInp.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') { e.preventDefault(); window.searchStudent(); }
            });
            if(!editingFolio) searchInp.focus(); // Focus sirf tab jab naya search ho
        }
    }

    // Input Formatting Listener
    document.addEventListener('input', (e) => {
        if(e.target.classList.contains('aadhaar-input')) e.target.value = formatAadhaar(e.target.value);
        if(e.target.tagName === 'INPUT' && e.target.type === 'text' && e.target.id !== 'searchKey') {
            const s = e.target.selectionStart;
            e.target.value = e.target.value.toUpperCase();
            e.target.setSelectionRange(s, s);
        }
        if(['studentName', 'eName', 'uName', 'class', 'eClass', 'uClass', 'eBlock', 'uSection'].includes(e.target.id)) {
            window.checkMatches();
        }
    });

    init();
};