
function getFileDataList() {
   let data_table = document.getElementById('file-data-listing-table');
   let xhr = new XMLHttpRequest();
   xhr.addEventListener("load", function () {
      console.log(xhr.responseText);
      let j = JSON.parse(xhr.responseText)
      data_table.innerHTML = `
     <thead>
      <tr>
         <th scope="col">Name</th>
         <th scope="col">Status</th>
         <th scope="col">Actions</th>
      </tr>
      </thead>
      <tbody>
      ${j.map(i => 
      `<tr>
            <td>
               ${i['id']}
            </td>
            <td>
               ${i['points'].length} points
            </td>
            <td>
               <input type='hidden' id='table_value_id' value='${i['id']}'>
               <input type='button' value='Delete' id='submit'
                      onClick="deleteFileValue('${i['id']}')">
<input type='button' value='Image' id='submit'
                      onClick="imageFileValue('${i['id']}')">
               <input type='button' value='Download' id='submit'
                      onClick="downloadFileValue('${i['id']}')">
            </td>
          </tr>
      `).join('')}
      </tbody>
      `;
   });
   xhr.open("GET", "https://k2efjrhfqe.execute-api.us-east-2.amazonaws.com/files");
   xhr.send()
}

function getImageDataList() {
   let data_table = document.getElementById('image-data-listing-table');
   let xhr = new XMLHttpRequest();
   xhr.addEventListener("load", function () {
      console.log(xhr.responseText)
      let j = JSON.parse(xhr.responseText)
      data_table.innerHTML = `
     <thead>
      <tr>
         <th scope="col">Name</th>
         <th scope="col">Actions</th>
      </tr>
      </thead>
      <tbody>
      ${j.map(i => 
      `<tr>
            <td>
               ${i['id']}
            </td>
            <td>
               <input type='hidden' id='table_image_id' value='${i['id']}'>
               <input type='button' value='Delete' id='submit'
                      onClick="deleteImageValue('${i['id']}')">
               <input type='button' value='Download' id='submit'
                      onClick="downloadImageValue('${i['id']}')">
            </td>
          </tr>
      `).join('')}
      </tbody>
      `;
   });
   xhr.open("GET", "https://k2efjrhfqe.execute-api.us-east-2.amazonaws.com/images");
   xhr.send()
}

function loadTables() {
   getFileDataList();
   getImageDataList();
}

window.onload = loadTables;

function deleteFileValue(value) {
  let xhr = new XMLHttpRequest();

   xhr.addEventListener("load", function () {
      console.log(xhr.responseText);
     getFileDataList();
   });

   xhr.open("DELETE", "https://k2efjrhfqe.execute-api.us-east-2.amazonaws.com/files/" + value);
   xhr.setRequestHeader("Content-Type", "application/json");
   xhr.send();
}

function downloadFileValue(value) {
  let xhr = new XMLHttpRequest();

   xhr.addEventListener("load", function () {
      let state = JSON.parse(xhr.responseText);

      let element = document.createElement('a');
      element.setAttribute('href',
          'data:text/plain;charset=utf-8, '
          + encodeURIComponent(JSON.stringify(state)));
      element.setAttribute('download', value);
      document.body.appendChild(element);
      element.click();

      document.body.removeChild(element);
   });

   xhr.open("GET", "https://k2efjrhfqe.execute-api.us-east-2.amazonaws.com/files/" + value);
   xhr.setRequestHeader("Content-Type", "application/json");
   xhr.send();
}

function createChartOnElement(state,ctx) {

   Chart.defaults.color = "#000";

   Chart.plugins.register({
      afterRender: function(c) {
        var ctx = c.chart.ctx;
        ctx.save();
        // This line is apparently essential to getting the
        // fill to go behind the drawn graph, not on top of it.
        // Technique is taken from:
        // https://stackoverflow.com/a/50126796/165164
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, c.chart.width, c.chart.height);
        ctx.restore();
    }
   });

   timesteps = [];
   thrust_values = [];
   m_values = [];
   po_values = [];

   for (var i = 0; i < state.points.length; i++) {
      timesteps.push(state.points[i].time);
      thrust_values.push(state.points[i].thrust);
      m_values.push(state.points[i].M*state.Ve);
      po_values.push(state.points[i].Po);
   }

   console.log(thrust_values);
   console.log(timesteps);

   let chart = new Chart(ctx, {
      type: 'line',
      data: {
         labels: timesteps,
         datasets: [
            {
               label: 'thrust',
               data: thrust_values,
               borderWidth: 4,
               borderColor: '#ff0000',
               backgroundColor: 'rgba(0,0,0,0)',
               yAxisID: 'y1'
            },
            {
               label: 'corrected thrust',
               data: m_values,
               borderWidth: 4,
               borderColor: '#00ff00',
               backgroundColor: 'rgba(0,0,0,0)',
               yAxisID: 'y1'
            },
            {
               label: 'pressure of exhaust',
               data: po_values,
               borderWidth: 4,
               borderColor: '#0000ff',
               backgroundColor: 'rgba(0,0,0,0)',
               yAxisID: 'y2'
            }
         ]
      },
      options: {
         animation: false,
         plugins: {
            legend: {
               labels: {
                  font: {
                     size: 20
                  }
               }
            }
         },
         scales: {
            yAxes: [
               {
                "id": "y1",
                 position: "left",
                 stacked: false,
                 grid: {
                    lineWidth: 2
                 },
                 ticks: {
                    font: {
                       size: 16,
                    }
                 },
                 beginAtZero: true
               },
               {
                "id": "y2",
                 position: "right",
                 stacked: false,
                 grid: {
                    lineWidth: 2
                 },
                 ticks: {
                    font: {
                       size: 16,
                    }
                 },
                 beginAtZero: true
               }
            ],
            x: {
               grid: {
                  lineWidth: 2
               },
               ticks: {
                  font: {
                     size: 16
                  }
               },
            }
         }
      }
   });

   return chart
}

function imageFileValue(value) {
   let xhr = new XMLHttpRequest();

   xhr.addEventListener("load", function () {
      let state = JSON.parse(xhr.responseText);

      const canvas = document.createElement('canvas');
      canvas.id = "temp_image_creation";
      document.body.appendChild(canvas);
      chart = createChartOnElement(state,document.getElementById('temp_image_creation'));
      encoding = chart.toBase64Image();
      canvas.style.display = 'none';
      console.log(encoding);

      obj = {
         "name": state.id,
         "data": encoding
      };

      let xhr2 = new XMLHttpRequest();
      xhr2.addEventListener("load", function() {
         loadTables();
      });

      xhr2.open("PUT", "https://k2efjrhfqe.execute-api.us-east-2.amazonaws.com/images"); 
      xhr2.send(JSON.stringify(obj));
   });

   xhr.open("GET", "https://k2efjrhfqe.execute-api.us-east-2.amazonaws.com/files/" + value);
   xhr.setRequestHeader("Content-Type", "application/json");
   xhr.send();
}

function deleteImageValue(value) {
   let xhr = new XMLHttpRequest();

   xhr.addEventListener("load", function () {
      getImageDataList();
   });

   xhr.open("DELETE", "https://k2efjrhfqe.execute-api.us-east-2.amazonaws.com/images/" + value);
   xhr.setRequestHeader("Content-Type", "application/json");
   xhr.send();
}

function downloadImageValue(value) {
   let xhr = new XMLHttpRequest();

    xhr.addEventListener("load", function () {
       let j = JSON.parse(xhr.responseText);
       console.log(j)
       console.log(j['data'])
       console.log(j['data'].replace(/^data:.+;base64,/, ''))
       const byteCharacters = window.atob(j['data'].replace(/^data:.+;base64,/, ''));
       const byteNumbers = new Array(byteCharacters.length);
 
       for (let i = 0; i < byteCharacters.length; i++) {
           byteNumbers[i] = byteCharacters.charCodeAt(i);
       }

       const byteArray = new Uint8Array(byteNumbers);
       const blob = new Blob([byteArray], { type: "image/jpeg" });
       const url = URL.createObjectURL(blob);

       const link = document.createElement('a');
       link.href = url;
       link.download = value + ".jpg";
       link.click();

       URL.revokeObjectURL(url);
    });

    xhr.open("GET", "https://k2efjrhfqe.execute-api.us-east-2.amazonaws.com/images/download/" + value);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
}


function uploadDataFile() {
   const file = document.getElementById('upload_file_target');
   const form = document.getElementById('dataFileUploadForm');
   const data = new FormData(form);

   let name = (file.value.split('\\').pop());

   let xhr = new XMLHttpRequest();

   xhr.addEventListener("load", function () {
      console.log(xhr.responseText);
      getFileDataList();
   });

   xhr.open("POST", "https://k2efjrhfqe.execute-api.us-east-2.amazonaws.com/files/upload/" + name);
   xhr.setRequestHeader("Content-Type", "multipart/form-data");
   xhr.send(data);
}
