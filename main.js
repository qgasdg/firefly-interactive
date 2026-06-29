const canvas = document.getElementById('canvas');

const engine = new FireflyEngine(canvas, {
  count: 55,
  color: [255, 210, 100],
  minSpeed: 0.12,
  maxSpeed: 0.22,
  minSize: 2,
  maxSize: 5,
  repulsionRadius: 110,
  repulsionForce: 0.32,
});

engine.start();

// --- Controls ---

const $ = id => document.getElementById(id);

function restart(patch = {}) {
  engine.stop();
  Object.assign(engine.options, patch);
  engine.start();
}

$('count').addEventListener('input', e => {
  const v = +e.target.value;
  $('count-val').textContent = v;
  restart({ count: v });
});

$('radius').addEventListener('input', e => {
  const v = +e.target.value;
  $('radius-val').textContent = v;
  engine.options.repulsionRadius = v;
});

$('speed').addEventListener('input', e => {
  const raw = +e.target.value;
  const min = (raw / 100) * 0.8;
  const max = min + 0.1;
  $('speed-val').textContent = ((min + max) / 2).toFixed(2);
  restart({ minSpeed: min, maxSpeed: max });
});

$('size').addEventListener('input', e => {
  const raw = +e.target.value;
  const min = raw * 0.4;
  const max = raw;
  $('size-val').textContent = ((min + max) / 2).toFixed(1);
  restart({ minSize: min, maxSize: max });
});

document.querySelectorAll('.preset').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.preset').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const color = btn.dataset.color.split(',').map(Number);
    engine.options.color = color;
  });
});
