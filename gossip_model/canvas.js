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
    this.round_probability = 0;  // the probability how likely the cell is being updated to black
    this.cell_state = 0;  // 0: does not know the gossip, 1: knows the gossip 

    this.draw = function() {
        ctx.lineWidth = 1;
        if (this.cell_state == 1) {
            ctx.fillStyle = "black";
        } else {
            ctx.fillStyle = "grey";
        }
        ctx.fillRect(x, y, cell_size, cell_size);
    }

    this.determineProbability = function() {
        let amount_neighbours_state = 0;
        for (let i = 0; i < this.neighbours.length; i++) {
            if (this.neighbours[i].cell_state == 1) {
                amount_neighbours_state++;
            }
        }
        this.round_probability = amount_neighbours_state * tell_gossip_prob;
    }

    this.update = function() {
        let random_number = Math.random() * 100;
        if (random_number < this.round_probability) {
            this.cell_state = 1;
        }

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


isPaused = false;
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
        if (cell.row-1 > 0) {
            cell.neighbours.push(getCellAtPosition(cell.row-1, cell.col));
        }
        if (cell.row+1 < cells_height) {
            cell.neighbours.push(getCellAtPosition(cell.row+1, cell.col));
        }
        if (cell.col-1 > 0) {
            cell.neighbours.push(getCellAtPosition(cell.row, cell.col-1));
        }
        if (cell.col+1 < cells_width) {
            cell.neighbours.push(getCellAtPosition(cell.row, cell.col+1));
        }
    }

    // Set one cell to know the gossip
    middle_cell = getCellAtPosition(parseInt(cells_width / 2)-1, parseInt(cells_height / 2)-1);
    middle_cell.cell_state = 1;

}


function animate(){
    setTimeout(function(){
        requestAnimationFrame(animate);

        if (!isPaused) {
            clear();
            // The round_probability need to be updated first, only AFTER the new cell state can be set
            // Otherwise the gossip may spread to fast in the direction that the for loop goes
            for (let i = 0; i < cells.length; i++){
                cells[i].determineProbability();
            }
            for (let i = 0; i < cells.length; i++){
                cells[i].update();
            }
    
            // display the lines between the cells
            for (let i = 0; i < lines.length; i++){
                lines[i].update();
            }
        }
    }, animationTimeout);
}
