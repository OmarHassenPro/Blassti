import { reactive } from "vue"

const VENUES_STORAGE_KEY = "venues_v5"
const VENUES_VERSION_KEY = "venues_seed_version"
const VENUES_SEED_VERSION = "v8_seeded_venues_with_local_asset_galleries"

const DEFAULT_ADMIN_USER_ID = "admin-user-1"

function getVenueAsset(folder, imageName) {
  try {
    return new URL(`../assets/${folder}/${imageName}`, import.meta.url).href
  } catch (error) {
    console.warn("Missing venue asset:", folder, imageName)
    return ""
  }
}

function slugifyVenueFolderName(value = "") {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’`]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase()
}

function getSeedVenueImages(title, totalImages = 4) {
  const folder = slugifyVenueFolderName(title)
  const image = getVenueAsset(folder, "im1.jpg")
  const extra_images = []

  for (let i = 2; i <= totalImages; i += 1) {
    const asset = getVenueAsset(folder, `im${i}.jpg`)
    if (asset) {
      extra_images.push(asset)
    }
  }

  return {
    image,
    extra_images,
  }
}

function normalizeBankAccountInfo(bankAccountInfo = {}) {
  return {
    account_holder_name: bankAccountInfo.account_holder_name ?? "",
    bank_name: bankAccountInfo.bank_name ?? "",
    account_number: bankAccountInfo.account_number ?? "",
    rib: bankAccountInfo.rib ?? "",
    iban: bankAccountInfo.iban ?? "",
    swift: bankAccountInfo.swift ?? "",
  }
}

function normalizeSeatClasses(seatClasses = []) {
  if (!Array.isArray(seatClasses) || !seatClasses.length) {
    return ["Regular"]
  }

  const valid = []
  seatClasses.forEach(item => {
    const text = String(item ?? "").trim()
    if (text && !valid.includes(text)) {
      valid.push(text)
    }
  })

  return valid.length ? valid : ["Regular"]
}

function normalizeAdministrationBlocks(administrationBlocks = []) {
  if (!Array.isArray(administrationBlocks)) return []

  return administrationBlocks
    .map((block, index) => ({
      id: block?.id ?? `admin-block-${index + 1}`,
      label: String(block?.label ?? "Administration").trim() || "Administration",
      type: String(block?.type ?? "maintenance").trim() || "maintenance",
      color: block?.color ?? "error",
      is_recurring_daily: Boolean(block?.is_recurring_daily),
      daily_start_hour: Number.isFinite(Number(block?.daily_start_hour))
        ? Number(block.daily_start_hour)
        : null,
      daily_end_hour: Number.isFinite(Number(block?.daily_end_hour))
        ? Number(block.daily_end_hour)
        : null,
      start_datetime: block?.start_datetime ?? "",
      end_datetime: block?.end_datetime ?? "",
      notes: block?.notes ?? "",
    }))
    .filter(block => {
      if (block.is_recurring_daily) {
        return (
          Number.isFinite(block.daily_start_hour) &&
          Number.isFinite(block.daily_end_hour)
        )
      }

      return Boolean(block.start_datetime && block.end_datetime)
    })
}

function normalizeSeatLayout(seatLayout = null) {
  if (!seatLayout || typeof seatLayout !== "object") return null

  return {
    width: Number(seatLayout?.width ?? 20),
    height: Number(seatLayout?.height ?? 12),
    seats: Array.isArray(seatLayout?.seats)
      ? seatLayout.seats.map((seat, index) => {
          const row = String(seat?.row ?? "").trim()
          const number = String(seat?.number ?? "").trim()
          const seatNumber =
            seat?.seat_number ??
            (row && number ? `${row}${number}` : "")
          const locationKey =
            seat?.location_key ??
            (row && number ? `${row}-${number}` : "")
          const fallbackLabel =
            seatNumber || `Seat ${index + 1}`

          return {
            id: seat?.id ?? `seat-${index + 1}`,
            x: Number(seat?.x ?? 0),
            y: Number(seat?.y ?? 0),
            width: Number(seat?.width ?? 1),
            height: Number(seat?.height ?? 1),
            rotation: Number(seat?.rotation ?? 0),
            row,
            number,
            seat_number: seatNumber,
            location_key: locationKey,
            label: seat?.label ?? fallbackLabel,
            seat_class: seat?.seat_class ?? "Regular",
            price: Number(seat?.price ?? 0),
          }
        })
      : [],
    screens: Array.isArray(seatLayout?.screens)
      ? seatLayout.screens.map((item, index) => ({
          id: item?.id ?? `screen-${index + 1}`,
          name: item?.name ?? "Screen",
          x: Number(item?.x ?? 0),
          y: Number(item?.y ?? 0),
          width: Number(item?.width ?? 6),
          height: Number(item?.height ?? 1.2),
          rotation: Number(item?.rotation ?? 0),
        }))
      : [],
    stages: Array.isArray(seatLayout?.stages)
      ? seatLayout.stages.map((item, index) => ({
          id: item?.id ?? `stage-${index + 1}`,
          name: item?.name ?? "Stage",
          x: Number(item?.x ?? 0),
          y: Number(item?.y ?? 0),
          width: Number(item?.width ?? 7),
          height: Number(item?.height ?? 2.4),
          rotation: Number(item?.rotation ?? 0),
        }))
      : [],
    audio_sources: Array.isArray(seatLayout?.audio_sources)
      ? seatLayout.audio_sources.map((item, index) => ({
          id: item?.id ?? `audio-${index + 1}`,
          name: item?.name ?? "Audio Source",
          x: Number(item?.x ?? 0),
          y: Number(item?.y ?? 0),
          width: Number(item?.width ?? 1.2),
          height: Number(item?.height ?? 1.2),
          rotation: Number(item?.rotation ?? 0),
        }))
      : [],
  }
}

function createSeat({
  id,
  row,
  number,
  x,
  y,
  seat_class = "Regular",
  price = 45,
  width = 1,
  height = 1,
  rotation = 0,
}) {
  const safeRow = String(row ?? "").trim()
  const safeNumber = String(number ?? "").trim()
  const seatNumber = safeRow && safeNumber ? `${safeRow}${safeNumber}` : ""
  const locationKey = safeRow && safeNumber ? `${safeRow}-${safeNumber}` : ""

  return {
    id: id ?? `seat-${safeRow}-${safeNumber}`,
    row: safeRow,
    number: safeNumber,
    seat_number: seatNumber,
    location_key: locationKey,
    label: seatNumber || "Seat",
    x,
    y,
    width,
    height,
    rotation,
    seat_class,
    price,
  }
}

function createScreen({
  id,
  name = "Screen",
  x = 0,
  y = 0,
  width = 6,
  height = 1.4,
  rotation = 0,
}) {
  return {
    id: id ?? crypto.randomUUID(),
    name,
    x,
    y,
    width,
    height,
    rotation,
  }
}

function createStage({
  id,
  name = "Stage",
  x = 0,
  y = 0,
  width = 7,
  height = 2.6,
  rotation = 0,
}) {
  return {
    id: id ?? crypto.randomUUID(),
    name,
    x,
    y,
    width,
    height,
    rotation,
  }
}

function createAudio({
  id,
  name = "Audio Source",
  x = 0,
  y = 0,
  width = 1.2,
  height = 1.2,
  rotation = 0,
}) {
  return {
    id: id ?? crypto.randomUUID(),
    name,
    x,
    y,
    width,
    height,
    rotation,
  }
}

function createSeatBlock({
  rows = [],
  startX = 0,
  startY = 0,
  seatGapX = 0.25,
  seatGapY = 0.45,
  seatsPerRow = 8,
  rowSpacingMultiplier = 1.45,
  seatClassByRow = {},
  priceByClass = {},
  skipSeats = [],
  customWidths = {},
}) {
  const result = []
  const skipSet = new Set(skipSeats)

  rows.forEach((rowName, rowIndex) => {
    for (let i = 1; i <= seatsPerRow; i += 1) {
      const key = `${rowName}-${i}`
      if (skipSet.has(key)) continue

      const seatClass = seatClassByRow[rowName] ?? "Regular"
      const width = Number(customWidths[key] ?? 1)

      result.push(
        createSeat({
          row: rowName,
          number: String(i),
          x: startX + (i - 1) * (1 + seatGapX),
          y: startY + rowIndex * (1 * rowSpacingMultiplier + seatGapY),
          seat_class: seatClass,
          price: Number(priceByClass[seatClass] ?? 45),
          width,
          height: 1,
        })
      )
    }
  })

  return result
}

function createCinemaLayout({
  width = 20,
  height = 12,
  screenLabel = "Screen",
  rows = ["A", "B", "C", "D", "E", "F"],
  seatsPerRow = 10,
  vipRows = ["A", "B"],
  centerGapAfter = 5,
  regularPrice = 35,
  vipPrice = 65,
}) {
  const seats = []

  rows.forEach((rowName, rowIndex) => {
    for (let seatNumber = 1; seatNumber <= seatsPerRow; seatNumber += 1) {
      const xBase = seatNumber <= centerGapAfter
        ? 3 + (seatNumber - 1) * 1.2
        : 3 + (seatNumber - 1) * 1.2 + 1.2

      seats.push(
        createSeat({
          row: rowName,
          number: String(seatNumber),
          x: xBase,
          y: 3.2 + rowIndex * 1.45,
          seat_class: vipRows.includes(rowName) ? "VIP" : "Regular",
          price: vipRows.includes(rowName) ? vipPrice : regularPrice,
        })
      )
    }
  })

  return {
    width,
    height,
    screens: [
      createScreen({
        name: screenLabel,
        x: 4,
        y: 0.8,
        width: 12,
        height: 1.6,
      }),
    ],
    stages: [],
    audio_sources: [
      createAudio({ name: "Left Speaker", x: 2.2, y: 1.1 }),
      createAudio({ name: "Right Speaker", x: 17, y: 1.1 }),
    ],
    seats,
  }
}

function createTheatreLayout({
  width = 24,
  height = 16,
  stageLabel = "Stage",
  rows = ["A", "B", "C", "D", "E", "F", "G", "H"],
  seatsPerSide = [4, 5, 5],
  regularPrice = 45,
  specialPrice = 75,
  vipPrice = 110,
}) {
  const seats = []
  const seatClassByRow = {
    A: "VIP",
    B: "VIP",
    C: "Special",
    D: "Special",
    E: "Regular",
    F: "Regular",
    G: "Regular",
    H: "Regular",
  }
  const priceByClass = {
    VIP: vipPrice,
    Special: specialPrice,
    Regular: regularPrice,
  }

  rows.forEach((rowName, rowIndex) => {
    const y = 4.6 + rowIndex * 1.45
    const seatClass = seatClassByRow[rowName]
    const price = priceByClass[seatClass]

    let leftIndex = 0
    for (let i = 1; i <= seatsPerSide[0]; i += 1) {
      leftIndex += 1
      seats.push(
        createSeat({
          row: rowName,
          number: String(leftIndex),
          x: 1.2 + (i - 1) * 1.15,
          y,
          seat_class: seatClass,
          price,
        })
      )
    }

    let middleIndex = seatsPerSide[0]
    for (let i = 1; i <= seatsPerSide[1]; i += 1) {
      middleIndex += 1
      seats.push(
        createSeat({
          row: rowName,
          number: String(middleIndex),
          x: 7.2 + (i - 1) * 1.15,
          y,
          seat_class: seatClass,
          price,
        })
      )
    }

    let rightIndex = seatsPerSide[0] + seatsPerSide[1]
    for (let i = 1; i <= seatsPerSide[2]; i += 1) {
      rightIndex += 1
      seats.push(
        createSeat({
          row: rowName,
          number: String(rightIndex),
          x: 14.7 + (i - 1) * 1.15,
          y,
          seat_class: seatClass,
          price,
        })
      )
    }
  })

  return {
    width,
    height,
    screens: [],
    stages: [
      createStage({
        name: stageLabel,
        x: 4.3,
        y: 0.9,
        width: 15.2,
        height: 2.4,
      }),
    ],
    audio_sources: [
      createAudio({ name: "Front Left", x: 3.2, y: 1.4 }),
      createAudio({ name: "Front Right", x: 19.2, y: 1.4 }),
    ],
    seats,
  }
}

function createArenaLayout({
  width = 26,
  height = 18,
  stageLabel = "Court",
  regularPrice = 30,
  vipPrice = 70,
}) {
  const seats = []

  const topRows = ["A", "B", "C"]
  const bottomRows = ["D", "E", "F"]
  const leftRows = ["L1", "L2", "L3", "L4"]
  const rightRows = ["R1", "R2", "R3", "R4"]

  topRows.forEach((row, rowIndex) => {
    for (let i = 1; i <= 8; i += 1) {
      seats.push(
        createSeat({
          row,
          number: String(i),
          x: 8.3 + (i - 1) * 1.2,
          y: 1.1 + rowIndex * 1.2,
          seat_class: rowIndex === 0 ? "VIP" : "Regular",
          price: rowIndex === 0 ? vipPrice : regularPrice,
        })
      )
    }
  })

  bottomRows.forEach((row, rowIndex) => {
    for (let i = 1; i <= 8; i += 1) {
      seats.push(
        createSeat({
          row,
          number: String(i),
          x: 8.3 + (i - 1) * 1.2,
          y: 13.3 + rowIndex * 1.2,
          seat_class: rowIndex === 0 ? "VIP" : "Regular",
          price: rowIndex === 0 ? vipPrice : regularPrice,
        })
      )
    }
  })

  leftRows.forEach((row, rowIndex) => {
    for (let i = 1; i <= 5; i += 1) {
      seats.push(
        createSeat({
          row,
          number: String(i),
          x: 2 + (i - 1) * 1.1,
          y: 5.4 + rowIndex * 1.35,
          seat_class: rowIndex === 0 ? "VIP" : "Regular",
          price: rowIndex === 0 ? vipPrice : regularPrice,
        })
      )
    }
  })

  rightRows.forEach((row, rowIndex) => {
    for (let i = 1; i <= 5; i += 1) {
      seats.push(
        createSeat({
          row,
          number: String(i),
          x: 19.4 + (i - 1) * 1.1,
          y: 5.4 + rowIndex * 1.35,
          seat_class: rowIndex === 0 ? "VIP" : "Regular",
          price: rowIndex === 0 ? vipPrice : regularPrice,
        })
      )
    }
  })

  return {
    width,
    height,
    screens: [
      createScreen({
        name: "Main Screen",
        x: 9.2,
        y: 0.1,
        width: 7.6,
        height: 1.1,
      }),
    ],
    stages: [
      createStage({
        name: stageLabel,
        x: 8.2,
        y: 5.1,
        width: 9.2,
        height: 6.7,
      }),
    ],
    audio_sources: [
      createAudio({ name: "Arena Left", x: 6.5, y: 4.5 }),
      createAudio({ name: "Arena Right", x: 18.2, y: 4.5 }),
    ],
    seats,
  }
}

function createConferenceLayout({
  width = 24,
  height = 15,
  screenLabel = "Presentation Screen",
  regularPrice = 55,
  specialPrice = 90,
  vipPrice = 130,
}) {
  const seats = []

  const rows = ["A", "B", "C", "D", "E", "F"]
  const seatClassByRow = {
    A: "VIP",
    B: "Special",
    C: "Special",
    D: "Regular",
    E: "Regular",
    F: "Regular",
  }
  const priceByClass = {
    VIP: vipPrice,
    Special: specialPrice,
    Regular: regularPrice,
  }

  rows.forEach((row, rowIndex) => {
    for (let i = 1; i <= 12; i += 1) {
      const x = i <= 6 ? 3.3 + (i - 1) * 1.15 : 4 + (i - 1) * 1.15

      seats.push(
        createSeat({
          row,
          number: String(i),
          x,
          y: 4.2 + rowIndex * 1.35,
          seat_class: seatClassByRow[row],
          price: priceByClass[seatClassByRow[row]],
        })
      )
    }
  })

  return {
    width,
    height,
    screens: [
      createScreen({
        name: screenLabel,
        x: 6,
        y: 1.1,
        width: 12,
        height: 1.4,
      }),
    ],
    stages: [
      createStage({
        name: "Conference Stage",
        x: 7.2,
        y: 2.8,
        width: 9.5,
        height: 1.1,
      }),
    ],
    audio_sources: [
      createAudio({ name: "Mic Left", x: 5, y: 2.7 }),
      createAudio({ name: "Mic Right", x: 18, y: 2.7 }),
    ],
    seats,
  }
}

export function maskBankAccountNumber(value = "") {
  const cleaned = String(value ?? "").replace(/\s+/g, "")
  if (!cleaned) return "-"
  if (cleaned.length <= 4) return cleaned
  return `${"*".repeat(Math.max(0, cleaned.length - 4))}${cleaned.slice(-4)}`
}

export class Venue {
  constructor({
    id,
    title,
    location,
    exact_address,
    availability,
    price_per_hour,
    price_per_day,
    capacity,
    status,
    category,
    type,
    review_rating,
    description,
    image,
    extra_images,
    contact_info,
    featured,
    owner_user_id,
    bank_account_info,
    seat_classes,
    accessible_seats,
    administration_blocks,
    seat_layout,
    created_at,
    updated_at,
  }) {
    this.id = id ?? crypto.randomUUID()
    this.title = title
    this.location = location
    this.exact_address = exact_address
    this.availability = availability
    this.price_per_hour = Number(price_per_hour ?? 0)
    this.price_per_day = Number(price_per_day ?? Math.max(0, Number(price_per_hour ?? 0) * 8))
    this.capacity = Number(capacity ?? 0)
    this.status = status
    this.category = category
    this.type = type
    this.review_rating = Number(review_rating ?? 0)
    this.description = description
    this.image = image
    this.extra_images = extra_images ?? []
    this.contact_info = contact_info ?? {
      address: "",
      phone: "",
      email: "",
      website: "",
      instagram: "",
    }
    this.featured = featured ?? false
    this.owner_user_id = owner_user_id ?? null
    this.bank_account_info = normalizeBankAccountInfo(bank_account_info)
    this.seat_classes = normalizeSeatClasses(seat_classes)
    this.accessible_seats = Boolean(accessible_seats)
    this.administration_blocks = normalizeAdministrationBlocks(administration_blocks)
    this.seat_layout = normalizeSeatLayout(seat_layout)
    this.created_at = created_at ?? new Date().toISOString()
    this.updated_at = updated_at ?? new Date().toISOString()
  }

  get all_images() {
    return [this.image, ...this.extra_images].filter(Boolean)
  }
}

function defaultVenues() {
  return [
    new Venue({
      id: "venue-1",
      title: "Complexe Culturel de Monastir",
      location: "Monastir",
      exact_address: "Avenue Taieb M'hiri, 5000 Monastir, Tunisia",
      availability: true,
      price_per_hour: 180,
      price_per_day: 1200,
      capacity: 350,
      status: "Active",
      category: "Theatre",
      type: "Indoor",
      review_rating: 4.5,
      description:
        "A public cultural venue in Monastir that hosts theatre, music, conferences, and community programming. It fits medium-scale cultural events and educational or artistic gatherings in a formal indoor setting.",
      ...getSeedVenueImages("Complexe Culturel de Monastir"),
      contact_info: {
        address: "Avenue Taieb M'hiri, 5000 Monastir, Tunisia",
        phone: "+216 73 462 665",
        email: "",
        website: "",
        instagram: ""
      },
      featured: true,
      owner_user_id: null,
      seat_classes: ["Regular", "VIP"],
      accessible_seats: true,
      seat_layout: createTheatreLayout({
        width: 24,
        height: 16,
        stageLabel: "Main Stage",
        regularPrice: 40,
        specialPrice: 0,
        vipPrice: 75,
      }),
      administration_blocks: [
        {
          id: "venue-1-admin-1",
          label: "Administration",
          type: "daily_closure",
          color: "error",
          is_recurring_daily: true,
          daily_start_hour: 22,
          daily_end_hour: 8,
          notes: "Closed every night."
        },
        {
          id: "venue-1-admin-2",
          label: "Administration",
          type: "inspection",
          color: "error",
          start_datetime: "2026-05-11T08:00:00.000Z",
          end_datetime: "2026-05-11T16:00:00.000Z",
          notes: "Safety inspection."
        }
      ],
    }),

    new Venue({
      id: "venue-2",
      title: "Pathé Azur City",
      location: "Ben Arous",
      exact_address: "Centre Commercial Azur City, Bou Mhel el-Bassatine 2032, Ben Arous, Tunisia",
      availability: true,
      price_per_hour: 250,
      price_per_day: 1700,
      capacity: 420,
      status: "Active",
      category: "Cinema",
      type: "Indoor",
      review_rating: 4.6,
      description:
        "A modern Pathé multiplex at Azur City with six cinema halls, numbered seating, accessibility features, Dolby Atmos, free parking, and event-friendly screening spaces. It works especially well for premieres, branded screenings, and film-centered experiences.",
      ...getSeedVenueImages("Pathé Azur City"),
      contact_info: {
        address: "Centre Commercial Azur City, Bou Mhel el-Bassatine 2032, Ben Arous, Tunisia",
        phone: "",
        email: "",
        website: "https://www.pathe.tn/fr/cinemas/cinema-pathe-azur-city",
        instagram: ""
      },
      featured: true,
      owner_user_id: null,
      seat_classes: ["Regular", "VIP"],
      accessible_seats: true,
      seat_layout: createCinemaLayout({
        width: 20,
        height: 12,
        screenLabel: "Cinema Screen",
        rows: ["A", "B", "C", "D", "E", "F", "G"],
        seatsPerRow: 12,
        vipRows: ["A", "B"],
        centerGapAfter: 6,
        regularPrice: 28,
        vipPrice: 50,
      }),
      administration_blocks: [
        {
          id: "venue-2-admin-1",
          label: "Administration",
          type: "daily_closure",
          color: "error",
          is_recurring_daily: true,
          daily_start_hour: 1,
          daily_end_hour: 10,
          notes: "Closed overnight and early morning."
        },
        {
          id: "venue-2-admin-2",
          label: "Administration",
          type: "maintenance",
          color: "error",
          start_datetime: "2026-05-18T06:00:00.000Z",
          end_datetime: "2026-05-18T14:00:00.000Z",
          notes: "Projector and hall maintenance."
        }
      ],
    }),

    new Venue({
      id: "venue-3",
      title: "Théâtre municipal de Tunis",
      location: "Tunis",
      exact_address: "2 rue de Grèce, 1000 Tunis, Tunisia",
      availability: true,
      price_per_hour: 300,
      price_per_day: 2100,
      capacity: 1350,
      status: "Active",
      category: "Theatre",
      type: "Indoor",
      review_rating: 4.7,
      description:
        "One of Tunis’s most emblematic performance venues, known for its historic architecture and central location near Avenue Habib Bourguiba. It is especially suited to theatre, concerts, formal performances, and prestigious cultural evenings.",
      ...getSeedVenueImages("Théâtre municipal de Tunis"),
      contact_info: {
        address: "2 rue de Grèce, 1000 Tunis, Tunisia",
        phone: "+216 71 240 880",
        email: "",
        website: "http://www.theatremunicipal-tunis.gov.tn/",
        instagram: ""
      },
      featured: true,
      owner_user_id: null,
      seat_classes: ["Regular", "Special", "VIP"],
      accessible_seats: true,
      seat_layout: createTheatreLayout({
        width: 24,
        height: 16,
        stageLabel: "Historic Stage",
        regularPrice: 45,
        specialPrice: 70,
        vipPrice: 110,
      }),
      administration_blocks: [
        {
          id: "venue-3-admin-1",
          label: "Administration",
          type: "daily_closure",
          color: "error",
          is_recurring_daily: true,
          daily_start_hour: 23,
          daily_end_hour: 9,
          notes: "Closed outside operating hours."
        },
        {
          id: "venue-3-admin-2",
          label: "Administration",
          type: "renovation",
          color: "error",
          start_datetime: "2026-06-02T00:00:00.000Z",
          end_datetime: "2026-06-04T23:59:59.000Z",
          notes: "Backstage renovation period."
        }
      ],
    }),

    new Venue({
      id: "venue-4",
      title: "Théâtre de l’Opéra de Tunis",
      location: "Tunis",
      exact_address: "Avenue Mohamed V, 1000 Tunis, Tunisia",
      availability: true,
      price_per_hour: 400,
      price_per_day: 2900,
      capacity: 1800,
      status: "Active",
      category: "Theatre",
      type: "Indoor",
      review_rating: 4.8,
      description:
        "A flagship performance venue based at Cité de la Culture in Tunis. The Opera of Tunis brings together theatre, music, opera, ballet, and choreographic arts, making this venue ideal for large artistic productions and high-level cultural programming.",
      ...getSeedVenueImages("Théâtre de l’Opéra de Tunis"),
      contact_info: {
        address: "Avenue Mohamed V, 1000 Tunis, Tunisia",
        phone: "+216 70 028 440",
        email: "programmation@opera-tunis.tn",
        website: "https://tunisianopera.tn/",
        instagram: ""
      },
      featured: true,
      owner_user_id: null,
      seat_classes: ["Regular", "Special", "VIP"],
      accessible_seats: true,
      seat_layout: createTheatreLayout({
        width: 25,
        height: 17,
        stageLabel: "Opera Stage",
        regularPrice: 55,
        specialPrice: 85,
        vipPrice: 130,
      }),
      administration_blocks: [
        {
          id: "venue-4-admin-1",
          label: "Administration",
          type: "daily_closure",
          color: "error",
          is_recurring_daily: true,
          daily_start_hour: 0,
          daily_end_hour: 11,
          notes: "Closed mornings."
        },
        {
          id: "venue-4-admin-2",
          label: "Administration",
          type: "maintenance",
          color: "error",
          start_datetime: "2026-05-25T07:00:00.000Z",
          end_datetime: "2026-05-25T19:00:00.000Z",
          notes: "Audio and stage systems maintenance."
        }
      ],
    }),

    new Venue({
      id: "venue-5",
      title: "Pathé Tunis City",
      location: "Ariana",
      exact_address: "Centre Commercial Tunis City, 2032 Cebalat Ben Ammar, Ariana, Tunisia",
      availability: true,
      price_per_hour: 260,
      price_per_day: 1750,
      capacity: 450,
      status: "Active",
      category: "Cinema",
      type: "Indoor",
      review_rating: 4.5,
      description:
        "A large contemporary Pathé multiplex at Tunis City with eight halls, modern projection technology, numbered seating, accessibility options, and family-friendly services. It is a strong fit for screenings, launches, and cinema-based events.",
      ...getSeedVenueImages("Pathé Tunis City"),
      contact_info: {
        address: "Centre Commercial Tunis City, 2032 Cebalat Ben Ammar, Ariana, Tunisia",
        phone: "",
        email: "",
        website: "https://www.pathe.tn/fr/cinemas/cinema-pathe-tunis-city",
        instagram: ""
      },
      featured: true,
      owner_user_id: null,
      seat_classes: ["Regular", "VIP"],
      accessible_seats: true,
      seat_layout: createCinemaLayout({
        width: 21,
        height: 12,
        screenLabel: "Premium Screen",
        rows: ["A", "B", "C", "D", "E", "F", "G"],
        seatsPerRow: 14,
        vipRows: ["A", "B"],
        centerGapAfter: 7,
        regularPrice: 30,
        vipPrice: 55,
      }),
      administration_blocks: [
        {
          id: "venue-5-admin-1",
          label: "Administration",
          type: "daily_closure",
          color: "error",
          is_recurring_daily: true,
          daily_start_hour: 2,
          daily_end_hour: 9,
          notes: "Closed overnight."
        },
        {
          id: "venue-5-admin-2",
          label: "Administration",
          type: "inspection",
          color: "error",
          start_datetime: "2026-06-12T05:00:00.000Z",
          end_datetime: "2026-06-12T13:00:00.000Z",
          notes: "Cinema hall inspection."
        }
      ],
    }),

    new Venue({
      id: "venue-6",
      title: "Pathé Mall of Sousse",
      location: "Sousse",
      exact_address: "Mall of Sousse, 4060 Kalâa Kebira, Sousse, Tunisia",
      availability: true,
      price_per_hour: 240,
      price_per_day: 1650,
      capacity: 420,
      status: "Active",
      category: "Cinema",
      type: "Indoor",
      review_rating: 4.4,
      description:
        "A modern multiplex inside Mall of Sousse with six halls, contemporary cinema technology, and event-ready screening comfort. It is well suited for film releases, special screenings, and public entertainment events in the Sousse area.",
      ...getSeedVenueImages("Pathé Mall of Sousse"),
      contact_info: {
        address: "Mall of Sousse, 4060 Kalâa Kebira, Sousse, Tunisia",
        phone: "",
        email: "",
        website: "https://www.pathe.tn/fr/cinemas/cinema-pathe-mall-of-sousse",
        instagram: ""
      },
      featured: false,
      owner_user_id: null,
      seat_classes: ["Regular", "VIP"],
      accessible_seats: true,
      seat_layout: createCinemaLayout({
        width: 20,
        height: 12,
        screenLabel: "Mall Screen",
        rows: ["A", "B", "C", "D", "E", "F"],
        seatsPerRow: 12,
        vipRows: ["A"],
        centerGapAfter: 6,
        regularPrice: 26,
        vipPrice: 45,
      }),
      administration_blocks: [
        {
          id: "venue-6-admin-1",
          label: "Administration",
          type: "daily_closure",
          color: "error",
          is_recurring_daily: true,
          daily_start_hour: 1,
          daily_end_hour: 11,
          notes: "Closed mornings."
        },
        {
          id: "venue-6-admin-2",
          label: "Administration",
          type: "maintenance",
          color: "error",
          start_datetime: "2026-05-28T00:00:00.000Z",
          end_datetime: "2026-05-29T23:59:59.000Z",
          notes: "Full multiplex maintenance."
        }
      ],
    }),

    new Venue({
      id: "venue-7",
      title: "Palais Ennejma Ezzahra",
      location: "Tunis",
      exact_address: "8 rue du 2 mars 1934, 2026 Sidi Bou Saïd, Tunisia",
      availability: true,
      price_per_hour: 320,
      price_per_day: 2200,
      capacity: 250,
      status: "Active",
      category: "Other",
      type: "Indoor",
      review_rating: 4.8,
      description:
        "An exceptional historic palace in Sidi Bou Saïd and home to the Centre des Musiques Arabes et Méditerranéennes. Known for its heritage value, architecture, and musical identity, it is perfect for refined cultural events, chamber performances, and premium heritage experiences.",
      ...getSeedVenueImages("Palais Ennejma Ezzahra"),
      contact_info: {
        address: "8 rue du 2 mars 1934, 2026 Sidi Bou Saïd, Tunisia",
        phone: "+216 71 746 051",
        email: "info@cmam.tn",
        website: "https://www.cmam.tn/",
        instagram: ""
      },
      featured: false,
      owner_user_id: null,
      seat_classes: ["Regular", "VIP"],
      accessible_seats: false,
      administration_blocks: [
        {
          id: "venue-7-admin-1",
          label: "Administration",
          type: "daily_closure",
          color: "error",
          is_recurring_daily: true,
          daily_start_hour: 18,
          daily_end_hour: 9,
          notes: "Heritage venue with shorter daily operating window."
        },
        {
          id: "venue-7-admin-2",
          label: "Administration",
          type: "inspection",
          color: "error",
          start_datetime: "2026-06-08T08:00:00.000Z",
          end_datetime: "2026-06-08T18:00:00.000Z",
          notes: "Heritage preservation inspection."
        }
      ],
    }),

    new Venue({
      id: "venue-8",
      title: "Amphithéâtre de Carthage",
      location: "Tunis",
      exact_address: "Rue Sophonisbe, Carthage Hannibal 2016, Tunisia",
      availability: false,
      price_per_hour: 500,
      price_per_day: 3600,
      capacity: 30000,
      status: "Unavailable",
      category: "Stadium",
      type: "Outdoor",
      review_rating: 4.9,
      description:
        "A monumental historic site in Carthage with major symbolic and visual prestige. In the app context, it is best suited to large-scale open-air concerts, festival programming, and landmark cultural experiences.",
      ...getSeedVenueImages("Amphithéâtre de Carthage"),
      contact_info: {
        address: "Rue Sophonisbe, Carthage Hannibal 2016, Tunisia",
        phone: "",
        email: "",
        website: "",
        instagram: ""
      },
      featured: false,
      owner_user_id: null,
      seat_classes: ["Regular", "Special", "VIP"],
      accessible_seats: true,
      administration_blocks: [
        {
          id: "venue-8-admin-1",
          label: "Administration",
          type: "full_closure",
          color: "error",
          start_datetime: "2026-04-15T00:00:00.000Z",
          end_datetime: "2026-06-30T23:59:59.000Z",
          notes: "Closed 24/7 for preservation and restricted access."
        }
      ],
    }),

    new Venue({
      id: "venue-9",
      title: "Stade Olympique de Radès",
      location: "Ben Arous",
      exact_address: "Radès 2040, Ben Arous, Tunisia",
      availability: true,
      price_per_hour: 800,
      price_per_day: 5600,
      capacity: 60000,
      status: "Active",
      category: "Stadium",
      type: "Outdoor",
      review_rating: 4.7,
      description:
        "A major national stadium in the Greater Tunis area designed for high-capacity sports events and major public gatherings. It is best matched with football fixtures, finals, and large audience productions.",
      ...getSeedVenueImages("Stade Olympique de Radès"),
      contact_info: {
        address: "Radès 2040, Ben Arous, Tunisia",
        phone: "+216 71 448 844",
        email: "",
        website: "",
        instagram: ""
      },
      featured: true,
      owner_user_id: null,
      seat_classes: ["Regular", "Special", "VIP"],
      accessible_seats: true,
      administration_blocks: [
        {
          id: "venue-9-admin-1",
          label: "Administration",
          type: "daily_closure",
          color: "error",
          is_recurring_daily: true,
          daily_start_hour: 0,
          daily_end_hour: 7,
          notes: "Closed overnight."
        },
        {
          id: "venue-9-admin-2",
          label: "Administration",
          type: "inspection",
          color: "error",
          start_datetime: "2026-05-22T08:00:00.000Z",
          end_datetime: "2026-05-22T15:00:00.000Z",
          notes: "Field and stands inspection."
        }
      ],
    }),

    new Venue({
      id: "venue-10",
      title: "Stade Olympique de Sousse",
      location: "Sousse",
      exact_address: "Boulevard du 14 Janvier, Sousse 4000, Tunisia",
      availability: true,
      price_per_hour: 600,
      price_per_day: 4300,
      capacity: 40000,
      status: "Active",
      category: "Stadium",
      type: "Outdoor",
      review_rating: 4.6,
      description:
        "A large football stadium in Sousse suitable for league matches, cup fixtures, and major sporting crowds. It works especially well in the app for high-energy sports events and large attendance scenarios.",
      ...getSeedVenueImages("Stade Olympique de Sousse"),
      contact_info: {
        address: "Boulevard du 14 Janvier, Sousse 4000, Tunisia",
        phone: "+216 73 225 900",
        email: "",
        website: "",
        instagram: ""
      },
      featured: true,
      owner_user_id: null,
      seat_classes: ["Regular", "Special", "VIP"],
      accessible_seats: true,
      administration_blocks: [
        {
          id: "venue-10-admin-1",
          label: "Administration",
          type: "daily_closure",
          color: "error",
          is_recurring_daily: true,
          daily_start_hour: 21,
          daily_end_hour: 8,
          notes: "Closed every night."
        },
        {
          id: "venue-10-admin-2",
          label: "Administration",
          type: "maintenance",
          color: "error",
          start_datetime: "2026-06-15T00:00:00.000Z",
          end_datetime: "2026-06-16T23:59:59.000Z",
          notes: "Grass and lighting maintenance."
        }
      ],
    }),

    new Venue({
      id: "venue-11",
      title: "Salle Couverte Mohamed Mzali",
      location: "Monastir",
      exact_address: "Monastir, Tunisia",
      availability: true,
      price_per_hour: 280,
      price_per_day: 1950,
      capacity: 5000,
      status: "Active",
      category: "Stadium",
      type: "Indoor",
      review_rating: 4.5,
      description:
        "A well-known indoor sports hall in Monastir associated with basketball and other indoor events. It is a strong fit for derbies, tournaments, and mid-to-large indoor sporting programs.",
      ...getSeedVenueImages("Salle Couverte Mohamed Mzali"),
      contact_info: {
        address: "Monastir, Tunisia",
        phone: "",
        email: "",
        website: "",
        instagram: ""
      },
      featured: false,
      owner_user_id: null,
      seat_classes: ["Regular", "VIP"],
      accessible_seats: true,
      seat_layout: createArenaLayout({
        width: 26,
        height: 18,
        stageLabel: "Basketball Court",
        regularPrice: 25,
        vipPrice: 50,
      }),
      administration_blocks: [
        {
          id: "venue-11-admin-1",
          label: "Administration",
          type: "daily_closure",
          color: "error",
          is_recurring_daily: true,
          daily_start_hour: 23,
          daily_end_hour: 8,
          notes: "Closed overnight."
        },
        {
          id: "venue-11-admin-2",
          label: "Administration",
          type: "inspection",
          color: "error",
          start_datetime: "2026-05-14T09:00:00.000Z",
          end_datetime: "2026-05-14T13:00:00.000Z",
          notes: "Court inspection."
        }
      ],
    }),

    new Venue({
      id: "venue-12",
      title: "Dar El Marsa Rooftop Bar",
      location: "Tunis",
      exact_address: "75 Avenue Taieb Mhiri, La Marsa 2078, Tunisia",
      availability: true,
      price_per_hour: 160,
      price_per_day: 1100,
      capacity: 120,
      status: "Active",
      category: "Bar Scene",
      type: "Indoor",
      review_rating: 4.5,
      description:
        "An upscale rooftop venue at Dar El Marsa in La Marsa, known for sea views and a polished social atmosphere. It fits afterwork gatherings, small private events, networking evenings, and premium lounge-style experiences.",
      ...getSeedVenueImages("Dar El Marsa Rooftop Bar"),
      contact_info: {
        address: "75 Avenue Taieb Mhiri, La Marsa 2078, Tunisia",
        phone: "",
        email: "",
        website: "https://www.darelmarsa.com/",
        instagram: ""
      },
      featured: false,
      owner_user_id: null,
      seat_classes: ["Regular", "VIP"],
      accessible_seats: false,
      administration_blocks: [
        {
          id: "venue-12-admin-1",
          label: "Administration",
          type: "daily_closure",
          color: "error",
          is_recurring_daily: true,
          daily_start_hour: 2,
          daily_end_hour: 17,
          notes: "Open mainly evenings and late nights."
        },
        {
          id: "venue-12-admin-2",
          label: "Administration",
          type: "maintenance",
          color: "error",
          start_datetime: "2026-06-05T08:00:00.000Z",
          end_datetime: "2026-06-05T17:00:00.000Z",
          notes: "Terrace maintenance."
        }
      ],
    }),

    new Venue({
      id: "venue-13",
      title: "The Saloon",
      location: "Sousse",
      exact_address: "Boulevard 14 Janvier, Sousse, Tunisia",
      availability: true,
      price_per_hour: 140,
      price_per_day: 950,
      capacity: 110,
      status: "Active",
      category: "Bar Scene",
      type: "Indoor",
      review_rating: 3.6,
      description:
        "A social nightlife-style venue in Sousse suited to smaller gatherings, comedy nights, casual live entertainment, and relaxed evening bookings.",
      ...getSeedVenueImages("The Saloon"),
      contact_info: {
        address: "Boulevard 14 Janvier, Sousse, Tunisia",
        phone: "",
        email: "",
        website: "",
        instagram: ""
      },
      featured: false,
      owner_user_id: null,
      seat_classes: ["Regular"],
      accessible_seats: false,
      administration_blocks: [
        {
          id: "venue-13-admin-1",
          label: "Administration",
          type: "daily_closure",
          color: "error",
          is_recurring_daily: true,
          daily_start_hour: 3,
          daily_end_hour: 18,
          notes: "Night venue, closed most of the day."
        }
      ],
    }),

    new Venue({
      id: "venue-14",
      title: "Sangho Le Syphax Bar",
      location: "Sfax",
      exact_address: "Route Soukra, Sfax, Tunisia",
      availability: true,
      price_per_hour: 130,
      price_per_day: 900,
      capacity: 100,
      status: "Active",
      category: "Bar Scene",
      type: "Indoor",
      review_rating: 4.0,
      description:
        "A lounge-style hotel bar option in Sfax that works well for smaller social events, relaxed evening bookings, and intimate private gatherings.",
      ...getSeedVenueImages("Sangho Le Syphax Bar"),
      contact_info: {
        address: "Route Soukra, Sfax, Tunisia",
        phone: "",
        email: "",
        website: "",
        instagram: ""
      },
      featured: false,
      owner_user_id: null,
      seat_classes: ["Regular"],
      accessible_seats: false,
      administration_blocks: [
        {
          id: "venue-14-admin-1",
          label: "Administration",
          type: "full_closure",
          color: "error",
          start_datetime: "2026-05-20T00:00:00.000Z",
          end_datetime: "2026-05-27T23:59:59.000Z",
          notes: "Closed 24/7 for renovation."
        }
      ],
    }),

    new Venue({
      id: "venue-15",
      title: "Tunis Marriott Hotel",
      location: "Tunis",
      exact_address: "Centre Urbain Nord, 1082 Tunis, Tunisia",
      availability: true,
      price_per_hour: 420,
      price_per_day: 3000,
      capacity: 700,
      status: "Active",
      category: "Other",
      type: "Indoor",
      review_rating: 4.5,
      description:
        "A premium hotel in Centre Urbain Nord with meeting space and business-oriented amenities. It is well suited to conferences, corporate receptions, networking events, and professional hosted gatherings.",
      ...getSeedVenueImages("Tunis Marriott Hotel"),
      contact_info: {
        address: "Centre Urbain Nord, 1082 Tunis, Tunisia",
        phone: "",
        email: "",
        website: "https://www.marriott.com/",
        instagram: ""
      },
      featured: false,
      owner_user_id: null,
      seat_classes: ["Regular", "Special", "VIP"],
      accessible_seats: true,
      seat_layout: createConferenceLayout({
        width: 24,
        height: 15,
        screenLabel: "Conference Screen",
        regularPrice: 60,
        specialPrice: 95,
        vipPrice: 145,
      }),
      administration_blocks: [
        {
          id: "venue-15-admin-1",
          label: "Administration",
          type: "daily_closure",
          color: "error",
          is_recurring_daily: true,
          daily_start_hour: 0,
          daily_end_hour: 6,
          notes: "Unavailable for bookings during hotel reset hours."
        },
        {
          id: "venue-15-admin-2",
          label: "Administration",
          type: "inspection",
          color: "error",
          start_datetime: "2026-05-30T07:00:00.000Z",
          end_datetime: "2026-05-30T12:00:00.000Z",
          notes: "Ballroom and event systems inspection."
        }
      ],
    }),

    new Venue({
      id: "venue-16",
      title: "Marina Cap Monastir Appart Hôtel",
      location: "Monastir",
      exact_address: "Port de plaisance Marina Cap Monastir, 5000 Monastir, Tunisia",
      availability: true,
      price_per_hour: 210,
      price_per_day: 1450,
      capacity: 240,
      status: "Active",
      category: "Other",
      type: "Indoor",
      review_rating: 4.2,
      description:
        "A marina-side hospitality complex in Monastir positioned near the port and seafront. It is suitable for seaside receptions, private functions, lifestyle events, and guest-friendly hosted gatherings.",
      ...getSeedVenueImages("Marina Cap Monastir Appart Hôtel"),
      contact_info: {
        address: "Port de plaisance Marina Cap Monastir, 5000 Monastir, Tunisia",
        phone: "",
        email: "",
        website: "https://www.marinacapmonastir.com/",
        instagram: ""
      },
      featured: false,
      owner_user_id: null,
      seat_classes: ["Regular", "VIP"],
      accessible_seats: true,
      administration_blocks: [
        {
          id: "venue-16-admin-1",
          label: "Administration",
          type: "daily_closure",
          color: "error",
          is_recurring_daily: true,
          daily_start_hour: 23,
          daily_end_hour: 7,
          notes: "Closed overnight."
        },
        {
          id: "venue-16-admin-2",
          label: "Administration",
          type: "maintenance",
          color: "error",
          start_datetime: "2026-06-20T00:00:00.000Z",
          end_datetime: "2026-06-21T23:59:59.000Z",
          notes: "Waterfront maintenance and restricted access."
        }
      ],
    }),

    new Venue({
      id: "venue-17",
      title: "Sousse Palace Hotel & Spa",
      location: "Sousse",
      exact_address: "30 Avenue Habib Bourguiba, 4000 Sousse, Tunisia",
      availability: true,
      price_per_hour: 350,
      price_per_day: 2450,
      capacity: 500,
      status: "Active",
      category: "Other",
      type: "Indoor",
      review_rating: 4.3,
      description:
        "A centrally located hotel and spa in Sousse with hospitality capacity suited to conferences, receptions, corporate stays, and polished social events. Its location near the city center makes it practical for hosted programs and guest access.",
      ...getSeedVenueImages("Sousse Palace Hotel & Spa"),
      contact_info: {
        address: "30 Avenue Habib Bourguiba, 4000 Sousse, Tunisia",
        phone: "",
        email: "",
        website: "",
        instagram: ""
      },
      featured: false,
      owner_user_id: null,
      seat_classes: ["Regular", "Special", "VIP"],
      accessible_seats: true,
      administration_blocks: [
        {
          id: "venue-17-admin-1",
          label: "Administration",
          type: "daily_closure",
          color: "error",
          is_recurring_daily: true,
          daily_start_hour: 1,
          daily_end_hour: 8,
          notes: "Closed during early morning operating reset."
        },
        {
          id: "venue-17-admin-2",
          label: "Administration",
          type: "inspection",
          color: "error",
          start_datetime: "2026-05-17T08:00:00.000Z",
          end_datetime: "2026-05-17T11:00:00.000Z",
          notes: "Conference hall inspection."
        }
      ],
    })
  ]
}

function normalizeVenues(rawVenues = []) {
  return rawVenues.map(venue => new Venue(venue))
}

function loadVenues() {
  const defaults = defaultVenues()
  const defaultVenueIds = new Set(defaults.map(venue => venue.id))
  const savedVersion = localStorage.getItem(VENUES_VERSION_KEY)
  const savedVenues = localStorage.getItem(VENUES_STORAGE_KEY)

  if (savedVersion !== VENUES_SEED_VERSION) {
    let preservedCustomVenues = []

    if (savedVenues) {
      try {
        const parsedSavedVenues = normalizeVenues(JSON.parse(savedVenues))
        preservedCustomVenues = parsedSavedVenues.filter(
          venue => !defaultVenueIds.has(venue.id)
        )
      } catch (error) {
        console.error("Failed to parse saved venues while reseeding defaults.", error)
      }
    }

    const mergedVenues = [...defaults, ...preservedCustomVenues].map(venue => new Venue(venue))

    localStorage.setItem(VENUES_STORAGE_KEY, JSON.stringify(mergedVenues))
    localStorage.setItem(VENUES_VERSION_KEY, VENUES_SEED_VERSION)
    return mergedVenues
  }

  if (savedVenues) {
    try {
      const parsedVenues = normalizeVenues(JSON.parse(savedVenues))
      const mergedVenues = [...parsedVenues]

      for (const defaultVenue of defaults) {
        const alreadyExists = mergedVenues.some(venue => venue.id === defaultVenue.id)
        if (!alreadyExists) {
          mergedVenues.push(defaultVenue)
        }
      }

      return mergedVenues.map(venue => new Venue(venue))
    } catch (error) {
      console.error("Failed to parse saved venues. Loading defaults instead.", error)
    }
  }

  localStorage.setItem(VENUES_STORAGE_KEY, JSON.stringify(defaults))
  localStorage.setItem(VENUES_VERSION_KEY, VENUES_SEED_VERSION)
  return defaults
}

export const VENUE_LIST = reactive(loadVenues())

function saveVenues() {
  localStorage.setItem(VENUES_STORAGE_KEY, JSON.stringify(VENUE_LIST))
}

function expandRecurringDailyAdministrationBlocks(venue, rangeStartIso, rangeEndIso) {
  const rangeStart = new Date(rangeStartIso)
  const rangeEnd = new Date(rangeEndIso)

  if (!Number.isFinite(rangeStart.getTime()) || !Number.isFinite(rangeEnd.getTime())) {
    return []
  }

  const results = []
  const blocks = Array.isArray(venue?.administration_blocks) ? venue.administration_blocks : []

  const current = new Date(rangeStart)
  current.setHours(0, 0, 0, 0)

  while (current <= rangeEnd) {
    const currentDayStart = new Date(current)

    blocks.forEach(block => {
      if (!block.is_recurring_daily) return

      const startHour = Number(block.daily_start_hour)
      const endHour = Number(block.daily_end_hour)

      if (!Number.isFinite(startHour) || !Number.isFinite(endHour)) return

      const blockStart = new Date(currentDayStart)
      blockStart.setHours(startHour, 0, 0, 0)

      const blockEnd = new Date(currentDayStart)
      blockEnd.setHours(endHour, 0, 0, 0)

      if (endHour <= startHour) {
        blockEnd.setDate(blockEnd.getDate() + 1)
      }

      if (blockStart < rangeEnd && blockEnd > rangeStart) {
        results.push({
          ...block,
          venue_id: venue.id,
          occurrence_start: blockStart.toISOString(),
          occurrence_end: blockEnd.toISOString(),
        })
      }
    })

    current.setDate(current.getDate() + 1)
  }

  return results
}

function getFixedAdministrationBlocks(venue, rangeStartIso, rangeEndIso) {
  const rangeStart = new Date(rangeStartIso)
  const rangeEnd = new Date(rangeEndIso)

  if (!Number.isFinite(rangeStart.getTime()) || !Number.isFinite(rangeEnd.getTime())) {
    return []
  }

  const blocks = Array.isArray(venue?.administration_blocks) ? venue.administration_blocks : []

  return blocks
    .filter(block => !block.is_recurring_daily)
    .filter(block => {
      const start = new Date(block.start_datetime)
      const end = new Date(block.end_datetime)
      return start < rangeEnd && end > rangeStart
    })
    .map(block => ({
      ...block,
      venue_id: venue.id,
      occurrence_start: block.start_datetime,
      occurrence_end: block.end_datetime,
    }))
}

export function get_Venue_Administration_Blocks_For_Range(venueId, rangeStartIso, rangeEndIso) {
  const venue = typeof venueId === "string" ? get_Venue_By_Id(venueId) : venueId
  if (!venue) return []

  const recurring = expandRecurringDailyAdministrationBlocks(venue, rangeStartIso, rangeEndIso)
  const fixed = getFixedAdministrationBlocks(venue, rangeStartIso, rangeEndIso)

  return [...fixed, ...recurring].sort((a, b) => {
    return new Date(a.occurrence_start).getTime() - new Date(b.occurrence_start).getTime()
  })
}

export function does_Venue_Have_Administration_Conflict(venueId, startDateTime, endDateTime) {
  if (!venueId || !startDateTime || !endDateTime) return false

  const start = new Date(startDateTime)
  const end = new Date(endDateTime)

  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) {
    return false
  }

  const blocks = get_Venue_Administration_Blocks_For_Range(
    venueId,
    start.toISOString(),
    end.toISOString()
  )

  return blocks.some(block => {
    const blockStart = new Date(block.occurrence_start)
    const blockEnd = new Date(block.occurrence_end)
    return start < blockEnd && end > blockStart
  })
}

export function get_Default_Admin_User_Id() {
  return DEFAULT_ADMIN_USER_ID
}

export function get_Venue_Payment_Recipient_User_Id(venueOrVenueId) {
  const venue =
    typeof venueOrVenueId === "string"
      ? get_Venue_By_Id(venueOrVenueId)
      : venueOrVenueId

  if (!venue) return DEFAULT_ADMIN_USER_ID
  return venue.owner_user_id || DEFAULT_ADMIN_USER_ID
}

export function get_Venue_Private_Bank_Info(venueOrVenueId, currentUserId = null) {
  const venue =
    typeof venueOrVenueId === "string"
      ? get_Venue_By_Id(venueOrVenueId)
      : venueOrVenueId

  if (!venue || !currentUserId || venue.owner_user_id !== currentUserId) return null
  return normalizeBankAccountInfo(venue.bank_account_info)
}

export function get_Venue_By_Title(title) {
  return VENUE_LIST.find(
    venue =>
      venue.title.trim().toLowerCase() === String(title ?? "").trim().toLowerCase()
  ) || null
}

export function get_All_Venues() {
  return VENUE_LIST
}

export function get_Venue_By_Id(id) {
  return VENUE_LIST.find(v => v.id === id) || null
}

export function get_Venues_By_Owner_Id(ownerUserId) {
  if (!ownerUserId) return []
  return VENUE_LIST.filter(v => v.owner_user_id === ownerUserId)
}

export function add_Venue(venueData) {
  const venue = venueData instanceof Venue ? venueData : new Venue(venueData)
  VENUE_LIST.push(venue)
  saveVenues()
  return venue
}

export function update_Venue(id, updatedVenueData) {
  const index = VENUE_LIST.findIndex(v => v.id === id)

  if (index !== -1) {
    VENUE_LIST[index] = new Venue({
      ...VENUE_LIST[index],
      ...updatedVenueData,
      id: VENUE_LIST[index].id,
      updated_at: new Date().toISOString(),
    })
    saveVenues()
    return VENUE_LIST[index]
  }

  return null
}

export function delete_Venue(id) {
  const index = VENUE_LIST.findIndex(v => v.id === id)

  if (index !== -1) {
    const deleted = VENUE_LIST[index]
    VENUE_LIST.splice(index, 1)
    saveVenues()
    return deleted
  }

  return null
}

export function can_User_Manage_Venue(user, venue) {
  if (!user || !venue) return false
  return Boolean(
    user.is_admin ||
    user.is_moderator ||
    venue.owner_user_id === user.id
  )
}

export function get_Venue_Count() {
  return VENUE_LIST.length
}

export function get_Available_Venues() {
  return VENUE_LIST.filter(v => v.availability === true)
}

export function venue_Has_Manual_Seat_Layout(venueOrVenueId) {
  const venue =
    typeof venueOrVenueId === "string"
      ? get_Venue_By_Id(venueOrVenueId)
      : venueOrVenueId

  return Boolean(
    venue?.seat_layout &&
    Array.isArray(venue.seat_layout.seats) &&
    venue.seat_layout.seats.length
  )
}

export function get_Venue_Seat_Layout(venueOrVenueId) {
  const venue =
    typeof venueOrVenueId === "string"
      ? get_Venue_By_Id(venueOrVenueId)
      : venueOrVenueId

  return venue?.seat_layout ?? null
}