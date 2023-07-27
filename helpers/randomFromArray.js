module.exports = function (chosenArray)
{
    const randSelected = Math.floor(Math.random() * chosenArray.length);
    return chosenArray[randSelected];
}