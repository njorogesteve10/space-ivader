const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

let gameOver = false;
let score = 0;
let scoreTexts = [];
let bonusBalls = [];
let playAgainButton;

class Player {
    constructor() {
        this.position = {
            x: canvas.width / 2 - 50,
            y: canvas.height - 120
        };
        this.width = 100;
        this.height = 100;
        this.velocity = {
            x: 0,
            y: 0
        };

        this.image = new Image();
        this.image.src = './spaceship.png';
        this.rotation = 0;
    }

    draw() {
        c.save();
        c.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
        c.rotate(this.rotation * Math.PI / 180);
        c.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        c.restore();
    }

    moveLeft() {
        if (this.position.x > 0) {
            this.velocity.x = -30; // Increased speed
            this.rotation = -20;
        }
    }

    moveRight() {
        if (this.position.x + this.width < canvas.width) {
            this.velocity.x = 30; // Increased speed
            this.rotation = 20;
        }
    }

    update() {
        this.position.x += this.velocity.x;
        this.velocity.x *= 0.95;
        if (Math.abs(this.velocity.x) < 0.01) {
            this.velocity.x = 0;
            this.rotation = 0;
        }
    }
}

class InvaderProjectile {
    constructor(position, velocity) {
        this.position = position;
        this.velocity = velocity;

        this.width = 3;
        this.height = 10;
    }

    draw() {
        c.fillStyle = 'white';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Invader {
    constructor(x, y) {
        this.position = {
            x: x,
            y: y
        };
        this.width = 100;
        this.height = 100;
        this.velocity = {
            x: 10, // Increased speed
            y: 0
        };

        this.image = new Image();
        this.image.src = './invader.png';
        this.rotation = 0;
    }

    draw() {
        c.save();
        c.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
        c.rotate(this.rotation * Math.PI / 180);
        c.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        c.restore();
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x;
            this.position.y += 40; // Increased descent speed
        }

        if (this.position.y + this.height >= canvas.height) {
            gameOver = true;
            displayGameOver();
        }
    }
}

class Grid {
    constructor() {
        this.position = {
            x: 0,
            y: 0
        };
        this.velocity = {
            x: 10, // Increased speed
            y: 0
        };
        this.invaders = [];

        const columns = Math.floor(Math.random() * 10 + 5);
        const rows = Math.floor(Math.random() * 5 + 2);

        for (let i = 0; i < columns; i++) {
            for (let j = 0; j < rows; j++) {
                this.invaders.push(new Invader(i * 100, j * 100));
            }
        }
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.velocity.y = 0;

        if (this.position.x + this.invaders[0].width >= canvas.width || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x;
            this.invaders.forEach(invader => {
                invader.position.y += 40; // Increased descent speed
            });
        }

        this.invaders.forEach(invader => {
            invader.update();
        });
    }

    draw() {
        this.invaders.forEach(invader => {
            invader.draw();
        });
    }
}

class Projectile {
    constructor(x, y) {
        this.position = {
            x: x,
            y: y
        };
        this.radius = 5;
        this.speed = 40; // Increased speed
    }

    draw() {
        c.save();
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = 'red';
        c.fill();
        c.closePath();
        c.restore();
    }

    update() {
        this.position.y -= this.speed;
    }
}

class BonusBall {
    constructor() {
        this.position = {
            x: Math.random() < 0.5 ? -50 : canvas.width + 50,
            y: Math.random() * canvas.height / 2
        };
        this.radius = 150 / 3; // One and a half times bigger than the size of a single spaceship
        this.speed = 10;
        this.velocity = {
            x: this.position.x < 0 ? this.speed : -this.speed,
            y: 0
        };
        this.color = `hsl(${Math.random() * 360}, 50%, 50%)`; // Different colors
    }

    draw() {
        c.save();
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
        c.restore();
    }

    update() {
        this.position.x += this.velocity.x;
    }

    explode() {
        displayScoreText('+350', this.position.x, this.position.y);
        score += 350;
        for (let i = 0; i < 7; i++) {
            if (grids[0] && grids[0].invaders.length > 0) {
                grids[0].invaders.pop();
            }
        }
    }
}

class ScoreText {
    constructor(text, x, y) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.opacity = 1;
    }

    draw() {
        c.save();
        c.globalAlpha = this.opacity;
        c.fillStyle = 'white';
        c.font = '50px Arial';
        c.fillText(this.text, this.x, this.y);
        c.restore();
    }

    update() {
        this.y -= 1;
        this.opacity -= 0.01;
    }
}

const invaderProjectiles = [];
const player = new Player();
const projectiles = [];
const grids = [new Grid()];

function animate() {
    if (gameOver) return;

    requestAnimationFrame(animate);
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.update();
    player.draw();

    invaderProjectiles.forEach((invaderProjectile, index) => {
        invaderProjectile.update();
        invaderProjectile.draw();

        if (
            invaderProjectile.position.y + invaderProjectile.height >= player.position.y &&
            invaderProjectile.position.x + invaderProjectile.width >= player.position.x &&
            invaderProjectile.position.x <= player.position.x + player.width
        ) {
            gameOver = true;
            displayGameOver();
        }

        if (invaderProjectile.position.y + invaderProjectile.height > canvas.height) {
            setTimeout(() => {
                invaderProjectiles.splice(index, 1);
            }, 0);
        }
    });

    grids.forEach((grid, gridIndex) => {
        grid.update();
        grid.draw();

        grid.invaders.forEach((invader, invaderIndex) => {
            projectiles.forEach((projectile, projectileIndex) => {
                if (
                    projectile.position.y - projectile.radius <= invader.position.y + invader.height &&
                    projectile.position.x + projectile.radius >= invader.position.x &&
                    projectile.position.x - projectile.radius <= invader.position.x + invader.width &&
                    projectile.position.y + projectile.radius >= invader.position.y
                ) {
                    setTimeout(() => {
                        displayScoreText('+50', invader.position.x, invader.position.y);
                        grid.invaders.splice(invaderIndex, 1);
                        projectiles.splice(projectileIndex, 1);
                        score += 50;

                        if (grid.invaders.length < 3) {
                            for (let i = grid.invaders.length; i < 3; i++) {
                                grid.invaders.push(new Invader(Math.random() * canvas.width, Math.random() * canvas.height));
                            }
                        }
                    }, 0);
                }
            });
        });

        grid.invaders.forEach(invader => {
            if (invader.position.y + invader.height >= canvas.height) {
                gameOver = true;
                displayGameOver();
            }
        });
    });

    projectiles.forEach((projectile, index) => {
        projectile.update();
        projectile.draw();

        if (projectile.position.y + projectile.radius < 0) {
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0);
        }

        bonusBalls.forEach((bonusBall, bonusBallIndex) => {
            if (
                projectile.position.x + projectile.radius >= bonusBall.position.x - bonusBall.radius &&
                projectile.position.x - projectile.radius <= bonusBall.position.x + bonusBall.radius &&
                projectile.position.y + projectile.radius >= bonusBall.position.y - bonusBall.radius &&
                projectile.position.y - projectile.radius <= bonusBall.position.y + bonusBall.radius
            ) {
                bonusBall.explode();
                setTimeout(() => {
                    bonusBalls.splice(bonusBallIndex, 1);
                }, 0);
            }
        });
    });

    scoreTexts.forEach((scoreText, index) => {
        scoreText.update();
        scoreText.draw();
        if (scoreText.opacity <= 0) {
            scoreTexts.splice(index, 1);
        }
    });

    bonusBalls.forEach((bonusBall, index) => {
        bonusBall.update();
        bonusBall.draw();
        if (bonusBall.position.x + bonusBall.radius < 0 || bonusBall.position.x - bonusBall.radius > canvas.width) {
            setTimeout(() => {
                bonusBalls.splice(index, 1);
            }, 0);
        }
    });

    displayScore();
}

function displayScoreText(text, x, y) {
    scoreTexts.push(new ScoreText(text, x, y));
}

function displayGameOver() {
    c.save();
    c.fillStyle = 'white';
    c.font = '100px Arial';
    c.fillText('GAME OVER', canvas.width / 2 - 300, canvas.height / 2); // Adjusted positioning for larger text
    c.fillText('Score: ' + score, canvas.width / 2 - 150, canvas.height / 2 + 100); // Display total score
    c.restore();

    createPlayAgainButton();
}

function displayScore() {
    c.save();
    c.fillStyle = 'white';
    c.font = '20px Arial';
    c.fillText('Score: ' + score, canvas.width / 2 - 50, 40); // Adjusted positioning to center
    c.restore();
}

function spawnBonusBall() {
    if (!gameOver) {
        bonusBalls.push(new BonusBall());
        setTimeout(spawnBonusBall, 5000);
    }
}

function spawnNewGrid() {
    if (!gameOver) {
        grids.push(new Grid());
        setTimeout(spawnNewGrid, 5000); // Decreased interval for faster spawning
    }
}

function spawnInvaderProjectile() {
    if (!gameOver) {
        invaderProjectiles.push(new InvaderProjectile({ x: Math.random() * canvas.width, y: 0 }, { x: 0, y: 10 })); // Adjusted speed
        setTimeout(spawnInvaderProjectile, 3000); // Interval for spawning projectiles from the top
    }
}

function createPlayAgainButton() {
    playAgainButton = document.createElement('button');
    playAgainButton.innerHTML = 'Play Again';
    playAgainButton.style.position = 'absolute';
    playAgainButton.style.left = canvas.width / 2 - 50 + 'px';
    playAgainButton.style.top = canvas.height / 2 + 200 + 'px';
    document.body.appendChild(playAgainButton);
    playAgainButton.addEventListener('click', resetGame);
}

function removePlayAgainButton() {
    if (playAgainButton) {
        playAgainButton.removeEventListener('click', resetGame);
        document.body.removeChild(playAgainButton);
        playAgainButton = null;
    }
}

function resetGame() {
    gameOver = false;
    score = 0;
    scoreTexts = [];
    bonusBalls = [];
    invaderProjectiles.length = 0;
    projectiles.length = 0;
    grids.length = 0;
    grids.push(new Grid());
    removePlayAgainButton();
    spawnBonusBall();
    spawnNewGrid();
    spawnInvaderProjectile();
    animate();
}

window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        player.moveLeft();
    } else if (event.key === 'ArrowRight') {
        player.moveRight();
    } else if (event.key === ' ') {
        shoot();
    }
});

window.addEventListener('click', (event) => {
    shoot();
});

function shoot() {
    if (!gameOver) {
        projectiles.push(new Projectile(player.position.x + player.width / 2, player.position.y));
    }
}

spawnBonusBall();
spawnNewGrid();
spawnInvaderProjectile();
animate();
