/* 
 * Hello! This was my first javascript project, so there's bound to be some silliness
 * going on here. I appreciate feedback or suggestions, so send them my way
 * on Twitter - @mKafarowski
 */

createTable(32);

let uppercaseCookieName = "setUppercaseHex";
let codeStyleCookieName = "useCodeStyle";
let darkmodeCookieName = "darkMode";


// I first used cookies, but then discovered localStorage. Cookies involved too much string comparison!
/*
var decodedCookie = decodeURIComponent(document.cookie);
var cookieList = decodedCookie.split(';');
console.log(decodedCookie);
for(var i = 0; i < cookieList.length; i++){
    while (cookieList[i].charAt(0) == ' ') {
        cookieList[i] = cookieList[i].substring(1);
      }
    
    if (cookieList[i].indexOf(uppercaseCookieName) == 0) {
        let result = (cookieList[i].substring(uppercaseCookieName.length+1, cookieList[i].length) == "true");
        document.getElementById("uppercase_setting").checked = result;
        console.log("uppercase: "+result);
    }
    else if (cookieList[i].indexOf(codeStyleCookieName) == 0){
        let result = (cookieList[i].substring(codeStyleCookieName.length+1, cookieList[i].length) == "true");
        document.getElementById("c_literal_setting").checked = result;
        console.log("codeformat: "+result);
    }
    else if (cookieList[i].indexOf(codeStyleCookieName) == 0){
        let result = (cookieList[i].substring(codeStyleCookieName.length+1, cookieList[i].length) == "true");
        document.getElementById("darkmode_setting").checked = result;
        console.log("darkmode: "+result);
        setDarkmode(result);
    }
}
*/

let fields = ["hex", "bin", "dec", "oct"];
var lastChanged = "dec";
var lastRadix = 10;
var decEquiv = 0;
var shiftDelta = 0;

// Get the settings from local storage
document.getElementById("uppercase_setting").checked = (window.localStorage.getItem("useUppercaseHex") === 'true');
document.getElementById("c_literal_setting").checked = (window.localStorage.getItem("usingCodeStyle") === 'true');
document.getElementById("darkmode_setting").checked = (window.localStorage.getItem("darkmode") === 'true');



// Attach Event Listeners
for(var i = 0; i < fields.length; i++){
    document.getElementById(fields[i]).addEventListener("focus", setLastChangedField)
    document.getElementById(fields[i]).addEventListener("input", updateFields);
}
document.getElementById("uppercase_setting").addEventListener("change", function() { updateFields(); })
document.getElementById("c_literal_setting").addEventListener("change", function() { setValue(decEquiv); }) // Set the last changed to decimal so that we don't get red flashes when toggling the setting
document.getElementById("darkmode_setting").addEventListener("change", function() { setDarkmode(document.getElementById("darkmode_setting").checked); })
document.getElementById("shiftLeft").addEventListener("click", function() { shift(-1); })
document.getElementById("shiftRight").addEventListener("click", function() { shift(1); })
document.getElementById("clearAll").addEventListener("click", function() { setValue(0); })
document.getElementById("setAll").addEventListener("click", function() { setValue(0xFFFFFFFF); })


var numBits = 32;
// Add event listeners to each bit, and add a "bitIndex" attribute to identify them
for (var i = 0; i < numBits; i++){
    var element = document.getElementsByClassName('bit')[i];
    element.addEventListener('click', bitClick);
    element.bitIndex = numBits - i - 1;
}


document.getElementById("dec").value = "";
updateFields();

function createTable(maxValue){
    var table = document.getElementById("quickRef");
    table.classList.add("colorTransition");
    var tr = table.insertRow();
    tr.classList.add("colorTransition");
    var td = tr.insertCell();
    td.appendChild(document.createTextNode("Decimal"));
    td = tr.insertCell();
    td.appendChild(document.createTextNode("Hex"));
    td = tr.insertCell();
    td.appendChild(document.createTextNode("Octal"));
    td = tr.insertCell();
    td.appendChild(document.createTextNode("Binary"));
    var tds = document.getElementsByTagName("td");
    for(var i = 0; i < tds.length; i++) {
        tds[i].style.fontWeight = 400;
    }

    for(var i = 0; i <= maxValue; i++){
        var tr = table.insertRow();
        var td = tr.insertCell();
        tr.classList.add("colorTransition");
        td.appendChild(document.createTextNode(parseInt(i,10).toString(10)));

        td = tr.insertCell();
        td.appendChild(document.createTextNode(parseInt(i,10).toString(16)));

        td = tr.insertCell();
        td.appendChild(document.createTextNode(parseInt(i,10).toString(8)));

        td = tr.insertCell();
        td.appendChild(document.createTextNode(parseInt(i,10).toString(2)));
        
    }
}

// On click event to set and clear for individual bits
function bitClick(){
    var index = event.target.bitIndex;
    if(event.target.innerHTML == "1"){
        event.target.innerHTML = "0";
        decEquiv = (decEquiv & ((~(1 << index)) >>> 0)) >>> 0;
    } else if(event.target.innerHTML == "0"){
        event.target.innerHTML = "1";
        decEquiv = (decEquiv | ((1 << index)>>>0)) >>> 0;
    }
    document.getElementById("dec").value = decEquiv;
    lastChanged = "dec";
    lastRadix = 10;
    updateFields();
}

function setBitElementText(bit, value){
    
}

function getBitElement(bit){
    var element;
    for(var j = 0; j < numBits; j++){
        element = document.getElementsByClassName('bit')[j]
        if(element.bitIndex == bit){
            return element;
        }
    }
}


function setLastChangedField(){
    // We set the last focused input as the lastChanged id.
    // Before, lastChanged was placed in a keypress event, and the id was aquired with event.id
    // Because of the problems with keypress (see comment in updateFields()), this had to aquired a different way
    // focus seems like the logical event for this to happen, and it allows updateFields() to operate
    // without 
    
    var validId = false;
    for(var i = 0; i < fields.length; i++){
        if(fields[i] == event.target.id){
            validId = true;
        }
    }
    if(validId){
        lastChanged = event.target.id;
        lastRadix = getRadixFromId(lastChanged);
    }   
    console.log("now editing " + lastChanged + " (" + lastRadix + ")");
}

function setValue(newDec){
    lastChanged = "dec";
    lastRadix = 10;
    decEquiv = newDec;
    document.getElementById("dec").value = decEquiv.toString(10);
    updateFields();
}

var fadeoutTimeout = null;
function shift(newDelta){
    var newValue;
    if(newDelta > 0){
        console.log("shifting right");
        newValue = (decEquiv >> newDelta) >>> 0;
        newValue = (newValue & 0x7fffffff) >>> 0;   // Workaround for issue where if bit 31 was set it would pull the one when right shifting
        if(shiftDelta < 0){
            shiftDelta = 0;
        }
        document.getElementById("shiftAmount").innerHTML = ">> "

    } else if(newDelta < 0){
        console.log("shifting left");
        newValue = (decEquiv << (-newDelta)) >>> 0;
        if(shiftDelta > 0){
            shiftDelta = 0;
        }
        document.getElementById("shiftAmount").innerHTML = "<< "

    }
    setValue(newValue);

    shiftDelta += newDelta;
    document.getElementById("shiftAmount").innerHTML = document.getElementById("shiftAmount").innerHTML + Math.abs(shiftDelta);
    document.getElementById("shiftAmount").classList.add("visibleShift");
    if(fadeoutTimeout){
        clearTimeout(fadeoutTimeout);
     }
    fadeoutTimeout = setTimeout(hideShiftDelta, 1200);
}

function hideShiftDelta(){
    shiftDelta = 0;
    document.getElementById("shiftAmount").classList.remove("visibleShift");
}

function updateFields(){
    var targetText = document.getElementById(lastChanged).value;
    var caretPosition = document.getElementById(lastChanged).selectionStart;
    var useUppercaseHex = document.getElementById("uppercase_setting").checked;
    var usingCodeStyle = document.getElementById("c_literal_setting").checked;

    /*
    // Set cookies
    var expiry = new Date();
    expiry.setDate(expiry.getDate()+90);
    document.cookie = uppercaseCookieName+"="+useUppercaseHex+"; expires="+expiry.toUTCString()+";path=/";
    document.cookie = codeStyleCookieName+"="+usingCodeStyle+"; expires="+expiry.toUTCString()+";path=/";
    */

    window.localStorage.setItem("useUppercaseHex",useUppercaseHex);
    window.localStorage.setItem("usingCodeStyle", usingCodeStyle);

    console.log(window.localStorage.getItem("useUppercaseHex") === 'true');


    // If we are using code style, check that the first characters entered are correct.
    // Next strip them from the text so that remaining numeric portion can be checked.
    // The leading characters will be re-added later.
   
    if(usingCodeStyle){
        var startChars;
        if(lastChanged == "hex"){
            startChars = "0x";
        } else if (lastChanged == "oct"){
            startChars = "0";
        } else if (lastChanged == "bin"){
            startChars = "0b";
        } else {
            startChars = "";
        }

        if(targetText.length < startChars.length){
            caretPosition = startChars.length;
            targetText = "";
            notifyCharInvalid(lastChanged);
        } else if(targetText.length >= startChars.length && targetText.substring(0,startChars.length) === startChars){
            targetText = targetText.substring(startChars.length, targetText.length);
        } else {
            caretPosition = targetText.length;
            targetText = decEquiv.toString(lastRadix);
            notifyCharInvalid(lastChanged);
        }
    }

    // Search the whole text for invalid characters, even if we've only added one at the end
    // Doing this eliminates the need for validation in a keypress event, which is good for a few reasons:
    // 1) Doing keypress validation requires checking for meta keys, backspaces, arrow keys etc
    // 2) Keypress event is not supported on Android
    // 3) Keypress can't natively support direct pasting without an extra paste event to validate pasted data


    var charsRemoved = 0;
    var textSearched = false;
    while(!textSearched){
        var charError = false;
        for(var i = 0; i < targetText.length; i++){
            if(isNaN(parseInt(targetText.charAt(i), lastRadix))){
                // if an invalid char was found discard it, then break from the loop and search the whole string again
                console.log("invalid text in " + lastChanged + " detected. String was " + targetText);
                targetText = targetText.substring(0, i) + targetText.substring(i+1,targetText.length);
                console.log("String changed to " + targetText);
                charError = true;
                charsRemoved++;
                break;  
            }   
        }
        if(!charError){
            textSearched = true;
        }
    }
    
    // Make sure the number is 32 bit or lower. Prevent changes that will increase the number above 32 bit
    if (targetText.length == 0){
        decEquiv = 0;
    } else if(parseInt(targetText, lastRadix) > 0xFFFFFFFF){
        notifyCharInvalid(lastChanged);
        //decEquiv = 0xFFFFFFFF;
    } else {
        decEquiv = parseInt(targetText, lastRadix);
    }

    // Write out the results
    if(targetText.length == 0){
        document.getElementById("hex").value = "";
        document.getElementById("dec").value = "";
        document.getElementById("bin").value = "";
        document.getElementById("oct").value = "";
    } else {
        document.getElementById("hex").value = decEquiv.toString(16);
        document.getElementById("dec").value = decEquiv.toString(10);
        document.getElementById("bin").value = decEquiv.toString(2);
        document.getElementById("oct").value = decEquiv.toString(8);
    }

    // Capitalize the hex characters if that setting is active
    if(useUppercaseHex){
        document.getElementById("hex").value = document.getElementById("hex").value.toUpperCase();
    }

    // Add back the leading characters if using code style
    if(usingCodeStyle){
        document.getElementById("hex").value = "0x"+document.getElementById("hex").value
        document.getElementById("dec").value = document.getElementById("dec").value
        document.getElementById("bin").value = "0b"+document.getElementById("bin").value 
        document.getElementById("oct").value = "0"+document.getElementById("oct").value
    }
    
    // Reset the caret position (otherwise it would move forward if there was an invalid character)
    document.getElementById(lastChanged).selectionStart =   caretPosition-charsRemoved;
    document.getElementById(lastChanged).selectionEnd   =     caretPosition-charsRemoved;

    if(charsRemoved > 0){
        notifyCharInvalid(lastChanged);
    }

    // For each bit, check if it needs to be set or reset.
    for(var j = 0; j < numBits; j++){
        var bitCheck = Math.min((decEquiv & ((1 << j) >>> 0)) >>> 0, 1);    // >>> 0 is used to assert an unsigned operation. Needed on all bitwise ops!
        if(bitCheck) {
            getBitElement(j).classList.add("setBit");
            getBitElement(j).classList.remove("clearBit");
        } else {
            getBitElement(j).classList.remove("setBit");
            getBitElement(j).classList.add("clearBit");
        }
        getBitElement(j).innerHTML = bitCheck.toString();
    }
}

// Flash a red border on a particular input
function notifyCharInvalid(id){
    document.getElementById(id).classList.add("numericEntryInvalid");
    setTimeout(clearCharInvalid, 10);
}

function clearCharInvalid(){
    for(var i = 0; i < fields.length; i++){
        document.getElementById(fields[i]).classList.remove("numericEntryInvalid");
    }    
}

function getRadixFromId(id){
    var radix;
    switch(id){
        case "bin":{
            radix = 2;
            break;
        }
        case "hex":{
            radix = 16;
            break;
        }
        case "dec":{
            radix = 10;
            break;
        }
        case "oct":{
            radix = 8;
            break;
        }
        default:
            radix = 0;
        break;
    }
    return radix;
}

function setDarkmode(darkmode){
    if(darkmode == true){
        document.documentElement.setAttribute("color-mode", "dark");
    } else {
        document.documentElement.setAttribute("color-mode", "light");
    }
    window.localStorage.setItem("darkmode", darkmode);
}