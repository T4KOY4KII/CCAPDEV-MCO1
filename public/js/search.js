$(document).ready(function () {
    
    // Strip off the handlers search-flight.js attached 
    $('#searchBtn').off('click');

    $('#searchBtn').on('click', async function (e) {
        e.preventDefault();

        const from    = $('#fromField').val();
        const to      = $('#toField').val();
        const departD = $('#departDate').val();
        const returnD = $('#returnDate').val();
        const isRound = tripType === 'round'; 

        $('#fromError, #toError, #dateError, #passengerError').text('');
        $('#fromField, #toField, #departDate, #returnDate').removeClass('is-error');

        let hasError = false;

        if (!from) { $('#fromError').text('Please select an origin.'); $('#fromField').addClass('is-error'); hasError = true; }
        if (!to)   { $('#toError').text('Please select a destination.'); $('#toField').addClass('is-error'); hasError = true; }
        if (from && to && from === to) { $('#toError').text('Origin and destination cannot be the same.'); $('#toField').addClass('is-error'); hasError = true; }
        if (!departD) { $('#dateError').text('Please select a departure date.'); $('#departDate').addClass('is-error'); hasError = true; }
        if (isRound && !returnD) { $('#dateError').text('Please select a return date.'); $('#returnDate').addClass('is-error'); hasError = true; }
        if (isRound && departD && returnD && returnD <= departD) { $('#dateError').text('Return date must be after departure date.'); $('#returnDate').addClass('is-error'); hasError = true; }
        if (passengers.adults < 1) { $('#passengerError').text('At least 1 adult is required.'); hasError = true; }

        if (!hasError) {
            await runSearch();
        }
    });
});

/* PRICE RANGE SLIDERS */

/** 
 * *Converts string into ₱ currency format
*/

function formatPrice(value) {
    return `₱${Number(value).toLocaleString()}`;
}

$('.priceRange').each(function () {
    const $range = $(this);
    const $container = $range.closest('.price-container');
    const $display = $container.find('.priceValue');

    // Gets slider value, formats it, then updates text on screen
    function update() {
        $display.text(formatPrice($range.val()));
    }

    // Whenever the slider is moved, run update()
    $range.on('input', update);
    update(); // initialize
});

/* FILTER SIDEBAR RESET BUTTON */

const $resetBtn = $('#resetFltrsBtn');

$resetBtn.on('click', function () {

    // Reset all checkboxes (Airlines)
    $('.filter-sidebar input[type="checkbox"]').prop('checked', false);

    // Reset all radio buttons (Stops)
    $('.filter-sidebar input[type="radio"]').prop('checked', false);

    // Reset date input
    const $dateInput = $('#departSched');
    if ($dateInput.length) $dateInput.val('');

    // Reset all price sliders
    $('.priceRange').each(function () {
        const $range = $(this);

        $range.val(this.max); // default value (15000)

        // Find the text display element
        const $container = $range.closest('.price-container');
        const $display = $container.find('.priceValue');

        // Update the display text
        $display.text(formatPrice($range.val()));
    });

    // Reset advanced search dropdown fields
    const $airlineField = $('#airlineField');
    if ($airlineField.length) $airlineField.val('');

    // Reset all radio buttons (flexible dates and direct flights)
    $('input[name="flightType"]').prop('checked', false);

    // Reset quick search widget fields 
    $('#fromField').val('');
    $('#toField').val('');

    // Set today as the default departure date
    const today = new Date().toISOString().split('T')[0];
    $('#departDate').val(today);

    // Reset return date the disable it since default = one-way
    $('#returnDate').val('').prop('disabled', true);

    // Reset trip type
    $('#oneWay').prop('checked', true);
    $('#roundTrip').prop('checked', false);

    if (typeof setTripType === 'function') setTripType('oneway');

    // Reset passenger counts and cabin class
    if (typeof passengers !== 'undefined') {
        passengers.adults = 1;
        passengers.children = 0;
        passengers.infants = 0;
    }

    if (typeof cabin !== 'undefined') cabin = 'Economy'; // default cabin (Economy)
    if (typeof updatePassengerCount === 'function') updatePassengerCount(); // refresh displayed passenger count

    // Clear quick search and advanced search
    resetAppliedSearch();

    // Re-apply filters/sort now that everything is back to default
    $('#sortSelect').val('price-asc');
    applySort();
    applyFilters();
});

/* FLIGHT RESULTS FILTERING AND SORTING */

let $flightCards = $('.search-results .flight-card');
let $resultsCount = $('#resultsCount');
let $noResultsMsg = $('#noResultsMsg');
let totalFlights = $flightCards.length;

function refreshFlightCardCache() {
    $flightCards = $('.search-results .flight-card');
    totalFlights = $flightCards.length;
}

// Quick search widget and advanced search dropdown values
let appliedSearch = {
    origin: '',
    destination: '',
    quickDate: '',
    minSeats: 1,
    advancedAirline: '',
    advancedMaxPrice: 15000,
    directOnly: false,
    ignoreDate: false
};

/**
 * Resets the quick Search widget and advanced search dropdwon fields back to default.
 */

function resetAppliedSearch() {
    appliedSearch = {
        origin: '',
        destination: '',
        quickDate: '',
        minSeats: 1,
        advancedAirline: '',
        advancedMaxPrice: 15000,
        directOnly: false,
        ignoreDate: false
    };
}

/**
 * Shows/hides flight cards based on the sidebar filters combined with
 * whatever was last applied via applyQuickAndAdvancedSearch(). Updates the
 * results count + "no results" message.
 */

function applyFilters() {

    // Live sidebar filter values
    const airlines = $('.filter-sidebar input[type="checkbox"]:checked')
        .map(function () { return $(this).data('airline'); })
        .get();
    const stop = $('.filter-sidebar input[type="radio"]:checked').val();
    const sidebarDate = $('#departSched').val();
    const sidebarMaxPrice = Number($('.filter-sidebar .priceRange').val());
 
    const maxPrice = Math.min(sidebarMaxPrice, appliedSearch.advancedMaxPrice); // Combine both price filters; lower value is kept
    
    let visibleCount = 0; 

    $flightCards.each(function () {
        const $card = $(this);
        const cardAirline = $card.data('airline');
 
        let isMatch = true; // Assume the flight is valid
 
        // Airline (sidebar)
        if (airlines.length > 0 && !airlines.includes(cardAirline)) {
            isMatch = false;
        }
 
        // Airline (advanced search)
        if (appliedSearch.advancedAirline && cardAirline !== appliedSearch.advancedAirline) {
            isMatch = false;
        }
 
        // Stops (sidebar)
        if (stop && $card.data('stops') !== stop) {
            isMatch = false;
        }
 
        // Stops (advanced search - direct flights only)
        if (appliedSearch.directOnly && $card.data('stops') !== 'direct') {
            isMatch = false;
        }
 
        // Origin (quick search)
        if (appliedSearch.origin && $card.data('origin') !== appliedSearch.origin) {
            isMatch = false;
        }
 
        // Destination (quick search)
        if (appliedSearch.destination && $card.data('destination') !== appliedSearch.destination) {
            isMatch = false;
        }
 
        // Departure date (sidebar) - skipped if Flexible Dates is on
        if (!appliedSearch.ignoreDate && sidebarDate && $card.data('departDate') !== sidebarDate) {
            isMatch = false;
        }
 
        // Departure date (quick search) - skipped if Flexible Dates is on
        if (!appliedSearch.ignoreDate && appliedSearch.quickDate && $card.data('departDate') !== appliedSearch.quickDate) {
            isMatch = false;
        }
 
        // Price (lower of sidebar and advanced search price caps)
        if (Number($card.data('price')) > maxPrice) {
            isMatch = false;
        }
 
        // Seats (must fit the requested passenger count)
        if (Number($card.data('seats')) < appliedSearch.minSeats) {
            isMatch = false;
        }

        // Trip type (quick search)
        if (appliedSearch.tripType && $card.data('tripType') !== appliedSearch.tripType) {
            isMatch = false;
        }
        
        $card.toggle(isMatch); // true = show, false = hide
        if (isMatch) visibleCount++; // count visible flights
    });
 
    $resultsCount.text(`${visibleCount} of ${totalFlights} flights`); // show number of valid flights
    $noResultsMsg.toggleClass('d-none', visibleCount > 0); // show message if no results
}
 
/**
 * Sorts flight cards based on whatever option the user selects 
 * (price, departure time, etc.).
 */

function applySort() {
    const sortBy = $('#sortSelect').val();
    const $container = $('.search-results');

    const sorted = $flightCards.get().sort((a, b) => {
        const $a = $(a), $b = $(b);

        switch (sortBy) {
            case 'price-asc':
                return Number($a.data('price')) - Number($b.data('price'));
            case 'price-desc':
                return Number($b.data('price')) - Number($a.data('price'));
            case 'depart-asc':
                return new Date(`${$a.data('departDate')}T${$a.data('departTime')}`) -
                       new Date(`${$b.data('departDate')}T${$b.data('departTime')}`);
            case 'depart-desc':
                return new Date(`${$b.data('departDate')}T${$b.data('departTime')}`) -
                       new Date(`${$a.data('departDate')}T${$a.data('departTime')}`);
            case 'duration-asc':
                return Number($a.data('duration')) - Number($b.data('duration'));
            default:
                return 0;
        }
    });

    sorted.forEach(card => $container.append(card)); // loop thru cards and append them back into container
    $container.append($noResultsMsg); // keep the "No flights found" message at the bottom
}

// User interacts with live sidebar filters - flight results update instantly
$('.filter-sidebar input[type="checkbox"], .filter-sidebar input[type="radio"]').on('change', applyFilters);
$('#departSched').on('change', applyFilters);
$('.filter-sidebar .priceRange').on('input', applyFilters);

// User changes sort - flight cards are sorted then filters are applied
$('#sortSelect').on('change', function () {
    applySort();
    applyFilters();
});

// Initialize on page load
if ($flightCards.length > 0) {
    applySort();
    applyFilters();
}

// Get flight data and update page
async function runSearch() {
    const url = buildSearchURL();

    try {
        $('#searchBtn').prop('disabled', true).text('Searching...');
        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
            renderFlightCards(data.flights);
        } else {
            $('.search-results').html('<p class="text-danger">Could not fetch flights. Please try again.</p>');
        }
    } catch (err) {
        $('.search-results').html('<p class="text-danger">Something went wrong. Please try again.</p>');
    } finally {
        $('#searchBtn').prop('disabled', false).html('<i class="bi bi-search me-1"></i> Search Flights');
    }
}

// Display flight results on page
function renderFlightCards(flights) {
    const $container = $('.search-results');
    $container.find('.flight-card').remove(); // clear old cards

    if (!flights.length) {
        $('#noResultsMsg').removeClass('d-none');
        return;
    }
    $('#noResultsMsg').addClass('d-none');

    flights.forEach(f => {
        const card = `
        <div class="card flight-card text-center"
                data-airline="${f.airline}" data-stops="${f.stops || 'direct'}"
                data-trip-type="${f.tripType}" data-price="${f.discountedPrice}"
                data-depart-date="${f.departureDate}" data-depart-time="${f.departureTime}"
                data-duration="${f.flightDuration}" data-origin="${f.origin}"
                data-destination="${f.destination}" data-seats="${f.availableSeats}">
            <div class="card-header">
                <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <span class="flight-airline">${f.airline}</span>
                    <span class="seats-left">${f.availableSeats} seats left</span>
                </div>
            </div>
            <div class="card-body">
                <div class="row align-items-center g-3">
                    <div class="col-6 col-md-2 flight-time-block">
                        <div class="flight-date">${f.departureDate}</div>
                        <div class="flight-time">${f.departureTime}</div>
                        <div class="flight-country">${f.origin}</div>
                    </div>
                    <div class="col-12 col-md-6 flight-route-block">
                        <div class="flight-route-label">${f.origin} → ${f.destination}</div>
                        <div class="flight-route-line"><hr /></div>
                        <div class="flight-route-info">${f.flightDuration}</div>
                    </div>
                    <div class="col-6 col-md-2 flight-time-block">
                        <div class="flight-date">${f.arrivalDate}</div>
                        <div class="flight-time">${f.arrivalTime}</div>
                        <div class="flight-country">${f.destination}</div>
                    </div>
                    <div class="col-12 col-md-2 flight-price-block">
                        <div class="flight-price">₱${f.discountedPrice.toLocaleString()}</div>
                        <a href="/flight/${f._id}" class="btn primary-btn btn-sm px-4 mt-2">Book</a>
                    </div>
                </div>
            </div>
        </div>`;
        $container.append(card);
    });

    // Refresh the filter/sort script's cached references, then re-apply
    if (typeof refreshFlightCardCache === 'function') refreshFlightCardCache();
    applySort();
    applyFilters();
}
