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
        .replace(/<input type="hidden" name="_csrf"[^>]*>/g, '');
}

// 3. Write page to both public/<path>/index.html and <path>/index.html
function writePage(relPath, content) {
    // Write to public/<relPath>
    const pubFile = path.join(PUBLIC_DIR, relPath);
    ensureDir(path.dirname(pubFile));
    fs.writeFileSync(pubFile, content, 'utf8');

    // Write to root/<relPath>
    const rootFile = path.join(ROOT_DIR, relPath);
    ensureDir(path.dirname(rootFile));
    fs.writeFileSync(rootFile, content, 'utf8');

    console.log(`Generated: ${relPath}`);
}

// 4. Generate Landing Page (index.html)
const rawIndex = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'index.html'), 'utf8');
let indexHtml = cleanThymeleaf(rawIndex);

// Pre-fill departments in landing page
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

// Pre-fill doctors in landing page
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

// 5. Generate Hospitals Directory (/hospitals/index.html)
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

// 6. Generate Login Page (/login/index.html) with client-side interactive login logic
const rawLogin = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'login.html'), 'utf8');
let loginHtml = cleanThymeleaf(rawLogin);

// Add interactive JavaScript authentication for static deployment
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
            // Default to Patient
            const name = email.split('@')[0];
            const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
            localStorage.setItem('healix_user', JSON.stringify({ name: formattedName, email, role: 'PATIENT' }));
            window.location.href = '/patient/dashboard';
        }
    });
</script>
`;

loginHtml = loginHtml.replace(/<script>[\s\S]*?<\/script>/, loginScript);
writePage('login/index.html', loginHtml);

// 7. Generate Register Page (/register/index.html) with client-side registration logic
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

        alert('Registration successful! Your account is active. Redirecting to Patient Portal...');
        window.location.href = '/patient/dashboard';
    });
</script>
`;

registerHtml = registerHtml.replace('</body>', `${registerScript}</body>`);
writePage('register/index.html', registerHtml);

// 8. Generate AI Assistant Page (/patient/ai-assistant/index.html) with offline clinical triage
const rawAi = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'patient', 'ai-assistant.html'), 'utf8');
let aiHtml = cleanThymeleaf(rawAi);

// Replace fetch(/api/ai/assess) with real-time heuristic clinical engine
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

        if (symptoms.includes('child') || symptoms.includes('infant') || symptoms.includes('baby') || symptoms.includes('toddler')) {
            return {
                emergency: false,
                severityLevel: 'MODERATE',
                generalExplanation: 'Pediatric symptoms require prompt gentle care tailored to developing immune systems.',
                possibleConditions: ['Pediatric Viral Infection', 'Teething Irritation', 'Childhood Allergy'],
                recommendedDepartment: 'Pediatrics',
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

// 9. Generate Patient Dashboard (/patient/dashboard/index.html)
const rawPatientDash = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'patient', 'dashboard.html'), 'utf8');
let patientDashHtml = cleanThymeleaf(rawPatientDash);

// Populate static patient details
patientDashHtml = patientDashHtml
    .replace('<span th:text="${patient.name}">Patient</span>', '<span id="patientNameHeader">Arun Chandran</span>')
    .replace('${#temporals.format(#temporals.createNow(), \'EEEE, dd MMMM yyyy\')}', new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
    .replace('<h3 th:text="${patient.name}">Patient Name</h3>', '<h3 id="patientNameBanner">Arun Chandran</h3>')
    .replace('th:text="${patient.patientIdentifier ?: \'PAT-TRV-000001\'}"', '')
    .replace('<span th:text="${patient.patientIdentifier ?: \'PAT-TRV-000001\'}">PAT-TRV-000001</span>', '<span id="patientIdBadge">PAT-TRV-000001</span>');

// Replace Thymeleaf dynamic stats with actual defaults
patientDashHtml = patientDashHtml
    .replace(/<div class="stat-number" th:text="\$\{[^}]+\}">\d+<\/div>/g, '<div class="stat-number">3</div>')
    .replace(/<a href="\/logout"/g, '<a href="/login" onclick="localStorage.removeItem(\'healix_user\')"');

// Add client-side user retrieval
const patientScript = `
<script>
    const user = JSON.parse(localStorage.getItem('healix_user') || '{"name":"Arun Chandran","email":"patient@healix.com"}');
    if (document.getElementById('patientNameHeader')) document.getElementById('patientNameHeader').innerText = user.name;
    if (document.getElementById('patientNameBanner')) document.getElementById('patientNameBanner').innerText = user.name;
</script>
`;
patientDashHtml = patientDashHtml.replace('</body>', `${patientScript}</body>`);
writePage('patient/dashboard/index.html', patientDashHtml);

// 10. Generate Patient Book Appointment (/patient/book-appointment/index.html)
const rawBook = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'patient', 'book-appointment.html'), 'utf8');
let bookHtml = cleanThymeleaf(rawBook);

// Add interactive appointment booking logic
const bookScript = `
<script>
    document.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        const hospital = document.querySelector('select[name="hospitalId"]') ? document.querySelector('select[name="hospitalId"]').options[document.querySelector('select[name="hospitalId"]').selectedIndex].text : 'MediCare City Hospital';
        const doctor = document.querySelector('select[name="doctorId"]') ? document.querySelector('select[name="doctorId"]').options[document.querySelector('select[name="doctorId"]').selectedIndex].text : 'Dr. Rajesh Kumar (Cardiology)';
        const date = document.querySelector('input[type="date"]').value || 'Tomorrow';
        const time = document.querySelector('select[name="appointmentTime"]') ? document.querySelector('select[name="appointmentTime"]').value : '10:00 AM';

        alert('Appointment successfully booked with ' + doctor + ' at ' + hospital + ' on ' + date + ' (' + time + ')! Registration slip generated.');
        window.location.href = '/patient/appointments';
    });
</script>
`;
bookHtml = bookHtml.replace('</body>', `${bookScript}</body>`);
writePage('patient/book-appointment/index.html', bookHtml);

// 11. Generate Patient Appointments (/patient/appointments/index.html)
const rawAppts = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'patient', 'appointments.html'), 'utf8');
let apptsHtml = cleanThymeleaf(rawAppts);
writePage('patient/appointments/index.html', apptsHtml);

// 12. Generate Doctor Dashboard (/doctor/dashboard/index.html)
const rawDocDash = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'doctor', 'dashboard.html'), 'utf8');
let docDashHtml = cleanThymeleaf(rawDocDash);
writePage('doctor/dashboard/index.html', docDashHtml);

// 13. Generate Hospital Admin Dashboard (/hospital-admin/dashboard/index.html)
const rawHaDash = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'hospital-admin', 'dashboard.html'), 'utf8');
let haDashHtml = cleanThymeleaf(rawHaDash);
writePage('hospital-admin/dashboard/index.html', haDashHtml);

// 14. Generate Super Admin Dashboard (/super-admin/dashboard/index.html)
const rawSaDash = fs.readFileSync(path.join(ROOT_DIR, 'Frontend', 'templates', 'super-admin', 'dashboard.html'), 'utf8');
let saDashHtml = cleanThymeleaf(rawSaDash);
writePage('super-admin/dashboard/index.html', saDashHtml);

// 15. Create 404.html fallback in public/
const notFoundHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Healix HMS - Page Not Found</title>
    <link rel="stylesheet" href="/css/main.css"/>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"/>
</head>
<body style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#F9FAFB;font-family:'Inter',sans-serif;margin:0;">
    <div style="background:#fff;padding:40px;border-radius:20px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.06);max-width:480px;border:1px solid #E5E7EB;">
        <div style="width:64px;height:64px;background:#EDE7F6;color:#5E35B1;border-radius:16px;margin:0 auto 1.5rem;display:flex;align-items:center;justify-content:center;font-size:1.8rem;">
            <i class="bi bi-hospital"></i>
        </div>
        <h1 style="font-size:2rem;color:#111827;font-weight:800;margin-bottom:8px;">HealiX Platform</h1>
        <p style="color:#6B7280;margin-bottom:24px;">The page you are looking for has been moved or is available on our main portal.</p>
        <div style="display:flex;gap:12px;justify-content:center;">
            <a href="/" class="ref-pill-btn" style="padding:10px 24px;text-decoration:none;">Go to Home</a>
            <a href="/login" class="btn" style="border:1px solid #D1D5DB;padding:10px 24px;border-radius:9999px;text-decoration:none;color:#374151;">Sign In</a>
        </div>
    </div>
</body>
</html>`;
writePage('404.html', notFoundHtml);

console.log('✅ All static pages generated successfully!');
