import type {
  DbExecutor,
  MembershipsRepository,
  TenantsRepository,
  UsersRepository,
} from "../repositories/iam.repositories";
import type {
  CreateTenantOwnerInput,
  CreateTenantOwnerOutput,
} from "../dtos/createTenantOwner.dto";
import { ApiError } from "src/shared/errors/api-error";
import bcrypt from "bcryptjs";

export class CreateTenantOwnerService {
  constructor(
    private db: DbExecutor,
    private tenantsRepo: TenantsRepository,
    private usersRepo: UsersRepository,
    private membershipsRepo: MembershipsRepository,
  ) {}

  async execute(
    input: CreateTenantOwnerInput,
  ): Promise<CreateTenantOwnerOutput> {
    const slug = input.tenantSlug.trim().toLocaleLowerCase();
    const email = input.ownerEmail.trim().toLocaleLowerCase();

    const passwordHash = await bcrypt.hash(input.ownerPassword, 10);

    const result = await this.db.transaction(async (tx) => {
      const tenantAlreadyExists = await this.tenantsRepo.findBySlug(slug);
      if (tenantAlreadyExists)
        throw new ApiError("Tenant slug already in use", 409);

      const userAlreadyExists = await this.usersRepo.findByEmail(email);
      if (userAlreadyExists) throw new ApiError("Email already in use", 409);

      const tenant = await this.tenantsRepo.create(
        { name: input.tenantName, slug },
        tx,
      );
      const user = await this.usersRepo.create(
        { email, passwordHash, isActive: true },
        tx,
      );

      const membership = await this.membershipsRepo.create(
        {
          tenantId: tenant.id,
          userId: user.id,
          role: "OWNER",
        },
        tx,
      );
      return { tenant, user, membership };
    });
    return {
      tenantId: result.tenant.id,
      userId: result.user.id,
      membershipId: result.membership.id,
    };
  }
}
