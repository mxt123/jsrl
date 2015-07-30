//http://gamedevelopment.tutsplus.com/tutorials/how-to-make-your-first-roguelike--gamedev-13677
//also ROT.js

(function () {

// font size
var FONT = 32;

// map dimensions
var ROWS = 5;//10;//10;
var COLS = 5;//10;//15;

// number of actors per level, including player
var ACTORS = 5;//10;

// a list of all actors; 0 is the player
var player;
var actorList;
var livingEnemies;

var actorMap;

// the structure of the map
var map;

// the ascii display, as a 2d array of characters
var asciidisplay;

// initialize phaser, call create() once done
var game = new Phaser.Game(COLS * FONT * 0.6, ROWS * FONT, Phaser.AUTO, null, {
    create: create
});

function randomInt(max) {
   return Math.floor(Math.random() * max);
}

function initActors() {
        // create actors at random locations
        actorList = [];
        actorMap = {};
        for (var e=0; e<ACTORS; e++) {
                // create new actor
                var actor = { x:0, y:0, hp:e <= 0?ACTORS:1 };
                do {
                        // pick a random position that is both a floor and not occupied
                        actor.y=randomInt(ROWS);
                        actor.x=randomInt(COLS);
                } while ( map[actor.y][actor.x] == '#' || actorMap[actor.y + "_" + actor.x] != null );
 
                // add references to the actor to the actors list & map
                actorMap[actor.y + "_" + actor.x]= actor;
                actorList.push(actor);
        }
 
        // the player is the first actor in the list
        player = actorList[0];
        livingEnemies = ACTORS-1;
}

function initMap() {
        // create a new random map
        map = [];
        for (var y = 0; y < ROWS; y++) {
                var newRow = [];
                for (var x = 0; x < COLS; x++) {
                     if (Math.random() > 0.8)
                        newRow.push('#');
                    else
                        newRow.push('.');
                }
                map.push(newRow);
        }
}

function drawMap() {    
       var style = {
        font: FONT + "px monospace",
        fill: "green"
    }; 
    for (var y = 0; y < ROWS; y++)
        for (var x = 0; x < COLS; x++) {    
            asciidisplay[x][y].destroy();
            asciidisplay[x][y] = initCell(map[y][x], x, y,style);
        }
}

function drawActors() {    
   var style = {
        font: FONT + "px monospace",
        fill: "red"
    };    
    for (var a in actorList) {
    	if (actorList[a] != null && actorList[a].hp > 0) {
        	var c = a == 0?''+player.hp:'e';
            x =    actorList[a].x;
            y =    actorList[a].y;       
            asciidisplay[x][y].destroy();              
            asciidisplay[x][y] = initCell(c, x, y,style);
        }
    }
}

function create() {
    // init keyboard commands
    game.input.keyboard.addCallbacks(null, null, onKeyUp);

    // initialize map
    initMap();
    initActors();

  	init();

    drawMap();
    drawActors();
}

function init() {

    var style = {
        font: FONT + "px monospace",
        fill: "#fff"
    };    

  // initialize ascii display
	asciidisplay = [];
	for (var y = 0; y < ROWS; y++) {
		var newRow = [];
		asciidisplay.push(newRow);
		for (var x = 0; x < COLS; x++)
			newRow.push(initCell('', x, y,style));
	}
}

function initCell(chr, x, y,style) {
    // add a single cell in a given position to the ascii display   
    return game.add.text(FONT * 0.6 * x, FONT * y, chr, style);
}

function canGo(actor,dir) {
    return  actor.x+dir.x >= 0 &&
        actor.x+dir.x <= COLS - 1 &&
                actor.y+dir.y >= 0 &&
        actor.y+dir.y <= ROWS - 1 &&
        map[actor.y+dir.y][actor.x +dir.x] == '.';
}

function moveTo(actor, dir) {
        // check if actor can move in the given direction
        if (!canGo(actor,dir))
                return false;
 
        // moves actor to the new location
        var newKey = (actor.y + dir.y) +'_' + (actor.x + dir.x);
        // if the destination tile has an actor in it
        if (actorMap[newKey] != null) {
                //decrement hitpoints of the actor at the destination tile
                var victim = actorMap[newKey];
                victim.hp--;
                player.hp--;
 
                // if it's dead remove its reference
                if (victim.hp == 0) {
                        actorMap[newKey]= null;
                        actorList[actorList.indexOf(victim)]=null;
                        if(victim!=player) {
                                livingEnemies--;
                                if (livingEnemies == 0) {
                                        // victory message
                                        var victory = game.add.text(game.world.centerX, game.world.centerY, 'V!', { fill : '#2e2', align: "center" } );
                                        victory.anchor.setTo(0.5,0.5);
                                }
                        }
                }
        } else {

                // remove reference to the actor's old position                
                actorMap[actor.y + '_' + actor.x]= null;            
               // initCell("H",actor.x,actor.y);
 
                // update position
                actor.y+=dir.y;
                actor.x+=dir.x;
 
                // add reference to the actor's new position
                actorMap[actor.y + '_' + actor.x]=actor;
        }
        return true;
	}

	function onKeyUp(event) {
        // draw map to overwrite previous actors positions
       // drawMap();
 
        // act on player input
        var acted = false;
        switch (event.keyCode) {
                case Phaser.Keyboard.LEFT:
                        acted = moveTo(player, {x:-1, y:0});
                        break;
 
                case Phaser.Keyboard.RIGHT:
                        acted = moveTo(player,{x:1, y:0});
                        break;
 
                case Phaser.Keyboard.UP:
                        acted = moveTo(player, {x:0, y:-1});
                        break;
 
                case Phaser.Keyboard.DOWN:
                        acted = moveTo(player, {x:0, y:1});
                        break;
        }
 
        // draw actors in new positions
        drawMap();
        drawActors();        
     //   init();
       // / refresh();
	}

}());