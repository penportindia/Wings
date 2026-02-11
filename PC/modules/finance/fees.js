window.init_fee_collection = function(state) {
    const content = document.getElementById('main-content');
    const currentUser = state.user?.name || "System Admin";
    const styles = `
    <style>
        :root {
            --primary: #4f46e5; --success: #059669; --danger: #e11d48;
            --slate-900: #0f172a; --slate-100: #f1f5f9; --white: #ffffff;
            --warning: #f59e0b;
        }
        * { margin:0; padding:0; box-sizing:border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
        body { background: #f8fafc; color: var(--slate-900); }
        .erp-container { display: grid; grid-template-columns: 380px 1fr; gap: 20px; max-width: 1600px; margin: auto; padding: 15px; }

        /* Summary Dashboard */
        .summary-grid { grid-column: 1 / span 2; display: grid; grid-template-columns: repeat(6, 1fr); gap: 15px; margin-bottom: 15px; }
        .sum-card { background: white; padding: 18px; border-radius: 16px; border-bottom: 4px solid var(--primary); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); position: relative; transition: 0.3s; }
        .sum-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .sum-card small { color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .sum-card h3 { font-size: 22px; font-weight: 800; margin-top: 5px; color: #1e293b; }
        .btn-edit-due { position: absolute; top: 10px; right: 10px; font-size: 14px; cursor: pointer; color: var(--primary); opacity: 0.5; transition: 0.3s; }
        .btn-edit-due:hover { opacity: 1; transform: scale(1.1); }

        /* Sidebar & Profile */
        .card { background: white; border-radius: 20px; padding: 25px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); margin-bottom: 20px; border: 1px solid #e2e8f0; }
        .search-box input { width: 100%; padding: 14px; border: 2px solid var(--slate-100); border-radius: 12px; font-weight: 700; outline:none; transition: 0.3s; background: #fdfdfd; }
        .search-box input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
        
        .profile-badge { display: inline-block; padding: 5px 12px; border-radius: 8px; font-size: 11px; font-weight: 800; color: white; margin-bottom: 12px; text-transform: uppercase; }
        .bg-new { background: #8b5cf6; } .bg-old { background: #3b82f6; } .bg-rte { background: #db2777; }

        /* Fee Grids */
        .section-header { font-size: 13px; font-weight: 800; color: var(--primary); margin-bottom: 15px; display: flex; align-items: center; gap: 10px; text-transform: uppercase; border-left: 4px solid var(--primary); padding-left: 10px; }
        .fee-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px; margin-bottom: 30px; }
        
        .chip input { display: none; }
        .chip label { 
            display: block; text-align: center; padding: 12px 5px; background: #fff; border: 2px solid #f1f5f9; 
            border-radius: 12px; cursor: pointer; transition: 0.2s; font-size: 11px; font-weight: 700; position: relative;
        }
        .chip input:checked + label { background: var(--primary); color: white; border-color: var(--primary); box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3); }
        .chip input:disabled + label { background: #dcfce7; color: #15803d; border-color: #bbf7d0; cursor: not-allowed; opacity: 0.8; }
        .chip label.chip-disabled { background: #f1f5f9; color: #94a3b8; border-color: #e2e8f0; }

        /* History Table */
        .hist-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; font-size: 13px; }
        .hist-table tr { background: #fcfcfc; }
        .hist-table td { padding: 12px; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; font-weight: 600; }
        .hist-table td:first-child { border-left: 1px solid #f1f5f9; border-top-left-radius: 10px; border-bottom-left-radius: 10px; }
        .hist-table td:last-child { border-right: 1px solid #f1f5f9; border-top-right-radius: 10px; border-bottom-right-radius: 10px; }
        
        .btn-icon { border: none; padding: 8px; border-radius: 8px; cursor: pointer; margin-left: 5px; transition: 0.2s; }
        .btn-icon:hover { transform: translateY(-2px); }
        .btn-print { background: #e0e7ff; color: #4338ca; }
        .btn-del { background: #fee2e2; color: #b91c1c; }

        @media print {
            @page { size: A4 landscape; margin: 5mm; }
            body * { visibility: hidden; }
            #receipt-wrapper, #receipt-wrapper * { visibility: visible; }
            #receipt-wrapper { 
                display: flex !important; 
                position: absolute; top: 0; left: 0; width: 100%; 
                gap: 10mm; padding: 5mm;
            }
            .erp-container { display: none !important; }
        }
        
        #receipt-wrapper { display: none; }
        .receipt-instance { 
            width: 48%; 
            border: 1px dashed #ccc; 
            padding: 15mm; 
            background: white; 
            min-height: 190mm;
            flex-shrink: 0;
        }

        /* Hide Spinners */
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
    </style>
    `;

    content.innerHTML = styles + `
    <div class="erp-container">
        <div class="summary-grid">
            <div class="sum-card"> 
                <small>Pichla Baki</small> 
                <h3 id="st-old">₹ 0</h3> 
                <i class="fa fa-edit btn-edit-due" title="Add Back Session Due" onclick="FeeModule.setManualDue()"></i>
            </div>
            <div class="sum-card" style="border-color: var(--success);"> <small>Advance Amt</small> <h3 id="st-adv">₹ 0</h3> </div>
            <div class="sum-card" style="border-color: var(--warning);"> <small>Selection</small> <h3 id="st-sel">₹ 0</h3> </div>
            <div class="sum-card"> <small>Net Payable</small> <h3 id="st-net" style="color:var(--primary)">₹ 0</h3> </div>
            <div class="sum-card" style="border-color: var(--danger);"> <small>Balance</small> <h3 id="st-final">₹ 0</h3> </div>
            <div class="sum-card" style="border-color: #000;"> <small>Adm. Type</small> <h3 id="st-status">-</h3> </div>
        </div>

        <div class="sidebar" style="width: 380px; padding: 15px; font-family: 'Poppins', sans-serif;">
    
            <div class="card" style="background: #ffffff; border-radius: 20px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #eef2f6; margin-bottom: 25px;">
                <div class="search-box" style="position: relative;">
                    <i class="fa fa-search" style="position: absolute; left: 15px; top: 15px; color: #6366f1; font-size: 18px;"></i>
                    <input type="text" id="folio-input" placeholder=" Search " 
                        style="width: 100%; padding: 12px 12px 12px 45px; border-radius: 12px; border: 2px solid #f1f5f9; outline: none; font-weight: 700; font-size: 15px; transition: 0.3s; background: #f8fafc; color: #e11d48;"
                        onfocus="this.style.borderColor='#6366f1'; this.style.background='#fff';"
                        onblur="this.style.borderColor='#f1f5f9'; this.style.background='#f8fafc';"
                        onkeypress="if(event.key==='Enter') FeeModule.searchStudent()">
                </div>
                
                <div id="profile-section" style="display:none; margin-top:30px; text-align: center;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(45deg, #6366f1, #a855f7); border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 15px rgba(99, 102, 241, 0.3);">
                        <i class="fa fa-user-graduate" style="color: white; font-size: 35px;"></i>
                    </div>

                    <h2 id="disp-name" style="font-size:24px; margin: 0 0 5px 0; color: #1e293b; font-weight: 800; letter-spacing: -0.5px;">-</h2>
                    <div id="disp-class" style="color:#ffffff; font-weight:700; font-size:13px; margin: 0 0 20px 0; background: #6366f1; display: inline-block; padding: 5px 15px; border-radius: 10px; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);">Class: -</div>
                    
                    <br>
                    <div id="type-badge" class="profile-badge" style="margin-bottom: 25px; display: inline-block; font-weight: 600; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: #64748b; border: 1px solid #e2e8f0; padding: 3px 10px; border-radius: 5px;">-</div>
                    
                    <div style="border-top: 2px solid #f8fafc; padding-top: 20px; text-align: left;">
                        <label style="font-size: 11px; color: #94a3b8; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; display: block; padding-left: 5px;">Academic Session</label>
                        <select id="session-select" onchange="FeeModule.searchStudent()" 
                            style="width:100%; padding:12px; border-radius:12px; border:2px solid #e2e8f0; margin-bottom:20px; font-weight:700; background: #ffffff; cursor: pointer; color: #1e293b;">
                        </select>
                        
                        <div style="display: grid; gap: 10px;">
                            <div style="background: #fff7ed; padding: 12px; border-radius: 12px; border-left: 4px solid #f97316; display: flex; align-items: center;">
                                <i class="fa fa-user" style="width:30px; color:#f97316; font-size: 16px;"></i> 
                                <span style="color: #7c2d12; font-size: 14px;">Father: <b id="disp-father" style="margin-left:5px;">--</b></span>
                            </div>

                            <div style="background: #f0fdf4; padding: 12px; border-radius: 12px; border-left: 4px solid #22c55e; display: flex; align-items: center;">
                                <i class="fa fa-bus" style="width:30px; color:#22c55e; font-size: 16px;"></i> 
                                <span style="color: #14532d; font-size: 14px;">Route: <b id="disp-route" style="margin-left:5px;">--</b></span>
                            </div>

                            <div style="background: #eff6ff; padding: 12px; border-radius: 12px; border-left: 4px solid #3b82f6; display: flex; align-items: center;">
                                <i class="fa fa-calendar-alt" style="width:30px; color:#3b82f6; font-size: 16px;"></i> 
                                <span style="color: #1e3a8a; font-size: 14px;">Adm Date: <b id="disp-adm" style="margin-left:5px;">--</b></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card" id="history-section" style="display:none">
                <div class="section-header">Payment History</div>
                <div style="max-height: 300px; overflow-y: auto;">
                    <table class="hist-table">
                        <tbody id="hist-body"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="main-content">
            <div class="card">
                <div id="fees-container">
                    <div class="section-header"><i class="fa fa-star"></i> Annual & One-Time Charges</div>
                    <div id="grid-fixed" class="fee-grid"></div>

                    <div class="section-header"><i class="fa fa-book-open"></i> Monthly Tuition Fees</div>
                    <div id="grid-tuition" class="fee-grid"></div>

                    <div class="section-header"><i class="fa fa-shuttle-van"></i> Transport Fees</div>
                    <div id="grid-transport" class="fee-grid"></div>
                </div>
            </div>

            <div class="pay-bar-sleek" style="position: sticky; bottom: 10px; display: flex; align-items: center; background: #ffffff; padding: 10px 20px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; z-index: 1000; margin: 10px; gap: 20px;">
                
                <div style="display: flex; align-items: center; gap: 12px; padding-right: 20px; border-right: 1.5px solid #f1f5f9;">
                    <div style="background: #fff1f2; padding: 8px; border-radius: 10px;">
                        <i class="material-icons-round" style="color: #e11d48; font-size: 20px; display: block;">account_balance_wallet</i>
                    </div>
                    <div>
                        <small style="display: block; font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Net Due</small>
                        <span id="bar-net" style="font-size: 16px; font-weight: 800; color: #1e293b;">₹ 0</span>
                    </div>
                </div>

                <div style="flex: 1; display: flex; align-items: center; gap: 15px;">
                    <div style="width: 130px;">
                        <small style="display: block; font-size: 9px; font-weight: 700; color: #64748b; margin-bottom: 3px;">DATE</small>
                        <input type="date" id="pay-date" style="width: 100%; padding: 6px 8px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 12px; font-weight: 600; outline: none; background: #f8fafc;">
                    </div>
                    
                    <div style="width: 70px;">
                        <small style="display: block; font-size: 9px; font-weight: 700; color: #64748b; margin-bottom: 3px;">DISC.</small>
                        <input type="number" id="pay-disc" value="0" oninput="FeeModule.calculate()" style="width: 100%; padding: 6px 8px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 12px; font-weight: 700; outline: none; background: #f8fafc;">
                    </div>

                    <div style="width: 100px;">
                        <small style="display: block; font-size: 9px; font-weight: 700; color: #64748b; margin-bottom: 3px;">MODE</small>
                        <select id="pay-mode" onchange="const txn = document.getElementById('txn-row-pro'); txn.style.display = (this.value === 'UPI' || this.value === 'Cheque') ? 'flex' : 'none';" style="width: 100%; padding: 6px 8px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 12px; font-weight: 600; outline: none; cursor: pointer; background: #f8fafc;">
                            <option value="Cash">Cash</option>
                            <option value="UPI">UPI / QR</option>
                            <option value="Cheque">Cheque</option>
                        </select>
                    </div>

                    <div id="txn-row-pro" style="display: none; flex-direction: column; width: 120px;">
                        <small style="display: block; font-size: 9px; font-weight: 700; color: #6366f1; margin-bottom: 3px;">REF NO.</small>
                        <input type="text" id="pay-txn" placeholder="Txn ID" style="width: 100%; padding: 6px 8px; border-radius: 8px; border: 1px solid #6366f1; font-size: 12px; outline: none;">
                    </div>

                    <button onclick="let r = document.getElementById('rem-row-pro'); r.style.display = (r.style.display==='none'?'flex':'none')" style="background: none; border: none; color: #94a3b8; cursor: pointer; margin-top: 12px; transition: 0.2s;">
                        <i class="material-icons-round" style="font-size: 20px;">notes</i>
                    </button>
                </div>

                <div id="rem-row-pro" style="display: none; position: absolute; bottom: 70px; left: 300px; width: 300px; background: white; padding: 10px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; flex-direction: column; gap: 5px;">
                    <small style="font-size: 9px; font-weight: 700; color: #64748b;">INTERNAL REMARK</small>
                    <input type="text" id="pay-remark" placeholder="Write a note..." style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #f1f5f9; outline: none; font-size: 12px;">
                </div>

                <div style="display: flex; align-items: center; gap: 15px; background: #f8fafc; padding: 5px 5px 5px 15px; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <div style="text-align: right;">
                        <small style="display: block; font-size: 9px; font-weight: 800; color: #10b981; text-transform: uppercase;">Paying Now</small>
                        <div style="display: flex; align-items: center;">
                            <span style="font-size: 14px; font-weight: 800; color: #10b981; margin-right: 2px;">₹</span>
                            <input type="number" id="pay-amt" placeholder="0" oninput="FeeModule.calculate()" style="background: transparent; border: none; font-size: 18px; font-weight: 900; color: #1e293b; outline: none; width: 90px; text-align: right;">
                        </div>
                    </div>
                    <button onclick="FeeModule.processPayment()" style="background: #10b981; color: white; border: none; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s;">
                        <i class="material-icons-round" style="font-size: 18px;">print</i> PAY
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div id="receipt-wrapper">
        <div class="receipt-instance" id="receipt-left"></div>
        <div class="receipt-instance" id="receipt-right"></div>
    </div>

    <div id="receipt-template" style="display: none;">
        <div style="font-family: 'Inter', 'Segoe UI', Roboto, sans-serif; padding: 30px; color: #000000; background: #fff; max-width: 800px; margin: auto; position: relative; border: 1px solid #000000;">
            
            <div style="display: flex; justify-content: space-between; align-items: stretch; border-bottom: 3px double #000000; padding-bottom: 30px; margin-bottom: 30px; font-family: 'Inter', system-ui, sans-serif;">
                
                <div style="display: flex; align-items: center; gap: 24px;">
                    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
                        <img src="https://i.ibb.co/9kGbqWb7/Logo.png" alt="School Logo" style="width: 90px; height: 90px; object-fit: contain; z-index: 1;">
                    </div>

                    <div style="display: flex; flex-direction: column; justify-content: center;">
                        <h1 style="margin: 0; padding: 0; line-height: 1;">
                            <span style="font-size: 32px; font-weight: 900; color: #000000; letter-spacing: -1px;">THE WINGS</span><br>
                            <span style="font-size: 19px; font-weight: 700; color: #000000; letter-spacing: 1.5px; text-transform: uppercase;">Foundation Academy</span>
                        </h1>
                        
                        <div style="margin: 8px 0; display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 10px; font-weight: 800; color: #ffffff; background: #000000; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.5px;">CBSE AFFILIATED</span>
                            <span style="font-size: 11px; font-weight: 700; color: #000000;">LOK NAGAR, JEHANABAD, BIHAR</span>
                        </div>

                        <div style="display: flex; gap: 15px; margin-top: 5px;">
                            <span style="display: flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700; color: #000000;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#000000"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.28-2.27a2 2 0 0 1 2.11-.45c1.16.5 2.51.96 3.82.7a2 2 0 0 1 1.7 1.69z"></path></svg>
                                +91 7742986877
                            </span>
                            <span style="display: flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700; color: #000000;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                <a href="https://thewingsfoundatioacademy.com" style="text-decoration: none; color: inherit;">thewingsfoundatioacademy.com</a>
                            </span>
                        </div>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end;">
                    <div style="background: #000000; color: white; padding: 6px 18px; font-weight: 800; border-radius: 6px; font-size: 14px; letter-spacing: 1px;">
                        FEE RECEIPT
                    </div>
                    
                    <div style="margin-top: 12px; text-align: right; background: #ffffff; padding: 8px 12px; border-radius: 8px; border: 1px solid #000000; border-right: 6px solid #000000;">
                        <p style="margin: 2px 0; font-size: 12px; color: #000000; font-weight: 700;">
                            Session: <span class="r-session" style="color: #000000; font-weight: 900;">2025-26</span>
                        </p>
                        <p style="margin: 2px 0; font-size: 12px; color: #000000; font-weight: 700;">
                            Date: <span class="r-date" style="color: #000000; font-weight: 900;">30/01/2026</span>
                        </p>
                    </div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; background: #f1f5f9; padding: 15px; border-radius: 12px; border: 1px solid #000000;">
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="font-size: 11px;"><span style="color: #000000; width: 100px; display: inline-block; font-weight: 700;">Folio No:</span> <b class="r-folio" style="color: #000000;"></b></div>
                    <div style="font-size: 11px;"><span style="color: #000000; width: 100px; display: inline-block; font-weight: 700;">Student Name:</span> <b class="r-name" style="color: #000000; font-size: 13px; text-transform: uppercase; font-weight: 900;"></b></div>
                    <div style="font-size: 11px;"><span style="color: #000000; width: 100px; display: inline-block; font-weight: 700;">Class/Grade:</span> <b class="r-class" style="color: #000000; font-weight: 700;"></b></div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px; border-left: 2px solid #000000; padding-left: 20px;">
                    <div style="font-size: 11px;"><span style="color: #000000; width: 100px; display: inline-block; font-weight: 700;">Receipt ID:</span> <b class="r-id" style="color: #000000;"></b></div>
                    <div style="font-size: 11px;"><span style="color: #000000; width: 100px; display: inline-block; font-weight: 700;">Father's Name:</span> <b class="r-father" style="color: #000000; font-weight: 700;"></b></div>
                    <div style="font-size: 11px;"><span style="color: #000000; width: 100px; display: inline-block; font-weight: 700;">Adm. Type:</span> <b class="r-type" style="color: #000000; font-size: 10px; border: 1px solid #000000; padding: 2px 6px; border-radius: 4px; font-weight: 800;"></b></div>
                </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px; border: 1px solid #000000;">
                <thead>
                    <tr style="background: #000000; color: white;">
                        <th style="padding: 12px 15px; text-align: left; font-weight: 700; border: 1px solid #000000;">Description</th>
                        <th style="padding: 12px 15px; text-align: left; font-weight: 700; border: 1px solid #000000;">Period</th>
                        <th style="padding: 12px 15px; text-align: right; font-weight: 700; border: 1px solid #000000;">Amount</th>
                    </tr>
                </thead>
                <tbody class="r-rows" style="color: #000000; font-weight: 600;">
                    </tbody>
                <tfoot style="background: #ffffff;">
                    <tr>
                        <td colspan="2" style="padding: 10px 15px 5px; text-align: right; color: #000000; font-size: 11px; font-weight: 700;">Sub Total:</td>
                        <td style="padding: 10px 15px 5px; text-align: right; font-weight: 800; border: 1px solid #000000;" class="r-sel-total">₹ 0</td>
                    </tr>
                    <tr class="r-old-row">
                        <td colspan="2" style="padding: 5px 15px; text-align: right; color: #000000; font-size: 11px; font-weight: 700;">Previous Due:</td>
                        <td style="padding: 5px 15px; text-align: right; font-weight: 800; border: 1px solid #000000;" class="r-old-due">₹ 0</td>
                    </tr>
                    <tr class="r-adv-row">
                        <td colspan="2" style="padding: 5px 15px; text-align: right; color: #000000; font-size: 11px; font-weight: 700;">Advance Adj:</td>
                        <td style="padding: 5px 15px; text-align: right; color: #000000; font-weight: 800; border: 1px solid #000000;" class="r-adv-adj">- ₹ 0</td>
                    </tr>
                    <tr class="r-disc-row">
                        <td colspan="2" style="padding: 5px 15px; text-align: right; color: #000000; font-size: 11px; font-weight: 700;">Discount:</td>
                        <td style="padding: 5px 15px; text-align: right; color: #000000; font-weight: 800; border: 1px solid #000000;" class="r-discount">- ₹ 0</td>
                    </tr>
                    <tr style="border-top: 2px solid #000000;">
                        <td colspan="2" style="padding: 12px 15px; text-align: right; font-weight: 900; color: #000000; font-size: 13px;">Net Payable:</td>
                        <td style="padding: 12px 15px; text-align: right; font-weight: 900; color: #000000; font-size: 13px; border: 1px solid #000000;" class="r-net-payable">₹ 0</td>
                    </tr>
                    <tr style="background: #e2e8f0;">
                        <td colspan="2" style="padding: 12px 15px; text-align: right; font-weight: 900; color: #000000; border: 1px solid #000000;">AMOUNT PAID:</td>
                        <td style="padding: 12px 15px; text-align: right; font-weight: 900; color: #000000; font-size: 20px; border: 1px solid #000000;" class="r-paid">₹ 0</td>
                    </tr>
                </tfoot>
            </table>

            <div style="display: flex; justify-content: flex-end; margin-bottom: 25px;">
                <div style="background: #ffffff; border: 2px solid #000000; padding: 10px 20px; border-radius: 8px; text-align: right;">
                    <span class="r-bal-label" style="font-size: 11px; font-weight: 900; color: #000000; text-transform: uppercase;">Current Balance Due:</span>
                    <div class="r-bal" style="font-size: 22px; font-weight: 900; color: #000000;">₹ 0</div>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px;">
                <div style="background: #ffffff; padding: 15px; border-radius: 8px; width: 55%; border: 1px solid #000000; font-size: 10px; line-height: 1.6;">
                    <p style="margin: 0 0 8px 0; color: #000000; font-weight: 900; border-bottom: 1px solid #000000; padding-bottom: 4px;">PAYMENT METADATA</p>
                    <div style="display: grid; grid-template-columns: 80px 1fr; gap: 4px;">
                        <span style="color: #000000; font-weight: 700;">Method:</span> <span class="r-mode" style="font-weight: 800; color: #000000;"></span>
                        <span style="color: #000000; font-weight: 700;">TXN ID:</span> <span class="r-txn" style="font-family: monospace; font-weight: 800; color: #000000;"></span>
                        <span style="color: #000000; font-weight: 700;">Notes:</span> <span class="r-remark-val" style="color: #000000; font-weight: 700; font-style: italic;"></span>
                    </div>
                </div>
                
                <div style="text-align: center; width: 35%;">
                    <div style="height: 50px;"></div> 
                    <p class="r-user-name" style="margin: 0; font-size: 12px; font-weight: 900; color: #000000;"></p>
                    <div style="border-top: 2px solid #000000; margin-top: 5px; padding-top: 5px;">
                        <p style="margin: 0; font-size: 10px; font-weight: 900; color: #000000; text-transform: uppercase; letter-spacing: 1px;">Accounts Department</p>
                    </div>
                </div>
            </div>

            <div style="margin-top: 40px; border-top: 1px dashed #000000; padding-top: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                    <div style="color: #000000; font-size: 10px; font-weight: 700; max-width: 250px; line-height: 1.4;">
                        <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="3"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                            <span style="font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">Note:</span>
                        </div>
                        This is a computer-generated document and does not require a physical signature.
                    </div>

                    <div style="text-align: right;">
                        <div style="font-size: 9px; color: #000000; font-weight: 800; margin-bottom: -2px;">Designed & Maintained by</div>
                        <p style="font-size: 12px; font-weight: 900; color: #000000; margin: 0;">Penport India</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    FeeModule.init();
};

/**
 * SCHOOL ERP - FEE MANAGEMENT MODULE (Optimized)
 * Features: Parallel Fetch, RTE/New Student Detection, Dynamic Grids, Ledger Calculations, A4 Receipt Printing.
 */

const FeeModule = {
    student: null,
    foundation: {},
    currentSession: "",
    oldDue: 0,
    advance: 0,
    paidList: { monthly: new Set(), fixed: new Set() },
    MONTHS: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],

    // --- Helper: Safely get/set DOM elements ---
    el: (id) => document.getElementById(id),
    val: (id) => document.getElementById(id)?.value || "",
    setVal: (id, v) => { if(document.getElementById(id)) document.getElementById(id).value = v; },
    setText: (id, v) => { if(document.getElementById(id)) document.getElementById(id).innerText = v; },

    async init() {
        try {
            const snap = await db.ref('foundation').once('value');
            this.foundation = snap.val() || {};
            
            const sessSelect = this.el('session-select');
            if (sessSelect && this.foundation.sessions) {
                sessSelect.innerHTML = Object.values(this.foundation.sessions).map(s => 
                    `<option value="${s.name}" ${s.name === "2025-26" ? 'selected' : ''}>${s.name}</option>`
                ).join('');

                sessSelect.onchange = () => {
                    this.currentSession = sessSelect.value;
                    if(this.student) this.searchStudent();
                };
                this.currentSession = sessSelect.value;
            } else {
                this.currentSession = "2025-26";
            }

            this.setVal('pay-date', new Date().toISOString().split('T')[0]);
            this.toggleTxnInput();
        } catch (e) { 
            console.error("Initialization Error:", e); 
        }
    },

    toggleTxnInput() {
        const mode = this.val('pay-mode');
        const txnCont = this.el('txn-container');
        if(txnCont) txnCont.style.display = (mode === 'Cash') ? 'none' : 'flex';
    },

    setManualDue() {
        if(!this.student) return Swal.fire("Error", "Search Student First!", "warning");
        const amt = prompt("Enter Due Amount", 0);
        if(amt !== null) {
            this.oldDue = parseFloat(amt) || 0;
            this.calculate();
        }
    },

    async searchStudent() {
        const folio = this.val('folio-input').trim();
        if (!folio) return;

        this.currentSession = this.val('session-select') || this.currentSession;
        this.paidList.monthly.clear();
        this.paidList.fixed.clear();
        
        try {
            // Parallel Fetch: Student + Receipt History
            const [stuSnap, hSnap] = await Promise.all([
                db.ref(`student/${folio}`).once('value'),
                db.ref('fee_receipts').orderByChild('studentFolio').equalTo(folio).once('value')
            ]);

            if (!stuSnap.exists()) {
                this.student = null;
                return Swal.fire('Error', 'Folio Number not found!', 'error');
            }

            this.student = stuSnap.val();
            this.student.folio = folio;

            const historyData = hSnap.val() || {};
            const sortedReceipts = Object.entries(historyData)
                .map(([key, val]) => ({ key, ...val }))
                .sort((a, b) => new Date(a.date) - new Date(b.date));
            
            let globalLastBalance = 0;
            let sessionSpecificHistory = {};

            sortedReceipts.forEach(r => {
                globalLastBalance = parseFloat(r.remainingDueInLedger) || 0; 
                if (r.session === this.currentSession) {
                    sessionSpecificHistory[r.key] = r;
                    r.feesCollected?.forEach(f => {
                        if (f.month && f.month !== 'N/A') {
                            this.paidList.monthly.add(`${f.feeHead}-${f.month}`);
                        } else if (f.feeKey) {
                            this.paidList.fixed.add(f.feeKey);
                        }
                    });
                }
            });

            this.oldDue = globalLastBalance > 0 ? globalLastBalance : 0;
            this.advance = globalLastBalance < 0 ? Math.abs(globalLastBalance) : 0;
            
            this.updateUI(sessionSpecificHistory);
        } catch (e) {
            console.error("Search Error:", e);
            Swal.fire('Error', e.message, 'error');
        }
    },

    updateUI(historyData) {
        if(this.el('profile-section')) this.el('profile-section').style.display = 'block';
        if(this.el('history-section')) this.el('history-section').style.display = 'block';

        const { profile, academic, parents, admission, transport } = this.student;
        
        this.setText('disp-name', profile.studentName);
        this.setText('disp-class', `Class: ${academic.class} - ${academic.section}`);
        this.setText('disp-father', parents.father.name);
        this.setText('disp-adm', admission.admissionDate ? new Date(admission.admissionDate).toLocaleDateString('en-GB') : 'N/A');
        this.setText('disp-route', transport?.enabled ? transport.route : "NOT ASSIGNED");
        this.setText('st-status', admission.type);

        const badge = this.el('type-badge');
        if(badge) {
            const admDate = new Date(admission.admissionDate || Date.now());
            const isRTE = ['RTE', 'FREE'].includes(admission.type);
            const isNew = admDate >= new Date(`${this.currentSession.split('-')[0]}-04-01`);
            
            badge.innerText = isRTE ? "RTE / FREE" : (isNew ? "NEW ADMISSION" : "OLD STUDENT");
            badge.className = `profile-badge ${isRTE ? 'bg-danger' : (isNew ? 'bg-success' : 'bg-primary')}`;
            this.renderGrids(isRTE, isNew, admDate);
        }
        this.renderHistory(historyData);
    },

    renderGrids(isRTE, isNew, admDate) {
        const session = this.currentSession;
        const sClass = this.student.academic.class;
        const master = this.foundation.fee_master?.[session];
        const yrShort = session.split('-')[1]; 

        ['grid-fixed', 'grid-tuition', 'grid-transport'].forEach(id => {
            if(this.el(id)) this.el(id).innerHTML = master ? '' : `<p class="text-danger">Fee not defined</p>`;
        });

        if (!master) return;

        const admDay = admDate.getDate();
        const admMonth = admDate.getMonth();
        const admYear = admDate.getFullYear();
        const admLimit = new Date(admYear, admMonth, 1);

        for (let headId in master) {
            const headInfo = this.foundation.fee_heads[headId];
            if (!headInfo) continue;
            let amt = isRTE ? 0 : (parseInt(master[headId].amounts?.[sClass]) || 0);

            if (headInfo.rotation === 'Monthly') {
                let htmlBuffer = "";
                this.MONTHS.forEach((m, idx) => {
                    const mKey = `${m}-${yrShort}`;
                    const isPaid = this.paidList.monthly.has(`${headInfo.name}-${mKey}`);
                    const fMonthIdx = (idx + 3) % 12;
                    const fYear = idx < 9 ? parseInt(session.split('-')[0]) : (2000 + parseInt(yrShort));
                    const fDate = new Date(fYear, fMonthIdx, 1);
                    
                    let isDisabled = isPaid || (fDate < admLimit) || (admDay > 15 && fMonthIdx === admMonth && fYear === admYear);
                    htmlBuffer += this.createChip(`t-${headId}-${mKey}`, m, amt, headInfo.name, mKey, headId, isPaid, isDisabled);
                });
                if(this.el('grid-tuition')) this.el('grid-tuition').insertAdjacentHTML('beforeend', htmlBuffer);
            } else {
                if (!isNew && headInfo.rotation === 'One-Time') continue;
                const isPaid = this.paidList.fixed.has(headId);
                if(this.el('grid-fixed')) this.el('grid-fixed').insertAdjacentHTML('beforeend', this.createChip(`f-${headId}`, headInfo.name, amt, headInfo.name, "N/A", headId, isPaid, isPaid));
            }
        }

        // Transport Fee Handling
        if (this.student.transport?.enabled) {
            const routeName = this.student.transport.route;
            const routeId = Object.keys(this.foundation.transport || {}).find(k => this.foundation.transport[k].groupName === routeName);
            const trAmt = parseInt(this.foundation.transport_master?.[session]?.amounts?.[routeId]) || 0;
            let trHtmlBuffer = "";
            this.MONTHS.forEach((m, idx) => {
                const mKey = `${m}-${yrShort}`;
                const isPaid = this.paidList.monthly.has(`TRANSPORT FEE-${mKey}`);
                const fMonthIdx = (idx + 3) % 12;
                const fYear = idx < 9 ? parseInt(session.split('-')[0]) : (2000 + parseInt(yrShort));
                const fDate = new Date(fYear, fMonthIdx, 1);
                let isDisabled = isPaid || (fDate < admLimit) || (admDay > 15 && fMonthIdx === admMonth && fYear === admYear);
                trHtmlBuffer += this.createChip(`tr-${mKey}`, m, trAmt, "TRANSPORT FEE", mKey, routeId, isPaid, isDisabled);
            });
            if(this.el('grid-transport')) this.el('grid-transport').insertAdjacentHTML('beforeend', trHtmlBuffer);
        }
        this.calculate();
    },

    createChip(id, label, amt, head, month, headId, isPaid, isDisabled) {
        if (amt === 0 && !['TRANSPORT FEE', 'TUITION FEE'].includes(head)) return '';
        return `<div class="chip">
                    <input type="checkbox" id="${id}" value="${amt}" data-head="${head}" data-month="${month}" data-id="${headId}" onchange="FeeModule.calculate()" ${isDisabled ? 'disabled' : ''}>
                    <label for="${id}" class="${isPaid ? 'paid-label' : ''} ${isDisabled && !isPaid ? 'chip-disabled' : ''}">${label}<br><small>₹${amt}</small></label>
                </div>`;
    },

    calculate() {
        let selected = 0;
        document.querySelectorAll('input[type="checkbox"]:checked:not(:disabled)').forEach(c => selected += parseFloat(c.value) || 0);
        
        const disc = parseFloat(this.val('pay-disc')) || 0;
        const paying = parseFloat(this.val('pay-amt')) || 0;
        const netPayable = (selected + this.oldDue) - this.advance - disc;
        const finalBalance = netPayable - paying;

        const update = (id, v) => { 
            const el = this.el(id); 
            if(el) el.innerText = `₹ ${v.toLocaleString('en-IN')}`; 
        };

        update('st-old', this.oldDue);
        update('st-adv', this.advance);
        update('st-sel', selected);
        update('st-net', netPayable);
        update('bar-net', netPayable);
        
        const finalEl = this.el('st-final');
        if(finalEl) {
            finalEl.innerText = `₹ ${finalBalance.toLocaleString('en-IN')}`;
            finalEl.style.color = finalBalance > 0 ? '#dc3545' : '#198754';
        }
    },

    renderHistory(data) {
        const histBody = this.el('hist-body');
        if(!histBody) return;
        
        const rows = Object.keys(data).sort((a,b) => new Date(data[b].date) - new Date(data[a].date)).map(k => `
            <tr>
                <td><b>#${data[k].receiptNo || 'N/A'}</b><br><small>${new Date(data[k].date).toLocaleDateString('en-GB')}</small></td>
                <td>₹${(data[k].totalCollected || 0).toLocaleString()}<br><small>${data[k].mode}</small></td>
                <td align="right">
                    <button class="btn-icon btn-print" onclick="FeeModule.reprint('${k}')"><i class="fa fa-print"></i></button>
                    <button class="btn-icon btn-del" onclick="FeeModule.deletePayment('${k}')"><i class="fa fa-trash"></i></button>
                </td>
            </tr>`).join('');
        
        histBody.innerHTML = rows || '<tr><td colspan="3" align="center">No history available</td></tr>';
    },

    async processPayment() {
        if (!this.student) return Swal.fire('Error', 'Student search karein', 'error');
        
        const paying = parseFloat(this.val('pay-amt')) || 0;
        const disc = parseFloat(this.val('pay-disc')) || 0;
        const netPayableText = this.el('bar-net')?.innerText || "0";
        const netPayable = parseFloat(netPayableText.replace(/[₹ ,]/g, '')) || 0;
        
        if (paying <= 0 && disc <= 0) return Swal.fire('Error', 'Amount enter karein', 'error');

        Swal.fire({ title: 'Processing...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        try {
            const counterRef = db.ref(`counters/receiptCount/${this.currentSession}`);
            const result = await counterRef.transaction(cv => (cv || 0) + 1);
            const receiptNo = String(result.snapshot.val()).padStart(5, '0');

            const collected = Array.from(document.querySelectorAll('input[type="checkbox"]:checked:not(:disabled)')).map(c => ({
                feeHead: c.dataset.head, 
                month: c.dataset.month, 
                amount: parseFloat(c.value), 
                feeKey: c.dataset.id
            }));

            const currentUserName = (typeof App !== 'undefined' && App.state?.user?.name) ? App.state.user.name : "System Admin";

            const receipt = {
                session: this.currentSession,
                receiptNo: receiptNo,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                studentFolio: this.student.folio,
                studentName: this.student.profile.studentName,
                fatherName: this.student.parents.father.name,
                studentClass: this.student.academic.class,
                studentSection: this.student.academic.section,
                date: new Date(this.val('pay-date')).toISOString(), 
                totalCollected: paying, 
                discount: disc,
                remainingDueInLedger: netPayable - paying, 
                mode: this.val('pay-mode'),
                transactionId: this.val('pay-txn') || 'N/A', 
                remark: this.val('pay-remark') || 'N/A',
                prevOldDue: this.oldDue, 
                prevAdvance: this.advance, 
                collectedBy: currentUserName,
                feesCollected: collected.length ? collected : [{ feeHead: 'Arrears Payment', month: 'N/A', amount: paying }]
            };

            const newRef = await db.ref('fee_receipts').push(receipt);
            
            // Reset fields
            ['pay-amt', 'pay-disc', 'pay-remark', 'pay-txn'].forEach(id => this.setVal(id, id === 'pay-disc' ? 0 : ''));
            
            await this.searchStudent();
            Swal.close();
            this.printA4(receipt, newRef.key);

        } catch(e) { 
            console.error("Payment Error:", e);
            Swal.fire('Error', e.message, 'error'); 
        }
    },

    async reprint(id) {
        const snap = await db.ref(`fee_receipts/${id}`).once('value');
        if (snap.exists()) this.printA4(snap.val(), id);
    },

    async deletePayment(id) {
        const result = await Swal.fire({ title: 'Delete Receipt?', text: "Yeh process undo nahi hoga!", icon: 'warning', showCancelButton: true });
        if (result.isConfirmed) { 
            await db.ref(`fee_receipts/${id}`).remove(); 
            await this.searchStudent(); 
            Swal.fire('Deleted', 'Receipt remove ho gayi hai.', 'success');
        }
    },

    printA4(r, id) {
        if (!r || !r.feesCollected) return;
        const template = this.el('receipt-template');
        if (!template) return;

        const currentSelTotal = r.feesCollected.reduce((acc, f) => acc + Number(f.amount || 0), 0);
        const grouped = {};

        r.feesCollected.forEach(f => {
            if (!grouped[f.feeHead]) {
                grouped[f.feeHead] = { head: f.feeHead, months: [], totalAmt: 0, unitAmt: 0, count: 0 };
            }
            const amt = Number(f.amount || 0);
            if (f.month && f.month !== 'N/A') {
                grouped[f.feeHead].months.push(f.month.split('-')[0]);
                grouped[f.feeHead].unitAmt = amt;
                grouped[f.feeHead].count++;
            }
            grouped[f.feeHead].totalAmt += amt;
        });

        const rowsHtml = Object.values(grouped).map(item => {
            let periodDisplay = '';
            const headLower = item.head.toLowerCase();
            
            if (headLower.includes('registration') || headLower.includes('admission')) {
                periodDisplay = 'Onetime';
            } else if (item.months.length > 0) {
                const monthText = item.months.length > 3 
                    ? `${item.months[0]} to ${item.months[item.months.length - 1]}` 
                    : item.months.join(', ');
                periodDisplay = `<b>${monthText}</b><br><small style="color:#555;">(${item.count} Months x ₹${item.unitAmt})</small>`;
            } else {
                periodDisplay = '<span style="color:#666;">Annual</span>';
            }

            return `
                <tr style="page-break-inside: avoid;">
                    <td style="padding: 8px 5px; border-bottom: 1px solid #eee; line-height:1.2;">
                        <span style="font-size: 1.05em; color: #1e293b;">${item.head}</span>
                    </td>
                    <td style="padding: 8px 5px; border-bottom: 1px solid #eee; vertical-align: middle;">
                        ${periodDisplay}
                    </td>
                    <td style="padding: 8px 5px; border-bottom: 1px solid #eee; text-align: right; font-weight: 700; font-size: 1.1em;">
                        ₹ ${item.totalAmt.toLocaleString('en-IN')}
                    </td>
                </tr>`;
        }).join('');

        ['receipt-left', 'receipt-right'].forEach(sideId => {
            const box = this.el(sideId);
            if (!box) return;

            box.innerHTML = template.innerHTML;
            const setInBox = (sel, val) => { 
                const el = box.querySelector(sel); 
                if (el) el.innerText = (val !== undefined && val !== null) ? val : 'N/A'; 
            };

            setInBox('.r-session', r.session);
            setInBox('.r-date', r.date ? new Date(r.date).toLocaleDateString('en-GB') : '');
            setInBox('.r-folio', r.studentFolio);
            setInBox('.r-id', r.receiptNo);
            setInBox('.r-name', r.studentName);
            setInBox('.r-class', `${r.studentClass || ''} - ${r.studentSection || ''}`);
            setInBox('.r-father', r.fatherName);
            setInBox('.r-type', this.student?.admission?.type || 'N/A');
            setInBox('.r-mode', r.mode);
            setInBox('.r-txn', r.transactionId || 'N/A');
            setInBox('.r-remark-val', r.remark || 'N/A');
            setInBox('.r-user-name', r.collectedBy || 'System Admin');

            const rowsEl = box.querySelector('.r-rows');
            if (rowsEl) rowsEl.innerHTML = rowsHtml;

            const pOld = Number(r.prevOldDue || 0);
            const pAdv = Number(r.prevAdvance || 0);
            const pDisc = Number(r.discount || 0);
            const pPaid = Number(r.totalCollected || 0);
            const pDue = Number(r.remainingDueInLedger || 0);
            const netPayable = (currentSelTotal + pOld) - pAdv - pDisc;

            setInBox('.r-sel-total', `₹ ${currentSelTotal.toLocaleString('en-IN')}`);
            setInBox('.r-old-due', `₹ ${pOld.toLocaleString('en-IN')}`);
            setInBox('.r-adv-adj', `- ₹ ${pAdv.toLocaleString('en-IN')}`);
            setInBox('.r-discount', `- ₹ ${pDisc.toLocaleString('en-IN')}`);
            setInBox('.r-net-payable', `₹ ${netPayable.toLocaleString('en-IN')}`);
            setInBox('.r-paid', `₹ ${pPaid.toLocaleString('en-IN')}`);

            const toggleRow = (sel, condition) => { 
                const el = box.querySelector(sel); 
                if (el) el.style.display = condition ? 'table-row' : 'none'; 
            };
            toggleRow('.r-old-row', pOld > 0);
            toggleRow('.r-adv-row', pAdv > 0);
            toggleRow('.r-disc-row', pDisc > 0);

            const balLabel = box.querySelector('.r-bal-label');
            const balValue = box.querySelector('.r-bal');
            if (balLabel && balValue) {
                const isAdv = pDue < 0;
                balLabel.innerText = isAdv ? "Current Advance:" : "Remaining Due:";
                balValue.innerText = `₹ ${Math.abs(pDue).toLocaleString('en-IN')}`;
                balLabel.style.color = balValue.style.color = isAdv ? "#059669" : "#dc2626";
            }
        });

        setTimeout(() => { window.print(); }, 800);
    }
};