import Controller from "../../main/base/Controller.mjs";


class TestController extends Controller {
    // get
    index() {
        return response().json(route('user.index'));
    }
    // get
    create() {
        return response().json({ message: "TestController create" })
    }
    // post
    store() {
        return response().json({ message: "TestController store" });
    }
    // get
    show(id) {
        return response().json({ message: "TestController show" })
    }
    // get
    edit(id) {
        return response().json({ message: "TestController show" })
    }
    // put
    update(id) {
        return response().json({ message: "TestController update" })
    }
    // delete
    destroy(id) {
        return response().json({ message: "TestController destroy" })
    }
}

export default TestController;