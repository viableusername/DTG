console.log("V1.2.0")
function downloadCSV(data) {
    const csvContent = "data:text/csv;charset=utf-8," + data.map(row => row.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "DHT-to-gsheets.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// @param {string} raw
function sanitize(raw) {
    return `"${raw.replace(/["`',#]/g, "")}"`
}

function flaker(snowflake) {
    let bigId = BigInt(snowflake)
    let flaked = (bigId >> 22n)
    return (Number(flaked) + 1420070400000)
}

let countArray = []

function normalMode(event) {
    countArray = []
    if (document.getElementById("include-header").checked) {
        countArray.push(["Username", "UserId", "Message", "MessageRaw", "Timestamp"])
    }

    const MAX = flaker(document.getElementById("MAX").value)
    const MIN = flaker(document.getElementById("MIN").value)
    const file = event.target.files;
    const reader = new FileReader();
    reader.onload = function(event) {
      const contents = JSON.parse(event.target.result);

      let count = contents["data"]["793401861293604904"]
      let countKeys = Object.keys(count)
      countKeys.sort((a, b) => parseInt(a) - parseInt(b));
      console.log(countKeys)
      countKeys.forEach((key)=> {

        let timez = count[key]["t"]
        if (timez <= MAX && timez >= MIN) {

            let currentCountArray = []
            currentCountArray.push(sanitize(contents["meta"]["users"][contents["meta"]["userindex"][count[key]["u"]]]["name"]))
            currentCountArray.push(contents["meta"]["userindex"][count[key]["u"]])
            if (count[key]["m"] != undefined) {
                if (count[key]["m"].length >= 6) {
                    if (/^[0-9]{6}$/.test(count[key]["m"].slice(0, 6))) {
                        currentCountArray.push(count[key]["m"].slice(0, 6))
                    } else {
                        currentCountArray.push(000000)
                    }
                } else {
                    currentCountArray.push(000000)
                }
                currentCountArray.push(`"${count[key]["m"].replace(/["`',#]/g, "")}"`)
            } else {
                currentCountArray.push(000000)
                currentCountArray.push(000000)
            }

            /*
            if (!count[key]["m"].includes("#")) {
                currentCountArray.push(`"${count[key]["m"].replace(/["`',#]/g, "")}"`)
            } else {
                if (count[key]["m"].length >= 6) {
                    if (/^[0-9]{6}$/.test(count[key]["m"].slice(0, 6))) {
                        currentCountArray.push(count[key]["m"].slice(0, 6))
                    } else {
                        currentCountArray.push(000000)
                    }
                }
            }
            */
            currentCountArray.push(timez)
            countArray.push(currentCountArray)
        }
      })
      downloadCSV(countArray)
    };
    reader.readAsText(file["0"]);
}


function wrongMode(event) {
    let currentCountArray = [];
    countArray = []
    if (document.getElementById("include-header").checked) {
        countArray.push(["Username", "UserId", "Message", "last count", "type of wrong", "Timestamp"])
    }

    const MAX = flaker(document.getElementById("MAX").value)
    const MIN = flaker(document.getElementById("MIN").value)
    const file = event.target.files;
    const reader = new FileReader();
    reader.onload = function(event) {
        const contents = JSON.parse(event.target.result);

        let count = contents["data"]["793401861293604904"];
        let countKeys = Object.keys(count);
        countKeys.sort((a, b) => parseInt(a) - parseInt(b));
        console.log(countKeys);
        let currentNum = null;
        let lastNum = null;

        // @param {string} count - message[key]["m"]
        // @returns true if any condition is met, otherwise it returns false if none of the conditions are met
        const WRONG = (count, prevNum) => {
        
        if (!count) {
        currentCountArray.push("doesnt exist");
        currentCountArray.push(prevNum);
        currentCountArray.push("no message");
        return true;
        }

        if (count.length < 6) {
        currentCountArray.push(sanitize(count));
        currentCountArray.push(prevNum);
        currentCountArray.push("shorter than expected");
        return true;
        }

        if (!(/^[0-9]{6}$/.test(count.slice(0, 6)))) {
        currentCountArray.push(sanitize(count));
        currentCountArray.push(prevNum);
        currentCountArray.push("not a number");
        return true;
        }

        currentNum = parseInt(count.slice(0, 6), 10);

        if (prevNum === null) {
            lastNum = currentNum;
            return false;
        }

        if (currentNum !== prevNum + 1) {
            currentCountArray.push(sanitize(count));
            currentCountArray.push(prevNum);
            currentCountArray.push(`!WRONG`);
            lastNum = currentNum
            return true;
        } 

        lastNum = currentNum;
        return false;
        }
        countKeys.forEach((key)=> {
            let wrong = false;
            let timez = count[key]["t"];
            if (timez <= MAX && timez >= MIN) {
            
                currentCountArray = [];
                //add username and user id cells
                currentCountArray.push(sanitize(contents["meta"]["users"][contents["meta"]["userindex"][count[key]["u"]]]["name"]));
                currentCountArray.push(contents["meta"]["userindex"][count[key]["u"]]);
                
                /* deprecated in favor of the cleaner !WRONG function
                //the code below is beyond my understanding
                if (count[key]["m"] !== undefined) {
                    if (count[key]["m"].length >= 6) {
                        if (/^[0-9]{6}$/.test(count[key]["m"].slice(0, 6))) {
                            currentNum = parseInt(count[key]["m"].slice(0, 6), 10);
                            if (currentNum != (lastNum + 1)) {
                                currentCountArray.push(sanitize(count[key]["m"]));
                                currentCountArray.push(lastNum);
                                currentCountArray.push("wrong/lastNum error");
                                wrong = true
                            }
                            lastNum = currentNum;
                        } else {
                            currentCountArray.push(sanitize(count[key]["m"]))
                            currentCountArray.push(lastNum)
                            currentCountArray.push("NaN")
                        }
                    } else {
                        currentCountArray.push(sanitize(count[key]["m"]));
                        currentCountArray.push(lastNum);
                        currentCountArray.push("not long enough");
                        wrong = true;
                    }
                } else {
                    currentCountArray.push("doesnt exist");
                    currentCountArray.push(lastNum);
                    currentCountArray.push("no message");
                    wrong = true;
                }
                */
                /*
                if (count[key]["m"] != undefined) {
                    if (count[key]["m"].length >= 6) {
                        if (!(/^[0-9]{6}$/.test(count[key]["m"].slice(0, 6)))) {
                            currentCountArray.push(count[key]["m"].slice(0, 6))
                            wrong = true
                        } else if ()
                    } else {
                        currentCountArray.push(000000)
                        wrong = true
                    }
                    currentCountArray.push(`"${count[key]["m"].replace(/["`',#]/g, "")}"`)
                } else {
                    currentCountArray.push(000000)
                    wrong = true
                }
                if (!count[key]["m"].includes("#")) {
                    currentCountArray.push(`"${count[key]["m"].replace(/["`',#]/g, "")}"`)
                } else {
                    if (count[key]["m"].length >= 6) {
                        if (/^[0-9]{6}$/.test(count[key]["m"].slice(0, 6))) {
                            currentCountArray.push(count[key]["m"].slice(0, 6))
                        } else {
                            currentCountArray.push(000000)
                        }
                    }
                }
                */

                // this function will fill in the "Message" "last count" and "type of wrong" cells
                wrong = WRONG(count[key]["m"], lastNum);
                currentCountArray.push(timez)
                wrong ? countArray.push(currentCountArray) : undefined;
            }
        })
      downloadCSV(countArray)
    };
    reader.readAsText(file["0"]);
}

function regexMode(event) {
    countArray = []
    if (document.getElementById("include-header").checked) {
        countArray.push(["Username", "UserId", "Message", "Timestamp"])
    }
    const MAX = flaker(document.getElementById("MAX").value)
    const MIN = flaker(document.getElementById("MIN").value)
    const regexRaw = document.getElementById("regex-input").value;
    const regexParsed = RegExp(regexRaw);
    const file = event.target.files;
    const reader = new FileReader();
    reader.onload = function(event) {
      const contents = JSON.parse(event.target.result);

      let count = contents["data"]["793401861293604904"]
      let countKeys = Object.keys(count)
      countKeys.sort((a, b) => parseInt(a) - parseInt(b));
      console.log(countKeys)
      countKeys.forEach((key)=> {

        let timez = count[key]["t"]
        if (timez <= MAX && timez >= MIN) {

            let currentCountArray = []
            currentCountArray.push(sanitize(contents["meta"]["users"][contents["meta"]["userindex"][count[key]["u"]]]["name"]))
            currentCountArray.push(contents["meta"]["userindex"][count[key]["u"]])

            /*
            if (count[key]["m"] != undefined) {

                if (count[key]["m"].length >= 6) {
                    if (/^[0-9]{6}$/.test(count[key]["m"].slice(0, 6))) {
                        currentCountArray.push(count[key]["m"].slice(0, 6))
                    } else {
                        currentCountArray.push(000000)
                    }
                } else {
                    currentCountArray.push(000000)
                }
                currentCountArray.push(`"${count[key]["m"].replace(/["`',#]/g, "")}"`)
                
            } else {
                currentCountArray.push(000000)
                currentCountArray.push(000000)
            }
            */
            /*
            if (!count[key]["m"].includes("#")) {
                currentCountArray.push(`"${count[key]["m"].replace(/["`',#]/g, "")}"`)
            } else {
                if (count[key]["m"].length >= 6) {
                    if (/^[0-9]{6}$/.test(count[key]["m"].slice(0, 6))) {
                        currentCountArray.push(count[key]["m"].slice(0, 6))
                    } else {
                        currentCountArray.push(000000)
                    }
                }
            }
            */
           if (count[key]["m"]!= undefined) {
            if (count[key]["m"].match(regexParsed)) {
                currentCountArray.push(count[key]["m"])
                currentCountArray.push(timez)
                countArray.push(currentCountArray)
            }
           }
        }
      })
      downloadCSV(countArray)
    };
    reader.readAsText(file["0"]);
}


//document.getElementById("file-input").addEventListener("change", handleFileSelect);
document.getElementById("trigger-button").addEventListener("click", () => {
    normalMode({ target: { files: document.getElementById("file-input").files } })
});
document.getElementById("wrong-button").addEventListener("click", () => {
    wrongMode({ target: { files: document.getElementById("file-input").files } })
});
document.getElementById("regex-button").addEventListener("click", () => {
    regexMode({ target: { files: document.getElementById("file-input").files } })
});