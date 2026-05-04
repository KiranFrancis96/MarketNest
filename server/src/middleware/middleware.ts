import pinoHttp from 'pino-http'
import logger from '../utils/logger.ts'

const httpLogger = pinoHttp({
    logger,
})

export default httpLogger