const User = require('../../models/User');
const authController = require('../../controllers/authController');

//Mock user model
jest.mock('../../models/User');

function mockResponse() {
    const res = [];
    res.render = jest.fn().mockReturnValue(res);
    res.redirect = jest.fn().mockReturnValue(res);
    res.status = jest.fn().mockReturnValue(res);
    return res;
}

describe('authenticateUser - Unit Testing', () => {

    beforeEach(() => { jest.clearAllMocks(); });

    //Successful registration
    test('successfully registers a new user', async () => {

        const req = {
            body: {
                firstName: "Tessa",
                lastName: "McTest",
                email: "tessatest@email.com",
                password: "qwerty1234",
                confirmPassword: "qwerty1234"
            }
        };

        const res = mockResponse();

        User.findOne.mockResolvedValue(null);
        User.prototype.save = jest.fn().mockResolvedValue();

        await authController.register(req, res);

        expect(User.findOne).toHaveBeenCalledWith({ email: "tessatest@email.com" });
        expect(User.prototype.save).toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalledWith("/login?registered=true");


    });

    //Successful login
    test('successfully logs in a registered user with the correct email and password', async () => {

        const mockUser = {
            _id: "123",
            role: "user",
            firstName: "Tessa",
            lastName: "McTest",
            profileIMG: "/imgs/users/default-pfp.jpg",
            comparePassword: jest.fn().mockResolvedValue(true)
        };

        const req = {
            body: {
                email: "tessatest@email.com",
                password: "qwerty1234"
            },
            session: {}
        };
        const res = mockResponse();

        User.findOne.mockResolvedValue(mockUser);

        await authController.login(req, res);

        expect(User.findOne).toHaveBeenCalledWith({ email: "tessatest@email.com" });
        expect(req.session.userId).toBe("123");
        expect(res.redirect).toHaveBeenCalledWith("/dashboard");


    });

    //Failed login
    //Failed login: User not registered in system
    test('fail login when user does not exist', async () => {

        const req = {
            body: {
                email: "tessatest@email.com",
                password: "qwerty1234"
            },
            session: {}
        };

        const res = mockResponse();

        User.findOne.mockResolvedValue(null);

        await authController.login(req, res);

        expect(res.render).toHaveBeenCalledWith(
            "auth/login",
            expect.objectContaining({
                error: "Invalid email or password."
            })
        );

    });


     //Failed login: User inputted wrong credentials
    test('fail login with incorrect password', async () => {

        const mockUser = {
            comparePassword: jest.fn().mockResolvedValue(false)
        };

        const req = {
            body: {
                email: "tessatest@email.com",
                password: "wrongpassword"
            },
            session: {}
        };

        const res = mockResponse();

        User.findOne.mockResolvedValue(mockUser);

        await authController.login(req, res);

        expect(mockUser.comparePassword).toHaveBeenCalledWith("wrongpassword");

        expect(res.render).toHaveBeenCalledWith(
            "auth/login",
            expect.objectContaining({
                error: "Invalid email or password."
            })
        );

    });

    //Failed login: User does not input in login fields
    test('fail login with no input on email and password fields', async () => {

        const req = {
            body: {
                email: "",
                password: ""
            },
            session: {}
        };

        const res = mockResponse();

        await authController.login(req, res);

        expect(User.findOne).not.toHaveBeenCalledWith();

        expect(res.render).toHaveBeenCalledWith(
            "auth/login",
            expect.objectContaining({
                error: "Email and password are required."
            })
        );

    });

});