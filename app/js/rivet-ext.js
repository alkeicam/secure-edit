// function initializeRivetFormatters() {
    rivets.formatters.fromTimestamp = function (value, format) {
        var theDate = new Date(value);
        
        if(format == 'day'){
            var result = theDate.toLocaleDateString(undefined, {
                day: 'numeric',
                month: '2-digit',
                year: 'numeric'
            })
        }else{
            var result = theDate.toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'short',
                // year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        }
        
        return result;
    }

    rivets.formatters.timeFormatMoment = function (value, format) {
        let result = 'moment lib not detected';
        if(moment){
            result = moment.utc(value).format(format)
        }
        return result;        
    }

    rivets.formatters.timeAgoMoment = function (value) {
        let result = 'moment lib not detected';
        if(moment){
            result = moment.utc(value).fromNow();
        }
        return result;        
    }

    rivets.formatters.modeq = function(value, mod, target){
        console.log(value, mod, target)
        console.log(value % mod)
        return value % mod == target;
    }

    // <a rv-href="group.Id | formatString 'group.aspx?id=@value&name=@0&owner=@1' group.Name group.Owner">My Link</a>
    rivets.formatters.hrefBuilder = function (value, text) {
        text = text.replace('@value', value);

        var args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
        args.shift(); args.shift(); //remove the "value" and "text" arguments from the array

        for (var i = 0; i < args.length; i++) {
            text = text.replace('@' + i, args[i]);
        }

        text = text.replace('@now', new Date().getTime());

        return text;
    };

    rivets.formatters.variableBuilder = function (value, text) {
        text = text.replace('@value', value);

        var args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
        args.shift(); args.shift(); //remove the "value" and "text" arguments from the array

        for (var i = 0; i < args.length; i++) {
            text = text.replace('@' + i, args[i]);
        }

        text = text.replace('@now', new Date().getTime());

        return text;
    };

    rivets.formatters.eq = function (value, arg) {
        return value == arg;
    };

    rivets.formatters.eqCI = function (value, arg) {
        if(!value || !arg)
            return false;
        return value.toUpperCase() == arg.toUpperCase();
    };

    rivets.formatters.neq = function (value, arg) {
        return value != arg;
    };

    rivets.formatters.neqCI = function (value, arg) {
        if(!value || !arg)
            return false;
        return value.toUpperCase() != arg.toUpperCase();
    };

    rivets.formatters.split = function (value) {
        var result = [];
        if (!value)
            return result;
        try {
            result = value.trim().split(',');
        } catch (exception) {
            result = [];
        }
        return result;
    };

    rivets.formatters.notEmpty = function (value) {
        if (value)
            return true;
        return false;
    }

    rivets.formatters.empty = function (value) {
        if (value)
            return false;
        return true;
    }

    rivets.formatters.emptyObject = function (value) {
        if (!value)
            return true;
        return Object.keys(value).length === 0 && value.constructor === Object;
    }

    rivets.formatters.notEmptyObject = function (value) {
        if (!value)
            return false;
        return !(Object.keys(value).length === 0 && value.constructor === Object);
    }

    rivets.formatters.size = function (value) {
        if (!value)
            return 0;
        return value.length;
    }

    rivets.formatters.sizeGte = function (value, arg) {
        if (!value)
            return false;
        
        return value.length >= arg;
    }

    rivets.formatters.sizeLt = function (value, arg) {
        if (!value)
            return false;
        
        return value.length < arg;
    }

    rivets.formatters.sizeLtAnd = function (value, arg, condition) {
        if (!value)
            return false;
        
        return value.length < arg && condition;
    }

    rivets.formatters.sizeLte = function (value, arg) {
        if (!value)
            return false;
        
        return value.length <= arg;
    }

    rivets.formatters.gt = function (value, arg) {
        if (!value)
            return false;
        return value > arg;
    }

    rivets.formatters.gte = function (value, arg) {
        if (!value)
            return false;
        return value >= arg;
    }

    rivets.formatters.lt = function (value, arg) {
        if (!value)
            return false;
        return value < arg;
    }
    rivets.formatters.lte = function (value, arg) {
        if (!value)
            return false;
        return value <= arg;
    }

    

    rivets.formatters.betweenLo = function (value, arg1, arg2) {
        if (!value)
            return false;
        return value > arg1 && value <= arg2;
    }

    rivets.formatters.itemAt = function (value, index) {
        if (!(value && value instanceof Array))
            return null;
        return value[index || 0];
    }

    rivets.formatters.filterEq = function (value, arg1, arg2) {
        if (!(value && value instanceof Array))
            return null;
        
        return value.filter((item)=>{return item[arg1] == arg2})
    }

    rivets.formatters.hasRole = function (value, roleId) {
        if(!value)
            return false;
        
        if(!value.data)
            return false;
        
        if(!value.data.r)
            return false;

        return value.data.r.split(',').includes(roleId);        
    }

    rivets.formatters.lacksRole = function (value, roleId) {
        return  !rivets.formatters.hasRole(value, roleId);      
    }

    rivets.formatters.addNumber = function (value, arg) {
        return value + arg;
    }

    rivets.formatters.toCurrency = function (value){
        var amount = value/100.0;
        var amountFormatted = amount.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' });
        
        return amountFormatted;
    }

    rivets.formatters.GWEItoETH = function (value){
        var amount = value/1e9;
        var amountFormatted = amount.toLocaleString('pl-PL', { maximumSignificantDigits: 9,  currency: 'ETH'});
        
        return amountFormatted;
    }

    rivets.formatters.decodeStatus = function (value){
        var descriptions = {
            'P': 'Oczekujaca'
        };
        var description =  descriptions[value];
        
        return description;
    }

    rivets.formatters.anchor = function (value){
        return "#"+value
    }

    rivets.formatters.twitterLink = function (value){
        let href = location.href;
        href += `%23${value.ct}`;       
        let txt = encodeURIComponent(value.b);
        const link = `https://twitter.com/share?url=${href}&text=${txt}`
        // console.log(link);
        return link;
    }

    rivets.formatters.decodeTransactionType = function (value){
        var descriptions = {
            'T': 'Napiwek',
            'W': 'Wypłata'
        };
        var description =  descriptions[value];
        
        if(!description){
            // when not set then use T
            description = descriptions['T'];
        }
        return description;
    }

    rivets.formatters.and = function(comparee, comparator) {
        return comparee && comparator;
    }

    rivets.formatters.toCurrencyWithTypeAware = function (value, type){
        var amount = value/100.0;
        // when withdrawal then present as "minus" value
        if(type == 'W')
            amount = -amount;
        var amountFormatted = amount.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' });
        
        return amountFormatted;
    }

    rivets.formatters.prefix = function (value, arg) {
        return `${value}${arg}` ;
    }

    rivets.formatters.debug = function (value){
        console.log(value);        
    }

// };