// Highlight active scroll indicator
const sections = document.querySelectorAll('.section');
const indicators = document.querySelectorAll('.indicator');

function updateActiveIndicator() {
  const scrollPosition = window.scrollY;
  const sectionHeight = window.innerHeight;
  const currentSection = Math.round(scrollPosition / sectionHeight);

  indicators.forEach((indicator, index) => {
    indicator.classList.toggle('active', index === currentSection);
  });
}

window.addEventListener('scroll', updateActiveIndicator);

// Smooth scroll on click
indicators.forEach((indicator, index) => {
  indicator.addEventListener('click', e => {
    e.preventDefault();
    sections[index].scrollIntoView({ behavior: 'smooth' });
  });
});

// Optional arrow key navigation
document.addEventListener('keydown', e => {
  const scrollAmount = window.innerHeight;
  if (e.key === 'ArrowDown') {
    window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
  } else if (e.key === 'ArrowUp') {
    window.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
  }
});
