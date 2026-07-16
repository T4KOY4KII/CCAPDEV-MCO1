let tripType = "oneway";

let passengers = {
    adults: 1,
    children: 0,
    infants: 0
};

let cabin = "Economy";

/**
 * Sets trip type and toggles return date input
 * 
 * @param {"oneway" | "round"} type - Trip type selection 
 */
function setTripType(type) {
    tripType = type;

    const returnInput = document.getElementById("returnDate");

    if (tripType === "oneway") { //one way trip disables the return date picker
        returnInput.disabled = true;
        returnInput.value = "";
    } else {
        returnInput.disabled = false;
    }
}


/**
 * Updates the passenger count based on type and increment/decrement value
 * 
 * (Unofficial) Rule:
 * - Adults: 1-8
 * - Children: 0-6
 * - Infants: Cannot exceed adults
 * 
 * @param {"adults" | "children" | "infants"} type - Passenger category to update
 * @param {number} value - increment (+1) or decrement (-1)
 */
function changeCount(type, value) {

    if (type === "adults") {
        passengers.adults = Math.min(8, Math.max(1, passengers.adults + value));


        if (passengers.infants > passengers.adults) {
            passengers.infants = passengers.adults;
        }
    }


    if (type === "children") {
        passengers.children = Math.min(6, Math.max(0, passengers.children + value));
    }


    if (type === "infants") {
        passengers.infants = Math.min(
            passengers.adults,
            Math.max(0, passengers.infants + value)
        );
    }

    updatePassengerCount();
}

/**
 * Update UI display passenger values and refreshes label
 */
function updatePassengerCount() {
    $('#adultsCount').text(passengers.adults);
    $('#childrenCount').text(passengers.children);
    $('#infantsCount').text(passengers.infants);


    updateLabel();
}


/**
 * Checks if a passenger type can still be increased (for UI disabling).
 *
 * @param {"adults" | "children" | "infants"} type
 * @returns {boolean}
 */
function canIncrease(type) {
    if (type === "adults") return passengers.adults < 8;
    if (type === "children") return passengers.children < 6;
    if (type === "infants") return passengers.infants < passengers.adults;
}

/**
 * Updates selected cabin class
 * 
 * @param {"Economy", "Premium Economy", "Business", "First Class"} value - cabin class
 */
function setCabin(value) {
    cabin = value;
    updateLabel();
}

/**
 * Update dropdown button label (summary of passenger count and cabin class)
 */
function updateLabel() {
    const totalAdults = passengers.adults;
    const totalChildren = passengers.children;
    const totalInfants = passengers.infants;

    $('#adultsCount').text(totalAdults);
    $('#childrenCount').text(totalChildren);
    $('#infantsCount').text(totalInfants);

    let textParts = [];

    textParts.push(`${totalAdults} adult${totalAdults > 1 ? 's' : ''}`);

    if (totalChildren > 0)
        textParts.push(`${totalChildren} child${totalChildren > 1 ? 'ren' : ''}`);

    if (totalInfants > 0)
        textParts.push(`${totalInfants} infant${totalInfants > 1 ? 's' : ''}`);

    const summary = `${textParts.join(', ')}, ${cabin}`;

    const cabinVal = $('#cabinClass').val() || cabin;
    $('#passengerCabinBtn').text(`${textParts.join(', ')}, ${cabinVal}`);
}


//Builds search URL with all query parameteres
function buildSearchURL() {
    const origin = $('#fromField').val();
    const destination = $('#toField').val();
    const departDate = $('#departDate').val();
    const returnDate = $('#returnDate').val();

    const adults = parseInt($('#adultsCount').text()) || 1;
    const children = parseInt($('#childrenCount').text()) || 0;
    const infants = parseInt($('#infantsCount').text()) || 0;
    const totalPass = adults + children + infants;

    const cabinVal = $('#cabinClass').val() || 'Economy';

    const tripTypeVal = $('input[name="tripType"]:checked').val() || 'oneway';

    // Build the query string
    const params = new URLSearchParams();

    params.set('origin', origin);
    params.set('destination', destination);
    params.set('departDate', departDate);
    params.set('tripType', tripType);
    params.set('passengers', totalPass);
    params.set('cabinClass', cabin);

    // Only add return date for round trips
    if (tripType === 'round' && returnDate) {
        params.set('returnDate', returnDate);
    }

    const url = `/search/results?${params.toString()}`;

    return url;
};



//Handles input validation for route and date fields
function validateSearch() {
    const from = $('#fromField').val();
    const to = $('#toField').val();
    const departD = $('#departDate').val();
    const returnD = $('#returnDate').val();

    const adults = parseInt($('#adultsCount').text()) || 0;
    const tripTypeVal = $('input[name="tripType"]:checked').val() || 'oneway';
    const isRound = tripTypeVal === 'round';

    // Reset all errors
    $('#fromError, #toError, #dateError, #passengerError').text('');
    $('#fromField, #toField, #departDate, #returnDate').removeClass('is-error');

    let hasError = false;

    // Origin
    if (!from) {
        $('#fromError').text('Please select an origin.');
        $('#fromField').addClass('is-error');
        hasError = true;
    }

    // Destination
    if (!to) {
        $('#toError').text('Please select a destination.');
        $('#toField').addClass('is-error');
        hasError = true;
    }

    // Same origin and destination
    if (from && to && from === to) {
        $('#toError').text('Origin and destination cannot be the same.');
        $('#toField').addClass('is-error');
        hasError = true;
    }

    // Departure date
    if (!departD) {
        $('#dateError').text('Please select a departure date.');
        $('#departDate').addClass('is-error');
        hasError = true;
    }

    // Return date (round trip only)
    if (isRound && !returnD) {
        $('#dateError').text('Please select a return date for round trips.');
        $('#returnDate').addClass('is-error');
        hasError = true;
    }

    // Return must be after depart
    if (isRound && departD && returnD && returnD <= departD) {
        $('#dateError').text('Return date must be after departure date.');
        $('#returnDate').addClass('is-error');
        hasError = true;
    }

    // At least 1 adult required
    if (passengers.adults < 1) {
        $('#passengerError').text('At least 1 adult is required.');
        hasError = true;
    }

    return !hasError;
}

$(document).ready(function () {

    // Set today as default and minimum date
    const today = new Date().toISOString().split('T')[0];
    $('#departDate').val(today).attr('min', today);
    $('#returnDate').attr('min', today);

    // Update return min when depart changes
    $('#departDate').on('change', function () {
        const departVal = $(this).val();
        $('#returnDate').attr('min', departVal);

        if ($('#returnDate').val() && $('#returnDate').val() < departVal) {
            $('#returnDate').val('');
        }

        $('#dateError').text('');
        $('#departDate').removeClass('is-error');
    });

    $('#returnDate').on('change', function () {
        $('#dateError').text('');
        $('#returnDate').removeClass('is-error');
    });

    $('#fromField').on('change', function () {
        $('#fromError').text('');
        $(this).removeClass('is-error');
    });

    $('#toField').on('change', function () {
        $('#toError').text('');
        $(this).removeClass('is-error');
    });

    // Keep dropdown open on inside click
    $('.dropdown-menu').on('click', function (e) {
        e.stopPropagation();
    });

    // Search button 
    $('#searchBtn').on('click', function (e) {
        e.preventDefault();

        if (validateSearch()) {
            window.location.href = buildSearchURL();
        }
    });

});
