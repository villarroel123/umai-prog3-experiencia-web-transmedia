"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeArtifact({ chapter, onDiscover, discovered }) {
  const mountRef = useRef(null);
  const discoverRef = useRef(onDiscover);

  useEffect(() => { discoverRef.current = onDiscover; }, [onDiscover]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
    camera.position.set(0, 0.15, 5.8);
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      mount.textContent = "La vista 3D no está disponible. Usá el botón Recuperar recuerdo para continuar.";
      mount.classList.add("three-unavailable");
      return () => { mount.textContent = ""; mount.classList.remove("three-unavailable"); };
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const object = new THREE.Group();
    scene.add(object);
    const color = new THREE.Color(chapter.color);
    const gold = new THREE.Color(chapter.accent);
    const mainMaterial = new THREE.MeshStandardMaterial({
      color, metalness: chapter.motif === "ticket" ? 0.25 : 0.08,
      roughness: 0.42, emissive: color, emissiveIntensity: discovered ? 0.3 : 0.12,
      side: THREE.DoubleSide,
    });
    const trimMaterial = new THREE.MeshStandardMaterial({ color: gold, metalness: 0.62, roughness: 0.28, emissive: gold, emissiveIntensity: 0.2 });
    const meshes = [];
    function add(geometry, material, x = 0, y = 0, z = 0) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      object.add(mesh);
      meshes.push(mesh);
      return mesh;
    }

    if (chapter.motif === "ticket") {
      // Talismán de paso: geometría propia, sin reproducir un objeto del film.
      add(new THREE.BoxGeometry(1.55, 2.18, 0.11), mainMaterial);
      const border = add(new THREE.BoxGeometry(1.34, 1.97, 0.016), trimMaterial, 0, 0, 0.067);
      border.scale.set(1, 1, 1);
      add(new THREE.BoxGeometry(1.26, 1.88, 0.018), mainMaterial, 0, 0, 0.08);
      const crest = add(new THREE.TorusGeometry(0.34, 0.035, 8, 48), trimMaterial, 0, 0.3, 0.105);
      crest.rotation.z = Math.PI / 4;
      add(new THREE.OctahedronGeometry(0.18), trimMaterial, 0, 0.3, 0.16);
      for (let i = 0; i < 3; i += 1) add(new THREE.BoxGeometry(0.72, 0.025, 0.02), trimMaterial, 0, -0.4 - i * 0.17, 0.105);
    } else if (chapter.motif === "ember") {
      add(new THREE.IcosahedronGeometry(0.82, 2), mainMaterial);
      const inner = add(new THREE.IcosahedronGeometry(0.52, 1), trimMaterial, 0.09, 0.12, 0.35);
      inner.rotation.z = 0.3;
      for (let i = 0; i < 5; i += 1) {
        const flame = add(new THREE.ConeGeometry(0.2 + i * 0.015, 0.8 + i * 0.12, 5), i % 2 ? mainMaterial : trimMaterial, (i - 2) * 0.24, 0.64 + (i % 2) * 0.1, -0.1);
        flame.rotation.z = (i - 2) * -0.2;
      }
    } else {
      add(new THREE.SphereGeometry(0.78, 32, 20), mainMaterial).scale.set(0.84, 1.2, 0.72);
      const stem = add(new THREE.CylinderGeometry(0.035, 0.055, 0.62, 10), trimMaterial, 0, 1.05, 0);
      stem.rotation.z = -0.2;
      const leaf = add(new THREE.SphereGeometry(0.42, 18, 12), trimMaterial, 0.35, 1.26, 0);
      leaf.scale.set(1, 0.22, 0.54);
      leaf.rotation.z = 0.42;
    }

    const ringMaterial = new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.012, 6, 90), ringMaterial);
    ring.rotation.x = 1.1;
    scene.add(ring);

    // Partículas procedurales: recurso original del proyecto.
    const positions = new Float32Array(150 * 3);
    for (let i = 0; i < 150; i += 1) {
      const angle = i * 2.39996;
      const radius = 1.15 + Math.sqrt(i / 150) * 1.75;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = (i % 11) * 0.11 - 0.55;
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const dustMaterial = new THREE.PointsMaterial({ color: gold, size: 0.026, transparent: true, opacity: 0.8 });
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dust);

    scene.add(new THREE.AmbientLight(0xfff1d8, 1.7));
    const lamp = new THREE.PointLight(gold, 22, 12);
    lamp.position.set(2, 3, 3);
    scene.add(lamp);
    const fill = new THREE.DirectionalLight(0xc5dfdc, 1.5);
    fill.position.set(-2, 0, 3);
    scene.add(fill);

    const pointer = new THREE.Vector2(10, 10);
    const raycaster = new THREE.Raycaster();
    let dragging = false;
    let lastX = 0;
    let downX = 0;
    let moved = false;
    let hover = false;
    let frameId;

    function resize() {
      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    function point(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(meshes).length > 0;
    }
    function move(event) {
      if (dragging) {
        object.rotation.y += (event.clientX - lastX) * 0.009;
        if (Math.abs(event.clientX - downX) > 6) moved = true;
      }
      lastX = event.clientX;
      hover = point(event);
      renderer.domElement.style.cursor = dragging ? "grabbing" : hover ? "pointer" : "grab";
    }
    function down(event) { dragging = true; moved = false; lastX = event.clientX; downX = event.clientX; renderer.domElement.setPointerCapture(event.pointerId); }
    function up(event) {
      dragging = false;
      if (!moved && point(event)) discoverRef.current();
    }
    function animate(time) {
      const seconds = time * 0.001;
      if (!dragging) object.rotation.y += 0.003;
      object.position.y = Math.sin(seconds * 1.25) * 0.1;
      object.rotation.z = Math.sin(seconds * 0.65) * 0.035;
      ring.rotation.z = seconds * 0.16;
      dust.rotation.z = seconds * -0.025;
      const scale = hover && !discovered ? 1.045 : 1;
      object.scale.setScalar(scale);
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    }
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    renderer.domElement.addEventListener("pointermove", move);
    renderer.domElement.addEventListener("pointerdown", down);
    renderer.domElement.addEventListener("pointerup", up);
    resize();
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointermove", move);
      renderer.domElement.removeEventListener("pointerdown", down);
      renderer.domElement.removeEventListener("pointerup", up);
      object.traverse((child) => { if (child.geometry) child.geometry.dispose(); });
      ring.geometry.dispose(); ringMaterial.dispose();
      dustGeometry.dispose(); dustMaterial.dispose();
      mainMaterial.dispose(); trimMaterial.dispose();
      renderer.dispose(); renderer.domElement.remove();
    };
  }, [chapter, discovered]);

  return <div ref={mountRef} className="three-stage" role="img" aria-label={`Recuerdo tridimensional de ${chapter.label}`} />;
}
