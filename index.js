/*
TODO Apply random impulses to letters on shake event
TODO Toggle material colours on letters on shake event
TODO Determin direction of gravity based on orientation of viewport
TODO What are normals in 3D?
*/

import media from 'phat-kitty-js/media-query';
import RapierGUI from './js/three/gui/RapierGUI';
import ThreeGLTF from 'js/three/renderer/threeGLTF';
import sync from 'framesync';
import GUI from './js/three/core/GUI';
import { getObjectBoundingBox } from './js/three/utils';
import { initThree } from "js/three";
import { css } from '@emotion/css';
import { Mesh, PlaneGeometry, MeshBasicMaterial, Vector3, Raycaster, AmbientLight, Group } from "three";

const acceleration  = new Vector3;
const canDragMesh   = {};
const shakeEvent    = new Event('shake');
const raycaster     = new Raycaster;
const movement      = new Vector3;
const gravity       = { x: 0, y: 0, z: 0 };
const canvas        = document.createElement('canvas');
const config        = {
    bgColor : 0x152610
};

const impulseMultiplier = {
    name    : 'ImpulseMultiplier',
    value   : 800
};
const gravityForce      = {
    name    : 'GravityForce',
    value   : 30
};
const shakeThreshold    = {
    name    : 'ShakeThreshold',
    value   : 20,
    trigger() {

        canvas.dispatchEvent(shakeEvent);

        shakeThreshold.reset();

    },
    reset() {

        shake = 0;

    }
};

let width   = 0;
let height  = 0;
let shake   = 0;

canvas.classList.add(css`
    width: 100vw;
    height: 100svh;
    visibility: hidden;
    touch-action: none;
`);

document.body.appendChild(canvas);

window.addEventListener( 'deviceorientation', ({ gamma, beta }) => Object.assign(gravity, {
    y : Math.max(Math.min(beta, 90), -90)/-90 * gravityForce.value,
    x : gamma/90 * gravityForce.value
}) );

window.addEventListener('devicemotion', e => {

    if( ( Math.abs(e.acceleration.x - acceleration.x) + Math.abs(e.acceleration.y - acceleration.y) )/2 > shakeThreshold.value ) {

        shake++ || setTimeout(shakeThreshold.reset, 3000);

        if(shake >= 2) {

            shakeThreshold.trigger();

        }

    }

    acceleration.copy(e.acceleration);
    
});

initThree( new ThreeGLTF(canvas, config), require('./monk.glb') ).then(async ({ gui, three, cancel, enableDevControls }) => {

    const letters           = new Group;
    const RAPIER            = await import('@dimforge/rapier3d');
    const size              = three.sceneSize;
    const world             = new RAPIER.World(gravity);
    const material          = new MeshBasicMaterial({
        wireframe   : true,
        visible     : THREE_DEBUG,
        name        : 'BoundsWireframe'
    });

    letters.name = 'Letters';

    function createCollider(mesh, rigidBody = undefined) {

        const size = new Vector3;

        mesh.userData.collider ??= world.createCollider(RAPIER.ColliderDesc.cuboid(), rigidBody);
  
        getObjectBoundingBox(mesh).getSize(size);

        size.multiplyScalar(.5);

        mesh.userData.collider.setHalfExtents(size);

        return mesh.userData.collider;

    }

    function createRigidBody(mesh, type = RAPIER.RigidBodyType.Dynamic) {

        const pos = new Vector3;

        mesh.userData.rigidBody ??= world.createRigidBody( new RAPIER.RigidBodyDesc(type) );

        mesh.getWorldPosition(pos);

        mesh.userData.rigidBody.setTranslation(pos);

        return mesh.userData.rigidBody;

    }

    function createBound(ref, x, y, coords, euler) {

        const name  = 'Bnd_' + ref;
        const bound = three.scene.getObjectByName(name) || new Mesh(new PlaneGeometry(1, 1), material);

        bound.name = name;

        bound.scale.set(x, y, 1);
        bound.position.fromArray(coords);
        bound.rotation.fromArray(euler);

        three.scene.add(bound);

        createCollider( bound, createRigidBody(bound, RAPIER.RigidBodyType.Fixed) );

    }

    function moveBody(body) {

        const vector = new Vector3();

        vector.addVectors(body.translation(), movement);

        body.setTranslation(vector);
        body.sleep();

    }

    function releaseBody(body, name) {

        const impulse = new Vector3();

        canDragMesh[name] = false;

        impulse.copy(movement);
        impulse.multiplyScalar(impulseMultiplier.value);
    
        impulse.length() ? body.applyImpulse(impulse, true) : body.wakeUp();
        
        movement.set(0, 0, 0);

    }
    
    media.on('0', () => {

        width   = (size.x * 4) * Math.min(innerWidth/innerHeight, 1);
        height  = innerHeight/innerWidth * width;

        createBound('ZP', width, height, [0, 0, -1], [0, 0, 0]);
        createBound('ZN', width, height, [0, 0, size.z], [0, Math.PI, 0]);
        createBound('YP', width, size.z + 1, [0, height/-2, size.z/2 - .5], [Math.PI/-2, 0, 0]);
        createBound('YN', width, size.z + 1, [0, height/2, size.z/2 - .5], [Math.PI/2, 0, 0]);
        createBound('XP', size.z + 1, height, [width/-2, 0, .75], [0, Math.PI/2, 0]);
        createBound('XN', size.z + 1, height, [width/2, 0, .75], [0, Math.PI/-2, 0]);

    });

    ['M', 'O', 'N', 'K'].forEach(name => {

        const letter    = three.scene.getObjectByName(name);
        const body      = createRigidBody(letter);
        const reset     = letter.position.clone();

        body.enableCcd(true);

        createCollider(letter, body);

        window.addEventListener( 'deviceorientation', () => body.isSleeping() && body.wakeUp() );
        canvas.addEventListener( 'pointerup', () => canDragMesh[name] && releaseBody(body, name) );

        letters.add(letter);

        media.on( '0', () => void body.setTranslation(reset) );

        sync.update( () => {

            letter.position.copy( body.translation() );
            letter.quaternion.copy( body.rotation() );

            canDragMesh[name] && moveBody(body);

        }, true );

        canvas.addEventListener('shake', () => {

            const shake = new Vector3;

            letter.getWorldPosition(shake);

            shake.multiplyScalar(-1 * impulseMultiplier.value/2);

            body.applyImpulse(shake, true);

        });

    });

    three.scene.add(letters);
    three.addLight(new AmbientLight);

    sync.read( () => void world.step(), true );

    media.on( '0', () => {

        three.scene.remove(letters);

        three.resetCamera();

        three.scene.add(letters);

    } )

    canvas.classList.add('visible');
    
    canvas.addEventListener( 'click', () => void DeviceOrientationEvent.requestPermission?.().then(console.log).catch(console.error) );
    canvas.addEventListener( 'pointermove', e => void movement.set(width * e.movementX/canvas.clientWidth, height * -e.movementY/canvas.clientHeight) );
    canvas.addEventListener( 'pointerdown', e => {

        const pointer = new Vector3;

        canvas.setPointerCapture(e.pointerId);
        pointer.set(e.offsetX / canvas.clientWidth * 2 - 1, -e.offsetY / canvas.clientHeight * 2 + 1);

        sync.postRender( () => {

            raycaster.setFromCamera(pointer, three.camera);
            raycaster.intersectObjects(letters.children).forEach(({ object }) => {

                canDragMesh[object.name] = true;

            });

        } );

    } );

    if(THREE_DEBUG) {

        new RapierGUI(three, world).addTo(gui);

        new GUI(three, material, ['visible']).addTo(gui);
        new GUI(three, impulseMultiplier).addTo(gui);
        new GUI(three, gravityForce).addTo(gui);
        new GUI(three, shakeThreshold, ['value', 'trigger']).addTo(gui);

        enableDevControls?.();

        module.hot.accept( 'js/three', () => void cancel() );

    }

});