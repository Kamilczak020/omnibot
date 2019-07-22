'use strict';
import { Model, DataTypes } from 'sequelize';

export class CustomCommand extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        defaultValue: DataTypes.UUIDV4,
        type: DataTypes.UUID,
        primaryKey: true,
        unique: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      body: {
        type: DataTypes.STRING,
        allowNull: false,
      }
    }, { tableName: 'CustomCommand', sequelize });
  }
}
