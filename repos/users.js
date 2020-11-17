const fs = require("fs");
const crypto = require("crypto");
const util = require("util");
const Repo = require("./repo");

const scrypt = util.promisify(crypto.scrypt);

class UsersRepo extends Repo {
  async create(attrs) {

    attrs.id = this.randomID();
    const data = await this.getAll();
    // generate salt
    const salt = crypto.randomBytes(8).toString("hex");
    // hash pass + salt
    const hashBuf = await scrypt(attrs.password, salt, 64);
    const hashedPass = hashBuf.toString("hex");
    // replace old pass in attrs with hash pass
    const record = { ...attrs, password: `${hashedPass}.${salt}` };

    data.push(record);
    try {
      await this.writeAll(data);
      console.log("written");
    } catch (err) {
      console.log(err);
    }
    return record;
  }

  async passMatch(supplied, actual) {
    // supplid -> pass entered by user
    // actual -> hashed.salt
    try {
      const [hashed, salt] = actual.split(".");
      // hash entered pass along salt
      const hashedSuppliedBuff = await scrypt(supplied, salt, 64);
      const hashedSupplied = hashedSuppliedBuff.toString("hex");
      return hashedSupplied == hashed;
    } catch (error) {
      return false;
    }
  }
  //class end
}

module.exports = new UsersRepo("users.json");
