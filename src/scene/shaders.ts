export const POINT_VERTEX = /* glsl */ `
uniform float uMix;
uniform float uTime;
uniform float uIntro;
uniform float uIntroSpread;
uniform float uSize;
uniform float uDriftAmp;
attribute vec3 aTo;
attribute vec3 aPhase;
attribute float aAccentFrom;
attribute float aAccentTo;
attribute float aRouteFrom;
attribute float aRouteTo;
attribute float aHighlight;
varying float vAccent;
varying float vHighlight;
varying float vRoute;
varying float vDepth;

void main() {
  vec3 settled = mix(position, aTo, uMix) + uDriftAmp * sin(uTime * vec3(0.6, 0.5, 0.7) + aPhase * 6.2831853);
  vec3 p = mix((aPhase - 0.5) * uIntroSpread, settled, uIntro);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  vAccent = mix(aAccentFrom, aAccentTo, uMix);
  vHighlight = aHighlight;
  vRoute = uMix < 0.5 ? aRouteFrom : aRouteTo;
  vDepth = clamp((-mv.z - 3.0) / 6.0, 0.0, 1.0);
  gl_PointSize = uSize * (1.0 + 0.6 * max(vAccent, 0.0) + 1.4 * aHighlight) * (6.0 / -mv.z);
}
`;

export const POINT_FRAGMENT = /* glsl */ `
uniform vec3 uPoint;
uniform vec3 uAccent;
uniform float uDim;
uniform float uTime;
varying float vAccent;
varying float vHighlight;
varying float vRoute;
varying float vDepth;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float soft = smoothstep(0.5, 0.0, d);
  float pulse = vRoute >= 0.0 ? smoothstep(0.06, 0.0, abs(fract(uTime * 0.12) - vRoute)) : 0.0;
  float glow = clamp(max(vAccent, 0.0) + vHighlight + pulse, 0.0, 1.0);
  vec3 color = mix(uPoint, uAccent, glow);
  float alpha = soft * (0.55 + 0.45 * glow) * (1.0 - 0.6 * vDepth);
  alpha *= 1.0 + 0.75 * min(vAccent, 0.0);
  alpha *= 1.0 - 0.7 * uDim;
  gl_FragColor = vec4(color, alpha);
  // THREE.Color stores the hex tokens in linear light; convert back so the points match the CSS colours.
  #include <colorspace_fragment>
}
`;
