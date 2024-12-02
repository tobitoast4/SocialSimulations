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
    let mouse_x = mouse.x - padding + window.scrollX;
    let mouse_y = mouse.y - padding + window.scrollY;
    if (event.target.id == 'canvas') {
        for (let i = 0; i < cells.length; i++) {
            if (cells[i].x < mouse_x && mouse_x < cells[i].x + cell_size &&
                cells[i].y < mouse_y && mouse_y < cells[i].y + cell_size
            ) {
                console.log(cells[i]);
                return;
            }
        }
        
        console.log("" + mouse_x + " | " + mouse_y);
    }
});