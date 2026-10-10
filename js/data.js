const SIZES = [
  { code: "S", mod: -200 },
  { code: "M", mod: 0 },
  { code: "L", mod: 300 }
];

const STD_VOLUMES = { S: 250, M: 350, L: 450 };

const PRODUCTS = [
  {
    id: 1, img: "img/espresso.svg", price: 700, pop: 9, hit: true, inStock: true,
    name: { ru: "Эспрессо", kz: "Эспрессо" },
    desc: { ru: "Крепкий и насыщенный кофе из зёрен средней обжарки.", kz: "Орташа қуырылған дәндерден жасалған күшті әрі қою кофе." },
    volumes: { S: 30, M: 60, L: 90 }, catalogVolume: 60
  },
  {
    id: 2, img: "img/americano.svg", price: 900, pop: 8, hit: true, inStock: true,
    name: { ru: "Американо", kz: "Американо" },
    desc: { ru: "Эспрессо с горячей водой — мягкий вкус на каждый день.", kz: "Ыстық су қосылған эспрессо — күнделікті жұмсақ дәм." },
    volumes: { S: 150, M: 250, L: 350 }, catalogVolume: 300
  },
  {
    id: 3, img: "img/cappuccino.svg", price: 1200, pop: 10, hit: true, inStock: true,
    name: { ru: "Капучино", kz: "Капучино" },
    desc: { ru: "Эспрессо, горячее молоко и густая молочная пена.", kz: "Эспрессо, ыстық сүт және қалың сүт көбігі." },
    volumes: STD_VOLUMES, catalogVolume: 350
  },
  {
    id: 4, img: "img/latte.png", price: 1300, pop: 10, hit: true, inStock: true,
    name: { ru: "Латте", kz: "Латте" },
    desc: { ru: "Нежный кофе с большим количеством молока.", kz: "Сүті мол жұмсақ кофе." },
    volumes: STD_VOLUMES, catalogVolume: 350
  },
  {
    id: 5, img: "img/raf.svg", price: 1500, pop: 7, hit: true, inStock: true,
    name: { ru: "Раф ванильный", kz: "Ванильді раф" },
    desc: { ru: "Сливочный кофе с ванильным сахаром.", kz: "Ваниль қанты қосылған кілегейлі кофе." },
    volumes: STD_VOLUMES, catalogVolume: 350
  },
  {
    id: 6, img: "img/flatwhite.svg", price: 1400, pop: 5, hit: false, inStock: true,
    name: { ru: "Флэт уайт", kz: "Флэт уайт" },
    desc: { ru: "Двойной эспрессо с тонким слоем молока.", kz: "Жұқа сүт қабаты бар қос эспрессо." },
    volumes: STD_VOLUMES, catalogVolume: 350
  },
  {
    id: 7, img: "img/mocha.svg", price: 1500, pop: 7, hit: true, inStock: true,
    name: { ru: "Мокко", kz: "Мокко" },
    desc: { ru: "Кофе с шоколадом и молоком.", kz: "Шоколад пен сүт қосылған кофе." },
    volumes: STD_VOLUMES, catalogVolume: 350
  },
  {
    id: 8, img: "img/cocoa.svg", price: 1100, pop: 4, hit: false, inStock: true,
    name: { ru: "Какао", kz: "Какао" },
    desc: { ru: "Горячий шоколадный напиток без кофеина.", kz: "Кофеинсіз ыстық шоколад сусыны." },
    volumes: STD_VOLUMES, catalogVolume: 350
  },
  {
    id: 9, img: "img/masala.svg", price: 1000, pop: 3, hit: false, inStock: true,
    name: { ru: "Чай масала", kz: "Масала шайы" },
    desc: { ru: "Чёрный чай с молоком и пряностями.", kz: "Сүт пен дәмдеуіштер қосылған қара шай." },
    volumes: STD_VOLUMES, catalogVolume: 350
  },
  {
    id: 10, img: "img/pumpkin.svg", price: 1700, pop: 6, hit: false, inStock: false,
    name: { ru: "Тыквенный латте", kz: "Асқабақ латтесі" },
    desc: { ru: "Сезонный латте с тыквенным сиропом и корицей.", kz: "Асқабақ сиропы мен даршын қосылған маусымдық латте." },
    volumes: STD_VOLUMES, catalogVolume: 350
  },
  {
    id: 11, img: "img/lavender.svg", price: 1600, pop: 5, hit: false, inStock: true,
    name: { ru: "Раф лавандовый", kz: "Лаванда раф" },
    desc: {
      ru: "Авторский раф на сливках с лавандовым сиропом. Мы взбиваем эспрессо со сливками и ванильным сахаром до бархатной текстуры, а затем добавляем сироп из цветков лаванды, собранных в предгорьях Алатау. Напиток получается мягким, цветочным и чуть сладким — идеально для неспешного утра или встречи с друзьями после учёбы.",
      kz: "Кілегей мен лаванда сиропы қосылған авторлық раф. Эспрессоны кілегей және ваниль қантымен барқыт тәрізді болғанша көпіртеміз, содан кейін Алатау бөктерінде жиналған лаванда гүлдерінен жасалған сироп қосамыз. Сусын жұмсақ, гүл хош иісті және сәл тәтті болып шығады — асықпай өтетін таңға немесе сабақтан кейін достармен кездесуге өте қолайлы."
    },
    volumes: STD_VOLUMES, catalogVolume: 350
  },
  {
    id: 12, img: "img/matcha.svg", price: 1600, pop: 6, hit: false, inStock: true,
    name: { ru: "Матча латте", kz: "Матча латте" },
    desc: { ru: "Японский зелёный чай матча с молоком.", kz: "Сүт қосылған жапондық матча жасыл шайы." },
    volumes: STD_VOLUMES, catalogVolume: 350
  }
];

const REVIEWS = [
  { author: "Айгерим", stars: 5, text: { ru: "Очень вкусный капучино, привезли горячим!", kz: "Капучино өте дәмді, ыстық күйінде әкелді!" } },
  { author: "Данияр", stars: 4, text: { ru: "Хороший кофе, но курьер немного опоздал.", kz: "Кофе жақсы, бірақ курьер сәл кешікті." } }
];
