const http = require('http');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// Map URL routes exactly like Vercel rewrites
const rewrites = {
    '/': '/index.html',
    '/hospitals': '/hospitals/index.html',
    '/login': '/login/index.html',
    '/register': '/register/index.html',
    '/logout': '/logout/index.html',
    '/patient': '/patient/dashboard/index.html',
    '/patient/dashboard': '/patient/dashboard/index.html',
    '/patient/book-appointment': '/patient/book-appointment/index.html',
    '/patient/appointments': '/patient/appointments/index.html',
    '/patient/ai-assistant': '/patient/ai-assistant/index.html',
    '/patient/doctors': '/patient/doctors/index.html',
    '/patient/hospitals': '/patient/hospitals/index.html',
    '/patient/medical-records': '/patient/medical-records/index.html',
    '/patient/prescriptions': '/patient/prescriptions/index.html',
    '/patient/consent-requests': '/patient/consent-requests/index.html',
    '/patient/profile': '/patient/profile/index.html',
    '/patient/notifications': '/patient/notifications/index.html',
    '/doctor': '/doctor/dashboard/index.html',
    '/doctor/dashboard': '/doctor/dashboard/index.html',
    '/doctor/appointments': '/doctor/appointments/index.html',
    '/doctor/patients': '/doctor/patients/index.html',
    '/doctor/medical-records': '/doctor/medical-records/index.html',
    '/doctor/schedule': '/doctor/schedule/index.html',
    '/doctor/profile': '/doctor/profile/index.html',
    '/doctor/notifications': '/doctor/notifications/index.html',
    '/hospital-admin': '/hospital-admin/dashboard/index.html',
    '/hospital-admin/dashboard': '/hospital-admin/dashboard/index.html',
    '/hospital-admin/doctors': '/hospital-admin/doctors/index.html',
    '/hospital-admin/departments': '/hospital-admin/departments/index.html',
    '/hospital-admin/patients': '/hospital-admin/patients/index.html',
    '/hospital-admin/payments': '/hospital-admin/payments/index.html',
    '/super-admin': '/super-admin/dashboard/index.html',
    '/super-admin/dashboard': '/super-admin/dashboard/index.html',
    '/super-admin/hospitals': '/super-admin/hospitals/index.html'
};

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.svg': 'image/svg+xml',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png'
};

const server = http.createServer((req, res) => {
    let urlPath = req.url.split('?')[0];
    if (urlPath.endsWith('/') && urlPath.length > 1) {
        urlPath = urlPath.slice(0, -1);
    }

    let filePath;
    if (rewrites[urlPath]) {
        filePath = path.join(publicDir, rewrites[urlPath]);
    } else {
        filePath = path.join(publicDir, urlPath);
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
    } else {
        const notFoundPath = path.join(publicDir, '404.html');
        if (fs.existsSync(notFoundPath)) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            fs.createReadStream(notFoundPath).pipe(res);
        } else {
            res.writeHead(404);
            res.end('Not Found');
        }
    }
});

const PORT = 4173;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
