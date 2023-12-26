import { createClient } from 'redis';

const productsClientRedis = createClient({database: 1, name: 'productsDatabase'});
const ordersClientRedis = createClient({database: 2, name: 'nfDatabase'});

productsClientRedis.on('error', err => console.log('Redis Client Error', err));
ordersClientRedis.on('error', err => console.log('Redis Client Error', err));

export { ordersClientRedis, productsClientRedis };
