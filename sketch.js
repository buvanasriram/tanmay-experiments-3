const Engine = Matter.Engine;
const World= Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;

var engine, world;
var box1, zombie1,zombie3;
var backgroundImg,platform;
var boy, slingshot;

var gameState = "onSling";
var gameState2= "play"
var bg = "sprites/bg1.png";
var score = 0;
var database;
var form;
var stone2Moving  = false;

var numHits2 = 0;

var shield = null;
var flagBox1=0;
var flagBox2=0;
var flagSlingL=0;
var flagSlingR=0;
var collision1, collision2, collision3, collision4, collision5, collision6;

var flagBoy = 0;
var maxId=0;

var numShields = 10; 
var hitsOnShield = 0;
var maxHitsOnShield = 3;

function preload() {
    backgroundImg=loadImage(bg)
    sling1Img = loadImage("sprites/sling1.png");
    sling2Img = loadImage("sprites/sling2.png");
    sling3Img = loadImage("sprites/sling3.png");
}


function setup(){
    var canvas = createCanvas(displayWidth,displayHeight-100);
    engine = Engine.create();
    world = engine.world;


    ground = new Ground(width/2,height,width,20); // changed values to width ref

    // objects on the left side
    platform = new Ground(200, 455, 350, 270);
    boy = new Boy(130,250, 80,150);
    stone = new Stone(200,200);
    slingshot = new SlingShot(stone.body,{x:200, y:200});
    leftSling1= new Catapult(270,250,50,150, "sprites/sling1.png")
    leftSling2= new Catapult(240,220,50,80, "sprites/sling2.png")


    // create objects on the right side
    box1 = new Box(900,50,250,100);
    box2 = new Box(900,160,250,100);
    
    zombie1 = new Zombie(580,height-200, 100,200); 
    stone2 = new Stone(900,10);
    //changed the values
    rightSling1= new Catapult(330,40,30,130, "sprites/sling1.png")
    rightSling2= new Catapult(300,40,30,75, "sprites/sling2.png")
    
    score = 0;
    Matter.Events.on(engine, 'collisionStart', collision);
  
    database=firebase.database();

    playersRef = database.ref("players");
    playersRef.once("value",(data) => { maxId = data.numChildren() +1; })
    form=new Form();

}

function draw(){
    background(backgroundImg);
    Engine.update(engine);
    textSize(20);
    fill("white");


    if (gameState2==="start"){
        form.display();
    }
    else if(gameState2==="play"){
        form.hide();
        text("Score: "+ score, 50, 50)
        text("Hits On shield: " + hitsOnShield, 500,50);
        text("Max Hits allowed: "+ maxHitsOnShield, 500,70)
        text("Numhits event based: "+ numHits2, 500,90)
        //  text(mouseX+","+mouseY,mouseX,mouseY)
        noStroke();
        //  textSize(35)
        //  fill("white")
        // text("Score  " + score, width-300, 50)
        
        ground.display();

        // left side objects display
        platform.display();
        boy.display();
        stone.display();
        slingshot.display(); 
        leftSling1.display(); //added
        leftSling2.display(); //added
        if (shield) shield.display();

        // right side objects display
        box1.display();
        box2.display();
        
        Matter.Body.setPosition(zombie1.body, {x:box1.body.position.x+70, y:box1.body.position.y-145});
        Matter.Body.setPosition(rightSling1.body, {x:box1.body.position.x-50,y:box1.body.position.y-115 })
        Matter.Body.setPosition(rightSling2.body, {x:box1.body.position.x-70,y:box1.body.position.y-145})

        zombie1.display();
        rightSling1.display(); //added
        rightSling2.display(); //added
        stone2.display();

        // stone2 hits boy
        collision1 = Matter.SAT.collides(stone2.body, boy.body);
        if (collision1.collided) flagBoy = 1;
        if (flagBoy === 1) {
            Matter.Body.setStatic(boy.body, false);
            gameState2 = "end";

        }
        // stone2 hits leftsling1 or 2
        collision2 = Matter.SAT.collides(stone2.body, leftSling1.body);
        if (collision2.collided) flagSlingL = 1;
        collision3 = Matter.SAT.collides(stone2.body, leftSling2.body);
        if (collision3.collided) flagSlingL = 1;
        if (flagSlingL === 1) {
            Matter.Body.setStatic(leftSling1.body, false);
            Matter.Body.setStatic(leftSling2.body, false);
            Matter.Body.setStatic(boy.body, false);
            gameState2 = "end"
        }

        // stone2 hits shield
        if (shield) {
            collision6 = Matter.SAT.collides(stone2.body, shield.body);
            if (collision6.collided) {
                hitsOnShield++; 
            }
            if (hitsOnShield > maxHitsOnShield) {
                World.remove(world, shield);
                shield = null;
            }
        }

        // stone hits rightsling
        collision4 = Matter.SAT.collides(stone.body, rightSling1.body);
        if (collision4.collided) flagSlingR = 1;
        collision5 = Matter.SAT.collides(stone.body, rightSling2.body);
        if (collision5.collided) flagSlingR = 1;

        if (flagSlingR === 1) {
            Matter.Body.setStatic(rightSling1.body, false);
            Matter.Body.setStatic(rightSling2.body, false);
            score = score + 50;
            flagSlingR = 0;
        } 
        // stone hits box1 and box2
        collision6 = Matter.SAT.collides(stone.body, box1.body);
        if (collision4.collided) flagBox1 = 1;
        if (flagBox1) {
            score += 10;
            flagBox1 = 0;
        }
        collision7 = Matter.SAT.collides(stone.body, box2.body);
        if (collision4.collided) flagBox2 = 1;
        if (flagBox2) {
            score += 10;
            flagBox2 = 0;
        }

        if (frameCount%100 === 0 && stone2.body.speed < 1) stone2Moving = false;

        if (stone2Moving === false && flagSlingR === 0) {
            push();
            strokeWeight(3);
            var pointA = stone2.body.position;
            var pointB = {x: pointA.x-50, y:pointA.y - 50};
            stroke(48,22,8)
            line(pointA.x, pointA.y, rightSling2.body.position.x, rightSling2.body.position.y-30);
            line(pointA.x, pointA.y, rightSling1.body.position.x, rightSling1.body.position.y-50);
            pop();
        } 
        if (frameCount%200 === 0 && zombie1.body.speed < 1) {
            stone2Moving  = true;
            Matter.Body.setPosition(stone2.body, {x:zombie1.body.position.x-30, y:zombie1.body.position.y-50})
            Matter.Body.applyForce(stone2.body, {x:stone2.body.position.x, y:stone2.body.position.y}, {x:-130, y:-150});
        }
        
        if (hitsOnShield > maxHitsOnShield) {
            World.remove(world, shield.body);
            shield = null;
        }
    }
    else if (gameState2 === 'end') {
        text("game over", width/2, height/2)
    
        ground.display();

        // left side objects display
        platform.display();
        boy.display();
        stone.display();
        slingshot.display(); 
        leftSling1.display(); //added
        leftSling2.display(); //added
        if (shield) shield.display();

        // right side objects display
        box1.display();
        box2.display();
        
        Matter.Body.setPosition(zombie1.body, {x:box1.body.position.x+70, y:box1.body.position.y-145});
        Matter.Body.setPosition(rightSling1.body, {x:box1.body.position.x-50,y:box1.body.position.y-115 })
        Matter.Body.setPosition(rightSling2.body, {x:box1.body.position.x-70,y:box1.body.position.y-145})

        zombie1.display();
        rightSling1.display(); //added
        rightSling2.display(); //added
        stone2.display();
    }
}
   


function mouseDragged(){
    if (gameState!=="launched"){
        Matter.Body.setPosition(stone.body, {x: mouseX , y: mouseY});
    }
}


function mouseReleased(){
    slingshot.fly();
    gameState = "launched"
}
function keyPressed (){
    //added all the code here
    if (keyCode === 32 && gameState2 === "play") {
        gameState = "onSling";
        Matter.Body.setPosition(stone.body, {x:200,y:200})
        slingshot.attach(stone.body);
    }
    if (keyCode === 83 && gameState2 === "play" ) {//'s'
       // console.log(shield)
        if (shield === null && numShields > 0) 
        {
            shield = new Shield(300,250);
            numShields--;
            hitsOnShield = 0;
            
        }
        
    }
}
function collision(event) {
    var pairs = event.pairs;
    for (var i= 0; i < pairs.length; i++) {
      var labelA = pairs[i].bodyA.label;
      var labelB = pairs[i].bodyB.label;
      if ((labelA === 'stone' && labelB === 'shield') ||
      (labelA === 'shield' && labelB === 'stone') ) {
        numHits2++;
      }
    }
}

