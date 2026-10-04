/* =====================================================================
   Healix - Minimal JavaScript for enhanced interactivity
   ===================================================================== */

// ---- Sidebar Toggle (mobile) ----
document.addEventListener('DOMContentLoaded', function () {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function () {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('show');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', function () {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        });
    }

    // ---- Auto-hide empty alerts & auto-dismiss active alerts ----
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(function (alert) {
        if (!alert.textContent.trim()) {
            alert.style.display = 'none';
        } else if (alert.classList.contains('alert-auto-dismiss')) {
            setTimeout(function () {
                alert.style.transition = 'opacity 0.4s';
                alert.style.opacity = '0';
                setTimeout(function () { alert.remove(); }, 400);
            }, 5000);
        }
    });

    // ---- Filter by department (doctor listing) ----
    const deptFilter = document.getElementById('deptFilter');
    if (deptFilter) {
        deptFilter.addEventListener('change', function () {
            const form = this.closest('form');
            if (form) form.submit();
        });
    }

    // ---- Confirm delete/deactivate ----
    document.querySelectorAll('[data-confirm]').forEach(function (el) {
        el.addEventListener('click', function (e) {
            const msg = this.getAttribute('data-confirm');
            if (!confirm(msg)) e.preventDefault();
        });
    });

    // ---- Dynamic prescription rows ----
    const addPrescBtn = document.getElementById('addPrescription');
    if (addPrescBtn) {
        let idx = document.querySelectorAll('.prescription-row').length;
        addPrescBtn.addEventListener('click', function () {
            const container = document.getElementById('prescriptionsContainer');
            const template = document.getElementById('prescriptionTemplate');
            if (template && container) {
                const clone = template.content.cloneNode(true);
                clone.querySelectorAll('[name]').forEach(function (el) {
                    el.name = el.name.replace('__IDX__', idx);
                });
                container.appendChild(clone);
                idx++;
            }
        });

        // Remove prescription row
        document.addEventListener('click', function (e) {
            if (e.target.classList.contains('remove-presc') ||
                e.target.closest('.remove-presc')) {
                const row = e.target.closest('.prescription-row');
                if (row && document.querySelectorAll('.prescription-row').length > 1) {
                    row.remove();
                }
            }
        });
    }

    // ---- Active nav item highlighting ----
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-item[href]').forEach(function (link) {
        if (link.getAttribute('href') === currentPath ||
            currentPath.startsWith(link.getAttribute('href') + '/')) {
            link.classList.add('active');
        }
    });

    // ---- Chart data (simple bar chart if canvas present) ----
    const chartCanvas = document.getElementById('statusChart');
    if (chartCanvas && window.Chart) {
        const labels = JSON.parse(chartCanvas.dataset.labels || '[]');
        const values = JSON.parse(chartCanvas.dataset.values || '[]');
        new Chart(chartCanvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: ['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#6366F1'],
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { font: { family: 'Inter', size: 12 }, padding: 16 }
                    }
                }
            }
        });
    }
});
