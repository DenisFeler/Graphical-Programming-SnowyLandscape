const canvas = document.getElementById( "nightSky" );
const context = canvas.getContext( "2d" );

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const sky = "rgb(13, 29, 36)";
const ground = "rgb(255, 255, 255)";
const star = [ "rgb(229, 255, 0)", "rgb(22, 63, 197)", "rgb(255, 87, 255)", "rgb(32, 255, 2)" ];
const mountain = "rgb(41, 41, 41)";
const treeFoliage = "rgba(13, 66, 27, 0.95)";
const treeTrunk = "rgb(78, 56, 9)";
const snow = "rgb(245, 245, 245)";

const snowflakes = [];
const shootingStars = [];
const staticStars = [];
const cursorTrail = [];
const splatters = [];
const treePositions = [];

let wind = 0;
let windOffset = 0;

const waveAmplitude = 30;

function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

for ( let i = 0; i < 150; i++ ) {
    staticStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * ( canvas.height / 2 ),
        size: Math.random() * 2 + 1,
        color: star[ Math.floor( Math.random() * star.length ) ],
    });
}

for ( let i = 0; i < 75; i++ ) {
    treePositions.push({
        x: Math.random() * canvas.width,
        height: 150 + Math.random() * 50,
        trunkHeight: 20 + Math.random() * 10,
        swayOffset: Math.random() * 2 * Math.PI,
    });
}

function createSnowflake() {
    snowflakes.push({
        x: Math.random() * canvas.width,
        y: -10,
        r: Math.random() * 1 + 3,
        speed: Math.random() * 1 + 0.5,
    });
}

function createShootingStar() {
    shootingStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height / 2),
        size: Math.random() * 6 + 2,
        speed: Math.random() * 12 + 5,
        color: star[ Math.floor( Math.random() * star.length ) ],
        trail: [],
        curve: Math.random() * 0.05 + 0.02,
    });
}

function drawStaticStars() {
    staticStars.forEach(( star ) => {
        const twinkle = Math.sin(Date.now() / 500 + star.x * 0.1) * 0.3 + 0.7;
        context.globalAlpha = twinkle;

        drawStar( star.x, star.y, star.size, star.color );

        context.globalAlpha = 1.0
    });
}


function drawStar( x, y, size, color ) {
    context.fillStyle = color;
    context.beginPath();
    for ( let i = 0; i < 5; i++ ) {
        const angle = ( i * 2 * Math.PI ) / 5 - Math.PI / 2;
        const xOffset = x + size * Math.cos( angle );
        const yOffset = y + size * Math.sin( angle );
        if ( i === 0 ) {
        context.moveTo( xOffset, yOffset );
        } else {
        context.lineTo( xOffset, yOffset );
        }
    }
    context.closePath();
    context.fill();
}

function drawMountains() {
    context.fillStyle = mountain;
    context.beginPath();
    context.moveTo( 0, canvas.height - 400 );
    context.lineTo( canvas.width - 1700, canvas.height - 300 );
    context.lineTo( canvas.width - 1200, canvas.height - 700 );
    context.lineTo( canvas.width - 900, canvas.height - 460 );
    context.lineTo( canvas.width - 500, canvas.height - 370);
    context.lineTo( canvas.width - 200, canvas.height - 500);
    context.lineTo( canvas.width - 25, canvas.height - 300);
    context.lineTo( canvas.width + 400, canvas.height );
    context.lineTo( 0, canvas.height );
    context.closePath();
    context.fill();
}

function getGroundHeight( x ) {
    return canvas.height - 70 + Math.sin(( x / canvas.width ) * Math.PI * 2 ) * waveAmplitude;
}

function drawGround() {
    context.fillStyle = ground;
    context.beginPath();
    context.moveTo( 0, getGroundHeight( 0 ));
  
    for ( let x = 0; x <= canvas.width; x++ ) {
      const y = getGroundHeight( x );
      context.lineTo( x, y );
    }
    context.lineTo( canvas.width, canvas.height );
    context.lineTo( 0, canvas.height );
    context.closePath();
    context.fill();
}
  

function drawTrees() {
    treePositions.forEach((tree) => {
        const groundY = getGroundHeight(tree.x);
        const trunkY = groundY - tree.trunkHeight;
        const foliageY = trunkY - tree.height;
        const sway = Math.sin( Date.now() / 1000 + tree.swayOffset ) * 5;
    
        context.fillStyle = treeTrunk;
        context.fillRect( tree.x - 5, groundY - tree.trunkHeight, 10, tree.trunkHeight );
    
        context.fillStyle = treeFoliage;
        context.beginPath();
        context.moveTo( tree.x + sway, groundY - tree.trunkHeight - tree.height );
        context.lineTo( tree.x - 30 + sway, groundY - tree.trunkHeight );
        context.lineTo( tree.x + 30 + sway, groundY - tree.trunkHeight );
        context.closePath();
        context.fill();
    });
}
  

function drawSnowflakes() {
    context.fillStyle = snow;
    snowflakes.forEach(( snowflake, i ) => {
        context.beginPath();
        context.arc( snowflake.x, snowflake.y, snowflake.r, 0, Math.PI * 2 );
        context.fill();

        snowflake.x = lerp( snowflake.x, snowflake.x + wind, 1.0 );
        snowflake.y = lerp( snowflake.y, snowflake.y + snowflake.speed, 5.0 );

        if ( snowflake.y > canvas.height || snowflake.x < -10 || snowflake.x > canvas.width + 10 ) {
        snowflakes.splice(i, 1);
        }
    });
}

function drawShootingStars() {
    shootingStars.forEach((star, i) => {
        star.x = lerp( star.x, star.x + star.speed + wind, 1.25 );
        star.y = lerp( star.y, star.y + Math.sin(star.x * star.curve), 0.65 );

        star.trail.push({ x: star.x, y: star.y });
        if ( star.trail.length > 10 ) star.trail.shift();

        context.fillStyle = "rgba(255, 255, 255, 0.3)";
        star.trail.forEach(( point, i ) => {
            context.beginPath();
            context.arc( point.x, point.y, star.size * (1 - i / 10), 0, Math.PI * 2 );
            context.fill();
        });

        drawStar(star.x, star.y, star.size, star.color);

        if ( star.x > canvas.width || star.y > canvas.height ) {
            shootingStars.splice(i, 1);
        }
    });
}

function drawCursorTrail() {
    cursorTrail.forEach(( point, i ) => {
        point.alpha -= 0.075;
        if ( point.alpha <= 0 ) {
            cursorTrail.splice(i, 1);
            return;
        }

        context.fillStyle = `rgba(255, 255, 255, ${point.alpha})`;
        context.beginPath();
        context.arc( point.x, point.y, 3, 0, Math.PI * 2 );
        context.fill();
    });
}

function drawSplatters() {
    splatters.forEach(( splash, i ) => {
        splash.x += splash.speedX;
        splash.y += splash.speedY;

        splash.alpha -= 0.02;
        if ( splash.alpha <= 0 ) {
            splatters.splice(i, 1);
            return;
        }

        context.fillStyle = `rgba(255, 255, 255, ${splash.alpha})`;
        context.beginPath();
        context.arc( splash.x, splash.y, splash.size, 0, Math.PI * 2 );
        context.fill();
    });
}

canvas.addEventListener( "mousemove", ( e ) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    cursorTrail.push({ x: mouseX, y: mouseY, alpha: 1.0 });

    if ( cursorTrail.length > 50 ) {
        cursorTrail.shift();
    }
});

canvas.addEventListener( "click", ( e ) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    for ( let i = 0; i < 30; i++ ) {
        splatters.push({
            x: mouseX,
            y: mouseY,
            size: Math.random() * 5 + 2,
            speedX: ( Math.random() - 0.5 ) * 10,
            speedY: ( Math.random() - 0.5 ) * 10,
            alpha: 1.0,
        });
    }
});

function drawScene() {
  context.fillStyle = sky;
  context.fillRect( 0, 0, canvas.width, canvas.height );

  drawStaticStars();
  drawShootingStars();
  drawMountains();
  drawGround();
  drawTrees();
  drawSnowflakes();
  drawCursorTrail();
  drawSplatters();
}

function animate() {
  drawScene();
  requestAnimationFrame(animate);
}

setInterval(() => {
    wind = Math.sin( Date.now() / 2000 ) * 2;
}, 60);

setInterval( createSnowflake, 75 );
setInterval( createShootingStar, 2000 );

animate();