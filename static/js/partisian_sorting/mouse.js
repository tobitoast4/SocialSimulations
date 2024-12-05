let padding_px = document.getElementById("canvas").style.padding;
let padding = parseInt(padding_px.substring(0, padding_px.length-2));

let mouse = {
    x: undefined,
    y: undefined
}

document.addEventListener("mouseleave", function(event) {
    if(event.clientY <= 0 || event.clientX <= 0 || (event.clientX >= window.innerWidth || event.clientY >= window.innerHeight)) {
        mouse.x = undefined;
        mouse.y = undefined;
    }
});

window.addEventListener("mousemove", function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

window.addEventListener("click", function(event) {
    mouseClick(event, 1);
});
window.addEventListener("contextmenu", function(event) {
    mouseClick(event, 2);
});

function mouseClick(event, nr) {
    let mouse_x = mouse.x - padding + window.scrollX;
    let mouse_y = mouse.y - padding + window.scrollY;
    if (event.target.id == 'canvas') {
        event.preventDefault();
        for (let i = 0; i < cells.length; i++) {
            if (cells[i].x < mouse_x && mouse_x < cells[i].x + cell_size &&
                cells[i].y < mouse_y && mouse_y < cells[i].y + cell_size
            ) {
                console.log(cells[i]);
                document.getElementById(`selected_cell_position${nr}`).innerHTML = `(${cells[i].col} | ${cells[i].row})`;
                document.getElementById(`selected_cell_coordinates${nr}`).innerHTML = `(${cells[i].x} | ${cells[i].y})`;
                document.getElementById(`selected_cell_static_opinion${nr}`).innerHTML = cells[i].agent.static_opinion;
                document.getElementById(`selected_cell_dynamic_opinions${nr}`).innerHTML = JSON.stringify(cells[i].agent.dynamic_opinions);
                return;
            }
        }
    }
}