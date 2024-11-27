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

function Agent(){
    this.x = undefined;
    this.y = undefined;
    this.radius = 2;
    this.opinion = Math.random();

    this.draw = function() {
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(animation_frame, (1.0 - this.opinion) * y_axis_length, this.radius, 0, 2 * Math.PI);
        ctx.strokeStyle = "#00000011";
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
let y_axis_length = 700;
let animation_frame = 0;

let steps_per_frame = 50;
let amount_agents = 1000;

let d = 0.5;
let µ = 0.5;

let agents = [];


function init() {
    agents = [];
    isPaused = true;
    y_axis = new Line(0, 0, 0, y_axis_length);
    y_axis.draw();
    
    x_axis = new Line(0, y_axis_length, 1000, y_axis_length);
    x_axis.draw();

    for (let j=0; j < 9; j++) {
        x_axis = new Line(100 * j, y_axis_length, 100 * j, y_axis_length + 10);
        x_axis.draw();
        ctx.font = "10px Arial";
        ctx.fillText("" + j * 100 * steps_per_frame, 100 * j - 12, y_axis_length + 20);
    }

    for (let i=0; i < amount_agents; i++) {
        agents.push(new Agent());
    }
}


function animate(){
    setTimeout(function(){
        if (!isPaused) {
            for (let m = 0; m < steps_per_frame; m++) {
                let random_number1 = Math.floor(Math.random() * agents.length);
                let random_number2 = Math.floor(Math.random() * agents.length);
                let agent1 = agents[random_number1];
                let agent2 = agents[random_number2];
    
                let opinion_distance = Math.abs(agent1.opinion - agent2.opinion);
                if (opinion_distance < d) {
                    agent1.opinion = agent1.opinion + µ * (agent2.opinion - agent1.opinion);
                    agent2.opinion = agent2.opinion + µ * (agent1.opinion - agent2.opinion);
                }
            }

            for (let i=0; i < agents.length; i++) {
                agents[i].draw();
            }
            animation_frame++;
        }
        requestAnimationFrame(animate);
    }, animationTimeout);
}
