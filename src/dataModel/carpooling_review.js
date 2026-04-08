export class Carpool_Review{
    constructor({
        stars,
        comment,
        picture,
    }){
        this.stars = stars;
        this.comment = comment;
        this.picture = picture;
    }
}

export const CARPOOL_REVIEW_LIST = []

export function get_All_Carpool_Reviews(){
    return CARPOOL_REVIEW_LIST;
}

export function get_Carpool_Review_By_Comment(comment){
    let review = CARPOOL_REVIEW_LIST.find(review => review.comment === comment);
    return review;
}

export function add_Carpool_Review(review){
    CARPOOL_REVIEW_LIST.push(review);
}

export function update_Carpool_Review(comment, updatedReviewData){
    let reviewIndex = CARPOOL_REVIEW_LIST.findIndex(review => review.comment === comment);
    
    if (reviewIndex !== -1) {
        CARPOOL_REVIEW_LIST[reviewIndex] = {
            ...CARPOOL_REVIEW_LIST[reviewIndex],
            ...updatedReviewData
        };
        return CARPOOL_REVIEW_LIST[reviewIndex];
    }
    
    return null;
}

export function delete_Carpool_Review(comment){
    let reviewIndex = CARPOOL_REVIEW_LIST.findIndex(review => review.comment === comment);
    
    if (reviewIndex !== -1) {
        let deletedReview = CARPOOL_REVIEW_LIST[reviewIndex];
        CARPOOL_REVIEW_LIST.splice(reviewIndex, 1);
        return deletedReview;
    }
    
    return null;
}

export function delete_All_Carpool_Reviews(){
    CARPOOL_REVIEW_LIST.length = 0;
    return CARPOOL_REVIEW_LIST;
}

export function get_Carpool_Review_Count(){
    return CARPOOL_REVIEW_LIST.length;
}

export function get_Carpool_Reviews_By_Stars(stars){
    let reviews = CARPOOL_REVIEW_LIST.filter(review => review.stars === stars);
    return reviews;
}

export function get_Carpool_Reviews_By_Min_Stars(minStars){
    let reviews = CARPOOL_REVIEW_LIST.filter(review => review.stars >= minStars);
    return reviews;
}

export function get_Carpool_Reviews_By_Max_Stars(maxStars){
    let reviews = CARPOOL_REVIEW_LIST.filter(review => review.stars <= maxStars);
    return reviews;
}

export function get_Carpool_Reviews_By_Stars_Range(minStars, maxStars){
    let reviews = CARPOOL_REVIEW_LIST.filter(review => review.stars >= minStars && review.stars <= maxStars);
    return reviews;
}

export function get_Carpool_Reviews_With_Picture(){
    let reviews = CARPOOL_REVIEW_LIST.filter(review => review.picture !== null && review.picture !== undefined);
    return reviews;
}

export function get_Carpool_Reviews_Without_Picture(){
    let reviews = CARPOOL_REVIEW_LIST.filter(review => review.picture === null || review.picture === undefined);
    return reviews;
}

export function get_Average_Carpool_Stars(){
    if (CARPOOL_REVIEW_LIST.length === 0) return 0;
    
    let totalStars = CARPOOL_REVIEW_LIST.reduce((sum, review) => sum + review.stars, 0);
    return totalStars / CARPOOL_REVIEW_LIST.length;
}

export function get_Carpool_Reviews_Sorted_By_Stars(descending = true){
    let sortedReviews = [...CARPOOL_REVIEW_LIST];
    if (descending) {
        sortedReviews.sort((a, b) => b.stars - a.stars);
    } else {
        sortedReviews.sort((a, b) => a.stars - b.stars);
    }
    return sortedReviews;
}