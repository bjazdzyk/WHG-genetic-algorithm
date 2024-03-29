var c = document.getElementById("Canvas");
var ctx = c.getContext("2d");

const screenWidth = 800
const screenHeight = 600

const crd2str =(x, y)=>{
	return x.toString() + ":" + y.toString()
}

//test

let tick = 1
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
		this.playerIds = []
		this.checkPoints = [[startPoint.x, startPoint.y], [3.5, 6.5], [12.5, 0.5], [6.5, 15.5]]
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
		this.players[player.id].x = this.startPoint.x
		this.players[player.id].y = this.startPoint.y
	}

	update(){
		for(let i=0; i<this.enemyIds.length; i++){
			const enemy = this.enemies[this.enemyIds[i]]
			const destinationDelta = Math.sqrt((enemy.path[enemy.destination][0]-enemy.x)*(enemy.path[enemy.destination][0]-enemy.x)+(enemy.path[enemy.destination][1]-enemy.y)*(enemy.path[enemy.destination][1]-enemy.y))
			
			if(Math.abs(destinationDelta*this.cellSize.x) < 0.1){
				if(tick>=120){
					tick = 0
				}
				this.enemies[this.enemyIds[i]].lastPoint = enemy.destination
				this.enemies[this.enemyIds[i]].destination = (enemy.destination+1)%enemy.path.length
				const delta = {x: enemy.path[this.enemies[this.enemyIds[i]].destination][0]-enemy.path[this.enemies[this.enemyIds[i]].lastPoint][0], y: enemy.path[this.enemies[this.enemyIds[i]].destination][1]-enemy.path[this.enemies[this.enemyIds[i]].lastPoint][1]}
				this.enemies[this.enemyIds[i]].step = {}
				this.enemies[this.enemyIds[i]].step.x = delta.x/enemy.ticksBetween
				this.enemies[this.enemyIds[i]].step.y = delta.y/enemy.ticksBetween
			}
			this.enemies[this.enemyIds[i]].x += this.enemies[this.enemyIds[i]].step.x
			this.enemies[this.enemyIds[i]].y += this.enemies[this.enemyIds[i]].step.y
			if(tick == 0){
				this.enemies[this.enemyIds[i]].x = enemy.path[0][0]
				this.enemies[this.enemyIds[i]].y = enemy.path[0][1]
			}
		}

		tick++
		for(let i=0; i<this.playerIds.length; i++){
			for(let j=0; j<this.enemyIds.length; j++){
				const pX = this.players[this.playerIds[i]].x
				const pY = this.players[this.playerIds[i]].y
				const eX = this.enemies[this.enemyIds[j]].x
				const eY = this.enemies[this.enemyIds[j]].y
				const delta = Math.sqrt((eX-pX)*(eX-pX) + (eY-pY)*(eY-pY))
				const permissibleDelta = this.enemies[this.enemyIds[j]].radius + this.cellSize.x*this.players[this.playerIds[i]].scale/2
				if(delta*this.cellSize.x < permissibleDelta){
					this.players[this.playerIds[i]].isDead = true
				}

			}
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
			ctx.fillStyle = "blue"
			ctx.beginPath()
			ctx.arc(this.renderAnchor.x+enemy.x*this.cellSize.x, this.renderAnchor.y+enemy.y*this.cellSize.y, enemy.radius, 0, 2*Math.PI)
			ctx.fill()
		}
		//players
		for(let i=0; i<this.playerIds.length; i++){
			const player = this.players[this.playerIds[i]]
			if(!player.isDead){
				ctx.fillStyle = player.color
				ctx.strokeStyle = "#8f0000"
				ctx.lineWidth = 5
				ctx.fillRect(this.renderAnchor.x+player.x*this.cellSize.x-this.cellSize.x*player.scale/2, this.renderAnchor.y+player.y*this.cellSize.y-this.cellSize.x*player.scale/2, this.cellSize.x*player.scale, this.cellSize.y*player.scale)
				ctx.strokeRect(this.renderAnchor.x+player.x*this.cellSize.x-this.cellSize.x*player.scale/2, this.renderAnchor.y+player.y*this.cellSize.y-this.cellSize.x*player.scale/2, this.cellSize.x*player.scale, this.cellSize.y*player.scale)

			}

		}
	}
	clear(){
		tick = 0
		this.players = {}
		this.playerIds =[]
	}

}

class Player{
	constructor(id, level, color = "red", speed = 0.06){
		this.checkPointsPassed = 0
		this.isDead = false
		this.speed = speed
		this.id = id
		this.level = level
		this.scale = 0.6
		this.color = color
		level.newPlayer(this)
	}
	move(x, y){
		let move = false
		if(!this.isDead){
			if(x<0 && this.x>this.scale/2){
				if(this.level.L[crd2str(Math.floor(this.x-this.scale/2-0.07), Math.floor(this.y-this.scale/2))] != 1){
					if(this.level.L[crd2str(Math.floor(this.x-this.scale/2-0.07), Math.floor(this.y+this.scale/2))] != 1){
						this.x += x
						move = true
					}
				}
			}
			if(x>0 && this.x<this.level.width-this.scale/2){
				if(this.level.L[crd2str(Math.floor(this.x+this.scale/2+0.07), Math.floor(this.y-this.scale/2))] != 1){
					if(this.level.L[crd2str(Math.floor(this.x+this.scale/2+0.07), Math.floor(this.y+this.scale/2))] != 1){
						this.x += x
						move = true
					}
				}
			}

			if(y<0 && this.y>this.scale/2+0.05){
				if(this.level.L[crd2str(Math.floor(this.x-this.scale/2), Math.floor(this.y-this.scale/2-0.07))] != 1){
					if(this.level.L[crd2str(Math.floor(this.x+this.scale/2), Math.floor(this.y-this.scale/2-0.07))] != 1){
						this.y += y
						move = true
					}
				}
			}
			if(y>0 && this.y<this.level.height-this.scale/2-0.05){
				if(this.level.L[crd2str(Math.floor(this.x-this.scale/2), Math.floor(this.y+this.scale/2+0.07))] != 1){
					if(this.level.L[crd2str(Math.floor(this.x+this.scale/2), Math.floor(this.y+this.scale/2+0.07))] != 1){
						this.y += y
						move = true
					}
				}
			}
			if(move){
				const targetX = this.level.checkPoints[this.checkPointsPassed+1][0]
				const targetY = this.level.checkPoints[this.checkPointsPassed+1][1]
				const deltaX = Math.abs(targetX - this.x)
				const deltaY = Math.abs(targetY - this.y)
				const distToCheckpoint = Math.sqrt(deltaX*deltaX + deltaY*deltaY)

				if(distToCheckpoint < 1){
					this.checkPointsPassed++
				}
			}
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
levels[1].addEnemy("dot1", [[4.25, 1.5], [11.75, 1.5]], 60)
levels[1].addEnemy("dot2", [[11.75, 2.5], [4.25, 2.5]], 60)
levels[1].addEnemy("dot3", [[4.25, 3.5], [11.75, 3.5]], 60)
levels[1].addEnemy("dot4", [[11.75, 4.5], [4.25, 4.5]], 60)
levels[1].addEnemy("dot5", [[4.25, 5.5], [11.75, 5.5]], 60)

const randomGenotype =(In, Out)=>{ //only for Out: 1-9
	let GEN = ""
	for(let i=0; i<=In; i++){
		GEN += ((Math.floor(Math.random()*Out).toString(4)))
	}
	return(GEN)
}

const firstGeneration = (botCount, level)=>{
	let botList = []
	for(let i=1; i<=botCount; i++){
		botList.push({player: new Player("botNr:" + i.toString(), level), genotype: randomGenotype(8*16*13, 4)})
	}
	return(botList)
}

const fitness =(player)=>{
	const x = player.x
	const y = player.y
	const previousCheckpointX = player.level.checkPoints[player.checkPointsPassed][0]
	const previousCheckpointY = player.level.checkPoints[player.checkPointsPassed][1]
	const targetX = player.level.checkPoints[player.checkPointsPassed+1][0]
	const targetY = player.level.checkPoints[player.checkPointsPassed+1][1]
	
	let deltaX = Math.abs(targetX-x)
	let deltaY = Math.abs(targetY-y)
	const distNextCheckpoint = Math.sqrt(deltaX*deltaX + deltaY*deltaY)

	deltaX = Math.abs(targetX - previousCheckpointX)
	deltaY = Math.abs(targetY - previousCheckpointY)
	const distBtwCheckpoints = Math.sqrt(deltaX*deltaX + deltaY*deltaY)

	let fitness = 100*player.checkPointsPassed + (150*player.level.checkPoints.length-1)-Math.floor(distNextCheckpoint/distBtwCheckpoints*100)
	
	if(player.isDead){
		fitness -= 10
	}
	return fitness
}

const crossover =(G1, G2)=>{
	const slicePoint = Math.floor(Math.random()*(G2.length-2)+1)
	const crossed = G1.slice(0, slicePoint) + G2.slice(slicePoint, G2.length)
	return(crossed)
}

const generateFitnessWheel =(generation)=>{
	let fitnessSum = 0
	let fitnessDenominator = 0
	for(let i=0; i<generation.length; i++){
		const f = fitness(generation[i].player)
		fitnessSum += f
		fitnessDenominator ++
	}
	const averageFitness = fitnessSum/fitnessDenominator


	let wheelBorders = []
	let wheelSize = 0
	for(let i=0; i<generation.length; i++){
		const f = fitness(generation[i].player)
		if(f>=averageFitness){
			wheelSize += f
		}
		wheelBorders.push(wheelSize)
	}
	return({borders: wheelBorders, size: wheelSize})
}

const newGeneration =(generation, level)=>{
	const wheel = generateFitnessWheel(generation)
	let nextGeneration = []
	for(let i=0; i<generation.length; i++){
		const pre1on_wheel = Math.floor(Math.random()*wheel.size)
		const pre2on_wheel = Math.floor(Math.random()*wheel.size)

		let pre1id
		let pre2id
		for(let j=0; j<generation.length; j++){
			if(wheel.borders[j]>pre1on_wheel){
				pre1id = j
				break
			}
		}
		for(let j=0; j<generation.length; j++){
			if(wheel.borders[j]>pre2on_wheel){
				pre2id = j
				break
			}
		}

		const pre1GENs = generation[pre1id].genotype
		const pre2GENs = generation[pre2id].genotype

		const newBotGENs = crossover(pre1GENs, pre2GENs)
		nextGeneration.push({player: new Player("botNr:" + i.toString(), level), genotype: newBotGENs})
	}
	return(nextGeneration)
}

let currentGeneration = firstGeneration(500, levels[1])

//console.log(randomGenotype(33*78*101, 4))

let keys = {}
let l = 0
let g = 0
let steps = 30
const loop =()=>{
	requestAnimationFrame(loop)
	ctx.fillStyle = "#70bfe0"
	ctx.fillRect(0, 0, 800, 600)

	levels[1].update()
	levels[1].render()
	for(let i=0; i<currentGeneration.length; i++){
		const roboGENs = currentGeneration[i].genotype
		const data = {x: Math.floor(currentGeneration[i].player.x), y: Math.floor(currentGeneration[i].player.y), t: Math.floor(tick/10)}
		const decision = roboGENs[data.y+8*(data.x)+8*16*(data.t)]

		if(decision == 0){
			currentGeneration[i].player.move(0, -currentGeneration[i].player.speed)
		}if(decision == 1){
			currentGeneration[i].player.move(0, currentGeneration[i].player.speed)
		}if(decision == 2){
			currentGeneration[i].player.move(-currentGeneration[i].player.speed, 0)
		}if(decision == 3){
			currentGeneration[i].player.move(currentGeneration[i].player.speed, 0)
		}
		if(decision == undefined){
			console.log(decision, data, data.y+6*(data.x-1)+6*15*(data.t-1))
		}
	}

	if(l>=steps){
		levels[1].clear()
		currentGeneration = newGeneration(currentGeneration, levels[1])
		l = 0
		g++
	}
	if(g>=5){
		steps+=50
		g = 0
	}
	l++

	
}
loop()

document.addEventListener('keydown', (e)=>{
	keys[e.code] = true
})
document.addEventListener('keyup', (e)=>{
	keys[e.code] = null
})