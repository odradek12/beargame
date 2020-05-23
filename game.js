var game;

var player;
var bunnies;
var cursors;

var spd = 220;
var scl = .6;
var rabbitScl = scl-.075;
var right = true;
var maxBunnies = 5;
var swipeAnim;
var swiping = false;
var d;

window.onload = function(){
	let config = {
		type: Phaser.AUTO,
		width: 800,
		height: 600,
		physics: {
			default: 'arcade',
			arcade: {
				gravity: { y: 300 },
				debug: false
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

		player = this.physics.add.sprite(300, game.config.height, 'bear');
		player.setSize(200, 380, true);
		player.setScale(scl);
		// player.anchor.setTo(0.5, 0.5);
		// player.setOrigin(1, 0.5);

		// player.setBounce(0.2);
		player.setCollideWorldBounds(true);

		bunnies = this.physics.add.group({
			key: 'rabbit',
			repeat: maxBunnies,
			setXY: { x: 12, y: game.config.height, stepX: 200 }
		});

		// bunnies = this.physics.add.sprite(300, 250, 'rabbit');
		// bunnies.setScale(scl);
		for (let i=0; i < maxBunnies; i++){
			// console.log(bunnies.children.entries[i]);
			let b = bunnies.children.entries[i];
			b.setCollideWorldBounds(true);
			b.setScale(rabbitScl);
			this.bunMove(b);
		}

		this.cameras.main.startFollow(player);

		this.anims.create({
			key: 'right',
			frames: this.anims.generateFrameNames('bear', {
		        prefix: 'bear_fin3',
		        start: 2,
		        end: 5,
		        zeroPad: 4
		    }),
			frameRate:8,
			repeat: -1
		});
		this.anims.create({
			key: 'left',
			frames: this.anims.generateFrameNames('bear', {
		        prefix: 'bear_fin3',
		        start: 6,
		        end: 9,
		        zeroPad: 4
		    }),
			frameRate:8,
			repeat: -1
		});
		swipeAnim = this.anims.create({
			key: 'swipe',
			frames: this.anims.generateFrameNames('bear', {
		        prefix: 'bear_fin3',
		        start: 10,
		        end: 12,
		        zeroPad: 4
		    }),
			frameRate:8
		});
		this.anims.create({
			key: 'inert-right',
			frames: [ { key: 'bear', frame: 0 }],
			frameRate:10
		});
		this.anims.create({
			key: 'inert-left',
			frames: [ { key: 'bear', frame: 1 }],
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

		this.input.keyboard.on('keydown_SPACE', function (event) {
			swiping = true;
			player.setVelocityX(0);
	        player.anims.play('swipe', true);
	    });

		cursors = this.input.keyboard.createCursorKeys();
		d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
	}

	update(){
		if(!swiping){
			if (cursors.right.isDown){
				player.setVelocityX(spd);
				right = true;

				player.anims.play('right', true);
			}
			else if (cursors.left.isDown){
				player.setVelocityX(-spd);
				right = false;

				player.anims.play('left', true);
			}
			else {
				player.setVelocityX(0);

				switch(right){
					case true:
						player.anims.play('inert-right', true);
						break;
					case false:
						player.anims.play('inert-left', true);
						break;
				}			
			}
		}
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
					b.scaleX = -rabbitScl;
				} else {
					b.scaleX = rabbitScl;
				}

	        	b.play('rabbit-hop'); },
	        onCompleteScope: this,
	        onComplete: function(){
				b.play('rabbit-inert');
				this.bunMove(b);
	        }
	        // onStart: function () { console.log('onStart'); console.log(arguments); },
	        // onComplete: function () { console.log('onComplete'); console.log(arguments); },
	        // onYoyo: function () { console.log('onYoyo'); console.log(arguments); },
	        // onRepeat: function () { console.log('onRepeat'); console.log(arguments); },
	    });
		// b.x += 150;
	}

	swipingComplete(animation, frame){
		if(animation.key === "swipe"){
				swiping = false;
		}
		player.anims.play('inert-right', true);
	}
}