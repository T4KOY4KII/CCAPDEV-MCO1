$(document).ready(function () {

    /* PROFILE PAGE */

    if ($('.profile-tab-link').length) {

        /* --- Tab switching --- */
        $('.profile-tab-link').on('click', function (e) {
            e.preventDefault();
            $('.profile-tab-link').removeClass('active');
            $(this).addClass('active');
            var targetTab = $(this).data('tab');
            $('.tab-content-panel').removeClass('active');
            $('#' + targetTab).addClass('active');
        });


        /* --- Avatar upload --- */

        // Clicking the avatar circle or the edit button opens the file picker
        $('#avatarPreview, #editAvatarBtn').on('click', function () {
            $('#avatarInput').trigger('click');
        });

        // Preview the chosen image inside the avatar circle
        $('#avatarInput').on('change', function () {
            var file = this.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#avatarPreview').html('<img src="' + e.target.result + '" alt="Profile Picture">');
            };
            reader.readAsDataURL(file);
        });


        /* --- Personal info form: edit / save --- */

        lockPersonalInfoForm();

        $('#editInfoBtn').on('click', function () {
            unlockPersonalInfoForm();
        });

        $('#personalInfoForm').on('submit', function (e) {
            e.preventDefault();
            if (!validatePersonalInfo()) return;
            lockPersonalInfoForm();
            showSaveFeedback();
        });

        function lockPersonalInfoForm() {
            $('#personalInfoForm .form-control, #personalInfoForm .form-select').prop('disabled', true);
            $('#saveInfoBtn').prop('disabled', true);
            $('#editInfoBtn').show();
        }

        function unlockPersonalInfoForm() {
            $('#personalInfoForm .form-control, #personalInfoForm .form-select').prop('disabled', false);
            $('#saveInfoBtn').prop('disabled', false);
            $('#editInfoBtn').hide();
            $('#saveFeedback').addClass('d-none');
        }

        function showSaveFeedback() {
            var $feedback = $('#saveFeedback');
            $feedback.removeClass('d-none');
            setTimeout(function () {
                $feedback.addClass('d-none');
            }, 3000);
        }

        function validatePersonalInfo() {
            var isValid = true;

            // Clear previous errors
            $('#personalInfoForm .is-invalid').removeClass('is-invalid');
            $('#personalInfoForm .invalid-feedback').remove();

            if ($('#firstName').val().trim() === '') {
                showFieldError('#firstName', 'First name is required.');
                isValid = false;
            }
            if ($('#lastName').val().trim() === '') {
                showFieldError('#lastName', 'Last name is required.');
                isValid = false;
            }
            var email = $('#email').val().trim();
            if (email === '') {
                showFieldError('#email', 'Email is required.');
                isValid = false;
            } else if (!/^[^\s@]+@(gmail|yahoo)\.com$/.test(email)) {
                showFieldError('#email', 'Only Gmail or Yahoo email addresses are accepted.');
                isValid = false;
            }
            var contact = $('#contactNumber').val().trim();
            if (contact === '') {
                showFieldError('#contactNumber', 'Contact number is required.');
                isValid = false;
            } else if (!/^9\d{9}$/.test(contact)) {
                showFieldError('#contactNumber', 'Contact number must be 10 digits starting with 9 (e.g. 9674206967).');
                isValid = false;
            }

            var dobMonth = $('#dobMonth').val().trim();
            var dobDay   = $('#dobDay').val().trim();
            var dobYear  = $('#dobYear').val().trim();
            if (dobMonth === '' || dobDay === '' || dobYear === '') {
                if (dobMonth === '') showFieldError('#dobMonth', 'Required.');
                if (dobDay === '')   showFieldError('#dobDay',   'Required.');
                if (dobYear === '')  showFieldError('#dobYear',  'Required.');
                isValid = false;
            } else {
                var month = parseInt(dobMonth, 10);
                var day   = parseInt(dobDay,   10);
                var year  = parseInt(dobYear,  10);
                if (isNaN(month) || month < 1 || month > 12) {
                    showFieldError('#dobMonth', 'Enter a valid month (01–12).');
                    isValid = false;
                }
                if (isNaN(day) || day < 1 || day > 31) {
                    showFieldError('#dobDay', 'Enter a valid day (01–31).');
                    isValid = false;
                }
                if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
                    showFieldError('#dobYear', 'Enter a valid year (1900–' + new Date().getFullYear() + ').');
                    isValid = false;
                }
            }

            return isValid;
        }

        function showFieldError(selector, message) {
            $(selector)
                .addClass('is-invalid')
                .after('<div class="invalid-feedback">' + message + '</div>');
        }

        // Auto-advance DOB fields: MM → DD → YYYY
        $('#dobMonth').on('input', function () {
            if ($(this).val().length === 2) $('#dobDay').focus();
        });
        $('#dobDay').on('input', function () {
            if ($(this).val().length === 2) $('#dobYear').focus();
        });

        // Title case helper
        function toTitleCase(str) {
            return str.replace(/\b\w/g, function (char) { return char.toUpperCase(); });
        }

        // Personal info — title case on name/place fields
        $('#firstName, #lastName, #address, #city, #country').on('input', function () {
            var pos = this.selectionStart;
            $(this).val(toTitleCase($(this).val()));
            this.setSelectionRange(pos, pos);
        });


        /* SAVED PASSENGERS */

        // Dummy data — 7 passengers matching the mockup
        var passengers = [
            { title: 'Mr',  firstName: 'Jose',     lastName: 'Rizal',     gender: 'Male',   nationality: 'Filipino', passport: 'P1234567', contactCode: '+63', contact: '9674206967', email: 'joserizzal@gmail.com',  dobMonth: '06', dobDay: '19', dobYear: '1861', address: '123 Rizal Street',   city: 'Calamba',      country: 'Philippines' },
            { title: 'Ms',  firstName: 'Maria',    lastName: 'Clara',     gender: 'Female', nationality: 'Filipino', passport: 'P2345678', contactCode: '+63', contact: '9171234567', email: 'mclara@yahoo.com',      dobMonth: '03', dobDay: '15', dobYear: '1868', address: '456 Noli Street',    city: 'Manila',       country: 'Philippines' },
            { title: 'Mr',  firstName: 'Andres',   lastName: 'Bonifacio', gender: 'Male',   nationality: 'Filipino', passport: 'P3456789', contactCode: '+63', contact: '9189876543', email: 'abonifacio@gmail.com',  dobMonth: '11', dobDay: '30', dobYear: '1863', address: '789 Katipunan Ave',  city: 'Tondo',        country: 'Philippines' },
            { title: 'Ms',  firstName: 'Gabriela', lastName: 'Silang',    gender: 'Female', nationality: 'Filipino', passport: 'P4567890', contactCode: '+63', contact: '9205551234', email: 'gsilang@yahoo.com',     dobMonth: '03', dobDay: '19', dobYear: '1731', address: '10 Ilocos Sur Rd',   city: 'Vigan',        country: 'Philippines' },
            { title: 'Mr',  firstName: 'Emilio',   lastName: 'Aguinaldo', gender: 'Male',   nationality: 'Filipino', passport: 'P5678901', contactCode: '+63', contact: '9179991111', email: 'eaguinaldo@gmail.com',  dobMonth: '03', dobDay: '22', dobYear: '1869', address: '1 Aguinaldo St',     city: 'Kawit',        country: 'Philippines' },
            { title: 'Mr',  firstName: 'Juan',     lastName: 'Luna',      gender: 'Male',   nationality: 'Filipino', passport: 'P6789012', contactCode: '+63', contact: '9162223333', email: 'jluna@gmail.com',       dobMonth: '10', dobDay: '23', dobYear: '1857', address: '88 Spoliarium Rd',   city: 'Ilocos Norte', country: 'Philippines' },
            { title: 'Ms',  firstName: 'Melchora', lastName: 'Aquino',    gender: 'Female', nationality: 'Filipino', passport: 'P7890123', contactCode: '+63', contact: '9154445555', email: 'maquino@yahoo.com',     dobMonth: '01', dobDay: '06', dobYear: '1812', address: '5 Tandang Sora Rd',  city: 'Quezon City',  country: 'Philippines' }
        ];

        var passengersPerPage = 4;
        var currentPassengerPage = 1;

        // Render the passenger list for the current page
        function renderPassengerList() {
            var totalPages = Math.ceil(passengers.length / passengersPerPage);
            var start = (currentPassengerPage - 1) * passengersPerPage;
            var pageItems = passengers.slice(start, start + passengersPerPage);

            var html = '';
            pageItems.forEach(function (p, i) {
                var realIndex = start + i;
                var passportLast4 = p.passport.slice(-4);
                html += '<div class="passenger-card d-flex justify-content-between align-items-start">' +
                    '<div>' +
                        '<div class="passenger-card-name">' + p.title + '. ' + p.firstName + ' ' + p.lastName + '</div>' +
                        '<div class="passenger-card-meta">Adult &bull; ' + p.nationality + '</div>' +
                        '<div class="passenger-card-meta">Passport Ending in ' + passportLast4 + '</div>' +
                    '</div>' +
                    '<div class="passenger-card-actions">' +
                        '<button class="btn-passenger-action edit-passenger-btn" data-index="' + realIndex + '">Edit</button>' +
                        '<button class="btn-passenger-action remove remove-passenger-btn" data-index="' + realIndex + '">Remove</button>' +
                    '</div>' +
                '</div>';
            });

            $('#passengerList').html(html);
            $('#passengerPageInfo').text('Page ' + currentPassengerPage + ' of ' + totalPages);
            $('#passengerPrevBtn').prop('disabled', currentPassengerPage === 1);
            $('#passengerNextBtn').prop('disabled', currentPassengerPage === totalPages);
        }

        // Populate the form with a passenger's data
        function loadPassengerIntoForm(index) {
            var p = passengers[index];
            $('#passengerIndex').val(index);
            $('#passengerFormTitle').text('Edit Passenger');
            $('#pTitle').val(p.title);
            $('#pPassport').val(p.passport);
            $('#pFirstName').val(p.firstName);
            $('#pLastName').val(p.lastName);
            $('#pContactCode').val(p.contactCode);
            $('#pContactNumber').val(p.contact);
            $('#pGender').val(p.gender);
            $('#pDobMonth').val(p.dobMonth);
            $('#pDobDay').val(p.dobDay);
            $('#pDobYear').val(p.dobYear);
            $('#pEmail').val(p.email);
            $('#pAddress').val(p.address);
            $('#pCity').val(p.city);
            $('#pCountry').val(p.country);
            $('#passengerSaveFeedback').addClass('d-none');
        }

        // Clear the form for adding a new passenger
        function clearPassengerForm() {
            $('#passengerIndex').val('');
            $('#passengerFormTitle').text('Add New Passenger');
            $('#passengerForm')[0].reset();
            $('#passengerSaveFeedback').addClass('d-none');
            $('#passengerForm .is-invalid').removeClass('is-invalid');
            $('#passengerForm .invalid-feedback').remove();
        }

        // Validate the passenger form
        function validatePassengerForm() {
            var isValid = true;
            $('#passengerForm .is-invalid').removeClass('is-invalid');
            $('#passengerForm .invalid-feedback').remove();

            if ($('#pFirstName').val().trim() === '') {
                showFieldError('#pFirstName', 'First name is required.');
                isValid = false;
            }
            if ($('#pLastName').val().trim() === '') {
                showFieldError('#pLastName', 'Last name is required.');
                isValid = false;
            }
            var passport = $('#pPassport').val().trim();
            if (passport === '') {
                showFieldError('#pPassport', 'Passport number is required.');
                isValid = false;
            } else if (!/^[Pp]\d{7}$/.test(passport)) {
                showFieldError('#pPassport', 'Passport must start with P followed by exactly 7 digits (e.g. P1234567).');
                isValid = false;
            }

            var pContact = $('#pContactNumber').val().trim();
            if (pContact === '') {
                showFieldError('#pContactNumber', 'Contact number is required.');
                isValid = false;
            } else if (!/^9\d{9}$/.test(pContact)) {
                showFieldError('#pContactNumber', 'Contact number must be 10 digits starting with 9 (e.g. 9674206967).');
                isValid = false;
            }

            var pDobMonth = $('#pDobMonth').val().trim();
            var pDobDay   = $('#pDobDay').val().trim();
            var pDobYear  = $('#pDobYear').val().trim();
            if (pDobMonth === '' || pDobDay === '' || pDobYear === '') {
                if (pDobMonth === '') showFieldError('#pDobMonth', 'Required.');
                if (pDobDay === '')   showFieldError('#pDobDay',   'Required.');
                if (pDobYear === '')  showFieldError('#pDobYear',  'Required.');
                isValid = false;
            } else {
                var pMonth = parseInt(pDobMonth, 10);
                var pDay   = parseInt(pDobDay,   10);
                var pYear  = parseInt(pDobYear,  10);
                if (isNaN(pMonth) || pMonth < 1 || pMonth > 12) {
                    showFieldError('#pDobMonth', 'Enter a valid month (01–12).');
                    isValid = false;
                }
                if (isNaN(pDay) || pDay < 1 || pDay > 31) {
                    showFieldError('#pDobDay', 'Enter a valid day (01–31).');
                    isValid = false;
                }
                if (isNaN(pYear) || pYear < 1900 || pYear > new Date().getFullYear()) {
                    showFieldError('#pDobYear', 'Enter a valid year (1900–' + new Date().getFullYear() + ').');
                    isValid = false;
                }
            }

            var pEmail = $('#pEmail').val().trim();
            if (pEmail === '') {
                showFieldError('#pEmail', 'Email is required.');
                isValid = false;
            } else if (!/^[^\s@]+@(gmail|yahoo)\.com$/.test(pEmail)) {
                showFieldError('#pEmail', 'Only Gmail or Yahoo email addresses are accepted.');
                isValid = false;
            }
            return isValid;
        }

        function lockPassengerForm() {
            $('#passengerForm .form-control, #passengerForm .form-select').prop('disabled', true);
            $('#savePassengerBtn').prop('disabled', true);
            $('#cancelPassengerBtn').prop('disabled', true);
        }

        function unlockPassengerForm() {
            $('#passengerForm .form-control, #passengerForm .form-select').prop('disabled', false);
            $('#savePassengerBtn').prop('disabled', false);
            $('#cancelPassengerBtn').prop('disabled', false);
        }

        // Initial render — form starts locked and empty
        renderPassengerList();
        clearPassengerForm();
        lockPassengerForm();

        // Pagination
        $('#passengerPrevBtn').on('click', function () {
            if (currentPassengerPage > 1) {
                currentPassengerPage--;
                renderPassengerList();
            }
        });

        $('#passengerNextBtn').on('click', function () {
            var totalPages = Math.ceil(passengers.length / passengersPerPage);
            if (currentPassengerPage < totalPages) {
                currentPassengerPage++;
                renderPassengerList();
            }
        });

        // Edit button (delegated — list is re-rendered)
        $('#passengerList').on('click', '.edit-passenger-btn', function () {
            var index = parseInt($(this).data('index'));
            loadPassengerIntoForm(index);
            unlockPassengerForm();
        });

        // Remove button with confirmation
        $('#passengerList').on('click', '.remove-passenger-btn', function () {
            var index = parseInt($(this).data('index'));
            var p = passengers[index];
            if (confirm('Remove ' + p.title + '. ' + p.firstName + ' ' + p.lastName + ' from saved passengers?')) {
                passengers.splice(index, 1);
                // Adjust page if last item on page was removed
                var totalPages = Math.ceil(passengers.length / passengersPerPage);
                if (currentPassengerPage > totalPages && totalPages > 0) currentPassengerPage = totalPages;
                renderPassengerList();
                clearPassengerForm();
                lockPassengerForm();
            }
        });

        // Add New Passenger button — clear and unlock
        $('#addPassengerBtn').on('click', function () {
            clearPassengerForm();
            unlockPassengerForm();
        });

        // Cancel button — clear and lock
        $('#cancelPassengerBtn').on('click', function () {
            clearPassengerForm();
            lockPassengerForm();
        });

        // Save passenger form
        $('#passengerForm').on('submit', function (e) {
            e.preventDefault();
            if (!validatePassengerForm()) return;

            var index = $('#passengerIndex').val();
            var data = {
                title:       $('#pTitle').val(),
                firstName:   $('#pFirstName').val().trim(),
                lastName:    $('#pLastName').val().trim(),
                gender:      $('#pGender').val() || 'Prefer not to say',
                nationality: 'Filipino',
                passport:    $('#pPassport').val().trim(),
                contactCode: $('#pContactCode').val(),
                contact:     $('#pContactNumber').val().trim(),
                email:       $('#pEmail').val().trim(),
                dobMonth:    $('#pDobMonth').val().trim(),
                dobDay:      $('#pDobDay').val().trim(),
                dobYear:     $('#pDobYear').val().trim(),
                address:     $('#pAddress').val().trim(),
                city:        $('#pCity').val().trim(),
                country:     $('#pCountry').val().trim()
            };

            if (index !== '') {
                // Update existing
                passengers[parseInt(index)] = data;
            } else {
                // Add new
                passengers.push(data);
            }

            renderPassengerList();
            clearPassengerForm();
            lockPassengerForm();

            // Show feedback
            $('#passengerSaveFeedback').removeClass('d-none');
            setTimeout(function () {
                $('#passengerSaveFeedback').addClass('d-none');
            }, 3000);
        });

        // Auto-advance DOB fields in passenger form
        $('#pDobMonth').on('input', function () {
            if ($(this).val().length === 2) $('#pDobDay').focus();
        });
        $('#pDobDay').on('input', function () {
            if ($(this).val().length === 2) $('#pDobYear').focus();
        });

        // Passenger form — title case on name/place fields
        $('#pFirstName, #pLastName, #pAddress, #pCity, #pCountry').on('input', function () {
            var pos = this.selectionStart;
            $(this).val(toTitleCase($(this).val()));
            this.setSelectionRange(pos, pos);
        });

        // Passport — uppercase as you type
        $('#pPassport').on('input', function () {
            var pos = this.selectionStart;
            $(this).val($(this).val().toUpperCase());
            this.setSelectionRange(pos, pos);
        });

        /* PAYMENT METHODS */

        // Dummy saved payment methods
        var paymentMethods = [
            { id: 1, type: 'card',    name: 'BDO Titanium',  subtype: 'Mastercard', ending: '4747', isDefault: false,
              icon: 'public/imgs/payments/mastercard-logo.png' },
            { id: 2, type: 'ewallet', name: 'Google Pay',    subtype: 'E-Wallet',   ending: '2373', isDefault: true,
              icon: 'public/imgs/payments/googlepay-logo.png' },
            { id: 3, type: 'ewallet', name: 'PayPal',        subtype: 'E-Wallet',   ending: '4209', isDefault: false,
              icon: 'public/imgs/payments/paypal-logo.png' }
        ];

        var nextPaymentId = 4;

        function renderPaymentMethods() {
            var html = '';
            paymentMethods.forEach(function (m) {
                html += '<div class="payment-method-row">' +
                    '<img src="' + m.icon + '" alt="' + m.name + '" class="payment-method-icon">' +
                    '<div class="payment-method-info">' +
                        '<div class="payment-method-name">' + m.name + '</div>' +
                        '<div class="payment-method-meta">' + m.subtype + '</div>' +
                        '<div class="payment-method-meta">Ending in ' + m.ending + '</div>' +
                    '</div>' +
                    '<div class="payment-method-actions">';

                if (m.isDefault) {
                    html += '<button class="btn-payment-action default-active remove-default-btn" data-id="' + m.id + '">Remove Default</button>';
                } else {
                    html += '<button class="btn-payment-action set-default-btn" data-id="' + m.id + '">Set As Default</button>';
                }

                html += '<button class="btn-payment-action remove remove-payment-btn" data-id="' + m.id + '">Remove</button>' +
                    '</div>' +
                '</div>';
            });

            if (paymentMethods.length === 0) {
                html = '<p class="text-muted text-center py-3" style="font-size:13px;">No payment methods saved yet.</p>';
            }

            $('#paymentMethodsList').html(html);
        }

        // Initial render, form hidden
        renderPaymentMethods();

        // Show form panel when Add is clicked
        $('#addPaymentBtn').on('click', function () {
            $('#paymentFormCard').addClass('active');
            // Reset form
            $('input[name="paymentType"][value="card"]').prop('checked', true);
            $('#cardForm').removeClass('d-none');
            $('#ewalletForm').addClass('d-none');
            $('#creditCardForm')[0].reset();
            $('#creditCardForm .is-invalid').removeClass('is-invalid');
            $('#creditCardForm .invalid-feedback').remove();
            $('input[name="ewalletProvider"]').prop('checked', false);
        });

        // Hide form panel on Back/Cancel
        $('#cancelPaymentBtn').on('click', function () {
            $('#paymentFormCard').removeClass('active');
        });

        // Toggle between card and e-wallet forms
        $('input[name="paymentType"]').on('change', function () {
            if ($(this).val() === 'card') {
                $('#cardForm').removeClass('d-none');
                $('#ewalletForm').addClass('d-none');
            } else {
                $('#cardForm').addClass('d-none');
                $('#ewalletForm').removeClass('d-none');
            }
        });

        // Set as default
        $('#paymentMethodsList').on('click', '.set-default-btn', function () {
            var id = parseInt($(this).data('id'));
            paymentMethods.forEach(function (m) { m.isDefault = (m.id === id); });
            renderPaymentMethods();
        });

        // Remove default
        $('#paymentMethodsList').on('click', '.remove-default-btn', function () {
            var id = parseInt($(this).data('id'));
            paymentMethods.forEach(function (m) { if (m.id === id) m.isDefault = false; });
            renderPaymentMethods();
        });

        // Remove payment method
        $('#paymentMethodsList').on('click', '.remove-payment-btn', function () {
            var id = parseInt($(this).data('id'));
            var method = paymentMethods.find(function (m) { return m.id === id; });
            if (confirm('Remove ' + method.name + ' ending in ' + method.ending + '?')) {
                paymentMethods = paymentMethods.filter(function (m) { return m.id !== id; });
                renderPaymentMethods();
            }
        });

        // E-Wallet login simulation
        $('#ewalletLoginBtn').on('click', function () {
            var provider = $('input[name="ewalletProvider"]:checked').val();
            if (!provider) {
                alert('Please select an e-wallet provider first.');
                return;
            }
            // Simulate login — in a real app this would open OAuth
            var ending = Math.floor(1000 + Math.random() * 9000).toString();
            var icon = provider === 'PayPal'
                ? 'public/imgs/payments/paypal-logo.png'
                : 'public/imgs/payments/googlepay-logo.png';
            paymentMethods.push({ id: nextPaymentId++, type: 'ewallet', name: provider, subtype: 'E-Wallet', ending: ending, isDefault: false, icon: icon });
            renderPaymentMethods();
            $('#paymentFormCard').removeClass('active');
        });

        // Save credit/debit card
        $('#savePaymentBtn').on('click', function () {
            var type = $('input[name="paymentType"]:checked').val();
            if (type === 'ewallet') return; // handled by login button

            // Validate card form
            $('#creditCardForm .is-invalid').removeClass('is-invalid');
            $('#creditCardForm .invalid-feedback').remove();
            var isValid = true;

            var cardHolder = $('#cardholderName').val().trim();
            if (cardHolder === '') {
                showFieldError('#cardholderName', 'Cardholder name is required.');
                isValid = false;
            }

            var cardNameVal = $('#cardName').val().trim();
            if (cardNameVal === '') {
                showFieldError('#cardName', 'Card name is required.');
                isValid = false;
            }

            var expMonth = $('#cardExpMonth').val().trim();
            var expDay   = $('#cardExpDay').val().trim();
            var expYear  = $('#cardExpYear').val().trim();
            if (expMonth === '' || expDay === '' || expYear === '') {
                if (expMonth === '') showFieldError('#cardExpMonth', 'Required.');
                if (expDay === '')   showFieldError('#cardExpDay',   'Required.');
                if (expYear === '')  showFieldError('#cardExpYear',  'Required.');
                isValid = false;
            } else {
                if (isNaN(parseInt(expMonth)) || parseInt(expMonth) < 1 || parseInt(expMonth) > 12) {
                    showFieldError('#cardExpMonth', 'Invalid month.');
                    isValid = false;
                }
                if (isNaN(parseInt(expDay)) || parseInt(expDay) < 1 || parseInt(expDay) > 31) {
                    showFieldError('#cardExpDay', 'Invalid day.');
                    isValid = false;
                }
                if (isNaN(parseInt(expYear)) || parseInt(expYear) < new Date().getFullYear()) {
                    showFieldError('#cardExpYear', 'Card appears expired.');
                    isValid = false;
                }
            }

            var cvv = $('#cardCVV').val().trim();
            if (cvv === '') {
                showFieldError('#cardCVV', 'CVV is required.');
                isValid = false;
            } else if (!/^\d{3,4}$/.test(cvv)) {
                showFieldError('#cardCVV', 'CVV must be 3 or 4 digits.');
                isValid = false;
            }

            if (!isValid) return;

            var ending = cvv.slice(-4).padStart(4, '*');
            // Use last 4 of CVV as placeholder since we don't collect full card number
            ending = expYear.slice(-2) + expMonth + expDay.slice(-1) + cvv.slice(-1);
            paymentMethods.push({
                id: nextPaymentId++,
                type: 'card',
                name: cardNameVal,
                subtype: 'Credit/Debit Card',
                ending: cvv.slice(-4).padStart(4, '0'),
                isDefault: false,
                icon: 'public/imgs/payments/mastercard-logo.png'
            });

            renderPaymentMethods();
            $('#paymentFormCard').removeClass('active');
        });

        // Auto-advance expiry fields
        $('#cardExpMonth').on('input', function () {
            if ($(this).val().length === 2) $('#cardExpDay').focus();
        });
        $('#cardExpDay').on('input', function () {
            if ($(this).val().length === 2) $('#cardExpYear').focus();
        });

        // Title case on cardholder name
        $('#cardholderName, #cardName').on('input', function () {
            var pos = this.selectionStart;
            $(this).val(toTitleCase($(this).val()));
            this.setSelectionRange(pos, pos);
        });

        /* NOTIFICATIONS */

        $('#saveNotifBtn').on('click', function () {
            // Collect current toggle states (could be sent to a server in later milestones)
            var prefs = {
                booking:  $('#notifBooking').is(':checked'),
                schedule: $('#notifSchedule').is(':checked'),
                checkin:  $('#notifCheckin').is(':checked'),
                travel:   $('#notifTravel').is(':checked'),
                promo:    $('#notifPromo').is(':checked'),
                sms:      $('#notifSms').is(':checked')
            };
            console.log('Notification preferences saved:', prefs);

            // Show feedback
            $('#notifSaveFeedback').removeClass('d-none');
            setTimeout(function () {
                $('#notifSaveFeedback').addClass('d-none');
            }, 3000);
        });

        /* TRAVEL HISTORY */

        var travelHistory = [
            { route: 'CGY-BCD', airline: 'Philippine Airlines', flightNum: 'PR4923', date: 'March 13, 2025',    status: 'past',     bookingNum: 'V9ABCD', logo: 'public/imgs/flights/pal-logo.png',          name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '3B', seat: '14A', boarding: '2:30PM'  },
            { route: 'DVO-BXU', airline: 'AirAsia',             flightNum: 'Z2842',  date: 'December 5, 2025', status: 'past',     bookingNum: 'K3LMNO', logo: 'public/imgs/flights/air-asia-logo.png',     name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '7C', seat: '22F', boarding: '10:00AM' },
            { route: 'CRK-ILO', airline: 'Royal Air',           flightNum: 'RW804',  date: 'April 1, 2026',    status: 'past',     bookingNum: 'P7QRST', logo: 'public/imgs/flights/royal-air-logo.png',    name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '1A', seat: '8C',  boarding: '6:45AM'  },
            { route: 'MNL-CEB', airline: 'Cebu Pacific',        flightNum: '5J557',  date: 'May 4, 2026',      status: 'past',     bookingNum: 'V9EVSM', logo: 'public/imgs/flights/cebu-pacific-logo.png', name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '5A', seat: '27B', boarding: '4:30PM'  },
            { route: 'MNL-SIN', airline: 'Philippine Airlines', flightNum: 'PR502',  date: 'June 20, 2026',    status: 'upcoming', bookingNum: 'A1BCDE', logo: 'public/imgs/flights/pal-logo.png',          name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '9D', seat: '12A', boarding: '8:00AM'  },
            { route: 'CEB-MNL', airline: 'Cebu Pacific',        flightNum: '5J102',  date: 'July 3, 2026',     status: 'upcoming', bookingNum: 'B2CDEF', logo: 'public/imgs/flights/cebu-pacific-logo.png', name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '2B', seat: '33C', boarding: '1:15PM'  },
            { route: 'MNL-KUL', airline: 'AirAsia',             flightNum: 'AK521',  date: 'July 18, 2026',    status: 'upcoming', bookingNum: 'C3DEFG', logo: 'public/imgs/flights/air-asia-logo.png',     name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '6E', seat: '18D', boarding: '3:45PM'  },
            { route: 'ILO-MNL', airline: 'Royal Air',           flightNum: 'RW210',  date: 'August 5, 2026',   status: 'upcoming', bookingNum: 'D4EFGH', logo: 'public/imgs/flights/royal-air-logo.png',    name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '4F', seat: '5B',  boarding: '11:30AM' },
            { route: 'MNL-HKG', airline: 'Philippine Airlines', flightNum: 'PR300',  date: 'September 12, 2026', status: 'upcoming', bookingNum: 'E5FGHI', logo: 'public/imgs/flights/pal-logo.png',        name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '11A', seat: '7C', boarding: '7:20AM'  }
        ];

        var travelPerPage = 4;
        var travelPage = 0;

        function renderTravelHistory() {
            var start = travelPage * travelPerPage;
            var end   = start + travelPerPage;
            var page  = travelHistory.slice(start, end);
            var html  = '';

            page.forEach(function (f, i) {
                var idx = start + i;
                var badgeClass = f.status === 'upcoming' ? 'travel-badge-upcoming' : 'travel-badge-past';
                var badgeText  = f.status === 'upcoming' ? 'Upcoming' : 'Past';
                html += '<div class="travel-flight-row">' +
                    '<img src="' + f.logo + '" alt="' + f.airline + '" class="travel-airline-logo">' +
                    '<div class="travel-flight-info">' +
                        '<div class="d-flex align-items-center gap-2">' +
                            '<span class="travel-flight-route">' + f.route + '</span>' +
                            '<span class="travel-status-badge ' + badgeClass + '">' + badgeText + '</span>' +
                        '</div>' +
                        '<div class="travel-flight-meta">Flight Number ' + f.flightNum + '</div>' +
                        '<div class="travel-flight-meta">' + f.date + '</div>' +
                    '</div>' +
                    '<button class="btn-view-details view-details-btn" data-index="' + idx + '">View Details</button>' +
                '</div>';
            });

            $('#travelHistoryList').html(html);

            // Pagination button states
            $('#travelPrevBtn').prop('disabled', travelPage === 0);
            $('#travelNextBtn').prop('disabled', end >= travelHistory.length);
        }

        function showTravelDetail(idx) {
            var f = travelHistory[idx];
            $('#detailAirlineLogo').attr('src', f.logo).attr('alt', f.airline);
            $('#detailRoute').text(f.route);
            $('#detailFlightNum').text('Flight Number ' + f.flightNum);
            $('#detailBookingNum').text(f.bookingNum);
            $('#detailName').text(f.name);
            $('#detailGenderNat').text(f.gender + ' • ' + f.nationality);
            $('#detailContact').text(f.contact);
            $('#detailEmail').text(f.email);
            $('#detailGate').text(f.gate);
            $('#detailSeat').text(f.seat);
            $('#detailBoarding').text(f.boarding);

            $('#travelDetailPlaceholder').addClass('d-none');
            $('#travelDetailContent').removeClass('d-none');
        }

        function hideTravelDetail() {
            $('#travelDetailContent').addClass('d-none');
            $('#travelDetailPlaceholder').removeClass('d-none');
        }

        // Initial render
        renderTravelHistory();

        // View Details click
        $('#travelHistoryList').on('click', '.view-details-btn', function () {
            var idx = parseInt($(this).data('index'));
            showTravelDetail(idx);
        });

        // Detail back button
        $('#travelDetailBackBtn').on('click', function () {
            hideTravelDetail();
        });

        // Pagination
        $('#travelPrevBtn').on('click', function () {
            if (travelPage > 0) {
                travelPage--;
                renderTravelHistory();
                hideTravelDetail();
            }
        });

        $('#travelNextBtn').on('click', function () {
            if ((travelPage + 1) * travelPerPage < travelHistory.length) {
                travelPage++;
                renderTravelHistory();
                hideTravelDetail();
            }
        });


    }

});