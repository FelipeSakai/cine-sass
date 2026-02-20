export async function protectedPingController(request, reply) {
    return reply.status(200).send({
        ok: true,
        userId: request.user?.id,
    });
}
