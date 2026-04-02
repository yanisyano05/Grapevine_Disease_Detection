export interface Ceepage {
  id: string;
  name: { fr: string; en: string };
  origin: { fr: string; en: string };
  color: 'rouge' | 'blanc' | 'rosé';
  characteristics: { fr: string; en: string };
  regions: string[];
  imageUrl?: string;
}

export const cepages: Ceepage[] = [
  {
    id: 'cabernet_sauvignon',
    name: { fr: 'Cabernet Sauvignon', en: 'Cabernet Sauvignon' },
    origin: { fr: 'Bordeaux, France', en: 'Bordeaux, France' },
    color: 'rouge',
    characteristics: {
      fr: 'Tanins élevés, arômes de cassis, cèdre et poivron vert. Vieillissement excellent.',
      en: 'High tannins, aromas of blackcurrant, cedar and green pepper. Excellent ageing potential.',
    },
    regions: ['Bordeaux', 'Napa Valley', 'Coonawarra', 'Maipo Valley'],
  },
  {
    id: 'merlot',
    name: { fr: 'Merlot', en: 'Merlot' },
    origin: { fr: 'Bordeaux, France', en: 'Bordeaux, France' },
    color: 'rouge',
    characteristics: {
      fr: 'Souple et fruité, arômes de prune, chocolat et épices douces. Tanins soyeux.',
      en: 'Soft and fruity, aromas of plum, chocolate and soft spices. Silky tannins.',
    },
    regions: ['Saint-Émilion', 'Pomerol', 'California', 'Washington State'],
  },
  {
    id: 'pinot_noir',
    name: { fr: 'Pinot Noir', en: 'Pinot Noir' },
    origin: { fr: 'Bourgogne, France', en: 'Burgundy, France' },
    color: 'rouge',
    characteristics: {
      fr: 'Délicat et élégant, arômes de cerise, framboise et sous-bois. Tanins fins.',
      en: 'Delicate and elegant, aromas of cherry, raspberry and forest floor. Fine tannins.',
    },
    regions: ['Bourgogne', 'Oregon', 'Nouvelle-Zélande', 'Alsace'],
  },
  {
    id: 'syrah',
    name: { fr: 'Syrah / Shiraz', en: 'Syrah / Shiraz' },
    origin: { fr: 'Vallée du Rhône, France', en: 'Rhône Valley, France' },
    color: 'rouge',
    characteristics: {
      fr: 'Puissant et épicé, arômes de mûre, poivre noir et olive. Couleur intense.',
      en: 'Powerful and spicy, aromas of blackberry, black pepper and olive. Intense color.',
    },
    regions: ['Côtes du Rhône', 'Barossa Valley', 'McLaren Vale', 'Colchagua'],
  },
  {
    id: 'chardonnay',
    name: { fr: 'Chardonnay', en: 'Chardonnay' },
    origin: { fr: 'Bourgogne, France', en: 'Burgundy, France' },
    color: 'blanc',
    characteristics: {
      fr: "Polyvalent, arômes de pomme, vanille et beurre selon l'élevage. Très expressif.",
      en: 'Versatile, aromas of apple, vanilla and butter depending on ageing. Very expressive.',
    },
    regions: ['Chablis', 'Meursault', 'Napa Valley', 'Mâconnais'],
  },
  {
    id: 'sauvignon_blanc',
    name: { fr: 'Sauvignon Blanc', en: 'Sauvignon Blanc' },
    origin: { fr: 'Loire, France', en: 'Loire Valley, France' },
    color: 'blanc',
    characteristics: {
      fr: 'Vif et aromatique, arômes de citron vert, groseille et herbe coupée. Acidité marquée.',
      en: 'Crisp and aromatic, aromas of lime, gooseberry and cut grass. Marked acidity.',
    },
    regions: ['Sancerre', 'Pouilly-Fumé', 'Marlborough', 'Bordeaux'],
  },
  {
    id: 'riesling',
    name: { fr: 'Riesling', en: 'Riesling' },
    origin: { fr: 'Alsace / Rhénanie, France-Allemagne', en: 'Alsace / Rhine, France-Germany' },
    color: 'blanc',
    characteristics: {
      fr: 'Aromatique et minéral, arômes de pêche, citron et pétrole. Acidité élevée, vieillissement exceptionnel.',
      en: 'Aromatic and mineral, aromas of peach, citrus and petrol. High acidity, exceptional ageing.',
    },
    regions: ['Alsace', 'Mosel', 'Clare Valley', 'Rheingau'],
  },
  {
    id: 'grenache',
    name: { fr: 'Grenache', en: 'Grenache' },
    origin: { fr: 'Aragon, Espagne', en: 'Aragon, Spain' },
    color: 'rouge',
    characteristics: {
      fr: 'Chaleureux et fruité, arômes de fraise, cerise et garrigue. Fort en alcool.',
      en: 'Warm and fruity, aromas of strawberry, cherry and scrubland. High alcohol.',
    },
    regions: ['Châteauneuf-du-Pape', 'Priorat', 'Gigondas', 'Barossa Valley'],
  },
  {
    id: 'malbec',
    name: { fr: 'Malbec', en: 'Malbec' },
    origin: { fr: 'Sud-Ouest, France', en: 'South-West France' },
    color: 'rouge',
    characteristics: {
      fr: 'Intense et velouté, arômes de prune, violette et cacao. Tanins doux et ronds.',
      en: 'Intense and velvety, aromas of plum, violet and cocoa. Soft, rounded tannins.',
    },
    regions: ['Mendoza', 'Cahors', 'Salta', 'Patagonie'],
  },
  {
    id: 'tempranillo',
    name: { fr: 'Tempranillo', en: 'Tempranillo' },
    origin: { fr: 'Rioja, Espagne', en: 'Rioja, Spain' },
    color: 'rouge',
    characteristics: {
      fr: 'Fruité et terreux, arômes de cerise, cuir et tabac. Vieillissement en barrique apprécié.',
      en: 'Fruity and earthy, aromas of cherry, leather and tobacco. Barrel ageing appreciated.',
    },
    regions: ['Rioja', 'Ribera del Duero', 'Toro', 'Penedès'],
  },
  {
    id: 'sangiovese',
    name: { fr: 'Sangiovese', en: 'Sangiovese' },
    origin: { fr: 'Toscane, Italie', en: 'Tuscany, Italy' },
    color: 'rouge',
    characteristics: {
      fr: 'Acide et tannique, arômes de cerise acidulée, herbes et terre. Grande acidité.',
      en: 'Acidic and tannic, aromas of tart cherry, herbs and earth. High acidity.',
    },
    regions: ['Chianti', 'Brunello di Montalcino', 'Montepulciano', 'Morellino'],
  },
  {
    id: 'nebbiolo',
    name: { fr: 'Nebbiolo', en: 'Nebbiolo' },
    origin: { fr: 'Piémont, Italie', en: 'Piedmont, Italy' },
    color: 'rouge',
    characteristics: {
      fr: 'Très tannique et austère jeune, arômes de rose, goudron et cerise séchée. Vieillissement impératif.',
      en: 'Very tannic and austere when young, aromas of rose, tar and dried cherry. Ageing essential.',
    },
    regions: ['Barolo', 'Barbaresco', 'Gattinara', 'Carema'],
  },
  {
    id: 'gamay',
    name: { fr: 'Gamay', en: 'Gamay' },
    origin: { fr: 'Beaujolais, France', en: 'Beaujolais, France' },
    color: 'rouge',
    characteristics: {
      fr: 'Léger et fruité, arômes de framboise, banane et bonbon. Peu tannique, à boire jeune.',
      en: 'Light and fruity, aromas of raspberry, banana and candy. Low tannins, best drunk young.',
    },
    regions: ['Beaujolais', 'Moulin-à-Vent', 'Morgon', 'Touraine'],
  },
  {
    id: 'chenin_blanc',
    name: { fr: 'Chenin Blanc', en: 'Chenin Blanc' },
    origin: { fr: 'Loire, France', en: 'Loire Valley, France' },
    color: 'blanc',
    characteristics: {
      fr: 'Polyvalent, arômes de coing, miel et fleurs blanches. Acidité élevée. Sec à liquoreux.',
      en: 'Versatile, aromas of quince, honey and white flowers. High acidity. Dry to sweet.',
    },
    regions: ['Vouvray', 'Anjou', 'Savennières', 'Stellenbosch'],
  },
  {
    id: 'semillon',
    name: { fr: 'Sémillon', en: 'Sémillon' },
    origin: { fr: 'Bordeaux, France', en: 'Bordeaux, France' },
    color: 'blanc',
    characteristics: {
      fr: "Riche et onctueux, arômes de citron, cire d'abeille et miel. Vieillissement remarquable.",
      en: 'Rich and unctuous, aromas of lemon, beeswax and honey. Remarkable ageing.',
    },
    regions: ['Sauternes', 'Barsac', 'Hunter Valley', 'White Bordeaux'],
  },
];

export function getCepageById(id: string): Ceepage | undefined {
  return cepages.find((c) => c.id === id);
}

export function getRandomCeepage(): Ceepage {
  return cepages[Math.floor(Math.random() * cepages.length)];
}
