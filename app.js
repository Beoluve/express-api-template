const express = require('express');
const app = express();

app.use(express.json());

app.post('/auth', (req, res) => {
    const receivedKey = req.body.api_key || req.body.key;
    const expectedKey = process.env.API_KEY;

    console.log("=== DEBUG AUTENTICACIÓN ===");
    console.log("Clave recibida:", JSON.stringify(receivedKey));
    console.log("Clave esperada (Render):", JSON.stringify(expectedKey));

    if (receivedKey === expectedKey) {
        console.log("¡Autenticación exitosa!");
        return res.status(200).json({ success: true, accepted: true });
    } else {
        console.log("Autenticación fallida: Las claves no coinciden.");
        return res.status(401).json({ success: false, accepted: false, reason: "Unauthorized" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

const express = require('express');
const app = express();

app.use(express.json());

// Memoria global en el servidor para almacenar los datos de los jugadores de todos los servidores
let globalPlayers = {};

app.post('/auth', (req, res) => {
    const receivedKey = req.body.api_key || req.body.key;
    const expectedKey = process.env.API_KEY;
    const serverId = req.body.server_id;
    const incomingPlayers = req.body.players;

    // Validación básica de la clave
    if (receivedKey !== expectedKey) {
        console.log("Autenticación fallida: Clave incorrecta.");
        return res.status(401).json({ success: false, reason: "Unauthorized" });
    }

    // Si el script envía una lista de jugadores (Heartbeat), los actualizamos en memoria
    if (Array.isArray(incomingPlayers)) {
        incomingPlayers.forEach(playerData => {
            if (playerData && playerData.username) {
                globalPlayers[playerData.username] = {
                    ...playerData,
                    lastUpdate: Date.now()
                };
            }
        });
    }

    // Limpiar jugadores inactivos (más de 7 segundos sin enviar paquetes)
    const now = Date.now();
    for (const [username, data] of Object.entries(globalPlayers)) {
        if (now - data.lastUpdate > 7000 || data.disconnected) {
            delete globalPlayers[username];
        }
    }

    // Devolver la lista completa de jugadores activos a Roblox
    return.status(200).json({
        success: true,
        accepted: true,
        players: globalPlayers
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de sincronización corriendo en el puerto ${PORT}`);
});
