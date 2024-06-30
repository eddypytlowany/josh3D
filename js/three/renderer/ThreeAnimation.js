
import { AnimationMixer } from "three";
import ThreeGLTF from "./ThreeGLTF";

export class ThreeAnimation extends ThreeGLTF {

    constructor(el, config) {

        super(el, config);

        this.mixer = new AnimationMixer(this.scene);

    }

    get defaultConfig() {

        return Object.assign(super.defaultConfig, {
            autoplay : true
        });

    }

    async load(src) {

        const obj = await super.load(src);

        this.config.autoplay && obj.animations.forEach( clip => void this.mixer.clipAction(clip).play() );

        return obj;

    }

    render() {

        this.mixer.update( this.clock.getDelta() );

        super.render();

    }

}

export default ThreeAnimation;