//FLIGHT ROUTE AND DATE FIELDS

//Handles input validation for route and date fields
$('#searchBtn').on('click', function (e) {

    var from = $('#fromField').val();
    var to = $('#toField').val();
    var departD = $('#departDate').val();
    var returnD = $('#returnDate').val();
    var isRound = $('input[name="tripType"]:checked').val() === "round";

    //Reset errors
    $('#fromError, #toError, #dateError').text('');

    // Reset borders
    $('#fromField, #toField, #departDate, #returnDate').removeClass('is-error');

    let hasError = false;


    if (!from) {
        $('#fromError').text('Select origin');
        $('#fromField').addClass('is-error');
        hasError = true;
    }

    if (!to) {
        $('#toError').text('Select destination');
        $('#toField').addClass('is-error');
        hasError = true;
    }

    if (!departD) {
        $('#dateError').text('Select departure date');
        $('#departDate').addClass('is-error');
        hasError = true;
    }

    if (isRound && !returnD) {
        $('#dateError').text('Select return date');
        $('#returnDate').addClass('is-error');
        hasError = true;
    }

    if (hasError) {
        e.preventDefault();
    }

    if (!hasError) {
        window.location.href = "search.html";
    }
});

//Set today as the default departure date 
var today = new Date().toISOString().split('T')[0];
$('#departDate').val(today).attr('min', today);
$('#returnDate').attr('min', today);

//Update return date min when depart changes 
$('#departDate').on('change', function () {
    $('#returnDate').attr('min', $(this).val());
    if ($('#returnDate').val() && $('#returnDate').val() < $(this).val()) {
        $('#returnDate').val('');
    }
});


//TRIP TYPE TOGGLE

let tripType = "oneway";

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

//FILTER FOR CABIN CLASS AND PASSENGER

let passengers = {
    adults: 1,    //Minimum 1 adult required
    children: 0,  //Optional (0-6 max)
    infants: 0    //Cannot exceed number of adults
};

let cabin = "Economy";

/**
 * Keeps the passenger and cabin class dropdown from closing 
 */
$('.dropdown-menu').on('click', function (e) {
    e.stopPropagation();
});


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
 * Updates selected cabin class
 * 
 * @param {"Economy", "Premium Economy", "Business", "First Class"} value - cabin class
 */
function setCabin(value) {
    cabin = value;
    updateLabel();
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
 * Update dropdown button label (summary of passenger count and cabin class)
 */
function updateLabel() {
    const totalAdults = passengers.adults;
    const totalChildren = passengers.children;
    const totalInfants = passengers.infants;

    let textParts = [];

    textParts.push(`${totalAdults} adult${totalAdults > 1 ? 's' : ''}`);

    if (totalChildren > 0)
        textParts.push(`${totalChildren} child${totalChildren > 1 ? 'ren' : ''}`);

    if (totalInfants > 0)
        textParts.push(`${totalInfants} infant${totalInfants > 1 ? 's' : ''}`);

    const summary = `${textParts.join(', ')}, ${cabin}`;

    $('#passengerCabinBtn').text(summary);
}





