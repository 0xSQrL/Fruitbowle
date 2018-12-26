function FoodItem(name, description, classification){
    this.name = name;
    this.description = description;
    this.classification = classification;
}

const GREEN_CLASS = 1;
const YELLOW_CLASS = 2;
const ORANGE_CLASS = 3;
const RED_CLASS = 4;

const NAME_VALUE = 10;
const DESC_VALUE = 2;

const foodsList = [
    new FoodItem("Banana",
        "Raw, properly ripened bananas are good, although every once and a while they have a weird texture. " +
        "Cooked bananas are completely banned. Any recipe that involves bananas getting cooked is banned.",
        YELLOW_CLASS),
    new FoodItem("Peanut",
        "I am allergic to peanuts. I think this allergy is pretty mild, but I haven't had an incident in years. " +
        "My family has a history of allergies getting worse with age, so I'm always prepared for the worst. " +
        "I can easily smell a peanut in an enclosed space and I find the scent irritating," +
        " however I don't get any reaction from simply smell. Peanut oil, such as in the case of Chick-fil-a food, is safe.",
        RED_CLASS),
];

function scoreBannedFoodSearch(searchKeys, food){
    let score = 0;
    for(let i = 0; i < searchKeys.length; i++){
        let word = searchKeys[i].toUpperCase();
        if(food.name.toUpperCase().indexOf(word) !== -1)
            score += NAME_VALUE;
        if(food.description.toUpperCase().indexOf(word) !== -1)
            score += DESC_VALUE;
    }
    return score;
}
