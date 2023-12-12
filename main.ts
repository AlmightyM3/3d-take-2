game.splash("Throw candy at the children.    Throw candy at the children.", "Use the D-pad to move, A to throw, and B to enter demo mode.")
let res = 3
let SizeX = scene.screenWidth()
let SizeY = scene.screenHeight()
info.setScore(0)
let CanShoot = true
let Gravity = 1
//  Define a 3D point
class Point {
    x: number
    y: number
    z: number
    constructor(x: number, y: number, z: number) {
        this.x = x
        this.y = y
        this.z = z
    }
    
}

//  Define sphere SDF
class Sphere {
    point: Point
    radius: number
    color: number
    constructor(point: Point = new Point(0, 0, 0), radius: number = 0, color: number = 0) {
        this.point = point
        this.radius = radius
        this.color = color
    }
    
    public check(checkPoint: Point = new Point(0, 0, 0)): number {
        let d = DistanceBetweenPoints(checkPoint, this.point)
        return d - this.radius
    }
    
}

//  Define vertical capsule SDF
// class VerticalCapsule:
//     def __init__(self, point = Point(0,0,0), height = 0, radius = 0, color = 0):
//         self.point = point
//         self.height = height
//         self.radius = radius
//         self.color = color
//     
//     def check(self, checkPoint = Point(0,0,0)):
//         checkPoint = Point(checkPoint.x-self.point.x,checkPoint.y-self.point.y,checkPoint.z-self.point.z)
//         checkPoint.y -= Math.clamp(checkPoint.y, 0, self.height)
//         d = DistanceBetweenPoints(checkPoint,Point(0,0,0))
//         return d - self.radius
//  Define capsule SDF
class Capsule {
    point1: Point
    point2: Point
    radius: number
    color: number
    constructor(point1: Point = new Point(0, 0, 0), point2: Point = new Point(0, 0, 0), radius: number = 0, color: number = 0) {
        this.point1 = point1
        this.point2 = point2
        this.radius = radius
        this.color = color
    }
    
    public check(checkPoint: Point = new Point(0, 0, 0)): number {
        let pa = new Point(checkPoint.x - this.point1.x, checkPoint.y - this.point1.y, checkPoint.z - this.point1.z)
        let ba = new Point(this.point2.x - this.point1.x, this.point2.y - this.point1.y, this.point2.z - this.point1.z)
        let h = Math.clamp(DotProduct(pa, ba) / DotProduct(ba, ba), 0.0, -1.0)
        // h = DotProduct(pa,ba)/DotProduct(ba,ba)
        let p = new Point(pa.x - ba.x * h, pa.y - ba.y * h, pa.z - ba.z * h)
        let d = DistanceBetweenPoints(p, new Point(0, 0, 0))
        return d - this.radius
    }
    
}

//  Define plane SDF
class Plane {
    direction: Point
    offset: number
    color: number
    constructor(direction: Point = new Point(0, 0, 0), offset: number = 0, color: number = 0) {
        this.direction = Normalize(direction)
        this.offset = offset
        this.color = color
    }
    
    public check(checkPoint: Point = new Point(0, 0, 0)) {
        return DotProduct(checkPoint, this.direction) + this.offset
    }
    
}

//  Define box SDF
class Box {
    point: Point
    size: Point
    color: number
    constructor(point: Point = new Point(0, 0, 0), size: Point = new Point(1, 1, 1), color: number = 0) {
        this.point = point
        this.size = size
        this.color = color
    }
    
    public check(checkPoint: Point = new Point(0, 0, 0)): number {
        checkPoint = new Point(Math.abs(checkPoint.x - this.point.x), Math.abs(checkPoint.y - this.point.y), Math.abs(checkPoint.z - this.point.z))
        // x = max(abs(checkPoint.x)-self.size.x+10, 0)
        // z = max(abs(checkPoint.y)-self.size.y+10, 0)
        // y = max(abs(checkPoint.z)-self.size.z+40, 0)
        let x = Math.abs(checkPoint.x) - this.size.x + 10
        let z = Math.abs(checkPoint.y) - this.size.y + 10
        let y = Math.abs(checkPoint.z) - this.size.z + 40
        if (x < 0 && y < 0 && z < 0) {
            x = 0
            y = 0
            z = 0
            console.log("no")
        }
        
        // print(DistanceBetweenPoints(Point(x,y,z),checkPoint))
        return DistanceBetweenPoints(new Point(x, y, z), checkPoint)
    }
    
}

//  Define Child SDF
class Child {
    point: Point
    point2: Point
    radius: number
    color: number
    constructor(point: Point = new Point(0, 0, 0), hight: number = 0, radius: number = 0, color: number = 0) {
        this.point = point
        this.point2 = new Point(point.x, point.y + hight, point.z)
        this.radius = radius
        this.color = color
    }
    
    public check(checkPoint: Point = new Point(0, 0, 0)): number {
        let pa = new Point(checkPoint.x - this.point.x, checkPoint.y - this.point.y, checkPoint.z - this.point.z)
        let ba = new Point(0, this.point2.y - this.point.y, 0)
        let h = Math.clamp(DotProduct(pa, ba) / DotProduct(ba, ba), 0.0, -1.0)
        // h = DotProduct(pa,ba)/DotProduct(ba,ba)
        let p = new Point(pa.x, pa.y - ba.y * h, pa.z)
        let d = DistanceBetweenPoints(p, new Point(0, 0, 0))
        return d - this.radius
    }
    
}

//  Define projectile SDF (Just a sphere with initial velocity and acceleration do to gravity.)
class Projectile {
    point: Point
    radius: number
    color: number
    velocity: Point
    constructor(point: Point = new Point(0, 0, 0), radius: number = 0, color: number = 0, velocity: Point = new Point(0, 0, 0)) {
        this.point = point
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    
    public check(checkPoint: Point = new Point(0, 0, 0)): number {
        let d = DistanceBetweenPoints(checkPoint, this.point)
        return d - this.radius
    }
    
    public update(): boolean {
        if (this.point.y + this.radius < 35 + res) {
            this.velocity.y = this.velocity.y + Gravity
            this.point = new Point(this.point.x + this.velocity.x, this.point.y + this.velocity.y, this.point.z + this.velocity.z)
            return false
        } else {
            return true
        }
        
    }
    
    public checkCollision(child: Child = new Child(new Point(0, 0, 0), 0, 0, 0)): boolean {
        let d = child.check(this.point) - this.radius
        if (d <= 0) {
            return true
        }
        
        return false
    }
    
}

//  Define distance between 3D points
function DistanceBetweenPoints(p1: Point = new Point(0, 0, 0), p2: Point = new Point(0, 0, 0)): number {
    let x = p1.x - p2.x
    let y = p1.y - p2.y
    let z = p1.z - p2.z
    return Math.sqrt(x * x + y * y + z * z)
}

//  Extremely simplified ray code (Gets a point td distance between two other points, 
//  but the point can be past the second point, similar to Lerp)
function PointAlongLine(p1: Point = new Point(0, 0, 0), p2: Point = new Point(0, 0, 0), td: number = 0): Point {
    let d = DistanceBetweenPoints(p1, p2)
    let t1 = td / d
    let t2 = 1 - t1
    let x1 = t2 * p1.x
    let x2 = t1 * p2.x
    let y1 = t2 * p1.y
    let y2 = t1 * p2.y
    let z1 = t2 * p1.z
    let z2 = t1 * p2.z
    return new Point(x1 + x2, y1 + y2, z1 + z2)
}

//  Gets the lowest distance of all of the objects in the scene
function GetWorldDistance(p: Point = new Point(0, 0, 0)): number {
    //  I should be able to use list comprehension, but makecode doesn't support it.
    // d = [objects[j].check(p) for j in range(len(objects))]
    // return min(d)
    let d = []
    for (let j of objects) {
        d.push(j.check(p))
    }
    let m = 999
    for (let i = 0; i < d.length; i++) {
        if (d[i] < m) {
            m = d[i]
        }
        
    }
    return m
}

//  Normalizes a point so it still has the same direction, but has a length of one
function Normalize(p: Point = new Point(0, 0, 0)): Point {
    let d = DistanceBetweenPoints(p, new Point(0, 0, 0))
    return new Point(p.x / d, p.y / d, p.z / d)
}

//  Gets the surface normal of a point on a object by sampling points around it
function GetNormal(p: Point = new Point(0, 0, 0)): Point {
    let x = GetWorldDistance(new Point(p.x + 1, p.y, p.z)) - GetWorldDistance(new Point(p.x - 1, p.y, p.z))
    let y = GetWorldDistance(new Point(p.x, p.y + 1, p.z)) - GetWorldDistance(new Point(p.x, p.y - 1, p.z))
    let z = GetWorldDistance(new Point(p.x, p.y, p.z + 1)) - GetWorldDistance(new Point(p.x, p.y, p.z - 1))
    return Normalize(new Point(x, y, z))
}

//  Gets dot product of 2 points
function DotProduct(p1: Point = new Point(0, 0, 0), p2: Point = new Point(0, 0, 0)): number {
    return p1.x * p2.x + p1.y * p2.y + p1.z * p2.z
}

function ray(direction: Point = new Point(0, 0, 0), start: Point = new Point(0, 0, 0)): number[] {
    let d: number;
    // i = 0
    let done = false
    let CurrentPosition = direction
    let dist = 1
    for (let i = 0; i < 4; i++) {
        // while not done:
        d = GetWorldDistance(CurrentPosition)
        dist += d
        // if i > 4:
        //     done = True
        //     return 0, CurrentPosition.x,CurrentPosition.y,CurrentPosition.z
        // i += 1
        if (d <= 0) {
            done = true
            return [1, CurrentPosition.x, CurrentPosition.y, CurrentPosition.z]
        } else {
            CurrentPosition = PointAlongLine(start, CurrentPosition, dist)
        }
        
    }
    return [0, CurrentPosition.x, CurrentPosition.y, CurrentPosition.z]
}

//  Returns a color index from a color (0-7) and a brightness (0.0-1.0).
function GetColor(x: number, y: number, color: number, brightness: number): number {
    let c: number;
    // return Math.round(brightness*4) + color*4
    if (brightness > 0.8) {
        return 1 + color * 2
    } else if (brightness > 0.6) {
        c = 1
        if (x % 2 != y % 2) {
            c = 2
        }
        
        return c + color * 2
    } else if (brightness > 0.4) {
        return 2 + color * 2
    } else if (brightness > 0.2) {
        c = 2
        if (x % 2 != y % 2) {
            return 15
        }
        
        return c + color * 2
    } else {
        return 15
    }
    
}

//  Gets the color of the nearist object to p.
function GetPointColor(p: Point = new Point(0, 0, 0)): number {
    let d = []
    for (let j of objects) {
        d.push(j.check(p))
    }
    let m = 999
    let obj = 0
    for (let i = 0; i < objects.length; i++) {
        if (d[i] < m) {
            m = d[i]
            obj = i
        }
        
    }
    return objects[obj].color
}

//  Sets a pixel of size res and position x,y to a color index.
function SetPixel(x: number = 0, y: number = 0, c: number = 0) {
    for (let rx = 0; rx < res; rx++) {
        for (let ry = 0; ry < res; ry++) {
            window.setPixel(x * res + rx, y * res + ry, c)
        }
    }
}

//  Define the scene
let physicsObjects = [new Projectile(new Point(0, 0, 0), 0, 0, new Point(0, 0, 0))]
physicsObjects.removeAt(0)
//  I have to give lists a starting value because makecode.
let child = new Child(new Point(55, 25, 15), 35, 20, 6)
let objects = [new Sphere(new Point(0, 25, 10), 20, 0), child, new Plane(new Point(0, -1, 0), 35, 2)]
let objectsLength = objects.length
let focalLength = 25
let camera = new Point(0, 0, -focalLength)
// lightDir = Normalize(Point(1,-1,0))
let lightDir = Normalize(new Point(0.5, -1, -0.5))
let window = image.create(SizeX, SizeY)
window.fillRect(0, 0, SizeX, SizeY, 0)
scene.setBackgroundImage(window)
//  Draw the scene
// def OldDraw():
//     window.fill_rect(0, 0, SizeX, SizeY, 8)
//     for x in range(SizeX//res):
//         for y in range(SizeY//res):
// # Start the actual ray marching for every pixel on screen
//             i = 0
//             done = False
//             CurrentPosition = Point(camera.x + (x*res) - SizeX/2,camera.y + (y*res) - SizeY/2, camera.z+focalLength)
//             dist = 1
//             while not done:
//                 d = GetWorldDistance(CurrentPosition)
//                 dist += d
//                 if i > 4:
//                     done = True
//                 i += 1
//                 if d <= 0:
//                     done = True
//                     normal = GetNormal(CurrentPosition)
//                     DiffuseLight = max(0, DotProduct(normal, lightDir)) # Diffuse lighting
//                     color = GetPointColor(CurrentPosition)
//                     SetPixel(x,y, GetColor(x,y, color,DiffuseLight))
//                 else:
//                     CurrentPosition = PointAlongLine(camera, CurrentPosition, dist)
//     scene.set_background_image(window)
function Draw() {
    let HitPosition: Point;
    let normal: Point;
    let DiffuseLight: number;
    let color: number;
    window.fillRect(0, 0, SizeX, SizeY, 8)
    for (let x = 0; x < Math.idiv(SizeX, res); x++) {
        for (let y = 0; y < Math.idiv(SizeY, res); y++) {
            //  Start the actual ray marching for every pixel on screen
            let [hit, hx, hy, hz] = ray(new Point(camera.x + x * res - SizeX / 2, camera.y + y * res - SizeY / 2, camera.z + focalLength), camera)
            if (hit == 1) {
                HitPosition = new Point(hx, hy, hz)
                normal = GetNormal(HitPosition)
                DiffuseLight = Math.max(0, DotProduct(normal, lightDir))
                //  Diffuse lighting
                color = GetPointColor(HitPosition)
                SetPixel(x, y, GetColor(x, y, color, DiffuseLight))
            }
            
        }
    }
    scene.setBackgroundImage(window)
}

//  Draw the scene
Draw()
//  Define a demo mode in which a preprepared scene is loaded and the resolution is set to max
function demoMode() {
    window.fillRect(0, 0, SizeX, SizeY, 0)
    scene.setBackgroundImage(window)
    if (res == 1) {
        game.reset()
    }
    
    
    let toDestroy = []
    for (let i = 0; i < physicsObjects.length; i++) {
        toDestroy.push(i)
    }
    for (let r of toDestroy) {
        physicsObjects.removeAt(r)
        objects.removeAt(r + objectsLength)
    }
    let capsule = new Child(new Point(55, 25, 15), 35, 20, 6)
    objects = [new Sphere(new Point(0, 0, 20), 40, 0), new Sphere(new Point(-55, 25, 5), 25, 1), capsule, new Plane(new Point(0, -1, 0), 35, 2)]
    // Capsule(Point(55,25,15), Point(55,60,15), 20, 6),
    
    camera = new Point(0, 0, -focalLength)
    
    lightDir = Normalize(new Point(0.5, -1, -0.5))
    
    CanShoot = false
    
    res = 1
    game.showLongText("Entering demo mode, press B to exit.", DialogLayout.Bottom)
    Draw()
}

//  Button input, uses both pressed and repeated so you can press or hold the buttons
function on_up_pressed() {
    if (camera.y > -30) {
        camera.y -= 15 / res
    }
    
}

controller.up.onEvent(ControllerButtonEvent.Pressed, on_up_pressed)
controller.up.onEvent(ControllerButtonEvent.Repeated, on_up_pressed)
function on_down_pressed() {
    if (camera.y < 30) {
        camera.y += 15 / res
    }
    
}

controller.down.onEvent(ControllerButtonEvent.Pressed, on_down_pressed)
controller.down.onEvent(ControllerButtonEvent.Repeated, on_down_pressed)
function on_left_pressed() {
    if (camera.x > -SizeX / 2) {
        camera.x -= 15 / res
    }
    
}

controller.left.onEvent(ControllerButtonEvent.Pressed, on_left_pressed)
controller.left.onEvent(ControllerButtonEvent.Repeated, on_left_pressed)
function on_right_pressed() {
    if (camera.x < SizeX / 2) {
        camera.x += 15 / res
    }
    
}

controller.right.onEvent(ControllerButtonEvent.Pressed, on_right_pressed)
controller.right.onEvent(ControllerButtonEvent.Repeated, on_right_pressed)
controller.A.onEvent(ControllerButtonEvent.Pressed, function on_a_pressed() {
    
    if (physicsObjects.length < 5 && CanShoot) {
        CanShoot = false
        physicsObjects.push(new Projectile(new Point(camera.x, camera.y, camera.z + focalLength), 20, 4, new Point(0, 0, 2)))
        objects.push(physicsObjects[physicsObjects.length - 1])
        music.play(music.melodyPlayable(music.pewPew), music.PlaybackMode.UntilDone)
        pause(100)
        CanShoot = true
    }
    
})
controller.B.onEvent(ControllerButtonEvent.Pressed, function on_b_pressed() {
    demoMode()
})
// frames = 0
// fps = frames/game.runtime()*1000
// print(fps)
// info.set_score(Math.round(fps))
// frames = frames+1
forever(function on_forever() {
    let shouldDestroy: boolean;
    // global frames
    
    lightDir = new Point(Math.sin(game.runtime() / 2000), -1, Math.cos(game.runtime() / 2000))
    if (res == 1) {
        Draw()
        return
    }
    
    let toDestroy = []
    let hit = false
    for (let i = 0; i < physicsObjects.length; i++) {
        shouldDestroy = physicsObjects[i].update()
        if (shouldDestroy) {
            toDestroy.push(i)
        }
        
        if (!hit) {
            hit = physicsObjects[i].checkCollision(child)
        }
        
    }
    for (let r of toDestroy) {
        physicsObjects.removeAt(r)
        objects.removeAt(r + objectsLength)
    }
    if (hit) {
        child.color = randint(1, 6)
        child.point = new Point(randint(-SizeX / 2, SizeX / 2), randint(20, 30), 15)
        info.changeScoreBy(1)
    }
    
    Draw()
})
