// Destinations dataset — high-ground, cooler, kid-friendly escapes from Maputo
// Maputo: -25.9692, 32.5732
window.MAPUTO_DEST = {
  origin: { name: "Maputo", lat: -25.9692, lon: 32.5732 },

  destinations: [
    // ===== TIER 1: <4h drive =====
    {
      id: "dullstroom",
      name: "Dullstroom",
      country: "South Africa",
      region: "Mpumalanga",
      lat: -25.4167, lon: 30.1167,
      altitude_m: 2076,
      drive_h: 4.0,
      tier: 1,
      malaria_free: true,
      kid_score: 5,
      safety_score: 5,
      cost_tier: 2, // 1=cheap, 2=mid, 3=upscale
      vibe: ["highest cold town", "fireplace culture", "trout", "misty mornings"],
      wiki: "Dullstroom",
      blurb: "Over 2,000 m above sea level — one of South Africa's coldest towns. Quaint European-village aesthetic, fireplace pubs, trout dams.",
      family_notes: [
        "N4 toll road = smooth quiet ride for naps",
        "Walkable main street, stroller-friendly",
        "Halfway stop at Milly's (Machadodorp): lake view, clean facilities"
      ],
      season_peak: "Jun–Aug (winter)",
      tags: ["highland", "winter", "village", "quaint"]
    },
    {
      id: "malolotja",
      name: "Malolotja Nature Reserve",
      country: "Eswatini",
      region: "Hhohho Highveld",
      lat: -26.1333, lon: 31.1167,
      altitude_m: 1700,
      drive_h: 3.5,
      tier: 1,
      malaria_free: true,
      kid_score: 5,
      safety_score: 5,
      cost_tier: 1,
      vibe: ["raw mountains", "frosted valleys", "log cabins"],
      wiki: "Malolotja_Nature_Reserve",
      blurb: "Stark contrast to coastal humidity — raw, mountainous, crisp. Winter brings frost to the valleys.",
      family_notes: [
        "Self-catering log cabins with fireplaces",
        "Scenic drives through the reserve — see blesbok, zebra from the car",
        "No predators, peaceful, less commercialized"
      ],
      season_peak: "Jun–Aug",
      tags: ["highland", "wildlife-no-predator", "reserve", "remote"]
    },
    {
      id: "sabie",
      name: "Sabie & Hazyview",
      country: "South Africa",
      region: "Mpumalanga",
      lat: -25.0989, lon: 30.7831,
      altitude_m: 1100,
      drive_h: 3.5,
      tier: 1,
      malaria_free: true,
      kid_score: 5,
      safety_score: 5,
      cost_tier: 2,
      vibe: ["pine forests", "waterfalls", "European woodland"],
      wiki: "Sabie",
      blurb: "Deep pine forests — feels like European woodland. Cool and crisp rather than freezing. Famous for waterfalls (Mac Mac, Lone Creek).",
      family_notes: [
        "Most waterfalls have short paved paths from parking",
        "Sabi River Sun: lawns, heated pools, baby-friendly",
        "Easy carrier hikes — no real climbing needed"
      ],
      season_peak: "Apr–Sep",
      tags: ["forest", "waterfalls", "family-resort"]
    },
    {
      id: "kaapsehoop",
      name: "Kaapsehoop",
      country: "South Africa",
      region: "Mpumalanga",
      lat: -25.5867, lon: 30.7942,
      altitude_m: 1635,
      drive_h: 3.5,
      tier: 1,
      malaria_free: true,
      kid_score: 5,
      safety_score: 4,
      cost_tier: 1,
      vibe: ["wild horses", "mist forest", "escarpment edge"],
      wiki: "Kaapsehoop",
      blurb: "Tiny mist-shrouded village on a granite escarpment. Wild horses roam the streets. Mossy forest trails, dramatic cliffs, almost no traffic.",
      family_notes: [
        "Wild horses approach quietly — magical for toddlers",
        "Short flat walks through indigenous forest",
        "Cool year-round; chilly nights even in summer"
      ],
      season_peak: "Year-round (cooler than coast)",
      tags: ["highland", "wild-horses", "village", "off-beat"]
    },
    {
      id: "ezulwini",
      name: "Ezulwini Valley",
      country: "Eswatini",
      region: "Hhohho",
      lat: -26.4167, lon: 31.1833,
      altitude_m: 950,
      drive_h: 3.0,
      tier: 1,
      malaria_free: true,
      kid_score: 5,
      safety_score: 5,
      cost_tier: 2,
      vibe: ["valley of heaven", "craft markets", "tame wildlife"],
      wiki: "Mlilwane_Wildlife_Sanctuary",
      blurb: "Lush mountainous valley. Tourism hub of Eswatini — craft markets, resorts, rolling hills. Mlilwane sanctuary on doorstep.",
      family_notes: [
        "Mlilwane: NO predators — zebras, antelope, giraffes only",
        "Self-drive dirt roads, baby naps in car seat",
        "Walk the camp safely among tame wildlife"
      ],
      season_peak: "May–Sep",
      tags: ["wildlife-no-predator", "valley", "family-friendly"]
    },
    {
      id: "mbabane",
      name: "Mbabane",
      country: "Eswatini",
      region: "Hhohho",
      lat: -26.3167, lon: 31.1333,
      altitude_m: 1243,
      drive_h: 3.0,
      tier: 1,
      malaria_free: true,
      kid_score: 4,
      safety_score: 5,
      cost_tier: 2,
      vibe: ["capital city", "cool air", "small-town feel"],
      wiki: "Mbabane",
      blurb: "Eswatini's capital perched in the Mdimba mountains. Small enough to feel like a town, modern enough for any errand. Cool, pleasant air.",
      family_notes: [
        "Mall + supermarkets for any baby supply runs",
        "Quick highway to Ezulwini for day trips",
        "Reliable healthcare access"
      ],
      season_peak: "Apr–Sep",
      tags: ["urban", "highland", "convenience"]
    },
    {
      id: "piggs-peak",
      name: "Pigg's Peak",
      country: "Eswatini",
      region: "Hhohho NW",
      lat: -25.9667, lon: 31.25,
      altitude_m: 1280,
      drive_h: 3.0,
      tier: 1,
      malaria_free: true,
      kid_score: 4,
      safety_score: 5,
      cost_tier: 1,
      vibe: ["mountain town", "Phophonyane Falls", "remote feel"],
      wiki: "Pigg%27s_Peak",
      blurb: "Sleepy mountain town in NW Eswatini. Gateway to Phophonyane Falls Nature Reserve and the Maguga Dam. Cool, quiet, vastly underrated.",
      family_notes: [
        "Phophonyane Falls Lodge: river-side tents and chalets",
        "Quiet roads, easy nap drives",
        "Border-easy via Lomahasha"
      ],
      season_peak: "Apr–Sep",
      tags: ["highland", "waterfalls", "remote"]
    },

    // ===== TIER 2: 4–6h =====
    {
      id: "graskop",
      name: "Graskop & Panorama Route",
      country: "South Africa",
      region: "Mpumalanga",
      lat: -24.9333, lon: 30.8333,
      altitude_m: 1437,
      drive_h: 4.5,
      tier: 2,
      malaria_free: true,
      kid_score: 5,
      safety_score: 5,
      cost_tier: 2,
      vibe: ["escarpment edge", "Blyde Canyon", "God's Window"],
      wiki: "Graskop",
      blurb: "Perched on the Drakensberg escarpment. Breathtaking drops — Blyde River Canyon, God's Window, Bourke's Luck Potholes — sharp mountain air.",
      family_notes: [
        "Most viewpoints: 2–5 min walk from parking, paved",
        "Stroller or carrier — no real hike needed",
        "Pancake houses everywhere (Harrie's is iconic)"
      ],
      season_peak: "Apr–Sep",
      tags: ["escarpment", "viewpoints", "family-friendly"]
    },
    {
      id: "lydenburg",
      name: "Lydenburg / Long Tom Pass",
      country: "South Africa",
      region: "Mpumalanga",
      lat: -25.0958, lon: 30.4514,
      altitude_m: 1456,
      drive_h: 4.5,
      tier: 2,
      malaria_free: true,
      kid_score: 4,
      safety_score: 4,
      cost_tier: 1,
      vibe: ["historic town", "mountain pass", "trout rivers"],
      wiki: "Lydenburg",
      blurb: "Historic town on the Long Tom Pass — one of SA's highest tar roads (2,150 m summit). Cold winters, big-sky country, trout rivers nearby.",
      family_notes: [
        "Easy detour off the Dullstroom–Sabie route",
        "Mount Anderson Ranch for true alpine feel",
        "Long Tom summit viewpoint — kid-safe stop"
      ],
      season_peak: "May–Aug",
      tags: ["highland", "mountain-pass", "historic"]
    },
    {
      id: "pilgrims-rest",
      name: "Pilgrim's Rest & Mount Sheba",
      country: "South Africa",
      region: "Mpumalanga",
      lat: -24.8917, lon: 30.7517,
      altitude_m: 1200,
      drive_h: 4.5,
      tier: 2,
      malaria_free: true,
      kid_score: 4,
      safety_score: 4,
      cost_tier: 2,
      vibe: ["gold-rush village", "indigenous forest", "living museum"],
      wiki: "Pilgrim%27s_Rest",
      blurb: "Frozen-in-time gold-rush village (national monument). Mount Sheba forest reserve nearby — ancient yellowwoods, mountain mist, total quiet.",
      family_notes: [
        "Whole village is a walkable museum — strollers fine",
        "Mount Sheba Hotel: forest cabins, indoor playroom",
        "Pair with Graskop on same trip"
      ],
      season_peak: "Apr–Sep",
      tags: ["historic", "forest", "highland"]
    },
    {
      id: "wakkerstroom",
      name: "Wakkerstroom",
      country: "South Africa",
      region: "Mpumalanga",
      lat: -27.3528, lon: 30.1453,
      altitude_m: 1880,
      drive_h: 5.0,
      tier: 2,
      malaria_free: true,
      kid_score: 4,
      safety_score: 5,
      cost_tier: 2,
      vibe: ["birding paradise", "wetlands", "alpine grassland"],
      wiki: "Wakkerstroom",
      blurb: "Tiny highland village (1,880 m) ringed by wetlands and grassland. Birding capital of SA, dead-quiet, sandstone cottages, brutal-cold winters.",
      family_notes: [
        "Wetland boardwalk = stroller-friendly birdwatching",
        "Gauntlet of B&Bs with fireplaces",
        "Skip if your toddler hates the cold — it bites"
      ],
      season_peak: "Apr–Sep",
      tags: ["highland", "birding", "village", "very-cold"]
    },
    {
      id: "magoebaskloof",
      name: "Magoebaskloof & Haenertsburg",
      country: "South Africa",
      region: "Limpopo",
      lat: -23.85, lon: 29.95,
      altitude_m: 1500,
      drive_h: 6.0,
      tier: 2,
      malaria_free: true,
      kid_score: 5,
      safety_score: 4,
      cost_tier: 2,
      vibe: ["mountain province", "misty pine forest", "alpine-ish"],
      wiki: "Magoebaskloof",
      blurb: "Rolling green hills, dense misty pine forests, deep valleys. Smells of woodsmoke in winter. Charming Haenertsburg village at its heart.",
      family_notes: [
        "Cheerio Gardens: flat walks, gentle dam loops",
        "Botanical gardens, slow pace",
        "Long drive — break overnight in Polokwane"
      ],
      season_peak: "Apr–Sep",
      tags: ["highland", "forest", "alpine-feel"]
    },

    // ===== TIER 3: 7h+ =====
    {
      id: "clarens",
      name: "Clarens & Northern Drakensberg",
      country: "South Africa",
      region: "Free State",
      lat: -28.5167, lon: 28.4167,
      altitude_m: 1853,
      drive_h: 8.0,
      tier: 3,
      malaria_free: true,
      kid_score: 5,
      safety_score: 5,
      cost_tier: 3,
      vibe: ["sandstone village", "Maluti mountains", "snow-capped winter"],
      wiki: "Clarens",
      blurb: "Artistic sandstone village against the Maluti Mountains. Snow on the peaks in July–August. Upscale bakeries, galleries, deep relaxing winter.",
      family_notes: [
        "Break trip overnight in Joburg/Middelburg — too far for one day",
        "Upmarket but family-friendly self-catering cottages",
        "Best for week-long block leave, not weekends"
      ],
      season_peak: "Jun–Aug (snow possible)",
      tags: ["snow", "village", "winter-wonderland", "long-trip"]
    },

    // ===== URBAN ESCAPES =====
    {
      id: "pretoria",
      name: "Pretoria (Northern Suburbs)",
      country: "South Africa",
      region: "Gauteng",
      lat: -25.7479, lon: 28.2293,
      altitude_m: 1339,
      drive_h: 5.5,
      tier: "urban",
      malaria_free: true,
      kid_score: 5,
      safety_score: 4,
      cost_tier: 3,
      vibe: ["embassy capital", "leafy suburbs", "structured calm"],
      wiki: "Pretoria",
      blurb: "Quieter, more structured than Joburg. Embassy-heavy, secure, leafy suburbs (Waterkloof, Brooklyn). Crisp winter air, jacaranda streets.",
      family_notes: [
        "Pretoria National Botanical Garden: paved, massive, peaceful",
        "Top pediatric facilities at hand",
        "1h flight + 40min transfer beats the 5.5h drive"
      ],
      season_peak: "Year-round (cool May–Aug)",
      tags: ["urban", "highland", "convenience", "leafy"]
    },
    {
      id: "joburg-sandton",
      name: "Johannesburg · Sandton & Melrose Arch",
      country: "South Africa",
      region: "Gauteng",
      lat: -26.1075, lon: 28.0567,
      altitude_m: 1753,
      drive_h: 5.5,
      tier: "urban",
      malaria_free: true,
      kid_score: 5,
      safety_score: 4,
      cost_tier: 3,
      vibe: ["cosmopolitan", "luxury enclaves", "indoor everything"],
      wiki: "Sandton",
      blurb: "Fast, cosmopolitan, highly developed. Stick to the wealthy northern enclaves: Sandton, Rosebank, Melrose Arch — curated, secure, luxurious.",
      family_notes: [
        "Melrose Arch: pedestrian-only, walk to restaurants safely",
        "Premium indoor play areas for cold/rainy days",
        "Healthcare: Netcare Sunninghill, Sandton MediClinic"
      ],
      season_peak: "Year-round",
      tags: ["urban", "luxury", "indoor", "convenience"]
    },

    // ===== WILDLIFE (malaria-free) =====
    {
      id: "pilanesberg",
      name: "Pilanesberg National Park",
      country: "South Africa",
      region: "North West",
      lat: -25.25, lon: 27.05,
      altitude_m: 1100,
      drive_h: 7.5,
      tier: 3,
      malaria_free: true,
      kid_score: 5,
      safety_score: 5,
      cost_tier: 3,
      vibe: ["volcanic crater", "Big 5", "self-drive safari"],
      wiki: "Pilanesberg_National_Park",
      blurb: "Set in an extinct volcano crater. Dramatic landscape, true Big 5. Strictly malaria-free — huge relief with an infant.",
      family_notes: [
        "Self-drive at your own pace — return to lodge anytime",
        "Excellent paved roads inside park",
        "1h flight to Joburg + 2.5h drive beats 7h+ overland"
      ],
      season_peak: "May–Sep",
      tags: ["safari", "big5", "malaria-free", "volcanic"]
    }
  ]
};
