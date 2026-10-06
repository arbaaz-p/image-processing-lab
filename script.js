const SIZE = 520;
const RESAMPLED_SIZE = 130;
const sourceCanvas = document.getElementById("source");
const outputCanvas = document.getElementById("output");
const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
const outputContext = outputCanvas.getContext("2d");
const statusText = document.getElementById("status-text");
const resolutionText = document.getElementById("resolution-text");
const operationLabel = document.getElementById("operation-label");
const upload = document.getElementById("image-upload");

const palette = [
  [14, 25, 39],
  [42, 62, 68],
  [72, 93, 83],
  [111, 124, 91],
  [151, 142, 102],
  [191, 173, 131],
  [218, 210, 180],
  [240, 241, 226],
];

function drawCover(context, image, width, height) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.naturalWidth - sourceWidth) / 2;
  const sourceY = (image.naturalHeight - sourceHeight) / 2;
  context.clearRect(0, 0, width, height);
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
}

function resetOutput() {
  outputCanvas.width = SIZE;
  outputCanvas.height = SIZE;
  outputContext.imageSmoothingEnabled = true;
  outputContext.clearRect(0, 0, SIZE, SIZE);
  outputContext.drawImage(sourceCanvas, 0, 0);
  operationLabel.textContent = "Unmodified";
  statusText.textContent = "Original pixel data restored.";
  resolutionText.textContent = `${SIZE} × ${SIZE} pixels`;
}

function loadImage(image, message) {
  drawCover(sourceContext, image, SIZE, SIZE);
  resetOutput();
  statusText.textContent = message;
}

function loadGeneratedSample() {
  const sky = sourceContext.createLinearGradient(0, 0, 0, SIZE);
  sky.addColorStop(0, "#8ed4e8");
  sky.addColorStop(0.58, "#dce7c4");
  sky.addColorStop(1, "#a98252");
  sourceContext.fillStyle = sky;
  sourceContext.fillRect(0, 0, SIZE, SIZE);

  sourceContext.fillStyle = "#f2c96b";
  sourceContext.beginPath();
  sourceContext.arc(408, 108, 56, 0, Math.PI * 2);
  sourceContext.fill();

  sourceContext.fillStyle = "#63766c";
  sourceContext.beginPath();
  sourceContext.moveTo(0, 330);
  sourceContext.lineTo(135, 150);
  sourceContext.lineTo(255, 325);
  sourceContext.lineTo(365, 188);
  sourceContext.lineTo(520, 338);
  sourceContext.lineTo(520, 520);
  sourceContext.lineTo(0, 520);
  sourceContext.closePath();
  sourceContext.fill();

  sourceContext.fillStyle = "#203d38";
  for (const [x, y, scale] of [[70, 305, 1], [175, 335, 0.76], [302, 290, 1.12], [430, 326, 0.88]]) {
    sourceContext.fillRect(x - 5 * scale, y, 10 * scale, 98 * scale);
    sourceContext.beginPath();
    sourceContext.moveTo(x, y - 78 * scale);
    sourceContext.lineTo(x - 45 * scale, y + 40 * scale);
    sourceContext.lineTo(x + 45 * scale, y + 40 * scale);
    sourceContext.closePath();
    sourceContext.fill();
  }

  resetOutput();
  statusText.textContent = "Generated sample loaded. Choose an operation.";
}

function applySepia() {
  const imageData = sourceContext.getImageData(0, 0, SIZE, SIZE);
  const pixels = imageData.data;
  for (let index = 0; index < pixels.length; index += 4) {
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    pixels[index] = Math.min(255, 0.393 * red + 0.769 * green + 0.189 * blue);
    pixels[index + 1] = Math.min(255, 0.349 * red + 0.686 * green + 0.168 * blue);
    pixels[index + 2] = Math.min(255, 0.272 * red + 0.534 * green + 0.131 * blue);
  }
  outputCanvas.width = SIZE;
  outputCanvas.height = SIZE;
  outputContext.putImageData(imageData, 0, 0);
  operationLabel.textContent = "Sepia";
  statusText.textContent = "Applied a per-pixel RGB channel transformation.";
  resolutionText.textContent = `${SIZE} × ${SIZE} pixels`;
}

function applyQuantization() {
  const imageData = sourceContext.getImageData(0, 0, SIZE, SIZE);
  const pixels = imageData.data;
  for (let index = 0; index < pixels.length; index += 4) {
    let closest = palette[0];
    let closestDistance = Number.POSITIVE_INFINITY;
    for (const colour of palette) {
      const redDifference = pixels[index] - colour[0];
      const greenDifference = pixels[index + 1] - colour[1];
      const blueDifference = pixels[index + 2] - colour[2];
      const distance = redDifference ** 2 + greenDifference ** 2 + blueDifference ** 2;
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = colour;
      }
    }
    pixels[index] = closest[0];
    pixels[index + 1] = closest[1];
    pixels[index + 2] = closest[2];
  }
  outputCanvas.width = SIZE;
  outputCanvas.height = SIZE;
  outputContext.putImageData(imageData, 0, 0);
  operationLabel.textContent = "8-colour palette";
  statusText.textContent = "Mapped every pixel to its closest palette colour.";
  resolutionText.textContent = `${SIZE} × ${SIZE} pixels · 8 colours`;
}

function applyResampling() {
  const source = sourceContext.getImageData(0, 0, SIZE, SIZE).data;
  const destination = new ImageData(RESAMPLED_SIZE, RESAMPLED_SIZE);
  const output = destination.data;

  for (let y = 0; y < RESAMPLED_SIZE; y += 1) {
    for (let x = 0; x < RESAMPLED_SIZE; x += 1) {
      let red = 0;
      let green = 0;
      let blue = 0;
      let alpha = 0;
      for (let blockY = 0; blockY < 4; blockY += 1) {
        for (let blockX = 0; blockX < 4; blockX += 1) {
          const sourceIndex = 4 * (((y * 4 + blockY) * SIZE) + (x * 4 + blockX));
          red += source[sourceIndex];
          green += source[sourceIndex + 1];
          blue += source[sourceIndex + 2];
          alpha += source[sourceIndex + 3];
        }
      }
      const destinationIndex = 4 * (y * RESAMPLED_SIZE + x);
      output[destinationIndex] = Math.round(red / 16);
      output[destinationIndex + 1] = Math.round(green / 16);
      output[destinationIndex + 2] = Math.round(blue / 16);
      output[destinationIndex + 3] = Math.round(alpha / 16);
    }
  }

  outputCanvas.width = RESAMPLED_SIZE;
  outputCanvas.height = RESAMPLED_SIZE;
  outputContext.putImageData(destination, 0, 0);
  operationLabel.textContent = "Block averaged";
  statusText.textContent = "Averaged each 4×4 block into one output pixel.";
  resolutionText.textContent = `${RESAMPLED_SIZE} × ${RESAMPLED_SIZE} pixels · 93.75% fewer pixels`;
}

document.querySelectorAll("[data-operation]").forEach((button) => {
  button.addEventListener("click", () => {
    const operation = button.dataset.operation;
    if (operation === "sepia") applySepia();
    if (operation === "quantize") applyQuantization();
    if (operation === "resample") applyResampling();
    if (operation === "reset") resetOutput();
  });
});

upload.addEventListener("change", () => {
  const [file] = upload.files;
  if (!file) return;
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);
  image.onload = () => {
    loadImage(image, `${file.name} loaded locally. Choose an operation.`);
    URL.revokeObjectURL(objectUrl);
  };
  image.onerror = () => {
    statusText.textContent = "That image could not be opened.";
    URL.revokeObjectURL(objectUrl);
  };
  image.src = objectUrl;
});

loadGeneratedSample();
