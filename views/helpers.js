module.exports = {
  getError(errors, param) {
    try {
      return errors.mapped()[param].msg;
    } catch (error) {
      return "";
    }
  },
};
