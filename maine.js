function downloadCSV(data) {
    console.log(data)
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
countArray.push(["Username", "UserId", "Message", "MessageRaw", "Timestamp"])

function handleFileSelect(event) {
    const MAX = flaker(document.getElementById("MAX").value)
    const MIN = flaker(document.getElementById("MIN").value)
    const file = event.target.files;
    const reader = new FileReader();
    reader.onload = function(event) {
      const contents = JSON.parse(event.target.result);

      let count = contents["data"]["793401861293604904"]
      let countKeys = Object.keys(count)
      
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
            currentCountArray.push(`"${count[key]["m"]}"`)
            currentCountArray.push(timez)
            
            countArray.push(currentCountArray)
        }
      })
      downloadCSV(countArray)
    };
    reader.readAsText(file["0"]);
}

document.getElementById("file-input").addEventListener("change", handleFileSelect);