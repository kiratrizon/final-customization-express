import Authenticatable from "../main/base/Authenticatable.mjs";


class Admin extends Authenticatable {
    static factory = true;
    static softDelete = true;


    fillable = [
        'name',
        'email',
        'password'
    ];
    hidden = [
        'password'
    ];

    getUsername() {
        return 'email';
    }

    getJWTIdentifier() {
        return this.getAuthIdentifierName();
    }

    getJWTCustomClaims() {
        return {
            'sub': this.id,
            'email': this.email,
        };
    }
};

export default Admin;