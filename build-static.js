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
    // Remove server-side flash message alert divs (unless they have an explicit id for client JS)
    html = html.replace(/<div\b(?=[^>]*\bclass="[^"]*alert[^"]*")(?=[^>]*\bth:if=)[^>]*>[\s\S]*?<\/div>/gi, (match) => {
        if (match.includes('id=')) {
            return match;
        }
        return '';
    });

    return html
        .replace(/<span\b(?=[^>]*\bth:text="\${hospital\.hospitalName}")[^>]*>[\s\S]*?<\/span>/gi, '<span>MediCare City Hospital</span>')
        .replace(/<span\s*>Hospital Name<\/span>/gi, '<span>MediCare City Hospital</span>')
        .replace(/<span>Hospital Name<\/span>/gi, '<span>MediCare City Hospital</span>')
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
        .replace(/th:styleappend="[^"]*"/g, '')
        .replace(/th:style="[^"]*"/g, '')
        .replace(/th:text="[^"]*"/g, '')
        .replace(/th:utext="[^"]*"/g, '')
        .replace(/th:if="[^"]*"/g, '')
        .replace(/th:unless="[^"]*"/g, '')
        .replace(/th:each="[^"]*"/g, '')
        .replace(/th:class="[^"]*"/g, '')
        .replace(/th:value="[^"]*"/g, '')
        .replace(/th:selected="[^"]*"/g, '')
        .replace(/th:attr="[^"]*"/g, '')
        .replace(/th:id="[^"]*"/g, '')
        .replace(/th:checked="[^"]*"/g, '')
        .replace(/th:remove="[^"]*"/g, '')
        .replace(/sec:authorize="[^"]*"/g, '')
        .replace(/sec:authentication="[^"]*"/g, '');
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
    <!-- Minimal 1-Click Demo Sign In -->
    <div class="demo-accounts" style="margin-top: 20px; padding: 14px 16px; background: #F8FAFC; border-radius: 14px; border: 1px solid #E2E8F0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div style="font-size: 0.78rem; font-weight: 800; color: #0F2042; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
                <i class="bi bi-lightning-charge-fill" style="color: #6366F1; font-size: 0.95rem;"></i> Quick Demo Access
            </div>
            <span style="font-size: 0.7rem; color: #4338CA; background: #EEF2FF; padding: 2px 8px; border-radius: 9999px; font-weight: 700;">1-Click Login</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
            <!-- 1. Patient -->
            <button type="button" onclick="quickLogin('patient@healix.com', 'Patient@123', 'PATIENT', '/patient/dashboard')"
                    style="display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: #ffffff; border: 1.5px solid #CCFBF1; border-radius: 10px; cursor: pointer; text-align: left; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.02);"
                    onmouseover="this.style.borderColor='#14B8A6'; this.style.transform='translateY(-1px)';"
                    onmouseout="this.style.borderColor='#CCFBF1'; this.style.transform='none';">
                <div style="width: 32px; height: 32px; border-radius: 8px; background: #CCFBF1; color: #0F766E; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0;">
                    <i class="bi bi-person-fill"></i>
                </div>
                <div style="min-width: 0; flex: 1;">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
                        <span style="font-weight: 700; color: #0F2042; font-size: 0.8rem;">Patient</span>
                        <span style="font-size: 0.65rem; color: #0D9488; font-weight: 700;">⚡ Login</span>
                    </div>
                    <div style="font-size: 0.68rem; color: #64748B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Arun Chandran</div>
                </div>
            </button>

            <!-- 2. Doctor -->
            <button type="button" onclick="quickLogin('doctor@healix.com', 'Doctor@123', 'DOCTOR', '/doctor/dashboard')"
                    style="display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: #ffffff; border: 1.5px solid #E0E7FF; border-radius: 10px; cursor: pointer; text-align: left; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.02);"
                    onmouseover="this.style.borderColor='#6366F1'; this.style.transform='translateY(-1px)';"
                    onmouseout="this.style.borderColor='#E0E7FF'; this.style.transform='none';">
                <div style="width: 32px; height: 32px; border-radius: 8px; background: #E0E7FF; color: #4338CA; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0;">
                    <i class="bi bi-heart-pulse-fill"></i>
                </div>
                <div style="min-width: 0; flex: 1;">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
                        <span style="font-weight: 700; color: #0F2042; font-size: 0.8rem;">Doctor</span>
                        <span style="font-size: 0.65rem; color: #4F46E5; font-weight: 700;">⚡ Login</span>
                    </div>
                    <div style="font-size: 0.68rem; color: #64748B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Dr. Rajesh Kumar</div>
                </div>
            </button>

            <!-- 3. Hospital Admin -->
            <button type="button" onclick="quickLogin('admin.medicare@healix.com', 'Admin@123', 'HOSPITAL_ADMIN', '/hospital-admin/dashboard')"
                    style="display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: #ffffff; border: 1.5px solid #F3E8FF; border-radius: 10px; cursor: pointer; text-align: left; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.02);"
                    onmouseover="this.style.borderColor='#9333EA'; this.style.transform='translateY(-1px)';"
                    onmouseout="this.style.borderColor='#F3E8FF'; this.style.transform='none';">
                <div style="width: 32px; height: 32px; border-radius: 8px; background: #F3E8FF; color: #7E22CE; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0;">
                    <i class="bi bi-hospital"></i>
                </div>
                <div style="min-width: 0; flex: 1;">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
                        <span style="font-weight: 700; color: #0F2042; font-size: 0.8rem;">Hosp Admin</span>
                        <span style="font-size: 0.65rem; color: #7E22CE; font-weight: 700;">⚡ Login</span>
                    </div>
                    <div style="font-size: 0.68rem; color: #64748B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Rahul (MediCare)</div>
                </div>
            </button>

            <!-- 4. Super Admin -->
            <button type="button" onclick="quickLogin('admin@healix.com', 'Admin@123', 'SUPER_ADMIN', '/super-admin/dashboard')"
                    style="display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: #ffffff; border: 1.5px solid #EDE7F6; border-radius: 10px; cursor: pointer; text-align: left; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.02);"
                    onmouseover="this.style.borderColor='#8070A6'; this.style.transform='translateY(-1px)';"
                    onmouseout="this.style.borderColor='#EDE7F6'; this.style.transform='none';">
                <div style="width: 32px; height: 32px; border-radius: 8px; background: #EDE7F6; color: #5E35B1; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0;">
                    <i class="bi bi-shield-check"></i>
                </div>
                <div style="min-width: 0; flex: 1;">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
                        <span style="font-weight: 700; color: #0F2042; font-size: 0.8rem;">Super Admin</span>
                        <span style="font-size: 0.65rem; color: #5E35B1; font-weight: 700;">⚡ Login</span>
                    </div>
                    <div style="font-size: 0.68rem; color: #64748B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Dr. Ananya K.</div>
                </div>
            </button>
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

    // Dynamic Flash Alert Handler for URL Query Params
    (function checkFlashParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const errAlert = document.getElementById('login-error-alert');
        const errText = document.getElementById('login-error-text');
        const successAlert = document.getElementById('login-success-alert');
        const successText = document.getElementById('login-success-text');

        if (urlParams.has('error') && errAlert && errText) {
            errText.textContent = urlParams.get('error') || 'Invalid email or password. Please try again.';
            errAlert.style.display = 'flex';
        }
        if (urlParams.has('logout') && successAlert && successText) {
            successText.textContent = 'You have been logged out successfully.';
            successAlert.style.display = 'flex';
        } else if ((urlParams.has('registered') || urlParams.has('success')) && successAlert && successText) {
            successText.textContent = urlParams.get('success') || 'Registration successful! Please sign in with your credentials.';
            successAlert.style.display = 'flex';
        }
    })();

    document.querySelector('.login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const errAlert = document.getElementById('login-error-alert');
        const errText = document.getElementById('login-error-text');
        if (errAlert) errAlert.style.display = 'none';

        const email = document.getElementById('email').value.trim();
        const pwd = document.getElementById('password').value.trim();

        if (!email || !pwd) {
            if (errAlert && errText) {
                errText.textContent = 'Please enter both your email address and password.';
                errAlert.style.display = 'flex';
            }
            return;
        }

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

if (!registerHtml.includes('/js/clinical-store.js')) {
    registerHtml = registerHtml.replace('</body>', '<script src="/js/clinical-store.js"></script>\n</body>');
}
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

// ====================================================
// Patient Portal Shared Data & Navigation
// ====================================================
const PATIENT_DOCTORS = [
    {
        id: "1",
        name: "Rajesh Kumar",
        specialization: "Cardiology",
        qualification: "MBBS, MD (Med), DM (Cardiology), FACC",
        department: "Cardiology",
        hospital: "MediCare City Hospital",
        experienceYears: 15,
        consultationFee: 800,
        availability: "Mon-Sat: 09:00 AM - 01:00 PM (OPD Room 104)",
        bio: "Senior consultant interventional cardiologist specializing in coronary interventions, hypertension, chest pain triage, and preventive lipidology."
    },
    {
        id: "2",
        name: "Sarah Varghese",
        specialization: "Neurology",
        qualification: "MBBS, MD (Medicine), DM (Neurology)",
        department: "Neurology",
        hospital: "MediCare City Hospital",
        experienceYears: 11,
        consultationFee: 750,
        availability: "Mon-Fri: 10:00 AM - 02:00 PM (OPD Room 202)",
        bio: "Specialist in cerebrovascular disorders, migraine management, peripheral neuropathies, neuro-rehabilitation, and clinical EEG diagnostics."
    },
    {
        id: "3",
        name: "Suresh Menon",
        specialization: "Orthopedics & Joint Replacement",
        qualification: "MBBS, MS (Ortho), MCh (Ortho, UK)",
        department: "Orthopedics",
        hospital: "Trivandrum Medical Trust",
        experienceYears: 18,
        consultationFee: 700,
        availability: "Tue, Thu, Sat: 09:30 AM - 01:30 PM (OPD Block A)",
        bio: "Senior orthopedic joint replacement surgeon renowned for minimally invasive knee and hip arthroplasty, and arthroscopic ligament reconstruction."
    },
    {
        id: "4",
        name: "Ananya Pillai",
        specialization: "General Medicine & Diabetology",
        qualification: "MBBS, MD (General Medicine)",
        department: "General Medicine",
        hospital: "MediCare City Hospital",
        experienceYears: 9,
        consultationFee: 500,
        availability: "Mon-Sat: 08:30 AM - 12:30 PM, 04:00 PM - 06:00 PM",
        bio: "Experienced physician focusing on evidence-based management of metabolic syndrome, diabetes, hypertension, and preventative adult immunization."
    },
    {
        id: "5",
        name: "Thomas Mathew",
        specialization: "Pulmonology & Critical Care",
        qualification: "MBBS, MD (Pulmonary Medicine), FCCP",
        department: "Pulmonology",
        hospital: "Trivandrum Medical Trust",
        experienceYears: 14,
        consultationFee: 650,
        availability: "Mon, Wed, Fri: 11:00 AM - 03:00 PM (OPD Block C)",
        bio: "Chest physician and pulmonologist specializing in asthma, COPD, interstitial lung diseases, sleep studies, and post-viral respiratory recovery."
    },
    {
        id: "6",
        name: "Priyamvada Nair",
        specialization: "Pediatrics & Neonatology",
        qualification: "MBBS, DCH, DNB (Pediatrics)",
        department: "Pediatrics",
        hospital: "MediCare City Hospital",
        experienceYears: 10,
        consultationFee: 550,
        availability: "Mon-Sat: 09:00 AM - 01:00 PM (OPD Room 108)",
        bio: "Dedicated pediatric specialist committed to developmental pediatrics, infant nutrition, childhood asthma, and preventive pediatric care."
    }
];

function renderPatientSidebarNav(activeKey) {
    return `<nav class="sidebar-nav">
        <div class="nav-section-label">Navigation</div>
        <a href="/patient/dashboard" class="nav-item \${activeKey === 'dashboard' ? 'active' : ''}"><i class="bi bi-speedometer2 nav-icon"></i> Dashboard</a>
        <a href="/patient/hospitals" class="nav-item \${activeKey === 'hospitals' ? 'active' : ''}"><i class="bi bi-hospital nav-icon"></i> My Hospitals</a>
        <a href="/patient/ai-assistant" class="nav-item \${activeKey === 'ai' ? 'active' : ''}" style="color: #A78BFA;"><i class="bi bi-robot nav-icon"></i> AI Health Assistant</a>
        <a href="/patient/book-appointment" class="nav-item \${activeKey === 'book' ? 'active' : ''}"><i class="bi bi-calendar2-plus nav-icon"></i> Book Appointment</a>
        <a href="/patient/appointments" class="nav-item \${activeKey === 'appointments' ? 'active' : ''}"><i class="bi bi-calendar2-check nav-icon"></i> My Appointments</a>
        <a href="/patient/doctors" class="nav-item \${activeKey === 'doctors' ? 'active' : ''}"><i class="bi bi-person-badge nav-icon"></i> Find Doctors</a>
        <a href="/patient/medical-records" class="nav-item \${activeKey === 'records' ? 'active' : ''}"><i class="bi bi-clipboard2-pulse nav-icon"></i> Medical Records</a>
        <a href="/patient/prescriptions" class="nav-item \${activeKey === 'prescriptions' ? 'active' : ''}"><i class="bi bi-capsule nav-icon"></i> Prescriptions</a>
        <a href="/patient/consent-requests" class="nav-item \${activeKey === 'consents' ? 'active' : ''}"><i class="bi bi-shield-check nav-icon"></i> Record Consent</a>
        <div class="nav-section-label">Account</div>
        <a href="/patient/profile" class="nav-item \${activeKey === 'profile' ? 'active' : ''}"><i class="bi bi-person-circle nav-icon"></i> Profile</a>
        <a href="/patient/notifications" class="nav-item \${activeKey === 'notifications' ? 'active' : ''}"><i class="bi bi-bell nav-icon"></i> Notifications</a>
    </nav>`;
}

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

aiHtml = aiHtml
    .replace(/<nav class="sidebar-nav">[\s\S]*?<\/nav>/, renderPatientSidebarNav('ai'))
    .replace(/<script>[\s\S]*?<\/script>/, clientAiEngine);
writePage('patient/ai-assistant/index.html', aiHtml);

// ----------------------------------------------------
// 10. Generate Patient Dashboard (/patient/dashboard/index.html)
// ----------------------------------------------------
const rawPatientDash = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'patient', 'dashboard.html'), 'utf8');
let patientDashHtml = cleanThymeleaf(rawPatientDash);

const detailedPatientPageContent = `
        <div class="page-content">

            <!-- Welcome & Central Health Identity Banner -->
            <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #2563EB 100%); border-radius: 18px; padding: 26px 30px; margin-bottom: 24px; color: #fff; box-shadow: 0 12px 30px rgba(79, 70, 229, 0.25); position: relative; overflow: hidden;">
                <div style="position: absolute; right: -30px; top: -30px; width: 180px; height: 180px; background: rgba(255,255,255,0.08); border-radius: 50%; pointer-events: none;"></div>
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; position: relative; z-index: 1;">
                    <div style="display: flex; align-items: center; gap: 22px;">
                        <div style="position: relative;">
                            <div style="width: 76px; height: 76px; border-radius: 50%; background: #EEF2FF; color: #4338CA; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; border: 3px solid rgba(255,255,255,0.8); box-shadow: 0 6px 16px rgba(0,0,0,0.18);">
                                AC
                            </div>
                            <span style="position: absolute; bottom: 2px; right: 2px; width: 20px; height: 20px; background: #10B981; border: 2px solid #fff; border-radius: 50%;" title="Active Patient Identity"></span>
                        </div>
                        <div>
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap;">
                                <span style="background: rgba(255,255,255,0.22); backdrop-filter: blur(8px); padding: 3px 12px; border-radius: 9999px; font-size: 0.82rem; font-weight: 700; letter-spacing: 0.5px; border: 1px solid rgba(255,255,255,0.35);">
                                    <i class="bi bi-shield-check"></i> CENTRAL PATIENT ID: <span id="dashPatientId">PAT-TRV-000001</span>
                                </span>
                                <span style="background: #10B981; color: #fff; padding: 2px 8px; border-radius: 9999px; font-size: 0.72rem; font-weight: 700;">
                                    <i class="bi bi-patch-check-fill"></i> VERIFIED
                                </span>
                            </div>
                            <h2 style="font-size: 1.6rem; font-weight: 800; margin: 0 0 6px; color: #fff;">
                                Welcome, <span class="js-user-name">Arun Chandran</span>!
                            </h2>
                            <div style="display: flex; gap: 12px; flex-wrap: wrap; font-size: 0.86rem; color: rgba(255,255,255,0.92);">
                                <span><i class="bi bi-droplet-fill" style="color: #FCA5A5;"></i> Blood Group: <strong>B+</strong></span>
                                <span>•</span>
                                <span><i class="bi bi-person-fill"></i> Age: <strong>34 Yrs (Male)</strong></span>
                                <span>•</span>
                                <span><i class="bi bi-geo-alt-fill"></i> <strong>Thiruvananthapuram, Kerala</strong></span>
                                <span>•</span>
                                <span><i class="bi bi-hospital"></i> Primary: <strong>MediCare City Hospital</strong></span>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <a href="/patient/ai-assistant" class="btn btn-lg" style="background: #fff; color: #4F46E5; font-weight: 700; box-shadow: 0 6px 18px rgba(0,0,0,0.15); border: none;">
                            <i class="bi bi-robot"></i> AI Symptom Check
                        </a>
                        <button onclick="openHealthCardModal()" class="btn btn-lg" style="background: rgba(255,255,255,0.18); color: #fff; border: 1px solid rgba(255,255,255,0.4); font-weight: 600; backdrop-filter: blur(8px); cursor: pointer;">
                            <i class="bi bi-qr-code-scan"></i> Digital Health Card
                        </button>
                    </div>
                </div>
            </div>

            <!-- Patient Vitals & Health Snapshot Strip -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
                <div style="background: #fff; border-radius: 14px; border: 1px solid #E2E8F0; padding: 16px 18px; display: flex; align-items: center; gap: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
                    <div style="width: 46px; height: 46px; border-radius: 12px; background: #FEF2F2; color: #EF4444; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                        <i class="bi bi-heart-pulse-fill"></i>
                    </div>
                    <div>
                        <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: #64748B;">Blood Pressure</div>
                        <div style="font-size: 1.25rem; font-weight: 800; color: #0F2042;">128/82 <span style="font-size: 0.75rem; font-weight: 500; color: #64748B;">mmHg</span></div>
                        <div style="font-size: 0.72rem; color: #10B981; font-weight: 600;"><i class="bi bi-check-circle"></i> Normal / Controlled</div>
                    </div>
                </div>

                <div style="background: #fff; border-radius: 14px; border: 1px solid #E2E8F0; padding: 16px 18px; display: flex; align-items: center; gap: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
                    <div style="width: 46px; height: 46px; border-radius: 12px; background: #EFF6FF; color: #3B82F6; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                        <i class="bi bi-activity"></i>
                    </div>
                    <div>
                        <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: #64748B;">Heart Rate</div>
                        <div style="font-size: 1.25rem; font-weight: 800; color: #0F2042;">72 <span style="font-size: 0.75rem; font-weight: 500; color: #64748B;">bpm</span></div>
                        <div style="font-size: 0.72rem; color: #10B981; font-weight: 600;"><i class="bi bi-check-circle"></i> Regular Sinus Rhythm</div>
                    </div>
                </div>

                <div style="background: #fff; border-radius: 14px; border: 1px solid #E2E8F0; padding: 16px 18px; display: flex; align-items: center; gap: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
                    <div style="width: 46px; height: 46px; border-radius: 12px; background: #F0FDF4; color: #10B981; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                        <i class="bi bi-lungs-fill"></i>
                    </div>
                    <div>
                        <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: #64748B;">SpO2 Oxygen</div>
                        <div style="font-size: 1.25rem; font-weight: 800; color: #0F2042;">98% <span style="font-size: 0.75rem; font-weight: 500; color: #64748B;">Room air</span></div>
                        <div style="font-size: 0.72rem; color: #10B981; font-weight: 600;"><i class="bi bi-check-circle"></i> Optimal Level</div>
                    </div>
                </div>

                <div style="background: #fff; border-radius: 14px; border: 1px solid #E2E8F0; padding: 16px 18px; display: flex; align-items: center; gap: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
                    <div style="width: 46px; height: 46px; border-radius: 12px; background: #FAF5FF; color: #A855F7; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                        <i class="bi bi-person-bounding-box"></i>
                    </div>
                    <div>
                        <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: #64748B;">BMI &amp; Weight</div>
                        <div style="font-size: 1.25rem; font-weight: 800; color: #0F2042;">22.8 <span style="font-size: 0.75rem; font-weight: 500; color: #64748B;">BMI (71.5 kg)</span></div>
                        <div style="font-size: 0.72rem; color: #10B981; font-weight: 600;"><i class="bi bi-check-circle"></i> Healthy Weight</div>
                    </div>
                </div>
            </div>

            <!-- Stats Metric Grid -->
            <div class="stat-grid" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); margin-bottom: 24px;">
                <div class="stat-card">
                    <div class="stat-icon teal"><i class="bi bi-calendar2-check-fill"></i></div>
                    <div class="stat-info">
                        <div class="stat-value" id="patDashTotalAppts">1</div>
                        <div class="stat-label">Total Appointments</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon blue"><i class="bi bi-clock-fill"></i></div>
                    <div class="stat-info">
                        <div class="stat-value" style="font-size:1.15rem; color:#0D9488;" id="patDashNextApptDate">Tomorrow, 09:30 AM</div>
                        <div class="stat-label">Next Consultation</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon indigo"><i class="bi bi-capsule-pill"></i></div>
                    <div class="stat-info">
                        <div class="stat-value" id="patDashPrescriptionCount">2 Active</div>
                        <div class="stat-label">Active Medications</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon cyan"><i class="bi bi-hospital-fill"></i></div>
                    <div class="stat-info">
                        <div class="stat-value">2 Facilities</div>
                        <div class="stat-label">Connected Hospitals</div>
                    </div>
                </div>
            </div>

            <!-- Two-Column Clinical Core Layout -->
            <div class="grid-2" style="gap: 24px; margin-bottom: 24px;">

                <!-- LEFT COLUMN: Upcoming Appointment & Recent Medical Record -->
                <div style="display: flex; flex-direction: column; gap: 24px;">

                    <!-- Upcoming Appointment Card -->
                    <div class="card" style="box-shadow: 0 4px 12px rgba(0,0,0,0.04); border-radius: 14px;">
                        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #F1F5F9; padding: 16px 20px;">
                            <h5 style="margin: 0; font-size: 1.05rem; font-weight: 700; color: #0F2042; display: flex; align-items: center; gap: 8px;">
                                <i class="bi bi-calendar-event" style="color: #0D9488;"></i> Upcoming Appointment
                            </h5>
                            <a href="/patient/appointments" class="btn btn-sm btn-outline"><i class="bi bi-list-ul"></i> View All</a>
                        </div>
                        <div class="card-body" id="patDashUpcomingCardBody" style="padding: 20px;">
                            <div style="background: #F0FDFA; border: 1px solid #99F6E4; border-radius: 12px; padding: 18px;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
                                    <div style="display: flex; align-items: center; gap: 14px;">
                                        <div class="avatar avatar-md" style="background: #0D9488; color: #fff; font-weight: 700; font-size: 1.1rem; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                            RK
                                        </div>
                                        <div>
                                            <div style="font-weight: 800; font-size: 1.05rem; color: #0F2042;" id="patApptDocName">Dr. Rajesh Kumar</div>
                                            <div style="color: #0D9488; font-size: 0.85rem; font-weight: 700;" id="patApptDocSpec">Senior Consultant Cardiologist (MD, DM)</div>
                                            <div style="color: #64748B; font-size: 0.8rem; margin-top: 2px;" id="patApptHospName"><i class="bi bi-geo-alt"></i> MediCare City Hospital (Cardiology OPD Room 104)</div>
                                        </div>
                                    </div>
                                    <span class="badge badge-confirmed" id="patApptStatusBadge" style="background: #D1FAE5; color: #065F46; padding: 6px 14px; border-radius: 9999px; font-weight: 700; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 5px;">
                                        <i class="bi bi-check-circle-fill"></i> CONFIRMED
                                    </span>
                                </div>

                                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 14px;">
                                    <div style="background: #fff; border-radius: 8px; padding: 10px 12px; border: 1px solid #CCFBF1;">
                                        <div style="font-size: 0.68rem; color: #9CA3AF; text-transform: uppercase; font-weight: 700;">Date</div>
                                        <div style="font-weight: 800; color: #1E293B; font-size: 0.92rem;" id="patApptDate">Tomorrow</div>
                                    </div>
                                    <div style="background: #fff; border-radius: 8px; padding: 10px 12px; border: 1px solid #CCFBF1;">
                                        <div style="font-size: 0.68rem; color: #9CA3AF; text-transform: uppercase; font-weight: 700;">Reporting Time</div>
                                        <div style="font-weight: 800; color: #0D9488; font-size: 0.92rem;" id="patApptTime">09:30 AM</div>
                                    </div>
                                    <div style="background: #fff; border-radius: 8px; padding: 10px 12px; border: 1px solid #CCFBF1;">
                                        <div style="font-size: 0.68rem; color: #9CA3AF; text-transform: uppercase; font-weight: 700;">Token No.</div>
                                        <div style="font-weight: 800; color: #4338CA; font-size: 0.92rem;">Token #01</div>
                                    </div>
                                </div>

                                <div style="background: #fff; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; border: 1px solid #CCFBF1; font-size: 0.85rem; color: #334155;">
                                    <strong style="color: #0F2042;"><i class="bi bi-info-circle"></i> Reason:</strong>
                                    <span id="patApptReason">Chest pain and shortness of breath during exercise</span>
                                </div>

                                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                    <button onclick="downloadOfficialAppointmentLetter(1082)" class="btn btn-teal btn-sm" style="font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
                                        <i class="bi bi-file-earmark-arrow-down-fill"></i> Download Letter
                                    </button>
                                    <button onclick="openPaymentQrModal(1082, 'Dr. Rajesh Kumar', 'MediCare City Hospital', 800)" class="btn btn-sm" style="background: #4F46E5; color: #fff; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
                                        <i class="bi bi-qr-code"></i> Pay Fee (UPI QR)
                                    </button>
                                    <button onclick="openOpdPassModal()" class="btn btn-outline btn-sm" style="font-weight: 600; cursor: pointer;">
                                        <i class="bi bi-receipt"></i> Digital Slip
                                    </button>
                                    <a href="/patient/book-appointment" class="btn btn-outline btn-sm" style="font-weight: 600;">
                                        <i class="bi bi-calendar2-plus"></i> Book Another
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Recent Medical Record Card -->
                    <div class="card" style="box-shadow: 0 4px 12px rgba(0,0,0,0.04); border-radius: 14px;">
                        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #F1F5F9; padding: 16px 20px;">
                            <h5 style="margin: 0; font-size: 1.05rem; font-weight: 700; color: #0F2042; display: flex; align-items: center; gap: 8px;">
                                <i class="bi bi-clipboard2-pulse" style="color: #0D9488;"></i> Recent Medical Record
                            </h5>
                            <a href="/patient/medical-records" class="btn btn-sm btn-outline"><i class="bi bi-clock-history"></i> Medical History</a>
                        </div>
                        <div class="card-body" id="patDashRecentRecordBody" style="padding: 20px;">
                            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
                                    <div>
                                        <span style="background: #EFF6FF; color: #1D4ED8; font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 6px;">RECORD #MR-801 • CARDIOLOGY</span>
                                        <h4 style="margin: 6px 0 2px; font-size: 1.15rem; font-weight: 800; color: #0F2042;" id="patRecDiagnosis">Angina Pectoris / Mild Essential HTN</h4>
                                        <div style="font-size: 0.82rem; color: #64748B;">ICD-10 Code: <strong>I20.9 (Angina pectoris, unspecified)</strong></div>
                                    </div>
                                    <div style="text-align: right;">
                                        <span style="font-size: 0.75rem; color: #64748B; font-weight: 600;">CONSULTATION DATE</span>
                                        <div style="font-weight: 700; color: #0F2042; font-size: 0.95rem;" id="patRecDate">10 Sep 2026</div>
                                    </div>
                                </div>

                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
                                    <div style="background: #fff; border-radius: 8px; padding: 10px 12px; border: 1px solid #E2E8F0;">
                                        <div style="font-size: 0.68rem; color: #9CA3AF; text-transform: uppercase; font-weight: 700;">Attending Doctor</div>
                                        <div style="font-weight: 700; color: #1E293B; font-size: 0.9rem;" id="patRecDoctor">Dr. Rajesh Kumar</div>
                                        <div style="font-size: 0.75rem; color: #64748B;" id="patRecHospital">MediCare City Hospital</div>
                                    </div>
                                    <div style="background: #fff; border-radius: 8px; padding: 10px 12px; border: 1px solid #E2E8F0;">
                                        <div style="font-size: 0.68rem; color: #9CA3AF; text-transform: uppercase; font-weight: 700;">Scheduled Follow-Up</div>
                                        <div style="font-weight: 700; color: #0D9488; font-size: 0.9rem;">15 Oct 2026</div>
                                        <div style="font-size: 0.75rem; color: #64748B;">Cardiology Outpatient Clinic</div>
                                    </div>
                                </div>

                                <div style="background: #fff; border-radius: 8px; padding: 12px; border: 1px solid #E2E8F0; margin-bottom: 14px; font-size: 0.85rem; color: #334155;">
                                    <div style="font-size: 0.72rem; color: #9CA3AF; text-transform: uppercase; font-weight: 700; margin-bottom: 3px;">Clinical Observations &amp; Plan:</div>
                                    <div id="patRecTreatment" style="line-height: 1.5;">Atorvastatin 20mg nocte, Metoprolol Succinate 50mg mane, low-sodium cardiac diet. Advised 2D Echocardiogram in 4 weeks. Avoid strenuous unconditioned exertion.</div>
                                </div>

                                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                    <a href="/patient/medical-records" class="btn btn-teal btn-sm" style="font-weight: 600;">
                                        <i class="bi bi-file-earmark-medical"></i> View Full Clinical Record
                                    </a>
                                    <a href="/patient/prescriptions" class="btn btn-outline btn-sm" style="font-weight: 600;">
                                        <i class="bi bi-capsule"></i> View Prescribed Medicines
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- RIGHT COLUMN: Active Medications & Connected Hospitals -->
                <div style="display: flex; flex-direction: column; gap: 24px;">

                    <!-- Active Medications / Digital Prescriptions -->
                    <div class="card" style="box-shadow: 0 4px 12px rgba(0,0,0,0.04); border-radius: 14px;">
                        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #F1F5F9; padding: 16px 20px;">
                            <h5 style="margin: 0; font-size: 1.05rem; font-weight: 700; color: #0F2042; display: flex; align-items: center; gap: 8px;">
                                <i class="bi bi-capsule-pill" style="color: #6366F1;"></i> Active Daily Medications
                            </h5>
                            <a href="/patient/prescriptions" class="btn btn-sm btn-outline"><i class="bi bi-arrow-up-right"></i> All Prescriptions</a>
                        </div>
                        <div class="card-body" id="patDashMedicationsBody" style="padding: 20px;">
                            <div style="display: flex; flex-direction: column; gap: 14px;">

                                <!-- Med 1 -->
                                <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; border-left: 4px solid #6366F1;">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                        <div>
                                            <div style="font-weight: 800; font-size: 1rem; color: #0F2042;">Atorvastatin 20mg</div>
                                            <div style="font-size: 0.8rem; color: #64748B;">Lipid Lowering • 1 Tablet</div>
                                        </div>
                                        <span class="badge" style="background: #D1FAE5; color: #065F46; font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 6px;">
                                            ACTIVE (Night)
                                        </span>
                                    </div>
                                    <div style="font-size: 0.82rem; color: #475569; background: #fff; padding: 8px 10px; border-radius: 6px; border: 1px solid #F1F5F9; margin-bottom: 8px;">
                                        <i class="bi bi-moon-stars" style="color: #6366F1;"></i> Take after evening meal with water. Avoid grapefruit.
                                    </div>
                                    <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #94A3B8;">
                                        <span>Prescribed by: <strong>Dr. Rajesh Kumar</strong></span>
                                        <span>Duration: <strong>30 Days</strong></span>
                                    </div>
                                </div>

                                <!-- Med 2 -->
                                <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; border-left: 4px solid #0D9488;">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                        <div>
                                            <div style="font-weight: 800; font-size: 1rem; color: #0F2042;">Metoprolol Succinate 50mg</div>
                                            <div style="font-size: 0.8rem; color: #64748B;">Beta-Blocker / BP • 1 Tablet</div>
                                        </div>
                                        <span class="badge" style="background: #D1FAE5; color: #065F46; font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 6px;">
                                            ACTIVE (Morning)
                                        </span>
                                    </div>
                                    <div style="font-size: 0.82rem; color: #475569; background: #fff; padding: 8px 10px; border-radius: 6px; border: 1px solid #F1F5F9; margin-bottom: 8px;">
                                        <i class="bi bi-sun" style="color: #F59E0B;"></i> Take after breakfast. Regularly record morning resting pulse.
                                    </div>
                                    <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #94A3B8;">
                                        <span>Prescribed by: <strong>Dr. Rajesh Kumar</strong></span>
                                        <span>Duration: <strong>30 Days</strong></span>
                                    </div>
                                </div>

                                <a href="/patient/prescriptions" class="btn btn-outline btn-sm" style="text-align: center; justify-content: center; font-weight: 600; padding: 9px 0;">
                                    <i class="bi bi-capsule"></i> View Full Prescription History &amp; Refill Requests
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Connected Hospitals Network -->
                    <div class="card" style="box-shadow: 0 4px 12px rgba(0,0,0,0.04); border-radius: 14px;">
                        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #F1F5F9; padding: 16px 20px;">
                            <h5 style="margin: 0; font-size: 1.05rem; font-weight: 700; color: #0F2042; display: flex; align-items: center; gap: 8px;">
                                <i class="bi bi-hospital" style="color: #3B82F6;"></i> Connected Hospital Network
                            </h5>
                            <a href="/patient/hospitals" class="btn btn-sm btn-outline"><i class="bi bi-gear"></i> Manage</a>
                        </div>
                        <div class="card-body" style="padding: 20px;">
                            <div style="display: flex; flex-direction: column; gap: 12px;">

                                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px;">
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <div style="width: 40px; height: 40px; border-radius: 10px; background: #EDE9FE; color: #6D28D9; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem;">
                                            H1
                                        </div>
                                        <div>
                                            <div style="font-weight: 700; font-size: 0.92rem; color: #0F2042;">MediCare City Hospital</div>
                                            <div style="font-size: 0.75rem; color: #64748B;">MG Road, Thiruvananthapuram • Patient Code: <strong>TRV-HOSP-01-P-0001</strong></div>
                                        </div>
                                    </div>
                                    <span class="badge" style="background: #ECFDF5; color: #059669; font-size: 0.72rem; font-weight: 700; padding: 4px 8px; border-radius: 6px;">
                                        PRIMARY
                                    </span>
                                </div>

                                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px;">
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <div style="width: 40px; height: 40px; border-radius: 10px; background: #CCFBF1; color: #0F766E; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem;">
                                            H2
                                        </div>
                                        <div>
                                            <div style="font-weight: 700; font-size: 0.92rem; color: #0F2042;">Trivandrum Medical Trust</div>
                                            <div style="font-size: 0.75rem; color: #64748B;">Pattom Palace PO • Patient Code: <strong>TRV-HOSP-02-P-0042</strong></div>
                                        </div>
                                    </div>
                                    <span class="badge" style="background: #EFF6FF; color: #1D4ED8; font-size: 0.72rem; font-weight: 700; padding: 4px 8px; border-radius: 6px;">
                                        LINKED
                                    </span>
                                </div>

                                <div style="background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 8px; padding: 10px 12px; font-size: 0.78rem; color: #92400E; display: flex; align-items: center; gap: 8px;">
                                    <i class="bi bi-shield-lock-fill" style="font-size: 1rem; color: #D97706;"></i>
                                    <span>Cross-hospital medical records are shared strictly under your digital consent.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            <!-- Quick Clinical Actions Grid -->
            <div class="card" style="box-shadow: 0 4px 12px rgba(0,0,0,0.04); border-radius: 14px; margin-bottom: 24px;">
                <div class="card-header" style="border-bottom: 1px solid #F1F5F9; padding: 16px 20px;">
                    <h5 style="margin: 0; font-size: 1.05rem; font-weight: 700; color: #0F2042;">
                        <i class="bi bi-lightning-charge-fill" style="color: #F59E0B;"></i> Quick Patient Actions
                    </h5>
                </div>
                <div class="card-body" style="padding: 20px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px;">
                        <a href="/patient/book-appointment" class="btn btn-teal" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 14px; font-weight: 600;">
                            <i class="bi bi-calendar2-plus"></i> Book Consultation
                        </a>
                        <a href="/patient/ai-assistant" class="btn" style="background: #7C3AED; color: #fff; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 14px; font-weight: 600;">
                            <i class="bi bi-robot"></i> AI Symptom Bot
                        </a>
                        <a href="/patient/doctors" class="btn btn-outline" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 14px; font-weight: 600;">
                            <i class="bi bi-person-badge"></i> Find Doctors
                        </a>
                        <a href="/patient/medical-records" class="btn btn-outline" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 14px; font-weight: 600;">
                            <i class="bi bi-clipboard2-pulse"></i> Medical Records
                        </a>
                        <a href="/patient/prescriptions" class="btn btn-outline" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 14px; font-weight: 600;">
                            <i class="bi bi-capsule"></i> Prescriptions
                        </a>
                        <a href="/patient/consent-requests" class="btn btn-outline" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 14px; font-weight: 600;">
                            <i class="bi bi-shield-check"></i> Manage Consents
                        </a>
                        <a href="/patient/profile" class="btn btn-outline" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 14px; font-weight: 600;">
                            <i class="bi bi-person-circle"></i> My Health Profile
                        </a>
                    </div>
                </div>
            </div>

        </div>

        <!-- Interactive Modals for Health Card & OPD Pass -->
        <div id="healthCardModal" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); z-index: 9999; align-items: center; justify-content: center; padding: 20px;">
            <div style="background: #fff; width: 100%; max-width: 480px; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.35); animation: popIn 0.25s ease;">
                <div style="background: linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%); color: #fff; padding: 24px 24px 20px; position: relative;">
                    <button onclick="closeHealthCardModal()" style="position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.2); border: none; color: #fff; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">&times;</button>
                    <div style="font-size: 0.72rem; letter-spacing: 1.5px; text-transform: uppercase; color: #A5B4FC; font-weight: 700;">Government of Kerala • Digital Health Mission</div>
                    <div style="font-size: 1.3rem; font-weight: 800; margin: 4px 0 2px;">HEALIX CENTRAL HEALTH ID</div>
                    <div style="font-size: 0.8rem; color: #C7D2FE;">Multi-Hospital Unified Patient Identifier</div>
                </div>
                <div style="padding: 24px;">
                    <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 20px; border-bottom: 1px dashed #CBD5E1; padding-bottom: 18px;">
                        <div style="background: #F8FAFC; border: 2px solid #E2E8F0; border-radius: 12px; padding: 10px; text-align: center;">
                            <div style="width: 100px; height: 100px; background: repeating-conic-gradient(#0F2042 0% 25%, #fff 0% 50%) 50% / 10px 10px; border-radius: 6px; box-shadow: inset 0 0 0 4px #0F2042;"></div>
                            <div style="font-size: 0.65rem; color: #64748B; font-weight: 700; margin-top: 4px;">SCAN FOR EHR</div>
                        </div>
                        <div>
                            <div style="font-size: 1.2rem; font-weight: 800; color: #0F2042;" class="js-user-name">Arun Chandran</div>
                            <div style="font-size: 0.85rem; color: #4338CA; font-weight: 700; margin-bottom: 6px;">ID: PAT-TRV-000001</div>
                            <div style="font-size: 0.8rem; color: #475569; line-height: 1.4;">
                                <div><strong>Blood Group:</strong> B+ Positive</div>
                                <div><strong>Age / Gender:</strong> 34 Yrs / Male</div>
                                <div><strong>Emergency Contact:</strong> +91 98765 10001</div>
                            </div>
                        </div>
                    </div>
                    <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; padding: 12px; font-size: 0.8rem; color: #166534; margin-bottom: 20px;">
                        <i class="bi bi-shield-check"></i> Valid across all registered hospitals in Thiruvananthapuram healthcare federation.
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="window.print()" class="btn btn-teal w-100" style="padding: 10px; font-weight: 600;"><i class="bi bi-printer"></i> Print ID Card</button>
                        <button onclick="closeHealthCardModal()" class="btn btn-outline w-100" style="padding: 10px; font-weight: 600;">Close</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="opdPassModal" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); z-index: 9999; align-items: center; justify-content: center; padding: 20px;">
            <div style="background: #fff; width: 100%; max-width: 480px; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.35); animation: popIn 0.25s ease;">
                <div style="background: #0D9488; color: #fff; padding: 20px 24px; position: relative;">
                    <button onclick="closeOpdPassModal()" style="position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.2); border: none; color: #fff; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">&times;</button>
                    <div style="font-size: 0.72rem; letter-spacing: 1px; text-transform: uppercase; color: #CCFBF1; font-weight: 700;">MediCare City Hospital • Outpatient Department</div>
                    <div style="font-size: 1.3rem; font-weight: 800; margin: 4px 0 2px;">DIGITAL OPD ENTRY PASS</div>
                    <div style="font-size: 0.8rem; color: #CCFBF1;">Appointment Token Slip #APT-1082</div>
                </div>
                <div style="padding: 24px;">
                    <div style="text-align: center; background: #F0FDFA; border: 2px dashed #99F6E4; border-radius: 14px; padding: 18px; margin-bottom: 20px;">
                        <div style="font-size: 0.8rem; color: #0F766E; font-weight: 700; text-transform: uppercase;">OPD Queue Token</div>
                        <div style="font-size: 3rem; font-weight: 900; color: #0D9488; line-height: 1.1; margin: 4px 0;">#01</div>
                        <div style="font-size: 0.85rem; color: #065F46; font-weight: 600;">Status: CONFIRMED • Priority Consultation</div>
                    </div>
                    <div style="font-size: 0.86rem; color: #334155; line-height: 1.7; margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #F1F5F9; padding-bottom: 6px;">
                            <span style="color: #64748B;">Patient:</span>
                            <strong class="js-user-name">Arun Chandran</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #F1F5F9; padding: 6px 0;">
                            <span style="color: #64748B;">Consultant:</span>
                            <strong>Dr. Rajesh Kumar (Cardiologist)</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #F1F5F9; padding: 6px 0;">
                            <span style="color: #64748B;">Room / Block:</span>
                            <strong>Cardiology OPD, Room 104</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #F1F5F9; padding: 6px 0;">
                            <span style="color: #64748B;">Date &amp; Slot:</span>
                            <strong style="color: #0D9488;">Tomorrow at 09:30 AM</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding-top: 6px;">
                            <span style="color: #64748B;">Reporting Time:</span>
                            <strong style="color: #E11D48;">09:15 AM (15 min prior)</strong>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <div style="display: flex; gap: 8px;">
                            <button onclick="downloadOfficialAppointmentLetter(1082)" class="btn btn-teal w-100" style="padding: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 6px;">
                                <i class="bi bi-file-earmark-arrow-down-fill"></i> Download Letter
                            </button>
                            <button onclick="openPaymentQrModal(1082, 'Dr. Rajesh Kumar', 'MediCare City Hospital', 800)" class="btn w-100" style="background: #4F46E5; color: #fff; padding: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 6px;">
                                <i class="bi bi-qr-code"></i> Pay Fee (UPI QR)
                            </button>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button onclick="printOfficialAppointmentLetter(1082)" class="btn btn-outline w-100" style="padding: 8px; font-weight: 600;">
                                <i class="bi bi-printer"></i> Print / Save PDF
                            </button>
                            <button onclick="closeOpdPassModal()" class="btn btn-outline w-100" style="padding: 8px; font-weight: 600;">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
`;

patientDashHtml = patientDashHtml
    .replace(/<nav class="sidebar-nav">[\s\S]*?<\/nav>/, renderPatientSidebarNav('dashboard'))
    .replace(/<span th:text="\$\{patient\.name\}">Patient<\/span>/g, '<span class="js-user-name">Arun Chandran</span>')
    .replace('${#temporals.format(#temporals.createNow(), \'EEEE, dd MMMM yyyy\')}', new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
    .replace('<h3 th:text="${patient.name}">Patient Name</h3>', '<h3 class="js-user-name">Arun Chandran</h3>')
    .replace(/<a href="\/logout"/g, '<a href="/logout" onclick="localStorage.removeItem(\'healix_user\')"')
    .replace(/<div class="page-content">[\s\S]*?<\/div>\s*<\/main>/, detailedPatientPageContent + '</div></main>');

const patientDashScript = `
<script src="/js/clinical-store.js"></script>
<script src="/js/patient-features.js"></script>
<script>
    function openHealthCardModal() {
        const m = document.getElementById('healthCardModal');
        if (m) m.style.display = 'flex';
    }
    function closeHealthCardModal() {
        const m = document.getElementById('healthCardModal');
        if (m) m.style.display = 'none';
    }
    function openOpdPassModal() {
        const m = document.getElementById('opdPassModal');
        if (m) m.style.display = 'flex';
    }
    function closeOpdPassModal() {
        const m = document.getElementById('opdPassModal');
        if (m) m.style.display = 'none';
    }

    function renderPatientDashboard() {
        const user = JSON.parse(localStorage.getItem('healix_user') || '{"name":"Arun Chandran","email":"patient@healix.com","role":"PATIENT"}');
        document.querySelectorAll('.js-user-name').forEach(el => el.innerText = user.name || 'Arun Chandran');

        // Appointments synchronization
        const appts = HealixStore.getAppointments().filter(a => a.patientName === 'Arun Chandran' || a.patientId === 'PAT-TRV-000001');
        const totalApptsEl = document.getElementById('patDashTotalAppts');
        if (totalApptsEl) totalApptsEl.innerText = appts.length;

        const nextApptEl = document.getElementById('patDashNextApptDate');
        if (appts.length > 0) {
            const next = appts[0];
            if (nextApptEl) nextApptEl.innerText = next.date + ', ' + next.time;
            const docNameEl = document.getElementById('patApptDocName');
            if (docNameEl) docNameEl.innerText = next.doctorName;
            const hospNameEl = document.getElementById('patApptHospName');
            if (hospNameEl) hospNameEl.innerHTML = '<i class="bi bi-geo-alt"></i> ' + next.hospitalName + ' (OPD Block B, Room 104)';
            const dateEl = document.getElementById('patApptDate');
            if (dateEl) dateEl.innerText = next.date;
            const timeEl = document.getElementById('patApptTime');
            if (timeEl) timeEl.innerText = next.time;
            const reasonEl = document.getElementById('patApptReason');
            if (reasonEl) reasonEl.innerText = next.reason || 'General clinical consultation';
            const statusBadge = document.getElementById('patApptStatusBadge');
            if (statusBadge) {
                if (next.status === 'CONFIRMED') {
                    statusBadge.style.background = '#D1FAE5';
                    statusBadge.style.color = '#065F46';
                    statusBadge.innerHTML = '<i class="bi bi-check-circle-fill"></i> CONFIRMED';
                } else if (next.status === 'COMPLETED') {
                    statusBadge.style.background = '#E0F2FE';
                    statusBadge.style.color = '#0369A1';
                    statusBadge.innerHTML = '<i class="bi bi-check2-all"></i> COMPLETED';
                } else {
                    statusBadge.style.background = '#FEF3C7';
                    statusBadge.style.color = '#92400E';
                    statusBadge.innerHTML = '<i class="bi bi-clock"></i> PENDING';
                }
            }
        }

        // Medical Records synchronization
        const records = HealixStore.getMedicalRecords().filter(r => r.patientName === 'Arun Chandran' || r.patientId === 'PAT-TRV-000001');
        if (records.length > 0) {
            const latestRec = records[0];
            const diagEl = document.getElementById('patRecDiagnosis');
            if (diagEl) diagEl.innerText = latestRec.diagnosis || 'Clinical Consultation';
            const docEl = document.getElementById('patRecDoctor');
            if (docEl) docEl.innerText = latestRec.doctorName;
            const hospEl = document.getElementById('patRecHospital');
            if (hospEl) hospEl.innerText = latestRec.hospitalName;
            const dateEl = document.getElementById('patRecDate');
            if (dateEl) dateEl.innerText = latestRec.date;
            const treatEl = document.getElementById('patRecTreatment');
            if (treatEl) treatEl.innerText = (latestRec.treatment || '') + ' ' + (latestRec.notes || '');
        }

        // Prescriptions synchronization
        const prescriptions = HealixStore.getPrescriptions().filter(p => p.patientName === 'Arun Chandran' || p.patientId === 'PAT-TRV-000001');
        const rxCountEl = document.getElementById('patDashPrescriptionCount');
        if (rxCountEl) rxCountEl.innerText = prescriptions.length + ' Active';
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

bookHtml = bookHtml
    .replace(/<nav class="sidebar-nav">[\s\S]*?<\/nav>/, renderPatientSidebarNav('book'))
    .replace(/<a href="\/logout"/g, '<a href="/logout" onclick="localStorage.removeItem(\'healix_user\')"');

const richBookingContent = `
        <div class="page-content">
            <div id="bookingAlertBanner" style="display:none; margin-bottom: 20px;"></div>

            <div class="grid-2" style="gap: 24px; align-items: flex-start;">

                <!-- Booking Form Card -->
                <div class="card" style="box-shadow: 0 4px 16px rgba(0,0,0,0.04); border-radius: 16px;">
                    <div class="card-header" style="border-bottom: 1px solid #F1F5F9; padding: 18px 24px;">
                        <h5 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: #0F2042; display: flex; align-items: center; gap: 8px;">
                            <i class="bi bi-calendar2-plus" style="color:#0D9488;"></i> Schedule Doctor Consultation
                        </h5>
                    </div>
                    <div class="card-body" style="padding: 24px;">
                        <form id="patientBookForm">
                            <!-- Hospital Selection -->
                            <div class="form-group" style="margin-bottom: 18px;">
                                <label class="form-label" style="font-weight: 700; color: #1E293B; margin-bottom: 6px;">
                                    Participating Hospital Facility <span class="required" style="color:#EF4444;">*</span>
                                </label>
                                <select class="form-control form-select" id="bookHospitalSelect" required style="padding: 10px 14px; border-radius: 8px;">
                                    <option value="MediCare City Hospital" selected>MediCare City Hospital (MG Road, Statue, Thiruvananthapuram)</option>
                                    <option value="Trivandrum Medical Trust">Trivandrum Medical Trust (Pattom Palace PO, Thiruvananthapuram)</option>
                                </select>
                            </div>

                            <!-- Doctor Selection -->
                            <div class="form-group" style="margin-bottom: 18px;">
                                <label class="form-label" style="font-weight: 700; color: #1E293B; margin-bottom: 6px;">
                                    Select Medical Specialist <span class="required" style="color:#EF4444;">*</span>
                                </label>
                                <select class="form-control form-select" id="bookDoctorSelect" required style="padding: 10px 14px; border-radius: 8px;">
                                    <option value="">-- Choose Specialist Doctor --</option>
                                    ${PATIENT_DOCTORS.map(d => `<option value="${d.id}">Dr. ${d.name} (${d.specialization}) - ${d.hospital} • ₹${d.consultationFee}</option>`).join('')}
                                </select>
                            </div>

                            <!-- Preferred Date -->
                            <div class="form-group" style="margin-bottom: 18px;">
                                <label class="form-label" style="font-weight: 700; color: #1E293B; margin-bottom: 6px;">
                                    Preferred Consultation Date <span class="required" style="color:#EF4444;">*</span>
                                </label>
                                <input type="date" class="form-control" id="bookDateInput" required style="padding: 10px 14px; border-radius: 8px;"
                                       value="${new Date(Date.now() + 86400000).toISOString().split('T')[0]}"
                                       min="${new Date().toISOString().split('T')[0]}"/>
                            </div>

                            <!-- Time Slots -->
                            <div class="form-group" style="margin-bottom: 18px;">
                                <label class="form-label" style="font-weight: 700; color: #1E293B; margin-bottom: 6px;">
                                    Select Time Slot <span class="required" style="color:#EF4444;">*</span>
                                </label>
                                <input type="hidden" id="selectedTimeSlot" value="09:30 AM" required/>
                                
                                <div style="font-size: 0.75rem; font-weight: 700; color: #64748B; text-transform: uppercase; margin: 10px 0 6px;">
                                    Morning Slots
                                </div>
                                <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;" id="morningSlots">
                                    ${['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:30 AM'].map((s, i) => `
                                        <button type="button" class="slot-pill-btn ${i === 1 ? 'selected' : ''}" onclick="chooseSlot('${s}', this)" style="padding: 6px 14px; border-radius: 8px; border: 1px solid #CBD5E1; background: ${i === 1 ? '#0D9488' : '#fff'}; color: ${i === 1 ? '#fff' : '#334155'}; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">${s}</button>
                                    `).join('')}
                                </div>

                                <div style="font-size: 0.75rem; font-weight: 700; color: #64748B; text-transform: uppercase; margin: 10px 0 6px;">
                                    Afternoon Slots
                                </div>
                                <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;" id="afternoonSlots">
                                    ${['02:00 PM', '02:30 PM', '03:30 PM'].map(s => `
                                        <button type="button" class="slot-pill-btn" onclick="chooseSlot('${s}', this)" style="padding: 6px 14px; border-radius: 8px; border: 1px solid #CBD5E1; background: #fff; color: #334155; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">${s}</button>
                                    `).join('')}
                                </div>

                                <div style="font-size: 0.75rem; font-weight: 700; color: #64748B; text-transform: uppercase; margin: 10px 0 6px;">
                                    Evening Slots
                                </div>
                                <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="eveningSlots">
                                    ${['04:30 PM', '05:00 PM', '05:30 PM'].map(s => `
                                        <button type="button" class="slot-pill-btn" onclick="chooseSlot('${s}', this)" style="padding: 6px 14px; border-radius: 8px; border: 1px solid #CBD5E1; background: #fff; color: #334155; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">${s}</button>
                                    `).join('')}
                                </div>
                            </div>

                            <!-- Reason / Chief Complaint -->
                            <div class="form-group" style="margin-bottom: 20px;">
                                <label class="form-label" style="font-weight: 700; color: #1E293B; margin-bottom: 6px;">
                                    Reason for Consultation / Symptoms <span class="required" style="color:#EF4444;">*</span>
                                </label>
                                <textarea id="bookReasonInput" class="form-control" rows="3" required style="padding: 10px 14px; border-radius: 8px;"
                                          placeholder="Please describe your primary symptoms or the purpose of your visit..."></textarea>
                            </div>

                            <button type="submit" class="btn btn-teal btn-block btn-lg" style="padding: 12px; font-weight: 700; font-size: 1rem; border-radius: 10px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                <i class="bi bi-calendar2-check-fill"></i> Confirm &amp; Generate OPD Slip
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Right Side Information & Preview -->
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <!-- Doctor Preview Card -->
                    <div class="card" id="docPreviewCard" style="box-shadow: 0 4px 16px rgba(0,0,0,0.04); border-radius: 16px; border: 1px solid #E2E8F0;">
                        <div class="card-header" style="border-bottom: 1px solid #F1F5F9; padding: 16px 20px;">
                            <h5 style="margin:0; font-size: 1rem; font-weight: 700; color: #0F2042;">
                                <i class="bi bi-person-badge" style="color:#0D9488;"></i> Selected Specialist Profile
                            </h5>
                        </div>
                        <div class="card-body" style="padding: 20px;" id="docPreviewContent">
                            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 12px;">
                                <div style="width: 50px; height: 50px; border-radius: 12px; background: #0D9488; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 700;" id="prevAvatar">
                                    RK
                                </div>
                                <div>
                                    <div style="font-weight: 800; font-size: 1.05rem; color: #0F2042;" id="prevDocName">Dr. Rajesh Kumar</div>
                                    <div style="color: #0D9488; font-size: 0.85rem; font-weight: 700;" id="prevDocSpec">Cardiology Specialist</div>
                                    <div style="font-size: 0.78rem; color: #64748B;" id="prevDocHosp">MediCare City Hospital</div>
                                </div>
                            </div>
                            <p style="font-size: 0.84rem; color: #475569; line-height: 1.5; margin-bottom: 14px;" id="prevDocBio">
                                Senior consultant interventional cardiologist specializing in coronary interventions, hypertension, chest pain triage, and preventive lipidology.
                            </p>
                            <div style="background: #F8FAFC; border-radius: 10px; padding: 12px 14px; border: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 0.84rem; color: #64748B; font-weight: 600;">Consultation Fee:</span>
                                <span style="font-weight: 800; color: #0D9488; font-size: 1.15rem;" id="prevDocFee">₹800</span>
                            </div>
                        </div>
                    </div>

                    <!-- Booking Instructions Card -->
                    <div class="card" style="background: linear-gradient(135deg, #F0FDFA, #E6FFFA); border: 1px solid #99F6E4; border-radius: 16px;">
                        <div class="card-body" style="padding: 22px;">
                            <h5 style="color: #0F766E; margin-bottom: 12px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                                <i class="bi bi-info-circle-fill"></i> Central Booking Guidelines
                            </h5>
                            <ul style="padding-left: 18px; color: #334155; font-size: 0.86rem; line-height: 1.7; margin: 0;">
                                <li>Single central account valid across all networked hospitals in Thiruvananthapuram.</li>
                                <li>Upon booking, a digital token and OPD entry pass are instantly generated.</li>
                                <li>Please arrive 15 minutes prior to your allocated slot for vitals recording.</li>
                                <li>Carry your Central Patient ID (<strong>PAT-TRV-000001</strong>) or digital health card.</li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
`;

bookHtml = bookHtml.replace(/<div class="page-content">[\s\S]*?<\/main>/, richBookingContent + '</main>');

const richBookScript = `
<script src="/js/clinical-store.js"></script>
<script src="/js/patient-features.js"></script>
<script>
    let doctorsData = ${JSON.stringify(PATIENT_DOCTORS)};
    if (window.HealixStore && typeof HealixStore.getHospitalDoctors === 'function') {
        const storedDocs = HealixStore.getHospitalDoctors();
        storedDocs.forEach(sd => {
            const rawName = sd.name.replace(/^Dr\\.\\s*/i, '');
            if (!doctorsData.some(d => d.name.toLowerCase() === rawName.toLowerCase())) {
                doctorsData.push({
                    id: sd.id,
                    name: rawName,
                    specialization: sd.department,
                    qualification: sd.qualification,
                    department: sd.department,
                    hospital: sd.hospital || 'MediCare City Hospital',
                    experienceYears: sd.experienceYears || 5,
                    consultationFee: sd.consultationFee || 600,
                    availability: sd.availability || 'Mon-Sat: 09:00 AM - 01:00 PM',
                    bio: sd.bio || 'Clinical specialist consultant at MediCare City Hospital.'
                });
                const sel = document.getElementById('bookDoctorSelect');
                if (sel) {
                    const opt = document.createElement('option');
                    opt.value = sd.id;
                    opt.text = 'Dr. ' + rawName + ' (' + sd.department + ') - ' + (sd.hospital || 'MediCare City Hospital') + ' • ₹' + (sd.consultationFee || 600);
                    sel.appendChild(opt);
                }
            }
        });
    }

    function chooseSlot(slot, btn) {
        document.getElementById('selectedTimeSlot').value = slot;
        document.querySelectorAll('.slot-pill-btn').forEach(b => {
            b.style.background = '#fff';
            b.style.color = '#334155';
        });
        btn.style.background = '#0D9488';
        btn.style.color = '#fff';
    }

    function updateDocPreview(docId) {
        const doc = doctorsData.find(d => d.id === docId) || doctorsData[0];
        document.getElementById('prevAvatar').innerText = doc.name.split(' ').map(w => w[0]).join('').slice(0,2);
        document.getElementById('prevDocName').innerText = 'Dr. ' + doc.name;
        document.getElementById('prevDocSpec').innerText = doc.specialization;
        document.getElementById('prevDocHosp').innerText = doc.hospital;
        document.getElementById('prevDocBio').innerText = doc.bio;
        document.getElementById('prevDocFee').innerText = '₹' + doc.consultationFee;
        
        const hospSel = document.getElementById('bookHospitalSelect');
        if (hospSel) {
            for (let i = 0; i < hospSel.options.length; i++) {
                if (hospSel.options[i].value === doc.hospital) {
                    hospSel.selectedIndex = i;
                    break;
                }
            }
        }
    }

    document.getElementById('bookDoctorSelect').addEventListener('change', function() {
        if (this.value) updateDocPreview(this.value);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const queryDocId = urlParams.get('doctorId');
    if (queryDocId) {
        const docSel = document.getElementById('bookDoctorSelect');
        docSel.value = queryDocId;
        updateDocPreview(queryDocId);
    } else {
        document.getElementById('bookDoctorSelect').value = "1";
        updateDocPreview("1");
    }

    document.getElementById('patientBookForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const docId = document.getElementById('bookDoctorSelect').value;
        const doc = doctorsData.find(d => d.id === docId) || doctorsData[0];
        const hospital = document.getElementById('bookHospitalSelect').value;
        const date = document.getElementById('bookDateInput').value;
        const time = document.getElementById('selectedTimeSlot').value || '09:30 AM';
        const reason = document.getElementById('bookReasonInput').value;

        const newApptId = Math.floor(1090 + Math.random() * 500);
        const newAppt = {
            id: newApptId,
            patientName: "Arun Chandran",
            patientId: "PAT-TRV-000001",
            patientPhone: "9876510001",
            doctorName: 'Dr. ' + doc.name,
            doctorSpec: doc.specialization,
            hospitalName: hospital,
            date: date,
            time: time,
            reason: reason,
            status: "CONFIRMED",
            fee: doc.consultationFee,
            paymentStatus: "PENDING"
        };

        const appts = HealixStore.getAppointments();
        appts.unshift(newAppt);
        HealixStore.saveAppointments(appts);

        showBookingSuccessModal(newAppt);
    });
</script>
`;
bookHtml = bookHtml.replace('</body>', `${richBookScript}</body>`);
writePage('patient/book-appointment/index.html', bookHtml);

// ----------------------------------------------------
// 12. Generate Patient Appointments (/patient/appointments/index.html)
// ----------------------------------------------------
const rawAppts = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'patient', 'appointments.html'), 'utf8');
let apptsHtml = cleanThymeleaf(rawAppts);

apptsHtml = apptsHtml
    .replace(/<nav class="sidebar-nav">[\s\S]*?<\/nav>/, renderPatientSidebarNav('appointments'))
    .replace(/<a href="\/logout"/g, '<a href="/logout" onclick="localStorage.removeItem(\'healix_user\')"');

const patientApptsTableBlock = `
    <div class="table-container">
        <table class="data-table">
            <thead>
                <tr>
                    <th>#ID</th>
                    <th>Doctor &amp; Hospital</th>
                    <th>Date &amp; Slot</th>
                    <th>Chief Complaint</th>
                    <th>Fee &amp; Payment</th>
                    <th>Status</th>
                    <th>Letter &amp; Actions</th>
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

    <!-- Appointment Slip Modal -->
    <div id="apptsSlipModal" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.65); z-index:99999; align-items:center; justify-content:center; padding:20px;">
        <div style="background:#fff; width:100%; max-width:480px; border-radius:20px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.35);">
            <div style="background:#0D9488; color:#fff; padding:20px 24px; position:relative;">
                <button onclick="document.getElementById('apptsSlipModal').style.display='none'" style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.2); border:none; color:#fff; width:32px; height:32px; border-radius:50%; cursor:pointer; font-size:1.2rem;">&times;</button>
                <div style="font-size:0.75rem; letter-spacing:1px; text-transform:uppercase; color:#CCFBF1; font-weight:700;">Government of Kerala • Digital OPD Entry Pass</div>
                <h3 style="font-size:1.25rem; font-weight:800; margin:4px 0 2px;">HEALIX CONSULTATION PASS</h3>
                <div style="font-size:0.8rem; color:#CCFBF1;" id="modalSlipId">#APT-1082</div>
            </div>
            <div style="padding:24px;">
                <div style="text-align:center; background:#F0FDFA; border:2px dashed #99F6E4; border-radius:14px; padding:16px; margin-bottom:18px;">
                    <div style="font-size:0.75rem; color:#0F766E; font-weight:700; text-transform:uppercase;">OPD Queue Token</div>
                    <div style="font-size:2.8rem; font-weight:900; color:#0D9488; margin:2px 0;">#01</div>
                    <div style="font-size:0.82rem; color:#065F46; font-weight:700;">CONFIRMED CONSULTATION</div>
                </div>
                <div style="font-size:0.86rem; color:#334155; line-height:1.7; margin-bottom:18px;" id="modalSlipDetails"></div>
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <div style="display:flex; gap:8px;">
                        <button onclick="downloadOfficialAppointmentLetter(window.currentSlipApptId || 1082)" class="btn btn-teal w-100" style="padding:10px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:6px;">
                            <i class="bi bi-file-earmark-arrow-down-fill"></i> Download Letter
                        </button>
                        <button onclick="openPaymentQrModal(window.currentSlipApptId || 1082, window.currentSlipDoc || 'Dr. Rajesh Kumar', window.currentSlipHosp || 'MediCare City Hospital', 800)" class="btn w-100" style="background:#4F46E5; color:#fff; padding:10px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:6px;">
                            <i class="bi bi-qr-code"></i> Pay Fee (UPI QR)
                        </button>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button onclick="printOfficialAppointmentLetter(window.currentSlipApptId || 1082)" class="btn btn-outline w-100" style="padding:8px; font-weight:600;"><i class="bi bi-printer"></i> Print / Save PDF</button>
                        <button onclick="document.getElementById('apptsSlipModal').style.display='none'" class="btn btn-outline w-100" style="padding:8px; font-weight:600;">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;
apptsHtml = apptsHtml.replace(/<div class="table-container">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/main>/, `${patientApptsTableBlock}</div></div></main>`);

const patientApptsScript = `
<script src="/js/clinical-store.js"></script>
<script src="/js/patient-features.js"></script>
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
                    ? '<span class="badge badge-confirmed" style="background:#D1FAE5;color:#065F46;font-weight:700;"><i class="bi bi-check-circle-fill"></i> CONFIRMED</span>'
                    : (a.status === 'COMPLETED' ? '<span class="badge badge-completed" style="background:#E0F2FE;color:#0369A1;font-weight:700;"><i class="bi bi-check2-all"></i> COMPLETED</span>' : '<span class="badge badge-pending" style="background:#FEF3C7;color:#92400E;font-weight:700;"><i class="bi bi-clock"></i> PENDING</span>');
                
                const isPaid = (a.paymentStatus === 'PAID');
                const paymentBadge = isPaid
                    ? '<span class="badge" style="background:#D1FAE5;color:#065F46;font-weight:700;"><i class="bi bi-patch-check-fill"></i> ₹' + (a.fee || 800) + ' PAID</span>'
                    : \`<button onclick="openPaymentQrModal('\${a.id}', '\${a.doctorName}', '\${a.hospitalName}', \${a.fee || 800})" class="btn btn-xs" style="background:#4F46E5;color:#fff;font-weight:700;padding:4px 10px;border-radius:6px;font-size:0.75rem;cursor:pointer;"><i class="bi bi-qr-code"></i> Pay ₹\${a.fee || 800}</button>\`;

                return \`
                    <tr>
                        <td style="font-weight:800;color:#0F2042;">#APT-\${a.id}</td>
                        <td>
                            <div style="font-weight:800;color:#0F2042;">\${a.doctorName}</div>
                            <div style="font-size:0.76rem;color:#0D9488;font-weight:600;"><i class="bi bi-geo-alt"></i> \${a.hospitalName}</div>
                        </td>
                        <td>
                            <div style="font-weight:700;color:#1E293B;">\${a.date}</div>
                            <div style="font-weight:800;color:#0D9488;font-size:0.85rem;">\${a.time}</div>
                        </td>
                        <td style="font-size:0.85rem;color:#475569;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">\${a.reason}</td>
                        <td>\${paymentBadge}</td>
                        <td>\${statusBadge}</td>
                        <td>
                            <div style="display:flex;gap:6px;flex-wrap:wrap;">
                                <button onclick="downloadOfficialAppointmentLetter('\${a.id}')" class="btn btn-sm btn-teal" style="font-weight:700;display:flex;align-items:center;gap:4px;" title="Download Official Letter"><i class="bi bi-file-earmark-arrow-down-fill"></i> Letter</button>
                                <button onclick="openPaymentQrModal('\${a.id}', '\${a.doctorName}', '\${a.hospitalName}', \${a.fee || 800})" class="btn btn-sm btn-outline" title="UPI Payment QR Code" style="display:flex;align-items:center;gap:4px;"><i class="bi bi-qr-code"></i> Pay</button>
                                <button onclick="viewSlip('\${a.id}')" class="btn btn-sm btn-outline" title="Digital Slip"><i class="bi bi-receipt"></i></button>
                                <button onclick="cancelAppt('\${a.id}')" class="btn btn-sm btn-outline" style="color:#EF4444;border-color:#FCA5A5;" title="Cancel Appointment"><i class="bi bi-x"></i></button>
                            </div>
                        </td>
                    </tr>
                \`;
            }).join('');
        }
    }

    function viewSlip(apptId) {
        const appts = HealixStore.getAppointments();
        const a = appts.find(item => item.id == apptId);
        if (!a) return;
        window.currentSlipApptId = a.id;
        window.currentSlipDoc = a.doctorName;
        window.currentSlipHosp = a.hospitalName;

        document.getElementById('modalSlipId').innerText = '#APT-' + a.id;
        document.getElementById('modalSlipDetails').innerHTML = \`
            <div style="display:flex;justify-content:space-between;border-bottom:1px solid #F1F5F9;padding-bottom:6px;">
                <span style="color:#64748B;">Patient:</span>
                <strong>Arun Chandran (PAT-TRV-000001)</strong>
            </div>
            <div style="display:flex;justify-content:space-between;border-bottom:1px solid #F1F5F9;padding:6px 0;">
                <span style="color:#64748B;">Consulting Doctor:</span>
                <strong>\${a.doctorName}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;border-bottom:1px solid #F1F5F9;padding:6px 0;">
                <span style="color:#64748B;">Hospital Facility:</span>
                <strong>\${a.hospitalName}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;border-bottom:1px solid #F1F5F9;padding:6px 0;">
                <span style="color:#64748B;">Date & Slot:</span>
                <strong style="color:#0D9488;">\${a.date} at \${a.time}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;border-bottom:1px solid #F1F5F9;padding:6px 0;">
                <span style="color:#64748B;">Billing Clearance:</span>
                <strong style="color:\${a.paymentStatus === 'PAID' ? '#059669' : '#D97706'};">\${a.paymentStatus === 'PAID' ? 'PAID (VERIFIED VIA UPI)' : 'PENDING PAYMENT (₹' + (a.fee || 800) + ')'}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;padding-top:6px;">
                <span style="color:#64748B;">Reporting Time:</span>
                <strong style="color:#E11D48;">15 Minutes Prior</strong>
            </div>
        \`;
        document.getElementById('apptsSlipModal').style.display = 'flex';
    }

    function cancelAppt(apptId) {
        if (!confirm('Are you sure you want to cancel appointment #APT-' + apptId + '?')) return;
        let appts = HealixStore.getAppointments().filter(a => a.id != apptId);
        HealixStore.saveAppointments(appts);
        renderPatientAppointments();
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

patDocsHtml = patDocsHtml
    .replace(/<nav class="sidebar-nav">[\s\S]*?<\/nav>/, renderPatientSidebarNav('doctors'))
    .replace(/<a href="\/logout"/g, '<a href="/logout" onclick="localStorage.removeItem(\'healix_user\')"');

const richDocsContent = `
        <div class="page-content">
            <!-- Search & Filter Card -->
            <div class="card mb-4" style="box-shadow: 0 4px 12px rgba(0,0,0,0.03); border-radius: 14px;">
                <div class="card-body" style="padding: 20px 24px;">
                    <div style="display:flex; gap:16px; flex-wrap:wrap; align-items:flex-end;">
                        <div class="form-group" style="margin:0; flex: 2; min-width: 240px;">
                            <label class="form-label" style="font-weight: 700; color: #1E293B; margin-bottom: 4px;">Search by Doctor Name or Specialty</label>
                            <div style="position:relative;">
                                <input type="text" id="docSearchInput" class="form-control" placeholder="e.g. Dr. Rajesh, Cardiology, Orthopedics..." style="padding: 10px 38px 10px 14px; border-radius: 8px;"/>
                                <i class="bi bi-search" style="position:absolute; right:14px; top:50%; transform:translateY(-50%); color:#9CA3AF;"></i>
                            </div>
                        </div>
                        <div class="form-group" style="margin:0; flex: 1; min-width: 200px;">
                            <label class="form-label" style="font-weight: 700; color: #1E293B; margin-bottom: 4px;">Filter by Department</label>
                            <select id="deptFilterSelect" class="form-control form-select" style="padding: 10px 14px; border-radius: 8px;">
                                <option value="">All Clinical Departments</option>
                                <option value="Cardiology">Cardiology</option>
                                <option value="Neurology">Neurology</option>
                                <option value="Orthopedics">Orthopedics</option>
                                <option value="General Medicine">General Medicine</option>
                                <option value="Pulmonology">Pulmonology</option>
                                <option value="Pediatrics">Pediatrics</option>
                            </select>
                        </div>
                        <button type="button" onclick="filterDoctors()" class="btn btn-teal" style="padding: 10px 18px; font-weight: 600; border-radius: 8px;"><i class="bi bi-funnel"></i> Apply Filter</button>
                        <button type="button" onclick="resetFilters()" class="btn btn-outline" style="padding: 10px 18px; font-weight: 600; border-radius: 8px;">Reset</button>
                    </div>
                </div>
            </div>

            <!-- Doctors Grid -->
            <div id="doctorsGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
                ${PATIENT_DOCTORS.map(d => `
                    <div class="card doctor-card" data-name="${d.name.toLowerCase()}" data-spec="${d.specialization.toLowerCase()}" data-dept="${d.department}" style="display: flex; flex-direction: column; justify-content: space-between; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 4px 14px rgba(0,0,0,0.03); transition: transform 0.2s ease, box-shadow 0.2s ease;">
                        <div class="card-body" style="padding: 24px;">
                            <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px;">
                                <div style="width: 54px; height: 54px; border-radius: 14px; background: linear-gradient(135deg, #0D9488, #059669); color: #fff; font-size: 1.3rem; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(13, 148, 136, 0.25);">
                                    ${d.name.split(' ').map(w => w[0]).join('').slice(0,2)}
                                </div>
                                <div style="flex: 1;">
                                    <h4 style="font-size: 1.15rem; font-weight: 800; color: #0F2042; margin: 0 0 4px;">Dr. ${d.name}</h4>
                                    <span class="badge" style="background: #EDE9FE; color: #6D28D9; font-weight: 700; font-size: 0.76rem; padding: 3px 8px; border-radius: 6px;">${d.department}</span>
                                    <div style="font-size: 0.8rem; color: #64748B; margin-top: 4px;">${d.qualification}</div>
                                    <div style="font-size: 0.78rem; color: #0D9488; font-weight: 600; margin-top: 2px;"><i class="bi bi-hospital"></i> ${d.hospital}</div>
                                </div>
                            </div>

                            <p style="font-size: 0.86rem; color: #4B5563; line-height: 1.5; margin-bottom: 18px; min-height: 52px;">
                                ${d.bio}
                            </p>

                            <div style="background: #F8FAFC; border-radius: 10px; padding: 12px 16px; margin-bottom: 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; border: 1px solid #E2E8F0;">
                                <div>
                                    <div style="font-size: 0.7rem; color: #94A3B8; text-transform: uppercase; font-weight: 700;">Experience</div>
                                    <div style="font-weight: 800; color: #1E293B; font-size: 0.95rem;">${d.experienceYears} Years</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.7rem; color: #94A3B8; text-transform: uppercase; font-weight: 700;">Consultation Fee</div>
                                    <div style="font-weight: 800; color: #0D9488; font-size: 0.95rem;">₹${d.consultationFee}</div>
                                </div>
                                <div style="grid-column: span 2;">
                                    <div style="font-size: 0.7rem; color: #94A3B8; text-transform: uppercase; font-weight: 700;">OPD Schedule</div>
                                    <div style="font-size: 0.8rem; font-weight: 600; color: #334155;">${d.availability}</div>
                                </div>
                            </div>

                            <a href="/patient/book-appointment?doctorId=${d.id}" class="btn btn-teal btn-block" style="width: 100%; justify-content: center; padding: 10px 0; font-weight: 700; border-radius: 8px; display: flex; align-items: center; gap: 8px;">
                                <i class="bi bi-calendar2-plus"></i> Book Consultation
                            </a>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Empty State for no search matches -->
            <div id="noDocsMatch" class="card" style="display: none; margin-top: 20px;">
                <div class="card-body" style="padding: 48px 24px; text-align: center;">
                    <div style="font-size: 3rem; color: #9CA3AF; margin-bottom: 12px;"><i class="bi bi-person-x"></i></div>
                    <h3 style="font-size: 1.1rem; color: #374151;">No doctors found matching criteria</h3>
                    <p style="color: #6B7280; font-size: 0.9rem;">Try selecting a different clinical department or clearing the search query.</p>
                    <button type="button" onclick="resetFilters()" class="btn btn-teal btn-sm mt-3"><i class="bi bi-arrow-clockwise"></i> View All Doctors</button>
                </div>
            </div>
        </div>
`;

patDocsHtml = patDocsHtml.replace(/<div class="page-content">[\s\S]*?<\/main>/, richDocsContent + '</main>');

const richDocsScript = `
<script>
    function filterDoctors() {
        const query = (document.getElementById('docSearchInput').value || '').toLowerCase().trim();
        const dept = document.getElementById('deptFilterSelect').value;
        const cards = document.querySelectorAll('.doctor-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const name = card.getAttribute('data-name');
            const spec = card.getAttribute('data-spec');
            const cardDept = card.getAttribute('data-dept');

            const matchesQuery = !query || name.includes(query) || spec.includes(query);
            const matchesDept = !dept || cardDept === dept;

            if (matchesQuery && matchesDept) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        const empty = document.getElementById('noDocsMatch');
        if (empty) empty.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    document.getElementById('docSearchInput').addEventListener('input', filterDoctors);
    document.getElementById('deptFilterSelect').addEventListener('change', filterDoctors);

    function resetFilters() {
        document.getElementById('docSearchInput').value = '';
        document.getElementById('deptFilterSelect').value = '';
        filterDoctors();
    }
</script>
`;
patDocsHtml = patDocsHtml.replace('</body>', `${richDocsScript}</body>`);
writePage('patient/doctors/index.html', patDocsHtml);

// ----------------------------------------------------
// 14. Generate Patient My Hospitals (/patient/hospitals/index.html)
// ----------------------------------------------------
const rawPatHosps = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'patient', 'hospitals.html'), 'utf8');
let patHospsHtml = cleanThymeleaf(rawPatHosps);

patHospsHtml = patHospsHtml
    .replace(/<nav class="sidebar-nav">[\s\S]*?<\/nav>/, renderPatientSidebarNav('hospitals'))
    .replace('<span th:text="${patient.name}">Patient Name</span>', 'Arun Chandran')
    .replace('th:text="${patient.patientIdentifier}"', '')
    .replace('<span class="hospital-badge" style="font-size: 0.9rem;">PAT-TRV-000102</span>', '<span class="hospital-badge" style="font-size: 0.9rem;">PAT-TRV-000001</span>')
    .replace(/<a href="\/logout"/g, '<a href="/logout" onclick="localStorage.removeItem(\'healix_user\')"');

const myHospsGridHtml = `
    <div class="hospital-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-bottom: 2.5rem;">
        <div class="hospital-card" style="border-top: 4px solid #8070A6; background:#fff; border-radius:16px; border:1px solid #E5E7EB; padding:1.5rem; box-shadow:0 4px 12px rgba(0,0,0,0.03);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
                <div>
                    <span class="hospital-badge" style="background:#EDE7F6; color:#5E35B1; padding:3px 8px; border-radius:6px; font-size:0.75rem; font-weight:700;">TRV-HOSP-01</span>
                    <h3 style="font-size:1.25rem; font-weight:700; color:#111827; margin:6px 0 2px;">MediCare City Hospital</h3>
                    <div style="font-size:0.82rem; color:#6B7280;">MG Road, Statue, Thiruvananthapuram</div>
                </div>
                <span class="badge badge-confirmed" style="background:#D1FAE5; color:#065F46; padding:3px 10px; border-radius:9999px; font-size:0.75rem; font-weight:700;">PRIMARY CARE</span>
            </div>
            <div style="background:#F8FAFC; border-radius:10px; padding:12px; margin-bottom:1rem; font-size:0.85rem; border:1px solid #E2E8F0;">
                <div style="color:#64748B; font-size:0.75rem;">Hospital Patient Code</div>
                <strong style="color:#0F2042; font-size:1rem;">TRV-HOSP-01-P-0001</strong>
            </div>
            <a href="/patient/book-appointment" class="ref-pill-btn" style="width:100%; justify-content:center; padding:8px 0; font-size:0.85rem; display:flex; align-items:center; gap:6px;">
                <i class="bi bi-calendar-plus"></i> Book Consultation
            </a>
        </div>

        <div class="hospital-card" style="border-top: 4px solid #0D9488; background:#fff; border-radius:16px; border:1px solid #E5E7EB; padding:1.5rem; box-shadow:0 4px 12px rgba(0,0,0,0.03);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
                <div>
                    <span class="hospital-badge" style="background:#CCFBF1; color:#0F766E; padding:3px 8px; border-radius:6px; font-size:0.75rem; font-weight:700;">TRV-HOSP-02</span>
                    <h3 style="font-size:1.25rem; font-weight:700; color:#111827; margin:6px 0 2px;">Trivandrum Medical Trust</h3>
                    <div style="font-size:0.82rem; color:#6B7280;">Pattom Palace PO, Medical College Road</div>
                </div>
                <span class="badge badge-confirmed" style="background:#D1FAE5; color:#065F46; padding:3px 10px; border-radius:9999px; font-size:0.75rem; font-weight:700;">REGISTERED</span>
            </div>
            <div style="background:#F8FAFC; border-radius:10px; padding:12px; margin-bottom:1rem; font-size:0.85rem; border:1px solid #E2E8F0;">
                <div style="color:#64748B; font-size:0.75rem;">Hospital Patient Code</div>
                <strong style="color:#0F2042; font-size:1rem;">TRV-HOSP-02-P-0042</strong>
            </div>
            <a href="/patient/book-appointment" class="ref-pill-btn" style="width:100%; justify-content:center; padding:8px 0; font-size:0.85rem; display:flex; align-items:center; gap:6px;">
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

patRecordsHtml = patRecordsHtml
    .replace(/<nav class="sidebar-nav">[\s\S]*?<\/nav>/, renderPatientSidebarNav('records'))
    .replace(/<a href="\/logout"/g, '<a href="/logout" onclick="localStorage.removeItem(\'healix_user\')"');

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
                <button onclick="window.print()" class="btn btn-teal btn-sm" style="font-weight:600;"><i class="bi bi-printer"></i> Print Record</button>
                <a href="/patient/prescriptions" class="btn btn-outline btn-sm" style="font-weight:600;"><i class="bi bi-capsule"></i> View Prescriptions</a>
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

patRxHtml = patRxHtml
    .replace(/<nav class="sidebar-nav">[\s\S]*?<\/nav>/, renderPatientSidebarNav('prescriptions'))
    .replace(/<a href="\/logout"/g, '<a href="/logout" onclick="localStorage.removeItem(\'healix_user\')"');

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
                    <div>
                        <div style="font-size:0.78rem; color:#64748B; display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #E2E8F0; padding-top:12px; margin-top:8px;">
                            <span><i class="bi bi-calendar-event"></i> Issued: \${p.issuedDate}</span>
                            <span style="color:#0D9488; font-weight:700;"><i class="bi bi-shield-check"></i> Digitally Signed</span>
                        </div>
                        <button onclick="alert('Refill order request placed for ' + '\${p.medicineName}' + '! Sent to MediCare Pharmacy counter for fast-track dispensation.');" class="btn btn-outline btn-sm w-100" style="margin-top:10px; justify-content:center; display:flex; align-items:center; gap:6px;">
                            <i class="bi bi-arrow-repeat"></i> Request Pharmacy Refill
                        </button>
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

patConsentHtml = patConsentHtml
    .replace(/<nav class="sidebar-nav">[\s\S]*?<\/nav>/, renderPatientSidebarNav('consents'))
    .replace(/<a href="\/logout"/g, '<a href="/logout" onclick="localStorage.removeItem(\'healix_user\')"');

const consentContentHtml = `
    <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 2.5rem;">
        <div style="background: #fff; border-radius: 16px; border: 1px solid #E5E7EB; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <div>
                    <h4 style="font-size: 1.15rem; font-weight: 700; color: #111827; margin:0 0 4px;">Dr. Suresh Menon (Orthopedics)</h4>
                    <div style="font-size: 0.85rem; color: #6B7280;">Trivandrum Medical Trust • TRV-HOSP-02</div>
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
    .replace(/<nav class="sidebar-nav">[\s\S]*?<\/nav>/, renderPatientSidebarNav('profile'))
    .replace(/<a href="\/logout"/g, '<a href="/logout" onclick="localStorage.removeItem(\'healix_user\')"');

const richProfileContent = `
        <div class="page-content">
            <div id="profileSuccessAlert" style="display:none; background: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; padding: 14px 18px; border-radius: 12px; margin-bottom: 20px; font-weight: 600;">
                <i class="bi bi-check-circle-fill"></i> Profile updated successfully! All participating hospitals in Thiruvananthapuram will now reflect your updated medical identity.
            </div>

            <div class="grid-2" style="gap: 24px; align-items: flex-start;">

                <!-- Profile Summary Card -->
                <div class="card" style="box-shadow: 0 4px 16px rgba(0,0,0,0.04); border-radius: 16px;">
                    <div class="card-body" style="padding: 28px; text-align: center;">
                        <div style="width: 80px; height: 80px; border-radius: 50%; background: #0D9488; color: #fff; margin: 0 auto 16px; font-size: 2.2rem; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 16px rgba(13,148,136,0.3);">
                            AC
                        </div>
                        <h3 style="font-size: 1.35rem; font-weight: 800; color: #0F2042; margin-bottom: 4px;" id="dispProfileName">Arun Chandran</h3>
                        <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 12px;">
                            <span class="badge" style="background:#CCFBF1; color:#0F766E; font-weight:700;">CENTRAL ID: PAT-TRV-000001</span>
                            <span class="badge" style="background:#D1FAE5; color:#065F46; font-weight:700;"><i class="bi bi-patch-check-fill"></i> VERIFIED</span>
                        </div>

                        <div style="margin-top: 24px; border-top: 1px solid #E2E8F0; padding-top: 20px; text-align: left; display: flex; flex-direction: column; gap: 12px; font-size: 0.88rem;">
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:#64748B;">Email:</span>
                                <strong style="color:#1E293B;" id="dispProfileEmail">patient@healix.com</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:#64748B;">Phone:</span>
                                <strong style="color:#1E293B;" id="dispProfilePhone">+91 98765 10001</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:#64748B;">Blood Group:</span>
                                <strong style="color:#0D9488;" id="dispProfileBg">B+ Positive</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:#64748B;">Gender / Age:</span>
                                <strong style="color:#1E293B;">Male / 34 Years</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:#64748B;">Primary Hospital:</span>
                                <strong style="color:#1E293B;">MediCare City Hospital</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:#64748B;">Registration City:</span>
                                <strong style="color:#1E293B;">Thiruvananthapuram, Kerala</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Edit Profile Form -->
                <div class="card" style="box-shadow: 0 4px 16px rgba(0,0,0,0.04); border-radius: 16px;">
                    <div class="card-header" style="border-bottom: 1px solid #F1F5F9; padding: 18px 24px;">
                        <h5 style="margin:0; font-size: 1.05rem; font-weight: 700; color: #0F2042;">
                            <i class="bi bi-pencil-square" style="color:#0D9488;"></i> Edit Personal &amp; Emergency Details
                        </h5>
                    </div>
                    <div class="card-body" style="padding: 24px;">
                        <form id="editProfileForm">
                            <div class="form-group" style="margin-bottom: 16px;">
                                <label class="form-label" style="font-weight: 700; color: #1E293B;">Full Name <span class="required" style="color:#EF4444;">*</span></label>
                                <input type="text" id="profInputName" class="form-control" value="Arun Chandran" required style="padding: 10px 14px; border-radius: 8px;"/>
                            </div>

                            <div class="grid-2" style="gap: 14px; margin-bottom: 16px;">
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-weight: 700; color: #1E293B;">Email Address (Central Login)</label>
                                    <input type="email" id="profInputEmail" class="form-control" value="patient@healix.com" readonly style="background:#F1F5F9; padding: 10px 14px; border-radius: 8px;"/>
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-weight: 700; color: #1E293B;">Phone Number <span class="required" style="color:#EF4444;">*</span></label>
                                    <input type="tel" id="profInputPhone" class="form-control" value="9876510001" required style="padding: 10px 14px; border-radius: 8px;"/>
                                </div>
                            </div>

                            <div class="grid-2" style="gap: 14px; margin-bottom: 16px;">
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-weight: 700; color: #1E293B;">Date of Birth</label>
                                    <input type="date" id="profInputDob" class="form-control" value="1992-05-14" style="padding: 10px 14px; border-radius: 8px;"/>
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-weight: 700; color: #1E293B;">Blood Group</label>
                                    <select id="profInputBg" class="form-control form-select" style="padding: 10px 14px; border-radius: 8px;">
                                        <option value="A_POSITIVE">A+ (A Positive)</option>
                                        <option value="A_NEGATIVE">A- (A Negative)</option>
                                        <option value="B_POSITIVE" selected>B+ (B Positive)</option>
                                        <option value="B_NEGATIVE">B- (B Negative)</option>
                                        <option value="AB_POSITIVE">AB+ (AB Positive)</option>
                                        <option value="AB_NEGATIVE">AB- (AB Negative)</option>
                                        <option value="O_POSITIVE">O+ (O Positive)</option>
                                        <option value="O_NEGATIVE">O- (O Negative)</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group" style="margin-bottom: 16px;">
                                <label class="form-label" style="font-weight: 700; color: #1E293B;">Residential Address</label>
                                <textarea id="profInputAddress" class="form-control" rows="2" style="padding: 10px 14px; border-radius: 8px;">TC 14/820, Kowdiar Gardens, Kowdiar PO, Thiruvananthapuram - 695003</textarea>
                            </div>

                            <div class="grid-2" style="gap: 14px; margin-bottom: 20px;">
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-weight: 700; color: #1E293B;">Emergency Contact Person</label>
                                    <input type="text" id="profInputEmergName" class="form-control" value="Deepa Chandran (Spouse)" style="padding: 10px 14px; border-radius: 8px;"/>
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-weight: 700; color: #1E293B;">Emergency Contact Phone</label>
                                    <input type="tel" id="profInputEmergPhone" class="form-control" value="9876510099" style="padding: 10px 14px; border-radius: 8px;"/>
                                </div>
                            </div>

                            <button type="submit" class="btn btn-teal btn-block btn-lg" style="width: 100%; padding: 12px; font-weight: 700; border-radius: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                <i class="bi bi-save"></i> Save Profile Changes
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
`;

patProfileHtml = patProfileHtml.replace(/<div class="page-content">[\s\S]*?<\/main>/, richProfileContent + '</main>');

const richProfileScript = `
<script>
    const user = JSON.parse(localStorage.getItem('healix_user') || '{"name":"Arun Chandran","email":"patient@healix.com","role":"PATIENT","phone":"9876510001"}');
    if (user.name) {
        document.getElementById('profInputName').value = user.name;
        document.getElementById('dispProfileName').innerText = user.name;
    }
    if (user.email) {
        document.getElementById('profInputEmail').value = user.email;
        document.getElementById('dispProfileEmail').innerText = user.email;
    }
    if (user.phone) {
        document.getElementById('profInputPhone').value = user.phone;
        document.getElementById('dispProfilePhone').innerText = '+91 ' + user.phone;
    }

    document.getElementById('editProfileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const newName = document.getElementById('profInputName').value;
        const newPhone = document.getElementById('profInputPhone').value;
        const newBg = document.getElementById('profInputBg').selectedOptions[0].text;

        user.name = newName;
        user.phone = newPhone;
        localStorage.setItem('healix_user', JSON.stringify(user));

        document.getElementById('dispProfileName').innerText = newName;
        document.getElementById('dispProfilePhone').innerText = '+91 ' + newPhone;
        document.getElementById('dispProfileBg').innerText = newBg;

        const alertBox = document.getElementById('profileSuccessAlert');
        alertBox.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => { alertBox.style.display = 'none'; }, 4000);
    });
</script>
`;
patProfileHtml = patProfileHtml.replace('</body>', `${richProfileScript}</body>`);
writePage('patient/profile/index.html', patProfileHtml);

// ----------------------------------------------------
// 19. Generate Patient Notifications (/patient/notifications/index.html)
// ----------------------------------------------------
const rawPatNotifs = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'patient', 'notifications.html'), 'utf8');
let patNotifsHtml = cleanThymeleaf(rawPatNotifs);

patNotifsHtml = patNotifsHtml
    .replace(/<nav class="sidebar-nav">[\s\S]*?<\/nav>/, renderPatientSidebarNav('notifications'))
    .replace(/<a href="\/logout"/g, '<a href="/logout" onclick="localStorage.removeItem(\'healix_user\')"');

const patNotifsListHtml = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="display: flex; align-items: flex-start; gap: 16px; padding: 16px 20px; border-radius: 12px; border: 1px solid #99F6E4; background: #F0FDFA; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
            <div style="width: 42px; height: 42px; border-radius: 50%; background: #0D9488; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">
                <i class="bi bi-calendar-check-fill"></i>
            </div>
            <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <strong style="color: #0F2042; font-size: 1rem;">Appointment Confirmed • Token #01</strong>
                    <span style="font-size: 0.78rem; color: #94A3B8;">Today, 08:30 AM</span>
                </div>
                <p style="color: #475569; font-size: 0.88rem; margin: 0; line-height: 1.5;">Your appointment with Dr. Rajesh Kumar at MediCare City Hospital is confirmed for tomorrow at 09:30 AM (Token #1 in Cardiology OPD Room 104).</p>
            </div>
        </div>

        <div style="display: flex; align-items: flex-start; gap: 16px; padding: 16px 20px; border-radius: 12px; border: 1px solid #E2E8F0; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
            <div style="width: 42px; height: 42px; border-radius: 50%; background: #6366F1; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">
                <i class="bi bi-file-earmark-medical-fill"></i>
            </div>
            <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <strong style="color: #0F2042; font-size: 1rem;">Diagnostic Lab Result Uploaded</strong>
                    <span style="font-size: 0.78rem; color: #94A3B8;">Yesterday</span>
                </div>
                <p style="color: #475569; font-size: 0.88rem; margin: 0; line-height: 1.5;">Your Fasting Lipid Profile and 12-Lead Resting ECG reports from MediCare Diagnostics are now securely archived in your Medical Records vault.</p>
            </div>
        </div>

        <div style="display: flex; align-items: flex-start; gap: 16px; padding: 16px 20px; border-radius: 12px; border: 1px solid #E2E8F0; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
            <div style="width: 42px; height: 42px; border-radius: 50%; background: #10B981; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">
                <i class="bi bi-capsule"></i>
            </div>
            <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <strong style="color: #0F2042; font-size: 1rem;">Active Medication Course Active</strong>
                    <span style="font-size: 0.78rem; color: #94A3B8;">3 days ago</span>
                </div>
                <p style="color: #475569; font-size: 0.88rem; margin: 0; line-height: 1.5;">Daily reminder: Take your evening dose of Atorvastatin 20mg after dinner and record your morning resting pulse rate.</p>
            </div>
        </div>
    </div>
    <div style="margin-top: 16px; text-align: right;">
        <button onclick="alert('All notifications marked as read.'); this.style.opacity='0.6';" class="btn btn-outline btn-sm" style="font-weight: 600;"><i class="bi bi-check2-all"></i> Mark All as Read</button>
    </div>
`;
patNotifsHtml = patNotifsHtml.replace(/<div class="card-body"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/main>/, `<div class="card-body" style="padding: 20px 24px;">${patNotifsListHtml}</div></div></div></main>`);
writePage('patient/notifications/index.html', patNotifsHtml);

// ----------------------------------------------------
// 20. Generate Doctor Dashboard (/doctor/dashboard/index.html)
// ----------------------------------------------------
const rawDocDash = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'doctor', 'dashboard.html'), 'utf8');

// Replace top header items directly
let docDashHtml = rawDocDash
    .replace("<span th:text=\"'Dr. ' + ${doctor.name}\">Doctor</span>", '<span id="docHeaderName">Dr. Rajesh Kumar</span>')
    .replace('<div class="header-subtitle" th:text="${#temporals.format(#temporals.createNow(), \'EEEE, dd MMMM yyyy\')}">Today</div>', `<div class="header-subtitle" id="docHeaderSubtitle">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>`)
    .replace(/<div class="avatar avatar-sm"[^>]*>D<\/div>/, '<div class="avatar avatar-sm" id="docHeaderAvatar" style="background:#6366F1;color:#fff;">R</div>');

const docDashPageContent = `
        <div class="page-content">

            <!-- Stats -->
            <div class="stat-grid">
                <div class="stat-card">
                    <div class="stat-icon indigo"><i class="bi bi-calendar-day-fill"></i></div>
                    <div class="stat-info">
                        <div class="stat-value" id="docStatToday">3</div>
                        <div class="stat-label">Today's Appointments</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon amber"><i class="bi bi-hourglass-split"></i></div>
                    <div class="stat-info">
                        <div class="stat-value" id="docStatPending">1</div>
                        <div class="stat-label">Pending</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon blue"><i class="bi bi-calendar-check-fill"></i></div>
                    <div class="stat-info">
                        <div class="stat-value" id="docStatConfirmed">2</div>
                        <div class="stat-label">Confirmed</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green"><i class="bi bi-check-circle-fill"></i></div>
                    <div class="stat-info">
                        <div class="stat-value" id="docStatCompleted">0</div>
                        <div class="stat-label">Completed</div>
                    </div>
                </div>
            </div>

            <!-- Doctor Info + Today's Schedule -->
            <div class="grid-2" style="gap:20px;">
                <!-- Doctor Card -->
                <div class="card">
                    <div class="card-header">
                        <h5><i class="bi bi-person-badge" style="color:#6366F1;"></i> My Profile</h5>
                        <a href="/doctor/profile" class="btn btn-sm btn-outline">Edit</a>
                    </div>
                    <div class="card-body">
                        <div style="display:flex;align-items:center;gap:18px;margin-bottom:20px;">
                            <div class="avatar avatar-lg" id="docCardAvatar" style="background:#6366F1;color:#fff;">R</div>
                            <div>
                                <div style="font-size:1.1rem;font-weight:700;" id="docCardName">Dr. Rajesh Kumar</div>
                                <div style="color:#6366F1;font-weight:600;font-size:0.875rem;" id="docCardSpec">Senior Cardiologist</div>
                                <div style="color:#9CA3AF;font-size:0.78rem;" id="docCardQual">MBBS, MD (Cardiology), DM (Cardiology)</div>
                            </div>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:10px;">
                            <div class="doctor-info-item">
                                <i class="bi bi-building"></i>
                                <span id="docCardDept">Cardiology • MediCare City Hospital</span>
                            </div>
                            <div class="doctor-info-item">
                                <i class="bi bi-award"></i>
                                <span id="docCardExp">15 years clinical experience</span>
                            </div>
                            <div class="doctor-info-item">
                                <i class="bi bi-clock"></i>
                                <span id="docCardAvail">Mon-Sat: 9AM-1PM, 3PM-6PM (OPD Room 104)</span>
                            </div>
                            <div class="doctor-info-item">
                                <i class="bi bi-envelope"></i>
                                <span id="docCardEmail">doctor@healix.com (Fee: ₹800.00)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Today's Appointments -->
                <div class="card">
                    <div class="card-header">
                        <h5><i class="bi bi-calendar-day" style="color:#3B82F6;"></i> Today's Schedule</h5>
                        <a href="/doctor/appointments" class="btn btn-sm btn-outline">View All</a>
                    </div>
                    <div class="table-container" id="docTodayTableContainer">
                        <table class="data-table">
                            <thead><tr><th>Time</th><th>Patient</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody>
                                <tr>
                                    <td style="font-weight:700;color:#6366F1;">09:30 AM</td>
                                    <td>
                                        <div style="font-weight:600;">Arun Chandran</div>
                                        <div style="font-size:0.72rem;color:#9CA3AF;">9876510001 • PAT-TRV-000001</div>
                                    </td>
                                    <td style="font-size:0.82rem;color:#4B5563;">Chest pain evaluation &amp; ECG triage</td>
                                    <td><span class="badge badge-confirmed">CONFIRMED</span></td>
                                    <td><a href="/doctor/medical-records" class="btn btn-sm btn-outline"><i class="bi bi-pencil-square"></i> Record</a></td>
                                </tr>
                                <tr>
                                    <td style="font-weight:700;color:#6366F1;">11:00 AM</td>
                                    <td>
                                        <div style="font-weight:600;">Divya Rajan</div>
                                        <div style="font-size:0.72rem;color:#9CA3AF;">9876510003 • PAT-TRV-000002</div>
                                    </td>
                                    <td style="font-size:0.82rem;color:#4B5563;">Hypertension checkup &amp; medication review</td>
                                    <td><span class="badge badge-confirmed">CONFIRMED</span></td>
                                    <td><a href="/doctor/medical-records" class="btn btn-sm btn-outline"><i class="bi bi-pencil-square"></i> Record</a></td>
                                </tr>
                                <tr>
                                    <td style="font-weight:700;color:#6366F1;">03:30 PM</td>
                                    <td>
                                        <div style="font-weight:600;">Mohammed Faisal</div>
                                        <div style="font-size:0.72rem;color:#9CA3AF;">9876510005 • PAT-TRV-000003</div>
                                    </td>
                                    <td style="font-size:0.82rem;color:#4B5563;">Cardiac stress test review</td>
                                    <td><span class="badge badge-pending">PENDING</span></td>
                                    <td><button onclick="confirmAppt(1085)" class="btn btn-sm btn-indigo"><i class="bi bi-check-lg"></i> Confirm</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="card mt-4">
                <div class="card-header"><h5><i class="bi bi-lightning-charge" style="color:#F59E0B;"></i> Quick Actions</h5></div>
                <div class="card-body">
                    <div style="display:flex;gap:12px;flex-wrap:wrap;">
                        <a href="/doctor/appointments" class="btn btn-indigo"><i class="bi bi-calendar2-check"></i> My Appointments</a>
                        <a href="/doctor/patients" class="btn btn-outline"><i class="bi bi-people"></i> My Patients</a>
                        <a href="/doctor/medical-records" class="btn btn-outline"><i class="bi bi-clipboard2-pulse"></i> Medical Records</a>
                        <a href="/doctor/schedule" class="btn btn-outline"><i class="bi bi-clock"></i> Schedule</a>
                    </div>
                </div>
            </div>
        </div>
`;

docDashHtml = docDashHtml.replace(/<div class="page-content">[\s\S]*?<\/main>/, `${docDashPageContent}\n    </main>`);
docDashHtml = cleanThymeleaf(docDashHtml);

const doctorDashboardScript = `
<script src="/js/clinical-store.js"></script>
<script>
    function renderDoctorDashboard() {
        if (typeof HealixStore !== 'undefined') {
            HealixStore.init();
            const doc = HealixStore.getDoctorProfile();
            if (doc) {
                const displayName = doc.fullName || ('Dr. ' + (doc.name || 'Rajesh Kumar'));
                const headerEl = document.getElementById('docHeaderName');
                if (headerEl) headerEl.innerText = displayName;
                const cardNameEl = document.getElementById('docCardName');
                if (cardNameEl) cardNameEl.innerText = displayName;
                const specEl = document.getElementById('docCardSpec');
                if (specEl) specEl.innerText = doc.specialization || 'Senior Cardiologist';
                const qualEl = document.getElementById('docCardQual');
                if (qualEl) qualEl.innerText = doc.qualification || 'MBBS, MD (Cardiology), DM (Cardiology)';
                const deptEl = document.getElementById('docCardDept');
                if (deptEl) deptEl.innerText = (doc.department || 'Cardiology') + ' • ' + (doc.hospital || 'MediCare City Hospital');
                const expEl = document.getElementById('docCardExp');
                if (expEl) expEl.innerText = (doc.experienceYears || '15') + ' years clinical experience';
                const availEl = document.getElementById('docCardAvail');
                if (availEl) availEl.innerText = (doc.availability || 'Mon-Sat: 9AM-1PM, 3PM-6PM') + ' (' + (doc.room || 'OPD Room 104') + ')';
                const emailEl = document.getElementById('docCardEmail');
                if (emailEl) emailEl.innerText = (doc.email || 'doctor@healix.com') + ' (Fee: ₹' + (doc.consultationFee || '800.00') + ')';
                
                const initial = (doc.name || 'R').charAt(0).toUpperCase();
                const headAvatar = document.getElementById('docHeaderAvatar');
                if (headAvatar) headAvatar.innerText = initial;
                const cardAvatar = document.getElementById('docCardAvatar');
                if (cardAvatar) cardAvatar.innerText = initial;
            }

            const appts = HealixStore.getAppointments();
            const pendingCount = appts.filter(a => a.status === 'PENDING').length;
            const confirmedCount = appts.filter(a => a.status === 'CONFIRMED').length;
            const completedCount = appts.filter(a => a.status === 'COMPLETED').length;

            const statToday = document.getElementById('docStatToday');
            if (statToday) statToday.innerText = appts.length;
            const statPending = document.getElementById('docStatPending');
            if (statPending) statPending.innerText = pendingCount;
            const statConfirmed = document.getElementById('docStatConfirmed');
            if (statConfirmed) statConfirmed.innerText = confirmedCount;
            const statCompleted = document.getElementById('docStatCompleted');
            if (statCompleted) statCompleted.innerText = completedCount;

            const tableContainer = document.getElementById('docTodayTableContainer');
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
                                    ? \\\`<button onclick="confirmAppt(\\\${a.id})" class="btn btn-sm btn-indigo"><i class="bi bi-check-lg"></i> Confirm</button>\\\`
                                    : \\\`<a href="/doctor/medical-records" class="btn btn-sm btn-outline"><i class="bi bi-pencil-square"></i> Record</a>\\\`;

                                return \\\`
                                    <tr>
                                        <td style="font-weight:700;color:#6366F1;">\\\${a.time}</td>
                                        <td>
                                            <div style="font-weight:600;">\\\${a.patientName}</div>
                                            <div style="font-size:0.72rem;color:#9CA3AF;">\\\${a.patientPhone} • \\\${a.patientId}</div>
                                        </td>
                                        <td style="font-size:0.82rem;color:#4B5563;">\\\${a.reason}</td>
                                        <td>\\\${badge}</td>
                                        <td>\\\${action}</td>
                                    </tr>
                                \\\`;
                            }).join('')}
                        </tbody>
                    </table>
                \`;
            }
        }
    }

    function confirmAppt(id) {
        if (HealixStore.confirmAppointment(id)) {
            showToast('Appointment #' + id + ' confirmed successfully! Patient notified.');
            renderDoctorDashboard();
        }
    }

    document.addEventListener('DOMContentLoaded', renderDoctorDashboard);
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

const docApptsFilterBarHtml = `
    <!-- Filter Bar -->
    <div class="card mb-4">
        <div class="card-body" style="padding:14px 22px;">
            <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
                <div style="font-size:0.85rem;font-weight:600;color:#374151;">Filter:</div>
                <button type="button" data-status="ALL" onclick="setFilter('ALL')" class="btn btn-sm btn-indigo filter-btn">All</button>
                <button type="button" data-status="PENDING" onclick="setFilter('PENDING')" class="btn btn-sm btn-outline filter-btn">Pending</button>
                <button type="button" data-status="CONFIRMED" onclick="setFilter('CONFIRMED')" class="btn btn-sm btn-outline filter-btn">Confirmed</button>
                <button type="button" data-status="COMPLETED" onclick="setFilter('COMPLETED')" class="btn btn-sm btn-outline filter-btn">Completed</button>
            </div>
        </div>
    </div>
`;
docApptsHtml = docApptsHtml.replace(/<!-- Filter Bar -->[\s\S]*?<\/form>\s*<\/div>\s*<\/div>/, docApptsFilterBarHtml);
docApptsHtml = docApptsHtml.replace(/<span style="font-size:0\.78rem;font-weight:400;color:#9CA3AF;margin-left:8px;"[\s\S]*?<\/span>/, '<span id="docApptCountBadge" style="font-size:0.78rem;font-weight:400;color:#9CA3AF;margin-left:8px;">(3)</span>');

const docApptsTableBlock = `
    <div class="table-container">
        <table class="data-table">
            <thead>
                <tr>
                    <th>#ID</th><th>Patient</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Actions</th>
                </tr>
            </thead>
            <tbody id="docApptsTbody">
                <tr>
                    <td style="font-size:0.78rem;color:#9CA3AF;">#1</td>
                    <td>
                        <div style="display:flex;align-items:center;gap:10px;">
                            <div class="avatar avatar-sm avatar-teal">A</div>
                            <div>
                                <div style="font-weight:600;color:#0F2042;">Arun Chandran</div>
                                <div style="font-size:0.72rem;color:#9CA3AF;">9876510001 • PAT-TRV-000001</div>
                            </div>
                        </div>
                    </td>
                    <td style="font-weight:500;">Tomorrow</td>
                    <td style="font-weight:600;color:#6366F1;">09:30 AM</td>
                    <td style="font-size:0.82rem;color:#4B5563;">Chest pain &amp; shortness of breath</td>
                    <td><span class="badge badge-confirmed">CONFIRMED</span></td>
                    <td>
                        <div style="display:flex;gap:6px;">
                            <a href="/doctor/medical-records" class="btn btn-sm btn-outline"><i class="bi bi-clipboard2-pulse"></i> Write Record &amp; Rx</a>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style="font-size:0.78rem;color:#9CA3AF;">#2</td>
                    <td>
                        <div style="display:flex;align-items:center;gap:10px;">
                            <div class="avatar avatar-sm avatar-teal">D</div>
                            <div>
                                <div style="font-weight:600;color:#0F2042;">Divya Rajan</div>
                                <div style="font-size:0.72rem;color:#9CA3AF;">9876510003 • PAT-TRV-000002</div>
                            </div>
                        </div>
                    </td>
                    <td style="font-weight:500;">In 2 Days</td>
                    <td style="font-weight:600;color:#6366F1;">11:00 AM</td>
                    <td style="font-size:0.82rem;color:#4B5563;">Hypertension checkup</td>
                    <td><span class="badge badge-confirmed">CONFIRMED</span></td>
                    <td>
                        <div style="display:flex;gap:6px;">
                            <a href="/doctor/medical-records" class="btn btn-sm btn-outline"><i class="bi bi-clipboard2-pulse"></i> Write Record &amp; Rx</a>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style="font-size:0.78rem;color:#9CA3AF;">#3</td>
                    <td>
                        <div style="display:flex;align-items:center;gap:10px;">
                            <div class="avatar avatar-sm avatar-teal">M</div>
                            <div>
                                <div style="font-weight:600;color:#0F2042;">Mohammed Faisal</div>
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
                            <button onclick="confirmAppointmentItem(3)" class="btn btn-sm btn-indigo" style="font-weight:700;"><i class="bi bi-check-lg"></i> Confirm</button>
                            <a href="/doctor/medical-records" class="btn btn-sm btn-outline"><i class="bi bi-clipboard2-pulse"></i> Write Record &amp; Rx</a>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <div id="docApptsEmpty" class="empty-state" style="display:none; padding:48px 24px;">
            <div class="empty-state-icon"><i class="bi bi-calendar-x"></i></div>
            <h3>No appointments found</h3>
            <p>You have no appointments matching the current filter.</p>
        </div>
    </div>
`;
docApptsHtml = docApptsHtml.replace(/<div class="table-container">[\s\S]*?<\/main>/, `${docApptsTableBlock}</div></div></main>`);

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

docPatientsHtml = docPatientsHtml.replace(
    /<span style="font-size:0\.8rem;\s*font-weight:400;\s*color:#9CA3AF;\s*margin-left:8px;"[\s\S]*?<\/span>/,
    '<span style="font-size:0.8rem; font-weight:400; color:#9CA3AF; margin-left:8px;">(4 Patients)</span>'
);

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
    <tr>
        <td>
            <div style="display:flex;align-items:center;gap:10px;">
                <div class="avatar avatar-sm avatar-teal">S</div>
                <div>
                    <div style="font-weight:700;color:#0F2042;">Sunita Sharma</div>
                    <div style="font-size:0.72rem;color:#9CA3AF;">PAT-TRV-000004</div>
                </div>
            </div>
        </td>
        <td>sunita.sharma@healix.com</td>
        <td>9876510007</td>
        <td>FEMALE</td>
        <td><span class="badge" style="background:#FEE2E2;color:#991B1B;font-weight:700;">AB+</span></td>
        <td>29 yrs</td>
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
    <div class="table-container">
        <table class="data-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="font-weight:700;color:#0F2042;">Tomorrow</td>
                    <td style="font-weight:700;color:#6366F1;">09:30 AM</td>
                    <td>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div class="avatar avatar-sm avatar-teal">A</div>
                            <div>
                                <div style="font-weight:600;">Arun Chandran</div>
                                <div style="font-size:0.75rem; color:#9CA3AF;">9876510001</div>
                            </div>
                        </div>
                    </td>
                    <td>Chest pain &amp; shortness of breath</td>
                    <td><span class="badge badge-confirmed">CONFIRMED</span></td>
                    <td><a href="/doctor/medical-records" class="btn btn-sm btn-indigo">Start OPD</a></td>
                </tr>
                <tr>
                    <td style="font-weight:700;color:#0F2042;">In 2 Days</td>
                    <td style="font-weight:700;color:#6366F1;">11:00 AM</td>
                    <td>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div class="avatar avatar-sm avatar-teal">D</div>
                            <div>
                                <div style="font-weight:600;">Divya Rajan</div>
                                <div style="font-size:0.75rem; color:#9CA3AF;">9876510003</div>
                            </div>
                        </div>
                    </td>
                    <td>Hypertension checkup</td>
                    <td><span class="badge badge-confirmed">CONFIRMED</span></td>
                    <td><a href="/doctor/medical-records" class="btn btn-sm btn-indigo">Start OPD</a></td>
                </tr>
                <tr>
                    <td style="font-weight:700;color:#0F2042;">Today</td>
                    <td style="font-weight:700;color:#6366F1;">03:30 PM</td>
                    <td>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div class="avatar avatar-sm avatar-teal">M</div>
                            <div>
                                <div style="font-weight:600;">Mohammed Faisal</div>
                                <div style="font-size:0.75rem; color:#9CA3AF;">9876510005</div>
                            </div>
                        </div>
                    </td>
                    <td>Cardiac stress test review</td>
                    <td><span class="badge badge-pending">PENDING</span></td>
                    <td><a href="/doctor/appointments" class="btn btn-sm btn-outline">Review</a></td>
                </tr>
            </tbody>
        </table>
    </div>
`;
docScheduleHtml = docScheduleHtml.replace(/<div class="table-container">[\s\S]*?<\/main>/, `${docScheduleTableHtml}</div></div></main>`);
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

let haDashHtml = rawHaDash
    .replace('<title th:text="${hospital.hospitalName} + \' | Hospital Admin Portal\'">Hospital Admin Dashboard</title>', '<title>MediCare City Hospital | Hospital Admin Dashboard</title>')
    .replace('<span th:text="${hospital.hospitalName}">Hospital Name</span>', '<span id="haHospitalName">MediCare City Hospital</span>')
    .replace('<span class="hospital-badge" th:text="${hospital.hospitalCode}">TRV-HOSP-01</span>', '<span class="hospital-badge">TRV-HOSP-01</span>')
    .replace(/<div style="margin-bottom: 2rem;">[\s\S]*?<\/div>\s*<!-- Scoped Stats -->/, `
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
        <div>
            <div style="font-size: 0.85rem; color: #6B7280;">Hospital Scoped Administration (Doctor Credentialing Scope)</div>
            <h2 style="font-size: 1.85rem; font-weight: 800; color: #111827; margin:0;">MediCare City Hospital Overview</h2>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
            <a href="/hospital-admin/doctors?action=addDoctor" class="btn" style="background: linear-gradient(135deg, #8070A6, #6B5B95); color: #fff; border: none; padding: 0.55rem 1.25rem; border-radius: 8px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 2px 6px rgba(128,112,166,0.25); text-decoration: none;">
                <i class="bi bi-person-plus-fill"></i> Add Doctor
            </a>
        </div>
    </div>

    <!-- Scoped Stats -->`)
    .replace('<div style="font-size: 1.8rem; font-weight: 800; color: #3B82F6;" th:text="${patientCount}">0</div>', '<div style="font-size: 1.8rem; font-weight: 800; color: #3B82F6;" id="haPatientCount">4</div>')
    .replace('<div style="font-size: 1.8rem; font-weight: 800; color: #8070A6;" th:text="${doctorCount}">0</div>', '<div style="font-size: 1.8rem; font-weight: 800; color: #8070A6;" id="haActiveDoctorCount">4</div>')
    .replace('<div style="font-size: 1.8rem; font-weight: 800; color: #10B981;" th:text="${todayAppointments}">0</div>', '<div style="font-size: 1.8rem; font-weight: 800; color: #10B981;" id="haTodayAppts">4</div>')
    .replace('<span style="font-size: 0.78rem; color: #F59E0B; font-weight: 600;" th:text="${pendingAppointments} + \' Pending\'">0 Pending</span>', '<span style="font-size: 0.78rem; color: #F59E0B; font-weight: 600;" id="haPendingAppts">1 Pending</span>')
    .replace('<div style="font-size: 1.8rem; font-weight: 800; color: #059669;" th:text="\'₹\' + ${registrationRevenue}">₹0</div>', '<div style="font-size: 1.8rem; font-weight: 800; color: #059669;" id="haRevenue">₹38,500</div>');

haDashHtml = cleanThymeleaf(haDashHtml);

haDashHtml = haDashHtml
    .replace('<span>Hospital Name</span>', '<span id="haHospitalName">MediCare City Hospital</span>')
    .replace('<span >Hospital Name</span>', '<span id="haHospitalName">MediCare City Hospital</span>');

const haRecentApptsHtml = `
    <!-- Scoped Appointments Table -->
    <div style="background: #fff; border-radius: 16px; border: 1px solid #E5E7EB; padding: 1.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
            <div>
                <h3 style="font-size: 1.25rem; font-weight: 700; color: #111827; margin:0 0 4px 0;">Recent Outpatient Appointments</h3>
                <div style="font-size:0.8rem; color:#6B7280;">Live clinical queue for MediCare City Hospital OPD</div>
            </div>
            <span id="haApptBadge" class="hospital-badge" style="background:#EDE7F6; color:#5E35B1; font-weight:700; padding:6px 12px; font-size:0.8rem;">4 Today</span>
        </div>
        <div style="overflow-x: auto;">
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
                <tbody id="haRecentApptsTbody">
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
        </div>
    </div>
</div>
`;
haDashHtml = haDashHtml.replace(/<!-- Scoped Appointments Table -->[\s\S]*?<\/body>/, `${haRecentApptsHtml}\n</body>`);

const haDashScript = `
<script src="/js/main.js"></script>
<script src="/js/clinical-store.js"></script>
<script>
    function renderHospitalAdminDashboard() {
        if (typeof HealixStore !== 'undefined') {
            HealixStore.init();
            
            const docCountEl = document.getElementById('haActiveDoctorCount');
            if (docCountEl) {
                const docs = HealixStore.getHospitalDoctors();
                docCountEl.innerText = (docs && docs.length) ? docs.length : 4;
            }

            const appts = HealixStore.getAppointments();
            const todayEl = document.getElementById('haTodayAppts');
            if (todayEl) {
                todayEl.innerText = (appts && appts.length) ? (appts.length + 1) : 4;
            }

            const pendingEl = document.getElementById('haPendingAppts');
            if (pendingEl) {
                const pendingCount = (appts && appts.length) ? appts.filter(a => a.status === 'PENDING').length : 1;
                pendingEl.innerText = pendingCount + ' Pending';
            }

            const patEl = document.getElementById('haPatientCount');
            if (patEl) patEl.innerText = '4';

            const revEl = document.getElementById('haRevenue');
            if (revEl) revEl.innerText = '₹38,500';
        }
    }

    document.addEventListener('DOMContentLoaded', renderHospitalAdminDashboard);
    renderHospitalAdminDashboard();
</script>
`;
haDashHtml = haDashHtml.replace('</body>', `${haDashScript}</body>`);
writePage('hospital-admin/dashboard/index.html', haDashHtml);

// ----------------------------------------------------
// 28. Generate Hospital Admin Doctors (/hospital-admin/doctors/index.html)
// ----------------------------------------------------
const rawHaDocs = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'hospital-admin', 'doctors.html'), 'utf8');
let haDocsHtml = cleanThymeleaf(rawHaDocs);

haDocsHtml = haDocsHtml
    .replace('<span th:text="${hospital.hospitalName}">Hospital Name</span>', 'MediCare City Hospital')
    .replace('<span class="hospital-badge" th:text="${hospital.hospitalCode}">TRV-HOSP-01</span>', 'TRV-HOSP-01');

// Replace header with Add Doctor button, search bar, count badge, and admin scope notice
const haDocsHeaderHtml = `
    <!-- Hospital Admin Role Scope Callout -->
    <div style="background: linear-gradient(135deg, #F0FDF4, #ECFDF5); border: 1px solid #A7F3D0; border-radius: 12px; padding: 12px 18px; margin-bottom: 1.75rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 38px; height: 38px; border-radius: 10px; background: #059669; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                <i class="bi bi-shield-check"></i>
            </div>
            <div>
                <div style="font-weight: 700; color: #065F46; font-size: 0.92rem;">Hospital Admin Access: Doctor Credentialing Only</div>
                <div style="font-size: 0.8rem; color: #047857;">Hospital Admins can only add doctors for their designated facility. Administrative appointments are governed by Super Admin.</div>
            </div>
        </div>
        <span class="hospital-badge" style="background: #D1FAE5; color: #065F46; font-size: 0.78rem; font-weight: 700;">HOSPITAL ADMIN SCOPE</span>
    </div>

    <!-- Header with Add Doctor Button -->
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
        <div>
            <div style="font-size: 0.85rem; color: #6B7280;">MediCare City Hospital (TRV-HOSP-01)</div>
            <h2 style="font-size: 1.85rem; font-weight: 800; color: #111827; margin: 0;">Specialist Doctors Directory</h2>
        </div>
        <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
            <div style="position: relative;">
                <i class="bi bi-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9CA3AF;"></i>
                <input type="text" id="doctorSearch" placeholder="Search doctor, specialty…" 
                       style="padding: 0.55rem 1rem 0.55rem 2.25rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.88rem; outline: none; width: 220px; background: #fff;"
                       onkeyup="filterDoctors()"/>
            </div>
            <span id="haDocCountBadge" class="hospital-badge" style="padding: 0.55rem 1rem; font-size: 0.85rem; background: #EDE7F6; color: #5E35B1; font-weight: 700;">4 Doctors</span>
            <button type="button" onclick="openAddDoctorModal()" class="btn" style="background: linear-gradient(135deg, #8070A6, #6B5B95); color: #fff; border: none; padding: 0.55rem 1.25rem; border-radius: 8px; font-weight: 700; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 10px rgba(128,112,166,0.25); cursor: pointer;">
                <i class="bi bi-person-plus-fill"></i> Add Doctor
            </button>
        </div>
    </div>
`;

haDocsHtml = haDocsHtml.replace(/<!-- Header -->[\s\S]*?<\/div>\s*<\/div>/, haDocsHeaderHtml);

// Replace table container with dynamic container
const haDocsDynamicContainer = `
    <!-- Doctors Table Container -->
    <div style="background: #fff; border-radius: 16px; border: 1px solid #E5E7EB; padding: 1.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <div id="haDoctorsTableContainer" style="overflow-x: auto;"></div>
    </div>
`;
haDocsHtml = haDocsHtml.replace(/<!-- Doctors Table Container -->[\s\S]*?<script>[\s\S]*?<\/script>/, haDocsDynamicContainer + '\n</div>');

const haDocsInteractiveScript = `
<!-- Add Doctor Modal -->
<div id="addDoctorModal" style="display:none; position: fixed; inset: 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center; padding: 1rem; overflow-y: auto;">
    <div style="background: #fff; border-radius: 20px; max-width: 660px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border: 1px solid #E2E8F0; overflow: hidden; margin: auto;">
        <div style="background: linear-gradient(135deg, #EDE7F6, #F3E8FF); padding: 1.5rem 1.75rem; border-bottom: 1px solid #E9D5FF; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 44px; height: 44px; border-radius: 12px; background: #8070A6; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                    <i class="bi bi-person-plus-fill"></i>
                </div>
                <div>
                    <h3 style="font-size: 1.25rem; font-weight: 800; color: #1E1B4B; margin: 0;">Add Doctor to Roster</h3>
                    <p style="font-size: 0.82rem; color: #6B7280; margin: 2px 0 0 0;">Hospital Admin credentialing for MediCare City Hospital</p>
                </div>
            </div>
            <button type="button" onclick="closeAddDoctorModal()" style="background: transparent; border: none; font-size: 1.5rem; color: #64748B; cursor: pointer; line-height: 1;">&times;</button>
        </div>
        
        <form id="addDoctorForm" style="padding: 1.75rem; display: flex; flex-direction: column; gap: 1.1rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 4px;">Doctor Name <span style="color:#DC2626;">*</span></label>
                    <input type="text" id="docNameInput" placeholder="e.g. Dr. Priya Nair" required
                           style="width: 100%; padding: 0.6rem 0.85rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.88rem; outline: none; box-sizing: border-box;"/>
                </div>
                <div>
                    <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 4px;">Department / Specialty <span style="color:#DC2626;">*</span></label>
                    <select id="docDeptInput" required
                            style="width: 100%; padding: 0.6rem 0.85rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.88rem; outline: none; box-sizing: border-box; background: #fff;">
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Gynecology">Gynecology</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Ophthalmology">Ophthalmology</option>
                        <option value="General Medicine" selected>General Medicine</option>
                        <option value="ENT">ENT</option>
                        <option value="Pulmonology">Pulmonology</option>
                        <option value="Nephrology">Nephrology</option>
                    </select>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem;">
                <div>
                    <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 4px;">Degrees &amp; Qualifications <span style="color:#DC2626;">*</span></label>
                    <input type="text" id="docQualInput" placeholder="e.g. MBBS, MD, DM (Cardiology)" required
                           style="width: 100%; padding: 0.6rem 0.85rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.88rem; outline: none; box-sizing: border-box;"/>
                </div>
                <div>
                    <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 4px;">Experience (Yrs)</label>
                    <input type="number" id="docExpInput" placeholder="8" min="1" max="50" value="8"
                           style="width: 100%; padding: 0.6rem 0.85rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.88rem; outline: none; box-sizing: border-box;"/>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 4px;">Consultation Fee (INR) <span style="color:#DC2626;">*</span></label>
                    <input type="number" id="docFeeInput" placeholder="600" min="100" step="50" value="650" required
                           style="width: 100%; padding: 0.6rem 0.85rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.88rem; outline: none; box-sizing: border-box;"/>
                </div>
                <div>
                    <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 4px;">OPD Room / Cabin</label>
                    <input type="text" id="docRoomInput" placeholder="Room 105" value="Room 105"
                           style="width: 100%; padding: 0.6rem 0.85rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.88rem; outline: none; box-sizing: border-box;"/>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 4px;">Doctor Official Email <span style="color:#DC2626;">*</span></label>
                    <input type="email" id="docEmailInput" placeholder="doctor.name@healix.com" required
                           style="width: 100%; padding: 0.6rem 0.85rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.88rem; outline: none; box-sizing: border-box;"/>
                </div>
                <div>
                    <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 4px;">Phone Number <span style="color:#DC2626;">*</span></label>
                    <input type="tel" id="docPhoneInput" placeholder="+91 98765 00000" value="+91 98765 " required
                           style="width: 100%; padding: 0.6rem 0.85rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.88rem; outline: none; box-sizing: border-box;"/>
                </div>
            </div>

            <div>
                <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 4px;">OPD Timings &amp; Availability</label>
                <input type="text" id="docScheduleInput" placeholder="Mon-Sat: 09:00 AM - 01:00 PM" value="Mon-Sat: 09:00 AM - 01:00 PM"
                       style="width: 100%; padding: 0.6rem 0.85rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.88rem; outline: none; box-sizing: border-box;"/>
            </div>

            <div>
                <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 4px;">Clinical Bio &amp; Specialty Focus</label>
                <textarea id="docBioInput" rows="2" placeholder="Brief clinical background and specialty interest…"
                          style="width: 100%; padding: 0.6rem 0.85rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.88rem; outline: none; box-sizing: border-box; resize: vertical;">Experienced clinical specialist focused on high-quality evidence-based patient consultations.</textarea>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 0.5rem; padding-top: 1rem; border-top: 1px solid #E5E7EB;">
                <button type="button" onclick="closeAddDoctorModal()" class="btn" style="border: 1px solid #D1D5DB; background: #fff; color: #4B5563; padding: 0.6rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    Cancel
                </button>
                <button type="submit" class="btn" style="background: linear-gradient(135deg, #8070A6, #6B5B95); color: #fff; border: none; padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                    <i class="bi bi-person-check-fill"></i> Save &amp; Add Doctor
                </button>
            </div>
        </form>
    </div>
</div>

<script src="/js/clinical-store.js"></script>
<script>
    function renderDoctors() {
        const list = HealixStore.getHospitalDoctors();
        const container = document.getElementById('haDoctorsTableContainer');
        const badge = document.getElementById('haDocCountBadge');
        if (badge) badge.innerText = list.length + ' Doctors';

        if (!list || list.length === 0) {
            container.innerHTML = \`
                <div style="color: #6B7280; text-align: center; padding: 3rem 1rem;">
                    <i class="bi bi-person-slash" style="font-size: 2.5rem; color: #D1D5DB; display: block; margin-bottom: 0.75rem;"></i>
                    <h4 style="font-size: 1.1rem; color: #374151; margin-bottom: 0.25rem;">No Doctors Registered</h4>
                    <p style="font-size: 0.88rem; color: #9CA3AF;">Click "+ Add Doctor" above to onboard your first medical specialist.</p>
                </div>
            \`;
            return;
        }

        let tableHtml = \`
            <table id="doctorsTable" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid #E5E7EB; text-align: left; font-size: 0.82rem; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                        <th style="padding: 0.85rem 1rem;">Doctor / Specialist</th>
                        <th style="padding: 0.85rem 1rem;">Department</th>
                        <th style="padding: 0.85rem 1rem;">Qualifications &amp; Exp</th>
                        <th style="padding: 0.85rem 1rem;">OPD Room</th>
                        <th style="padding: 0.85rem 1rem;">Consultation Fee</th>
                        <th style="padding: 0.85rem 1rem;">Schedule</th>
                        <th style="padding: 0.85rem 1rem;">Status</th>
                    </tr>
                </thead>
                <tbody>
        \`;

        list.forEach(doc => {
            const rawName = doc.name.replace(/^Dr\\.\\s*/i, '');
            const initial = rawName.charAt(0).toUpperCase() || 'D';
            tableHtml += \`
                <tr style="border-bottom: 1px solid #F3F4F6; font-size: 0.9rem;">
                    <td style="padding: 1rem;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 42px; height: 42px; border-radius: 50%; background: #EDE7F6; color: #5E35B1; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.05rem; border: 1px solid #DDD6FE;">
                                \${initial}
                            </div>
                            <div>
                                <div style="font-weight: 700; color: #111827;">\${doc.name}</div>
                                <div style="font-size: 0.78rem; color: #6B7280;">\${doc.id} • \${doc.email}</div>
                                <div style="font-size: 0.74rem; color: #9CA3AF;">\${doc.phone}</div>
                            </div>
                        </div>
                    </td>
                    <td style="padding: 1rem;">
                        <span style="background: #EFF6FF; color: #1D4ED8; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">
                            \${doc.department}
                        </span>
                    </td>
                    <td style="padding: 1rem; color: #4B5563;">
                        <div style="font-weight: 600; color: #1E293B;">\${doc.qualification}</div>
                        <div style="font-size: 0.78rem; color: #64748B;">\${doc.experienceYears} Years Experience</div>
                    </td>
                    <td style="padding: 1rem;">
                        <span style="background: #F1F5F9; color: #334155; padding: 3px 8px; border-radius: 6px; font-size: 0.82rem; font-weight: 600;">
                            \${doc.room || 'Room 101'}
                        </span>
                    </td>
                    <td style="padding: 1rem; font-weight: 700; color: #059669;">
                        ₹\${Number(doc.consultationFee).toFixed(2)}
                    </td>
                    <td style="padding: 1rem; color: #6B7280; font-size: 0.85rem;">
                        \${doc.availability || 'Mon - Sat'}
                    </td>
                    <td style="padding: 1rem;">
                        <span class="hospital-badge" style="background: #ECFDF5; color: #047857; border-color: #A7F3D0;">
                            \${doc.status || 'ACTIVE'}
                        </span>
                    </td>
                </tr>
            \`;
        });

        tableHtml += \`
                </tbody>
            </table>
        \`;

        container.innerHTML = tableHtml;
    }

    function filterDoctors() {
        const input = document.getElementById("doctorSearch").value.toLowerCase();
        const rows = document.querySelectorAll("#doctorsTable tbody tr");
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(input) ? "" : "none";
        });
    }

    function openAddDoctorModal() {
        document.getElementById('addDoctorModal').style.display = 'flex';
        document.getElementById('docNameInput').focus();
    }

    function closeAddDoctorModal() {
        document.getElementById('addDoctorModal').style.display = 'none';
        document.getElementById('addDoctorForm').reset();
    }

    document.getElementById('addDoctorForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const rawName = document.getElementById('docNameInput').value.trim();
        const docName = rawName.startsWith('Dr.') ? rawName : 'Dr. ' + rawName;
        const dept = document.getElementById('docDeptInput').value;
        const qual = document.getElementById('docQualInput').value.trim();
        const exp = document.getElementById('docExpInput').value;
        const fee = document.getElementById('docFeeInput').value;
        const room = document.getElementById('docRoomInput').value.trim();
        const email = document.getElementById('docEmailInput').value.trim();
        const phone = document.getElementById('docPhoneInput').value.trim();
        const schedule = document.getElementById('docScheduleInput').value.trim();
        const bio = document.getElementById('docBioInput').value.trim();

        const createdDoc = HealixStore.addHospitalDoctor({
            name: docName,
            department: dept,
            qualification: qual,
            experienceYears: exp,
            consultationFee: fee,
            room: room,
            email: email,
            phone: phone,
            availability: schedule,
            bio: bio,
            hospital: 'MediCare City Hospital',
            hospitalCode: 'TRV-HOSP-01'
        });

        closeAddDoctorModal();
        renderDoctors();

        alert('Success: ' + createdDoc.name + ' has been credentialed and added to MediCare City Hospital directory!');
    });

    // Check query params for quick action
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'add' || urlParams.get('action') === 'addDoctor') {
        openAddDoctorModal();
    }

    renderDoctors();
</script>
`;

haDocsHtml = haDocsHtml.replace('</body>', `${haDocsInteractiveScript}</body>`);
writePage('hospital-admin/doctors/index.html', haDocsHtml);

// ----------------------------------------------------
// 29. Generate Hospital Admin Departments (/hospital-admin/departments/index.html)
// ----------------------------------------------------
const rawHaDepts = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'hospital-admin', 'departments.html'), 'utf8');
let haDeptsHtml = cleanThymeleaf(rawHaDepts);

haDeptsHtml = haDeptsHtml
    .replace('<span th:text="${hospital.hospitalName}">Hospital Name</span>', 'MediCare City Hospital')
    .replace('<span class="hospital-badge" th:text="${hospital.hospitalCode}">TRV-HOSP-01</span>', 'TRV-HOSP-01')
    .replace(/<span style="font-size: 0\.85rem; color: #6B7280;"\s*th:text="\${departments \!= null \? departments\.size\(\) : 0} \+ ' Departments'">0 Departments<\/span>/, '<span style="font-size: 0.85rem; color: #6B7280;">6 Departments</span>');

const haDeptsCardsHtml = `
    <!-- Departments Grid -->
    <div id="deptGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
        <div class="dept-card" style="background: #fff; border-radius: 16px; border: 1px solid #E5E7EB; padding: 1.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: #EDE7F6; color: #5E35B1; display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
                    <i class="bi bi-heart-pulse-fill"></i>
                </div>
                <span class="hospital-badge" style="background: #ECFDF5; color: #047857; border-color: #A7F3D0;">Active</span>
            </div>
            <h3 class="dept-title" style="font-size: 1.2rem; font-weight: 700; color: #111827; margin: 0 0 0.5rem 0;">Cardiology</h3>
            <p class="dept-desc" style="font-size: 0.88rem; color: #6B7280; margin: 0 0 1.5rem 0; flex-grow: 1; line-height: 1.5;">Comprehensive cardiovascular care, coronary intervention, electrophysiology, and non-invasive diagnostics.</p>
            <div style="border-top: 1px solid #F3F4F6; padding-top: 1rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
                <span style="color: #6B7280;">Staffed Specialists:</span>
                <span style="font-weight: 700; color: #5E35B1;">2 Doctors</span>
            </div>
        </div>
        <div class="dept-card" style="background: #fff; border-radius: 16px; border: 1px solid #E5E7EB; padding: 1.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: #EDE7F6; color: #5E35B1; display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
                    <i class="bi bi-activity"></i>
                </div>
                <span class="hospital-badge" style="background: #ECFDF5; color: #047857; border-color: #A7F3D0;">Active</span>
            </div>
            <h3 class="dept-title" style="font-size: 1.2rem; font-weight: 700; color: #111827; margin: 0 0 0.5rem 0;">Neurology</h3>
            <p class="dept-desc" style="font-size: 0.88rem; color: #6B7280; margin: 0 0 1.5rem 0; flex-grow: 1; line-height: 1.5;">Advanced clinical care for cerebrovascular conditions, epilepsy, headache disorders, and neurodegenerative illnesses.</p>
            <div style="border-top: 1px solid #F3F4F6; padding-top: 1rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
                <span style="color: #6B7280;">Staffed Specialists:</span>
                <span style="font-weight: 700; color: #5E35B1;">2 Doctors</span>
            </div>
        </div>
        <div class="dept-card" style="background: #fff; border-radius: 16px; border: 1px solid #E5E7EB; padding: 1.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: #EDE7F6; color: #5E35B1; display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
                    <i class="bi bi-hospital"></i>
                </div>
                <span class="hospital-badge" style="background: #ECFDF5; color: #047857; border-color: #A7F3D0;">Active</span>
            </div>
            <h3 class="dept-title" style="font-size: 1.2rem; font-weight: 700; color: #111827; margin: 0 0 0.5rem 0;">General Medicine</h3>
            <p class="dept-desc" style="font-size: 0.88rem; color: #6B7280; margin: 0 0 1.5rem 0; flex-grow: 1; line-height: 1.5;">Primary adult care, metabolic disorder management, lifestyle medicine, and continuous OPD consultations.</p>
            <div style="border-top: 1px solid #F3F4F6; padding-top: 1rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
                <span style="color: #6B7280;">Staffed Specialists:</span>
                <span style="font-weight: 700; color: #5E35B1;">2 Doctors</span>
            </div>
        </div>
        <div class="dept-card" style="background: #fff; border-radius: 16px; border: 1px solid #E5E7EB; padding: 1.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: #EDE7F6; color: #5E35B1; display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
                    <i class="bi bi-emoji-smile"></i>
                </div>
                <span class="hospital-badge" style="background: #ECFDF5; color: #047857; border-color: #A7F3D0;">Active</span>
            </div>
            <h3 class="dept-title" style="font-size: 1.2rem; font-weight: 700; color: #111827; margin: 0 0 0.5rem 0;">Pediatrics</h3>
            <p class="dept-desc" style="font-size: 0.88rem; color: #6B7280; margin: 0 0 1.5rem 0; flex-grow: 1; line-height: 1.5;">Neonatal and child healthcare, developmental assessments, immunization programs, and pediatric emergency triage.</p>
            <div style="border-top: 1px solid #F3F4F6; padding-top: 1rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
                <span style="color: #6B7280;">Staffed Specialists:</span>
                <span style="font-weight: 700; color: #5E35B1;">1 Doctor</span>
            </div>
        </div>
        <div class="dept-card" style="background: #fff; border-radius: 16px; border: 1px solid #E5E7EB; padding: 1.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: #EDE7F6; color: #5E35B1; display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
                    <i class="bi bi-bandaid"></i>
                </div>
                <span class="hospital-badge" style="background: #ECFDF5; color: #047857; border-color: #A7F3D0;">Active</span>
            </div>
            <h3 class="dept-title" style="font-size: 1.2rem; font-weight: 700; color: #111827; margin: 0 0 0.5rem 0;">Orthopedics</h3>
            <p class="dept-desc" style="font-size: 0.88rem; color: #6B7280; margin: 0 0 1.5rem 0; flex-grow: 1; line-height: 1.5;">Musculoskeletal trauma surgery, joint reconstruction, spinal therapy, and physical rehabilitation.</p>
            <div style="border-top: 1px solid #F3F4F6; padding-top: 1rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
                <span style="color: #6B7280;">Staffed Specialists:</span>
                <span style="font-weight: 700; color: #5E35B1;">2 Doctors</span>
            </div>
        </div>
        <div class="dept-card" style="background: #fff; border-radius: 16px; border: 1px solid #E5E7EB; padding: 1.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: #EDE7F6; color: #5E35B1; display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
                    <i class="bi bi-gender-female"></i>
                </div>
                <span class="hospital-badge" style="background: #ECFDF5; color: #047857; border-color: #A7F3D0;">Active</span>
            </div>
            <h3 class="dept-title" style="font-size: 1.2rem; font-weight: 700; color: #111827; margin: 0 0 0.5rem 0;">Gynecology &amp; Obstetrics</h3>
            <p class="dept-desc" style="font-size: 0.88rem; color: #6B7280; margin: 0 0 1.5rem 0; flex-grow: 1; line-height: 1.5;">Women's reproductive health, prenatal diagnostics, modern labor wards, and minimally invasive laparoscopic surgery.</p>
            <div style="border-top: 1px solid #F3F4F6; padding-top: 1rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
                <span style="color: #6B7280;">Staffed Specialists:</span>
                <span style="font-weight: 700; color: #5E35B1;">2 Doctors</span>
            </div>
        </div>
    </div>
`;
haDeptsHtml = haDeptsHtml.replace(/<!-- Empty State -->[\s\S]*?<script>/, `${haDeptsCardsHtml}\n</div>\n<script>`);
writePage('hospital-admin/departments/index.html', haDeptsHtml);

// ----------------------------------------------------
// 30. Generate Hospital Admin Patients (/hospital-admin/patients/index.html)
// ----------------------------------------------------
const rawHaPatients = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'hospital-admin', 'patients.html'), 'utf8');
let haPatientsHtml = cleanThymeleaf(rawHaPatients);

haPatientsHtml = haPatientsHtml
    .replace('<span th:text="${hospital.hospitalName}">Hospital Name</span>', 'MediCare City Hospital')
    .replace('<span class="hospital-badge" th:text="${hospital.hospitalCode}">TRV-HOSP-01</span>', 'TRV-HOSP-01')
    .replace(/<span class="hospital-badge" style="padding: 0\.55rem 1rem; font-size: 0\.85rem; background: #EFF6FF; color: #1D4ED8; font-weight: 700;"\s*th:text="\${patientHospitals \!= null \? patientHospitals\.size\(\) : 0} \+ ' Patients'">0 Patients<\/span>/, '<span class="hospital-badge" style="padding: 0.55rem 1rem; font-size: 0.85rem; background: #EFF6FF; color: #1D4ED8; font-weight: 700;">4 Patients</span>');

const haPatientsTableContainer = `
    <!-- Patients Table Container -->
    <div style="background: #fff; border-radius: 16px; border: 1px solid #E5E7EB; padding: 1.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <div style="overflow-x: auto;">
            <table id="patientsTable" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid #E5E7EB; text-align: left; font-size: 0.82rem; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                        <th style="padding: 0.85rem 1rem;">Hospital Patient No.</th>
                        <th style="padding: 0.85rem 1rem;">Patient</th>
                        <th style="padding: 0.85rem 1rem;">Central ID</th>
                        <th style="padding: 0.85rem 1rem;">Contact Info</th>
                        <th style="padding: 0.85rem 1rem;">Blood Group</th>
                        <th style="padding: 0.85rem 1rem;">Registered On</th>
                        <th style="padding: 0.85rem 1rem;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #F3F4F6; font-size: 0.9rem;">
                        <td style="padding: 1rem; font-family: monospace; font-weight: 700; color: #3B82F6;">TRV-HOSP-01-P-0001</td>
                        <td style="padding: 1rem;">
                            <div style="font-weight: 600; color: #111827;">Arun Chandran</div>
                            <div style="font-size: 0.78rem; color: #6B7280;">Male • 34 yrs</div>
                        </td>
                        <td style="padding: 1rem;">
                            <span style="font-family: monospace; font-size: 0.82rem; background: #F3F4F6; padding: 3px 8px; border-radius: 6px; color: #4B5563;">PAT-TRV-000001</span>
                        </td>
                        <td style="padding: 1rem; font-size: 0.85rem;">
                            <div style="color: #111827;">+91 9876510001</div>
                            <div style="color: #6B7280; font-size: 0.78rem;">patient@healix.com</div>
                        </td>
                        <td style="padding: 1rem;">
                            <span class="hospital-badge" style="background: #FEE2E2; color: #B91C1C; border-color: #FECACA;">B+</span>
                        </td>
                        <td style="padding: 1rem; color: #4B5563; font-size: 0.85rem;">2026-03-01</td>
                        <td style="padding: 1rem;">
                            <span class="hospital-badge" style="background: #ECFDF5; color: #047857; border-color: #A7F3D0;">ACTIVE</span>
                        </td>
                    </tr>
                    <tr style="border-bottom: 1px solid #F3F4F6; font-size: 0.9rem;">
                        <td style="padding: 1rem; font-family: monospace; font-weight: 700; color: #3B82F6;">TRV-HOSP-01-P-0002</td>
                        <td style="padding: 1rem;">
                            <div style="font-weight: 600; color: #111827;">Divya Rajan</div>
                            <div style="font-size: 0.78rem; color: #6B7280;">Female • 39 yrs</div>
                        </td>
                        <td style="padding: 1rem;">
                            <span style="font-family: monospace; font-size: 0.82rem; background: #F3F4F6; padding: 3px 8px; border-radius: 6px; color: #4B5563;">PAT-TRV-000002</span>
                        </td>
                        <td style="padding: 1rem; font-size: 0.85rem;">
                            <div style="color: #111827;">+91 9876510003</div>
                            <div style="color: #6B7280; font-size: 0.78rem;">divya.rajan@healix.com</div>
                        </td>
                        <td style="padding: 1rem;">
                            <span class="hospital-badge" style="background: #FEE2E2; color: #B91C1C; border-color: #FECACA;">A+</span>
                        </td>
                        <td style="padding: 1rem; color: #4B5563; font-size: 0.85rem;">2026-03-12</td>
                        <td style="padding: 1rem;">
                            <span class="hospital-badge" style="background: #ECFDF5; color: #047857; border-color: #A7F3D0;">ACTIVE</span>
                        </td>
                    </tr>
                    <tr style="border-bottom: 1px solid #F3F4F6; font-size: 0.9rem;">
                        <td style="padding: 1rem; font-family: monospace; font-weight: 700; color: #3B82F6;">TRV-HOSP-01-P-0003</td>
                        <td style="padding: 1rem;">
                            <div style="font-weight: 600; color: #111827;">Mohammed Faisal</div>
                            <div style="font-size: 0.78rem; color: #6B7280;">Male • 46 yrs</div>
                        </td>
                        <td style="padding: 1rem;">
                            <span style="font-family: monospace; font-size: 0.82rem; background: #F3F4F6; padding: 3px 8px; border-radius: 6px; color: #4B5563;">PAT-TRV-000003</span>
                        </td>
                        <td style="padding: 1rem; font-size: 0.85rem;">
                            <div style="color: #111827;">+91 9876510005</div>
                            <div style="color: #6B7280; font-size: 0.78rem;">faisal@healix.com</div>
                        </td>
                        <td style="padding: 1rem;">
                            <span class="hospital-badge" style="background: #FEE2E2; color: #B91C1C; border-color: #FECACA;">O+</span>
                        </td>
                        <td style="padding: 1rem; color: #4B5563; font-size: 0.85rem;">2026-03-18</td>
                        <td style="padding: 1rem;">
                            <span class="hospital-badge" style="background: #ECFDF5; color: #047857; border-color: #A7F3D0;">ACTIVE</span>
                        </td>
                    </tr>
                    <tr style="border-bottom: 1px solid #F3F4F6; font-size: 0.9rem;">
                        <td style="padding: 1rem; font-family: monospace; font-weight: 700; color: #3B82F6;">TRV-HOSP-01-P-0004</td>
                        <td style="padding: 1rem;">
                            <div style="font-weight: 600; color: #111827;">Sunita Sharma</div>
                            <div style="font-size: 0.78rem; color: #6B7280;">Female • 29 yrs</div>
                        </td>
                        <td style="padding: 1rem;">
                            <span style="font-family: monospace; font-size: 0.82rem; background: #F3F4F6; padding: 3px 8px; border-radius: 6px; color: #4B5563;">PAT-TRV-000004</span>
                        </td>
                        <td style="padding: 1rem; font-size: 0.85rem;">
                            <div style="color: #111827;">+91 9876510007</div>
                            <div style="color: #6B7280; font-size: 0.78rem;">sunita.sharma@healix.com</div>
                        </td>
                        <td style="padding: 1rem;">
                            <span class="hospital-badge" style="background: #FEE2E2; color: #B91C1C; border-color: #FECACA;">AB+</span>
                        </td>
                        <td style="padding: 1rem; color: #4B5563; font-size: 0.85rem;">2026-03-22</td>
                        <td style="padding: 1rem;">
                            <span class="hospital-badge" style="background: #ECFDF5; color: #047857; border-color: #A7F3D0;">ACTIVE</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
`;
haPatientsHtml = haPatientsHtml.replace(/<!-- Patients Table Container -->[\s\S]*?<script>/, `${haPatientsTableContainer}\n</div>\n<script>`);
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
    .replace(/<div class="stat-number">.*?<\/div>/, '<div class="stat-number">₹38,500.00</div>')
    .replace(/<span class="hospital-badge" style="padding: 0\.55rem 1rem; font-size: 0\.85rem; background: #EDE7F6; color: #5E35B1; font-weight: 700;"\s*th:text="\${payments \!= null \? payments\.size\(\) : 0} \+ ' Records'">0 Records<\/span>/, '<span class="hospital-badge" style="padding: 0.55rem 1rem; font-size: 0.85rem; background: #EDE7F6; color: #5E35B1; font-weight: 700;">4 Records</span>');

const haPaymentsTableContainer = `
    <!-- Payments Table Container -->
    <div style="background: #fff; border-radius: 16px; border: 1px solid #E5E7EB; padding: 1.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <div style="overflow-x: auto;">
            <table id="paymentsTable" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid #E5E7EB; text-align: left; font-size: 0.82rem; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                        <th style="padding: 0.85rem 1rem;">Receipt No. / Ref</th>
                        <th style="padding: 0.85rem 1rem;">Patient</th>
                        <th style="padding: 0.85rem 1rem;">Payment Type</th>
                        <th style="padding: 0.85rem 1rem;">Method</th>
                        <th style="padding: 0.85rem 1rem;">Amount</th>
                        <th style="padding: 0.85rem 1rem;">Date</th>
                        <th style="padding: 0.85rem 1rem;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #F3F4F6; font-size: 0.9rem;">
                        <td style="padding: 1rem;">
                            <div style="font-family: monospace; font-weight: 700; color: #111827;">REC-TRV-REG001</div>
                            <div style="font-size: 0.75rem; color: #9CA3AF; font-family: monospace;">Txn: TXN-MED-99214</div>
                        </td>
                        <td style="padding: 1rem;">
                            <div style="font-weight: 600; color: #111827;">Arun Chandran</div>
                            <div style="font-size: 0.78rem; color: #6B7280;">PAT-TRV-000001</div>
                        </td>
                        <td style="padding: 1rem;">
                            <span style="background: #F3F4F6; color: #374151; padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">OPD_CONSULTATION</span>
                        </td>
                        <td style="padding: 1rem; color: #4B5563; font-size: 0.85rem;">
                            <i class="bi bi-wallet2" style="margin-right: 4px; color:#5E35B1;"></i> UPI / GPay
                        </td>
                        <td style="padding: 1rem; font-weight: 800; color: #059669; font-size: 1rem;">₹800.00</td>
                        <td style="padding: 1rem; color: #6B7280; font-size: 0.85rem;">Today, 09:15 AM</td>
                        <td style="padding: 1rem;">
                            <span class="hospital-badge" style="background: #ECFDF5; color: #047857; border-color: #A7F3D0;">COMPLETED</span>
                        </td>
                    </tr>
                    <tr style="border-bottom: 1px solid #F3F4F6; font-size: 0.9rem;">
                        <td style="padding: 1rem;">
                            <div style="font-family: monospace; font-weight: 700; color: #111827;">REC-TRV-REG002</div>
                            <div style="font-size: 0.75rem; color: #9CA3AF; font-family: monospace;">Txn: TXN-MED-99182</div>
                        </td>
                        <td style="padding: 1rem;">
                            <div style="font-weight: 600; color: #111827;">Divya Rajan</div>
                            <div style="font-size: 0.78rem; color: #6B7280;">PAT-TRV-000002</div>
                        </td>
                        <td style="padding: 1rem;">
                            <span style="background: #F3F4F6; color: #374151; padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">OPD_CONSULTATION</span>
                        </td>
                        <td style="padding: 1rem; color: #4B5563; font-size: 0.85rem;">
                            <i class="bi bi-credit-card-2-front" style="margin-right: 4px; color:#5E35B1;"></i> Debit Card
                        </td>
                        <td style="padding: 1rem; font-weight: 800; color: #059669; font-size: 1rem;">₹750.00</td>
                        <td style="padding: 1rem; color: #6B7280; font-size: 0.85rem;">Yesterday, 02:30 PM</td>
                        <td style="padding: 1rem;">
                            <span class="hospital-badge" style="background: #ECFDF5; color: #047857; border-color: #A7F3D0;">COMPLETED</span>
                        </td>
                    </tr>
                    <tr style="border-bottom: 1px solid #F3F4F6; font-size: 0.9rem;">
                        <td style="padding: 1rem;">
                            <div style="font-family: monospace; font-weight: 700; color: #111827;">REC-TRV-REG003</div>
                            <div style="font-size: 0.75rem; color: #9CA3AF; font-family: monospace;">Txn: TXN-MED-99055</div>
                        </td>
                        <td style="padding: 1rem;">
                            <div style="font-weight: 600; color: #111827;">Mohammed Faisal</div>
                            <div style="font-size: 0.78rem; color: #6B7280;">PAT-TRV-000003</div>
                        </td>
                        <td style="padding: 1rem;">
                            <span style="background: #F3F4F6; color: #374151; padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">DIAGNOSTIC_FEE</span>
                        </td>
                        <td style="padding: 1rem; color: #4B5563; font-size: 0.85rem;">
                            <i class="bi bi-bank" style="margin-right: 4px; color:#5E35B1;"></i> Net Banking
                        </td>
                        <td style="padding: 1rem; font-weight: 800; color: #059669; font-size: 1rem;">₹1,200.00</td>
                        <td style="padding: 1rem; color: #6B7280; font-size: 0.85rem;">3 days ago</td>
                        <td style="padding: 1rem;">
                            <span class="hospital-badge" style="background: #ECFDF5; color: #047857; border-color: #A7F3D0;">COMPLETED</span>
                        </td>
                    </tr>
                    <tr style="border-bottom: 1px solid #F3F4F6; font-size: 0.9rem;">
                        <td style="padding: 1rem;">
                            <div style="font-family: monospace; font-weight: 700; color: #111827;">REC-TRV-REG004</div>
                            <div style="font-size: 0.75rem; color: #9CA3AF; font-family: monospace;">Txn: TXN-MED-98920</div>
                        </td>
                        <td style="padding: 1rem;">
                            <div style="font-weight: 600; color: #111827;">Sunita Sharma</div>
                            <div style="font-size: 0.78rem; color: #6B7280;">PAT-TRV-000004</div>
                        </td>
                        <td style="padding: 1rem;">
                            <span style="background: #F3F4F6; color: #374151; padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">REGISTRATION_FEE</span>
                        </td>
                        <td style="padding: 1rem; color: #4B5563; font-size: 0.85rem;">
                            <i class="bi bi-cash" style="margin-right: 4px; color:#5E35B1;"></i> Cash Counter
                        </td>
                        <td style="padding: 1rem; font-weight: 800; color: #059669; font-size: 1rem;">₹250.00</td>
                        <td style="padding: 1rem; color: #6B7280; font-size: 0.85rem;">4 days ago</td>
                        <td style="padding: 1rem;">
                            <span class="hospital-badge" style="background: #ECFDF5; color: #047857; border-color: #A7F3D0;">COMPLETED</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
`;
haPaymentsHtml = haPaymentsHtml.replace(/<!-- Payments Table Container -->[\s\S]*?<script>/, `${haPaymentsTableContainer}\n</div>\n<script>`);
writePage('hospital-admin/payments/index.html', haPaymentsHtml);

// ----------------------------------------------------
// 32. Generate Super Admin Dashboard (/super-admin/dashboard/index.html)
// ----------------------------------------------------
const rawSaDash = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'super-admin', 'dashboard.html'), 'utf8');
let saDashHtml = cleanThymeleaf(rawSaDash);

// Update Header with Add Hospital Admin Action
const saDashHeaderHtml = `
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
        <div>
            <h2 style="font-size: 2rem; font-weight: 800; color: #111827; margin: 0 0 4px 0;">Platform Operations Dashboard</h2>
            <p style="color: #6B7280; font-size: 0.95rem; margin: 0;">Multi-hospital network management and administrative delegation across Thiruvananthapuram district.</p>
        </div>
        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <button type="button" onclick="openAddAdminModal()" class="btn" style="background: linear-gradient(135deg, #8070A6, #6B5B95); color: #fff; border: none; padding: 0.6rem 1.35rem; border-radius: 8px; font-weight: 700; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(128,112,166,0.25); cursor: pointer;">
                <i class="bi bi-shield-plus"></i> Add Hospital Admin
            </button>
            <a href="/super-admin/hospitals" class="ref-pill-btn" style="padding: 0.55rem 1.25rem; font-size: 0.85rem; text-decoration: none;">
                <i class="bi bi-hospital"></i> Register Hospital
            </a>
        </div>
    </div>
`;
saDashHtml = saDashHtml.replace(/<div style="margin-bottom: 2rem;">\s*<h2 style="font-size: 2rem; font-weight: 800; color: #111827;">Platform Operations Dashboard<\/h2>\s*<p style="color: #6B7280; font-size: 0\.95rem;">Multi-hospital network management across Thiruvananthapuram district\.<\/p>\s*<\/div>/, saDashHeaderHtml);

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

// Add Hospital Administrators Section
const saAdminsSectionHtml = `
    <!-- Hospital Administrators Directory (Scoped Authority) -->
    <div style="background: #fff; border-radius: 16px; border: 1px solid #E5E7EB; padding: 1.75rem; margin-bottom: 2.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.02);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem;">
            <div>
                <h3 style="font-size: 1.25rem; font-weight: 700; color: #111827; margin: 0 0 4px 0;">Hospital Administrators (Scoped Authority)</h3>
                <p style="color: #6B7280; font-size: 0.85rem; margin: 0;">Super Admin delegates administration per hospital. Hospital Admins can only add doctors for their designated facility.</p>
            </div>
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                <div style="position: relative;">
                    <i class="bi bi-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9CA3AF;"></i>
                    <input type="text" id="saAdminSearch" placeholder="Search administrator…" 
                           style="padding: 0.55rem 1rem 0.55rem 2.25rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.88rem; outline: none; width: 220px; background: #fff;"
                           onkeyup="filterHospitalAdmins()"/>
                </div>
                <span id="saAdminCountBadge" class="hospital-badge" style="padding: 0.55rem 1rem; font-size: 0.85rem; background: #EDE7F6; color: #5E35B1; font-weight: 700;">3 Administrators</span>
                <button type="button" onclick="openAddAdminModal()" class="btn" style="background: linear-gradient(135deg, #8070A6, #6B5B95); color: #fff; border: none; padding: 0.55rem 1.25rem; border-radius: 8px; font-weight: 700; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 10px rgba(128,112,166,0.25); cursor: pointer;">
                    <i class="bi bi-shield-plus"></i> Add Hospital Admin
                </button>
            </div>
        </div>
        <div style="overflow-x: auto;">
            <table id="saAdminsTable" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid #E5E7EB; text-align: left; font-size: 0.82rem; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                        <th style="padding: 0.75rem 1rem;">Administrator</th>
                        <th style="padding: 0.75rem 1rem;">Assigned Hospital</th>
                        <th style="padding: 0.75rem 1rem;">Official Designation</th>
                        <th style="padding: 0.75rem 1rem;">Authority Scope</th>
                        <th style="padding: 0.75rem 1rem;">Status</th>
                        <th style="padding: 0.75rem 1rem;">Action</th>
                    </tr>
                </thead>
                <tbody id="saAdminsTbody"></tbody>
            </table>
        </div>
    </div>
`;

saDashHtml = saDashHtml.replace(/<\/div>\s*<\/div>\s*<\/body>/, `${saAdminsSectionHtml}</div></div></body>`);

const saDashInteractiveScript = `
<!-- Add Hospital Admin Modal -->
<div id="addAdminModal" style="display:none; position: fixed; inset: 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center; padding: 1rem; overflow-y: auto;">
    <div style="background: #fff; border-radius: 20px; max-width: 620px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border: 1px solid #E2E8F0; overflow: hidden; margin: auto;">
        <div style="background: linear-gradient(135deg, #EDE7F6, #F3E8FF); padding: 1.5rem 1.75rem; border-bottom: 1px solid #E9D5FF; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 44px; height: 44px; border-radius: 12px; background: #8070A6; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                    <i class="bi bi-shield-plus"></i>
                </div>
                <div>
                    <h3 style="font-size: 1.25rem; font-weight: 800; color: #1E1B4B; margin: 0;">Add Hospital Administrator</h3>
                    <p style="font-size: 0.82rem; color: #6B7280; margin: 2px 0 0 0;">Super Admin Platform Provisioning</p>
                </div>
            </div>
            <button type="button" onclick="closeAddAdminModal()" style="background: transparent; border: none; font-size: 1.5rem; color: #64748B; cursor: pointer; line-height: 1;">&times;</button>
        </div>
        
        <form id="addAdminForm" style="padding: 1.75rem; display: flex; flex-direction: column; gap: 1.1rem;">
            <div style="background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 10px; padding: 10px 14px; font-size: 0.82rem; color: #92400E; display: flex; align-items: center; gap: 10px;">
                <i class="bi bi-info-circle-fill" style="color: #D97706; font-size: 1.2rem;"></i>
                <span><strong>Role Governance:</strong> Hospital Admins have scoped authority strictly for their designated hospital (e.g. adding doctors) and cannot add other administrators.</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 4px;">Administrator Name <span style="color:#DC2626;">*</span></label>
                    <input type="text" id="adminNameInput" placeholder="e.g. Sandeep Krishnan" required
                           style="width: 100%; padding: 0.6rem 0.85rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.88rem; outline: none; box-sizing: border-box;"/>
                </div>
                <div>
                    <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 4px;">Official Email <span style="color:#DC2626;">*</span></label>
                    <input type="email" id="adminEmailInput" placeholder="sandeep.admin@healix.com" required
                           style="width: 100%; padding: 0.6rem 0.85rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.88rem; outline: none; box-sizing: border-box;"/>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 4px;">Phone Number <span style="color:#DC2626;">*</span></label>
                    <input type="tel" id="adminPhoneInput" placeholder="+91 98765 88990" value="+91 98765 " required
                           style="width: 100%; padding: 0.6rem 0.85rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.88rem; outline: none; box-sizing: border-box;"/>
                </div>
                <div>
                    <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 4px;">Assigned Hospital <span style="color:#DC2626;">*</span></label>
                    <select id="adminHospSelect" required
                            style="width: 100%; padding: 0.6rem 0.85rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.88rem; outline: none; box-sizing: border-box; background: #fff;">
                        <option value="MediCare City Hospital|TRV-HOSP-01">MediCare City Hospital (TRV-HOSP-01)</option>
                        <option value="Trivandrum Medical Trust|TRV-HOSP-02">Trivandrum Medical Trust (TRV-HOSP-02)</option>
                        <option value="Sree Chitra Speciality Hospital|TRV-HOSP-03">Sree Chitra Speciality Hospital (TRV-HOSP-03)</option>
                    </select>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 4px;">Designation / Title <span style="color:#DC2626;">*</span></label>
                    <select id="adminDesignationSelect" required
                            style="width: 100%; padding: 0.6rem 0.85rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.88rem; outline: none; box-sizing: border-box; background: #fff;">
                        <option value="Chief Administrative Officer">Chief Administrative Officer</option>
                        <option value="Hospital Operations Director">Hospital Operations Director</option>
                        <option value="Medical Superintendent">Medical Superintendent</option>
                        <option value="Clinical Registrar & Administrator">Clinical Registrar & Administrator</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 4px;">Authority Scope <span style="color:#DC2626;">*</span></label>
                    <select id="adminPermissionsSelect" required
                            style="width: 100%; padding: 0.6rem 0.85rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 0.88rem; outline: none; box-sizing: border-box; background: #fff;">
                        <option value="Full Management (Doctors, Staff, Billing)">Full Management (Doctors, Staff, Billing)</option>
                        <option value="Clinical Staff & Doctor Onboarding Only">Clinical Staff & Doctor Onboarding Only</option>
                        <option value="Billing & OPD Queue Management">Billing & OPD Queue Management</option>
                    </select>
                </div>
            </div>

            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-size: 0.8rem; font-weight: 700; color: #334155;">Default Officer Credentials</div>
                    <div style="font-size: 0.75rem; color: #64748B;">Preconfigured password: <code style="background: #E2E8F0; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Admin@123</code></div>
                </div>
                <span class="hospital-badge" style="background: #D1FAE5; color: #065F46; font-size: 0.75rem;">ROLE: HOSPITAL_ADMIN</span>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 0.5rem; padding-top: 1rem; border-top: 1px solid #E5E7EB;">
                <button type="button" onclick="closeAddAdminModal()" class="btn" style="border: 1px solid #D1D5DB; background: #fff; color: #4B5563; padding: 0.6rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    Cancel
                </button>
                <button type="submit" class="btn" style="background: linear-gradient(135deg, #8070A6, #6B5B95); color: #fff; border: none; padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                    <i class="bi bi-shield-check"></i> Provision Administrator
                </button>
            </div>
        </form>
    </div>
</div>

<script src="/js/clinical-store.js"></script>
<script>
    function renderHospitalAdmins() {
        const list = HealixStore.getHospitalAdmins();
        const tbody = document.getElementById('saAdminsTbody');
        const badge = document.getElementById('saAdminCountBadge');
        if (badge) badge.innerText = list.length + ' Administrators';

        if (!tbody) return;
        tbody.innerHTML = '';

        list.forEach(adm => {
            const initial = adm.name.charAt(0).toUpperCase() || 'A';
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #F3F4F6';
            tr.style.fontSize = '0.9rem';
            tr.innerHTML = \`
                <td style="padding: 0.85rem 1rem;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; border-radius: 10px; background: #EDE7F6; color: #5E35B1; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; border: 1px solid #DDD6FE;">
                            \${initial}
                        </div>
                        <div>
                            <div style="font-weight: 700; color: #111827;">\${adm.name}</div>
                            <div style="font-size: 0.78rem; color: #6B7280;">\${adm.id} • \${adm.email}</div>
                            <div style="font-size: 0.74rem; color: #9CA3AF;">\${adm.phone}</div>
                        </div>
                    </div>
                </td>
                <td style="padding: 0.85rem 1rem;">
                    <div style="font-weight: 600; color: #1E293B;">\${adm.hospital}</div>
                    <span class="hospital-badge" style="background: #EDE7F6; color: #5E35B1; font-size: 0.75rem;">\${adm.hospitalCode}</span>
                </td>
                <td style="padding: 0.85rem 1rem; color: #4B5563; font-weight: 500;">
                    \${adm.designation}
                </td>
                <td style="padding: 0.85rem 1rem;">
                    <span style="background: #F1F5F9; color: #334155; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">
                        \${adm.permissions}
                    </span>
                </td>
                <td style="padding: 0.85rem 1rem;">
                    <span class="hospital-badge" style="background: #D1FAE5; color: #065F46; font-size: 0.75rem;">
                        \${adm.status || 'ACTIVE'}
                    </span>
                </td>
                <td style="padding: 0.85rem 1rem;">
                    <a href="/hospital-admin/dashboard" class="btn" style="border: 1px solid #D1D5DB; padding: 4px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; text-decoration: none; color: #374151; background: #fff;">
                        <i class="bi bi-box-arrow-in-right"></i> Switch Scope
                    </a>
                </td>
            \`;
            tbody.appendChild(tr);
        });
    }

    function filterHospitalAdmins() {
        const input = document.getElementById("saAdminSearch").value.toLowerCase();
        const rows = document.querySelectorAll("#saAdminsTable tbody tr");
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(input) ? "" : "none";
        });
    }

    function openAddAdminModal() {
        document.getElementById('addAdminModal').style.display = 'flex';
        document.getElementById('adminNameInput').focus();
    }

    function closeAddAdminModal() {
        document.getElementById('addAdminModal').style.display = 'none';
        document.getElementById('addAdminForm').reset();
    }

    document.getElementById('addAdminForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('adminNameInput').value.trim();
        const email = document.getElementById('adminEmailInput').value.trim();
        const phone = document.getElementById('adminPhoneInput').value.trim();
        const hospVal = document.getElementById('adminHospSelect').value.split('|');
        const hospital = hospVal[0];
        const hospitalCode = hospVal[1];
        const designation = document.getElementById('adminDesignationSelect').value;
        const permissions = document.getElementById('adminPermissionsSelect').value;

        const newAdmin = HealixStore.addHospitalAdmin({
            name: name,
            email: email,
            phone: phone,
            hospital: hospital,
            hospitalCode: hospitalCode,
            designation: designation,
            permissions: permissions
        });

        closeAddAdminModal();
        renderHospitalAdmins();

        alert('Success: Hospital Administrator ' + newAdmin.name + ' (' + newAdmin.id + ') has been provisioned with scoped authority for ' + hospital + '!');
    });

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'addAdmin') {
        openAddAdminModal();
    }

    renderHospitalAdmins();
</script>
`;

saDashHtml = saDashHtml.replace('</body>', `${saDashInteractiveScript}</body>`);
writePage('super-admin/dashboard/index.html', saDashHtml);

// ----------------------------------------------------
// 33. Generate Super Admin Manage Hospitals (/super-admin/hospitals/index.html)
// ----------------------------------------------------
const rawSaHosps = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'super-admin', 'hospitals.html'), 'utf8');
let saHospsHtml = cleanThymeleaf(rawSaHosps);

// Add action button to Add Hospital Admin in super-admin/hospitals header
const saHospsHeaderHtml = `
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
        <div>
            <h2 style="font-size: 1.8rem; font-weight: 800; color: #111827; margin-bottom: 0.25rem;">Register New Hospital Institution</h2>
            <p style="color: #6B7280; font-size: 0.95rem;">Add hospitals in Thiruvananthapuram to the common network platform.</p>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
            <a href="/super-admin/dashboard?action=addAdmin" class="btn" style="background: linear-gradient(135deg, #8070A6, #6B5B95); color: #fff; padding: 0.55rem 1.25rem; border-radius: 8px; font-weight: 700; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 10px rgba(128,112,166,0.25); text-decoration: none;">
                <i class="bi bi-shield-plus"></i> Add Hospital Admin
            </a>
        </div>
    </div>
`;
saHospsHtml = saHospsHtml.replace(/<div style="margin-bottom: 2rem;">\s*<h2 style="font-size: 1\.8rem; font-weight: 800; color: #111827; margin-bottom: 0\.25rem;">Register New Hospital Institution<\/h2>\s*<p style="color: #6B7280; font-size: 0\.95rem;">Add hospitals in Thiruvananthapuram to the common network platform\.<\/p>\s*<\/div>/, saHospsHeaderHtml);

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
