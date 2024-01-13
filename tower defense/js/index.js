const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const btn = document.getElementById('start')

btn.addEventListener('click', () => {
    btn.style.display = 'none';
    canvas.style.filter = 'none';
})

canvas.width = 1280
canvas.height = 1024

c.fillStyle = 'white'
c.fillRect(0,0,canvas.width,canvas.height)


const placementTilesData2D = []

for (let i = 0; i < placementTilesData.length; i += 20) {
    placementTilesData2D.push(placementTilesData.slice(i,i+20))
}


const placementTiles = []

placementTilesData2D.forEach((row, y) => {
    row.forEach((symbol,x) => {
        if (symbol === 14) {
            // building placement tile
            placementTiles.push(
                new PlacementTile({
                position: {
                    x: x * 64,
                    y: y * 64
                }
            })
        )
        }
    })
})



const image = new Image()
image.onload = () => {
    c.drawImage(image,0,0)
    
}
function StartGame(){
    animation();
}
image.src = 'img/map.png'


const enemies = []


function spawnEnemies(spawnCount){
    for (let i = 1; i < spawnCount + 1; i++){
        const xOffset = i*150
        enemies.push(new Enemy1({
            position: {x: waypoints[0].x - xOffset, y: waypoints[0].y }
        }))
    }
}


const buildings = []
let activeTile = undefined
let enemyCount = 3
let hearts = 10
let coins = 100
spawnEnemies(enemyCount)

function animation() {
    const animationId = requestAnimationFrame(animation)
    c.drawImage(image,0,0)
    for( let i = enemies.length - 1; i >= 0; i--){
        const enemy = enemies[i]
        enemy.update()

        if(enemy.position.x > canvas.width) {
            hearts -= 1
            enemies.splice(i, 1)
            document.querySelector('#heartsnumber').innerHTML = hearts
            if (hearts === 0 ) {

                console.log('game over')
                cancelAnimationFrame(animationId)
                document.querySelector('#over').style.display = 'flex'
            }
        }
}
           //tracking total amount of enemies
           if(enemies.length === 0) {
            enemyCount += 3
            spawnEnemies(enemyCount)
        }
placementTiles.forEach(tile => {
    tile.update(mouse)
})

buildings.forEach(Building1 => {
    Building1.update()
    Building1.target = null
    const validEnemies = enemies.filter(enemy => {
        const xDifference = enemy.position.x - Building1.center.x
        const yDifference = enemy.position.y - Building1.center.y
        const distance = Math.hypot(xDifference,yDifference)
        return distance < enemy.radius + Building1.radius
    })
    Building1.target =validEnemies[0]
    
    for( let i = Building1.projectiles.length - 1; i >= 0; i--){
        const projectile = Building1.projectiles[i]
    
        projectile.update()

        const xDifference = projectile.enemy.position.x - projectile.position.x
        const yDifference = projectile.enemy.position.y - projectile.position.y
        const distance = Math.hypot(xDifference,yDifference)
        // projectile hits enemy
        if (distance < projectile.enemy.radius + projectile.radius+15) {
            projectile.enemy.health -= 20
            // enemy health and removal
            if(projectile.enemy.health <= 0){
             const enemyIndex = enemies.findIndex( (enemy) =>{
                    return projectile.enemy === enemy
                })
               if(enemyIndex > -1) {
                 coins+=25
                 document.querySelector('#coinsnumber').innerHTML = coins
                enemies.splice(enemyIndex, 1)
                Building1.projectiles.splice(0, 1000)
               }
            }
 
            Building1.projectiles.splice(i, 1)
        }
       
        
    }
})
}

const mouse = {
    x: undefined,
    y: undefined
}



canvas.addEventListener('click', (event) => {
    if (activeTile && !activeTile.isOccupied && coins - 50 >= 0){
        coins -= 50
        document.querySelector('#coinsnumber').innerHTML = coins
        buildings.push(new Building1({
            position:{
                x: activeTile.position.x,
                y: activeTile.position.y
            }
        }))
   
        activeTile.isOccupied = true
    }
    
})

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX
    mouse.y = event.clientY
 
    activeTile = null
    for(let i = 0; i <placementTiles.length; i++){
        const tile = placementTiles[i]
        if(mouse.x > tile.position.x &&
            mouse.x < tile.position.x + tile.size && 
            mouse.y > tile.position.y && 
            mouse.y < tile.position.y + tile.size){
                activeTile = tile
            break   
            } 
    }
    
})

