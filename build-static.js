const fs = require('fs');
const path = require('path');

console.log('Generating HealiX production static site for Vercel...');

const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

// Helper to ensure directories exist
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Helper to copy directory recursively
function copyDir(src, dest) {
    ensureDir(dest);
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// 1. Copy static assets to both public/ and root
ensureDir(PUBLIC_DIR);

const frontendStatic = path.join(ROOT_DIR, 'Frontend', 'static');
if (fs.existsSync(frontendStatic)) {
    copyDir(path.join(frontendStatic, 'css'), path.join(PUBLIC_DIR, 'css'));
    copyDir(path.join(frontendStatic, 'images'), path.join(PUBLIC_DIR, 'images'));
    copyDir(path.join(frontendStatic, 'js'), path.join(PUBLIC_DIR, 'js'));

    // Also copy to root for relative fallback
    copyDir(path.join(frontendStatic, 'css'), path.join(ROOT_DIR, 'css'));
    copyDir(path.join(frontendStatic, 'images'), path.join(ROOT_DIR, 'images'));
    copyDir(path.join(frontendStatic, 'js'), path.join(ROOT_DIR, 'js'));
}

// 2. Clean Thymeleaf attributes helper
function cleanThymeleaf(html) {
    return html
        .replace(/th:href="@\{([^}]+)\}"/g, 'href="$1"')
        .replace(/th:src="@\{([^}]+)\}"/g, 'src="$1"')
        .replace(/th:action="@\{([^}]+)\}"/g, 'action="$1"')
        .replace(/xmlns:th="[^"]+"/g, '')
        .replace(/xmlns:sec="[^"]+"/g, '')
        .replace(/<input type="hidden" th:name="[^"]*" th:value="[^"]*"\/>/g, '')
        .replace(/<input type="hidden" name="_csrf"[^>]*>/g, '')
        .replace(/th:field="[^"]*"/g, '')
        .replace(/th:object="[^"]*"/g, '')
        .replace(/th:classappend="[^"]*"/g, '')
        .replace(/th:styleappend="[^"]*"/g, '');
}

// 3. Write page to both public/<path>/index.html and <path>/index.html
function writePage(relPath, content) {
    const pubFile = path.join(PUBLIC_DIR, relPath);
    ensureDir(path.dirname(pubFile));
    fs.writeFileSync(pubFile, content, 'utf8');

    const rootFile = path.join(ROOT_DIR, relPath);
    ensureDir(path.dirname(rootFile));
    fs.writeFileSync(rootFile, content, 'utf8');

    console.log(`Generated: ${relPath}`);
}

// Global script to handle session display & logout in dashboards
const commonAuthScript = `
<script>
    (function() {
        const raw = localStorage.getItem('healix_user');
        if (raw) {
            try {
                const user = JSON.parse(raw);
                document.querySelectorAll('.js-user-name').forEach(el => el.textContent = user.name || 'User');
                document.querySelectorAll('.js-user-email').forEach(el => el.textContent = user.email || '');
                document.querySelectorAll('.js-user-role').forEach(el => el.textContent = user.role || '');
                document.querySelectorAll('.js-user-avatar').forEach(el => {
                    el.textContent = (user.name || 'U').charAt(0).toUpperCase();
                });
            } catch(e) {}
        }
    })();
</script>
`;

// ----------------------------------------------------
// 4. Generate Landing Page (index.html)
// ----------------------------------------------------
const rawIndex = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'index.html'), 'utf8');
let indexHtml = cleanThymeleaf(rawIndex);

const departmentsHtml = `
    <div class="dept-card">
        <div class="dept-card-icon"><i class="bi bi-heart-pulse"></i></div>
        <h4>Cardiology</h4>
        <p>Expert care for heart, rhythm disorders, and cardiovascular wellness.</p>
    </div>
    <div class="dept-card">
        <div class="dept-card-icon"><i class="bi bi-activity"></i></div>
        <h4>Neurology</h4>
        <p>Diagnosis and treatment of nervous system and stroke conditions.</p>
    </div>
    <div class="dept-card">
        <div class="dept-card-icon"><i class="bi bi-bandaid"></i></div>
        <h4>Orthopedics</h4>
        <p>Bone, joint replacement, spine health, and musculoskeletal therapy.</p>
    </div>
    <div class="dept-card">
        <div class="dept-card-icon"><i class="bi bi-emoji-smile"></i></div>
        <h4>Pediatrics</h4>
        <p>Gentle and comprehensive medical care for infants, children, and teens.</p>
    </div>
    <div class="dept-card">
        <div class="dept-card-icon"><i class="bi bi-gender-female"></i></div>
        <h4>Gynecology</h4>
        <p>Complete women's health, maternity care, and wellness consultations.</p>
    </div>
    <div class="dept-card">
        <div class="dept-card-icon"><i class="bi bi-clipboard2-heart"></i></div>
        <h4>Dermatology</h4>
        <p>Comprehensive skin, allergy, and clinical cosmetic wellness treatment.</p>
    </div>
    <div class="dept-card">
        <div class="dept-card-icon"><i class="bi bi-eye"></i></div>
        <h4>Ophthalmology</h4>
        <p>Advanced eye care, precision vision therapy, and laser diagnostics.</p>
    </div>
    <div class="dept-card">
        <div class="dept-card-icon"><i class="bi bi-hospital"></i></div>
        <h4>General Medicine</h4>
        <p>Primary healthcare, clinical triage, diagnostics, and routine health checks.</p>
    </div>
`;
indexHtml = indexHtml.replace(/<div class="dept-grid"[^>]*>[\s\S]*?<\/div>\s*<\/section>/,
    `<div class="dept-grid" style="max-width:1100px;margin:0 auto;">${departmentsHtml}</div></section>`);

const doctorsHtml = `
    <div class="doctor-card">
        <div class="doctor-card-header">
            <div class="avatar avatar-md avatar-navy">R</div>
            <div>
                <div class="doctor-card-name">Dr. Rajesh Kumar</div>
                <div class="doctor-card-spec">Senior Cardiologist</div>
                <div class="doctor-card-dept">Cardiology • MediCare City Hospital</div>
            </div>
        </div>
        <div class="doctor-card-info">
            <div class="doctor-info-item"><i class="bi bi-mortarboard"></i> MBBS, MD, DM (Cardiology)</div>
            <div class="doctor-info-item"><i class="bi bi-clock"></i> 15 years experience</div>
            <div class="doctor-info-item"><i class="bi bi-currency-rupee"></i> Consultation: ₹800</div>
            <div class="doctor-info-item"><i class="bi bi-calendar-check"></i> Mon-Sat: 9AM-1PM, 3PM-6PM</div>
        </div>
        <a href="/login" class="btn btn-primary w-full" style="justify-content:center;"><i class="bi bi-calendar2-plus"></i> Book Consultation</a>
    </div>
    <div class="doctor-card">
        <div class="doctor-card-header">
            <div class="avatar avatar-md avatar-navy">P</div>
            <div>
                <div class="doctor-card-name">Dr. Priya Nair</div>
                <div class="doctor-card-spec">Neurologist</div>
                <div class="doctor-card-dept">Neurology • MediCare City Hospital</div>
            </div>
        </div>
        <div class="doctor-card-info">
            <div class="doctor-info-item"><i class="bi bi-mortarboard"></i> MBBS, MD, DM (Neurology)</div>
            <div class="doctor-info-item"><i class="bi bi-clock"></i> 10 years experience</div>
            <div class="doctor-info-item"><i class="bi bi-currency-rupee"></i> Consultation: ₹900</div>
            <div class="doctor-info-item"><i class="bi bi-calendar-check"></i> Mon-Fri: 10AM-2PM, 4PM-7PM</div>
        </div>
        <a href="/login" class="btn btn-primary w-full" style="justify-content:center;"><i class="bi bi-calendar2-plus"></i> Book Consultation</a>
    </div>
    <div class="doctor-card">
        <div class="doctor-card-header">
            <div class="avatar avatar-md avatar-navy">S</div>
            <div>
                <div class="doctor-card-name">Dr. Suresh Menon</div>
                <div class="doctor-card-spec">Orthopedic Surgeon</div>
                <div class="doctor-card-dept">Orthopedics • Sree Chitra Hospital</div>
            </div>
        </div>
        <div class="doctor-card-info">
            <div class="doctor-info-item"><i class="bi bi-mortarboard"></i> MBBS, MS (Ortho), Fellowship</div>
            <div class="doctor-info-item"><i class="bi bi-clock"></i> 12 years experience</div>
            <div class="doctor-info-item"><i class="bi bi-currency-rupee"></i> Consultation: ₹750</div>
            <div class="doctor-info-item"><i class="bi bi-calendar-check"></i> Mon-Sat: 9AM-12PM, 2PM-5PM</div>
        </div>
        <a href="/login" class="btn btn-primary w-full" style="justify-content:center;"><i class="bi bi-calendar2-plus"></i> Book Consultation</a>
    </div>
    <div class="doctor-card">
        <div class="doctor-card-header">
            <div class="avatar avatar-md avatar-navy">M</div>
            <div>
                <div class="doctor-card-name">Dr. Meera Thomas</div>
                <div class="doctor-card-spec">Consultant Pediatrician</div>
                <div class="doctor-card-dept">Pediatrics • Trivandrum Medical Trust</div>
            </div>
        </div>
        <div class="doctor-card-info">
            <div class="doctor-info-item"><i class="bi bi-mortarboard"></i> MBBS, MD (Pediatrics)</div>
            <div class="doctor-info-item"><i class="bi bi-clock"></i> 8 years experience</div>
            <div class="doctor-info-item"><i class="bi bi-currency-rupee"></i> Consultation: ₹600</div>
            <div class="doctor-info-item"><i class="bi bi-calendar-check"></i> Mon-Fri: 9AM-1PM, 3PM-6PM</div>
        </div>
        <a href="/login" class="btn btn-primary w-full" style="justify-content:center;"><i class="bi bi-calendar2-plus"></i> Book Consultation</a>
    </div>
`;
indexHtml = indexHtml.replace(/<div style="display:grid;grid-template-columns:repeat\(auto-fill,minmax\(280px,1fr\)\);gap:24px;max-width:1160px;margin:0 auto;">[\s\S]*?<\/div>\s*<div style="text-align:center;margin-top:36px;">/,
    `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px;max-width:1160px;margin:0 auto;">${doctorsHtml}</div><div style="text-align:center;margin-top:36px;">`);

writePage('index.html', indexHtml);

// ----------------------------------------------------
// 5. Generate Hospitals Directory (/hospitals/index.html)
// ----------------------------------------------------
const rawHospitals = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'hospitals', 'list.html'), 'utf8');
let hospitalsHtml = cleanThymeleaf(rawHospitals);

const hospitalsCardsHtml = `
    <!-- Hospital 1 -->
    <div class="hospital-card" style="padding: 0; overflow: hidden; border-radius: 20px; border: 1px solid #E5E7EB; background: #fff;">
        <div style="position: relative; height: 170px; overflow: hidden;">
            <img src="/images/who-we-are-lab.jpg" alt="MediCare City Hospital" style="width: 100%; height: 100%; object-fit: cover;"/>
            <div style="position: absolute; top: 12px; left: 12px; display: flex; gap: 8px;">
                <span class="hospital-badge" style="background: rgba(255,255,255,0.92); color: #0F2042; font-weight:700; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem;">TRV-HOSP-01</span>
                <span class="hospital-badge" style="background: #10B981; color: #fff; font-weight:700; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem;">ACTIVE</span>
            </div>
        </div>
        <div style="padding: 1.5rem;">
            <h3 style="font-size: 1.25rem; font-weight: 800; color: #111827; margin-bottom: 0.35rem;">MediCare City Hospital</h3>
            <p style="color: #6B7280; font-size: 0.88rem; margin-bottom: 1rem;"><i class="bi bi-geo-alt-fill" style="color: #8070A6;"></i> MG Road, Statue, Thiruvananthapuram – 695001</p>
            <p style="color: #4B5563; font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.25rem;">
                Premier tertiary care multi-speciality hospital equipped with state-of-the-art cardiology and neurology wings.
            </p>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.25rem;">
                <span style="background: #EDE7F6; color: #5E35B1; padding: 3px 10px; border-radius: 9999px; font-size: 0.78rem; font-weight: 600;">Cardiology</span>
                <span style="background: #EDE7F6; color: #5E35B1; padding: 3px 10px; border-radius: 9999px; font-size: 0.78rem; font-weight: 600;">Neurology</span>
                <span style="background: #EDE7F6; color: #5E35B1; padding: 3px 10px; border-radius: 9999px; font-size: 0.78rem; font-weight: 600;">Orthopedics</span>
                <span style="background: #EDE7F6; color: #5E35B1; padding: 3px 10px; border-radius: 9999px; font-size: 0.78rem; font-weight: 600;">General Medicine</span>
            </div>
            <div style="border-top: 1px solid #F3F4F6; padding-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span style="font-size: 0.75rem; color: #9CA3AF; text-transform: uppercase; font-weight: 600;">OPD Reg. Fee</span>
                    <div style="font-size: 1.15rem; font-weight: 800; color: #111827;">₹250.00</div>
                </div>
                <a href="/login" class="ref-pill-btn" style="padding: 0.55rem 1.25rem; font-size: 0.88rem;">
                    Book Consultation <i class="bi bi-arrow-right"></i>
                </a>
            </div>
        </div>
    </div>

    <!-- Hospital 2 -->
    <div class="hospital-card" style="padding: 0; overflow: hidden; border-radius: 20px; border: 1px solid #E5E7EB; background: #fff;">
        <div style="position: relative; height: 170px; overflow: hidden;">
            <img src="/images/service-cardio.jpg" alt="Trivandrum Medical Trust" style="width: 100%; height: 100%; object-fit: cover;"/>
            <div style="position: absolute; top: 12px; left: 12px; display: flex; gap: 8px;">
                <span class="hospital-badge" style="background: rgba(255,255,255,0.92); color: #0F2042; font-weight:700; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem;">TRV-HOSP-02</span>
                <span class="hospital-badge" style="background: #10B981; color: #fff; font-weight:700; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem;">ACTIVE</span>
            </div>
        </div>
        <div style="padding: 1.5rem;">
            <h3 style="font-size: 1.25rem; font-weight: 800; color: #111827; margin-bottom: 0.35rem;">Trivandrum Medical Trust</h3>
            <p style="color: #6B7280; font-size: 0.88rem; margin-bottom: 1rem;"><i class="bi bi-geo-alt-fill" style="color: #8070A6;"></i> Pattom Palace PO, Medical College Road – 695004</p>
            <p style="color: #4B5563; font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.25rem;">
                Renowned non-profit healthcare trust offering comprehensive pediatrics, gynecology, and round-the-clock emergency care.
            </p>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.25rem;">
                <span style="background: #EDE7F6; color: #5E35B1; padding: 3px 10px; border-radius: 9999px; font-size: 0.78rem; font-weight: 600;">Pediatrics</span>
                <span style="background: #EDE7F6; color: #5E35B1; padding: 3px 10px; border-radius: 9999px; font-size: 0.78rem; font-weight: 600;">Gynecology</span>
                <span style="background: #EDE7F6; color: #5E35B1; padding: 3px 10px; border-radius: 9999px; font-size: 0.78rem; font-weight: 600;">General Medicine</span>
            </div>
            <div style="border-top: 1px solid #F3F4F6; padding-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span style="font-size: 0.75rem; color: #9CA3AF; text-transform: uppercase; font-weight: 600;">OPD Reg. Fee</span>
                    <div style="font-size: 1.15rem; font-weight: 800; color: #111827;">₹200.00</div>
                </div>
                <a href="/login" class="ref-pill-btn" style="padding: 0.55rem 1.25rem; font-size: 0.88rem;">
                    Book Consultation <i class="bi bi-arrow-right"></i>
                </a>
            </div>
        </div>
    </div>

    <!-- Hospital 3 -->
    <div class="hospital-card" style="padding: 0; overflow: hidden; border-radius: 20px; border: 1px solid #E5E7EB; background: #fff;">
        <div style="position: relative; height: 170px; overflow: hidden;">
            <img src="/images/service-neuro.jpg" alt="Sree Chitra Speciality Hospital" style="width: 100%; height: 100%; object-fit: cover;"/>
            <div style="position: absolute; top: 12px; left: 12px; display: flex; gap: 8px;">
                <span class="hospital-badge" style="background: rgba(255,255,255,0.92); color: #0F2042; font-weight:700; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem;">TRV-HOSP-03</span>
                <span class="hospital-badge" style="background: #10B981; color: #fff; font-weight:700; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem;">ACTIVE</span>
            </div>
        </div>
        <div style="padding: 1.5rem;">
            <h3 style="font-size: 1.25rem; font-weight: 800; color: #111827; margin-bottom: 0.35rem;">Sree Chitra Speciality Hospital</h3>
            <p style="color: #6B7280; font-size: 0.88rem; margin-bottom: 1rem;"><i class="bi bi-geo-alt-fill" style="color: #8070A6;"></i> Kumarapuram, Medical College, Thiruvananthapuram – 695011</p>
            <p style="color: #4B5563; font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.25rem;">
                Advanced surgical, orthopedic, and neurosciences center delivering super-speciality treatment and robotic diagnostics.
            </p>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.25rem;">
                <span style="background: #EDE7F6; color: #5E35B1; padding: 3px 10px; border-radius: 9999px; font-size: 0.78rem; font-weight: 600;">Dermatology</span>
                <span style="background: #EDE7F6; color: #5E35B1; padding: 3px 10px; border-radius: 9999px; font-size: 0.78rem; font-weight: 600;">Ophthalmology</span>
                <span style="background: #EDE7F6; color: #5E35B1; padding: 3px 10px; border-radius: 9999px; font-size: 0.78rem; font-weight: 600;">Orthopedics</span>
            </div>
            <div style="border-top: 1px solid #F3F4F6; padding-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span style="font-size: 0.75rem; color: #9CA3AF; text-transform: uppercase; font-weight: 600;">OPD Reg. Fee</span>
                    <div style="font-size: 1.15rem; font-weight: 800; color: #111827;">₹300.00</div>
                </div>
                <a href="/login" class="ref-pill-btn" style="padding: 0.55rem 1.25rem; font-size: 0.88rem;">
                    Book Consultation <i class="bi bi-arrow-right"></i>
                </a>
            </div>
        </div>
    </div>
`;

hospitalsHtml = hospitalsHtml.replace(/<div class="hospital-grid">[\s\S]*?<\/div>\s*<\/div>\s*<\/body>/,
    `<div class="hospital-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 24px;">${hospitalsCardsHtml}</div></div></body>`);

writePage('hospitals/index.html', hospitalsHtml);

// ----------------------------------------------------
// 6. Generate Login Page (/login/index.html) with Comprehensive Role Details
// ----------------------------------------------------
const rawLogin = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'login.html'), 'utf8');
let loginHtml = cleanThymeleaf(rawLogin);

// Enhanced Demo Role Details Component for the Sign In page
const richRoleDetailsHtml = `
    <!-- Comprehensive Portal Role Details & 1-Click Access -->
    <div class="demo-accounts" style="margin-top: 28px; padding: 22px; background: #F8FAFC; border-radius: 16px; border: 1px solid #E2E8F0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-size: 0.88rem; font-weight: 800; color: #0F2042; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
                <i class="bi bi-shield-lock-fill" style="color: #6366F1; font-size: 1.05rem;"></i> Role Details &amp; Demo Access
            </div>
            <span style="font-size: 0.72rem; color: #4338CA; background: #EEF2FF; padding: 3px 10px; border-radius: 9999px; font-weight: 700;">1-Click Login</span>
        </div>
        <p style="font-size: 0.8rem; color: #64748B; margin-bottom: 16px; line-height: 1.45;">
            Select any healthcare role below to inspect credentials, clinical scope, and login directly:
        </p>

        <div style="display: flex; flex-direction: column; gap: 12px;">
            <!-- 1. Patient -->
            <div class="role-card-item" onclick="fillAndSelectRole('patient@healix.com', 'Patient@123', 'patient')"
                 style="background: #ffffff; border: 1.5px solid #CCFBF1; border-radius: 12px; padding: 14px; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.03);"
                 onmouseover="this.style.borderColor='#14B8A6'; this.style.transform='translateY(-2px)';"
                 onmouseout="this.style.borderColor='#CCFBF1'; this.style.transform='none';">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 36px; height: 36px; border-radius: 10px; background: #CCFBF1; color: #0F766E; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem;">
                            <i class="bi bi-person-fill"></i>
                        </div>
                        <div>
                            <div style="font-weight: 700; color: #0F2042; font-size: 0.95rem;">Arun Chandran <span style="font-size: 0.75rem; color: #64748B; font-weight: normal;">(Patient #PAT-TRV-000001)</span></div>
                            <div style="font-size: 0.76rem; color: #0F766E; font-weight: 600;">B+ Positive • MediCare City Hospital OPD</div>
                        </div>
                    </div>
                    <span style="background: #F0FDFA; color: #0F766E; border: 1px solid #99F6E4; padding: 2px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 700;">PATIENT</span>
                </div>
                <div style="font-size: 0.78rem; color: #475569; margin-bottom: 10px; line-height: 1.4;">
                    <strong>Features:</strong> Book OPD appointments, 24/7 AI triage assistant, view digital prescriptions &amp; clinical records.
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #E2E8F0; padding-top: 8px;">
                    <div style="font-size: 0.76rem; color: #64748B;">
                        <code>patient@healix.com</code> • <code>Patient@123</code>
                    </div>
                    <button type="button" onclick="quickLogin('patient@healix.com', 'Patient@123', 'PATIENT', '/patient/dashboard', event)"
                            class="btn btn-sm" style="background: #0D9488; color: #fff; padding: 4px 12px; font-size: 0.75rem; border-radius: 6px; font-weight: 600;">
                        <i class="bi bi-lightning-fill"></i> Quick Sign In
                    </button>
                </div>
            </div>

            <!-- 2. Doctor -->
            <div class="role-card-item" onclick="fillAndSelectRole('doctor@healix.com', 'Doctor@123', 'doctor')"
                 style="background: #ffffff; border: 1.5px solid #E0E7FF; border-radius: 12px; padding: 14px; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.03);"
                 onmouseover="this.style.borderColor='#6366F1'; this.style.transform='translateY(-2px)';"
                 onmouseout="this.style.borderColor='#E0E7FF'; this.style.transform='none';">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 36px; height: 36px; border-radius: 10px; background: #E0E7FF; color: #4338CA; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem;">
                            <i class="bi bi-heart-pulse-fill"></i>
                        </div>
                        <div>
                            <div style="font-weight: 700; color: #0F2042; font-size: 0.95rem;">Dr. Rajesh Kumar <span style="font-size: 0.75rem; color: #64748B; font-weight: normal;">(DOC-TRV-001)</span></div>
                            <div style="font-size: 0.76rem; color: #4338CA; font-weight: 600;">Senior Cardiologist • MBBS, MD, DM (15 yrs exp)</div>
                        </div>
                    </div>
                    <span style="background: #EEF2FF; color: #4338CA; border: 1px solid #C7D2FE; padding: 2px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 700;">DOCTOR</span>
                </div>
                <div style="font-size: 0.78rem; color: #475569; margin-bottom: 10px; line-height: 1.4;">
                    <strong>Features:</strong> Outpatient queue, diagnosis entries, electronic prescriptions, weekly consultation schedule.
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #E2E8F0; padding-top: 8px;">
                    <div style="font-size: 0.76rem; color: #64748B;">
                        <code>doctor@healix.com</code> • <code>Doctor@123</code>
                    </div>
                    <button type="button" onclick="quickLogin('doctor@healix.com', 'Doctor@123', 'DOCTOR', '/doctor/dashboard', event)"
                            class="btn btn-sm" style="background: #4F46E5; color: #fff; padding: 4px 12px; font-size: 0.75rem; border-radius: 6px; font-weight: 600;">
                        <i class="bi bi-lightning-fill"></i> Quick Sign In
                    </button>
                </div>
            </div>

            <!-- 3. Hospital Admin -->
            <div class="role-card-item" onclick="fillAndSelectRole('admin.medicare@healix.com', 'Admin@123', 'hosp-admin')"
                 style="background: #ffffff; border: 1.5px solid #F3E8FF; border-radius: 12px; padding: 14px; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.03);"
                 onmouseover="this.style.borderColor='#9333EA'; this.style.transform='translateY(-2px)';"
                 onmouseout="this.style.borderColor='#F3E8FF'; this.style.transform='none';">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 36px; height: 36px; border-radius: 10px; background: #F3E8FF; color: #7E22CE; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem;">
                            <i class="bi bi-hospital"></i>
                        </div>
                        <div>
                            <div style="font-weight: 700; color: #0F2042; font-size: 0.95rem;">Rahul Sharma <span style="font-size: 0.75rem; color: #64748B; font-weight: normal;">(H1-ADM01)</span></div>
                            <div style="font-size: 0.76rem; color: #7E22CE; font-weight: 600;">Administrator • MediCare City Hospital (TRV-HOSP-01)</div>
                        </div>
                    </div>
                    <span style="background: #FAF5FF; color: #7E22CE; border: 1px solid #E9D5FF; padding: 2px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 700;">HOSPITAL ADMIN</span>
                </div>
                <div style="font-size: 0.78rem; color: #475569; margin-bottom: 10px; line-height: 1.4;">
                    <strong>Features:</strong> Scoped hospital isolation, 18 affiliated specialists, departments, OPD tokens &amp; ₹38,500 revenue tracking.
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #E2E8F0; padding-top: 8px;">
                    <div style="font-size: 0.76rem; color: #64748B;">
                        <code>admin.medicare@healix.com</code> • <code>Admin@123</code>
                    </div>
                    <button type="button" onclick="quickLogin('admin.medicare@healix.com', 'Admin@123', 'HOSPITAL_ADMIN', '/hospital-admin/dashboard', event)"
                            class="btn btn-sm" style="background: #7E22CE; color: #fff; padding: 4px 12px; font-size: 0.75rem; border-radius: 6px; font-weight: 600;">
                        <i class="bi bi-lightning-fill"></i> Quick Sign In
                    </button>
                </div>
            </div>

            <!-- 4. Super Admin -->
            <div class="role-card-item" onclick="fillAndSelectRole('admin@healix.com', 'Admin@123', 'super-admin')"
                 style="background: #ffffff; border: 1.5px solid #EDE7F6; border-radius: 12px; padding: 14px; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.03);"
                 onmouseover="this.style.borderColor='#8070A6'; this.style.transform='translateY(-2px)';"
                 onmouseout="this.style.borderColor='#EDE7F6'; this.style.transform='none';">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 36px; height: 36px; border-radius: 10px; background: #EDE7F6; color: #5E35B1; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem;">
                            <i class="bi bi-shield-check"></i>
                        </div>
                        <div>
                            <div style="font-weight: 700; color: #0F2042; font-size: 0.95rem;">Dr. Ananya Krishnan <span style="font-size: 0.75rem; color: #64748B; font-weight: normal;">(Chief Director)</span></div>
                            <div style="font-size: 0.76rem; color: #5E35B1; font-weight: 600;">Platform Super Admin • All 3 Network Institutions</div>
                        </div>
                    </div>
                    <span style="background: #EDE7F6; color: #5E35B1; border: 1px solid #D1C4E9; padding: 2px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 700;">SUPER ADMIN</span>
                </div>
                <div style="font-size: 0.78rem; color: #475569; margin-bottom: 10px; line-height: 1.4;">
                    <strong>Features:</strong> Multi-hospital network governance, institutional onboarding, 1,240 central patient records, system audit.
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #E2E8F0; padding-top: 8px;">
                    <div style="font-size: 0.76rem; color: #64748B;">
                        <code>admin@healix.com</code> • <code>Admin@123</code>
                    </div>
                    <button type="button" onclick="quickLogin('admin@healix.com', 'Admin@123', 'SUPER_ADMIN', '/super-admin/dashboard', event)"
                            class="btn btn-sm" style="background: #5E35B1; color: #fff; padding: 4px 12px; font-size: 0.75rem; border-radius: 6px; font-weight: 600;">
                        <i class="bi bi-lightning-fill"></i> Quick Sign In
                    </button>
                </div>
            </div>
        </div>
    </div>
`;

// Replace demo accounts section in login template
loginHtml = loginHtml.replace(/<!-- Demo Credentials -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
    `${richRoleDetailsHtml}</div></div>`);

const loginScript = `
<script>
    function togglePwd() {
        const pwd = document.getElementById('password');
        const eye = document.getElementById('pwdEye');
        if (pwd.type === 'password') { pwd.type = 'text'; eye.className = 'bi bi-eye-slash'; }
        else { pwd.type = 'password'; eye.className = 'bi bi-eye'; }
    }

    function fillCreds(email, password) {
        document.getElementById('email').value = email;
        document.getElementById('password').value = password;
    }

    function fillAndSelectRole(email, password, roleKey) {
        fillCreds(email, password);
        const emailInput = document.getElementById('email');
        emailInput.focus();
        emailInput.style.outline = '2px solid #6366F1';
        setTimeout(() => emailInput.style.outline = 'none', 1200);
    }

    function quickLogin(email, password, role, targetUrl, event) {
        if (event) event.stopPropagation();
        fillCreds(email, password);
        
        let userName = 'User';
        if (role === 'SUPER_ADMIN') userName = 'Dr. Ananya Krishnan';
        else if (role === 'HOSPITAL_ADMIN') userName = 'Rahul Sharma';
        else if (role === 'DOCTOR') userName = 'Dr. Rajesh Kumar';
        else userName = 'Arun Chandran';

        localStorage.setItem('healix_user', JSON.stringify({ name: userName, email, role }));
        window.location.href = targetUrl;
    }

    document.querySelector('.login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const pwd = document.getElementById('password').value.trim();

        if (email === 'admin@healix.com') {
            localStorage.setItem('healix_user', JSON.stringify({ name: 'Dr. Ananya Krishnan', email, role: 'SUPER_ADMIN' }));
            window.location.href = '/super-admin/dashboard';
        } else if (email === 'admin.medicare@healix.com' || email === 'admin.tvm@healix.com') {
            localStorage.setItem('healix_user', JSON.stringify({ name: 'Rahul Sharma', email, role: 'HOSPITAL_ADMIN' }));
            window.location.href = '/hospital-admin/dashboard';
        } else if (email === 'doctor@healix.com') {
            localStorage.setItem('healix_user', JSON.stringify({ name: 'Dr. Rajesh Kumar', email, role: 'DOCTOR' }));
            window.location.href = '/doctor/dashboard';
        } else {
            // Patient
            const name = email === 'patient@healix.com' ? 'Arun Chandran' : (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1));
            localStorage.setItem('healix_user', JSON.stringify({ name, email, role: 'PATIENT' }));
            window.location.href = '/patient/dashboard';
        }
    });
</script>
`;

loginHtml = loginHtml.replace(/<script>[\s\S]*?<\/script>/, loginScript);
writePage('login/index.html', loginHtml);

// ----------------------------------------------------
// 7. Generate Register Page (/register/index.html)
// ----------------------------------------------------
const rawRegister = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'register.html'), 'utf8');
let registerHtml = cleanThymeleaf(rawRegister);

const registerScript = `
<script>
    document.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.querySelector('input[placeholder="e.g. John Doe"]').value.trim();
        const email = document.querySelector('input[type="email"]').value.trim();
        const phone = document.querySelector('input[type="tel"]').value.trim();

        const user = { name: name || 'Patient User', email: email || 'patient@example.com', phone, role: 'PATIENT' };
        localStorage.setItem('healix_user', JSON.stringify(user));

        alert('Registration successful! Your patient identifier PAT-TRV-000004 has been generated. Redirecting to Patient Portal...');
        window.location.href = '/patient/dashboard';
    });
</script>
`;

registerHtml = registerHtml.replace('</body>', `${registerScript}</body>`);
writePage('register/index.html', registerHtml);

// ----------------------------------------------------
// 8. Generate Logout Page (/logout/index.html)
// ----------------------------------------------------
const logoutHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8"/>
    <title>Signing out | HealiX</title>
    <link rel="stylesheet" href="/css/main.css"/>
</head>
<body style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#F8FAFC;font-family:'Inter',sans-serif;margin:0;">
    <div style="text-align:center;padding:40px;background:#fff;border-radius:16px;border:1px solid #E2E8F0;box-shadow:0 4px 20px rgba(0,0,0,0.05);max-width:380px;">
        <div style="font-size:2rem;color:#6366F1;margin-bottom:12px;"><i class="bi bi-box-arrow-right"></i></div>
        <h3 style="margin:0 0 8px;color:#0F2042;">Signing out...</h3>
        <p style="color:#64748B;font-size:0.9rem;margin:0;">Clearing session and redirecting to sign in page.</p>
    </div>
    <script>
        localStorage.removeItem('healix_user');
        setTimeout(() => { window.location.href = '/login'; }, 400);
    </script>
</body>
</html>`;
writePage('logout/index.html', logoutHtml);

// ----------------------------------------------------
// 9. Generate AI Assistant Page (/patient/ai-assistant/index.html)
// ----------------------------------------------------
const rawAi = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'patient', 'ai-assistant.html'), 'utf8');
let aiHtml = cleanThymeleaf(rawAi);

const clientAiEngine = `
<script>
    function setPrompt(text) {
        document.getElementById('symptomInput').value = text;
        sendSymptoms();
    }

    function assessSymptomsOffline(raw) {
        const symptoms = raw.toLowerCase();

        if (symptoms.includes('chest pain') || symptoms.includes('heart attack') ||
            symptoms.includes('difficulty breathing') || symptoms.includes('shortness of breath') ||
            symptoms.includes('stroke') || symptoms.includes('paralysis') ||
            symptoms.includes('loss of consciousness') || symptoms.includes('heavy bleeding') ||
            symptoms.includes('crushing pain') || symptoms.includes('unconscious')) {
            return {
                emergency: true,
                severityLevel: 'CRITICAL',
                emergencyMessage: 'This may require urgent medical attention. Please contact emergency medical services (108/112 in Kerala) or visit the nearest emergency department immediately.',
                generalExplanation: 'The symptoms reported indicate potential acute cardiovascular, respiratory, or neurological distress requiring immediate medical evaluation.',
                possibleConditions: ['Acute Coronary Syndrome', 'Severe Respiratory Distress', 'Acute Neurological Event'],
                recommendedDepartment: 'Emergency Medicine / Cardiology',
                disclaimer: 'MediCare AI provides preliminary triage advice only and is not a definitive diagnosis.'
            };
        }

        if (symptoms.includes('palpitation') || symptoms.includes('fast heartbeat') || symptoms.includes('dizziness')) {
            return {
                emergency: false,
                severityLevel: 'MODERATE',
                generalExplanation: 'These symptoms are often related to arrhythmias, anxiety, dehydration, or cardiovascular strain.',
                possibleConditions: ['Tachycardia', 'Mild Arrhythmia', 'Stress/Anxiety Response', 'Electrolyte Imbalance'],
                recommendedDepartment: 'Cardiology',
                disclaimer: 'MediCare AI provides preliminary triage advice only and is not a definitive diagnosis.'
            };
        }

        if (symptoms.includes('fever') || symptoms.includes('cough') || symptoms.includes('sore throat') ||
            symptoms.includes('cold') || symptoms.includes('runny nose')) {
            return {
                emergency: false,
                severityLevel: 'LOW',
                generalExplanation: 'These symptoms are commonly associated with upper respiratory tract infections or seasonal viral illnesses.',
                possibleConditions: ['Viral Pharyngitis', 'Common Cold / Influenza', 'Acute Bronchitis', 'Allergic Rhinitis'],
                recommendedDepartment: 'General Medicine',
                disclaimer: 'MediCare AI provides preliminary triage advice only and is not a definitive diagnosis.'
            };
        }

        if (symptoms.includes('rash') || symptoms.includes('itch') || symptoms.includes('skin') ||
            symptoms.includes('acne') || symptoms.includes('allergy') || symptoms.includes('redness')) {
            return {
                emergency: false,
                severityLevel: 'LOW',
                generalExplanation: 'Skin eruptions and itching can stem from contact dermatitis, viral exanthems, or allergic reactions.',
                possibleConditions: ['Contact Dermatitis', 'Urticaria (Hives)', 'Eczema', 'Fungal Skin Infection'],
                recommendedDepartment: 'Dermatology',
                disclaimer: 'MediCare AI provides preliminary triage advice only and is not a definitive diagnosis.'
            };
        }

        if (symptoms.includes('joint') || symptoms.includes('knee') || symptoms.includes('back pain') ||
            symptoms.includes('fracture') || symptoms.includes('swelling') || symptoms.includes('shoulder')) {
            return {
                emergency: false,
                severityLevel: 'MODERATE',
                generalExplanation: 'Musculoskeletal pain is frequently linked to joint inflammation, ligament sprains, or disc pathology.',
                possibleConditions: ['Osteoarthritis', 'Lumbar Muscle Strain', 'Tendinitis', 'Ligament Sprain'],
                recommendedDepartment: 'Orthopedics',
                disclaimer: 'MediCare AI provides preliminary triage advice only and is not a definitive diagnosis.'
            };
        }

        if (symptoms.includes('headache') || symptoms.includes('migraine') || symptoms.includes('numbness')) {
            return {
                emergency: false,
                severityLevel: 'MODERATE',
                generalExplanation: 'Headaches may arise from stress, tension, vascular changes, or sinus pressure.',
                possibleConditions: ['Tension-Type Headache', 'Migraine', 'Sinusitis', 'Cervicogenic Headache'],
                recommendedDepartment: 'Neurology',
                disclaimer: 'MediCare AI provides preliminary triage advice only and is not a definitive diagnosis.'
            };
        }

        return {
            emergency: false,
            severityLevel: 'LOW',
            generalExplanation: 'These symptoms can be associated with non-specific conditions. A routine medical consultation will help clarify the cause.',
            possibleConditions: ['General Fatigue', 'Mild Viral Syndrome', 'Environmental Stressor'],
            recommendedDepartment: 'General Medicine',
            disclaimer: 'MediCare AI provides preliminary triage advice only and is not a definitive diagnosis.'
        };
    }

    async function sendSymptoms() {
        const input = document.getElementById('symptomInput');
        const text = input.value.trim();
        if (!text) return;

        const chatBox = document.getElementById('chatMessages');

        // Append User Message
        const userMsg = document.createElement('div');
        userMsg.className = 'chat-msg user';
        userMsg.innerText = text;
        chatBox.appendChild(userMsg);
        input.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;

        // Loading indicator
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'chat-msg bot';
        loadingMsg.innerHTML = '<i class="bi bi-hourglass-split"></i> Analyzing symptoms...';
        chatBox.appendChild(loadingMsg);
        chatBox.scrollTop = chatBox.scrollHeight;

        setTimeout(() => {
            chatBox.removeChild(loadingMsg);
            const data = assessSymptomsOffline(text);

            const botMsg = document.createElement('div');
            botMsg.className = data.emergency ? 'chat-msg emergency' : 'chat-msg bot';

            let html = '';
            if (data.emergency) {
                html += '<div style="font-weight: 800; font-size: 1.1rem; color: #DC2626; margin-bottom: 0.5rem;"><i class="bi bi-exclamation-triangle-fill"></i> URGENT MEDICAL ATTENTION REQUIRED</div>';
                html += '<p style="margin-bottom: 0.5rem;">' + data.emergencyMessage + '</p>';
            }

            html += '<p><strong>General Assessment:</strong> ' + data.generalExplanation + '</p>';

            if (data.possibleConditions && data.possibleConditions.length > 0) {
                html += '<div style="margin-top: 0.5rem;"><strong>Associated Conditions:</strong><ul>';
                data.possibleConditions.forEach(c => { html += '<li>' + c + '</li>'; });
                html += '</ul></div>';
            }

            if (data.recommendedDepartment) {
                html += '<div style="margin: 0.75rem 0; padding: 0.75rem; background: #EDE7F6; border-radius: 8px;">';
                html += '<strong style="color: #5E35B1;">Recommended Department:</strong> ' + data.recommendedDepartment;
                html += '<div style="margin-top: 0.5rem;"><a href="/patient/book-appointment" class="ref-pill-btn" style="padding: 4px 14px; font-size: 0.8rem;">Book Consultation in ' + data.recommendedDepartment + '</a></div>';
                html += '</div>';
            }

            html += '<p style="font-size: 0.85rem; color: #6B7280; border-top: 1px dashed #D1D5DB; padding-top: 0.5rem; margin-top: 0.5rem;">' + data.disclaimer + '</p>';

            botMsg.innerHTML = html;
            chatBox.appendChild(botMsg);
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 500);
    }
</script>
`;

aiHtml = aiHtml.replace(/<script>[\s\S]*?<\/script>/, clientAiEngine);
writePage('patient/ai-assistant/index.html', aiHtml);

// ----------------------------------------------------
// 10. Generate Patient Dashboard (/patient/dashboard/index.html)
// ----------------------------------------------------
const rawPatientDash = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'patient', 'dashboard.html'), 'utf8');
let patientDashHtml = cleanThymeleaf(rawPatientDash);

patientDashHtml = patientDashHtml
    .replace('<span th:text="${patient.name}">Patient</span>', '<span class="js-user-name">Arun Chandran</span>')
    .replace('${#temporals.format(#temporals.createNow(), \'EEEE, dd MMMM yyyy\')}', new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
    .replace('<h3 th:text="${patient.name}">Patient Name</h3>', '<h3 class="js-user-name">Arun Chandran</h3>')
    .replace('th:text="${patient.patientIdentifier ?: \'PAT-TRV-000001\'}"', '')
    .replace('<span th:text="${patient.patientIdentifier ?: \'PAT-TRV-000001\'}">PAT-TRV-000001</span>', '<span id="patientIdBadge">PAT-TRV-000001</span>')
    .replace(/<div class="stat-number" th:text="\$\{[^}]+\}">\d+<\/div>/g, '<div class="stat-number">3</div>')
    .replace(/<a href="\/logout"/g, '<a href="/logout" onclick="localStorage.removeItem(\'healix_user\')"');

// Populate sample upcoming appointments & medical records in patient dashboard
const patientUpcomingHtml = `
    <tr>
        <td style="font-weight:600;color:#0F2042;">Tomorrow</td>
        <td style="font-weight:600;color:#0D9488;">09:30 AM</td>
        <td>
            <div style="font-weight:600;">Dr. Rajesh Kumar</div>
            <div style="font-size:0.75rem;color:#64748B;">Cardiology • MediCare City Hospital</div>
        </td>
        <td><span class="badge badge-confirmed">CONFIRMED</span></td>
        <td><a href="/patient/appointments" class="btn btn-sm btn-outline">View Slip</a></td>
    </tr>
    <tr>
        <td style="font-weight:600;color:#0F2042;">In 3 Days</td>
        <td style="font-weight:600;color:#0D9488;">09:30 AM</td>
        <td>
            <div style="font-weight:600;">Dr. Suresh Menon</div>
            <div style="font-size:0.75rem;color:#64748B;">Orthopedics • Sree Chitra Hospital</div>
        </td>
        <td><span class="badge badge-pending">PENDING</span></td>
        <td><a href="/patient/appointments" class="btn btn-sm btn-outline">Details</a></td>
    </tr>
`;
patientDashHtml = patientDashHtml.replace(/<tbody>[\s\S]*?<\/tbody>/, `<tbody>${patientUpcomingHtml}</tbody>`);

const patientScript = `
<script>
    const user = JSON.parse(localStorage.getItem('healix_user') || '{"name":"Arun Chandran","email":"patient@healix.com","role":"PATIENT"}');
    document.querySelectorAll('.js-user-name').forEach(el => el.innerText = user.name || 'Arun Chandran');
</script>
`;
patientDashHtml = patientDashHtml.replace('</body>', `${patientScript}</body>`);
writePage('patient/dashboard/index.html', patientDashHtml);

// ----------------------------------------------------
// 11. Generate Patient Book Appointment (/patient/book-appointment/index.html)
// ----------------------------------------------------
const rawBook = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'patient', 'book-appointment.html'), 'utf8');
let bookHtml = cleanThymeleaf(rawBook);

const bookScript = `
<script>
    document.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        const hospitalSelect = document.querySelector('select[name="hospitalId"]');
        const hospital = hospitalSelect && hospitalSelect.selectedIndex >= 0 ? hospitalSelect.options[hospitalSelect.selectedIndex].text : 'MediCare City Hospital';
        const doctorSelect = document.querySelector('select[name="doctorId"]');
        const doctor = doctorSelect && doctorSelect.selectedIndex >= 0 ? doctorSelect.options[doctorSelect.selectedIndex].text : 'Dr. Rajesh Kumar (Cardiology)';
        const dateInput = document.querySelector('input[type="date"]');
        const date = dateInput && dateInput.value ? dateInput.value : 'Tomorrow';
        const timeSelect = document.querySelector('select[name="appointmentTime"]');
        const time = timeSelect && timeSelect.value ? timeSelect.value : '10:00 AM';

        alert('Appointment successfully booked with ' + doctor + ' at ' + hospital + ' on ' + date + ' (' + time + ')! Digital OPD registration token generated.');
        window.location.href = '/patient/appointments';
    });
</script>
`;
bookHtml = bookHtml.replace('</body>', `${bookScript}</body>`);
writePage('patient/book-appointment/index.html', bookHtml);

// ----------------------------------------------------
// 12. Generate Patient Appointments (/patient/appointments/index.html)
// ----------------------------------------------------
const rawAppts = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'patient', 'appointments.html'), 'utf8');
let apptsHtml = cleanThymeleaf(rawAppts);

const apptsTableHtml = `
    <tr>
        <td style="font-weight:700;color:#0F2042;">#APT-1082</td>
        <td>
            <div style="font-weight:700;">Dr. Rajesh Kumar</div>
            <div style="font-size:0.75rem;color:#64748B;">Cardiology • MediCare City Hospital</div>
        </td>
        <td style="font-weight:600;">Tomorrow</td>
        <td style="font-weight:700;color:#0D9488;">09:30 AM</td>
        <td style="font-size:0.85rem;color:#475569;">Chest pain and shortness of breath during exercise</td>
        <td><span class="badge badge-confirmed">CONFIRMED</span></td>
        <td>
            <button onclick="alert('Digital Registration Slip #REC-TRV-REG001\\nPatient: Arun Chandran\\nHospital: MediCare City Hospital\\nConsultation Fee: ₹800.00\\nRoom: OPD 104');"
                    class="btn btn-sm btn-outline"><i class="bi bi-receipt"></i> Slip</button>
        </td>
    </tr>
    <tr>
        <td style="font-weight:700;color:#0F2042;">#APT-1083</td>
        <td>
            <div style="font-weight:700;">Dr. Suresh Menon</div>
            <div style="font-size:0.75rem;color:#64748B;">Orthopedics • Sree Chitra Speciality Hospital</div>
        </td>
        <td style="font-weight:600;">In 3 Days</td>
        <td style="font-weight:700;color:#0D9488;">09:30 AM</td>
        <td style="font-size:0.85rem;color:#475569;">Right knee pain after sports activity</td>
        <td><span class="badge badge-pending">PENDING</span></td>
        <td>
            <button onclick="alert('Appointment is pending doctor confirmation. You will receive an SMS and email notification once verified.');"
                    class="btn btn-sm btn-outline"><i class="bi bi-clock-history"></i> Status</button>
        </td>
    </tr>
    <tr>
        <td style="font-weight:700;color:#0F2042;">#APT-0941</td>
        <td>
            <div style="font-weight:700;">Dr. Rajesh Kumar</div>
            <div style="font-size:0.75rem;color:#64748B;">Cardiology • MediCare City Hospital</div>
        </td>
        <td style="font-weight:600;">10 Sep 2026</td>
        <td style="font-weight:700;color:#64748B;">10:00 AM</td>
        <td style="font-size:0.85rem;color:#475569;">Annual cardiac health checkup &amp; ECG review</td>
        <td><span class="badge badge-completed">COMPLETED</span></td>
        <td>
            <a href="/patient/medical-records" class="btn btn-sm btn-outline"><i class="bi bi-file-earmark-medical"></i> Record</a>
        </td>
    </tr>
`;
apptsHtml = apptsHtml.replace(/<tbody>[\s\S]*?<\/tbody>/, `<tbody>${apptsTableHtml}</tbody>`);
writePage('patient/appointments/index.html', apptsHtml);

// ----------------------------------------------------
// 13. Generate Patient Find Doctors (/patient/doctors/index.html)
// ----------------------------------------------------
const rawPatDocs = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'patient', 'doctors.html'), 'utf8');
let patDocsHtml = cleanThymeleaf(rawPatDocs);
writePage('patient/doctors/index.html', patDocsHtml);

// ----------------------------------------------------
// 14. Generate Patient My Hospitals (/patient/hospitals/index.html)
// ----------------------------------------------------
const rawPatHosps = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'patient', 'hospitals.html'), 'utf8');
let patHospsHtml = cleanThymeleaf(rawPatHosps);

patHospsHtml = patHospsHtml
    .replace('<span th:text="${patient.name}">Patient Name</span>', 'Arun Chandran')
    .replace('th:text="${patient.patientIdentifier}"', '')
    .replace('<span class="hospital-badge" style="font-size: 0.9rem;">PAT-TRV-000102</span>', '<span class="hospital-badge" style="font-size: 0.9rem;">PAT-TRV-000001</span>');

const myHospsGridHtml = `
    <div class="hospital-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-bottom: 2.5rem;">
        <div class="hospital-card" style="border-top: 4px solid #8070A6; background:#fff; border-radius:16px; border:1px solid #E5E7EB; padding:1.5rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
                <div>
                    <span class="hospital-badge" style="background:#EDE7F6; color:#5E35B1; padding:3px 8px; border-radius:6px; font-size:0.75rem; font-weight:700;">TRV-HOSP-01</span>
                    <h3 style="font-size:1.25rem; font-weight:700; color:#111827; margin:6px 0 2px;">MediCare City Hospital</h3>
                    <div style="font-size:0.82rem; color:#6B7280;">MG Road, Statue, Thiruvananthapuram</div>
                </div>
                <span class="badge badge-confirmed" style="background:#D1FAE5; color:#065F46; padding:3px 10px; border-radius:9999px; font-size:0.75rem; font-weight:700;">REGISTERED</span>
            </div>
            <div style="background:#F8FAFC; border-radius:10px; padding:12px; margin-bottom:1rem; font-size:0.85rem;">
                <div style="color:#64748B; font-size:0.75rem;">Hospital Patient Code</div>
                <strong style="color:#0F2042; font-size:1rem;">TRV-HOSP-01-P-0001</strong>
            </div>
            <a href="/patient/book-appointment" class="ref-pill-btn" style="width:100%; justify-content:center; padding:8px 0; font-size:0.85rem;">
                <i class="bi bi-calendar-plus"></i> Book Consultation
            </a>
        </div>

        <div class="hospital-card" style="border-top: 4px solid #0D9488; background:#fff; border-radius:16px; border:1px solid #E5E7EB; padding:1.5rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
                <div>
                    <span class="hospital-badge" style="background:#CCFBF1; color:#0F766E; padding:3px 8px; border-radius:6px; font-size:0.75rem; font-weight:700;">TRV-HOSP-02</span>
                    <h3 style="font-size:1.25rem; font-weight:700; color:#111827; margin:6px 0 2px;">Trivandrum Medical Trust</h3>
                    <div style="font-size:0.82rem; color:#6B7280;">Pattom Palace PO, Medical College Road</div>
                </div>
                <span class="badge badge-confirmed" style="background:#D1FAE5; color:#065F46; padding:3px 10px; border-radius:9999px; font-size:0.75rem; font-weight:700;">REGISTERED</span>
            </div>
            <div style="background:#F8FAFC; border-radius:10px; padding:12px; margin-bottom:1rem; font-size:0.85rem;">
                <div style="color:#64748B; font-size:0.75rem;">Hospital Patient Code</div>
                <strong style="color:#0F2042; font-size:1rem;">TRV-HOSP-02-P-0042</strong>
            </div>
            <a href="/patient/book-appointment" class="ref-pill-btn" style="width:100%; justify-content:center; padding:8px 0; font-size:0.85rem;">
                <i class="bi bi-calendar-plus"></i> Book Consultation
            </a>
        </div>
    </div>
`;
patHospsHtml = patHospsHtml.replace(/<div th:if="\${#lists.isEmpty\(registeredHospitals\)}"[\s\S]*?<\/div>\s*<\/div>/, myHospsGridHtml);
writePage('patient/hospitals/index.html', patHospsHtml);

// ----------------------------------------------------
// 15. Generate Patient Medical Records (/patient/medical-records/index.html)
// ----------------------------------------------------
const rawPatRecords = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'patient', 'medical-records.html'), 'utf8');
let patRecordsHtml = cleanThymeleaf(rawPatRecords);

const patRecordsTableHtml = `
    <tr>
        <td style="font-weight:700;color:#0F2042;">#REC-2026-081</td>
        <td style="font-weight:600;">10 Sep 2026</td>
        <td>
            <div style="font-weight:700;">Dr. Rajesh Kumar</div>
            <div style="font-size:0.75rem;color:#64748B;">Cardiology • MediCare City Hospital</div>
        </td>
        <td><strong style="color:#0D9488;">Angina Pectoris / Mild HTN</strong></td>
        <td style="font-size:0.85rem;color:#475569;">Atorvastatin 20mg (night), Metoprolol 50mg (morning)</td>
        <td>
            <button onclick="alert('Clinical Summary:\\nPatient reported mild exertional retrosternal discomfort.\\nBP: 138/88 mmHg, ECG sinus rhythm.\\nAdvised lifestyle modifications and 2D Echo review in 4 weeks.');"
                    class="btn btn-sm btn-outline"><i class="bi bi-eye"></i> View</button>
        </td>
    </tr>
    <tr>
        <td style="font-weight:700;color:#0F2042;">#REC-2026-044</td>
        <td style="font-weight:600;">22 Jun 2026</td>
        <td>
            <div style="font-weight:700;">Dr. Priya Nair</div>
            <div style="font-size:0.75rem;color:#64748B;">Neurology • MediCare City Hospital</div>
        </td>
        <td><strong style="color:#0D9488;">Tension Headache &amp; Fatigue</strong></td>
        <td style="font-size:0.85rem;color:#475569;">Naproxen 250mg PRN, Vitamin B-Complex</td>
        <td>
            <button onclick="alert('Clinical Summary:\\nCervicogenic tension headache related to prolonged screen work.\\nNeuro exam normal. Hydration and neck posture therapy advised.');"
                    class="btn btn-sm btn-outline"><i class="bi bi-eye"></i> View</button>
        </td>
    </tr>
`;
patRecordsHtml = patRecordsHtml.replace(/<tbody>[\s\S]*?<\/tbody>/, `<tbody>${patRecordsTableHtml}</tbody>`);
writePage('patient/medical-records/index.html', patRecordsHtml);

// ----------------------------------------------------
// 16. Generate Patient Prescriptions (/patient/prescriptions/index.html)
// ----------------------------------------------------
const rawPatRx = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'patient', 'prescriptions.html'), 'utf8');
let patRxHtml = cleanThymeleaf(rawPatRx);

const patRxGridHtml = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
        <div class="card" style="border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px; background: #fff;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <div>
                    <span class="badge" style="background:#CCFBF1; color:#0F766E; font-size:0.72rem; font-weight:700;">ACTIVE PRESCRIPTION</span>
                    <h4 style="font-size:1.15rem; font-weight:700; color:#0F2042; margin:6px 0 2px;">Atorvastatin 20mg</h4>
                    <div style="font-size:0.82rem; color:#64748B;">Prescribed by Dr. Rajesh Kumar (Cardiology)</div>
                </div>
                <div style="font-size:1.8rem; color:#0D9488;"><i class="bi bi-capsule"></i></div>
            </div>
            <div style="background:#F8FAFC; border-radius:10px; padding:12px; font-size:0.85rem; margin-bottom:14px; line-height:1.5;">
                <div><strong>Dosage:</strong> 1 Tablet Daily at Bedtime</div>
                <div><strong>Duration:</strong> 30 Days (Ongoing)</div>
                <div><strong>Instructions:</strong> Take after evening food with water. Monitor lipid profile after 60 days.</div>
            </div>
            <div style="font-size:0.75rem; color:#94A3B8; display:flex; justify-content:space-between;">
                <span>Issued: 10 Sep 2026</span>
                <span style="color:#0D9488; font-weight:600;"><i class="bi bi-shield-check"></i> Digitally Signed</span>
            </div>
        </div>

        <div class="card" style="border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px; background: #fff;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <div>
                    <span class="badge" style="background:#CCFBF1; color:#0F766E; font-size:0.72rem; font-weight:700;">ACTIVE PRESCRIPTION</span>
                    <h4 style="font-size:1.15rem; font-weight:700; color:#0F2042; margin:6px 0 2px;">Metoprolol Succinate 50mg</h4>
                    <div style="font-size:0.82rem; color:#64748B;">Prescribed by Dr. Rajesh Kumar (Cardiology)</div>
                </div>
                <div style="font-size:1.8rem; color:#0D9488;"><i class="bi bi-capsule"></i></div>
            </div>
            <div style="background:#F8FAFC; border-radius:10px; padding:12px; font-size:0.85rem; margin-bottom:14px; line-height:1.5;">
                <div><strong>Dosage:</strong> 1 Tablet Daily in the Morning</div>
                <div><strong>Duration:</strong> 30 Days (Ongoing)</div>
                <div><strong>Instructions:</strong> Take after breakfast. Regularly record morning resting pulse rate.</div>
            </div>
            <div style="font-size:0.75rem; color:#94A3B8; display:flex; justify-content:space-between;">
                <span>Issued: 10 Sep 2026</span>
                <span style="color:#0D9488; font-weight:600;"><i class="bi bi-shield-check"></i> Digitally Signed</span>
            </div>
        </div>
    </div>
`;
patRxHtml = patRxHtml.replace(/<div th:if="\${#lists.isEmpty\(prescriptions\)}"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, `${patRxGridHtml}</div></div>`);
writePage('patient/prescriptions/index.html', patRxHtml);

// ----------------------------------------------------
// 17. Generate Patient Consent Requests (/patient/consent-requests/index.html)
// ----------------------------------------------------
const rawPatConsent = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'patient', 'consent-requests.html'), 'utf8');
let patConsentHtml = cleanThymeleaf(rawPatConsent);

const consentContentHtml = `
    <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 2.5rem;">
        <div style="background: #fff; border-radius: 16px; border: 1px solid #E5E7EB; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <div>
                    <h4 style="font-size: 1.15rem; font-weight: 700; color: #111827; margin:0 0 4px;">Dr. Suresh Menon (Orthopedics)</h4>
                    <div style="font-size: 0.85rem; color: #6B7280;">Sree Chitra Speciality Hospital • TRV-HOSP-03</div>
                </div>
                <span class="badge" style="background: #FEF3C7; color: #92400E; padding: 4px 10px; border-radius: 9999px; font-weight: 700; font-size: 0.75rem;">ACTION REQUIRED</span>
            </div>
            <p style="font-size: 0.88rem; color: #4B5563; line-height: 1.5; margin-bottom: 1.25rem;">
                Dr. Suresh Menon has requested temporary read-only access to your previous cardiac evaluation records and medications from MediCare City Hospital for upcoming joint replacement surgical clearance.
            </p>
            <div style="display: flex; gap: 10px;">
                <button onclick="alert('Access Granted! MediCare City Hospital records shared securely with Dr. Suresh Menon for 30 days.'); this.parentElement.innerHTML='<span style=\\'color:#10B981;font-weight:700;\\'><i class=\\'bi bi-check-circle-fill\\'></i> Authorization Granted</span>';"
                        class="btn btn-sm btn-teal" style="background:#0D9488;color:#fff;border-radius:8px;padding:6px 16px;font-weight:600;">
                    <i class="bi bi-shield-check"></i> Grant Access
                </button>
                <button onclick="alert('Access Request Denied.'); this.parentElement.innerHTML='<span style=\\'color:#EF4444;font-weight:700;\\'><i class=\\'bi bi-x-circle-fill\\'></i> Authorization Denied</span>';"
                        class="btn btn-sm btn-outline" style="border-radius:8px;padding:6px 16px;">
                    Decline
                </button>
            </div>
        </div>
    </div>
`;
patConsentHtml = patConsentHtml.replace(/<div th:if="\${#lists.isEmpty\(pendingRequests\)}"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, `${consentContentHtml}</div></div>`);
writePage('patient/consent-requests/index.html', patConsentHtml);

// ----------------------------------------------------
// 18. Generate Patient Profile (/patient/profile/index.html)
// ----------------------------------------------------
const rawPatProfile = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'patient', 'profile.html'), 'utf8');
let patProfileHtml = cleanThymeleaf(rawPatProfile);

patProfileHtml = patProfileHtml
    .replace(/th:value="\${patient\.name}"/g, 'value="Arun Chandran"')
    .replace(/th:value="\${patient\.email}"/g, 'value="patient@healix.com"')
    .replace(/th:value="\${patient\.phone}"/g, 'value="9876510001"')
    .replace(/th:value="\${patient\.patientIdentifier}"/g, 'value="PAT-TRV-000001"')
    .replace(/th:text="\${patient\.patientIdentifier}"/g, 'PAT-TRV-000001')
    .replace(/th:text="\${patient\.name}"/g, 'Arun Chandran')
    .replace(/th:value="\${patient\.bloodGroup}"/g, 'value="B_POSITIVE"');
writePage('patient/profile/index.html', patProfileHtml);

// ----------------------------------------------------
// 19. Generate Patient Notifications (/patient/notifications/index.html)
// ----------------------------------------------------
const rawPatNotifs = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'patient', 'notifications.html'), 'utf8');
let patNotifsHtml = cleanThymeleaf(rawPatNotifs);

const patNotifsListHtml = `
    <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; align-items: flex-start; gap: 16px; padding: 14px 18px; border-radius: 10px; border: 1px solid #99F6E4; background: #F0FDFA;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background: #0D9488; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;">
                <i class="bi bi-calendar-check-fill"></i>
            </div>
            <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <strong style="color: #0F2042; font-size: 0.95rem;">Appointment Confirmed</strong>
                    <span style="font-size: 0.78rem; color: #94A3B8;">Today, 08:30 AM</span>
                </div>
                <p style="color: #475569; font-size: 0.88rem; margin: 0;">Your appointment with Dr. Rajesh Kumar at MediCare City Hospital is confirmed for tomorrow at 09:30 AM (Token #1).</p>
            </div>
        </div>

        <div style="display: flex; align-items: flex-start; gap: 16px; padding: 14px 18px; border-radius: 10px; border: 1px solid #E2E8F0; background: #fff;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background: #6366F1; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;">
                <i class="bi bi-file-earmark-medical-fill"></i>
            </div>
            <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <strong style="color: #0F2042; font-size: 0.95rem;">Diagnostic Lab Result Uploaded</strong>
                    <span style="font-size: 0.78rem; color: #94A3B8;">Yesterday</span>
                </div>
                <p style="color: #475569; font-size: 0.88rem; margin: 0;">Your Lipid Profile and ECG investigation reports are available in your Medical Records vault.</p>
            </div>
        </div>

        <div style="display: flex; align-items: flex-start; gap: 16px; padding: 14px 18px; border-radius: 10px; border: 1px solid #E2E8F0; background: #fff;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background: #10B981; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;">
                <i class="bi bi-capsule"></i>
            </div>
            <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <strong style="color: #0F2042; font-size: 0.95rem;">Prescription Renewal Reminder</strong>
                    <span style="font-size: 0.78rem; color: #94A3B8;">3 days ago</span>
                </div>
                <p style="color: #475569; font-size: 0.88rem; margin: 0;">Reminder: Your 30-day course of Atorvastatin 20mg is due for clinical renewal shortly.</p>
            </div>
        </div>
    </div>
`;
patNotifsHtml = patNotifsHtml.replace(/<div class="card-body"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/main>/, `<div class="card-body" style="padding: 16px 24px;">${patNotifsListHtml}</div></div></div></main>`);
writePage('patient/notifications/index.html', patNotifsHtml);

// ----------------------------------------------------
// 20. Generate Doctor Dashboard (/doctor/dashboard/index.html)
// ----------------------------------------------------
const rawDocDash = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'doctor', 'dashboard.html'), 'utf8');
let docDashHtml = cleanThymeleaf(rawDocDash);

docDashHtml = docDashHtml
    .replace("<span th:text=\"'Dr. ' + \${doctor.name}\">Doctor</span>", '<span>Dr. Rajesh Kumar</span>')
    .replace("${#temporals.format(#temporals.createNow(), 'EEEE, dd MMMM yyyy')}", new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
    .replace('th:text="${#strings.substring(doctor.name, 0, 1)}"', '')
    .replace(/<div class="stat-value" th:text="\${todayCount \?: 0}">\d+<\/div>/, '<div class="stat-value">3</div>')
    .replace(/<div class="stat-value" th:text="\${pendingCount \?: 0}">\d+<\/div>/, '<div class="stat-value">1</div>')
    .replace(/<div class="stat-value" th:text="\${confirmedCount \?: 0}">\d+<\/div>/, '<div class="stat-value">2</div>')
    .replace(/<div class="stat-value" th:text="\${completedCount \?: 0}">\d+<\/div>/, '<div class="stat-value">5</div>')
    .replace("<div style=\"font-size:1.1rem;font-weight:700;\" th:text=\"'Dr. ' + \${doctor.name}\">Dr. Name</div>", '<div style="font-size:1.1rem;font-weight:700;">Dr. Rajesh Kumar</div>')
    .replace('<div style="color:#6366F1;font-weight:600;font-size:0.875rem;" th:text="${doctor.specialization}">Specialization</div>', '<div style="color:#6366F1;font-weight:600;font-size:0.875rem;">Senior Cardiologist</div>')
    .replace('<div style="color:#9CA3AF;font-size:0.78rem;" th:text="${doctor.qualification}">Qualification</div>', '<div style="color:#9CA3AF;font-size:0.78rem;">MBBS, MD (Cardiology), DM (Cardiology)</div>')
    .replace('<span th:text="${doctor.department.name}">Department</span>', '<span>Cardiology • MediCare City Hospital</span>')
    .replace('<span th:text="${doctor.experienceYears} + \' years experience\'">Exp</span>', '<span>15 years clinical experience</span>')
    .replace('<span th:text="${doctor.availability}">Availability</span>', '<span>Mon-Sat: 9AM-1PM, 3PM-6PM (OPD Room 104)</span>')
    .replace('<span th:text="${doctor.email}">Email</span>', '<span>doctor@healix.com (Fee: ₹800.00)</span>');

const doctorTodayScheduleHtml = `
    <table class="data-table">
        <thead><tr><th>Time</th><th>Patient</th><th>Reason</th><th>Status</th></tr></thead>
        <tbody>
            <tr>
                <td style="font-weight:700;color:#6366F1;">09:30 AM</td>
                <td>
                    <div style="font-weight:600;">Arun Chandran</div>
                    <div style="font-size:0.72rem;color:#9CA3AF;">9876510001 • PAT-TRV-000001</div>
                </td>
                <td style="font-size:0.82rem;color:#4B5563;">Chest pain &amp; shortness of breath</td>
                <td><span class="badge badge-confirmed">CONFIRMED</span></td>
            </tr>
            <tr>
                <td style="font-weight:700;color:#6366F1;">11:00 AM</td>
                <td>
                    <div style="font-weight:600;">Divya Rajan</div>
                    <div style="font-size:0.72rem;color:#9CA3AF;">9876510003 • PAT-TRV-000002</div>
                </td>
                <td style="font-size:0.82rem;color:#4B5563;">Hypertension evaluation &amp; BP review</td>
                <td><span class="badge badge-confirmed">CONFIRMED</span></td>
            </tr>
            <tr>
                <td style="font-weight:700;color:#6366F1;">03:30 PM</td>
                <td>
                    <div style="font-weight:600;">Mohammed Faisal</div>
                    <div style="font-size:0.72rem;color:#9CA3AF;">9876510005 • PAT-TRV-000003</div>
                </td>
                <td style="font-size:0.82rem;color:#4B5563;">Cardiac stress test review</td>
                <td><span class="badge badge-pending">PENDING</span></td>
            </tr>
        </tbody>
    </table>
`;
docDashHtml = docDashHtml.replace(/<table class="data-table"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, `${doctorTodayScheduleHtml}</div></div>`);
writePage('doctor/dashboard/index.html', docDashHtml);

// ----------------------------------------------------
// 21. Generate Doctor Appointments (/doctor/appointments/index.html)
// ----------------------------------------------------
const rawDocAppts = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'doctor', 'appointments.html'), 'utf8');
let docApptsHtml = cleanThymeleaf(rawDocAppts);

const docApptsTableHtml = `
    <tr>
        <td style="font-size:0.78rem;color:#9CA3AF;">#1082</td>
        <td>
            <div style="display:flex;align-items:center;gap:10px;">
                <div class="avatar avatar-sm avatar-teal">A</div>
                <div>
                    <div style="font-weight:600;">Arun Chandran</div>
                    <div style="font-size:0.72rem;color:#9CA3AF;">9876510001 • PAT-TRV-000001</div>
                </div>
            </div>
        </td>
        <td style="font-weight:500;">Tomorrow</td>
        <td style="font-weight:600;color:#6366F1;">09:30 AM</td>
        <td style="font-size:0.82rem;color:#4B5563;">Chest pain and shortness of breath during exercise</td>
        <td><span class="badge badge-confirmed">CONFIRMED</span></td>
        <td>
            <div style="display:flex;gap:6px;">
                <button onclick="alert('Starting clinical consultation with Arun Chandran...');" class="btn btn-sm btn-indigo"><i class="bi bi-play-fill"></i> Consult</button>
                <button onclick="alert('Prescription created for Arun Chandran.');" class="btn btn-sm btn-outline"><i class="bi bi-capsule"></i> Rx</button>
            </div>
        </td>
    </tr>
    <tr>
        <td style="font-size:0.78rem;color:#9CA3AF;">#1084</td>
        <td>
            <div style="display:flex;align-items:center;gap:10px;">
                <div class="avatar avatar-sm avatar-teal">D</div>
                <div>
                    <div style="font-weight:600;">Divya Rajan</div>
                    <div style="font-size:0.72rem;color:#9CA3AF;">9876510003 • PAT-TRV-000002</div>
                </div>
            </div>
        </td>
        <td style="font-weight:500;">In 2 Days</td>
        <td style="font-weight:600;color:#6366F1;">11:00 AM</td>
        <td style="font-size:0.82rem;color:#4B5563;">Hypertension check and medication adjustment</td>
        <td><span class="badge badge-confirmed">CONFIRMED</span></td>
        <td>
            <div style="display:flex;gap:6px;">
                <button onclick="alert('Starting clinical consultation with Divya Rajan...');" class="btn btn-sm btn-indigo"><i class="bi bi-play-fill"></i> Consult</button>
            </div>
        </td>
    </tr>
    <tr>
        <td style="font-size:0.78rem;color:#9CA3AF;">#1085</td>
        <td>
            <div style="display:flex;align-items:center;gap:10px;">
                <div class="avatar avatar-sm avatar-teal">M</div>
                <div>
                    <div style="font-weight:600;">Mohammed Faisal</div>
                    <div style="font-size:0.72rem;color:#9CA3AF;">9876510005 • PAT-TRV-000003</div>
                </div>
            </div>
        </td>
        <td style="font-weight:500;">Today</td>
        <td style="font-weight:600;color:#6366F1;">03:30 PM</td>
        <td style="font-size:0.82rem;color:#4B5563;">Cardiac stress test review</td>
        <td><span class="badge badge-pending">PENDING</span></td>
        <td>
            <div style="display:flex;gap:6px;">
                <button onclick="alert('Appointment #1085 confirmed!'); this.parentElement.innerHTML='<span class=\\'badge badge-confirmed\\'>CONFIRMED</span>';"
                        class="btn btn-sm btn-indigo"><i class="bi bi-check-lg"></i> Confirm</button>
            </div>
        </td>
    </tr>
`;
docApptsHtml = docApptsHtml.replace(/<table class="data-table"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/main>/,
    `<table class="data-table"><thead><tr><th>#ID</th><th>Patient</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead><tbody>${docApptsTableHtml}</tbody></table></div></div></div></main>`);
writePage('doctor/appointments/index.html', docApptsHtml);

// ----------------------------------------------------
// 22. Generate Doctor Patients (/doctor/patients/index.html)
// ----------------------------------------------------
const rawDocPatients = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'doctor', 'patients.html'), 'utf8');
let docPatientsHtml = cleanThymeleaf(rawDocPatients);

const docPatientsTableHtml = `
    <tr>
        <td>
            <div style="display:flex;align-items:center;gap:10px;">
                <div class="avatar avatar-sm avatar-teal">A</div>
                <div>
                    <div style="font-weight:700;color:#0F2042;">Arun Chandran</div>
                    <div style="font-size:0.72rem;color:#9CA3AF;">PAT-TRV-000001</div>
                </div>
            </div>
        </td>
        <td>patient@healix.com</td>
        <td>9876510001</td>
        <td>MALE</td>
        <td><span class="badge" style="background:#FEE2E2;color:#991B1B;font-weight:700;">B+</span></td>
        <td>34 yrs</td>
        <td>
            <button onclick="alert('Patient Health Summary: Arun Chandran\\nAge: 34 | Blood: B+\\nActive Diagnosis: Angina Pectoris, Mild HTN\\nMedications: Atorvastatin 20mg, Metoprolol 50mg\\nEmergency Contact: Sitha Chandran (9876510002)');"
                    class="btn btn-sm btn-outline"><i class="bi bi-clipboard2-pulse"></i> Records</button>
        </td>
    </tr>
    <tr>
        <td>
            <div style="display:flex;align-items:center;gap:10px;">
                <div class="avatar avatar-sm avatar-teal">D</div>
                <div>
                    <div style="font-weight:700;color:#0F2042;">Divya Rajan</div>
                    <div style="font-size:0.72rem;color:#9CA3AF;">PAT-TRV-000002</div>
                </div>
            </div>
        </td>
        <td>divya.rajan@healix.com</td>
        <td>9876510003</td>
        <td>FEMALE</td>
        <td><span class="badge" style="background:#FEE2E2;color:#991B1B;font-weight:700;">A+</span></td>
        <td>39 yrs</td>
        <td>
            <button onclick="alert('Patient Health Summary: Divya Rajan\\nAge: 39 | Blood: A+\\nActive Diagnosis: Essential Hypertension\\nMedications: Amlodipine 5mg\\nEmergency Contact: Ramesh Rajan (9876510004)');"
                    class="btn btn-sm btn-outline"><i class="bi bi-clipboard2-pulse"></i> Records</button>
        </td>
    </tr>
    <tr>
        <td>
            <div style="display:flex;align-items:center;gap:10px;">
                <div class="avatar avatar-sm avatar-teal">M</div>
                <div>
                    <div style="font-weight:700;color:#0F2042;">Mohammed Faisal</div>
                    <div style="font-size:0.72rem;color:#9CA3AF;">PAT-TRV-000003</div>
                </div>
            </div>
        </td>
        <td>faisal@healix.com</td>
        <td>9876510005</td>
        <td>MALE</td>
        <td><span class="badge" style="background:#FEE2E2;color:#991B1B;font-weight:700;">O+</span></td>
        <td>46 yrs</td>
        <td>
            <button onclick="alert('Patient Health Summary: Mohammed Faisal\\nAge: 46 | Blood: O+\\nActive Diagnosis: Dyslipidemia\\nMedications: Rosuvastatin 10mg\\nEmergency Contact: Ayesha Faisal (9876510006)');"
                    class="btn btn-sm btn-outline"><i class="bi bi-clipboard2-pulse"></i> Records</button>
        </td>
    </tr>
`;
docPatientsHtml = docPatientsHtml.replace(/<table class="data-table"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/main>/,
    `<table class="data-table"><thead><tr><th>Patient</th><th>Contact Email</th><th>Phone</th><th>Gender</th><th>Blood Group</th><th>Age</th><th>Actions</th></tr></thead><tbody>${docPatientsTableHtml}</tbody></table></div></div></div></main>`);
writePage('doctor/patients/index.html', docPatientsHtml);

// ----------------------------------------------------
// 23. Generate Doctor Medical Records (/doctor/medical-records/index.html)
// ----------------------------------------------------
const rawDocRecords = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'doctor', 'medical-records.html'), 'utf8');
let docRecordsHtml = cleanThymeleaf(rawDocRecords);

const docRecordsTableHtml = `
    <tr>
        <td style="font-weight:700;color:#0F2042;">#MR-801</td>
        <td style="font-weight:600;">10 Sep 2026</td>
        <td style="font-weight:700;color:#0D9488;">Arun Chandran (PAT-TRV-000001)</td>
        <td>Chest pain &amp; palpitations during exertion</td>
        <td><strong>Angina Pectoris / Mild HTN</strong></td>
        <td>Atorvastatin 20mg, Metoprolol 50mg</td>
        <td>
            <button onclick="alert('Opening clinical record #MR-801 for Arun Chandran');" class="btn btn-sm btn-outline"><i class="bi bi-eye"></i> View</button>
        </td>
    </tr>
    <tr>
        <td style="font-weight:700;color:#0F2042;">#MR-792</td>
        <td style="font-weight:600;">02 Sep 2026</td>
        <td style="font-weight:700;color:#0D9488;">Mohammed Faisal (PAT-TRV-000003)</td>
        <td>Routine annual executive cardiac screening</td>
        <td><strong>Dyslipidemia (borderline elevated LDL)</strong></td>
        <td>Rosuvastatin 10mg, Dietary management</td>
        <td>
            <button onclick="alert('Opening clinical record #MR-792 for Mohammed Faisal');" class="btn btn-sm btn-outline"><i class="bi bi-eye"></i> View</button>
        </td>
    </tr>
`;
docRecordsHtml = docRecordsHtml.replace(/<tbody>[\s\S]*?<\/tbody>/, `<tbody>${docRecordsTableHtml}</tbody>`);
writePage('doctor/medical-records/index.html', docRecordsHtml);

// ----------------------------------------------------
// 24. Generate Doctor Schedule (/doctor/schedule/index.html)
// ----------------------------------------------------
const rawDocSchedule = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'doctor', 'schedule.html'), 'utf8');
let docScheduleHtml = cleanThymeleaf(rawDocSchedule);

const docScheduleTableHtml = `
    <tr>
        <td style="font-weight:700;color:#0F2042;">Tomorrow</td>
        <td style="font-weight:700;color:#6366F1;">09:30 AM</td>
        <td style="font-weight:600;">Arun Chandran</td>
        <td>Chest pain &amp; shortness of breath</td>
        <td><span class="badge badge-confirmed">CONFIRMED</span></td>
        <td><button onclick="alert('Opening OPD slot for Arun Chandran');" class="btn btn-sm btn-indigo">Start</button></td>
    </tr>
    <tr>
        <td style="font-weight:700;color:#0F2042;">Tomorrow</td>
        <td style="font-weight:700;color:#6366F1;">11:00 AM</td>
        <td style="font-weight:600;">Divya Rajan</td>
        <td>Hypertension checkup</td>
        <td><span class="badge badge-confirmed">CONFIRMED</span></td>
        <td><button onclick="alert('Opening OPD slot for Divya Rajan');" class="btn btn-sm btn-indigo">Start</button></td>
    </tr>
    <tr>
        <td style="font-weight:700;color:#0F2042;">In 2 Days</td>
        <td style="font-weight:700;color:#6366F1;">10:00 AM</td>
        <td style="font-weight:600;">K. V. Ramanathan</td>
        <td>Post-CABG routine follow-up</td>
        <td><span class="badge badge-confirmed">CONFIRMED</span></td>
        <td><button onclick="alert('Opening OPD slot for K. V. Ramanathan');" class="btn btn-sm btn-indigo">Start</button></td>
    </tr>
`;
docScheduleHtml = docScheduleHtml.replace(/<tbody>[\s\S]*?<\/tbody>/, `<tbody>${docScheduleTableHtml}</tbody>`);
writePage('doctor/schedule/index.html', docScheduleHtml);

// ----------------------------------------------------
// 25. Generate Doctor Profile (/doctor/profile/index.html)
// ----------------------------------------------------
const rawDocProfile = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'doctor', 'profile.html'), 'utf8');
let docProfileHtml = cleanThymeleaf(rawDocProfile);

docProfileHtml = docProfileHtml
    .replace("<h3 style=\"font-size: 1.35rem; font-weight: 800; color: #0F2042; margin-bottom: 4px;\" th:text=\"'Dr. ' + \${doctor.name}\">Dr. Doctor</h3>", '<h3 style="font-size: 1.35rem; font-weight: 800; color: #0F2042; margin-bottom: 4px;">Dr. Rajesh Kumar</h3>')
    .replace('<div style="color: #6366F1; font-weight: 600; font-size: 0.95rem; margin-bottom: 6px;" th:text="${doctor.specialization}">Specialization</div>', '<div style="color: #6366F1; font-weight: 600; font-size: 0.95rem; margin-bottom: 6px;">Senior Cardiologist</div>')
    .replace('<strong style="color:#1E293B;" th:text="${doctor.qualification}">MBBS, MD</strong>', '<strong style="color:#1E293B;">MBBS, MD (Cardiology), DM (Cardiology)</strong>')
    .replace(/th:value="\${doctor\.name}"/g, 'value="Rajesh Kumar"')
    .replace(/th:value="\${doctor\.email}"/g, 'value="doctor@healix.com"')
    .replace(/th:value="\${doctor\.phone}"/g, 'value="9876501234"')
    .replace(/th:value="\${doctor\.specialization}"/g, 'value="Cardiology"')
    .replace(/th:value="\${doctor\.qualification}"/g, 'value="MBBS, MD (Cardiology), DM (Cardiology)"')
    .replace(/th:value="\${doctor\.consultationFee}"/g, 'value="800.00"');
writePage('doctor/profile/index.html', docProfileHtml);

// ----------------------------------------------------
// 26. Generate Doctor Notifications (/doctor/notifications/index.html)
// ----------------------------------------------------
const rawDocNotifs = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'doctor', 'notifications.html'), 'utf8');
let docNotifsHtml = cleanThymeleaf(rawDocNotifs);

const docNotifsListHtml = `
    <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; align-items: flex-start; gap: 16px; padding: 14px 18px; border-radius: 10px; border: 1px solid #C7D2FE; background: #EEF2FF;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background: #6366F1; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;">
                <i class="bi bi-calendar2-plus-fill"></i>
            </div>
            <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <strong style="color: #0F2042; font-size: 0.95rem;">New OPD Consultation Booked</strong>
                    <span style="font-size: 0.78rem; color: #94A3B8;">15 mins ago</span>
                </div>
                <p style="color: #475569; font-size: 0.88rem; margin: 0;">Arun Chandran booked a consultation for Tomorrow at 09:30 AM (Token #1, Cardiology OPD Room 104).</p>
            </div>
        </div>

        <div style="display: flex; align-items: flex-start; gap: 16px; padding: 14px 18px; border-radius: 10px; border: 1px solid #E2E8F0; background: #fff;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background: #10B981; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;">
                <i class="bi bi-shield-check"></i>
            </div>
            <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <strong style="color: #0F2042; font-size: 0.95rem;">Clinical Consent Authorized</strong>
                    <span style="font-size: 0.78rem; color: #94A3B8;">Today, 08:00 AM</span>
                </div>
                <p style="color: #475569; font-size: 0.88rem; margin: 0;">Patient Arun Chandran authorized MediCare City Hospital cross-facility record synchronization.</p>
            </div>
        </div>
    </div>
`;
docNotifsHtml = docNotifsHtml.replace(/<div class="card-body"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/main>/, `<div class="card-body" style="padding: 16px 24px;">${docNotifsListHtml}</div></div></div></main>`);
writePage('doctor/notifications/index.html', docNotifsHtml);

// ----------------------------------------------------
// 27. Generate Hospital Admin Dashboard (/hospital-admin/dashboard/index.html)
// ----------------------------------------------------
const rawHaDash = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'hospital-admin', 'dashboard.html'), 'utf8');
let haDashHtml = cleanThymeleaf(rawHaDash);

haDashHtml = haDashHtml
    .replace('<span th:text="${hospital.hospitalName}">Hospital Name</span>', '<span>MediCare City Hospital</span>')
    .replace('<h2 style="font-size: 1.85rem; font-weight: 800; color: #111827;" th:text="${hospital.hospitalName} + \' Overview\'">Hospital Overview</h2>', '<h2 style="font-size: 1.85rem; font-weight: 800; color: #111827;">MediCare City Hospital Overview</h2>')
    .replace('<span class="hospital-badge" th:text="${hospital.hospitalCode}">TRV-HOSP-01</span>', '<span class="hospital-badge">TRV-HOSP-01</span>')
    .replace('<div style="font-size: 1.8rem; font-weight: 800; color: #3B82F6;" th:text="${patientCount}">0</div>', '<div style="font-size: 1.8rem; font-weight: 800; color: #3B82F6;">142</div>')
    .replace('<div style="font-size: 1.8rem; font-weight: 800; color: #8070A6;" th:text="${doctorCount}">0</div>', '<div style="font-size: 1.8rem; font-weight: 800; color: #8070A6;">18</div>')
    .replace('<div style="font-size: 1.8rem; font-weight: 800; color: #10B981;" th:text="${todayAppointments}">0</div>', '<div style="font-size: 1.8rem; font-weight: 800; color: #10B981;">14</div>')
    .replace('<span style="font-size: 0.78rem; color: #F59E0B; font-weight: 600;" th:text="${pendingAppointments} + \' Pending\'">0 Pending</span>', '<span style="font-size: 0.78rem; color: #F59E0B; font-weight: 600;">2 Pending</span>')
    .replace('<div style="font-size: 1.8rem; font-weight: 800; color: #059669;" th:text="\'₹\' + ${registrationRevenue}">₹0</div>', '<div style="font-size: 1.8rem; font-weight: 800; color: #059669;">₹38,500</div>');

const haRecentApptsHtml = `
    <table class="table" style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr style="border-bottom: 2px solid #E5E7EB; text-align: left; font-size: 0.85rem; color: #6B7280;">
                <th style="padding: 0.75rem;">Date &amp; Time</th>
                <th style="padding: 0.75rem;">Patient</th>
                <th style="padding: 0.75rem;">Doctor</th>
                <th style="padding: 0.75rem;">Reason</th>
                <th style="padding: 0.75rem;">Status</th>
            </tr>
        </thead>
        <tbody>
            <tr style="border-bottom: 1px solid #F3F4F6; font-size: 0.9rem;">
                <td style="padding: 0.75rem;"><strong>Today</strong><div style="font-size: 0.8rem; color: #6B7280;">09:30 AM</div></td>
                <td style="padding: 0.75rem; font-weight: 600;">Arun Chandran</td>
                <td style="padding: 0.75rem; color: #8070A6;">Dr. Rajesh Kumar (Cardio)</td>
                <td style="padding: 0.75rem; color: #4B5563;">Chest pain evaluation</td>
                <td style="padding: 0.75rem;"><span class="hospital-badge" style="background:#D1FAE5;color:#065F46;">CONFIRMED</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #F3F4F6; font-size: 0.9rem;">
                <td style="padding: 0.75rem;"><strong>Today</strong><div style="font-size: 0.8rem; color: #6B7280;">10:15 AM</div></td>
                <td style="padding: 0.75rem; font-weight: 600;">Suresh Pillai</td>
                <td style="padding: 0.75rem; color: #8070A6;">Dr. Priya Nair (Neuro)</td>
                <td style="padding: 0.75rem; color: #4B5563;">Chronic migraine consultation</td>
                <td style="padding: 0.75rem;"><span class="hospital-badge" style="background:#D1FAE5;color:#065F46;">CONFIRMED</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #F3F4F6; font-size: 0.9rem;">
                <td style="padding: 0.75rem;"><strong>Today</strong><div style="font-size: 0.8rem; color: #6B7280;">11:00 AM</div></td>
                <td style="padding: 0.75rem; font-weight: 600;">Divya Rajan</td>
                <td style="padding: 0.75rem; color: #8070A6;">Dr. Rajesh Kumar (Cardio)</td>
                <td style="padding: 0.75rem; color: #4B5563;">Blood pressure titration</td>
                <td style="padding: 0.75rem;"><span class="hospital-badge" style="background:#D1FAE5;color:#065F46;">CONFIRMED</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #F3F4F6; font-size: 0.9rem;">
                <td style="padding: 0.75rem;"><strong>Today</strong><div style="font-size: 0.8rem; color: #6B7280;">03:30 PM</div></td>
                <td style="padding: 0.75rem; font-weight: 600;">Mohammed Faisal</td>
                <td style="padding: 0.75rem; color: #8070A6;">Dr. Rajesh Kumar (Cardio)</td>
                <td style="padding: 0.75rem; color: #4B5563;">Cardiac stress test review</td>
                <td style="padding: 0.75rem;"><span class="hospital-badge" style="background:#FEF3C7;color:#92400E;">PENDING</span></td>
            </tr>
        </tbody>
    </table>
`;
haDashHtml = haDashHtml.replace(/<div th:if="\${#lists.isEmpty\(recentAppointments\)}"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, `${haRecentApptsHtml}</div></div>`);
writePage('hospital-admin/dashboard/index.html', haDashHtml);

// ----------------------------------------------------
// 28. Generate Hospital Admin Doctors (/hospital-admin/doctors/index.html)
// ----------------------------------------------------
const rawHaDocs = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'hospital-admin', 'doctors.html'), 'utf8');
let haDocsHtml = cleanThymeleaf(rawHaDocs);

haDocsHtml = haDocsHtml
    .replace('<span th:text="${hospital.hospitalName}">Hospital Name</span>', 'MediCare City Hospital')
    .replace('<span class="hospital-badge" th:text="${hospital.hospitalCode}">TRV-HOSP-01</span>', 'TRV-HOSP-01')
    .replace('<h2 style="font-size: 1.85rem; font-weight: 800; color: #111827; margin: 0;" th:text="${hospital.hospitalName} + \' Doctors\'">Doctors</h2>', '<h2 style="font-size: 1.85rem; font-weight: 800; color: #111827; margin: 0;">MediCare City Hospital Doctors</h2>')
    .replace('th:text="${doctors != null ? doctors.size() : 0} + \' Doctors\'"', '');

const haDocsTableHtml = `
    <table class="table" style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr style="border-bottom: 2px solid #E5E7EB; text-align: left; font-size: 0.85rem; color: #6B7280;">
                <th style="padding: 0.75rem;">Specialist</th>
                <th style="padding: 0.75rem;">Department</th>
                <th style="padding: 0.75rem;">Qualification</th>
                <th style="padding: 0.75rem;">OPD Room</th>
                <th style="padding: 0.75rem;">Fee</th>
                <th style="padding: 0.75rem;">Status</th>
            </tr>
        </thead>
        <tbody>
            <tr style="border-bottom: 1px solid #F3F4F6; font-size: 0.9rem;">
                <td style="padding: 0.75rem;">
                    <div style="font-weight: 700; color: #111827;">Dr. Rajesh Kumar</div>
                    <div style="font-size: 0.75rem; color: #6B7280;">DOC-TRV-001 • doctor@healix.com</div>
                </td>
                <td style="padding: 0.75rem;"><span class="hospital-badge" style="background:#EDE7F6;color:#5E35B1;">Cardiology</span></td>
                <td style="padding: 0.75rem; color: #4B5563;">MBBS, MD, DM (15 yrs exp)</td>
                <td style="padding: 0.75rem; font-weight: 600;">Room 104</td>
                <td style="padding: 0.75rem; font-weight: 700;">₹800.00</td>
                <td style="padding: 0.75rem;"><span class="hospital-badge" style="background:#D1FAE5;color:#065F46;">ACTIVE</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #F3F4F6; font-size: 0.9rem;">
                <td style="padding: 0.75rem;">
                    <div style="font-weight: 700; color: #111827;">Dr. Priya Nair</div>
                    <div style="font-size: 0.75rem; color: #6B7280;">DOC-TRV-002 • priya.nair@healix.com</div>
                </td>
                <td style="padding: 0.75rem;"><span class="hospital-badge" style="background:#EDE7F6;color:#5E35B1;">Neurology</span></td>
                <td style="padding: 0.75rem; color: #4B5563;">MBBS, MD, DM (10 yrs exp)</td>
                <td style="padding: 0.75rem; font-weight: 600;">Room 202</td>
                <td style="padding: 0.75rem; font-weight: 700;">₹900.00</td>
                <td style="padding: 0.75rem;"><span class="hospital-badge" style="background:#D1FAE5;color:#065F46;">ACTIVE</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #F3F4F6; font-size: 0.9rem;">
                <td style="padding: 0.75rem;">
                    <div style="font-weight: 700; color: #111827;">Dr. Suresh Menon</div>
                    <div style="font-size: 0.75rem; color: #6B7280;">DOC-TRV-003 • suresh.menon@healix.com</div>
                </td>
                <td style="padding: 0.75rem;"><span class="hospital-badge" style="background:#EDE7F6;color:#5E35B1;">Orthopedics</span></td>
                <td style="padding: 0.75rem; color: #4B5563;">MBBS, MS (Ortho) (12 yrs exp)</td>
                <td style="padding: 0.75rem; font-weight: 600;">Room 108</td>
                <td style="padding: 0.75rem; font-weight: 700;">₹750.00</td>
                <td style="padding: 0.75rem;"><span class="hospital-badge" style="background:#D1FAE5;color:#065F46;">ACTIVE</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #F3F4F6; font-size: 0.9rem;">
                <td style="padding: 0.75rem;">
                    <div style="font-weight: 700; color: #111827;">Dr. Anita Sen</div>
                    <div style="font-size: 0.75rem; color: #6B7280;">DOC-TRV-008 • anita.sen@healix.com</div>
                </td>
                <td style="padding: 0.75rem;"><span class="hospital-badge" style="background:#EDE7F6;color:#5E35B1;">General Medicine</span></td>
                <td style="padding: 0.75rem; color: #4B5563;">MBBS, MD (General Medicine) (9 yrs exp)</td>
                <td style="padding: 0.75rem; font-weight: 600;">Room 101</td>
                <td style="padding: 0.75rem; font-weight: 700;">₹500.00</td>
                <td style="padding: 0.75rem;"><span class="hospital-badge" style="background:#D1FAE5;color:#065F46;">ACTIVE</span></td>
            </tr>
        </tbody>
    </table>
`;
haDocsHtml = haDocsHtml.replace(/<div th:if="\${#lists.isEmpty\(doctors\)}"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, `${haDocsTableHtml}</div></div>`);
writePage('hospital-admin/doctors/index.html', haDocsHtml);

// ----------------------------------------------------
// 29. Generate Hospital Admin Departments (/hospital-admin/departments/index.html)
// ----------------------------------------------------
const rawHaDepts = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'hospital-admin', 'departments.html'), 'utf8');
let haDeptsHtml = cleanThymeleaf(rawHaDepts);

haDeptsHtml = haDeptsHtml
    .replace('<span th:text="${hospital.hospitalName}">Hospital Name</span>', 'MediCare City Hospital')
    .replace('<span class="hospital-badge" th:text="${hospital.hospitalCode}">TRV-HOSP-01</span>', 'TRV-HOSP-01');

const haDeptsCardsHtml = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
        <div style="background: #fff; border-radius: 16px; border: 1px solid #E5E7EB; padding: 1.5rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
                <div style="width:44px; height:44px; border-radius:12px; background:#EDE7F6; color:#5E35B1; display:flex; align-items:center; justify-content:center; font-size:1.4rem;">
                    <i class="bi bi-heart-pulse"></i>
                </div>
                <span class="hospital-badge" style="background:#D1FAE5; color:#065F46;">ACTIVE</span>
            </div>
            <h3 style="font-size:1.2rem; font-weight:700; color:#111827; margin:0 0 6px;">Cardiology</h3>
            <p style="font-size:0.85rem; color:#6B7280; line-height:1.4; margin-bottom:1rem;">
                Advanced cardiovascular interventions, coronary care, and heart rhythm diagnostics.
            </p>
            <div style="border-top:1px solid #F3F4F6; padding-top:0.75rem; font-size:0.8rem; color:#4B5563; display:flex; justify-content:space-between;">
                <span>Affiliated Specialists:</span>
                <strong>4 Doctors</strong>
            </div>
        </div>

        <div style="background: #fff; border-radius: 16px; border: 1px solid #E5E7EB; padding: 1.5rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
                <div style="width:44px; height:44px; border-radius:12px; background:#EDE7F6; color:#5E35B1; display:flex; align-items:center; justify-content:center; font-size:1.4rem;">
                    <i class="bi bi-activity"></i>
                </div>
                <span class="hospital-badge" style="background:#D1FAE5; color:#065F46;">ACTIVE</span>
            </div>
            <h3 style="font-size:1.2rem; font-weight:700; color:#111827; margin:0 0 6px;">Neurology</h3>
            <p style="font-size:0.85rem; color:#6B7280; line-height:1.4; margin-bottom:1rem;">
                Expert neurosciences center dealing with stroke rehabilitation, epilepsy, and brain disorders.
            </p>
            <div style="border-top:1px solid #F3F4F6; padding-top:0.75rem; font-size:0.8rem; color:#4B5563; display:flex; justify-content:space-between;">
                <span>Affiliated Specialists:</span>
                <strong>3 Doctors</strong>
            </div>
        </div>

        <div style="background: #fff; border-radius: 16px; border: 1px solid #E5E7EB; padding: 1.5rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
                <div style="width:44px; height:44px; border-radius:12px; background:#EDE7F6; color:#5E35B1; display:flex; align-items:center; justify-content:center; font-size:1.4rem;">
                    <i class="bi bi-bandaid"></i>
                </div>
                <span class="hospital-badge" style="background:#D1FAE5; color:#065F46;">ACTIVE</span>
            </div>
            <h3 style="font-size:1.2rem; font-weight:700; color:#111827; margin:0 0 6px;">Orthopedics</h3>
            <p style="font-size:0.85rem; color:#6B7280; line-height:1.4; margin-bottom:1rem;">
                Joint reconstruction, sports trauma, spinal therapy, and robotic joint replacement.
            </p>
            <div style="border-top:1px solid #F3F4F6; padding-top:0.75rem; font-size:0.8rem; color:#4B5563; display:flex; justify-content:space-between;">
                <span>Affiliated Specialists:</span>
                <strong>4 Doctors</strong>
            </div>
        </div>

        <div style="background: #fff; border-radius: 16px; border: 1px solid #E5E7EB; padding: 1.5rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
                <div style="width:44px; height:44px; border-radius:12px; background:#EDE7F6; color:#5E35B1; display:flex; align-items:center; justify-content:center; font-size:1.4rem;">
                    <i class="bi bi-hospital"></i>
                </div>
                <span class="hospital-badge" style="background:#D1FAE5; color:#065F46;">ACTIVE</span>
            </div>
            <h3 style="font-size:1.2rem; font-weight:700; color:#111827; margin:0 0 6px;">General Medicine</h3>
            <p style="font-size:0.85rem; color:#6B7280; line-height:1.4; margin-bottom:1rem;">
                Primary healthcare triage, chronic illness management, and preventative health checks.
            </p>
            <div style="border-top:1px solid #F3F4F6; padding-top:0.75rem; font-size:0.8rem; color:#4B5563; display:flex; justify-content:space-between;">
                <span>Affiliated Specialists:</span>
                <strong>7 Doctors</strong>
            </div>
        </div>
    </div>
`;
haDeptsHtml = haDeptsHtml.replace(/<div th:if="\${#lists.isEmpty\(departments\)}"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, `${haDeptsCardsHtml}</div></div>`);
writePage('hospital-admin/departments/index.html', haDeptsHtml);

// ----------------------------------------------------
// 30. Generate Hospital Admin Patients (/hospital-admin/patients/index.html)
// ----------------------------------------------------
const rawHaPatients = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'hospital-admin', 'patients.html'), 'utf8');
let haPatientsHtml = cleanThymeleaf(rawHaPatients);

haPatientsHtml = haPatientsHtml
    .replace('<span th:text="${hospital.hospitalName}">Hospital Name</span>', 'MediCare City Hospital')
    .replace('<span class="hospital-badge" th:text="${hospital.hospitalCode}">TRV-HOSP-01</span>', 'TRV-HOSP-01');

const haPatientsTableHtml = `
    <table class="table" style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr style="border-bottom: 2px solid #E5E7EB; text-align: left; font-size: 0.85rem; color: #6B7280;">
                <th style="padding: 0.75rem;">Hospital Reg #</th>
                <th style="padding: 0.75rem;">Patient Name</th>
                <th style="padding: 0.75rem;">Contact</th>
                <th style="padding: 0.75rem;">Registered On</th>
                <th style="padding: 0.75rem;">Receipt</th>
                <th style="padding: 0.75rem;">Status</th>
            </tr>
        </thead>
        <tbody>
            <tr style="border-bottom: 1px solid #F3F4F6; font-size: 0.9rem;">
                <td style="padding: 0.75rem; font-weight: 700; color: #0F2042;">TRV-HOSP-01-P-0001</td>
                <td style="padding: 0.75rem; font-weight: 600;">Arun Chandran</td>
                <td style="padding: 0.75rem; color: #4B5563;">9876510001</td>
                <td style="padding: 0.75rem;">30 days ago</td>
                <td style="padding: 0.75rem;"><span style="color:#6366F1; font-weight:600;">REC-TRV-REG001</span></td>
                <td style="padding: 0.75rem;"><span class="hospital-badge" style="background:#D1FAE5;color:#065F46;">ACTIVE</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #F3F4F6; font-size: 0.9rem;">
                <td style="padding: 0.75rem; font-weight: 700; color: #0F2042;">TRV-HOSP-01-P-0002</td>
                <td style="padding: 0.75rem; font-weight: 600;">Divya Rajan</td>
                <td style="padding: 0.75rem; color: #4B5563;">9876510003</td>
                <td style="padding: 0.75rem;">20 days ago</td>
                <td style="padding: 0.75rem;"><span style="color:#6366F1; font-weight:600;">REC-TRV-REG003</span></td>
                <td style="padding: 0.75rem;"><span class="hospital-badge" style="background:#D1FAE5;color:#065F46;">ACTIVE</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #F3F4F6; font-size: 0.9rem;">
                <td style="padding: 0.75rem; font-weight: 700; color: #0F2042;">TRV-HOSP-01-P-0003</td>
                <td style="padding: 0.75rem; font-weight: 600;">Mohammed Faisal</td>
                <td style="padding: 0.75rem; color: #4B5563;">9876510005</td>
                <td style="padding: 0.75rem;">15 days ago</td>
                <td style="padding: 0.75rem;"><span style="color:#6366F1; font-weight:600;">REC-TRV-REG005</span></td>
                <td style="padding: 0.75rem;"><span class="hospital-badge" style="background:#D1FAE5;color:#065F46;">ACTIVE</span></td>
            </tr>
        </tbody>
    </table>
`;
haPatientsHtml = haPatientsHtml.replace(/<div th:if="\${#lists.isEmpty\(hospitalPatients\)}"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, `${haPatientsTableHtml}</div></div>`);
writePage('hospital-admin/patients/index.html', haPatientsHtml);

// ----------------------------------------------------
// 31. Generate Hospital Admin Payments (/hospital-admin/payments/index.html)
// ----------------------------------------------------
const rawHaPayments = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'hospital-admin', 'payments.html'), 'utf8');
let haPaymentsHtml = cleanThymeleaf(rawHaPayments);

haPaymentsHtml = haPaymentsHtml
    .replace('<span th:text="${hospital.hospitalName}">Hospital Name</span>', 'MediCare City Hospital')
    .replace('<span class="hospital-badge" th:text="${hospital.hospitalCode}">TRV-HOSP-01</span>', 'TRV-HOSP-01')
    .replace(/th:text="'₹' \+ \${totalRevenue \?: 0}"/g, '')
    .replace(/<div class="stat-number">.*?<\/div>/, '<div class="stat-number">₹38,500.00</div>');

const haPaymentsTableHtml = `
    <table class="table" style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr style="border-bottom: 2px solid #E5E7EB; text-align: left; font-size: 0.85rem; color: #6B7280;">
                <th style="padding: 0.75rem;">Receipt #</th>
                <th style="padding: 0.75rem;">Patient</th>
                <th style="padding: 0.75rem;">Date</th>
                <th style="padding: 0.75rem;">Purpose</th>
                <th style="padding: 0.75rem;">Amount</th>
                <th style="padding: 0.75rem;">Status</th>
            </tr>
        </thead>
        <tbody>
            <tr style="border-bottom: 1px solid #F3F4F6; font-size: 0.9rem;">
                <td style="padding: 0.75rem; font-weight: 700; color: #0F2042;">REC-TRV-REG001</td>
                <td style="padding: 0.75rem; font-weight: 600;">Arun Chandran</td>
                <td style="padding: 0.75rem;">Today</td>
                <td style="padding: 0.75rem; color: #4B5563;">OPD Registration &amp; Hospital Token</td>
                <td style="padding: 0.75rem; font-weight: 700; color: #059669;">₹250.00</td>
                <td style="padding: 0.75rem;"><span class="hospital-badge" style="background:#D1FAE5;color:#065F46;">PAID</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #F3F4F6; font-size: 0.9rem;">
                <td style="padding: 0.75rem; font-weight: 700; color: #0F2042;">REC-TRV-REG003</td>
                <td style="padding: 0.75rem; font-weight: 600;">Divya Rajan</td>
                <td style="padding: 0.75rem;">Yesterday</td>
                <td style="padding: 0.75rem; color: #4B5563;">OPD Registration &amp; Hospital Token</td>
                <td style="padding: 0.75rem; font-weight: 700; color: #059669;">₹250.00</td>
                <td style="padding: 0.75rem;"><span class="hospital-badge" style="background:#D1FAE5;color:#065F46;">PAID</span></td>
            </tr>
        </tbody>
    </table>
`;
haPaymentsHtml = haPaymentsHtml.replace(/<div th:if="\${#lists.isEmpty\(payments\)}"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, `${haPaymentsTableHtml}</div></div>`);
writePage('hospital-admin/payments/index.html', haPaymentsHtml);

// ----------------------------------------------------
// 32. Generate Super Admin Dashboard (/super-admin/dashboard/index.html)
// ----------------------------------------------------
const rawSaDash = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'super-admin', 'dashboard.html'), 'utf8');
let saDashHtml = cleanThymeleaf(rawSaDash);

const saHospitalRowsHtml = `
    <tr style="border-bottom: 1px solid #F3F4F6; font-size: 0.9rem;">
        <td style="padding: 0.75rem;"><span class="hospital-badge" style="background:#EDE7F6;color:#5E35B1;font-weight:700;">TRV-HOSP-01</span></td>
        <td style="padding: 0.75rem; font-weight: 700; color: #111827;">MediCare City Hospital</td>
        <td style="padding: 0.75rem; color: #6B7280;">MG Road, Statue, Trivandrum</td>
        <td style="padding: 0.75rem; font-weight: 700;">₹250.00</td>
        <td style="padding: 0.75rem;">
            <span style="font-size: 0.78rem; font-weight: 700; color: #10B981; background: #D1FAE5; padding: 3px 10px; border-radius: 9999px;">ACTIVE</span>
        </td>
        <td style="padding: 0.75rem;">
            <a href="/hospital-admin/dashboard" class="btn" style="border: 1px solid #D1D5DB; padding: 4px 12px; border-radius: 6px; font-size: 0.8rem; font-weight:600;">
                <i class="bi bi-box-arrow-in-right"></i> Manage Scope
            </a>
        </td>
    </tr>
    <tr style="border-bottom: 1px solid #F3F4F6; font-size: 0.9rem;">
        <td style="padding: 0.75rem;"><span class="hospital-badge" style="background:#EDE7F6;color:#5E35B1;font-weight:700;">TRV-HOSP-02</span></td>
        <td style="padding: 0.75rem; font-weight: 700; color: #111827;">Trivandrum Medical Trust</td>
        <td style="padding: 0.75rem; color: #6B7280;">Pattom Palace PO, Trivandrum</td>
        <td style="padding: 0.75rem; font-weight: 700;">₹200.00</td>
        <td style="padding: 0.75rem;">
            <span style="font-size: 0.78rem; font-weight: 700; color: #10B981; background: #D1FAE5; padding: 3px 10px; border-radius: 9999px;">ACTIVE</span>
        </td>
        <td style="padding: 0.75rem;">
            <a href="/hospital-admin/dashboard" class="btn" style="border: 1px solid #D1D5DB; padding: 4px 12px; border-radius: 6px; font-size: 0.8rem; font-weight:600;">
                <i class="bi bi-box-arrow-in-right"></i> Manage Scope
            </a>
        </td>
    </tr>
    <tr style="border-bottom: 1px solid #F3F4F6; font-size: 0.9rem;">
        <td style="padding: 0.75rem;"><span class="hospital-badge" style="background:#EDE7F6;color:#5E35B1;font-weight:700;">TRV-HOSP-03</span></td>
        <td style="padding: 0.75rem; font-weight: 700; color: #111827;">Sree Chitra Speciality Hospital</td>
        <td style="padding: 0.75rem; color: #6B7280;">Kumarapuram, Trivandrum</td>
        <td style="padding: 0.75rem; font-weight: 700;">₹300.00</td>
        <td style="padding: 0.75rem;">
            <span style="font-size: 0.78rem; font-weight: 700; color: #10B981; background: #D1FAE5; padding: 3px 10px; border-radius: 9999px;">ACTIVE</span>
        </td>
        <td style="padding: 0.75rem;">
            <a href="/hospital-admin/dashboard" class="btn" style="border: 1px solid #D1D5DB; padding: 4px 12px; border-radius: 6px; font-size: 0.8rem; font-weight:600;">
                <i class="bi bi-box-arrow-in-right"></i> Manage Scope
            </a>
        </td>
    </tr>
`;
saDashHtml = saDashHtml.replace(/<tbody>[\s\S]*?<\/tbody>/, `<tbody>${saHospitalRowsHtml}</tbody>`);
writePage('super-admin/dashboard/index.html', saDashHtml);

// ----------------------------------------------------
// 33. Generate Super Admin Manage Hospitals (/super-admin/hospitals/index.html)
// ----------------------------------------------------
const rawSaHosps = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'super-admin', 'hospitals.html'), 'utf8');
let saHospsHtml = cleanThymeleaf(rawSaHosps);

const saHospsScript = `
<script>
    document.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        const code = document.querySelector('input[placeholder="e.g. TRV-HOSP-04"]').value;
        const name = document.querySelector('input[placeholder="e.g. Ananthapuri Hospital"]').value;
        alert('Hospital institution ' + name + ' (' + code + ') registered successfully in HealiX network!');
        window.location.href = '/super-admin/dashboard';
    });
</script>
`;
saHospsHtml = saHospsHtml.replace('</body>', `${saHospsScript}</body>`);
writePage('super-admin/hospitals/index.html', saHospsHtml);

// ----------------------------------------------------
// 34. Create Enhanced 404.html fallback
// ----------------------------------------------------
const notFoundHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>HealiX Platform - Page Not Found</title>
    <link rel="stylesheet" href="/css/main.css"/>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"/>
</head>
<body style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#F8FAFC;font-family:'Inter',sans-serif;margin:0;padding:20px;">
    <div style="background:#fff;padding:48px 40px;border-radius:24px;text-align:center;box-shadow:0 12px 35px rgba(0,0,0,0.06);max-width:520px;border:1px solid #E2E8F0;">
        <div style="width:72px;height:72px;background:#EDE7F6;color:#5E35B1;border-radius:20px;margin:0 auto 1.5rem;display:flex;align-items:center;justify-content:center;font-size:2.2rem;">
            <i class="bi bi-hospital"></i>
        </div>
        <h1 style="font-size:2rem;color:#0F2042;font-weight:800;margin-bottom:8px;">HealiX Platform</h1>
        <p style="color:#64748B;font-size:0.95rem;margin-bottom:28px;line-height:1.5;">
            The requested page is available on our clinical network portals. Select your destination below:
        </p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:20px;">
            <a href="/" class="ref-pill-btn" style="padding:10px 24px;text-decoration:none;">Go to Home</a>
            <a href="/login" class="btn" style="border:1px solid #CBD5E1;padding:10px 24px;border-radius:9999px;text-decoration:none;color:#1E293B;font-weight:600;">Sign In</a>
            <a href="/patient/ai-assistant" class="btn" style="border:1px solid #DDD6FE;background:#F5F3FF;color:#6D28D9;padding:10px 20px;border-radius:9999px;text-decoration:none;font-weight:600;">
                <i class="bi bi-robot"></i> AI Triage
            </a>
        </div>
    </div>
</body>
</html>`;
writePage('404.html', notFoundHtml);

console.log('✅ All 31 static pages and portals generated successfully!');
