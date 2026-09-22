export function applyViewState({ state, selected, names, cats, statements = [], filter, onFilter }) {
  document.body.className = state;

  const homeLabels = document.querySelector('#home-labels');
  const footer = document.querySelector('footer');
  const category = document.querySelector('#category');
  const number = document.querySelector('#number');
  const title = document.querySelector('#category-title');
  const filters = document.querySelector('#filters');
  const statement = document.querySelector('#category-statement');

  if (homeLabels) homeLabels.inert = state !== 'home';
  if (footer) footer.inert = state !== 'home';
  if (category) category.hidden = state === 'home';
  if (number) number.textContent = `0${selected + 1}`;
  if (title) title.textContent = names[selected];
  if (statement) statement.textContent = statements[selected] || '';

  // Keep the expanded header typography in sync with the active portfolio mode.
  // HTML order is Architect / Researcher / Writer; content order is Writing / Architecture / Research.
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
  wrap.className = selected === 0 ? 'writing-list' : `gallery ${selected === 2 ? 'research' : ''}`.trim();

  titles[selected].forEach((title, i) => {
    const category = cats[selected][selected === 1 ? [1, 0, 2, 1][i] : i % 3];
    if (filter !== 'All' && filter !== category) return;

    const button = document.createElement('button');
    button.type = 'button';
    if (selected === 0) button.className = 'writing-row';

    const img = document.createElement('img');
    img.src = `assets/index-${[0, 4, 8][selected] + i}.png`;
    img.alt = `${title} — reference image`;
    img.loading = 'lazy';
    img.decoding = 'async';

    const content = document.createElement('span');
    content.className = 'item-copy';
    const itemTitle = document.createElement('span');
    itemTitle.className = 'item-title';
    itemTitle.textContent = title;

    const description = document.createElement('span');
    description.className = selected === 0 ? 'item-description' : 'item-meta';
    description.textContent = subs[selected][i];
    content.append(itemTitle, description);
    button.append(img, content);

    if (selected === 0) {
      const date = document.createElement('span');
      date.className = 'item-meta date';
      date.textContent = ['Mar 12, 2024', 'Feb 3, 2024', 'Jan 18, 2024', 'Dec 2, 2023'][i];
      const arrow = document.createElement('span');
      arrow.textContent = '→';
      button.append(date, arrow);
    } else {
      const year = document.createElement('span');
      year.className = 'item-meta';
      year.textContent = i === 0 ? '2024' : i === 3 ? '2022' : '2023';
      content.append(year);
      const arrow = document.createElement('span');
      arrow.className = 'item-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '↗';
      button.append(arrow);
    }

    button.addEventListener('click', () => onOpen(title));
    wrap.append(button);
  });

  el.append(wrap);
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
