const path = require('path');

class LoadModel {
    static init(model) {
        const Model = require(path.join(base_path(), 'models', model));
        return Model;
    }
}

export default LoadModel;