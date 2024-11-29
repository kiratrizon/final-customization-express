const Carbon = require("../../../libraries/Materials/Carbon");
const QueryBuilder = require("../../../libraries/Materials/QueryBuilder");
const ConstructorModel = require("./ConstructorModel");

class BaseModel extends ConstructorModel {
    // static properties
    fillable = [];
    timestamp = true;
    
    static async create(data){
        const model = new this();
        let keys = Object.keys(data);
        keys.forEach(key => {
            if (!model.fillable.includes(key)){
                throw new Error(`Column ${key} is not fillable`);
            }
        });
        if (model.timestamp){
            data['created_at'] = Carbon.getDateTime();
            data['updated_at'] = Carbon.getDateTime();
        }
        const builder = new QueryBuilder(this);
        return await builder.create(data);
    }
    
    static async update(id, data){
        const model = new this();
        let keys = Object.keys(data);
        keys.forEach(key => {
            if (!model.fillable.includes(key)){
                throw new Error(`Column ${key} is not fillable`);
            }
        });
        if (model.timestamp){
            data['updated_at'] = Carbon.getDateTime();
        }
        const builder = new QueryBuilder(this);
        return await builder.update(id, data);
    }

    static async find(id){
        const builder = new QueryBuilder(this);
        return await builder.find(id);
    }

    static async findByEmail(email){
        const builder = new QueryBuilder(this);
        return await builder.findByEmail(email);
    }

    static async findAll(){
        const builder = new QueryBuilder(this);
        return await builder.findAll();
    }
}

module.exports = BaseModel;
