exports.success = (res) => {
    return {
        status: "success",
        result: res
    }
}


exports.error = (message) => {
    return {
        status: "error",
        result: message
    }
}

exports.isError = (err) => {
    return err instanceof Error;
}

exports.getResponse = (obj) => {
    if (this.isError(obj)) {
        return this.error(obj.message);
    } else {
        return this.success(obj);
    }
}