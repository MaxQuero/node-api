
let db, config, members;

let Members = class {

    static getAll(nbMax) {
        return new Promise((next) => {
            if (nbMax !== undefined && nbMax <= 0) {
                next(new Error(config.errors.wrongMaxValue));
            } else {
                db.query('SELECT * from members')
                    .then(res => {
                        members = res;
                        if (nbMax !== undefined && nbMax > 0) {
                            members = members.slice(0, nbMax);
                        }

                        next(members)
                    })
                    .catch(err => next(err));
            }
        });
    }

    static getById(members, id) {

        return new Promise((next) => {
            if (checkMemberFieldExists(members, id, ('id'))) {
                db.query('SELECT * from members where id = ?', [id])
                .then((res) => next(res))
                .catch(err => {
                    console.log(err.message);
                    next(new Error(config.errors.errorGettingUser));
                });
            } else {
                next(new Error(config.errors.memberIdDoesNotExists));
            }
        });
    }


    static insert(members, name) {
        return new Promise((next) => {
            if (!!name && !checkMemberFieldExists(members, name, 'name')) {
                db.query('INSERT INTO members(name) VALUES (?)', [name])
                    .then(res => {
                        const newMember = {id: res.insertId, name: name };
                        members.push(newMember);
                        next(newMember);
                    })
                    .catch(err =>  {
                        console.log(err.message);
                        next(new Error(config.errors.errorInsertingUser));
                    });
            } else if (!!name) {
                next(new Error(config.errors.memberAlreadyExists));
            } else {
                next(new Error(config.errors.noNameForMember));
            }
        });
    }

    static update(members, name, id) {
        return new Promise((next) => {
            if (!!name && checkMemberFieldExists(members, id, 'id')) {
                db.query('UPDATE members SET name = ? where id = ?', [name, id])
                    .then(res => {
                        const memberToModify = members.findIndex((el) => (el.id).toString() === id);
                        members[memberToModify] = {...members[memberToModify], name: name};
                        next(members);
                    })
                    .catch(err => {
                        next(new Error(config.errors.errorUpdatingUser))
                    });
            } else if (!checkMemberFieldExists(members, id, 'id')) {
                next( new Error(config.errors.memberIdDoesNotExists));
            } else {
                next(new Error(config.errors.noNameForMember));
            }
        });
    }

    static delete(members, id) {
        return new Promise((next) => {

            if (checkMemberFieldExists(members, id, 'id')) {
                db.query('DELETE FROM members where id = ?', [id])
                    .then(res => {

                        const memberToDeleteIndex = members.findIndex(el => (el.id).toString() === id);

                        if(memberToDeleteIndex) {
                            members.splice(memberToDeleteIndex, 1);
                        }
                        next(members);
                    })
                    .catch(err => {
                        console.log(err.message);
                        next(new Error(config.errors.errorDeletingUser));
                    })
            } else {
                next(new Error(config.errors.memberIdDoesNotExists));
            }
        });
    }
}

function checkMemberFieldExists(members, memberId, field) {
    console.log(members);
    const memberExists = members.find((el) => {
        return (el[field]).toString() === memberId;
    });

    return !!memberExists;
}

module.exports = (_db, _config) => {
    db= _db;
    config = _config;
    return Members;
};