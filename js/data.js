const SIZES = [
  { code: "S", mod: -200 },
  { code: "M", mod: 0 },
  { code: "L", mod: 300 }
];

const STD_VOLUMES = { S: 250, M: 350, L: 450 };

const BASE_PRODUCTS = [
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

const FOOD_GROUPS = [
  ['sandwich', 'Сэндвич', 'Сэндвич', ['с курицей|тауықпен', 'с индейкой|күркетауықпен', 'с сыром|ірімшікпен', 'с тунцом|тунецпен', 'овощной|көкөністі', 'с яйцом|жұмыртқамен'], 1800],
  ['breakfast', 'Завтрак', 'Таңғы ас', ['омлет|омлет', 'сырники|сүзбе құймақ', 'овсянка|сұлы ботқасы', 'гранола|гранола', 'тост с авокадо|авокадо тосты', 'яйца и тост|жұмыртқа мен тост'], 1600],
  ['snack', 'Закуска', 'Тіскебасар', ['орехи|жаңғақ', 'фрукты|жеміс', 'йогурт|йогурт', 'хумус|хумус', 'сыр|ірімшік', 'крекеры|крекер', 'овощи|көкөніс', 'батончик|батончик'], 800],
  ['bakery', 'Выпечка', 'Пісірме', ['круассан|круассан', 'маффин|маффин', 'печенье|печенье', 'булочка|тоқаш', 'брауни|брауни', 'чизкейк|чизкейк'], 900]
];
const ALL_PRODUCTS = BASE_PRODUCTS.map(p => ({ ...p, img: p.id === 4 ? 'img/latte.svg' : p.img, category: [8,9,12].includes(p.id) ? 'decaf' : 'coffee', diet: p.id <= 2 ? 'vegan' : 'regular', allergens: p.id <= 2 ? [] : ['молоко / сүт'], nutrition: { calories: p.id * 18 }, ingredients: {ru:p.id<=2?'Кофе, вода':'Кофе или чай, молоко',kz:p.id<=2?'Кофе, су':'Кофе не шай, сүт'} }));
ALL_PRODUCTS.push(...[
  {id:13,name:{ru:'Айс латте',kz:'Айс латте'},price:1500,category:'coffee'},
  {id:14,name:{ru:'Лимонад',kz:'Лимонад'},price:1000,category:'decaf'}
].map(p=>({...ALL_PRODUCTS[3],...p,hit:false,img:p.id===13?'img/latte.svg':'img/masala.svg',desc:p.id===13?{ru:'Эспрессо, молоко и лёд.',kz:'Эспрессо, сүт және мұз.'}:{ru:'Лимон, вода и лёгкая сладость.',kz:'Лимон, су және аздап тәттілік.'},ingredients:p.id===13?{ru:'Кофе, молоко, лёд',kz:'Кофе, сүт, мұз'}:{ru:'Лимон, вода, сахар',kz:'Лимон, су, қант'},allergens:p.id===13?['молоко / сүт']:[],diet:p.id===13?'regular':'vegan'})));
let foodId=15;
FOOD_GROUPS.forEach(([category,ru,kz,variants,start])=>variants.forEach((variant,i)=>{
  const [r,k]=variant.split('|');
  ALL_PRODUCTS.push({id:foodId++,name:{ru:`${ru}: ${r}`,kz:`${kz}: ${k}`},desc:{ru:`Свежий ${r}. Готовим для учебного заказа.`,kz:`Жаңа ${k}. Оқу тапсырысы үшін дайындаймыз.`},price:start+i*100,category,img:`img/${category}.svg`,pop:6+i%3,hit:i===0,inStock:true,diet:i===4||category==='snack'?'vegan':'regular',allergens:category==='bakery'?['глютен / глютен','молоко / сүт']:category==='snack'?['орехи / жаңғақ']:['глютен / глютен'],nutrition:{calories:180+i*35},ingredients:{ru:r+', свежие ингредиенты',kz:k+', жаңа өнімдер'},volumes:{M:1},catalogVolume:1});
}));
const PRODUCTS = ALL_PRODUCTS.filter(p => {
  const version=typeof QAVersions==='undefined'?'2.0':QAVersions.current;
  return version==='1.0'?[1,2,3,4,5,8].includes(p.id):version==='1.5'?p.id<=12:true;
});

const REVIEWS = [
  { author: "Айгерим", stars: 5, text: { ru: "Очень вкусный капучино, привезли горячим!", kz: "Капучино өте дәмді, ыстық күйінде әкелді!" } },
  { author: "Данияр", stars: 4, text: { ru: "Хороший кофе, но курьер немного опоздал.", kz: "Кофе жақсы, бірақ курьер сәл кешікті." } }
];
