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
    this.new_cell_state = 0; 
    this.cell_state = 0;  // 0: did not adopt (yet), 1: dit adopt
    let random_number = Math.random() * 100;
    if (random_number < 50){
        this.cell_state = 1;
    }

    this.draw = function() {
        ctx.lineWidth = 1;
        if (this.cell_state == 1) {
            ctx.fillStyle = "black";
        } else {
            ctx.fillStyle = "#f0f0f0";
        }
        ctx.fillRect(x, y, cell_size, cell_size);
    }

    this.determineNewCellState = function() {
        let amount_neighbours_state_1 = 0;
        let amount_neighbours_state_0 = 0;
        for (let i = 0; i < this.neighbours.length; i++) {
            if (this.neighbours[i].cell_state == 1) {
                amount_neighbours_state_1++;
            }
            if (this.neighbours[i].cell_state == 0) {
                amount_neighbours_state_0++;
            }
        }
        this.new_cell_state = this.cell_state;  // keep this as default
        if (amount_neighbours_state_1 >= 5) {
            this.new_cell_state = 1;  // change is majority is 1
        }
        if (amount_neighbours_state_0 >= 5) {
            this.new_cell_state = 0;  // change is majority is 0
        }
        // if (this.cell_state == 0 && amount_neighbours_state_1 >= 3) {
        //     let random_number = Math.random() * 100;
        //     if (random_number < 50){
        //         this.new_cell_state = 1;
        //     }
        // }
        // if (this.cell_state == 1 && amount_neighbours_state_0 >= 3) {
        //     let random_number = Math.random() * 100;
        //     if (random_number < 50){
        //         this.new_cell_state = 0;
        //     }
        // }
    }

    this.update = function() {
        this.cell_state = this.new_cell_state;
        this.draw();
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

    // draw cells
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
        if (cell.row-1 > 0) {  // north
            cell.neighbours.push(getCellAtPosition(cell.row-1, cell.col));
        }
        if (cell.row+1 < cells_height) {  // south
            cell.neighbours.push(getCellAtPosition(cell.row+1, cell.col));
        }
        if (cell.col-1 > 0) {  // west
            cell.neighbours.push(getCellAtPosition(cell.row, cell.col-1));
        }
        if (cell.col+1 < cells_width) {  // east
            cell.neighbours.push(getCellAtPosition(cell.row, cell.col+1));
        }
        if (cell.row-1 > 0 && cell.col-1 > 0) {  // north-west
            cell.neighbours.push(getCellAtPosition(cell.row-1, cell.col-1));
        }
        if (cell.row-1 > 0 && cell.col+1 < cells_width) {  // north-east
            cell.neighbours.push(getCellAtPosition(cell.row-1, cell.col+1));
        }
        if (cell.row+1 < cells_height && cell.col-1 > 0) {  // south-west
            cell.neighbours.push(getCellAtPosition(cell.row+1, cell.col-1));
        }
        if (cell.row+1 < cells_height && cell.col+1 < cells_width) {  // south-east
            cell.neighbours.push(getCellAtPosition(cell.row+1, cell.col+1));
        }
    }
    
    for (let i = 0; i < cells.length; i++){
        cells[i].draw();
    }
    // display the lines between the cells
    for (let i = 0; i < lines.length; i++){
        lines[i].update();
    }
}


function animate(){
    setTimeout(function(){
        if (!isPaused) {
            clear();
            // The round_probability need to be updated first, only AFTER the new cell state can be set
            // Otherwise the gossip may spread to fast in the direction that the for loop goes
            for (let i = 0; i < cells.length; i++){
                cells[i].determineNewCellState();
            }
            for (let i = 0; i < cells.length; i++){
                cells[i].update();
            }
    
            // display the lines between the cells
            for (let i = 0; i < lines.length; i++){
                lines[i].update();
            }
        }
        requestAnimationFrame(animate);
    }, animationTimeout);
}