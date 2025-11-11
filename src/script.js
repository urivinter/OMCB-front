
const gridContainer = document.getElementById('grid-container');
const boxes = [];

// Create the grid
for (let i = 0; i < 16; i++) {
    const box = document.createElement('div');
    box.classList.add('grid-item');
    box.dataset.offset = i;
    gridContainer.appendChild(box);
    boxes.push(box);
}

// Fetch initial state
fetch('http://localhost:8000/api/boxes/')
    .then(response => response.arrayBuffer())
    .then(buffer => {
        const view = new Uint8Array(buffer);
        for (let i = 0; i < view.length; i++) {
            for (let j = 0; j < 8; j++) {
                const offset = i * 8 + j;
                if (offset < 16) {
                    const isChecked = (view[i] >> j) & 1;
                    if (isChecked) {
                        boxes[offset].classList.add('checked');
                    }
                }
            }
        }
    });

// WebSocket connection
const socket = new WebSocket('ws://localhost:8000/ws');

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const { offset, value } = data;
    const box = boxes[offset];
    if (value) {
        box.classList.add('checked');
    } else {
        box.classList.remove('checked');
    }
};

// Add click event listener to boxes
gridContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('grid-item')) {
        if (socket.readyState === WebSocket.OPEN) {
            const box = event.target;
            const offset = parseInt(box.dataset.offset);
            const value = !box.classList.contains('checked');
            const data = { offset, value };
            socket.send(JSON.stringify(data));
        } else {
            console.error('WebSocket is not open. readyState: ' + socket.readyState);
        }
    }
});
