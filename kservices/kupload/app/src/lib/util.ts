export function axiosErrorText(err: any) {
    const undef = "undefined error"
    if (!err) {
        return undef
    } else if (err.response.data) {
        return err.response.data
    } else if (err.message) {
        return err.message
    } else {
        return undef
    }
}