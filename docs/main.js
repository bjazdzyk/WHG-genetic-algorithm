var c = document.getElementById("Canvas");
var ctx = c.getContext("2d");

const screenWidth = 800
const screenHeight = 600

const crd2str =(x, y)=>{
	return x.toString() + ":" + y.toString()
}

class Level{
	constructor(width, height, startPoint, template){
		this.tick = 0
		this.width = width
		this.height = height
		this.template = template
		this.startPoint = startPoint
		this.L = {}
		this.enemies = {}
		this.enemyIds = []
		this.players = {}
		this.playerIds =[ ]
		if(this.width > this.height){
			this.renderSize = {x:screenWidth-100, y:(screenWidth-100)/this.width*this.height}
		}else{
			this.renderSize = {x:(screenHeight-100)/this.height*this.width, y:screenHeigh-100}
		}
		this.renderAnchor = {x: (screenWidth-this.renderSize.x)/2, y: (screenHeight-this.renderSize.y)/2}
		this.cellSize = {x: this.renderSize.x/this.width, y:this.renderSize.y/this.height}
		if(this.template === "empty"){
			for(let i=0; i<this.width; i++){
				for(let j=0; j<this.height; j++){
					this.L[crd2str(i, j)] = 0
				}
			}
		}
	}
	editSquare(x, y, type){
		this.L[crd2str(x, y)] = type
	}
	fill(x, y, w, h, type){
		for(let i=x; i<x+w; i++){
			for(let j=y; j<y+h; j++){
				this.editSquare(i, j, type)
			}
		}
	}
	addEnemy(id, path, ticksBetween, sizeScale = 0.22){
		const radius = Math.min(this.cellSize.x, this.cellSize.y)*sizeScale
		this.enemies[id] = {path: path, x:path[0][0], y:path[0][1], radius: radius}
		this.enemyIds.push(id)

		if(path.length > 1){
			this.enemies[id].static = false
			this.enemies[id].lastPoint = 0
			this.enemies[id].destination = 1
			const delta = {x: path[1][0]-path[0][0], y: path[1][1]-path[0][1]}
			this.enemies[id].step = {}
			this.enemies[id].step.x = delta.x/ticksBetween
			this.enemies[id].step.y = delta.y/ticksBetween
			this.enemies[id].ticksBetween = ticksBetween

		}else{
			this.enemies[id].static = true
		}
	}

	newPlayer(player){
		this.players[player.id] = player
		this.playerIds.push(player.id)
		player.x = this.startPoint.x
		player.y = this.startPoint.y
	}

	update(){
		for(let i=0; i<this.enemyIds.length; i++){
			const enemy = this.enemies[this.enemyIds[i]]
			const destinationDelta = Math.sqrt((enemy.path[enemy.destination][0]-enemy.x)*(enemy.path[enemy.destination][0]-enemy.x)+(enemy.path[enemy.destination][1]-enemy.y)*(enemy.path[enemy.destination][1]-enemy.y))
			if(Math.abs(destinationDelta*this.cellSize.x) < 1){

				this.enemies[this.enemyIds[i]].lastPoint = enemy.destination
				this.enemies[this.enemyIds[i]].destination = (enemy.destination+1)%enemy.path.length
				const delta = {x: enemy.path[this.enemies[this.enemyIds[i]].destination][0]-enemy.path[this.enemies[this.enemyIds[i]].lastPoint][0], y: enemy.path[this.enemies[this.enemyIds[i]].destination][1]-enemy.path[this.enemies[this.enemyIds[i]].lastPoint][1]}
				this.enemies[this.enemyIds[i]].step = {}
				this.enemies[this.enemyIds[i]].step.x = delta.x/enemy.ticksBetween
				this.enemies[this.enemyIds[i]].step.y = delta.y/enemy.ticksBetween
			}
			this.enemies[this.enemyIds[i]].x += this.enemies[this.enemyIds[i]].step.x
			this.enemies[this.enemyIds[i]].y += this.enemies[this.enemyIds[i]].step.y
		}
	}
	render(){
		ctx.fillStyle = "white"
		ctx.fillRect(this.renderAnchor.x, this.renderAnchor.y, this.renderSize.x, this.renderSize.y)
		//wals
		for(let i=0; i<this.width; i++){
			for(let j=0; j<this.height; j++){
				if(this.L[crd2str(i, j)] === 1){
					ctx.fillStyle = "#70bfe0"
					ctx.fillRect(this.renderAnchor.x+i*this.cellSize.x-1, this.renderAnchor.y+j*this.cellSize.y-1, this.cellSize.x+2, this.cellSize.y+2)
				}
				if(this.L[crd2str(i, j)] === 2){
					ctx.fillStyle = "#8fffa0"//green
					ctx.fillRect(this.renderAnchor.x+i*this.cellSize.x-0.5, this.renderAnchor.y+j*this.cellSize.y-0.5, this.cellSize.x+1, this.cellSize.y+1)
				}
			}
		}
		//enemies
		for(let i=0; i<this.enemyIds.length; i++){
			const enemy = this.enemies[this.enemyIds[i]]
			ctx.fillStyle = "red"
			ctx.beginPath()
			ctx.arc(this.renderAnchor.x+enemy.x*this.cellSize.x, this.renderAnchor.y+enemy.y*this.cellSize.y, enemy.radius, 0, 2*Math.PI)
			ctx.fill()
		}
		//players
		for(let i=0; i<this.playerIds.length; i++){
			const player = this.players[this.playerIds[i]]
			ctx.fillStyle = player.color
			ctx.fillRect(this.renderAnchor.x+player.x*this.cellSize.x-this.cellSize.x*player.scale/2, this.renderAnchor.y+player.y*this.cellSize.y-this.cellSize.x*player.scale/2, this.cellSize.x*player.scale, this.cellSize.y*player.scale)

		}
	}

}

class Player{
	constructor(id, level, scale = 0.6, color = "red", speed = 0.05){
		this.speed = speed
		this.id = id
		this.level = level
		this.scale = scale
		this.color = color
		this.x = 0
		this.y = 0
		level.newPlayer(this)
	}
	move(x, y){
		if(x<0 && this.x>this.scale/2){
			this.x += x
		}
		if(x>0 && this.x<this.level.width-this.scale/2){
			this.x += x
		}

		if(y<0 && this.y>this.scale/2){
			this.y += y
		}
		if(y>0 && this.y<this.level.height-this.scale/2){
			this.y += y
		}
	}
}

let levels = {}
levels[1] = new Level(16, 7, {x:1.5, y:3.5}, "empty")

levels[1].fill(3, 0, 1, 6, 1)
levels[1].fill(4, 0, 7, 1, 1)
levels[1].fill(5, 6, 7, 1, 1)
levels[1].fill(12, 1, 1, 6, 1)
levels[1].fill(0, 0, 3, 7, 2)
levels[1].fill(13, 0, 3, 7, 2)
levels[1].addEnemy("dot1", [[4.25, 1.5], [11.75, 1.5]], 50)
levels[1].addEnemy("dot2", [[11.75, 2.5], [4.25, 2.5]], 50)
levels[1].addEnemy("dot3", [[4.25, 3.5], [11.75, 3.5]], 50)
levels[1].addEnemy("dot4", [[11.75, 4.5], [4.25, 4.5]], 50)
levels[1].addEnemy("dot5", [[4.25, 5.5], [11.75, 5.5]], 50)

const player = new Player("player", levels[1])


let keys = {}
const loop =()=>{
	requestAnimationFrame(loop)
	ctx.fillStyle = "#70bfe0"
	ctx.fillRect(0, 0, 800, 600)
	levels[1].update()
	levels[1].render()


	if(keys["KeyW"]){
		player.move(0, -player.speed)
	}if(keys["KeyS"]){
		player.move(0, player.speed)
	}if(keys["KeyA"]){
		player.move(-player.speed, 0)
	}if(keys["KeyD"]){
		player.move(player.speed, 0)
	}
}
loop()

document.addEventListener('keydown', (e)=>{
	keys[e.code] = true
})
document.addEventListener('keyup', (e)=>{
	keys[e.code] = null
})