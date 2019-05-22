import player from './assets/img/player.png';
import bg from './assets/img/bg.png';
import coin from './assets/img/coin.png';
import police from './assets/img/police.png';
import person from './assets/img/person.png'

import * as PIXI from 'pixi.js';
import * as Intersects from 'yy-intersects';

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
  }
  loadSprites () {
    //Add stuff to loader
    this.app.loader
      .add('player', player)
      .add('bg', bg)
      .add('coin', coin)
      .add('police', police)
      .add('person', person);

    //Load things
    this.app.loader.load((loader, resources) => {
      this.sprites.player = new PIXI.Sprite(resources.player.texture);
      this.sprites.bg = new PIXI.TilingSprite(resources.bg.texture);
      this.textures.coin = resources.coin.texture;
      this.textures.police = resources.police.texture;
      this.textures.person = resources.person.texture;
      this.setupSprites();
    });
  }
  setupSprites () {
      //bg
      this.sprites.bg.zIndex = -1;
      this.app.stage.addChild(this.sprites.bg);
      this.sprites.bg.width = 640;
      this.sprites.bg.height = 480;

      //player
      this.sprites.player.zIndex = 1;
      this.app.stage.addChild(this.sprites.player);
      this.sprites.player.height = 100;
      this.sprites.player.width = 100;
      this.sprites.player.anchor.set(0);
      this.sprites.player.y = this.height / 2 - this.sprites.player.height/2;
      this.sprites.player.x = this.width / 2 - this.sprites.player.width/2;

      //container for moving objects
      let movingObjects = new PIXI.Container();
      movingObjects.zIndex = 0;
      this.app.stage.addChild(movingObjects);

      this.tick = 0;
      var bgspeed = 1;
      var speed = 2.5;
      this.app.ticker.add(()=>{
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

          this.stats.voterPercent-=.002;
          //police event
          if (Math.random() < this.stats.suspicion*.6){
            let sprite = new PIXI.Sprite(this.textures.police);
            sprite.name = "police";
            sprite.x = 640;
            sprite.y = 10 + Math.floor(Math.random()*(460-sprite.height));
            movingObjects.addChild(sprite);
          }
          //coin event
          else if (Math.random() < this.stats.voterPercent*1.5){
            let sprite = new PIXI.Sprite(this.textures.coin);
            sprite.name = "coin";
            sprite.x = 640;
            sprite.y = 10 + Math.floor(Math.random()*(460-sprite.height));
            movingObjects.addChild(sprite);
          }
          //person event
          else if (Math.random() < .4){
            let sprite = new PIXI.Sprite(this.textures.person);
            sprite.name = "person";
            sprite.x = 640;
            sprite.y = 10 + Math.floor(Math.random()*(460-sprite.height));
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
          && this.sprites.player.y > 0)
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
  setupInput () {
    window.addEventListener('keydown', (e)=>{
      if(e.repeat) return; //Reject repeated input

      //Add input listeners
      if(e.key === 'ArrowUp' || e.key === 'w')
        this.input.up = true;
      if(e.key === 'ArrowDown' || e.key === 's')
        this.input.down = true;
      if(e.key === 'ArrowLeft' || e.key === 'a')
        this.input.left = true;
      if(e.key === 'ArrowRight' || e.key === 'd')
        this.input.right = true;
    });
    window.addEventListener('keyup', (e)=>{
      //Add input listeners
      if(e.key === 'ArrowUp' || e.key === 'w')
        this.input.up = false;
      if(e.key === 'ArrowDown' || e.key === 's')
        this.input.down = false;
      if(e.key === 'ArrowLeft' || e.key === 'a')
        this.input.left = false;
      if(e.key === 'ArrowRight' || e.key === 'd')
        this.input.right = false;
    });
  }
  runGame () {
    this.loadSprites();
    this.setupInput();

    //Start the ticker
    this.app.start();
  }
}

export default Game;
