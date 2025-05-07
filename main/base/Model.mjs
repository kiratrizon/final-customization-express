/** @type {typeof import('./core/BaseModel.mjs').default} */
const BaseModel = (await import('./core/BaseModel.mjs')).default;

class Model extends BaseModel {
    // your model properties and methods here
}

export default Model;