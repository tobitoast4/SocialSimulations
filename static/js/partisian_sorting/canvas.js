var canvas = document.querySelector("canvas");

canvas.height = window.innerHeight;
canvas.width = window.innerHeight;

var ctx = canvas.getContext("2d");

function clear(){
    ctx.clearRect(0, 0, innerWidth, innerHeight)
}

function getRandomInt0(max) {
    // console.log(getRandomInt0(3));
    // Expected output: 0, 1 or 2
    return Math.floor(Math.random() * max);
}

function getRandomInt1(max) {
    // console.log(getRandomInt1(3));
    // Expected output: 1, 2 or 3
    return Math.floor(Math.random() * max) + 1;
}

function randomChoice(array, probabilities) {
    // Randomly chooses an element from the array respecting the given probabilities. Example Usage:
    // const nums = [1, 2, 3, 4];
    // const probs = [0.1, 0.2, 0.3, 0.4];
    // console.log(randomChoice(nums, probs)); // Sample 1 elements with probabilities given
    if (probabilities) {
        // Ensure probabilities sum to 1
        const sum = probabilities.reduce((a, b) => a + b, 0);
        if (Math.abs(sum - 1) > 1e-6) {
            throw new Error("Probabilities must sum to 1.");
        }
    }

    const indices = [...Array(array.length).keys()];
    // Use weighted sampling
    const cumulative = [];
    probabilities.reduce((acc, prob, idx) => {
        cumulative[idx] = acc + prob;
        return cumulative[idx];
    }, 0);
    const rand = Math.random();
    let index = cumulative.findIndex(cumProb => rand < cumProb);

    return array[indices[index]];
}


function getRandomSubset(array, size) {
    // Shuffle the array using the Fisher-Yates algorithm
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    // Return the first `size` elements of the shuffled array
    return array.slice(0, size);
}

function absoluteSimilarity(a1, a2) {
    let delta_static = 0;
    if (a1.static_opinion == a2.static_opinion) {
        delta_static = 1;
    }
    let delta_dynamic = 0;  // iterate over the dynamic opinions to get the delta
    for (let i=0; i<n; i++) {
        if (a1.dynamic_opinions[i] == a2.dynamic_opinions[i]) {
            delta_dynamic++;
        }
    }
    return ((c*delta_static) + delta_dynamic) / (c + n) 
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
        ctx.strokeStyle = "#999999";
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
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(x, y, cell_size, cell_size);
    }
}

function Agent(cell){
    this.cell = cell;
    this.color = "black";
    this.static_opinion = getRandomInt1(k);
    this.dynamic_opinions = [];
    for (let i=0; i < n; i++) {
        this.dynamic_opinions.push(getRandomInt1(m));
    }

    this.calculateColor = function() {
        let ds = this.dynamic_opinions;
        // e.g. m=10; n=4; d=(7, 2, 3, 8) yields (7000, 200, 30, 8)
        let ds_ = ds.map((x, i) => (x-1)*m**(ds.length - i - 1));  // (x-1) bacause dynamic_opinions are 1-index based (1-m)
        let sum = ds_.reduce((a, b) => a + b, 0); // e.g. ds_=(7000, 200, 30, 8) yields 7230
        let hex = Math.floor((sum / m**n) * 256*256*256).toString(16);  // e.g. sum=m**n yields ffffff
        this.color = "#" + hex.padStart(6, '0');
    }

    this.draw = function() {
        this.calculateColor();
        if (this.static_opinion == 1) {  // draw agent as an x
            let margin = cell_size / 6;
            ctx.lineWidth = cell_size / 10 + 1;
            ctx.beginPath();
            ctx.moveTo(this.cell.x + margin, this.cell.y + margin);
            ctx.lineTo(this.cell.x + cell_size - margin, this.cell.y + cell_size - margin);
            ctx.moveTo(this.cell.x + cell_size - margin, this.cell.y + margin);
            ctx.lineTo(this.cell.x + margin, this.cell.y + cell_size - margin);
            ctx.strokeStyle = this.color;
            ctx.stroke();
        }
        if (this.static_opinion == 2) {  // draw agent as an o
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.cell.x + cell_size / 2, this.cell.y + cell_size / 2, cell_size / 3, 0, 2 * Math.PI);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
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

let cells_width = undefined;                // set in setup
let cells_height = undefined;               // set in setup
let cell_size = undefined;                  // set in setup

let k=undefined;        // amount of static opinions
let m=undefined;        // integer values that a dynamic opinion attribute can be
let n=undefined;        // amount of dynamic opinions per agent
let gamma=undefined;    // how many other (not their neighbours) agents an agent will see in %
let h=undefined;        // Steepness for relative similarity
let c=undefined;        // weight, how strong the static opinion should be valued

function init() {
    lines = [];
    cells = [];
    agents = [];

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
        agents.push(agent);
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

function step() {
    let random_agent = agents[getRandomInt0(agents.length)];
    
    // Select interlocutors: neighbors + randomly selected
    let size_keep_neighbours = Math.round(random_agent.cell.neighbours.length * (1- gamma));
    let size_new_neighbours = random_agent.cell.neighbours.length - size_keep_neighbours
    let keep_neighbours = getRandomSubset(random_agent.cell.neighbours, size_keep_neighbours);   // select neighbours to stay in touch with in this round
    let new_neighbours = getRandomSubset(cells, size_new_neighbours);                      // select new neighbours to communicate with in this round
    let neighbour_cells = keep_neighbours.concat(new_neighbours);
    let neighbours = neighbour_cells.map(c => c.agent);
    if (neighbours.length != random_agent.cell.neighbours.length) {
        throw Error("Amount interlocutors invalid!");
    }

    // Pick the other node based on the similarity
    let weights = [];
    for (const neighbour of neighbours) {
        weights.push(absoluteSimilarity(random_agent, neighbour)**h);
    }
    let similarity_sum = weights.reduce((partialSum, a) => partialSum + a, 0);
    if (similarity_sum == 0) {
        return; // No similarities with any neighbor: no change
    }
    for (let w=0; w < weights.length; w++) {
        weights[w] = weights[w] / similarity_sum;
    }
    
    // Randomly pick another node on the basis of weights, urn model
    let other_agent = randomChoice(neighbours, weights);

    // Pick dimension for which the other node that is different than ours
    let deltas_dynamic = [];  // iterate over the dynamic opinions to get the delta
    for (let i=0; i<n; i++) {
        if (random_agent.dynamic_opinions[i] == other_agent.dynamic_opinions[i]) {
            // Note: here it is different than in absoluteSimilarity() !!!
            deltas_dynamic.push(0);
        } else {
            deltas_dynamic.push(1);
        }
    }
    let deltas_dynamic_sum = deltas_dynamic.reduce((partialSum, a) => partialSum + a, 0);
    // if (deltas_dynamic_sum == 0) {
    //     throw Error("I think this should never happen... (function should have returned before)");
    //     return; // They're already the same
    // }
    for (let d=0; d < deltas_dynamic.length; d++) {
        deltas_dynamic[d] = deltas_dynamic[d] / deltas_dynamic_sum;
    }

    let dynamic_opinions_indices = [...Array(n).keys()];
    let dynamic_opinions_index_to_change = randomChoice(dynamic_opinions_indices, deltas_dynamic);
    random_agent.dynamic_opinions[dynamic_opinions_index_to_change] = other_agent.dynamic_opinions[dynamic_opinions_index_to_change];
}


function animate(){
    setTimeout(function(){
        if (!isPaused) {
            clear();
            
            for (let i=0; i<1000; i++){
                step();
            }

            // display the cells
            for (let i = 0; i < cells.length; i++){
                cells[i].draw();
            }
            // display the agents
            for (let i = 0; i < agents.length; i++){
                agents[i].draw();
            }
            // display the lines between the cells
            for (let i = 0; i < lines.length; i++){
                lines[i].update();
            }
        }
        requestAnimationFrame(animate);
    }, animationTimeout);
}

