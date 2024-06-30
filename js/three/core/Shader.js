
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

import GUI from './GUI';

class Shader extends GUI {

    constructor(three, shader, uniforms = {}) {

        super(three, new ShaderPass(shader), uniforms);

        this.setUniforms(uniforms);

    }

    get pass() {

        return this.object;

    }

    setUniforms(uniforms) {

        for(const prop in uniforms) {

            this.pass.uniforms[prop].value = uniforms[prop];

        }

    }

    update(prop, value) {

        this.setUniforms({
            [prop] : value
        });

    }

}

export default Shader;