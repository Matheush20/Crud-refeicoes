import { FastifyRequest, FastifyReply } from 'fastify'
import { knex } from '../database'
import { checkIfObjectIsEmpty } from '../utils/check-if-object-is-empty'

export async function checkIdSession(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { sessionId } = request.cookies
  if (!sessionId) {
    return reply.status(401).send()
  }
  const user = await knex('users')
    .where('session_id', sessionId)
    .first()


  if (checkIfObjectIsEmpty(user)) {
    return reply.status(401).send()
  }

}
