import { reactive } from "vue"

export class Review {
  constructor({
    id,
    user_id,
    venue_id,
    rating,
    comment,
    date,
    image,
  }) {
    this.id = id ?? crypto.randomUUID()
    this.user_id = user_id
    this.venue_id = venue_id
    this.rating = rating
    this.comment = comment
    this.date = date
    this.image = image
  }
}

export const REVIEW_LIST = reactive([
  new Review({
    id: "review-1",
    user_id: "user-1",
    venue_id: "venue-1",
    rating: 4.8,
    comment: "Amazing outdoor venue, very spacious and well organized.",
    date: "21/01/2025",
    image: "https://via.placeholder.com/150x80?text=Review+1"
  }),

  new Review({
    id: "review-2",
    user_id: "user-2",
    venue_id: "venue-2",
    rating: 4.5,
    comment: "Beautiful theatre with a classy atmosphere.",
    date: "14/01/2025",
    image: "https://via.placeholder.com/150x80?text=Review+2"
  }),

  new Review({
    id: "review-3",
    user_id: "user-1",
    venue_id: "venue-3",
    rating: 4.2,
    comment: "Nice open stage, good for large public events.",
    date: "10/01/2025",
    image: "https://via.placeholder.com/150x80?text=Review+3"
  }),

  new Review({
    id: "review-4",
    user_id: "user-2",
    venue_id: "venue-4",
    rating: 4.0,
    comment: "Small but cozy. Great for comedy nights.",
    date: "05/01/2025",
    image: "https://via.placeholder.com/150x80?text=Review+4"
  })
])

export function get_All_Reviews() {
  return REVIEW_LIST
}

export function get_Reviews_By_Venue_Id(venue_id) {
  return REVIEW_LIST.filter(r => r.venue_id === venue_id)
}

export function add_Review(review) {
  REVIEW_LIST.push(review)
}