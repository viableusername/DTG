function downloadCSV(data) {
    const csvContent = "data:text/csv;charset=utf-8," + data.map(row => row.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "data.csv");
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
countArray.push(["Username", "UserId", "Message", "Timestamp"])
let newestMessage = null
let oldestMessage = null

function handleFileSelect(event) {
    newestMessage = flaker(document.getElementById("newestMessage").value)
    oldestMessage = flaker(document.getElementById("oldestMessage").value)
    console.log(newestMessage, oldestMessage)
    const file = event.target.files;
    const reader = new FileReader();
    reader.onload = function(event) {
      const contents = JSON.parse(event.target.result);
      //console.log(Object.keys(contents["data"]["793401861293604904"]))
      //console.log(contents["data"]["793401861293604904"]["1102816440005967922"])

      let count = contents["data"]["793401861293604904"]
      let countKeys = Object.keys(count)
      
      countKeys.forEach((key)=> {

        let timez = count[key]["t"]
        console.log(timez, newestMessage, oldestMessage)
        if (timez <= newestMessage && timez >= oldestMessage) {
            console.log("passed")

            let currentCountArray = []
            currentCountArray.push(contents["meta"]["users"][contents["meta"]["userindex"][count[key]["u"]]]["name"])
            currentCountArray.push(contents["meta"]["userindex"][count[key]["u"]])

            if (count[key]["m"].length >= 6) {
                currentCountArray.push(count[key]["m"].slice(0, 6))
            }
            currentCountArray.push(timez)
            
            countArray.push(currentCountArray)
        }
      })
      downloadCSV(countArray)
    };
    reader.readAsText(file["0"]);
}

document.getElementById("file-input").addEventListener("change", handleFileSelect);