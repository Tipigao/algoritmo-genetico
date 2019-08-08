var cena, camera;
var clock, time, controls, renderer;

function AprendeAndar() {
    var self = this;

    var criaPopulacao = function(qtd) {

        for (var i = 0; i < qtd; i++) {
            var geometry = new THREE.BoxGeometry(1, 1, 1);
            var material = new THREE.MeshBasicMaterial({ color: createRandomColor() });
            var cube = new THREE.Mesh(geometry, material);

            cube.position.x = getRandomArbitrary(-30, 30);
            cube.position.y = 0;
            cube.position.z = getRandomArbitrary(-30, 30);

            //         //cube.rotation.x += 0.01;
            //         //cube.rotation.y += 0.01;

            cena.add(cube);
        }

    };


    this.inicializaSimulacao = function() {
        Ammo().then(function(ammo) {
            criaCenario(ammo);
            criaPopulacao(200);
            animarCena();
        });
    };

    return this;
}

function Individuo() {

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

    var textureLoader = new THREE.TextureLoader();

    var ambientLight = new THREE.AmbientLight(0x404040);
    cena.add(ambientLight);

    //Chão
    var chao = new THREE.PlaneGeometry(32, 1, 15, 15);
    var material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
    var plane = new THREE.Mesh(chao, material);
    cena.add(plane);

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

function updatePhysics(deltaTime) {

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