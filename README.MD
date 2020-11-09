<div align="center">
<img height="100" src="https://raw.githubusercontent.com/lauri3new/light-arrow/master/arrow1.png">
<h1 >Light-Arrow</h1>
</div>

<p align="center">
<img alt="npm" src="https://img.shields.io/npm/v/@light-arrow/express?color=g">
<!-- <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/lauri3new/light-arrow-express/Node.js%20CI"> -->
</p>

## About

Light Arrow is a small library for type safe asynchronous programming in typescript. The library is based around the functional and composable Arrow data type. Arrows are data structures that describe asynchronous (and synchronous) operations that can succeed or fail and may have some dependencies. Please check out the documentation https://lauri3new.github.io/light-arrow-docs/ for a longer explanation and some examples. 

This module exposes helper functions for building type safe http apps using the express framework and the `Arrow` data type. Please see this section https://lauri3new.github.io/light-arrow-docs/docs/HttpApp of the documentation for more detail, and this section https://lauri3new.github.io/light-arrow-docs/docs/Arrow for more on the Arrow data type.

## Getting Started

Installation

```bash
npm install @light-arrow/arrow @light-arrow/express
```

Light-arrow/express provides bindings for writing type safe http apps. Instead of using native response methods we can instead describe the http response using a [Result data type](Result.md).

An HttpApp is simply a ```(ctx: Context) => Promise<Result>```. To help with type safety and composability we can define HttpRoutes as ```Arrow<Context, notFound | Result, Result>``` and then use the seal function, providing handlers for 'not found' and exception cases. We can then bind an HttpApp to an express instance using the bindApp function, providing any dependencies the Arrows require at that time if we want.

```ts
interface Context {
  req: Request
}
```

We can express our whole express app using Arrows. Middlewares can be defined as ```Arrow<A, Result, B>``` where A and B extend the context. Multiple middlewares can be stacked together in a type safe manner using the `andThen` function. By defining our middleware this way we can expand and transform the context in a composable and type safe way, for example attaching services or authorisation data to the context.

**An example Middleware**
```ts
const authorizationMiddleware: Arrow<Context, Result, {
  loggedIn: boolean;
  req: Request;
}> = draw((ctx: Context) => {
  if (ctx.req.headers.authorization) {
    return succeed({ ...ctx, loggedIn: true })
  } else {
    return fail(Unauthorised({}))
  }
})
```

Handlers can be written as ```Arrow<A, Result, Result>``` where A is inferred from the middlewares. HttpRoutes are then Arrows of Type ```Arrow<A, notFound \ Result, Result>```, and we can combine HttpRoutes together (similar to how we would use an express Router) using the orElse function.

**An example HttpRoute**
```ts
const getUsers: Arrow<{
  loggedIn: boolean;
  req: Request;
}, NotFound, Result> = get('/users')
  .andThen(draw((ctx: Context) => ctx.services.getUsers()))
```

**Multiple routes and middlewares combined**
```ts
const routes: Arrow<Context, NotFound | Result, Result> = orElse(
  get('/healthcheck').map(() => OK({})),
  authorizationMiddleware.andThen(
    orElse(
      getUsers,
      getTimeline
    )
  )
)
```

**Converting HttpRoutes to an HttpApp**
```ts
const httpApp = seal(
  routes,
  () => NotFound({
    message: 'not found'
  }),
  () => InternalServerError({
    message: 'oops something went wrong'
  })
)
```

**Binding our HttpApp to an express instance**
```ts
const expressInstance = express()
const { app } = bindApp(httpApp)(expressInstance)

app.listen(8080)
```

Once we have all the routes described we can convert the HttpRoutes to an HttpApp using the seal function, providing functions for converting the notFound type and runtime exceptions into http Results. We can then use the bindApp function to attach our httpApp to an express application instance and inject dependencies.