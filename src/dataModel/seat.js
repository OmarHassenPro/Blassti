export class Seat {
  constructor({
    id,
    venue_request_id,
    location,
    x,
    y,
    width,
    height,
    seat_class,
    price,
    row,
    number,
    rotation,
  }) {
    this.id = id ?? crypto.randomUUID()
    this.venue_request_id = venue_request_id ?? null

    this.row = row ?? ""
    this.number = number ?? ""

    // ✅ clean seat label
    this.seat_number = this.row && this.number ? `${this.row}${this.number}` : ""
    this.location = location ?? `${this.row}-${this.number}`

    // 🔥 SNAP TO GRID
    const GRID_SIZE = 1.4
    this.x = Math.round(Number(x ?? 0) / GRID_SIZE) * GRID_SIZE
    this.y = Math.round(Number(y ?? 0) / GRID_SIZE) * GRID_SIZE

    // 🔥 FIXED SIZE (NO MORE RESIZE)
    this.width = 1.2
    this.height = 1.2

    this.seat_class = seat_class ?? "Regular"
    this.price = Number(price ?? 0)

    this.rotation = Number(rotation ?? 0)
  }
}

export const SEAT_LIST = []

export function get_All_Seats() {
  return SEAT_LIST
}

export function get_Seat_By_Id(id) {
  return SEAT_LIST.find(seat => seat.id === id) || null
}

export function get_Seat_By_Location(location) {
  return SEAT_LIST.find(seat => seat.location === location) || null
}

export function add_Seat(seat) {
  // ❌ prevent overlapping seats
  const exists = SEAT_LIST.find(
    s => s.x === seat.x && s.y === seat.y
  )

  if (exists) {
    console.warn("Seat already exists in this grid cell")
    return null
  }

  SEAT_LIST.push(seat)
  return seat
}

export function update_Seat(idOrLocation, updatedSeatData) {
  let seatIndex = SEAT_LIST.findIndex(
    seat => seat.id === idOrLocation || seat.location === idOrLocation
  )

  if (seatIndex !== -1) {
    const updated = {
      ...SEAT_LIST[seatIndex],
      ...updatedSeatData,
    }

    // 🔥 re-snap
    const GRID_SIZE = 1.4
    updated.x = Math.round(updated.x / GRID_SIZE) * GRID_SIZE
    updated.y = Math.round(updated.y / GRID_SIZE) * GRID_SIZE

    updated.width = 1.2
    updated.height = 1.2

    SEAT_LIST[seatIndex] = updated
    return updated
  }

  return null
}

export function delete_Seat(idOrLocation) {
  let seatIndex = SEAT_LIST.findIndex(
    seat => seat.id === idOrLocation || seat.location === idOrLocation
  )

  if (seatIndex !== -1) {
    let deletedSeat = SEAT_LIST[seatIndex]
    SEAT_LIST.splice(seatIndex, 1)
    return deletedSeat
  }

  return null
}

export function delete_All_Seats() {
  SEAT_LIST.length = 0
  return SEAT_LIST
}

export function get_Seat_Count() {
  return SEAT_LIST.length
}

export function get_Seats_By_Location_Area(area) {
  return SEAT_LIST.filter(seat => String(seat.location).includes(area))
}

export function get_Seats_By_Venue_Request_Id(venue_request_id) {
  return SEAT_LIST.filter(seat => seat.venue_request_id === venue_request_id)
}