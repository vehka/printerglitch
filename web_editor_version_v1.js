// Configuration object
let config = {
  density: 0.3,
  corruptionLevel: 0.7,
  repetitionProb: 0.3,  // Probability of repeating characters
  repetitionLength: 3,   // How many times to repeat (max)  sizeVariation: 0.5,
  clusterStrength: 0.4,
  positionDrift: 0.5,
  baseFontSize: 12,
  useSourceDoc: false,
  sourceText: '',
  charSets: {
    latin: true,
    numbers: true,
    symbols: true,
    cyrillic: false,
    special: false,
    corruption: true
  },
  effects: {
    scanlines: true,
    ghosting: true,
    blocks: true,
    barcode: false,
    noise: true
  }
};

// UI elements
let sliders = {};
let checkboxes = {};
let buttons = {};
let sourceTextarea;

// Character set definitions
const charSets = {
  latin: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*(){}[]|\\/<>~`-_=+;:\'",.',
  cyrillic: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя',
  special: '→←↑↓∞≈≠±×÷§¶†‡©®™€£¥¢°•·…""\'\'—–',
  corruption: '▓▒░█▄▀■□●○◆◇▪▫'
};

function randomChar(str) {
  return str.charAt(floor(random(str.length)));
}

let glitchPositions = [];
let canvasWidth = 800;
let canvasHeight = 1000;

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  textFont('Courier New');
  
  // Create UI
  createUI();
  regenerate();
}

function draw() {
  // Static image - only redraw when regenerate is called
}

function createUI() {
  let yPos = 20;
  let xPos = canvasWidth + 20;
  
  // Title
  let title = createP('Analog Glitch Art Generator');
  title.position(xPos, yPos);
  title.style('font-family', 'Courier New');
  title.style('font-weight', 'bold');
  yPos += 40;
  
  // Presets
  createP('Presets:').position(xPos, yPos).style('font-family', 'Courier New');
  yPos += 25;
  
  let presets = ['Scan', 'Fax', 'Thermal', 'OCR', 'Heavy', 'Subtle'];
  for (let i = 0; i < presets.length; i++) {
    let btn = createButton(presets[i]);
    btn.position(xPos + (i % 3) * 80, yPos + floor(i / 3) * 30);
    btn.mousePressed(() => loadPreset(presets[i].toLowerCase()));
    btn.style('font-family', 'Courier New');
    btn.style('font-size', '10px');
  }
  yPos += 80;
  
  // Sliders
  createP('Density:').position(xPos, yPos).style('font-family', 'Courier New');
  yPos += 20;
  sliders.density = createSlider(5, 100, 30, 1);
  sliders.density.position(xPos, yPos);
  sliders.density.input(updateConfig);
  yPos += 40;
  
  createP('Corruption:').position(xPos, yPos).style('font-family', 'Courier New');
  yPos += 20;
  sliders.corruption = createSlider(0, 100, 70, 1);
  sliders.corruption.position(xPos, yPos);
  sliders.corruption.input(updateConfig);
  yPos += 40;
  
  createP('Font Size:').position(xPos, yPos).style('font-family', 'Courier New');
  yPos += 20;
  sliders.fontsize = createSlider(6, 24, 12, 1);
  sliders.fontsize.position(xPos, yPos);
  sliders.fontsize.input(updateConfig);
  yPos += 40;
  
  createP('Size Variation:').position(xPos, yPos).style('font-family', 'Courier New');
  yPos += 20;
  sliders.sizevar = createSlider(0, 100, 50, 1);
  sliders.sizevar.position(xPos, yPos);
  sliders.sizevar.input(updateConfig);
  yPos += 40;
  
  createP('Repetition:').position(xPos, yPos).style('font-family', 'Courier New');
  yPos += 20;
  sliders.repetition = createSlider(0, 100, 30, 1);
  sliders.repetition.position(xPos, yPos);
  sliders.repetition.input(updateConfig);
  yPos += 40;

  createP('Repeat Length:').position(xPos, yPos).style('font-family', 'Courier New');
  yPos += 20;
  sliders.repLength = createSlider(2, 8, 3, 1);
  sliders.repLength.position(xPos, yPos);
  sliders.repLength.input(updateConfig);
  yPos += 40;
  
  createP('Position Drift:').position(xPos, yPos).style('font-family', 'Courier New');
  yPos += 20;
  sliders.drift = createSlider(0, 100, 50, 1);
  sliders.drift.position(xPos, yPos);
  sliders.drift.input(updateConfig);
  yPos += 40;
  
  createP('Clustering:').position(xPos, yPos).style('font-family', 'Courier New');
  yPos += 20;
  sliders.cluster = createSlider(0, 100, 40, 1);
  sliders.cluster.position(xPos, yPos);
  sliders.cluster.input(updateConfig);
  yPos += 50;
  
  // Character sets
  createP('Character Sets:').position(xPos, yPos).style('font-family', 'Courier New').style('font-weight', 'bold');
  yPos += 25;
  
  checkboxes.latin = createCheckbox('Latin', true);
  checkboxes.latin.position(xPos, yPos);
  checkboxes.latin.changed(updateConfig);
  yPos += 25;
  
  checkboxes.numbers = createCheckbox('Numbers', true);
  checkboxes.numbers.position(xPos, yPos);
  checkboxes.numbers.changed(updateConfig);
  yPos += 25;
  
  checkboxes.symbols = createCheckbox('Symbols', true);
  checkboxes.symbols.position(xPos, yPos);
  checkboxes.symbols.changed(updateConfig);
  yPos += 25;
  
  checkboxes.cyrillic = createCheckbox('Cyrillic', false);
  checkboxes.cyrillic.position(xPos, yPos);
  checkboxes.cyrillic.changed(updateConfig);
  yPos += 25;
  
  checkboxes.special = createCheckbox('Special', false);
  checkboxes.special.position(xPos, yPos);
  checkboxes.special.changed(updateConfig);
  yPos += 25;
  
  checkboxes.corruption = createCheckbox('Box Chars', true);
  checkboxes.corruption.position(xPos, yPos);
  checkboxes.corruption.changed(updateConfig);
  yPos += 40;
  
  // Effects
  createP('Effects:').position(xPos, yPos).style('font-family', 'Courier New').style('font-weight', 'bold');
  yPos += 25;
  
  checkboxes.scanlines = createCheckbox('Scan Lines', true);
  checkboxes.scanlines.position(xPos, yPos);
  checkboxes.scanlines.changed(updateConfig);
  yPos += 25;
  
  checkboxes.ghosting = createCheckbox('Ghosting', true);
  checkboxes.ghosting.position(xPos, yPos);
  checkboxes.ghosting.changed(updateConfig);
  yPos += 25;
  
  checkboxes.blocks = createCheckbox('Compression', true);
  checkboxes.blocks.position(xPos, yPos);
  checkboxes.blocks.changed(updateConfig);
  yPos += 25;
  
  checkboxes.barcode = createCheckbox('Barcode', false);
  checkboxes.barcode.position(xPos, yPos);
  checkboxes.barcode.changed(updateConfig);
  yPos += 25;
  
  checkboxes.noise = createCheckbox('Noise', true);
  checkboxes.noise.position(xPos, yPos);
  checkboxes.noise.changed(updateConfig);
  yPos += 40;
  
  // Source document
  createP('Source Text (optional):').position(xPos, yPos).style('font-family', 'Courier New').style('font-weight', 'bold');
  yPos += 25;
  
  checkboxes.useSource = createCheckbox('Use Source', false);
  checkboxes.useSource.position(xPos, yPos);
  checkboxes.useSource.changed(updateConfig);
  yPos += 25;
  
  sourceTextarea = createElement('textarea');
  sourceTextarea.position(xPos, yPos);
  sourceTextarea.size(240, 100);
  sourceTextarea.attribute('placeholder', 'Paste text to glitch...');
  sourceTextarea.style('font-family', 'Courier New');
  sourceTextarea.style('font-size', '10px');
  yPos += 120;
  
  // Action buttons
  let regenBtn = createButton('Regenerate');
  regenBtn.position(xPos, yPos);
  regenBtn.mousePressed(regenerate);
  regenBtn.style('font-family', 'Courier New');
  yPos += 35;
  
  let saveBtn = createButton('Save Image');
  saveBtn.position(xPos, yPos);
  saveBtn.mousePressed(() => saveCanvas('glitch-art-' + Date.now(), 'png'));
  saveBtn.style('font-family', 'Courier New');
  yPos += 35;
  
  let randomBtn = createButton('Randomize');
  randomBtn.position(xPos, yPos);
  randomBtn.mousePressed(randomize);
  randomBtn.style('font-family', 'Courier New');
}

function regenerate() {
  background(255);
  
  // Add background noise if enabled
  if (config.effects.noise) {
    drawBackgroundNoise();
  }
  
  // Generate positions
  glitchPositions = config.useSourceDoc ? 
    generateFromSource() : 
    generateRandomPositions();
  
  // Draw ghosting layer first (behind main characters)
  if (config.effects.ghosting) {
    drawGhosting();
  }
  
  // Draw main characters
  drawCharacters();
  
  // Apply effects on top
  if (config.effects.scanlines) {
    drawScanlines();
  }
  
  if (config.effects.blocks) {
    drawCompressionBlocks();
  }
  
  if (config.effects.barcode) {
    drawBarcodePattern();
  }
}

function generateRandomPositions() {
  let positions = [];
  let charPool = getActiveCharPool();
  
  if (charPool.length === 0) {
    charPool = ['X']; // Fallback if no sets selected
  }
  
  // Use noise-based density for clustering
  noiseSeed(random(10000));
  
  let gridSpacing = config.baseFontSize * 1.2;
  
  for (let y = 0; y < height; y += gridSpacing) {
    for (let x = 0; x < width; x += gridSpacing) {
      
      // Noise-based density variation
      let noiseVal = noise(x * 0.005, y * 0.005);
      let densityThreshold = 1 - config.density;
      
      // Apply cluster strength
      let clusterMod = map(config.clusterStrength, 0, 1, 0.5, 1.5);
      noiseVal = pow(noiseVal, clusterMod);
      
      if (noiseVal > densityThreshold) {
        let driftX = randomGaussian(0, config.positionDrift * 15);
        let driftY = randomGaussian(0, config.positionDrift * 8);
        
        let char = randomChar(charPool.join(''));
        
        positions.push({
          x: x + driftX,
          y: y + driftY,
          char: char,
          size: config.baseFontSize * random(1 - config.sizeVariation, 1 + config.sizeVariation),
          opacity: random(180, 255)
        });
        
        // Maybe repeat this character
        if (random() < config.repetitionProb) {
          let repeatCount = floor(random(2, config.repetitionLength + 1));
          let repeatDir = floor(random(4)); // 0=right, 1=down, 2=diagonal-right, 3=diagonal-left
          
          for (let r = 1; r <= repeatCount; r++) {
            let offsetX = 0, offsetY = 0;
            
            switch(repeatDir) {
              case 0: // horizontal right
                offsetX = r * gridSpacing * 0.8;
                break;
              case 1: // vertical down
                offsetY = r * gridSpacing * 0.8;
                break;
              case 2: // diagonal down-right
                offsetX = r * gridSpacing * 0.6;
                offsetY = r * gridSpacing * 0.6;
                break;
              case 3: // diagonal down-left
                offsetX = -r * gridSpacing * 0.6;
                offsetY = r * gridSpacing * 0.6;
                break;
            }
            
            positions.push({
              x: x + driftX + offsetX,
              y: y + driftY + offsetY,
              char: char, // Same character
              size: config.baseFontSize * random(1 - config.sizeVariation * 0.5, 1 + config.sizeVariation * 0.5),
              opacity: random(150, 255)
            });
          }
        }
      }
    }
  }
  
  return positions;
}

function generateFromSource() {
  let positions = [];
  let charPool = getActiveCharPool();
  let text = config.sourceText || "NO SOURCE TEXT PROVIDED";
  let chars = text.split('');
  
  let x = 50;
  let y = 50;
  let lineHeight = config.baseFontSize * 1.8;
  let charWidth = config.baseFontSize * 0.7;
  
  for (let i = 0; i < chars.length; i++) {
    let char = chars[i];
    
    // Handle newlines
    if (char === '\n') {
      x = 50;
      y += lineHeight;
      continue;
    }
    
    // Maybe corrupt the character
    if (random() < config.corruptionLevel) {
      char = random(charPool);
    }
    
    let driftX = randomGaussian(0, config.corruptionLevel * 20);
    let driftY = randomGaussian(0, config.corruptionLevel * 10);
    
    positions.push({
      x: x + driftX,
      y: y + driftY,
      char: char,
      rotation: random(-config.corruptionLevel * config.rotationRange, 
                      config.corruptionLevel * config.rotationRange),
      size: config.baseFontSize * random(1 - config.sizeVariation * 0.5, 
                                          1 + config.sizeVariation * 0.5),
      opacity: random(150, 255)
    });
    
    x += charWidth;
    
    // Wrap at edge
    if (x > width - 100) {
      x = 50;
      y += lineHeight;
    }
    
    // Stop if we go off bottom
    if (y > height - 50) {
      break;
    }
  }
  
  return positions;
}

function drawCharacters() {
  fill(0);
  noStroke();
  
  for (let p of glitchPositions) {
    push();
    translate(p.x, p.y);
    textSize(p.size);
    fill(0, p.opacity);
    textAlign(CENTER, CENTER);
    text(p.char, 0, 0);
    pop();
  }
}

function drawGhosting() {
  fill(0, 50);
  noStroke();
  
  for (let p of glitchPositions) {
    if (random() < 0.15) {
      let ghostCount = floor(random(1, 4));
      for (let i = 0; i < ghostCount; i++) {
        push();
        translate(p.x + random(-5, 5), p.y + random(-5, 5));
        textSize(p.size);
        textAlign(CENTER, CENTER);
        text(p.char, 0, 0);
        pop();
      }
    }
  }
}

function drawScanlines() {
  stroke(0, random(20, 40));
  strokeWeight(random(0.5, 1.5));
  
  for (let y = 0; y < height; y += random(3, 12)) {
    let x1 = random(-20, 0);
    let x2 = width + random(0, 20);
    line(x1, y, x2, y);
  }
}

function drawCompressionBlocks() {
  noStroke();
  
  for (let i = 0; i < 30; i++) {
    fill(0, random(10, 50));
    let w = random(10, 80);
    let h = random(5, 30);
    rect(random(width - w), random(height - h), w, h);
  }
  
  // Some white blocks too
  for (let i = 0; i < 15; i++) {
    fill(255, random(100, 200));
    let w = random(5, 40);
    let h = random(3, 15);
    rect(random(width - w), random(height - h), w, h);
  }
}

function drawBarcodePattern() {
  stroke(0);
  strokeWeight(1);
  
  // Bottom barcode-like pattern
  let startY = height - 100;
  let barCount = floor(random(50, 150));
  
  for (let i = 0; i < barCount; i++) {
    let x = random(width);
    let barHeight = random(20, 80);
    let barWidth = random(1, 4);
    
    strokeWeight(barWidth);
    line(x, startY, x, startY + barHeight);
  }
}

function drawBackgroundNoise() {
  loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    if (random() < 0.02) {
      let noise = random(200, 255);
      pixels[i] = noise;
      pixels[i + 1] = noise;
      pixels[i + 2] = noise;
    }
  }
  updatePixels();
}

function getActiveCharPool() {
  let pool = '';
  
  if (config.charSets.latin) pool += charSets.latin;
  if (config.charSets.numbers) pool += charSets.numbers;
  if (config.charSets.symbols) pool += charSets.symbols;
  if (config.charSets.cyrillic) pool += charSets.cyrillic;
  if (config.charSets.special) pool += charSets.special;
  if (config.charSets.corruption) pool += charSets.corruption;
  
  return pool.split(''); // Convert string to array
}

function updateConfig() {
  // Update numeric values from sliders
  config.density = sliders.density.value() / 100;
  config.corruptionLevel = sliders.corruption.value() / 100;
  config.repetitionProb = sliders.repetition.value() / 100;
  config.repetitionLength = sliders.repLength.value();
  config.sizeVariation = sliders.sizevar.value() / 100;
  config.clusterStrength = sliders.cluster.value() / 100;
  config.positionDrift = sliders.drift.value() / 100;
  config.baseFontSize = sliders.fontsize.value();
  
  // Update character sets from checkboxes
  config.charSets.latin = checkboxes.latin.checked();
  config.charSets.numbers = checkboxes.numbers.checked();
  config.charSets.symbols = checkboxes.symbols.checked();
  config.charSets.cyrillic = checkboxes.cyrillic.checked();
  config.charSets.special = checkboxes.special.checked();
  config.charSets.corruption = checkboxes.corruption.checked();
  
  // Update effects
  config.effects.scanlines = checkboxes.scanlines.checked();
  config.effects.ghosting = checkboxes.ghosting.checked();
  config.effects.blocks = checkboxes.blocks.checked();
  config.effects.barcode = checkboxes.barcode.checked();
  config.effects.noise = checkboxes.noise.checked();
  
  // Update source document settings
  config.useSourceDoc = checkboxes.useSource.checked();
  config.sourceText = sourceTextarea.elt.value;

  
  // Auto-regenerate on change
  regenerate();
}

function randomize() {
  sliders.density.value(random(10, 80));
  sliders.corruption.value(random(30, 100));
  sliders.repetition.value(random(10, 80));
  sliders.repLength.value(random(2, 6));
  sliders.sizevar.value(random(0, 100));
  sliders.cluster.value(random(0, 80));
  sliders.drift.value(random(0, 100));
  sliders.fontsize.value(random(8, 18));
  
  updateConfig();
}

function loadPreset(presetName) {
  const presets = {
    scan: {
      density: 35, corruption: 60, repetition: 20, repLength: 3, sizevar: 30, 
      cluster: 20, drift: 40, fontsize: 11,
      scanlines: true, ghosting: false, blocks: true, barcode: false, noise: true
    },
    fax: {
      density: 50, corruption: 80, repetition: 20, repLength: 3, sizevar: 20, 
      cluster: 60, drift: 70, fontsize: 10,
      scanlines: true, ghosting: true, blocks: false, barcode: true, noise: true
    },
    thermal: {
      density: 40, corruption: 50, repetition: 20, repLength: 3, sizevar: 40, 
      cluster: 30, drift: 20, fontsize: 9,
      scanlines: false, ghosting: true, blocks: true, barcode: false, noise: false
    },
    ocr: {
      density: 60, corruption: 90, repetition: 20, repLength: 3, sizevar: 60, 
      cluster: 10, drift: 80, fontsize: 12,
      scanlines: false, ghosting: false, blocks: false, barcode: false, noise: true
    },
    heavy: {
      density: 70, corruption: 95, repetition: 20, repLength: 3, sizevar: 80, 
      cluster: 70, drift: 90, fontsize: 14,
      scanlines: true, ghosting: true, blocks: true, barcode: true, noise: true
    },
    subtle: {
      density: 20, corruption: 30, repetition: 20, repLength: 3, sizevar: 20, 
      cluster: 40, drift: 25, fontsize: 10,
      scanlines: false, ghosting: false, blocks: false, barcode: false, noise: true
    }
  };
  
  const preset = presets[presetName];
  if (!preset) return;
  
  sliders.density.value(preset.density);
  sliders.corruption.value(preset.corruption);
  sliders.repetition.value(preset.repetition);
  sliders.repLength.value(preset.repLength);
  sliders.sizevar.value(preset.sizevar);
  sliders.cluster.value(preset.cluster);
  sliders.drift.value(preset.drift);
  sliders.fontsize.value(preset.fontsize);
  
  checkboxes.scanlines.checked(preset.scanlines);
  checkboxes.ghosting.checked(preset.ghosting);
  checkboxes.blocks.checked(preset.blocks);
  checkboxes.barcode.checked(preset.barcode);
  checkboxes.noise.checked(preset.noise);
  
  updateConfig();
}