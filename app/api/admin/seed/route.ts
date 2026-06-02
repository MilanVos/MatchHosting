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
  ];

  let createdCourses = 0;
  let createdLessons = 0;

  for (const courseData of courses) {
    const { lessons, ...courseInfo } = courseData;
    const slug = slugify(courseInfo.title);

    const existing = await prisma.course.findUnique({ where: { slug } });
    if (existing) continue;

    const course = await prisma.course.create({
      data: { ...courseInfo, slug, published: true },
    });
    createdCourses++;

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
