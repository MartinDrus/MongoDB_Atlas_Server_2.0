import { rolesEnum } from "../model/role.model.js";

// Middleware-Funktion zum Authorisieren der admins
function authorizeAdmin(req, res, next) {
    const jwtPayload = req.tokenPayload;
    console.log("🚀 ~ file: authorizeAdmin.js:6 ~ authorizeAdmin ~ jwtPayload:", jwtPayload)

    if (jwtPayload.role !== rolesEnum.admin) {
        res.status(401).send({
            success: false,
            message: `Role ${jwtPayload.role} is not authorized for the endpoint`
        });
        return;
    }

    next();
}

export default authorizeAdmin;