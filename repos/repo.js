const fs = require("fs");
const crypto = require("crypto");

class Repo {
  constructor(filename) {
    if (!filename) {
      throw new Error("plz pass filename");
    }
    this.filename = filename;
    try {
      fs.accessSync(this.filename);
    } catch (err) {
      fs.writeFileSync(this.filename, "[]");
    }
  }
  // helpers
  async writeAll(data) {
    await fs.promises.writeFile(this.filename, JSON.stringify(data, null, 2));
  }

  randomID() {
    return crypto.randomBytes(5).toString("hex");
  }

  // dbmethods
  async getAll() {
    return JSON.parse(
      await fs.promises.readFile(this.filename, {
        encoding: "utf8",
      })
    );
  }

  // create
  async create(attrs) {
    attrs.id = this.randomID();
    const data = await this.getAll();

    data.push(attrs);
    try {
      await this.writeAll(data);
      console.log("written");
    } catch (err) {
      console.log(err);
    }
    return attrs;
  }

  async getOne(id) {
    try {
      const content = await this.getAll();
      const record = content.find((curr) => curr.id == id);
      return record;
    } catch (err) {
      console.log(err);
    }
  }

  async delete(id) {
    const content = await this.getAll();
    const filtered = content.filter((curr) => id != curr.id);
    await this.writeAll(filtered);
  }

  async update(id, attrs) {
    const content = await this.getAll();
    const userToupdate = content.find((user) => user.id == id);
    if (!userToupdate) {
      throw new Error("id not found");
    }
    Object.assign(userToupdate, attrs);
    await this.writeAll(content);
  }

  async getOneBy(filter) {
    const content = await this.getAll();
    for (let user of content) {
      let found = true;
      for (let key in filter) {
        // console.log(user[key], filter[key]);
        if (user[key] != filter[key]) {
          found = false;
        }
      }
      if (found == true) {
        return user;
      }
    }
  }
}

module.exports = Repo;
