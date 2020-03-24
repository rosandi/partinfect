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

const maxsick=100;
const fullangle = 2*Math.PI;
const clevel = ["#33FF3C", "#86FF33", "#86FF33", "#FFDD33", "#FFDD33", "#FF3C33"];
const w = canvas.width;
const h = canvas.height;
const maxvel=2;
const maxv2=maxvel*maxvel;
const simspeed = 20;
const plotevery = 50;

var npar = 200;
var rexpos=2;
var rex2=rexpos*rexpos;
var maxinfectionlevel=maxsick*npar;
var worseprobability = 0.75;
var curepropability = 0.25;
var nstep = 0;
var initinfect = 1;
var tincub = 1000;
var rateinv=5;
var delsick=maxsick/rateinv;

//--- measurement variables
var ndead;
var noninf;
var ncured;
var ninfected;
var infectionlevel;
var simends;

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

var deadarr = {
    x: [0],
    y: [0],
    type: 'scatter',
    name: '#dead'
};

var noinarr = {
    x: [0],
    y: [100],
    type: 'scatter',
    name: '#non-infected'
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

var data=[infarr,noinarr,curarr,deadarr,levarr];

function parti(x, y, vx, vy, rad, infval) {
    this.x = Math.floor(x);
    this.y = Math.floor(y);
    this.vx = vx;
    this.vy = vy;
    this.rad = rad;
    this.sick = 0;
    this.infectime=0;
    this.immune=false;
    this.dead=false;
    
    this.exposed = function(ngsick) {
        if (this.immune) return;
        if (this.sick==0) { // if healthy
            if(ngsick>0) {
                // the probability to get sick is proportional to the
                // level of illness of contacted person
                if(Math.random()<(ngsick/maxsick)) this.sick++;
            }
        } 
    }
    
    // --- this function defines the disease dynamics ----//
    
    this.healthcondition = function() {
        if (this.immune) return;
        
        if (this.sick>0) { // if not healthy
            this.infectime++;
            
            // what to do if a particle passed incubation time..
            if (this.infectime>tincub) {
                this.sick-=delsick;
                // if recovered after infected...
                if (this.sick<delsick) {
                    this.immune=true;
                    this.sick=0;
                }
                return;
            }
            
            // there is a chance that health does not worsen
            if(Math.random()<worseprobability) {
                this.sick+=delsick;
                if(this.sick > maxsick) {
                    this.sick=maxsick;
                    this.dead=true;
                }
            }
            
            if(Math.random()<curepropability){
                this.sick-=delsick;
                // if recovered after infected...
                if (this.sick<delsick) {
                    this.immune=true;
                    this.sick=0;
                }
            }

        }
    }
    
    this.draw = function() {
        c=Math.floor((clevel.length-1)*this.sick/maxsick);
        
        if (this.dead) {
            ctx.fillStyle = 'black';
            ctx.strokeStyle = 'black';
        } else {
            ctx.fillStyle = clevel[c];        
            ctx.strokeStyle = clevel[c];
        }
        
        ctx.beginPath();
        ctx.fillRect(this.x, this.y, this.rad, this.rad);
        
        if (this.sick>0) {
            ctx.beginPath();
            ctx.moveTo(this.x-2,this.y+this.rad/2);
            ctx.lineTo(this.x+this.rad+2,this.y+this.rad/2);
            ctx.moveTo(this.x+this.rad/2,this.y-2);
            ctx.lineTo(this.x+this.rad/2,this.y+this.rad+2);
            ctx.moveTo(this.x-1,this.y-1);
            ctx.lineTo(this.x+this.rad+1,this.y+this.rad+1);
            ctx.moveTo(this.x-1,this.y+this.rad+1);
            ctx.lineTo(this.x+this.rad+1,this.y-1);
            ctx.stroke();
        }
        
        if (this.immune) {
            ctx.beginPath();
            ctx.arc(this.x+this.rad/2,this.y+this.rad/2,this.rad+1,0,fullangle);
            ctx.stroke();
        }
        
    }
    
    this.update = function() {
        if (!this.dead) {
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
        }
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
        if (p[i].sick==0) {
            p[i].sick=Math.floor(Math.random()*100);
            ni++;
        }
    }
}

// choose who is ill

function checkneigh() {
    for (i=0; i<npar-1; i++) {
        if (p[i].dead) continue;
        for (j=i+1; j<npar; j++) {
            if (p[j].dead) continue;
            dx=p[j].x-p[i].x;
            dy=p[j].y-p[i].y;
            r2=dx*dx+dy*dy;
            if(r2<rex2) {
                p[i].exposed(p[j].sick);
                p[j].exposed(p[i].sick);
            }
        }
    }
}


function setstatus(elid,txt) {
    document.getElementById(elid).innerHTML=txt;
}

function detect() {
    // check the number of infected person
    ninfected=0;
    infectionlevel=0;
    ncured=0;
    ndead=0;
    noninf=0;
    
    for (i=0;i<npar;i++) {
        if (p[i].immune) ncured++;
        if (p[i].infectime==0) noninf++;
        if (p[i].dead) ndead++;
        else {
            // only count alive particles
            infectionlevel+=p[i].sick;
            if (p[i].sick>0) ninfected++;
        }
    }
 
    setstatus('stattime','time='+nstep);
    setstatus('statinfect',ninfected);
    setstatus('statuninfect',noninf);
    setstatus('statcured',ncured);
    setstatus('statdeath',ndead);
    setstatus('statinflevel',(100*infectionlevel/maxinfectionlevel).toFixed(2)+"%");
    
}

var id;
var running=false;

function checkending() {
    if(infectionlevel>0.995*maxinfectionlevel) {
        clearInterval(id);
        running=false;
        simends=true;
    }

    if(ninfected==0) { // all the infected particles are dead... no worries
        clearInterval(id);
        running=false;
        simends=true;
    }
    
    
    if (simends) {
        // send data to server

        var dataln=infarr.x.length;
        var datastr="# time infected uninfected cured dead infectionlevel\n"
        for (i=0;i<dataln;i++) {
            datastr+=infarr.x[i]+" ";
            datastr+=infarr.y[i]+" ";
            datastr+=noinarr.y[i]+" ";
            datastr+=curarr.y[i]+" ";
            datastr+=deadarr.y[i]+" ";
            datastr+=levarr.y[i].toFixed(2)+"\n";
        }

        var htreq=new XMLHttpRequest();
        htreq.open('POST','collect.php',true);
        htreq.setRequestHeader('Content-Type','text/plain');
        htreq.send(datastr);
        //console.log(datastr);
    }
}

function update() {
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,w,h);
    
    for (i=0;i<npar;i++) {
        p[i].update();
    }
    
    checkneigh();
    detect();
    nstep++;
    
    if(nstep % plotevery==0) {
        infarr.x.push(nstep);
        curarr.x.push(nstep);
        deadarr.x.push(nstep);
        levarr.x.push(nstep);
        noinarr.x.push(nstep);
        
        infarr.y.push(100*ninfected/npar);
        curarr.y.push(100*ncured/npar);
        deadarr.y.push(100*ndead/npar);
        levarr.y.push(100*infectionlevel/maxinfectionlevel);
        noinarr.y.push(100*noninf/npar);
        Plotly.newPlot('plot',data,layout);
    }

    checkending();
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
    if (running) {
        clearInterval(id);
        running=false;
    }
    npar = getval('density');
    worseprobability = getval('pworse')/100.0;
    curepropability = getval('pcure')/100.0;
    rateinv=getval('rateinv');
    rexpos=getval('xrad');
    tincub=getval('tincub');
    initinfect=getval('initinf');
    
    rex2=rexpos*rexpos;
    ninfected=initinfect;
    infectionlevel=0;
    maxinfectionlevel=maxsick*npar;
    ncured = 0;
    nimmune = 0;
    nstep = 0;
    delsick=maxsick/rateinv;
    simends=false;
    
    infarr.x=[0];
    infarr.y=[0];
    curarr.x=[0];
    curarr.y=[0];
    deadarr.x=[0];
    deadarr.y=[0];
    levarr.x=[0];
    levarr.y=[0];
    noinarr.x=[0];
    noinarr.y=[100];
    
    delete p;
    initiate();
    update();
    Plotly.newPlot('plot',data,layout);
}

restart();
