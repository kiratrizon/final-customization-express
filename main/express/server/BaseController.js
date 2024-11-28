const LoadModel = require("../../../libraries/Materials/LoadModel");
const ConstructorController = require("./ConstructorController");
class BaseController extends ConstructorController {
    constructor(){
        super();
    }
    loadModel(models) {
        if (Array.isArray(models)) {
            models.forEach((modelName) => {
                const ModelClass = LoadModel.init(modelName);
                this[modelName] = new ModelClass(); // Store instantiated model
            });
        }
    }
}

module.exports = BaseController;
