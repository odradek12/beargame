var game;

var player;
var bunnies;
var paw;
var cursors;

var spd = 220;
var scl = .6;
var rabbitScl = scl-.075;
var maxBunnies = 5;
var swipeAnim;
var pawDistance = 105;
var swiping = false;
var swipableKeyUp = true;
var overlapTriggered = false;

window.onload = function(){
	let config = {
		type: Phaser.AUTO,
		width: 800,
		height: 600,
		physics: {
			default: 'arcade',
			arcade: {
				// gravity: { y: 300 },
				debug: true
			}
		},
		scene: playGame
	}
	game = new Phaser.Game(config);
	window.focus();
}

class playGame extends Phaser.Scene{
	constructor(){
		super('PlayGame');
	}

	preload(){
		this.load.image('sky', 'assets/sky.jpg');
		// this.load.spritesheet('bear', 'assets/bear.png', { frameWidth: 283, frameHeight: 403 });
		this.load.atlas('bear', 'assets/bear.png', 'assets/bear.json');
		this.load.spritesheet('rabbit', 'assets/rabbit.png', { frameWidth: 95, frameHeight: 186 });
		// this.load.image('rabbit', 'assets/rabbit.png');
	}

	create(){
		console.log(this);

		this.cameras.main.setBounds(0, 0, game.config.width * 1.5, game.config.height);
		this.physics.world.setBounds(0, 0, game.config.width * 1.5, game.config.height);

		let sky = this.add.image(400, 300, 'sky');
		sky.scaleX = 2;

		player = this.physics.add.sprite(200, game.config.height, 'bear');
		player.setSize(200, 380, true);
		player.setScale(scl);
		player.setCollideWorldBounds(true);

        paw = this.physics.add.sprite(300, 525, null);
        paw.visible = false;
        paw.setSize(60, 60, true);

		bunnies = this.physics.add.group({
			key: 'rabbit',
			repeat: maxBunnies,
			setXY: { x: 12, y: game.config.height-1, stepX: 180 }
		});

		this.physics.add.overlap(bunnies, paw, this.swipeBunny, null, this);

		for (let i=0; i <= maxBunnies; i++){
			// console.log(bunnies.children.entries[i]);
			let b = bunnies.children.entries[i];
			b.setCollideWorldBounds(true);
			b.setScale(rabbitScl);
			this.bunMove(b);
		}

		this.cameras.main.startFollow(player);

		this.anims.create({
			key: 'walking',
			frames: this.anims.generateFrameNames('bear', {
		        prefix: 'bear_fin3',
		        start: 1,
		        end: 4,
		        zeroPad: 4
		    }),
			frameRate:8,
			repeat: -1
		});
		swipeAnim = this.anims.create({
			key: 'swipe',
			frames: this.anims.generateFrameNames('bear', {
		        prefix: 'bear_fin3',
		        start: 5,
		        end: 7,
		        zeroPad: 4
		    }),
			frameRate:8
		});
		this.anims.create({
			key: 'inert',
			frames: [ { key: 'bear', frame: 0 }],
			frameRate:10
		});
		this.anims.create({
			key: 'rabbit-inert',
			frames: [ { key: 'rabbit', frame: 0 }],
			frameRate:10
		});
		this.anims.create({
			key: 'rabbit-hop',
			frames: this.anims.generateFrameNumbers('rabbit', { start: 2, end: 5 }),
			frameRate:10,
			repeat: -1
		});
		player.on('animationcomplete', this.swipingComplete, this);

		this.input.keyboard.on('keydown_D', function (event) {
			// console.log(swipeAnim.isPlaying);
			
			if(!swiping && swipableKeyUp){
				overlapTriggered = false;
				swiping = true;
				player.setVelocityX(0);
		        player.anims.play('swipe', true);
		    }
		    swipableKeyUp = false;
	    });

	    this.input.keyboard.on('keyup_D', function (event) {
	    	// setTimeout(function(){
				swipableKeyUp = true;
			// }, 3000);
	    });

		cursors = this.input.keyboard.createCursorKeys();
	}

	update(){
		if(!swiping){
			if (cursors.right.isDown){
				// player.scaleX = scl;
				//may need to remove setFlipX since it may be only cosmetic and not change the hitbox when you turn around
				pawDistance = 105;
				player.setFlipX(false);
				player.setVelocityX(spd);

				player.anims.play('walking', true);
			}
			else if (cursors.left.isDown){
				// player.scaleX = -scl;
				pawDistance = -105;
				player.setFlipX(true);
				player.setVelocityX(-spd);

				player.anims.play('walking', true);
			}
			else {
				player.setVelocityX(0);
				player.anims.play('inert', true);
			}
		}
		paw.x = player.x + pawDistance;
	}

	bunMove(b){
		let bpostition;
		if(b.x <= 50){
			bpostition = Phaser.Math.Between(50, 150);
		} else if(b.x >= this.physics.world.bounds.width-50){
			bpostition = Phaser.Math.Between(b.x-150, b.x-50);
		} else {
			bpostition = Phaser.Math.Between(b.x-100, b.x+100);
		}
		
		let bdelay = Phaser.Math.Between(2000, 6000);

	    let tween = this.tweens.add({
	        targets: b,
	        delay: bdelay,
	        x: bpostition,
	        ease: 'Linear',
	        duration: 1000,
	        onActive: function(){
        		if (bpostition > b.x) {
					// b.scaleX = -rabbitScl;
					b.setFlipX(true);
				} else {
					// b.scaleX = rabbitScl;
					b.setFlipX(false);
				}

	        	b.play('rabbit-hop'); },
	        onCompleteScope: this,
	        onComplete: function(){
				b.play('rabbit-inert');
				this.bunMove(b);
	        },
	        // onStart: function () { console.log('onStart'); console.log(arguments); },
	        // onComplete: function () { console.log('onComplete'); console.log(arguments); },
	        // onYoyo: function () { console.log('onYoyo'); console.log(arguments); },
	        // onRepeat: function () { console.log('onRepeat'); console.log(arguments); },
	    });
	}

	swipingComplete(animation, frame){
		if(animation.key === "swipe"){
			swiping = false;
		}
		player.anims.play('inert', true);
	}

	swipeBunny(bear, bunny){
		if(player.anims.getCurrentKey() === "swipe" && player.anims.currentFrame.index == 2 && !overlapTriggered){
			console.log("bunny's x is " + bunny.x);
			bunny.disableBody(true, true);
			overlapTriggered = true;
		}
	}
}