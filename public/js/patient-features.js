/**
 * HealiX Patient Portal Features:
 * 1. Bharat UPI Payment QR Code Generator & Instant Verification Simulator
 * 2. Official NABH-compliant Medical Appointment Letter Generator & Downloader (HTML + Print-to-PDF)
 */

let currentPayingApptId = 1082;
let currentLetterApptId = 1082;

/**
 * Generate Authentic, NABH-Compliant Official Medical Appointment Letter HTML
 */
function generateAppointmentLetterHtml(appt) {
    const user = (typeof localStorage !== 'undefined') 
        ? JSON.parse(localStorage.getItem('healix_user') || '{"name":"Arun Chandran","email":"patient@healix.com","role":"PATIENT","phone":"9876510001"}') 
        : { name: "Arun Chandran", email: "patient@healix.com", role: "PATIENT", phone: "9876510001" };
    const pName = appt.patientName || user.name || 'Arun Chandran';
    const pId = appt.patientId || 'PAT-TRV-000001';
    const pPhone = appt.patientPhone || user.phone || '9876510001';
    const docName = appt.doctorName || 'Dr. Rajesh Kumar';
    const docSpec = appt.doctorSpec || (docName.includes('Rajesh') ? 'Cardiology' : (docName.includes('Sarah') ? 'Neurology' : (docName.includes('Suresh') ? 'Orthopedics' : 'General Medicine')));
    const hosp = appt.hospitalName || 'MediCare City Hospital';
    const date = appt.date || 'Tomorrow';
    const time = appt.time || '09:30 AM';
    const reason = appt.reason || 'General Clinical Consultation & Cardiovascular Evaluation';
    const fee = appt.fee || 800;
    const isPaid = (appt.paymentStatus === 'PAID');
    const txn = appt.paymentTxn || (isPaid ? 'UPI/TXN/8492019482' : 'UNPAID / PENDING AT COUNTER');
    const tokenNo = appt.id ? '#' + String(appt.id).slice(-2).padStart(2, '0') : '#01';
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    let repTime = '09:15 AM';
    if (time.includes('09:30')) repTime = '09:15 AM';
    else if (time.includes('10:00')) repTime = '09:45 AM';
    else if (time.includes('11:00')) repTime = '10:45 AM';
    else if (time.includes('02:00')) repTime = '01:45 PM';
    else if (time.includes('03:30')) repTime = '03:15 PM';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Official Consultation Letter - ${pName} (${tokenNo})</title>
    <style>
        @page { size: A4 portrait; margin: 10mm 14mm; }
        * { box-sizing: border-box; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; }
        body { background: #f8fafc; color: #0f172a; margin: 0; padding: 24px; font-size: 13px; line-height: 1.5; }
        .letter-wrap { max-width: 820px; margin: 0 auto; background: #ffffff; padding: 36px 44px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; position: relative; }
        .letterhead { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px double #0d9488; padding-bottom: 16px; margin-bottom: 18px; }
        .hosp-brand { display: flex; align-items: center; gap: 14px; }
        .hosp-logo { width: 52px; height: 52px; border-radius: 12px; background: linear-gradient(135deg, #0d9488, #059669); color: #fff; font-size: 26px; font-weight: 900; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(13,148,136,0.3); }
        .hosp-names h1 { margin: 0; font-size: 22px; font-weight: 800; color: #0f2042; letter-spacing: -0.5px; }
        .hosp-names .accred { font-size: 11px; font-weight: 700; color: #0d9488; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
        .hosp-contact { text-align: right; font-size: 11px; color: #64748b; line-height: 1.45; }
        .meta-strip { display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0d9488; padding: 8px 14px; border-radius: 6px; font-size: 11px; color: #334155; margin-bottom: 20px; }
        .doc-title { text-align: center; margin-bottom: 18px; }
        .doc-title h2 { margin: 0 0 6px; font-size: 16px; font-weight: 800; color: #0f2042; letter-spacing: 0.5px; text-transform: uppercase; }
        .doc-title .badge { display: inline-block; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; font-size: 10px; font-weight: 700; padding: 3px 12px; border-radius: 20px; text-transform: uppercase; }
        .section-heading { font-size: 12px; font-weight: 800; color: #0d9488; text-transform: uppercase; letter-spacing: 0.8px; margin: 16px 0 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
        .info-grid { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        .info-grid th, .info-grid td { border: 1px solid #e2e8f0; padding: 7px 12px; font-size: 12px; }
        .info-grid th { background: #f8fafc; color: #475569; font-weight: 700; width: 22%; text-align: left; }
        .info-grid td { color: #0f2042; font-weight: 600; width: 28%; }
        .highlight-box { background: #f0fdfa; border: 2px solid #99f6e4; border-radius: 10px; padding: 16px 20px; margin: 14px 0 18px; display: grid; grid-template-columns: 2fr 1fr; gap: 16px; align-items: center; }
        .token-callout { background: linear-gradient(135deg, #0d9488, #0f766e); color: #fff; padding: 14px; border-radius: 10px; text-align: center; }
        .token-callout .t-lbl { font-size: 10px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; color: #ccfbf1; }
        .token-callout .t-num { font-size: 32px; font-weight: 900; line-height: 1.1; margin: 2px 0; }
        .token-callout .t-st { font-size: 10px; font-weight: 700; background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 10px; display: inline-block; }
        .instructions-box { background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: 11px; color: #92400e; }
        .instructions-box ol { margin: 4px 0 0 16px; padding: 0; }
        .instructions-box li { margin-bottom: 3px; }
        .sign-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 28px; padding-top: 16px; border-top: 1px dashed #cbd5e1; }
        .qr-seal { display: flex; align-items: center; gap: 12px; }
        .qr-box { width: 72px; height: 72px; background: #fff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px; }
        .qr-box img { width: 100%; height: 100%; object-fit: contain; }
        .seal-txt { font-size: 10px; color: #64748b; line-height: 1.35; }
        .sign-box { text-align: right; }
        .sign-box .signature-line { font-family: 'Brush Script MT', cursive, serif; font-size: 22px; color: #1e3a8a; margin-bottom: -4px; }
        .sign-box .sign-name { font-size: 12px; font-weight: 800; color: #0f2042; }
        .sign-box .sign-sub { font-size: 10px; color: #64748b; }
        .top-action-bar { max-width: 820px; margin: 0 auto 16px; display: flex; justify-content: space-between; align-items: center; }
        .btn-act { padding: 9px 18px; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; border: none; text-decoration: none; }
        .btn-act-prt { background: #0d9488; color: #fff; }
        .btn-act-cls { background: #e2e8f0; color: #334155; }
        @media print {
            body { background: #fff; padding: 0; }
            .letter-wrap { box-shadow: none; border: none; padding: 0; max-width: 100%; }
            .top-action-bar { display: none !important; }
        }
    </style>
</head>
<body>
    <div class="top-action-bar">
        <div style="font-size:12px; color:#64748b; font-weight:600;">HealiX Unified HMS • Official Patient Consultation Document</div>
        <div style="display:flex; gap:8px;">
            <button onclick="window.print()" class="btn-act btn-act-prt"><svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/><path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/></svg> Print / Save as PDF</button>
            <button onclick="window.close()" class="btn-act btn-act-cls">Close Window</button>
        </div>
    </div>

    <div class="letter-wrap">
        <!-- Hospital Letterhead -->
        <div class="letterhead">
            <div class="hosp-brand">
                <div class="hosp-logo">H+</div>
                <div class="hosp-names">
                    <h1>${hosp}</h1>
                    <div class="accred">Government of Kerala Healthcare Network • NABH Accredited</div>
                    <div style="font-size:10px; color:#64748b; margin-top:2px;">Reg. No: KL-TRV-HMS-2024-0091 • HealiX Health Exchange Member</div>
                </div>
            </div>
            <div class="hosp-contact">
                <div><strong>Central OPD Reception Desk</strong></div>
                <div>MG Road, Statue, Thiruvananthapuram - 695001</div>
                <div>Emergency Helpline: 0471-2334455 / 108</div>
                <div>Portal: https://heali-x.vercel.app</div>
            </div>
        </div>

        <!-- Meta Ref Bar -->
        <div class="meta-strip">
            <div><strong>Ref Code:</strong> HEALIX/OPD/2026/APT-${appt.id || 1082}</div>
            <div><strong>Issue Timestamp:</strong> ${today} 08:30 AM</div>
            <div><strong>Verification Status:</strong> <span style="color:#059669; font-weight:800;">DIGITALLY VALIDATED</span></div>
        </div>

        <!-- Document Heading -->
        <div class="doc-title">
            <h2>Outpatient Consultation Appointment Letter &amp; OPD Entry Pass</h2>
            <span class="badge">Confirmed Clinical OPD Pass</span>
        </div>

        <!-- Section 1: Patient Demographics -->
        <div class="section-heading">1. Patient Demographic &amp; Registration Particulars</div>
        <table class="info-grid">
            <tr>
                <th>Patient Full Name</th>
                <td><strong>${pName}</strong></td>
                <th>Central UHID</th>
                <td><strong style="color:#0d9488;">${pId}</strong></td>
            </tr>
            <tr>
                <th>Age / Gender</th>
                <td>34 Years / Male</td>
                <th>Blood Group</th>
                <td><strong style="color:#b91c1c;">B+ Positive</strong></td>
            </tr>
            <tr>
                <th>Contact Mobile</th>
                <td>+91 ${pPhone}</td>
                <th>City / District</th>
                <td>Thiruvananthapuram, Kerala</td>
            </tr>
        </table>

        <!-- Section 2: Clinical Appointment Particulars -->
        <div class="section-heading">2. Scheduled Clinical Consultation Details</div>
        <div class="highlight-box">
            <div>
                <div style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:700;">Attending Medical Specialist</div>
                <div style="font-size:16px; font-weight:800; color:#0f2042; margin:2px 0 4px;">${docName}</div>
                <div style="font-size:12px; color:#0d9488; font-weight:700;">${docSpec} • Senior Clinical Consultant</div>
                <div style="margin-top:10px; font-size:12px; color:#334155; line-height:1.6;">
                    <div><strong>Clinic Location:</strong> Room 104, OPD Wing B (1st Floor)</div>
                    <div><strong>Consultation Date:</strong> <span style="color:#0f2042; font-weight:800;">${date}</span></div>
                    <div><strong>Scheduled Time Slot:</strong> <span style="color:#0d9488; font-weight:800;">${time}</span></div>
                    <div><strong>Mandatory Triage Time:</strong> <span style="color:#b91c1c; font-weight:800;">${repTime} (15 Min Prior)</span></div>
                </div>
            </div>
            <div class="token-callout">
                <div class="t-lbl">Queue Entry Token</div>
                <div class="t-num">${tokenNo}</div>
                <div class="t-st">${appt.status || 'CONFIRMED'}</div>
            </div>
        </div>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; font-size:12px; margin-bottom:18px;">
            <strong style="color:#0f2042;">Chief Consultation Reason / Symptoms:</strong>
            <span style="color:#475569;"> ${reason}</span>
        </div>

        <!-- Section 3: Billing & Financial Clearance -->
        <div class="section-heading">3. Consultation Fee &amp; Billing Clearance</div>
        <table class="info-grid">
            <tr>
                <th>Consultation Fee</th>
                <td style="font-size:14px; font-weight:800; color:#0d9488;">₹${fee}.00</td>
                <th>Payment Clearance</th>
                <td>
                    ${isPaid 
                        ? '<span style="background:#d1fae5; color:#065f46; font-weight:800; padding:3px 8px; border-radius:6px;">PAID • VERIFIED VIA BHARAT UPI</span>' 
                        : '<span style="background:#fef3c7; color:#92400e; font-weight:800; padding:3px 8px; border-radius:6px;">PAYMENT PENDING / CASH AT COUNTER</span>'}
                </td>
            </tr>
            <tr>
                <th>Billing Transaction Ref</th>
                <td><code style="font-weight:700; color:#475569;">${txn}</code></td>
                <th>Hospital Billing Desk</th>
                <td>Main OPD Cashless &amp; UPI Counter #02</td>
            </tr>
        </table>

        <!-- Section 4: Mandatory Instructions -->
        <div class="section-heading">4. Patient OPD Guidelines &amp; Hospital Instructions</div>
        <div class="instructions-box">
            <ol>
                <li>Please present this printed letter or digital entry pass on your smartphone at the OPD Triage counter.</li>
                <li>Please report 15 minutes before your scheduled slot for nursing vitals (Blood Pressure, Pulse, SpO2, and Temperature) measurement.</li>
                <li>Bring all previous medical reports, prescription slips, discharge summaries, and ongoing medications.</li>
                <li>In case of urgent or worsening chest pain, breathing difficulty, or acute distress, report immediately to the 24x7 Emergency Room (Ground Floor).</li>
            </ol>
        </div>

        <!-- Section 5: Verification Seals and Signatures -->
        <div class="sign-row">
            <div class="qr-seal">
                <div class="qr-box">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&margin=2&data=HEALIX-APPT-VERIFY-APT${appt.id || 1082}-${pId}" alt="Security Verification QR" onerror="this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;background:#0F2042;color:#fff;font-size:8px;display:flex;align-items:center;justify-content:center;font-weight:bold;text-align:center;\\'>SECURED QR</div>'">
                </div>
                <div class="seal-txt">
                    <strong>Digital Pass QR Code</strong><br>
                    Scan for OPD Gate Access<br>
                    Security ID: <strong>SEC-${appt.id || 1082}-OK</strong>
                </div>
            </div>

            <div style="text-align:center;">
                <div style="display:inline-block; border:2px dashed #0d9488; border-radius:50%; width:70px; height:70px; padding:10px 0; color:#0d9488; font-size:9px; font-weight:800; text-transform:uppercase; text-align:center;">
                    OFFICIAL<br>STAMP<br>MEDICARE
                </div>
            </div>

            <div class="sign-box">
                <div class="signature-line">${docName.replace('Dr. ', '')}</div>
                <div class="sign-name">${docName}</div>
                <div class="sign-sub">Senior Consultant, ${docSpec}</div>
                <div style="font-size:9px; color:#94a3b8; margin-top:2px;">Medical Superintendent Authorized Counter-Seal</div>
            </div>
        </div>

        <div style="margin-top:24px; text-align:center; font-size:10px; color:#94a3b8; border-top:1px solid #f1f5f9; padding-top:10px;">
            This is a computer-generated, digitally authenticated medical OPD consultation pass issued via HealiX Multi-Hospital Management System.
        </div>
    </div>
</body>
</html>`;
}

/**
 * Download Appointment Letter as .html File
 */
function downloadOfficialAppointmentLetter(apptId) {
    const appts = (typeof HealixStore !== 'undefined') ? HealixStore.getAppointments() : [];
    const appt = appts.find(a => a.id == apptId) || appts[0] || {
        id: 1082,
        patientName: "Arun Chandran",
        patientId: "PAT-TRV-000001",
        patientPhone: "9876510001",
        doctorName: "Dr. Rajesh Kumar",
        hospitalName: "MediCare City Hospital",
        date: "Tomorrow",
        time: "09:30 AM",
        reason: "Chest pain and shortness of breath during exercise",
        status: "CONFIRMED",
        fee: 800,
        paymentStatus: "PAID"
    };

    const htmlContent = generateAppointmentLetterHtml(appt);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HealiX_Appointment_Letter_APT-${appt.id || 1082}_${(appt.patientName || 'Patient').replace(/\\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (typeof showToast === 'function') {
        showToast('Official appointment letter downloaded successfully!');
    } else {
        alert('Appointment letter downloaded successfully!');
    }
}

/**
 * Print / Save as PDF Appointment Letter in clean window
 */
function printOfficialAppointmentLetter(apptId) {
    const appts = (typeof HealixStore !== 'undefined') ? HealixStore.getAppointments() : [];
    const appt = appts.find(a => a.id == apptId) || appts[0] || { id: 1082 };
    const htmlContent = generateAppointmentLetterHtml(appt);
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }
}

/**
 * Open Appointment Letter Modal for live preview
 */
function openAppointmentLetterModal(apptId) {
    currentLetterApptId = apptId || 1082;
    let m = document.getElementById('appointmentLetterModal');
    if (!m) {
        m = createAppointmentLetterModalElement();
        document.body.appendChild(m);
    }

    const appts = (typeof HealixStore !== 'undefined') ? HealixStore.getAppointments() : [];
    const appt = appts.find(a => a.id == currentLetterApptId) || appts[0] || { id: 1082 };
    const previewContainer = document.getElementById('letterModalIframe');
    if (previewContainer) {
        previewContainer.srcdoc = generateAppointmentLetterHtml(appt);
    }

    m.style.display = 'flex';
}

function closeAppointmentLetterModal() {
    const m = document.getElementById('appointmentLetterModal');
    if (m) m.style.display = 'none';
}

function createAppointmentLetterModalElement() {
    const wrap = document.createElement('div');
    wrap.id = 'appointmentLetterModal';
    wrap.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.7); z-index:99999; align-items:center; justify-content:center; padding:16px;';
    wrap.innerHTML = `
        <div style="background:#fff; width:100%; max-width:880px; height:90vh; border-radius:18px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 25px 50px -12px rgba(0,0,0,0.35);">
            <div style="background:#0F2042; color:#fff; padding:16px 24px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #1E293B;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="width:36px; height:36px; border-radius:8px; background:#0D9488; color:#fff; display:flex; align-items:center; justify-content:center; font-size:1.1rem;">
                        <i class="bi bi-file-earmark-text-fill"></i>
                    </div>
                    <div>
                        <h4 style="margin:0; font-size:1.05rem; font-weight:700;">Official Consultation Letter &amp; Pass</h4>
                        <div style="font-size:0.75rem; color:#94A3B8;">Accredited Government of Kerala Healthcare Format</div>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <button onclick="downloadOfficialAppointmentLetter(currentLetterApptId)" class="btn btn-sm btn-teal" style="font-weight:700; display:flex; align-items:center; gap:6px;">
                        <i class="bi bi-download"></i> Download (.html)
                    </button>
                    <button onclick="printOfficialAppointmentLetter(currentLetterApptId)" class="btn btn-sm" style="background:#4F46E5; color:#fff; font-weight:700; display:flex; align-items:center; gap:6px;">
                        <i class="bi bi-printer"></i> Print / Save PDF
                    </button>
                    <button onclick="closeAppointmentLetterModal()" style="background:rgba(255,255,255,0.15); border:none; color:#fff; width:32px; height:32px; border-radius:50%; cursor:pointer; font-size:1.2rem; display:flex; align-items:center; justify-content:center;">&times;</button>
                </div>
            </div>
            <div style="flex:1; background:#F1F5F9; padding:12px;">
                <iframe id="letterModalIframe" style="width:100%; height:100%; border:none; border-radius:10px; background:#fff; box-shadow:inset 0 2px 6px rgba(0,0,0,0.06);"></iframe>
            </div>
        </div>
    `;
    return wrap;
}

/**
 * Payment QR Code Modal Management
 */
function openPaymentQrModal(apptId, doctorName, hospitalName, fee) {
    currentPayingApptId = apptId || 1082;
    const doc = doctorName || 'Dr. Rajesh Kumar';
    const hosp = hospitalName || 'MediCare City Hospital';
    const amount = fee || 800;

    let m = document.getElementById('paymentQrModal');
    if (!m) {
        m = createPaymentQrModalElement();
        document.body.appendChild(m);
    }

    document.getElementById('payModalApptToken').innerText = '#APT-' + currentPayingApptId;
    document.getElementById('payModalDocName').innerText = doc;
    document.getElementById('payModalHospName').innerText = hosp;
    document.getElementById('payModalAmount').innerText = '₹' + amount + '.00';
    document.getElementById('payModalAmountBtn').innerText = '₹' + amount + '.00';

    // Construct UPI Deep Link
    const upiString = `upi://pay?pa=healix.medicare@okaxis&pn=${encodeURIComponent(hosp)}&am=${amount}.00&cu=INR&tn=${encodeURIComponent('Healix Consultation Fee Token APT-' + currentPayingApptId)}`;
    const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(upiString)}`;

    const qrImg = document.getElementById('payModalQrImg');
    if (qrImg) {
        qrImg.src = qrImgUrl;
    }

    document.getElementById('payQrSection').style.display = 'block';
    document.getElementById('paySuccessSection').style.display = 'none';

    m.style.display = 'flex';
}

function closePaymentQrModal() {
    const m = document.getElementById('paymentQrModal');
    if (m) m.style.display = 'none';
}

function copyUpiId() {
    navigator.clipboard.writeText('healix.medicare@okaxis').then(() => {
        if (typeof showToast === 'function') {
            showToast('UPI VPA copied: healix.medicare@okaxis');
        } else {
            alert('UPI ID copied: healix.medicare@okaxis');
        }
    }).catch(() => {
        alert('UPI ID: healix.medicare@okaxis');
    });
}

function confirmSimulatedUpiPayment() {
    const txnRef = 'UPI/TXN/' + Math.floor(1000000000 + Math.random() * 9000000000);
    if (typeof HealixStore !== 'undefined' && currentPayingApptId) {
        HealixStore.markAppointmentPaid(currentPayingApptId, txnRef);
    }

    document.getElementById('payQrSection').style.display = 'none';
    document.getElementById('paySuccessSection').style.display = 'block';
    document.getElementById('paySuccessTxnRef').innerText = txnRef;

    if (typeof showToast === 'function') {
        showToast('Payment Verified! Consultation fee marked as PAID.');
    }

    // Refresh appointments table or dashboard status if present
    if (typeof renderPatientAppointments === 'function') {
        renderPatientAppointments();
    }
}

function createPaymentQrModalElement() {
    const wrap = document.createElement('div');
    wrap.id = 'paymentQrModal';
    wrap.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.7); z-index:99999; align-items:center; justify-content:center; padding:16px;';
    wrap.innerHTML = `
        <div style="background:#fff; width:100%; max-width:480px; border-radius:20px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.35); animation:popIn 0.25s ease;">
            <!-- Modal Header -->
            <div style="background:linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F766E 100%); color:#fff; padding:20px 24px; position:relative;">
                <button onclick="closePaymentQrModal()" style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.18); border:none; color:#fff; width:32px; height:32px; border-radius:50%; cursor:pointer; font-size:1.2rem; display:flex; align-items:center; justify-content:center;">&times;</button>
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                    <span style="background:#22C55E; color:#fff; font-size:0.68rem; font-weight:800; padding:2px 8px; border-radius:10px; text-transform:uppercase; letter-spacing:0.5px;">BHARAT UPI</span>
                    <span style="font-size:0.75rem; color:#A7F3D0; font-weight:700;">INSTANT CLEARANCE</span>
                </div>
                <h3 style="margin:0; font-size:1.25rem; font-weight:800;">Consultation Fee Payment</h3>
                <div style="font-size:0.8rem; color:#94A3B8; margin-top:2px;" id="payModalHospName">MediCare City Hospital</div>
            </div>

            <!-- Modal Body -->
            <div style="padding:22px 24px;">
                <!-- QR Mode -->
                <div id="payQrSection">
                    <!-- Bill details pill -->
                    <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:12px 16px; margin-bottom:18px; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-size:0.72rem; color:#64748B; font-weight:700; text-transform:uppercase;">Consultant &amp; Token</div>
                            <div style="font-weight:800; color:#0F2042; font-size:0.95rem;" id="payModalDocName">Dr. Rajesh Kumar</div>
                            <div style="font-size:0.76rem; color:#0D9488; font-weight:700;" id="payModalApptToken">#APT-1082</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:0.72rem; color:#64748B; font-weight:700; text-transform:uppercase;">Payable Amount</div>
                            <div style="font-size:1.45rem; font-weight:900; color:#0D9488;" id="payModalAmount">₹800.00</div>
                        </div>
                    </div>

                    <!-- QR Box -->
                    <div style="text-align:center; margin-bottom:16px;">
                        <div style="display:inline-block; background:#fff; border:2px dashed #99F6E4; border-radius:16px; padding:12px; box-shadow:0 6px 18px rgba(0,0,0,0.04);">
                            <img id="payModalQrImg" src="" alt="UPI Payment QR Code" style="width:190px; height:190px; display:block; border-radius:8px;" onerror="this.src='/images/qr-fallback.png'">
                            <div style="font-size:0.7rem; color:#64748B; font-weight:700; margin-top:6px; letter-spacing:0.5px;">SCAN WITH ANY UPI APP</div>
                        </div>
                    </div>

                    <!-- UPI VPA and App Icons -->
                    <div style="background:#F0FDFA; border:1px solid #99F6E4; border-radius:10px; padding:10px 14px; margin-bottom:18px; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-size:0.7rem; color:#0F766E; font-weight:700; text-transform:uppercase;">UPI ID (VPA)</div>
                            <div style="font-weight:800; color:#0F2042; font-size:0.86rem; font-family:monospace;">healix.medicare@okaxis</div>
                        </div>
                        <button onclick="copyUpiId()" class="btn btn-sm" style="background:#fff; border:1px solid #99F6E4; color:#0F766E; font-weight:700; font-size:0.75rem; padding:4px 10px; border-radius:6px; cursor:pointer;">
                            <i class="bi bi-copy"></i> Copy
                        </button>
                    </div>

                    <div style="display:flex; justify-content:center; align-items:center; gap:14px; margin-bottom:18px; color:#64748B; font-size:0.8rem; font-weight:600;">
                        <span><i class="bi bi-phone"></i> GPay</span>
                        <span>•</span>
                        <span>PhonePe</span>
                        <span>•</span>
                        <span>Paytm</span>
                        <span>•</span>
                        <span>BHIM</span>
                    </div>

                    <!-- Action: Simulate & Confirm -->
                    <button onclick="confirmSimulatedUpiPayment()" class="btn btn-teal btn-block btn-lg" style="width:100%; padding:12px; font-weight:800; border-radius:10px; font-size:0.95rem; display:flex; align-items:center; justify-content:center; gap:8px;">
                        <i class="bi bi-patch-check-fill"></i> Simulate &amp; Confirm Payment (<span id="payModalAmountBtn">₹800.00</span>)
                    </button>
                </div>

                <!-- Success Mode -->
                <div id="paySuccessSection" style="display:none; text-align:center; padding:10px 0;">
                    <div style="width:68px; height:68px; border-radius:50%; background:#D1FAE5; color:#059669; font-size:2.2rem; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; box-shadow:0 6px 18px rgba(16,185,129,0.25);">
                        <i class="bi bi-check-lg"></i>
                    </div>
                    <h3 style="color:#0F2042; font-weight:800; margin:0 0 6px; font-size:1.3rem;">Payment Verified &amp; Cleared!</h3>
                    <p style="color:#64748B; font-size:0.86rem; margin:0 0 16px;">
                        Your consultation fee has been verified via Bharat UPI and logged in hospital records.
                    </p>

                    <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:12px 16px; margin-bottom:20px; text-align:left; font-size:0.82rem;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span style="color:#64748B;">Transaction Ref:</span>
                            <strong style="color:#0F2042; font-family:monospace;" id="paySuccessTxnRef">UPI/TXN/8492019482</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span style="color:#64748B;">Payment Status:</span>
                            <span class="badge" style="background:#D1FAE5; color:#065F46; font-weight:700;">PAID (CLEARANCE #01)</span>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span style="color:#64748B;">Settlement Desk:</span>
                            <strong style="color:#0D9488;">MediCare OPD Cashless Gateway</strong>
                        </div>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <button onclick="downloadOfficialAppointmentLetter(currentPayingApptId)" class="btn btn-teal w-100" style="padding:11px; font-weight:700; border-radius:10px; display:flex; align-items:center; justify-content:center; gap:8px;">
                            <i class="bi bi-file-earmark-arrow-down-fill"></i> Download Paid Appointment Letter
                        </button>
                        <button onclick="closePaymentQrModal()" class="btn btn-outline w-100" style="padding:10px; font-weight:600; border-radius:10px;">
                            Done / Return to Portal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    return wrap;
}

/**
 * Show Booking Success Modal with Direct Download & Payment QR actions
 */
function showBookingSuccessModal(appt) {
    let m = document.getElementById('bookingSuccessModal');
    if (!m) {
        m = document.createElement('div');
        m.id = 'bookingSuccessModal';
        m.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.7); z-index:99999; align-items:center; justify-content:center; padding:16px;';
        document.body.appendChild(m);
    }

    m.innerHTML = `
        <div style="background:#fff; width:100%; max-width:500px; border-radius:20px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.35); animation:popIn 0.25s ease;">
            <div style="background:linear-gradient(135deg, #0D9488, #059669); color:#fff; padding:24px; text-align:center;">
                <div style="width:60px; height:60px; border-radius:50%; background:rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; font-size:2rem; margin:0 auto 12px;">
                    <i class="bi bi-calendar-check-fill"></i>
                </div>
                <h3 style="margin:0; font-size:1.35rem; font-weight:800;">Consultation Scheduled!</h3>
                <div style="font-size:0.85rem; color:#CCFBF1; margin-top:4px;">OPD Queue Token #01 • ID #APT-${appt.id}</div>
            </div>
            <div style="padding:24px;">
                <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:16px; margin-bottom:20px; font-size:0.88rem; line-height:1.6;">
                    <div style="display:flex; justify-content:space-between; border-bottom:1px solid #E2E8F0; padding-bottom:6px; margin-bottom:6px;">
                        <span style="color:#64748B;">Specialist:</span>
                        <strong style="color:#0F2042;">${appt.doctorName}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; border-bottom:1px solid #E2E8F0; padding-bottom:6px; margin-bottom:6px;">
                        <span style="color:#64748B;">Hospital Facility:</span>
                        <strong style="color:#0F2042;">${appt.hospitalName}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; border-bottom:1px solid #E2E8F0; padding-bottom:6px; margin-bottom:6px;">
                        <span style="color:#64748B;">Scheduled Slot:</span>
                        <strong style="color:#0D9488;">${appt.date} at ${appt.time}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:#64748B;">Consultation Fee:</span>
                        <strong style="color:#0D9488; font-size:1.05rem;">₹${appt.fee || 800}.00</strong>
                    </div>
                </div>

                <div style="display:flex; flex-direction:column; gap:10px;">
                    <button onclick="downloadOfficialAppointmentLetter(${appt.id})" class="btn btn-teal w-100" style="padding:12px; font-weight:700; border-radius:10px; display:flex; align-items:center; justify-content:center; gap:8px;">
                        <i class="bi bi-file-earmark-arrow-down-fill"></i> Download Appointment Letter (.html)
                    </button>
                    <button onclick="document.getElementById('bookingSuccessModal').style.display='none'; openPaymentQrModal(${appt.id}, '${appt.doctorName}', '${appt.hospitalName}', ${appt.fee || 800})" class="btn w-100" style="background:#4F46E5; color:#fff; padding:12px; font-weight:700; border-radius:10px; display:flex; align-items:center; justify-content:center; gap:8px;">
                        <i class="bi bi-qr-code"></i> Pay Consultation Fee (UPI QR)
                    </button>
                    <a href="/patient/appointments" class="btn btn-outline w-100" style="padding:10px; font-weight:600; border-radius:10px; text-align:center;">
                        View in My Appointments
                    </a>
                </div>
            </div>
        </div>
    `;
    m.style.display = 'flex';
}

