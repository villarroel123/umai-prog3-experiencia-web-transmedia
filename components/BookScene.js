"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const PAGE_WIDTH = 2.12;
const PAGE_DEPTH = 2.78;

function illustratedTexture(kind) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 768;
  const ink = canvas.getContext("2d");
  const paper = kind === "paper";
  const cover = kind === "cover";
  const gradient = ink.createLinearGradient(0, 0, 1024, 768);
  if (paper) {
    gradient.addColorStop(0, "#e8d6ac");
    gradient.addColorStop(0.5, "#f3e5c4");
    gradient.addColorStop(1, "#d7bd8e");
  } else if (cover) {
    gradient.addColorStop(0, "#29494f");
    gradient.addColorStop(0.52, "#34565a");
    gradient.addColorStop(1, "#1b353e");
  } else {
    gradient.addColorStop(0, "#4a3125");
    gradient.addColorStop(0.54, "#694735");
    gradient.addColorStop(1, "#39261f");
  }
  ink.fillStyle = gradient;
  ink.fillRect(0, 0, 1024, 768);

  // Small fixed variations keep the scene reproducible and give the materials a painted grain.
  for (let i = 0; i < 1850; i += 1) {
    const x = (i * 197.71) % 1024;
    const y = (i * 113.43) % 768;
    ink.fillStyle = paper
      ? (i % 3 ? "rgba(98,67,38,.055)" : "rgba(255,251,225,.19)")
      : cover
        ? (i % 3 ? "rgba(9,31,38,.12)" : "rgba(155,190,181,.075)")
        : (i % 3 ? "rgba(23,12,10,.13)" : "rgba(207,156,102,.11)");
    ink.fillRect(x, y, paper ? 2 : 3, 1);
  }
  if (paper) {
    ink.strokeStyle = "rgba(112,79,45,.32)";
    ink.lineWidth = 2.2;
    ink.strokeRect(54, 47, 914, 674);
    ink.strokeStyle = "rgba(111,81,49,.17)";
    ink.lineWidth = 1;
    ink.strokeRect(69, 62, 884, 644);
    for (const x of [82, 942]) for (const y of [76, 692]) {
      ink.beginPath();
      ink.moveTo(x - 10, y);
      ink.quadraticCurveTo(x, y - 12, x + 10, y);
      ink.quadraticCurveTo(x, y + 12, x - 10, y);
      ink.stroke();
      ink.beginPath();
      ink.arc(x, y, 2.4, 0, Math.PI * 2);
      ink.fillStyle = "rgba(110,76,43,.29)";
      ink.fill();
    }
    ink.strokeStyle = "rgba(109,83,51,.15)";
    ink.lineWidth = 2;
    for (let i = 0; i < 5; i += 1) {
      const y = 274 + i * 52;
      ink.beginPath();
      ink.moveTo(180, y);
      ink.bezierCurveTo(350, y - 4, 565, y + 3, 770 - (i % 2) * 80, y);
      ink.stroke();
    }
    ink.strokeStyle = "rgba(112,78,44,.16)";
    for (let i = 0; i < 3; i += 1) {
      ink.beginPath();
      ink.moveTo(444 + i * 8, 155);
      ink.quadraticCurveTo(512, 104 + i * 9, 580 - i * 8, 155);
      ink.stroke();
    }
  } else if (cover) {
    ink.strokeStyle = "rgba(191,153,87,.56)";
    ink.lineWidth = 6;
    ink.strokeRect(53, 45, 918, 678);
    ink.lineWidth = 2;
    ink.strokeRect(68, 59, 888, 650);
    ink.strokeStyle = "rgba(213,179,110,.58)";
    for (const x of [86, 938]) for (const y of [78, 690]) {
      ink.beginPath();
      ink.moveTo(x, y - 20);
      ink.quadraticCurveTo(x + 17, y, x, y + 20);
      ink.quadraticCurveTo(x - 17, y, x, y - 20);
      ink.stroke();
    }
  } else {
    for (let i = 0; i < 132; i += 1) {
      const y = (i * 83) % 768;
      ink.beginPath();
      ink.moveTo(0, y);
      ink.bezierCurveTo(260, y + Math.sin(i) * 9, 680, y - Math.cos(i * 2) * 9, 1024, y + 2);
      ink.strokeStyle = i % 3 ? "rgba(24,13,10,.2)" : "rgba(216,163,105,.13)";
      ink.lineWidth = i % 7 ? 1 : 3;
      ink.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function pageHeight(fraction, z, cover = false) {
  const nearSpine = Math.exp(-Math.pow((fraction - 0.02) / 0.22, 2));
  const outerCurl = Math.pow(fraction, 6) * (0.024 + 0.02 * Math.pow(Math.abs(z) / 1.4, 2));
  return (cover ? 0.11 : 0.18) * nearSpine + outerCurl
    + 0.018 * Math.sin((fraction * 1.8 + z * 0.23) * Math.PI);
}

// Closed, subdivided volumes: the top, underside and exposed leaf edges are all real geometry.
function leafGeometry(side, width, depth, topY, thickness, cover = false) {
  const columns = 28;
  const rows = 20;
  const surfaceCount = (columns + 1) * (rows + 1);
  const positions = [];
  const uvs = [];
  const indices = [];
  for (let face = 0; face < 2; face += 1) {
    for (let row = 0; row <= rows; row += 1) {
      const across = row / rows;
      for (let column = 0; column <= columns; column += 1) {
        const fraction = column / columns;
        const z = (across - 0.5) * depth * (1 - 0.015 * Math.pow(fraction, 4));
        const edge = 0.018 * Math.sin(across * Math.PI * 3 + side) * Math.pow(fraction, 7);
        const x = side * (0.035 + width * fraction + edge);
        positions.push(x, topY + pageHeight(fraction, z, cover) - face * thickness, z);
        uvs.push(fraction, 1 - across);
      }
    }
  }
  const addQuad = (a, b, c, d, reverse = false) => {
    if (reverse) indices.push(a, c, b, b, c, d);
    else indices.push(a, b, c, b, d, c);
  };
  const topStart = indices.length;
  for (let row = 0; row < rows; row += 1) for (let column = 0; column < columns; column += 1) {
    const a = row * (columns + 1) + column;
    addQuad(a, a + columns + 1, a + 1, a + columns + 2, side < 0);
  }
  const topCount = indices.length - topStart;
  for (let row = 0; row < rows; row += 1) for (let column = 0; column < columns; column += 1) {
    const a = surfaceCount + row * (columns + 1) + column;
    addQuad(a, a + columns + 1, a + 1, a + columns + 2, side > 0);
  }
  const edgeStart = indices.length;
  const perimeter = [];
  for (let column = 0; column <= columns; column += 1) perimeter.push(column);
  for (let row = 1; row <= rows; row += 1) perimeter.push(row * (columns + 1) + columns);
  for (let column = columns - 1; column >= 0; column -= 1) perimeter.push(rows * (columns + 1) + column);
  for (let row = rows - 1; row > 0; row -= 1) perimeter.push(row * (columns + 1));
  for (let i = 0; i < perimeter.length; i += 1) {
    const a = perimeter[i];
    const b = perimeter[(i + 1) % perimeter.length];
    addQuad(a, a + surfaceCount, b, b + surfaceCount, side < 0);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.addGroup(0, topCount + topCount, 0);
  geometry.addGroup(edgeStart, indices.length - edgeStart, 1);
  geometry.computeVertexNormals();
  return geometry;
}

function rounded(parent, size, material, position, radius = 0.05) {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(...size, 3, radius), material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function fadingShadow() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(128, 128, 14, 128, 128, 126);
  gradient.addColorStop(0, "rgba(18,10,9,.53)");
  gradient.addColorStop(1, "rgba(18,10,9,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

export default function BookScene({ opening, onUnavailable, onTransitionComplete }) {
  const mountRef = useRef(null);
  const openingAtRef = useRef(null);
  const completeRef = useRef(onTransitionComplete);
  const unavailableRef = useRef(onUnavailable);

  useEffect(() => { completeRef.current = onTransitionComplete; }, [onTransitionComplete]);
  useEffect(() => { unavailableRef.current = onUnavailable; }, [onUnavailable]);
  useEffect(() => { if (opening) openingAtRef.current = performance.now(); }, [opening]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(41, 1, 0.1, 50);
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      mount.classList.add("is-fallback");
      unavailableRef.current();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    mount.appendChild(renderer.domElement);

    const woodTexture = illustratedTexture("wood");
    const coverTexture = illustratedTexture("cover");
    const paperTexture = illustratedTexture("paper");
    const shadowTexture = fadingShadow();
    const wood = new THREE.MeshStandardMaterial({ map: woodTexture, color: 0xb4a18b, roughness: 1 });
    const woodDark = new THREE.MeshStandardMaterial({ color: 0x493128, roughness: 1 });
    const carvedWood = new THREE.MeshStandardMaterial({ color: 0x674732, roughness: 1 });
    const spiralWood = new THREE.MeshStandardMaterial({ color: 0x986747, roughness: 1 });
    const teal = new THREE.MeshStandardMaterial({ map: coverTexture, color: 0xb9c6b9, roughness: 1, side: THREE.DoubleSide });
    const coverEdge = new THREE.MeshStandardMaterial({ color: 0x18333a, roughness: 1, side: THREE.DoubleSide });
    const paper = new THREE.MeshStandardMaterial({ map: paperTexture, color: 0xf1e4c9, roughness: 1, side: THREE.DoubleSide });
    const paperEdge = new THREE.MeshStandardMaterial({ color: 0xd8c49b, roughness: 1, side: THREE.DoubleSide });
    const gold = new THREE.MeshStandardMaterial({ color: 0x9a794a, roughness: 0.88, metalness: 0.08 });

    // The stand has a narrow inclined cradle, turned centre post, carved spiral and weighted foot.
    const stand = new THREE.Group();
    stand.position.set(0, -0.27, 0.18);
    scene.add(stand);
    rounded(stand, [1.7, 0.18, 1.15], woodDark, [0, -1.82, 0], 0.09);
    rounded(stand, [1.42, 0.1, 0.95], carvedWood, [0, -1.69, 0], 0.07);
    const postProfile = [
      [0.25, -1.69], [0.31, -1.59], [0.27, -1.47], [0.21, -1.36],
      [0.22, -0.44], [0.29, -0.31], [0.34, -0.24], [0.26, -0.15],
    ].map(([radius, y]) => new THREE.Vector2(radius, y));
    const post = new THREE.Mesh(new THREE.LatheGeometry(postProfile, 36), carvedWood);
    post.castShadow = true;
    stand.add(post);
    const helixPoints = [];
    for (let i = 0; i <= 96; i += 1) {
      const progress = i / 96;
      const angle = progress * Math.PI * 5.5;
      helixPoints.push(new THREE.Vector3(Math.cos(angle) * 0.238, -1.38 + progress * 0.9, Math.sin(angle) * 0.238));
    }
    const carving = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(helixPoints), 110, 0.023, 6, false), spiralWood);
    stand.add(carving);
    for (const y of [-1.52, -0.36]) {
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.025, 7, 32), gold);
      collar.rotation.x = Math.PI / 2;
      collar.position.y = y;
      stand.add(collar);
    }
    rounded(stand, [3.55, 0.12, 0.17], woodDark, [0, -0.06, 0.25], 0.04);
    const cradle = rounded(stand, [4.7, 0.17, 3.06], wood, [0, 0.23, 0], 0.12);
    cradle.rotation.x = 0.24;
    const lip = rounded(stand, [4.4, 0.13, 0.13], carvedWood, [0, -0.05, 1.51], 0.045);
    lip.rotation.x = 0.24;
    for (const side of [-1, 1]) {
      const brace = rounded(stand, [0.12, 0.9, 0.12], woodDark, [side * 1.29, -0.38, -0.42], 0.045);
      brace.rotation.z = side * 0.61;
    }
    const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, opacity: 0.62, depthWrite: false });
    const contactShadow = new THREE.Mesh(new THREE.PlaneGeometry(4.3, 2.65), shadowMaterial);
    contactShadow.rotation.x = -Math.PI / 2 + 0.24;
    contactShadow.position.set(0, 0.323, 0);
    stand.add(contactShadow);

    const book = new THREE.Group();
    book.position.set(0, 0.16, 0.18);
    book.rotation.set(0.24, -0.1, 0);
    scene.add(book);
    for (const side of [-1, 1]) {
      const cover = new THREE.Mesh(leafGeometry(side, 2.35, 3.03, -0.01, 0.12, true), [teal, coverEdge]);
      cover.castShadow = true;
      cover.receiveShadow = true;
      book.add(cover);
      const block = new THREE.Mesh(leafGeometry(side, 2.18, 2.83, 0.33, 0.29), [paper, paperEdge]);
      block.castShadow = true;
      block.receiveShadow = true;
      book.add(block);
      for (let layer = 0; layer < 6; layer += 1) {
        const frontEdge = [];
        for (let i = 0; i <= 20; i += 1) {
          const fraction = i / 20;
          frontEdge.push(new THREE.Vector3(
            side * (0.045 + fraction * 2.16),
            0.31 + pageHeight(fraction, 1.39) - layer * 0.039,
            1.405 - 0.02 * Math.pow(fraction, 4),
          ));
        }
        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(frontEdge),
          new THREE.LineBasicMaterial({ color: 0x9d8664, transparent: true, opacity: 0.27 }),
        );
        book.add(line);
      }
      for (let layer = 0; layer < 5; layer += 1) {
        const leaf = new THREE.Mesh(leafGeometry(side, PAGE_WIDTH - layer * 0.008, PAGE_DEPTH - layer * 0.006, 0.345 + layer * 0.009, 0.012), [paper, paperEdge]);
        leaf.receiveShadow = true;
        book.add(leaf);
      }
      // Short edge strokes reveal the stacked paper without thick black outlines.
      const strokes = [];
      for (let i = 0; i < 6; i += 1) {
        const z = -1.22 + i * 0.48;
        strokes.push(new THREE.Vector3(side * 2.17, 0.12 + (i % 2) * 0.018, z));
        strokes.push(new THREE.Vector3(side * 2.18, 0.12 + (i % 2) * 0.018, z + 0.15));
      }
      const marks = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(strokes), new THREE.LineBasicMaterial({ color: 0x9d8d70, transparent: true, opacity: 0.55 }));
      book.add(marks);
      for (const z of [-1.39, 1.39]) {
        const corner = new THREE.Mesh(new THREE.SphereGeometry(0.052, 10, 7), gold);
        corner.scale.set(1, 0.38, 1);
        corner.position.set(side * 2.27, 0.075, z);
        book.add(corner);
      }
    }
    const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.19, 3.03, 24), coverEdge);
    spine.rotation.x = Math.PI / 2;
    spine.position.set(0, -0.005, 0);
    spine.castShadow = true;
    book.add(spine);
    for (const z of [-1.08, 1.08]) {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.215, 0.012, 7, 28), gold);
      band.position.set(0, -0.005, z);
      book.add(band);
    }
    const crease = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 2.77, 12), paperEdge);
    crease.rotation.x = Math.PI / 2;
    crease.position.set(0, 0.55, 0);
    book.add(crease);

    const idleSheets = [-1, 1].map((side) => {
      const mesh = new THREE.Mesh(leafGeometry(side, PAGE_WIDTH, PAGE_DEPTH, 0.4, 0.009), [paper, paperEdge]);
      mesh.receiveShadow = true;
      book.add(mesh);
      return { mesh, original: Float32Array.from(mesh.geometry.attributes.position.array), side };
    });
    const turningPage = new THREE.Group();
    const turningMesh = new THREE.Mesh(leafGeometry(1, PAGE_WIDTH, PAGE_DEPTH, 0.42, 0.014), [paper, paperEdge]);
    turningMesh.castShadow = true;
    turningMesh.receiveShadow = true;
    turningPage.add(turningMesh);
    turningPage.visible = false;
    book.add(turningPage);

    const ambient = new THREE.AmbientLight(0xffe9c8, 1.15);
    scene.add(ambient);
    const sunlight = new THREE.DirectionalLight(0xffc780, 2.15);
    sunlight.position.set(3.4, 7, -2.4);
    sunlight.castShadow = true;
    sunlight.shadow.mapSize.set(1024, 1024);
    sunlight.shadow.camera.left = -4;
    sunlight.shadow.camera.right = 4;
    sunlight.shadow.camera.top = 4;
    sunlight.shadow.camera.bottom = -4;
    sunlight.shadow.bias = -0.0003;
    sunlight.shadow.radius = 3;
    scene.add(sunlight);
    const bounce = new THREE.DirectionalLight(0xc7d8ce, 0.45);
    bounce.position.set(-3, 3, 5);
    scene.add(bounce);
    const pageGlow = new THREE.PointLight(0xffd894, 0, 4.6);
    pageGlow.position.set(0, 1.05, 0.1);
    scene.add(pageGlow);

    const magicGroups = [0, 1].map((group) => {
      const count = group ? 13 : 24;
      const positions = new Float32Array(count * 3);
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({
        color: group ? 0xfff4d9 : 0xf5ca7d,
        size: group ? 0.035 : 0.055,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        sizeAttenuation: true,
      });
      const points = new THREE.Points(geometry, material);
      scene.add(points);
      return { count, positions, geometry, material };
    });
    const trailMaterial = new THREE.LineBasicMaterial({ color: 0xf3c984, transparent: true, opacity: 0, depthWrite: false });
    const trailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.2, 0.38, 1.32),
      new THREE.Vector3(-1.6, 0.48, 1.53),
      new THREE.Vector3(-0.4, 0.54, 1.62),
      new THREE.Vector3(1.15, 0.46, 1.53),
      new THREE.Vector3(2.12, 0.4, 1.22),
    ]);
    const trail = new THREE.Line(new THREE.BufferGeometry().setFromPoints(trailCurve.getPoints(64)), trailMaterial);
    book.add(trail);

    let aspect = 1;
    function resize() {
      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);
      aspect = width / height;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }
    const pointer = { x: 0, y: 0, movedAt: 0 };
    function pointerMove(event) {
      pointer.x = THREE.MathUtils.clamp((event.clientX / window.innerWidth - 0.5) * 2, -1, 1);
      pointer.y = THREE.MathUtils.clamp((event.clientY / window.innerHeight - 0.5) * 2, -1, 1);
      pointer.movedAt = performance.now();
    }
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    window.addEventListener("pointermove", pointerMove, { passive: true });
    resize();
    const initialNarrow = aspect < 0.95;
    camera.position.set(
      initialNarrow ? 2.35 : 3.15,
      initialNarrow ? 2.8 : 3.1,
      (initialNarrow ? 11.75 : window.innerWidth <= 900 ? 8.15 : 9.1) + 0.55,
    );
    camera.lookAt(0, 0.05, 0);

    const startedAt = performance.now();
    const cameraTarget = new THREE.Vector3();
    let frame;
    let completed = false;
    function animate(now) {
      const seconds = (now - startedAt) / 1000;
      const transitionSeconds = openingAtRef.current === null ? -1 : (now - openingAtRef.current) / 1000;
      const leaving = transitionSeconds >= 0;
      const enter = reducedMotion.matches ? 0 : THREE.MathUtils.smoothstep(seconds, 2.1, 5.15);
      const urgentRise = leaving ? THREE.MathUtils.smoothstep(transitionSeconds, 0, 0.75) : 0;
      const rise = Math.max(enter, urgentRise);
      const bob = reducedMotion.matches || leaving ? 0 : Math.sin(seconds * 1.08) * 0.025 * rise;
      book.position.y = 0.16 + rise * 0.82 + bob;
      shadowMaterial.opacity = 0.62 - rise * 0.4;
      const pointerActive = !leaving && !reducedMotion.matches && now - pointer.movedAt < 1650;
      const yaw = pointerActive ? pointer.x * 0.11 : 0;
      const pitch = pointerActive ? pointer.y * -0.055 : 0;
      book.rotation.y = THREE.MathUtils.lerp(book.rotation.y, -0.1 + yaw, 0.035);
      book.rotation.x = THREE.MathUtils.lerp(book.rotation.x, 0.24 + pitch, 0.035);
      const zoom = leaving ? THREE.MathUtils.smoothstep(transitionSeconds, 0, 2.3) : 0;
      const narrow = aspect < 0.95;
      const portraitLayout = window.innerWidth <= 900;
      const targetX = (narrow ? 2.35 : 3.15) - zoom * 1.7;
      const targetY = (narrow ? 2.8 : 3.1) - zoom * 1.05;
      const targetZ = (narrow ? 11.75 : portraitLayout ? 8.15 : 9.1)
        + (1 - THREE.MathUtils.smoothstep(seconds, 0, 3)) * 0.55 - zoom * (narrow ? 5.15 : 4.3);
      cameraTarget.set(targetX, targetY, targetZ);
      camera.position.lerp(cameraTarget, leaving ? 0.085 : 0.028);
      camera.lookAt(0, 0.05 + rise * 0.24 + zoom * 0.58, 0);

      if (!reducedMotion.matches && !leaving) {
        for (const { mesh, original, side } of idleSheets) {
          const attribute = mesh.geometry.attributes.position;
          for (let i = 0; i < attribute.count; i += 1) {
            const x = Math.abs(original[i * 3]) / PAGE_WIDTH;
            const z = original[i * 3 + 2] / (PAGE_DEPTH / 2);
            const wave = Math.pow(x, 4) * Math.pow(Math.max(z, 0), 2)
              * (0.012 + 0.012 * Math.sin(seconds * 1.08 + side)) * rise;
            attribute.setY(i, original[i * 3 + 1] + wave);
          }
          attribute.needsUpdate = true;
          mesh.geometry.computeVertexNormals();
        }
        sunlight.intensity = 2.15 + Math.sin(seconds * 0.47) * 0.045;
      }
      const magic = reducedMotion.matches ? 0 : THREE.MathUtils.smoothstep(seconds, 2.05, 3.65);
      const magicLevel = magic * (leaving ? 1 + 0.32 * THREE.MathUtils.smoothstep(transitionSeconds, 0, 1) : 1);
      magicGroups.forEach(({ count, positions, geometry, material }, group) => {
        material.opacity = (group ? 0.48 : 0.43) * magicLevel;
        for (let i = 0; i < count; i += 1) {
          const phase = (i * 2.399 + group * 0.8) % (Math.PI * 2);
          const orbit = 1.25 + (i % 5) * 0.26;
          const drift = seconds * (0.1 + (i % 4) * 0.027);
          positions[i * 3] = Math.cos(phase + drift) * orbit;
          positions[i * 3 + 1] = book.position.y + 0.2 + ((i * 0.37 + seconds * 0.055) % 1.7);
          positions[i * 3 + 2] = Math.sin(phase + drift) * 0.95 + Math.cos(i * 1.9) * 0.33;
        }
        geometry.attributes.position.needsUpdate = true;
      });
      trailMaterial.opacity = 0.18 * magicLevel * (0.75 + Math.sin(seconds * 0.9) * 0.25);
      pageGlow.intensity = magic * 0.65 + (leaving ? 1.25 * THREE.MathUtils.smoothstep(transitionSeconds, 0.5, 1.9) : 0);
      pageGlow.position.y = book.position.y + 0.55;
      if (leaving) {
        const turn = THREE.MathUtils.smoothstep(transitionSeconds, 0.62, 1.9);
        turningPage.visible = transitionSeconds >= 0.62;
        turningPage.rotation.y = -Math.PI * turn;
        turningPage.rotation.z = Math.sin(Math.PI * turn) * 0.24;
        if (transitionSeconds > 2.45 && !completed) {
          completed = true;
          completeRef.current();
        }
      }
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", pointerMove);
      const geometries = new Set();
      const materials = new Set();
      scene.traverse((child) => {
        if (child.geometry) geometries.add(child.geometry);
        if (child.material) (Array.isArray(child.material) ? child.material : [child.material]).forEach((material) => materials.add(material));
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      woodTexture.dispose();
      coverTexture.dispose();
      paperTexture.dispose();
      shadowTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="intro-stage" role="img" aria-label="Libro antiguo abierto sobre un atril tallado; se eleva suavemente entre motas doradas" />;
}
