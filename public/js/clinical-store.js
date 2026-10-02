/**
 * HealiX Clinical Data Store & Interactive Workflow Engine
 * Handles persistent state for:
 * - Doctor writing Medical Records & Prescriptions
 * - Patient viewing their updated Medical Records & Prescriptions
 * - Doctor confirming appointments in real-time
 * - Doctor editing & updating their own profile
 */

const HealixStore = {
    init() {
        if (!localStorage.getItem('healix_appointments')) {
            localStorage.setItem('healix_appointments', JSON.stringify([
                {
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
                    paymentStatus: "PAID",
                    paymentTxn: "UPI/TXN/8492019482"
                },
                {
                    id: 1084,
                    patientName: "Divya Rajan",
                    patientId: "PAT-TRV-000002",
                    patientPhone: "9876510003",
                    doctorName: "Dr. Rajesh Kumar",
                    hospitalName: "MediCare City Hospital",
                    date: "In 2 Days",
                    time: "11:00 AM",
                    reason: "Hypertension check and medication adjustment",
                    status: "CONFIRMED",
                    fee: 800,
                    paymentStatus: "PENDING"
                },
                {
                    id: 1085,
                    patientName: "Mohammed Faisal",
                    patientId: "PAT-TRV-000003",
                    patientPhone: "9876510005",
                    doctorName: "Dr. Rajesh Kumar",
                    hospitalName: "MediCare City Hospital",
                    date: "Today",
                    time: "03:30 PM",
                    reason: "Cardiac stress test review",
                    status: "PENDING",
                    fee: 800,
                    paymentStatus: "PENDING"
                }
            ]));
        }

        if (!localStorage.getItem('healix_medical_records')) {
            localStorage.setItem('healix_medical_records', JSON.stringify([
                {
                    id: "MR-801",
                    date: "10 Sep 2026",
                    patientName: "Arun Chandran",
                    patientId: "PAT-TRV-000001",
                    doctorName: "Dr. Rajesh Kumar",
                    hospitalName: "MediCare City Hospital",
                    symptoms: "Exertional chest tightness, fatigue, palpitations",
                    diagnosis: "Angina Pectoris / Mild Essential HTN",
                    treatment: "Atorvastatin 20mg nocte, Metoprolol Succinate 50mg mane, low-sodium cardiac diet.",
                    notes: "Advised 2D Echocardiogram in 4 weeks. Avoid strenuous unconditioned exertion.",
                    followUpDate: "2026-10-15"
                },
                {
                    id: "MR-792",
                    date: "02 Sep 2026",
                    patientName: "Mohammed Faisal",
                    patientId: "PAT-TRV-000003",
                    doctorName: "Dr. Rajesh Kumar",
                    hospitalName: "MediCare City Hospital",
                    symptoms: "Routine annual executive cardiac screening",
                    diagnosis: "Dyslipidemia (borderline elevated LDL)",
                    treatment: "Rosuvastatin 10mg daily, dietary counseling.",
                    notes: "Repeat fasting lipid panel in 60 days.",
                    followUpDate: "2026-11-02"
                }
            ]));
        }

        if (!localStorage.getItem('healix_prescriptions')) {
            localStorage.setItem('healix_prescriptions', JSON.stringify([
                {
                    id: "RX-1082-1",
                    medicineName: "Atorvastatin 20mg",
                    dosage: "1 Tablet",
                    frequency: "Once Daily (Night)",
                    duration: "30 Days",
                    instructions: "Take after evening food with water. Monitor lipid profile after 60 days.",
                    doctorName: "Dr. Rajesh Kumar",
                    patientName: "Arun Chandran",
                    patientId: "PAT-TRV-000001",
                    issuedDate: "10 Sep 2026",
                    status: "ACTIVE"
                },
                {
                    id: "RX-1082-2",
                    medicineName: "Metoprolol Succinate 50mg",
                    dosage: "1 Tablet",
                    frequency: "Once Daily (Morning)",
                    duration: "30 Days",
                    instructions: "Take after breakfast. Regularly record morning resting pulse rate.",
                    doctorName: "Dr. Rajesh Kumar",
                    patientName: "Arun Chandran",
                    patientId: "PAT-TRV-000001",
                    issuedDate: "10 Sep 2026",
                    status: "ACTIVE"
                }
            ]));
        }

        if (!localStorage.getItem('healix_doctor_profile')) {
            localStorage.setItem('healix_doctor_profile', JSON.stringify({
                name: "Rajesh Kumar",
                fullName: "Dr. Rajesh Kumar",
                email: "doctor@healix.com",
                phone: "9876501234",
                specialization: "Senior Cardiologist",
                qualification: "MBBS, MD (Cardiology), DM (Cardiology)",
                department: "Cardiology",
                hospital: "MediCare City Hospital",
                room: "OPD Room 104",
                experienceYears: 15,
                consultationFee: "800.00",
                availability: "Mon-Sat: 9AM-1PM, 3PM-6PM",
                bio: "Senior interventional cardiologist with 15+ years of clinical experience in preventative and interventional cardiology."
            }));
        }

        if (!localStorage.getItem('healix_hospital_doctors')) {
            localStorage.setItem('healix_hospital_doctors', JSON.stringify([
                {
                    id: "DOC-TRV-001",
                    name: "Dr. Rajesh Kumar",
                    email: "doctor@healix.com",
                    phone: "+91 98765 01234",
                    department: "Cardiology",
                    qualification: "MBBS, MD, DM (Cardiology)",
                    experienceYears: 15,
                    room: "Room 104",
                    consultationFee: 800,
                    hospital: "MediCare City Hospital",
                    hospitalCode: "TRV-HOSP-01",
                    availability: "Mon-Sat: 09:00 AM - 01:00 PM",
                    status: "ACTIVE"
                },
                {
                    id: "DOC-TRV-002",
                    name: "Dr. Priya Nair",
                    email: "priya.nair@healix.com",
                    phone: "+91 98765 02234",
                    department: "Neurology",
                    qualification: "MBBS, MD, DM (Neurology)",
                    experienceYears: 10,
                    room: "Room 202",
                    consultationFee: 900,
                    hospital: "MediCare City Hospital",
                    hospitalCode: "TRV-HOSP-01",
                    availability: "Mon-Fri: 10:00 AM - 02:00 PM",
                    status: "ACTIVE"
                },
                {
                    id: "DOC-TRV-003",
                    name: "Dr. Suresh Menon",
                    email: "suresh.menon@healix.com",
                    phone: "+91 98765 03234",
                    department: "Orthopedics",
                    qualification: "MBBS, MS (Ortho), M.Ch",
                    experienceYears: 12,
                    room: "Room 108",
                    consultationFee: 750,
                    hospital: "MediCare City Hospital",
                    hospitalCode: "TRV-HOSP-01",
                    availability: "Mon-Sat: 09:00 AM - 01:00 PM",
                    status: "ACTIVE"
                },
                {
                    id: "DOC-TRV-008",
                    name: "Dr. Anita Sen",
                    email: "anita.sen@healix.com",
                    phone: "+91 98765 08234",
                    department: "General Medicine",
                    qualification: "MBBS, MD (General Medicine)",
                    experienceYears: 9,
                    room: "Room 101",
                    consultationFee: 500,
                    hospital: "MediCare City Hospital",
                    hospitalCode: "TRV-HOSP-01",
                    availability: "Mon-Sat: 08:30 AM - 01:30 PM",
                    status: "ACTIVE"
                }
            ]));
        }

        if (!localStorage.getItem('healix_hospital_admins')) {
            localStorage.setItem('healix_hospital_admins', JSON.stringify([
                {
                    id: "ADM-TRV-001",
                    name: "Arun Varma",
                    email: "admin.medicare@healix.com",
                    phone: "+91 98765 11001",
                    hospital: "MediCare City Hospital",
                    hospitalCode: "TRV-HOSP-01",
                    designation: "Chief Administrative Officer",
                    permissions: "Full Management (Doctors, Staff, Billing)",
                    status: "ACTIVE",
                    joinedDate: "12 Jan 2025"
                },
                {
                    id: "ADM-TRV-002",
                    name: "Radhika Pillai",
                    email: "admin.tmt@healix.com",
                    phone: "+91 98765 22002",
                    hospital: "Trivandrum Medical Trust",
                    hospitalCode: "TRV-HOSP-02",
                    designation: "Hospital Operations Director",
                    permissions: "Clinical & Staff Operations",
                    status: "ACTIVE",
                    joinedDate: "05 Mar 2025"
                },
                {
                    id: "ADM-TRV-003",
                    name: "Dr. George Varghese",
                    email: "admin.kims@healix.com",
                    phone: "+91 98765 33003",
                    hospital: "Sree Chitra Speciality Hospital",
                    hospitalCode: "TRV-HOSP-03",
                    designation: "Medical Superintendent",
                    permissions: "Full Hospital Administration",
                    status: "ACTIVE",
                    joinedDate: "18 Jun 2025"
                }
            ]));
        }
    },

    getHospitalDoctors() {
        this.init();
        return JSON.parse(localStorage.getItem('healix_hospital_doctors') || '[]');
    },
    saveHospitalDoctors(list) {
        localStorage.setItem('healix_hospital_doctors', JSON.stringify(list));
    },
    addHospitalDoctor(data) {
        const list = this.getHospitalDoctors();
        const newDocId = 'DOC-TRV-' + String(Math.floor(100 + Math.random() * 900));
        const newDoctor = {
            id: newDocId,
            name: data.name.startsWith('Dr.') ? data.name : 'Dr. ' + data.name,
            email: data.email || 'doctor@healix.com',
            phone: data.phone || '+91 98765 00000',
            department: data.department || 'General Medicine',
            qualification: data.qualification || 'MBBS, MD',
            experienceYears: Number(data.experienceYears) || 5,
            room: data.room || 'Room 105',
            consultationFee: Number(data.consultationFee) || 500,
            hospital: data.hospital || 'MediCare City Hospital',
            hospitalCode: data.hospitalCode || 'TRV-HOSP-01',
            availability: data.availability || 'Mon-Sat: 09:00 AM - 01:00 PM',
            bio: data.bio || 'Clinical specialist consultant.',
            status: 'ACTIVE'
        };
        list.unshift(newDoctor);
        this.saveHospitalDoctors(list);
        return newDoctor;
    },

    getHospitalAdmins() {
        this.init();
        return JSON.parse(localStorage.getItem('healix_hospital_admins') || '[]');
    },
    saveHospitalAdmins(list) {
        localStorage.setItem('healix_hospital_admins', JSON.stringify(list));
    },
    addHospitalAdmin(data) {
        const list = this.getHospitalAdmins();
        const newAdmId = 'ADM-TRV-' + String(Math.floor(10 + Math.random() * 90)).padStart(3, '0');
        const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const newAdmin = {
            id: newAdmId,
            name: data.name,
            email: data.email,
            phone: data.phone || '+91 98765 00000',
            hospital: data.hospital || 'MediCare City Hospital',
            hospitalCode: data.hospitalCode || 'TRV-HOSP-01',
            designation: data.designation || 'Hospital Administrator',
            permissions: data.permissions || 'Full Management (Doctors, Staff, Billing)',
            status: 'ACTIVE',
            joinedDate: todayStr
        };
        list.unshift(newAdmin);
        this.saveHospitalAdmins(list);
        return newAdmin;
    },

    getAppointments() {
        this.init();
        return JSON.parse(localStorage.getItem('healix_appointments') || '[]');
    },
    saveAppointments(list) {
        localStorage.setItem('healix_appointments', JSON.stringify(list));
    },

    getMedicalRecords() {
        this.init();
        return JSON.parse(localStorage.getItem('healix_medical_records') || '[]');
    },
    saveMedicalRecords(list) {
        localStorage.setItem('healix_medical_records', JSON.stringify(list));
    },

    getPrescriptions() {
        this.init();
        return JSON.parse(localStorage.getItem('healix_prescriptions') || '[]');
    },
    savePrescriptions(list) {
        localStorage.setItem('healix_prescriptions', JSON.stringify(list));
    },

    getDoctorProfile() {
        this.init();
        return JSON.parse(localStorage.getItem('healix_doctor_profile') || '{}');
    },
    saveDoctorProfile(data) {
        localStorage.setItem('healix_doctor_profile', JSON.stringify(data));
    },

    // Confirm Appointment
    confirmAppointment(id) {
        const appts = this.getAppointments();
        const appt = appts.find(a => a.id === Number(id));
        if (appt) {
            appt.status = 'CONFIRMED';
            this.saveAppointments(appts);
            return true;
        }
        return false;
    },

    // Mark Appointment Paid via UPI
    markAppointmentPaid(id, txnRef) {
        const appts = this.getAppointments();
        const appt = appts.find(a => a.id === Number(id));
        if (appt) {
            appt.paymentStatus = 'PAID';
            appt.paymentTxn = txnRef || ('UPI/TXN/' + Math.floor(1000000000 + Math.random() * 9000000000));
            this.saveAppointments(appts);
            return true;
        }
        return false;
    },

    // Add Record & Prescriptions
    addRecordWithPrescriptions(recordData, rxList) {
        const records = this.getMedicalRecords();
        const prescriptions = this.getPrescriptions();

        const doc = this.getDoctorProfile();
        const recordId = 'MR-' + (Math.floor(1000 + Math.random() * 9000));
        const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        const newRecord = {
            id: recordId,
            date: todayStr,
            patientName: recordData.patientName,
            patientId: recordData.patientId,
            doctorName: doc.fullName || "Dr. Rajesh Kumar",
            hospitalName: doc.hospital || "MediCare City Hospital",
            symptoms: recordData.symptoms,
            diagnosis: recordData.diagnosis,
            treatment: recordData.treatment,
            notes: recordData.notes,
            followUpDate: recordData.followUpDate || "2 Weeks"
        };
        records.unshift(newRecord);
        this.saveMedicalRecords(records);

        // Add Prescriptions
        rxList.forEach((rx, index) => {
            if (rx.medicineName && rx.medicineName.trim()) {
                prescriptions.unshift({
                    id: 'RX-' + recordId + '-' + (index + 1),
                    medicineName: rx.medicineName.trim(),
                    dosage: rx.dosage || '1 Tablet',
                    frequency: rx.frequency || 'Once Daily',
                    duration: rx.duration || '30 Days',
                    instructions: rx.instructions || 'Take after meals',
                    doctorName: doc.fullName || "Dr. Rajesh Kumar",
                    patientName: recordData.patientName,
                    patientId: recordData.patientId,
                    issuedDate: todayStr,
                    status: 'ACTIVE'
                });
            }
        });
        this.savePrescriptions(prescriptions);

        // Mark associated appointment as COMPLETED if any
        if (recordData.appointmentId) {
            const appts = this.getAppointments();
            const targetAppt = appts.find(a => a.id === Number(recordData.appointmentId));
            if (targetAppt) {
                targetAppt.status = 'COMPLETED';
                this.saveAppointments(appts);
            }
        }

        return newRecord;
    }
};

// Auto-initialize store
HealixStore.init();

// Toast helper
function showToast(message, type = 'success') {
    const existing = document.getElementById('healixToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'healixToast';
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.zIndex = '9999';
    toast.style.background = type === 'success' ? '#0F766E' : '#B91C1C';
    toast.style.color = '#fff';
    toast.style.padding = '14px 22px';
    toast.style.borderRadius = '12px';
    toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';
    toast.style.fontSize = '0.92rem';
    toast.style.fontWeight = '600';
    toast.style.transition = 'all 0.3s ease';

    const icon = type === 'success' ? '<i class="bi bi-check-circle-fill"></i>' : '<i class="bi bi-exclamation-triangle-fill"></i>';
    toast.innerHTML = `${icon} <span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 350);
    }, 4000);
}
