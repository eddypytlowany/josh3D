/*
TODO What are normals in 3D?
*/

import media from 'phat-kitty-js/media-query'; // This is a library provided by my Webpack config which allows for easier management of events triggered when the viewport size changes.
import RapierGUI from './js/three/gui/RapierGUI';
import ThreeGLTF from 'js/three/renderer/threeGLTF';
import sync from 'framesync';
import GUI from './js/three/core/GUI';
import { getObjectBoundingBox } from './js/three/utils';
import { initThree } from "js/three";
import { css } from '@emotion/css';
import { Mesh, PlaneGeometry, MeshBasicMaterial, Vector3, Raycaster, AmbientLight, Group } from "three";

const acceleration  = new Vector3; // Store the previous acceleration interval.
const canDragMesh   = {}; // Store objects that are currently draggable in the 3D scene.
const shakeEvent    = new Event('shake'); // Event to trigger on canvas element on device shake.
const raycaster     = new Raycaster;
const movement      = new Vector3; // The coordinates of the pointer relative to the position of the last pointermove event in normalised 3D space.
const gravity       = { x: 0, y: -30, z: 0 };
const canvas        = document.createElement('canvas');
const bgColor       = 0x152610;

// Intensity of the impulse applied to an object.
const impulseMultiplier = {
    name    : 'ImpulseMultiplier',
    value   : 800
};
const gravityForce      = {
    name    : 'GravityForce',
    value   : 30
};
// Number of shakes to register before triggering a 'shake' event.
const shakeTarget       = {
    name    : 'ShakeTarget',
    value   : 2
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
let axis    = [];

/**
 * Calculate current axis by determining whichever absolute value is greater and assume that is the current 'down' direction of the device.
 * Note: Rotation values are always relative to the devices portrait orientation.
 * 
 * @param {Number} gamma Rotation around the Y axis.
 * @param {Number} beta Rotation around the X axis.
 */
function createAxis(gamma, beta) {

    axis = Object.entries({ gamma, beta }).sort( (a, b) => Math.abs(a[1]) - Math.abs(b[1]) ).map( ([angle, value]) => {

        if(value) {

            value /= Math.abs(value);

        }

        return [angle, value];

    });

}

canvas.classList.add(css`
    width: 100vw;
    height: 100svh;
    visibility: hidden;
    touch-action: none; // This property is important to prevent the whole page from sliding around when dragging the pointer across the screen.
`);

document.body.appendChild(canvas);

window.addEventListener( 'deviceorientation', e => {

    // If axis is not yet set then create it.
    axis.length || createAxis(e.gamma, e.beta);

    Object.assign(gravity, {
        x : ( e[ axis[0][0] ] )/(axis[0][1] * -90) * gravityForce.value,
        y : Math.max(Math.min( e[ axis[1][0] ], 90 ), -90)/(axis[1][1] * -90) * gravityForce.value
    });

} );

// Using the resize event to assume there has been a change in the device's orientation and reset the world axis.
window.addEventListener('resize', () => {

    axis.length = 0;

});

window.addEventListener('devicemotion', e => {

    if( Math.max( Math.abs(e.acceleration.x - acceleration.x) + Math.abs(e.acceleration.y - acceleration.y) ) > shakeThreshold.value ) {

        // Set a timeout on first 'shake', user then has the shakeTarget.value times 1 second to reach the shake threshold.
        shake++ || setTimeout(shakeThreshold.reset, shakeTarget.value * 1000);

        if(shake >= shakeTarget.value) {

            shakeThreshold.trigger();

        }

    }

    acceleration.copy(e.acceleration);
    
});

initThree( new ThreeGLTF(canvas, { bgColor }), require('./monk.glb') ).then(async ({ gui, three, cancel, enableDevControls }) => {

    const letters           = new Group;
    const RAPIER            = await import('@dimforge/rapier3d');
    const size              = three.sceneSize; // Store initial scene size used to calculate the dimensions of world bounds relative to viewport size.
    const world             = new RAPIER.World(gravity);
    const boundsMaterial    = new MeshBasicMaterial({
        wireframe   : true,
        visible     : THREE_DEBUG,
        name        : 'BoundsWireframe'
    });

    letters.name = 'Letters';

    /**
     * For simplicity's sake, every object in the physics world is a cuboid.
     * 
     * @see https://rapier.rs/javascript3d/classes/World.html#createCollider 
     * @param {Mesh} mesh 
     * @param {RigidBody} rigidBody 
     * @returns Collider
     */
    function createCollider(mesh, rigidBody = undefined) {

        const size = new Vector3;

        mesh.userData.collider ??= world.createCollider(RAPIER.ColliderDesc.cuboid(), rigidBody);
  
        getObjectBoundingBox(mesh).getSize(size);

        size.multiplyScalar(.5);

        mesh.userData.collider.setHalfExtents(size);

        return mesh.userData.collider;

    }

    /**
     * @see https://rapier.rs/javascript3d/classes/World.html#createRigidBody
     * @param {Mesh} mesh 
     * @param {RigidBodyType} type 
     * @returns RigidBody
     */
    function createRigidBody(mesh, type = RAPIER.RigidBodyType.Dynamic) {

        const pos = new Vector3;

        mesh.userData.rigidBody ??= world.createRigidBody( new RAPIER.RigidBodyDesc(type) );

        mesh.getWorldPosition(pos);

        mesh.userData.rigidBody.setTranslation(pos);

        return mesh.userData.rigidBody;

    }

    /**
     * 
     * @param {String} ref 
     * @param {Float} x 
     * @param {Float} y 
     * @param {Array} coords 
     * @param {Array} euler Rotation of bound as an array of x y z radian values (PI is 180 in degress, PI/2 is 90 degress, etc.)
     * @returns Collider
     */
    function createBounds(ref, x, y, coords, euler) {

        const name  = 'Bnd_' + ref;
        // Create a mesh with a plane size of 1x1. This is so the plane dimensions can be easily scaled to the provided x and y values dynamically (i.e. on window resize event).
        const bound = three.scene.getObjectByName(name) || new Mesh(new PlaneGeometry(1, 1), boundsMaterial);

        bound.name = name;

        bound.scale.set(x, y, 1);
        bound.position.fromArray(coords);
        bound.rotation.fromArray(euler);

        three.scene.add(bound);

        createCollider( bound, createRigidBody(bound, RAPIER.RigidBodyType.Fixed) );

    }

    /**
     * 
     * @param {RigidBody} body 
     */
    function moveBody(body) {

        const vector = new Vector3();

        // Movement is calculated by the adding the body's current coordinates with the pointer's vector relative to the last movement event.
        vector.addVectors(body.translation(), movement);

        body.setTranslation(vector);
        body.sleep(); // Make sure physics does not affect the object's position while being manually moved.

    }

    /**
     * The function simulates a physics body being released from a pointer's 'grip'.
     * Impluse is applied as the value of the pointer movement speed multiplied by the impulseMultiplier's value.
     * 
     * @param {RigidBody} body 
     * @param {String} name 
     */
    function releaseBody(body, name) {

        const impulse = new Vector3();

        canDragMesh[name] = false;

        impulse.copy(movement);
        impulse.multiplyScalar(impulseMultiplier.value);
    
        /**
         * Uses the Euclidean length as a simple check if the pointer was moving fast enough to apply impulse to the body, otherwise just wakeup the physics body.
         * @see https://threejs.org/docs/index.html?q=Vector#api/en/math/Vector3.length
         */
        impulse.length() ? body.applyImpulse(impulse, true) : body.wakeUp();
        
        movement.set(0, 0, 0);

    }
    
    /**
     * Since scale and position are all relative in a 3D space, the world bounds are calculated as 3/4th the size of initial scene size.
     * This make the letters take up 1/4 the viewport size after positioning the camera to the edges of the world bounds.
     */
    media.on('0', () => {

        width   = (size.x * 4) * Math.min(innerWidth/innerHeight, 1);
        height  = innerHeight/innerWidth * width;

        createBounds('ZP', width, height, [0, 0, -1], [0, 0, 0]);
        createBounds('ZN', width, height, [0, 0, size.z], [0, Math.PI, 0]);
        createBounds('YP', width, size.z + 1, [0, height/-2, size.z/2 - .5], [Math.PI/-2, 0, 0]);
        createBounds('YN', width, size.z + 1, [0, height/2, size.z/2 - .5], [Math.PI/2, 0, 0]);
        createBounds('XP', size.z + 1, height, [width/-2, 0, .75], [0, Math.PI/2, 0]);
        createBounds('XN', size.z + 1, height, [width/2, 0, .75], [0, Math.PI/-2, 0]);

    });

    ['M', 'O', 'N', 'K'].forEach(name => {

        const letter    = three.scene.getObjectByName(name);
        const body      = createRigidBody(letter);
        const reset     = letter.position.clone();

        body.enableCcd(true);

        createCollider(letter, body);

        // Make sure body is subjected to physics computations whenever the orientation of the device is changd.
        window.addEventListener( 'deviceorientation', () => body.isSleeping() && body.wakeUp() );

        // Check if the current mesh is being manually dragged and release the body from the pointer's 'grip'.
        canvas.addEventListener( 'pointerup', () => canDragMesh[name] && releaseBody(body, name) );

        letters.add(letter);

        /**
         * Reset's the position of the letter to its starting point whenever the viewport size changes.
         * This is a simplified way of making sure the position of the mesh does not affect the scene size when re-calculating the world bounds.
         */
        media.on( '0', () => void body.setTranslation(reset) );

        sync.update( () => {

            letter.position.copy( body.translation() );
            letter.quaternion.copy( body.rotation() );

            // If current mesh is draggable then update its translation based on pointer movement.
            canDragMesh[name] && moveBody(body);

        }, true );

        /**
         * On 'shake' event, inverse the body's current position and multiply it by half the value of the impulseMultiplier to make the letter fly to the center of the screen.
         */
        canvas.addEventListener('shake', () => {

            const shake = new Vector3;

            letter.getWorldPosition(shake);

            shake.multiplyScalar(impulseMultiplier.value/-2);

            body.applyImpulse(shake, true);

        });

    });

    three.scene.add(letters);
    three.addLight(new AmbientLight);

    sync.read( () => void world.step(), true );

    /* Make sure the letter's don't affect the scene size when calculating the camera's position. */
    media.on( '0', () => {

        three.scene.remove(letters);
        three.resetCamera();
        three.scene.add(letters);

    } )

    canvas.classList.add('visible');
    
    // Simple permissions check to access the device's sensors
    canvas.addEventListener( 'click', () => void DeviceOrientationEvent.requestPermission?.().then(console.log).catch(console.error) );

    /**
     * The movement vector is calculated as the percentage of the scene's width and height that the pointer has traversed since the last pointermove event, 
     * relative to the pointer's translation across the viewport.
     */
    canvas.addEventListener( 'pointermove', e => void movement.set(width * e.movementX/canvas.clientWidth, height * -e.movementY/canvas.clientHeight) );

    /**
     * Determin if the pointer is intersecting with target letter in 3D space and mark the mesh as draggable.
     */
    canvas.addEventListener( 'pointerdown', ({ pointerId, offsetX, offsetY }) => {

        const pointer = new Vector3;

        canvas.setPointerCapture(pointerId);

        /**
         * Calculate pointer position in normalized device coordinates (-1 to +1) for both components
         * @see https://threejs.org/docs/index.html#api/en/core/Raycaster
         */
        pointer.set(offsetX / canvas.clientWidth * 2 - 1, -offsetY / canvas.clientHeight * 2 + 1);

        sync.postRender( () => {

            raycaster.setFromCamera(pointer, three.camera);
            raycaster.intersectObjects(letters.children).forEach(({ object }) => {

                canDragMesh[object.name] = true;

            });

        } );

    } );

    if(THREE_DEBUG) {

        new RapierGUI(three, world).addTo(gui);

        new GUI(three, boundsMaterial, ['visible']).addTo(gui);
        new GUI(three, impulseMultiplier).addTo(gui);
        new GUI(three, gravityForce).addTo(gui);
        new GUI(three, shakeTarget).addTo(gui);
        new GUI(three, shakeThreshold, ['value', 'trigger']).addTo(gui);

        enableDevControls?.();

        module.hot.accept( 'js/three', () => void cancel() );

    }

});