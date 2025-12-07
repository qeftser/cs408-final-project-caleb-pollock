//import Chart from "../node_modules/chart.js/dist/chart.umd.min.js";

// data processing functions
const GRAVITY = 9.807

function compute_matching_M(state, Ve) {
   console.log("computing matching m");
   const m_values = [];

   let samples = state.points;
   let accum = 0.0;

   for (var i = state.start; i <= state.end; i++) {

      m_values.push( (samples[i].thrust + (accum*GRAVITY)) / Ve );

      accum += m_values[i - state.start] * samples[i].interval;

   }

   return m_values;
}

function compute_matching_Po(state, To) {
   console.log("computing matching po");

   const po_values = [];

   let samples = state.points;

   for (var i = state.start; i <= state.end; i++) {
      po_values.push(samples[i].M / (state.A_star*Math.sqrt((state.k/(state.R*state.To))*(Math.pow(2.0/(state.k+1),(state.k+1)/(2*(state.k-1)))))));
   }

   return po_values
};

function Po_E(state, po_values) {

   let err = 0.0;
   const count = (state.end - state.start) + 1;

   let samples = state.points;

   for (let i = 0; i < count; i++) {
      let j = i + state.start;

      let lhs = Math.pow((samples[j].thrust-(state.Pe-state.Pa)*state.Ae)/state.A_star,2.0);

      let rhs = ((2.0*state.k*state.k)/(state.k-1))*Math.pow(2.0/(state.k+1),(state.k+1)/(state.k-1));

      rhs *= (po_values[i]*po_values[i])-(Math.pow(state.Pe,(state.k-1)/state.k)*Math.pow(state.Po,2-(state.k-1)/state.k));

      err += (rhs - lhs) * (rhs - lhs);
   }

   return err;
};

function M_E(state, m_values, Ve) {

   let mB_err = -1 * state.mass_burned;
   const count = (state.end - state.start) + 1;

   for (let i = 0; i < count; i++) {
      mB_err += m_values[i] * state.points[i+state.start].interval;
   }

   mB_err = mB_err * mB_err;

   return mB_err;
}

function MIN(x,y) {
   if (x < y) {
      return x;
   }
   else {
      return y;
   }
};

function triangle(a, fA, b, fB) {
   let height = fB - fA;
   let width = b - a;
   let rect = width * MIN(fA,fB);
   return ((height * width) / 2.0) + rect;
};

function sanitizeInteger(value) {
   if (value === parseInt(value,10))
      return value;
   else
      return 0;
}

function sanitizeNumber(value) {
   if (value === parseFloat(value))
      return value;
   else
      return 0;
}

function sanitizeText(value) {
   const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      "/": '&#x2F;',
  };
  const reg = /[&<>"'/]/ig;
  return value.replace(reg, (match)=>(map[match]));
}

// get mass burned and set the total times for data points
// also load in all the parameters that were set.
function computeBaseInformation() {
   console.log("computing base information");

   if (state === null)
      return;

   let start = sanitizeInteger(document.getElementById("start_pos").value);
   document.getElementById("start_pos").value = start;

   let end = sanitizeInteger(document.getElementById("end_pos").value);
   document.getElementById("end_pos").value = start;

   let Pe = sanitizeNumber(document.getElementById("send_Pe").value);
   document.getElementById("send_Pe").value = Pe;
   let k = sanitizeNumber(document.getElementById("send_k").value);
   document.getElementById("send_k").value = k;
   let pp = sanitizeNumber(document.getElementById("send_pp").value);
   document.getElementById("send_pp").value = pp;
   let Pa = sanitizeNumber(document.getElementById("send_Pa").value);
   document.getElementById("send_Pa").value = Pa;
   let Ae = sanitizeNumber(document.getElementById("send_Ae").value);
   document.getElementById("send_Ae").value = Ae;
   let A_star = sanitizeNumber(document.getElementById("send_Astar").value);
   document.getElementById("send_Astar").value = A_star;
   let R = sanitizeNumber(document.getElementById("send_R").value);
   document.getElementById("send_R").value = R;
   let Name = sanitizeText(document.getElementById("send_name").value);
   document.getElementById("send_name").value = Name;

   let count = state.points.length;

   let prior = 0.0;
   for (let i = 0; i < start; i++)
      prior += state.points[i].thrust;
   prior /= start;

   let post = 0.0;
   for (let i = end+1; i < count; ++i)
      post += state.points[i].thrust;
   post /= (count - end) + 1;

   let mB = (prior - post) / GRAVITY;

   state.id = Name;
   state.start = start;
   state.end = end;
   state.mass_burned = mB;

   state.Pe = Pe;
   state.k = k;
   state.Pa = Pa;
   state.Ae = Ae;
   state.A_star = A_star;
   state.R = R;
   state.pp = pp;
   
   let time_accum = 0.0;
   for (let i = 0; i < count; i++) {
      time_accum += state.points[i].interval;
      state.points[i].time = time_accum;
   }
}

function computeVeAndMAndTotalImpulse(state) {
   console.log("computing M and To");

   let best_Ve = 0.0;
   let Ve_err = 9999999999.9;
   let best_m = [];

   for (let Ve = 0.0; Ve < 3000.0; Ve += 0.00625) {

      m_values = compute_matching_M(state,Ve);
      let err = M_E(state,m_values,Ve);

      if (err < Ve_err) {
         best_m = m_values.slice();
         best_Ve = Ve;
         Ve_err = err;
      }
   }

   state.Ve = best_Ve;
   state.Ve_error = Ve_err;
   for (let i = state.start; i <= state.end; i++) {
      state.points[i].M = best_m[i - state.start];
   }

   let total_impulse = 0;
   let time = 0;              // not <= on purpose!
   for (let i = state.start; i < state.end; i++) {
      time += state.points[i].interval;
      total_impulse += triangle(time,
                                state.points[i].M*state.Ve,
                                time+state.points[i+1].interval,
                                state.points[i+1].M*state.Ve);
   }
   state.total_impulse = total_impulse;
}

function computePoAndTo(state) {
   console.log("computing Po and To");

   let best_To = 0.0;
   let To_err = 9999999999999999999999999999.0;
   let best_Po = []

   for (let To = 0.0; To < 10000.0; To += 0.00625) {

      po_values = compute_matching_Po(state,To);
      let err = Po_E(state,po_values);

      if (err < To_err) {
         best_Po = po_values.slice();
         best_To = To;
         To_err = err;
      }
   }

   state.To = best_To;
   state.To_error = To_err;
   for (let i = state.start; i <= state.end; i++) {
      state.points[i].Po = best_Po[i - state.start];
   }
}

function computeValues() {
   computeBaseInformation();
   computeVeAndMAndTotalImpulse(state);
   document.getElementById('ve_value_column').innerHTML = `${state.Ve}`;
   document.getElementById('ve_error_column').innerHTML = `${state.Ve_error}`;
   document.getElementById('total_impulse_column').innerHTML = `${state.total_impulse}`;
   computePoAndTo(state);
   document.getElementById('to_value_column').innerHTML = `${state.To}`;
   document.getElementById('to_error_column').innerHTML = `${state.To_error}`;
}

// the graph we are using
const ctx = document.getElementById('data_graph');

Chart.defaults.color = "#000";

chart = null;
if (ctx) {
   chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [0,1,2,3,4,5],
      datasets: [{
        label: 'thrust',
        data: [12, 19, 3, 5, 2, 3],
        borderWidth: 4
      }]
    },
    options: {
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
        y: {
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
}

// our functions

function startChange(val) {
   document.getElementById('start_pos_out').innerHTML = val;
}

function endChange(val) {
   document.getElementById('end_pos_out').innerHTML = val;
}

function getGraphDataList() {
   let data_table = document.getElementById('graph-menu-listing-table');
   let xhr = new XMLHttpRequest();
   xhr.addEventListener("load", function () {
      let j = JSON.parse(xhr.responseText);
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
               <input type='hidden' id='table_value_id' value='${i['id']}'>
               <input type='button' value='Select' id='submit'
                      onClick="selectFileValue('${i['id']}')">
            </td>
          </tr>
      `).join('')}
      </tbody>
      `;
   });
   xhr.open("GET", "https://k2efjrhfqe.execute-api.us-east-2.amazonaws.com/files");
   xhr.send()
}

window.onload = getGraphDataList;

// the current state we have loaded from a file
let state = null;

function createChart() {

   let ctx = document.getElementById('data_graph');

   Chart.defaults.color = "#000";

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

   new Chart(ctx, {
      type: 'line',
      data: {
         labels: timesteps,
         datasets: [
            {
               label: 'thrust',
               data: thrust_values,
               borderWidth: 4
            },
            {
               label: 'corrected thrust',
               data: m_values,
               borderWidth: 4
            },
            {
               label: 'pressure of exhaust',
               data: po_values,
               borderWidth: 4
            }
         ]
      },
      options: {
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
            y: {
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

}

function selectFileValue(value) {
   let xhr = new XMLHttpRequest();

   xhr.addEventListener("load", function () {
      state = JSON.parse(xhr.responseText);

      document.getElementById("start_pos").value = state.start_pos;
      document.getElementById("end_pos").value = state.end_pos;
      document.getElementById("send_Pe").value = state.Pe;
      document.getElementById("send_k").value = state.k;
      document.getElementById("send_pp").value = state.pp;
      document.getElementById("send_Pa").value = state.Pa;
      document.getElementById("send_Ae").value = state.Ae;
      document.getElementById("send_Astar").value = state.A_star;
      document.getElementById("send_R").value = state.R;
      document.getElementById("send_name").value = state.id;

      computeBaseInformation();
      createChart();

   });

   xhr.open("GET", "https://k2efjrhfqe.execute-api.us-east-2.amazonaws.com/files/" + value);
   xhr.send()
}

function saveConfig() {

   computeBaseInformation();

   let xhr = new XMLHttpRequest();
   console.log(state);

   xhr.addEventListener("load", function () {
      // do nothing
      console.log(xhr.responseText);

   });

   console.log(JSON.stringify(state));

   xhr.open("PUT", "https://k2efjrhfqe.execute-api.us-east-2.amazonaws.com/files/update/" + state.id);
   xhr.send(JSON.stringify(
      state
   ));
}
