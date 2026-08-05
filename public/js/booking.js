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

//Pricing configuration data that recalculates as soon as the user selects different options
var pricingConfig = JSON.parse(document.getElementById('pricingConfigData').textContent);

var selectedSeat = null;
var selectedSeatIsPremium = false;
var selectedMeal = 'Standard';
var baggageCount = 1;

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

    var baggagePrice = baggageCount * pricingConfig.baggagePerUnit;

    var priorityPrice = (priorityBoarding && priorityBoarding.checked) ? pricingConfig.priorityBoardingPrice : 0;
    var insurancePrice = (travelInsurance && travelInsurance.checked) ? pricingConfig.travelInsurancePrice : 0;
    var loungePrice = (loungeAccess && loungeAccess.checked) ? pricingConfig.loungeAccessPrice : 0;
    var addonsPrice = priorityPrice + insurancePrice + loungePrice;

    var subtotal = pricingConfig.basePrice + seatPrice + mealPrice + baggagePrice + addonsPrice;
    var taxPrice = subtotal * pricingConfig.taxRate;
    var total = subtotal + taxPrice;

    setAllText('js-base-fare', formatPHP(pricingConfig.basePrice));
    setAllText('js-seat-price', formatPHP(seatPrice));
    setAllText('js-meal-price', formatPHP(mealPrice));
    setAllText('js-baggage-price', formatPHP(baggagePrice));
    setAllText('js-baggage-count', baggageCount);
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
        el.classList.remove('active');
        var price = parseInt(el.dataset.price, 10) || 0;
        var priceLabel = price > 0 ? ('+PHP ' + price.toLocaleString('en-PH', { minimumFractionDigits: 2 })) : 'Included';
        el.innerHTML = '<span>' + el.dataset.meal + '</span><small class="text-muted ms-2">' + priceLabel + '</small>';
    });
    var active = document.querySelector('.meal-option[data-meal="' + meal + '"]');
    if (active) {
        active.classList.add('active');
        var price = parseInt(active.dataset.price, 10) || 0;
        var priceLabel = price > 0 ? ('+PHP ' + price.toLocaleString('en-PH', { minimumFractionDigits: 2 })) : 'Included';
        active.innerHTML = '<span>' + meal + '</span><small class="text-muted ms-2">' + priceLabel + '</small><i class="bi bi-check2 ms-auto"></i>';
    }
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

// Toggle extras section
function toggleExtras(show) {
    document.getElementById('extrasContent').style.display = show ? 'block' : 'none';
}

// Submit the booking to the server
document.querySelector('.pay-btn').addEventListener('click', function (e) {
    e.preventDefault();

    if (!selectedSeat) {
        alert('Please select a seat before paying.');
        return;
    }

    var payload = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        passportNumber: document.getElementById('passportNumber').value.trim(),
        seat: selectedSeat,
        meal: selectedMeal,
        baggageCount: baggageCount,
        priorityBoarding: document.getElementById('priorityBoarding').checked,
        travelInsurance: document.getElementById('travelInsurance').checked,
        loungeAccess: document.getElementById('loungeAccess').checked
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