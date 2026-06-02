import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { slugify } from "@/lib/utils";
import bcrypt from "bcryptjs";
import { seedBadges } from "@/lib/gamification";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const courses = [
    {
      title: "Minecraft Plugin Development met Java",
      description: "Leer hoe je Minecraft plugins bouwt met Java en de Spigot/Paper API. Van je eerste commando tot complete gameplay mechanieken.",
      category: "programming",
      level: "INTERMEDIATE" as const,
      lessons: [
        {
          title: "Introductie tot Minecraft Plugin Dev",
          content: "# Minecraft Plugin Development\n\n## Wat heb je nodig?\n- Java JDK 17+\n- IntelliJ IDEA (gratis)\n- Paper/Spigot API\n- Maven of Gradle\n\n## Je eerste plugin opzetten\n\n### Maven `pom.xml`\n```xml\n<repositories>\n  <repository>\n    <id>papermc</id>\n    <url>https://repo.papermc.io/repository/maven-public/</url>\n  </repository>\n</repositories>\n\n<dependencies>\n  <dependency>\n    <groupId>io.papermc.paper</groupId>\n    <artifactId>paper-api</artifactId>\n    <version>1.21.4-R0.1-SNAPSHOT</version>\n    <scope>provided</scope>\n  </dependency>\n</dependencies>\n```\n\n### `plugin.yml`\n```yaml\nname: MijnPlugin\nversion: 1.0.0\nmain: nl.mathhosting.mijnplugin.MijnPlugin\napi-version: 1.21\ndescription: Mijn eerste Minecraft plugin\nauthor: JouwNaam\n```",
        },
        {
          title: "Je eerste commando maken",
          content: "# Commando's in Minecraft Plugins\n\n## Hoofd klasse\n```java\npackage nl.mathhosting.mijnplugin;\n\nimport org.bukkit.plugin.java.JavaPlugin;\n\npublic class MijnPlugin extends JavaPlugin {\n    @Override\n    public void onEnable() {\n        getLogger().info(\"Plugin gestart!\");\n        getCommand(\"hallo\").setExecutor(new HalloCommand());\n    }\n\n    @Override\n    public void onDisable() {\n        getLogger().info(\"Plugin gestopt!\");\n    }\n}\n```\n\n## Commando klasse\n```java\npackage nl.mathhosting.mijnplugin;\n\nimport org.bukkit.command.Command;\nimport org.bukkit.command.CommandExecutor;\nimport org.bukkit.command.CommandSender;\nimport org.bukkit.entity.Player;\n\npublic class HalloCommand implements CommandExecutor {\n    @Override\n    public boolean onCommand(CommandSender sender, Command cmd, String label, String[] args) {\n        if (sender instanceof Player player) {\n            player.sendMessage(\"§aHallo \" + player.getName() + \"!\");\n        }\n        return true;\n    }\n}\n```\n\n### `plugin.yml` updaten\n```yaml\ncommands:\n  hallo:\n    description: Stuur een begroeting\n    usage: /hallo\n    permission: mijnplugin.hallo\n```",
        },
        {
          title: "Events en Listeners",
          content: "# Events in Minecraft Plugins\n\n## Wat zijn events?\nMinecraft vuurt events als spelers iets doen. Jij kunt hierop reageren.\n\n## Listener registreren\n```java\n// In onEnable():\ngetServer().getPluginManager().registerEvents(new SpelerListener(), this);\n```\n\n## Listener klasse\n```java\nimport org.bukkit.event.EventHandler;\nimport org.bukkit.event.Listener;\nimport org.bukkit.event.player.PlayerJoinEvent;\nimport org.bukkit.event.player.PlayerDeathEvent;\nimport org.bukkit.event.block.BlockBreakEvent;\n\npublic class SpelerListener implements Listener {\n\n    @EventHandler\n    public void onJoin(PlayerJoinEvent event) {\n        event.setJoinMessage(\"§e\" + event.getPlayer().getName() + \" §fheeft de server betreden!\");\n        event.getPlayer().sendMessage(\"§6Welkom op de server!\");\n    }\n\n    @EventHandler\n    public void onDeath(PlayerDeathEvent event) {\n        event.setDeathMessage(\"§c\" + event.getEntity().getName() + \" heeft het loodje gelegd!\");\n    }\n\n    @EventHandler\n    public void onBlockBreak(BlockBreakEvent event) {\n        event.getPlayer().sendMessage(\"§7Je brak: \" + event.getBlock().getType());\n    }\n}\n```",
        },
        {
          title: "Config & Data opslaan",
          content: "# Configuratie en Data Opslaan\n\n## config.yml aanmaken\n```java\n@Override\npublic void onEnable() {\n    saveDefaultConfig(); // maakt config.yml aan\n    String prefix = getConfig().getString(\"prefix\", \"[Plugin]\");\n    int maxKills = getConfig().getInt(\"max-kills\", 10);\n}\n```\n\n### config.yml\n```yaml\nprefix: \"[MijnPlugin]\"\nmax-kills: 10\nbericht-join: \"Welkom!\"\n```\n\n## Data opslaan met YamlConfiguration\n```java\nimport org.bukkit.configuration.file.YamlConfiguration;\nimport java.io.File;\n\nFile dataFile = new File(getDataFolder(), \"spelers.yml\");\nYamlConfiguration data = YamlConfiguration.loadConfiguration(dataFile);\n\n// Opslaan\ndata.set(\"speler.\" + uuid + \".kills\", kills);\ndata.save(dataFile);\n\n// Laden\nint kills = data.getInt(\"speler.\" + uuid + \".kills\", 0);\n```\n\n## Database (SQLite)\n```java\nConnection conn = DriverManager.getConnection(\"jdbc:sqlite:\" + getDataFolder() + \"/data.db\");\nStatement stmt = conn.createStatement();\nstmt.execute(\"CREATE TABLE IF NOT EXISTS kills (uuid TEXT, amount INT)\");\n```",
        },
      ],
    },
    {
      title: "Discord Bot maken met JavaScript",
      description: "Bouw je eigen Discord bot met Node.js en Discord.js. Van slash commands tot moderatie, muziek en server management bots.",
      category: "programming",
      level: "BEGINNER" as const,
      lessons: [
        {
          title: "Discord Bot Setup",
          content: "# Discord Bot met Discord.js\n\n## Benodigdheden\n- Node.js 18+\n- Discord Developer Portal account\n- npm\n\n## Project aanmaken\n```bash\nmkdir mijn-bot\ncd mijn-bot\nnpm init -y\nnpm install discord.js\n```\n\n## Bot aanmaken op Discord\n1. Ga naar [discord.com/developers](https://discord.com/developers)\n2. Nieuwe applicatie aanmaken\n3. Bot tab → Bot toevoegen\n4. Token kopiëren (geheim houden!)\n5. OAuth2 → Bot uitnodigen met permissions\n\n## Eerste bot (`index.js`)\n```javascript\nconst { Client, GatewayIntentBits } = require('discord.js');\n\nconst client = new Client({\n  intents: [\n    GatewayIntentBits.Guilds,\n    GatewayIntentBits.GuildMessages,\n    GatewayIntentBits.MessageContent,\n  ]\n});\n\nclient.once('ready', () => {\n  console.log(`Bot online als ${client.user.tag}`);\n});\n\nclient.on('messageCreate', (message) => {\n  if (message.content === '!ping') {\n    message.reply('Pong! 🏓');\n  }\n});\n\nclient.login('JOUW_BOT_TOKEN');\n```",
        },
        {
          title: "Slash Commands",
          content: "# Slash Commands met Discord.js\n\n## Slash commands registreren\n```javascript\nconst { REST, Routes, SlashCommandBuilder } = require('discord.js');\n\nconst commands = [\n  new SlashCommandBuilder()\n    .setName('ping')\n    .setDescription('Controleer of de bot online is'),\n  new SlashCommandBuilder()\n    .setName('info')\n    .setDescription('Serverinformatie weergeven'),\n];\n\nconst rest = new REST().setToken(process.env.TOKEN);\nawait rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });\n```\n\n## Commands afhandelen\n```javascript\nclient.on('interactionCreate', async (interaction) => {\n  if (!interaction.isChatInputCommand()) return;\n\n  if (interaction.commandName === 'ping') {\n    await interaction.reply({\n      content: `🏓 Pong! Latency: ${client.ws.ping}ms`,\n      ephemeral: true\n    });\n  }\n\n  if (interaction.commandName === 'info') {\n    const guild = interaction.guild;\n    await interaction.reply({\n      embeds: [{\n        title: guild.name,\n        fields: [\n          { name: 'Leden', value: guild.memberCount.toString(), inline: true },\n          { name: 'Kanalen', value: guild.channels.cache.size.toString(), inline: true },\n        ],\n        color: 0x5865F2\n      }]\n    });\n  }\n});\n```",
        },
        {
          title: "Moderatie Bot",
          content: "# Moderatie Functies\n\n## Ban & Kick commando's\n```javascript\nnew SlashCommandBuilder()\n  .setName('ban')\n  .setDescription('Ban een gebruiker')\n  .addUserOption(option =>\n    option.setName('gebruiker').setDescription('Wie bannen?').setRequired(true)\n  )\n  .addStringOption(option =>\n    option.setName('reden').setDescription('Reden voor ban')\n  )\n  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)\n\n// Afhandelen:\nif (interaction.commandName === 'ban') {\n  const target = interaction.options.getUser('gebruiker');\n  const reden = interaction.options.getString('reden') ?? 'Geen reden opgegeven';\n\n  try {\n    await interaction.guild.members.ban(target, { reason: reden });\n    await interaction.reply(`✅ **${target.tag}** is gebanned.\\nReden: ${reden}`);\n  } catch (error) {\n    await interaction.reply({ content: '❌ Kon deze gebruiker niet bannen.', ephemeral: true });\n  }\n}\n```\n\n## Auto-moderatie\n```javascript\nconst VERBODEN_WOORDEN = ['spam', 'advertentie'];\n\nclient.on('messageCreate', async (message) => {\n  if (message.author.bot) return;\n\n  const bevat = VERBODEN_WOORDEN.some(woord =>\n    message.content.toLowerCase().includes(woord)\n  );\n\n  if (bevat) {\n    await message.delete();\n    await message.channel.send(`⚠️ ${message.author} Verboden inhoud verwijderd!`);\n  }\n});\n```",
        },
      ],
    },
    {
      title: "Linux Server Setup voor Gameservers",
      description: "Zet een Linux VPS op voor het hosten van Minecraft, Discord bots en andere gameservers. Van SSH tot firewall en automatisch opstarten.",
      category: "sysadmin",
      level: "BEGINNER" as const,
      lessons: [
        {
          title: "Verbinden met SSH",
          content: "# Verbinden met je VPS via SSH\n\n## Wat is SSH?\nSSH (Secure Shell) is een versleuteld protocol om op afstand in te loggen op een server.\n\n## Verbinden\n```bash\nssh root@jouw-server-ip\n# Of met een specifieke poort:\nssh -p 2222 root@jouw-server-ip\n```\n\n## SSH Key aanmaken (veiliger dan wachtwoord)\n```bash\n# Op jouw computer:\nssh-keygen -t ed25519 -C \"mijn-server\"\n\n# Public key naar server sturen:\nssh-copy-id root@jouw-server-ip\n\n# Nu inloggen zonder wachtwoord:\nssh root@jouw-server-ip\n```\n\n## Eerste server setup\n```bash\n# Updates installeren\napt update && apt upgrade -y\n\n# Tijdzone instellen\ntimedatectl set-timezone Europe/Amsterdam\n\n# Nieuwe gebruiker aanmaken (niet als root werken)\nadduser gameserver\nusermod -aG sudo gameserver\n```\n\n## UFW Firewall\n```bash\nufw allow ssh\nufw allow 25565/tcp  # Minecraft\nufw enable\nufw status\n```",
        },
        {
          title: "Minecraft Server installeren",
          content: "# Minecraft Server op Linux\n\n## Java installeren\n```bash\napt install -y openjdk-21-jre-headless\njava -version\n```\n\n## Server map aanmaken\n```bash\nmkdir -p /opt/minecraft\ncd /opt/minecraft\n\n# Paper downloaden (aanbevolen)\nwget https://api.papermc.io/v2/projects/paper/versions/1.21.4/builds/latest/downloads/paper-1.21.4.jar -O server.jar\n\n# EULA accepteren\necho 'eula=true' > eula.txt\n```\n\n## server.properties instellen\n```properties\nserver-port=25565\nmax-players=20\ndifficulty=normal\ngamemode=survival\nonline-mode=true\nserver-name=Mijn Server\nmotd=\\u00a76Welkom op mijn server!\n```\n\n## Systemd service aanmaken (auto-start)\n```bash\nnano /etc/systemd/system/minecraft.service\n```\n```ini\n[Unit]\nDescription=Minecraft Server\nAfter=network.target\n\n[Service]\nUser=gameserver\nWorkingDirectory=/opt/minecraft\nExecStart=/usr/bin/java -Xmx2G -Xms1G -jar server.jar nogui\nRestart=on-failure\n\n[Install]\nWantedBy=multi-user.target\n```\n```bash\nsystemctl enable minecraft\nsystemctl start minecraft\nsystemctl status minecraft\n```",
        },
        {
          title: "Server beheren & Backups",
          content: "# Server Beheren en Backups\n\n## Screen / tmux gebruiken\n```bash\n# Screen installeren\napt install screen\n\n# Nieuwe sessie starten\nscreen -S minecraft\n\n# Server starten in screen\njava -Xmx2G -jar server.jar nogui\n\n# Loskoppelen (server blijft draaien)\nCtrl+A, daarna D\n\n# Terugkoppelen\nscreen -r minecraft\n```\n\n## Automatische backups\n```bash\n# Backup script aanmaken\nnano /opt/backup-minecraft.sh\n```\n```bash\n#!/bin/bash\nDATE=$(date +%Y-%m-%d)\nBACKUP_DIR=\"/opt/backups\"\nmkdir -p $BACKUP_DIR\n\n# Server wereld kopiëren\ntar -czf $BACKUP_DIR/minecraft-$DATE.tar.gz /opt/minecraft/world\n\n# Oude backups verwijderen (ouder dan 7 dagen)\nfind $BACKUP_DIR -name '*.tar.gz' -mtime +7 -delete\n\necho \"Backup voltooid: minecraft-$DATE.tar.gz\"\n```\n```bash\nchmod +x /opt/backup-minecraft.sh\n\n# Dagelijks uitvoeren via cron\ncrontab -e\n# Voeg toe:\n0 3 * * * /opt/backup-minecraft.sh\n```",
        },
      ],
    },
    {
      title: "Node.js Webhosting & REST API",
      description: "Bouw en host je eigen webserver met Node.js en Express. Leer REST APIs maken, databases koppelen en deployen op een VPS.",
      category: "webdev",
      level: "INTERMEDIATE" as const,
      lessons: [
        {
          title: "Express Server opzetten",
          content: "# Node.js & Express Server\n\n## Project aanmaken\n```bash\nmkdir mijn-api\ncd mijn-api\nnpm init -y\nnpm install express cors dotenv\n```\n\n## Basis server (`server.js`)\n```javascript\nconst express = require('express');\nconst cors = require('cors');\nrequire('dotenv').config();\n\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\napp.use(cors());\napp.use(express.json());\n\n// Routes\napp.get('/', (req, res) => {\n  res.json({ message: 'API is online!', versie: '1.0.0' });\n});\n\napp.get('/status', (req, res) => {\n  res.json({\n    status: 'online',\n    uptime: process.uptime(),\n    timestamp: new Date().toISOString()\n  });\n});\n\napp.listen(PORT, () => {\n  console.log(`Server draait op poort ${PORT}`);\n});\n```\n\n## `.env` bestand\n```\nPORT=3000\nDB_URL=mongodb://localhost/mijndb\nSECRET_KEY=geheim123\n```",
        },
        {
          title: "REST API bouwen",
          content: "# REST API Endpoints\n\n## CRUD operaties\n```javascript\n// In-memory opslag (gebruik database in productie)\nlet servers = [\n  { id: 1, naam: 'Minecraft SMP', ip: '1.2.3.4', poort: 25565, online: true },\n  { id: 2, naam: 'Survival Games', ip: '1.2.3.5', poort: 25566, online: false },\n];\n\n// GET alle servers\napp.get('/api/servers', (req, res) => {\n  res.json(servers);\n});\n\n// GET één server\napp.get('/api/servers/:id', (req, res) => {\n  const server = servers.find(s => s.id === parseInt(req.params.id));\n  if (!server) return res.status(404).json({ error: 'Niet gevonden' });\n  res.json(server);\n});\n\n// POST nieuwe server\napp.post('/api/servers', (req, res) => {\n  const { naam, ip, poort } = req.body;\n  const nieuw = { id: servers.length + 1, naam, ip, poort, online: false };\n  servers.push(nieuw);\n  res.status(201).json(nieuw);\n});\n\n// DELETE server\napp.delete('/api/servers/:id', (req, res) => {\n  servers = servers.filter(s => s.id !== parseInt(req.params.id));\n  res.json({ success: true });\n});\n```",
        },
        {
          title: "Deployen op VPS met PM2",
          content: "# Deployen op je VPS\n\n## PM2 Process Manager\n```bash\n# PM2 installeren\nnpm install -g pm2\n\n# App starten met PM2\npm2 start server.js --name mijn-api\n\n# Auto-start bij reboot\npm2 startup\npm2 save\n\n# Status bekijken\npm2 status\npm2 logs mijn-api\npm2 restart mijn-api\n```\n\n## Nginx als reverse proxy\n```bash\napt install nginx\nnano /etc/nginx/sites-available/mijn-api\n```\n```nginx\nserver {\n  listen 80;\n  server_name jouwdomein.nl;\n\n  location / {\n    proxy_pass http://localhost:3000;\n    proxy_http_version 1.1;\n    proxy_set_header Host $host;\n    proxy_set_header X-Real-IP $remote_addr;\n  }\n}\n```\n```bash\nln -s /etc/nginx/sites-available/mijn-api /etc/nginx/sites-enabled/\nnginx -t\nsystemctl reload nginx\n```\n\n## HTTPS met Let's Encrypt (gratis)\n```bash\napt install certbot python3-certbot-nginx\ncertbot --nginx -d jouwdomein.nl\n# Automatisch vernieuwen:\ncrontab -e\n# 0 0 * * * certbot renew --quiet\n```",
        },
      ],
    },
    {
      title: "Docker voor Gameservers & Hosting",
      description: "Gebruik Docker om Minecraft servers, Discord bots en webapplicaties te containeriseren. Meerdere servers draaien op één VPS.",
      category: "cloud",
      level: "INTERMEDIATE" as const,
      lessons: [
        {
          title: "Docker Basis voor Servers",
          content: "# Docker voor Hosting\n\n## Docker installeren op Ubuntu\n```bash\ncurl -fsSL https://get.docker.com | sh\nusermod -aG docker $USER\n```\n\n## Minecraft server in Docker\n```bash\ndocker run -d \\\n  --name minecraft \\\n  -p 25565:25565 \\\n  -v /opt/minecraft-data:/data \\\n  -e EULA=TRUE \\\n  -e TYPE=PAPER \\\n  -e VERSION=1.21.4 \\\n  -e MEMORY=2G \\\n  --restart unless-stopped \\\n  itzg/minecraft-server\n```\n\n## Container beheren\n```bash\ndocker ps                    # actieve containers\ndocker logs minecraft        # server logs bekijken\ndocker exec -it minecraft rcon-cli  # server console\ndocker stop minecraft        # server stoppen\ndocker start minecraft       # server starten\n```",
        },
        {
          title: "Docker Compose voor meerdere servers",
          content: "# Docker Compose\n\n## `docker-compose.yml`\n```yaml\nversion: '3.8'\n\nservices:\n  minecraft-smp:\n    image: itzg/minecraft-server\n    ports:\n      - '25565:25565'\n    volumes:\n      - ./smp-data:/data\n    environment:\n      EULA: 'TRUE'\n      TYPE: PAPER\n      VERSION: '1.21.4'\n      MEMORY: 2G\n      SERVER_NAME: 'SMP Server'\n    restart: unless-stopped\n\n  minecraft-skyblock:\n    image: itzg/minecraft-server\n    ports:\n      - '25566:25565'\n    volumes:\n      - ./skyblock-data:/data\n    environment:\n      EULA: 'TRUE'\n      TYPE: PAPER\n      MEMORY: 1G\n    restart: unless-stopped\n\n  discord-bot:\n    build: ./bot\n    environment:\n      TOKEN: ${DISCORD_TOKEN}\n    restart: unless-stopped\n    volumes:\n      - ./bot:/app\n\n  website:\n    image: nginx\n    ports:\n      - '80:80'\n      - '443:443'\n    volumes:\n      - ./website:/usr/share/nginx/html\n    restart: unless-stopped\n```\n\n```bash\n# Alles starten\ndocker compose up -d\n\n# Status\ndocker compose ps\n\n# Logs\ndocker compose logs -f minecraft-smp\n```",
        },
      ],
    },
    {
      title: "Webhosting & cPanel Beheer",
      description: "Leer webhosting instellen, domeinen koppelen, e-mail configureren en websites deployen. Perfect voor iedereen die hosting wil aanbieden.",
      category: "sysadmin",
      level: "BEGINNER" as const,
      lessons: [
        {
          title: "Domeinen & DNS uitgelegd",
          content: "# Domeinen en DNS\n\n## Wat is DNS?\nDNS (Domain Name System) vertaalt domeinnamen naar IP-adressen.\n\n## DNS Records\n| Type  | Functie                          | Voorbeeld                    |\n|-------|----------------------------------|------------------------------|\n| A     | Domein → IPv4                    | `mathhosting.nl → 1.2.3.4`  |\n| AAAA  | Domein → IPv6                    | `mathhosting.nl → ::1`       |\n| CNAME | Alias naar ander domein          | `www → mathhosting.nl`       |\n| MX    | E-mail server                    | `mail.mathhosting.nl`        |\n| TXT   | Verificatie / SPF / DKIM         | `v=spf1 include:...`         |\n| NS    | Nameservers                      | `ns1.mathhosting.nl`         |\n\n## DNS instellen\n```\n# A-record voor website\nmathhosting.nl.    A    1.2.3.4\n\n# WWW\nwww               CNAME  mathhosting.nl.\n\n# E-mail\n@                 MX     10 mail.mathhosting.nl.\n\n# SPF (spam voorkomen)\n@                 TXT    \"v=spf1 ip4:1.2.3.4 ~all\"\n```\n\n## DNS propagatie controleren\n```bash\nnslookup mathhosting.nl\ndig mathhosting.nl A\n```",
        },
        {
          title: "SSL Certificaten & HTTPS",
          content: "# SSL & HTTPS instellen\n\n## Waarom HTTPS?\n- Versleutelde verbinding\n- Vertrouwen van bezoekers\n- Betere Google ranking\n- Verplicht voor wachtwoorden & betalingen\n\n## Let's Encrypt (gratis SSL)\n```bash\n# Certbot installeren\napt install certbot python3-certbot-nginx\n\n# Certificaat aanvragen\ncertbot --nginx -d jouwdomein.nl -d www.jouwdomein.nl\n\n# Auto-vernieuwen instellen\ncrontab -e\n# Toevoegen:\n0 2 * * * certbot renew --quiet && systemctl reload nginx\n```\n\n## Nginx HTTPS configuratie\n```nginx\nserver {\n    listen 80;\n    server_name jouwdomein.nl www.jouwdomein.nl;\n    return 301 https://$server_name$request_uri;\n}\n\nserver {\n    listen 443 ssl;\n    server_name jouwdomein.nl;\n\n    ssl_certificate /etc/letsencrypt/live/jouwdomein.nl/fullchain.pem;\n    ssl_certificate_key /etc/letsencrypt/live/jouwdomein.nl/privkey.pem;\n\n    root /var/www/jouwdomein;\n    index index.html;\n}\n```",
        },
      ],
    },
    {
      title: "HTML & CSS voor Beginners",
      description: "Bouw je eerste website van nul. Leer HTML structuur en CSS styling — geen voorkennis nodig.",
      category: "webdev",
      level: "BEGINNER" as const,
      lessons: [
        {
          title: "Je eerste HTML pagina",
          content: "# HTML Basis\n\nHTML (HyperText Markup Language) is de taal van het web. Elke website is gebouwd met HTML.\n\n## Je eerste pagina\n\nMaak een bestand `index.html` aan:\n\n```html\n<!DOCTYPE html>\n<html lang=\"nl\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Mijn eerste website</title>\n</head>\n<body>\n  <h1>Hallo Wereld!</h1>\n  <p>Dit is mijn eerste website.</p>\n</body>\n</html>\n```\n\nOpen dit bestand in je browser — en je ziet je eerste website!\n\n## Veelgebruikte tags\n\n```html\n<h1> t/m <h6>   Koppen (h1 = groot, h6 = klein)\n<p>             Paragraaf\n<a href=\"...\">  Link\n<img src=\"...\"> Afbeelding\n<ul> / <li>     Lijst\n<div>           Blok-container\n<span>          Inline-container\n<strong>        Vetgedrukt\n<em>            Cursief\n```\n\n## Links en afbeeldingen\n\n```html\n<a href=\"https://mathhosting.nl\">Bezoek MathHosting</a>\n\n<img src=\"logo.png\" alt=\"Logo\" width=\"200\">\n```",
        },
        {
          title: "CSS Styling",
          content: "# CSS Basis\n\nCSS (Cascading Style Sheets) maakt je pagina mooi.\n\n## CSS koppelen\n\n```html\n<link rel=\"stylesheet\" href=\"style.css\">\n```\n\n## `style.css`\n\n```css\n/* Achtergrond en lettertype */\nbody {\n  background-color: #f0f0f0;\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n}\n\n/* Koppen */\nh1 {\n  color: #333333;\n  font-size: 2rem;\n}\n\n/* Paragrafen */\np {\n  color: #666666;\n  line-height: 1.6;\n}\n\n/* Een knop */\n.knop {\n  background-color: #6366f1;\n  color: white;\n  padding: 10px 20px;\n  border: none;\n  border-radius: 8px;\n  cursor: pointer;\n}\n\n.knop:hover {\n  background-color: #4f46e5;\n}\n```\n\n## Selectors\n\n```css\np          { }   /* alle <p> elementen */\n.klasse    { }   /* elementen met class=\"klasse\" */\n#id        { }   /* element met id=\"id\" */\ndiv p      { }   /* <p> binnen een <div> */\n```",
        },
        {
          title: "Flexbox Layout",
          content: "# Layout met Flexbox\n\nMet Flexbox plaats je elementen naast of onder elkaar.\n\n## Basis\n\n```html\n<div class=\"container\">\n  <div class=\"item\">1</div>\n  <div class=\"item\">2</div>\n  <div class=\"item\">3</div>\n</div>\n```\n\n```css\n.container {\n  display: flex;\n  gap: 20px;              /* ruimte tussen items */\n  justify-content: center; /* horizontaal centreren */\n  align-items: center;     /* verticaal centreren */\n  flex-wrap: wrap;         /* doorbreek naar nieuwe regel */\n}\n\n.item {\n  background: #6366f1;\n  color: white;\n  padding: 20px;\n  border-radius: 8px;\n  flex: 1;                 /* items verdelen ruimte gelijk */\n  min-width: 150px;\n}\n```\n\n## Navigatiebalk met Flexbox\n\n```css\nnav {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0 20px;\n  background: #1e1e2e;\n  height: 60px;\n}\n\nnav a {\n  color: white;\n  text-decoration: none;\n  padding: 8px 16px;\n}\n\nnav a:hover {\n  background: rgba(255,255,255,0.1);\n  border-radius: 6px;\n}\n```",
        },
      ],
    },
    {
      title: "JavaScript voor Beginners",
      description: "Leer programmeren met JavaScript — de taal van het web. Van variabelen tot functies en DOM-manipulatie.",
      category: "programming",
      level: "BEGINNER" as const,
      lessons: [
        {
          title: "Variabelen en Datatypes",
          content: "# JavaScript Basis\n\nJavaScript maakt websites interactief. Je kunt het direct in de browser uitvoeren.\n\n## Developer Tools openen\n\nDruk op **F12** in je browser → ga naar **Console** tab.\n\n## Variabelen\n\n```javascript\nlet naam = \"Milan\";          // tekst (string)\nlet leeftijd = 20;            // getal (number)\nlet isStudent = true;         // waar/onwaar (boolean)\nlet server = null;            // leeg\n\nconsole.log(naam);            // Milan\nconsole.log(leeftijd + 5);    // 25\n```\n\n## `let` vs `const`\n\n```javascript\nlet score = 0;       // kan veranderen\nscore = 10;          // OK\n\nconst MAX = 100;     // kan NIET veranderen\nMAX = 200;           // ERROR!\n```\n\n## Strings\n\n```javascript\nlet voornaam = \"Milan\";\nlet achternaam = \"Vos\";\n\n// Samenvoegen\nlet volledig = voornaam + \" \" + achternaam;\n\n// Template literal (makkelijker)\nlet begroeting = `Hallo, ${voornaam}!`;\nconsole.log(begroeting); // Hallo, Milan!\n\nconsole.log(voornaam.length);       // 5\nconsole.log(voornaam.toUpperCase()); // MILAN\n```",
        },
        {
          title: "Functies en Condities",
          content: "# Functies en If/Else\n\n## Functies\n\n```javascript\n// Functie definiëren\nfunction begroet(naam) {\n  return `Hallo, ${naam}!`;\n}\n\n// Functie aanroepen\nlet bericht = begroet(\"Milan\");\nconsole.log(bericht); // Hallo, Milan!\n\n// Arrow function (moderne syntax)\nconst optellen = (a, b) => a + b;\nconsole.log(optellen(3, 4)); // 7\n```\n\n## If / Else\n\n```javascript\nlet punten = 75;\n\nif (punten >= 90) {\n  console.log(\"Uitstekend!\");\n} else if (punten >= 60) {\n  console.log(\"Geslaagd!\");\n} else {\n  console.log(\"Niet geslaagd.\");\n}\n// Output: Geslaagd!\n```\n\n## For Loop\n\n```javascript\n// Tellen van 1 tot 5\nfor (let i = 1; i <= 5; i++) {\n  console.log(`Stap ${i}`);\n}\n\n// Array doorlopen\nconst spelers = [\"Milan\", \"Lisa\", \"Tom\"];\nfor (const speler of spelers) {\n  console.log(`Speler: ${speler}`);\n}\n```",
        },
        {
          title: "DOM Manipulatie",
          content: "# Webpagina aanpassen met JavaScript\n\nDOM (Document Object Model) is de structuur van je HTML pagina. Met JavaScript kun je die aanpassen.\n\n## HTML instellen\n\n```html\n<h1 id=\"titel\">Hallo!</h1>\n<p id=\"tekst\">Klik op de knop.</p>\n<button id=\"knop\">Klik mij</button>\n<ul id=\"lijst\"></ul>\n```\n\n## JavaScript\n\n```javascript\n// Element ophalen\nconst titel = document.getElementById(\"titel\");\nconst knop = document.getElementById(\"knop\");\nconst lijst = document.getElementById(\"lijst\");\n\n// Tekst aanpassen\ntitel.textContent = \"JavaScript werkt!\";\n\n// Klik event\nknop.addEventListener(\"click\", () => {\n  titel.style.color = \"#6366f1\";\n  titel.textContent = \"Je hebt geklikt!\";\n});\n\n// Element toevoegen aan lijst\nconst items = [\"Item 1\", \"Item 2\", \"Item 3\"];\nitems.forEach(item => {\n  const li = document.createElement(\"li\");\n  li.textContent = item;\n  lijst.appendChild(li);\n});\n\n// Klasse toevoegen/verwijderen\ntitel.classList.add(\"actief\");\ntitel.classList.remove(\"actief\");\ntitel.classList.toggle(\"actief\");\n```",
        },
      ],
    },
    {
      title: "Python voor Beginners",
      description: "Begin met Python — een van de makkelijkste en meest gebruikte programmeertalen. Perfect voor automatisering, scripts en data.",
      category: "programming",
      level: "BEGINNER" as const,
      lessons: [
        {
          title: "Python Installeren & Eerste Script",
          content: "# Python Basis\n\nPython is simpel te leren en enorm krachtig. Het wordt gebruikt voor scripts, automatisering, web en AI.\n\n## Installeren\n\nDownload Python op [python.org](https://python.org) → installeer met \"Add to PATH\" aangevinkt.\n\n```bash\npython --version   # controleer installatie\npython             # open interactieve modus\n```\n\n## Je eerste script (`hallo.py`)\n\n```python\nprint(\"Hallo Wereld!\")\nprint(\"Welkom bij MathHosting\")\n\nnaam = input(\"Wat is je naam? \")\nprint(f\"Hoi {naam}, welkom!\")\n```\n\nUitvoeren:\n```bash\npython hallo.py\n```\n\n## Variabelen\n\n```python\nnaam = \"Milan\"          # string\nleeftijd = 20           # integer\nprijs = 9.99            # float\nis_student = True       # boolean\n\nprint(type(naam))       # <class 'str'>\nprint(type(leeftijd))   # <class 'int'>\n```",
        },
        {
          title: "Lijsten en Lussen",
          content: "# Lijsten en Lussen in Python\n\n## Lijsten (Lists)\n\n```python\nservers = [\"mc.server1.nl\", \"mc.server2.nl\", \"mc.server3.nl\"]\n\nprint(servers[0])        # mc.server1.nl\nprint(len(servers))      # 3\n\nservers.append(\"mc.server4.nl\")  # toevoegen\nservers.remove(\"mc.server2.nl\")  # verwijderen\n\nprint(servers)  # ['mc.server1.nl', 'mc.server3.nl', 'mc.server4.nl']\n```\n\n## For Loop\n\n```python\nfor server in servers:\n    print(f\"Server: {server}\")\n\n# Tellen\nfor i in range(1, 6):   # 1 t/m 5\n    print(f\"Stap {i}\")\n```\n\n## If / Else\n\n```python\npunten = 75\n\nif punten >= 90:\n    print(\"Uitstekend!\")\nelif punten >= 60:\n    print(\"Geslaagd!\")\nelse:\n    print(\"Niet geslaagd.\")\n```\n\n## Functies\n\n```python\ndef begroet(naam, rol=\"student\"):\n    return f\"Hallo {naam}, je bent {rol}!\"\n\nprint(begroet(\"Milan\"))\nprint(begroet(\"Lisa\", \"docent\"))\n```",
        },
        {
          title: "Bestanden lezen en schrijven",
          content: "# Bestanden in Python\n\nPython kan bestanden lezen, schrijven en verwerken — handig voor logs, configs en scripts.\n\n## Bestand schrijven\n\n```python\n# Nieuw bestand aanmaken\nwith open(\"servers.txt\", \"w\") as bestand:\n    bestand.write(\"mc.server1.nl\\n\")\n    bestand.write(\"mc.server2.nl\\n\")\n    bestand.write(\"mc.server3.nl\\n\")\n\nprint(\"Bestand aangemaakt!\")\n```\n\n## Bestand lezen\n\n```python\nwith open(\"servers.txt\", \"r\") as bestand:\n    regels = bestand.readlines()\n\nfor regel in regels:\n    print(regel.strip())  # .strip() verwijdert newline\n```\n\n## CSV bestanden\n\n```python\nimport csv\n\n# Schrijven\nwith open(\"spelers.csv\", \"w\", newline=\"\") as f:\n    writer = csv.writer(f)\n    writer.writerow([\"naam\", \"kills\", \"deaths\"])\n    writer.writerow([\"Milan\", 50, 10])\n    writer.writerow([\"Lisa\", 30, 20])\n\n# Lezen\nwith open(\"spelers.csv\", \"r\") as f:\n    reader = csv.DictReader(f)\n    for rij in reader:\n        print(f\"{rij['naam']}: {rij['kills']} kills\")\n```\n\n## JSON\n\n```python\nimport json\n\ndata = {\"server\": \"SMP\", \"spelers\": 20, \"online\": True}\n\n# Opslaan\nwith open(\"config.json\", \"w\") as f:\n    json.dump(data, f, indent=2)\n\n# Laden\nwith open(\"config.json\", \"r\") as f:\n    config = json.load(f)\n    print(config[\"server\"])  # SMP\n```",
        },
      ],
    },
    {
      title: "Git & GitHub voor Beginners",
      description: "Versiebeheeer met Git — leer je code opslaan, samenwerken en deployen via GitHub. Onmisbaar voor elke developer.",
      category: "programming",
      level: "BEGINNER" as const,
      lessons: [
        {
          title: "Git Installeren & Eerste Commit",
          content: "# Git Basis\n\nGit slaat de geschiedenis van je code op. Zo kun je altijd teruggaan naar een werkende versie.\n\n## Installeren\n\nDownload Git op [git-scm.com](https://git-scm.com)\n\n```bash\ngit --version   # controleer installatie\n\n# Jouw naam instellen (eenmalig)\ngit config --global user.name \"Milan Vos\"\ngit config --global user.email \"milan@mathhosting.nl\"\n```\n\n## Project starten\n\n```bash\nmkdir mijn-project\ncd mijn-project\ngit init         # Git starten in deze map\n```\n\n## Eerste commit\n\n```bash\n# Bestand aanmaken\necho \"# Mijn Project\" > README.md\n\n# Bestand toevoegen aan staging\ngit add README.md\n# Of alles toevoegen:\ngit add .\n\n# Commit maken (snapshot van je code)\ngit commit -m \"Eerste commit\"\n\n# Status bekijken\ngit status\n\n# Geschiedenis bekijken\ngit log\n```",
        },
        {
          title: "GitHub & Remote Repository",
          content: "# GitHub gebruiken\n\nGitHub slaat je code online op en maakt samenwerken mogelijk.\n\n## Repository aanmaken\n\n1. Ga naar [github.com](https://github.com)\n2. Klik op **New repository**\n3. Geef het een naam, klik **Create**\n\n## Code pushen naar GitHub\n\n```bash\n# GitHub als remote koppelen\ngit remote add origin https://github.com/jouwgebruiker/mijn-project.git\n\n# Code uploaden\ngit push -u origin main\n\n# Volgende keer simpelweg:\ngit push\n```\n\n## Workflow\n\n```bash\n# Nieuwe wijzigingen opslaan\ngit add .\ngit commit -m \"Beschrijving van wat je hebt gedaan\"\ngit push\n\n# Wijzigingen van GitHub ophalen\ngit pull\n\n# Status bekijken\ngit status\ngit log --oneline\n```\n\n## .gitignore\n\nBestanden die je NIET wilt uploaden:\n\n```gitignore\nnode_modules/\n.env\n*.log\n.DS_Store\ndist/\nbuild/\n```\n\n```bash\ngit add .gitignore\ngit commit -m \"Add gitignore\"\n```",
        },
      ],
    },
    {
      title: "Command Line voor Beginners",
      description: "Leer werken met de terminal/command line op Linux en Windows. De basis voor elke developer en serverbeheerder.",
      category: "sysadmin",
      level: "BEGINNER" as const,
      lessons: [
        {
          title: "Navigeren in de Terminal",
          content: "# Terminal Basis\n\nDe terminal (of command line) is een tekstinterface voor je computer. Als developer gebruik je dit dagelijks.\n\n## Linux/Mac Terminal & Windows PowerShell\n\n```bash\npwd                    # huidige map tonen\nls                     # bestanden tonen\nls -la                 # inclusief verborgen bestanden\ncd Documents           # map ingaan\ncd ..                  # één map terug\ncd ~                   # naar home map\ncd /                   # naar root map\n```\n\n## Windows CMD\n\n```cmd\ncd                     # huidige map tonen\ndir                    # bestanden tonen\ncd Documents           # map ingaan\ncd ..                  # één map terug\n```\n\n## Bestanden en mappen\n\n```bash\nmkdir mijn-map         # map aanmaken\ntouch bestand.txt      # leeg bestand (Linux/Mac)\necho \"tekst\" > bestand.txt  # bestand met inhoud\ncat bestand.txt        # inhoud tonen\ncp bestand.txt kopie.txt    # kopiëren\nmv bestand.txt nieuw.txt    # verplaatsen/hernoemen\nrm bestand.txt         # bestand verwijderen\nrm -r mijn-map         # map verwijderen\n```\n\n## Tip: Tab voor autocomplete!\n\nType de eerste letters van een bestandsnaam en druk op **Tab** — de terminal vult de rest in.",
        },
        {
          title: "Processen en Packages",
          content: "# Processen en Software Installeren\n\n## Software installeren op Linux\n\n```bash\n# Ubuntu/Debian\napt update                    # pakketlijst vernieuwen\napt install nginx             # installeren\napt remove nginx              # verwijderen\napt upgrade                   # alles updaten\n\n# Zoeken\napt search nodejs\n```\n\n## Processen beheren\n\n```bash\nps aux                        # alle processen tonen\ntop                           # live processenlijst (q om te sluiten)\nkill 1234                     # proces stoppen (vervang met PID)\nkill -9 1234                  # forceer stoppen\n\n# Systeemdiensten\nsystemctl status nginx         # status bekijken\nsystemctl start nginx          # starten\nsystemctl stop nginx           # stoppen\nsystemctl restart nginx        # herstarten\nsystemctl enable nginx         # bij opstarten starten\n```\n\n## Handige commando's\n\n```bash\n# Schijfruimte\ndf -h                          # schijfruimte overzicht\ndu -sh /var/www                # map-grootte\n\n# Geheugen\nfree -h                        # RAM overzicht\n\n# Netwerk\nip a                           # IP-adressen tonen\nping google.com                # verbinding testen\nss -tulnp                      # open poorten tonen\n\n# Bestanden zoeken\nfind / -name \"server.jar\"      # bestand zoeken\ngrep -r \"error\" /var/log       # tekst zoeken in bestanden\n```",
        },
      ],
    },
    {
      title: "Pterodactyl Panel Instel",
      description: "Leer hoe je het Pterodactyl gameserver beheerpanel installeert op een Linux VPS. Van dependencies tot Wings daemon en je eerste server.",
      category: "sysadmin",
      level: "INTERMEDIATE" as const,
      lessons: [
        {
          title: "Vereisten & Server Voorbereiding",
          content: "# Pterodactyl — Vereisten & Voorbereiding\n\n## Wat is Pterodactyl?\nPterodactyl is een gratis, open-source gameserver beheerpanel. Je kunt er Minecraft, Rust, Terraria, en tientallen andere servers mee beheren via een webinterface.\n\n## Minimale vereisten\n| Component | Minimum |\n|-----------|----------|\n| OS | Ubuntu 22.04 LTS (aanbevolen) |\n| CPU | 1 vCore |\n| RAM | 1 GB (2 GB+ aanbevolen) |\n| Disk | 10 GB |\n| PHP | 8.3 |\n| Database | MariaDB 10.11+ |\n| Webserver | Nginx |\n| Domein | Vereist voor SSL |\n\n## Server updaten\n```bash\napt update && apt upgrade -y\napt install -y curl wget git tar unzip zip\n```\n\n## PHP 8.3 installeren\n```bash\napt install -y software-properties-common\nadd-apt-repository ppa:ondrej/php -y\napt update\napt install -y php8.3 php8.3-{cli,gd,mysql,pdo,mbstring,tokenizer,bcmath,xml,fpm,curl,zip,intl}\n```\n\nControleer:\n```bash\nphp -v\n# PHP 8.3.x ...\n```\n\n## Composer installeren\n```bash\ncurl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer\ncomposer --version\n```\n\n## MariaDB installeren\n```bash\napt install -y mariadb-server\nsystemctl start mariadb\nsystemctl enable mariadb\n\n# Beveiligen\nmysql_secure_installation\n# → Root wachtwoord instellen\n# → Anonieme gebruikers verwijderen: Y\n# → Root remote login uitschakelen: Y\n# → Test database verwijderen: Y\n```\n\n## Database & gebruiker aanmaken\n```sql\nmysql -u root -p\n\nCREATE USER 'pterodactyl'@'127.0.0.1' IDENTIFIED BY 'SterkWachtwoord123!';\nCREATE DATABASE panel;\nGRANT ALL PRIVILEGES ON panel.* TO 'pterodactyl'@'127.0.0.1' WITH GRANT OPTION;\nFLUSH PRIVILEGES;\nEXIT;\n```\n\n## Nginx installeren\n```bash\napt install -y nginx\nsystemctl start nginx\nsystemctl enable nginx\n```",
        },
        {
          title: "Panel Installeren",
          content: "# Pterodactyl Panel Installeren\n\n## Panel bestanden downloaden\n```bash\nmkdir -p /var/www/pterodactyl\ncd /var/www/pterodactyl\n\ncurl -Lo panel.tar.gz https://github.com/pterodactyl/panel/releases/latest/download/panel.tar.gz\ntar -xzvf panel.tar.gz\nchmod -R 755 storage/* bootstrap/cache/\n```\n\n## Environment instellen\n```bash\ncp .env.example .env\ncomposer install --no-dev --optimize-autoloader\n\nphp artisan key:generate --force\n```\n\n## .env configureren\n```bash\nphp artisan p:environment:setup\n```\n\nVul in:\n- Application URL: `https://jouwdomein.nl`\n- Application timezone: `Europe/Amsterdam`\n- Cache driver: `file`\n- Session driver: `file`\n- Queue driver: `database`\n\n```bash\nphp artisan p:environment:database\n```\n\nVul in:\n- Database host: `127.0.0.1`\n- Database port: `3306`\n- Database name: `panel`\n- Database username: `pterodactyl`\n- Database password: `SterkWachtwoord123!`\n\n## Database migreren\n```bash\nphp artisan migrate --seed --force\n```\n\n## Admin account aanmaken\n```bash\nphp artisan p:user:make\n# Is this user an administrator? [yes/no]: yes\n# E-Mail Address: admin@jouwdomein.nl\n# Username: admin\n# First Name: Admin\n# Last Name: User\n# Password: (kies een sterk wachtwoord)\n```\n\n## Bestandsrechten instellen\n```bash\nchown -R www-data:www-data /var/www/pterodactyl/*\n```\n\n## Cron job instellen\n```bash\ncrontab -e -u www-data\n# Voeg toe:\n* * * * * php /var/www/pterodactyl/artisan schedule:run >> /dev/null 2>&1\n```\n\n## Queue worker service\n```bash\nnano /etc/systemd/system/pteroq.service\n```\n\n```ini\n[Unit]\nDescription=Pterodactyl Queue Worker\nAfter=redis-server.service\n\n[Service]\nUser=www-data\nGroup=www-data\nRestart=always\nExecStart=/usr/bin/php /var/www/pterodactyl/artisan queue:work --queue=high,standard,low --sleep=3 --tries=3\nStartLimitInterval=180\nStartLimitBurst=30\nRestartSec=5s\n\n[Install]\nWantedBy=multi-user.target\n```\n\n```bash\nsystemctl enable --now pteroq.service\n```",
        },
        {
          title: "Nginx & SSL Instellen",
          content: "# Nginx Configuratie & SSL\n\n## SSL certificaat (Let's Encrypt)\n```bash\napt install -y certbot python3-certbot-nginx\ncertbot certonly --nginx -d jouwdomein.nl\n```\n\n> ⚠️ Zorg dat je DNS A-record al naar jouw server-IP wijst vóór dit commando!\n\n## Nginx configuratie\n```bash\nrm /etc/nginx/sites-enabled/default\nnano /etc/nginx/sites-available/pterodactyl.conf\n```\n\nPlak dit (vervang `jouwdomein.nl`):\n\n```nginx\nserver {\n    listen 80;\n    server_name jouwdomein.nl;\n    return 301 https://$server_name$request_uri;\n}\n\nserver {\n    listen 443 ssl http2;\n    server_name jouwdomein.nl;\n\n    root /var/www/pterodactyl/public;\n    index index.php;\n\n    access_log /var/log/nginx/pterodactyl.app-access.log;\n    error_log  /var/log/nginx/pterodactyl.app-error.log error;\n\n    client_max_body_size 100m;\n    client_body_timeout 120s;\n\n    sendfile off;\n\n    ssl_certificate     /etc/letsencrypt/live/jouwdomein.nl/fullchain.pem;\n    ssl_certificate_key /etc/letsencrypt/live/jouwdomein.nl/privkey.pem;\n    ssl_session_cache   shared:SSL:10m;\n    ssl_protocols       TLSv1.2 TLSv1.3;\n    ssl_ciphers         \"ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384\";\n    ssl_prefer_server_ciphers on;\n\n    add_header X-Content-Type-Options nosniff;\n    add_header X-XSS-Protection \"1; mode=block\";\n    add_header X-Robots-Tag none;\n    add_header Content-Security-Policy \"frame-ancestors 'self'\";\n    add_header X-Frame-Options DENY;\n    add_header Referrer-Policy same-origin;\n\n    location / {\n        try_files $uri $uri/ /index.php?$query_string;\n    }\n\n    location ~ \\.php$ {\n        fastcgi_split_path_info ^(.+\\.php)(/.+)$;\n        fastcgi_pass unix:/run/php/php8.3-fpm.sock;\n        fastcgi_index index.php;\n        include fastcgi_params;\n        fastcgi_param PHP_VALUE \"upload_max_filesize = 100M \\n post_max_size=100M\";\n        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;\n        fastcgi_param HTTP_PROXY \"\";\n        fastcgi_intercept_errors off;\n        fastcgi_buffer_size 16k;\n        fastcgi_buffers 4 16k;\n        fastcgi_connect_timeout 300;\n        fastcgi_send_timeout 300;\n        fastcgi_read_timeout 300;\n    }\n\n    location ~ /\\.ht {\n        deny all;\n    }\n}\n```\n\n## Nginx activeren\n```bash\nln -s /etc/nginx/sites-available/pterodactyl.conf /etc/nginx/sites-enabled/\nnginx -t\nsystemctl restart nginx\n```\n\nGa nu naar `https://jouwdomein.nl` — het panel zou zichtbaar moeten zijn!",
        },
        {
          title: "Wings (Daemon) Installeren",
          content: "# Wings Installeren\n\nWings is de daemon die op de game-server draait en servers beheert. Dit kan dezelfde VPS zijn als het panel, of een aparte machine.\n\n## Docker installeren\n```bash\ncurl -sSL https://get.docker.com/ | CHANNEL=stable bash\nsystemctl enable --now docker\n```\n\n## Wings binary downloaden\n```bash\nmkdir -p /etc/pterodactyl\ncurl -L -o /usr/local/bin/wings \\\n  \"https://github.com/pterodactyl/wings/releases/latest/download/wings_linux_amd64\"\nchmod u+x /usr/local/bin/wings\n```\n\n## Node aanmaken in het panel\n\n1. Log in op je panel (`https://jouwdomein.nl`)\n2. Ga naar **Admin** → **Nodes** → **Create New**\n3. Vul in:\n   - **Name**: Mijn Node\n   - **FQDN**: `node.jouwdomein.nl` (of het IP van de Wings server)\n   - **Communicate Over SSL**: Yes (als je SSL hebt op de Wings server)\n   - **Total Memory**: bijv. `4096` MB\n   - **Total Disk Space**: bijv. `50000` MB\n4. Sla op en ga naar het **Configuration** tabblad\n5. Klik **Generate Token** → kopieer het commando\n\n## Wings configureren\nPlak het gekopieerde commando op je Wings-server:\n\n```bash\nwings configure --panel-url https://jouwdomein.nl --token <JOUW_TOKEN> --node <NODE_ID>\n```\n\nDit maakt automatisch `/etc/pterodactyl/config.yml` aan.\n\n## Wings als systemd service\n```bash\nnano /etc/systemd/system/wings.service\n```\n\n```ini\n[Unit]\nDescription=Pterodactyl Wings Daemon\nAfter=docker.service\nRequires=docker.service\nPartOf=docker.service\n\n[Service]\nUser=root\nWorkingDirectory=/etc/pterodactyl\nLimitNOFILE=4096\nPIDFile=/var/run/wings/daemon.pid\nExecStart=/usr/local/bin/wings\nRestart=on-failure\nStartLimitInterval=180\nStartLimitBurst=30\nRestartSec=5s\n\n[Install]\nWantedBy=multi-user.target\n```\n\n```bash\nsystemctl enable --now wings\n\n# Status controleren:\nsystemctl status wings\njournalctl -u wings --follow\n```\n\n## Firewall poorten openen\n```bash\nufw allow 8080/tcp   # Wings HTTP\nufw allow 2022/tcp   # SFTP voor servers\nufw allow 25565/tcp  # Minecraft (of andere game poort)\nufw reload\n```",
        },
        {
          title: "Eerste Server Aanmaken",
          content: "# Je Eerste Server Aanmaken\n\n## Stap 1: Nest & Egg importeren\n\n1. Ga naar **Admin** → **Nests**\n2. Klik **Import Egg**\n3. Download eggs op: [github.com/pterodactyl/eggs](https://github.com/pterodactyl/eggs)\n4. Bijv. voor Minecraft Paper: download `egg-paper.json`\n5. Upload het bestand in het panel\n\n## Stap 2: Allocatie toevoegen aan de node\n\n1. Ga naar **Admin** → **Nodes** → klik je node\n2. Ga naar het **Allocation** tabblad\n3. Voer in:\n   - **IP Address**: het IP van je server (bijv. `0.0.0.0` voor alle interfaces)\n   - **Ports**: `25565` (of een bereik: `25565-25575`)\n4. Klik **Submit**\n\n## Stap 3: Server aanmaken\n\n1. Ga naar **Admin** → **Servers** → **Create New**\n2. Vul in:\n   - **Server Name**: bijv. `Minecraft SMP`\n   - **Server Owner**: kies een gebruiker\n   - **Node**: kies je node\n   - **Default Allocation**: kies een poort (bijv. `25565`)\n3. Onder **Application Feature Limits**:\n   - **Database Limit**: `1`\n   - **Backup Limit**: `3`\n4. Onder **Nest** → kies de juiste nest (bijv. Minecraft)\n5. Onder **Egg** → kies het egg (bijv. Paper)\n6. Stel RAM, CPU en schijfruimte in\n7. Klik **Create Server**\n\n## Stap 4: Server starten\n\n1. Ga naar **Servers** in het gebruikersmenu\n2. Klik op je server\n3. Klik **Start** in de console\n4. De server downloadt automatisch de bestanden en start op",
        },
        {
          title: "Problemen Oplossen",
          content: "# Pterodactyl — Problemen Oplossen\n\n## Wings verbindt niet met het panel\n\n**Symptoom:** `wings` geeft fout: `connection refused` of `certificate error`\n\n```bash\n# Controleer of Wings draait\nsystemctl status wings\n\n# Bekijk logs\njournalctl -u wings -n 50 --no-pager\n```\n\n**Oplossingen:**\n```bash\n# 1. Controleer of poort 8080 open is\ncurl -v http://jouwdomein.nl:8080\n\n# 2. Herstart Wings\nsystemctl restart wings\n\n# 3. Token opnieuw genereren\n# Panel → Nodes → Configuration → Generate Token\n# Dan opnieuw: wings configure --panel-url ... --token ...\n```\n\n## Panel niet bereikbaar (502 Bad Gateway)\n\n```bash\n# PHP-FPM controleren\nsystemctl status php8.3-fpm\nsystemctl restart php8.3-fpm\n\n# Nginx logs\ntail -n 50 /var/log/nginx/pterodactyl.app-error.log\n\n# Rechten herstellen\nchown -R www-data:www-data /var/www/pterodactyl\nchmod -R 755 /var/www/pterodactyl/storage\n```\n\n## SSL certificaat mislukt\n\n```bash\n# Controleer DNS (moet naar jouw server-IP wijzen)\ndig jouwdomein.nl A\nnslookup jouwdomein.nl\n\n# Certbot opnieuw proberen\ncertbot certonly --standalone -d jouwdomein.nl\n# (Stop eerst nginx: systemctl stop nginx)\n\n# Daarna nginx herstarten\nsystemctl start nginx\n```\n\n## Database verbindingsfout\n\n```bash\n# MariaDB status\nsystemctl status mariadb\n\n# Verbinding testen\nmysql -u pterodactyl -p -h 127.0.0.1 panel\n\n# Als wachtwoord vergeten:\nmysql -u root -p\nALTER USER 'pterodactyl'@'127.0.0.1' IDENTIFIED BY 'NieuwWachtwoord!';\nFLUSH PRIVILEGES;\n```\n\n## Server start niet op\n\n```bash\n# Wings logs bekijken\njournalctl -u wings -f\n\n# Docker controleren\ndocker ps -a\ndocker logs <container-id>\n\n# Schijfruimte controleren\ndf -h\n\n# Rechten op server bestanden\nls -la /var/lib/pterodactyl/volumes/\n```\n\n## Queue worker werkt niet (mails/notificaties verstuurd niet)\n\n```bash\nsystemctl status pteroq\nsystemctl restart pteroq\n\n# Handmatig testen\ncd /var/www/pterodactyl\nphp artisan queue:work --once\n```\n\n## Panel updaten\n\n```bash\ncd /var/www/pterodactyl\n\nphp artisan down\ncurl -L https://github.com/pterodactyl/panel/releases/latest/download/panel.tar.gz | tar -xzv\nchmod -R 755 storage/* bootstrap/cache/\ncomposer install --no-dev --optimize-autoloader\nphp artisan view:clear\nphp artisan config:clear\nphp artisan migrate --force\nchown -R www-data:www-data /var/www/pterodactyl/*\nphp artisan queue:restart\nphp artisan up\n```",
        },
      ],
    },
  ];

  let createdCourses = 0;
  let createdLessons = 0;

  for (const courseData of courses) {
    const { lessons, ...courseInfo } = courseData;
    const slug = slugify(courseInfo.title);

    const existing = await prisma.course.findUnique({
      where: { slug },
      include: { _count: { select: { lessons: true } } },
    });

    if (existing && existing._count.lessons > 0) continue;

    const course = existing ?? await prisma.course.create({
      data: { ...courseInfo, slug, published: true },
    });
    if (!existing) createdCourses++;

    for (let i = 0; i < lessons.length; i++) {
      await prisma.lesson.create({
        data: {
          ...lessons[i],
          slug: slugify(lessons[i].title),
          order: i + 1,
          courseId: course.id,
        },
      });
      createdLessons++;
    }
  }

  const adminEmail = "admin@mathhosting.nl";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hashedPassword = await bcrypt.hash("Admin123!", 12);
    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
  }

  await seedBadges();

  return NextResponse.json({
    success: true,
    createdCourses,
    createdLessons,
    adminEmail,
    adminPassword: "Admin123!",
    badges: "seeded",
  });
}
