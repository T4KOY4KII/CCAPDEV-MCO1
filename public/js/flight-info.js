// Toggle flight details panel
function toggleDetails(detailsId, btnId) {
    var details = document.getElementById(detailsId);
    var btn = document.getElementById(btnId);

    if (!details) return;

    var isOpen = details.classList.contains('open');

    if (isOpen) {
        details.classList.remove('open');
        details.classList.add('d-none');
        if (btn) btn.innerHTML = 'View Details <i class="bi bi-chevron-up"></i>';
    } else {
        details.classList.add('open');
        details.classList.remove('d-none');
        if (btn) btn.innerHTML = 'Hide Details <i class="bi bi-chevron-down"></i>';
    }
}

async function viewDetails(flightId) {

    toggleDetails(
        `flightDetails${flightId}`,
        `detailsToggle${flightId}`
    );

    try {
        await fetch(`/flight/${flightId}/view`, {
            method: "POST"
        });
    } catch (err) {
        console.error(err);
    }
}
