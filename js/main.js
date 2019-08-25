// =============================================================================
// sprites
// =============================================================================

//
// hero sprite
//
var delay = ( function() {
    var timer = 0;
    return function(callback, ms) {
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
    };
})();


    

              

  
function Hero(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'hero');
    this.anchor.set(0.5, 0.5);

    // physic properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
}

// inherit from Phaser.Sprite
Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;

Hero.prototype.move = function (direction) {
    const SPEED = 200;
    this.body.velocity.x = direction * SPEED;
};


Hero.prototype.jump = function () {
    const JUMP_SPEED = 600;
    let canJump = this.body.touching.down;

    if (canJump) {
        this.body.velocity.y = -JUMP_SPEED;
    }

    return canJump;
};

Hero.prototype.bounce = function () {
    const BOUNCE_SPEED = 200;
    this.body.velocity.y = -BOUNCE_SPEED;
};

//
// Spider (enemy)
//
function Spider(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'spider');

    // anchor
    this.anchor.set(0.5);
    // animation
    this.animations.add('crawl', [0, 1, 2], 8, true); // 8fps, looped
    this.animations.add('die', [0, 4, 0, 4, 0, 4, 3, 3, 3, 3, 3, 3], 12);
    this.animations.play('crawl');

    // physic properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    this.body.velocity.x = Spider.SPEED;
}

Spider.SPEED = 100;

// inherit from Phaser.Sprite
Spider.prototype = Object.create(Phaser.Sprite.prototype);
Spider.prototype.constructor = Spider;

Spider.prototype.update = function () {
    // check against walls and reverse direction if necessary
    if (this.body.touching.right || this.body.blocked.right) {
        this.body.velocity.x = -Spider.SPEED; // turn left
    }
    else if (this.body.touching.left || this.body.blocked.left) {
        this.body.velocity.x = Spider.SPEED; // turn right
    }
};

Spider.prototype.die = function () {
    this.body.enable = false;

    this.animations.play('die').onComplete.addOnce(function () {
        this.kill();
    }, this);
};


// =============================================================================
// game states
// =============================================================================

PlayState = {};
const LEVEL_COUNT =4;

PlayState.init = function (data) {
    this.game.renderer.renderSession.roundPixels = true;

        this.hasKey = false;

    
    
    this.keys = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        up: Phaser.KeyCode.UP
    });

    this.keys.up.onDown.add(function () {
        let didJump = this.hero.jump();
        if (didJump) {
            this.sfx.jump.play();
        }
    }, this);

    this.coinPickupCount = 80;
    this.level = (data.level || 0) % LEVEL_COUNT;
};

PlayState.preload = function () {
     this.game.load.json('level:0', 'data/level00.json');
    this.game.load.json('level:1', 'data/level01.json');
    this.game.load.json('level:2', 'data/level02.json');


    this.game.load.image('font:numbers', 'images/numbers.png');

    this.game.load.image('background', 'images/background.png');
    this.game.load.image('ground', 'images/ground.png');
    this.game.load.image('grass:8x1', 'images/grass_8x1.png');
    this.game.load.image('grass:6x1', 'images/grass_6x1.png');
    this.game.load.image('grass:4x1', 'images/grass_4x1.png');
    this.game.load.image('grass:2x1', 'images/grass_2x1.png');
    this.game.load.image('grass:1x1', 'images/grass_1x1.png');
    this.game.load.image('hero', 'images/hero_stopped.png');
    this.game.load.image('invisible-wall', 'images/invisible_wall.png');
    this.game.load.image('icon:coin', 'images/blood.png');
    this.game.load.image('key', 'images/key.png');
    this.game.load.audio('sfx:key', 'audio/key.wav');
    this.game.load.audio('sfx:door', 'audio/door.wav');

	
   this.game.load.spritesheet('fasolada', 'images/fasolada0.jpg', 250, 250);
    this.game.load.spritesheet('spaghetti', 'images/spaghetti0.png', 250, 250);
   this.game.load.spritesheet('lentil', 'images/lentil0.jpg', 250, 250);



    this.game.load.spritesheet('bread', 'images/bread.png', 150, 150);
	this.game.load.spritesheet('rice', 'images/rice.png', 150, 150);
	this.game.load.spritesheet('meat', 'images/meat.png', 150, 150);
    this.game.load.spritesheet('coin', 'images/insulin.png', 32, 32);
    this.game.load.spritesheet('spider', 'images/lol.png', 32, 32);
    this.game.load.spritesheet('low', 'images/lowSugar.png', 200, 200);
   this.game.load.spritesheet('high', 'images/highSugar.png', 200, 200);
   this.game.load.spritesheet('range', 'images/range.png', 200, 200);
   this.game.load.spritesheet('door', 'images/door.png', 42, 66);
    this.game.load.audio('sfx:jump', 'audio/jump.wav');
    this.game.load.audio('sfx:coin', 'audio/coin.wav');
    this.game.load.audio('sfx:stomp', 'audio/stomp.wav');
    
    
};

PlayState.create = function () {
    // create sound entities
    this.sfx = {
        jump: this.game.add.audio('sfx:jump'),
        coin: this.game.add.audio('sfx:coin'),
        stomp: this.game.add.audio('sfx:stomp'),
        key: this.game.add.audio('sfx:key'),
        door: this.game.add.audio('sfx:door')
		

    };

    // create level
    this.game.add.image(0, 0, 'background');
    //this._loadLevel(this.game.cache.getJSON('level:1'));
 this._loadLevel(this.game.cache.getJSON(`level:${this.level}`));
    // crete hud with scoreboards)
    this._createHud();
};


PlayState.update = function () {
  
 
this.coinFont2.text = `${this.coinPickupCount}`;

this.coinFont.text = `${this.coinPickupCount}`;
        
this._handleCollisions();
    this._handleInput();    
//let i=0;
  //do {

    // Increment variable by 1
     
     
    if((this.coinPickupCount>=70)||(this.coinPickupCount<=180))
        {
            
            this.high.visible=false;
            this.low.visible=false; 
           // this.high.visible=false;
      //  this.meat.visible=false;
                      
            
    }
    
  
      if(this.coinPickupCount<80)
     {
          
        
          this.low.visible=true;
         
          this.low.visible=true;
          //this.meat.visible=false;
          this.high.visible=false;
         
     }
    
   
   if((this.coinPickupCount==0)||(this.coinPickupCount<0))
        {
    this.high.visible=false;
 this.high.visible=false;
            this.low.visible=false; 
           this.sfx.stomp.play();
        this.game.state.restart();  
        }    
      
  
     
    
     
    else if((this.coinPickupCount>=80) &&(this.coinPickupCount<=180))
    {
         if( this.hasKey== false)
        {
       this.key.visible=true;
        }
            this.low.visible=false;
          this.high.visible=false;
        
}

     
      
      
    //this.high.visible=false;
      //this.low.visible=false;
  
     if(this.coinPickupCount>180)
     {
         if( this.hasKey== false)
             {
        this.key.visible=false;
             }
         this.high.visible=true;
         this.low.visible=false;
     } 


    
    
   
// i++;
  //  } while (i> 3);

            

  
        
};

PlayState._handleCollisions = function () {
    
    this.game.physics.arcade.collide(this.spiders, this.platforms);
    this.game.physics.arcade.collide(this.spiders, this.enemyWalls);
    this.game.physics.arcade.collide(this.hero, this.platforms);
    
    
    this.game.physics.arcade.overlap(this.hero, this.key, this._onHeroVsKey,
        null, this);

    this.game.physics.arcade.overlap(this.hero, this.coins, this._onHeroVsCoin,
        null, this);
		
	this.game.physics.arcade.overlap(this.hero, this.bread, this._onHeroVsBread,
        null, this);
    
    
    
    this.game.physics.arcade.overlap(this.hero, this.spaghetti, this._onHeroVsSpaghetti,
        null, this);
    
    this.game.physics.arcade.overlap(this.hero, this.lentil, this._onHeroVsLentil,
        null, this);
     this.game.physics.arcade.overlap(this.hero, this.fasolada, this._onHeroVsFasolada,
        null, this);
    
    
    

	this.game.physics.arcade.overlap(this.hero, this.rice, this._onHeroVsRice,
        null, this);
	this.game.physics.arcade.overlap(this.hero, this.meat, this._onHeroVsMeat,
        null, this);
    this.game.physics.arcade.overlap(this.hero, this.low, this._onHeroVsLow,
        null, this);
     this.game.physics.arcade.overlap(this.hero, this.high, this._onHeroVsHigh,
        null, this);
    this.game.physics.arcade.overlap(this.hero, this.range, this._onHeroVsRange,
        null, this);
		
	 this.game.physics.arcade.overlap(this.hero, this.door, this._onHeroVsDoor,
        // ignore if there is no key or the player is on air
        function (hero, door) {
            return this.hasKey && hero.body.touching.down;
        }, this);
	
    this.game.physics.arcade.overlap(this.hero, this.spiders,
        this._onHeroVsEnemy, null, this);
};

PlayState._handleInput = function () {
    if (this.keys.left.isDown) { // move hero left
        this.hero.move(-1);
    }
    else if (this.keys.right.isDown) { // move hero right
        this.hero.move(1);
    }
    else { // stop
        this.hero.move(0);
    }
};

PlayState._loadLevel = function (data) {
    // create all the groups/layers that we need
    this.bgDecoration = this.game.add.group();
    this.platforms = this.game.add.group();
    this.coins = this.game.add.group();
	this.bread = this.game.add.group();
  

    this.fasolada = this.game.add.group();
    this.lentil=this.game.add.group();
    this.spaghetti=this.game.add.group();

    
    
	this.rice = this.game.add.group();
	this.meat = this.game.add.group();
    this.low=this.game.add.group();
    this.high=this.game.add.group();
    this.range=this.game.add.group();
    this.spiders = this.game.add.group();
    this.enemyWalls = this.game.add.group();
    this.enemyWalls.visible = false;
    this.low.visible=false;
    this.high.visible=false;

    // spawn all platforms
    data.platforms.forEach(this._spawnPlatform, this);
    // spawn hero and enemies
    this._spawnCharacters({hero: data.hero, spiders: data.spiders});
    
      this._spawnKey(data.key.x, data.key.y);
    
    // spawn important objects
    data.coins.forEach(this._spawnCoin, this);
    data.bread.forEach(this._spawnBread, this);
   
    data.lentil.forEach(this._spawnLentil, this);
    data.fasolada.forEach(this._spawnFasolada, this);
    data.spaghetti.forEach(this._spawnSpaghetti, this);



    
	data.rice.forEach(this._spawnRice, this);
	data.meat.forEach(this._spawnMeat, this);
    data.low.forEach(this._spawnLow, this);
   data.high.forEach(this._spawnHigh, this);
     data.range.forEach(this._spawnRange, this);
  this._spawnDoor(data.door.x, data.door.y);

    
    
    // enable gravity
    const GRAVITY = 1200;
    this.game.physics.arcade.gravity.y = GRAVITY;
};

PlayState._spawnPlatform = function (platform) {
    let sprite = this.platforms.create(
        platform.x, platform.y, platform.image);

    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
    sprite.body.immovable = true;

    this._spawnEnemyWall(platform.x, platform.y, 'left');
    this._spawnEnemyWall(platform.x + sprite.width, platform.y, 'right');
         //this._spawnDoor(data.door.x, data.door.y);

};

PlayState._spawnEnemyWall = function (x, y, side) {
    let sprite = this.enemyWalls.create(x, y, 'invisible-wall');
    // anchor and y displacement
    sprite.anchor.set(side === 'left' ? 1 : 0, 1);
    // physic properties
    this.game.physics.enable(sprite);
    sprite.body.immovable = true;
    sprite.body.allowGravity = false;
};

PlayState._spawnCharacters = function (data) {
    // spawn spiders
    data.spiders.forEach(function (spider) {
        let sprite = new Spider(this.game, spider.x, spider.y);
        this.spiders.add(sprite);
    }, this);

    // spawn hero
    this.hero = new Hero(this.game, data.hero.x, data.hero.y);
    this.game.add.existing(this.hero);
};


PlayState._spawnKey = function (x, y) {
    this.key = this.bgDecoration.create(x, y, 'key');
    this.key.anchor.set(0.5, 0.5);
    this.game.physics.enable(this.key);
    this.key.body.allowGravity = false;
};


PlayState._spawnCoin = function (coin) {
    let sprite = this.coins.create(coin.x, coin.y, 'coin');
    sprite.anchor.set(0.5, 0.5);

    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;

    sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
    sprite.animations.play('rotate');
};


PlayState._spawnBread = function (bread) {
    let sprite = this.bread.create(bread.x, bread.y, 'bread');
    sprite.anchor.set(0.5, 0.5);

    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;

  //  sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
    //sprite.animations.play('rotate');
};




PlayState._spawnSpaghetti = function (spaghetti) {
    let sprite = this.spaghetti.create(spaghetti.x, spaghetti.y, 'spaghetti');
    sprite.anchor.set(0.5, 0.5);

    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;

  //  sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
    //sprite.animations.play('rotate');
};


PlayState._spawnLentil = function (lentil) {
    let sprite = this.lentil.create(lentil.x, lentil.y, 'lentil');
    sprite.anchor.set(0.5, 0.5);

    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;

  //  sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
    //sprite.animations.play('rotate');
};


PlayState._spawnFasolada = function (fasolada) {
    let sprite = this.fasolada.create(fasolada.x, fasolada.y, 'fasolada');
    sprite.anchor.set(0.5, 0.5);

    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;

  //  sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
    //sprite.animations.play('rotate');
};



PlayState._spawnRice = function (rice) {
    let sprite = this.rice.create(rice.x, rice.y, 'rice');
    sprite.anchor.set(0.5, 0.5);

    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;

  //  sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
    //sprite.animations.play('rotate');
};


PlayState._spawnMeat = function (meat) {
    let sprite = this.meat.create(meat.x, meat.y, 'meat');
    sprite.anchor.set(0.5, 0.5);

    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;

    //sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
    //sprite.animations.play('rotate');
};



PlayState._spawnLow = function (low) {
    let sprite = this.low.create(low.x, low.y, 'low');
    sprite.anchor.set(0.5, 0.5);

    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;

  //  sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
    //sprite.animations.play('rotate');
};



PlayState._spawnHigh = function (high) {
    let sprite = this.high.create(high.x, high.y, 'high');
    sprite.anchor.set(0.5, 0.5);

    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;

  //  sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
    //sprite.animations.play('rotate');
};


PlayState._spawnRange = function (range) {
    let sprite = this.range.create(range.x, range.y, 'range');
    sprite.anchor.set(0.5, 0.5);

    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;

  //  sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
    //sprite.animations.play('rotate');
};


PlayState._onHeroVsCoin = function (hero, coin) {
    this.sfx.coin.play();
    coin.kill();
    this.coinPickupCount= this.coinPickupCount-100;
        
   
   
};

PlayState._onHeroVsBread = function (hero, bread) {
   //this.sfx.bread.play();
    bread.kill();
   
    
    this.coinPickupCount= this.coinPickupCount+100;
  
    
  
    
};


PlayState._onHeroVsFasolada = function (hero, fasolada) {
   //this.sfx.bread.play();
    fasolada.kill();
   
    
    this.coinPickupCount= this.coinPickupCount+40;
  
    
  
    
};



PlayState._onHeroVsLentil = function (hero, lentil) {
   //this.sfx.bread.play();
    lentil.kill();
   
    
    this.coinPickupCount= this.coinPickupCount+40;
  
    
  
    
};

PlayState._onHeroVsSpaghetti = function (hero, spaghetti) {
   //this.sfx.bread.play();
    spaghetti.kill();
   
    
    this.coinPickupCount= this.coinPickupCount+40;
  
    
  
    
};



PlayState._onHeroVsRice = function (hero, rice) {
   // this.sfx.bread.play();
    rice.kill();
    this.coinPickupCount= this.coinPickupCount+40;
    
    
   
};

PlayState._onHeroVsMeat = function (hero, meat) {
   // this.sfx.bread.play();
    meat.kill();
  //  this.low.visible=false;
    this.coinPickupCount= this.coinPickupCount+25;

    
    
};
PlayState._onHeroVsLow = function (hero, low) {
   // this.sfx.bread.play();
    //low.kill();
   // this.coinPickupCount= this.coinPickupCount+10;
};

PlayState._onHeroVsHigh = function (hero, high) {
   // this.sfx.bread.play();
    //high.kill();
   // this.coinPickupCount= this.coinPickupCount+10;
};

PlayState._onHeroVsRange = function (hero, range) {
   // this.sfx.bread.play();
    //high.kill();
   // this.coinPickupCount= this.coinPickupCount+10;
};

PlayState._onHeroVsKey = function (hero, key) {
    this.sfx.key.play();
    key.kill();
    this.hasKey = true;
};
PlayState._spawnDoor = function (x, y) {
    this.door = this.bgDecoration.create(x, y, 'door');
    this.door.anchor.setTo(0.5, 1);
    this.game.physics.enable(this.door);
    this.door.body.allowGravity = false;
};


PlayState._onHeroVsEnemy = function (hero, enemy) {
    if (hero.body.velocity.y > 0) { // kill enemies when hero is falling
        hero.bounce();
        enemy.die();
        this.sfx.stomp.play();
    }
    else { // game over -> restart the game
        this.sfx.stomp.play();
//        this._loadLevel(this.game.cache.getJSON(`level:${this.level}`));
    this.game.state.restart(true, false, { level: this.level});

        // this.level.restart();
       //  this.game.state.restart();
    }
};

PlayState._onHeroVsDoor = function (hero, door) {
    // ...
    // delete the previous call to restart()
    // this.game.state.restart();
    this.game.state.restart(true, false, { level: this.level + 1 });
};




PlayState._createHud = function () {
    const NUMBERS_STR = '0123456789X ';
    this.coinFont = this.game.add.retroFont('font:numbers', 20, 26,
        NUMBERS_STR);

    let coinIcon = this.game.make.image(0, 0, 'icon:coin');
    let coinScoreImg = this.game.make.image(coinIcon.x + coinIcon.width,
        coinIcon.height / 2, this.coinFont);
    coinScoreImg.anchor.set(0, 0.5);

    this.hud = this.game.add.group();
    this.hud.add(coinIcon);
    this.hud.add(coinScoreImg);
    this.hud.position.set(10, 10);

    this.coinFont2 = this.game.add.retroFont('font:numbers', 20, 26,
        NUMBERS_STR)
    /*    
    this.coinFont2 = this.game.add.retroFont('font:numbers', 20, 26,
        NUMBERS_STR);
     let coinIcon2 = this.game.make.image(50, 50, 'icon:coin'); 
    let coinScoreImg2 = this.game.make.image(coinIcon2.x + coinIcon2.width,
        coinIcon2.height / 2, this.coinFont2);
    coinScoreImg.anchor.set(5, 5);
    
    
    this.hud2 = this.game.add.group();
    this.hud2.add(coinIcon2);
    this.hud2.add(coinScoreImg2);
    this.hud2.position.set(90, 90);
  */ 
    
    this.hud2 = this.game.add.group();
    this.hud2.add(coinFont2);
    this.hud2.position.set(90, 90);
    
};

// =============================================================================
// entry point
// =============================================================================
/*
window.onload = function () {
    let game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');
    game.state.add('play', PlayState);
    game.state.start('play');
};
*/
window.onload = function () {
    let game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');
    game.state.add('play', PlayState);
    game.state.start('play', true, false, {level: 0});
};