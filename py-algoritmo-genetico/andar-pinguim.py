
#from pandac.PandaModules import loadPrcFileData
#loadPrcFileData('', 'load-display tinydisplay')
#loadPrcFileData('', 'bullet-solver-iterations 20')

import sys
import direct.directbase.DirectStart

from direct.showbase.DirectObject import DirectObject
from direct.showbase.InputStateGlobal import inputState

from panda3d.core import AmbientLight
from panda3d.core import DirectionalLight
from panda3d.core import Vec3
from panda3d.core import Vec4
from panda3d.core import Point3
from panda3d.core import TransformState
from panda3d.core import BitMask32

from panda3d.bullet import BulletWorld
from panda3d.bullet import BulletPlaneShape
from panda3d.bullet import BulletBoxShape
from panda3d.bullet import BulletRigidBodyNode
from panda3d.bullet import BulletDebugNode
from panda3d.bullet import BulletConeTwistConstraint

class Game(DirectObject):

  def __init__(self):
    base.setBackgroundColor(0.1, 0.1, 0.8, 1)
    base.setFrameRateMeter(True)

    base.cam.setPos(0, -40, 10)
    base.cam.lookAt(0, 0, 5)

    # Light
    alight = AmbientLight('ambientLight')
    alight.setColor(Vec4(0.5, 0.5, 0.5, 1))
    alightNP = render.attachNewNode(alight)

    dlight = DirectionalLight('directionalLight')
    dlight.setDirection(Vec3(1, 1, -1))
    dlight.setColor(Vec4(0.7, 0.7, 0.7, 1))
    dlightNP = render.attachNewNode(dlight)

    render.clearLight()
    render.setLight(alightNP)
    render.setLight(dlightNP)

    # Input
    self.accept('escape', self.doExit)
    self.accept('r', self.doReset)
    self.accept('f1', self.toggleWireframe)
    self.accept('f2', self.toggleTexture)
    self.accept('f3', self.toggleDebug)

    # Task
    taskMgr.add(self.update, 'updateWorld')

    # Physics
    self.setup()

  # _____HANDLER_____

  def doExit(self):
    self.cleanup()
    sys.exit(1)

  def doReset(self):
    self.cleanup()
    self.setup()

  def toggleWireframe(self):
    base.toggleWireframe()

  def toggleTexture(self):
    base.toggleTexture()

  def toggleDebug(self):
    if self.debugNP.isHidden():
      self.debugNP.show()
    else:
      self.debugNP.hide()

  # ____TASK___

  def update(self, task):
    dt = globalClock.getDt()

    self.world.doPhysics(dt, 20, 1.0/180.0)

    return task.cont

  def cleanup(self):
    self.world = None
    self.worldNP.removeNode()
    self.worldNP = None

  def setup(self):
    self.worldNP = render.attachNewNode('World')

    # World
    self.debugNP = self.worldNP.attachNewNode(BulletDebugNode('Debug'))
    self.debugNP.show()

    self.world = BulletWorld()
    self.world.setGravity(Vec3(0, 0, -9.81))
    self.world.setDebugNode(self.debugNP.node())

    # CHÃO
    shape = BulletPlaneShape(Vec3(0, 0, 1), 0)
    body = BulletRigidBodyNode('Ground')
    bodyNP = self.worldNP.attachNewNode(body)
    bodyNP.node().addShape(shape)
    bodyNP.setPos(0, 0, -1)
    bodyNP.setCollideMask(BitMask32.allOn())
    self.world.attachRigidBody(bodyNP.node())

    self.criaPopulacao(3)

  def criaPopulacao(self, qtd):
        
    shape = BulletBoxShape(Vec3(0.5, 0.5, 0.5))
 
    npA = self.worldNP.attachNewNode(BulletRigidBodyNode('A'))
    npA.node().setMass(1.0)
    npA.node().addShape(shape)
    npA.setPos(10, 0, 10)
    self.world.attachRigidBody(npA.node())
     
    npB = self.worldNP.attachNewNode(BulletRigidBodyNode('B'))
    npB.node().addShape(shape)
    npB.setPos(10, 0, 2)
    self.world.attachRigidBody(npB.node())
    
    frameA = TransformState.makePosHpr(Point3(0, 0, -5), Vec3(0, 0, -90))
    frameB = TransformState.makePosHpr(Point3(0, 0, 5), Vec3(0, 0, -90))
    
    swing1 = 60 # degrees
    swing2 = 36 # degrees
    twist = 120 # degrees
    
    cs = BulletConeTwistConstraint(npA.node(), npB.node(), frameA, frameB)
    cs.setDebugDrawSize(2.0)
    cs.setLimit(swing1, swing2, twist)
    self.world.attachConstraint(cs)
    
    return False
        
    vPos = 0
        
    for n in range(0, qtd):
      # TRONCO
      shape = BulletBoxShape(Vec3(0.5, 0.5, 0.5))

      tronco = self.worldNP.attachNewNode(BulletRigidBodyNode('Box'))
      tronco.node().setMass(1.0)
      tronco.node().addShape(shape)
      tronco.setPos(vPos + 2, 0.5, 3)
      tronco.setScale(2, 0.6, 4)
      tronco.setCollideMask(BitMask32.allOn())
      #self.boxNP.node().setDeactivationEnabled(False)

      self.world.attachRigidBody(tronco.node())
      
      visualNP = loader.loadModel('models/box.egg')
      visualNP.clearModelNodes()
      visualNP.reparentTo(tronco)
      frameA = TransformState.makePosHpr(Point3(0, 0, -2), Vec3(0, 0, 90))
          
      # PÉS
      shape = BulletBoxShape(Vec3(0.5, 1, 0.2))
      posicaoPes = [1, 2]
      for i in range(2):
        for j in range(1):
          x = i + posicaoPes[i] + vPos
          y = 0.0
          z = j
          pe = self.criaPe(shape, x, y, z)
          
          # Cone
          # frameB = TransformState.makePosHpr(Point3(-5, 0, 0), Vec3(0, 0, 0))

          # cone = BulletConeTwistConstraint(tronco, pe, frameA, frameB)
          # cone.setDebugDrawSize(2.0)
          # cone.setLimit(30, 45, 170, softness=1.0, bias=0.3, relaxation=8.0)
          # self.world.attachConstraint(cone)
      
      vPos = vPos + 4
          
  def criaPe(self, shape, x, y, z):
    body = BulletRigidBodyNode('Pe-%i-%i-%i' % (x, y, z))
    bodyNP = self.worldNP.attachNewNode(body)
    bodyNP.node().addShape(shape)
    bodyNP.node().setMass(1.0)
    bodyNP.node().setDeactivationEnabled(False)
    bodyNP.setPos(x, y, z)
    bodyNP.setCollideMask(BitMask32.allOn())

    self.world.attachRigidBody(bodyNP.node())

    #visNP = loader.loadModel('models/box.egg')
    visNP = loader.loadModel('models/retangulo1.obj')
    visNP.clearModelNodes()
    visNP.reparentTo(bodyNP)
    
    return bodyNP

game = Game()
run()

