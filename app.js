const express = require('express');
const app = express();

app.use(express.json());

// Memoria global en el servidor para almacenar los datos de los jugadores de todos los servidores
let globalPlayers = {};

app.post('/auth', (req, res) => {
    const receivedKey = req.body.api_key || req.body.key;
    const expectedKey = process.env.API_KEY;
    const incomingPlayers = req.body.players;

    // Validación de la clave de acceso
    if (receivedKey !== expectedKey) {
        console.log("Autenticación fallida: Clave incorrecta.");
        return res.status(401).json({ success: false, reason: "Unauthorized" });
    }

    // Si el script envía una lista de jugadores, los actualizamos en memoria global
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

    // Limpiar jugadores inactivos (más de 7 segundos sin enviar paquetes o desconectados)
    const now = Date.now();
    for (const [username, data] of Object.entries(globalPlayers)) {
        if (now - data.lastUpdate > 7000 || data.disconnected) {
            delete globalPlayers[username];
        }
    }

    // Devolver la lista completa de jugadores activos a Roblox
    return res.status(200).json({
        success: true,
        accepted: true,
        players: globalPlayers
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de sincronización corriendo en el puerto ${PORT}`);
});
