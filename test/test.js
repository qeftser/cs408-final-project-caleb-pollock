///// couldn't figure out how to import the functions
///// I wanted and still keep the html I have the same,
///// so I just copied it in here...

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
      po_values.push(samples[i].M / (state.A_star*Math.sqrt((state.k/(state.R*To))*(Math.pow(2.0/(state.k+1),(state.k+1)/(2*(state.k-1)))))));
   }

   return po_values
};

function Po_E(state, po_values) {

   let err = 0.0;
   const count = po_values.length;

   let samples = state.points;

   for (let i = 0; i < count; i++) {
      let j = i + state.start;

      let lhs = Math.pow((samples[j].thrust-(state.Pe-state.Pa)*state.Ae)/state.A_star,2.0);

      let rhs = ((2.0*state.k*state.k)/(state.k-1))*Math.pow(2.0/(state.k+1),(state.k+1)/(state.k-1));


      rhs *= (po_values[i]*po_values[i])-(Math.pow(state.Pe,(state.k-1)/state.k)*Math.pow(state.Po,2.0-(state.k-1)/state.k));

      err += (rhs - lhs) * (rhs - lhs);

   }

   // log-squared error
   return Math.log(err);
};

function M_E(state, m_values, Ve) {

   let mB_err = -1 * state.mass_burned;
   const count = m_values.length;

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
   if (!isNaN(parseInt(value,10)))
      return Math.min(parseInt(value,10),1e15);
   else {
      return 0;
   }
}

function sanitizeNumber(value) {
   if (!isNaN(parseFloat(value)))
      return Math.min(parseFloat(value),1e15);
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

QUnit.module('test', function() {

    QUnit.test('test compute matching M', function(assert) {

       let state = {
          start: 0,
          end: 4,
          points: [
             {
                thrust: 1,
                interval: 0.1,
             },
             {
                thrust: 1,
                interval: 0.1,
             },
             {
                thrust: 1,
                interval: 0.1,
             },
             {
                thrust: 1,
                interval: 0.1,
             },
             {
                thrust: 1,
                interval: 0.1,
             }
          ]
       }

       let result = compute_matching_M(state,2.5);

       assert.closeTo(result[0], 0.4, 0.001);
       assert.closeTo(result[1], 0.556, 0.001);
       assert.closeTo(result[2], 0.775, 0.001);
       assert.closeTo(result[3], 1.079, 0.001);
       assert.closeTo(result[4], 1.503, 0.001);
    });

    QUnit.test('test compute matching Po', function(assert) {

       let state = {
          start: 0,
          end: 4,
          A_star: 0.0000078,
          k: 1.2,
          R: 220,
          points: [
             {
                thrust: 1,
                interval: 0.1,
                M: 0.4,
             },
             {
                thrust: 1,
                interval: 0.1,
                M: 0.556,
             },
             {
                thrust: 1,
                interval: 0.1,
                M: 0.775,
             },
             {
                thrust: 1,
                interval: 0.1,
                M: 1.079,
             },
             {
                thrust: 1,
                interval: 0.1,
                M: 1.503,
             }
          ]
       }

       let result = compute_matching_Po(state,2.5);

       assert.closeTo(result[0], 1426875.215, 0.001);
       assert.closeTo(result[1], 1983356.550, 0.001);
       assert.closeTo(result[2], 2764570.730, 0.001);
       assert.closeTo(result[3], 3848995.894, 0.001);
       assert.closeTo(result[4], 5361483.623, 0.001);
    });

    QUnit.test('test Po_E', function(assert) {

       let state = {
          start: 0,
          end: 4,
          A_star: 0.0000078,
          k: 1.2,
          R: 220,
          Pe: 101000,
          Pa: 101000,
          Ae: 0,
          Po: 0,
          points: [
             {
                thrust: 1,
                interval: 0.1,
                M: 0.4,
             },
             {
                thrust: 1,
                interval: 0.1,
                M: 0.556,
             },
             {
                thrust: 1,
                interval: 0.1,
                M: 0.775,
             },
             {
                thrust: 1,
                interval: 0.1,
                M: 1.079,
             },
             {
                thrust: 1,
                interval: 0.1,
                M: 1.503,
             }
          ]
       }

       let po_values = compute_matching_Po(state,2.5);
       let result = Po_E(state,po_values);

       assert.closeTo(result, 65.523, 0.001);
    });

    QUnit.test('test M_E', function(assert) {

       let state = {
          start: 0,
          end: 4,
          A_star: 0.0000078,
          k: 1.2,
          R: 220,
          Pe: 101000,
          Pa: 101000,
          Ae: 0,
          Po: 0,
          mass_burned: 0.35,
          points: [
             {
                thrust: 1,
                interval: 0.1,
             },
             {
                thrust: 1,
                interval: 0.1,
             },
             {
                thrust: 1,
                interval: 0.1,
             },
             {
                thrust: 1,
                interval: 0.1,
             },
             {
                thrust: 1,
                interval: 0.1,
             }
          ]
       }

       let m_values = compute_matching_M(state,2.5);
       let result = M_E(state,m_values);

       assert.closeTo(result, 0.006, 0.001);
    });

    QUnit.test('test MIN', function(assert) {

       let result = MIN(1,2)

       assert.closeTo(result, 1, 0.001);

       result = MIN(2,1)

       assert.closeTo(result, 1, 0.001);
    });

    QUnit.test('test triangle', function(assert) {

       let result = triangle(1,2,3,4);

       assert.closeTo(result, 6, 0.001);

       result = triangle(10,10,20,20);

       assert.closeTo(result, 150, 0.001);
    });

    QUnit.test('test sanitizeIngeter', function(assert) {

       let result = sanitizeInteger("hi there");

       assert.closeTo(result, 0, 0.001);

       result = sanitizeInteger("234");

       assert.closeTo(result, 234, 0.001);
    });

    QUnit.test('test sanitizeNumber', function(assert) {

       let result = sanitizeNumber("hi there");

       assert.closeTo(result, 0, 0.001);

       result = sanitizeNumber("234.56");

       assert.closeTo(result, 234.56, 0.001);
    });

    QUnit.test('test sanitizeText', function(assert) {

       let result = sanitizeText("hi there");

       assert.equal(result, "hi there");

       result = sanitizeText("&<>\"'/");

       assert.equal(result, "&amp;&lt;&gt;&quot;&#x27;&#x2F;");
    });

});
