document.addEventListener("DOMContentLoaded", () => {

    const progress = document.querySelector('.progress');
    const stepsContainer = document.querySelector(".steps-container");
    const steps = document.querySelectorAll(".step");
    const stepIndicators = document.querySelectorAll(".progress-container li");
    const backButton = document.querySelector('.back-btn');
    const nextButton = document.querySelector('.next-btn');
    const payButton = document.querySelector('.pay-btn');

    document.documentElement.style.setProperty('--steps', stepIndicators.length);

    let currentStep = 0;

    const progressUpdate = () => {
        let width = currentStep / (stepIndicators.length - 1);
        progress.style.transform = `scaleX(${width})`;

        stepsContainer.style.height = steps[currentStep].offsetHeight + "px";
        stepIndicators.forEach((indicator, index) => {
            indicator.classList.toggle("current", currentStep === index);
            indicator.classList.toggle("done", currentStep > index);
        });

        steps.forEach((step, index) => {
            step.style.transform = `translateX(-${currentStep * 100}%)`;
            step.classList.toggle("current", currentStep === index);
        });

        updateButtons();
    };

    const updateButtons = () => {
        backButton.hidden = currentStep === 0;
        nextButton.hidden = currentStep >= stepIndicators.length - 1;
        payButton.hidden = !nextButton.hidden;
    };

    backButton.addEventListener("click", (e) => {
        e.preventDefault(); // preventing form submission

        if (currentStep > 0) {
            currentStep--;
            progressUpdate();
        }
    });


    nextButton.addEventListener("click", (e) => {
        e.preventDefault(); // preventing form submission

        // Only step 1 (Passenger Information) needs validation before moving on -
        // steps 2 and 3 either have their own checks (seat required before pay)
        // or nothing required to fill in
        if (currentStep === 0 && !validatePassengerInfo()) {
            return;
        }

        if (currentStep < stepIndicators.length - 1) {
            currentStep++;
            progressUpdate();
        }
    });

    progressUpdate();
    recalculateTotals(); // set correct initial numbers (base fare + default baggage + tax) instead of the static placeholders
});

// Toggle summary expand/collapse sections
function toggleSummarySection(id) {
    var el = document.getElementById(id);
    var icon = document.getElementById(id + 'Icon');
    el.classList.toggle('d-none');
    if (icon) icon.className = el.classList.contains('d-none') ? 'bi bi-chevron-down' : 'bi bi-chevron-up';
}

// Validate email format
function isValidEmail(email) {
    var atIndex = email.indexOf('@');
    var dotIndex = email.lastIndexOf('.');
    return atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < email.length - 1;
}

// Show error message for a specific field
function showFieldError(selector, message) {
    $(selector)
        .addClass('is-invalid')
        .after('<div class="invalid-feedback">' + message + '</div>');
}

// Validate passenger information form fields
function validatePassengerInfo() {
    $('.passenger-container .is-invalid').removeClass('is-invalid');
    $('.passenger-container .invalid-feedback').remove();

    var firstNameVal = $('#firstName').val().trim();
    var lastNameVal = $('#lastName').val().trim();
    var contactVal = $('#contactNumber').val().trim();
    var emailVal = $('#email').val().trim();
    var passportVal = $('#passportNumber').val().trim();
    var nationalityVal = $('#nationality').val();
    var dobMonthVal = $('#dobMonth').val().trim();
    var dobDayVal = $('#dobDay').val().trim();
    var dobYearVal = $('#dobYear').val().trim();
    var genderVal = $('#gender').val();

    var hasError = false;

    if (!firstNameVal) { showFieldError('#firstName', 'First name is required.'); hasError = true; }
    if (!lastNameVal) { showFieldError('#lastName', 'Last name is required.'); hasError = true; }

    if (!contactVal) {
        showFieldError('#contactNumber', 'Contact number is required.');
        hasError = true;
    } else if (!/^\d{7,15}$/.test(contactVal)) {
        showFieldError('#contactNumber', 'Enter a valid contact number (digits only).');
        hasError = true;
    }

    if (!emailVal) {
        showFieldError('#email', 'Email is required.');
        hasError = true;
    } else if (!isValidEmail(emailVal)) {
        showFieldError('#email', 'Please enter a valid email address.');
        hasError = true;
    }

    if (!passportVal) { showFieldError('#passportNumber', 'Passport number is required.'); hasError = true; }
    if (!nationalityVal) { showFieldError('#nationality', 'Nationality is required.'); hasError = true; }
    if (!genderVal) { showFieldError('#gender', 'Gender is required.'); hasError = true; }

    var month = parseInt(dobMonthVal, 10);
    var day = parseInt(dobDayVal, 10);
    var year = parseInt(dobYearVal, 10);
    var currentYear = new Date().getFullYear();

    if (!dobMonthVal || !dobDayVal || !dobYearVal) {
        showFieldError('#dobYear', 'Full date of birth is required.');
        hasError = true;
    } else if (month < 1 || month > 12) {
        showFieldError('#dobMonth', 'Month must be between 01-12.');
        hasError = true;
    } else if (day < 1 || day > 31) {
        showFieldError('#dobDay', 'Day must be between 01-31.');
        hasError = true;
    } else if (year < 1900 || year > currentYear) {
        showFieldError('#dobYear', 'Enter a realistic birth year.');
        hasError = true;
    }

    return !hasError;
}

//Pricing configuration data that recalculates as soon as the user selects different options
var pricingConfig = JSON.parse(document.getElementById('pricingConfigData').textContent);

var selectedSeat = null;
var selectedSeatIsPremium = false;
var selectedMeal = 'Standard';
var baggageCount = 1;
var extrasEnabled = true; // matches the toggle's default "checked" state

function formatPHP(amount) {
    return 'PHP ' + amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function setAllText(className, text) {
    document.querySelectorAll('.' + className).forEach(function (el) { el.textContent = text; });
}

function recalculateTotals() {
    var priorityBoarding = document.getElementById('priorityBoarding');
    var travelInsurance = document.getElementById('travelInsurance');
    var loungeAccess = document.getElementById('loungeAccess');

    var seatPrice = selectedSeatIsPremium ? pricingConfig.seatPremiumSurcharge : 0;

    var mealOption = pricingConfig.mealOptions.find(function (m) { return m.value === selectedMeal; }) || pricingConfig.mealOptions[0];
    var mealPrice = mealOption.price;

    // Extras are only added if enabled but otherwise they're 0
    var baggagePrice = extrasEnabled ? (baggageCount * pricingConfig.baggagePerUnit) : 0;
    var priorityPrice = (extrasEnabled && priorityBoarding && priorityBoarding.checked) ? pricingConfig.priorityBoardingPrice : 0;
    var insurancePrice = (extrasEnabled && travelInsurance && travelInsurance.checked) ? pricingConfig.travelInsurancePrice : 0;
    var loungePrice = (extrasEnabled && loungeAccess && loungeAccess.checked) ? pricingConfig.loungeAccessPrice : 0;
    var addonsPrice = priorityPrice + insurancePrice + loungePrice;

    var subtotal = pricingConfig.basePrice + seatPrice + mealPrice + baggagePrice + addonsPrice;
    var taxPrice = subtotal * pricingConfig.taxRate;
    var total = subtotal + taxPrice;

    setAllText('js-base-fare', formatPHP(pricingConfig.basePrice));
    setAllText('js-seat-price', formatPHP(seatPrice));
    setAllText('js-meal-price', formatPHP(mealPrice));
    setAllText('js-baggage-price', formatPHP(baggagePrice));
    setAllText('js-baggage-count', extrasEnabled ? baggageCount : 0);
    setAllText('js-addons-price', formatPHP(addonsPrice));
    setAllText('js-tax-price', formatPHP(taxPrice));
    setAllText('js-subtotal-price', formatPHP(subtotal));
    setAllText('js-total', formatPHP(total));

    setAllText('js-addon-priority-price', formatPHP(priorityPrice));
    setAllText('js-addon-insurance-price', formatPHP(insurancePrice));
    setAllText('js-addon-lounge-price', formatPHP(loungePrice));

    var seatRowLabel = selectedSeat ? ('Seat (' + (selectedSeatIsPremium ? 'Premium' : 'Standard') + ')') : 'Seat';
    setAllText('js-seat-row-label', seatRowLabel);

    var seatLabelText = selectedSeat ? ('Seat: ' + selectedSeat) : 'Seat: not selected yet';
    setAllText('js-seat-label', seatLabelText);

    var seatDetailLabel = selectedSeat ? ('Seat ' + selectedSeat + ' (' + (selectedSeatIsPremium ? 'Premium' : 'Standard') + ')') : 'No seat selected';
    setAllText('js-seat-detail-label', seatDetailLabel);
}

// Seat selection
function selectSeat(btn) {
    document.querySelectorAll('.seat.selected').forEach(function (s) {
        if (!s.classList.contains('premium')) s.classList.replace('selected', 'available');
        else s.classList.remove('selected');
    });
    btn.classList.add('selected');
    selectedSeat = btn.dataset.seat;
    selectedSeatIsPremium = btn.dataset.premium === 'true';
    document.getElementById('selectedSeatLabel').textContent = 'Seat: ' + selectedSeat;
    recalculateTotals();
}

// Meal selection
function selectMeal(meal) {
    document.querySelectorAll('.meal-option').forEach(function (el) {
        var isThisOne = el.dataset.meal === meal;
        var price = parseInt(el.dataset.price, 10) || 0;
        var priceLabel = price > 0 ? ('+PHP ' + price.toLocaleString('en-PH', { minimumFractionDigits: 2 })) : 'Included';

        el.classList.toggle('active', isThisOne);
        el.innerHTML = '<input type="radio" name="mealChoice" class="meal-option-radio" value="' + el.dataset.meal + '"' + (isThisOne ? ' checked' : '') + '>' +
            '<span>' + el.dataset.meal + '</span><small class="text-muted ms-2">' + priceLabel + '</small>';
    });

    document.getElementById('selectedMealLabel').textContent = meal;
    document.getElementById('mealDetailName').textContent = meal;
    selectedMeal = meal;
    recalculateTotals();
}

// Baggage counter
function changeBaggage(delta) {
    baggageCount = Math.max(0, Math.min(5, baggageCount + delta));
    document.getElementById('baggageCount').textContent = baggageCount;
    recalculateTotals();
}

// Toggle extras section visibility
function toggleExtras(show) {
    document.getElementById('extrasContent').style.display = show ? 'block' : 'none';
    extrasEnabled = show;
    recalculateTotals();
}

// Submit the booking to the server
document.querySelector('.pay-btn').addEventListener('click', function (e) {
    e.preventDefault();

    if (!selectedSeat) {
        alert('Please select a seat before paying.');
        return;
    }

    if (!document.querySelector('input[name="payMethod"]:checked')) {
        alert('Please select a payment method before paying.');
        return;
    }

    var payload = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        passportNumber: document.getElementById('passportNumber').value.trim(),
        seat: selectedSeat,
        meal: selectedMeal,
        baggageCount: extrasEnabled ? baggageCount : 0,
        priorityBoarding: extrasEnabled && document.getElementById('priorityBoarding').checked,
        travelInsurance: extrasEnabled && document.getElementById('travelInsurance').checked,
        loungeAccess: extrasEnabled && document.getElementById('loungeAccess').checked
    };

    fetch(window.location.pathname, {
        method: 'POST',
        headers: { 'Content-type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(payload)
    })
        .then(function (response) { return response.json(); })
        .then(function (result) {
            if (result.success) {
                alert('Booking confirmed! Reservation number: ' + result.reservationNumber);
                window.location.href = '/reservations';
            } else {
                alert(result.error || 'Something went wrong.');
            }
        })
        .catch(function (err) {
            console.error('Booking error:', err);
            alert('Something went wrong. Please try again.');
        });
});