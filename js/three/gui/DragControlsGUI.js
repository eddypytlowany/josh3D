
import { DragControls } from "three/examples/jsm/controls/DragControls.js";
import { BoxHelper } from 'three';
import GUI from "../core/GUI";

const box = new BoxHelper();

class DragControlsGUI extends GUI {

    controls = {
        enabled : true
    }

    constructor(three, ...args) {

        const controls = new DragControls([], three.camera, three.el);

        controls.addEventListener( 'drag', () => void box.update() );
        controls.addEventListener( 'hoveron', ({ object }) => void box.setFromObject(object) );

        document.addEventListener('keydown', ({ key, repeat }) => {

            if(!repeat) {

                switch(key) {

                    case 'd'    :

                        box.visible = true;

                        controls.setObjects( three.scene.getObjectsByProperty('isMesh', true) );
                        controls.activate();

                        break;

                    case 'r'    :

                        controls.mode = 'rotate';

                        break;

                }

            }

        });

        document.addEventListener('keyup', ({ key }) => {

            switch(key) {

                case 'd'    :

                    box.visible = false;

                    controls.deactivate();
                    box.dispose();

                    break;

                case 'r'    :

                    controls.mode = 'translate';

            }

        });

        controls.recursive = false;

        three.scene.add(box);

        super(three, controls, ...args);

    }

}

export default DragControlsGUI;