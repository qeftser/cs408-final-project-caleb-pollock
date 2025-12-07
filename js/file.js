
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

function imageFileValue(value) {
   let xhr = new XMLHttpRequest();

   xhr.addEventListener("load", function () {
      let state = JSON.parse(xhr.responseText);
      // TODO(qeftser): do the graphing logic for this guy as well...
   });

   xhr.open("PUT", "https://k2efjrhfqe.execute-api.us-east-2.amazonaws.com/files/" + value);
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
       const byteCharacters = aatob(j['data'].replace(/^data:.+;base64,/, ''));
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
