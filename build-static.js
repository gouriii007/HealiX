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
// 6. Generate Login Page (/login/index.html) with Role Details & 1-Click Access
// ----------------------------------------------------
const rawLogin = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'login.html'), 'utf8');
let loginHtml = cleanThymeleaf(rawLogin);

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

loginHtml = loginHtml.replace(/<!-- Demo Credentials -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
    `${richRoleDetailsHtml}</div></div>`);

const loginScript = `
<script src="/js/clinical-store.js"></script>
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
<script src="/js/clinical-store.js"></script>
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
<script src="/js/clinical-store.js"></script>
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
    .replace(/<div class="stat-number" th:text="\$\{[^}]+\}">\d+<\/div>/g, '<div class="stat-number" id="patDashApptCount">2</div>')
    .replace(/<a href="\/logout"/g, '<a href="/logout" onclick="localStorage.removeItem(\'healix_user\')"');

const patientDashScript = `
<script src="/js/clinical-store.js"></script>
<script>
    function renderPatientDashboard() {
        const user = JSON.parse(localStorage.getItem('healix_user') || '{"name":"Arun Chandran","email":"patient@healix.com","role":"PATIENT"}');
        document.querySelectorAll('.js-user-name').forEach(el => el.innerText = user.name || 'Arun Chandran');

        const appts = HealixStore.getAppointments().filter(a => a.patientName === 'Arun Chandran' || a.patientId === 'PAT-TRV-000001');
        const tbody = document.querySelector('table tbody');
        if (tbody && appts.length > 0) {
            tbody.innerHTML = appts.map(a => {
                const statusBadge = a.status === 'CONFIRMED'
                    ? '<span class="badge badge-confirmed">CONFIRMED</span>'
                    : (a.status === 'COMPLETED' ? '<span class="badge badge-completed">COMPLETED</span>' : '<span class="badge badge-pending">PENDING</span>');
                return \`
                    <tr>
                        <td style="font-weight:600;color:#0F2042;">\${a.date}</td>
                        <td style="font-weight:600;color:#0D9488;">\${a.time}</td>
                        <td>
                            <div style="font-weight:600;">\${a.doctorName}</div>
                            <div style="font-size:0.75rem;color:#64748B;">\${a.hospitalName}</div>
                        </td>
                        <td>\${statusBadge}</td>
                        <td><a href="/patient/appointments" class="btn btn-sm btn-outline">View Details</a></td>
                    </tr>
                \`;
            }).join('');
        }
    }
    renderPatientDashboard();
</script>
`;
patientDashHtml = patientDashHtml.replace('</body>', `${patientDashScript}</body>`);
writePage('patient/dashboard/index.html', patientDashHtml);

// ----------------------------------------------------
// 11. Generate Patient Book Appointment (/patient/book-appointment/index.html)
// ----------------------------------------------------
const rawBook = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'patient', 'book-appointment.html'), 'utf8');
let bookHtml = cleanThymeleaf(rawBook);

const bookScript = `
<script src="/js/clinical-store.js"></script>
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
        const reason = document.querySelector('textarea') ? document.querySelector('textarea').value : 'Regular consultation';

        // Add to persistent appointments store
        const appts = HealixStore.getAppointments();
        const newApptId = Math.floor(1090 + Math.random() * 500);
        appts.unshift({
            id: newApptId,
            patientName: "Arun Chandran",
            patientId: "PAT-TRV-000001",
            patientPhone: "9876510001",
            doctorName: doctor.split('(')[0].trim(),
            hospitalName: hospital,
            date: date,
            time: time,
            reason: reason,
            status: "PENDING",
            fee: 800
        });
        HealixStore.saveAppointments(appts);

        alert('Appointment successfully booked with ' + doctor + ' at ' + hospital + ' on ' + date + ' (' + time + ')! Digital OPD registration token generated: #APT-' + newApptId);
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

const patientApptsTableBlock = `
    <div class="table-container">
        <table class="data-table">
            <thead>
                <tr>
                    <th>#ID</th>
                    <th>Doctor &amp; Specialty</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody id="patientApptsTbody"></tbody>
        </table>
        <div id="patientApptsEmpty" class="empty-state" style="display:none; padding:48px 24px;">
            <div class="empty-state-icon" style="font-size:3rem; color:#9CA3AF;"><i class="bi bi-calendar-x"></i></div>
            <h3 style="font-size:1.1rem; color:#374151; margin-top:12px;">No appointments found</h3>
            <p style="color:#6B7280; font-size:0.9rem;">You haven't scheduled any doctor appointments yet.</p>
            <a href="/patient/book-appointment" class="btn btn-teal btn-sm mt-3"><i class="bi bi-calendar-plus"></i> Book First Appointment</a>
        </div>
    </div>
`;
apptsHtml = apptsHtml.replace(/<div class="table-container">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/main>/, `${patientApptsTableBlock}</div></div></main>`);

const patientApptsScript = `
<script src="/js/clinical-store.js"></script>
<script>
    function renderPatientAppointments() {
        const appts = HealixStore.getAppointments().filter(a => a.patientName === 'Arun Chandran' || a.patientId === 'PAT-TRV-000001');
        const tbody = document.getElementById('patientApptsTbody');
        const empty = document.getElementById('patientApptsEmpty');
        if (!appts || appts.length === 0) {
            if (tbody) tbody.innerHTML = '';
            if (empty) empty.style.display = 'block';
            return;
        }
        if (empty) empty.style.display = 'none';

        if (tbody) {
            tbody.innerHTML = appts.map(a => {
                const statusBadge = a.status === 'CONFIRMED'
                    ? '<span class="badge badge-confirmed">CONFIRMED</span>'
                    : (a.status === 'COMPLETED' ? '<span class="badge badge-completed">COMPLETED</span>' : '<span class="badge badge-pending">PENDING</span>');
                
                const actionBtn = a.status === 'CONFIRMED'
                    ? \`<button onclick="alert('Digital Registration Slip #REC-TRV-REG001\\\\nPatient: \${a.patientName}\\\\nHospital: \${a.hospitalName}\\\\nDoctor: \${a.doctorName}\\\\nStatus: CONFIRMED');" class="btn btn-sm btn-outline"><i class="bi bi-receipt"></i> Slip</button>\`
                    : (a.status === 'COMPLETED'
                        ? \`<a href="/patient/medical-records" class="btn btn-sm btn-outline"><i class="bi bi-file-earmark-medical"></i> View Record</a>\`
                        : \`<button onclick="alert('Appointment is pending doctor confirmation. Once confirmed by Dr. Rajesh Kumar, status updates immediately.');" class="btn btn-sm btn-outline"><i class="bi bi-clock-history"></i> Pending</button>\`);

                return \`
                    <tr>
                        <td style="font-weight:700;color:#0F2042;">#APT-\${a.id}</td>
                        <td>
                            <div style="font-weight:700;color:#0F2042;">\${a.doctorName}</div>
                            <div style="font-size:0.75rem;color:#64748B;">\${a.hospitalName}</div>
                        </td>
                        <td style="font-weight:600;">\${a.date}</td>
                        <td style="font-weight:700;color:#0D9488;">\${a.time}</td>
                        <td style="font-size:0.85rem;color:#475569;">\${a.reason}</td>
                        <td>\${statusBadge}</td>
                        <td>\${actionBtn}</td>
                    </tr>
                \`;
            }).join('');
        }
    }
    renderPatientAppointments();
</script>
`;
apptsHtml = apptsHtml.replace('</body>', `${patientApptsScript}</body>`);
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

const patientRecordsTableBlock = `
    <div class="table-container">
        <table class="data-table">
            <thead>
                <tr>
                    <th>Record #</th>
                    <th>Date</th>
                    <th>Attending Doctor</th>
                    <th>Diagnosis</th>
                    <th>Treatment Plan &amp; Advice</th>
                    <th>Prescriptions</th>
                    <th>Follow-up</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody id="patientRecordsTbody"></tbody>
        </table>
        <div id="patientRecordsEmpty" class="empty-state" style="display:none; padding:48px 24px;">
            <div class="empty-state-icon" style="font-size:3rem; color:#9CA3AF;"><i class="bi bi-clipboard2-x"></i></div>
            <h3 style="font-size:1.1rem; color:#374151; margin-top:12px;">No medical records yet</h3>
            <p style="color:#6B7280; font-size:0.9rem;">Once your doctors complete consultations, detailed diagnoses and treatments will be logged here.</p>
        </div>
    </div>
`;
patRecordsHtml = patRecordsHtml.replace(/<div class="table-container">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/main>/, `${patientRecordsTableBlock}</div></div></main>`);

const patientRecordsScript = `
<!-- Patient Record View Modal -->
<div id="patientRecordModal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15,23,42,0.65);z-index:99999;align-items:center;justify-content:center;padding:20px;">
    <div style="background:#fff;border-radius:18px;max-width:620px;width:100%;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);overflow:hidden;border:1px solid #E2E8F0;">
        <div style="background:linear-gradient(135deg,#0D9488,#0F766E);color:#fff;padding:18px 24px;display:flex;justify-content:space-between;align-items:center;">
            <div>
                <h3 style="margin:0;font-size:1.18rem;font-weight:700;"><i class="bi bi-file-earmark-medical"></i> Medical Consultation Record</h3>
                <span id="pModalRecordId" style="font-size:0.8rem;color:#CCFBF1;">#MR-801</span>
            </div>
            <button onclick="document.getElementById('patientRecordModal').style.display='none'" style="background:none;border:none;color:#fff;font-size:1.6rem;cursor:pointer;">&times;</button>
        </div>
        <div style="padding:22px;display:flex;flex-direction:column;gap:14px;font-size:0.9rem;">
            <div><strong style="color:#64748B;font-size:0.78rem;text-transform:uppercase;">Attending Doctor</strong><div id="pModalDoc" style="font-weight:700;color:#0F2042;font-size:1.05rem;"></div></div>
            <div><strong style="color:#64748B;font-size:0.78rem;text-transform:uppercase;">Clinical Diagnosis</strong><div id="pModalDiag" style="font-weight:700;color:#0D9488;font-size:1.1rem;"></div></div>
            <div><strong style="color:#64748B;font-size:0.78rem;text-transform:uppercase;">Reported Symptoms</strong><div id="pModalSymptoms" style="color:#475569;"></div></div>
            <div><strong style="color:#64748B;font-size:0.78rem;text-transform:uppercase;">Treatment Plan &amp; Advice</strong><div id="pModalTreatment" style="color:#334155;background:#F8FAFC;padding:12px;border-radius:8px;border:1px solid #E2E8F0;line-height:1.5;"></div></div>
            <div><strong style="color:#64748B;font-size:0.78rem;text-transform:uppercase;">Doctor's Notes &amp; Follow-Up</strong><div id="pModalNotes" style="color:#475569;"></div></div>
            <div style="text-align:right;margin-top:10px;display:flex;justify-content:flex-end;gap:10px;">
                <a href="/patient/prescriptions" class="btn btn-teal btn-sm" style="font-weight:600;"><i class="bi bi-capsule"></i> View Prescriptions</a>
                <button onclick="document.getElementById('patientRecordModal').style.display='none'" class="btn btn-outline btn-sm">Close</button>
            </div>
        </div>
    </div>
</div>

<script src="/js/clinical-store.js"></script>
<script>
    function renderPatientRecords() {
        const records = HealixStore.getMedicalRecords().filter(r => r.patientName === 'Arun Chandran' || r.patientId === 'PAT-TRV-000001');
        const tbody = document.getElementById('patientRecordsTbody');
        const empty = document.getElementById('patientRecordsEmpty');
        const countSpan = document.querySelector('.card-header h5 span');
        if (countSpan) countSpan.innerText = '(' + records.length + ' Records)';

        if (!records || records.length === 0) {
            if (tbody) tbody.innerHTML = '';
            if (empty) empty.style.display = 'block';
            return;
        }
        if (empty) empty.style.display = 'none';

        if (tbody) {
            tbody.innerHTML = records.map(r => {
                const rxCount = HealixStore.getPrescriptions().filter(p => p.patientName === 'Arun Chandran' || p.patientId === 'PAT-TRV-000001').length;
                return \`
                    <tr>
                        <td style="font-weight:700;color:#0F2042;">#\${r.id}</td>
                        <td style="font-weight:600;">\${r.date}</td>
                        <td>
                            <div style="font-weight:700;color:#0F2042;">\${r.doctorName}</div>
                            <div style="font-size:0.75rem;color:#64748B;">\${r.hospitalName}</div>
                        </td>
                        <td><strong style="color:#0D9488;">\${r.diagnosis}</strong></td>
                        <td style="font-size:0.85rem;color:#475569;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">\${r.treatment || 'Consultation advice provided'}</td>
                        <td><span class="badge" style="background:#CCFBF1;color:#0F766E;font-weight:700;">\${rxCount} Meds</span></td>
                        <td style="font-size:0.85rem;color:#475569;">\${r.followUpDate || 'None'}</td>
                        <td>
                            <button onclick="openPatientRecordModal('\${r.id}')" class="btn btn-sm btn-teal"><i class="bi bi-eye"></i> View</button>
                        </td>
                    </tr>
                \`;
            }).join('');
        }
    }

    function openPatientRecordModal(recordId) {
        const r = HealixStore.getMedicalRecords().find(item => item.id === recordId);
        if (!r) return;
        document.getElementById('pModalRecordId').innerText = '#' + r.id + ' • ' + r.date;
        document.getElementById('pModalDoc').innerText = r.doctorName + ' (' + r.hospitalName + ')';
        document.getElementById('pModalDiag').innerText = r.diagnosis;
        document.getElementById('pModalSymptoms').innerText = r.symptoms || 'None recorded';
        document.getElementById('pModalTreatment').innerText = r.treatment || 'Routine monitoring & lifestyle advice.';
        document.getElementById('pModalNotes').innerText = (r.notes || 'None') + (r.followUpDate ? ' (Follow-up: ' + r.followUpDate + ')' : '');
        document.getElementById('patientRecordModal').style.display = 'flex';
    }

    renderPatientRecords();
</script>
`;
patRecordsHtml = patRecordsHtml.replace('</body>', `${patientRecordsScript}</body>`);
writePage('patient/medical-records/index.html', patRecordsHtml);

// ----------------------------------------------------
// 16. Generate Patient Prescriptions (/patient/prescriptions/index.html)
// ----------------------------------------------------
const rawPatRx = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'patient', 'prescriptions.html'), 'utf8');
let patRxHtml = cleanThymeleaf(rawPatRx);

const patPrescriptionContentBlock = `
    <div class="card-body" style="padding: 24px;">
        <div id="patientPrescriptionsGrid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;"></div>
        <div id="patientPrescriptionsEmpty" class="empty-state" style="display:none; padding:48px 24px;">
            <div class="empty-state-icon" style="font-size:3rem; color:#9CA3AF;"><i class="bi bi-capsule"></i></div>
            <h3 style="font-size:1.1rem; color:#374151; margin-top:12px;">No prescriptions on file</h3>
            <p style="color:#6B7280; font-size:0.9rem;">Your doctor will prescribe medications digitally during consultations.</p>
        </div>
    </div>
`;
patRxHtml = patRxHtml.replace(/<div class="card-body"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/main>/, `${patPrescriptionContentBlock}</div></div></main>`);

const patientPrescriptionsScript = `
<script src="/js/clinical-store.js"></script>
<script>
    function renderPatientPrescriptions() {
        const list = HealixStore.getPrescriptions().filter(p => p.patientName === 'Arun Chandran' || p.patientId === 'PAT-TRV-000001');
        const grid = document.getElementById('patientPrescriptionsGrid');
        const empty = document.getElementById('patientPrescriptionsEmpty');
        const countSpan = document.querySelector('.card-header h5 span');
        if (countSpan) countSpan.innerText = '(' + list.length + ' Active)';

        if (!list || list.length === 0) {
            if (grid) grid.innerHTML = '';
            if (empty) empty.style.display = 'block';
            return;
        }
        if (empty) empty.style.display = 'none';

        if (grid) {
            grid.innerHTML = list.map(p => \`
                <div class="card" style="border: 1px solid #E2E8F0; border-radius: 16px; padding: 22px; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.03); display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                            <div>
                                <span class="badge" style="background:#CCFBF1; color:#0F766E; font-size:0.72rem; font-weight:700;">ACTIVE PRESCRIPTION</span>
                                <h4 style="font-size:1.2rem; font-weight:700; color:#0F2042; margin:6px 0 2px;">\${p.medicineName}</h4>
                                <div style="font-size:0.82rem; color:#64748B;">Prescribed by \${p.doctorName}</div>
                            </div>
                            <div style="font-size:2rem; color:#0D9488;"><i class="bi bi-capsule"></i></div>
                        </div>
                        <div style="background:#F8FAFC; border-radius:10px; padding:14px; font-size:0.88rem; margin-bottom:14px; line-height:1.6; border:1px solid #E2E8F0;">
                            <div><strong style="color:#0F2042;">Dosage:</strong> \${p.dosage}</div>
                            <div><strong style="color:#0F2042;">Frequency:</strong> \${p.frequency}</div>
                            <div><strong style="color:#0F2042;">Duration:</strong> \${p.duration}</div>
                            <div style="margin-top:4px;"><strong style="color:#0F2042;">Instructions:</strong> <span style="color:#334155;">\${p.instructions}</span></div>
                        </div>
                    </div>
                    <div style="font-size:0.78rem; color:#64748B; display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #E2E8F0; padding-top:12px; margin-top:8px;">
                        <span><i class="bi bi-calendar-event"></i> Issued: \${p.issuedDate}</span>
                        <span style="color:#0D9488; font-weight:700;"><i class="bi bi-shield-check"></i> Digitally Signed</span>
                    </div>
                </div>
            \`).join('');
        }
    }
    renderPatientPrescriptions();
</script>
`;
patRxHtml = patRxHtml.replace('</body>', `${patientPrescriptionsScript}</body>`);
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
    .replace("<span th:text=\"'Dr. ' + \${doctor.name}\">Doctor</span>", '<span id="docHeaderName">Dr. Rajesh Kumar</span>')
    .replace("${#temporals.format(#temporals.createNow(), 'EEEE, dd MMMM yyyy')}", new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
    .replace('th:text="${#strings.substring(doctor.name, 0, 1)}"', '')
    .replace(/<div class="stat-value" th:text="\${todayCount \?: 0}">\d+<\/div>/, '<div class="stat-value" id="docStatToday">3</div>')
    .replace(/<div class="stat-value" th:text="\${pendingCount \?: 0}">\d+<\/div>/, '<div class="stat-value" id="docStatPending">1</div>')
    .replace(/<div class="stat-value" th:text="\${confirmedCount \?: 0}">\d+<\/div>/, '<div class="stat-value" id="docStatConfirmed">2</div>')
    .replace(/<div class="stat-value" th:text="\${completedCount \?: 0}">\d+<\/div>/, '<div class="stat-value" id="docStatCompleted">5</div>')
    .replace("<div style=\"font-size:1.1rem;font-weight:700;\" th:text=\"'Dr. ' + \${doctor.name}\">Dr. Name</div>", '<div style="font-size:1.1rem;font-weight:700;" id="docCardName">Dr. Rajesh Kumar</div>')
    .replace('<div style="color:#6366F1;font-weight:600;font-size:0.875rem;" th:text="${doctor.specialization}">Specialization</div>', '<div style="color:#6366F1;font-weight:600;font-size:0.875rem;" id="docCardSpec">Senior Cardiologist</div>')
    .replace('<div style="color:#9CA3AF;font-size:0.78rem;" th:text="${doctor.qualification}">Qualification</div>', '<div style="color:#9CA3AF;font-size:0.78rem;" id="docCardQual">MBBS, MD (Cardiology), DM (Cardiology)</div>')
    .replace('<span th:text="${doctor.department.name}">Department</span>', '<span id="docCardDept">Cardiology • MediCare City Hospital</span>')
    .replace('<span th:text="${doctor.experienceYears} + \' years experience\'">Exp</span>', '<span id="docCardExp">15 years clinical experience</span>')
    .replace('<span th:text="${doctor.availability}">Availability</span>', '<span id="docCardAvail">Mon-Sat: 9AM-1PM, 3PM-6PM (OPD Room 104)</span>')
    .replace('<span th:text="${doctor.email}">Email</span>', '<span id="docCardEmail">doctor@healix.com (Fee: ₹800.00)</span>');

const doctorDashboardScript = `
<script src="/js/clinical-store.js"></script>
<script>
    function renderDoctorDashboard() {
        const doc = HealixStore.getDoctorProfile();
        if (doc.name) {
            document.getElementById('docHeaderName').innerText = doc.fullName || ('Dr. ' + doc.name);
            document.getElementById('docCardName').innerText = doc.fullName || ('Dr. ' + doc.name);
            document.getElementById('docCardSpec').innerText = doc.specialization;
            document.getElementById('docCardQual').innerText = doc.qualification;
            document.getElementById('docCardDept').innerText = doc.department + ' • ' + (doc.hospital || 'MediCare City Hospital');
            document.getElementById('docCardExp').innerText = doc.experienceYears + ' years clinical experience';
            document.getElementById('docCardAvail').innerText = doc.availability + ' (' + doc.room + ')';
            document.getElementById('docCardEmail').innerText = doc.email + ' (Fee: ₹' + doc.consultationFee + ')';
        }

        const appts = HealixStore.getAppointments();
        const pendingCount = appts.filter(a => a.status === 'PENDING').length;
        const confirmedCount = appts.filter(a => a.status === 'CONFIRMED').length;
        const completedCount = appts.filter(a => a.status === 'COMPLETED').length;

        document.getElementById('docStatToday').innerText = appts.length;
        document.getElementById('docStatPending').innerText = pendingCount;
        document.getElementById('docStatConfirmed').innerText = confirmedCount;
        document.getElementById('docStatCompleted').innerText = completedCount;

        const tableContainer = document.querySelector('.card:nth-child(2) .table-container');
        if (tableContainer) {
            tableContainer.innerHTML = \`
                <table class="data-table">
                    <thead><tr><th>Time</th><th>Patient</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                        \${appts.map(a => {
                            const badge = a.status === 'CONFIRMED'
                                ? '<span class="badge badge-confirmed">CONFIRMED</span>'
                                : (a.status === 'COMPLETED' ? '<span class="badge badge-completed">COMPLETED</span>' : '<span class="badge badge-pending">PENDING</span>');
                            
                            const action = a.status === 'PENDING'
                                ? \`<button onclick="confirmAppt(\${a.id})" class="btn btn-sm btn-indigo"><i class="bi bi-check-lg"></i> Confirm</button>\`
                                : \`<a href="/doctor/medical-records" class="btn btn-sm btn-outline"><i class="bi bi-pencil-square"></i> Record</a>\`;

                            return \`
                                <tr>
                                    <td style="font-weight:700;color:#6366F1;">\${a.time}</td>
                                    <td>
                                        <div style="font-weight:600;">\${a.patientName}</div>
                                        <div style="font-size:0.72rem;color:#9CA3AF;">\${a.patientPhone} • \${a.patientId}</div>
                                    </td>
                                    <td style="font-size:0.82rem;color:#4B5563;">\${a.reason}</td>
                                    <td>\${badge}</td>
                                    <td>\${action}</td>
                                </tr>
                            \`;
                        }).join('')}
                    </tbody>
                </table>
            \`;
        }
    }

    function confirmAppt(id) {
        if (HealixStore.confirmAppointment(id)) {
            showToast('Appointment #' + id + ' confirmed successfully! Patient notified.');
            renderDoctorDashboard();
        }
    }

    renderDoctorDashboard();
</script>
`;
docDashHtml = docDashHtml.replace('</body>', `${doctorDashboardScript}</body>`);
writePage('doctor/dashboard/index.html', docDashHtml);

// ----------------------------------------------------
// 21. Generate Doctor Appointments (/doctor/appointments/index.html)
// ----------------------------------------------------
const rawDocAppts = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'doctor', 'appointments.html'), 'utf8');
let docApptsHtml = cleanThymeleaf(rawDocAppts);

const docApptsTableBlock = `
    <div class="table-container">
        <table class="data-table">
            <thead>
                <tr>
                    <th>#ID</th><th>Patient</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Actions</th>
                </tr>
            </thead>
            <tbody id="docApptsTbody"></tbody>
        </table>
        <div id="docApptsEmpty" class="empty-state" style="display:none; padding:48px 24px;">
            <div class="empty-state-icon"><i class="bi bi-calendar-x"></i></div>
            <h3>No appointments found</h3>
            <p>You have no appointments matching the current filter.</p>
        </div>
    </div>
`;
docApptsHtml = docApptsHtml.replace(/<div class="table-container">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/main>/, `${docApptsTableBlock}</div></div></main>`);

const docApptsScript = `
<script src="/js/clinical-store.js"></script>
<script>
    let currentFilter = 'ALL';

    function setFilter(status) {
        currentFilter = status;
        document.querySelectorAll('.filter-btn').forEach(b => {
            b.className = (b.dataset.status === status) ? 'btn btn-sm btn-indigo filter-btn' : 'btn btn-sm btn-outline filter-btn';
        });
        renderAppointmentsTable();
    }

    function renderAppointmentsTable() {
        let appts = HealixStore.getAppointments();
        if (currentFilter !== 'ALL') {
            appts = appts.filter(a => a.status === currentFilter);
        }

        const tbody = document.getElementById('docApptsTbody');
        const empty = document.getElementById('docApptsEmpty');
        if (!appts || appts.length === 0) {
            if (tbody) tbody.innerHTML = '';
            if (empty) empty.style.display = 'block';
            return;
        }
        if (empty) empty.style.display = 'none';

        if (tbody) {
            tbody.innerHTML = appts.map(a => {
                const badge = a.status === 'CONFIRMED'
                    ? '<span class="badge badge-confirmed">CONFIRMED</span>'
                    : (a.status === 'COMPLETED' ? '<span class="badge badge-completed">COMPLETED</span>' : '<span class="badge badge-pending">PENDING</span>');
                
                const confirmBtn = a.status === 'PENDING'
                    ? \`<button onclick="confirmAppointmentItem(\${a.id})" class="btn btn-sm btn-indigo" style="font-weight:700;"><i class="bi bi-check-lg"></i> Confirm</button>\`
                    : '';

                return \`
                    <tr>
                        <td style="font-size:0.78rem;color:#9CA3AF;">#\${a.id}</td>
                        <td>
                            <div style="display:flex;align-items:center;gap:10px;">
                                <div class="avatar avatar-sm avatar-teal">\${a.patientName.charAt(0)}</div>
                                <div>
                                    <div style="font-weight:600;color:#0F2042;">\${a.patientName}</div>
                                    <div style="font-size:0.72rem;color:#9CA3AF;">\${a.patientPhone} • \${a.patientId}</div>
                                </div>
                            </div>
                        </td>
                        <td style="font-weight:500;">\${a.date}</td>
                        <td style="font-weight:600;color:#6366F1;">\${a.time}</td>
                        <td style="font-size:0.82rem;color:#4B5563;">\${a.reason}</td>
                        <td>\${badge}</td>
                        <td>
                            <div style="display:flex;gap:6px;">
                                \${confirmBtn}
                                <a href="/doctor/medical-records" class="btn btn-sm btn-outline"><i class="bi bi-clipboard2-pulse"></i> Write Record &amp; Rx</a>
                            </div>
                        </td>
                    </tr>
                \`;
            }).join('');
        }
    }

    function confirmAppointmentItem(id) {
        if (HealixStore.confirmAppointment(id)) {
            showToast('Appointment #' + id + ' confirmed! Patient will see CONFIRMED status.');
            renderAppointmentsTable();
        }
    }

    // Add filter buttons
    const filterForm = document.querySelector('form');
    if (filterForm) {
        filterForm.innerHTML = \`
            <div style="font-size:0.85rem;font-weight:600;color:#374151;">Filter:</div>
            <button type="button" data-status="ALL" onclick="setFilter('ALL')" class="btn btn-sm btn-indigo filter-btn">All</button>
            <button type="button" data-status="PENDING" onclick="setFilter('PENDING')" class="btn btn-sm btn-outline filter-btn">Pending</button>
            <button type="button" data-status="CONFIRMED" onclick="setFilter('CONFIRMED')" class="btn btn-sm btn-outline filter-btn">Confirmed</button>
            <button type="button" data-status="COMPLETED" onclick="setFilter('COMPLETED')" class="btn btn-sm btn-outline filter-btn">Completed</button>
        \`;
    }

    renderAppointmentsTable();
</script>
`;
docApptsHtml = docApptsHtml.replace('</body>', `${docApptsScript}</body>`);
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
            <a href="/doctor/medical-records" class="btn btn-sm btn-outline"><i class="bi bi-clipboard2-pulse"></i> Write Record / Rx</a>
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
            <a href="/doctor/medical-records" class="btn btn-sm btn-outline"><i class="bi bi-clipboard2-pulse"></i> Write Record / Rx</a>
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
            <a href="/doctor/medical-records" class="btn btn-sm btn-outline"><i class="bi bi-clipboard2-pulse"></i> Write Record / Rx</a>
        </td>
    </tr>
`;
docPatientsHtml = docPatientsHtml.replace(/<table class="data-table"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/main>/,
    `<table class="data-table"><thead><tr><th>Patient</th><th>Contact Email</th><th>Phone</th><th>Gender</th><th>Blood Group</th><th>Age</th><th>Actions</th></tr></thead><tbody>${docPatientsTableHtml}</tbody></table></div></div></div></main>`);
writePage('doctor/patients/index.html', docPatientsHtml);

// ----------------------------------------------------
// 23. Generate Doctor Medical Records (/doctor/medical-records/index.html) with Record & Prescription Writer
// ----------------------------------------------------
const rawDocRecords = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'doctor', 'medical-records.html'), 'utf8');
let docRecordsHtml = cleanThymeleaf(rawDocRecords);

const docRecordsContentBlock = `
<div class="page-content">
    <!-- Top Stats & Quick Action Banner -->
    <div style="display: flex; justify-content: space-between; align-items: center; background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px 24px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
        <div>
            <h3 style="margin: 0 0 4px; font-size: 1.28rem; font-weight: 800; color: #0F2042;">Clinical Medical Records &amp; Prescriptions</h3>
            <p style="margin: 0; font-size: 0.88rem; color: #64748B;">Log clinical diagnoses, add treatment plans, and issue digitally signed prescriptions directly to patient accounts.</p>
        </div>
        <button onclick="openRecordModal()" class="btn btn-indigo" style="font-weight: 700; padding: 10px 22px; border-radius: 10px; display: flex; align-items: center; gap: 8px;">
            <i class="bi bi-plus-circle" style="font-size: 1.1rem;"></i> Write Medical Record &amp; Rx
        </button>
    </div>

    <!-- Section 1: Eligible Consultations -->
    <div class="card" style="margin-bottom: 28px; border-radius: 16px; border: 1px solid #E2E8F0;">
        <div class="card-header" style="background: #fff; padding: 18px 24px; border-bottom: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center;">
            <h5 style="margin:0; font-size: 1.05rem; font-weight: 700; color: #0F2042;">
                <i class="bi bi-clipboard2-check" style="color: #6366F1; margin-right: 8px;"></i> OPD Consultations Eligible for Record Entry
            </h5>
            <span class="badge badge-indigo">Ready for Entry</span>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>#Appt</th>
                        <th>Patient Name</th>
                        <th>Date &amp; Time</th>
                        <th>Reported Symptoms / Purpose</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="font-weight: 600; color: #94A3B8;">#1082</td>
                        <td>
                            <div style="display:flex; align-items:center; gap:10px;">
                                <div class="avatar avatar-sm avatar-teal">A</div>
                                <div>
                                    <div style="font-weight: 700; color: #0F2042;">Arun Chandran</div>
                                    <div style="font-size: 0.75rem; color: #64748B;">PAT-TRV-000001 • Cardiology</div>
                                </div>
                            </div>
                        </td>
                        <td><strong>Tomorrow</strong> <span style="color:#6366F1; font-weight:600;">09:30 AM</span></td>
                        <td style="font-size: 0.85rem; color: #475569;">Chest pain and shortness of breath during exercise</td>
                        <td><span class="badge badge-confirmed">CONFIRMED</span></td>
                        <td>
                            <button onclick="openRecordModalForPatient('Arun Chandran|PAT-TRV-000001|1082')" class="btn btn-sm btn-indigo" style="font-weight:600;">
                                <i class="bi bi-pencil-square"></i> Write Record &amp; Rx
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td style="font-weight: 600; color: #94A3B8;">#1084</td>
                        <td>
                            <div style="display:flex; align-items:center; gap:10px;">
                                <div class="avatar avatar-sm avatar-teal">D</div>
                                <div>
                                    <div style="font-weight: 700; color: #0F2042;">Divya Rajan</div>
                                    <div style="font-size: 0.75rem; color: #64748B;">PAT-TRV-000002 • Cardiology</div>
                                </div>
                            </div>
                        </td>
                        <td><strong>In 2 Days</strong> <span style="color:#6366F1; font-weight:600;">11:00 AM</span></td>
                        <td style="font-size: 0.85rem; color: #475569;">Hypertension check and medication adjustment</td>
                        <td><span class="badge badge-confirmed">CONFIRMED</span></td>
                        <td>
                            <button onclick="openRecordModalForPatient('Divya Rajan|PAT-TRV-000002|1084')" class="btn btn-sm btn-indigo" style="font-weight:600;">
                                <i class="bi bi-pencil-square"></i> Write Record &amp; Rx
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td style="font-weight: 600; color: #94A3B8;">#1085</td>
                        <td>
                            <div style="display:flex; align-items:center; gap:10px;">
                                <div class="avatar avatar-sm avatar-teal">M</div>
                                <div>
                                    <div style="font-weight: 700; color: #0F2042;">Mohammed Faisal</div>
                                    <div style="font-size: 0.75rem; color: #64748B;">PAT-TRV-000003 • Cardiology</div>
                                </div>
                            </div>
                        </td>
                        <td><strong>Today</strong> <span style="color:#6366F1; font-weight:600;">03:30 PM</span></td>
                        <td style="font-size: 0.85rem; color: #475569;">Cardiac stress test review</td>
                        <td><span class="badge badge-pending">PENDING</span></td>
                        <td>
                            <button onclick="openRecordModalForPatient('Mohammed Faisal|PAT-TRV-000003|1085')" class="btn btn-sm btn-indigo" style="font-weight:600;">
                                <i class="bi bi-pencil-square"></i> Write Record &amp; Rx
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Section 2: Issued Medical Records & Clinical Prescriptions -->
    <div class="card" style="border-radius: 16px; border: 1px solid #E2E8F0;">
        <div class="card-header" style="background: #fff; padding: 18px 24px; border-bottom: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center;">
            <h5 style="margin:0; font-size: 1.05rem; font-weight: 700; color: #0F2042;">
                <i class="bi bi-journal-medical" style="color: #10B981; margin-right: 8px;"></i> Issued Medical Records &amp; Digital Prescriptions
            </h5>
            <span id="docRecordCountBadge" class="badge" style="background: #D1FAE5; color: #065F46; font-weight: 700;">Active Records</span>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Record ID</th>
                        <th>Date</th>
                        <th>Patient</th>
                        <th>Diagnosis</th>
                        <th>Treatment Plan &amp; Advice</th>
                        <th>Prescriptions</th>
                        <th>Follow-up</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="docIssuedRecordsTbody"></tbody>
            </table>
        </div>
    </div>
</div>
</main>
`;
docRecordsHtml = docRecordsHtml.replace(/<div class="page-content">[\s\S]*?<\/main>/, docRecordsContentBlock);

const doctorRecordsWriterModalHtml = `
<!-- Modal for Doctor to Write Medical Record & Prescriptions -->
<div id="recordModal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15,23,42,0.65);z-index:99999;align-items:center;justify-content:center;padding:20px;overflow-y:auto;">
    <div style="background:#fff;border-radius:20px;max-width:760px;width:100%;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);overflow:hidden;border:1px solid #E2E8F0;margin:auto;">
        <div style="background:linear-gradient(135deg,#4F46E5,#6366F1);color:#fff;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;">
            <div>
                <h3 style="margin:0;font-size:1.25rem;font-weight:700;"><i class="bi bi-clipboard2-pulse"></i> Write Medical Record &amp; Prescription</h3>
                <p style="margin:4px 0 0;font-size:0.82rem;color:#E0E7FF;">Clinical consultation notes &amp; digital prescriptions (Instantly shared with Patient)</p>
            </div>
            <button type="button" onclick="closeRecordModal()" style="background:none;border:none;color:#fff;font-size:1.6rem;cursor:pointer;">&times;</button>
        </div>

        <form id="docRecordForm" onsubmit="submitDoctorRecord(event)" style="padding:24px;max-height:78vh;overflow-y:auto;display:flex;flex-direction:column;gap:18px;">
            <!-- Patient Selector -->
            <div style="background:#F8FAFC;padding:16px;border-radius:12px;border:1px solid #E2E8F0;">
                <label style="display:block;font-size:0.82rem;font-weight:700;color:#0F2042;margin-bottom:6px;text-transform:uppercase;">Select Patient <span style="color:#DC2626;">*</span></label>
                <select id="mPatientSelect" class="form-control" required style="font-weight:600;">
                    <option value="Arun Chandran|PAT-TRV-000001|1082">Arun Chandran (PAT-TRV-000001 • Cardiology OPD • Tomorrow 09:30 AM)</option>
                    <option value="Divya Rajan|PAT-TRV-000002|1084">Divya Rajan (PAT-TRV-000002 • Cardiology OPD • In 2 Days 11:00 AM)</option>
                    <option value="Mohammed Faisal|PAT-TRV-000003|1085">Mohammed Faisal (PAT-TRV-000003 • Cardiology OPD • Today 03:30 PM)</option>
                </select>
            </div>

            <!-- Diagnosis & Follow-up -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;color:#0F2042;margin-bottom:6px;">Clinical Diagnosis <span style="color:#DC2626;">*</span></label>
                    <input type="text" id="mDiagnosis" class="form-control" placeholder="e.g. Angina Pectoris, Essential HTN Grade 1" required/>
                </div>
                <div>
                    <label style="display:block;font-size:0.82rem;font-weight:700;color:#0F2042;margin-bottom:6px;">Follow-up Schedule</label>
                    <input type="text" id="mFollowUp" class="form-control" placeholder="e.g. 2 Weeks (Review ECG &amp; Echo)" value="2 Weeks"/>
                </div>
            </div>

            <div>
                <label style="display:block;font-size:0.82rem;font-weight:700;color:#0F2042;margin-bottom:6px;">Reported Symptoms &amp; Clinical Findings</label>
                <textarea id="mSymptoms" class="form-control" rows="2" placeholder="e.g. Retrosternal chest discomfort during exercise, mild shortness of breath..."></textarea>
            </div>

            <div>
                <label style="display:block;font-size:0.82rem;font-weight:700;color:#0F2042;margin-bottom:6px;">Treatment Plan &amp; Lifestyle Advice</label>
                <textarea id="mTreatment" class="form-control" rows="2" placeholder="e.g. Low sodium cardiac diet, brisk walking 30 min daily, stress management..."></textarea>
            </div>

            <!-- Prescription Section -->
            <div style="border-top:2px solid #E2E8F0;padding-top:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <div>
                        <h4 style="margin:0;font-size:1.05rem;font-weight:700;color:#0F2042;"><i class="bi bi-capsule" style="color:#10B981;"></i> Prescriptions (Rx)</h4>
                        <span style="font-size:0.75rem;color:#64748B;">Medicines prescribed to patient with dosages &amp; timings</span>
                    </div>
                    <button type="button" onclick="addRxItem()" class="btn btn-sm btn-outline" style="border-color:#10B981;color:#047857;font-weight:600;">
                        <i class="bi bi-plus-lg"></i> Add Medicine
                    </button>
                </div>

                <div id="rxItemsContainer" style="display:flex;flex-direction:column;gap:12px;">
                    <!-- Default Rx Row 1 -->
                    <div class="rx-row" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:14px;">
                        <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:10px;margin-bottom:8px;">
                            <div>
                                <label style="font-size:0.75rem;font-weight:600;color:#475569;">Medicine Name &amp; Strength <span style="color:#DC2626;">*</span></label>
                                <input type="text" class="form-control rx-name" placeholder="e.g. Atorvastatin 20mg" value="Atorvastatin 20mg" required/>
                            </div>
                            <div>
                                <label style="font-size:0.75rem;font-weight:600;color:#475569;">Dosage</label>
                                <input type="text" class="form-control rx-dosage" placeholder="e.g. 1 Tablet" value="1 Tablet"/>
                            </div>
                            <div>
                                <label style="font-size:0.75rem;font-weight:600;color:#475569;">Frequency</label>
                                <select class="form-control rx-frequency">
                                    <option value="Once Daily (Night)">Once Daily (Night)</option>
                                    <option value="Once Daily (Morning)">Once Daily (Morning)</option>
                                    <option value="Twice Daily (Morning/Night)">Twice Daily (Morning/Night)</option>
                                    <option value="Thrice Daily">Thrice Daily</option>
                                    <option value="SOS / As Needed">SOS / As Needed</option>
                                </select>
                            </div>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 2fr auto;gap:10px;align-items:end;">
                            <div>
                                <label style="font-size:0.75rem;font-weight:600;color:#475569;">Duration</label>
                                <input type="text" class="form-control rx-duration" placeholder="e.g. 30 Days" value="30 Days"/>
                            </div>
                            <div>
                                <label style="font-size:0.75rem;font-weight:600;color:#475569;">Special Instructions</label>
                                <input type="text" class="form-control rx-instructions" placeholder="e.g. Take after dinner with water" value="Take after evening food with water"/>
                            </div>
                            <button type="button" onclick="this.closest('.rx-row').remove()" class="btn btn-sm btn-outline" style="color:#DC2626;border-color:#FCA5A5;" title="Remove">&times;</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div style="display:flex;justify-content:flex-end;gap:12px;border-top:1px solid #E2E8F0;padding-top:16px;">
                <button type="button" onclick="closeRecordModal()" class="btn btn-outline" style="padding:8px 20px;">Cancel</button>
                <button type="submit" class="btn btn-indigo" style="padding:8px 24px;font-weight:700;">
                    <i class="bi bi-check2-circle"></i> Save &amp; Issue Record to Patient
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Modal for Doctor to View Clinical Record -->
<div id="docViewModal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15,23,42,0.65);z-index:99999;align-items:center;justify-content:center;padding:20px;">
    <div style="background:#fff;border-radius:18px;max-width:620px;width:100%;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);overflow:hidden;border:1px solid #E2E8F0;">
        <div style="background:linear-gradient(135deg,#4F46E5,#6366F1);color:#fff;padding:18px 24px;display:flex;justify-content:space-between;align-items:center;">
            <div>
                <h3 style="margin:0;font-size:1.18rem;font-weight:700;"><i class="bi bi-clipboard2-pulse"></i> Consultation Medical Summary</h3>
                <span id="docViewRecordId" style="font-size:0.8rem;color:#E0E7FF;">#MR-801</span>
            </div>
            <button onclick="document.getElementById('docViewModal').style.display='none'" style="background:none;border:none;color:#fff;font-size:1.6rem;cursor:pointer;">&times;</button>
        </div>
        <div style="padding:22px;display:flex;flex-direction:column;gap:14px;font-size:0.9rem;">
            <div><strong style="color:#64748B;font-size:0.78rem;text-transform:uppercase;">Patient Name &amp; ID</strong><div id="docViewPatient" style="font-weight:700;color:#0F2042;font-size:1.05rem;"></div></div>
            <div><strong style="color:#64748B;font-size:0.78rem;text-transform:uppercase;">Clinical Diagnosis</strong><div id="docViewDiag" style="font-weight:700;color:#4F46E5;font-size:1.1rem;"></div></div>
            <div><strong style="color:#64748B;font-size:0.78rem;text-transform:uppercase;">Symptoms &amp; Clinical Findings</strong><div id="docViewSymptoms" style="color:#475569;"></div></div>
            <div><strong style="color:#64748B;font-size:0.78rem;text-transform:uppercase;">Treatment Plan &amp; Lifestyle Advice</strong><div id="docViewTreatment" style="color:#334155;background:#F8FAFC;padding:12px;border-radius:8px;border:1px solid #E2E8F0;line-height:1.5;"></div></div>
            <div><strong style="color:#64748B;font-size:0.78rem;text-transform:uppercase;">Follow-Up Schedule</strong><div id="docViewFollowUp" style="color:#475569;"></div></div>
            <div style="text-align:right;margin-top:10px;">
                <button onclick="document.getElementById('docViewModal').style.display='none'" class="btn btn-outline btn-sm">Close</button>
            </div>
        </div>
    </div>
</div>

<script src="/js/clinical-store.js"></script>
<script>
    function openRecordModal() {
        document.getElementById('recordModal').style.display = 'flex';
    }

    function openRecordModalForPatient(patVal) {
        document.getElementById('mPatientSelect').value = patVal;
        openRecordModal();
    }

    function closeRecordModal() {
        document.getElementById('recordModal').style.display = 'none';
    }

    function addRxItem() {
        const container = document.getElementById('rxItemsContainer');
        const row = document.createElement('div');
        row.className = 'rx-row';
        row.style.cssText = 'background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:14px;';
        row.innerHTML = \`
            <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:10px;margin-bottom:8px;">
                <div>
                    <label style="font-size:0.75rem;font-weight:600;color:#475569;">Medicine Name &amp; Strength <span style="color:#DC2626;">*</span></label>
                    <input type="text" class="form-control rx-name" placeholder="e.g. Metoprolol Succinate 50mg" required/>
                </div>
                <div>
                    <label style="font-size:0.75rem;font-weight:600;color:#475569;">Dosage</label>
                    <input type="text" class="form-control rx-dosage" placeholder="e.g. 1 Tablet" value="1 Tablet"/>
                </div>
                <div>
                    <label style="font-size:0.75rem;font-weight:600;color:#475569;">Frequency</label>
                    <select class="form-control rx-frequency">
                        <option value="Once Daily (Morning)">Once Daily (Morning)</option>
                        <option value="Once Daily (Night)">Once Daily (Night)</option>
                        <option value="Twice Daily (Morning/Night)">Twice Daily (Morning/Night)</option>
                        <option value="Thrice Daily">Thrice Daily</option>
                        <option value="SOS / As Needed">SOS / As Needed</option>
                    </select>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 2fr auto;gap:10px;align-items:end;">
                <div>
                    <label style="font-size:0.75rem;font-weight:600;color:#475569;">Duration</label>
                    <input type="text" class="form-control rx-duration" placeholder="e.g. 30 Days" value="30 Days"/>
                </div>
                <div>
                    <label style="font-size:0.75rem;font-weight:600;color:#475569;">Special Instructions</label>
                    <input type="text" class="form-control rx-instructions" placeholder="e.g. Take after breakfast"/>
                </div>
                <button type="button" onclick="this.closest('.rx-row').remove()" class="btn btn-sm btn-outline" style="color:#DC2626;border-color:#FCA5A5;" title="Remove">&times;</button>
            </div>
        \`;
        container.appendChild(row);
    }

    function submitDoctorRecord(e) {
        e.preventDefault();
        const patVal = document.getElementById('mPatientSelect').value.split('|');
        const patientName = patVal[0];
        const patientId = patVal[1];
        const apptId = patVal[2];

        const diagnosis = document.getElementById('mDiagnosis').value;
        const symptoms = document.getElementById('mSymptoms').value;
        const treatment = document.getElementById('mTreatment').value;
        const followUp = document.getElementById('mFollowUp').value;

        // Collect Prescriptions
        const rxRows = document.querySelectorAll('.rx-row');
        const rxList = [];
        rxRows.forEach(row => {
            const medName = row.querySelector('.rx-name').value;
            const dosage = row.querySelector('.rx-dosage').value;
            const freq = row.querySelector('.rx-frequency').value;
            const dur = row.querySelector('.rx-duration').value;
            const inst = row.querySelector('.rx-instructions').value;
            if (medName && medName.trim()) {
                rxList.push({ medicineName: medName, dosage, frequency: freq, duration: dur, instructions: inst });
            }
        });

        const newRec = HealixStore.addRecordWithPrescriptions({
            patientName,
            patientId,
            appointmentId: apptId,
            diagnosis,
            symptoms,
            treatment,
            followUpDate: followUp
        }, rxList);

        closeRecordModal();
        showToast('Medical Record #' + newRec.id + ' & ' + rxList.length + ' prescription(s) successfully issued for ' + patientName + '! Visible on Patient Portal.');
        renderDoctorRecordsTable();
    }

    function viewClinicalRecordModal(id) {
        const r = HealixStore.getMedicalRecords().find(item => item.id === id);
        if (!r) return;
        document.getElementById('docViewRecordId').innerText = '#' + r.id + ' • ' + r.date;
        document.getElementById('docViewPatient').innerText = r.patientName + ' (' + r.patientId + ')';
        document.getElementById('docViewDiag').innerText = r.diagnosis;
        document.getElementById('docViewSymptoms').innerText = r.symptoms || 'None recorded';
        document.getElementById('docViewTreatment').innerText = r.treatment || 'Consultation plan logged';
        document.getElementById('docViewFollowUp').innerText = r.followUpDate || 'None specified';
        document.getElementById('docViewModal').style.display = 'flex';
    }

    function renderDoctorRecordsTable() {
        const records = HealixStore.getMedicalRecords();
        const tbody = document.getElementById('docIssuedRecordsTbody');
        const badge = document.getElementById('docRecordCountBadge');
        if (badge) badge.innerText = records.length + ' Active Records';

        if (tbody) {
            tbody.innerHTML = records.map(r => {
                const rxCount = HealixStore.getPrescriptions().filter(p => p.patientName === r.patientName).length;
                return \`
                    <tr>
                        <td style="font-weight:700;color:#0F2042;">#\${r.id}</td>
                        <td style="font-weight:600;">\${r.date}</td>
                        <td>
                            <div style="font-weight:700;color:#0F2042;">\${r.patientName}</div>
                            <div style="font-size:0.75rem;color:#64748B;">\${r.patientId}</div>
                        </td>
                        <td><strong style="color:#4F46E5;">\${r.diagnosis}</strong></td>
                        <td style="font-size:0.85rem;color:#475569;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">\${r.treatment || 'Prescriptions issued'}</td>
                        <td><span class="badge" style="background:#CCFBF1;color:#0F766E;font-weight:700;">\${rxCount} Meds</span></td>
                        <td style="font-size:0.85rem;color:#475569;">\${r.followUpDate || 'None'}</td>
                        <td>
                            <button onclick="viewClinicalRecordModal('\${r.id}')" class="btn btn-sm btn-outline"><i class="bi bi-eye"></i> View</button>
                        </td>
                    </tr>
                \`;
            }).join('');
        }
    }

    renderDoctorRecordsTable();
</script>
`;

docRecordsHtml = docRecordsHtml.replace('</body>', `${doctorRecordsWriterModalHtml}</body>`);
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
        <td><a href="/doctor/medical-records" class="btn btn-sm btn-indigo">Start OPD</a></td>
    </tr>
    <tr>
        <td style="font-weight:700;color:#0F2042;">In 2 Days</td>
        <td style="font-weight:700;color:#6366F1;">11:00 AM</td>
        <td style="font-weight:600;">Divya Rajan</td>
        <td>Hypertension checkup</td>
        <td><span class="badge badge-confirmed">CONFIRMED</span></td>
        <td><a href="/doctor/medical-records" class="btn btn-sm btn-indigo">Start OPD</a></td>
    </tr>
    <tr>
        <td style="font-weight:700;color:#0F2042;">Today</td>
        <td style="font-weight:700;color:#6366F1;">03:30 PM</td>
        <td style="font-weight:600;">Mohammed Faisal</td>
        <td>Cardiac stress test review</td>
        <td><span class="badge badge-pending">PENDING</span></td>
        <td><a href="/doctor/appointments" class="btn btn-sm btn-outline">Review</a></td>
    </tr>
`;
docScheduleHtml = docScheduleHtml.replace(/<tbody>[\s\S]*?<\/tbody>/, `<tbody>${docScheduleTableHtml}</tbody>`);
writePage('doctor/schedule/index.html', docScheduleHtml);

// ----------------------------------------------------
// 25. Generate Doctor Profile (/doctor/profile/index.html) with Real-Time Profile Editor
// ----------------------------------------------------
const rawDocProfile = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'doctor', 'profile.html'), 'utf8');
let docProfileHtml = cleanThymeleaf(rawDocProfile);

const docProfileContentBlock = `
<div class="page-content">
    <div class="grid-2" style="gap: 24px; align-items: flex-start;">
        <!-- Left: Live Profile Summary Card -->
        <div class="card" style="box-shadow: 0 4px 20px rgba(0,0,0,0.04); border-radius: 16px; border: 1px solid #E2E8F0;">
            <div class="card-body" style="padding: 28px; text-align: center;">
                <div id="sideDocAvatar" class="avatar avatar-xl" style="background:#6366F1; color:#fff; margin: 0 auto 16px; font-size: 2rem; width: 72px; height: 72px; line-height: 72px; border-radius: 50%;">R</div>
                <h3 id="sideDocName" style="font-size: 1.35rem; font-weight: 800; color: #0F2042; margin-bottom: 4px;">Dr. Rajesh Kumar</h3>
                <div id="sideDocSpec" style="color: #6366F1; font-weight: 600; font-size: 0.95rem; margin-bottom: 6px;">Senior Cardiologist</div>
                <span class="badge badge-indigo">Cardiology • OPD Room 104</span>

                <div style="margin-top: 24px; border-top: 1px solid #E2E8F0; padding-top: 20px; text-align: left; display: flex; flex-direction: column; gap: 12px; font-size: 0.88rem;">
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:#64748B;">Hospital:</span>
                        <strong style="color:#1E293B;" id="sideDocHosp">MediCare City Hospital</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:#64748B;">Qualification:</span>
                        <strong style="color:#1E293B;" id="sideDocQual">MBBS, MD (Cardiology), DM (Cardiology)</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:#64748B;">Experience:</span>
                        <strong style="color:#1E293B;" id="sideDocExp">15 Years</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:#64748B;">Consultation Fee:</span>
                        <strong style="color:#10B981;" id="sideDocFee">₹800.00</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:#64748B;">Email:</span>
                        <strong style="color:#1E293B;" id="sideDocEmail">doctor@healix.com</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:#64748B;">Phone:</span>
                        <strong style="color:#1E293B;" id="sideDocPhone">+91 98765 01234</strong>
                    </div>
                </div>
                <div style="margin-top: 20px; background: #F0FDF4; border: 1px solid #BBF7D0; padding: 12px 14px; border-radius: 8px; color: #166534; font-size: 0.82rem; font-weight: 600;">
                    <i class="bi bi-patch-check-fill"></i> Verified Medical Practitioner • Healix Board
                </div>
            </div>
        </div>

        <!-- Right: Interactive Profile & Practice Details Editor -->
        <div class="card" style="box-shadow: 0 4px 20px rgba(0,0,0,0.04); border-radius: 16px; border: 1px solid #E2E8F0;">
            <div class="card-header" style="background:#fff; border-bottom: 1px solid #E2E8F0; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center;">
                <h5 style="margin:0; font-size: 1.1rem; font-weight: 700; color: #0F2042;">
                    <i class="bi bi-pencil-square" style="color:#6366F1; margin-right: 8px;"></i> Edit Doctor Profile &amp; Practice Details
                </h5>
                <span class="badge" style="background:#EEF2FF; color:#4F46E5; font-weight:600; padding:4px 10px; border-radius:6px; font-size:0.75rem;">Instant Sync</span>
            </div>
            <div class="card-body" style="padding: 24px;">
                <form id="doctorProfileEditForm" onsubmit="handleDoctorProfileSave(event)" style="display:flex; flex-direction:column; gap:18px;">
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div>
                            <label style="display:block; font-size:0.82rem; font-weight:700; color:#334155; margin-bottom:6px;">Doctor Full Name <span style="color:#DC2626;">*</span></label>
                            <input type="text" id="editDocName" class="form-control" required style="border-radius:8px;"/>
                        </div>
                        <div>
                            <label style="display:block; font-size:0.82rem; font-weight:700; color:#334155; margin-bottom:6px;">Specialization <span style="color:#DC2626;">*</span></label>
                            <input type="text" id="editDocSpec" class="form-control" required style="border-radius:8px;"/>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div>
                            <label style="display:block; font-size:0.82rem; font-weight:700; color:#334155; margin-bottom:6px;">Medical Qualifications</label>
                            <input type="text" id="editDocQual" class="form-control" style="border-radius:8px;"/>
                        </div>
                        <div>
                            <label style="display:block; font-size:0.82rem; font-weight:700; color:#334155; margin-bottom:6px;">Consultation Fee (₹)</label>
                            <input type="number" id="editDocFee" class="form-control" style="border-radius:8px;"/>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div>
                            <label style="display:block; font-size:0.82rem; font-weight:700; color:#334155; margin-bottom:6px;">Experience (Years)</label>
                            <input type="number" id="editDocExp" class="form-control" style="border-radius:8px;"/>
                        </div>
                        <div>
                            <label style="display:block; font-size:0.82rem; font-weight:700; color:#334155; margin-bottom:6px;">Contact Phone</label>
                            <input type="tel" id="editDocPhone" class="form-control" style="border-radius:8px;"/>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div>
                            <label style="display:block; font-size:0.82rem; font-weight:700; color:#334155; margin-bottom:6px;">Contact Email</label>
                            <input type="email" id="editDocEmail" class="form-control" style="border-radius:8px;"/>
                        </div>
                        <div>
                            <label style="display:block; font-size:0.82rem; font-weight:700; color:#334155; margin-bottom:6px;">Working Hours &amp; Availability</label>
                            <input type="text" id="editDocAvail" class="form-control" placeholder="Mon-Sat: 9AM-1PM, 3PM-6PM" style="border-radius:8px;"/>
                        </div>
                    </div>

                    <div>
                        <label style="display:block; font-size:0.82rem; font-weight:700; color:#334155; margin-bottom:6px;">Biography &amp; Clinical Focus</label>
                        <textarea id="editDocBio" class="form-control" rows="3" style="border-radius:8px;"></textarea>
                    </div>

                    <div style="display:flex; justify-content:flex-end; gap:12px; border-top:1px solid #E2E8F0; padding-top:16px;">
                        <button type="submit" class="btn btn-indigo" style="font-weight:700; padding:10px 24px; border-radius:8px;">
                            <i class="bi bi-check2-circle"></i> Save Profile Details
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
</main>
`;
docProfileHtml = docProfileHtml.replace(/<div class="page-content">[\s\S]*?<\/main>/, docProfileContentBlock);

const doctorProfileEditorScript = `
<script src="/js/clinical-store.js"></script>
<script>
    function loadDoctorProfileForm() {
        const doc = HealixStore.getDoctorProfile();
        
        // Fill form fields
        if (document.getElementById('editDocName')) document.getElementById('editDocName').value = doc.name || 'Rajesh Kumar';
        if (document.getElementById('editDocEmail')) document.getElementById('editDocEmail').value = doc.email || 'doctor@healix.com';
        if (document.getElementById('editDocPhone')) document.getElementById('editDocPhone').value = doc.phone || '9876501234';
        if (document.getElementById('editDocSpec')) document.getElementById('editDocSpec').value = doc.specialization || 'Senior Cardiologist';
        if (document.getElementById('editDocQual')) document.getElementById('editDocQual').value = doc.qualification || 'MBBS, MD (Cardiology), DM (Cardiology)';
        if (document.getElementById('editDocFee')) document.getElementById('editDocFee').value = doc.consultationFee || '800.00';
        if (document.getElementById('editDocExp')) document.getElementById('editDocExp').value = doc.experienceYears || 15;
        if (document.getElementById('editDocAvail')) document.getElementById('editDocAvail').value = doc.availability || 'Mon-Sat: 9AM-1PM, 3PM-6PM';
        if (document.getElementById('editDocBio')) document.getElementById('editDocBio').value = doc.bio || 'Senior interventional cardiologist with 15+ years of clinical experience in preventative and interventional cardiology.';

        // Update profile card side elements
        const nameCard = document.getElementById('sideDocName');
        if (nameCard) nameCard.innerText = doc.fullName || ('Dr. ' + doc.name);
        const avatarCard = document.getElementById('sideDocAvatar');
        if (avatarCard && doc.name) avatarCard.innerText = doc.name.charAt(0);
        const specCard = document.getElementById('sideDocSpec');
        if (specCard) specCard.innerText = doc.specialization;
        const hospCard = document.getElementById('sideDocHosp');
        if (hospCard) hospCard.innerText = doc.hospital || 'MediCare City Hospital';
        const qualCard = document.getElementById('sideDocQual');
        if (qualCard) qualCard.innerText = doc.qualification;
        const expCard = document.getElementById('sideDocExp');
        if (expCard) expCard.innerText = (doc.experienceYears || 15) + ' Years';
        const feeCard = document.getElementById('sideDocFee');
        if (feeCard) feeCard.innerText = '₹' + (doc.consultationFee || '800.00');
        const emailCard = document.getElementById('sideDocEmail');
        if (emailCard) emailCard.innerText = doc.email || 'doctor@healix.com';
        const phoneCard = document.getElementById('sideDocPhone');
        if (phoneCard) phoneCard.innerText = doc.phone || '+91 98765 01234';
    }

    function handleDoctorProfileSave(e) {
        e.preventDefault();
        const name = document.getElementById('editDocName').value.trim();
        const email = document.getElementById('editDocEmail').value.trim();
        const phone = document.getElementById('editDocPhone').value.trim();
        const specialization = document.getElementById('editDocSpec').value.trim();
        const qualification = document.getElementById('editDocQual').value.trim();
        const fee = document.getElementById('editDocFee').value.trim();
        const exp = document.getElementById('editDocExp').value.trim();
        const availability = document.getElementById('editDocAvail').value.trim();
        const bio = document.getElementById('editDocBio').value.trim();

        const updated = {
            name: name,
            fullName: 'Dr. ' + name,
            email: email,
            phone: phone,
            specialization: specialization,
            qualification: qualification,
            consultationFee: fee,
            experienceYears: exp,
            availability: availability,
            department: "Cardiology",
            hospital: "MediCare City Hospital",
            room: "OPD Room 104",
            bio: bio
        };

        HealixStore.saveDoctorProfile(updated);
        showToast('Doctor Profile updated successfully! Changes saved across the platform.');
        loadDoctorProfileForm();
    }

    loadDoctorProfileForm();
</script>
`;
docProfileHtml = docProfileHtml.replace('</body>', `${doctorProfileEditorScript}</body>`);
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
