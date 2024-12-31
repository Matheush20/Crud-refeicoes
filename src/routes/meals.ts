import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { checkIdSession } from '../middlewares/check-id-session'
import { checkIfObjectIsEmpty } from '../utils/check-if-object-is-empty'

export async function mealsRoutes(app: FastifyInstance) {

  app.get('/',
    {
      preHandler: [checkIdSession]
    }, async (request) => {
      const { sessionId } = request.cookies
      const user = await knex('users').select('id')
        .where('session_id', sessionId)
        .first()

      const meals = await knex('meals').select()
        .where('user_id', user.id)

      return { meals }
    })

  app.get('/:mealsId',
    {
      preHandler: [checkIdSession]
    }, async (request, reply) => {
      const idSchema = z.object({
        mealsId: z.string().uuid()
      })

      const checkIdSchema = idSchema.safeParse(
        request.params
      )

      if (checkIdSchema.success === false) {
        return reply.status(400).send()
      }

      const { mealsId } = idSchema.parse(
        request.params
      )

      const { sessionId } = request.cookies
      const user = await knex('users').select('id')
        .where('session_id', sessionId)
        .first()

      const meal = await knex('meals').select()
        .where('user_id', user.id)
        .andWhere('id', mealsId)
        .first()

      if (checkIfObjectIsEmpty(meal)) {
        return reply.status(404).send()
      }


      return { meal }
    })

  app.delete('/:mealsId',
    {
      preHandler: [checkIdSession]
    }, async (request, reply) => {

      const { sessionId } = request.cookies
      const idSchema = z.object({
        mealsId: z.string().uuid()
      })

      const checkIdSchema = idSchema.safeParse(
        request.params
      )

      if (checkIdSchema.success === false) {
        return reply.status(400).send()
      }

      const { mealsId } = idSchema.parse(
        request.params
      )
      const user = await knex('users').select('id')
        .where('session_id', sessionId)
        .first()

      const meal = await knex('meals').select()
        .where('user_id', user.id)
        .andWhere('id', mealsId)
        .first()

      if (checkIfObjectIsEmpty(meal)) {
        return reply.status(404).send()
      }

      await knex('meals').delete()
        .where('user_id', user.id)
        .andWhere('id', mealsId)

      return reply.status(204).send()
    })

  app.put('/:mealsId',
    {
      preHandler: [checkIdSession]
    }, async (request, reply) => {
      const { sessionId } = request.cookies
      const bodySchema = z.object({
        name: z.string(),
        description: z.string(),
        dateAndHour: z.string().datetime(),
        permited: z.boolean()
      })

      const checkBodySchema = bodySchema.safeParse(
        request.body
      )

      const idSchema = z.object({
        mealsId: z.string().uuid()
      })

      const checkIdSchema = idSchema.safeParse(
        request.params
      )

      if (checkBodySchema.success === false || checkIdSchema.success === false) {
        return reply.status(400).send()
      }

      const { name, description, dateAndHour, permited } = bodySchema.parse(
        request.body
      )

      const { mealsId } = idSchema.parse(
        request.params
      )

      const user = await knex('users').select('id')
        .where('session_id', sessionId)
        .first()

      const meal = await knex('meals').select()
        .where('id', mealsId)
        .andWhere('user_id', user.id)
        .first()

      if (checkIfObjectIsEmpty(meal)) {
        return reply.status(404).send()
      }

      await knex('meals').where('id', mealsId).update({
        name,
        description,
        date_and_hour: dateAndHour,
        permited,
      })

      return reply.status(204).send()
    })

  app.get('/metrics',
    {
      preHandler: [checkIdSession]
    }, async (request) => {
      const { sessionId } = request.cookies
      const user = await knex('users').select('id')
        .where('session_id', sessionId)
        .first()

      const meals = await knex('meals').select()
        .where('user_id', user.id)

      const mealsOnDiet = await knex('meals').select()
                                .where('user_id', user.id)
                                .andWhere('permited', 1)

      const { bestSequence } = meals.reduce((accumulator, currentMeal) => {
          if(currentMeal.permited) {
            accumulator.sequence+=1
          } else {
            accumulator.sequence = 0
          }

          if(accumulator.sequence > accumulator.bestSequence) {
            accumulator.bestSequence = accumulator.sequence 
          }

          return accumulator
      }, { bestSequence: 0, sequence: 0})
      return {
        registeredMeals: meals.length,
        mealsOnDiet: mealsOnDiet.length,
        mealsNotOnDiet: meals.length - mealsOnDiet.length,
        bestSequenceOnDiet: bestSequence 
      }
    })


  app.post('/',
    {
      preHandler: [checkIdSession]
    }, async (request, reply) => {
      const { sessionId } = request.cookies
      const user = await knex('users').select()
        .where('session_id', sessionId)
        .first()


      const bodySchema = z.object({
        name: z.string(),
        description: z.string(),
        dateAndHour: z.string().datetime(),
        permited: z.boolean()
      })

      const checkBodySchema = bodySchema.safeParse(
        request.body
      )

      if (checkBodySchema.success === false) {
        return reply.status(400).send()
      }

      const { name, description, dateAndHour, permited } = bodySchema.parse(
        request.body
      )

      await knex('meals').insert({
        id: randomUUID(),
        user_id: user.id,
        name,
        description,
        date_and_hour: dateAndHour,
        permited,
      })
      return reply.status(201).send()
    })
}
