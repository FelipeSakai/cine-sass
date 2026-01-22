import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ApiError } from "./api-error";

export function errorHandler(
  error: FastifyError | ApiError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  request.log.error(error);

  if (error instanceof ApiError) {
    return reply.status(error.statusCode).send({
      message: error.message,
    });
  }

  return reply.status(500).send({
    message: "Internal server error",
  });
}
