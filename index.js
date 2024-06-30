
import ThreeGLTF from 'js/three/renderer/threeGLTF';
import sync from 'framesync';
import GUI from './js/three/core/GUI';
import { getObjectBoundingBox } from './js/three/utils';
import { initThree } from "js/three";
import { css } from '@emotion/css';
import { Mesh, PlaneGeometry, MeshBasicMaterial, Vector3, LineDashedMaterial, Line, BufferGeometry, Color } from "three";

const canvas    = document.createElement('canvas');
const config    = {
    bgColor : 0x152610
};

canvas.classList.add(css`
    width: 100vw;
    height: 100dvh;
`);

initThree( new ThreeGLTF(canvas, config), require('./monk.glb') ).then(async ({ gui, three, resize, enableDevControls }) => {

    const RAPIER            = await import('@dimforge/rapier3d');
    const size              = three.sceneSize;
    const width             = size.x * 4;
    const gravity           = { x: 0, y: -10, z: 0 };
    const world             = new RAPIER.World(gravity);
    const height            = innerHeight/innerWidth * width;
    const material          = new MeshBasicMaterial({
        wireframe   : true,
        visible     : false,
        name        : 'BoundsWireframe'
    });
    const materialGUI       = new GUI(three, material, {
        visible : material.visible
    });

    function createCollider(mesh, type = RAPIER.RigidBodyType.Dynamic) {

        const body  = new RAPIER.RigidBodyDesc(type);
        const size  = new Vector3;
        const pos   = new Vector3;
        // const rot   = new Quaternion;

        mesh.getWorldPosition(pos);
        // mesh.getWorldQuaternion(rot);
        getObjectBoundingBox(mesh).getSize(size);

        body.setTranslation(pos.x, pos.y, pos.z);

        return world.createCollider( RAPIER.ColliderDesc.cuboid(size.x/2, size.y/2, size.z/2), world.createRigidBody(body) );

    }

    function createBound(ref, x, y, coords, euler) {

        const bound = new Mesh(new PlaneGeometry(x, y), material);

        bound.name = 'Bnd_' + ref;

        bound.position.fromArray(coords);
        bound.rotation.fromArray(euler);

        three.addProp(bound);

        createCollider(bound, RAPIER.RigidBodyType.Fixed);

    }

    gui && materialGUI.addTo(gui);
    
    createBound('ZP', width, height, [0, 0, -1], [0, 0, 0]);
    createBound('ZN', width, height, [0, 0, size.z], [0, Math.PI, 0]);
    createBound('YP', width, size.z + 1, [0, height/-2, size.z/2 - .5], [Math.PI/-2, 0, 0]);
    createBound('YN', width, size.z + 1, [0, height/2, size.z/2 - .5], [Math.PI/2, 0, 0]);
    createBound('XP', size.z + 1, height, [width/-2, 0, .75], [0, Math.PI/2, 0]);
    createBound('XN', size.z + 1, height, [width/2, 0, .75], [0, Math.PI/-2, 0]);

    ['M', 'O', 'N', 'K'].forEach(name => {

        const letter    = three.scene.getObjectByName(name);
        const collider  = createCollider(letter);

        window.addEventListener( 'deviceorientation', () => collider.parent().isSleeping() && collider.parent().wakeUp() );

        sync.update( () => {

            letter.position.copy( collider.translation() );
            letter.quaternion.copy( collider.rotation() );

        }, true );

    });

    sync.update( () => {

        const { vertices, colors } = world.debugRender();

        for(let i = 0; i < vertices.length/6; i++) {

            const material  = new LineDashedMaterial;
            const geometry  = new BufferGeometry;
            const points    = [];
            const point     = () => vertices[vertexOffset++];
            const color     = () => colors[colorOffset++];
            const line      = new Line(geometry, material);

            let vertexOffset    = i * 6;
            let colorOffset     = i * 8;

            material.color = new Color( color(), color(), color() );

            line.onAfterRender = () => void line.removeFromParent();

            points.push( new Vector3( point(), point(), point() ) );
            points.push( new Vector3( point(), point(), point() ) );

            geometry.setFromPoints(points);

            three.scene.add(line);

        }

    } );

    sync.read( () => void world.step(), true );

    window.addEventListener('deviceorientation', ({ gamma, beta }) => {

        Object.assign(gravity, {
            x : Math.max(Math.min(beta, 90), -90)/90 * -30,
            y : gamma/90 * -30
        });

   });

    document.body.appendChild(canvas);

    resize();

    three.resetCamera();
    three.camera.translateZ(1.25);
    
    enableDevControls();

});