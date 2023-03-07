import { Router } from "express";
import { getAllUsers, updateUser } from "../controller/user.controller.js";
import verifyToken from "../service/jwt.verifyToken.js"
import authorizeAdmin from "../service/authorizeAdmin.js";




// Erstelle neue Router Instanz
const protectedRouter = Router();

// Setze Tokenverifizierungs-Middleware fuer alle Endpoints des Routers
protectedRouter.use(verifyToken, authorizeAdmin);

// Routen Definition fuer root
protectedRouter.route('/users')
    .get(getAllUsers)

// Routen Definition fuer root
protectedRouter.route('/users/:id')
    .patch(updateUser)

protectedRouter.route('/test').get((req,res) => {
    res.send({
        success: true,
        data: req.tokenPayload
    });
})



export default protectedRouter;