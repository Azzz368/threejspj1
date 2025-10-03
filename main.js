import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(6, 1.0, 5.5);
camera.lookAt(3.5, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = false;
document.body.appendChild(renderer.domElement);
// 预加载遮罩
const loadingOverlay = document.createElement('div');
loadingOverlay.style.position = 'fixed';
loadingOverlay.style.inset = '0';
loadingOverlay.style.background = '#ffffff';
loadingOverlay.style.display = 'flex';
loadingOverlay.style.alignItems = 'center';
loadingOverlay.style.justifyContent = 'center';
loadingOverlay.style.fontFamily = '"Sitka", serif';
loadingOverlay.style.fontSize = '24px';
loadingOverlay.style.color = '#000';
loadingOverlay.style.zIndex = '9999';
loadingOverlay.textContent = 'Loading…';
document.body.appendChild(loadingOverlay);
// 悬停触发区域（顶部/底部）
const hoverTop = document.createElement('div');
hoverTop.style.position = 'fixed';
hoverTop.style.left = '0';
hoverTop.style.right = '0';
hoverTop.style.top = '0';
hoverTop.style.height = '20vh';
hoverTop.style.zIndex = '9998';
hoverTop.style.pointerEvents = 'auto';
hoverTop.style.background = 'transparent';
document.body.appendChild(hoverTop);

const hoverBottom = document.createElement('div');
hoverBottom.style.position = 'fixed';
hoverBottom.style.left = '0';
hoverBottom.style.right = '0';
hoverBottom.style.bottom = '0';
hoverBottom.style.height = '20vh';
hoverBottom.style.zIndex = '9998';
hoverBottom.style.pointerEvents = 'auto';
hoverBottom.style.background = 'transparent';
document.body.appendChild(hoverBottom);


const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// 源文本库（用于点击后在左侧展示对应诗句）
const poemSource = `I have gone marking the atlas of your bodywith crosses of fire.

My mouth went across:a spider trying to hide.In you, behind you, timid, driven by thirst.

Stories to tell you on the shore of the evening,sad and gentle doll, so that you should not be sad.

A swan, a tree,something far away and happy.The season of grapes, the ripe and fruitful season.

I who lived in a harbour from which I loved you.The solitude crossed with dream and with silence.

Penned up between the sea and sadness.Soundless, delirious, between two motionless gondoliers.

Between the lips and the voice something goes dying.

Something with the wings of a bird, something of anguish and oblivion.
The way nets cannot hold water.

My toy doll, only a few drops are left trembling.

Even so,something sings in these fugitive words.

Something sings, something climbs to myravenous outh.
Oh to be able to celebrate you with all the words of joy.

Sing,burn, flee,like abelfry at the hands of a madman.
My sad tenderness,what comes over you all at once?

When I have reached the most awesome and the coldest summit,my heart closes like a nocturnal flower.

The memory of you emerges from the night around me.
The river mingles its stubborn lament with the sea.

Deserted like the dwarves at dawn.
It is the hour of departure, oh deserted one!

Cold flower heads are raining over my heart.
Oh pit of debris, fierce cave of the shipwrecked.

In you the wars and the flights accumulated.
From you the wings of the song birds rose.

You swallowed everything, like distance.
Like the sea, like time. In you everything sank!

It was the happy hour of assault and the kiss.
The hour of the spell that blazed like a lighthouse.

Pilot's dread, fury of blind driver,
turbulent drunkenness of love, in you everything sank!

In the childhood of mist my soul, winged and wounded.
Lost discoverer, in you everything sank!

You girdled sorrow, you clung to desire,
sadness stunned you, in you everything sank!

I made the wall of shadow draw back,
beyond desire and act, I walked on.

Oh flesh, my own flesh, woman whom I loved and lost,
I summon you in the moist hour, I raise my song to you.

Leaning into the afternoons I cast my sad nets towards your oceanic eyes.

There in the highest blaze my solitude lengthens and flames, its arms turning like a drowning man's.

I sent out red signals across your absent eyes that move like the sea near a lighthouse.

You keep only darkness, my distant female, from your regard sometimes the coast of dread emerges.

Leaning into the afternoons I fling my sad nets to the sea that beats on your marine eyes.

The birds peck at the first stars that flash like my soul when I love you.

The night on its shadowy mare shedding blue tassels over the land.`;
const poemLines = poemSource.split('\n').filter(l => l.trim().length > 0);

// 中文翻译映射
const translationMap = {
  "I have gone marking the atlas of your bodywith crosses of fire.": "我以火的十字在你身体的地图上烙下印记离去。",
  "My mouth went across:a spider trying to hide.In you, behind you, timid, driven by thirst.": "我的嘴穿过，像一只蜘蛛，试著藏躲。在你体内、在你身後，畏怯的，被渴求驱使。",
  "Stories to tell you on the shore of the evening,sad and gentle doll, so that you should not be sad.": "在暮色的沙滩上有好多的故事要告诉你，哀伤而温驯的娃娃，你不会再哀伤了。",
  "A swan, a tree,something far away and happy.The season of grapes, the ripe and fruitful season.": "一只天鹅，一棵树，某些远离并令人快乐的事物。葡萄的季节，收割与丰收的季节。",
  "I who lived in a harbour from which I loved you.The solitude crossed with dream and with silence.": "我是住在海港并爱你的人。孤寂被梦和沈默穿过。",
  "Penned up between the sea and sadness.Soundless, delirious, between two motionless gondoliers.": "在海与哀伤之间被囚禁。无声的，谵语的，在两个不动的船夫之间。。",
  "Between the lips and the voice something goes dying.": "在双唇与声音之间的某些事物逝去。",
  "Something with the wings of a bird, something of anguish and oblivion.The way nets cannot hold water.": "鸟的双翼的某些事物，苦痛与遗忘的某些事物。如同网无法握住水一样。",
  "My toy doll, only a few drops are left trembling.": "我的娃娃，仅剩下少量的水滴在颤抖了。",
  "Even so,something sings in these fugitive words.": "即使这样，仍有某些事物在无常的话语中歌唱。",
  "Something sings, something climbs to myravenous outh.": "某些事物歌唱，某些爬上我渴求的嘴的事物。",
  "Oh to be able to celebrate you with all the words of joy.": "啊，要以全部的欢乐的话语才能歌颂你。",
  "Sing,burn, flee,like abelfry at the hands of a madman.": "歌唱，焚烧，逃逸，像一个疯子手中的钟楼。",
  "My sad tenderness,what comes over you all at once?": "我哀伤的温柔，突然涌上你身上的是什么?",
  "When I have reached the most awesome and the coldest summit,my heart closes like a nocturnal flower.": "当我到达最寒冷与庄严的天顶，我的心，如黑夜中的花朵般敛闭。",
  "The memory of you emerges from the night around me.": "与你相关的记忆自围绕我的夜色中浮现",
  "The river mingles its stubborn lament with the sea.": "河流将他最冥顽的哀叹抛向大海",
  "Deserted like the dwarves at dawn.": "像黎明的码头那样被抛弃。",
  "It is the hour of departure, oh deserted one!": "是出发的时刻了，被抛弃的人啊！",
  "Cold flower heads are raining over my heart.": "冰冷的花冠雨点般落在我心上。",
  "Oh pit of debris, fierce cave of the shipwrecked.": "啊，瓦砾的坑，沉船的残酷洞穴。",
  "In you the wars and the flights accumulated.": "在你那里战争和飞行递增。",
  "From you the wings of the song birds rose.": "从那里鸣鸟拍翼而起。",
  "You swallowed everything, like distance.": "你吞并一切，像远方。",
  "Like the sea, like time. In you everything sank!": "像大海，像时间。所有的一切在你身上沈没！",
  "It was the happy hour of assault and the kiss.": "这是突袭与亲吻的幸福时刻。",
  "The hour of the spell that blazed like a lighthouse.": "这迷魅的时刻像灯塔一样燃烧。",
  "Pilot's dread, fury of blind driver,": "飞行员的惊怖、盲潜水夫的狂怒，",
  "turbulent drunkenness of love, in you everything sank!": "激狂的爱的迷醉，所有的一切在你身上沈没！",
  "In the childhood of mist my soul, winged and wounded.": "在迷雾的童年之中，我的灵魂张开翅膀并且受伤。",
  "Lost discoverer, in you everything sank!": "迷失方向的探险者，所有的一切在你身上沈没！",
  "You girdled sorrow, you clung to desire,": "你围捆哀伤，你迷恋欲望，",
  "sadness stunned you, in you everything sank!": "悲哀令你茫然若失，所有的一切在你身上沈没！",
  "I made the wall of shadow draw back,": "我让影子的墙隐没，",
  "beyond desire and act, I walked on.": "越过欲望与行动，我走着。",
  "Oh flesh, my own flesh, woman whom I loved and lost,": "啊肉，我自身的肉，我爱过而又失去的女人。",
  "I summon you in the moist hour, I raise my song to you.": "在潮湿的时刻，我呼唤你，我向你唱起我的歌。",
  "Leaning into the afternoons I cast my sad nets towards your oceanic eyes.": "倚身在暮色里，我朝你海洋般的双眼投掷我哀伤的网。",
  "There in the highest blaze my solitude lengthens and flames, its arms turning like a drowning man's.": "我的孤独，在极度的光亮中绵延不绝，化为火焰，双臂漫天飞舞仿佛将遭海难淹没。",
  "I sent out red signals across your absent eyes that move like the sea near a lighthouse.": "越过你失神的双眼，我送出红色的信号，你的双眼泛起涟漪，如靠近灯塔的海洋。",
  "You keep only darkness, my distant female, from your regard sometimes the coast of dread emerges.": "你保有黑暗，我远方的女子，在你的注视之下有时恐惧的海岸浮现。",
  "Leaning into the afternoons I fling my sad nets to the sea that beats on your marine eyes.": "倚身在暮色，在拍打你海洋般双眼的海上，我掷出我哀伤的网。",
  "The birds peck at the first stars that flash like my soul when I love you.": "夜晚的鸟群啄食第一阵群星，像爱著你的我的灵魂，闪烁著。",
  "The night on its shadowy mare shedding blue tassels over the land.": "夜在年阴郁的马上奔驰，在大地上撒下蓝色的穗须。"
};

// 左侧诗句面板（作为容器）
const quotePanel = document.createElement('div');
quotePanel.style.position = 'fixed';
quotePanel.style.left = '0';
quotePanel.style.top = '0';
quotePanel.style.bottom = '0';
quotePanel.style.width = '450px';
quotePanel.style.background = '#ffffff';
quotePanel.style.zIndex = '9997';
quotePanel.style.overflow = 'hidden'; // 隐藏溢出内容
document.body.appendChild(quotePanel);

// 创建随机位置的诗句元素（带淡入淡出效果）
function displayQuoteAtRandomPosition(text) {
  // 淡出旧内容
  const oldElements = quotePanel.querySelectorAll('.quote-text');
  oldElements.forEach(el => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 700); // 0.7s后移除
  });
  
  // 创建容器（包含英文和中文）
  const quoteContainer = document.createElement('div');
  quoteContainer.className = 'quote-text';
  quoteContainer.style.position = 'absolute';
  quoteContainer.style.maxWidth = '450px';
  quoteContainer.style.opacity = '0';
  quoteContainer.style.transition = 'opacity 0.7s ease-in-out';
  
  // 英文诗句
  const englishElement = document.createElement('div');
  englishElement.style.fontFamily = '"Sitka", serif';
  englishElement.style.fontSize = '20px';
  englishElement.style.fontWeight = '700';
  englishElement.style.color = '#000';
  englishElement.style.textAlign = 'left';
  englishElement.style.lineHeight = '1.35';
  englishElement.style.marginBottom = '8px';
  englishElement.textContent = text;
  
  // 中文翻译
  const chineseElement = document.createElement('div');
  chineseElement.style.fontFamily = 'SimSun, "宋体", serif';
  chineseElement.style.fontSize = '16px';
  chineseElement.style.fontWeight = '400';
  chineseElement.style.color = '#999999';
  chineseElement.style.textAlign = 'left';
  chineseElement.style.lineHeight = '1.5';
  const translation = translationMap[text] || '';
  chineseElement.textContent = translation;
  
  quoteContainer.appendChild(englishElement);
  if (translation) {
    quoteContainer.appendChild(chineseElement);
  }
  
  // x坐标：面板中线 ± 50px
  const centerX = 175; 
  const randomX = centerX + (Math.random() * 100 - 50); 
  
  // y坐标：上半部分随机
  const maxY = window.innerHeight * 0.5;
  const randomY = Math.random() * Math.max(0, maxY - 100);
  
  quoteContainer.style.left = `${randomX}px`;
  quoteContainer.style.top = `${randomY}px`;
  
  quotePanel.appendChild(quoteContainer);
  
  // 触发淡入动画（需要在DOM插入后的下一帧）
  requestAnimationFrame(() => {
    quoteContainer.style.opacity = '1';
  });
}

// 简单归一化匹配：按词匹配所在诗句
function normalizeTokens(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean);
}
function findSentenceForWord(word) {
  const target = word.toLowerCase();
  for (let i = 0; i < poemLines.length; i++) {
    const tokens = normalizeTokens(poemLines[i]);
    if (tokens.includes(target)) {
      return poemLines[i];
    }
  }
  // 未找到则返回包含该单词的第一行（宽松匹配）
  for (let i = 0; i < poemLines.length; i++) {
    if (poemLines[i].toLowerCase().indexOf(target) !== -1) return poemLines[i];
  }
  return word;
}

const poemText = `Leaning into the afternoons I cast my sad nets towards your oceanic eyes.
There in the highest blaze my solitude lengthens and flames, its arms turning like a drowning man's.
I sent out red signals across your absent eyes that move like the sea near a lighthouse.
You keep only darkness, my distant female, from your regard sometimes the coast of dread emerges.
Leaning into the afternoons I fling my sad nets to the sea that beats on your marine eyes.
The birds peck at the first stars that flash like my soul when I love you.
The night on its shadowy mare shedding blue tassels over the land.
The memory of you emerges from the night around me.
The river mingles its stubborn lament with the sea.
Deserted like the dwarves at dawn.
It is the hour of departure, oh deserted one!
Cold flower heads are raining over my heart.
Oh pit of debris, fierce cave of the shipwrecked.
In you the wars and the flights accumulated.
From you the wings of the song birds rose.
You swallowed everything, like distance.
Like the sea, like time. In you everything sank!
It was the happy hour of assault and the kiss.
The hour of the spell that blazed like a lighthouse.
Pilot's dread, fury of blind driver,
turbulent drunkenness of love, in you everything sank!
In the childhood of mist my soul, winged and wounded.
Lost discoverer, in you everything sank!
You girdled sorrow, you clung to desire,
sadness stunned you, in you everything sank!
I made the wall of shadow draw back,
beyond desire and act, I walked on.
Oh flesh, my own flesh, woman whom I loved and lost,
I summon you in the moist hour, I raise my song to you.
I have gone marking the atlas of your bodywith crosses of fire.
My mouth went across:a spider trying to hide.
In you, behind you, timid, driven by thirst.
Stories to tell you on the shore of the evening,sad and gentle doll, 
so that you should not be sad.A swan, a tree,something far away and happy.
The season of grapes, the ripe and fruitful season.
I who lived in a harbour from which I loved you.
The solitude crossed with dream and with silence.
Penned up between the sea and sadness.
Soundless, delirious, between two motionless gondoliers.
Between the lips and the voice something goes dying.
Something with the wings of a bird, something of anguish and oblivion.
The way nets cannot hold water.
My toy doll, only a few drops are left trembling.
Even so,something sings in these fugitive words.
Something sings, something climbs to myravenous outh.
Oh to be able to celebrate you with all the words of joy.
Sing,burn, flee,like abelfry at the hands of a madman.
My sad tenderness,what comes over you all at once?
When I have reached the most awesome and the coldest summitmy heart closes like a nocturnal flower.
`
;


const tiltGroup = new THREE.Group();
tiltGroup.position.x = 5.5; 
tiltGroup.rotation.z = -THREE.MathUtils.degToRad(35);
scene.add(tiltGroup);

const drumGroup = new THREE.Group();
tiltGroup.add(drumGroup);

// 存储每个单词的布局，用于交互
let wordBoxes = [];
let baseCanvasWidth = 0;
let baseCanvasHeight = 0;
let baseFontSize = 256;
let baseLineHeight = Math.floor(baseFontSize * 1.0);

function createTextCanvas(text) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  // 高分辨率画布
  canvas.width = 8192;
  canvas.height = 4096;
  baseCanvasWidth = canvas.width;
  baseCanvasHeight = canvas.height;
  baseFontSize = 256;
  baseLineHeight = Math.floor(baseFontSize * 1.0);
  
  // 透明背景，黑色Sitka字体
  context.fillStyle = 'black';
  context.font = `${baseFontSize}px "Sitka", serif`;
  context.textAlign = 'left';
  context.textBaseline = 'top';
  
  // 行高与边距（移除上下边距，仅保留极小左右边距）
  const paddingX = 20;
  const paddingRight = 20;
  const lineHeight = baseLineHeight;
  const maxLineWidth = canvas.width - paddingX - paddingRight;
  
  // 连续排版填充（记录所有单词位置）
  wordBoxes = [];
  const words = text.split(/\s+/).filter(w => w.length > 0);
  let wordIndex = 0;
  
  // 从负一行开始，到超出一行结束，确保垂直无缝
  const startY = -lineHeight;
  const endY = canvas.height + lineHeight;
  for (let y = startY; y <= endY; y += lineHeight) {
    let currentLine = '';
    const lineWords = [];
    const lineWordsWithSpace = [];
    // 先装配一行（直到宽度上限）
    while (true) {
      const nextWord = words[wordIndex];
      const tentative = currentLine + (currentLine ? ' ' : '') + nextWord;
      const width = context.measureText(tentative).width;
      if (width <= maxLineWidth) {
        currentLine = tentative;
        lineWords.push(nextWord);
        lineWordsWithSpace.push(nextWord + ' ');
        wordIndex = (wordIndex + 1) % words.length;
      } else {
        if (!currentLine) {
          // 极端超宽单词：强制放入一行
          lineWords.push(nextWord);
          lineWordsWithSpace.push(nextWord + ' ');
          wordIndex = (wordIndex + 1) % words.length;
        }
        break;
      }
    }
    
    // 逐词绘制并记录边界
    let cursorX = paddingX;
    for (let i = 0; i < lineWords.length; i++) {
      const w = lineWords[i];
      const wordWidth = context.measureText(w).width;
      const spaceWidth = context.measureText(' ').width;
      // 绘制单词
      context.fillText(w, cursorX, y);
      // 仅记录落入 [0, canvas.height) 可见区的单词框（用于交互）
      const yVis = y; // 顶部对齐
      if (yVis + lineHeight > 0 && yVis < canvas.height) {
        wordBoxes.push({
          x: cursorX,
          y: yVis,
          w: wordWidth,
          h: lineHeight,
          text: w
        });
      }
      cursorX += wordWidth + spaceWidth;
    }
  }
  
  return canvas;
}


const textCanvas = createTextCanvas(poemText);
const texture = new THREE.CanvasTexture(textCanvas);
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
texture.generateMipmaps = true;
texture.minFilter = THREE.LinearMipmapLinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.colorSpace = THREE.SRGBColorSpace;
texture.needsUpdate = true;
texture.repeat.set(1, 6);

const radius = 1.75;
const height = 20.0;
const segments = 128;

const cylinderGeometry = new THREE.CylinderGeometry(
  radius,
  radius,
  height,
  segments,
  1,
  true 
);

const cylinderMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  map: texture,
  side: THREE.DoubleSide,
    transparent: true,
  alphaTest: 0.1,
    depthWrite: false,
  roughness: 0.8,
  metalness: 0.0
});

const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

cylinder.castShadow = false;
scene.add(cylinder); 


drumGroup.add(cylinder);

// 覆盖层：用于绘制中灰色的非悬停单词
const overlayCanvas = document.createElement('canvas');
overlayCanvas.width = baseCanvasWidth / 2;
overlayCanvas.height = baseCanvasHeight / 2;
const overlayCtx = overlayCanvas.getContext('2d');
const overlayTexture = new THREE.CanvasTexture(overlayCanvas);
overlayTexture.wrapS = THREE.RepeatWrapping;
overlayTexture.wrapT = THREE.RepeatWrapping;
overlayTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
overlayTexture.generateMipmaps = true;
overlayTexture.minFilter = THREE.LinearMipmapLinearFilter;
overlayTexture.magFilter = THREE.LinearFilter;
overlayTexture.colorSpace = THREE.SRGBColorSpace;

const overlayMaterial = new THREE.MeshBasicMaterial({
  map: overlayTexture,
      transparent: true,
  side: THREE.DoubleSide,
      depthWrite: false,
  opacity: 1.0
});
const overlayCylinder = new THREE.Mesh(
  new THREE.CylinderGeometry(radius + 0.001, radius + 0.001, height, segments, 1, true),
  overlayMaterial
);
drumGroup.add(overlayCylinder);

const ringShape = new THREE.Shape();
ringShape.absarc(0, 0, radius, 0, Math.PI * 2, false);
const holePath = new THREE.Path();
holePath.absarc(0, 0, radius - 0.1, 0, Math.PI * 2, true);
ringShape.holes.push(holePath);

const ringGeometry = new THREE.ShapeGeometry(ringShape);
const ringMaterial = new THREE.MeshStandardMaterial({
  color: 0xcccccc,
  roughness: 0.5,
  metalness: 0.3
});

const topRing = new THREE.Mesh(ringGeometry, ringMaterial);
topRing.rotation.x = -Math.PI / 2;
topRing.position.y = height / 2;
topRing.castShadow = false;
topRing.visible = false;
drumGroup.add(topRing);

const bottomRing = new THREE.Mesh(ringGeometry, ringMaterial);
bottomRing.rotation.x = -Math.PI / 2;
bottomRing.position.y = -height / 2;
bottomRing.castShadow = false;
bottomRing.visible = false;
drumGroup.add(bottomRing);

let rotationSpeed = 0.0006; 
let currentRotationSpeed = 0.0006; // 当前实际速度
let targetRotationSpeed = 0.0006;  // 目标速度
const ROTATION_EASE = 0.1; // 旋转速度插值系数

// 悬停控制：恒定缓慢速度
let scrollOffset = 0; // 位移累计（世界单位）
let hoverDirection = 0; // -1 向下，+1 向上，0 停止
const HOVER_SCROLL_SPEED = 0.0038; // 恒定缓慢速度（每帧世界单位）

hoverTop.addEventListener('mouseenter', () => { hoverDirection = +1; });
hoverTop.addEventListener('mouseleave', () => { if (hoverDirection === +1) hoverDirection = 0; });
hoverBottom.addEventListener('mouseenter', () => { hoverDirection = -1; });
hoverBottom.addEventListener('mouseleave', () => { if (hoverDirection === -1) hoverDirection = 0; });

// 悬停暂停旋转 + 点击拾取 + 单词高亮
const raycaster = new THREE.Raycaster();
const mouseNDC = new THREE.Vector2();
let pauseRotation = false;
let hoveredWordIndex = -1;
let lastHoveredWordIndex = -1;
let dimOpacity = 0.0;        // 当前灰色遮罩透明度
let targetDimOpacity = 0.0;  // 目标透明度
const DIM_EASE = 0.15;       // 提高插值速度，更快响应
const MAX_DIM_OPACITY = 0.65;

function testIntersect(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  mouseNDC.set(x, y);
  raycaster.setFromCamera(mouseNDC, camera);
  const hit = raycaster.intersectObject(cylinder, false);
  return hit && hit.length > 0 ? hit[0] : null;
}

renderer.domElement.addEventListener('pointermove', (e) => {
  const res = testIntersect(e);
  pauseRotation = !!res;
  targetRotationSpeed = pauseRotation ? 0 : rotationSpeed;

  // 检测悬停的单词（仅限正面四分之一圆柱）
  hoveredWordIndex = -1;
  if (res && res.uv && res.face && res.point) {
    // 判断命中点是否在正面：法向量与相机方向夹角 < 90度
    const worldNormal = res.face.normal.clone();
    worldNormal.transformDirection(cylinder.matrixWorld);
    worldNormal.normalize();
    
    const cameraDir = new THREE.Vector3();
    camera.getWorldDirection(cameraDir);
    cameraDir.negate(); // 相机朝向物体的方向
    
    const dotProduct = worldNormal.dot(cameraDir);
    
    // 只有dot > 0（夹角 < 90度）才认为是正面，进一步限制到±45度可用dot > 0.707
    if (dotProduct > 0.707) { // cos(45°) ≈ 0.707，限制到正面±45度范围
      let uTex = res.uv.x * (texture.repeat.x || 1) + (texture.offset.x || 0);
      let vTex = res.uv.y * (texture.repeat.y || 1) + (texture.offset.y || 0);
      uTex = uTex - Math.floor(uTex);
      vTex = vTex - Math.floor(vTex);
      const px = uTex * baseCanvasWidth;
      const py = (1 - vTex) * baseCanvasHeight;

      for (let i = 0; i < wordBoxes.length; i++) {
        const b = wordBoxes[i];
        if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) {
          hoveredWordIndex = i;
          break;
        }
      }
    }
  }
  targetDimOpacity = (pauseRotation && hoveredWordIndex >= 0) ? MAX_DIM_OPACITY : 0.0;
});

renderer.domElement.addEventListener('mouseleave', () => {
  pauseRotation = false;
  targetRotationSpeed = rotationSpeed;
  hoveredWordIndex = -1;
  targetDimOpacity = 0.0;
});

renderer.domElement.addEventListener('click', (e) => {
  const res = testIntersect(e);
  if (res && res.uv) {
    let uTex = res.uv.x * (texture.repeat.x || 1) + (texture.offset.x || 0);
    let vTex = res.uv.y * (texture.repeat.y || 1) + (texture.offset.y || 0);
    uTex = uTex - Math.floor(uTex);
    vTex = vTex - Math.floor(vTex);
    const px = uTex * baseCanvasWidth;
    const py = (1 - vTex) * baseCanvasHeight;

    let foundWord = '';
    for (let i = 0; i < wordBoxes.length; i++) {
      const b = wordBoxes[i];
      if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) {
        foundWord = b.text;
        break;
      }
    }
    if (foundWord) {
      const sentence = findSentenceForWord(foundWord);
      displayQuoteAtRandomPosition(sentence);
    }
  }
});

// 初始化完成后移除Loading遮罩
function removeLoadingOverlay() {
  if (loadingOverlay && loadingOverlay.parentNode) {
    loadingOverlay.parentNode.removeChild(loadingOverlay);
  }
}

// 左下角信息块：固定展示诗歌出处
const footerInfo = document.createElement('div');
footerInfo.style.position = 'fixed';
footerInfo.style.left = '10px';
footerInfo.style.bottom = '10px';
footerInfo.style.zIndex = '9999';
footerInfo.style.pointerEvents = 'none';
footerInfo.style.maxWidth = '420px';
footerInfo.style.userSelect = 'none';

function addFooterLine(enText, zhText) {
  const line = document.createElement('div');
  line.style.marginTop = '6px';

  const en = document.createElement('div');
  en.style.fontFamily = '"Sitka", serif';
  en.style.fontSize = '17px'; // 
  en.style.color = '#888888'; // 
  en.style.fontWeight = '600';
  en.style.textAlign = 'left';
  en.textContent = enText;

  const zh = document.createElement('div');
  zh.style.fontFamily = 'SimSun, "宋体", serif';
  zh.style.fontSize = '15px'; // 
  zh.style.color = '#B0B0B0'; // 
  zh.style.fontWeight = '400';
  zh.style.textAlign = 'left';
  zh.textContent = zhText;

  line.appendChild(en);
  line.appendChild(zh);
  footerInfo.appendChild(line);
}

addFooterLine('Poems by Pablo Neruda——', '诗歌选自聂鲁达——');
addFooterLine('VII Leaning into the afternoon', '七，倚身在暮色里');
addFooterLine('XIII I have gone marking', '十三，我以火的十字');
addFooterLine('XX A Song of Despair (excerpt)', '二十，一首绝望的歌（节选）');

document.body.appendChild(footerInfo);


window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  
  // 平滑旋转速度过渡
  currentRotationSpeed += (targetRotationSpeed - currentRotationSpeed) * ROTATION_EASE;
  drumGroup.rotation.y += currentRotationSpeed;
  
  // 悬停方向驱动的恒速滚动
  scrollOffset += hoverDirection * HOVER_SCROLL_SPEED;
  
  // 上下无限循环
  const LOOP_SPAN = height;
  const wrapped = ((scrollOffset % LOOP_SPAN) + LOOP_SPAN) % LOOP_SPAN;
  drumGroup.position.y = wrapped - LOOP_SPAN * 0.5;
  let offsetV = (scrollOffset / LOOP_SPAN) % 1;
  if (offsetV < 0) offsetV += 1;
  texture.offset.y = offsetV;
  overlayTexture.offset.y = offsetV;
  overlayTexture.repeat.copy(texture.repeat);

  // 平滑灰色遮罩透明度过渡
  dimOpacity += (targetDimOpacity - dimOpacity) * DIM_EASE;
  overlayMaterial.opacity = dimOpacity;

  // 仅在悬停单词索引真正改变时重绘覆盖层（性能优化）
  if (hoveredWordIndex !== lastHoveredWordIndex) {
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    
    if (hoveredWordIndex >= 0) {
      // 绘制所有非悬停单词为浅灰色（分辨率缩放）
      const scale = 0.5; // 覆盖层分辨率比例
      overlayCtx.fillStyle = '#FAFAFA'; // 更浅的灰色，不那么明显
      overlayCtx.font = `${baseFontSize * scale}px "Sitka", serif`;
      overlayCtx.textAlign = 'left';
      overlayCtx.textBaseline = 'top';
      
      for (let i = 0; i < wordBoxes.length; i++) {
        if (i === hoveredWordIndex) continue;
        const b = wordBoxes[i];
        overlayCtx.fillText(b.text, b.x * scale, b.y * scale);
      }
    }
    
    overlayTexture.needsUpdate = true;
    lastHoveredWordIndex = hoveredWordIndex;
  }
  
  renderer.render(scene, camera);
}

// 纹理准备就绪后移除加载遮罩（本地Canvas立即完成，保险起见加一帧）
requestAnimationFrame(() => removeLoadingOverlay());

animate();