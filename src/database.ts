import { knex as setupKnex, Knex } from 'knex'
import { env } from './env/index'

export const config: Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: env.DATABASE_PATH
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: env.MIGRATIONS_PATH
}
}

export const knex = setupKnex(config)

