import {PROJECT_RECORDS,IMAGE_SIZES} from './content-data.js';
let detailExitTimer = 0;
let detailEnterTimer = 0;
let categoryEnterTimer = 0;
let detailOpener = null;

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

  if (detail) {
    clearTimeout(detailExitTimer);
    clearTimeout(detailEnterTimer);
    detail.hidden = true;
    detail.inert = true;
    detail.dataset.phase = 'idle';
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
  wrap.dataset.section=['writing','architecture','research'][selected];
  wrap.dataset.phase = 'enter';

  PROJECT_RECORDS[selected].forEach((record,i)=>{
    if(filter!=='All'&&filter!==record.type)return;
    const button=document.createElement('button');button.type='button';button.className='project-card';
    const img=document.createElement('img');img.src=record.cover;img.alt=record.title+' — original portfolio image';img.decoding='async';img.loading='lazy';
    const copy=document.createElement('span');copy.className='item-copy';
    const title=document.createElement('span');title.className='item-title';title.textContent=record.title;
    const type=document.createElement('span');type.className='item-type';type.textContent=record.year;
    copy.append(title,type);button.append(img,copy);
    button.addEventListener('click',()=>{detailOpener=button;onOpen({...record,selected,index:i});});wrap.append(button);
  });
  el.append(wrap);
  setTimeout(() => { if (wrap.isConnected) wrap.dataset.phase = 'ready'; }, 16);
}

export function showProjectDetail(record) {
  const {title,hero:image,type:category,year,selected=0,summary,subtitle,source,gallery=[],credit,instructors,location}=record;
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
  card.dataset.section=['writing','architecture','research'][selected];
  card.scrollTop=0;
  card.inert = false;
  card.dataset.phase = 'enter';
  card.hidden = false;
  document.body.classList.add('detail-open');
  img.src = record.cover;
  img.alt = `${title} — project preview`;
  heading.textContent = title;
  kicker.textContent = [location,year].filter(Boolean).join(' · ');
  card.querySelector('.project-credits').open=false;
  categoryNode.textContent = [location,credit,instructors&&'Instructor: '+instructors].filter(Boolean).join(' · ');
  yearNode.textContent = source;
  text.textContent=summary; text.hidden=!summary;
  const plates=document.querySelector('#project-plates');plates.replaceChildren();
  for(const item of gallery){const figure=document.createElement('figure');const image=document.createElement('img');image.src=item.image;const size=IMAGE_SIZES[item.image];if(size){image.width=size[0];image.height=size[1];}image.alt=item.caption;image.loading='lazy';image.decoding='async';const caption=document.createElement('figcaption');caption.textContent=String(item.page).padStart(2,'0')+' / '+item.caption;const zoom=document.createElement('a');zoom.href=item.image;zoom.target='_blank';zoom.rel='noopener';zoom.setAttribute('aria-label','Open full-resolution image: '+item.caption);zoom.append(image);figure.append(zoom);plates.append(figure);}
  img.alt=title+' — original portfolio rendering';

  detailEnterTimer = setTimeout(() => { if (!card.hidden) {card.dataset.phase = 'ready';document.querySelector('#detail-close')?.focus({preventScroll:true});} }, 16);
}

export function hideProjectDetail() {
  const card = document.querySelector('#detail-card');
  if (!card || card.hidden) return;
  clearTimeout(detailEnterTimer);
  clearTimeout(detailExitTimer);
  card.inert = true;
  card.dataset.phase = 'exit';
  document.body.classList.remove('detail-open');
  detailOpener?.focus({preventScroll:true});
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
