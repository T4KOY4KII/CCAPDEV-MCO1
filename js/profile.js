$(document).ready(function () {

    /* PROFILE PAGE */

    if ($('.profile-tab-link').length) {

        /* --- Tab switching --- */
        $('.profile-tab-link').on('click', function (e) { // think if conditional. in english/layman's terms it'd mean 'when you click a tab...'
            e.preventDefault(); // prevents the <a> from trying to navigate to a new page bc this is a tab link
            $('.profile-tab-link').removeClass('active'); // removes the active status from all tabs before any switching
            $(this).addClass('active'); // adds the active status to the tab that was actually clicked
            var targetTab = $(this).data('tab'); // get which tab was clicked e.g. "saved-passengers"
            $('.tab-content-panel').removeClass('active'); // removes active status from all content panels so things don't clash
            $('#' + targetTab).addClass('active'); // show the only panel whose id matches the clicked tab
        });


        /* --- Avatar upload --- */

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


        /* --- Personal info form: edit / save --- */

        lockPersonalInfoForm(); // form starts locked by default on page load

        $('#editInfoBtn').on('click', function () {
            unlockPersonalInfoForm(); // clicking the edit button unlocks everything
        });

        $('#personalInfoForm').on('submit', function (e) {
            e.preventDefault(); // stop the form from reloading the page
            lockPersonalInfoForm();
            showSaveFeedback();
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

        var passengers = [
            { title: 'Mr',  firstName: 'Jose',     lastName: 'Rizal',     gender: 'Male',   nationality: 'Filipino', passport: 'P1234567', contactCode: '+63', contact: '9674206967', email: 'joserizzal@gmail.com',  dobMonth: '06', dobDay: '19', dobYear: '1861', address: '123 Rizal Street',   city: 'Calamba',      country: 'Philippines' },
            { title: 'Ms',  firstName: 'Maria',    lastName: 'Clara',     gender: 'Female', nationality: 'Filipino', passport: 'P2345678', contactCode: '+63', contact: '9171234567', email: 'mclara@yahoo.com',      dobMonth: '03', dobDay: '15', dobYear: '1868', address: '456 Noli Street',    city: 'Manila',       country: 'Philippines' },
            { title: 'Mr',  firstName: 'Andres',   lastName: 'Bonifacio', gender: 'Male',   nationality: 'Filipino', passport: 'P3456789', contactCode: '+63', contact: '9189876543', email: 'abonifacio@gmail.com',  dobMonth: '11', dobDay: '30', dobYear: '1863', address: '789 Katipunan Ave',  city: 'Tondo',        country: 'Philippines' },
            { title: 'Ms',  firstName: 'Gabriela', lastName: 'Silang',    gender: 'Female', nationality: 'Filipino', passport: 'P4567890', contactCode: '+63', contact: '9205551234', email: 'gsilang@yahoo.com',     dobMonth: '03', dobDay: '19', dobYear: '1731', address: '10 Ilocos Sur Rd',   city: 'Vigan',        country: 'Philippines' },
            { title: 'Mr',  firstName: 'Emilio',   lastName: 'Aguinaldo', gender: 'Male',   nationality: 'Filipino', passport: 'P5678901', contactCode: '+63', contact: '9179991111', email: 'eaguinaldo@gmail.com',  dobMonth: '03', dobDay: '22', dobYear: '1869', address: '1 Aguinaldo St',     city: 'Kawit',        country: 'Philippines' },
            { title: 'Mr',  firstName: 'Juan',     lastName: 'Luna',      gender: 'Male',   nationality: 'Filipino', passport: 'P6789012', contactCode: '+63', contact: '9162223333', email: 'jluna@gmail.com',       dobMonth: '10', dobDay: '23', dobYear: '1857', address: '88 Spoliarium Rd',   city: 'Ilocos Norte', country: 'Philippines' },
            { title: 'Ms',  firstName: 'Melchora', lastName: 'Aquino',    gender: 'Female', nationality: 'Filipino', passport: 'P7890123', contactCode: '+63', contact: '9154445555', email: 'maquino@yahoo.com',     dobMonth: '01', dobDay: '06', dobYear: '1812', address: '5 Tandang Sora Rd',  city: 'Quezon City',  country: 'Philippines' }
        ];

        // builds and injects the full passenger list into the page
        function renderPassengerList() {
            var html = '';
            passengers.forEach(function (p, index) {
                var passportLast4 = p.passport.slice(-4);
                html += '<div class="passenger-card d-flex justify-content-between align-items-start">' +
                    '<div>' +
                        '<div class="passenger-card-name">' + p.title + '. ' + p.firstName + ' ' + p.lastName + '</div>' +
                        '<div class="passenger-card-meta">Adult &bull; ' + p.nationality + '</div>' +
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

        // resets the form back to blank for adding a new passenger
        function clearPassengerForm() {
            $('#passengerIndex').val('');
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
            if (confirm('Remove ' + p.title + '. ' + p.firstName + ' ' + p.lastName + ' from saved passengers?')) {
                passengers.splice(index, 1); // remove 1 item at this index
                renderPassengerList();
                clearPassengerForm();
                lockPassengerForm();
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
                passengers[parseInt(index)] = data; // update existing
            } else {
                passengers.push(data); // add new
            }

            renderPassengerList();
            clearPassengerForm();
            lockPassengerForm();

            $('#passengerSaveFeedback').removeClass('d-none');
            setTimeout(function () {
                $('#passengerSaveFeedback').addClass('d-none');
            }, 3000);
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
            { id: 1, type: 'card',    name: 'BDO Titanium',  subtype: 'Mastercard', ending: '4747', isDefault: false, icon: 'public/imgs/payments/mastercard-logo.png' },
            { id: 2, type: 'ewallet', name: 'Google Pay',    subtype: 'E-Wallet',   ending: '2373', isDefault: true,  icon: 'public/imgs/payments/googlepay-logo.png'  },
            { id: 3, type: 'ewallet', name: 'PayPal',        subtype: 'E-Wallet',   ending: '4209', isDefault: false, icon: 'public/imgs/payments/paypal-logo.png'     }
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
                ? 'public/imgs/payments/paypal-logo.png'
                : 'public/imgs/payments/googlepay-logo.png';
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
                icon: 'public/imgs/payments/mastercard-logo.png'
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
            { route: 'CGY-BCD', airline: 'Philippine Airlines', flightNum: 'PR4923', date: 'March 13, 2025',      status: 'past',     bookingNum: 'V9ABCD', logo: 'public/imgs/flights/pal-logo.png',          name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '3B',  seat: '14A', boarding: '2:30PM'  },
            { route: 'DVO-BXU', airline: 'AirAsia',             flightNum: 'Z2842',  date: 'December 5, 2025',    status: 'past',     bookingNum: 'K3LMNO', logo: 'public/imgs/flights/air-asia-logo.png',     name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '7C',  seat: '22F', boarding: '10:00AM' },
            { route: 'CRK-ILO', airline: 'Royal Air',           flightNum: 'RW804',  date: 'April 1, 2026',       status: 'past',     bookingNum: 'P7QRST', logo: 'public/imgs/flights/royal-air-logo.png',    name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '1A',  seat: '8C',  boarding: '6:45AM'  },
            { route: 'MNL-CEB', airline: 'Cebu Pacific',        flightNum: '5J557',  date: 'May 4, 2026',         status: 'past',     bookingNum: 'V9EVSM', logo: 'public/imgs/flights/cebu-pacific-logo.png', name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '5A',  seat: '27B', boarding: '4:30PM'  },
            { route: 'MNL-SIN', airline: 'Philippine Airlines', flightNum: 'PR502',  date: 'June 20, 2026',       status: 'upcoming', bookingNum: 'A1BCDE', logo: 'public/imgs/flights/pal-logo.png',          name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '9D',  seat: '12A', boarding: '8:00AM'  },
            { route: 'CEB-MNL', airline: 'Cebu Pacific',        flightNum: '5J102',  date: 'July 3, 2026',        status: 'upcoming', bookingNum: 'B2CDEF', logo: 'public/imgs/flights/cebu-pacific-logo.png', name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '2B',  seat: '33C', boarding: '1:15PM'  },
            { route: 'MNL-KUL', airline: 'AirAsia',             flightNum: 'AK521',  date: 'July 18, 2026',       status: 'upcoming', bookingNum: 'C3DEFG', logo: 'public/imgs/flights/air-asia-logo.png',     name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '6E',  seat: '18D', boarding: '3:45PM'  },
            { route: 'ILO-MNL', airline: 'Royal Air',           flightNum: 'RW210',  date: 'August 5, 2026',      status: 'upcoming', bookingNum: 'D4EFGH', logo: 'public/imgs/flights/royal-air-logo.png',    name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '4F',  seat: '5B',  boarding: '11:30AM' },
            { route: 'MNL-HKG', airline: 'Philippine Airlines', flightNum: 'PR300',  date: 'September 12, 2026',  status: 'upcoming', bookingNum: 'E5FGHI', logo: 'public/imgs/flights/pal-logo.png',          name: 'Jose Rizal', gender: 'Adult', nationality: 'Filipino', contact: '+63 9674206967', email: 'joserizal@gmail.com', gate: '11A', seat: '7C',  boarding: '7:20AM'  }
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