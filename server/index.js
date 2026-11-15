const { createApp } = require('./app');

const port = Number(process.env.PORT) || 3000;
createApp(process.env.DB_FILE).listen(port, () => {
  console.log(`Regulatory glossary running at http://localhost:${port}`);
});
