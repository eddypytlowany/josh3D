
import { BufferGeometry, LineDashedMaterial, Vector3, Color, Line, Group } from "three";
import GUI from "../core/GUI";
import sync, { cancelSync } from 'framesync';

class RapierGUI extends GUI {

    #group;

    controls = {
        debugRender : false
    };

    get name() {

        return 'Rapier';

    }

    constructor(three, ...args) {
        super(three, ...args);

        this.#group = new Group;

        this.#group.name = 'Rapier';
        
        three.scene.add(this.#group);

    }

    debugRender() {
        
        const process = sync.update( () => {

            const { vertices, colors } = this.object.debugRender();

            if(this.controls.debugRender) {

                for(let i = 0; i < vertices.length/6; i++) {
    
                    const material  = new LineDashedMaterial;
                    const geometry  = new BufferGeometry;
                    const points    = [];
                    const point     = () => vertices[vertexOffset++];
                    const color     = () => colors[colorOffset++];
                    const line      = new Line(geometry, material);
        
                    let vertexOffset    = i * 6;
                    let colorOffset     = i * 8;
        
                    material.color = new Color( color(), color(), color() );
        
                    line.onAfterRender = () => void line.removeFromParent();
        
                    points.push( new Vector3( point(), point(), point() ) );
                    points.push( new Vector3( point(), point(), point() ) );
        
                    geometry.setFromPoints(points);

                    this.#group.add(line);
        
                }

            } else {

                cancelSync.update(process);

            }
    
        }, true );

    }

    update(prop, value) {

        switch(prop) {

            case 'debugRender' :

                this.debugRender();

                break;

            default :

                super.update(prop, value);

        }

    }

}

export default RapierGUI;