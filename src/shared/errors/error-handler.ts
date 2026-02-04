import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ApiError } from "./api-error";
import { ZodError } from "zod";

export function errorHandler(
  error: FastifyError | ApiError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  request.log.error(error);

  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Validation error",
      issues: error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
  }

  if (error instanceof ApiError) {
    return reply.status(error.statusCode).send({
      message: error.message,
    });
  }

  return reply.status(500).send({
    message: "Internal server error",
  });
}
