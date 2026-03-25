export const movieSourceProviders = ["TMDB"] as const;

export type MovieSourceProvider = (typeof movieSourceProviders)[number];
