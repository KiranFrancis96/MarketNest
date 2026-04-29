import pinoHttp from 'pino-http'
import logger from '../utils/looger.js'

const httpLogger = pinoHttp.default({
    logger,
})

export default httpLogger