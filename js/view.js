
function start() {
   alert("hello");
}

function selectImageValue(name) {
   let xhr = new XMLHttpRequest();
   let img_space = document.getElementById('image_display');

   xhr.addEventListener("load", function () {
      let j = JSON.parse(xhr.responseText);

      img_space.src = j['data'];

   });

   xhr.open("GET", "https://k2efjrhfqe.execute-api.us-east-2.amazonaws.com/images/download/" + name);
   xhr.setRequestHeader("Content-Type", "application/json");
   xhr.send();
}

function filterDisplayImages() {

   let image_table = document.getElementById('image-menu-listing-table');
   let xhr = new XMLHttpRequest();

   filter = document.getElementById('image_prefix').value;

   xhr.addEventListener("load", function () {
      let j = JSON.parse(xhr.responseText);
      image_table.innerHTML = `
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
               <input type='hidden' id='table_value_id' value='${i['id']}'>
               <input type='button' value='Select' id='submit'
                      onClick="selectImageValue('${i['id']}')">
            </td>
          </tr>
      `).join('')}
      </tbody>
      `;
   });
   xhr.open("GET", "https://k2efjrhfqe.execute-api.us-east-2.amazonaws.com/images/" + filter);
   xhr.send()
}

window.onload = filterDisplayImages;
