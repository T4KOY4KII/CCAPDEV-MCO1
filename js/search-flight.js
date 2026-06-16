//Trip type toggle

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


//Filter for passengers and cabin class

let passengers = {
    adults: 1,    //Minimum 1 adult required
    children: 0,  //Optional (0-6 max)
    infants: 0    //Cannot exceed number of adults
};

let cabin = "Economy";

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
    document.getElementById("adultsCount").innerText = passengers.adults;
    document.getElementById("childrenCount").innerText = passengers.children;
    document.getElementById("infantsCount").innerText = passengers.infants;

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

    document.getElementById("passengerCabinBtn").innerText = summary;
}

/**
 * Keeps the passenger and cabin class dropdown from closing 
 */
document.querySelectorAll('.dropdown-menu button').forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.stopPropagation();
    });
});




