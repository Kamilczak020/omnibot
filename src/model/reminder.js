'use strict';
import { Model, DataTypes } from 'sequelize';
import { isBefore, isAfter } from 'date-fns';

export class Reminder extends Model {
  static init(sequelize) {
    return super.init({
      author: DataTypes.STRING,
      index: DataTypes.NUMBER,
      message: DataTypes.STRING,
      reminderDate: DataTypes.DATE,
      id: {
        defaultValue: DataTypes.UUIDV4,
        type: DataTypes.UUID,
        primaryKey: true,
        unique: true
      },
    }, { tableName: 'Reminder', sequelize });
  }

  static async beforeCreate(instance) {
    const nonResolved = await this.getByAuthor(instance.author);
    const before = nonResolved.filter((reminder) => isBefore(reminder.dataValues.reminderDate, instance.reminderDate));
    const index = before.length;
    instance.index = index;

    const after = nonResolved.slice(index);
    after.forEach(async (reminder) => {
      await reminder.update({ index: reminder.index + 1 });
    });
  }

  static async beforeDestroy(instance) {
    const allByAuthor = await this.getByAuthor(instance.author);
    const index = instance.index;
    const after = allByAuthor.slice(index);

    after.forEach(async (reminder) => {
      await reminder.update({ index: reminder.index - 1 });
    });
  }

  static registerHooks() {
    super.addHook('beforeCreate', this.beforeCreate);
    super.addHook('beforeDestroy', this.beforeDestroy);
  }

  static async getByAuthor(author) {
    return await this.findAll({
      where: { author },
      order: [['reminderDate', 'ASC']]
    });
  }
}
