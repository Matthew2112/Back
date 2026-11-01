/* 
   ================================================================
   Подключается на обеих страницах (index.html и stories.html) в самом низу строкой:
   <script src="script.js"></script>

   Здесь пять независимых блоков (пятый — форма на stories.html):
   0. Включаем "режим JS" (для аккуратного сворачивания блоков)
   1. Hero — смена слов-якорей
   2. Якоря (блок II) — раскрытие карточки по клику
   3. История (блок III) — показ текста таймлайна по клику
   4. Способы (блок V) — появление карточек по очереди при скролле
   ================================================================ */


/* ---------- 0. РЕЖИМ JS ----------
   Добавляем класс "js" на страницу. CSS прячет сворачиваемый текст
   только когда этот класс есть. Если JS вдруг не загрузится — весь
   текст останется виден (ничего не сломается). */
document.documentElement.classList.add('js');


/* ---------- 1. HERO: смена слов-якорей ----------
   Каждые 2.2 секунды меняем слово в правой части первого экрана.
   Список слов — примеры того, что можно "заякорить". */
const anchorWords = [
  'билет', 'запах духов', 'голос', 'открытка',
  'мелодия', 'модель машинки', 'засушенный цветок', 'вкус блюда'
];
let wordIndex = 0;
const wordEl = document.getElementById('cycling-word');

if (wordEl) {
  setInterval(function () {
    // плавно гасим текущее слово
    wordEl.classList.add('is-fading');
    // через 400 мс (когда слово исчезло) подставляем следующее и проявляем
    setTimeout(function () {
      wordIndex = (wordIndex + 1) % anchorWords.length;  // % зацикливает список
      wordEl.textContent = anchorWords[wordIndex];
      wordEl.classList.remove('is-fading');
    }, 400);
  }, 2200);
}


/* ---------- 2. ЯКОРЯ (блок II): раскрытие карточки ----------
   По клику на карточку переключаем класс "is-open".
   Внутри карточки .anchor-detail раскрывается/сворачивается (это CSS). */
const anchorCards = document.querySelectorAll('.anchor-card');
anchorCards.forEach(function (card) {
  card.addEventListener('click', function () {
    card.classList.toggle('is-open');
  });
});


/* ---------- 3. ИСТОРИЯ (блок III): текст по клику на точку ----------
   По клику на пункт таймлайна показываем/прячем его описание. */
const timelineItems = document.querySelectorAll('.timeline-item');
timelineItems.forEach(function (item) {
  item.addEventListener('click', function () {
    item.classList.toggle('is-open');
  });
});


/* ---------- 4. СПОСОБЫ (блок V): появление при скролле ----------
   IntersectionObserver следит, когда блок попадает в видимую область.
   Как только сетка карточек показалась — вешаем класс "reveal-on",
   а CSS проявляет карточки по очереди (через transition-delay). */
const methodsGrid = document.querySelector('.methods-grid');

if (methodsGrid) {
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-on');
        observer.unobserve(entry.target); // срабатывает один раз
      }
    });
  }, {
    threshold: 0.45   // запускаем, когда видно ~15% блока
  });

  observer.observe(methodsGrid);
}


/* ---------- 5. ФОРМА «РАССКАЖИ СВОЮ ИСТОРИЮ» (stories.html) ----------
   Что происходит при отправке:
   1) проверяем поля (имя, тип якоря, история, согласие);
   2) если скрытое поле-ловушка заполнено — это бот, молча «успех»;
   3) отправляем данные POST-запросом на адрес Google Apps Script
      (он дописывает строку в Google Таблицу);
   4) показываем сообщение «спасибо» или ошибку.

   >>> ВСТАВЬ СЮДА АДРЕС из Apps Script (после «Развёртывания»),
   >>> он заканчивается на /exec. Подробности — в инструкции. */
const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwLIxQTYFOwjNMHIIJ4JLYQrehqhlpVARoKA2I0EhJGYRm4258GZ34259ksLg5gbZ1H/exec';

const shareForm = document.getElementById('share-form');

if (shareForm) {
  const statusEl  = document.getElementById('form-status');
  const submitBtn = document.getElementById('share-submit');
  const storyEl   = document.getElementById('f-story');
  const counterEl = document.getElementById('story-counter');

  // Счётчик символов под полем «история»
  function updateCounter() {
    counterEl.textContent = storyEl.value.length + ' / ' + storyEl.maxLength;
  }
  storyEl.addEventListener('input', updateCounter);
  updateCounter();

  // Показать / очистить текст ошибки под конкретным полем
  function setError(name, text) {
    const box = shareForm.querySelector('.field-error[data-for="' + name + '"]');
    if (!box) return;
    box.textContent = text || '';
    const field = box.closest('.field');
    if (field) field.classList.toggle('has-error', !!text);
  }

  // Проверка полей. Возвращает true, если всё заполнено верно.
  function validate() {
    const f = shareForm.elements;
    let ok = true;
    ['name', 'contact', 'anchor', 'story', 'consent'].forEach(function (n) { setError(n, ''); });

    if (f.name.value.trim().length < 2) { setError('name', 'Напиши, как тебя зовут.'); ok = false; }
    if (!shareForm.querySelector('input[name="anchor"]:checked')) { setError('anchor', 'Выбери тип якоря.'); ok = false; }
    if (f.story.value.trim().length < 10) { setError('story', 'Расскажи чуть подробнее — хотя бы пару слов.'); ok = false; }
    if (!f.consent.checked) { setError('consent', 'Нужно твоё согласие.'); ok = false; }
    return ok;
  }

  // Экран «спасибо»
  function showThanks() {
    shareForm.classList.add('is-sent');
    statusEl.classList.remove('is-error');
    statusEl.innerHTML = 'Спасибо, история получена.<span class="thanks-sub">Если захочешь добавить ещё один якорь — форма снова к твоим услугам.</span>' +
      '<button type="button" class="thanks-again" id="thanks-again">Рассказать ещё одну</button>';
    document.getElementById('thanks-again').addEventListener('click', function () {
      shareForm.reset();
      updateCounter();
      shareForm.classList.remove('is-sent');
      statusEl.textContent = '';
    });
  }

  shareForm.addEventListener('submit', function (event) {
    event.preventDefault();
    statusEl.textContent = '';
    statusEl.classList.remove('is-error');

    if (!validate()) {
      const firstBad = shareForm.querySelector('.field-error:not(:empty)');
      if (firstBad) firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Бот заполнил скрытое поле — делаем вид, что всё хорошо, но ничего не отправляем
    if (shareForm.elements.website.value) { showThanks(); return; }

    if (FORM_ENDPOINT.indexOf('https://') !== 0) {
      statusEl.classList.add('is-error');
      statusEl.textContent = 'Форма ещё не подключена к таблице: в script.js не вставлен адрес Apps Script.';
      return;
    }

    const data = new URLSearchParams();
    ['name', 'contact', 'story', 'website'].forEach(function (n) { data.append(n, shareForm.elements[n].value.trim()); });
    data.append('anchor', shareForm.querySelector('input[name="anchor"]:checked').value);

    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправляю…';

    // mode:'no-cors' — Google отвечает без CORS-заголовков, поэтому ответ мы не читаем.
    // Если сеть работает и запрос ушёл — считаем успехом.
    fetch(FORM_ENDPOINT, { method: 'POST', mode: 'no-cors', body: data })
      .then(function () { showThanks(); })
      .catch(function () {
        statusEl.classList.add('is-error');
        statusEl.textContent = 'Не получилось отправить. Проверь интернет и попробуй ещё раз.';
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить историю →';
      });
  });
}
