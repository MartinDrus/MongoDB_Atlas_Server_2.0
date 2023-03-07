import mongoose from "mongoose";
import * as RoleModel from './role.model.js';

// Definiere Todo Schema
const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullname: { type: String, required: true },
    city: { type: String },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' }
}, {timestamps: true});


// Erstelle ein neues Model Objekt fuer User
// Erstellt automatisch users Collection in der MongoDB, wenn noch nicht vorhanden
const User = mongoose.model('User', userSchema);

// DB-Funktion zum Abrufen eines bestimmten User-Eintrags per username
export async function findUserByUsername(username) {
    return await User.findOne({username: username}).populate('role');
}

// DB-Funktion zum Erstellen eines neuen User-Eintrags
export async function insertNewUser(userBody) {
    try {
        // Finde Rolleneintrag per Name der Rolle
        const role = await RoleModel.findByName(RoleModel.rolesEnum.user);

        // Ersetze role-Feld im Body durch die gefunden ID des Role-Eintrags aus der DB
        userBody.role = role._id;

        // Erstelle neue Instanz des User Models
        const newUser = new User(userBody);

        // Speichere neue Instanz
        return await newUser.save();

    } catch (error) {
        // Pruefe, ob Conflict durch Dupletten-Verletzung
        if ( (error.hasOwnProperty('code')) && (error.code === 11000) ) {
            // Schmeisse entsprechendes Fehlerobjekt
            throw {
                code: 409,
                message: error.message
            };

        } else {
            // Muss ein Validierungsproblem sein
            // Schmeisse entsprechendes Fehlerobjekt
            throw {
                code: 400,
                message: error.message
            };
        }
    }
}

export async function modifyUser(userId, body){
    return await User.findByIdAndUpdate(userId, body)
}

// DB-Funktion zum Abrufen aller User-Eintraege
export async function getAll() {
    return await User.find().populate('role',{ name: true });
}