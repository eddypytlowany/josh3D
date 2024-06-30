
import { LinearToneMapping, SRGBColorSpace } from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import Three from '../core/Three';

export class ThreeGLTF extends Three {

    constructor(el, config = {}) {

        super(el, config);

        this.renderer.outputColorSpace          = SRGBColorSpace
        this.renderer.toneMapping               = LinearToneMapping;
        this.renderer.toneMappingExposure       = 1;

    }

    resetCamera() {

        if(this.cameras?.length) {

            [this.camera] = this.cameras;

            this.updateCamera();

        } else {

            void super.resetCamera();

        }

        return this.camera;

    }

    load(src) {

        const loader = new GLTFLoader();

        return new Promise( resolve => void loader.load(src, gltf => {

            this.cameras = gltf.cameras.slice();

            this.scene.add(gltf.scene);

            resolve(gltf);

        } ) );

    }

}

export default ThreeGLTF;