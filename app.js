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
