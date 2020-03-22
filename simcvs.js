/**********************************************************
 * 
 * PARTICLE SIMULATION OF 
 * INFECTIOUS DISEASE
 * 
 * Copyright Rosandi (2020)
 * email: yudi@rosandi.com, rosandi@geophys.unpad.ac.id
 * 
 */
 
var canvas = document.getElementById("simcvs");
var ctx = canvas.getContext("2d");

var npar = 200;
var w = canvas.width;
var h = canvas.height;
var maxvel=2;
var maxv2=maxvel*maxvel;
var izone=5;
var iz2=izone*izone;
var maxsick=100;
var clevel = ["#33FF3C", "#86FF33", "#86FF33", "#FFDD33", "#FFDD33", "#FF3C33"];
var rateinv=10;
var ninfected=0;
var infectionlevel=0;
var maxinfectionlevel=maxsick*npar;
var worseprobability = 0.75;
var curepropability = 0.25;
var ncured = 0;
var simspeed = 20;
var plotevery = 50;
var nstep = 0;
var initinfect = 1;

var infarr = {
    x: [0],
    y: [0],
    type: 'scatter',
    name: '#infected'
};

var curarr = {
    x: [0],
    y: [0],
    type: 'scatter',
    name: '#cured'
};

var levarr = {
    x: [0],
    y: [0],
    type: 'scatter',
    name: 'inf-level'
};

var layout = {
  autosize: false,
  width: 500,
  height: 300,
  margin: {
    l: 50,
    r: 50,
    b: 50,
    t: 40,
    pad: 4
  },
  yaxis: {range: [0, 110],title: 'percent (%)'},
  xaxis: {title: 'time'}
};

var data=[infarr,curarr,levarr];
Plotly.newPlot('plot',data,layout);

function parti(x, y, vx, vy, rad, infval) {
    this.x = Math.floor(x);
    this.y = Math.floor(y);
    this.vx = vx;
    this.vy = vy;
    this.rad = rad;
    this.sick = 0;
    this.infectime=0;
    
    this.exposed = function(ngsick) {
        if (this.infectime==0) { // if healthy
            if(ngsick>0) {
                // the probability to get sick is proportional to the
                // level of illness of contacted person
                if(Math.random()<(ngsick/maxsick)) this.infectime=1;
            }
        } 
    }
    
    this.healthcondition = function() {        
        if (this.infectime>0) { // if not healthy
            this.infectime++;
            if (this.infectime%rateinv == 1) {
                // there is a chance that health does not worsen
                if(Math.random()<worseprobability) this.sick++;
                if(Math.random()<curepropability) this.sick--;
            }
            if(this.sick > maxsick) this.sick=maxsick;
            if(this.sick<0) {
                this.sick=0;
                this.infectime=0;
                ncured++;
            }
        }
    }
    
    this.draw = function() {
        c=Math.floor((clevel.length-1)*this.sick/maxsick);
        ctx.beginPath();
        ctx.fillStyle = clevel[c];
        ctx.fillRect(this.x, this.y, this.rad, this.rad);
    }
    
    this.update = function() {
        this.x+=this.vx;
        this.y+=this.vy;
        if(this.x < 0) this.x+=w;
        if(this.x > w) this.x-=w;
        if(this.y < 0) this.y+=h;
        if(this.y > h) this.y-=h;
        
        // alter velocity
        this.vx+=(Math.random()-0.5);
        this.vy+=(Math.random()-0.5);        
        
        if(this.vx*this.vx > maxv2) this.vx=Math.sign(this.vx)*maxvel;
        if(this.vy*this.vy > maxv2) this.vy=Math.sign(this.vy)*maxvel;
        
        this.healthcondition();
        
        this.draw();
    }
    
}

var p;

function initiate() {
    p=new Array(npar);
    for (i=0; i<npar;i++) {
        x=Math.random() * w;
        y=Math.random() * h;
        vx=(Math.random()-0.5)*maxvel;
        vy=(Math.random()-0.5)*maxvel;
        p[i]=new parti(x,y,vx,vy,5, 0);
    }
    
    ni=0;
    while (ni<initinfect) {
        // initial infected number
        i=Math.floor(Math.random()*(npar-1));
        if (p[i].infectime==0) {
            p[i].infectime=Math.floor(Math.random()*100);
            ni++;
        }
    }
}

// choose who is ill

function checkneigh() {
    for (i=0; i<npar-1; i++) {
        for (j=i+1; j<npar; j++) {
            dx=p[j].x-p[i].x;
            dy=p[j].y-p[i].y;
            r2=dx*dx+dy*dy;
            if(r2<iz2) {
                p[i].exposed(p[j].sick);
                p[j].exposed(p[i].sick);
            }
        }
    }
    
    // check the number of infected person
    ninfected=0;
    infectionlevel=0;
    for (i=0;i<npar;i++) {
        if (p[i].infectime>0) ninfected++;
        infectionlevel+=p[i].sick;
    }
    document.getElementById("stat").innerHTML=
    "time = "+nstep+
    "<br>#infected = "+ninfected+
    "<br>#cured = "+ncured+
    "<br>infection level = "+(100*infectionlevel/maxinfectionlevel)+"%";
   // console.log(nstep);
}


var id;
var running=false;

function update() {
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,w,h);
    
    for (i=0;i<npar;i++) {
        p[i].update();
    }
    checkneigh();
    if(nstep % plotevery==0) {
        infarr.x.push(nstep);
        curarr.x.push(nstep);
        levarr.x.push(nstep);
        infarr.y.push(100*ninfected/npar);
        curarr.y.push(100*ncured/npar);
        levarr.y.push(100*infectionlevel/maxinfectionlevel);
        Plotly.newPlot('plot',data,layout);
    }
    nstep++;

    if(infectionlevel>0.99*maxinfectionlevel) {
        clearInterval(id);
        running=false;
    }
}

//------- control functions -------

function runpause() {
    if(!running) 
     id = setInterval(update,simspeed);
    else clearInterval(id);
    running=!running;
}

function getval(elid) {
    return document.getElementById(elid).value;
}

function restart() {
    
    npar = getval('density');
    worseprobability = getval('pworse')/100.0;
    curepropability = getval('pcure')/100.0;
    rateinv=getval('rateinv');
    izone=getval('xrad');
    initinfect=getval('initinf');
    
    maxvel=2;
    maxv2=maxvel*maxvel;
    iz2=izone*izone;
    ninfected=initinfect;
    infectionlevel=0;
    maxinfectionlevel=maxsick*npar;
    ncured = 0;
    simspeed = 20;
    plotevery = 50;
    nstep = 0;
    
    infarr.x=[0];
    infarr.y=[0];
    curarr.x=[0];
    curarr.y=[0];
    levarr.x=[0];
    levarr.y=[0];
    
    delete p;
    initiate();
    update();
}

restart();
