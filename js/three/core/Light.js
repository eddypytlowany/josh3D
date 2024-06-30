
import Prop from './Prop';

class Light extends Prop {

    constructor() {

        super(...arguments);

        this.controls.intensity = arguments[1].intensity;

    }

    addController(controller, prop) {

        switch(prop) {

            case 'intensity' :

                controller(0, 2, .1);

                break;
                
            default :

                super.addController(...arguments);

        }

    }

}

export default Light;