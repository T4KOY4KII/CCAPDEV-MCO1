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
});

/* --- render table rows --- */
function renderFlightsTable(flights) {
    const tableBody = document.getElementById('TableBody');
    if (!tableBody) return;

    if (!flights || flights.length === 0) {
        tableBody.innerHTML = `
            <tr id="noFlightsRow">
                <td colspan="9" class="text-center text-muted py-4">No flights found in database. Click 'Add Flight' above to create one.</td>
            </tr>
        `;
        return;
    }

    // loop thru all flights and put them into rows inside tbody
    tableBody.innerHTML = flights.map(flightItem => `
        <tr id="flight-row-${flightItem._id}" data-id="${flightItem._id}" data-flightcode="${flightItem.flightCode}" data-triptype="${flightItem.tripType}" data-status="${flightItem.status}" data-airline="${flightItem.airline}" data-origin="${flightItem.origin}" data-destination="${flightItem.destination}" data-departure="${flightItem.departureDateISO}" data-arrival="${flightItem.arrivalDateISO}" data-price="${flightItem.price}" data-seats="${flightItem.availableSeats}">
            <td class="col-flightCode fw-bold">${flightItem.flightCode}</td>
            <td class="col-airline">${flightItem.airline}</td>
            <td class="col-route">${flightItem.origin} <i class="bi bi-arrow-right"></i> ${flightItem.destination}</td>
            <td class="col-departure">${flightItem.departureFormatted}</td>
            <td class="col-arrival">${flightItem.arrivalFormatted}</td>
            <td class="col-price">₱${flightItem.priceFormatted}</td>
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
            seats: seatsNum
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
            seats: seatsNum
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
