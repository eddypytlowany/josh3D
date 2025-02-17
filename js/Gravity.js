
const xR = {
    360 : 'sin',
    180 : 'sin',
    90  : 'cos'
};

const yR = {
    360 : 'cos',
    180 : 'cos',
    90  : 'sin'
};

const xDir = {
    360 : [-1, 1],
    180 : [1, -1],
    90  : [1, -1]
};

function deg2rad(value) {

    return value * Math.PI/180;

}

class Gravity {

    #xR     = [0, 0];
    #up     = -1;
    #zUp    = [];
    #axis   = [];
    #roll   = 0;
    #tilt   = 1;
    #pitch  = 90;
    #setUpZ = 0;

    force   = 30;

    get x() {

        return (xDir[ this.#zUp[this.#up] ]?.[this.#up] ?? 1) * this.#roll * this.force;

    }

    get y() {

        return this.#tilt * this.#pitch/-90 * this.force;

    }

    get z() {

        return 0;

    }

    /**
     * 
     * @param {DeviceMotionEvent} e DeviceMotionEvent
     */
    parseDeviceMotionEvent(e) {

        const angle = screen.orientation.angle || 360;

        this.#up            = Math.min(Math.floor(Math.abs(e.beta)/90), 1);
        this.#roll          = this.#getX(e);

        /**
         * Normalise whether the screen is 'facing' the user or tilted the opposite direction.
         * Landscape rotation can always be reliably determined 
         */
        this.#tilt          = angle % 180/90 * (this.#up || -1) * Math.sign(e.gamma) * (Math.round(90/angle) || -1) || Math.sign(e.beta);
        this.#pitch         = Math.min( Math.abs( this.#getY(e) ), 180 - this.#getY(e) );

        this.#xR[this.#up]  = this.#getZ(e, xR);

        // console.clear();
        // console.log(this.#zUp[this.#up], this.#getZ(e, xR), e.alpha);

    }

    reset() {

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

    // #setUpZ(alpha) {

    //     this.#zUp[this.#up] = alpha - (90 * this.#xR[(this.#up + 1) % 2]);

    // }

    #getZ(e, axis) {

        let z = 1;

        if(!this.#zUp[this.#up]) {

            this.#setUpZ = 1;

        }

        switch(this.#setUpZ) {

            case 1 :

                this.#setUpZ = 0;

                this.#zUp[this.#up] = this.#zUp[(this.#up + 1) % 2] || 360;

                setTimeout( () => {

                    this.#setUpZ = 2;
        
                } );

                break;

            case 2 :

                this.#setUpZ = 0;

                this.#zUp[this.#up]   = Math.max(Math.round( ( e.alpha - (-90 * this.#xR[(this.#up + 1) % 2]) )/90 ), 0) * 90;
                this.#zUp[this.#up] ||= 360;

                break;

            default :

                z = Math[ axis[ this.#zUp[this.#up] ] ]( deg2rad(e.alpha) );

        }

        return z;

    }

    #getY(e) {

        this.#axis.length || this.createAxis(e.beta, e.gamma, e.alpha);

        return Math.abs( this.#getZ(e, yR) ) * e[ this.#axis[1] ];

    }

    #getX(e) {

        this.#axis.length || this.createAxis(e.beta, e.gamma, e.alpha);
        
        return this.#getZ(e, xR); // * Math.abs(e[ this.#axis[0] ])/90;

    }

}

export default Gravity;