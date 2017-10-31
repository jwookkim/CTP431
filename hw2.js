var paused = false;
//var amp;
var vol;
var aa=1000;

function setup() {
  createCanvas(1200, 700);   // 너비, 높이
  angleMode(DEGREES);

  song = loadSound("bb.mp3",loaded);
  amp = new p5.Amplitude();
  fft = new p5.FFT(0.9, 512);
  amp.setInput(song);

  / 1. 특정 시간에 어떤 동작을 하도록 찾아준다./
  //song.addCue(4, changeBackground);
  //song.addCue(6, changeBackground); 

}
function loaded(){   // 실제로 노래 파일이 로드되기 전까지는 버튼들이 나타지 않는다.
  button=createButton("play");
  button.mousePressed(togglePlaying);

  jumpButton=createButton("jump");
  jumpButton.mousePressed(jumpSong);

  // create sliders
  //amplitude_Slider = createSlider(0, 1, 0.5,0);  // 소리 크기 조절 슬라이더 [0, 1]
  //amplitude_Slider.style('width','80px');
  //duration_Slider = createSlider(0, len, 0);   // 노래 시간 조절 슬라이더
  //var slider_volume = amplitude_Slider.value();
  //song.setVolume(slider_volume);   //

  
}

function togglePlaying(){
  if (!song.isPlaying()){
    song.play();
    song.setVolume(0.4);   //
    button.html("stop")
  }else{
    //song.pause();   // .stop 이랑 .pause 는 다르다. 
    song.stop();
    button.html("play");

  }
}

function jumpSong(){
  var len=song.duration();  // total duration 을 초 단위로 준다.
  var t = random(len);
  //song.jump(len/2);   //  노래의 특정 부분으로 뛴다.
  song.jump(t);   //  노래의 랜덤 부분으로 뛴다.
}


function draw() {
  background(0 , 0, 0);


  // FFT 분석
  spectrum = fft.analyze();


  // fft 분석에서 주파수 영역별 에너지를 얻는다.
  // ("bass", "lowMid", "mid", "highMid", "treble").
  lowEnergy = fft.getEnergy("bass", "lowMid");
  midEnergy = fft.getEnergy("mid", "highMid");
  highEnergy = fft.getEnergy("treble")

  // Volume is between 0 and 1
  vol = amp.getLevel();

  // 그려주는 순서대로 겹침
  makeEnergyRects(midEnergy, highEnergy);    // midEnergy 와 highEnergy 크기를 볼수 있도록 만듦
  makeSpectrumWaveform(spectrum, midEnergy); // midEnergy 와 highEnergy 크기를 볼수 있도록 만듦
  makeBeatEllipse(lowEnergy);                 // 비트 (예:드럼) 를 만드는 lowEnergy 의 크기를 볼 수 있도록 만듦
  makeAmp_rect();                            // 음악의 volume 을 볼 수 있도록 만듦

}

function makeBeatEllipse(energy) {
  // FFT 분석을 통해 음악의 비트를 담당하는 드럼, 타악기 등이 주로 나타나는 낮은 주파수 대역의
  // 에너지를 받아 canvas 센터의 원형으로 표현함. 원이 클 수록 낮은 주파수 대역의 에너지가 
  var inner_radius = energy * .3;
  var outer_radius = energy * .7;
  stroke(255);

  beginShape();
  fill(energy+10, energy+10, energy+10);
  ellipse(width/2, height/2, outer_radius, outer_radius);
  endShape();

  beginShape();
  fill(121 * energy,energy*.5,energy*.5);
  ellipse(width/2, height/2, inner_radius, inner_radius);
  endShape();


}function makeAmp_rect(){
  / 음악의 볼륨을 받아서 좌우 사각 사이드 바로 나타낸다./
  vol = amp.getLevel();
  beginShape();
  fill(vol*random(800,1200),vol*random(500,800),vol*random(500,800));
  stroke(255,255,255);
  
  rect(0,height/2,50,-vol*700)   // 좌측 센터 1 / 붉은 계열
  rect(0,height/2,50,vol*700)    // 좌측 센터 2 / 붉은 계열
  
  rect(width-50,height/2,50,-vol*700)  // 우측 센터 1 / 붉은 계열
  rect(width-50,height/2,50,vol*700)   // 우측 센터 2 / 붉은 계열

  fill(vol*random(700,1000),vol*random(1000,1500),vol*random(700,1000));
  rect(width-50,0,50,vol*700)   // 우측 위쪽 1  / 초록 계열
  rect(0,0,50,vol*700)   // 좌측 위쪽 1  / 초록 계열
  rect(width-50,height,50,-vol*700)   // 우측 아래 1  / 초록 계열
  rect(0,height,50,-vol*700)   // 좌측 아래 1  / 초록 계열

  endShape();

}



function makeSpectrumWaveform(spectrum, energy) {
  var spectrumCopy = spectrum.slice();  // 총 1024 개의 fft 
  noStroke();
  / 1사분면 /
  beginShape();    // 1사분면 1
  fill(energy, energy*2, energy * 100);
  for (var i = 20; i < spectrumCopy.length; i++){
    x = map(i, 20, spectrumCopy.length, width, width/2);
    y = map(spectrumCopy[i], 0, 255, 0, height/2);
    //scale(1, -1);
    rect(x,y, 2, 4);
  }
  endShape();


  beginShape();   //  1사분면 2
  fill(energy*100, energy*2, energy );
  //song.addCue(15, fill(energy, energy*100, energy ); );
  for (var i = 20; i < spectrumCopy.length; i++){
    x = map(i, 20, spectrumCopy.length, width/2, width);
    y = map(spectrumCopy[i], 0, 255, 0, height/2);
    //scale(-1, 1);
    rect(x,y, 2, 4);
  }
  endShape();


  beginShape(); // 1사분면 3
  fill(energy, energy*2, energy * 100);
  // Right side
  for (var i = 20; i < spectrumCopy.length; i++){  // i를 20부터 spectrumcopy 의 길이까지
    x = map(i, 20, spectrumCopy.length, width/2, width);    // 범위를 widt 절ㅁ반으로
    y = map(spectrumCopy[i], 0, 255, height/2, 0);
    rect(x,y, 2, 4);
  }
  endShape();

  beginShape();    // 1사분면 4
  fill(energy*100, energy*2, energy );
  for (var i = 20; i < spectrumCopy.length; i++){
    x = map(i, 20, spectrumCopy.length, width, width/2);
    y = map(spectrumCopy[i], 0, 255, height/2, 0);  //작은거부터 큰걸로
    //scale(1, -1);
    rect(x,y, 2, 4);
  }
  endShape();
/ ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ/

  beginShape();  // 1
  fill(energy, energy*100, energy) ;
  for (var i = 20; i < spectrumCopy.length; i++){  // i를 20부터 spectrumcopy 의 길이까지
    x = map(i, 20, spectrumCopy.length, 0, width/2);    // 범위를 widt 절ㅁ반으로
    y = map(spectrumCopy[i], 0, 255, height/2, 0);
    ellipse(x,y, 10, 5);
  }
  endShape();

  beginShape();  // 왼쪽 위 1
  fill(energy, energy*100, energy) ;
  for (var i = 20; i < spectrumCopy.length; i++){  // i를 20부터 spectrumcopy 의 길이까지
    x = map(i, 20, spectrumCopy.length, 0,width/2);  // 범위를 widt 절ㅁ반으로
    y = map(spectrumCopy[i], 0, 255, 0,-height/2);
    scale(1,-1)
    ellipse(x,y, 10, 5);
  }
  endShape();

  beginShape();  // 왼쪽 위 1
  fill(energy, energy*100, energy) ;
  for (var i = 20; i < spectrumCopy.length; i++){  // i를 20부터 spectrumcopy 의 길이까지
    x = map(i, 20, spectrumCopy.length, width/2,0);  // 범위를 widt 절ㅁ반으로
    y = map(spectrumCopy[i], 0, 255, 0,-height/2);
    scale(1,-1)
    ellipse(x,y, 10, 5);
  }
  endShape();

  // Left side
  beginShape();    // 왼쪽 아래 2
  fill(energy*100, energy*2, energy );
  for (var i = 20; i < spectrumCopy.length; i++){
    x = map(i, 20, spectrumCopy.length, width/2, 0);
    y = map(spectrumCopy[i], 0, 255, height/2, 0);
    //scale(-1, 1);
    rect(x,y, 2, 4);
  }

  endShape();

/ ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ/
  beginShape();    // 3사분면 1
  fill(energy*100, energy*2, energy );
  for (var i = 20; i < spectrumCopy.length; i++){
    x = map(i, 20, spectrumCopy.length, width/2, 0);
    y = map(spectrumCopy[i], 0, 255, height/2, height);
    //scale(-1, 1);
    rect(x,y, 2, 4);
  }
  endShape();


  beginShape();  // 3사분면 2
  fill(energy, energy*100, energy) ;
  for (var i = 20; i < spectrumCopy.length; i++){  // i를 20부터 spectrumcopy 의 길이까지
    x = map(i, 20, spectrumCopy.length, 0, width/2);    // 범위를 widt 절ㅁ반으로
    y = map(spectrumCopy[i],0, 255, height/2, height);
    ellipse(x,y, 10, 5);
    //scale(1,-1)
  }
  endShape();

  beginShape();  // 3사분면 3
  fill(energy, energy*100, energy) ;
  for (var i = 20; i < spectrumCopy.length; i++){  // i를 20부터 spectrumcopy 의 길이까지
    x = map(i, 20, spectrumCopy.length, 0, width/2);    // 범위를 widt 절ㅁ반으로
    y = map(spectrumCopy[i],0, 255, height,height/2);
    ellipse(x,y, 10, 5);
    //scale(1,-1)
  }
  endShape();


  beginShape();    // 3사분면 4
  fill(energy*100, energy*2, energy );
  for (var i = 20; i < spectrumCopy.length; i++){
    x = map(i, 20, spectrumCopy.length, width/2, 0);
    y = map(spectrumCopy[i], 0, 255, height, height/2);
    //scale(1, -1);
    rect(x,y, 2, 4);
  }

  endShape();  

/dddddddddddddddddddddddddddddddddddddddddddddddddddd/

  beginShape();    // 4사분면 1
  fill(energy*100, energy*2, energy );
  for (var i = 20; i < spectrumCopy.length; i++){
    x = map(i, 20, spectrumCopy.length, width, width/2);
    y = map(spectrumCopy[i], 0, 255, height/2, height);
    //scale(-1, 1);
    rect(x,y, 2, 4);
  }
  endShape();


  beginShape();  // 4사분면 2
  fill(energy, energy*100, energy) ;
  for (var i = 20; i < spectrumCopy.length; i++){  // i를 20부터 spectrumcopy 의 길이까지
    x = map(i, 20, spectrumCopy.length, width/2 , width);    // 범위를 widt 절ㅁ반으로
    y = map(spectrumCopy[i],0, 255, height/2, height);
    ellipse(x,y, 10, 5);
    //scale(1,-1)
  }
  endShape();

  beginShape();  // 4사분면 3
  fill(energy, energy*100, energy) ;
  for (var i = 20; i < spectrumCopy.length; i++){  // i를 20부터 spectrumcopy 의 길이까지
    x = map(i, 20, spectrumCopy.length, width/2, width);    // 범위를 widt 절ㅁ반으로
    y = map(spectrumCopy[i],0, 255, height,height/2);
    ellipse(x,y, 10, 5);
    //scale(1,-1)
  }
  endShape();


  beginShape();    // 4사분면 4
  fill(energy*100, energy*2, energy );
  for (var i = 20; i < spectrumCopy.length; i++){
    x = map(i, 20, spectrumCopy.length, width, width/2);
    y = map(spectrumCopy[i], 0, 255, height, height/2);
    //scale(1, -1);
    rect(x,y, 2, 4);
  }

  endShape();  





}


function makeEnergyRects(midEnergy, highEnergy) {
  var rectWidth = 10;         //rect width 정하고,,
  var halfWidth = width/6;    //  half 
  
  stroke(255,255,255);

  / 왼쪽 파트 / 
  beginShape();
  for (var i = 0; i < halfWidth*3; i+=rectWidth) {  //i를 width/2 까지 가져가겠다.
    var color1 = ((highEnergy/4 + midEnergy/4) + 10*i);

    fill(random(0,200),0,color1)
    rect(i, height/2, rectWidth, -2*highEnergy*sin(i/2));   // 작은놈 그래프
    fill(color1,random(0,50),random(0,200))
    rect(i, height/2, rectWidth, 2*highEnergy*sin(i/2));   // 작은놈 그래프
 
    fill(0,0,0,0)
    rect(i, height/2, rectWidth, 2*midEnergy*sin(i/2));    // 큰놈 그래프
    rect(i, height/2, rectWidth, -2*midEnergy*sin(i/2));    // 큰놈 그래프

  }
  endShape();

  / 왼쪽 파트 / 
  beginShape();
  for (var i = 0; i < halfWidth*3; i+=rectWidth) {  //i를 width/2 까지 가져가겠다.
    var blue = ((highEnergy*3 + midEnergy/3) + i)/4;
    fill(0,0, -2*highEnergy*sin(i/2));
    //rect(i, height/2, rectWidth, -2*highEnergy*sin(i/2));
  }
  endShape();


  / 오른쪽 파트 / 
  beginShape();
  for (var i = 0; i < halfWidth*3; i+=rectWidth) {
    var color1 = ((highEnergy*4 + midEnergy/4) + 10*i);
    fill(color1,random(0,50),random(0,200))
    rect(width-i, height/2, rectWidth, -2*highEnergy*sin(i/2));   // 작은놈 그래프
    fill(random(0,200),0,color1)
    rect(width-i, height/2, rectWidth, 2*highEnergy*sin(i/2));   // 작은놈 그래프
 
    fill(0,0,0,0)
    rect(width-i, height/2, rectWidth, 2*midEnergy*sin(i/2));    // 큰놈 그래프
    rect(width-i, height/2, rectWidth, -2*midEnergy*sin(i/2));    // 큰놈 그래프
  }
  endShape();

 
}





