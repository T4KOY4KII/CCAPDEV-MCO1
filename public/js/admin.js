document.addEventListener('DOMContentLoaded', () => {
    /* --- Search bar typing --- */
    const flightSearchInput = document.getElementById('flightSearch');
    if (flightSearchInput) {
        let searchTimeout;
        flightSearchInput.addEventListener('input', (inputEvent) => { // when you type on the search box
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const query = inputEvent.target.value.trim();
                fetchFlightsAJAX(query);
            }, 250);
        });
    }

    /* --- reservation search and filter --- */
    const reservationSearchInput = document.getElementById('reservationSearch');
    const reservationStatusFilter = document.getElementById('reservationStatusFilter');
    if (reservationSearchInput) {
        let resSearchTimeout;
        reservationSearchInput.addEventListener('input', () => {
            clearTimeout(resSearchTimeout);
            resSearchTimeout = setTimeout(() => {
                fetchReservationsAJAX();
            }, 250);
        });
    }
    if (reservationStatusFilter) {
        reservationStatusFilter.addEventListener('change', () => {
            fetchReservationsAJAX();
        });
    }

    /* --- user search and filter --- */
    const userSearchInput = document.getElementById('userSearch');
    const userRoleSort = document.getElementById('roleSort');
    const userStatusFilter = document.getElementById('statusFilter');
    if (userSearchInput) {
        let userSearchTimeout;
        userSearchInput.addEventListener('input', () => {
            clearTimeout(userSearchTimeout);
            userSearchTimeout = setTimeout(() => {
                fetchUsersAJAX();
            }, 250);
        });
    }
    if (userRoleSort) {
        userRoleSort.addEventListener('change', () => {
            fetchUsersAJAX();
        });
    }
    if (userStatusFilter && userSearchInput) {
        userStatusFilter.addEventListener('change', () => {
            fetchUsersAJAX();
        });
    }
});

/* --- render table rows --- */
function renderFlightsTable(flights) {
    const tableBody = document.getElementById('TableBody');
    if (!tableBody) return;

    if (!flights || flights.length === 0) {
        tableBody.innerHTML = `
            <tr id="noFlightsRow">
                <td colspan="10" class="text-center text-muted py-4">No flights found in database. Click 'Add Flight' above to create one.</td>
            </tr>
        `;
        return;
    }

    // loop thru all flights and put them into rows inside tbody
    tableBody.innerHTML = flights.map(flightItem => `
        <tr id="flight-row-${flightItem._id}" data-id="${flightItem._id}" data-flightcode="${flightItem.flightCode}" data-triptype="${flightItem.tripType}" data-status="${flightItem.status}" data-airline="${flightItem.airline}" data-origin="${flightItem.origin}" data-destination="${flightItem.destination}" data-departure="${flightItem.departureDateISO}" data-arrival="${flightItem.arrivalDateISO}" data-price="${flightItem.price}" data-seats="${flightItem.availableSeats}" 
        data-ispromo="${flightItem.isPromo}" data-discountpercent="${flightItem.discountPercent}" data-promotitle="${flightItem.promoLabel}" data-promostartdate="${flightItem.promoStartDateISO}" data-promoenddate="${flightItem.promoEndDateISO}">
            <td class="col-flightCode fw-bold">${flightItem.flightCode}</td>
            <td class="col-airline">${flightItem.airline}</td>
            <td class="col-route">${flightItem.origin} <i class="bi bi-arrow-right"></i> ${flightItem.destination}</td>
            <td class="col-departure">${flightItem.departureFormatted}</td>
            <td class="col-arrival">${flightItem.arrivalFormatted}</td>
            <td class="col-price">₱${flightItem.priceFormatted}</td>
            <td class="col-promo">
                ${flightItem.isPromo
            ? `<button class="btn btn-sm secondary-btn"
                            onclick="openPromoModal('${flightItem._id}')">
                            View
                        </button>`
            : `<span class="text-muted">—</span>`
        }
            </td>
            <td class="col-seats">${flightItem.availableSeats}</td>
            <td class="col-status">
                <span class="badge badge-${flightItem.statusBadgeClass}">${flightItem.statusCapitalized}</span>
            </td>
            <td>
                <div>
                    <button class="edit-btn" onclick="openEditFlightModal('${flightItem._id}')">
                        <i class="bi bi-pencil me-1"></i>
                    </button>
                    <button class="delete-btn" onclick="openDeleteFlightModal('${flightItem._id}', '${flightItem.flightCode}')">
                        <i class="bi bi-trash3 ms-1"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/* --- get flights from server without reloading --- */
async function fetchFlightsAJAX(query = '') {
    try {
        const response = await fetch(`/api/admin/flights?q=${encodeURIComponent(query)}`);
        const dataObj = await response.json();
        if (dataObj.success) {
            renderFlightsTable(dataObj.flights);
        } else {
            console.error("Error fetching flights:", dataObj.error);
        }
    } catch (errorObj) {
        console.error("AJAX Fetch Error:", errorObj);
    }
}

/* --- render the promo section of a modal--- */
function readPromoFields(prefix) {

    const idFor = (base) => prefix ? `${prefix}${base.charAt(0).toUpperCase()}${base.slice(1)}` : base;
    return {
        isPromo: document.getElementById(idFor('isPromo')).checked,
        promoLabel: document.getElementById(idFor('promoLabel')).value.trim(),
        discountPercent: document.getElementById(idFor('discountPercent')).value,
        promoStartDate: document.getElementById(idFor('promoStartDate')).value,
        promoEndDate: document.getElementById(idFor('promoEndDate')).value
    };
}

function validatePromoFieldsClient(promo, errorId) {
    if (!promo.isPromo) return true;
    const pct = Number(promo.discountPercent);
    if (isNaN(pct) || pct <= 0 || pct > 100) {
        showModalError(errorId, 'Discount must be a number between 1 and 100 when marked as promotional.');
        return false;
    }
    if (!promo.promoEndDate) {
        showModalError(errorId, 'Promotion End date is required when marked as promotional.');
        return false;
    }
    if (promo.promoStartDate && new Date(promo.promoEndDate) <= new Date(promo.promoStartDate)) {
        showModalError(errorId, 'Promotion End must be after Promotion Start.');
        return false;
    }
    return true;
}

/* --- add flight modal submit --- */
function submitAddFlight() {
    const errorBox = document.getElementById('addFlightError');
    errorBox.classList.add('d-none');
    errorBox.textContent = '';

    const tripTypeElem = document.querySelector('input[name="tripType"]:checked');
    const tripType = tripTypeElem ? tripTypeElem.value : 'oneway';
    const flightNum = document.getElementById('flightNum').value.trim();
    const flightStatus = document.getElementById('flightStatus').value;
    const airline = document.getElementById('airline').value.trim();
    const fromField = document.getElementById('fromField').value.trim();
    const toField = document.getElementById('toField').value.trim();
    const departDate = document.getElementById('departDate').value;
    const arrivalDate = document.getElementById('arrivalDate').value;
    const price = document.getElementById('price').value.trim();
    const seats = document.getElementById('seats').value.trim();
    const promo = readPromoFields('');

    // check if inputs are missing
    if (!flightNum || !airline || !fromField || !toField || !departDate || !arrivalDate || price === '' || seats === '') {
        showModalError('addFlightError', 'All fields are required.');
        return;
    }

    // check if origin is same as destination
    if (fromField === toField) {
        showModalError('addFlightError', 'Origin and destination cannot be the same.');
        return;
    }

    const priceNum = Number(price);
    const seatsNum = Number(seats);

    if (isNaN(priceNum) || priceNum < 0) {
        showModalError('addFlightError', 'Ticket price must be a valid non-negative number.');
        return;
    }

    if (isNaN(seatsNum) || seatsNum < 0 || !Number.isInteger(seatsNum)) {
        showModalError('addFlightError', 'Available seats must be a valid non-negative integer.');
        return;
    }

    if (new Date(arrivalDate) <= new Date(departDate)) {
        showModalError('addFlightError', 'Arrival date & time must be after departure date & time.');
        return;
    }

    // send request to save the new flight
    fetch('/api/admin/flights', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tripType,
            flightNum,
            flightStatus,
            airline,
            fromField,
            toField,
            departDate,
            arrivalDate,
            price: priceNum,
            seats: seatsNum,

            //for promo flights
            isPromo: promo.isPromo,
            promoLabel: promo.promoLabel,
            discountPercent: promo.discountPercent,
            promoStartDate: promo.promoStartDate,
            promoEndDate: promo.promoEndDate
        })
    })
        .then(response => response.json())
        .then(dataObj => {
            if (dataObj.success) {
                document.getElementById('addFlight').close();
                document.getElementById('flightNum').value = '';
                document.getElementById('airline').value = '';
                document.getElementById('fromField').value = '';
                document.getElementById('toField').value = '';
                document.getElementById('departDate').value = '';
                document.getElementById('arrivalDate').value = '';
                document.getElementById('price').value = '';
                document.getElementById('seats').value = '';

                //for promo flights
                document.getElementById('isPromo').checked = false;
                document.getElementById('promoLabel').value = '';
                document.getElementById('discountPercent').value = '';
                document.getElementById('promoStartDate').value = '';
                document.getElementById('promoEndDate').value = '';
                document.getElementById('promoFields').style.display = 'none';
                fetchFlightsAJAX();
            } else {
                showModalError('addFlightError', dataObj.error || 'Failed to add flight.');
            }
        })
        .catch(errorObj => {
            console.error("Add Flight Error:", errorObj);
            showModalError('addFlightError', 'Network or server error occurred.');
        });
}

/* --- open edit modal and load data --- */
function openEditFlightModal(id) {
    const row = document.getElementById(`flight-row-${id}`);
    if (!row) return;

    const flightCode = row.getAttribute('data-flightcode');
    const tripType = row.getAttribute('data-triptype') || 'oneway';
    const status = row.getAttribute('data-status') || 'scheduled';
    const airline = row.getAttribute('data-airline');
    const origin = row.getAttribute('data-origin');
    const destination = row.getAttribute('data-destination');
    const departure = row.getAttribute('data-departure');
    const arrival = row.getAttribute('data-arrival');
    const price = row.getAttribute('data-price');
    const seats = row.getAttribute('data-seats');

    document.getElementById('editFlightId').value = id;
    document.getElementById('editFlightNum').value = flightCode;
    document.getElementById('editFlightStatus').value = status;
    document.getElementById('editAirline').value = airline;
    document.getElementById('editFromField').value = origin;
    document.getElementById('editToField').value = destination;
    document.getElementById('editDepartDate').value = departure;
    document.getElementById('editArrivalDate').value = arrival;
    document.getElementById('editPrice').value = price;
    document.getElementById('editSeats').value = seats;

    if (tripType === 'round') {
        document.getElementById('editRoundTrip').checked = true;
    } else {
        document.getElementById('editOneWay').checked = true;
    }

    const isPromo = row.getAttribute('data-ispromo') === 'true';
    document.getElementById('editIsPromo').checked = isPromo;
    document.getElementById('editPromoLabel').value = row.getAttribute('data-promotitle') || '';
    document.getElementById('editDiscountPercent').value = row.getAttribute('data-discountpercent') || '';
    document.getElementById('editPromoStartDate').value = row.getAttribute('data-promostartdate') || '';
    document.getElementById('editPromoEndDate').value = row.getAttribute('data-promoenddate') || '';
    document.getElementById('editPromoFields').style.display = isPromo ? 'block' : 'none';

    const errorBox = document.getElementById('editFlightError');
    errorBox.classList.add('d-none');
    errorBox.textContent = '';

    document.getElementById('editFlight').showModal();
}

/* --- save edited flight --- */
function submitEditFlight() {
    const id = document.getElementById('editFlightId').value;
    const errorBox = document.getElementById('editFlightError');
    errorBox.classList.add('d-none');
    errorBox.textContent = '';

    const tripTypeElem = document.querySelector('input[name="editTripType"]:checked');
    const tripType = tripTypeElem ? tripTypeElem.value : 'oneway';
    const flightNum = document.getElementById('editFlightNum').value.trim();
    const flightStatus = document.getElementById('editFlightStatus').value;
    const airline = document.getElementById('editAirline').value.trim();
    const fromField = document.getElementById('editFromField').value.trim();
    const toField = document.getElementById('editToField').value.trim();
    const departDate = document.getElementById('editDepartDate').value;
    const arrivalDate = document.getElementById('editArrivalDate').value;
    const price = document.getElementById('editPrice').value.trim();
    const seats = document.getElementById('editSeats').value.trim();
    const promo = readPromoFields('edit');

    if (!flightNum || !airline || !fromField || !toField || !departDate || !arrivalDate || price === '' || seats === '') {
        showModalError('editFlightError', 'All fields are required.');
        return;
    }

    if (fromField === toField) {
        showModalError('editFlightError', 'Origin and destination cannot be the same.');
        return;
    }

    const priceNum = Number(price);
    const seatsNum = Number(seats);

    if (isNaN(priceNum) || priceNum < 0) {
        showModalError('editFlightError', 'Ticket price must be a valid non-negative number.');
        return;
    }

    if (isNaN(seatsNum) || seatsNum < 0 || !Number.isInteger(seatsNum)) {
        showModalError('editFlightError', 'Available seats must be a valid non-negative integer.');
        return;
    }

    if (new Date(arrivalDate) <= new Date(departDate)) {
        showModalError('editFlightError', 'Arrival date & time must be after departure date & time.');
        return;
    }


    if (!validatePromoFieldsClient(promo, 'editFlightError')) {
        return;
    }

    // send update request
    fetch(`/api/admin/flights/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tripType,
            flightNum,
            flightStatus,
            airline,
            fromField,
            toField,
            departDate,
            arrivalDate,
            price: priceNum,
            seats: seatsNum,

            //for promo flights

            isPromo: promo.isPromo,
            promoLabel: promo.promoLabel,
            discountPercent: promo.discountPercent,
            promoStartDate: promo.promoStartDate,
            promoEndDate: promo.promoEndDate
        })
    })
        .then(response => response.json())
        .then(dataObj => {
            if (dataObj.success) {
                document.getElementById('editFlight').close();
                fetchFlightsAJAX();
            } else {
                showModalError('editFlightError', dataObj.error || 'Failed to update flight.');
            }
        })
        .catch(errorObj => {
            console.error("Edit Flight Error:", errorObj);
            showModalError('editFlightError', 'Network or server error occurred.');
        });
}

/* --- delete modal --- */
function openDeleteFlightModal(id, flightCode) {
    document.getElementById('deleteFlightId').value = id;
    document.getElementById('deleteFlightConfirmText').textContent = `Are you sure you want to delete flight ${flightCode}? This action is permanent.`;

    const errorBox = document.getElementById('deleteFlightError');
    errorBox.classList.add('d-none');
    errorBox.textContent = '';

    document.getElementById('deleteFlight').showModal();
}

function submitDeleteFlight() {
    const id = document.getElementById('deleteFlightId').value;
    const errorBox = document.getElementById('deleteFlightError');
    errorBox.classList.add('d-none');
    errorBox.textContent = '';

    fetch(`/api/admin/flights/${id}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(dataObj => {
            if (dataObj.success) {
                document.getElementById('deleteFlight').close();
                fetchFlightsAJAX();
            } else {
                showModalError('deleteFlightError', dataObj.error || 'Failed to delete flight.');
            }
        })
        .catch(errorObj => {
            console.error("Delete Flight Error:", errorObj);
            showModalError('deleteFlightError', 'Network or server error occurred.');
        });
}

function showModalError(errorId, msg) {
    const errorBox = document.getElementById(errorId);
    if (errorBox) {
        errorBox.textContent = msg;
        errorBox.classList.remove('d-none');
    }
}

//Flight promotions
const promoCheckbox = document.getElementById("isPromo");
const promoFields = document.getElementById("promoFields");

promoCheckbox.addEventListener("change", () => {
    promoFields.style.display = promoCheckbox.checked ? "block" : "none";

    if (!promoCheckbox.checked) {
        document.getElementById("promoLabel").value = "";
        document.getElementById("discountPercent").value = "";
        document.getElementById("promoStart").value = "";
        document.getElementById("promoEndDate").value = "";
    }
});

const editPromoCheckbox = document.getElementById("editIsPromo");
const editPromoFields = document.getElementById("editPromoFields");

editPromoCheckbox.addEventListener("change", () => {
    editPromoFields.style.display =
        editPromoCheckbox.checked ? "block" : "none";

    if (!editPromoCheckbox.checked) {
        document.getElementById("editPromoLabel").value = "";
        document.getElementById("editDiscountPercent").value = "";
        document.getElementById("editPromoStart").value = "";
        document.getElementById("editPromoEndDate").value = "";
    }
});

function openPromoModal(id) {
    const row = document.getElementById(`flight-row-${id}`);
    if (!row) return;

    document.getElementById("promoLabelText").textContent =
        row.dataset.promotitle || "-";

    document.getElementById("promoDiscountText").textContent =
        row.dataset.discountpercent
            ? `${row.dataset.discountpercent}%`
            : "-";

    document.getElementById("promoStartText").textContent =
        formatPromoDate(row.dataset.promostartdate);

    document.getElementById("promoEndText").textContent =
        formatPromoDate(row.dataset.promoenddate);

    document.getElementById("promoDetailsDialog").showModal();
}

function formatPromoDate(dateString) {
    if (!dateString) return "-";

    const dateInstance = new Date(dateString);

    const date = dateInstance.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
    });

    const time = dateInstance.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });

    return `${date} ${time}`;
}

/* --- render reservation rows --- */
function renderReservationsTable(reservations) {
    const tableBody = document.getElementById('TableBody');
    if (!tableBody) return;

    if (!reservations || reservations.length === 0) {
        tableBody.innerHTML = `
            <tr id="noReservationsRow">
                <td colspan="9" class="text-center text-muted py-4">No reservations found in database.</td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = reservations.map(item => `
        <tr id="reservation-row-${item._id}" data-id="${item._id}" data-resnum="${item.reservationNumber}" data-status="${item.status}" data-passenger="${item.passengerName}" data-email="${item.passengerEmail}" data-flightcode="${item.flightCode}" data-origin="${item.origin}" data-destination="${item.destination}" data-departure="${item.departureFormatted}" data-arrival="${item.arrivalFormatted}" data-booking="${item.bookingFormatted}" data-seat="${item.seat}" data-price="${item.priceFormatted}">
            <td class="fw-bold">${item.reservationNumber}</td>
            <td>${item.passengerName}</td>
            <td class="fw-bold">${item.flightCode}</td>
            <td>${item.origin} <i class="bi bi-arrow-right"></i> ${item.destination}</td>
            <td>${item.departureFormatted}</td>
            <td>${item.bookingFormatted}</td>
            <td>₱${item.priceFormatted}</td>
            <td><span class="badge badge-${item.statusBadgeClass}">${item.statusCapitalized}</span></td>
            <td>
                <div class="ms-1">
                    <button class="edit-btn" onclick="openViewReservationModal('${item._id}')">
                        <i class="bi bi-eye me-1"></i>
                    </button>
                    <button class="edit-btn" onclick="openEditReservationModal('${item._id}')">
                        <i class="bi bi-pencil ms-1"></i>
                    </button>
                    <button class="delete-btn" onclick="openDeleteReservationModal('${item._id}', '${item.reservationNumber}')">
                        <i class="bi bi-trash3 ms-1"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/* --- get reservations from server without reloading --- */
async function fetchReservationsAJAX() {
    const searchInput = document.getElementById('reservationSearch');
    const filterSelect = document.getElementById('reservationStatusFilter');
    const query = searchInput ? searchInput.value.trim() : '';
    const statusVal = filterSelect ? filterSelect.value : 'all';

    try {
        const response = await fetch(`/api/admin/reservations?q=${encodeURIComponent(query)}&status=${encodeURIComponent(statusVal)}`);
        const dataObj = await response.json();
        if (dataObj.success) {
            renderReservationsTable(dataObj.reservations);
        } else {
            console.error("Error fetching reservations:", dataObj.error);
        }
    } catch (errorObj) {
        console.error("AJAX Fetch Error:", errorObj);
    }
}

/* --- open view reservation modal --- */
function openViewReservationModal(id) {
    const row = document.getElementById(`reservation-row-${id}`);
    if (!row) return;

    document.getElementById('viewPassengerName').textContent = `Name: ${row.getAttribute('data-passenger')}`;
    document.getElementById('viewPassengerEmail').textContent = `Email: ${row.getAttribute('data-email')}`;
    document.getElementById('viewFlightCode').textContent = `Flight: ${row.getAttribute('data-flightcode')}`;
    document.getElementById('viewFlightRoute').textContent = `Route: ${row.getAttribute('data-origin')} -> ${row.getAttribute('data-destination')}`;
    document.getElementById('viewFlightDeparture').textContent = `Departure: ${row.getAttribute('data-departure')}`;
    document.getElementById('viewFlightArrival').textContent = `Arrival: ${row.getAttribute('data-arrival')}`;
    document.getElementById('viewReservationNumber').textContent = `Reservation ID: ${row.getAttribute('data-resnum')}`;
    document.getElementById('viewBookingDate').textContent = `Booking Date: ${row.getAttribute('data-booking')}`;
    document.getElementById('viewSeat').textContent = `Seat(s): ${row.getAttribute('data-seat')}`;
    document.getElementById('viewTotalPrice').textContent = `Total Price: ₱${row.getAttribute('data-price')}`;

    document.getElementById('viewReservation').showModal();
}

/* --- open edit reservation modal --- */
function openEditReservationModal(id) {
    const row = document.getElementById(`reservation-row-${id}`);
    if (!row) return;

    const resNum = row.getAttribute('data-resnum');
    const passenger = row.getAttribute('data-passenger');
    const statusVal = row.getAttribute('data-status') || 'pending';

    document.getElementById('editReservationId').value = id;
    document.getElementById('editReservationTitle').textContent = `Reservation ${resNum} by ${passenger}`;
    document.getElementById('editReservationStatus').value = statusVal;

    const errorBox = document.getElementById('editReservationError');
    if (errorBox) {
        errorBox.classList.add('d-none');
        errorBox.textContent = '';
    }

    document.getElementById('editReservation').showModal();
}

/* --- save edited reservation status --- */
function submitEditReservation() {
    const id = document.getElementById('editReservationId').value;
    const statusVal = document.getElementById('editReservationStatus').value;
    const errorBox = document.getElementById('editReservationError');

    if (errorBox) {
        errorBox.classList.add('d-none');
        errorBox.textContent = '';
    }

    fetch(`/api/admin/reservations/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: statusVal })
    })
        .then(response => response.json())
        .then(dataObj => {
            if (dataObj.success) {
                document.getElementById('editReservation').close();
                fetchReservationsAJAX();
            } else {
                if (errorBox) {
                    errorBox.textContent = dataObj.error || 'Failed to update reservation.';
                    errorBox.classList.remove('d-none');
                }
            }
        })
        .catch(errorObj => {
            console.error("Edit Reservation Error:", errorObj);
            if (errorBox) {
                errorBox.textContent = 'Network or server error occurred.';
                errorBox.classList.remove('d-none');
            }
        });
}

/* --- open delete reservation modal --- */
function openDeleteReservationModal(id, resNum) {
    document.getElementById('deleteReservationId').value = id;
    document.getElementById('deleteReservationConfirmText').textContent = `Are you sure you want to delete reservation ${resNum}? This action is permanent.`;

    const errorBox = document.getElementById('deleteReservationError');
    if (errorBox) {
        errorBox.classList.add('d-none');
        errorBox.textContent = '';
    }

    document.getElementById('deleteReservation').showModal();
}

/* --- delete reservation submit --- */
function submitDeleteReservation() {
    const id = document.getElementById('deleteReservationId').value;
    const errorBox = document.getElementById('deleteReservationError');

    if (errorBox) {
        errorBox.classList.add('d-none');
        errorBox.textContent = '';
    }

    fetch(`/api/admin/reservations/${id}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(dataObj => {
            if (dataObj.success) {
                document.getElementById('deleteReservation').close();
                fetchReservationsAJAX();
            } else {
                if (errorBox) {
                    errorBox.textContent = dataObj.error || 'Failed to delete reservation.';
                    errorBox.classList.remove('d-none');
                }
            }
        })
        .catch(errorObj => {
            console.error("Delete Reservation Error:", errorObj);
            if (errorBox) {
                errorBox.textContent = 'Network or server error occurred.';
                errorBox.classList.remove('d-none');
            }
        });
}

/* --- render users table rows --- */
function renderUsersTable(users) {
    const tableBody = document.getElementById('TableBody');
    if (!tableBody) return;

    if (!users || users.length === 0) {
        tableBody.innerHTML = `
            <tr id="noUsersRow">
                <td colspan="7" class="text-center text-muted py-4">No users found in database.</td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = users.map(item => `
        <tr id="user-row-${item._id}" data-id="${item._id}" data-name="${item.name}" data-email="${item.email}" data-phone="${item.phone}" data-role="${item.role}" data-status="${item.status}" data-date="${item.dateRegistered}">
            <td class="fw-bold">${item.name}</td>
            <td>${item.email}</td>
            <td>${item.phone}</td>
            <td>${item.roleCapitalized}</td>
            <td>${item.dateRegistered}</td>
            <td><span class="badge badge-${item.statusBadgeClass}">${item.statusCapitalized}</span></td>
            <td>
                <button class="block-button ${item.isDeactivated ? 'text-success' : 'text-danger'}" onclick="openToggleUserModal('${item._id}', '${item.name}', '${item.status}')">
                    <i class="bi ${item.isDeactivated ? 'bi-check-circle' : 'bi-ban'} ms-4"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/* --- get users from server without reloading --- */
async function fetchUsersAJAX() {
    const searchInput = document.getElementById('userSearch');
    const roleSelect = document.getElementById('roleSort');
    const statusSelect = document.getElementById('statusFilter');

    const query = searchInput ? searchInput.value.trim() : '';
    const roleVal = roleSelect ? roleSelect.value : 'all';
    const statusVal = statusSelect ? statusSelect.value : 'all';

    try {
        const response = await fetch(`/api/admin/users?q=${encodeURIComponent(query)}&role=${encodeURIComponent(roleVal)}&status=${encodeURIComponent(statusVal)}`);
        const dataObj = await response.json();
        if (dataObj.success) {
            renderUsersTable(dataObj.users);
        } else {
            console.error("Error fetching users:", dataObj.error);
        }
    } catch (errorObj) {
        console.error("AJAX Fetch Error:", errorObj);
    }
}

/* --- open toggle user status modal --- */
function openToggleUserModal(id, userName, status) {
    document.getElementById('blockUserId').value = id;
    const headerEl = document.getElementById('blockUserHeader');
    const textEl = document.getElementById('blockUserText');
    const submitBtn = document.getElementById('blockUserSubmitBtn');
    const errorBox = document.getElementById('blockUserError');

    if (errorBox) {
        errorBox.classList.add('d-none');
        errorBox.textContent = '';
    }

    if (status === 'deactivated') {
        if (headerEl) headerEl.textContent = `Activate ${userName}?`;
        if (textEl) textEl.textContent = `Are you sure you want to activate ${userName}? Their account will be restored and they can log in.`;
        if (submitBtn) {
            submitBtn.textContent = 'Activate User';
            submitBtn.className = 'btn success-btn bg-success text-white border-0 px-3 py-1 rounded';
        }
    } else {
        if (headerEl) headerEl.textContent = `Deactivate ${userName}?`;
        if (textEl) textEl.textContent = `Are you sure you want to deactivate ${userName}? They will not be able to log in.`;
        if (submitBtn) {
            submitBtn.textContent = 'Deactivate User';
            submitBtn.className = 'btn danger-btn bg-danger text-white border-0 px-3 py-1 rounded';
        }
    }

    document.getElementById('blockUser').showModal();
}

/* --- submit toggle user status --- */
function submitToggleUserStatus() {
    const id = document.getElementById('blockUserId').value;
    const errorBox = document.getElementById('blockUserError');

    if (errorBox) {
        errorBox.classList.add('d-none');
        errorBox.textContent = '';
    }

    fetch(`/api/admin/users/${id}/status`, {
        method: 'PUT'
    })
        .then(response => response.json())
        .then(dataObj => {
            if (dataObj.success) {
                document.getElementById('blockUser').close();
                fetchUsersAJAX();
            } else {
                if (errorBox) {
                    errorBox.textContent = dataObj.error || 'Failed to update user status.';
                    errorBox.classList.remove('d-none');
                }
            }
        })
        .catch(errorObj => {
            console.error("Toggle User Status Error:", errorObj);
            if (errorBox) {
                errorBox.textContent = 'Network or server error occurred.';
                errorBox.classList.remove('d-none');
            }
        });
}