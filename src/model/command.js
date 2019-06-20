'use strict';
import { Model, DataTypes } from 'sequelize';

export class Command extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        defaultValue: DataTypes.UUIDV4,
        type: DataTypes.UUID,
        primaryKey: true,
        unique: true
      },
      name: DataTypes.STRING
    }, { tableName: 'Command', sequelize });
  }

  static associate(models) {
    this.messageAssociation = this.belongsTo(models.Message);
    this.commandDataAssociation = this.hasMany(models.CommandData);
  }
}
