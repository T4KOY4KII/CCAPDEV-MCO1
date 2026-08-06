const Flight = require('../../models/Flight');
const Reservations = require('../../models/Reservation');
const reservationController = require('../../controllers/reservationController');

//Similar to database mock but for User model
jest.mock('../../models/Flight');
jest.mock('../../models/Reservation');
jest.mock('../../models/User');

//Fakes a response object for the testing
function mockResponse() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe('createBooking - Unit Testing', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('rejects booking when the flight has no available seats', async () => {
        // Arrange
        const req = {
            params: { flightId: 'flight123' },
            body: { firstName: 'Juan', lastName: 'Dela Cruz', email: 'juan@example.com', passportNumber: 'P1234567', seat: '2A' },
            session: { userId: 'user123' }
        };
        const res = mockResponse();

        Flight.findById.mockResolvedValue({ _id: 'flight123', price: 5000, availableSeats: 0 });

        // Act
        await reservationController.createBooking(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ success: false, error: 'This flight has no available seats.' });
    });

    test('rejects booking when the selected seat is already taken', async () => {
        // Arrange
        const req = {
            params: { flightId: 'flight123' },
            body: { firstName: 'Juan', lastName: 'Dela Cruz', email: 'juan@example.com', passportNumber: 'P1234567', seat: '2A' },
            session: { userId: 'user123' }
        };
        const res = mockResponse();

        Flight.findById.mockResolvedValue({ _id: 'flight123', price: 5000, availableSeats: 5 });
        Reservations.findOne.mockResolvedValue({ _id: 'existingRes123', seat: '2A', status: 'confirmed' });

        // Act
        await reservationController.createBooking(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ success: false, error: 'That seat is already taken. Please choose another.' });
    });

    test('successfully creates a reservation when seats are available and the seat is free', async () => {
        // Arrange
        const req = {
            params: { flightId: 'flight123' },
            body: { firstName: 'Juan', lastName: 'Dela Cruz', email: 'juan@example.com', passportNumber: 'P1234567', seat: '2A' },
            session: { userId: 'user123' }
        };
        const res = mockResponse();

        const mockFlight = { _id: 'flight123', price: 5000, availableSeats: 5, save: jest.fn().mockResolvedValue(true) };
        Flight.findById.mockResolvedValue(mockFlight);
        Reservations.findOne.mockResolvedValue(null); // seat is free

        const mockSave = jest.fn().mockResolvedValue(true);
        Reservations.mockImplementation(function (data) {
            return { ...data, save: mockSave };
        });

        // Act
        await reservationController.createBooking(req, res);

        // Assert
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        expect(mockFlight.availableSeats).toBe(4); // decremented from 5
        expect(mockSave).toHaveBeenCalled();
    });

});

/*
describe('cancelReservation', () =>{
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('cancels the reservation', async () => {
        // Arrange
        const req = {
            params: { flightId: 'flight123' },
            body: { firstName: 'Juan', lastName: 'Dela Cruz', email: 'juan@example.com', passportNumber: 'P1234567', seat: '2A', status: 'confirmed' },
            session: { userId: 'user123' }
        };
        
        const res = mockResponse();

        const mockFlight = { _id: 'flight123', price: 5000, availableSeats: 5, save: jest.fn().mockResolvedValue(true) };
        Flight.findById.mockResolvedValue(mockFlight);
        Reservations.findOne.mockResolvedValue({_id: 'res123', seat: '2A', status: 'confirmed'}); // created reservation

        const mockSave = jest.fn().mockResolvedValue(true);
        Reservations.mockImplementation(function (data) {
            return { ...data, save: mockSave };
        });

        // Act
        await reservationController.cancelReservation(req, res);

        // Assert
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true}));
        expect(mockFlight.status).toBe('cancelled'); // 
        expect(mockSave).toHaveBeenCalled();
    });
})
*/
