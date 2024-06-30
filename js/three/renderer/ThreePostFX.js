
import Worker from "worker-loader!../worker"
import Three from "../core/Three";
import sync from 'framesync';

export class ThreePostFX extends Three {

    #worker;

    constructor(el, config = {}) {

        super(el, config);

        this.buffer = this.el.cloneNode();

        this.#WorkerConstructor();

    }

    #WorkerConstructor() {

        this.#worker = new Worker();

        this.#worker.onmessage = ({ data }) => void sync.render( () => {

            const ctx = this.el.getContext('2d');

            this.buffer.getContext('2d').putImageData(data, 0, 0);
            
            ctx.clearRect(0, 0, this.el.width, this.el.height);
            ctx.drawImage(this.buffer, 0, 0, this.el.width, this.el.height);

        } );

    }

    setSize(width, height) {

        super.setSize(width, height);

        this.buffer.width = this.el.width * this.config.quality;
        this.buffer.height  = this.el.height * this.config.quality;

    }

    draw() {

        const ctx = this.buffer.getContext('2d');

        ctx.clearRect(0, 0, this.buffer.width, this.buffer.height);
        ctx.drawImage(this.renderer.domElement, 0, 0, this.buffer.width, this.buffer.height);
        
        this.#worker.postMessage( ctx.getImageData(0, 0, this.buffer.width, this.buffer.height) );

    }

}

export default ThreePostFX;