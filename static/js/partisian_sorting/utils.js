function drawCross(ctx, x0, y0, cell_size, color) {
    let margin = cell_size / 6;
    ctx.lineWidth = cell_size / 10 + 1;
    ctx.beginPath();
    ctx.moveTo(x0 + margin, y0 + margin);
    ctx.lineTo(x0 + cell_size - margin, y0 + cell_size - margin);
    ctx.moveTo(x0 + cell_size - margin, y0 + margin);
    ctx.lineTo(x0 + margin, y0 + cell_size - margin);
    ctx.strokeStyle = color;
    ctx.stroke();
}

function drawCircle(ctx, x0, y0, cell_size, color) {
    ctx.beginPath();
    ctx.arc(x0 + cell_size / 2, y0 + cell_size / 2, cell_size / 3, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawDiamond(ctx, x0, y0, cell_size, color) {
    let x = x0 + cell_size / 2;
    let y = y0 + cell_size / 2;
    let width = cell_size * 0.7;
    let height = cell_size * 0.7;
    ctx.beginPath();
    ctx.moveTo(x, y - height / 2); // Top point
    ctx.lineTo(x + width / 2, y);  // Right point
    ctx.lineTo(x, y + height / 2); // Bottom point
    ctx.lineTo(x - width / 2, y);  // Left point
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

function drawTriangle(ctx, x0, y0, cell_size, color) {
    let border = (cell_size/6);
    let x1 = x0 + (cell_size/2);
    let y1 = y0 + border;
    let x2 = x0 + border;
    let y2 = y0 + cell_size - border;
    let x3 = x0 + cell_size - border;
    let y3 = y0 + cell_size - border;
    ctx.beginPath();
    ctx.moveTo(x1, y1); // First vertex
    ctx.lineTo(x2, y2); // Second vertex
    ctx.lineTo(x3, y3); // Third vertex
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

function drawStar(ctx, x0, y0, cell_size, color) {
    let cx = x0 + (cell_size / 2);
    let cy = y0 + (cell_size / 2); 
    let spikes = 5; 
    let outerRadius = cell_size * (7/16); 
    let innerRadius = cell_size * (1/6);    
    const step = Math.PI / spikes; // Half-angle step
    ctx.beginPath();
    for (let i = 0; i < 2 * spikes; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius; // Alternate between outer and inner radius
        const angle = i * step - (step/2);
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(x, y); // Move to the first point
        } else {
            ctx.lineTo(x, y); // Draw line to next point
        }
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}