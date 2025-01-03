const Controller = require("../../main/base/Controller");

class UserDashboard extends Controller {
    // get
    index(){
        jsonResponse(route('user.index'));
    }
    // get
    create(){
        jsonResponse({message: "UserDashboard create"})
    }
    // post
    store(){
        jsonResponse({message: "UserDashboard store"});
    }
    // get
    show(id){
        jsonResponse({message: "UserDashboard show"})
    }
    // get
    edit(id){
        jsonResponse({get})
    }
    // put
    update(id){
        jsonResponse({message: "UserDashboard update"})
    }
    // delete
    destroy(id){
        jsonResponse({message: "UserDashboard destroy"})
    }
}

module.exports = UserDashboard;