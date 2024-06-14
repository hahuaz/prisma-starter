import { eq } from "drizzle-orm";

import { db } from "./index";
import { cities, countries } from "./schema";

/**
 * Example of inserting a country
 */
export async function insertCountry() {
  await db.insert(countries).values({
    name: "United States",
  });
}

/**
 * Example of inserting a city
 */
export async function insertCity() {
  await db.insert(cities).values({
    name: "New York",
    countryId: 1,
    popularity: "popular",
  });
}

/**
 * Example of inserting multiple cities
 */
export async function insertCities() {
  await db.insert(cities).values([
    {
      name: "Los Angeles",
      countryId: 1,
      popularity: "popular",
    },
    {
      name: "San Francisco",
      countryId: 1,
      popularity: "popular",
    },
  ]);
}

/**
 * Update city
 */
export async function updateCity() {
  await db
    .update(cities)
    .set({
      popularity: "known",
    })
    .where(eq(cities.name, "New York"))
    .returning({
      id: cities.id,
      name: cities.name,
      popularity: cities.popularity,
    });
}
