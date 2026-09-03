(function () {
  'use strict';

  const sky  = document.getElementById('sky');
  const sctx = sky.getContext('2d');
  const rockElements = document.querySelectorAll('.rock');
  const mountainTreeElements = document.querySelectorAll('.hill-tree');
  const treeElements = document.querySelectorAll('.tree');
  const dangoElements = document.querySelectorAll('.dango');
  const dangoRows = document.querySelectorAll('.dango-row');
  const sanboWrap = document.querySelector('.sanbo-wrap');
  let dangoCount = dangoElements.length;
  let W = 0, H = 0;
  const DPR = window.devicePixelRatio || 1;

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    sky.width  = W * DPR;
    sky.height = H * DPR;
    sky.style.width  = W + 'px';
    sky.style.height = H + 'px';
    sctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildStars();
    buildSusuki();
    buildClouds();
    randomizeMountainTrees();
    buildLeaves();
    randomizeRocks();
    randomizeDango();
  }

  function randomizeMountainTrees() {
    const positions = W < 480 ? [49, 70, 89] : [52, 70, 88];
    mountainTreeElements.forEach((tree, index) => {
      const xRatio = positions[index] / 100;
      tree.style.left = `${positions[index]}%`;
      const groundInset = Math.max(8, H * 0.012);
      tree.style.bottom = `${H * (1 - mountainSurfaceY(xRatio)) - groundInset}px`;
    });
  }

  function cubicPoint(start, controlOne, controlTwo, end, progress) {
    const inverse = 1 - progress;
    return inverse ** 3 * start
      + 3 * inverse ** 2 * progress * controlOne
      + 3 * inverse * progress ** 2 * controlTwo
      + progress ** 3 * end;
  }

  function mountainSurfaceY(xRatio) {
    const firstMountain = xRatio < 0.42
      ? cubicPoint(1, 0.72, 0.62, 0.78, xRatio / 0.42)
      : cubicPoint(0.78, 0.88, 0.68, 0.82, (xRatio - 0.42) / 0.58);
    const secondMountain = xRatio < 0.5
      ? cubicPoint(1, 0.84, 0.78, 0.88, xRatio / 0.5)
      : cubicPoint(0.88, 0.95, 0.82, 0.9, (xRatio - 0.5) / 0.5);
    return Math.min(firstMountain, secondMountain);
  }

  function randomizeDango() {
    updateDangoDisplay();
    sanboWrap.style.left = `${68 + Math.random() * 12}%`;
  }

  function updateDangoDisplay() {
    const visibleIndexes = [
      ...Array.from({ length: Math.max(0, dangoCount - 3) }, (_, index) => index),
      ...Array.from({ length: Math.min(3, dangoCount) }, (_, index) => index + 3),
    ];
    dangoElements.forEach((dango, index) => {
      dango.style.display = visibleIndexes.includes(index) ? 'block' : 'none';
    });
    dangoRows.forEach((row) => {
      row.style.display = [...row.children].some((dango) => dango.style.display !== 'none')
        ? 'flex'
        : 'none';
    });
  }

  function randomizeRocks() {
    const placedRocks = [];
    rockElements.forEach((rock, index) => {
      const rockWidth = rock.offsetWidth || 36;
      const maxLeft = Math.max(0, W - rockWidth);
      let left = 0;
      let foundSpace = false;

      for (let attempt = 0; attempt < 30; attempt++) {
        const candidate = Math.random() * maxLeft;
        const overlaps = placedRocks.some((placedLeft) => (
          candidate < placedLeft + rockWidth + 8 &&
          candidate + rockWidth + 8 > placedLeft
        ));
        if (!overlaps) {
          left = candidate;
          foundSpace = true;
          break;
        }
      }

      if (!foundSpace) {
        left = (index / rockElements.length) * maxLeft;
      }
      placedRocks.push(left);
      rock.style.left = `${left}px`;
      rock.style.right = 'auto';
      rock.style.bottom = `${index % 2 * 3}px`;
      rock.style.transform = `rotate(${Math.random() * 28 - 14}deg)`;
    });
  }

  let stars = [];
  function buildStars() {
    stars = [];
    const n = Math.round((W * H) / 5200);
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H * 0.72,
        r: Math.random() * 1.3 + 0.25,
        a: Math.random() * 0.5 + 0.28,
        p: Math.random() * Math.PI * 2,
        s: Math.random() * 0.02 + 0.007,
      });
    }
  }

  const MOON_XR = 0.65;
  const MOON_YR = 0.28;
  function mr() { return Math.min(W, H) * 0.12 + 16; }

  function drawMoon() {
    const mx = W * MOON_XR;
    const my = H * MOON_YR;
    const r  = mr();

    const corona = sctx.createRadialGradient(mx, my, r * 0.8, mx, my, r * 3.6);
    corona.addColorStop(0,    'rgba(255,235,140,0.30)');
    corona.addColorStop(0.5,  'rgba(255,210,80,0.08)');
    corona.addColorStop(1,    'rgba(0,0,0,0)');
    sctx.fillStyle = corona;
    sctx.beginPath();
    sctx.arc(mx, my, r * 3.6, 0, Math.PI * 2);
    sctx.fill();

    sctx.save();
    sctx.beginPath();
    sctx.arc(mx, my, r, 0, Math.PI * 2);
    const mg = sctx.createRadialGradient(mx - r * 0.15, my - r * 0.15, 0, mx, my, r);
    mg.addColorStop(0,    '#fffef8');
    mg.addColorStop(0.5,  '#fff2b5');
    mg.addColorStop(0.88, '#f2d458');
    mg.addColorStop(1,    '#d8b028');
    sctx.fillStyle = mg;
    sctx.shadowColor = 'rgba(255,220,90,0.65)';
    sctx.shadowBlur  = 22;
    sctx.fill();
    sctx.restore();

    sctx.save();
    sctx.beginPath();
    sctx.arc(mx, my, r, 0, Math.PI * 2);
    sctx.clip();
    sctx.filter = `blur(${r * 0.16}px)`;
    sctx.fillStyle = 'rgba(155,118,42,0.20)';
    [
      [-0.28, -0.04, 0.26],
      [-0.10,  0.36, 0.30],
      [ 0.33,  0.20, 0.22],
      [ 0.09, -0.26, 0.18],
      [ 0.42, -0.15, 0.17],
      [-0.44, -0.30, 0.15],
    ].forEach(([dx, dy, f]) => {
      sctx.beginPath();
      sctx.arc(mx + dx * r, my + dy * r, f * r, 0, Math.PI * 2);
      sctx.fill();
    });
    sctx.filter = 'none';
    sctx.restore();

    sctx.beginPath();
    sctx.arc(mx, my, r, 0, Math.PI * 2);
    sctx.strokeStyle = 'rgba(255,255,220,0.3)';
    sctx.lineWidth = 1.5;
    sctx.stroke();
  }

  let clouds = [];
  function buildClouds() {
    clouds = [];
    const mx = W * MOON_XR;
    const my = H * MOON_YR;
    for (let i = 0; i < 4; i++) {
      clouds.push({
        x: Math.random() * W,
        y: my + (Math.random() - 0.5) * H * 0.25,
        w: Math.random() * 240 + 180,
        h: Math.random() * 44 + 28,
        spd: Math.random() * 0.14 + 0.06,
        op: Math.random() * 0.09 + 0.05,
      });
    }
  }

  function drawClouds() {
    sctx.save();
    clouds.forEach(c => {
      c.x += c.spd;
      if (c.x - c.w * 0.5 > W) c.x = -c.w * 0.5;
      sctx.save();
      sctx.filter = 'blur(18px)';
      sctx.fillStyle = `rgba(220,225,240,${c.op})`;
      sctx.beginPath();
      sctx.ellipse(c.x, c.y, c.w * 0.5, c.h * 0.5, 0, 0, Math.PI * 2);
      sctx.fill();
      sctx.restore();
    });
    sctx.restore();
  }

  let leaves = [];
  const TREE_LEAF_COLORS = [
    'rgba(116,105,45,0.82)',
    'rgba(135,93,42,0.82)',
    'rgba(177,132,54,0.82)',
    'rgba(204,161,70,0.82)',
  ];

  function treeCrownBounds() {
    return [...treeElements].map((tree) => {
      const bounds = tree.getBoundingClientRect();
      return {
        left: bounds.left + bounds.width * 0.05,
        top: bounds.top,
        width: bounds.width * 0.92,
        height: bounds.height * 0.64,
      };
    });
  }

  function buildLeaves() {
    leaves = [];
    for (let i = 0; i < 12; i++) {
      leaves.push(makeLeaf(true, true));
    }
    for (let i = 0; i < 8; i++) {
      leaves.push(makeLeaf(true, true));
    }
  }

  function makeLeaf(init, fromTree, sourceIndex) {
    const crowns = treeCrownBounds();
    sourceIndex = fromTree && sourceIndex !== undefined
      ? sourceIndex % crowns.length
      : (fromTree ? Math.floor(Math.random() * crowns.length) : 0);
    const crown = crowns[sourceIndex];
    return {
      x: fromTree ? crown.left + Math.random() * crown.width : Math.random() * W,
      y: init
        ? (fromTree ? crown.top + Math.random() * crown.height : Math.random() * H)
        : (fromTree ? crown.top + Math.random() * crown.height : -20),
      vy: Math.random() * 0.7 + 0.4,
      vx: (Math.random() - 0.4) * 0.5,
      rot: Math.random() * Math.PI * 2,
      rs: (Math.random() - 0.5) * 0.035,
      sz: Math.random() * 10 + 8,
      osc: Math.random() * 80,
      color: TREE_LEAF_COLORS[Math.floor(Math.random() * TREE_LEAF_COLORS.length)],
      floorY: H + 10,
      fromTree,
      sourceIndex,
    };
  }

  function drawLeaves() {
    leaves.forEach((l, i) => {
      l.y  += l.vy;
      l.rot += l.rs;
      l.x  += Math.sin(l.y * 0.018 + l.osc) * 0.9 + l.vx;
      if (l.y > l.floorY) leaves[i] = makeLeaf(false, l.fromTree, l.sourceIndex);

      sctx.save();
      sctx.translate(l.x, l.y);
      sctx.rotate(l.rot);
      sctx.fillStyle = l.color;

      const s = l.sz;
      sctx.beginPath();
      sctx.moveTo(0, -s * 0.6);
      sctx.lineTo( s * 0.22, -s * 0.18);
      sctx.lineTo( s * 0.6,  -s * 0.38);
      sctx.lineTo( s * 0.28,  s * 0.04);
      sctx.lineTo( s * 0.52,  s * 0.38);
      sctx.lineTo( 0,         s * 0.22);
      sctx.lineTo(-s * 0.52,  s * 0.38);
      sctx.lineTo(-s * 0.28,  s * 0.04);
      sctx.lineTo(-s * 0.6,  -s * 0.38);
      sctx.lineTo(-s * 0.22, -s * 0.18);
      sctx.closePath();
      sctx.fill();
      sctx.restore();
    });
  }

  let susuki = [];
  let windT  = 0;

  function buildSusuki() {
    susuki = [];
    const n = Math.max(28, Math.floor(W / 22));
    for (let i = 0; i < n; i++) {
      susuki.push({
        x: (i / (n - 1)) * (W + 80) - 40,
        baseY: H + 4,
        h:    Math.random() * H * 0.22 + H * 0.12,
        lean: (Math.random() - 0.35) * 0.28,
        spd:  Math.random() * 0.018 + 0.01,
        off:  Math.random() * Math.PI * 2,
        pl:   Math.random() * 34 + 26,
      });
    }
  }

  function drawSusuki() {
    windT += 0.015;
    const wind = Math.sin(windT * 0.68) * 15;
    susuki.forEach(s => {
      const sw   = Math.sin(windT + s.off) * 12 + wind;
      const tipX = s.x + s.lean * 34 + sw;
      const tipY = s.baseY - s.h;
      const cX   = s.x + sw * 0.38;
      const cY   = s.baseY - s.h * 0.5;

      sctx.beginPath();
      sctx.moveTo(s.x, s.baseY);
      sctx.quadraticCurveTo(cX, cY, tipX, tipY);
      sctx.strokeStyle = 'rgba(50,44,32,0.92)';
      sctx.lineWidth = 2.0;
      sctx.stroke();

      sctx.save();
      sctx.strokeStyle = 'rgba(235,218,178,0.36)';
      sctx.lineWidth = 1.0;
      for (let j = 0; j < 11; j++) {
        const t  = j / 11;
        const px = (1-t)*(1-t)*s.x + 2*(1-t)*t*cX + t*t*tipX;
        const py = (1-t)*(1-t)*s.baseY + 2*(1-t)*t*cY + t*t*tipY;
        const pl = s.pl * (1 - t * 0.4);
        const ag = Math.atan2(tipY - cY, tipX - cX) + Math.sin(j) * 0.34;
        sctx.beginPath();
        sctx.moveTo(px, py);
        sctx.lineTo(px + Math.cos(ag) * pl, py + Math.sin(ag) * pl);
        sctx.stroke();
      }
      sctx.restore();
    });
  }

  function drawLandscape() {
    const by = H;

    sctx.save();
    sctx.fillStyle = '#06090f';
    sctx.beginPath();
    sctx.moveTo(-10, by);
    sctx.bezierCurveTo(W*0.08, by - H*0.28, W*0.25, by - H*0.38, W*0.42, by - H*0.22);
    sctx.bezierCurveTo(W*0.56, by - H*0.12, W*0.72, by - H*0.32, W+10, by - H*0.18);
    sctx.lineTo(W+10, by);
    sctx.closePath();
    sctx.fill();

    sctx.fillStyle = '#080d18';
    sctx.beginPath();
    sctx.moveTo(-10, by);
    sctx.bezierCurveTo(W*0.12, by - H*0.16, W*0.3, by - H*0.22, W*0.5, by - H*0.12);
    sctx.bezierCurveTo(W*0.65, by - H*0.05, W*0.8, by - H*0.18, W+10, by - H*0.1);
    sctx.lineTo(W+10, by);
    sctx.closePath();
    sctx.fill();

    const fieldTop = by - H * 0.09;
    const fieldH   = H * 0.09;
    const rows = 8;
    for (let r = 0; r < rows; r++) {
      const t  = r / rows;
      const ry = fieldTop + t * fieldH;
      const rh = (fieldH / rows) * 0.45;
      const opa = 0.06 + t * 0.04;
      sctx.fillStyle = `rgba(80,120,100,${opa})`;
      sctx.fillRect(0, ry, W, rh);
    }

    const reflectX = W * MOON_XR;
    const reflectW = mr() * 0.6;
    const refGrd = sctx.createLinearGradient(0, fieldTop, 0, by);
    refGrd.addColorStop(0, `rgba(255,235,140,0.14)`);
    refGrd.addColorStop(1, 'rgba(255,235,140,0)');
    sctx.fillStyle = refGrd;
    sctx.beginPath();
    sctx.ellipse(reflectX, fieldTop + fieldH * 0.5, reflectW, fieldH * 0.6, 0, 0, Math.PI * 2);
    sctx.fill();

    sctx.restore();
  }

  function render() {
    requestAnimationFrame(render);

    const grd = sctx.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0,    '#030610');
    grd.addColorStop(0.42, '#091025');
    grd.addColorStop(0.80, '#161d38');
    grd.addColorStop(1,    '#1c1830');
    sctx.fillStyle = grd;
    sctx.fillRect(0, 0, W, H);

    stars.forEach(s => {
      s.p += s.s;
      const a = s.a + Math.sin(s.p) * 0.2;
      sctx.globalAlpha = Math.max(0.05, Math.min(1, a));
      sctx.fillStyle = '#fff';
      sctx.beginPath();
      sctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      sctx.fill();
    });
    sctx.globalAlpha = 1;

    drawMoon();
    drawClouds();
    drawLandscape();
    drawSusuki();
    drawLeaves();
  }

  window.addEventListener('DOMContentLoaded', () => {
    resize();
    requestAnimationFrame(render);
  });

  window.addEventListener('resize', resize);

})();
