$(document).ready(function () {

    /* RESERVATIONS PAGE */

    if ($('#reservationsTableBody').length) {

        var reservations = [
            { ref: 'AB123', name: 'Jose Rizal', route: 'MNL → JPN', seat: 'A1',  seatType: 'Premium',  status: 'Paid',      price: 24207.49, date: '2026-06-15', depTime: '15 Jun 2026 07:30 PM', arrTime: '15 Jun 2026 09:50 PM', depAirport: 'Ninoy Aquino International Airport', arrAirport: 'Japan Narita International Airport', extras: [{ label: '1 pc checked bag (24kg)', price: 2105.00 }] },
            { ref: 'CD456', name: 'Jose Rizal', route: 'CRK → HKG', seat: 'B3',  seatType: 'Standard', status: 'Pending',   price: 8500.00,  date: '2026-07-03', depTime: '03 Jul 2026 06:00 AM', arrTime: '03 Jul 2026 08:30 AM', depAirport: 'Clark International Airport',          arrAirport: 'Hong Kong International Airport',         extras: [] },
            { ref: 'EF789', name: 'Jose Rizal', route: 'MNL → SIN', seat: 'C12', seatType: 'Economy',  status: 'Paid',      price: 12350.00, date: '2026-06-20', depTime: '20 Jun 2026 08:00 AM', arrTime: '20 Jun 2026 12:10 PM', depAirport: 'Ninoy Aquino International Airport', arrAirport: 'Singapore Changi Airport',                extras: [{ label: '1 pc checked bag (20kg)', price: 1500.00 }, { label: 'Priority boarding', price: 500.00 }] },
            { ref: 'GH012', name: 'Jose Rizal', route: 'CEB → MNL', seat: 'D5',  seatType: 'Standard', status: 'Cancelled', price: 3200.00,  date: '2026-05-10', depTime: '10 May 2026 01:15 PM', arrTime: '10 May 2026 02:30 PM', depAirport: 'Mactan Cebu International Airport',    arrAirport: 'Ninoy Aquino International Airport',      extras: [] },
            { ref: 'IJ345', name: 'Jose Rizal', route: 'MNL → KUL', seat: 'E18', seatType: 'Economy',  status: 'Paid',      price: 9800.00,  date: '2026-07-18', depTime: '18 Jul 2026 03:45 PM', arrTime: '18 Jul 2026 07:00 PM', depAirport: 'Ninoy Aquino International Airport', arrAirport: 'Kuala Lumpur International Airport',      extras: [{ label: '2 pcs checked bag (24kg)', price: 3200.00 }] },
            { ref: 'KL678', name: 'Jose Rizal', route: 'ILO → MNL', seat: 'F5',  seatType: 'Standard', status: 'Pending',   price: 4100.00,  date: '2026-08-05', depTime: '05 Aug 2026 11:30 AM', arrTime: '05 Aug 2026 12:45 PM', depAirport: 'Iloilo International Airport',         arrAirport: 'Ninoy Aquino International Airport',      extras: [{ label: 'Travel insurance', price: 350.00 }] },
            { ref: 'MN901', name: 'Jose Rizal', route: 'MNL → HKG', seat: 'G7',  seatType: 'Business', status: 'Paid',      price: 31500.00, date: '2026-09-12', depTime: '12 Sep 2026 07:20 AM', arrTime: '12 Sep 2026 09:50 AM', depAirport: 'Ninoy Aquino International Airport', arrAirport: 'Hong Kong International Airport',         extras: [{ label: 'Lounge access', price: 2500.00 }, { label: '1 pc checked bag (32kg)', price: 2800.00 }] }
        ];

        var activeResIdx = null; // tracks which reservation is open in the modal

        // helper: format price as P24,207.49
        function formatPrice(p) {
            return 'P' + p.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        // helper: returns a colored badge based on status
        function statusBadge(status) {
            var cls = status === 'Paid' ? 'res-badge-paid' : status === 'Pending' ? 'res-badge-pending' : 'res-badge-cancelled';
            return '<span class="res-badge ' + cls + '">' + status + '</span>';
        }

        // builds the table rows from the reservations array and injects them into the page
        function renderReservations() {
            var html = '';
            reservations.forEach(function (r, idx) {
                html += '<tr>' +
                    '<td class="fw-semibold">' + r.ref + '</td>' +
                    '<td>' + r.name + '</td>' +
                    '<td>' + r.route + '</td>' +
                    '<td>' + r.seat + '</td>' +
                    '<td>' + statusBadge(r.status) + '</td>' +
                    '<td>' + formatPrice(r.price) + '</td>' +
                    '<td><button class="res-action-btn res-open-modal" data-index="' + idx + '" title="View details"><i class="bi bi-three-dots-vertical"></i></button></td>' +
                '</tr>';
            });
            $('#reservationsTableBody').html(html);
        }

        // fills the modal with the clicked reservation's details and opens it
        function openDetailsModal(idx) {
            activeResIdx = idx;
            var r = reservations[idx];

            $('#modalRoute').text(r.route);
            $('#modalDepTime').text(r.depTime);
            $('#modalArrTime').text(r.arrTime);
            $('#modalDepAirport').text(r.depAirport);
            $('#modalArrAirport').text(r.arrAirport);
            $('#modalSeat').text('Seat: ' + r.seatType);

            // build the extras list, or show a placeholder if none
            var extrasHtml = '';
            if (r.extras.length === 0) {
                extrasHtml = '<p class="res-modal-meta">No extra services.</p>';
            } else {
                r.extras.forEach(function (e) {
                    extrasHtml += '<div class="res-extra-row"><span>' + e.label + '</span><span>PHP ' + e.price.toLocaleString('en-PH', { minimumFractionDigits: 2 }) + '</span></div>';
                });
            }
            $('#modalExtras').html(extrasHtml);
            $('#modalTotal').text('PHP ' + r.price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

            // disable the cancel button if already cancelled
            if (r.status === 'Cancelled') {
                $('#modalCancelBtn').prop('disabled', true).text('Cancelled');
            } else {
                $('#modalCancelBtn').prop('disabled', false).text('Cancel');
            }

            var modal = new bootstrap.Modal(document.getElementById('detailsModal'));
            modal.show();
        }

        // render the table on page load
        renderReservations();

        // delegated event — buttons are created dynamically by renderReservations()
        $('#reservationsTableBody').on('click', '.res-open-modal', function () {
            var idx = parseInt($(this).data('index'));
            openDetailsModal(idx);
        });

        // cancel booking — hide details modal, show confirmation modal
        $('#modalCancelBtn').on('click', function () {
            if (activeResIdx === null) return;
            var r = reservations[activeResIdx];
            $('#cancelModalRef').text('Booking ' + r.ref + ' (' + r.route + ')');
            bootstrap.Modal.getInstance(document.getElementById('detailsModal')).hide();
            var cancelModal = new bootstrap.Modal(document.getElementById('cancelModal'));
            cancelModal.show();
        });

        // confirmed cancel — mark as cancelled in the array and re-render
        $('#cancelModalYesBtn').on('click', function () {
            if (activeResIdx === null) return;
            reservations[activeResIdx].status = 'Cancelled';
            bootstrap.Modal.getInstance(document.getElementById('cancelModal')).hide();
            renderReservations();
            activeResIdx = null;
        });

        // keep booking — close confirmation modal, reopen details
        $('#cancelModalNoBtn').on('click', function () {
            bootstrap.Modal.getInstance(document.getElementById('cancelModal')).hide();
            openDetailsModal(activeResIdx);
        });

    }

});