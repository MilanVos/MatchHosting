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
      title: "Linux voor Beginners",
      description: "Leer de basis van Linux: bestandssysteem, commando's, permissies en meer. Perfect voor iedereen zonder voorkennis.",
      category: "sysadmin",
      level: "BEGINNER" as const,
      lessons: [
        { title: "Introductie tot Linux", content: "# Introductie tot Linux\n\nLinux is een open-source besturingssysteem dat de basis vormt van veel servers en systemen wereldwijd.\n\n## Wat is Linux?\nLinux is een kernel ontwikkeld door Linus Torvalds in 1991. Het wordt gebruikt in servers, smartphones (Android) en supercomputers.\n\n## Waarom Linux leren?\n- Gratis en open-source\n- Stabiel en veilig\n- Breed ingezet in ICT\n- Essentieel voor systeembeheer" },
        { title: "Basis commando's", content: "# Basis Linux Commando's\n\n## Navigatie\n```bash\npwd    # huidige map\nls     # bestanden weergeven\ncd     # map wisselen\n```\n\n## Bestanden\n```bash\ntouch bestand.txt   # bestand aanmaken\nmkdir map          # map aanmaken\nrm bestand.txt     # bestand verwijderen\ncp bron doel       # kopiëren\nmv oud nieuw       # verplaatsen/hernoemen\n```\n\n## Inhoud bekijken\n```bash\ncat bestand.txt\nless bestand.txt\nhead -n 10 bestand.txt\n```" },
        { title: "Permissies en gebruikers", content: "# Permissies in Linux\n\n## Permissie systeem\nElk bestand heeft 3 soorten permissies:\n- **r** = lezen (read)\n- **w** = schrijven (write)\n- **x** = uitvoeren (execute)\n\nVoor 3 groepen:\n- **u** = gebruiker (user/owner)\n- **g** = groep (group)\n- **o** = anderen (others)\n\n## Permissies aanpassen\n```bash\nchmod 755 bestand.sh\nchmod u+x script.sh\nchown gebruiker:groep bestand\n```\n\n## Gebruikers beheer\n```bash\nwhoami          # wie ben ik?\nsudo commando   # als root uitvoeren\nuseradd naam    # gebruiker aanmaken\npasswd naam     # wachtwoord instellen\n```" },
      ],
    },
    {
      title: "Netwerken Fundamentals",
      description: "Begrijp hoe netwerken werken: TCP/IP, subnetting, DNS, DHCP en firewalls. Essentieel voor elke ICT-professional.",
      category: "networking",
      level: "BEGINNER" as const,
      lessons: [
        { title: "TCP/IP Model", content: "# Het TCP/IP Model\n\n## Wat is TCP/IP?\nTCP/IP is het fundament van het internet. Het bestaat uit 4 lagen:\n\n1. **Applicatielaag** - HTTP, FTP, DNS\n2. **Transportlaag** - TCP, UDP\n3. **Internetlaag** - IP, ICMP\n4. **Netwerklaag** - Ethernet, WiFi\n\n## IP Adressen\nEen IPv4 adres bestaat uit 4 octetten: `192.168.1.1`\n\n- Publiek IP: bereikbaar via internet\n- Privé IP: alleen binnen lokaal netwerk\n\n## Belangrijke poorten\n| Poort | Protocol |\n|-------|----------|\n| 80    | HTTP     |\n| 443   | HTTPS    |\n| 22    | SSH      |\n| 25    | SMTP     |" },
        { title: "Subnetting", content: "# Subnetting\n\n## Wat is een subnet?\nEen subnet deelt een netwerk op in kleinere segmenten.\n\n## Subnet masker\nVoorbeeld: `192.168.1.0/24`\n- `/24` = 255.255.255.0\n- 254 bruikbare hostadressen\n\n## CIDR notatie\n| CIDR | Hosts | Masker          |\n|------|-------|------------------|\n| /24  | 254   | 255.255.255.0   |\n| /25  | 126   | 255.255.255.128 |\n| /26  | 62    | 255.255.255.192 |\n| /30  | 2     | 255.255.255.252 |" },
      ],
    },
    {
      title: "Cybersecurity Basis",
      description: "Leer de fundamenten van cybersecurity: bedreigingen, beveiliging, ethical hacking en best practices voor een veilige omgeving.",
      category: "cybersecurity",
      level: "INTERMEDIATE" as const,
      lessons: [
        { title: "Bedreigingen en aanvallen", content: "# Cybersecurity Bedreigingen\n\n## Soorten aanvallen\n\n### Malware\n- **Virus**: verspreidt via bestanden\n- **Ransomware**: versleutelt bestanden voor losgeld\n- **Spyware**: verzamelt informatie stiekem\n- **Trojan**: vermomt zich als legitiem programma\n\n### Netwerkaanvallen\n- **DDoS**: overbelasten van een server\n- **Man-in-the-Middle**: communicatie onderscheppen\n- **Phishing**: nep e-mails om gegevens te stelen\n- **SQL Injection**: kwaadaardige SQL in formulieren\n\n## CIA Triad\n- **Confidentiality** (Vertrouwelijkheid)\n- **Integrity** (Integriteit)\n- **Availability** (Beschikbaarheid)" },
        { title: "Beveiliging best practices", content: "# Beveiligings Best Practices\n\n## Wachtwoorden\n- Gebruik minimaal 12 tekens\n- Mix van letters, cijfers en symbolen\n- Gebruik een password manager\n- Nooit hetzelfde wachtwoord hergebruiken\n\n## Multi-Factor Authenticatie (MFA)\nVoeg een extra beveiligingslaag toe:\n1. Iets wat je weet (wachtwoord)\n2. Iets wat je hebt (telefoon)\n3. Iets wat je bent (vingerafdruk)\n\n## Systeem beveiliging\n```bash\n# Firewall inschakelen\nufw enable\nufw allow ssh\nufw allow 80/tcp\n\n# Updates installeren\napt update && apt upgrade -y\n```" },
      ],
    },
    {
      title: "Docker & Containers",
      description: "Leer werken met Docker: containers bouwen, beheren en deployen. Van Dockerfile tot Docker Compose en introductie tot Kubernetes.",
      category: "cloud",
      level: "INTERMEDIATE" as const,
      lessons: [
        { title: "Introductie Docker", content: "# Docker Introductie\n\n## Wat is Docker?\nDocker is een platform voor containerisatie. Containers zijn lichte, draagbare eenheden die alles bevatten wat een applicatie nodig heeft.\n\n## Container vs VM\n| Container | Virtuele Machine |\n|-----------|------------------|\n| Deelt OS kernel | Eigen OS |\n| Snel opstarten | Langzaam opstarten |\n| Klein (MB) | Groot (GB) |\n| Minder isolatie | Volledige isolatie |\n\n## Basis commando's\n```bash\ndocker pull ubuntu          # image downloaden\ndocker run ubuntu           # container starten\ndocker ps                  # actieve containers\ndocker images              # beschikbare images\ndocker stop container_id   # container stoppen\n```" },
        { title: "Dockerfile schrijven", content: "# Dockerfile\n\n## Wat is een Dockerfile?\nEen Dockerfile is een tekstbestand met instructies om een Docker image te bouwen.\n\n## Voorbeeld Dockerfile\n```dockerfile\nFROM node:18-alpine\n\nWORKDIR /app\n\nCOPY package*.json ./\nRUN npm install\n\nCOPY . .\n\nEXPOSE 3000\n\nCMD [\"node\", \"server.js\"]\n```\n\n## Image bouwen en uitvoeren\n```bash\ndocker build -t mijn-app .\ndocker run -p 3000:3000 mijn-app\n```\n\n## Docker Compose\n```yaml\nversion: '3'\nservices:\n  web:\n    build: .\n    ports:\n      - '3000:3000'\n  db:\n    image: postgres\n    environment:\n      POSTGRES_PASSWORD: secret\n```" },
      ],
    },
    {
      title: "Web Development met HTML & CSS",
      description: "Bouw je eerste website! Leer HTML voor structuur en CSS voor styling. Aan het einde maak je een volledige responsieve webpagina.",
      category: "webdev",
      level: "BEGINNER" as const,
      lessons: [
        { title: "HTML Fundamentals", content: "# HTML Fundamentals\n\n## Wat is HTML?\nHTML (HyperText Markup Language) is de basis van elke webpagina. Het geeft structuur aan content.\n\n## Basis HTML structuur\n```html\n<!DOCTYPE html>\n<html lang=\"nl\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Mijn Pagina</title>\n</head>\n<body>\n  <h1>Welkom!</h1>\n  <p>Dit is mijn eerste webpagina.</p>\n</body>\n</html>\n```\n\n## Veelgebruikte elementen\n- `<h1>` t/m `<h6>` - Koppen\n- `<p>` - Paragraaf\n- `<a href=\"\">` - Link\n- `<img src=\"\">` - Afbeelding\n- `<ul>/<li>` - Lijst\n- `<div>` - Container" },
        { title: "CSS Styling", content: "# CSS Styling\n\n## Wat is CSS?\nCSS (Cascading Style Sheets) bepaalt het uiterlijk van HTML elementen.\n\n## CSS toevoegen\n```html\n<link rel=\"stylesheet\" href=\"style.css\">\n```\n\n## Basis CSS\n```css\nbody {\n  font-family: Arial, sans-serif;\n  background-color: #f0f0f0;\n}\n\nh1 {\n  color: #333;\n  font-size: 2rem;\n}\n\n.knop {\n  background: #0066cc;\n  color: white;\n  padding: 10px 20px;\n  border-radius: 5px;\n}\n```\n\n## Flexbox Layout\n```css\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 20px;\n}\n```" },
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

  return NextResponse.json({
    success: true,
    createdCourses,
    createdLessons,
    adminEmail,
    adminPassword: "Admin123!",
  });

  await seedBadges();
  return NextResponse.json({ ok: true, courses: createdCourses, lessons: createdLessons, adminEmail, adminPassword: "Admin123!", badges: "seeded" });
}
