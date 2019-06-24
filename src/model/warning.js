'use strict';
import { Model, DataTypes } from 'sequelize';

export class Warning extends Model {
  static init(sequelize) {
    return super.init({
      member: DataTypes.STRING,
      message: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      id: {
        defaultValue: DataTypes.UUIDV4,
        type: DataTypes.UUID,
        primaryKey: true,
        unique: true
      },
    }, { tableName: 'Warning', sequelize });
  }
}
