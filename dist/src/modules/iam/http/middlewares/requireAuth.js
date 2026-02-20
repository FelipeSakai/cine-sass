export async function requireAuth(request, reply) {
    try {
        const payload = await request.jwtVerify();
        request.user = { id: payload.sub };
    }
    catch {
        return reply.status(401).send({
            message: "Unauthorized",
        });
    }
}
