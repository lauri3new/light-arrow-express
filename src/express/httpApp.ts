import { Arrow, Left, resolve, Right } from '@light-arrow/arrow'
import { Express } from 'express'
import { match } from 'path-to-regexp'
import {
  Context, HttpMethods, isNotFound, isResult, notFound, Result, runResponse
} from './result'

export type HttpRoutes<A extends Context = Context> = Arrow<A, notFound | Result, Result> | Arrow<A, notFound, Result>
export type HttpApp<A extends Context = Context> = (ctx: A) => Promise<Result>

export const bindArrowApp = <A, B extends Body = any, C extends Body = any>(
  arrowApp: Arrow<A & Context, Result<B>, Result<C>>
) => (app: Express, capabilities: A, onError: (e?: Error) => Result) => {
  app.use('*', (req, res) => arrowApp.runAsPromise({ req, ...capabilities })
    .then(({
        result,
        error,
        failure
      }) => {
        if (failure) {
          return onError(failure)
        } if (error && isResult(error)) {
          return error
        }
        return result
    })
    .then((result) => {
      runResponse(res, result)
    }))
  return {
    app,
    capabilities
  }
}

export const bindApp = <A>(HttpApp: HttpApp<A & Context>, capabilities: A) => (app: Express) => {
  app.use('*', (req, res) => HttpApp({ req, ...capabilities }).then((result) => {
    runResponse(res, result)
  }))
  return {
    app,
    capabilities
  }
}

export const seal = <A extends Context>(
  a: HttpRoutes<A>,
  onNotFound: (_: notFound | Result) => Result,
  onError: (e?: Error) => Result
): HttpApp<A> => (ctx: A) => a.runAsPromise(ctx)
    .then(({
      result,
      error,
      failure
    }) => {
      if (failure) {
        return onError(failure)
      } if (error && isNotFound(error)) {
        return onNotFound(error)
      } if (error && isResult(error)) {
        return error
      }
      return result
    })

const matchMethodAndPath = (method: HttpMethods) => <B extends object = object, A extends Context = Context>(
  path: string
): Arrow<A, notFound | Result, A & { params: B }> => Arrow<A, notFound | Result, A & { params: B }>(async (ctx: A) => {
  const _match = match(path)(ctx.req.baseUrl)
  if (_match && ctx.req.method.toLowerCase() === method) {
    return Right(({ ...ctx, params: _match.params as B }))
  }
  return Left({ path: ctx.req.originalUrl, method: ctx.req.method })
})

export const get = matchMethodAndPath(HttpMethods.GET)
export const post = matchMethodAndPath(HttpMethods.POST)
export const patch = matchMethodAndPath(HttpMethods.PATCH)
export const put = matchMethodAndPath(HttpMethods.PUT)
export const del = matchMethodAndPath(HttpMethods.DELETE)
export const options = matchMethodAndPath(HttpMethods.OPTIONS)

export const filter = <A extends Context = Context>(path: string) => Arrow<A, notFound, undefined>(async (ctx: A) => {
  const _match = match(path)(ctx.req.baseUrl)
  if (_match) {
    return Right(undefined)
  }
  return Left({ path: ctx.req.path, method: ctx.req.method })
})

export function router <D1, E1, R1, D2, E2, R2>(a: Arrow<D1, E1, R1>, b: Arrow<D2, E2, R2>): Arrow<D1 & D2, E1 | E2, R1 | R2>
export function router <D1, E1, R1, D2, E2, R2, D3, E3, R3>(a: Arrow<D1, E1, R1>, b: Arrow<D2, E2, R2>, c: Arrow<D3, E3, R3>): Arrow<D1 & D2 & D3, E1 | E2 | E3, R1 | R2 | R3>
export function router <D1, E1, R1, D2, E2, R2, D3, E3, R3, D4, E4, R4>(a: Arrow<D1, E1, R1>, b: Arrow<D2, E2, R2>, c: Arrow<D3, E3, R3>, d: Arrow<D4, E4, R4>): Arrow<D1 & D2 & D3 & D4, E1 | E2 | E3 | E4, R1 | R2 | R3 | R4>
export function router <D1, E1, R1, D2, E2, R2, D3, E3, R3, D4, E4, R4, D5, E5, R5>(a: Arrow<D1, E1, R1>, b: Arrow<D2, E2, R2>, c: Arrow<D3, E3, R3>, d: Arrow<D4, E4, R4>, e: Arrow<D5, E5, R5>): Arrow<D1 & D2 & D3 & D4 & D5, E1 | E2 | E3 | E4 | E5, R1 | R2 | R3 | R4 | R5>
export function router <D1, E1, R1, D2, E2, R2, D3, E3, R3, D4, E4, R4, D5, E5, R5, D6, E6, R6>(a: Arrow<D1, E1, R1>, b: Arrow<D2, E2, R2>, c: Arrow<D3, E3, R3>, d: Arrow<D4, E4, R4>, e: Arrow<D5, E5, R5>, f: Arrow<D6, E6, R6>):
  Arrow<D1 & D2 & D3 & D4 & D5 & D6, E1 | E2 | E3 | E4 | E5 | E6, R1 | R2 | R3 | R4 | R5 | R6>
export function router <D1, E1, R1, D2, E2, R2, D3, E3, R3, D4, E4, R4, D5, E5, R5, D6, E6, R6, D7, E7, R7>(a: Arrow<D1, E1, R1>, b: Arrow<D2, E2, R2>, c: Arrow<D3, E3, R3>, d: Arrow<D4, E4, R4>, e: Arrow<D5, E5, R5>, f: Arrow<D6, E6, R6>, g: Arrow<D7, E7, R7>):
  Arrow<D1 & D2 & D3 & D4 & D5 & D6 & D7, E1 | E2 | E3 | E4 | E5 | E6 | E7, R1 | R2 | R3 | R4 | R5 | R6 | R7>
export function router <D1, E1, R1, D2, E2, R2, D3, E3, R3, D4, E4, R4, D5, E5, R5, D6, E6, R6, D7, E7, R7, D8, E8, R8>(a: Arrow<D1, E1, R1>, b: Arrow<D2, E2, R2>, c: Arrow<D3, E3, R3>, d: Arrow<D4, E4, R4>, e: Arrow<D5, E5, R5>, f: Arrow<D6, E6, R6>, g: Arrow<D7, E7, R7>, h: Arrow<D8, E8, R8>):
  Arrow<D1 & D2 & D3 & D4 & D5 & D6 & D7 & D8, E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8, R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8>
export function router <D1, E1, R1, D2, E2, R2, D3, E3, R3, D4, E4, R4, D5, E5, R5, D6, E6, R6, D7, E7, R7, D8, E8, R8, D9, E9, R9>(a: Arrow<D1, E1, R1>, b: Arrow<D2, E2, R2>, c: Arrow<D3, E3, R3>, d: Arrow<D4, E4, R4>, e: Arrow<D5, E5, R5>, f: Arrow<D6, E6, R6>, g: Arrow<D7, E7, R7>, h: Arrow<D8, E8, R8>, i: Arrow<D9, E9, R9>):
  Arrow<D1 & D2 & D3 & D4 & D5 & D6 & D7 & D8 & D9, E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8 | E9, R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 | R9>
export function router(...as: any[]) {
  if (as.length === 1) return as[0]
  if (as.length === 2) return as[0].ifOrElse((a: any) => !isResult(a), as[1])
  const [a, b, ...aas] = as
  // @ts-ignore
  return router(a.ifOrElse((a: any) => !isResult(a), b), ...aas)
}