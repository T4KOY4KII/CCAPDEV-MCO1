$(document).ready(function () {

    /* PROFILE PAGE */

    if ($('.profile-tab-link').length) {

        // on page load, show whichever tab matches the URL's hash (defaults to profile-info)
        var initialTab = window.location.hash ? window.location.hash.substring(1) : 'profile-info';
        if ($('#' + initialTab).length) {
            $('.profile-tab-link').removeClass('active');
            $('.tab-content-panel').removeClass('active');
            $('.profile-tab-link[data-tab="' + initialTab + '"]').addClass('active');
            $('#' + initialTab).addClass('active');
        }

        /* Tab switching */
        $('.profile-tab-link').on('click', function (e) { // think if conditional. in english/layman's terms it'd mean 'when you click a tab...'
            e.preventDefault(); // prevents the <a> from trying to navigate to a new page bc this is a tab link
            $('.profile-tab-link').removeClass('active'); // removes the active status from all tabs before any switching
            $(this).addClass('active'); // adds the active status to the tab that was actually clicked
            var targetTab = $(this).data('tab'); // get which tab was clicked e.g. "saved-passengers"
            $('.tab-content-panel').removeClass('active'); // removes active status from all content panels so things don't clash
            $('#' + targetTab).addClass('active'); // show the only panel whose id matches the clicked tab
            window.location.hash = targetTab;
        });


        /* Avatar upload */

        // clicking either the avatar circle OR the edit button
        // triggers a click on the hidden file input (the actual file picker)
        $('#avatarPreview, #editAvatarBtn').on('click', function () {
            $('#avatarInput').trigger('click'); // basically faking a click on the file picker
        });

        // when a file is actually chosen from the file picker
        $('#avatarInput').on('change', function () {
            var file = this.files[0]; // grab the first (and only) file the user picked
            if (!file) return; // if they cancelled the picker, don't do anything
            var reader = new FileReader(); // built-in browser thing that reads files
            reader.onload = function (e) {
                // once the file is read, shove it into the avatar circle as an <img> tag
                $('#avatarPreview').html('<img src="' + e.target.result + '" alt="Profile Picture">');
            };
            reader.readAsDataURL(file); // command to let the code actually start reading the file (triggers onload above)
        });


        /* Personal info form: edit / save */

        lockPersonalInfoForm(); // form starts locked by default on page load

        $('#editInfoBtn').on('click', function () {
            unlockPersonalInfoForm(); // clicking the edit button unlocks everything
        });

        // Reflect saved Title/Gender back into the dropdowns on page load
        var savedTitle = $('#profileTitle').val();
        var savedGender = $('#profileGender').val();

        if (savedTitle) $('#title').val(savedTitle);
        if (savedGender) $('#gender').val(savedGender);

        $('#personalInfoForm').on('submit', function (e) {
            e.preventDefault();

            $('#personalInfoForm .is-invalid').removeClass('is-invalid');
            $('#personalInfoForm .invalid-feedback').remove();

            var titleVal = $('#title').val();
            var firstNameVal = $('#firstName').val().trim();
            var lastNameVal = $('#lastName').val().trim();
            var genderVal = $('#gender').val();
            var emailVal = $('#email').val().trim();

            var hasError = false;

            if (!titleVal)     { showFieldError('#title', 'Title is required.'); hasError = true; }
            if (!firstNameVal) { showFieldError('#firstName', 'First name is required.'); hasError = true; }
            if (!lastNameVal)  { showFieldError('#lastName', 'Last name is required.'); hasError = true; }
            if (!genderVal)    { showFieldError('#gender', 'Gender is required.'); hasError = true; }

            if (!emailVal) {
                showFieldError('#email', 'Email is required.');
                hasError = true;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
                showFieldError('#email', 'Please enter a valid email address.');
                hasError = true;
            }
        
            if (hasError) return;
        
            var userId = $('#profileUserId').val();
            var payload = {
                title: titleVal,
                firstName: firstNameVal,
                lastName: lastNameVal,
                contactCode: $('#contactCode').val(),
                contactNumber: $('#contactNumber').val(),
                gender: genderVal,
                dobMonth: $('#dobMonth').val(),
                dobDay: $('#dobDay').val(),
                dobYear: $('#dobYear').val(),
                email: emailVal,
                address: $('#address').val(),
                city: $('#city').val(),
                country: $('#country').val()
            };
        
            fetch('/profile/' + userId, {
                method: 'PUT',
                headers: { 'Content-type': 'application/json; charset=UTF-8' },
                body: JSON.stringify(payload)
            })
                .then(function (response) { return response.json(); })
                .then(function (data) {
                    if (data.success) {
                        lockPersonalInfoForm();
                        showSaveFeedback();
                    } else {
                        alert(data.error || 'Something went wrong.');
                    }
                })
                .catch(function (err) {
                    console.error('Update profile error:', err);
                    alert('Something went wrong. Please try again.');
                });
        });

        function lockPersonalInfoForm() {
            // disable all inputs and the save button, show the edit button
            $('#personalInfoForm .form-control, #personalInfoForm .form-select').prop('disabled', true);
            $('#saveInfoBtn').prop('disabled', true);
            $('#editInfoBtn').show();
        }

        function unlockPersonalInfoForm() {
            // enable all inputs and save button, hide the edit button
            $('#personalInfoForm .form-control, #personalInfoForm .form-select').prop('disabled', false);
            $('#saveInfoBtn').prop('disabled', false);
            $('#editInfoBtn').hide();
            $('#saveFeedback').addClass('d-none');
        }

        function showSaveFeedback() {
            var $feedback = $('#saveFeedback');
            $feedback.removeClass('d-none'); // show the "saved!" message
            setTimeout(function () {
                $feedback.addClass('d-none'); // hide it again after 3 seconds
            }, 3000);
        }

        function showFieldError(selector, message) {
            // slap the red border + error message under the bad field
            $(selector)
                .addClass('is-invalid')
                .after('<div class="invalid-feedback">' + message + '</div>');
        }

        // auto-jump to next DOB field once you've typed 2 digits
        $('#dobMonth').on('input', function () {
            if ($(this).val().length === 2) $('#dobDay').focus();
        });
        $('#dobDay').on('input', function () {
            if ($(this).val().length === 2) $('#dobYear').focus();
        });

        // capitalizes the first letter of every word as you type
        function toTitleCase(str) {
            return str.replace(/\b\w/g, function (char) { return char.toUpperCase(); });
        }

        // apply title case live on name and place fields
        $('#firstName, #lastName, #address, #city, #country').on('input', function () {
            var pos = this.selectionStart; // remember cursor position
            $(this).val(toTitleCase($(this).val()));
            this.setSelectionRange(pos, pos); // put cursor back where it was
        });


        /* SAVED PASSENGERS */

        var passengers = JSON.parse($('#savedPassengersData').text() || '[]');

        // works out Adult / Child / Infant from a birthdate, using the same categories as the booking passenger selector
        function getPassengerAgeCategory(dobMonth, dobDay, dobYear) {
            var today = new Date();
            var birthDate = new Date(parseInt(dobYear, 10), parseInt(dobMonth, 10) - 1, parseInt(dobDay, 10));
        
            var age = today.getFullYear() - birthDate.getFullYear();
            var hadBirthdayThisYear =
                (today.getMonth() > birthDate.getMonth()) ||
                (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
            if (!hadBirthdayThisYear) age--;
        
            if (age < 2) return 'Infant';
            if (age < 18) return 'Child';
            return 'Adult';
        }

        // builds and injects the full passenger list into the page
        function renderPassengerList() {
            var html = '';
            passengers.forEach(function (p, index) {
                var passportLast4 = p.passport.slice(-4);
                html += '<div class="passenger-card d-flex justify-content-between align-items-start">' +
                    '<div>' +
                        '<div class="passenger-card-name">' + p.title + '. ' + p.firstName + ' ' + p.lastName + '</div>' +
                        '<div class="passenger-card-meta">' + getPassengerAgeCategory(p.dobMonth, p.dobDay, p.dobYear) + ' &bull; ' + p.nationality + '</div>' +
                        '<div class="passenger-card-meta">Passport Ending in ' + passportLast4 + '</div>' +
                    '</div>' +
                    '<div class="passenger-card-actions">' +
                        '<button class="btn-passenger-action edit-passenger-btn" data-index="' + index + '">Edit</button>' +
                        '<button class="btn-passenger-action remove remove-passenger-btn" data-index="' + index + '">Remove</button>' +
                    '</div>' +
                '</div>';
            });
            $('#passengerList').html(html);
        }

        // fills the form with a passenger's existing data for editing
        function loadPassengerIntoForm(index) {
            var p = passengers[index];
            $('#passengerIndex').val(index);
            $('#passengerMongoId').val(p._id);
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
            $('#pNationality').val(p.nationality);
            $('#passengerSaveFeedback').addClass('d-none');
        }

        // resets the form back to blank for adding a new passenger
        function clearPassengerForm() {
            $('#passengerIndex').val('');
            $('#passengerMongoId').val('');
            $('#passengerFormTitle').text('Add New Passenger');
            $('#passengerForm')[0].reset();
            $('#passengerSaveFeedback').addClass('d-none');
            $('#passengerForm .is-invalid').removeClass('is-invalid');
            $('#passengerForm .invalid-feedback').remove();
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

        // render on page load, form starts locked and empty
        renderPassengerList();
        clearPassengerForm();
        lockPassengerForm();

        // delegated event — edit buttons are created dynamically by renderPassengerList()
        $('#passengerList').on('click', '.edit-passenger-btn', function () {
            var index = parseInt($(this).data('index'));
            loadPassengerIntoForm(index);
            unlockPassengerForm();
        });

        // remove passenger with a confirmation prompt
        $('#passengerList').on('click', '.remove-passenger-btn', function () {
            var index = parseInt($(this).data('index'));
            var p = passengers[index];
            var userId = $('#profileUserId').val();

            if (confirm('Remove ' + p.title + '. ' + p.firstName + ' ' + p.lastName + ' from saved passengers?')) {
                fetch('/profile/' + userId + '/passengers/' + p._id, { method: 'DELETE' })
                    .then(function (response) { return response.json(); })
                    .then(function (result) {
                        if (result.success) {
                            passengers = result.savedPassengers;
                            renderPassengerList();
                            clearPassengerForm();
                            lockPassengerForm();
                        } else {
                            alert(result.error || 'Something went wrong.');
                        }
                    })
                    .catch(function (err) {
                        console.error('Delete passenger error:', err);
                        alert('Something went wrong. Please try again.');
                    });
            }
        });

        // add new passenger — clear and unlock the form
        $('#addPassengerBtn').on('click', function () {
            clearPassengerForm();
            unlockPassengerForm();
        });

        // cancel — clear and lock the form
        $('#cancelPassengerBtn').on('click', function () {
            clearPassengerForm();
            lockPassengerForm();
        });

        // save passenger — update existing or add new to array
        $('#passengerForm').on('submit', function (e) {
            e.preventDefault();

            // clears the old errors first
            $('#passengerForm .is-invalid').removeClass('is-invalid');
            $('#passengerForm .invalid-feedback').remove();

            var titleVal     = $('#pTitle').val();
            var firstNameVal = $('#pFirstName').val().trim();
            var lastNameVal  = $('#pLastName').val().trim();
            var genderVal    = $('#pGender').val();
            var passportVal  = $('#pPassport').val().trim();
            var contactVal   = $('#pContactNumber').val().trim();
            var emailVal     = $('#pEmail').val().trim();
            var dobMonthVal  = $('#pDobMonth').val().trim();
            var dobDayVal    = $('#pDobDay').val().trim();
            var dobYearVal   = $('#pDobYear').val().trim();
            var addressVal   = $('#pAddress').val().trim();
            var cityVal      = $('#pCity').val().trim();
            var countryVal   = $('#pCountry').val().trim();
            var nationalityVal = $('#pNationality').val();
            
            var hasError = false;

            if (!titleVal)     { showFieldError('#pTitle', 'Title is required.'); hasError = true; }
            if (!firstNameVal) { showFieldError('#pFirstName', 'First name is required.'); hasError = true; }
            if (!lastNameVal)  { showFieldError('#pLastName', 'Last name is required.'); hasError = true; }
            if (!genderVal)    { showFieldError('#pGender', 'Gender is required.'); hasError = true; }
            if (!passportVal)  { showFieldError('#pPassport', 'Passport number is required.'); hasError = true; }

            if (!contactVal) {
                showFieldError('#pContactNumber', 'Contact number is required.');
                hasError = true;
            } else if (!/^\d{7,15}$/.test(contactVal)) {
                showFieldError('#pContactNumber', 'Enter a valid contact number (digits only).');
                hasError = true;
            }
        
            if (!emailVal) {
                showFieldError('#pEmail', 'Email is required.');
                hasError = true;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
                showFieldError('#pEmail', 'Please enter a valid email address.');
                hasError = true;
            }
        
            var month = parseInt(dobMonthVal, 10);
            var day = parseInt(dobDayVal, 10);
            var year = parseInt(dobYearVal, 10);
            var currentYear = new Date().getFullYear();
        
            if (!dobMonthVal || !dobDayVal || !dobYearVal) {
                showFieldError('#pDobYear', 'Full date of birth is required.');
                hasError = true;
            } else if (month < 1 || month > 12) {
                showFieldError('#pDobMonth', 'Month must be between 01-12.');
                hasError = true;
            } else if (day < 1 || day > 31) {
                showFieldError('#pDobDay', 'Day must be between 01-31.');
                hasError = true;
            } else if (year < 1900 || year > currentYear) {
                showFieldError('#pDobYear', 'Enter a realistic birth year.');
                hasError = true;
            }
        
            if (!addressVal) { showFieldError('#pAddress', 'Address is required.'); hasError = true; }
            if (!cityVal)    { showFieldError('#pCity', 'City is required.'); hasError = true; }
            if (!countryVal) { showFieldError('#pCountry', 'Country is required.'); hasError = true; }
            if (!nationalityVal) { showFieldError('#pNationality', 'Nationality is required.'); hasError = true; }
            
            if (hasError) return;
        
            var mongoId = $('#passengerMongoId').val();
            var userId = $('#profileUserId').val();
            var data = {
                title: titleVal, firstName: firstNameVal, lastName: lastNameVal, gender: genderVal,
                passport: passportVal, contactCode: $('#pContactCode').val(),
                contact: contactVal, email: emailVal, dobMonth: dobMonthVal, dobDay: dobDayVal, dobYear: dobYearVal,
                address: addressVal, city: cityVal, country: countryVal, nationality: nationalityVal
            };

            var url = mongoId ? '/profile/' + userId + '/passengers/' + mongoId : '/profile/' + userId + '/passengers';
            var method = mongoId ? 'PUT' : 'POST';

            fetch(url, {
                method: method,
                headers: { 'Content-type': 'application/json; charset=UTF-8' },
                body: JSON.stringify(data)
            })
                .then(function (response) { return response.json(); })
                .then(function (result) {
                    if (result.success) {
                        passengers = result.savedPassengers;
                        renderPassengerList();
                        clearPassengerForm();
                        lockPassengerForm()     ;

                        $('#passengerSaveFeedback').removeClass('d-none');
                        setTimeout(function () { $('#passengerSaveFeedback').addClass('d-none'); }, 3000);
                    } else {
                        alert(result.error || 'Something went wrong.');
                    }
                })
                .catch(function (err) {
                    console.error('Save passenger error:', err);
                    alert('Something went wrong. Please try again.');
                });
        });

        // auto-jump to next DOB field in passenger form
        $('#pDobMonth').on('input', function () {
            if ($(this).val().length === 2) $('#pDobDay').focus();
        });
        $('#pDobDay').on('input', function () {
            if ($(this).val().length === 2) $('#pDobYear').focus();
        });

        // title case on passenger name/place fields
        $('#pFirstName, #pLastName, #pAddress, #pCity, #pCountry').on('input', function () {
            var pos = this.selectionStart;
            $(this).val(toTitleCase($(this).val()));
            this.setSelectionRange(pos, pos);
        });

        // passport — force uppercase as you type
        $('#pPassport').on('input', function () {
            var pos = this.selectionStart;
            $(this).val($(this).val().toUpperCase());
            this.setSelectionRange(pos, pos);
        });


        /* PAYMENT METHODS */

        var paymentMethods = [
            { id: 1, type: 'card',    name: 'BDO Titanium',  subtype: 'Mastercard', ending: '4747', isDefault: false, icon: '/public/imgs/payments/mastercard-logo.png' },
            { id: 2, type: 'ewallet', name: 'Google Pay',    subtype: 'E-Wallet',   ending: '2373', isDefault: true,  icon: '/public/imgs/payments/googlepay-logo.png'  },
            { id: 3, type: 'ewallet', name: 'PayPal',        subtype: 'E-Wallet',   ending: '4209', isDefault: false, icon: '/public/imgs/payments/paypal-logo.png'     }
        ];

        var nextPaymentId = 4;

        // builds and injects the payment methods list
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

        renderPaymentMethods();

        // show the add payment form
        $('#addPaymentBtn').on('click', function () {
            $('#paymentFormCard').addClass('active');
            $('input[name="paymentType"][value="card"]').prop('checked', true);
            $('#cardForm').removeClass('d-none');
            $('#ewalletForm').addClass('d-none');
            $('#creditCardForm')[0].reset();
            $('input[name="ewalletProvider"]').prop('checked', false);
        });

        // hide the add payment form
        $('#cancelPaymentBtn').on('click', function () {
            $('#paymentFormCard').removeClass('active');
        });

        // toggle between card and e-wallet form
        $('input[name="paymentType"]').on('change', function () {
            if ($(this).val() === 'card') {
                $('#cardForm').removeClass('d-none');
                $('#ewalletForm').addClass('d-none');
            } else {
                $('#cardForm').addClass('d-none');
                $('#ewalletForm').removeClass('d-none');
            }
        });

        // set a payment method as default
        $('#paymentMethodsList').on('click', '.set-default-btn', function () {
            var id = parseInt($(this).data('id'));
            paymentMethods.forEach(function (m) { m.isDefault = (m.id === id); });
            renderPaymentMethods();
        });

        // remove default status
        $('#paymentMethodsList').on('click', '.remove-default-btn', function () {
            var id = parseInt($(this).data('id'));
            paymentMethods.forEach(function (m) { if (m.id === id) m.isDefault = false; });
            renderPaymentMethods();
        });

        // remove a payment method entirely
        $('#paymentMethodsList').on('click', '.remove-payment-btn', function () {
            var id = parseInt($(this).data('id'));
            var method = paymentMethods.find(function (m) { return m.id === id; });
            if (confirm('Remove ' + method.name + ' ending in ' + method.ending + '?')) {
                paymentMethods = paymentMethods.filter(function (m) { return m.id !== id; });
                renderPaymentMethods();
            }
        });

        // simulate e-wallet login and add it to the list
        $('#ewalletLoginBtn').on('click', function () {
            var provider = $('input[name="ewalletProvider"]:checked').val();
            if (!provider) {
                alert('Please select an e-wallet provider first.');
                return;
            }
            var ending = Math.floor(1000 + Math.random() * 9000).toString();
            var icon = provider === 'PayPal'
                ? '/public/imgs/payments/paypal-logo.png'
                : '/public/imgs/payments/googlepay-logo.png';
            paymentMethods.push({ id: nextPaymentId++, type: 'ewallet', name: provider, subtype: 'E-Wallet', ending: ending, isDefault: false, icon: icon });
            renderPaymentMethods();
            $('#paymentFormCard').removeClass('active');
        });

        // save a new credit/debit card (no validation — just grab the values)
        $('#savePaymentBtn').on('click', function () {
            var type = $('input[name="paymentType"]:checked').val();
            if (type === 'ewallet') return; // e-wallet is handled by the login button above

            var cardNameVal = $('#cardName').val().trim();
            if (cardNameVal === '') return; // at minimum need a card name

            var cvv = $('#cardCVV').val().trim();
            paymentMethods.push({
                id: nextPaymentId++,
                type: 'card',
                name: cardNameVal,
                subtype: 'Credit/Debit Card',
                ending: cvv.slice(-4).padStart(4, '0'),
                isDefault: false,
                icon: '/public/imgs/payments/mastercard-logo.png'
            });

            renderPaymentMethods();
            $('#paymentFormCard').removeClass('active');
        });

        // auto-advance expiry fields
        $('#cardExpMonth').on('input', function () {
            if ($(this).val().length === 2) $('#cardExpDay').focus();
        });
        $('#cardExpDay').on('input', function () {
            if ($(this).val().length === 2) $('#cardExpYear').focus();
        });

        // title case on cardholder name
        $('#cardholderName, #cardName').on('input', function () {
            var pos = this.selectionStart;
            $(this).val(toTitleCase($(this).val()));
            this.setSelectionRange(pos, pos);
        });


        /* NOTIFICATIONS */

        $('#saveNotifBtn').on('click', function () {
            // collect toggle states
            var prefs = {
                booking:  $('#notifBooking').is(':checked'),
                schedule: $('#notifSchedule').is(':checked'),
                checkin:  $('#notifCheckin').is(':checked'),
                travel:   $('#notifTravel').is(':checked'),
                promo:    $('#notifPromo').is(':checked'),
                sms:      $('#notifSms').is(':checked')
            };
            console.log('Notification preferences saved:', prefs);

            $('#notifSaveFeedback').removeClass('d-none');
            setTimeout(function () {
                $('#notifSaveFeedback').addClass('d-none');
            }, 3000);
        });


        /* TRAVEL HISTORY */

        var travelHistory = [
            { route: 'CGY-BCD', airline: 'Philippine Airlines', flightNum: 'PR4923', date: 'March 13, 2025',      status: 'past',     bookingNum: 'V9ABCD', logo: '/public/imgs/flights/pal-logo.png',          name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '3B',  seat: '14A', boarding: '2:30PM'  },
            { route: 'DVO-BXU', airline: 'AirAsia',             flightNum: 'Z2842',  date: 'December 5, 2025',    status: 'past',     bookingNum: 'K3LMNO', logo: '/public/imgs/flights/air-asia-logo.png',     name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '7C',  seat: '22F', boarding: '10:00AM' },
            { route: 'CRK-ILO', airline: 'Royal Air',           flightNum: 'RW804',  date: 'April 1, 2026',       status: 'past',     bookingNum: 'P7QRST', logo: '/public/imgs/flights/royal-air-logo.png',    name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '1A',  seat: '8C',  boarding: '6:45AM'  },
            { route: 'MNL-CEB', airline: 'Cebu Pacific',        flightNum: '5J557',  date: 'May 4, 2026',         status: 'past',     bookingNum: 'V9EVSM', logo: '/public/imgs/flights/cebu-pacific-logo.png', name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '5A',  seat: '27B', boarding: '4:30PM'  },
            { route: 'MNL-SIN', airline: 'Philippine Airlines', flightNum: 'PR502',  date: 'June 20, 2026',       status: 'upcoming', bookingNum: 'A1BCDE', logo: '/public/imgs/flights/pal-logo.png',          name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '9D',  seat: '12A', boarding: '8:00AM'  },
            { route: 'CEB-MNL', airline: 'Cebu Pacific',        flightNum: '5J102',  date: 'July 3, 2026',        status: 'upcoming', bookingNum: 'B2CDEF', logo: '/public/imgs/flights/cebu-pacific-logo.png', name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '2B',  seat: '33C', boarding: '1:15PM'  },
            { route: 'MNL-KUL', airline: 'AirAsia',             flightNum: 'AK521',  date: 'July 18, 2026',       status: 'upcoming', bookingNum: 'C3DEFG', logo: '/public/imgs/flights/air-asia-logo.png',     name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '6E',  seat: '18D', boarding: '3:45PM'  },
            { route: 'ILO-MNL', airline: 'Royal Air',           flightNum: 'RW210',  date: 'August 5, 2026',      status: 'upcoming', bookingNum: 'D4EFGH', logo: '/public/imgs/flights/royal-air-logo.png',    name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '4F',  seat: '5B',  boarding: '11:30AM' },
            { route: 'MNL-HKG', airline: 'Philippine Airlines', flightNum: 'PR300',  date: 'September 12, 2026',  status: 'upcoming', bookingNum: 'E5FGHI', logo: '/public/imgs/flights/pal-logo.png',          name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '11A', seat: '7C',  boarding: '7:20AM'  }
        ];

        // builds and injects the travel history list (all items, no pagination)
        function renderTravelHistory() {
            var html = '';
            travelHistory.forEach(function (f, idx) {
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
        }

        // fills the detail panel with the clicked flight's info
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

        // hides the detail panel and shows the placeholder again
        function hideTravelDetail() {
            $('#travelDetailContent').addClass('d-none');
            $('#travelDetailPlaceholder').removeClass('d-none');
        }

        renderTravelHistory();

        // delegated event — view details buttons are created dynamically by renderTravelHistory()
        $('#travelHistoryList').on('click', '.view-details-btn', function () {
            var idx = parseInt($(this).data('index'));
            showTravelDetail(idx);
        });

        // back button hides the detail panel
        $('#travelDetailBackBtn').on('click', function () {
            hideTravelDetail();
        });

    }

});