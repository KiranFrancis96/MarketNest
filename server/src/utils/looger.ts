import pino from 'pino';

const isDev =  process.env.NODE_ENV !== 'production';

const transport = isDev
   ? pino.transport({
      target:'pino-pretty',
      options:{
        colorize:true,
        targetTime:'HH:MM:ss',
        ignore:'pid,hostname'
      }   
     })
    :undefined


const logger = pino({
    level:isDev?'debug':'info'
},transport)

export default logger