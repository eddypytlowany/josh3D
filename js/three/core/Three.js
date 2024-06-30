
import {
    PerspectiveCamera,
    EventDispatcher,
    WebGLRenderer,
    Object3D,
    Vector3,
    Color,
    Clock,
    Scene,
} from 'expose-loader?exposes=THREE!three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader';
import { calcCameraOffset, getObjectBoundingBox } from '../utils';
import Prop from './Prop';
import Light from './Light';

const clock = new Clock;

export class Three extends EventDispatcher {

    #target = null

    constructor(el, config = {}) {

        super();

        this.scene      = new Scene;
        this.center     = new Object3D;
        this.config     = Object.assign(this.defaultConfig, config);
        this.renderer   = new WebGLRenderer(this.rendererParams);
        this.composer   = new EffectComposer(this.renderer);

        this.renderer.debug = {
            checkShaderErrors : THREE_DEBUG
        };

        if(this.config.bgColor) {

            this.scene.background = new Color(this.config.bgColor);

        }

        this.setTarget(el);

    }

    get rendererParams() {

        return {
            antialias   : true,
            alpha       : true,
            canvas      : new OffscreenCanvas(0, 0)
        };

    }

    get defaultConfig() {

        return {
            scale               : 1,
            bgColor             : 0x00FF00,
            resetCameraOffset   : 1
        }

    }

    get scenePosition() {

        const position  = new Vector3;
        const bounds    = getObjectBoundingBox(this.scene);

        bounds.getCenter(position);

        return position;

    }

    get sceneSize() {

        const target = new Vector3;

        getObjectBoundingBox(this.scene).getSize(target);

        return target;

    }

    get clock() {

        return clock;

    }

    get el() {

        return this.#target;

    }

    setTarget(el) {

        this.#target = el;

    }

    setSize(width = 0, height = 0) {

        this.el.width   = width;
        this.el.height  = height;

        this.renderer.setSize(width, height, false);
        this.composer.setSize(width, height, false);

    }

    setScale(scale = 1) {

        this.config.scale = scale;

        this.setSize();

    }

    updateCamera() {

      if(this.camera) {

        this.camera.aspect = this.el.width/this.el.height;
        this.camera.updateProjectionMatrix();

      }

    }

    resetCamera() {
        
        this.camera ??= new PerspectiveCamera();

        this.updateCamera();

        // REF: Math.ceil( bounds.y/2 * Math.max(this.camera.getFilmHeight()/this.camera.getFilmWidth(), 1) )/Math.tan( Math.round(this.camera.fov/2) * (Math.PI/180) )
        this.camera.position.setZ(this.scenePosition.z + this.sceneSize.z/2 + calcCameraOffset(this.camera, this.sceneSize.x, this.sceneSize.y) * this.config.resetCameraOffset);
        this.camera.position.setY(this.scenePosition.y);
        this.camera.position.setX(this.scenePosition.x);
        this.camera.lookAt(this.scenePosition);

        return this.camera;

    }

    addProp(object, controls = {}) {

        return new Prop(this, object, controls);

    }

    addLight(object, controls = {}) {

        return new Light(this, object, controls);

    }

    compose(passes = []) {

        const renderPass    = new RenderPass(this.scene, this.camera);
        const copyPass      = new ShaderPass(CopyShader);

        copyPass.renderToScreen = true;

        this.composer.passes.length = 0;
        this.composer.reset();
        this.composer.addPass(renderPass);

        passes.forEach( ({ pass }) => void this.composer.addPass(pass) );

        this.composer.addPass(copyPass);

    }

    render() {

        this.composer.passes.forEach(pass => {

            if(pass.uniforms?.['time']) {

                pass.uniforms['time'].value = this.clock.getElapsedTime();

            }
            
        });

        this.composer.render( this.clock.getDelta() );

    }

    draw() {

        const ctx = this.el?.getContext('2d');

        if(ctx && this.el.width * this.el.height) {

            ctx.clearRect(0, 0, this.el.width, this.el.height);
            ctx.drawImage(this.renderer.domElement, 0, 0, this.el.width, this.el.height);

        }
        
    }

}

export default Three;