import { Router } from "express";
import { registerNewUser, login, editOwnProfile, verifyEmail } from "../controller/user.controller.js";
import verifyToken from "../service/jwt.verifyToken.js";


// Erstelle neue Router Instanz
const authRouter = Router();

authRouter.route('/')
    .get((req, res) => res.send("Server is running!"))

authRouter.route('/verify-email')
    .get(verifyEmail)

authRouter.route('/user')
    .put(verifyToken, editOwnProfile)

// Routen Definition fuer /register
authRouter.route('/register')
    .post(registerNewUser);

// Routen Definition fuer /login
authRouter.route('/login')
    .post(login)

export default authRouter;