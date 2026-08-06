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
    // Reset Filters needs a unfiltered result set from the server 
    window.location.href = '/search';
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

// Refresh the filter/sort script's cached references, then re-apply
if (typeof refreshFlightCardCache === 'function') refreshFlightCardCache();
applySort();
applyFilters();
