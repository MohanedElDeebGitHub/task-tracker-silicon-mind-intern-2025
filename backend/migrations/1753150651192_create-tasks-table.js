/** @type {import('node-pg-migrate').ColumnDefinitions | undefined} */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  // no default ENUM type, so we create a custom type for task status
  pgm.createType('task_status', ['to-do', 'in progress', 'done']);

  pgm.createTable('tasks', {
    id: {
      type: 'SERIAL',
      primaryKey: true,
    },
    // We reference users(id) here.
    user_id: {
      type: 'INTEGER',
      notNull: true,
      references: '"users"(id)',
      onDelete: 'CASCADE',
    },
    title: {
      type: 'VARCHAR(80)',
      notNull: true,
    },
    status: {
      type: 'task_status', // custom ENUM type defined above
      notNull: true,
      default: 'to-do',
    },
    description: {
      type: 'TEXT',
    },
    total_duration: {
      type: 'INTERVAL',
      default: '0',
    },
    created_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('tasks', 'status');
  pgm.createIndex('tasks', 'user_id');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.down = (pgm) => {
  pgm.dropTable('tasks');
  pgm.dropType('task_status');
};