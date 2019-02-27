// BUDGET CONTROLLER



var budgetController = (function() {
    
    // function constructor
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {
            
        if (totalIncome > 0) {
        this.percentage = Math.round((this.value / totalIncome) * 100)
        } else {
            this.percentage = -1; 
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;     
    };
    
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    

    var calculateTotal = function(type) {
        var sum = 0;
        
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        
        data.totals[type] = sum;
        
        
    }; 
    
    // Data Structure where all values go in 
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            //ID = 0;
            
            // Create new ID 
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            
            // create new item based on inc or exp type 
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // push it into data structure 
            data.allItems[type].push(newItem);
            
            // return new element
            return newItem;
            
        }, 
        
        
        deleteItem: function(type, id) {
            var ids, index;
            // id = 3
            
            ids = data.allItems[type].map(function(current) {
                return current.id; 
            });
            
            index = ids.indexOf(id);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
            
        },
        
        
        calculateBudget: function() {
            
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            
            
            if (data.totals.inc > 0) {
            // calculate the %age of income that we spent 
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },
        
        calculatePercentages: function() {
            
            
           data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);   
           }); 
            
                    
            
        },
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();    
            });
            return allPerc;
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        
        testing: function() {
            console.log(data);
        }
    
    };
    
})();





// separation of concerns //


// UI CONTROLLER


var UIController = (function() {
    var incCount = 0, expCount = 0, incSum = 0, expSum = 0;
    // DOM Strings to avoid hard coding.
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
        icomeTitle: '.icome__title',
        expTitle: '.expenses__title',
        tipTitle: '.uTip'
    };
    
        var formatNumber = function(num, type) {
            var numSplit, int, dec;
            // + - before the number and comma separator for 1000s
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            
            int = numSplit[0];
            if (int.length > 3) {
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }            
            
            dec = numSplit[1];              
            
            return (type === 'inc' ? '+' : '-') + ' ' + int + '.' + dec;             
        };    
    
            var nodeListForEach = function(list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }    
            };    
    
    
    return {
        getInput: function() {
            
            return {
            type: document.querySelector(DOMStrings.inputType).value, // inc/exp
            description: document.querySelector(DOMStrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMStrings.inputValue).value)               
            };
        },
        
        addListItem: function(obj, type) {
            var html, newHtml, element, incAvg, expAvg;
            
            var incTitle =  DOMStrings.icomeTitle;
            var exTitle = DOMStrings.expTitle;

            // create html with placeholder text
            
            if (type === 'inc') {
                
                element = DOMStrings.incomeContainer;
                incCount += 1; 
                incSum += obj.value; 
                
                
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button</div></div></div>'; 
                
            } else if (type === 'exp') {
                
                element = DOMStrings.expensesContainer;
                expCount += 1;
                expSum += obj.value; 
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            
            // replace placeholder text with data 
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //Calculate Averages
            incAvg = incSum / incCount;
            expAvg = expSum / expCount;

            // insert the html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

            // Update DOM to reflect changes 
            document.querySelector(incTitle).innerHTML = `INCOME (${incCount})`;
            document.querySelector(exTitle).innerHTML = `EXPENSES (${expCount})`;

            // recent edit to reflect changes on calculating the average income and expenses
            document.querySelector(DOMStrings.tipTitle).innerHTML = `Income Average =  ${isNaN(incAvg) ? '0' : incAvg} | 
                                                                     Expense Average = ${isNaN(expAvg) ? '0' : expAvg}`;

            
        },
        
        deleteListItem: function(selectorID, type) {
        
            var el = document.getElementById(selectorID); 
            el.parentNode.removeChild(el);
            
            if (type === 'inc') {incCount -= 1;} 
            if (type === 'exp')  {expCount -= 1;}
            var incTitle =  DOMStrings.icomeTitle;
            var exTitle = DOMStrings.expTitle;
            document.querySelector(incTitle).innerHTML = `INCOME (${incCount})`;
            document.querySelector(exTitle).innerHTML = `EXPENSES (${expCount})`;
            
            
        },
        
        
        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);  
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            
            fieldsArr[0].focus();
        },
    
        displayBudget: function(obj) {
            var type;

            obj.budget < 0 ? type = 'exp' : type = 'inc';
            
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');   
            
            

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';                
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';                
            }
            
        },
        
        
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
            
            var nodeListForEach = function(list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }    
            };
            
            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },
        
        displayMonth: function() {
            var now, year, month, monthNo;
            now = new Date();
            
            month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            monthNo = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = month[monthNo] + ' ' + year;
        },
        
        changedType: function() {
        
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' + DOMStrings.inputDescription + ',' + 
                DOMStrings.inputValue);
            
            
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');    
            });
            
            document.querySelector(DOMStrings.inputButton).classList.toggle('red');
            
        },
        
        getDOMStrings: function() {
            return DOMStrings;    
        }
    
    };
    
})();


var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {
        
        var DOM = UICtrl.getDOMStrings(); 
        
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);


        document.addEventListener('keypress', function(event) {

            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    var updateBudget = function() {
        // 1. Calc the new budget and display on UI
        budgetCtrl.calculateBudget();
        
        // 2. Method that return the budget
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on the UI 
        UICtrl.displayBudget(budget);
    };
    
    var updatePercentages = function() {
        
        // 1. Calculate the %ages
        budgetCtrl.calculatePercentages();
        
        
        // 2. Read %ages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        
        // 3. Update the UI with the new %ages
        UICtrl.displayPercentages(percentages);
    };
    
    var ctrlAddItem = function() {
        var input, newItem;
        
        // 1. get field input data
        input = UICtrl.getInput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
        
        // 2. add item to the budget ctrl
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
        
        // 3. add the new item to the UI
        UICtrl.addListItem(newItem, input.type);
        
        // 4. clearing the fields
        UICtrl.clearFields();
        
        // 5. calculate and update budget
        updateBudget();
        }
        
        // 6. Update the %ages 
        updatePercentages();
        
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;  
        
        
        if (itemID) {
            // inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
            // 2. Del the item from the UI
            UICtrl.deleteListItem(itemID, type);
            
            // 3. Update and show the new budget
            updateBudget();
            
            // 4. Update percentages
            updatePercentages();
        } 
    };

    return {
        init: function()  {
            console.log('App has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);



controller.init();


