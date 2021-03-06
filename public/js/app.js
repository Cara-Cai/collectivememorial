import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';

var socket = io.connect();

socket.on('connect', function () {
    console.log("Connected");
});

socket.on('memo', function (file) {
    if (circle === undefined) {
        return
    }

    let geo = new THREE.SphereGeometry(15, 32, 16); // (radius, widthSegments, heightSegments)

    let mate = new THREE.MeshPhongMaterial({
        color: "#b0ceff",
        shading: THREE.FlatShading
    });


    // Memo
    let memo = new THREE.Mesh(geo, mate);

    // Create & Set Memo ID
    let thisMemoId = `memo_${globalMemoIdCounter++}` // Use id and increase counter

    // Other Memo Properties
    // memo.position.set(100 + Math.floor(Math.random() * 150), Math.floor(Math.random() * 200), 150 + Math.floor(Math.random() * 30))
    memo.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    memo.position.multiplyScalar(100 + (Math.random() * 300));
    circle.add(memo)
    memo.name = thisMemoId;

    // Create text 
    const newDiv = document.createElement("div");

    let textValue = file.memocontent;
    let userName = file.username;
    const newContent = document.createTextNode(textValue); 
    const newName = document.createTextNode(userName);

    //Fix - 换行
    let linebreak = document.createElement("br");

    newDiv.appendChild(newName);
    newDiv.append(linebreak);
    newDiv.appendChild(newContent);

    newDiv.id = thisMemoId;
    newDiv.className = `memo hidden`

    // add the newly created element and its content into the DOM
    const textDiv = document.getElementById("memos");
    textDiv.appendChild(newDiv);
});


// global variable
let scene;
let camera;
let renderer;
let circle;
let skelet;
let particle;
let raycaster;
let pointer;
var globalMemoIdCounter = 0;
let INTERSECTED;

// main function
function init() {
    // create scene
    scene = new THREE.Scene();

    // create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0.0);
    document.getElementById('canvas').appendChild(renderer.domElement);

    // Update mouse location
    document.addEventListener( 'mousemove', onPointerMove );
    // document.getElementById('canvas').addEventListener('mousemove', hoverPieces)


    // camera setup
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 800;

    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    const controls = new OrbitControls( camera, renderer.domElement );
    camera.position.z = 500;
    controls.update();
    scene.add(camera);


    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();


    // 3d object
    circle = new THREE.Object3D();
    skelet = new THREE.Object3D();
    particle = new THREE.Object3D();

    scene.add(circle);
    scene.add(skelet);
    scene.add(particle);


    // adding geometry
    let geometry = new THREE.TetrahedronGeometry(2, 1);
    let geomet = new THREE.IcosahedronGeometry(7, 1);
    let geomet2 = new THREE.IcosahedronGeometry(15, 4);

    // adding material
    let material = new THREE.MeshPhongMaterial({
        color: 0xffff00, 
        shading: THREE.FlatShading

    });

    let mat = new THREE.MeshPhongMaterial({
        color: 0x000000,
        side: THREE.DobuleSide,
        wireframe: true
    });


    var x = document.getElementById("username");
    var y = document.getElementById("memocontent");
    var z = document.getElementById("button");
    var k = document.getElementById("button2");

    //Button: AddMemo
    button.addEventListener('click', function () {
        let textValue = document.getElementsByName("message")[0].value;
        socket.emit('memo', { username: username.value, memocontent: textValue });
        
    })

    //addnew
    addNew.addEventListener('click', function(){
        x.style.display = "block";
        y.style.display = "block";
        z.style.display = "block";
        k.style.display = "block";
    })
    
    //closewindow
    button2.addEventListener('click', function(){
        x.style.display = "none";
        y.style.display = "none";
        z.style.display = "none";
        k.style.display = "none";
    })
    


    // create particle  
    for (let i = 0; i < 1000; i++) {
        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        mesh.position.multiplyScalar(90 + (Math.random() * 700));
        mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
        particle.add(mesh);
    }

    // inner planet
    let innerPlanet = new THREE.Mesh(geomet, material);
    innerPlanet.scale.x = innerPlanet.scale.y = innerPlanet.scale.z = 16;
    circle.add(innerPlanet);

    // outer planet
    let outerPlanet = new THREE.Mesh(geomet2, mat);
    outerPlanet.scale.x = outerPlanet.scale.y = outerPlanet.scale.z = 10;
    skelet.add(outerPlanet);

    // ambient light
    let ambientLight = new THREE.AmbientLight(0x999999);
    scene.add(ambientLight);

    // directional light
    let dLight = [];
    dLight[0] = new THREE.DirectionalLight(0xffff00, 1);
    dLight[0].position.set(1, 0, 0);
    dLight[1] = new THREE.DirectionalLight(0x00dbde, 1);
    dLight[1].position.set(0.75, 1, 0.5);
    dLight[2] = new THREE.DirectionalLight(0xfc00ff, 1);
    dLight[2].position.set(-0.75, -1, 0.5);
    scene.add(dLight[0]);
    scene.add(dLight[1]);
    scene.add(dLight[2]);

    animate();
    window.addEventListener('resize', onWindowResize, false);

}


    

function animate() {
    requestAnimationFrame(animate);

    particle.rotation.x += 0.0000;
    particle.rotation.y -= 0.0020;
    particle.rotation.z -= 0.0010;

    // circle.rotation.x -= 0.0030;
    circle.rotation.y -= 0.0020;

    skelet.rotation.x += 0.0030;
    skelet.rotation.y += 0.0030;

    // controls.update();
    hoverPieces();
    renderer.render(scene, camera);

}


function onPointerMove( event ) {

    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function hoverPieces() {


    raycaster.setFromCamera(pointer, camera);

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(circle.children, false);


    if ( intersects.length > 0 ) {
        if ( INTERSECTED != intersects[ 0 ].object ) {
            let thisMemo_id = intersects[0].object.name
            let thisMemo = document.getElementById(thisMemo_id)

            if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

            INTERSECTED = intersects[0].object;
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
            INTERSECTED.material.color.setHex( 0xffff00 );
           
            let allMemos = Array.from(document.getElementsByClassName("memo"))

            for (let memo of allMemos) {
                memo.style.visibility = "hidden";
            }

            thisMemo.style.visibility = "visible";
          

            // setTimeout(() => {
            //     thisMemo.style.visibility = "hidden" 

            // }, 15000)

        }

    } else {
        if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
        INTERSECTED=null;
    }


}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// window.addEventListener( 'pointermove', hoverPieces);
window.onload = init;



