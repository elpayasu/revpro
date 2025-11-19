const examplePlugin = {
  name: 'ExamplePlugin',
  middleware: (app) => {
    app.use((req, res, next) => {
      console.log('Request received:', req.url);
      next();
    });
  },
  beforeRequest: (req) => console.log('Before request hook:', req.url),
  afterResponse: (res) => console.log('After response hook:', res.statusCode)
};
