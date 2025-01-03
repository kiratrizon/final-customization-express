const LoadModel = require("../../../libraries/Materials/LoadModel");
const ConstructorController = require("./ConstructorController");
class BaseController extends ConstructorController {
    loadModel(models) {
        if (Array.isArray(models)) {
            models.forEach((modelName) => {
                const ModelClass = LoadModel.init(modelName);
                if (!this[modelName]) {
                    this[modelName] = ModelClass;
                } else {
                    console.warn(`Model ${modelName} is already loaded`);
                }
            });
        }
    }
}

module.exports = BaseController;
