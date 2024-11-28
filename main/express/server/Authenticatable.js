const Model = require("../../../models/Model");
const Hash = require("../../../libraries/Services/Hash");

class Authenticatable extends Model {

    async create(data){
        data['password'] = await Hash.make(data['password']);
        return await super.create(data);
    }
}

module.exports = Authenticatable;