
import GUI from "./GUI";

class Prop extends GUI {

    constructor(three, prop) {

        super(...arguments);

        three.scene.add(prop);

    }

    get name() {

        return this.object.name || super.name;

    }

}

export default Prop;