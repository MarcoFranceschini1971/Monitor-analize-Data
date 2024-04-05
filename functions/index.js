/* eslint-disable */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.database();

exports.writeDataOnDB = functions.https.onRequest(async (req, res) => {
    try {
        // Verifica che la richiesta sia di tipo POST
        if (req.method !== "POST") {
            return res.status(400).json({ error: "Richiesta non valida. Utilizzare il metodo POST." });
        }

        const jsonDaSalvare = req.body;

        // Verifica che il corpo della richiesta contenga un JSON
        if (!jsonDaSalvare || typeof jsonDaSalvare !== "object") {
            return res.status(400).json({ error: "Il corpo della richiesta deve contenere un JSON valido." });
        }

        // Verifica che l"oggetto JSON contenga la chiave "time" con un valore numerico
        if (!jsonDaSalvare.hasOwnProperty("time") || isNaN(jsonDaSalvare.time)) {
            return res.status(400).json({ error: "L\"oggetto JSON deve contenere una chiave 'time' con un valore numerico." });
        }

        // Salva il JSON nella root "cliente 1" del database Realtime usando il valore numerico come chiave
        for (let key in jsonDaSalvare.data)
            await db.ref(jsonDaSalvare.clientId).child(jsonDaSalvare.unitId).child("data").child(key).child(String(jsonDaSalvare.time)).set(jsonDaSalvare.data[key]);
        for (let key in jsonDaSalvare.stats)
            await db.ref(jsonDaSalvare.clientId).child(jsonDaSalvare.unitId).child("stats").child(key).child(String(jsonDaSalvare.time)).set(jsonDaSalvare.stats[key]);

        // Rispondi con un messaggio di successo
        return res.status(200).json({ message: "JSON salvato nel database con successo.", key: chiaveDatabase });
    } catch (error) {
        console.error("Errore durante il salvataggio del JSON nel database:", error);
        return res.status(500).json({ error: "Errore interno del server." });
    }
});