class Boot {
    static use(){
        return [
            'cors',
            'cookieParser',
            'session',
            'flash',
        ]
    }

    static 404(){
        if (isApiUrl()){
            json({message:"Not Found"}, 404);
        } else {
            dump({message:"Not Found"});
        }
    }
}

module.exports = Boot;