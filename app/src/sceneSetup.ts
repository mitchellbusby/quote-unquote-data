import { Scene, HemisphereLight, DirectionalLight, WebGLRenderer, OrthographicCamera } from "three";

const setUpRenderer = (
  canvas: HTMLCanvasElement,
  context: WebGLRenderingContext,
  canvasBoundingRect: any,
) => {
    const renderer = new WebGLRenderer({
        canvas,
        context
      });
      
    // Fix for retina
    renderer.setPixelRatio(2);
      
    renderer.setSize(canvasBoundingRect.width, canvasBoundingRect.height);

    return {
      renderer,
    }
}

const setLighting = (scene: Scene) => {
    const sunlight = 0xfdfbd3;
    var light = new HemisphereLight(sunlight, sunlight, 1);
    scene.add(light);
    
    var dirLight = new DirectionalLight(sunlight, 0.5);
    dirLight.position.multiplyScalar(500);
    dirLight.position.setX(150);
    scene.add(dirLight);
}

const setupCamera = (aspect: number, d: number, scene: any) => {
  const camera = new OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
  camera.position.set(20, 20, 20);
  camera.lookAt(scene.position);

  return {
    camera
  };
}

export {setLighting, setUpRenderer, setupCamera};
