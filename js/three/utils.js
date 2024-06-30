
import { Box3, MathUtils } from 'three';

export function calcCameraOffset(camera, width, height) {

    let fov = camera.getEffectiveFOV() * Math.max(camera.getFilmHeight()/camera.getFilmWidth(), 1);

    if(width > height) {

        fov *= Math.max(camera.getFilmWidth()/camera.getFilmHeight(), 1);

    }

    return Math.ceil(Math.max(width, height)/2) / Math.tan( MathUtils.degToRad(fov/2) );

}

export function getObjectBoundingBox(obj) {

    const bounds = new Box3();

    obj.traverseVisible(child => {

        if(child.isMesh) {

            child.boundingBox || child.computeBoundingBox?.();

            bounds.expandByObject(child);

        }

    });

    return bounds;

}