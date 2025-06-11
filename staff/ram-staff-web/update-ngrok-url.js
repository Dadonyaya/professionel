const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const envPath = path.join(__dirname, ".env");

exec("curl http://127.0.0.1:4040/api/tunnels", (err, stdout) => {
  if (err) {
    console.error("❌ Erreur Ngrok :", err.message);
    return;
  }

  try {
    const tunnels = JSON.parse(stdout).tunnels;
    const httpsTunnel = tunnels.find(t => t.public_url.startsWith("https"));

    if (!httpsTunnel) {
      console.error("❌ Aucun tunnel HTTPS actif trouvé !");
      return;
    }

    const newUrl = httpsTunnel.public_url;

    let newEnvContent = `API_URL=${newUrl}\n`;

    if (fs.existsSync(envPath)) {
      const existing = fs.readFileSync(envPath, "utf8");

      if (existing.includes("API_URL=")) {
        newEnvContent = existing.replace(/API_URL=.*/g, `API_URL=${newUrl}`);
      } else {
        newEnvContent = existing.trim() + `\nAPI_URL=${newUrl}\n`;
      }
    }

    fs.writeFileSync(envPath, newEnvContent, "utf8");

    console.log("✅ URL Ngrok mise à jour :", newUrl);
  } catch (e) {
    console.error("❌ Erreur de parsing ou écriture .env :", e.message);
  }
});
