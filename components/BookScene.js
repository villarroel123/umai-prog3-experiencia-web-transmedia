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

export default function BookScene({ phase, mobilePage, turn, projectionHostRef, onUnavailable, onForwardComplete, onReturnComplete, onTurnComplete }) {
  const mountRef = useRef(null);
  const phaseRef = useRef(phase);
  const mobilePageRef = useRef(mobilePage);
  const forwardRef = useRef(onForwardComplete);
  const returnRef = useRef(onReturnComplete);
  const turnRef = useRef(turn);
  const turnCompleteRef = useRef(onTurnComplete);
  const unavailableRef = useRef(onUnavailable);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { mobilePageRef.current = mobilePage; }, [mobilePage]);
  useEffect(() => { forwardRef.current = onForwardComplete; }, [onForwardComplete]);
  useEffect(() => { returnRef.current = onReturnComplete; }, [onReturnComplete]);
  useEffect(() => { turnRef.current = turn; }, [turn]);
  useEffect(() => { turnCompleteRef.current = onTurnComplete; }, [onTurnComplete]);
  useEffect(() => { unavailableRef.current = onUnavailable; }, [onUnavailable]);

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
    // The DOM ink layer uses the exact canvas that colors the Three.js paper.
    projectionHostRef.current?.style.setProperty("--book-paper-texture", `url("${paperTexture.image.toDataURL("image/png")}")`);
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
    const turningPages = [0, 1].map((index) => {
      const pivot = new THREE.Group();
      const mesh = new THREE.Mesh(leafGeometry(1, PAGE_WIDTH, PAGE_DEPTH, 0.445 + index * 0.015, 0.008), [paper, paperEdge]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;
      pivot.add(mesh);
      pivot.visible = false;
      book.add(pivot);
      return { pivot, mesh, original: Float32Array.from(mesh.geometry.attributes.position.array) };
    });
    const navigationPages = [-1, 1].map((side) => {
      const pivot = new THREE.Group();
      const mesh = new THREE.Mesh(leafGeometry(side, PAGE_WIDTH, PAGE_DEPTH, 0.49, 0.012), [paper, paperEdge]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;
      pivot.add(mesh);
      pivot.visible = false;
      book.add(pivot);
      return { pivot, mesh, original: Float32Array.from(mesh.geometry.attributes.position.array), side };
    });
    const turningShadowMaterial = new THREE.MeshBasicMaterial({ color: 0x493421, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
    const turningShadow = new THREE.Mesh(new THREE.PlaneGeometry(PAGE_WIDTH, PAGE_DEPTH), turningShadowMaterial);
    turningShadow.rotation.x = -Math.PI / 2;
    turningShadow.position.y = 0.485;
    turningShadow.visible = false;
    book.add(turningShadow);

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
    let width = 1;
    let height = 1;
    function resize() {
      width = Math.max(mount.clientWidth, 1);
      height = Math.max(mount.clientHeight, 1);
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

    const introFocus = new THREE.Vector3(window.innerWidth <= 900 ? 0 : -2.45, window.innerWidth <= 900 ? 1.05 : 0.05, 0);
    function introPosition() {
      const narrow = window.innerWidth <= 900;
      return new THREE.Vector3(
        narrow ? 2.0 : 1.55,
        narrow ? 3.4 : 3.1,
        narrow ? Math.max(16, 8.7 / aspect) : 9.1,
      );
    }
    let cachedReadingKey = "";
    let cachedReadingPose;
    // The final distance is calculated from the projected size of the actual model.
    // On narrow screens the camera frames one half of the same book at a time.
    function readingPose() {
      const cacheKey = `${width}:${height}:${window.innerWidth}:${mobilePageRef.current}`;
      if (cacheKey === cachedReadingKey) return cachedReadingPose;
      const narrow = window.innerWidth <= 700;
      const side = mobilePageRef.current === "right" ? 1 : -1;
      const focus = new THREE.Vector3(narrow ? side * 1.13 : 0, 1.29, 0.18);
      // The page normal is +Y. A small +Z component keeps the paper edge visible.
      const direction = new THREE.Vector3(0, 1, 0.1).normalize();
      const view = camera.clone();
      view.fov = narrow ? 32 : 29;
      view.aspect = aspect;
      view.up.set(0, 0, -1);
      view.updateProjectionMatrix();
      const bounds = narrow ? [side < 0 ? -2.35 : 0, side < 0 ? 0 : 2.35] : [-2.35, 2.35];
      const corners = [];
      for (const x of bounds) for (const y of [0.86, 1.63]) for (const z of [-1.55, 1.55]) {
        corners.push(new THREE.Vector3(x, y, z + 0.18));
      }
      let near = 2;
      let far = 22;
      for (let step = 0; step < 20; step += 1) {
        const distance = (near + far) / 2;
        view.position.copy(focus).addScaledVector(direction, distance);
        view.lookAt(focus);
        view.updateMatrixWorld();
        let maxX = 0;
        let maxY = 0;
        for (const point of corners) {
          const projected = point.clone().project(view);
          maxX = Math.max(maxX, Math.abs(projected.x));
          maxY = Math.max(maxY, Math.abs(projected.y));
        }
        if (maxX <= (narrow ? 0.9 : 1.01) && maxY <= (narrow ? 0.8 : 1.09)) far = distance;
        else near = distance;
      }
      cachedReadingKey = cacheKey;
      cachedReadingPose = { position: focus.clone().addScaledVector(direction, far), focus, fov: view.fov };
      return cachedReadingPose;
    }
    function projectPage(side) {
      scene.updateMatrixWorld(true);
      camera.updateMatrixWorld();
      const points = [];
      const inner = side < 0 ? [-1.98, -0.17] : [0.17, 1.98];
      for (const x of inner) for (const z of [-1.22, 1.22]) {
        const fraction = Math.abs(x) / PAGE_WIDTH;
        const worldPoint = book.localToWorld(new THREE.Vector3(x, 0.4 + pageHeight(fraction, z) + 0.008, z));
        points.push(worldPoint.project(camera));
      }
      const left = (Math.min(...points.map((point) => point.x)) + 1) * width / 2 + mount.getBoundingClientRect().left;
      const right = (Math.max(...points.map((point) => point.x)) + 1) * width / 2 + mount.getBoundingClientRect().left;
      const top = (1 - Math.max(...points.map((point) => point.y))) * height / 2 + mount.getBoundingClientRect().top;
      const bottom = (1 - Math.min(...points.map((point) => point.y))) * height / 2 + mount.getBoundingClientRect().top;
      return { left, top, width: right - left, height: bottom - top };
    }
    function updateProjection() {
      const host = projectionHostRef.current;
      if (!host) return;
      for (const [side, name] of [[-1, "left"], [1, "right"]]) {
        const box = projectPage(side);
        host.style.setProperty(`--book-${name}-x`, `${box.left}px`);
        host.style.setProperty(`--book-${name}-y`, `${box.top}px`);
        host.style.setProperty(`--book-${name}-w`, `${box.width}px`);
        host.style.setProperty(`--book-${name}-h`, `${box.height}px`);
      }
      host.dataset.projected = "true";
    }

    const startedAt = performance.now();
    let lastPhase = phaseRef.current;
    let phaseStartedAt = startedAt;
    let phaseStartPosition = camera.position.clone();
    let phaseStartFocus = introFocus.clone();
    let phaseStartFov = 41;
    let phaseStartUp = new THREE.Vector3(0, 1, 0);
    let completed = false;
    let currentTurnId = 0;
    let turnStartedAt = 0;
    let turnCompleted = false;
    let frame;
    if (lastPhase === "reading") {
      book.position.y = 0.98;
      book.rotation.set(0.025, 0, 0);
      const pose = readingPose();
      camera.position.copy(pose.position);
      camera.fov = pose.fov;
      camera.updateProjectionMatrix();
      camera.up.set(0, 0, -1);
      camera.lookAt(pose.focus);
      phaseStartFocus.copy(pose.focus);
      phaseStartUp.copy(camera.up);
    } else {
      camera.position.copy(introPosition());
      camera.lookAt(introFocus);
    }
    phaseStartPosition.copy(camera.position);
    phaseStartFov = camera.fov;
    const cameraFocus = phaseStartFocus.clone();

    function bendTurningPage(item, progress) {
      const { pivot, mesh, original } = item;
      const active = progress > 0 && progress < 1;
      pivot.visible = active;
      if (!active) return;
      pivot.rotation.set(0, 0, 0);
      const attribute = mesh.geometry.attributes.position;
      for (let i = 0; i < attribute.count; i += 1) {
        const fraction = Math.min(1, Math.max(0, Math.abs(original[i * 3]) / PAGE_WIDTH));
        // The free edge starts first; each column bends around the spine in turn.
        const travel = THREE.MathUtils.smoothstep((progress - 0.13 * (1 - fraction)) / 0.87, 0, 1);
        const angle = Math.PI * travel;
        const lift = Math.sin(angle);
        const x = original[i * 3];
        const z = original[i * 3 + 2];
        attribute.setX(i, x * Math.cos(angle));
        attribute.setY(i, original[i * 3 + 1] + 0.46 * Math.abs(x) * lift + 0.08 * lift * Math.sin(Math.PI * fraction));
        attribute.setZ(i, z + 0.035 * lift * Math.pow(fraction, 2) * Math.sin(z * 2.2 + progress * 3));
      }
      attribute.needsUpdate = true;
      mesh.geometry.computeVertexNormals();
    }

    function animate(now) {
      const requestedTurn = turnRef.current;
      if (requestedTurn && requestedTurn.id !== currentTurnId) {
        currentTurnId = requestedTurn.id;
        turnStartedAt = now;
        turnCompleted = false;
      }
      const currentPhase = phaseRef.current;
      if (currentPhase !== lastPhase) {
        lastPhase = currentPhase;
        phaseStartedAt = now;
        phaseStartPosition = camera.position.clone();
        phaseStartFocus = cameraFocus.clone();
        phaseStartFov = camera.fov;
        phaseStartUp = camera.up.clone();
        completed = false;
      }
      const seconds = (now - startedAt) / 1000;
      const elapsed = (now - phaseStartedAt) / 1000;
      const opening = currentPhase === "opening";
      const returning = currentPhase === "returning";
      const reading = currentPhase === "reading";
      const transitioning = opening || returning;
      const initialRise = reducedMotion.matches ? 1 : THREE.MathUtils.smoothstep(seconds, 2.1, 5.15);
      const reaction = opening ? THREE.MathUtils.smoothstep(elapsed, 0, 0.72) : 0;
      const rise = reading ? 1 : opening ? Math.max(initialRise, reaction) : returning ? 1 - THREE.MathUtils.smoothstep(elapsed, 0, 1.8) : initialRise;
      const bob = !reducedMotion.matches && !transitioning && !reading ? Math.sin(seconds * 1.08) * 0.025 * rise : 0;
      book.position.y = 0.16 + rise * 0.82 + bob;
      shadowMaterial.opacity = 0.62 - rise * 0.4;
      const pointerActive = currentPhase === "intro" && !reducedMotion.matches && now - pointer.movedAt < 1650;
      const yaw = pointerActive ? pointer.x * 0.11 : 0;
      const pitch = pointerActive ? pointer.y * -0.055 : 0;
      const readMix = reading ? 1 : opening ? THREE.MathUtils.smoothstep(elapsed, 0.6, 3.15) : returning ? 1 - THREE.MathUtils.smoothstep(elapsed, 0, 1.85) : 0;
      book.rotation.y = THREE.MathUtils.lerp(book.rotation.y, THREE.MathUtils.lerp(-0.1 + yaw, 0, readMix), 0.08);
      book.rotation.x = THREE.MathUtils.lerp(book.rotation.x, THREE.MathUtils.lerp(0.24 + pitch, 0.025, readMix), 0.08);

      const read = readingPose();
      const intro = introPosition();
      const cameraMix = opening ? THREE.MathUtils.smoothstep(elapsed, 0.58, 3.1) : returning ? THREE.MathUtils.smoothstep(elapsed, 0.08, 1.85) : 1;
      if (opening) {
        camera.position.copy(phaseStartPosition).lerp(read.position, cameraMix);
        cameraFocus.copy(phaseStartFocus).lerp(read.focus, cameraMix);
        camera.fov = THREE.MathUtils.lerp(phaseStartFov, read.fov, cameraMix);
        // Leave room for the raised leaves, then ease into the final reading frame.
        const turningRoom = 2.3 * cameraMix * (1 - THREE.MathUtils.smoothstep(elapsed, 2.75, 3.5));
        camera.position.addScaledVector(read.position.clone().sub(read.focus).normalize(), turningRoom);
      } else if (returning) {
        camera.position.copy(phaseStartPosition).lerp(intro, cameraMix);
        cameraFocus.copy(phaseStartFocus).lerp(introFocus, cameraMix);
        camera.fov = THREE.MathUtils.lerp(phaseStartFov, 41, cameraMix);
      } else if (reading) {
        camera.position.lerp(read.position, 0.12);
        cameraFocus.lerp(read.focus, 0.12);
        camera.fov = THREE.MathUtils.lerp(camera.fov, read.fov, 0.12);
      } else {
        camera.position.lerp(intro, 0.028);
        cameraFocus.lerp(introFocus, 0.028);
        camera.fov = THREE.MathUtils.lerp(camera.fov, 41, 0.03);
      }
      const targetUp = new THREE.Vector3(0, 0, -1);
      if (opening) camera.up.copy(phaseStartUp).lerp(targetUp, cameraMix).normalize();
      else if (returning) camera.up.copy(phaseStartUp).lerp(new THREE.Vector3(0, 1, 0), cameraMix).normalize();
      else if (reading) camera.up.copy(targetUp);
      else camera.up.set(0, 1, 0);
      camera.updateProjectionMatrix();
      camera.lookAt(cameraFocus);

      if (!reducedMotion.matches && !transitioning) {
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
      }
      sunlight.intensity = 2.15 + (opening ? Math.sin(Math.min(elapsed / 3.2, 1) * Math.PI) * 0.2 : 0);
      const magic = reducedMotion.matches ? 0 : THREE.MathUtils.smoothstep(seconds, 2.05, 3.65);
      const magicLevel = magic * (opening ? 1 + 0.36 * Math.sin(Math.min(elapsed / 3.4, 1) * Math.PI) : returning ? 1 - 0.45 * cameraMix : reading ? 0.4 : 1);
      magicGroups.forEach(({ count, positions, geometry, material }, group) => {
        material.opacity = (group ? 0.48 : 0.43) * magicLevel;
        for (let i = 0; i < count; i += 1) {
          const angle = (i * 2.399 + group * 0.8) % (Math.PI * 2);
          const orbit = 1.25 + (i % 5) * 0.26;
          const drift = seconds * (0.1 + (i % 4) * 0.027);
          positions[i * 3] = Math.cos(angle + drift) * orbit;
          positions[i * 3 + 1] = book.position.y + 0.2 + ((i * 0.37 + seconds * 0.055) % 1.7);
          positions[i * 3 + 2] = Math.sin(angle + drift) * 0.95 + Math.cos(i * 1.9) * 0.33;
        }
        geometry.attributes.position.needsUpdate = true;
      });
      trailMaterial.opacity = 0.12 * magicLevel;
      pageGlow.intensity = opening ? 0.65 + Math.sin(Math.min(elapsed / 3.4, 1) * Math.PI) * 0.42 : reading ? 0.2 : magic * 0.5;
      pageGlow.position.y = book.position.y + 0.55;
      turningPages.forEach((item, index) => bendTurningPage(item, opening ? (elapsed - (index ? 1.38 : 0.76)) / 1.56 : 0));
      const turnProgress = requestedTurn && !turnCompleted ? Math.min((now - turnStartedAt) / 1550, 1) : 0;
      const projectionHost = projectionHostRef.current;
      if (projectionHost && requestedTurn) {
        const angle = THREE.MathUtils.smoothstep((turnProgress - 0.065) / 0.87, 0, 1) * 180 * -requestedTurn.direction;
        projectionHost.style.setProperty("--book-turn-angle", `${angle}deg`);
        projectionHost.dataset.turnHalf = turnProgress >= 0.5 ? "true" : "false";
      }
      for (const item of navigationPages) {
        bendTurningPage(item, requestedTurn && item.side === requestedTurn.direction ? turnProgress : 0);
      }
      turningShadow.visible = !!requestedTurn && turnProgress > 0 && turnProgress < 1;
      turningShadow.position.x = requestedTurn?.direction === 1 ? -PAGE_WIDTH / 2 : PAGE_WIDTH / 2;
      turningShadowMaterial.opacity = 0.21 * Math.sin(turnProgress * Math.PI);
      if (requestedTurn && turnProgress >= 1 && !turnCompleted) {
        turnCompleted = true;
        navigationPages.forEach((item) => { item.pivot.visible = false; });
        turningShadow.visible = false;
        turnCompleteRef.current();
      }
      if (reading || (opening && elapsed > 3)) updateProjection();
      if (opening && elapsed >= 3.55 && !completed) {
        completed = true;
        forwardRef.current();
      }
      if (returning && elapsed >= 2.05 && !completed) {
        completed = true;
        returnRef.current();
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
  }, [projectionHostRef]);

  return <div ref={mountRef} className="book-journey-stage" role="img" aria-label="El mismo libro antiguo se acerca y abre sus páginas para revelar el índice ilustrado" />;
}
