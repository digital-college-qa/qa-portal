"""Original, bilingual teaching illustrations (CC0). No live shop bug is depicted.
Run from any directory: python scripts/build-lesson-illustrations.py
Pillow measures real font widths; exported images are standalone SVG, without scripts.
"""
from pathlib import Path
from html import escape
import json
from PIL import ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'img' / 'lessons'
OUT.mkdir(parents=True, exist_ok=True)
FONT = 'C:/Windows/Fonts/arial.ttf'
INK, MUTED, LINE = '#202637', '#566078', '#d9deeb'
PURPLE, GREEN, RED = '#6241a5', '#196747', '#a42f38'

class Canvas:
    def __init__(self, mobile, lang, title):
        self.mobile, self.lang = mobile, lang
        self.w = 400 if mobile else 960
        self.parts = []
        self.box(0, 0, self.w, 1000, '#f5f3fb', stroke='none', r=0)
        self.text(24, 30, self.tr('УЧЕБНЫЙ ПРИМЕР', 'ОҚУ МЫСАЛЫ'), 17, MUTED)
        self.y = self.text(24, 66, title, 30, INK, self.w-48, bold=True) + 22

    def tr(self, ru, kz):
        return kz if self.lang == 'kz' else ru

    def box(self, x, y, w, h, fill='#fff', stroke=LINE, r=16):
        self.parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}"/>')

    def text(self, x, y, value, size=24, color=INK, width=None, bold=False):
        font = ImageFont.truetype(FONT.replace('arial.ttf','arialbd.ttf') if bold else FONT, size)
        width = width or self.w-48
        lines=[]
        for line in value.split('\n'):
            current=''
            for word in line.split():
                candidate = (current+' '+word).strip()
                if current and font.getlength(candidate) > width:
                    lines.append(current); current=word
                else: current=candidate
            lines.append(current)
        weight='700' if bold else '400'
        for i,line in enumerate(lines):
            self.parts.append(f'<text x="{x}" y="{y+i*(size+9)}" font-size="{size}" font-weight="{weight}" fill="{color}">{escape(line)}</text>')
        return y+max(0,len(lines)-1)*(size+9)

    def button(self, x, y, w, label, color=PURPLE):
        self.box(x,y,w,48,color,stroke=color,r=12)
        self.text(x+14,y+32,label,22,'#fff',w-28,bold=True)

    def field(self, x, y, w, label, value, invalid=False):
        self.text(x,y,label,20,MUTED,w)
        self.box(x,y+12,w,46,'#fff',RED if invalid else LINE,r=8)
        if value:self.text(x+12,y+43,value,23,INK,w-24)

    def note(self, text, color=PURPLE):
        self.y = self.text(24,self.y+8,text,24,color,self.w-48,bold=True)+24

    def panels(self, items, draw):
        if self.mobile:
            w=self.w-48
            for item in items:
                self.y=draw(24,self.y,w,item)+22
        else:
            w=(self.w-68)/2
            heights=[draw(24+i*(w+20),self.y,w,item) for i,item in enumerate(items)]
            self.y=max(heights)+22

    def coffee(self,x,y):
        self.box(x,y,96,80,'#e8efe9',stroke='none',r=18)
        self.parts.append(f'<path d="M{x+25} {y+29}h44v23q0 18-22 18t-22-18z M{x+69} {y+33}q25 0 14 20h-14" fill="#fff" stroke="{GREEN}" stroke-width="3"/>')
        self.parts.append(f'<path d="M{x+39} {y+20}q-8-7 0-14 M{x+55} {y+20}q-8-7 0-14" fill="none" stroke="{GREEN}" stroke-width="3"/>')

    def save(self,name):
        h=int(self.y+8)
        # Replace the generous background with the real, content-derived height.
        self.parts[0]=self.parts[0].replace('height="1000"',f'height="{h}"')
        svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.w} {h}" role="img" font-family="Arial, sans-serif">'+''.join(self.parts)+'</svg>\n'
        file=f'{name}-{self.lang}'+('-mobile' if self.mobile else '')+'.svg'
        (OUT/file).write_text(svg,encoding='utf8')
        return 'img/lessons/'+file

def screen(c,x,y,w,title,height=292):
    c.box(x,y,w,height)
    c.box(x,y,w,44,'#eae4f6',stroke='none',r=12)
    c.text(x+16,y+29,title,21,PURPLE,w-32,bold=True)
    return y+74

def cart_menu(c):
    def draw(x,y,w,which):
        q=screen(c,x,y,w,c.tr('qala coffe · Корзина','qala coffe · Себет') if which==0 else c.tr('qala coffe · Меню','qala coffe · Мәзір'))
        if which==0:
            c.text(x+20,q,c.tr('Корзина пуста','Себет бос'),28,INK,w-40,bold=True)
            c.button(x+20,q+35,160,c.tr('В меню →','Мәзірге →'))
            c.text(x+20,q+118,c.tr('1. Нажали ссылку','1. Сілтемені бастық'),24,PURPLE,w-40)
        else:
            c.coffee(x+20,q-12);c.text(x+138,q+20,c.tr('Латте','Латте'),27,INK,w-158,bold=True)
            c.text(x+138,q+58,'1 300 ₸',24,INK,w-158)
            c.text(x+20,q+118,c.tr('2. Меню открылось','2. Мәзір ашылды'),24,GREEN,w-40)
        return y+292
    c.panels([0,1],draw)
    c.note(c.tr('CRT-05 → ссылка в меню есть и работает → Passed','CRT-05 → мәзір сілтемесі бар және жұмыс істейді → Passed'),GREEN)

def results(c):
    def draw(x,y,w,bad):
        c.box(x,y,w,230)
        c.text(x+20,y+36,c.tr('Учебное правило','Оқу ережесі'),22,PURPLE,w-40,bold=True)
        c.text(x+20,y+76,c.tr('Ссылка открывает меню','Сілтеме мәзірді ашады'),25,INK,w-40,bold=True)
        c.text(x+20,y+119,c.tr('После нажатия:','Басқаннан кейін:'),22,MUTED,w-40)
        c.text(x+20,y+160,c.tr('Открылась главная','Басты бет ашылды') if bad else c.tr('Открылось меню','Мәзір ашылды'),25,INK,w-40,bold=True)
        c.text(x+20,y+204,'Failed' if bad else 'Passed',27,RED if bad else GREEN,w-40,bold=True)
        return y+230
    c.panels([False,True],draw)
    c.note(c.tr('Статус — результат сравнения, а не впечатление.','Мәртебе — әсер емес, салыстыру нәтижесі.'))

def checklist(c):
    x,y,w=24,c.y,c.w-48
    q=screen(c,x,y,w,c.tr('qala coffe · Латте','qala coffe · Латте'))
    c.coffee(x+20,q-8)
    c.text(x+140,q+12,'① '+c.tr('Латте','Латте'),27,INK,w-160,bold=True)
    c.text(x+140,q+53,'② 1 300 ₸',25,INK,w-160)
    c.text(x+20,q+112,'③ '+c.tr('Количество: 1','Саны: 1'),25,INK,w-40)
    c.text(x+20,q+163,'④ ← '+c.tr('В меню','Мәзірге'),25,PURPLE,w-40)
    c.y=y+316
    for i,t in enumerate(c.tr(['Название есть','Цена в тенге','По умолчанию 1','Ссылка открывает меню'],['Атауы бар','Баға теңгемен','Әдепкі саны — 1','Сілтеме мәзірді ашады']),1):
        c.y=c.text(24,c.y,f'{i}. {t} — Passed',24,GREEN,c.w-48)+36

def check_vs_case(c):
    def draw(x,y,w,case):
        c.box(x,y,w,300)
        c.text(x+20,y+38,c.tr('Тест-кейс','Тест-кейс') if case else c.tr('Чек-лист','Чек-лист'),28,PURPLE,w-40,bold=True)
        lines=c.tr(['1. Открыть латте','2. Нажать «← В меню»','Ожидали: откроется меню','Увидели: меню открылось'],['1. Латтені ашу','2. «← Мәзірге» басу','Күттік: мәзір ашылады','Көрдік: мәзір ашылды']) if case else c.tr(['Ссылка «← В меню»','открывает меню — Passed'],['«← Мәзірге» сілтемесі','мәзірді ашады — Passed'])
        yy=y+88
        for line in lines:yy=c.text(x+20,yy,line,24,INK,w-40)+42
        return y+300
    c.panels([False,True],draw)
    c.note(c.tr('Одна проверка. В кейсе — ещё и как её повторить.','Бір тексеру. Кейсте оны қайталау жолы да бар.'))

def steps_data(c):
    def draw(x,y,w,which):
        q=screen(c,x,y,w,c.tr('1. Выбор напитка','1. Сусын таңдау') if which==0 else c.tr('2. Корзина','2. Себет'))
        c.coffee(x+20,q-8)
        c.text(x+138,q+20,c.tr('Латте','Латте'),27,INK,w-158,bold=True)
        if which==0:
            c.text(x+20,q+112,c.tr('Количество: 2','Саны: 2'),25,INK,w-40)
            c.button(x+20,q+141,210,c.tr('В корзину','Себетке'))
        else:
            c.text(x+138,q+59,'× 2',28,PURPLE,w-158,bold=True)
            c.text(x+20,q+138,c.tr('В корзине два латте','Себетте екі латте'),24,GREEN,w-40)
        return y+292
    c.note(c.tr('До начала: корзина пуста.','Басталар алдында: себет бос.'))
    c.panels([0,1],draw)
    c.note(c.tr('Данные: латте, 2. Шаг: нажать «В корзину».','Деректер: латте, 2. Қадам: «Себетке» басу.'))

def repeatable(c):
    def draw(x,y,w,good):
        c.box(x,y,w,220)
        c.text(x+20,y+38,c.tr('Можно повторить','Қайталауға болады') if good else c.tr('Не хватает данных','Деректер жетіспейді'),26,GREEN if good else RED,w-40,bold=True)
        c.text(x+20,y+92,c.tr('Выбрать латте. Количество 2. Нажать «В корзину».','Латтені таңдау. Саны 2. «Себетке» басу.') if good else c.tr('Добавить напиток.','Сусын қосу.'),26,INK,w-40)
        return y+220
    c.panels([False,True],draw)
    c.note(c.tr('У коллеги те же данные → ту же проверку можно повторить.','Әріптесте сол деректер → сол тексеруді қайталай алады.'))

def cinema(c):
    def draw(x,y,w,bad):
        q=screen(c,x,y,w,c.tr('Учебный кинотеатр · Афиша','Оқу кинотеатры · Афиша'))
        c.field(x+18,q,w-36,c.tr('Поиск по названию','Атауы бойынша іздеу'),'Дюна' if bad else 'дюна')
        c.button(x+18,q+78,140,c.tr('Найти','Табу'))
        c.text(x+18,q+166,c.tr('Ничего не найдено','Ештеңе табылмады') if bad else c.tr('Найден фильм «Дюна»','«Дюна» фильмі табылды'),25,RED if bad else GREEN,w-36,bold=True)
        return y+292
    c.panels([True,False],draw)
    c.note(c.tr('Правило: поиск не зависит от регистра букв.','Ереже: іздеу әріп регистріне тәуелді емес.'))
    c.note(c.tr('Что: фильм не найден → где: поиск → после ввода «Дюна».','Не: фильм табылмады → қайда: іздеу → «Дюна» енгізген соң.'))

def severity(c):
    def draw(x,y,w,priority):
        c.box(x,y,w,248)
        c.text(x+20,y+38,'Priority' if priority else 'Severity',30,PURPLE,w-40,bold=True)
        yy=c.text(x+20,y+82,c.tr('Как срочно чинить?','Қаншалықты шұғыл түзету керек?') if priority else c.tr('Как сильно мешает?','Қаншалықты кедергі?'),25,INK,w-40)+38
        c.text(x+20,yy,'High' if priority else 'Minor',29,INK,w-40,bold=True)
        c.text(x+20,yy+40,c.tr('Завтра реклама: исправить сегодня.','Ертең жарнама: бүгін түзету керек.') if priority else c.tr('Опечатка в названии. Заказ работает.','Атауда әріп қатесі. Тапсырыс жұмыс істейді.'),23,MUTED,w-40)
        return y+248
    c.panels([False,True],draw)
    c.note(c.tr('Условный пример оценки команды. Minor не означает Low.','Команда бағасының шартты мысалы. Minor — міндетті түрде Low емес.'))

def context(c):
    c.note(c.tr('Одна ошибка: поиск не находит товар по названию.','Бір қате: іздеу тауарды атауы бойынша таппайды.'))
    def draw(x,y,w,large):
        c.box(x,y,w,315)
        c.text(x+20,y+36,c.tr('Большой каталог','Үлкен каталог') if large else c.tr('Маленький магазин','Шағын дүкен'),27,PURPLE,w-40,bold=True)
        yy=c.text(x+20,y+84,c.tr('10 000 товаров. Поиск — основной путь к покупке.','10 000 тауар. Іздеу — сатып алудың негізгі жолы.') if large else c.tr('6 товаров. Все видны в меню, есть обходной путь.','6 тауар. Бәрі мәзірде көрінеді, айналып өту жолы бар.'),24,INK,w-40)+50
        c.text(x+20,yy,'Severity: Major' if large else 'Severity: Minor',24,INK,w-40,bold=True)
        c.text(x+20,yy+38,'Priority: High' if large else 'Priority: Low',24,INK,w-40,bold=True)
        return y+315
    c.panels([False,True],draw)
    c.note(c.tr('Оценки условные. Сначала узнай шкалу и правила команды.','Бағалар шартты. Алдымен команда шкаласы мен ережесін біл.'))

def form(c):
    def draw(x,y,w,empty):
        q=screen(c,x,y,w,c.tr('Негативная проверка','Негативтік тексеру') if empty else c.tr('Позитивная проверка','Позитивтік тексеру'),height=390)
        c.field(x+18,q,w-36,c.tr('Имя *','Аты *'),'' if empty else c.tr('Ая','Ая'),empty)
        c.field(x+18,q+91,w-36,c.tr('Телефон *','Телефон *'),'+7 700 000 00 01')
        c.field(x+18,q+182,w-36,c.tr('Адрес *','Мекенжай *'),c.tr('Учебная улица, 1','Оқу көшесі, 1'))
        c.text(x+18,q+280,c.tr('Имя обязательно','Аты міндетті') if empty else c.tr('Все поля заполнены','Барлық өріс толтырылған'),23,RED if empty else GREEN,w-36,bold=True)
        return y+390
    c.panels([False,True],draw)
    c.note(c.tr('В негативной проверке неверно только одно поле.','Негативтік тексеруде тек бір өріс қате.'))

def negative(c):
    def draw(x,y,w,actual):
        c.box(x,y,w,230)
        c.text(x+20,y+40,c.tr('Фактический результат','Нақты нәтиже') if actual else c.tr('Ожидаемый результат','Күтілетін нәтиже'),25,PURPLE,w-40,bold=True)
        c.text(x+20,y+108,c.tr('Заказ не создан. Рядом с именем — ошибка.','Тапсырыс жасалмады. Аттың жанында қате бар.') if actual else c.tr('Без имени заказ не создаётся. Форма объясняет почему.','Аты жоқ тапсырыс жасалмайды. Форма себебін түсіндіреді.'),25,INK,w-40)
        return y+230
    c.panels([False,True],draw)
    c.note(c.tr('Совпало → Passed. Отказ был ожидаемым.','Сәйкес келді → Passed. Бас тарту күтілді.'),GREEN)

def boundary(c,height=False):
    start,end,lo,hi=(120,190,119,191) if height else (1,10,0,11)
    c.note(c.tr(f'Правило: от {start} до {end} включительно.',f'Ереже: {start}-ден {end}-ға дейін, шеттері кіреді.'))
    labels=[(str(lo),False),(str(start),True),(str(end),True),(str(hi),False)]
    # Large numbered tiles preserve the number line's reading order on mobile.
    y=c.y;gap=12;w=(c.w-48-gap*3)/4
    c.parts.append(f'<path d="M24 {y+49}H{c.w-24}" stroke="{PURPLE}" stroke-width="4"/>')
    for i,(value,valid) in enumerate(labels):
        x=24+i*(w+gap);c.box(x,y,w,96,'#e5f1e9' if valid else '#fbe9eb',GREEN if valid else RED,r=14)
        c.text(x+12,y+56,value,32 if c.mobile else 36,GREEN if valid else RED,w-24,bold=True)
    c.y=y+134
    for i,t in enumerate(c.tr([f'Меньше {start}: не разрешено',f'{start}–{end}: разрешено',f'Больше {end}: не разрешено'],[f'{start}-ден аз: рұқсат жоқ',f'{start}–{end}: рұқсат бар',f'{end}-дан көп: рұқсат жоқ'])):
        c.y=c.text(24,c.y,t,25,INK,c.w-48)+44
    c.note(c.tr('Цвет — допустимость значения, не Passed или Failed.','Түс — мәнге рұқсат бар-жоғы, Passed не Failed емес.'))

def ambiguous(c):
    def draw(x,y,w,question):
        c.box(x,y,w,210)
        c.text(x+20,y+38,c.tr('Вопрос автору','Авторға сұрақ') if question else c.tr('Учебное требование REV-2','Оқу талабы REV-2'),25,PURPLE,w-40,bold=True)
        c.text(x+20,y+104,c.tr('За сколько секунд должны появиться результаты?','Нәтижелер неше секундта шығуы керек?') if question else c.tr('«Результаты показываются быстро».','«Нәтижелер жылдам көрсетіледі».'),27,INK,w-40)
        return y+210
    c.panels([False,True],draw)
    c.note(c.tr('Число уточняем у автора. Не придумываем сами.','Санды автордан нақтылаймыз. Өзіміз ойлап таппаймыз.'))

def uiux(c):
    def draw(x,y,w,ux):
        q=screen(c,x,y,w,'UX' if ux else 'UI')
        c.text(x+20,q,c.tr('Корзина: 2 латте','Себет: 2 латте'),26,INK,w-40,bold=True)
        c.text(x+20,q+44,c.tr('Итого: 2 600 ₸','Барлығы: 2 600 ₸'),25,INK,w-40)
        c.button(x+20,q+75,w-40,c.tr('Оформить заказ →','Тапсырыс беру →'))
        if ux:
            # Follow the next action instead of merely showing a second copy of UI.
            xx=x+w-28
            c.parts.append(f'<path d="M{xx} {q-15}v72m-8-8 8 8 8-8" fill="none" stroke="{PURPLE}" stroke-width="4"/>')
        else:
            c.parts.append(f'<rect x="{x+12}" y="{q+20}" width="{w-24}" height="36" rx="6" fill="none" stroke="{PURPLE}" stroke-width="2" stroke-dasharray="5 4"/>')
        c.text(x+20,q+160,c.tr('Понятно, куда нажать дальше?','Әрі қарай қайда басу түсінікті ме?') if ux else c.tr('Текст, цена, цвет и кнопка.','Мәтін, баға, түс және батырма.'),23,PURPLE,w-40)
        return y+292
    c.panels([False,True],draw)
    c.note(c.tr('Один экран: что видно (UI) и удобно ли действовать (UX).','Бір экран: не көрінеді (UI), әрекет ету ыңғайлы ма (UX).'))

def board(c):
    titles=c.tr(['Новые','В работе','На проверке','Готово'],['Жаңа','Жұмыста','Тексеруде','Дайын'])
    if c.mobile:
        for i,title in enumerate(titles):
            y=c.y;c.box(24,y,c.w-48,110,'#eae4f6' if i==0 else '#fff')
            c.text(42,y+34,title,25,PURPLE,c.w-84,bold=True)
            c.text(42,y+78,'BUG-SRC-001 · New' if i==0 else ['','In Progress','Fixed → Retest','Closed'][i],24,INK,c.w-84)
            c.y=y+124
    else:
        w=(c.w-84)/4;y=c.y
        for i,title in enumerate(titles):
            x=24+i*(w+12);c.box(x,y,w,190,'#eae4f6' if i==0 else '#fff')
            c.text(x+14,y+34,title,22,PURPLE,w-28,bold=True)
            if i==0:c.box(x+8,y+62,w-16,100,'#fff',LINE,r=10)
            c.text(x+14,y+94,'BUG-SRC-001 · New' if i==0 else ['','In Progress','Fixed → Retest','Closed'][i],23,INK,w-28)
        c.y=y+216
    c.note(c.tr('Карточка BUG-SRC-001: «Дюна» не находится в поиске.','BUG-SRC-001 карточкасы: «Дюна» іздеуде табылмайды.'))
    c.note(c.tr('Исполнитель: тестировщик · Severity: Major · статус: New','Орындаушы: тестілеуші · Severity: Major · мәртебе: New'))
    c.note(c.tr('Колонки условные. Fixed → проверка → Closed или Reopened.','Бағандар шартты. Fixed → тексеру → Closed не Reopened.'))

# Each caption anchors a picture to the actual lesson sentence or filled sample.
SPECS = {
1:[('cart-menu',cart_menu,('Проверка ссылки из пустой корзины','Бос себеттегі сілтемені тексеру'),('К образцу CRT-05: нажали «В меню» и записали, что открылось.','CRT-05 мысалы: «Мәзірге» басып, не ашылғанын жаздық.')),
   ('results',results,('Сравниваем ожидание и факт','Күту мен нақты нәтижені салыстырамыз'),('Две учебные ситуации со ссылкой «В меню»: выполнено правило — Passed, открылась другая страница — Failed.','«Мәзірге» сілтемесі бар екі оқу жағдайы: ереже орындалды — Passed, басқа бет ашылды — Failed.'))],
2:[('checklist',checklist,('Четыре пункта на одном экране','Бір экрандағы төрт тармақ'),('Числа на странице латте соответствуют четырём пунктам заполненного чек-листа.','Латте бетіндегі сандар толтырылған чек-листтің төрт тармағына сәйкес.')),
   ('check-vs-case',check_vs_case,('Чек-лист и тест-кейс: одна проверка','Чек-лист пен тест-кейс: бір тексеру'),('Слева — что проверить и итог; справа — ещё и действия для повторения.','Сол жақта — не тексеру және нәтиже; оң жақта — қайталау әрекеттері де бар.'))],
3:[('steps-data',steps_data,('Предусловие, действие, данные','Алғышарт, әрекет, деректер'),('Корзина пуста до начала. Латте и 2 — данные; нажатие кнопки — шаг.','Басталар алдында себет бос. Латте мен 2 — деректер; батырманы басу — қадам.')),
   ('repeatable',repeatable,('Коллега сможет повторить?','Әріптес қайталай ала ма?'),('Уточнение напитка, количества и кнопки делает действие воспроизводимым.','Сусын, саны және батырманы нақтылау әрекетті қайталауға көмектеседі.'))],
4:[('cinema',cinema,('Баг из образца: поиск «Дюна»','Мысалдағы баг: «Дюна» іздеуі'),('Вымышленный кинотеатр из баг-репорта: одинаковый поиск даёт разные результаты из-за регистра.','Баг-репорттағы ойдан шығарылған кинотеатр: бір іздеу регистрге байланысты әртүрлі нәтиже береді.')),
   ('severity',severity,('Влияние и срочность — разные вещи','Әсері мен шұғылдығы — бөлек ұғымдар'),('Опечатка перед рекламой: небольшое влияние может сочетаться с высокой срочностью. Оценки примерные.','Жарнама алдындағы әріп қатесі: аз әсер мен жоғары шұғылдық бірге болуы мүмкін. Бағалар шартты.')),
   ('context',context,('Одинаковая ошибка — разное влияние','Бір қате — әртүрлі әсер'),('Продукт, обходной путь, число затронутых людей и сроки меняют оценку. Шкалу и ответственных уточняем в команде.','Өнім, айналып өту жолы, зардап шеккендер саны мен мерзім бағаға әсер етеді. Шкала мен жауаптыларды командадан нақтылаймыз.'))],
5:[('form',form,('Пустое обязательное поле','Бос міндетті өріс'),('Учебные формы: в негативной проверке пустое только имя, остальные обязательные поля заполнены.','Оқу формалары: негативтік тексеруде тек аты бос, қалған міндетті өрістер толтырылған.')),
   ('negative',negative,('Почему правильный отказ — Passed','Дұрыс бас тарту неге Passed'),('Это ожидаемое поведение по ORD-01, а не найденный баг кофейни. Сравниваем оба результата.','Бұл — кофеханада табылған баг емес, ORD-01 бойынша күтілетін әрекет. Екі нәтижені салыстырамыз.'))],
6:[('quantity',lambda c: boundary(c),('Количество: 0, 1, 10, 11','Саны: 0, 1, 10, 11'),('Для PRD-02 оба края 1 и 10 разрешены. Проверяем также соседние значения снаружи.','PRD-02 бойынша 1 мен 10 шеттеріне рұқсат бар. Сыртындағы көрші мәндерді де тексереміз.')),
   ('height',lambda c: boundary(c,True),('Тот же принцип на аттракционе','Аттракциондағы сол қағида'),('К заполненному образцу: рост 120–190 см включительно, поэтому берём 119, 120, 190 и 191.','Толтырылған мысалға: бойы 120–190 см, шеттері кіреді, сондықтан 119, 120, 190 және 191 аламыз.'))],
7:[('ambiguous',ambiguous,('Как уточнить слово «быстро»','«Жылдам» сөзін қалай нақтылау керек'),('Берём REV-2 из заполненного образца. Вместо догадки задаём автору проверяемый вопрос.','Толтырылған мысалдағы REV-2 аламыз. Жорамалдаудың орнына авторға тексерілетін сұрақ қоямыз.')),
   ('uiux',uiux,('UI и UX на одной корзине','Бір себеттегі UI және UX'),('UI описывает видимые элементы. UX — насколько понятен следующий шаг гостю.','UI көрінетін элементтерді сипаттайды. UX — қонаққа келесі қадамның түсініктілігі.'))],
8:[('board',board,('Как выглядит доска трекера','Трекер тақтасы қалай көрінеді'),('Карточка учебного бага из пары 4. Названия колонок и распределение статусов команда выбирает сама.','4-сабақтағы оқу багының карточкасы. Баған атаулары мен мәртебелердің орналасуын команда өзі таңдайды.'))]
}

manifest={}
for n,specs in SPECS.items():
    manifest[f'qa-{n}']={'ru':[],'kz':[]}
    for name,draw,titles,captions in specs:
        for i,lang in enumerate(['ru','kz']):
            images=[]
            for mobile in [False,True]:
                c=Canvas(mobile,lang,titles[i]);draw(c);images.append(c.save(name))
            manifest[f'qa-{n}'][lang].append({'src':images[0]+'?v=2','mobile':images[1]+'?v=2','title':titles[i],'alt':titles[i]+'. '+captions[i],'caption':captions[i]})

# Preserve the independent exercise mockup and the existing lifecycle reference.
for n,stem,title,caption in [
    (7,'lesson-mockup-cart',('Макет для самостоятельной проверки','Өз бетінше тексеруге арналған макет'),('Сравни с CRT-05. Расхождение здесь специально не отмечено: это твоя задача.','CRT-05-пен салыстыр. Айырмашылық белгіленбеген: оны табу — сенің тапсырмаң.')),
    (8,'lesson-bug-lifecycle',('Путь бага по статусам','Багтың мәртебелер бойынша жолы'),('После Fixed тестировщик проверяет исправление: Closed или Reopened. Набор статусов зависит от команды.','Fixed-тен кейін тестілеуші түзетуді тексереді: Closed не Reopened. Мәртебелер жиыны командаға байланысты.'))]:
    for i,lang in enumerate(['ru','kz']):
        slide={'src':f'img/{stem}-{lang}.svg','title':title[i],'alt':title[i]+'. '+caption[i],'caption':caption[i]}
        if n==7:manifest[f'qa-{n}'][lang].insert(0,slide)
        else:manifest[f'qa-{n}'][lang].append(slide)

(ROOT/'js/learn/illustration-data.js').write_text('/* Original teaching images, CC0. Generated by scripts/build-lesson-illustrations.py. */\nwindow.LEARN_ILLUSTRATIONS = '+json.dumps(manifest,ensure_ascii=False,indent=2)+';\n',encoding='utf8')
print(f'Built {sum(len(v["ru"]) for v in manifest.values())} bilingual slides for pairs 1–8; responsive originals are CC0.')
