This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Deploy on Plesk Server

- [complete Guide](https://stackoverflow.com/questions/78704668/deploy-next-js-14-on-plesk-server)
- Open and Edit the File in `/node_modules/.bin/next` via the File Manager
- edit line: `program.command("dev", {
    isDefault: true
}).description("Starts Next.js in development mode with hot-code reloading, error reporting, and more.").argument("[directory]",`
- to: Set `isDefault` to `false`
- there should be the following code in this file: `` program.command("start").description("Starts Next.js in production mode. The application should be compiled with `next build` first.").argument("[directory]", `A directory on which to start the application. ${(0, _picocolors.italic)("If no directory is provided, the current directory will be used.")}`).addOption(new _commander.Option("-p, --port <port>", "Specify a port number on which to start the application.").argParser(_utils.myParseInt).default(3000).env("PORT")).option("-H, --hostname <hostname>", "Specify a hostname on which to start the application (default: 0.0.0.0).").addOption(new _commander.Option("--keepAliveTimeout <keepAliveTimeout>", "Specify the maximum amount of milliseconds to wait before closing inactive connections.").argParser(_utils.myParseInt)).action((directory, options)=>import("../cli/next-start.js").then((mod)=>mod.nextStart(options, directory))).usage("[directory] [options]"); ``
- edit line: `` program.command("start", {
    isDefault: true
}).description("Starts Next.js in production mode. The application should be compiled with `next build`  `` to `isDefault: true`
- run `npm install` and `npm build`

### Important - Update Project

- first pull your project from your repo
- restart Node.js
- run `npm install`
- run `npm build`
