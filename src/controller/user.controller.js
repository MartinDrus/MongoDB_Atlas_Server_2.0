import * as UserModel from "../model/user.model.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import sendVerificationEmail from '../service/mailVerification.js';
import md5 from 'md5';


// Controller Funktion zum Anlegen neuer User
export async function registerNewUser(req, res) {
    let body = req.body;

    // Generating a random String
    const salt = await bcrypt.genSalt(10);
    // Hashing the String
    const verificationToken = md5(salt);
    // Including Token to User DB
    body.verificationHash = verificationToken;

    // Sending mail 
    sendVerificationEmail(body.email, verificationToken)

    // Overwriting password-Property im body mit dem Hash des Passworts
    body.password = bcrypt.hashSync(body.password, 10);

    try {
        // Fuehre Model-Funktion zum Einfuegen eines neuen Users aus
        await UserModel.insertNewUser(body);

        // Sende Erfolgsmeldung zurueck
        res.send({success: true});

    } catch (error) {
        // TODO verfeinern, weil es unterschiedliche Fehler geben kann: 400 & 409
        res.status(error.code).send({error: error.message});
    }
}

// Controller Funktion zum Einloggen bestehender User
export async function login(req, res) {
    // extrahiere Properties aus dem body
    let { username, password } = req.body;

    // Hole entsprechenden User per username aus der DB
    let user = await UserModel.findUserByUsername(username);

    // Wenn user nicht gefunden wurde
    if (user === null) {
        // Sende 401 (UNAUTHORIZED) mit Nachricht
        res.status(401).send({
            success: false,
            message: 'Incorrect username or password'
        });
        // early return
        return;
    }

    // Vergleiche uebermitteltes password mit dem gehashten password aus der DB
    if (bcrypt.compareSync(password, user.password)) {
        // Erstelle neuen JWT Token mit payload und Verfall nach einer Stunde (60 Minuten * 60 Sekunden)
        let token = jwt.sign({ userId: user._id, username: user.username, role: user.role.name }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Sende Erfolgsnachricht sowie neuen Token zurueck
        res.send({
                success: true,
                message: `User ${user.username} logged in successfully!`,
                id: user._id,
                fullname: user.fullname,
                role: user.role.name,
                token: token
            });

    } else {
        // Passwort falsch -> Sende Fehlermeldung zurueck
        res.status(401).send({
            success: false,
            message: 'Incorrect username or password'
        });
    }
}

export async function updateUser(req, res){
    let userId = req.params.id
    let body = req.body;

    switch (body.role) {
        case "admin":
            body.role = "6405ac7d6b2564cd76c42603"
            break;
        case "author":
            body.role = "6405ac7d6b2564cd76c42604"
            break;
        case "user":
            body.role = "6405ac7d6b2564cd76c42605"
            break;
        default:
            break;
    }

    try {

        let response = await UserModel.modifyUser(userId, body)
        res.send(response)
        
    } catch (error) {
        res.send(error)
    }

}

export async function editOwnProfile(req, res) {

    const userId = req.tokenPayload.userId;
    let body = req.body;

    let newBody = {
        username: body.username,
        fullname: body.fullname,
        password: body.password,
        city: body.city
    }

    try {

        let response = await UserModel.modifyUser(userId, newBody)
        res.send(response)
        
    } catch (error) {
        res.send(error)
    }


}

export async function verifyEmail(req, res, next) {
    const emailToken = req.query.t;

    try {
        
        await UserModel.verifyUser(emailToken);
        res.status(200).send({})

    } catch (error) {
        if(!error.cause) res.status(400).send(error.message)
        else res.status(error.cause).send(error.message)
    }

}

export async function getAllUsers(req, res) {
    res.send(await UserModel.getAll());
}