import { ApiError } from "src/shared/errors/api-error";
import { LoginInput, LoginOutput } from "../dtos/authLogin.dto";
import {
  DbExecutor,
  MembershipsRepository,
  UsersRepository,
} from "../repositories/iam.repositories";
import { RefreshTokensRepository } from "../repositories/refreshTokens.repository";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

type SignAccessToken = (payload: { sub: string }) => Promise<string> | string;

export class AuthLoginService {
  constructor(
    private db: DbExecutor,
    private usersRepo: UsersRepository,
    private membershipsRepo: MembershipsRepository,
    private refreshTokensRepo: RefreshTokensRepository,
    private signAccessToken: SignAccessToken,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const email = input.email.trim().toLocaleLowerCase();

    const user = await this.usersRepo.findByEmail(email);
    if (!user || !user.isActive) {
      throw new ApiError("Invalid credentials", 401);
    }

    const passwordMatch = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );
    if (!passwordMatch) {
      throw new ApiError("Invalid credentials", 401);
    }

    const memberships = await this.membershipsRepo.findManyByUserId(user.id);
    if (memberships.length === 0) {
      throw new ApiError("User has no memberships", 403);
    }

    const accessToken = await this.signAccessToken({ sub: user.id });

    const refreshToken = crypto.randomBytes(40).toString("hex");
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokensRepo.create({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt,
    });

    const authMemberships = memberships.map((m) => ({
      tenantId: m.tenantId,
      role: m.role,
    }));

    return {
      accessToken,
      refreshToken,
      memberships: authMemberships,
      defaultTenantId:
        authMemberships.length === 1 ? authMemberships[0].tenantId : undefined,
    };
  }
}
