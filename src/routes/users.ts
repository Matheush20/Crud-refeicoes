import { knex } from '../database'
import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'

export async function usersRoutes(app: FastifyInstance) {

  app.get('/', async () => {
    const users = await knex('users').select()
    return { users }
  })
  app.post('/', async(request, reply) => {

      const bodySchema = z.object({
        name: z.string(),
        email: z.string().email(),
      })

      const { name, email } = bodySchema.parse(
        request.body
      )
      let sessionId = request.cookies.sessionId
      if(!sessionId) {
        sessionId = randomUUID()

        reply.setCookie('sessionId', sessionId, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7 // 7 dias
        })
      }

      await knex('users').insert({
        id: randomUUID(),
        name,
        email,
        session_id: sessionId,
      })

      return reply.status(201).send()
  })
}
