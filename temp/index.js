import anime from 'animejs';

const $logo = document.querySelector('.logo.js');
const $button = document.querySelector('button');
let rotations = 0;

// Created a bounce animation loop
anime({
  targets: '.logo.js',
  scale: [
    { value: .25, easing: 'easeInOutCubic', duration: 1600 },
    { value: 1, easing: 'spring(1, 80, 10, 0)' }
  ],
  loop: true,
  loopDelay: 50,
});

// Animate logo rotation on click
const rotateLogo = () => {
  rotations++;
  $button.innerText = `rotations: ${rotations}`;
  anime({
    targets: $logo,
    rotate: rotations * 360,
    easing: 'easeOutQuart',
    duration: 1500,
  });
}

$button.addEventListener('click', rotateLogo);