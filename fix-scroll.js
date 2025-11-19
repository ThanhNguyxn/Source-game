// Universal fix for preventing page scroll in all games
// Add this to the end of each game's script.js

// Prevent default behavior for game control keys
document.addEventListener('keydown', function(e) {
    // Prevent arrow keys, space, and WASD from scrolling
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'].includes(e.key)) {
        e.preventDefault();
    }
}, false);

// Prevent spacebar from scrolling the page
window.addEventListener('keydown', function(e) {
    if(e.key === ' ' && e.target === document.body) {
        e.preventDefault();
    }
});

