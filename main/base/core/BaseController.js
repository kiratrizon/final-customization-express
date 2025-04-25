const LoadModel = require("../../../libraries/Materials/LoadModel");
const ConstructorController = require("./ConstructorController");
class BaseController extends ConstructorController {
    loadModel(models) {
        if (is_array(models)) {
            models.forEach((modelName) => {
                const ModelClass = LoadModel.init(modelName);
                if (!this[modelName]) {
                    this[modelName] = ModelClass;
                } else {
                    console.warn(`Model ${modelName} is already loaded`);
                }
            });
        } else if (is_string(models)) {
            const ModelClass = LoadModel.init(models);
            if (!this[models]) {
                this[models] = ModelClass;
            } else {
                console.warn(`Model ${models} is already loaded`);
            }
        }
    }
}

module.exports = BaseController;
