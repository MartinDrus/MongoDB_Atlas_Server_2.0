import mongoose from "mongoose";
import * as RoleModel from './role.model.js';

const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullname: { type: String, required: true },
    email: {type: String, required: true, unique: true},
    city: { type: String },
    verificationHash: {type: String},
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' }
}, {timestamps: true});

// Erstelle ein neues Model Objekt fuer User
// Erstellt automatisch users Collection in der MongoDB, wenn noch nicht vorhanden
const User = mongoose.model('User', userSchema);

// DB-Funktion zum Abrufen aller User-Eintraege
export async function getAll() {
    return await User.find().populate('role',{ name: true });
}

// DB-Funktion zum Abrufen eines bestimmten User-Eintrags per username
export async function findUserByUsername(username) {
    let user = await User.findOne({username: username}).populate('role');
    if(!user) throw new Error(`User: ${username} not found!`, {cause: 404})
    return user;
}

// DB-Funktion zum Erstellen eines neuen User-Eintrags
export async function insertNewUser(userBody) {
    try {
        // Finde Rolleneintrag per Name der Rolle
        const role = await RoleModel.findByName(RoleModel.rolesEnum.unverified);

        // Ersetze role-Feld im Body durch die gefunden ID des Role-Eintrags aus der DB
        userBody.role = role._id;

        // Erstelle neue Instanz des User Models
        const newUser = new User(userBody);

        // Speichere neue Instanz
        return await newUser.save();

    } catch (error) {
        // Pruefe, ob Conflict durch Dupletten-Verletzung
        if ( (error.hasOwnProperty('code')) && (error.code === 11000) ) {
            throw new Error(`${error.message}`, {cause: 409})
        } else {
            // Muss ein Validierungsproblem sein
            // Schmeisse entsprechendes Fehlerobjekt
            throw new Error(`${error.message}`, {cause: 400}) 
        }
    }
}

export async function verifyUser(emailToken) {
    let user = await User.findOne({verificationHash: emailToken})
    if (!user) throw new Error('Invalid Token', {cause: 401})

    // Datumsobjekt fuer JETZT
    const now = new Date();
    const minute = 60 * 1000;

    //Token valid for 60 min
    if(now - user.updatedAt > (60 * minute)) {
        throw new Error('Token expired', {cause: 401})
    }
    
    // Finde Rolleneintrag per Name der Rolle
    const role = await RoleModel.findByName(RoleModel.rolesEnum.user);

    // Prüfung des Vorhandenssein und Ausstellungszeitraum bestanden
    // Weise User neue ('verifizierte') Rolle zu
    user.role = role.id;
    // Lösche Verifizierngstoken
    user.verificationHash = undefined;

    return await user.save();
}

export async function modifyUser(userId, body){
    return await User.findByIdAndUpdate(userId, body)
}

