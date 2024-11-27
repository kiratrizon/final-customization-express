const Controller = require("./Controller");

class AdminController extends Controller {
    constructor(){
        super();
        this.loadModel([
            // Load model here strings
        ]);
    }
    async index(){
        json({message: routes('admin.index')})
    }

    async create(){
        json({message: "AdminController create"})
    }

    async store(){
        json({message: "AdminController store"})
    }

    async show(id){
        json({message: "AdminController show"})
    }

    async edit(id){
        json({message: "AdminController edit"})
    }

    async update(id){
        json({message: "AdminController update"})
    }

    async destroy(id){
        json({message: "AdminController destroy"})
    }
}

module.exports = AdminController;