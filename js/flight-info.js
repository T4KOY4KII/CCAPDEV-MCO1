// Toggle flight details panel
function toggleDetails(detailsId, btnId) {
    var details = document.getElementById(detailsId);
    var btn = document.getElementById(btnId);
    var isOpen = details.classList.contains('open');

    if (isOpen) {
        details.classList.remove('open');
        btn.innerHTML = 'View Details <i class="bi bi-chevron-up"></i>';
    } else {
        details.classList.add('open');
        btn.innerHTML = 'Hide Details <i class="bi bi-chevron-down"></i>';
    }
}