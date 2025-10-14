const API_BASE_URL = 'http://localhost:5678/api';

async function fetchWorks() {
  const res = await fetch(`${API_BASE_URL}/works`);
  return res.json();
}

async function fetchCategories() {

  const res = await fetch(`${API_BASE_URL}/categories`);
  return res.json();

}

function renderWorks(list) {

  const gallery = document.querySelector('.gallery');
  gallery.innerHTML = '';

  list.forEach(w => {

    const fig = document.createElement('figure');
    const img = document.createElement('img');
    const cap = document.createElement('figcaption');

    img.src = w.imageUrl;
    img.alt = w.title;
    cap.textContent = w.title;

    fig.append(img, cap);
    gallery.append(fig);
  });
}

function renderFilters(categories, works) {

  const bar = document.querySelector('.filtres');
  if (!bar) return;
  
  bar.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.textContent = 'Tous';
  allBtn.classList.add('active');
  bar.append(allBtn);

  allBtn.addEventListener('click', () => {
    renderWorks(works);
    setActive(allBtn);
  });

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat.name;
    bar.append(btn);
    btn.addEventListener('click', () => {
      const filtered = works.filter(w => w.categoryId === cat.id);
      renderWorks(filtered);
      setActive(btn);
    });
  });
}

function setActive(btn) {
  document.querySelectorAll('.filtres button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

/*function loginButton(btn) {
  
}*/

async function init() {
  const works = await fetchWorks();
  const categories = await fetchCategories();
  renderWorks(works);
  renderFilters(categories, works);
}

init();
