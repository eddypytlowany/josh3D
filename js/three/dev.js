
import * as dat from 'dat.gui';
import Stats from 'three/examples/jsm/libs/stats.module';
import sync, { cancelSync } from "framesync";
import { AxesHelper } from "three";
import { initThree as initThreeIndex } from "./index";
import RendererGUI from './gui/RendererGUI';
import OrbitControlsGUI from './gui/OrbitControlsGUI';
import DragControlsGUI from './gui/DragControlsGUI';
import ThreeInspector from './core/Inspector';

const stats = new Stats;
const gui   = new dat.GUI();

function onUpdate() {

    stats.update();

}

function initGUI(three) {

    const type = 'init.gui';

    three.dispatchEvent({ type, gui });

}

export function initThree(three, src) {

    return initThreeIndex(three, src).then(props => {

        const { three, cancel } = props;

        const axes = new AxesHelper( Math.ceil( Math.max(three.sceneSize.x, three.sceneSize.z) ) );

        function enableDevControls() {

            three.el.tabIndex = -1;

            new OrbitControlsGUI(three).addTo(gui);
            new DragControlsGUI(three).addTo(gui);

        }

        axes.name = 'Axes';
        
        three.scene.add(axes);

        new RendererGUI(three);

        initGUI(three);

        ThreeInspector.start(three);

        sync.update(onUpdate, true);
        
        return Object.assign(props, { gui, enableDevControls }, {
            cancel() {

                cancel();

                cancelSync.update(onUpdate);

            }
        });

    });

}

document.body.appendChild(stats.dom);