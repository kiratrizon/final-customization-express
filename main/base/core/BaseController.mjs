import LoadModel from "../../../libraries/Materials/LoadModel.mjs";
import ConstructorController from "./ConstructorController.mjs";

class BaseController extends ConstructorController {
    loadModel(models) {
        if (is_array(models)) {
            models.forEach((modelName) => {
                const ModelClass = LoadModel.init(modelName);
                if (!isset(ModelClass)) {
                    console.warn(`Model ${modelName} not found`);
                    return;
                }
                if (!this[modelName]) {
                    this[modelName] = ModelClass;
                } else {
                    console.warn(`Model ${modelName} is already loaded`);
                }
            });
        } else if (is_string(models)) {
            const ModelClass = LoadModel.init(models);
            if (!isset(ModelClass)) {
                console.warn(`Model ${models} not found`);
                return;
            }
            if (!this[models]) {
                this[models] = ModelClass;
            } else {
                console.warn(`Model ${models} is already loaded`);
            }
        }
    }
}

export default BaseController;
