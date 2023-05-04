/*
function downloadCSV(data) {
    const csvContent = data.map(row => row.join(",")).join("\n");
    let copysv = csvContent
    console.log(csvContent)
    let span = document.createElement("span");
    span.textContent = "click me to copy the csv to your clickboard";
    span.style.cursor = "pointer";
    span.addEventListener("click", () => {
        navigator.clipboard.writeText(copysv);
        alert("CSV copied to clipboard!");
    });
document.body.appendChild(span)
    console.log(csvContent)
    const encodedUri = "data:text/csv;charset=utf-8" + encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "DHT-to-gsheets.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
*/


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


function flaker(snowflake) {
    let bigId = BigInt(snowflake)
    let flaked = (bigId >> 22n)
    return (Number(flaked) + 1420070400000)
}
let countArray = []

function handleFileSelect(event) {
    countArray = []
    countArray.push(["Username", "UserId", "Message", "MessageRaw", "Timestamp"])

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
            currentCountArray.push(contents["meta"]["users"][contents["meta"]["userindex"][count[key]["u"]]]["name"])
            currentCountArray.push(contents["meta"]["userindex"][count[key]["u"]])

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

document.getElementById("file-input").addEventListener("change", handleFileSelect);
document.getElementById("trigger-button").addEventListener("click", () => {
    handleFileSelect({ target: { files: document.getElementById("file-input").files } })
});