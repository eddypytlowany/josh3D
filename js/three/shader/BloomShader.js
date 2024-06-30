
import { Vector2 } from "three";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import media from 'phat-kitty-js/media-query';

export class BloomShader {

    constructor() {

        this.pass = new UnrealBloomPass();

        this.pass.threshold = .4;
        this.pass.strength  = .5;
        this.pass.radius    = 1.5;

        media.on('0', () => {

            this.pass.resolution = new Vector2(innerWidth, innerHeight);

        });

    }

}

export default BloomShader;
