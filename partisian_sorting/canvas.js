var canvas = document.querySelector("canvas");

canvas.height = window.innerHeight;
canvas.width = window.innerHeight;

var ctx = canvas.getContext("2d");

function clear(){
    ctx.clearRect(0, 0, innerWidth, innerHeight)
}


function Line(x0, y0, x1, y2){
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y2 = y2;

    this.draw = function() {
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x0, this.y0);
        ctx.lineTo(this.x1, this.y2);
        ctx.stroke();
    }

    this.update = function() {
        this.draw();
    }
}

function Cell(row, col, x, y, cell_size){
    this.row = row;
    this.col = col;
    this.x = x;
    this.y = y;
    this.cell_size = cell_size;
    this.neighbours = [];
    this.agent = null;

    this.draw = function() {
        ctx.lineWidth = 1;
        if (this.cell_state == 1) {
            ctx.fillStyle = "#f0f0f0";
        } else {
            ctx.fillStyle = "#f0f0f0";
        }
        ctx.fillRect(x, y, cell_size, cell_size);
    }
}

function Agent(cell){
    this.cell = cell;

    this.draw = function() {
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x0, this.y0);
        ctx.lineTo(this.x1, this.y2);
        ctx.stroke();
    }
}

function getCellAtPosition(row, col) {
    for (let i = 0; i < cells.length; i++){
        if (cells[i].row == row && cells[i].col == col) {
            return cells[i];
        }
    }
    return null;
}


isPaused = true;
animationTimeout = -1; 

let lines = [];
let cells = [];
let agents = [];

let tell_gossip_prob = undefined;    // set in setup (in %)
let cells_width = undefined;                // set in setup
let cells_height = undefined;               // set in setup
let cell_size = undefined;                  // set in setup


function init() {
    lines = [];
    cells = [];

    // horizontal lines
    x1 = cells_height * cell_size;
    for (let i=0; i <= cells_width; i++) {
        y = i*cell_size;
        let line = new Line(0, y, x1, y);
        lines.push(line);
    }
    // vertical lines
    y1 = cells_width * cell_size;
    for (let i=0; i <= cells_height; i++) {
        x = i*cell_size;
        let line = new Line(x, 0, x, y1);
        lines.push(line);
    }

    // create cells
    for (let r=0; r < cells_width; r++) {
        for (let c=0; c < cells_width; c++) {
            x = cell_size * c;
            y = cell_size * r;
            let cell = new Cell(r, c, x, y, cell_size);
            cells.push(cell);
        }
    }

    for (let i = 0; i < cells.length; i++){
        let cell = cells[i];
        if (cell.row-1 >= 0) {  // north
            cell.neighbours.push(getCellAtPosition(cell.row-1, cell.col));
        } else {  // this is for the torus (each cell should have 8 neighbors)
            cell.neighbours.push(getCellAtPosition(cells_height-1, cell.col));
        }
        if (cell.row+1 < cells_height) {  // south
            cell.neighbours.push(getCellAtPosition(cell.row+1, cell.col));
        } else {  // this is for the torus (each cell should have 8 neighbors)
            cell.neighbours.push(getCellAtPosition(0, cell.col));
        }
        if (cell.col-1 >= 0) {  // west
            cell.neighbours.push(getCellAtPosition(cell.row, cell.col-1));
        } else {  // this is for the torus (each cell should have 8 neighbors)
            cell.neighbours.push(getCellAtPosition(cell.row, cells_width-1));
        }
        if (cell.col+1 < cells_width) {  // east
            cell.neighbours.push(getCellAtPosition(cell.row, cell.col+1));
        } else {
            cell.neighbours.push(getCellAtPosition(cell.row, 0));
        }

        if (cell.row-1 >= 0 && cell.col-1 >= 0) {  // north-west
            cell.neighbours.push(getCellAtPosition(cell.row-1, cell.col-1));
        } else {
            if (cell.row-1 < 0 && cell.col-1 >= 0) {
                cell.neighbours.push(getCellAtPosition(cells_height-1, cell.col-1));
            }
            if (cell.row-1 >= 0 && cell.col-1 < 0) {
                cell.neighbours.push(getCellAtPosition(cell.row-1, cells_width-1));
            }
        }
        if (cell.row-1 >= 0 && cell.col+1 < cells_width) {  // north-east
            cell.neighbours.push(getCellAtPosition(cell.row-1, cell.col+1));
        } else {
            if (cell.row-1 < 0 && cell.col+1 < cells_width) {
                cell.neighbours.push(getCellAtPosition(cells_height-1, cell.col+1));
            }
            if (cell.row-1 >= 0 && cell.col+1 >= cells_width) {
                cell.neighbours.push(getCellAtPosition(cells_height-1, 0));
            }
        }
        if (cell.row+1 < cells_height && cell.col-1 >= 0) {  // south-west
            cell.neighbours.push(getCellAtPosition(cell.row+1, cell.col-1));
        } else {
            if (cell.row+1 >= cells_height && cell.col-1 >= 0) {
                cell.neighbours.push(getCellAtPosition(0, cell.col-1));
            }
            if (cell.row+1 < cells_height && cell.col-1 < 0) {
                cell.neighbours.push(getCellAtPosition(cell.row+1, cells_width-1));
            }
        }
        if (cell.row+1 < cells_height && cell.col+1 < cells_width) {  // south-east
            cell.neighbours.push(getCellAtPosition(cell.row+1, cell.col+1));
        } else {
            if (cell.row+1 >= cells_height && cell.col+1 < cells_width) {  // south-east
                cell.neighbours.push(getCellAtPosition(0, cell.col+1));
            }
            if (cell.row+1 < cells_height && cell.col+1 >= cells_width) {  // south-east
                cell.neighbours.push(getCellAtPosition(cell.row+1, 0));
            }
        }
    }
    // connect the corner cells (for the torus)
    getCellAtPosition(0, 0).neighbours.push(getCellAtPosition(cells_height-1, cells_width-1));
    getCellAtPosition(cells_height-1, cells_width-1).neighbours.push(getCellAtPosition(0, 0));
    getCellAtPosition(cells_height-1, 0).neighbours.push(getCellAtPosition(0, cells_width-1));
    getCellAtPosition(0, cells_width-1).neighbours.push(getCellAtPosition(cells_height-1, 0));


    // fill each cell with an agent
    for (let i = 0; i < cells.length; i++){
        let agent = new Agent(cells[i]);
        cells[i].agent = agent;
    }

    for (let i = 0; i < cells.length; i++){
        cells[i].draw();
    }
    // display the lines between the cells
    for (let i = 0; i < lines.length; i++){
        lines[i].update();
    }
}

function check() {
    for (let i = 0; i < cells.length; i++){
        if (cells[i].neighbours.length != 8) {
            console.log(cells[i].col);
            console.log(cells[i].row);
            throw Error("!!!");
        }
    }
}


function animate(){
    setTimeout(function(){
        if (!isPaused) {
            clear();
            
            // display the lines between the cells
            for (let i = 0; i < lines.length; i++){
                lines[i].update();
            }
        }
        requestAnimationFrame(animate);
    }, animationTimeout);
}