let canvas, parent

let reel, casing, coin
let label = 10,
    slot = 3,
    radius, length, interval

let combination = [],
    angularV = [],
    angularA = []
let period = [],
    time = [],
    spin = []

let amplitude = 0.0004
let a = 200,
    d = 100

let pull

let notification = document.querySelector('.toast')
let message = document.querySelector('.toast-body')

let start = false,
    end = false

let win = false
let jackpot = [20, 40, 250, 60, 500, 80, 750, 100, 1000, 200]
let amount = 0

let system
let scale = 0.1

let savings = 0
let savingsBtn = document.getElementById('savingsBtn')

let spinning, spinningCue, stopSpinning, stopSpinningCue
let play = false
let winning, winningCue

function preload() {
    reel = loadImage('reel.png')
    casing = loadImage('casing.png')
    coin = loadImage('coin.png')

    winning = loadSound('winning.mp3')
    spinning = loadSound('spinning.mp3')
    stopSpinning = loadSound('spinning.mp3')
}

function setProperties() {
    length = width / slot - width * 0.0845
    radius = 0.5 * length / sin(PI / label)
    interval = int(slot / 2)
    pull = PI / 6
}

function setup() {
    pixelDensity(1)
    frameRate(60)

    parent = document.getElementById('canvas-wrapper')
    canvas = createCanvas(parent.offsetWidth, parent.offsetHeight, WEBGL)
    canvas.parent(parent)

    setProperties()
    for (let n = 0; n < slot; n++) {
        combination.push(int(random(label)) / label)
        angularV.push(0)
        angularA.push(0)
        period.push(int(random(a + n * d + 1, a + (n + 1) * d)))
        time.push(0)
        spin.push(false)
    }
    system = new ParticleSystem(createVector(-width * 0.2, height * 0.2));

    noStroke()
}

function draw() {
    background(0)
    ortho()

    if (start && pull > -PI / 6) pull -= 0.1
    else start = false

    push()
    fill(255)
    stroke(128)
    strokeWeight(width * 0.015)
    translate(width * 0.2685, height * 0.325, 0)
    rotateX(pull)
    box(width * 0.025, width * 0.025, width * 0.4)
    pop()

    push()
    fill(255, 0, 0)
    stroke(64, 0, 0)
    strokeWeight(width * 0.03)
    translate(width * 0.2685, height * 0.325 - width * 0.2 * sin(pull), width * 0.2 * cos(pull))
    rotateX(pull)
    box(width * 0.08)
    pop()
    push()
    rotateZ(PI / 2)
    rotateY(PI / label)

    for (let n = 0; n < slot; n++) {
        push()
        translate(height * 0.032, (interval - n) * length, -radius * 1.1)
        rotateY(TAU * combination[n])
        texture(reel)
        cylinder(radius, length, label + 1)
        pop()

        if (spin[n]) {
            combination[n] += angularV[n]
            angularA[n] = amplitude * sin(time[n] * TAU / period[n])
            angularV[n] += angularA[n]
            time[n] += 1

            if (time[n] === period[n]) {
                combination[n] %= 1
                combination[n] = match(combination[n])
                    //combination[n] = 0.8
                period[n] = int(random(a + n * d + 1, a + (n + 1) * d))
                time[n] = 0
                spin[n] = false

                if (!mute) {
                    stopSpinning.play()
                    stopSpinning.jump(1)
                    stopSpinningCue = stopSpinning.addCue(1.5, () => { stopSpinning.stop() })
                }
                if (n === slot - 1) end = true
            }
        }
    }
    pop()
    push()
    texture(casing)
    plane(width, height)
    pop()

    if (end) {
        spinning.removeCue(spinningCue)
        if (combination.every(i => i === combination[0])) {
            let earn = jackpot[combination[0] * 10]

            if (!play && amount > 10) {
                show(`You earn ${earn} coins from the jackpot!`, 'bg-primary')
                change(earn)
                updateData(CHART, TIME, savings)

                if (!mute) {
                    winning.play()
                    winningCue = winning.addCue(2.5, () => { winning.jump(0.8) })
                }
                play = true
            }
            if (amount < earn) {
                system.addParticle()
                amount++
            } else winning.removeCue(winningCue)
            system.run()
        }

        if (pull < PI / 6) pull += 0.05
    }
}

function windowResized() {
    resizeCanvas(parent.offsetWidth, parent.offsetHeight)
    setProperties()
}

function mousePressed() {
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        if (spin.every(i => i === false)) {
            TIME++
            time = [0, 0, 0]

            start = true
            end = false
            amount = 0
            play = false

            show('You lose 10 coins to play slot machine.', 'bg-danger')
            change(-10)
            updateData(CHART, TIME, savings)

            spin = spin.map(i => i = true)

            if (!mute) {
                stopSound()

                spinning.play()
                spinning.jump(1)
                spinningCue = spinning.addCue(4, () => { spinning.jump(2) })
            }
        }
    }
}

function show(text, bg) {
    message.innerHTML = text

    notification.classList.add('show')
    notification.classList.add(bg)

    setTimeout(() => {
        notification.classList.remove('show')
        notification.classList.remove(bg)
    }, 4000)
}

function change(money) {
    savings += money

    let btnColor
    if (savings > 0) btnColor = 'btn-primary'
    else if (savings === 0) btnColor = 'btn-success'
    else if (savings < 0) btnColor = 'btn-danger'

    savingsBtn.innerHTML = `Savings: ${savings} coins`

    savingsBtn.classList.replace(savingsBtn.classList.toString().match(/btn-(primary|success|danger)/)[0], btnColor)
}

let match = angle => Array.from({ length: label }, (_, i) => i / label)
    .reduce((a, b) => abs(a - angle) < abs(b - angle) ? a : b)

let Particle = function(position) {
    this.acceleration = createVector(0, 0.1);
    this.velocity = createVector(random(-1.5, 1.5), random(-1, 0));
    this.position = position.copy();
    this.lifespan = random(100, 150);
};

Particle.prototype.run = function() {
    this.update();
    this.display();
};

Particle.prototype.update = function() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.lifespan -= 2;
};

Particle.prototype.display = function() {
    push()
    translate(0, height * 0.02, -radius * 0.5)
    rotateX(PI / 6)
    texture(coin)
    tint(255, map(this.lifespan, 20, 0, 255, 0));
    circle(this.position.x, this.position.y, width * scale);
    pop()
};

Particle.prototype.isDead = function() {
    return this.lifespan < 0;
};

let ParticleSystem = function(position) {
    this.origin = position.copy();
    this.particles = [];
};

ParticleSystem.prototype.addParticle = function() {
    this.particles.push(new Particle(this.origin));
};

ParticleSystem.prototype.run = function() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
        let p = this.particles[i];
        p.run();
        if (p.isDead()) {
            this.particles.splice(i, 1);
        }
    }
};