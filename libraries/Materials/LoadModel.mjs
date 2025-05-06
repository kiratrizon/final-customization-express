import path from 'path';
import { pathToFileURL } from 'url';

class LoadModel {
    static async init(model = '') {
        const filePath = path.join(basePath('models'), `${model}.mjs`);
        const Model = await import(pathToFileURL(filePath).href);
        return Model.default;
    }
}

export default LoadModel;