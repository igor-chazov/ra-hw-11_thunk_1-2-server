const http = require('http');
const path = require('path');
const Koa = require('koa');
const cors = require('koa2-cors');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const Router = require('koa-router');

const app = new Koa();

app.use(
  cors({
    origin: '*',
    credentials: true,
    'Access-Control-Allow-Origin': true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  }),
);

app.use(koaBody({
  text: true,
  urlencoded: true,
  multipart: true,
  json: true,
}));

const dirPublic = path.join(__dirname, '/public');
app.use(koaStatic(dirPublic));

let nextId = 1;
const services = [
  {
    id: nextId += 1, name: 'Замена стекла', price: 21000, content: 'Стекло оригинал от Apple',
  },
  {
    id: nextId += 1, name: 'Замена дисплея', price: 25000, content: 'Дисплей оригинал от Foxconn',
  },
  {
    id: nextId += 1, name: 'Замена аккумулятора', price: 4000, content: 'Новый на 4000 mAh',
  },
  {
    id: nextId += 1, name: 'Замена микрофона', price: 2500, content: 'Оригинальный от Apple',
  },
];

const router = new Router();
app.use(router.routes()).use(router.allowedMethods());

function fortune(ctx, body = null, status = 200) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.25) {
        ctx.response.status = status;
        ctx.response.body = body;
        resolve();
        return;
      }

      reject(new Error('Что-то пошло не так'));
    }, 1 * 1000);
  });
}

router.get('/api/services', async (ctx) => {
  const body = services.map((o) => ({ id: o.id, name: o.name, price: o.price }));
  return fortune(ctx, body);
});
router.get('/api/services/:id', async (ctx) => {
  const id = Number(ctx.params.id);
  const index = services.findIndex((o) => o.id === id);
  if (index === -1) {
    const status = 404;
    return fortune(ctx, null, status);
  }
  const body = services[index];
  return fortune(ctx, body);
});
router.post('/api/services', async (ctx) => {
  const { id } = ctx.request.body;
  if (id !== 0) {
    const index = services.findIndex((o) => o.id === id);
    if (index === -1) {
      const status = 404;
      return fortune(ctx, null, status);
    }
    services[index] = ctx.request.body;
    return fortune(ctx, null, 204);
  }

  services.push({ ...ctx.request.body, id: nextId += 1 });
  const status = 204;
  return fortune(ctx, null, status);
});
router.delete('/api/services/:id', async (ctx) => {
  const id = Number(ctx.params.id);
  const index = services.findIndex((o) => o.id === id);
  if (index === -1) {
    const status = 404;
    return fortune(ctx, null, status);
  }
  services.splice(index, 1);
  const status = 204;
  return fortune(ctx, null, status);
});

const port = process.env.PORT || 7575;
const server = http.createServer(app.callback());

// eslint-disable-next-line no-console
server.listen(port, () => console.log('Server started'));
