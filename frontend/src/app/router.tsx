import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router"

import { AuthPage } from "@/features/auth"
import { HomePage } from "@/app/routes/home-page"

const rootRoute = createRootRoute({
  component: Outlet,
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
})

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthPage,
})

const routeTree = rootRoute.addChildren([homeRoute, authRoute])

export const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
