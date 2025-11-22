let towers = [[], [], []];
let selectedTowerIndex = -1;
let moveCount = 0;
let diskCount = 3;

const moveCountEl = document.getElementById('moveCount');
const minMovesEl = document.getElementById('minMoves');
const diskSelect = document.getElementById('diskSelect');

function initGame() {
    diskCount = parseInt(diskSelect.value);
    towers = [[], [], []];
    selectedTowerIndex = -1;
    moveCount = 0;

    // Initialize first tower
    for (let i = diskCount; i >= 1; i--) {
        towers[0].push(i);
    }

    updateUI();

    // Calculate min moves: 2^n - 1
    minMovesEl.textContent = Math.pow(2, diskCount) - 1;
}

function handleTowerClick(towerId) {
    const index = towerId - 1;

    if (selectedTowerIndex === -1) {
        // Select source tower
        if (towers[index].length > 0) {
            selectedTowerIndex = index;
        }
    } else {
        // Select destination tower
        if (selectedTowerIndex === index) {
            // Deselect if clicked same tower
            selectedTowerIndex = -1;
        } else {
            // Try to move
            attemptMove(selectedTowerIndex, index);
            selectedTowerIndex = -1;
        }
    }

    updateUI();
    checkWin();
}

function attemptMove(fromIndex, toIndex) {
    const disk = towers[fromIndex][towers[fromIndex].length - 1];
    const topDestDisk = towers[toIndex].length > 0 ? towers[toIndex][towers[toIndex].length - 1] : Infinity;

    if (disk < topDestDisk) {
        // Valid move
        towers[toIndex].push(towers[fromIndex].pop());
        moveCount++;
    } else {
        // Invalid move
        alert("Invalid Move! Cannot place a larger disk on a smaller one.");
    }
}

function updateUI() {
    moveCountEl.textContent = moveCount;

    // Update towers
    for (let i = 0; i < 3; i++) {
        const towerEl = document.getElementById(`tower${i + 1}`);
        // Clear existing disks (keep rod and base)
        const disks = towerEl.querySelectorAll('.disk');
        disks.forEach(d => d.remove());

        // Render disks
        towers[i].forEach(diskSize => {
            const diskEl = document.createElement('div');
            diskEl.classList.add('disk', `disk-${diskSize}`);
            towerEl.appendChild(diskEl);
        });

        // Highlight selected tower
        if (i === selectedTowerIndex) {
            towerEl.classList.add('selected');
            // Highlight top disk
            const topDisk = towerEl.lastElementChild;
            if (topDisk && topDisk.classList.contains('disk')) {
                topDisk.classList.add('selected');
            }
        } else {
            towerEl.classList.remove('selected');
        }
    }
}

function checkWin() {
    // Check if all disks are on the last tower (index 2)
    if (towers[2].length === diskCount) {
        setTimeout(() => {
            alert(`Congratulations! You solved it in ${moveCount} moves!`);
            initGame();
        }, 100);
    }
}

// Start
initGame();
