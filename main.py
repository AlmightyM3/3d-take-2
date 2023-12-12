game.splash("Throw candy at the children.    Throw candy at the children.", 
            "Use the D-pad to move, A to throw, and B to enter demo mode.")
res = 3
SizeX = scene.screen_width()
SizeY = scene.screen_height()
info.set_score(0)

CanShoot = True
Gravity = 1

# Define a 3D point
class Point:
    def __init__(self, x,y,z):
        self.x = x
        self.y = y
        self.z = z

# Define sphere SDF
class Sphere:
    def __init__(self, point = Point(0,0,0), radius = 0, color = 0):
        self.point = point
        self.radius = radius
        self.color = color
    
    def check(self, checkPoint = Point(0,0,0)):
        d = DistanceBetweenPoints(checkPoint,self.point)
        return d - self.radius

# Define vertical capsule SDF
#class VerticalCapsule:
#    def __init__(self, point = Point(0,0,0), height = 0, radius = 0, color = 0):
#        self.point = point
#        self.height = height
#        self.radius = radius
#        self.color = color
#    
#    def check(self, checkPoint = Point(0,0,0)):
#        checkPoint = Point(checkPoint.x-self.point.x,checkPoint.y-self.point.y,checkPoint.z-self.point.z)
#        checkPoint.y -= Math.clamp(checkPoint.y, 0, self.height)
#        d = DistanceBetweenPoints(checkPoint,Point(0,0,0))
#        return d - self.radius

# Define capsule SDF
class Capsule:
    def __init__(self, point1 = Point(0,0,0), point2 = Point(0,0,0), radius = 0, color = 0):
        self.point1 = point1
        self.point2 = point2
        self.radius = radius
        self.color = color
    
    def check(self, checkPoint = Point(0,0,0)):
        pa = Point(checkPoint.x - self.point1.x,checkPoint.y - self.point1.y,checkPoint.z - self.point1.z), 
        ba = Point(self.point2.x - self.point1.x,self.point2.y - self.point1.y,self.point2.z - self.point1.z);
        h = Math.clamp( DotProduct(pa,ba)/DotProduct(ba,ba), 0.0, -1.0 )
        #h = DotProduct(pa,ba)/DotProduct(ba,ba)
        p = Point(pa.x - ba.x*h, pa.y - ba.y*h, pa.z - ba.z*h)
        d = DistanceBetweenPoints(p, Point(0,0,0))
        return d - self.radius

# Define plane SDF
class Plane:
    def __init__(self, direction = Point(0,0,0), offset = 0, color = 0):
        self.direction = Normalize(direction)
        self.offset = offset
        self.color = color
    
    def check(self, checkPoint = Point(0,0,0)):
        return DotProduct(checkPoint,self.direction) + self.offset

# Define box SDF
class Box:
    def __init__(self, point = Point(0,0,0), size = Point(1,1,1), color = 0):
        self.point = point
        self.size = size
        self.color = color
    
    def check(self, checkPoint = Point(0,0,0)):
        checkPoint = Point(abs(checkPoint.x-self.point.x), 
            abs(checkPoint.y-self.point.y), abs(checkPoint.z-self.point.z))
        #x = max(abs(checkPoint.x)-self.size.x+10, 0)
        #z = max(abs(checkPoint.y)-self.size.y+10, 0)
        #y = max(abs(checkPoint.z)-self.size.z+40, 0)
        x = abs(checkPoint.x)-self.size.x+10
        z = abs(checkPoint.y)-self.size.y+10
        y = abs(checkPoint.z)-self.size.z+40
        if x<0 and y<0 and z<0 :
            x=0
            y=0
            z=0
            print("no")
        #print(DistanceBetweenPoints(Point(x,y,z),checkPoint))
        return DistanceBetweenPoints(Point(x,y,z),checkPoint)

# Define Child SDF
class Child:
    def __init__(self, point = Point(0,0,0), hight = 0, radius = 0, color = 0):
        self.point = point
        self.point2 = Point(point.x,point.y+hight,point.z)
        self.radius = radius
        self.color = color
    
    def check(self, checkPoint = Point(0,0,0)):
        pa = Point(checkPoint.x - self.point.x,checkPoint.y - self.point.y,checkPoint.z - self.point.z),
        ba = Point(0,self.point2.y - self.point.y,0);
        h = Math.clamp( DotProduct(pa,ba)/DotProduct(ba,ba), 0.0, -1.0 )
        #h = DotProduct(pa,ba)/DotProduct(ba,ba)
        p = Point(pa.x, pa.y - ba.y*h, pa.z)
        d = DistanceBetweenPoints(p, Point(0,0,0))
        return d - self.radius

# Define projectile SDF (Just a sphere with initial velocity and acceleration do to gravity.)
class Projectile:
    def __init__(self, point = Point(0,0,0), radius = 0, color = 0, velocity = Point(0,0,0)):
        self.point = point
        self.radius = radius
        self.color = color
        self.velocity = velocity
    
    def check(self, checkPoint = Point(0,0,0)):
        d = DistanceBetweenPoints(checkPoint,self.point)
        return d - self.radius
    
    def update(self):
        if self.point.y + self.radius < 35 + res:
            self.velocity.y = self.velocity.y + Gravity
            self.point = Point(self.point.x + self.velocity.x,
                self.point.y + self.velocity.y, self.point.z + self.velocity.z)
            return False
        else:
            return True
    
    def checkCollision(self, child = Child(Point(0,0,0),0,0,0)):
        d = child.check(self.point) - self.radius
        if d <=0:
            return True
        return False

# Define distance between 3D points
def DistanceBetweenPoints(p1 = Point(0,0,0),p2 = Point(0,0,0)):
    x = p1.x-p2.x
    y = p1.y-p2.y
    z = p1.z-p2.z
    return Math.sqrt(x*x + y*y + z*z)

# Extremely simplified ray code (Gets a point td distance between two other points, 
# but the point can be past the second point, similar to Lerp)
def PointAlongLine(p1 = Point(0,0,0),p2 = Point(0,0,0),td = 0):
    d = DistanceBetweenPoints(p1,p2)
    t1 = td/d

    t2 = 1-t1
    x1 = t2*p1.x
    x2 = t1*p2.x
    y1 = t2*p1.y
    y2 = t1*p2.y
    z1 = t2*p1.z
    z2 = t1*p2.z
    
    return Point(x1+x2, y1+y2, z1+z2)

# Gets the lowest distance of all of the objects in the scene
def GetWorldDistance(p = Point(0,0,0)):
    # I should be able to use list comprehension, but makecode doesn't support it.
    #d = [objects[j].check(p) for j in range(len(objects))]
    #return min(d)
    d = []
    for j in objects:
        d.append(j.check(p))
    m = 999
    for i in range(len(d)):
        if d[i] < m:
            m = d[i]
    return m

# Normalizes a point so it still has the same direction, but has a length of one
def Normalize(p = Point(0,0,0)):
    d = DistanceBetweenPoints(p,Point(0,0,0))
    return Point(p.x/d,p.y/d,p.z/d)

# Gets the surface normal of a point on a object by sampling points around it
def GetNormal(p = Point(0,0,0)):
    x = GetWorldDistance(Point(p.x + 1, p.y, p.z)) - GetWorldDistance(Point(p.x - 1, p.y, p.z))
    y = GetWorldDistance(Point(p.x, p.y + 1, p.z)) - GetWorldDistance(Point(p.x, p.y - 1, p.z))
    z = GetWorldDistance(Point(p.x, p.y, p.z + 1)) - GetWorldDistance(Point(p.x, p.y, p.z - 1))
    
    return Normalize(Point(x,y,z))

# Gets dot product of 2 points
def DotProduct(p1 = Point(0,0,0),p2 = Point(0,0,0)):
    return p1.x*p2.x + p1.y*p2.y + p1.z*p2.z

def ray(direction = Point(0,0,0), start = Point(0,0,0)):
    #i = 0
    done = False
    CurrentPosition = direction
    dist = 1
    for i in range(4):
    #while not done:
        d = GetWorldDistance(CurrentPosition)
        
        dist += d
        
        #if i > 4:
        #    done = True
        #    return 0, CurrentPosition.x,CurrentPosition.y,CurrentPosition.z
        #i += 1
        
        if d <= 0:
            done = True
            return 1, CurrentPosition.x,CurrentPosition.y,CurrentPosition.z
        else:
            CurrentPosition = PointAlongLine(start, CurrentPosition, dist)
    return 0, CurrentPosition.x,CurrentPosition.y,CurrentPosition.z

# Returns a color index from a color (0-7) and a brightness (0.0-1.0).
def GetColor(x,y, color, brightness):
    #return Math.round(brightness*4) + color*4
    if brightness > 0.8:
        return 1 + color*2
    elif brightness > 0.6:
        c=1
        if (x%2 != y%2):
            c=2
        return c + color*2
    elif brightness > 0.4:
        return 2 + color*2
    elif brightness > 0.2:
        c=2
        if (x%2 != y%2):
            return 15
        return c + color*2
    else:
        return 15

# Gets the color of the nearist object to p.
def GetPointColor(p = Point(0,0,0)):
    d = []
    for j in objects:
        d.append(j.check(p))
    m = 999
    obj = 0
    for i in range(len(objects)):
        if d[i] < m:
            m = d[i]
            obj = i
    return objects[obj].color

# Sets a pixel of size res and position x,y to a color index.
def SetPixel(x=0,y=0,c=0):
    for rx in range(res):
        for ry in range(res):
            window.set_pixel(x*res+rx, y*res+ry, c)

# Define the scene
physicsObjects = [Projectile(Point(0,0,0), 0, 0, Point(0,0,0))]
physicsObjects.remove_at(0)# I have to give lists a starting value because makecode.
child = Child(Point(55,25,15), 35, 20, 6)

objects = [Sphere(Point(0,25,10), 20, 0),
           child,
           Plane(Point(0,-1,0), 35, 2)]
objectsLength = len(objects)

focalLength = 25
camera = Point(0,0,-focalLength)
#lightDir = Normalize(Point(1,-1,0))
lightDir = Normalize(Point(0.5,-1,-0.5))

window = image.create(SizeX, SizeY)
window.fill_rect(0, 0, SizeX, SizeY, 0)
scene.set_background_image(window)

# Draw the scene
#def OldDraw():
#    window.fill_rect(0, 0, SizeX, SizeY, 8)
#    for x in range(SizeX//res):
#        for y in range(SizeY//res):
## Start the actual ray marching for every pixel on screen
#            i = 0
#            done = False
#            CurrentPosition = Point(camera.x + (x*res) - SizeX/2,camera.y + (y*res) - SizeY/2, camera.z+focalLength)
#            dist = 1
#            while not done:
#                d = GetWorldDistance(CurrentPosition)
#                dist += d
#                if i > 4:
#                    done = True
#                i += 1
#                if d <= 0:
#                    done = True
#                    normal = GetNormal(CurrentPosition)
#                    DiffuseLight = max(0, DotProduct(normal, lightDir)) # Diffuse lighting
#                    color = GetPointColor(CurrentPosition)
#                    SetPixel(x,y, GetColor(x,y, color,DiffuseLight))
#                else:
#                    CurrentPosition = PointAlongLine(camera, CurrentPosition, dist)
#    scene.set_background_image(window)

def Draw():
    window.fill_rect(0, 0, SizeX, SizeY, 8)
    for x in range(SizeX//res):
        for y in range(SizeY//res):
# Start the actual ray marching for every pixel on screen
            hit, hx,hy,hz = ray(Point(camera.x + (x*res) - SizeX/2,camera.y + (y*res) - SizeY/2, camera.z+focalLength),camera)
            if hit == 1:
                HitPosition = Point(hx,hy,hz)
                normal = GetNormal(HitPosition)
                
                DiffuseLight = max(0, DotProduct(normal, lightDir)) # Diffuse lighting

                color = GetPointColor(HitPosition)

                SetPixel(x,y, GetColor(x,y, color,DiffuseLight))

    scene.set_background_image(window)

# Draw the scene
Draw()

# Define a demo mode in which a preprepared scene is loaded and the resolution is set to max
def demoMode():
    window.fill_rect(0, 0, SizeX, SizeY, 0)
    scene.set_background_image(window)
    if res == 1:
        game.reset()
    global objects
    toDestroy = []
    for i in range(len(physicsObjects)):
        toDestroy.append(i)
    for r in toDestroy:
        physicsObjects.remove_at(r)
        objects.remove_at(r+objectsLength)
    
    capsule = Child(Point(55,25,15), 35, 20, 6)
    objects = [Sphere(Point(0,0,20), 40, 0),
               Sphere(Point(-55,25,5), 25, 1),
               capsule,#Capsule(Point(55,25,15), Point(55,60,15), 20, 6),
               Plane(Point(0,-1,0), 35, 2)]
    
    global camera
    camera = Point(0,0,-focalLength)
    global lightDir
    lightDir = Normalize(Point(0.5,-1,-0.5))
    global CanShoot
    CanShoot = False
    global res
    res = 1
    game.show_long_text("Entering demo mode, press B to exit.", DialogLayout.BOTTOM)
    Draw()

# Button input, uses both pressed and repeated so you can press or hold the buttons
def on_up_pressed():
    if camera.y > -30:
        camera.y -= 15/res
controller.up.on_event(ControllerButtonEvent.PRESSED, on_up_pressed)
controller.up.on_event(ControllerButtonEvent.REPEATED, on_up_pressed)

def on_down_pressed():
    if camera.y < 30:
        camera.y += 15/res
controller.down.on_event(ControllerButtonEvent.PRESSED, on_down_pressed)
controller.down.on_event(ControllerButtonEvent.REPEATED, on_down_pressed)

def on_left_pressed():
    if camera.x > -SizeX/2:
        camera.x -= 15/res
controller.left.on_event(ControllerButtonEvent.PRESSED, on_left_pressed)
controller.left.on_event(ControllerButtonEvent.REPEATED, on_left_pressed)

def on_right_pressed():
    if camera.x < SizeX/2:
        camera.x += 15/res
controller.right.on_event(ControllerButtonEvent.PRESSED, on_right_pressed)
controller.right.on_event(ControllerButtonEvent.REPEATED, on_right_pressed)

def on_a_pressed():
    global CanShoot
    if len(physicsObjects) < 5 and CanShoot:
        CanShoot = False
        physicsObjects.append(Projectile(Point(camera.x,camera.y,camera.z+focalLength), 20, 4, Point(0,0,2)))
        objects.append(physicsObjects[len(physicsObjects)-1])
        music.play(music.melody_playable(music.pew_pew), music.PlaybackMode.UNTIL_DONE)
        pause(100)
        CanShoot = True
controller.A.on_event(ControllerButtonEvent.PRESSED, on_a_pressed)

def on_b_pressed():
    demoMode()
controller.B.on_event(ControllerButtonEvent.PRESSED, on_b_pressed)


#frames = 0
def on_forever():
    #global frames
    global lightDir
    lightDir = Point(Math.sin(game.runtime()/2000),-1,Math.cos(game.runtime()/2000))
    
    if res == 1:
        Draw()
        return

    toDestroy = []
    hit = False
    for i in range(len(physicsObjects)):
        shouldDestroy = physicsObjects[i].update()
        if shouldDestroy:
            toDestroy.append(i)
        if not hit:
            hit = physicsObjects[i].checkCollision(child)
    
    for r in toDestroy:
        physicsObjects.remove_at(r)
        objects.remove_at(r+objectsLength)
    
    if hit:
        child.color = randint(1,6)
        child.point = Point(randint(-SizeX/2, SizeX/2),randint(20,30),15)
        info.change_score_by(1)
    
    Draw()
    #fps = frames/game.runtime()*1000
    #print(fps)
    #info.set_score(Math.round(fps))
    #frames = frames+1
forever(on_forever)
