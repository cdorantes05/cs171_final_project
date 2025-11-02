// Update active indicator based on scroll position
const container = document.querySelector('.container');
const indicators = document.querySelectorAll('.indicator');
const sections = document.querySelectorAll('.section');

function updateActiveIndicator() {
    const scrollPosition = window.scrollY;
    const sectionHeight = window.innerHeight;
    
    // Calculate which section is currently visible
    const currentSection = Math.round(scrollPosition / sectionHeight);
    
    // Update indicators
    indicators.forEach((indicator, index) => {
        if (index === currentSection) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

// Add scroll event listener
window.addEventListener('scroll', updateActiveIndicator);

// Optional: Add smooth scrolling for indicators
indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = sections[index];
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// Optional: Add keyboard navigation
document.addEventListener('keydown', (e) => {
    const scrollAmount = window.innerHeight;
    
    if (e.key === 'ArrowUp') {
        window.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
    } else if (e.key === 'ArrowDown') {
        window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
});
