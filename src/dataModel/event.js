import { reactive } from "vue"

const EVENTS_STORAGE_KEY = "events"
const EVENTS_VERSION_KEY = "events_seed_version"
const EVENTS_SEED_VERSION = "v6_events_with_thematic_artist_assignments"

function toNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function deepClone(value) {
  try {
    return JSON.parse(JSON.stringify(value))
  } catch (error) {
    console.error("Failed to deep clone event data.", error)
    return null
  }
}

function normalizeSeatClass(value) {
  const text = String(value ?? "").trim().toLowerCase()
  if (!text) return null
  if (text === "regular" || text === "normal") return "Normal"
  if (text === "special") return "Special"
  if (text === "vip") return "VIP"
  return String(value ?? "").trim() || null
}

function normalizeSeatClasses(seatClasses = [], seatLayout = null) {
  const result = []
  const pushUnique = value => {
    const normalized = normalizeSeatClass(value)
    if (normalized && !result.includes(normalized)) {
      result.push(normalized)
    }
  }

  if (Array.isArray(seatClasses)) {
    seatClasses.forEach(pushUnique)
  }

  if (Array.isArray(seatLayout?.seats)) {
    seatLayout.seats.forEach(seat => {
      pushUnique(seat?.seat_class)
    })
  }

  return result
}

function normalizeSeatLayout(seatLayout = null) {
  if (!seatLayout || typeof seatLayout !== "object") return null

  return {
    width: toNumber(seatLayout?.width, 20),
    height: toNumber(seatLayout?.height, 12),

    seats: Array.isArray(seatLayout?.seats)
      ? seatLayout.seats.map((seat, index) => {
          const row = String(seat?.row ?? "").trim()
          const number = String(seat?.number ?? "").trim()
          const seatNumber =
            String(
              seat?.seat_number ??
              (row && number ? `${row}${number}` : "")
            ).trim() || `S${index + 1}`

          return {
            ...deepClone(seat),
            id: seat?.id ?? `seat-${index + 1}`,
            x: toNumber(seat?.x, 0),
            y: toNumber(seat?.y, 0),
            width: toNumber(seat?.width, 1.2),
            height: toNumber(seat?.height, 1.2),
            rotation: toNumber(seat?.rotation, 0),
            row,
            number,
            seat_number: seatNumber,
            label: String(seat?.label ?? seatNumber).trim() || seatNumber,
            location_key:
              String(seat?.location_key ?? seat?.location ?? seatNumber).trim() || seatNumber,
            seat_class: normalizeSeatClass(seat?.seat_class) ?? "Normal",
            price: toNumber(seat?.price, 0),
          }
        })
      : [],

    stages: Array.isArray(seatLayout?.stages)
      ? seatLayout.stages.map((item, index) => ({
          ...deepClone(item),
          id: item?.id ?? `stage-${index + 1}`,
          name: String(item?.name ?? item?.title ?? `Stage ${index + 1}`).trim() || `Stage ${index + 1}`,
          x: toNumber(item?.x, 0),
          y: toNumber(item?.y, 0),
          width: toNumber(item?.width, 140),
          height: toNumber(item?.height, 50),
          rotation: toNumber(item?.rotation, 0),
        }))
      : [],

    screens: Array.isArray(seatLayout?.screens)
      ? seatLayout.screens.map((item, index) => ({
          ...deepClone(item),
          id: item?.id ?? `screen-${index + 1}`,
          name: String(item?.name ?? item?.title ?? `Screen ${index + 1}`).trim() || `Screen ${index + 1}`,
          x: toNumber(item?.x, 0),
          y: toNumber(item?.y, 0),
          width: toNumber(item?.width, 140),
          height: toNumber(item?.height, 50),
          rotation: toNumber(item?.rotation, 0),
        }))
      : [],

    audio_sources: Array.isArray(seatLayout?.audio_sources)
      ? seatLayout.audio_sources.map((item, index) => ({
          ...deepClone(item),
          id: item?.id ?? `audio-${index + 1}`,
          name: String(item?.name ?? item?.title ?? `Audio Source ${index + 1}`).trim() || `Audio Source ${index + 1}`,
          x: toNumber(item?.x, 0),
          y: toNumber(item?.y, 0),
          width: toNumber(item?.width, 24),
          height: toNumber(item?.height, 24),
          rotation: toNumber(item?.rotation, 0),
        }))
      : [],

    elements: Array.isArray(seatLayout?.elements) ? deepClone(seatLayout.elements) : [],
    metadata: seatLayout?.metadata && typeof seatLayout.metadata === "object"
      ? deepClone(seatLayout.metadata)
      : {},
  }
}

export class Event {
  constructor({
    id,
    title,
    date,
    time,
    end_time,
    venue,
    venue_id,
    city,
    type,
    description,
    image,
    images,
    featured_artist_ids,
    age_restriction,
    tickets_sold,
    capacity,
    featured,
    last_call,
    accessible_seats,
    review_rating,
    seat_classes,
    seat_layout,
    sound_quality,
    route_path,
    creator_user_id,
  }) {
    const normalizedSeatLayout = normalizeSeatLayout(seat_layout)
    const normalizedSeatClasses = normalizeSeatClasses(seat_classes, normalizedSeatLayout)
    const layoutSeatCount = Array.isArray(normalizedSeatLayout?.seats)
      ? normalizedSeatLayout.seats.length
      : 0

    this.id = id ?? crypto.randomUUID()
    this.title = title
    this.date = date
    this.time = time
    this.end_time = end_time ?? ""
    this.venue = venue
    this.venue_id = venue_id ?? null
    this.city = city
    this.type = type
    this.description = description
    this.image = image ?? ""
    this.images = Array.isArray(images)
      ? images.filter(Boolean)
      : (image ? [image] : [])
    this.featured_artist_ids = Array.isArray(featured_artist_ids) ? featured_artist_ids : []
    this.age_restriction = age_restriction ?? "All ages"
    this.tickets_sold = toNumber(tickets_sold, 0)
    this.capacity = toNumber(capacity, layoutSeatCount || 0) || layoutSeatCount
    this.featured = featured ?? false
    this.last_call = last_call ?? false
    this.accessible_seats = accessible_seats ?? false
    this.review_rating = toNumber(review_rating, 0)
    this.seat_classes = normalizedSeatClasses
    this.seat_layout = normalizedSeatLayout
    this.sound_quality = toNumber(sound_quality, 0)
    this.route_path = route_path ?? ""
    this.creator_user_id = creator_user_id ?? null
  }

  get seats_left() {
    return Math.max(0, this.capacity - this.tickets_sold)
  }
}

function normalizeEvents(eventArray) {
  return eventArray.map(event => new Event(event))
}

const MONTH_INDEX = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
}

function parseTimeParts(timeText = "") {
  const [rawHour = "0", rawMinute = "0"] = String(timeText || "").trim().split(":")
  const hour = Number.parseInt(rawHour, 10)
  const minute = Number.parseInt(rawMinute, 10)

  return {
    hour: Number.isFinite(hour) ? hour : 0,
    minute: Number.isFinite(minute) ? minute : 0,
  }
}

export function parse_Event_DateTime(dateText, timeText = "00:00") {
  if (!dateText) return null

  const cleanedDate = String(dateText).trim().replace(/,/g, "")
  const parts = cleanedDate.split(/\s+/)

  if (parts.length < 3) {
    const fallback = new Date(`${cleanedDate} ${timeText || "00:00"}`)
    return Number.isNaN(fallback.getTime()) ? null : fallback
  }

  const day = Number.parseInt(parts[0], 10)
  const month = MONTH_INDEX[String(parts[1]).slice(0, 3).toLowerCase()]
  const year = Number.parseInt(parts[2], 10)

  if (!Number.isFinite(day) || month == null || !Number.isFinite(year)) {
    const fallback = new Date(`${cleanedDate} ${timeText || "00:00"}`)
    return Number.isNaN(fallback.getTime()) ? null : fallback
  }

  const { hour, minute } = parseTimeParts(timeText)
  const parsed = new Date(year, month, day, hour, minute, 0, 0)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function get_Event_End_DateTime(event) {
  if (!event?.date) return null
  return parse_Event_DateTime(event.date, event.end_time || event.time || "23:59")
}

export function is_Event_Past(event) {
  const eventEnd = get_Event_End_DateTime(event)
  if (!eventEnd) return false
  return eventEnd.getTime() < Date.now()
}

export function is_Event_Sold_Out(event) {
  if (!event) return false
  return Math.max(0, Number(event.capacity || 0) - Number(event.tickets_sold || 0)) <= 0
}

export function can_Buy_Event_Tickets(event) {
  if (!event) return false
  return !is_Event_Past(event) && !is_Event_Sold_Out(event)
}

export function get_Event_Sales_Status(event) {
  if (is_Event_Past(event)) return "past"
  if (is_Event_Sold_Out(event)) return "sold_out"
  if (event?.seats_left <= 20) return "almost_sold_out"
  return "available"
}

function defaultEvents() {
  return [
    new Event({
      id: "event-1",
      title: "Summer Opening Concert",
      date: "18 Apr 2026",
      time: "20:00",
      end_time: "23:00",
      venue: "Amphithéâtre de Carthage",
      venue_id: "venue-8",
      city: "Tunis",
      type: "Concerts",
      description:
        "A big open-air pop concert featuring live vocals, visual effects, and a premium summer crowd atmosphere.",
      image: "https://img.freepik.com/free-vector/rock-roll-poster_225004-1108.jpg?semt=ais_incoming&w=740&q=80",
      images: [
        "https://img.freepik.com/free-vector/rock-roll-poster_225004-1108.jpg?semt=ais_incoming&w=740&q=80",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkKNSAI4KnzpmVA8QGDSSgzfTLr7fjrw4asw&s",
        "https://cdn.sortiraparis.com/images/80/1665/1120880-ambiance-concert.jpg",
        "https://www.rollingstone.com/wp-content/uploads/2022/10/Post-Pandemic-and-Beyond-Looking-Ahead-to-the-Future-of-Live-Concerts.jpg",
      ],
      featured_artist_ids: ["user-7", "user-30", "user-32"],
      age_restriction: "15+",
      tickets_sold: 25400,
      capacity: 30000,
      featured: true,
      last_call: false,
      accessible_seats: true,
      review_rating: 4.5,
      seat_classes: ["VIP", "Normal"],
      sound_quality: 3,
      route_path: "/o_eventinfo?id=event-1",
      creator_user_id: null,
    }),

    new Event({
      id: "event-2",
      title: "Weekend Football Clash",
      date: "25 Apr 2026",
      time: "18:00",
      end_time: "20:00",
      venue: "Stade Olympique de Radès",
      venue_id: "venue-9",
      city: "Ben Arous",
      type: "Sports",
      description:
        "A simple high-energy football match with strong chants, packed stands, and a lively weekend crowd.",
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1518604666860-9ed391f76460?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1486286701208-1d58e9338013?q=80&w=1200&auto=format&fit=crop"
      ],
      featured_artist_ids: ["user-25"],
      age_restriction: "All ages",
      tickets_sold: 60000,
      capacity: 60000,
      featured: true,
      last_call: false,
      accessible_seats: true,
      review_rating: 4.4,
      seat_classes: ["VIP", "Normal"],
      sound_quality: 2,
      route_path: "/o_eventinfo?id=event-2",
      creator_user_id: null,
    }),

    new Event({
      id: "event-3",
      title: "Magic Night",
      date: "02 May 2026",
      time: "19:30",
      end_time: "21:00",
      venue: "Complexe Culturel de Monastir",
      venue_id: "venue-1",
      city: "Monastir",
      type: "Shows",
      description:
        "A family-friendly illusion and magic performance with stage acts, audience interaction, and theatrical effects.",
      image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=1200&auto=format&fit=crop"
      ],
      featured_artist_ids: ["user-27", "user-33"],
      age_restriction: "All ages",
      tickets_sold: 180,
      capacity: 350,
      featured: true,
      last_call: false,
      accessible_seats: true,
      review_rating: 4.4,
      seat_classes: ["VIP", "Normal"],
      sound_quality: 2,
      route_path: "/o_eventinfo?id=event-3",
      creator_user_id: null,
    }),

    new Event({
      id: "event-4",
      title: "Heritage Fashion Expo",
      date: "08 May 2026",
      time: "10:00",
      end_time: "18:00",
      venue: "Palais Ennejma Ezzahra",
      venue_id: "venue-7",
      city: "Tunis",
      type: "Exhibitions",
      description:
        "A fashion and culture expo with themed booths, exhibitions, and artisan showcases in a heritage venue.",
      image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1200&auto=format&fit=crop"
      ],
      featured_artist_ids: ["user-14", "user-22", "user-34"],
      age_restriction: "All ages",
      tickets_sold: 250,
      capacity: 250,
      featured: true,
      last_call: false,
      accessible_seats: true,
      review_rating: 4.0,
      seat_classes: ["Normal"],
      sound_quality: 1,
      route_path: "/o_eventinfo?id=event-4",
      creator_user_id: null,
    }),

    new Event({
      id: "event-5",
      title: "Rock & Pop Night",
      date: "14 May 2026",
      time: "21:00",
      end_time: "23:30",
      venue: "Amphithéâtre de Carthage",
      venue_id: "venue-8",
      city: "Tunis",
      type: "Concerts",
      description:
        "A high-energy open-air concert blending pop and rock stage energy, premium visuals, and almost sold-out seating.",
      image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop"
      ],
      featured_artist_ids: ["user-5", "user-7", "user-10"],
      age_restriction: "15+",
      tickets_sold: 28700,
      capacity: 30000,
      featured: false,
      last_call: true,
      accessible_seats: false,
      review_rating: 4.6,
      seat_classes: ["VIP", "Normal"],
      sound_quality: 3,
      route_path: "/o_eventinfo?id=event-5",
      creator_user_id: null,
    }),

    new Event({
      id: "event-6",
      title: "Rooftop DJ Set",
      date: "20 May 2026",
      time: "22:00",
      end_time: "01:00",
      venue: "Dar El Marsa Rooftop Bar",
      venue_id: "venue-12",
      city: "Tunis",
      type: "Shows",
      description:
        "A nightlife DJ event with rooftop atmosphere, drinks, modern visuals, and very few tickets left.",
      image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?q=80&w=1200&auto=format&fit=crop"
      ],
      featured_artist_ids: ["user-13", "user-17"],
      age_restriction: "18+",
      tickets_sold: 120,
      capacity: 120,
      featured: false,
      last_call: false,
      accessible_seats: false,
      review_rating: 4.2,
      seat_classes: ["VIP", "Normal"],
      sound_quality: 3,
      route_path: "/o_eventinfo?id=event-6",
      creator_user_id: null,
    }),

    new Event({
      id: "event-7",
      title: "Local Football Derby",
      date: "27 May 2026",
      time: "19:00",
      end_time: "21:00",
      venue: "Stade Olympique de Sousse",
      venue_id: "venue-10",
      city: "Sousse",
      type: "Sports",
      description:
        "A local derby with a passionate crowd, strong home support, and a classic weekend sports atmosphere.",
      image: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1518604666860-9ed391f76460?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1486286701208-1d58e9338013?q=80&w=1200&auto=format&fit=crop"
      ],
      featured_artist_ids: ["user-25"],
      age_restriction: "All ages",
      tickets_sold: 39600,
      capacity: 40000,
      featured: true,
      last_call: true,
      accessible_seats: true,
      review_rating: 4.6,
      seat_classes: ["VIP", "Normal"],
      sound_quality: 2,
      route_path: "/o_eventinfo?id=event-7",
      creator_user_id: null,
    }),

    new Event({
      id: "event-8",
      title: "Monastir Basketball Derby",
      date: "03 Jun 2026",
      time: "17:00",
      end_time: "19:00",
      venue: "Salle Couverte Mohamed Mzali",
      venue_id: "venue-11",
      city: "Monastir",
      type: "Sports",
      description:
        "An indoor basketball derby in Monastir with strong home crowd energy and limited tickets remaining.",
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?q=80&w=1200&auto=format&fit=crop"
      ],
      featured_artist_ids: ["user-31"],
      age_restriction: "All ages",
      tickets_sold: 5000,
      capacity: 5000,
      featured: false,
      last_call: false,
      accessible_seats: true,
      review_rating: 4.6,
      seat_classes: ["VIP", "Normal"],
      sound_quality: 2,
      route_path: "/o_eventinfo?id=event-8",
      creator_user_id: null,
    }),

    new Event({
      id: "event-9",
      title: "Film Premiere Night",
      date: "09 Jun 2026",
      time: "19:00",
      end_time: "21:00",
      venue: "Pathé Azur City",
      venue_id: "venue-2",
      city: "Ben Arous",
      type: "Movies",
      description:
        "A red-carpet style film premiere in a modern multiplex cinema with full audience seating.",
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1200&auto=format&fit=crop"
      ],
      featured_artist_ids: ["user-18", "user-27", "user-33", "user-22"],
      age_restriction: "15+",
      tickets_sold: 420,
      capacity: 420,
      featured: true,
      last_call: false,
      accessible_seats: true,
      review_rating: 4.3,
      seat_classes: ["VIP", "Normal"],
      sound_quality: 2,
      route_path: "/o_eventinfo?id=event-9",
      creator_user_id: null,
    }),

    new Event({
      id: "event-10",
      title: "Electronic Hall Session",
      date: "15 Jun 2026",
      time: "19:30",
      end_time: "21:30",
      venue: "Théâtre de l’Opéra de Tunis",
      venue_id: "venue-4",
      city: "Tunis",
      type: "Shows",
      description:
        "A premium electronic stage evening with immersive visuals and strong live sound.",
      image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1200&auto=format&fit=crop"
      ],
      featured_artist_ids: ["user-10", "user-13", "user-32"],
      age_restriction: "15+",
      tickets_sold: 1620,
      capacity: 1800,
      featured: false,
      last_call: false,
      accessible_seats: true,
      review_rating: 4.4,
      seat_classes: ["VIP", "Normal"],
      sound_quality: 3,
      route_path: "/o_eventinfo?id=event-10",
      creator_user_id: null,
    }),

    new Event({
      id: "event-11",
      title: "Startup Summit Tunisia",
      date: "22 Jun 2026",
      time: "09:00",
      end_time: "17:00",
      venue: "Tunis Marriott Hotel",
      venue_id: "venue-15",
      city: "Tunis",
      type: "Education",
      description:
        "A business and innovation summit with talks, startup booths, and networking sessions.",
      image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1497366412874-3415097a27e7?q=80&w=1200&auto=format&fit=crop"
      ],
      featured_artist_ids: ["user-6", "user-8", "user-16", "user-29"],
      age_restriction: "All ages",
      tickets_sold: 540,
      capacity: 700,
      featured: false,
      last_call: false,
      accessible_seats: true,
      review_rating: 4.2,
      seat_classes: ["VIP", "Normal"],
      sound_quality: 1,
      route_path: "/o_eventinfo?id=event-11",
      creator_user_id: null,
    }),

    new Event({
      id: "event-12",
      title: "Karim Ben Amor Comedy Night",
      date: "30 Jun 2026",
      time: "20:30",
      end_time: "22:00",
      venue: "The Saloon",
      venue_id: "venue-13",
      city: "Sousse",
      type: "Stand-up Comedy",
      description:
        "A small-scale comedy evening in Sousse with intimate seating, casual energy, and sharp crowd work.",
      image: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1527224857830-43a7acc85260?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?q=80&w=1200&auto=format&fit=crop"
      ],
      featured_artist_ids: ["user-5", "user-17"],
      age_restriction: "18+",
      tickets_sold: 110,
      capacity: 110,
      featured: false,
      last_call: false,
      accessible_seats: false,
      review_rating: 4.3,
      seat_classes: ["Normal"],
      sound_quality: 2,
      route_path: "/o_eventinfo?id=event-12",
      creator_user_id: null,
    }),

    new Event({
      id: "event-13",
      title: "Carthage Music Festival Night 2",
      date: "10 Jul 2026",
      time: "21:00",
      end_time: "23:45",
      venue: "Amphithéâtre de Carthage",
      venue_id: "venue-8",
      city: "Tunis",
      type: "Concerts",
      description:
        "A major open-air music festival night with headline performers and sold-out attendance.",
      image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop"
      ],
      featured_artist_ids: ["user-5", "user-7", "user-30", "user-32"],
      age_restriction: "15+",
      tickets_sold: 30000,
      capacity: 30000,
      featured: true,
      last_call: false,
      accessible_seats: true,
      review_rating: 4.9,
      seat_classes: ["VIP", "Normal"],
      sound_quality: 3,
      route_path: "/o_eventinfo?id=event-13",
      creator_user_id: null,
    }),

    new Event({
      id: "event-14",
      title: "Summer Lifestyle Expo",
      date: "18 Jul 2026",
      time: "11:00",
      end_time: "18:00",
      venue: "Marina Cap Monastir Appart Hôtel",
      venue_id: "venue-16",
      city: "Monastir",
      type: "Exhibitions",
      description:
        "A seaside lifestyle expo with curated stands, local brands, design showcases, and a polished marina atmosphere.",
      image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1200&auto=format&fit=crop"
      ],
      featured_artist_ids: ["user-9", "user-14", "user-22", "user-26", "user-34"],
      age_restriction: "All ages",
      tickets_sold: 190,
      capacity: 240,
      featured: false,
      last_call: false,
      accessible_seats: true,
      review_rating: 4.0,
      seat_classes: ["Normal"],
      sound_quality: 1,
      route_path: "/o_eventinfo?id=event-14",
      creator_user_id: null,
    }),

    new Event({
      id: "event-15",
      title: "Spring Sessions",
      date: "18 Apr 2025",
      time: "20:30",
      end_time: "22:45",
      venue: "Théâtre de l’Opéra de Tunis",
      venue_id: "venue-4",
      city: "Tunis",
      type: "Concerts",
      description:
        "A past indoor concert with a refined stage setup, strong audience turnout, and a polished live atmosphere.",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop"
      ],
      featured_artist_ids: ["user-7"],
      age_restriction: "15+",
      tickets_sold: 1800,
      capacity: 1800,
      featured: false,
      last_call: false,
      accessible_seats: true,
      review_rating: 4.7,
      seat_classes: ["VIP", "Normal"],
      sound_quality: 3,
      route_path: "/o_eventinfo?id=event-15",
      creator_user_id: null,
    }),

    new Event({
      id: "event-16",
      title: "Summer Beats",
      date: "06 Jul 2025",
      time: "22:30",
      end_time: "01:30",
      venue: "The Cliff Hammamet",
      venue_id: null,
      city: "Nabeul",
      type: "Shows",
      description:
        "A past summer nightlife event with an outdoor electronic vibe and a packed late-night crowd.",
      image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop"
      ],
      featured_artist_ids: ["user-13", "user-17"],
      age_restriction: "18+",
      tickets_sold: 250,
      capacity: 250,
      featured: false,
      last_call: false,
      accessible_seats: false,
      review_rating: 4.5,
      seat_classes: ["VIP", "Normal"],
      sound_quality: 3,
      route_path: "/o_eventinfo?id=event-16",
      creator_user_id: null,
    }),

    new Event({
      id: "event-17",
      title: "Karim Ben Amor Late Laughs",
      date: "28 May 2025",
      time: "21:00",
      end_time: "22:30",
      venue: "Le Rio",
      venue_id: null,
      city: "Tunis",
      type: "Stand-up Comedy",
      description:
        "A past stand-up comedy set with a lively crowd, sharp delivery, and a near sold-out room.",
      image: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1527224857830-43a7acc85260?q=80&w=1200&auto=format&fit=crop"
      ],
      featured_artist_ids: ["user-10"],
      age_restriction: "18+",
      tickets_sold: 180,
      capacity: 180,
      featured: false,
      last_call: false,
      accessible_seats: false,
      review_rating: 4.4,
      seat_classes: ["Normal"],
      sound_quality: 2,
      route_path: "/o_eventinfo?id=event-17",
      creator_user_id: null,
    }),

    new Event({
      id: "event-18",
      title: "Family Illusions",
      date: "10 Jun 2025",
      time: "18:30",
      end_time: "20:00",
      venue: "Maison de la Culture Ibn Rachiq",
      venue_id: null,
      city: "Tunis",
      type: "Shows",
      description:
        "A past family illusion show with stage tricks, audience participation, and theatrical effects.",
      image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=1200&auto=format&fit=crop"
      ],
      featured_artist_ids: ["user-27", "user-33"],
      age_restriction: "All ages",
      tickets_sold: 320,
      capacity: 320,
      featured: false,
      last_call: false,
      accessible_seats: true,
      review_rating: 4.5,
      seat_classes: ["VIP", "Normal"],
      sound_quality: 2,
      route_path: "/o_eventinfo?id=event-18",
      creator_user_id: null,
    }),

    new Event({
      id: "event-19",
      title: "Acoustic Night",
      date: "12 Sep 2025",
      time: "20:00",
      end_time: "22:00",
      venue: "Le Rio",
      venue_id: null,
      city: "Tunis",
      type: "Concerts",
      description:
        "A past intimate acoustic evening with mellow live vocals, seated audience energy, and a warm indoor atmosphere.",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop"
      ],
      featured_artist_ids: ["user-7"],
      age_restriction: "15+",
      tickets_sold: 400,
      capacity: 400,
      featured: false,
      last_call: false,
      accessible_seats: true,
      review_rating: 4.6,
      seat_classes: ["VIP", "Normal"],
      sound_quality: 2,
      route_path: "/o_eventinfo?id=event-19",
      creator_user_id: null,
    }),

    new Event({
      id: "event-20",
      title: "Midnight Rooftop Session",
      date: "18 Aug 2025",
      time: "22:00",
      end_time: "01:00",
      venue: "Dar El Marsa Rooftop Bar",
      venue_id: "venue-12",
      city: "Tunis",
      type: "Shows",
      description:
        "A past late-night rooftop set with electronic music, city lights, and a packed summer crowd.",
      image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=1200&auto=format&fit=crop"
      ],
      featured_artist_ids: ["user-13", "user-32"],
      age_restriction: "18+",
      tickets_sold: 140,
      capacity: 140,
      featured: false,
      last_call: false,
      accessible_seats: false,
      review_rating: 4.4,
      seat_classes: ["VIP", "Normal"],
      sound_quality: 3,
      route_path: "/o_eventinfo?id=event-20",
      creator_user_id: null,
    }),

    new Event({
      id: "event-21",
      title: "Comedy After Dark",
      date: "11 Oct 2025",
      time: "21:00",
      end_time: "22:30",
      venue: "The Saloon",
      venue_id: "venue-13",
      city: "Sousse",
      type: "Stand-up Comedy",
      description:
        "A past stand-up set with sharp crowd work, fast pacing, and a sold-out intimate room.",
      image: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1527224857830-43a7acc85260?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?q=80&w=1200&auto=format&fit=crop"
      ],
      featured_artist_ids: ["user-5", "user-10"],
      age_restriction: "18+",
      tickets_sold: 120,
      capacity: 120,
      featured: false,
      last_call: false,
      accessible_seats: false,
      review_rating: 4.5,
      seat_classes: ["Normal"],
      sound_quality: 2,
      route_path: "/o_eventinfo?id=event-21",
      creator_user_id: null,
    }),

    new Event({
      id: "event-22",
      title: "Magic for Everyone",
      date: "03 Nov 2025",
      time: "18:00",
      end_time: "19:30",
      venue: "Complexe Culturel de Monastir",
      venue_id: "venue-1",
      city: "Monastir",
      type: "Shows",
      description:
        "A past all-ages illusion performance with stage tricks, interactive moments, and a warm family audience.",
      image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=1200&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=1200&auto=format&fit=crop"
      ],
      featured_artist_ids: ["user-27", "user-33"],
      age_restriction: "All ages",
      tickets_sold: 350,
      capacity: 350,
      featured: false,
      last_call: false,
      accessible_seats: true,
      review_rating: 4.5,
      seat_classes: ["VIP", "Normal"],
      sound_quality: 2,
      route_path: "/o_eventinfo?id=event-22",
      creator_user_id: null,
    }),
  ]
}

function loadEvents() {
  const defaults = defaultEvents()
  const savedVersion = localStorage.getItem(EVENTS_VERSION_KEY)
  const savedEvents = localStorage.getItem(EVENTS_STORAGE_KEY)

  if (savedVersion !== EVENTS_SEED_VERSION) {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(defaults))
    localStorage.setItem(EVENTS_VERSION_KEY, EVENTS_SEED_VERSION)
    return defaults
  }

  if (savedEvents) {
    try {
      const parsedEvents = normalizeEvents(JSON.parse(savedEvents))
      const mergedEvents = [...parsedEvents]

      for (const defaultEvent of defaults) {
        const alreadyExists = mergedEvents.some(event => event.id === defaultEvent.id)
        if (!alreadyExists) {
          mergedEvents.push(defaultEvent)
        }
      }

      return mergedEvents.map(event => new Event(event))
    } catch (error) {
      console.error("Failed to parse saved events. Loading defaults instead.", error)
    }
  }

  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(defaults))
  localStorage.setItem(EVENTS_VERSION_KEY, EVENTS_SEED_VERSION)
  return defaults
}

export const EVENT_LIST = reactive(loadEvents())

function saveEvents() {
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(EVENT_LIST))
}

export function get_All_Events() {
  return EVENT_LIST
}

export function get_Event_By_Id(id) {
  return EVENT_LIST.find(event => event.id === id) || null
}

export function get_Events_By_Type(type) {
  return EVENT_LIST.filter(event => event.type === type)
}

export function get_Events_By_Featured_Artist_Id(userId) {
  return EVENT_LIST.filter(event => event.featured_artist_ids.includes(userId))
}

export function get_Events_By_Creator_User_Id(userId) {
  return EVENT_LIST.filter(event => event.creator_user_id === userId)
}

export function add_Event(eventData) {
  const event = eventData instanceof Event ? eventData : new Event(eventData)
  EVENT_LIST.push(event)
  saveEvents()
  return event
}

export function update_Event(id, updatedEventData) {
  const index = EVENT_LIST.findIndex(event => event.id === id)

  if (index !== -1) {
    EVENT_LIST[index] = new Event({
      ...EVENT_LIST[index],
      ...updatedEventData,
      id: EVENT_LIST[index].id,
    })
    saveEvents()
    return EVENT_LIST[index]
  }

  return null
}

export function delete_Event(id) {
  const index = EVENT_LIST.findIndex(event => event.id === id)

  if (index !== -1) {
    const deletedEvent = EVENT_LIST[index]
    EVENT_LIST.splice(index, 1)
    saveEvents()
    return deletedEvent
  }

  return null
}

export function get_Event_Count() {
  return EVENT_LIST.length
}

export function increment_Event_Tickets_Sold(id, quantity = 1) {
  const event = get_Event_By_Id(id)
  if (!event) return null

  const safeQuantity = Math.max(0, Number(quantity || 0))
  const nextTicketsSold = Math.min(
    Number(event.capacity || 0),
    Number(event.tickets_sold || 0) + safeQuantity
  )

  return update_Event(id, {
    tickets_sold: nextTicketsSold,
  })
}