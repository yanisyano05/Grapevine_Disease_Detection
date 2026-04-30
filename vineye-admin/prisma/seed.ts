import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // ── 1. Users ──
  const passwordHash = await hashPassword("admin123456");
  const admin = await prisma.user.upsert({
    where: { email: "admin@vineye.app" },
    update: {},
    create: { id: "admin-001", name: "Admin VinEye", email: "admin@vineye.app", role: "ADMIN", emailVerified: true, xp: 5000, level: 10 },
  });
  await prisma.account.upsert({
    where: { id: "account-admin-001" },
    update: {},
    create: { id: "account-admin-001", accountId: admin.id, providerId: "credential", userId: admin.id, password: passwordHash },
  });

  const userPasswordHash = await hashPassword("user123456");
  const testUser = await prisma.user.upsert({
    where: { email: "jean@vineye.app" },
    update: {},
    create: { id: "user-001", name: "Jean Dupont", email: "jean@vineye.app", role: "USER", emailVerified: true, xp: 1250, level: 4 },
  });
  await prisma.account.upsert({
    where: { id: "account-user-001" },
    update: {},
    create: { id: "account-user-001", accountId: testUser.id, providerId: "credential", userId: testUser.id, password: userPasswordHash },
  });
  console.log("  Users seeded");

  // ── 2. Diseases (enriched) ──
  const diseases = [
    {
      slug: "mildiou",
      name: "Mildiou", nameEn: "Downy Mildew", scientificName: "Plasmopara viticola",
      type: "FUNGAL" as const, severity: "HIGH" as const,
      description: "Le mildiou est cause par le champignon Plasmopara viticola. Il attaque toutes les parties vertes de la vigne, principalement les feuilles.",
      descriptionEn: "Downy mildew is caused by the fungus Plasmopara viticola. It attacks all green parts of the vine, mainly the leaves.",
      symptoms: ["Taches jaunes huileuses sur la face superieure des feuilles", "Duvet blanc cotonneux sur la face inferieure", "Dessechement et chute prematuree des feuilles"],
      symptomsEn: ["Oily yellow spots on the upper surface of leaves", "White cottony down on the underside", "Drying and premature leaf drop"],
      treatment: "Traitement preventif a base de cuivre (bouillie bordelaise). Appliquer avant les pluies, renouveler tous les 10-14 jours.",
      treatmentEn: "Preventive copper-based treatment (Bordeaux mixture). Apply before rain, renew every 10-14 days.",
      season: "Mai a aout", seasonEn: "May to August",
      iconName: "droplets", iconColor: "#BA7517", bgColor: "#FAEEDA",
      startMonth: 5, endMonth: 8, peakMonth: 6,
      conditions: ["Humidite superieure a 80%", "Temperatures entre 18 et 25°C", "Pluies frequentes au printemps"],
      conditionsEn: ["Humidity above 80%", "Temperatures between 18 and 25°C", "Frequent spring rains"],
      preventiveActions: ["Traitement cuivrique preventif (bouillie bordelaise)", "Aerer la vegetation par ebourgeonnage", "Eviter l'exces d'azote"],
      preventiveActionsEn: ["Preventive copper treatment (Bordeaux mixture)", "Improve air circulation through shoot thinning", "Avoid excess nitrogen"],
      curativeActions: ["Appliquer un fongicide systemique homologue", "Retirer les feuilles tres atteintes"],
      curativeActionsEn: ["Apply a registered systemic fungicide", "Remove severely affected leaves"],
      impactedParts: ["Feuilles", "Grappes", "Rameaux"],
      impactedPartsEn: ["Leaves", "Clusters", "Shoots"],
      spreadMethod: "Spores dispersees par le vent et les eclaboussures de pluie",
      spreadMethodEn: "Spores dispersed by wind and rain splash",
      images: [
        { url: "https://images.unsplash.com/photo-1596142780450-01a1f79c400c?w=800&h=600&fit=crop", alt: "Mildiou feuille", order: 0 },
        { url: "https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=800&h=600&fit=crop", alt: "Mildiou vigne", order: 1 },
      ],
    },
    {
      slug: "oidium",
      name: "Oidium", nameEn: "Powdery Mildew", scientificName: "Erysiphe necator",
      type: "FUNGAL" as const, severity: "HIGH" as const,
      description: "L'oidium est cause par Erysiphe necator. Il se developpe par temps chaud et sec.",
      descriptionEn: "Powdery mildew is caused by Erysiphe necator. It develops in warm, dry weather.",
      symptoms: ["Poudre blanche-grisatre sur feuilles et grappes", "Baies qui eclatent ou se dessechent"],
      symptomsEn: ["White-grey powder on leaves and clusters", "Berries that crack or dry out"],
      treatment: "Soufre en poudrage ou pulverisation. Traitements preventifs des le debourrement.",
      treatmentEn: "Sulfur dusting or spraying. Preventive treatments from bud break.",
      season: "Avril a septembre", seasonEn: "April to September",
      iconName: "wind", iconColor: "#534AB7", bgColor: "#EEEDFE",
      startMonth: 4, endMonth: 9, peakMonth: 7,
      conditions: ["Temps chaud et sec", "Temperatures entre 25 et 30°C", "Forte amplitude thermique jour/nuit"],
      conditionsEn: ["Hot and dry weather", "Temperatures between 25 and 30°C", "High day/night temperature difference"],
      preventiveActions: ["Traitement soufre preventif", "Favoriser l'aeration des grappes", "Effeuillage modere"],
      preventiveActionsEn: ["Preventive sulfur treatment", "Promote cluster ventilation", "Moderate leaf removal"],
      curativeActions: ["Appliquer un fongicide anti-oidium", "Soufre mouillable en curatif"],
      curativeActionsEn: ["Apply an anti-powdery mildew fungicide", "Wettable sulfur as curative treatment"],
      impactedParts: ["Feuilles", "Grappes", "Jeunes pousses"],
      impactedPartsEn: ["Leaves", "Clusters", "Young shoots"],
      spreadMethod: "Spores transportees par le vent",
      spreadMethodEn: "Spores carried by wind",
      images: [
        { url: "https://images.unsplash.com/photo-1507434965515-61970f2bd7c6?w=800&h=600&fit=crop", alt: "Oidium", order: 0 },
        { url: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=600&fit=crop", alt: "Oidium vigne", order: 1 },
      ],
    },
    {
      slug: "black-rot",
      name: "Black rot", nameEn: "Black Rot", scientificName: "Guignardia bidwellii",
      type: "FUNGAL" as const, severity: "HIGH" as const,
      description: "Le black rot est cause par Guignardia bidwellii. Il provoque des degats importants sur les baies.",
      descriptionEn: "Black rot is caused by Guignardia bidwellii. It causes significant damage to berries.",
      symptoms: ["Taches brunes circulaires bordees de noir sur les feuilles", "Baies momifiees, noires et ridees"],
      symptomsEn: ["Circular brown spots bordered with black on leaves", "Mummified, black and wrinkled berries"],
      treatment: "Eliminer les baies momifiees. Traitements fongicides preventifs au printemps.",
      treatmentEn: "Remove mummified berries. Preventive fungicide treatments in spring.",
      season: "Mai a juillet", seasonEn: "May to July",
      iconName: "circle", iconColor: "#5F5E5A", bgColor: "#F1EFE8",
      startMonth: 5, endMonth: 8, peakMonth: 6,
      conditions: ["Pluies au printemps", "Temperatures entre 20 et 30°C", "Presence de baies momifiees de l'annee precedente"],
      conditionsEn: ["Spring rainfall", "Temperatures between 20 and 30°C", "Presence of mummified berries from the previous year"],
      preventiveActions: ["Eliminer les momies en hiver", "Traitements fongicides preventifs des la floraison", "Maintenir une bonne aeration"],
      preventiveActionsEn: ["Remove mummies in winter", "Preventive fungicide treatments from flowering", "Maintain good air circulation"],
      curativeActions: ["Pas de traitement curatif efficace", "Retirer et detruire les organes atteints"],
      curativeActionsEn: ["No effective curative treatment", "Remove and destroy affected organs"],
      impactedParts: ["Feuilles", "Grappes", "Vrilles"],
      impactedPartsEn: ["Leaves", "Clusters", "Tendrils"],
      spreadMethod: "Spores liberees par les momies sous l'effet de la pluie",
      spreadMethodEn: "Spores released from mummies by rain",
      images: [
        { url: "https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=800&h=600&fit=crop", alt: "Black rot", order: 0 },
        { url: "https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=800&h=600&fit=crop", alt: "Black rot vigne", order: 1 },
      ],
    },
    {
      slug: "esca",
      name: "Esca", nameEn: "Esca Disease", scientificName: "Phaeomoniella chlamydospora",
      type: "FUNGAL" as const, severity: "MEDIUM" as const,
      description: "L'esca est un complexe de maladies du bois cause par plusieurs champignons.",
      descriptionEn: "Esca is a complex of wood diseases caused by several fungi.",
      symptoms: ["Decolorations entre les nervures des feuilles (aspect tigre)", "Dessechement brutal du feuillage (apoplexie)"],
      symptomsEn: ["Discoloration between leaf veins (tiger stripe pattern)", "Sudden drying of foliage (apoplexy)"],
      treatment: "Aucun traitement curatif. Recepage du cep atteint. Proteger les plaies de taille.",
      treatmentEn: "No curative treatment. Cutting back affected vine. Protect pruning wounds.",
      season: "Juin a septembre", seasonEn: "June to September",
      iconName: "tree-deciduous", iconColor: "#993C1D", bgColor: "#FAECE7",
      startMonth: 6, endMonth: 9, peakMonth: 7,
      conditions: ["Vignes agees (plus de 10 ans)", "Stress hydrique", "Plaies de taille mal cicatrisees"],
      conditionsEn: ["Old vines (over 10 years)", "Water stress", "Poorly healed pruning wounds"],
      preventiveActions: ["Proteger les plaies de taille avec un mastic", "Tailler tard en saison", "Eviter les grosses coupes"],
      preventiveActionsEn: ["Protect pruning wounds with sealant paste", "Prune late in the season", "Avoid large cuts"],
      curativeActions: ["Aucun traitement curatif homologue", "Curetage du bois (experimental)", "Recepage si le cep n'est pas trop atteint"],
      curativeActionsEn: ["No registered curative treatment", "Wood curettage (experimental)", "Trunk renewal if not too affected"],
      impactedParts: ["Feuilles", "Bois (tronc, bras)", "Grappes (apoplexie)"],
      impactedPartsEn: ["Leaves", "Wood (trunk, arms)", "Clusters (apoplexy)"],
      spreadMethod: "Champignons penetrent par les plaies de taille",
      spreadMethodEn: "Fungi enter through pruning wounds",
      images: [
        { url: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&h=600&fit=crop", alt: "Esca", order: 0 },
        { url: "https://images.unsplash.com/photo-1573062337052-54e2d025e7a1?w=800&h=600&fit=crop", alt: "Esca vigne", order: 1 },
      ],
    },
    {
      slug: "botrytis",
      name: "Botrytis", nameEn: "Botrytis (Grey Mold)", scientificName: "Botrytis cinerea",
      type: "FUNGAL" as const, severity: "MEDIUM" as const,
      description: "La pourriture grise est causee par Botrytis cinerea. Elle attaque les grappes a maturite.",
      descriptionEn: "Grey mold is caused by Botrytis cinerea. It attacks clusters at maturity.",
      symptoms: ["Pourriture molle grise sur les baies", "Feutrage gris caracteristique sur les grappes"],
      symptomsEn: ["Soft grey rot on berries", "Characteristic grey felt on clusters"],
      treatment: "Favoriser l'aeration des grappes. Effeuillage. Traitements anti-botrytis.",
      treatmentEn: "Promote cluster aeration. Leaf removal. Anti-botrytis treatments.",
      season: "Aout a vendanges", seasonEn: "August to harvest",
      iconName: "cloud-rain", iconColor: "#185FA5", bgColor: "#E6F1FB",
      startMonth: 7, endMonth: 10, peakMonth: 9,
      conditions: ["Humidite elevee prolongee", "Temperatures entre 15 et 25°C", "Grappes compactes et serrees"],
      conditionsEn: ["Prolonged high humidity", "Temperatures between 15 and 25°C", "Compact, tight clusters"],
      preventiveActions: ["Effeuillage autour des grappes", "Choisir des cepages a grappes laches", "Limiter la vigueur"],
      preventiveActionsEn: ["Leaf removal around clusters", "Choose varieties with loose clusters", "Limit vine vigor"],
      curativeActions: ["Appliquer un anti-botrytis homologue", "Vendanger les parties atteintes rapidement"],
      curativeActionsEn: ["Apply a registered anti-botrytis product", "Harvest affected parts quickly"],
      impactedParts: ["Grappes (baies)", "Feuilles (rare)"],
      impactedPartsEn: ["Clusters (berries)", "Leaves (rare)"],
      spreadMethod: "Spores aeriennes, favorisees par les blessures sur baies",
      spreadMethodEn: "Airborne spores, favored by berry wounds",
      images: [
        { url: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800&h=600&fit=crop", alt: "Botrytis", order: 0 },
        { url: "https://images.unsplash.com/photo-1508472697919-afcacb6e1bcc?w=800&h=600&fit=crop", alt: "Botrytis raisin", order: 1 },
      ],
    },
    {
      slug: "flavescence-doree",
      name: "Flavescence doree", nameEn: "Flavescence Doree", scientificName: "Phytoplasma vitis",
      type: "BACTERIAL" as const, severity: "HIGH" as const,
      description: "Maladie a phytoplasme transmise par la cicadelle Scaphoideus titanus. Declaration obligatoire.",
      descriptionEn: "Phytoplasma disease transmitted by the leafhopper Scaphoideus titanus. Mandatory reporting.",
      symptoms: ["Enroulement des feuilles avec coloration jaune ou rouge", "Non-aoutement des rameaux"],
      symptomsEn: ["Leaf rolling with yellow or red coloration", "Non-lignification of shoots"],
      treatment: "Arrachage obligatoire des ceps contamines. Traitement insecticide contre la cicadelle.",
      treatmentEn: "Mandatory uprooting of contaminated vines. Insecticide treatment against the vector.",
      season: "Juillet a octobre", seasonEn: "July to October",
      iconName: "bug", iconColor: "#A32D2D", bgColor: "#FCEBEB",
      startMonth: 6, endMonth: 10, peakMonth: 8,
      conditions: ["Presence de la cicadelle Scaphoideus titanus", "Vignobles non traites contre le vecteur", "Zones contaminees a proximite"],
      conditionsEn: ["Presence of leafhopper Scaphoideus titanus", "Vineyards not treated against the vector", "Contaminated areas nearby"],
      preventiveActions: ["Traitement insecticide obligatoire contre la cicadelle", "Prospection et arrachage des ceps atteints", "Materiel vegetal certifie"],
      preventiveActionsEn: ["Mandatory insecticide treatment against the leafhopper", "Prospection and uprooting of affected vines", "Use certified plant material"],
      curativeActions: ["Aucun traitement curatif", "Arrachage obligatoire des ceps contamines"],
      curativeActionsEn: ["No curative treatment", "Mandatory uprooting of contaminated vines"],
      impactedParts: ["Feuilles (enroulement)", "Rameaux (aoutement absent)", "Grappes (dessechement)"],
      impactedPartsEn: ["Leaves (rolling)", "Shoots (absent lignification)", "Clusters (desiccation)"],
      spreadMethod: "Transmis par la cicadelle Scaphoideus titanus",
      spreadMethodEn: "Transmitted by the leafhopper Scaphoideus titanus",
      images: [
        { url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop", alt: "Flavescence doree", order: 0 },
        { url: "https://images.unsplash.com/photo-1566903451935-7bc0ddd0e8e6?w=800&h=600&fit=crop", alt: "Flavescence vigne", order: 1 },
      ],
    },
    {
      slug: "leaf-blight",
      name: "Brulure des feuilles", nameEn: "Leaf Blight", scientificName: "Pseudocercospora vitis (Isariopsis Leaf Spot)",
      type: "FUNGAL" as const, severity: "MEDIUM" as const,
      description: "La brulure des feuilles (Isariopsis Leaf Spot) est causee par le champignon Pseudocercospora vitis. Elle provoque des taches angulaires brun-rougeatre delimitees par les nervures.",
      descriptionEn: "Leaf blight (Isariopsis Leaf Spot) is caused by the fungus Pseudocercospora vitis. It produces angular reddish-brown spots delimited by leaf veins.",
      symptoms: ["Taches angulaires brun-rougeatre delimitees par les nervures", "Halo jaune autour des taches", "Defoliation precoce en cas d'attaque severe"],
      symptomsEn: ["Angular reddish-brown spots delimited by veins", "Yellow halo around spots", "Early defoliation in severe attacks"],
      treatment: "Traitement fongicide preventif a base de cuivre ou mancozebe. Eliminer les feuilles tombees a l'automne.",
      treatmentEn: "Preventive copper or mancozeb-based fungicide treatment. Remove fallen leaves in autumn.",
      season: "Juillet a septembre", seasonEn: "July to September",
      iconName: "leaf", iconColor: "#A0522D", bgColor: "#F5E6D8",
      startMonth: 6, endMonth: 9, peakMonth: 8,
      conditions: ["Humidite elevee prolongee", "Temperatures entre 20 et 28°C", "Vignes affaiblies ou stressees"],
      conditionsEn: ["Prolonged high humidity", "Temperatures between 20 and 28°C", "Weakened or stressed vines"],
      preventiveActions: ["Traitement cuivrique preventif", "Eliminer les feuilles infectees a l'automne", "Maintenir une bonne aeration du feuillage"],
      preventiveActionsEn: ["Preventive copper treatment", "Remove infected leaves in autumn", "Maintain good foliage ventilation"],
      curativeActions: ["Appliquer un fongicide a base de mancozebe", "Retirer les feuilles severement atteintes"],
      curativeActionsEn: ["Apply a mancozeb-based fungicide", "Remove severely affected leaves"],
      impactedParts: ["Feuilles", "Rameaux (rare)"],
      impactedPartsEn: ["Leaves", "Shoots (rare)"],
      spreadMethod: "Spores disseminees par la pluie et le vent",
      spreadMethodEn: "Spores spread by rain and wind",
      images: [
        { url: "https://images.unsplash.com/photo-1507434965515-61970f2bd7c6?w=800&h=600&fit=crop", alt: "Leaf blight", order: 0 },
      ],
    },
    {
      slug: "chlorose-ferrique",
      name: "Chlorose ferrique", nameEn: "Iron Chlorosis", scientificName: "",
      type: "ABIOTIC" as const, severity: "LOW" as const,
      description: "Jaunissement des feuilles du a une carence en fer, souvent lie a un sol trop calcaire.",
      descriptionEn: "Leaf yellowing due to iron deficiency, often linked to overly calcareous soil.",
      symptoms: ["Jaunissement entre les nervures, nervures restant vertes", "Affaiblissement general de la vigne"],
      symptomsEn: ["Yellowing between veins, veins remaining green", "General weakening of the vine"],
      treatment: "Apport de chelates de fer. Choix d'un porte-greffe adapte aux sols calcaires.",
      treatmentEn: "Iron chelate application. Choose rootstock adapted to calcareous soils.",
      season: "Printemps", seasonEn: "Spring",
      iconName: "leaf", iconColor: "#639922", bgColor: "#EAF3DE",
      startMonth: 4, endMonth: 7, peakMonth: 5,
      conditions: ["Sol calcaire actif", "Sol compacte ou asphyxiant", "Exces d'eau au printemps"],
      conditionsEn: ["Active calcareous soil", "Compacted or waterlogged soil", "Excess water in spring"],
      preventiveActions: ["Choisir un porte-greffe adapte aux sols calcaires", "Ameliorer le drainage", "Apport de matiere organique"],
      preventiveActionsEn: ["Choose rootstock adapted to calcareous soils", "Improve drainage", "Add organic matter"],
      curativeActions: ["Pulverisation foliaire de chelate de fer", "Traitement au sulfate de fer"],
      curativeActionsEn: ["Foliar spray of iron chelate", "Iron sulfate treatment"],
      impactedParts: ["Feuilles (jaunissement internervaire)"],
      impactedPartsEn: ["Leaves (interveinal yellowing)"],
      spreadMethod: "Non contagieux — carence nutritionnelle liee au sol",
      spreadMethodEn: "Not contagious — nutritional deficiency linked to soil",
      images: [
        { url: "https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?w=800&h=600&fit=crop", alt: "Chlorose", order: 0 },
        { url: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=800&h=600&fit=crop", alt: "Chlorose vigne", order: 1 },
      ],
    },
  ];

  for (const { images, ...diseaseData } of diseases) {
    const disease = await prisma.disease.upsert({
      where: { slug: diseaseData.slug },
      update: diseaseData,
      create: diseaseData,
    });
    // Delete old images and re-create
    await prisma.diseaseImage.deleteMany({ where: { diseaseId: disease.id } });
    for (const img of images) {
      await prisma.diseaseImage.create({ data: { ...img, diseaseId: disease.id } });
    }
  }
  console.log(`  ${diseases.length} diseases seeded (enriched)`);

  // ── 3. Guides (enriched with sections) ──
  const guides = [
    {
      slug: "reconnaitre-feuille-saine",
      title: "Reconnaitre une feuille saine", titleEn: "Recognizing a Healthy Leaf",
      subtitle: "Les bases pour identifier une vigne en bonne sante", subtitleEn: "Basics for identifying a healthy vine",
      content: "Guide complet pour reconnaitre une feuille de vigne saine.", contentEn: "Complete guide to recognizing a healthy vine leaf.",
      category: "diagnostic", iconName: "leaf", iconColor: "#1D9E75", bgColor: "#E1F5EE", order: 0,
      readTime: 5, coverImage: "https://images.unsplash.com/photo-1596142780450-01a1f79c400c?w=800&h=600&fit=crop",
      sections: [
        { title: "Couleur et texture", titleEn: "Color and texture", body: "Une feuille de vigne saine presente un vert uniforme, vif et brillant. La texture est lisse sur la face superieure et legerement duveteuse dessous. Les nervures sont nettes, bien dessinees.", bodyEn: "A healthy vine leaf shows a uniform, vibrant and bright green. The upper surface is smooth while the underside is slightly downy.", tip: "Une feuille saine n'a jamais de taches brunes, jaunes ou poudreuses.", tipEn: "A healthy leaf never has brown, yellow or powdery spots.", image: "https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=800&h=600&fit=crop", order: 0 },
        { title: "Forme et symetrie", titleEn: "Shape and symmetry", body: "La forme de la feuille varie selon le cepage : 3 lobes (Merlot), 5 lobes (Cabernet Sauvignon) ou presque entiere (Gamay). Une feuille saine est symetrique, avec des bords dentes reguliers.", bodyEn: "Leaf shape varies by variety: 3 lobes (Merlot), 5 lobes (Cabernet Sauvignon) or nearly entire (Gamay). A healthy leaf is symmetrical with regular serrated edges.", order: 1 },
        { title: "Quand s'inquieter", titleEn: "When to worry", body: "Surveillez ces premiers signes : decoloration entre les nervures, taches huileuses translucides, poudre blanche, enroulement des bords vers le bas, necroses brunes.", bodyEn: "Watch for these early signs: discoloration between veins, translucent oily spots, white powder, downward leaf edge rolling, brown necrosis.", tip: "Photographiez la feuille suspecte avec VinEye des les premiers symptomes.", tipEn: "Photograph the suspicious leaf with VinEye at the first symptoms.", order: 2 },
      ],
    },
    {
      slug: "calendrier-traitement",
      title: "Calendrier de traitement", titleEn: "Treatment Calendar",
      subtitle: "Quand et comment traiter tout au long de la saison", subtitleEn: "When and how to treat throughout the season",
      content: "Calendrier detaille des traitements phytosanitaires pour la vigne.", contentEn: "Detailed calendar of phytosanitary treatments for vines.",
      category: "traitement", iconName: "calendar", iconColor: "#185FA5", bgColor: "#E6F1FB", order: 1,
      readTime: 8, coverImage: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=600&fit=crop",
      sections: [
        { title: "Hiver (decembre-fevrier)", titleEn: "Winter (December-February)", body: "Periode de repos vegetatif. Taillez la vigne, retirez et brulez les bois morts. Appliquez un traitement d'hiver a base d'huile blanche.", bodyEn: "Dormant period. Prune the vine, remove and burn dead wood. Apply a winter treatment with dormant oil.", order: 0 },
        { title: "Printemps (mars-mai)", titleEn: "Spring (March-May)", body: "Le debourrement marque le debut de la saison. Des le stade 2-3 feuilles etalees, commencez les traitements preventifs : bouillie bordelaise contre le mildiou, soufre contre l'oidium.", bodyEn: "Bud break marks the beginning of the season. From the 2-3 unfolded leaves stage, begin preventive treatments.", tip: "Le premier traitement preventif doit intervenir au stade 2-3 feuilles etalees.", tipEn: "The first preventive treatment must be applied at the 2-3 unfolded leaves stage.", order: 1 },
        { title: "Ete (juin-aout)", titleEn: "Summer (June-August)", body: "Surveillance active. Le mildiou est a son pic en juin, l'oidium en juillet. Adaptez vos traitements a la meteo. Pratiquez l'effeuillage.", bodyEn: "Active monitoring period. Downy mildew peaks in June, powdery mildew in July. Adapt treatments to weather.", tip: "Apres chaque pluie de plus de 10mm, inspectez vos vignes dans les 48h.", tipEn: "After each rainfall over 10mm, inspect your vines within 48 hours.", order: 2 },
        { title: "Automne (septembre-novembre)", titleEn: "Autumn (September-November)", body: "Vendanges et derniers traitements. Surveillez le botrytis sur les grappes mures. Un dernier traitement cuivrique peut proteger le feuillage restant.", bodyEn: "Harvest time and final treatments. Watch for botrytis on ripe clusters.", order: 3 },
      ],
    },
    {
      slug: "cepages-bordelais",
      title: "Les cepages bordelais", titleEn: "Bordeaux Grape Varieties",
      subtitle: "Guide des principales varietes de la region bordelaise", subtitleEn: "Guide to the main varieties of the Bordeaux region",
      content: "Decouvrez les principaux cepages bordelais.", contentEn: "Discover the main Bordeaux grape varieties.",
      category: "cepages", iconName: "grape", iconColor: "#534AB7", bgColor: "#EEEDFE", order: 2,
      readTime: 6, coverImage: "https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=800&h=600&fit=crop",
      sections: [
        { title: "Les rouges emblematiques", titleEn: "Iconic red varieties", body: "Le Merlot est le cepage rouge le plus plante a Bordeaux. Le Cabernet Sauvignon regne sur la rive gauche. Le Cabernet Franc complete l'assemblage.", bodyEn: "Merlot is the most planted red grape in Bordeaux. Cabernet Sauvignon reigns on the left bank. Cabernet Franc completes the blend.", order: 0 },
        { title: "Les blancs", titleEn: "White varieties", body: "Le Sauvignon Blanc apporte fraicheur et aromes d'agrumes. Le Semillon est le grand cepage des liquoreux de Sauternes. La Muscadelle complete avec ses notes florales.", bodyEn: "Sauvignon Blanc brings freshness and citrus aromas. Semillon is the great variety of Sauternes sweet wines.", order: 1 },
        { title: "Choisir son cepage", titleEn: "Choosing your variety", body: "Le choix du cepage depend du terroir : le Merlot prefere les sols argileux, le Cabernet Sauvignon les sols de graves bien draines.", bodyEn: "The choice depends on the terroir: Merlot prefers clay soils, Cabernet Sauvignon well-drained gravel soils.", tip: "Le Merlot est plus tolerant aux sols argileux, le Cabernet Sauvignon prefere les graves.", tipEn: "Merlot is more tolerant of clay soils, Cabernet Sauvignon prefers gravel.", order: 2 },
      ],
    },
  ];

  for (const { sections, ...guideData } of guides) {
    const guide = await prisma.guide.upsert({
      where: { slug: guideData.slug },
      update: guideData,
      create: guideData,
    });
    // Delete old sections and re-create
    await prisma.guideSection.deleteMany({ where: { guideId: guide.id } });
    for (const section of sections) {
      await prisma.guideSection.create({ data: { ...section, guideId: guide.id } });
    }
  }
  console.log(`  ${guides.length} guides seeded (with sections)`);

  // ── 4. Season alerts ──
  await prisma.seasonAlert.deleteMany();
  const alerts = [
    { title: "Risque mildiou eleve", titleEn: "High Downy Mildew Risk", message: "Les conditions meteo actuelles sont tres favorables au mildiou.", messageEn: "Current weather conditions are very favorable for downy mildew.", type: "WARNING" as const, region: "bordeaux", active: true },
    { title: "Debut de la saison de traitement", titleEn: "Start of Treatment Season", message: "La saison de traitement phytosanitaire debute.", messageEn: "The phytosanitary treatment season begins.", type: "INFO" as const, region: "bordeaux", active: true },
  ];
  for (const alert of alerts) {
    await prisma.seasonAlert.create({ data: alert });
  }
  console.log(`  ${alerts.length} alerts seeded`);

  // ── 5. Mock scans ──
  await prisma.scan.deleteMany();
  const allDiseases = await prisma.disease.findMany({ select: { id: true } });
  const now = new Date();
  for (let i = 0; i < 10; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    await prisma.scan.create({
      data: {
        userId: i < 7 ? testUser.id : admin.id,
        diseaseId: allDiseases[Math.floor(Math.random() * allDiseases.length)].id,
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
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
