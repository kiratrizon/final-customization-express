class LoadModel {
    static init(model) {
        const Model = require(`../../models/${model}`);
        return Model;
    }
}

module.exports = LoadModel;