
import GUI from '../core/GUI';

class RendererGUI extends GUI {

    controls = {
        toneMappingExposure : 1,
        toneMapping         : THREE.LinearToneMapping
    }

    constructor(three, ...args) {

        super(three, three.renderer, ...args);

        this.controls.toneMappingExposure = three.renderer.toneMappingExposure;
        this.controls.toneMapping = three.renderer.toneMapping;

    }

    addController(controller, prop) {

        switch(prop) {

            case 'toneMappingExposure'  :

                const current   = Math.abs(this.controls.toneMappingExposure);
                const range     = 3 * current;

                controller(this.controls.toneMappingExposure - range, this.controls.toneMappingExposure + range, current/10);

                break;

            case 'toneMapping'          :

                controller({
                    'NoToneMapping'         : THREE.NoToneMapping,
                    'LinearToneMapping'     : THREE.LinearToneMapping,
                    'ReinhardToneMapping'   : THREE.ReinhardToneMapping,
                    'CineonToneMapping'     : THREE.CineonToneMapping,
                    'ACESFilmicToneMapping' : THREE.ACESFilmicToneMapping
                });

                break;

        }

    }

}

export default RendererGUI;