import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

interface PsychiatristResult {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  phone: string | null;
  website: string | null;
  osmUrl: string;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
];
const MAX_RESULTS = 10;

const PSYCHIATRY_KEYWORD_REGEX =
  /psychi|mental|mind\s*care|behavior|behaviour|neuropsy|depression|anxiety/i;

function buildAddress(tags: Record<string, string> | undefined): string {
  if (!tags) {
    return "Address not available";
  }

  if (tags["addr:full"]) {
    return tags["addr:full"];
  }

  const parts = [
    [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" "),
    tags["addr:suburb"],
    tags["addr:city"],
    tags["addr:state"],
    tags["addr:postcode"],
  ].filter(Boolean);

  if (parts.length === 0) {
    return tags["addr:street"] || tags["addr:city"] || "Address not available";
  }

  return parts.join(", ");
}

function normalizeWebsite(website: string | undefined): string | null {
  if (!website) {
    return null;
  }

  if (website.startsWith("http://") || website.startsWith("https://")) {
    return website;
  }

  return `https://${website}`;
}

function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

async function geocodeLocation(
  location: string,
): Promise<NominatimResult | null> {
  const params = new URLSearchParams({
    q: location,
    format: "jsonv2",
    limit: "1",
  });

  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    headers: {
      "User-Agent": "Cogniscope/1.0 (psychiatrist-search)",
      "Accept-Language": "en",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to geocode location");
  }

  const data = (await response.json()) as NominatimResult[];
  return data[0] || null;
}

async function searchNearbyPsychiatrists(
  lat: number,
  lon: number,
): Promise<PsychiatristResult[]> {
  const strictQuery = `
[out:json][timeout:25];
(
  node["amenity"="doctors"]["healthcare:speciality"~"psychiatry|psychiatrist",i](around:15000,${lat},${lon});
  way["amenity"="doctors"]["healthcare:speciality"~"psychiatry|psychiatrist",i](around:15000,${lat},${lon});
  relation["amenity"="doctors"]["healthcare:speciality"~"psychiatry|psychiatrist",i](around:15000,${lat},${lon});
  node["healthcare"="psychiatrist"](around:15000,${lat},${lon});
  way["healthcare"="psychiatrist"](around:15000,${lat},${lon});
  relation["healthcare"="psychiatrist"](around:15000,${lat},${lon});
  node["office"~"psychiatrist",i](around:15000,${lat},${lon});
  way["office"~"psychiatrist",i](around:15000,${lat},${lon});
  relation["office"~"psychiatrist",i](around:15000,${lat},${lon});
);
out center tags;
`;

  const broadFallbackQuery = `
[out:json][timeout:25];
(
  node["amenity"~"doctors|clinic",i](around:50000,${lat},${lon});
  way["amenity"~"doctors|clinic",i](around:50000,${lat},${lon});
  relation["amenity"~"doctors|clinic",i](around:50000,${lat},${lon});
  node["healthcare"~"doctor|clinic|hospital|psychiatrist",i](around:50000,${lat},${lon});
  way["healthcare"~"doctor|clinic|hospital|psychiatrist",i](around:50000,${lat},${lon});
  relation["healthcare"~"doctor|clinic|hospital|psychiatrist",i](around:50000,${lat},${lon});
);
out center tags;
`;

  async function executeOverpassQuery(
    query: string,
  ): Promise<OverpassResponse> {
    let data: OverpassResponse | null = null;
    let lastErrorDetails = "Unknown Overpass failure";

    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const body = new URLSearchParams({ data: query }).toString();
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "User-Agent": "Cogniscope/1.0 (psychiatrist-search)",
          },
          body,
          cache: "no-store",
        });

        if (!response.ok) {
          const responseSnippet = (await response.text()).slice(0, 180);
          lastErrorDetails = `${endpoint} -> ${response.status}: ${responseSnippet}`;
          continue;
        }

        data = (await response.json()) as OverpassResponse;
        break;
      } catch (error) {
        lastErrorDetails =
          error instanceof Error ? error.message : "Overpass request failed";
      }
    }

    if (!data) {
      throw new Error(
        `Unable to fetch nearby psychiatrists (${lastErrorDetails})`,
      );
    }

    return data;
  }

  const strictData = await executeOverpassQuery(strictQuery);
  const broadData = await executeOverpassQuery(broadFallbackQuery);
  const allElements = [
    ...(strictData.elements || []),
    ...(broadData.elements || []),
  ];

  const unique = new Map<string, PsychiatristResult>();
  const scoredResults: Array<{
    result: PsychiatristResult;
    relevance: number;
  }> = [];

  for (const element of allElements) {
    const point =
      element.center ||
      (element.lat !== undefined && element.lon !== undefined
        ? { lat: element.lat, lon: element.lon }
        : null);

    if (!point) {
      continue;
    }

    const tags = element.tags;
    const name =
      tags?.name || tags?.operator || tags?.brand || "Psychiatry Clinic";
    const address = buildAddress(tags);
    const key = `${name.toLowerCase()}-${address.toLowerCase()}`;

    if (unique.has(key)) {
      continue;
    }

    const result: PsychiatristResult = {
      id: `${element.id}`,
      name,
      address,
      distanceKm: haversineDistanceKm(lat, lon, point.lat, point.lon),
      phone: tags?.phone || tags?.["contact:phone"] || null,
      website: normalizeWebsite(tags?.website || tags?.["contact:website"]),
      osmUrl: `https://www.openstreetmap.org/?mlat=${point.lat}&mlon=${point.lon}#map=16/${point.lat}/${point.lon}`,
    };

    const searchableText = [
      name,
      tags?.["healthcare:speciality"],
      tags?.healthcare,
      tags?.description,
      tags?.operator,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    let relevance = 0;
    if (PSYCHIATRY_KEYWORD_REGEX.test(searchableText)) {
      relevance += 120;
    }
    if (/(neuro|brain)/i.test(searchableText)) {
      relevance += 35;
    }
    if (/doctor|clinic|hospital/i.test(searchableText)) {
      relevance += 10;
    }

    unique.set(key, result);
    scoredResults.push({ result, relevance });
  }

  return scoredResults
    .sort((a, b) => {
      if (b.relevance !== a.relevance) {
        return b.relevance - a.relevance;
      }

      return a.result.distanceKm - b.result.distanceKm;
    })
    .map((entry) => entry.result)
    .slice(0, MAX_RESULTS);
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const location = req.nextUrl.searchParams.get("location")?.trim();

    if (!location) {
      return NextResponse.json(
        { error: "Location query is required" },
        { status: 400 },
      );
    }

    const geocoded = await geocodeLocation(location);

    if (!geocoded) {
      return NextResponse.json(
        { error: "Unable to find this location. Please refine your input." },
        { status: 404 },
      );
    }

    const lat = Number(geocoded.lat);
    const lon = Number(geocoded.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return NextResponse.json(
        { error: "Invalid coordinates for this location." },
        { status: 400 },
      );
    }

    const results = await searchNearbyPsychiatrists(lat, lon);

    return NextResponse.json({
      location: geocoded.display_name,
      results,
    });
  } catch (error) {
    console.error("Error fetching psychiatrists:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch psychiatrists. Please try again.",
      },
      { status: 500 },
    );
  }
}
