'use strict';
import { Model, DataTypes } from 'sequelize';

export class Message extends Model {
  static init(sequelize) {
    return super.init({
      author: DataTypes.STRING,
      body: DataTypes.STRING,
      channel: DataTypes.STRING,
      guild: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true
      },
      reactions: DataTypes.ARRAY(DataTypes.STRING)
    }, { tableName: 'Message', sequelize });
  }

  static associate(models) {
    this.commandAssociation = this.hasOne(models.Command);
  }
}
