
import { EventDispatcher } from "three";

class GUI extends EventDispatcher {

    static button = () => void 0

    controls = {};

    constructor(three, object, controls = {}) {

        super();

        this.object = object;

        Object.assign(this.controls, controls);

        three.addEventListener( 'init.gui', ({ gui }) => this.addTo(gui) );

        THREE_DEBUG && window.ThreeInspector?.start(three);

    }

    get name() {

        return this.object.name || this.object.constructor.name;

    }

    addTo(gui) {

        const folder = gui.addFolder(this.name);

        for(const prop in this.controls) {

            const addDefaultController = (...args) => folder.add(this.controls, prop, ...args).onChange( this.update.bind(this, prop) );

            this.addController(addDefaultController, prop, folder);

        }

    }

    addController(addDefaultController) {

        addDefaultController();

    }

    update(prop, value) {

        if( typeof value === 'number' || !isNaN( parseFloat(value) ) && isFinite(value) ) {

            value = parseFloat(value);

        }

        if(typeof this.object[prop] === 'function') {

            this.object[prop].call(this, value);

        } else {

            this.object[prop] = value;

        }

    }

}

export default GUI;