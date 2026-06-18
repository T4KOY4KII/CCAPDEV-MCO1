document.addEventListener("DOMContentLoaded", () => {

    const progress = document.querySelector('.progress');
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

        if(currentStep > 0){
            currentStep--;
            progressUpdate();
        }
    });

    
    nextButton.addEventListener("click", (e) => {
        e.preventDefault(); // preventing form submission

        if(currentStep < stepIndicators.length - 1){
            currentStep++;
            progressUpdate();
        }
    });
    
    progressUpdate();
});