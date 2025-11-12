# dev-tools

The app is deployed here: http://dev-tools-app.s3-website-ap-southeast-1.amazonaws.com/

This template should help get you started developing with Vue 3 in Vite.

## Prerequisites

This project requires **Node.js version 16** to run properly.

You can manage Node.js versions using [nvm](https://github.com/nvm-sh/nvm):

```sh
nvm use 16
```

Or install Node.js 16 directly from [nodejs.org](https://nodejs.org/).

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```
