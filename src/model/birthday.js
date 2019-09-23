'use strict';
import { Model, DataTypes } from 'sequelize';

export class Birthday extends Model {
  static init(sequelize) {
    return super.init({
      member: DataTypes.STRING,
      date: DataTypes.DATEONLY,
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true
      },
    }, { tableName: 'Birthday', sequelize });
  }
}
