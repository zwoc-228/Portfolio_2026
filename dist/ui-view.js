let detailExitTimer = 0;
let detailEnterTimer = 0;
let categoryEnterTimer = 0;

export function applyViewState({ state, selected, names, cats, statements = [], filter, onFilter }) {
  document.body.className = state;

  const homeLabels = document.querySelector('#home-labels');
  const footer = document.querySelector('footer');
  const category = document.querySelector('#category');
  const number = document.querySelector('#number');
  const title = document.querySelector('#category-title');
  const filters = document.querySelector('#filters');
  const statement = document.querySelector('#category-statement');
  const detail = document.querySelector('#detail-card');

  if (homeLabels) homeLabels.inert = state !== 'home';
  if (footer) footer.inert = state !== 'home';

  if (category) {
    clearTimeout(categoryEnterTimer);
    if (state === 'home') {
      category.hidden = true;
      category.dataset.phase = 'idle';
    } else {
      category.dataset.phase = 'enter';
      category.hidden = false;
      categoryEnterTimer = setTimeout(() => { if (!category.hidden) category.dataset.phase = 'ready'; }, 16);
    }
  }

  if (detail && state !== 'index') {
    clearTimeout(detailExitTimer);
    clearTimeout(detailEnterTimer);
    detail.hidden = true;
    document.body.classList.remove('detail-open');
  }

  if (number) number.textContent = `0${selected + 1}`;
  if (title) title.textContent = names[selected];
  if (statement) statement.textContent = statements[selected] || '';

  const roleMap = [2, 0, 1];
  document.querySelectorAll('.profession [data-role-index]').forEach((node) => {
    node.classList.toggle('active', state !== 'home' && Number(node.dataset.roleIndex) === roleMap[selected]);
  });

  if (!filters) return;
  filters.replaceChildren();
  const values = state === 'index' ? ['All', ...cats[selected]] : cats[selected];

  for (const value of values) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = value;
    button.classList.toggle('active', value === filter);
    button.addEventListener('click', () => onFilter(value));
    filters.append(button);
  }
}

export function syncFilterButtons(filter) {
  document.querySelectorAll('#filters button').forEach((button) => {
    button.classList.toggle('active', button.textContent === filter);
  });
}

export function renderIndex({ state, selected, filter, cats, titles, subs, onOpen }) {
  const el = document.querySelector('#index-content');
  if (!el) return;
  el.replaceChildren();
  if (state !== 'index') return;

  const wrap = document.createElement('div');
  wrap.className = 'gallery unified-gallery';
  wrap.dataset.phase = 'enter';

  titles[selected].forEach((title, i) => {
    const category = cats[selected][selected === 1 ? [1, 0, 2, 1][i] : i % 3];
    if (filter !== 'All' && filter !== category) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'project-card';

    const img = document.createElement('img');
    const imageIndex = [0, 4, 8][selected] + i;
    img.src = `assets/index-${imageIndex}.png`;
    img.alt = `${title} — reference image`;
    img.loading = 'eager';
    img.decoding = 'async';

    const content = document.createElement('span');
    content.className = 'item-copy';

    const itemTitle = document.createElement('span');
    itemTitle.className = 'item-title';
    itemTitle.textContent = title;

    const description = document.createElement('span');
    description.className = 'item-meta';
    description.textContent = subs[selected][i];

    const year = document.createElement('span');
    year.className = 'item-meta item-year';
    year.textContent = i === 0 ? '2024' : i === 3 ? '2022' : '2023';

    content.append(itemTitle, description, year);
    button.append(img, content);

    const arrow = document.createElement('span');
    arrow.className = 'item-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    button.append(arrow);

    button.addEventListener('click', () => onOpen({
      title,
      image: img.src,
      category: subs[selected][i],
      year: year.textContent,
      selected,
      index: i
    }));
    wrap.append(button);
  });

  el.append(wrap);
  setTimeout(() => { if (wrap.isConnected) wrap.dataset.phase = 'ready'; }, 16);
}

export function showProjectDetail({ title, image, category, year, selected = 0 }) {
  const card = document.querySelector('#detail-card');
  const img = document.querySelector('#detail-image');
  const heading = document.querySelector('#detail-title');
  const text = document.querySelector('#detail-text');
  const kicker = document.querySelector('#detail-kicker');
  const categoryNode = document.querySelector('#detail-category');
  const yearNode = document.querySelector('#detail-year');
  if (!card || !img || !heading || !text || !kicker || !categoryNode || !yearNode) return;

  clearTimeout(detailExitTimer);
  clearTimeout(detailEnterTimer);
  card.dataset.phase = 'enter';
  card.hidden = false;
  document.body.classList.add('detail-open');
  img.src = image;
  img.alt = `${title} — project preview`;
  heading.textContent = title;
  kicker.textContent = `0${selected + 1} · Selected work`;
  categoryNode.textContent = category;
  yearNode.textContent = year;
  text.textContent = 'A focused study of material, atmosphere, representation, and spatial relationships. The project develops through drawings, models, images, and written observations, allowing the work to be read at a slower scale than the surrounding index. Extended documentation can continue here as the project grows.';

  detailEnterTimer = setTimeout(() => { if (!card.hidden) card.dataset.phase = 'ready'; }, 16);
}

export function hideProjectDetail() {
  const card = document.querySelector('#detail-card');
  if (!card || card.hidden) return;
  clearTimeout(detailEnterTimer);
  clearTimeout(detailExitTimer);
  card.dataset.phase = 'exit';
  document.body.classList.remove('detail-open');
  detailExitTimer = setTimeout(() => { card.hidden = true; card.dataset.phase = 'idle'; }, 170);
}

export function showInfo(title, text) {
  const dialog = document.querySelector('#info');
  const body = document.querySelector('#info-body');
  if (!dialog || !body) return;

  body.replaceChildren();
  const heading = document.createElement('h2');
  heading.textContent = title;
  const paragraph = document.createElement('p');
  paragraph.textContent = text;
  body.append(heading, paragraph);
  dialog.showModal();
}
