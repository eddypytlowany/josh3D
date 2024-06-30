
import { SkeletonHelper } from "three";
import GUI from "../core/GUI";

class SkeletonHelperGUI extends GUI {

    controls = {

        visible : true

    }

    constructor(three, ...args) {

        super(three, new SkeletonHelper(three.scene), ...args);

    }

}

export default SkeletonHelperGUI;