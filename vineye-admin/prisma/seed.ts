import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // 1. Admin user
  const passwordHash = await hashPassword("admin123456");

  const admin = await prisma.user.upsert({
    where: { email: "admin@vineye.app" },
    update: {},
    create: {
      id: "admin-001",
      name: "Admin VinEye",
      email: "admin@vineye.app",
      role: "ADMIN",
      emailVerified: true,
      xp: 5000,
      level: 10,
    },
  });

  // Create account for Better Auth email/password login
  await prisma.account.upsert({
    where: { id: "account-admin-001" },
    update: {},
    create: {
      id: "account-admin-001",
      accountId: admin.id,
      providerId: "credential",
      userId: admin.id,
      password: passwordHash,
    },
  });

  console.log("  Admin user created: admin@vineye.app / admin123456");

  // 2. Test user
  const userPasswordHash = await hashPassword("user123456");

  const testUser = await prisma.user.upsert({
    where: { email: "jean@vineye.app" },
    update: {},
    create: {
      id: "user-001",
      name: "Jean Dupont",
      email: "jean@vineye.app",
      role: "USER",
      emailVerified: true,
      xp: 1250,
      level: 4,
    },
  });

  await prisma.account.upsert({
    where: { id: "account-user-001" },
    update: {},
    create: {
      id: "account-user-001",
      accountId: testUser.id,
      providerId: "credential",
      userId: testUser.id,
      password: userPasswordHash,
    },
  });

  console.log("  Test user created: jean@vineye.app / user123456");

  // 3. Diseases
  const diseases = [
    {
      slug: "mildiou",
      name: "Mildiou",
      nameEn: "Downy Mildew",
      scientificName: "Plasmopara viticola",
      type: "FUNGAL" as const,
      severity: "HIGH" as const,
      description:
        "Le mildiou est cause par le champignon Plasmopara viticola. Il attaque toutes les parties vertes de la vigne, principalement les feuilles.",
      descriptionEn:
        "Downy mildew is caused by the fungus Plasmopara viticola. It attacks all green parts of the vine, mainly the leaves.",
      symptoms: [
        "Taches jaunes huileuses sur la face superieure des feuilles",
        "Duvet blanc cotonneux sur la face inferieure",
        "Dessechement et chute prematuree des feuilles",
      ],
      symptomsEn: [
        "Oily yellow spots on the upper side of leaves",
        "White cottony fuzz on the underside",
        "Drying and premature leaf drop",
      ],
      treatment:
        "Traitement preventif a base de cuivre (bouillie bordelaise). Appliquer avant les pluies, renouveler tous les 10-14 jours.",
      treatmentEn:
        "Preventive copper-based treatment (Bordeaux mixture). Apply before rain, repeat every 10-14 days.",
      season: "Mai a aout — favorise par la chaleur et l'humidite",
      seasonEn: "May to August — favored by heat and humidity",
      iconName: "droplets",
      iconColor: "#1D9E75",
      bgColor: "#E1F5EE",
    },
    {
      slug: "oidium",
      name: "Oidium",
      nameEn: "Powdery Mildew",
      scientificName: "Erysiphe necator",
      type: "FUNGAL" as const,
      severity: "HIGH" as const,
      description:
        "L'oidium est cause par Erysiphe necator. Il se developpe par temps chaud et sec, contrairement au mildiou.",
      descriptionEn:
        "Powdery mildew is caused by Erysiphe necator. It develops in hot, dry weather, unlike downy mildew.",
      symptoms: [
        "Poudre blanche-grisatre sur feuilles et grappes",
        "Baies qui eclatent ou se dessechent",
      ],
      symptomsEn: [
        "White-grayish powder on leaves and clusters",
        "Berries that crack or dry out",
      ],
      treatment:
        "Soufre en poudrage ou pulverisation. Traitements preventifs des le debourrement.",
      treatmentEn:
        "Sulfur dusting or spraying. Preventive treatments from bud break.",
      season: "Avril a septembre — favorise par temps chaud et sec",
      seasonEn: "April to September — favored by hot and dry weather",
      iconName: "wind",
      iconColor: "#8B5CF6",
      bgColor: "#F3EEFF",
    },
    {
      slug: "black-rot",
      name: "Black rot",
      nameEn: "Black Rot",
      scientificName: "Guignardia bidwellii",
      type: "FUNGAL" as const,
      severity: "HIGH" as const,
      description:
        "Le black rot est cause par Guignardia bidwellii. Il provoque des degats importants sur les baies.",
      descriptionEn:
        "Black rot is caused by Guignardia bidwellii. It causes significant damage to berries.",
      symptoms: [
        "Taches brunes circulaires bordees de noir sur les feuilles",
        "Baies momifiees, noires et ridees",
      ],
      symptomsEn: [
        "Circular brown spots bordered in black on leaves",
        "Mummified, black and wrinkled berries",
      ],
      treatment:
        "Eliminer les baies momifiees. Traitements fongicides preventifs au printemps.",
      treatmentEn:
        "Remove mummified berries. Preventive fungicide treatments in spring.",
      season: "Mai a juillet — favorise par les pluies printanieres",
      seasonEn: "May to July — favored by spring rains",
      iconName: "circle",
      iconColor: "#1A1A1A",
      bgColor: "#F0F0F0",
    },
    {
      slug: "esca",
      name: "Esca",
      nameEn: "Esca Disease",
      scientificName: "Phaeomoniella chlamydospora",
      type: "FUNGAL" as const,
      severity: "MEDIUM" as const,
      description:
        "L'esca est un complexe de maladies du bois cause par plusieurs champignons. Maladie chronique qui peut tuer le cep.",
      descriptionEn:
        "Esca is a complex of wood diseases caused by several fungi. A chronic disease that can kill the vine.",
      symptoms: [
        "Decolorations entre les nervures des feuilles (aspect tigre)",
        "Dessechement brutal du feuillage (apoplexie)",
      ],
      symptomsEn: [
        "Discoloration between leaf veins (tiger stripe pattern)",
        "Sudden foliage desiccation (apoplexy)",
      ],
      treatment:
        "Aucun traitement curatif. Recepage du cep atteint. Proteger les plaies de taille.",
      treatmentEn:
        "No curative treatment. Trunk renewal of affected vines. Protect pruning wounds.",
      season: "Symptomes visibles en ete — juin a septembre",
      seasonEn: "Symptoms visible in summer — June to September",
      iconName: "tree-deciduous",
      iconColor: "#B45309",
      bgColor: "#FEF3C7",
    },
    {
      slug: "botrytis",
      name: "Botrytis",
      nameEn: "Botrytis (Gray Mold)",
      scientificName: "Botrytis cinerea",
      type: "FUNGAL" as const,
      severity: "MEDIUM" as const,
      description:
        "La pourriture grise est causee par Botrytis cinerea. Elle attaque les grappes a maturite.",
      descriptionEn:
        "Gray mold is caused by Botrytis cinerea. It attacks clusters at maturity.",
      symptoms: [
        "Pourriture molle grise sur les baies",
        "Feutrage gris caracteristique sur les grappes",
      ],
      symptomsEn: [
        "Soft gray rot on berries",
        "Characteristic gray felt on clusters",
      ],
      treatment:
        "Favoriser l'aeration des grappes. Effeuillage. Traitements anti-botrytis avant fermeture de la grappe.",
      treatmentEn:
        "Promote cluster ventilation. Leaf removal. Anti-botrytis treatments before cluster closure.",
      season: "Aout a vendanges — favorise par l'humidite",
      seasonEn: "August to harvest — favored by humidity",
      iconName: "cloud-rain",
      iconColor: "#6B7280",
      bgColor: "#F3F4F6",
    },
    {
      slug: "flavescence-doree",
      name: "Flavescence doree",
      nameEn: "Flavescence Doree",
      scientificName: "Phytoplasma vitis",
      type: "BACTERIAL" as const,
      severity: "HIGH" as const,
      description:
        "Maladie a phytoplasme transmise par la cicadelle Scaphoideus titanus. Maladie reglementee, declaration obligatoire.",
      descriptionEn:
        "Phytoplasma disease transmitted by the Scaphoideus titanus leafhopper. Regulated disease, mandatory reporting.",
      symptoms: [
        "Enroulement des feuilles avec coloration jaune ou rouge selon le cepage",
        "Non-aoutement des rameaux (restent caoutchouteux)",
      ],
      symptomsEn: [
        "Leaf curling with yellow or red coloring depending on cultivar",
        "Non-lignification of shoots (remain rubbery)",
      ],
      treatment:
        "Arrachage obligatoire des ceps contamines. Traitement insecticide contre la cicadelle vectrice.",
      treatmentEn:
        "Mandatory uprooting of contaminated vines. Insecticide treatment against the vector leafhopper.",
      season: "Symptomes visibles a partir de juillet",
      seasonEn: "Symptoms visible from July",
      iconName: "bug",
      iconColor: "#DC2626",
      bgColor: "#FEE2E2",
    },
    {
      slug: "chlorose-ferrique",
      name: "Chlorose ferrique",
      nameEn: "Iron Chlorosis",
      scientificName: "",
      type: "ABIOTIC" as const,
      severity: "LOW" as const,
      description:
        "Jaunissement des feuilles du a une carence en fer, souvent lie a un sol trop calcaire.",
      descriptionEn:
        "Yellowing of leaves due to iron deficiency, often linked to overly calcareous soil.",
      symptoms: [
        "Jaunissement entre les nervures, nervures restant vertes",
        "Affaiblissement general de la vigne",
      ],
      symptomsEn: [
        "Yellowing between veins while veins remain green",
        "General weakening of the vine",
      ],
      treatment:
        "Apport de chelates de fer. Choix d'un porte-greffe adapte aux sols calcaires.",
      treatmentEn:
        "Iron chelate application. Choice of rootstock adapted to calcareous soils.",
      season: "Printemps — surtout sur sols calcaires apres de fortes pluies",
      seasonEn:
        "Spring — especially on calcareous soils after heavy rain",
      iconName: "leaf",
      iconColor: "#EAB308",
      bgColor: "#FEF9C3",
    },
  ];

  for (const disease of diseases) {
    await prisma.disease.upsert({
      where: { slug: disease.slug },
      update: disease,
      create: disease,
    });
  }
  console.log(`  ${diseases.length} diseases seeded`);

  // 4. Guides
  const guides = [
    {
      slug: "reconnaitre-feuille-saine",
      title: "Reconnaitre une feuille saine",
      titleEn: "Recognizing a Healthy Leaf",
      subtitle: "Les bases pour identifier une vigne en bonne sante",
      subtitleEn: "Basics for identifying a healthy vine",
      content:
        "Une feuille de vigne saine presente une couleur verte uniforme, sans taches ni decolorations. Les nervures sont nettes et la texture est ferme au toucher. Apprenez a reperer les premiers signes de stress pour agir rapidement.",
      contentEn:
        "A healthy vine leaf shows uniform green color, without spots or discolorations. Veins are clear and the texture is firm to the touch. Learn to spot the first signs of stress to act quickly.",
      category: "diagnostic",
      iconName: "leaf",
      iconColor: "#1D9E75",
      bgColor: "#E1F5EE",
      order: 0,
    },
    {
      slug: "calendrier-traitement",
      title: "Calendrier de traitement",
      titleEn: "Treatment Calendar",
      subtitle: "Quand et comment traiter tout au long de la saison",
      subtitleEn: "When and how to treat throughout the season",
      content:
        "Un calendrier detaille des traitements phytosanitaires pour la vigne, du debourrement aux vendanges. Inclut les periodes cles pour la prevention du mildiou, de l'oidium et du botrytis.",
      contentEn:
        "A detailed calendar of phytosanitary treatments for vines, from bud break to harvest. Includes key periods for prevention of downy mildew, powdery mildew and botrytis.",
      category: "traitement",
      iconName: "calendar",
      iconColor: "#185FA5",
      bgColor: "#E6F1FB",
      order: 1,
    },
    {
      slug: "cepages-bordelais",
      title: "Les cepages bordelais",
      titleEn: "Bordeaux Grape Varieties",
      subtitle: "Guide des principales varietes de la region bordelaise",
      subtitleEn: "Guide to the main varieties of the Bordeaux region",
      content:
        "Decouvrez les principaux cepages bordelais : Merlot, Cabernet Sauvignon, Cabernet Franc, Petit Verdot, Malbec pour les rouges, et Sauvignon Blanc, Semillon, Muscadelle pour les blancs.",
      contentEn:
        "Discover the main Bordeaux grape varieties: Merlot, Cabernet Sauvignon, Cabernet Franc, Petit Verdot, Malbec for reds, and Sauvignon Blanc, Semillon, Muscadelle for whites.",
      category: "cepages",
      iconName: "grape",
      iconColor: "#7C3AED",
      bgColor: "#F3EEFF",
      order: 2,
    },
  ];

  for (const guide of guides) {
    await prisma.guide.upsert({
      where: { slug: guide.slug },
      update: guide,
      create: guide,
    });
  }
  console.log(`  ${guides.length} guides seeded`);

  // 5. Season alerts
  const alerts = [
    {
      title: "Risque mildiou eleve",
      titleEn: "High Downy Mildew Risk",
      message:
        "Les conditions meteo actuelles (chaleur + humidite) sont tres favorables au developpement du mildiou. Surveillez vos vignes et appliquez un traitement preventif si necessaire.",
      messageEn:
        "Current weather conditions (heat + humidity) are very favorable for downy mildew development. Monitor your vines and apply preventive treatment if necessary.",
      type: "WARNING" as const,
      region: "bordeaux",
      active: true,
    },
    {
      title: "Debut de la saison de traitement",
      titleEn: "Start of Treatment Season",
      message:
        "La saison de traitement phytosanitaire debute. Consultez le calendrier de traitement pour planifier vos interventions.",
      messageEn:
        "The phytosanitary treatment season begins. Check the treatment calendar to plan your interventions.",
      type: "INFO" as const,
      region: "bordeaux",
      active: true,
    },
  ];

  for (const alert of alerts) {
    await prisma.seasonAlert.create({ data: alert });
  }
  console.log(`  ${alerts.length} season alerts seeded`);

  // 6. Mock scans
  const allDiseases = await prisma.disease.findMany({ select: { id: true } });
  const now = new Date();

  for (let i = 0; i < 10; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    const randomDisease =
      allDiseases[Math.floor(Math.random() * allDiseases.length)];

    await prisma.scan.create({
      data: {
        userId: i < 7 ? testUser.id : admin.id,
        diseaseId: randomDisease.id,
        confidence: 0.6 + Math.random() * 0.35,
        latitude: 44.8378 + (Math.random() - 0.5) * 0.1,
        longitude: -0.5792 + (Math.random() - 0.5) * 0.1,
        createdAt: date,
      },
    });
  }
  console.log("  10 mock scans seeded");

  console.log("\nSeed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
