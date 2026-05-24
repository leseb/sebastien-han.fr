(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var canvas = document.getElementById("noise");
  if (!canvas) return;

  var gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
  if (!gl) return;

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var mx = 0.5, my = 0.5, smx = 0.5, smy = 0.5;

  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  var vSrc = "attribute vec2 a_pos; void main(){gl_Position=vec4(a_pos,0,1);}";
  var fSrc = [
    "precision highp float;",
    "uniform float u_t;",
    "uniform vec2 u_res;",
    "uniform vec2 u_mouse;",
    "",
    "vec3 mod289(vec3 x){return x-floor(x/289.0)*289.0;}",
    "vec2 mod289(vec2 x){return x-floor(x/289.0)*289.0;}",
    "vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}",
    "",
    "float snoise(vec2 v){",
    "  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);",
    "  vec2 i=floor(v+dot(v,C.yy));",
    "  vec2 x0=v-i+dot(i,C.xx);",
    "  vec2 i1=(x0.x>x0.y)?vec2(1,0):vec2(0,1);",
    "  vec4 x12=x0.xyxy+C.xxzz;",
    "  x12.xy-=i1;",
    "  i=mod289(i);",
    "  vec3 p=permute(permute(i.y+vec3(0,i1.y,1))+i.x+vec3(0,i1.x,1));",
    "  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);",
    "  m=m*m;m=m*m;",
    "  vec3 x=2.0*fract(p*C.www)-1.0;",
    "  vec3 h=abs(x)-0.5;",
    "  vec3 ox=floor(x+0.5);",
    "  vec3 a0=x-ox;",
    "  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);",
    "  vec3 g;",
    "  g.x=a0.x*x0.x+h.x*x0.y;",
    "  g.yz=a0.yz*x12.xz+h.yz*x12.yw;",
    "  return 130.0*dot(m,g);",
    "}",
    "",
    "void main(){",
    "  vec2 uv=gl_FragCoord.xy/u_res;",
    "  float aspect=u_res.x/u_res.y;",
    "  vec2 st=vec2(uv.x*aspect,uv.y)*2.5;",
    "",
    "  vec2 mOff=(u_mouse-0.5)*0.4;",
    "  st+=mOff;",
    "",
    "  float t=u_t*0.12;",
    "",
    "  float n1=snoise(st+vec2(t,t*0.6))*0.5+0.5;",
    "  float n2=snoise(st*2.1+vec2(-t*0.4,t*0.35))*0.5+0.5;",
    "  float n3=snoise(st*4.3+vec2(t*0.25,-t*0.18))*0.5+0.5;",
    "  float n=n1*0.55+n2*0.3+n3*0.15;",
    "",
    "  vec3 c1=vec3(0.06,0.045,0.03);",
    "  vec3 c2=vec3(0.16,0.09,0.035);",
    "  vec3 c3=vec3(0.42,0.25,0.06);",
    "  vec3 c4=vec3(0.55,0.35,0.10);",
    "",
    "  vec3 col=mix(c1,c2,smoothstep(0.25,0.45,n));",
    "  col=mix(col,c3,smoothstep(0.5,0.7,n)*0.5);",
    "  col=mix(col,c4,smoothstep(0.75,0.95,n)*0.2);",
    "",
    "  float vig=1.0-length((uv-0.5)*vec2(1.3,1.6));",
    "  vig=smoothstep(-0.1,0.6,vig);",
    "  col*=vig;",
    "",
    "  gl_FragColor=vec4(col,0.7);",
    "}"
  ].join("\n");

  function mkShader(src, type) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  var prog = gl.createProgram();
  gl.attachShader(prog, mkShader(vSrc, gl.VERTEX_SHADER));
  gl.attachShader(prog, mkShader(fSrc, gl.FRAGMENT_SHADER));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var aPos = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  var uT = gl.getUniformLocation(prog, "u_t");
  var uR = gl.getUniformLocation(prog, "u_res");
  var uM = gl.getUniformLocation(prog, "u_mouse");

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  document.addEventListener("mousemove", function (e) {
    var rect = canvas.getBoundingClientRect();
    mx = (e.clientX - rect.left) / rect.width;
    my = 1.0 - (e.clientY - rect.top) / rect.height;
  });

  resize();
  window.addEventListener("resize", resize);

  function frame(t) {
    smx += (mx - smx) * 0.03;
    smy += (my - smy) * 0.03;
    gl.uniform1f(uT, t * 0.001);
    gl.uniform2f(uR, canvas.width, canvas.height);
    gl.uniform2f(uM, smx, smy);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
