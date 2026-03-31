import { ApiError } from "src/shared/errors/api-error";

import type {
  ImportMovieInput,
  ImportMovieOutput,
} from "../dtos/import-movie.dto";
import type { ExternalMovieCatalogProvider } from "../integrations/providers/external-movie-catalog.provider";
import type { CatalogMoviesRepository } from "../repositories/contracts";

export class ImportMovieService {
  constructor(
    private catalogMoviesRepo: CatalogMoviesRepository,
    private externalCatalogProvider: ExternalMovieCatalogProvider,
  ) {}

  async execute(input: ImportMovieInput): Promise<ImportMovieOutput> {
    if (input.sourceProvider !== this.externalCatalogProvider.provider) {
      throw new ApiError("Unsupported movie provider", 400);
    }

    const existing = await this.catalogMoviesRepo.findByTenantAndSourceRef(
      input.tenantId,
      input.sourceProvider,
      input.sourceMovieId,
    );

    if (existing) {
      return {
        movieId: existing.id,
        imported: false,
      };
    }

    const externalMovie = await this.externalCatalogProvider.getMovieDetails(
      input.sourceMovieId,
    );

    if (!externalMovie) {
      throw new ApiError("Movie not found in external catalog", 404);
    }

    const created = await this.catalogMoviesRepo.create({
      tenantId: input.tenantId,
      title: externalMovie.title,
      originalTitle: externalMovie.originalTitle,
      synopsis: externalMovie.synopsis,
      posterUrl: externalMovie.posterUrl,
      backdropUrl: externalMovie.backdropUrl,
      releaseDate: externalMovie.releaseDate,
      runtimeMinutes: externalMovie.runtimeMinutes,
      sourceProvider: input.sourceProvider,
      sourceMovieId: input.sourceMovieId,
      importMetadata: externalMovie.importMetadata ?? null,
    });

    return {
      movieId: created.id,
      imported: true,
    };
  }
}
