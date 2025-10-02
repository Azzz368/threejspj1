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

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

const poemText = `The memory of you emerges from the night around me.
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
beyond desire and act, I walked on.`
;

// 转筒组父级：用于整体倾斜与定位
const tiltGroup = new THREE.Group();
tiltGroup.position.x = 5.5; // 放在屏幕右侧
// 顺时针倾斜35°（围绕屏幕朝向/上为y时约等于绕z负方向）
tiltGroup.rotation.z = -THREE.MathUtils.degToRad(35);
scene.add(tiltGroup);

// 转筒组（仅用于自转）
const drumGroup = new THREE.Group();
tiltGroup.add(drumGroup);

function createTextCanvas(text) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  

  canvas.width = 8192; 
  canvas.height = 4096; 
  
  const fontSize = 256; // 从128提升到256
  context.fillStyle = 'black';
  context.font = `${fontSize}px "Sitka", serif`;
  context.textAlign = 'left';
  context.textBaseline = 'top';
  
  const paddingX = 40;
  const paddingRight = 40;
  const paddingTop = 20;
  const lineHeight = Math.floor(fontSize * 1.00);
  const maxLineWidth = canvas.width - paddingX - paddingRight;
  
  const words = text.split(/\s+/).filter(w => w.length > 0);
  let wordIndex = 0;
  let y = paddingTop;
  
  while (y <= canvas.height - lineHeight) {
    let currentLine = '';
    while (true) {
      const nextWord = words[wordIndex];
      const tentative = currentLine + (currentLine ? ' ' : '') + nextWord;
      const width = context.measureText(tentative).width;
      if (width <= maxLineWidth) {
        currentLine = tentative;
        wordIndex = (wordIndex + 1) % words.length;
      } else {
        if (!currentLine) {
          currentLine = nextWord;
          wordIndex = (wordIndex + 1) % words.length;
        }
        break;
      }
    }
    context.fillText(currentLine, paddingX, y);
    y += lineHeight;
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

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  
 
  drumGroup.rotation.y += rotationSpeed;
  
  renderer.render(scene, camera);
}

animate();