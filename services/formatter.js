const moment = require('moment');

const toDate = (dateInput) => {
    return moment(dateInput).format("DD-MM-YYYY");
};


const toTime = (timeInput) => {
   
    return  moment(timeInput).format('LTS');
};


const toDecimal  = (decimalInput) => {
   console.log("toDecimal",decimalInput)
    return decimalInput.toFixed(1);
};


const toINR  = (currencyInput) => {
    console.log("CURRENCY_------>",parseFloat(currencyInput.toLocaleString('en-IN').replace(/,/g, '')))
    return currencyInput.toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        style: 'currency',
        currency: 'INR'
    });
};


module.exports = {
    toDate,
    toTime,
    toDecimal,
    toINR
};


