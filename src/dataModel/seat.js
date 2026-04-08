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

    // 🔥 NEW: structured seat labeling
    this.seat_number = this.row && this.number ? `${this.row}${this.number}` : ""
    this.location = location ?? `${this.row}-${this.number}`

    this.x = Number(x ?? 0)
    this.y = Number(y ?? 0)
    this.width = Number(width ?? 1)
    this.height = Number(height ?? 1)

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
  SEAT_LIST.push(seat)
  return seat
}

export function update_Seat(idOrLocation, updatedSeatData) {
  let seatIndex = SEAT_LIST.findIndex(
    seat => seat.id === idOrLocation || seat.location === idOrLocation
  )

  if (seatIndex !== -1) {
    SEAT_LIST[seatIndex] = {
      ...SEAT_LIST[seatIndex],
      ...updatedSeatData,
    }
    return SEAT_LIST[seatIndex]
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