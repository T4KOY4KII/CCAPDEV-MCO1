$(document).ready(function () {

    /* RESERVATIONS PAGE */

    if ($('#reservationsTableBody').length) {

        var reservations = JSON.parse($('#reservationsData').text() || '[]');
        var activeResIdx = null; // tracks which reservation is open in the modal

        // helper: returns a colored badge based on status
        function statusBadge(status) {
            var cls = status === 'confirmed' ? 'res-badge-paid' : status === 'pending' ? 'res-badge-pending' : 'res-badge-cancelled';
            return '<span class="res-badge ' + cls + '">' + status + '</span>';
        }

        // builds the table rows from the reservations array and injects them into the page
        function renderReservations() {
            if (reservations.length === 0) {
                $('#reservationsEmpty').removeClass('d-none');
                $('#reservationsTableBody').html('');
                return;
            }
            $('#reservationsEmpty').addClass('d-none');

            var html = '';
            reservations.forEach(function (r, idx) {
                html += '<tr>' +
                    '<td class="fw-semibold">' + r.reservationNumber + '</td>' +
                    '<td>' + r.passengerName + '</td>' +
                    '<td>' + r.flightNumber + '</td>' +
                    '<td>' + r.seat + '</td>' +
                    '<td>' + statusBadge(r.status) + '</td>' +
                    '<td><button class="res-action-btn res-open-modal" data-index="' + idx + '" title="View details"><i class="bi bi-three-dots-vertical"></i></button></td>' +
                '</tr>';
            });
            $('#reservationsTableBody').html(html);
        }

        // fills the modal with the clicked reservation's details and opens it
        function openDetailsModal(idx) {
            activeResIdx = idx;
            var r = reservations[idx];

            $('#modalResNumber').text(r.reservationNumber);
            $('#modalFlightNumber').text(r.flightNumber);
            $('#modalPassengerName').text(r.passengerName);
            $('#modalStatus').text(r.status);
            $('#modalSeatDisplay').text(r.seat).removeClass('d-none');
            $('#modalSeatInput').addClass('d-none').val(r.seat);
            $('#modalEditBtn').removeClass('d-none');
            $('#modalSaveSeatBtn').addClass('d-none');

            if (r.status === 'cancelled') {
                $('#modalCancelBtn').prop('disabled', true).text('Cancelled');
            } else {
                $('#modalCancelBtn').prop('disabled', false).text('Cancel Booking');
            }

            var modal = new bootstrap.Modal(document.getElementById('detailsModal'));
            modal.show();
        }

        renderReservations();

        // delegated event — buttons are created dynamically by renderReservations()
        $('#reservationsTableBody').on('click', '.res-open-modal', function () {
            var idx = parseInt($(this).data('index'));
            openDetailsModal(idx);
        });

        // switch seat display into an editable input
        $('#modalEditBtn').on('click', function () {
            $('#modalSeatDisplay').addClass('d-none');
            $('#modalSeatInput').removeClass('d-none');
            $('#modalEditBtn').addClass('d-none');
            $('#modalSaveSeatBtn').removeClass('d-none');
        });

        // save the new seat number to the server
        $('#modalSaveSeatBtn').on('click', function () {
            if (activeResIdx === null) return;
            var r = reservations[activeResIdx];
            var newSeat = $('#modalSeatInput').val().trim();

            if (!newSeat) {
                alert('Seat number is required.');
                return;
            }

            fetch('/reservations/' + r._id + '/seat', {
                method: 'PUT',
                headers: { 'Content-type': 'application/json; charset=UTF-8' },
                body: JSON.stringify({ seat: newSeat })
            })
                .then(function (response) { return response.json(); })
                .then(function (result) {
                    if (result.success) {
                        r.seat = result.reservation.seat;
                        renderReservations();
                        openDetailsModal(activeResIdx);
                    } else {
                        alert(result.error || 'Something went wrong.');
                    }
                })
                .catch(function (err) {
                    console.error('Update seat error:', err);
                    alert('Something went wrong. Please try again.');
                });
        });

        // cancel booking — hide details modal, show confirmation modal
        $('#modalCancelBtn').on('click', function () {
            if (activeResIdx === null) return;
            var r = reservations[activeResIdx];
            $('#cancelModalRef').text('Booking ' + r.reservationNumber);
            bootstrap.Modal.getInstance(document.getElementById('detailsModal')).hide();
            var cancelModal = new bootstrap.Modal(document.getElementById('cancelModal'));
            cancelModal.show();
        });

        // confirmed cancel — call the server, no page refresh
        $('#cancelModalYesBtn').on('click', function () {
            if (activeResIdx === null) return;
            var r = reservations[activeResIdx];

            fetch('/reservations/' + r._id + '/cancel', { method: 'PUT' })
                .then(function (response) { return response.json(); })
                .then(function (result) {
                    if (result.success) {
                        r.status = result.reservation.status;
                        renderReservations();
                        bootstrap.Modal.getInstance(document.getElementById('cancelModal')).hide();
                        activeResIdx = null;
                    } else {
                        alert(result.error || 'Something went wrong.');
                    }
                })
                .catch(function (err) {
                    console.error('Cancel reservation error:', err);
                    alert('Something went wrong. Please try again.');
                });
        });

        // keep booking — close confirmation modal, reopen details
        $('#cancelModalNoBtn').on('click', function () {
            bootstrap.Modal.getInstance(document.getElementById('cancelModal')).hide();
            openDetailsModal(activeResIdx);
        });

    }

});