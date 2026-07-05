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
});

// Toggle summary expand/collapse sections
function toggleSummarySection(id) {
    var el = document.getElementById(id);
    var icon = document.getElementById(id + 'Icon');
    el.classList.toggle('d-none');
    if (icon) icon.className = el.classList.contains('d-none') ? 'bi bi-chevron-down' : 'bi bi-chevron-up';
}

// Seat selection
var selectedSeat = '4C';
function selectSeat(btn) {
    document.querySelectorAll('.seat.selected').forEach(function (s) {
        if (!s.classList.contains('premium')) s.classList.replace('selected', 'available');
        else s.classList.remove('selected');
    });
    btn.classList.add('selected');
    selectedSeat = btn.dataset.seat;
    document.getElementById('selectedSeatLabel').textContent = 'Seat: ' + selectedSeat;
    document.getElementById('selectedSeatTag').textContent = 'Seat: ' + selectedSeat;
}

// Meal selection
function selectMeal(meal) {
    document.querySelectorAll('.meal-option').forEach(function (el) {
        el.classList.remove('active');
        el.innerHTML = '<span>' + el.dataset.meal + '</span>';
    });
    var active = document.querySelector('.meal-option[data-meal="' + meal + '"]');
    if (active) {
        active.classList.add('active');
        active.innerHTML = '<span>' + meal + '</span><i class="bi bi-check2 ms-auto"></i>';
    }
    document.getElementById('selectedMealLabel').textContent = meal;
    document.getElementById('mealDetailName').textContent = meal;
}

// Baggage counter
var baggageCount = 1;
function changeBaggage(delta) {
    baggageCount = Math.max(0, Math.min(5, baggageCount + delta));
    document.getElementById('baggageCount').textContent = baggageCount;
    document.getElementById('baggageCountSummary').textContent = baggageCount;
    var price = baggageCount * 1250;
    document.getElementById('baggagePriceSummary').textContent = 'PHP ' + price.toLocaleString('en-PH', { minimumFractionDigits: 2 });
}

// Toggle extras section
function toggleExtras(show) {
    document.getElementById('extrasContent').style.display = show ? 'block' : 'none';
}

// Update total (simplified)
function updateTotal() { }