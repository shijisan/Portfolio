const cube = document.querySelector(".cube");
let rotateX = 0;
let rotateY = 0;
const rotationSpeedX = 0.5; // Adjust the speed of rotation for X axis
const rotationSpeedY = 0.3; // Adjust the speed of rotation for Y axis

const rotateCube = () => {
  rotateX -= rotationSpeedX;
  rotateY -= rotationSpeedY;

  cube.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
};

setInterval(rotateCube, 16); // Approximately 60 frames per second
