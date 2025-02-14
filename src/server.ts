import fastify from 'fastify'
import { usersRoutes } from './routes/users'
import { mealsRoutes } from './routes/meals'
import { env } from './env/index'
import cookie from '@fastify/cookie'

const app = fastify()

app.register(cookie)
app.register(usersRoutes, { prefix: '/users'})
app.register(mealsRoutes, { prefix: '/meals'})

app.listen({ port: env.PORT}, () => {
  console.log('HTTP Server Running!')
})
