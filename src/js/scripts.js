import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import * as YUKA from 'yuka'
import { BufferGeometry } from 'three'

const renderer = new THREE.WebGLRenderer()

renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

renderer.shadowMap.enabled = true

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xDADADA)

const camera = new THREE.PerspectiveCamera(
  45, 
  window.innerWidth/window.innerHeight,
  1,
  1000
)

camera.position.set(0, 20, 0);
camera.lookAt(scene.position);

const orbit = new OrbitControls(camera, renderer.domElement)

// const axesHelper = new THREE.AxesHelper(5)
// scene.add(axesHelper)

// const planeGeometry = new THREE.PlaneGeometry(30,30)
// const planeMaterial = new THREE.MeshStandardMaterial({ color : 0xFFFFFF, side: THREE.DoubleSide })
// const plane = new THREE.Mesh(planeGeometry, planeMaterial)
// scene.add(plane)
// plane.rotation.x = -.5 * Math.PI
// plane.receiveShadow = true

// const gridHelper = new THREE.GridHelper(30)
// scene.add(gridHelper)

const ambientLight = new THREE.AmbientLight(0xEFEFEF)
scene.add(ambientLight)

const vehicleGeometry = new THREE.ConeGeometry(.1,.5,8)
vehicleGeometry.rotateX(Math.PI * .5)
const vehicleMaterial = new THREE.MeshNormalMaterial()
const vehicleMesh = new THREE.Mesh(vehicleGeometry, vehicleMaterial)
vehicleMesh.matrixAutoUpdate = false
scene.add(vehicleMesh)

const vehicle = new YUKA.Vehicle()
vehicle.setRenderComponent(vehicleMesh, function(entity, renderComponent){
  renderComponent.matrix.copy(entity.worldMatrix)
})

const path = new YUKA.Path()
path.add( new YUKA.Vector3(-4, 0, 4))
path.add( new YUKA.Vector3(-6, 0, 0))
path.add( new YUKA.Vector3(-4, 0, -4))
path.add( new YUKA.Vector3(0, 0, 0))
path.add( new YUKA.Vector3(4, 0, -4))
path.add( new YUKA.Vector3(6, 0, 0))
path.add( new YUKA.Vector3(4, 0, 4))
path.add( new YUKA.Vector3(0, 0, 6))

path.loop = true

vehicle.position.copy(path.current())
const followPathBehaviour = new YUKA.FollowPathBehavior(path, .5)
vehicle.steering.add(followPathBehaviour)

const onPathBehavior = new YUKA.OnPathBehavior(path)
onPathBehavior.radius = .8
vehicle.steering.add(onPathBehavior)

const entityManager = new YUKA.EntityManager()
entityManager.add(vehicle)

const position = []
for (let i = 0; i < path._waypoints.length; i++) {
  const waypoint = path._waypoints[i]
  position.push(waypoint.x,waypoint.y,waypoint.z)
}

const lineGeometry = new THREE.BufferGeometry()
lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3))
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 })
const lines = new THREE.LineLoop(lineGeometry, lineMaterial)
scene.add(lines)

const time = new YUKA.Time()

function animate(){
  const delta = time.update().getDelta()
  entityManager.update(delta)
  renderer.render(scene, camera)
}

renderer.setAnimationLoop(animate)

window.addEventListener('resize', function(){
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const mousePosition = new THREE.Vector2()
window.addEventListener('mousemove', function(e){
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1
  mousePosition.y = - (e.clientY / window.innerHeight) * 2 + 1
})