const canvas = document.getElementById('canvas');

const engine = new FireflyEngine(canvas, {
  count: 55,
  color: [255, 210, 100],
  minSize: 2,
  maxSize: 5,
  repulsionRadius: 110,
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
  const v = +e.target.value * 0.07;
  $('speed-val').textContent = v.toFixed(2);
  engine.options.baseSpeed = v;
  // Bring in-flight fireflies up to the new speed right away
  for (const f of engine.fireflies) {
    if (f.speed < v) f.speed = v;
  }
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
