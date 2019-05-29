import person from './assets/img/person.png';
import bg from './assets/img/bg.png';
import coin from './assets/img/coin.png';
import police from './assets/img/police.png';
import walk1 from './assets/img/walk1.png'
import walk2 from './assets/img/walk2.png'
import walk3 from './assets/img/walk3.png'
import walk4 from './assets/img/walk4.png'

import * as PIXI from 'pixi.js';
import * as Intersects from 'yy-intersects';

import * as Input from './input.js';

class Game {
  constructor (canvas,w,h) {
    this.app = new PIXI.Application({
      width: 640,
      height: 480,
      view: canvas
    });
    this.width = w;
    this.height = h;
    this.sprites = {};
    this.textures = {};
    this.stats = {
      cash: 50,
      voterPercent: .2,
      suspicion: .2
    };
    this.input = {
      up: false,
      down: false,
      left: false,
      right: false
    };
    this.setupInput = Input.setupInput.bind(this);
  }
  loadSprites () {
    //Add stuff to loader
    this.app.loader
      .add('person', person)
      .add('bg', bg)
      .add('coin', coin)
      .add('police', police)
      .add('walk1', walk1)
      .add('walk2', walk2)
      .add('walk3', walk3)
      .add('walk4', walk4);

    //Load things
    this.app.loader.load((loader, resources) => {
      var walk = [
        resources.walk1.texture,
        resources.walk2.texture,
        resources.walk3.texture,
        resources.walk4.texture
      ];
      this.sprites.player = new PIXI.AnimatedSprite(walk);
      this.sprites.bg = new PIXI.TilingSprite(resources.bg.texture);
      this.textures.coin = resources.coin.texture;
      this.textures.police = resources.police.texture;
      this.textures.person = resources.person.texture;
      this.setupSprites();
    });
  }
  setupSprites () {
    let statsHeight = 70;
    this.height = 480-statsHeight;
    //bg
    this.sprites.bg.zIndex = -1;
    this.app.stage.addChild(this.sprites.bg);
    this.sprites.bg.width = 640;
    this.sprites.bg.y = statsHeight
    this.sprites.bg.height = 480-statsHeight;

    //player
    this.sprites.player.zIndex = 1;
    this.app.stage.addChild(this.sprites.player);
    this.sprites.player.animationSpeed = .2;
    this.sprites.player.height = 100;
    this.sprites.player.width = 100;
    this.sprites.player.anchor.set(0);
    this.sprites.player.y = this.height / 2 - this.sprites.player.height/2;
    this.sprites.player.x = this.width / 2 - this.sprites.player.width/2;

    //graphics
    let graphics = new PIXI.Graphics();
    graphics.zIndex = 5;
    this.app.stage.addChild(graphics);
    graphics.beginFill(0xfff207,1);
    graphics.drawRect(0,0,640,statsHeight);

    //container for moving objects
    let movingObjects = new PIXI.Container();
    movingObjects.zIndex = 0;
    this.app.stage.addChild(movingObjects);

    //stats text
    let percentText =
      new PIXI.Text(
        'Voter percentage: ' +
        Math.floor(this.stats.voterPercent*100)+"%",
        {
          fontFamily : 'Arial',
          fontSize: 20,
          fill : 0
        });
    percentText.y = 5;
    percentText.x = 5;
    let suspicionText =
      new PIXI.Text(
        'Suspicion: ' +
        Math.floor(this.stats.suspicion*100)+"%",
        {
          fontFamily : 'Arial',
          fontSize: 20,
          fill : 0
        });
    suspicionText.y = 30;
    suspicionText.x = 5;
    let cashText =
      new PIXI.Text(
        "Cash: $" +
        Math.floor(this.stats.cash),
        {
          fontFamily : 'Arial',
          fontSize: 20,
          fill : 0
        });
    cashText.anchor.set(1,0);
    cashText.y = 5;
    cashText.x = this.width - 5;
    graphics.addChild(percentText, suspicionText, cashText);

    this.tick = 0;
    var bgspeed = 1;
    var speed = 2.5;
    this.app.ticker.add(()=>{
      //update text
      percentText.text =
        'Voter percentage: ' + Math.floor(this.stats.voterPercent*100)+"%";
      suspicionText.text =
        'Suspicion: ' + Math.floor(this.stats.suspicion*100)+"%";
      cashText.text =
        'Cash: $' + Math.floor(this.stats.cash);

      //move background
      this.sprites.bg.tilePosition.x-=bgspeed

      //check for lose
      if(this.stats.suspicion >= 1)
        this.app.stop();
      if(this.stats.cash <= 0)
        this.app.stop();

      //random chance events
      if (this.tick % 25 === 0){
        this.tick = 0;

        if(this.stats.suspicion > this.stats.voterPercent)
          this.stats.suspicion-=.005;
        else this.stats.suspicion = this.stats.voterPercent;
        this.stats.cash-=this.stats.voterPercent*3;

        this.stats.voterPercent-=.001;

        var spriteY = (height)=>{
          return 10+statsHeight + Math.floor(Math.random()*(this.height-height-20));
        };
        //police event
        if (Math.random() < this.stats.suspicion*.6){
          let sprite = new PIXI.Sprite(this.textures.police);
          sprite.name = "police";
          sprite.x = 640;
          sprite.y = spriteY(sprite.height);
          movingObjects.addChild(sprite);
        }
        //coin event
        else if (Math.random() < this.stats.voterPercent*1.5){
          let sprite = new PIXI.Sprite(this.textures.coin);
          sprite.name = "coin";
          sprite.x = 640;
          sprite.y = spriteY(sprite.height);
          movingObjects.addChild(sprite);
        }
        //person event
        else if (Math.random() < .4){
          let sprite = new PIXI.Sprite(this.textures.person);
          sprite.name = "person";
          sprite.x = 640;
          sprite.y = spriteY(sprite.height);
          movingObjects.addChild(sprite);
        }
      }
      this.tick++;

      //move children and check for out of bounds
      for (let sprite of movingObjects.children){
        sprite.x-=(bgspeed+2);
        if (sprite.x < -1*sprite.width)
          movingObjects.removeChild(sprite);
      }

      //move player with background
      if (this.sprites.player.x > 0)
        this.sprites.player.x-=bgspeed

      //player input -> movement
      if (this.input.up
        && this.sprites.player.y > statsHeight)
        this.sprites.player.y-=speed;
      if (this.input.down
        && this.sprites.player.y < 480 - this.sprites.player.height)
        this.sprites.player.y+=speed;
      if(this.input.left
        && this.sprites.player.x > 0)
        this.sprites.player.x-=speed;
      if(this.input.right
        && this.sprites.player.x < 640 - this.sprites.player.width)
        this.sprites.player.x+=(bgspeed + speed);

      //intersection
      let player = this.sprites.player;
      let playershape = new Intersects.Rectangle(player);
      for (let sprite of movingObjects.children){
        let spriteshape = new Intersects.Rectangle(sprite);
        if (playershape.collidesRectangle(spriteshape)){
          if (sprite.name === "coin"){
            this.stats.cash+=10;
            console.log("money: "+this.stats.cash);
            movingObjects.removeChild(sprite);
          }
          if (sprite.name === "person"){
            this.stats.voterPercent+=.02;
            console.log("voterPercent: "+this.stats.voterPercent);
            movingObjects.removeChild(sprite);
          }
          if (sprite.name === "police"){
            this.stats.suspicion+=.2;
            this.stats.voterPercent-=.05;
            console.log("suspicion: "+this.stats.suspicion);
            sprite.name = "suspiciouspolice";
          }
        }
      }
    });

    //sort by zIndex
    this.app.stage.sortChildren();
  }
  runGame () {
    this.loadSprites();
    this.setupInput();

    //Start the ticker
    this.app.start();
  }
}

export default Game;
