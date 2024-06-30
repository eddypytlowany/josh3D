
import { Vector2, OrthographicCamera } from "three";
import Three from "../core/Three";

export class Three2D extends Three {

    updateCamera() {

        const size = new Vector2;

        if(this.camera) {

            this.renderer.getSize(size);

            this.camera.left    = size.x/-2;
            this.camera.right   = size.x/2;
            this.camera.top     = size.y/2;
            this.camera.bottom  = size.y/-2;

            super.updateCamera();

        }

    }

    resetCamera() {
        
        this.camera = new OrthographicCamera();

        this.updateCamera();

        this.camera.lookAt(this.scenePosition);

        return this.camera;

    }

    fitObject(name, width, height) {

        const obj   = this.scene.getObjectByName(name);
        const size  = new Vector2;

        this.renderer.getSize(size);

        size.y = Math.max(height * size.x/width, size.y);
        size.x = width * size.y/height;
        
        obj.scale.set(size.x, size.y);
        obj.position.set(size.x/2, size.y/2);

    }

}

export default Three2D;
