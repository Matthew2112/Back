
document.documentElement.classList.add('js');
const anchorWords = [
  'билет', 'запах духов', 'голос', 'открытка',
  'мелодия', 'модель машинки', 'засушенный цветок', 'вкус блюда'
];
let wordIndex = 0;
const wordEl = document.getElementById('cycling-word');

if (wordEl) {
  setInterval(function () {
    wordEl.classList.add('is-fading');

    setTimeout(function () {
      wordIndex = (wordIndex + 1) % anchorWords.length;  
      wordEl.textContent = anchorWords[wordIndex];
      wordEl.classList.remove('is-fading');
    }, 400);
  }, 2200);
}


const anchorCards = document.querySelectorAll('.anchor-card');
anchorCards.forEach(function (card) {
  card.addEventListener('click', function () {
    card.classList.toggle('is-open');
  });
});


const timelineItems = document.querySelectorAll('.timeline-item');
timelineItems.forEach(function (item) {
  item.addEventListener('click', function () {
    item.classList.toggle('is-open');
  });
});


const methodsGrid = document.querySelector('.methods-grid');

if (methodsGrid) {
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-on');
        observer.unobserve(entry.target); 
      }
    });
  }, {
    threshold: 0.45   
  });

  observer.observe(methodsGrid);
}


const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwLIxQTYFOwjNMHIIJ4JLYQrehqhlpVARoKA2I0EhJGYRm4258GZ34259ksLg5gbZ1H/exec';

const shareForm = document.getElementById('share-form');

if (shareForm) {
  const statusEl  = document.getElementById('form-status');
  const submitBtn = document.getElementById('share-submit');
  const storyEl   = document.getElementById('f-story');
  const counterEl = document.getElementById('story-counter');


  function updateCounter() {
    counterEl.textContent = storyEl.value.length + ' / ' + storyEl.maxLength;
  }
  storyEl.addEventListener('input', updateCounter);
  updateCounter();


  function setError(name, text) {
    const box = shareForm.querySelector('.field-error[data-for="' + name + '"]');
    if (!box) return;
    box.textContent = text || '';
    const field = box.closest('.field');
    if (field) field.classList.toggle('has-error', !!text);
  }


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
