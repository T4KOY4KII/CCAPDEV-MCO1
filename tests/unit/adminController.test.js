const Flight = require('../../models/Flight');
const Reservations = require('../../models/Reservation');
const adminController = require('../../controllers/adminController');

//Mock models
jest.mock('../../models/Flight');
jest.mock('../../models/Reservation');
jest.mock('../../models/User');

function mockResponse() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

const validFlightBody = {
    flightNum: 'PR123',
    airline: 'Philippine Airlines',
    fromField: 'Manila (MNL)',
    toField: 'Tokyo (NRT)',
    departDate: '2027-05-01T08:00',
    arrivalDate: '2027-05-01T13:00',
    price: 5000,
    seats: 100,
    flightStatus: 'scheduled',
    tripType: 'oneway'
};

describe('Flight Management (Create) - Unit Testing', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('creates a flight successfully with valid data', async () => {
        
        const req = { body: validFlightBody };
        const res = mockResponse();

        Flight.findOne.mockResolvedValue(null); // no existing flight with this code

        const mockSave = jest.fn().mockResolvedValue(true);
        Flight.mockImplementation(function (data) {
            return { ...data, save: mockSave };
        });

        await adminController.createFlight(req, res);
        
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        expect(mockSave).toHaveBeenCalled();
    });

    test('rejects creating a flight with a duplicate flight code', async () => {
        
        const req = { body: validFlightBody };
        const res = mockResponse();

        Flight.findOne.mockResolvedValue({ _id: 'existingFlight1', flightCode: 'PR123' }); // already exists

        
        await adminController.createFlight(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ success: false, error: 'A flight with this Flight Number already exists.' });
    });

});

describe('Flight Management (Update) - Unit Testing', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('updates a flight successfully with valid data', async () => {
        const req = { params: { id: 'flight123' }, body: { ...validFlightBody, price: 5500, seats: 90 } };
        const res = mockResponse();

        const mockFlight = { _id: 'flight123', flightCode: 'PR123', save: jest.fn().mockResolvedValue(true) };
        Flight.findById.mockResolvedValue(mockFlight);
        Flight.findOne.mockResolvedValue(null); // no flight with the same code exists
        Reservations.countDocuments.mockResolvedValue(20); // 20 active bookings which is under the new seat count of 90
        
        await adminController.updateFlight(req, res);
        
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        expect(mockFlight.price).toBe(5500);
        expect(mockFlight.save).toHaveBeenCalled();
    });

    test('rejects reducing seats below the number of active bookings', async () => {
        
        const req = { params: { id: 'flight123' }, body: { ...validFlightBody, seats: 10 } };
        const res = mockResponse();

        const mockFlight = { _id: 'flight123', flightCode: 'PR123', save: jest.fn().mockResolvedValue(true) };
        Flight.findById.mockResolvedValue(mockFlight);
        Flight.findOne.mockResolvedValue(null);
        Reservations.countDocuments.mockResolvedValue(20); // 20 already booked, cannot reduce to 10

        await adminController.updateFlight(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
        expect(mockFlight.save).not.toHaveBeenCalled();
    });

});

describe('Flight Management (Delete) - Unit Testing', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deletes a flight successfully when there are no active bookings', async () => {
        
        const req = { params: { id: 'flight123' } };
        const res = mockResponse();

        Flight.findById.mockResolvedValue({ _id: 'flight123' });
        Reservations.countDocuments.mockResolvedValue(0);
        Flight.findByIdAndDelete.mockResolvedValue({ _id: 'flight123' });

        await adminController.deleteFlight(req, res);
        
        expect(res.json).toHaveBeenCalledWith({ success: true, id: 'flight123' });
        expect(Flight.findByIdAndDelete).toHaveBeenCalledWith('flight123');
    });

    test('blocks deleting a flight that has active reservations', async () => {
        
        const req = { params: { id: 'flight123' } };
        const res = mockResponse();

        Flight.findById.mockResolvedValue({ _id: 'flight123' });
        Reservations.countDocuments.mockResolvedValue(3);
        
        await adminController.deleteFlight(req, res);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
        expect(Flight.findByIdAndDelete).not.toHaveBeenCalled();
    });

});