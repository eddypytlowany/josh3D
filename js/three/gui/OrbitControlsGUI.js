
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import sync from 'framesync';
import GUI from '../core/GUI';

class OrbitControlsGUI extends GUI {

    controls = {
        reset       : GUI.button,
        saveState   : GUI.button
    }

    constructor(three, ...args) {

        const controls = new OrbitControls(three.camera, three.el);

        controls.enabled = false;

        super(three, controls, ...args);

        sync.update( () => this.controls.enabled && controls.update(), true) ;

        three.el.addEventListener( 'dblclick', () => void controls.reset() );

        document.addEventListener('keydown', ({ key }) => {

            switch(key) {

                case 'c'    :

                    controls.enabled = true;

                    break;

            }

        });

        document.addEventListener('keyup', ({ key }) => {

            if(document.activeElement === three.el) {

                switch(key) {

                    case 'c'    :

                        controls.enabled = false;

                        break;

                }

            }

        });

    }

}

export default OrbitControlsGUI;