var cena, camera, textureLoader;
var clock, time, controls, renderer;
// Physics variables
var gravityConstant = -9.8;
var collisionConfiguration;
var dispatcher;
var broadphase;
var solver;
var physicsWorld;
var rigidBodies = [];
var margin = 0.05;
var hinge;
var cloth;
var transformAux1;

function AprendeAndar() {
    var self = this;

    var criaPopulacao = function(qtd) {

        var px = 0;
        var pz = -6;
        for (var i = 0; i < qtd; i++) {
            // var geometry = new THREE.BoxGeometry(1, 1, 1);
            // var material = new THREE.MeshBasicMaterial({ color: createRandomColor() });
            // var cube = new THREE.Mesh(geometry, material);

            // cube.position.x = 0; //getRandomArbitrary(-20, 20);
            // cube.position.y = 0.5;
            // cube.position.z = pz; //getRandomArbitrary(-20, 20);


            // //         //cube.rotation.x += 0.01;
            // //         //cube.rotation.y += 0.01;

            criaIndividuo(px, 0.2, pz, createRandomColor());

            //pz += 1.5;
            px += 2;

            //cena.add(cube);
        }

    };


    this.inicializaSimulacao = function() {
        Ammo().then(function(ammo) {
            criaCenario(ammo);
            configuraFisica();
            criaObjetosCenario();
            criaPopulacao(40);
            animarCena();
        });
    };

    return this;
}

function Individuo() {

}

function criaIndividuo(x, y, z, cor) {
    var pos = new THREE.Vector3();
    var quat = new THREE.Quaternion();

    quat.set(0, 0, 0, 1);

    pos.set(x, y, z);
    var pe1 = criaParalelepipedo(0.5, 0.2, 0, 0.5, pos, quat, new THREE.MeshPhongMaterial({
        color: cor //0xFFFFFF
    }));

    pos.set(x + 1, y, z);
    var pe2 = criaParalelepipedo(0.5, 0.2, 0, 0.5, pos, quat, new THREE.MeshPhongMaterial({
        color: cor
    }));

    pos.set(x + 0.5, y + 1.2, z + 0.25);
    var tronco = criaParalelepipedo(1.5, 2, 0.5, 4, pos, quat, new THREE.MeshPhongMaterial({
        color: cor
    }));

    // var individuo = new THREE.Mesh(new THREE.BoxGeometry(x, y, z, 1, 2, 1), new THREE.MeshPhongMaterial({
    //     color: cor
    // }));

    // var shape = new Ammo.btBoxShape(new Ammo.btVector3(x * 0.5, y * 0.5, z * 0.5));
    // shape.setMargin(margin);

    // createRigidBody(individuo, shape, 0.1, pos, quat);

    pe1.castShadow = true;
    pe1.receiveShadow = true;

    pe2.castShadow = true;
    pe2.receiveShadow = true;

    tronco.castShadow = true;
    tronco.receiveShadow = true;
}

function criaCenario(ammo) {

    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 2000);

    cena = new THREE.Scene();

    camera.position.x = -12;
    camera.position.y = 7;
    camera.position.z = 4;

    controls = new THREE.OrbitControls(camera);
    controls.target.y = 2;

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xbfd1e5);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    textureLoader = new THREE.TextureLoader();

    var ambientLight = new THREE.AmbientLight(0x404040);
    cena.add(ambientLight);

    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-7, 10, 15);
    light.castShadow = true;

    var d = 10;
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;

    light.shadow.camera.near = 2;
    light.shadow.camera.far = 50;

    light.shadow.mapSize.x = 1024;
    light.shadow.mapSize.y = 1024;

    light.shadow.bias = -0.01;

    cena.add(light);

    document.body.appendChild(renderer.domElement);

    var onWindowResize = function() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

    }

    window.addEventListener('resize', onWindowResize, false);

}

function criaObjetosCenario() {
    //Chão
    var pos = new THREE.Vector3();
    var quat = new THREE.Quaternion();

    pos.set(0, -0.5, 0);
    quat.set(0, 0, 0, 1);
    var chao = criaParalelepipedo(120, 1, 40, 0, pos, quat, new THREE.MeshPhongMaterial({
        color: 0xFFFFFF
    }));

    chao.castShadow = true;
    chao.receiveShadow = true;
    textureLoader.load("../img/texturas/grid.png", function(texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(120, 40);
        chao.material.map = texture;
        chao.material.needsUpdate = true;
    });
}


function animarCena() {

    requestAnimationFrame(animarCena);

    render();
}

function render() {

    var deltaTime = clock.getDelta();

    updatePhysics(deltaTime);

    controls.update(deltaTime);

    renderer.render(cena, camera);

    time += deltaTime;

}

function configuraFisica() {

    // Physics configuration
    transformAux1 = new Ammo.btTransform();
    collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
    dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    broadphase = new Ammo.btDbvtBroadphase();
    solver = new Ammo.btSequentialImpulseConstraintSolver();
    softBodySolver = new Ammo.btDefaultSoftBodySolver();
    physicsWorld = new Ammo.btSoftRigidDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration, softBodySolver);
    physicsWorld.setGravity(new Ammo.btVector3(0, gravityConstant, 0));
    physicsWorld.getWorldInfo().set_m_gravity(new Ammo.btVector3(0, gravityConstant, 0));

}

function updatePhysics(deltaTime) {
    // Step world
    physicsWorld.stepSimulation(deltaTime, 10);

    // Update rigid bodies
    for (var i = 0, il = rigidBodies.length; i < il; i++) {
        var objThree = rigidBodies[i];
        var objPhys = objThree.userData.physicsBody;
        var ms = objPhys.getMotionState();
        if (ms) {

            ms.getWorldTransform(transformAux1);
            var p = transformAux1.getOrigin();
            var q = transformAux1.getRotation();
            objThree.position.set(p.x(), p.y(), p.z());
            objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());

        }
    }
}

function criaParalelepipedo(sx, sy, sz, mass, pos, quat, material) {

    var threeObject = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1), material);
    var shape = new Ammo.btBoxShape(new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5));
    shape.setMargin(margin);

    createRigidBody(threeObject, shape, mass, pos, quat);

    return threeObject;

}

function createRigidBody(threeObject, physicsShape, mass, pos, quat) {

    threeObject.position.copy(pos);
    threeObject.quaternion.copy(quat);

    var transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    var motionState = new Ammo.btDefaultMotionState(transform);

    var localInertia = new Ammo.btVector3(0, 0, 0);
    physicsShape.calculateLocalInertia(mass, localInertia);

    var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
    var body = new Ammo.btRigidBody(rbInfo);

    threeObject.userData.physicsBody = body;

    cena.add(threeObject);

    if (mass > 0) {
        rigidBodies.push(threeObject);

        // Disable deactivation
        body.setActivationState(4);
    }

    physicsWorld.addRigidBody(body);

}

//Fonte: http://kripken.github.io/ammo.js/examples/webgl_demo_softbody_cloth/index.html
function createRandomColor() {
    return Math.floor(Math.random() * (1 << 24));
}

/**
 * Fonte: https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}