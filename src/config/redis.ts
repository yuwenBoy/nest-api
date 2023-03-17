export default {
  host: '127.0.0.1',
  port: 6379,
  db: 0,
  password: '',
  keyPrefix: '',
  onClientReady: (client) => {
    client.on('error', (err) => {
      console.log('-----redis error-----', err);
    });
  },
};