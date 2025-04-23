const Controller = require("../../main/base/Controller");
const Admin = require("../../models/Admin");
class UserController extends Controller {
    async index(request, lang, country, id, test, wew) {
        console.log('lang', lang)
        return response().json({
            routeName: route('hello', {
                lang,
                id,
                country,
                test,
                wew
            })
        });
    }

    dataExtract() {
        return []
    }
}

module.exports = UserController;