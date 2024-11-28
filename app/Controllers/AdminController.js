const Carbon = require("../../libraries/Materials/Carbon");
const Validator = require("../../libraries/Services/Validator");
const Controller = require("./Controller");

class UserController extends Controller {
    constructor(){
        super();
        this.loadModel([
            // Load model here strings
            'User'
        ]);
    }
    async index(){
        json_response({"data":request, test:this.test()});
    }

    async create(){
        json_response({message: "UserController create"})
    }

    async store(){
        let validator = await Validator.make(post, {
            name: "required",
            email: "required|email|unique:users",
            password: "required|min:6|confirmed"
        });
        if (validator.fails()){
            return json_response({errors: validator.errors}, 400);
        }
        const user = await this.User.create(post);
        return json_response({user}, user?201:403);
    }

    async show(id){
        json_response({message: "UserController show"})
    }

    async edit(id){
        json_response({get})
    }

    async update(id){
        json_response({message: "UserController update"})
    }

    async destroy(id){
        json_response({message: "UserController destroy"})
    }
}

module.exports = UserController;