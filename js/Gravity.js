
const xR = {
    360 : 'sin',
    180 : 'sin',
    90  : 'cos'
}

const yR = {
    360 : 'cos',
    180 : 'cos',
    90  : 'sin'
}

function deg2rad(value) {

    return value * Math.PI/180;

}

class Gravity {

    #yR     = 1;
    #up     = 1;
    #zUp    = {};
    #axis   = [];
    #roll   = 0;
    #dirX   = 1;
    #tilt   = 1;
    #pitch  = 90;

    force   = 30;

    get x() {

        return this.#dirX * this.#roll/90 * this.force;

    }

    get y() {

        return this.#tilt * this.#pitch/-90 * this.force;

    }

    get z() {

        return 0;

    }

    get axisY() {

        return this.#axis[1];

    }

    /**
     * 
     * @param {DeviceMotionEvent} e DeviceMotionEvent
     */
    parseDeviceMotionEvent(e) {

        this.#up    = Math.min(Math.floor(Math.abs(e.beta)/90), 1) || -1;
        this.#roll  = this.#getX(e);
        this.#tilt  = screen.orientation.angle % 180/90 * this.#up * e.gamma/Math.abs(e.gamma) * (Math.round(90/screen.orientation.angle) || -1) || e.beta/Math.abs(e.beta);
        this.#pitch = Math.min( Math.abs( this.#getY(e) ), 180 - this.#getY(e) );
        
    }

    clear() {

        this.#axis.length = 0;

    }

    /**
     * Calculate current axis by determining whichever absolute value is greater and assume that is the current 'down' direction of the device.
     * Note: Rotation values are always relative to the devices portrait orientation.
     * 
     * @param {Number} beta Rotation around the X axis. 
     * @param {Number} gamma Rotation around the Y axis.
     */
    createAxis(beta, gamma) {

        this.#axis = Object.entries({ gamma, beta }).sort( (a, b) => Math.abs(a[1]) - Math.abs(b[1]) ).map( axis => axis.shift() );

    }

    #getZ(e, axis) {

        this.#zUp[this.#up] ??= Math.round( (this.#yR * e.alpha)/90 ) * 90 || 360;

        this.#dirX = this.#up > 0 && this.#zUp[this.#up] === 360 ? -1 : 1;

        return Math.abs( Math[ axis[ this.#zUp[this.#up] ] ]( deg2rad(e.alpha) ) );

    }

    #getY(e) {

        this.#axis.length || this.createAxis(e.beta, e.gamma, e.alpha);

        this.#yR = this.#getZ(e, yR);

        return this.#yR * e[ this.#axis[1] ];

    }

    #getX(e) {

        this.#axis.length || this.createAxis(e.beta, e.gamma, e.alpha);
        
        return this.#getZ(e, xR) * e[ this.#axis[0] ];

    }

}

export default Gravity;