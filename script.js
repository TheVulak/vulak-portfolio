/// ==========================================================
/// REVEAL CONTROLLER
/// ==========================================================

document.addEventListener("DOMContentLoaded", function () {
  const reveals = document.querySelectorAll(".reveal");

  const revealOnScroll = function (entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      }
    });
  };

  const observerOptions = {
    root: null,
    threshold: 0.15
  };

  const observer = new IntersectionObserver(revealOnScroll, observerOptions);

  reveals.forEach(reveal => {
    observer.observe(reveal);
  });
});

/// ==========================================================
/// CUSTOM CURSOR
/// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const hydraMainPageRightCustom = document.querySelector(".hydra-main-page-right-custom");
  if (!hydraMainPageRightCustom) return;

  if (document.getElementById("canvas-3d-container-hydra_mannequin_main_page")) return;

  const containerHero3D = document.createElement("div");
  containerHero3D.id = "canvas-3d-container-hydra_mannequin_main_page";
  containerHero3D.className = "showcase-viewer-container interactive-model-box tilt-card floating-viewer hero-3d-box";

  hydraMainPageRightCustom.prepend(containerHero3D);

  let loaderHero = null;
  const modelsListHero = [
    {
      path: 'hydra_material/models/vulak_main/vulak_light_render.glb',
      name: 'Vulak',
      animations: ['standard_mannequin']
    },
    {
      path: 'hydra_material/models/vulak_main/vulak_dark_render.glb',
      name: 'Vulak',
      animations: ['standard_mannequin']
    }
  ];

  let currentModelIndexHero = 1;
  let gltfCacheHero = null;

  let allowMouseTracking = false;
  setTimeout(() => {
    allowMouseTracking = true;
  }, 1500);

  const sceneHero = new THREE.Scene();
  const cameraHero = new THREE.PerspectiveCamera(
    45,
    containerHero3D.clientWidth / containerHero3D.clientHeight,
    0.1,
    1000
  );
  
  const defaultCameraZ = 2.825;
  cameraHero.position.set(0, -0.075, defaultCameraZ);
  cameraHero.rotation.x = 0.05;

  let isReturningZoomHero = false;
  let zoomTimeoutHero = null;

  const rendererHero = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  rendererHero.setSize(containerHero3D.clientWidth, containerHero3D.clientHeight);
  rendererHero.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  rendererHero.toneMapping = THREE.ReinhardToneMapping;
  rendererHero.toneMappingExposure = 1.5;
  containerHero3D.appendChild(rendererHero.domElement);

  const ambientLightHero = new THREE.AmbientLight(0xffffff, 0.5);
  sceneHero.add(ambientLightHero);

  const dirLight1Hero = new THREE.DirectionalLight(0xffffff, 3);
  dirLight1Hero.position.set(-1, 10, 7);
  sceneHero.add(dirLight1Hero);

  const dirLight2Hero = new THREE.DirectionalLight(0xffffff, 1);
  dirLight2Hero.position.set(-5, -5, -5);
  sceneHero.add(dirLight2Hero);

  const groupHero = new THREE.Group();
  sceneHero.add(groupHero);

  let mixerHero = null;
  const clockHero = new THREE.Clock();
  const loaderInstanceHero = new THREE.GLTFLoader();
  let currentLoadedModelHero = null;

  let targetBoneHero = null;
  const mouseHeroCoords = { x: 0, y: 0 };

  // --- NUEVO CURSOR PERSONALIZADO ---
  const hideCursorStyle = document.createElement("style");
  hideCursorStyle.innerHTML = `
    *, *:hover {
      cursor: none !important;
    }
  `;
  document.head.appendChild(hideCursorStyle);

  const cursorDot = document.createElement("div");
  cursorDot.id = "custom-cursor-dot";
  cursorDot.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 8px;
    height: 8px;
    background-color: hsla(271, 91%, 65%, 1);
    border-radius: 50%;
    pointer-events: none;
    z-index: 999999;
    transform: translate(-50%, -50%);
    transition: width 0.2s ease, height 0.2s ease, background-color 0.2s ease, opacity 0.2s ease;
    box-shadow: 0 0 10px hsla(271, 91%, 65%, 0.8);
  `;

  const cursorRing = document.createElement("div");
  cursorRing.id = "custom-cursor-ring";
  cursorRing.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 64px;
    height: 64px;
    border: 1px solid hsla(241, 91%, 65%, 0.5);
    border-radius: 50%;
    pointer-events: none;
    z-index: 999998;
    transform: translate(-50%, -50%);
    transition: width 0.25s ease, height 0.25s ease, border-color 0.25s ease, opacity 0.25s ease, background-color 0.25s ease;
    background-color: hsla(240, 63%, 17%, 0.29);
  `;

  document.body.appendChild(cursorDot);
  document.body.appendChild(cursorRing);

  let ringX = 0;
  let ringY = 0;

  window.addEventListener("pointermove", (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Coordenadas normalizadas para el visor 3D (-1 a 1)
    mouseHeroCoords.x = (mouseX / window.innerWidth) * 2 - 1;
    mouseHeroCoords.y = -(mouseY / window.innerHeight) * 2 + 1;
    
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
    
    cursorDot.style.opacity = "1";
    cursorRing.style.opacity = "1";

    const glow = document.querySelector(".page-glow");
    if (glow) {
      glow.style.left = `${mouseX}px`;
      glow.style.top = `${mouseY}px`;
    }
  });

  function renderCursor() {
    // Usamos las últimas coordenadas guardadas del punto del cursor
    const currentDotX = parseFloat(cursorDot.style.left) || 0;
    const currentDotY = parseFloat(cursorDot.style.top) || 0;

    ringX += (currentDotX - ringX) * 0.2;
    ringY += (currentDotY - ringY) * 0.2;
    
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
    
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  const interactiveSelectors = "a, button, .hydra_gallery_art_card-thumb, .hydra_gallery_art_card-header, .category-toggle, canvas, input, textarea, select";
  
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(interactiveSelectors)) {
      cursorDot.style.width = "14px";
      cursorDot.style.height = "14px";
      cursorDot.style.backgroundColor = "hsla(0, 0%, 100%, 1)";
      cursorRing.style.width = "54px";
      cursorRing.style.height = "54px";
      cursorRing.style.borderColor = "hsla(271, 91%, 65%, 0.8)";
      cursorRing.style.backgroundColor = "hsla(271, 91%, 65%, 0.1)";
    }
  });

  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(interactiveSelectors)) {
      cursorDot.style.width = "8px";
      cursorDot.style.height = "8px";
      cursorDot.style.backgroundColor = "hsla(271, 91%, 65%, 1)";
      cursorRing.style.width = "36px";
      cursorRing.style.height = "36px";
      cursorRing.style.borderColor = "hsla(241, 91%, 65%, 0.5)";
      cursorRing.style.backgroundColor = "hsla(241, 91%, 65%, 0.03)";
    }
  });

  window.addEventListener("mousedown", () => {
    cursorDot.style.transform = "translate(-50%, -50%) scale(0.7)";
    cursorRing.style.transform = "translate(-50%, -50%) scale(0.85)";
  });

  window.addEventListener("mouseup", () => {
    cursorDot.style.transform = "translate(-50%, -50%) scale(1)";
    cursorRing.style.transform = "translate(-50%, -50%) scale(1)";
  });

  document.addEventListener("mouseleave", () => {
    cursorDot.style.opacity = "0";
    cursorRing.style.opacity = "0";
  });

  document.addEventListener("mouseenter", () => {
    cursorDot.style.opacity = "1";
    cursorRing.style.opacity = "1";
  });

  function playDefaultAnimationsForCurrentModel() {
    if (!currentLoadedModelHero || !gltfCacheHero) return;
    const modelScene = currentLoadedModelHero.children[0];
    if (!modelScene) return;

    if (mixerHero) {
      mixerHero.stopAllAction();
    } else {
      mixerHero = new THREE.AnimationMixer(modelScene);
    }

    const modelData = modelsListHero[currentModelIndexHero];
    if (gltfCacheHero.animations && gltfCacheHero.animations.length > 0) {
      modelData.animations.forEach(nombre => {
        const clip = THREE.AnimationClip.findByName(gltfCacheHero.animations, nombre);
        if (clip) {
          const action = mixerHero.clipAction(clip);
          action.reset();
          action.play();
        }
      });
    }
  }

  const bottomControlBarHero = document.createElement("div");
  bottomControlBarHero.className = "model-switch-container";

  const switchLabel = document.createElement("label");
  switchLabel.className = "model-switch";

  const switchInput = document.createElement("input");
  switchInput.type = "checkbox";
  
  const sliderUi = document.createElement("span");
  sliderUi.className = "model-slider-ui";

  switchLabel.appendChild(switchInput);
  switchLabel.appendChild(sliderUi);
  bottomControlBarHero.appendChild(switchLabel);
  containerHero3D.appendChild(bottomControlBarHero);

  switchInput.addEventListener("change", () => {
    currentModelIndexHero = switchInput.checked ? 0 : 1;
    loadModelHeroIndex(currentModelIndexHero);
  });

  function loadModelHeroIndex(index) {
    currentModelIndexHero = index;
    switchInput.checked = (index === 0);

    if (currentLoadedModelHero) {
      groupHero.remove(currentLoadedModelHero);
      currentLoadedModelHero = null;
    }
    if (mixerHero) {
      mixerHero.stopAllAction();
      mixerHero = null;
    }

    targetBoneHero = null;
    const modelData = modelsListHero[index];

    if (!loaderHero) {
      loaderHero = document.createElement("div");
      loaderHero.style.cssText = `
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: hsla(240, 17%, 2%, 0.7);
        color: hsla(0, 0%, 100%, 1);
        font-weight: 600;
        z-index: 5;
        transition: opacity 0.4s ease;
      `;
      containerHero3D.appendChild(loaderHero);
    }
    loaderHero.style.opacity = "1";
    loaderHero.style.display = "flex";
    loaderHero.textContent = `Loading interactive model... 0%`;

    loaderInstanceHero.load(
      modelData.path,
      (gltf) => {
        gltfCacheHero = gltf;
        const model = gltf.scene;
        model.scale.set(1, 1, 1);
        model.rotation.y = -10;

        const pivotWrapper = new THREE.Group();
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        pivotWrapper.add(model);
        pivotWrapper.position.set(0, 0.05, 0);
        groupHero.add(pivotWrapper);
        currentLoadedModelHero = pivotWrapper;

        targetBoneHero = model.getObjectByName('mannequin_head');

        const introAnimNames = ['mannequin_rotation_360° (interactive_III)']; 
        const modelScene = currentLoadedModelHero.children[0];
        
        if (modelScene) {
          mixerHero = new THREE.AnimationMixer(modelScene);
          let introValidCount = 0;
          let introCompletedCount = 0;

          introAnimNames.forEach(name => {
            const clip = THREE.AnimationClip.findByName(gltfCacheHero.animations, name);
            if (clip) introValidCount++;
          });

          if (introValidCount > 0) {
            const introFinishedListener = (event) => {
              if (introAnimNames.some(name => {
                const c = THREE.AnimationClip.findByName(gltfCacheHero.animations, name);
                return c && event.action.getClip() === c;
              })) {
                introCompletedCount++;
                if (introCompletedCount >= introValidCount) {
                  mixerHero.removeEventListener('finished', introFinishedListener);
                  playDefaultAnimationsForCurrentModel();
                }
              }
            };

            mixerHero.addEventListener('finished', introFinishedListener);

            introAnimNames.forEach(name => {
              const clip = THREE.AnimationClip.findByName(gltfCacheHero.animations, name);
              if (clip) {
                const action = mixerHero.clipAction(clip);
                action.setLoop(THREE.LoopOnce, 1);
                action.clampWhenFinished = true;
                action.reset();
                action.play();
              }
            });
          } else {
            playDefaultAnimationsForCurrentModel();
          }
        }

        if (loaderHero) {
          loaderHero.style.opacity = "0";
          setTimeout(() => {
            if (loaderHero) {
              loaderHero.remove();
              loaderHero = null;
            }
          }, 400);
        }
      },
      (xhr) => {
        if (xhr.total && loaderHero) {
          const percent = (xhr.loaded / xhr.total) * 100;
          loaderHero.textContent = `Loading interactive model... ${Math.round(percent)}%`;
        }
      },
      (error) => {
        console.error("Error al cargar el modelo 3D de Hydra:", error);
        if (loaderHero) loaderHero.textContent = "Error loading model file.";
      }
    );
  }

  loadModelHeroIndex(currentModelIndexHero);

  containerHero3D.addEventListener("dblclick", (e) => {
    if (e.target.closest('button') || e.target.closest('.model-switch')) return;
    if (!gltfCacheHero || !currentLoadedModelHero) return;

    const modelScene = currentLoadedModelHero.children[0];
    if (!modelScene) return;

    if (mixerHero) {
      mixerHero.stopAllAction();
    } else {
      mixerHero = new THREE.AnimationMixer(modelScene);
    }

    const targetAnimNames = ['mannequin_showcase_pose_I (interactive_I)', 'mannequin_rotation_360° (interactive_II)'];
    let completedCount = 0;
    let validClipsCount = 0;

    targetAnimNames.forEach(animName => {
      const clip = THREE.AnimationClip.findByName(gltfCacheHero.animations, animName);
      if (clip) validClipsCount++;
    });

    if (validClipsCount === 0) {
      playDefaultAnimationsForCurrentModel();
      return;
    }

    const finishedListener = (event) => {
      if (targetAnimNames.some(name => {
        const c = THREE.AnimationClip.findByName(gltfCacheHero.animations, name);
        return c && event.action.getClip() === c;
      })) {
        completedCount++;
        if (completedCount >= validClipsCount) {
          mixerHero.removeEventListener('finished', finishedListener);
          playDefaultAnimationsForCurrentModel();
        }
      }
    };

    mixerHero.addEventListener('finished', finishedListener);

    targetAnimNames.forEach(animName => {
      const clip = THREE.AnimationClip.findByName(gltfCacheHero.animations, animName); 
      if (clip) {
        const action = mixerHero.clipAction(clip);
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
        action.reset();
        action.play();
      }
    });
  });

  let isDraggingHero = false;
  let prevMousePosHero = { x: 0, y: 0 };
  let isReturningHero = false;

  containerHero3D.addEventListener("mousedown", (e) => {
    if (e.target.closest('button') || e.target.closest('.model-switch')) return;
    isDraggingHero = true;
    isReturningHero = false;
    prevMousePosHero = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDraggingHero) return;
    const deltaX = e.clientX - prevMousePosHero.x;
    const deltaY = e.clientY - prevMousePosHero.y;

    groupHero.rotation.y += deltaX * 0.008;
    groupHero.rotation.x += deltaY * 0.008;

    prevMousePosHero = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener("mouseup", () => {
    if (isDraggingHero) {
      isDraggingHero = false;
      isReturningHero = true;
    }
  });

  containerHero3D.addEventListener("touchstart", (e) => {
    if (e.target.closest('button') || e.target.closest('.model-switch')) return;
    if (e.touches.length === 1) {
      isDraggingHero = true;
      isReturningHero = false;
      prevMousePosHero = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  });

  window.addEventListener("touchmove", (e) => {
    if (!isDraggingHero || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - prevMousePosHero.x;
    const deltaY = e.touches[0].clientY - prevMousePosHero.y;

    groupHero.rotation.y += deltaX * 0.008;
    groupHero.rotation.x += deltaY * 0.008;

    prevMousePosHero = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });

  window.addEventListener("touchend", () => {
    if (isDraggingHero) {
      isDraggingHero = false;
      isReturningHero = true;
    }
  });

  containerHero3D.addEventListener("wheel", (e) => {
    e.preventDefault();
    isReturningZoomHero = false;

    if (zoomTimeoutHero) clearTimeout(zoomTimeoutHero);

    cameraHero.position.z += e.deltaY * 0.003;
    cameraHero.position.z = Math.max(2.5, Math.min(9, cameraHero.position.z));

    zoomTimeoutHero = setTimeout(() => {
      isReturningZoomHero = true;
    }, 400);
  }, { passive: false });

  function animateHero() {
    requestAnimationFrame(animateHero);
    const delta = clockHero.getDelta();
    if (mixerHero) mixerHero.update(delta);

    if (targetBoneHero && allowMouseTracking) {
      const targetRotY = mouseHeroCoords.x * 0.6;
      const targetRotX = mouseHeroCoords.y * 0.6;

      targetBoneHero.rotation.y += (targetRotY - targetBoneHero.rotation.y) * 0.1;
      targetBoneHero.rotation.x += (targetRotX - targetBoneHero.rotation.x) * 0.1;

      const minYRotation = -0.25;
      const maxYRotation = 0.75;
      const minXRotation = -0.5;
      const maxXRotation = 0.25;

      targetBoneHero.rotation.y = Math.max(minYRotation, Math.min(maxYRotation, targetBoneHero.rotation.y));
      targetBoneHero.rotation.x = Math.max(minXRotation, Math.min(maxXRotation, targetBoneHero.rotation.x));
    }

    if (isReturningZoomHero) {
      cameraHero.position.z += (defaultCameraZ - cameraHero.position.z) * 0.05;

      if (Math.abs(cameraHero.position.z - defaultCameraZ) < 0.001) {
        cameraHero.position.z = defaultCameraZ;
        isReturningZoomHero = false;
      }
    }

    if (isReturningHero) {
      groupHero.rotation.x += (0 - groupHero.rotation.x) * 0.05;
      groupHero.rotation.y += (0 - groupHero.rotation.y) * 0.05;

      if (Math.abs(groupHero.rotation.x) < 0.001 && Math.abs(groupHero.rotation.y) < 0.001) {
        groupHero.rotation.x = 0;
        groupHero.rotation.y = 0;
        isReturningHero = false;
      }
    }

    rendererHero.render(sceneHero, cameraHero);
  }
  animateHero();

  window.addEventListener("resize", () => {
    const width = containerHero3D.clientWidth;
    const height = containerHero3D.clientHeight;
    cameraHero.aspect = width / height;
    cameraHero.updateProjectionMatrix();
    rendererHero.setSize(width, height);
  });
});
/// ==========================================================
/// MAIN PAGE
/// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const hydraMainPageRightCustom = document.querySelector(".hydra-main-page-right-custom");
  if (!hydraMainPageRightCustom) return;

  if (document.getElementById("canvas-3d-container-hydra_mannequin_main_page")) return;

  const containerHero3D = document.createElement("div");
  containerHero3D.id = "canvas-3d-container-hydra_mannequin_main_page";
  containerHero3D.className = "showcase-viewer-container interactive-model-box tilt-card floating-viewer hero-3d-box";

  hydraMainPageRightCustom.prepend(containerHero3D);

  let loaderHero = null;
  const modelsListHero = [
    {
      path: 'hydra_material/models/vulak_main/vulak_light_render.glb',
      name: 'Vulak',
      animations: ['standard_mannequin']
    },
    {
      path: 'hydra_material/models/vulak_main/vulak_dark_render.glb',
      name: 'Vulak',
      animations: ['standard_mannequin']
    }
  ];

  let currentModelIndexHero = 1;
  let gltfCacheHero = null;

  let allowMouseTracking = false;
  setTimeout(() => {
    allowMouseTracking = true;
  }, 1500);

  const sceneHero = new THREE.Scene();
  const cameraHero = new THREE.PerspectiveCamera(
    45,
    containerHero3D.clientWidth / containerHero3D.clientHeight,
    0.1,
    1000
  );
  
  const defaultCameraZ = 2.825;
  cameraHero.position.set(0, -0.075, defaultCameraZ);
  cameraHero.rotation.x = 0.05;

  let isReturningZoomHero = false;
  let zoomTimeoutHero = null;

  const rendererHero = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  rendererHero.setSize(containerHero3D.clientWidth, containerHero3D.clientHeight);
  rendererHero.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  rendererHero.toneMapping = THREE.ReinhardToneMapping;
  rendererHero.toneMappingExposure = 1.5;
  containerHero3D.appendChild(rendererHero.domElement);

  const ambientLightHero = new THREE.AmbientLight(0xffffff, 0.5);
  sceneHero.add(ambientLightHero);

  const dirLight1Hero = new THREE.DirectionalLight(0xffffff, 3);
  dirLight1Hero.position.set(-1, 10, 7);
  sceneHero.add(dirLight1Hero);

  const dirLight2Hero = new THREE.DirectionalLight(0xffffff, 1);
  dirLight2Hero.position.set(-5, -5, -5);
  sceneHero.add(dirLight2Hero);

  const groupHero = new THREE.Group();
  sceneHero.add(groupHero);

  let mixerHero = null;
  const clockHero = new THREE.Clock();
  const loaderInstanceHero = new THREE.GLTFLoader();
  let currentLoadedModelHero = null;

  let targetBoneHero = null;
  const mouseHeroCoords = { x: 0, y: 0 };

  window.addEventListener("mousemove", (e) => {
    mouseHeroCoords.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseHeroCoords.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  function playDefaultAnimationsForCurrentModel() {
    if (!currentLoadedModelHero || !gltfCacheHero) return;
    const modelScene = currentLoadedModelHero.children[0];
    if (!modelScene) return;

    if (mixerHero) {
      mixerHero.stopAllAction();
    } else {
      mixerHero = new THREE.AnimationMixer(modelScene);
    }

    const modelData = modelsListHero[currentModelIndexHero];
    if (gltfCacheHero.animations && gltfCacheHero.animations.length > 0) {
      modelData.animations.forEach(nombre => {
        const clip = THREE.AnimationClip.findByName(gltfCacheHero.animations, nombre);
        if (clip) {
          const action = mixerHero.clipAction(clip);
          action.reset();
          action.play();
        }
      });
    }
  }

  const bottomControlBarHero = document.createElement("div");
  bottomControlBarHero.className = "model-switch-container";

  const switchLabel = document.createElement("label");
  switchLabel.className = "model-switch";

  const switchInput = document.createElement("input");
  switchInput.type = "checkbox";
  
  const sliderUi = document.createElement("span");
  sliderUi.className = "model-slider-ui";

  switchLabel.appendChild(switchInput);
  switchLabel.appendChild(sliderUi);
  bottomControlBarHero.appendChild(switchLabel);
  containerHero3D.appendChild(bottomControlBarHero);

  switchInput.addEventListener("change", () => {
    currentModelIndexHero = switchInput.checked ? 0 : 1;
    loadModelHeroIndex(currentModelIndexHero);
  });

  function loadModelHeroIndex(index) {
    currentModelIndexHero = index;
    switchInput.checked = (index === 0);

    if (currentLoadedModelHero) {
      groupHero.remove(currentLoadedModelHero);
      currentLoadedModelHero = null;
    }
    if (mixerHero) {
      mixerHero.stopAllAction();
      mixerHero = null;
    }

    targetBoneHero = null;
    const modelData = modelsListHero[index];

    if (!loaderHero) {
      loaderHero = document.createElement("div");
      loaderHero.style.cssText = `
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: hsla(240, 17%, 2%, 0.7);
        color: hsla(0, 0%, 100%, 1);
        font-weight: 600;
        z-index: 5;
        transition: opacity 0.4s ease;
      `;
      containerHero3D.appendChild(loaderHero);
    }
    loaderHero.style.opacity = "1";
    loaderHero.style.display = "flex";
    loaderHero.textContent = `Loading interactive model... 0%`;

    loaderInstanceHero.load(
      modelData.path,
      (gltf) => {
        gltfCacheHero = gltf;
        const model = gltf.scene;
        model.scale.set(1, 1, 1);
        model.rotation.y = -10;

        const pivotWrapper = new THREE.Group();
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        pivotWrapper.add(model);
        pivotWrapper.position.set(0, 0.05, 0);
        groupHero.add(pivotWrapper);
        currentLoadedModelHero = pivotWrapper;

        targetBoneHero = model.getObjectByName('mannequin_head');

        const introAnimNames = ['mannequin_rotation_360° (interactive_III)']; 
        const modelScene = currentLoadedModelHero.children[0];
        
        if (modelScene) {
          mixerHero = new THREE.AnimationMixer(modelScene);
          let introValidCount = 0;
          let introCompletedCount = 0;

          introAnimNames.forEach(name => {
            const clip = THREE.AnimationClip.findByName(gltfCacheHero.animations, name);
            if (clip) introValidCount++;
          });

          if (introValidCount > 0) {
            const introFinishedListener = (event) => {
              if (introAnimNames.some(name => {
                const c = THREE.AnimationClip.findByName(gltfCacheHero.animations, name);
                return c && event.action.getClip() === c;
              })) {
                introCompletedCount++;
                if (introCompletedCount >= introValidCount) {
                  mixerHero.removeEventListener('finished', introFinishedListener);
                  playDefaultAnimationsForCurrentModel();
                }
              }
            };

            mixerHero.addEventListener('finished', introFinishedListener);

            introAnimNames.forEach(name => {
              const clip = THREE.AnimationClip.findByName(gltfCacheHero.animations, name);
              if (clip) {
                const action = mixerHero.clipAction(clip);
                action.setLoop(THREE.LoopOnce, 1);
                action.clampWhenFinished = true;
                action.reset();
                action.play();
              }
            });
          } else {
            playDefaultAnimationsForCurrentModel();
          }
        }

        if (loaderHero) {
          loaderHero.style.opacity = "0";
          setTimeout(() => {
            if (loaderHero) {
              loaderHero.remove();
              loaderHero = null;
            }
          }, 400);
        }
      },
      (xhr) => {
        if (xhr.total && loaderHero) {
          const percent = (xhr.loaded / xhr.total) * 100;
          loaderHero.textContent = `Loading interactive model... ${Math.round(percent)}%`;
        }
      },
      (error) => {
        console.error("Error al cargar el modelo 3D de Hydra:", error);
        if (loaderHero) loaderHero.textContent = "Error loading model file.";
      }
    );
  }

  loadModelHeroIndex(currentModelIndexHero);

  containerHero3D.addEventListener("dblclick", (e) => {
    if (e.target.closest('button') || e.target.closest('.model-switch')) return;
    if (!gltfCacheHero || !currentLoadedModelHero) return;

    const modelScene = currentLoadedModelHero.children[0];
    if (!modelScene) return;

    if (mixerHero) {
      mixerHero.stopAllAction();
    } else {
      mixerHero = new THREE.AnimationMixer(modelScene);
    }

    const targetAnimNames = ['mannequin_showcase_pose_I (interactive_I)', 'mannequin_rotation_360° (interactive_II)'];
    let completedCount = 0;
    let validClipsCount = 0;

    targetAnimNames.forEach(animName => {
      const clip = THREE.AnimationClip.findByName(gltfCacheHero.animations, animName);
      if (clip) validClipsCount++;
    });

    if (validClipsCount === 0) {
      playDefaultAnimationsForCurrentModel();
      return;
    }

    const finishedListener = (event) => {
      if (targetAnimNames.some(name => {
        const c = THREE.AnimationClip.findByName(gltfCacheHero.animations, name);
        return c && event.action.getClip() === c;
      })) {
        completedCount++;
        if (completedCount >= validClipsCount) {
          mixerHero.removeEventListener('finished', finishedListener);
          playDefaultAnimationsForCurrentModel();
        }
      }
    };

    mixerHero.addEventListener('finished', finishedListener);

    targetAnimNames.forEach(animName => {
      const clip = THREE.AnimationClip.findByName(gltfCacheHero.animations, animName); 
      if (clip) {
        const action = mixerHero.clipAction(clip);
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
        action.reset();
        action.play();
      }
    });
  });

  let isDraggingHero = false;
  let prevMousePosHero = { x: 0, y: 0 };
  let isReturningHero = false;

  containerHero3D.addEventListener("mousedown", (e) => {
    if (e.target.closest('button') || e.target.closest('.model-switch')) return;
    isDraggingHero = true;
    isReturningHero = false;
    prevMousePosHero = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDraggingHero) return;
    const deltaX = e.clientX - prevMousePosHero.x;
    const deltaY = e.clientY - prevMousePosHero.y;

    groupHero.rotation.y += deltaX * 0.008;
    groupHero.rotation.x += deltaY * 0.008;

    prevMousePosHero = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener("mouseup", () => {
    if (isDraggingHero) {
      isDraggingHero = false;
      isReturningHero = true;
    }
  });

  containerHero3D.addEventListener("touchstart", (e) => {
    if (e.target.closest('button') || e.target.closest('.model-switch')) return;
    if (e.touches.length === 1) {
      isDraggingHero = true;
      isReturningHero = false;
      prevMousePosHero = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  });

  window.addEventListener("touchmove", (e) => {
    if (!isDraggingHero || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - prevMousePosHero.x;
    const deltaY = e.touches[0].clientY - prevMousePosHero.y;

    groupHero.rotation.y += deltaX * 0.008;
    groupHero.rotation.x += deltaY * 0.008;

    prevMousePosHero = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });

  window.addEventListener("touchend", () => {
    if (isDraggingHero) {
      isDraggingHero = false;
      isReturningHero = true;
    }
  });

  containerHero3D.addEventListener("wheel", (e) => {
    e.preventDefault();
    isReturningZoomHero = false;

    if (zoomTimeoutHero) clearTimeout(zoomTimeoutHero);

    cameraHero.position.z += e.deltaY * 0.003;
    cameraHero.position.z = Math.max(2.5, Math.min(9, cameraHero.position.z));

    zoomTimeoutHero = setTimeout(() => {
      isReturningZoomHero = true;
    }, 400);
  }, { passive: false });

  function animateHero() {
    requestAnimationFrame(animateHero);
    const delta = clockHero.getDelta();
    if (mixerHero) mixerHero.update(delta);

    if (targetBoneHero && allowMouseTracking) {
      const targetRotY = mouseHeroCoords.x * 0.6;
      const targetRotX = mouseHeroCoords.y * 0.6;

      targetBoneHero.rotation.y += (targetRotY - targetBoneHero.rotation.y) * 0.1;
      targetBoneHero.rotation.x += (targetRotX - targetBoneHero.rotation.x) * 0.1;

      const minYRotation = -0.25;
      const maxYRotation = 0.75;
      const minXRotation = -0.5;
      const maxXRotation = 0.25;

      targetBoneHero.rotation.y = Math.max(minYRotation, Math.min(maxYRotation, targetBoneHero.rotation.y));
      targetBoneHero.rotation.x = Math.max(minXRotation, Math.min(maxXRotation, targetBoneHero.rotation.x));
    }

    if (isReturningZoomHero) {
      cameraHero.position.z += (defaultCameraZ - cameraHero.position.z) * 0.05;

      if (Math.abs(cameraHero.position.z - defaultCameraZ) < 0.001) {
        cameraHero.position.z = defaultCameraZ;
        isReturningZoomHero = false;
      }
    }

    if (isReturningHero) {
      groupHero.rotation.x += (0 - groupHero.rotation.x) * 0.05;
      groupHero.rotation.y += (0 - groupHero.rotation.y) * 0.05;

      if (Math.abs(groupHero.rotation.x) < 0.001 && Math.abs(groupHero.rotation.y) < 0.001) {
        groupHero.rotation.x = 0;
        groupHero.rotation.y = 0;
        isReturningHero = false;
      }
    }

    rendererHero.render(sceneHero, cameraHero);
  }
  animateHero();

  window.addEventListener("resize", () => {
    const width = containerHero3D.clientWidth;
    const height = containerHero3D.clientHeight;
    cameraHero.aspect = width / height;
    cameraHero.updateProjectionMatrix();
    rendererHero.setSize(width, height);
  });
});

/// ==========================================================
/// ABOUT ME
/// ==========================================================



/// ==========================================================
/// TEAM
/// ==========================================================



/// ==========================================================
/// SKILLS
/// ==========================================================



/// ==========================================================
/// ABOUT ME
/// ==========================================================



/// ==========================================================
/// SHOWCASE
/// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const hydra_interactive_showcase_container = document.getElementById("hydra_interactive_showcase_canvas_container");
  let hydra_interactive_showcase_loader = document.getElementById("hydra_interactive_showcase_loader");

  if (!hydra_interactive_showcase_container) return;

  const hydra_interactive_showcase_models_list = [
    {
      path: 'hydra_material/models/featured/divine_marble_render.glb',
      name: 'Divine marble armor',
      animations: ['standard_mannequin', 'no_baseplate', 'hide_weapons', 'mannequin_showcase_pose_IV_(divine_marble_armor)', 'mannequin_levitation']
    },
    {
      path: 'hydra_material/models/featured/ender_keeper_render.glb',
      name: 'Ender keeper boss',
      animations: ['ender_keeper_scale', 'ender_keeper_360']
    },
    {
      path: 'hydra_material/models/featured/vulak_mage_render.glb',
      name: 'Wizard',
      animations: ['standard_mannequin', 'no_baseplate', 'mannequin_showcase_pose_II (Vulak mage)', 'mannequin_rotation_360°']
    }
  ];

  let hydra_interactive_showcase_current_model_index = 0;

  const hydra_interactive_showcase_scene = new THREE.Scene();
  
  const hydra_interactive_showcase_camera = new THREE.PerspectiveCamera(
    45,
    hydra_interactive_showcase_container.clientWidth / hydra_interactive_showcase_container.clientHeight,
    0.1,
    1000
  );
  
  const hydra_interactive_showcase_default_camera_z = 4.5; 
  hydra_interactive_showcase_camera.position.set(0, 1.825, hydra_interactive_showcase_default_camera_z);

  let hydra_interactive_showcase_is_returning_zoom = false;
  let hydra_interactive_showcase_zoom_timeout = null;

  const hydra_interactive_showcase_renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  hydra_interactive_showcase_renderer.setSize(hydra_interactive_showcase_container.clientWidth, hydra_interactive_showcase_container.clientHeight);
  hydra_interactive_showcase_renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  hydra_interactive_showcase_renderer.toneMapping = THREE.ReinhardToneMapping;
  hydra_interactive_showcase_renderer.toneMappingExposure = 1.25;
  hydra_interactive_showcase_container.appendChild(hydra_interactive_showcase_renderer.domElement);

  const hydra_interactive_showcase_ambient_light = new THREE.AmbientLight(0xffffff, 0.5); 
  hydra_interactive_showcase_scene.add(hydra_interactive_showcase_ambient_light);

  const hydra_interactive_showcase_dir_light1 = new THREE.DirectionalLight(0xffffff, 3);
  hydra_interactive_showcase_dir_light1.position.set(-1, 10, 7);
  hydra_interactive_showcase_scene.add(hydra_interactive_showcase_dir_light1);

  const hydra_interactive_showcase_dir_light2 = new THREE.DirectionalLight(0xffffff, 1); 
  hydra_interactive_showcase_dir_light2.position.set(-5, -5, -5);
  hydra_interactive_showcase_scene.add(hydra_interactive_showcase_dir_light2);

  const hydra_interactive_showcase_group = new THREE.Group();
  hydra_interactive_showcase_scene.add(hydra_interactive_showcase_group);

  let hydra_interactive_showcase_mixer = null;
  const hydra_interactive_showcase_clock = new THREE.Clock();
  const hydra_interactive_showcase_loader_instance = new THREE.GLTFLoader();

  let hydra_interactive_showcase_current_loaded_model = null;

  if (getComputedStyle(hydra_interactive_showcase_container).position === "static") {
    hydra_interactive_showcase_container.style.position = "relative";
  }

  const arrowStyle = `
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: hsla(254, 35%, 7%, 0.85);
    border: 1px solid hsla(241, 91%, 65%, 0.4);
    color: hsla(0, 0%, 100%, 1);
    font-size: 2.3rem;
    width: 75px;
    height: 75px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    backdrop-filter: blur(6px);
    box-shadow: 0 10px 25px hsla(0, 0%, 0%, 0.6);
    transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
  `;

  const hydra_interactive_showcase_prev_btn = document.createElement("button");
  hydra_interactive_showcase_prev_btn.innerHTML = "&#10094;";
  hydra_interactive_showcase_prev_btn.style.cssText = arrowStyle + "left: 15px;";

  const hydra_interactive_showcase_next_btn = document.createElement("button");
  hydra_interactive_showcase_next_btn.innerHTML = "&#10095;";
  hydra_interactive_showcase_next_btn.style.cssText = arrowStyle + "right: 15px;";

  const hydra_interactive_showcase_label = document.createElement("div");
  hydra_interactive_showcase_label.style.cssText = `
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: hsla(254, 35%, 7%, 0.85);
    border: 1px solid hsla(241, 91%, 65%, 0.3);
    color: hsla(0, 0%, 100%, 0.95);
    font-size: 0.9rem;
    font-weight: 600;
    padding: 8px 18px;
    border-radius: 20px;
    backdrop-filter: blur(6px);
    z-index: 10;
    white-space: nowrap;
    box-shadow: 0 8px 20px hsla(0, 0%, 0%, 0.4);
  `;

  hydra_interactive_showcase_container.appendChild(hydra_interactive_showcase_prev_btn);
  hydra_interactive_showcase_container.appendChild(hydra_interactive_showcase_next_btn);
  hydra_interactive_showcase_container.appendChild(hydra_interactive_showcase_label);

  function loadModelByIndex(index) {
    if (hydra_interactive_showcase_current_loaded_model) {
      hydra_interactive_showcase_group.remove(hydra_interactive_showcase_current_loaded_model);
      hydra_interactive_showcase_current_loaded_model = null;
    }
    if (hydra_interactive_showcase_mixer) {
      hydra_interactive_showcase_mixer.stopAllAction();
      hydra_interactive_showcase_mixer = null;
    }

    const modelData = hydra_interactive_showcase_models_list[index];
    hydra_interactive_showcase_label.textContent = modelData.name;

    if (!hydra_interactive_showcase_loader) {
      hydra_interactive_showcase_loader = document.createElement("div");
      hydra_interactive_showcase_loader.id = "hydra_interactive_showcase_loader";
      hydra_interactive_showcase_loader.style.cssText = `
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: hsla(240, 17%, 2%, 0.7);
        color: hsla(0, 0%, 100%, 1);
        font-family: inherit;
        font-weight: 600;
        z-index: 5;
        transition: opacity 0.4s ease;
      `;
      hydra_interactive_showcase_container.appendChild(hydra_interactive_showcase_loader);
    }
    hydra_interactive_showcase_loader.style.opacity = "1";
    hydra_interactive_showcase_loader.style.display = "flex";
    hydra_interactive_showcase_loader.textContent = `Loading interactive model... 0%`;

    hydra_interactive_showcase_loader_instance.load(
      modelData.path,
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(1, 1, 1);
        model.rotation.y = Math.PI;
        model.position.set(0, 0, 0);
        hydra_interactive_showcase_group.add(model);
        hydra_interactive_showcase_current_loaded_model = model;

        if (gltf.animations && gltf.animations.length > 0) {
          hydra_interactive_showcase_mixer = new THREE.AnimationMixer(model);
          modelData.animations.forEach(animName => {
            const clip = THREE.AnimationClip.findByName(gltf.animations, animName);
            if (clip) {
              const action = hydra_interactive_showcase_mixer.clipAction(clip);
              action.play();
            }
          });
        }

        if (hydra_interactive_showcase_loader) {
          hydra_interactive_showcase_loader.style.opacity = "0";
          setTimeout(() => {
            if (hydra_interactive_showcase_loader) hydra_interactive_showcase_loader.remove();
            hydra_interactive_showcase_loader = null;
          }, 400);
        }
      },
      (xhr) => {
        if (xhr.total && hydra_interactive_showcase_loader) {
          const percent = (xhr.loaded / xhr.total) * 100;
          hydra_interactive_showcase_loader.textContent = `Loading interactive model... ${Math.round(percent)}%`;
        }
      },
      (error) => {
        console.error("Error al cargar el modelo 3D:", error);
        if (hydra_interactive_showcase_loader) hydra_interactive_showcase_loader.textContent = "Error loading model file.";
      }
    );
  }

  hydra_interactive_showcase_prev_btn.addEventListener("click", () => {
    hydra_interactive_showcase_current_model_index = (hydra_interactive_showcase_current_model_index - 1 + hydra_interactive_showcase_models_list.length) % hydra_interactive_showcase_models_list.length;
    loadModelByIndex(hydra_interactive_showcase_current_model_index);
  });

  hydra_interactive_showcase_next_btn.addEventListener("click", () => {
    hydra_interactive_showcase_current_model_index = (hydra_interactive_showcase_current_model_index + 1) % hydra_interactive_showcase_models_list.length;
    loadModelByIndex(hydra_interactive_showcase_current_model_index);
  });

  loadModelByIndex(hydra_interactive_showcase_current_model_index);

  let hydra_interactive_showcase_is_dragging = false;
  let hydra_interactive_showcase_is_returning = false; 
  let hydra_interactive_showcase_prev_mouse = { x: 0, y: 0 };

  hydra_interactive_showcase_container.addEventListener("mousedown", (e) => {
    if (e.target.closest('button')) return;
    hydra_interactive_showcase_is_dragging = true;
    hydra_interactive_showcase_is_returning = false; 
    hydra_interactive_showcase_prev_mouse = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener("mousemove", (e) => {
    if (!hydra_interactive_showcase_is_dragging) return;

    const deltaX = e.clientX - hydra_interactive_showcase_prev_mouse.x;
    const deltaY = e.clientY - hydra_interactive_showcase_prev_mouse.y;

    hydra_interactive_showcase_group.rotation.y += deltaX * 0.008;
    hydra_interactive_showcase_group.rotation.x += deltaY * 0.008;

    hydra_interactive_showcase_prev_mouse = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener("mouseup", () => {
    if (hydra_interactive_showcase_is_dragging) {
      hydra_interactive_showcase_is_dragging = false;
      hydra_interactive_showcase_is_returning = true; 
    }
  });

  hydra_interactive_showcase_container.addEventListener("touchstart", (e) => {
    if (e.target.closest('button')) return;
    if (e.touches.length === 1) {
      hydra_interactive_showcase_is_dragging = true;
      hydra_interactive_showcase_is_returning = false;
      hydra_interactive_showcase_prev_mouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  });

  window.addEventListener("touchmove", (e) => {
    if (!hydra_interactive_showcase_is_dragging || e.touches.length !== 1) return;

    const deltaX = e.touches[0].clientX - hydra_interactive_showcase_prev_mouse.x;
    const deltaY = e.touches[0].clientY - hydra_interactive_showcase_prev_mouse.y;

    hydra_interactive_showcase_group.rotation.y += deltaX * 0.008;
    hydra_interactive_showcase_group.rotation.x += deltaY * 0.008;

    hydra_interactive_showcase_prev_mouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });

  window.addEventListener("touchend", () => {
    if (hydra_interactive_showcase_is_dragging) {
      hydra_interactive_showcase_is_dragging = false;
      hydra_interactive_showcase_is_returning = true; 
    }
  });

  hydra_interactive_showcase_container.addEventListener("wheel", (e) => {
    e.preventDefault();
    hydra_interactive_showcase_is_returning_zoom = false;

    if (hydra_interactive_showcase_zoom_timeout) clearTimeout(hydra_interactive_showcase_zoom_timeout);

    hydra_interactive_showcase_camera.position.z += e.deltaY * 0.003;
    hydra_interactive_showcase_camera.position.z = Math.max(2.5, Math.min(9, hydra_interactive_showcase_camera.position.z));

    hydra_interactive_showcase_zoom_timeout = setTimeout(() => {
      hydra_interactive_showcase_is_returning_zoom = true;
    }, 600);
  }, { passive: false });

  function animate() {
    requestAnimationFrame(animate);

    const delta = hydra_interactive_showcase_clock.getDelta();

    if (hydra_interactive_showcase_mixer) {
      hydra_interactive_showcase_mixer.update(delta);
    }

    if (hydra_interactive_showcase_is_returning_zoom) {
      hydra_interactive_showcase_camera.position.z += (hydra_interactive_showcase_default_camera_z - hydra_interactive_showcase_camera.position.z) * 0.05;

      if (Math.abs(hydra_interactive_showcase_camera.position.z - hydra_interactive_showcase_default_camera_z) < 0.001) {
        hydra_interactive_showcase_camera.position.z = hydra_interactive_showcase_default_camera_z;
        hydra_interactive_showcase_is_returning_zoom = false;
      }
    }

    if (hydra_interactive_showcase_is_returning) {
      hydra_interactive_showcase_group.rotation.x += (0 - hydra_interactive_showcase_group.rotation.x) * 0.05;
      hydra_interactive_showcase_group.rotation.y += (0 - hydra_interactive_showcase_group.rotation.y) * 0.05;

      if (Math.abs(hydra_interactive_showcase_group.rotation.x) < 0.001 && Math.abs(hydra_interactive_showcase_group.rotation.y) < 0.001) {
        hydra_interactive_showcase_group.rotation.x = 0;
        hydra_interactive_showcase_group.rotation.y = 0;
        hydra_interactive_showcase_is_returning = false;
      }
    }

    hydra_interactive_showcase_renderer.render(hydra_interactive_showcase_scene, hydra_interactive_showcase_camera);
  }
  animate();

  window.addEventListener("resize", () => {
    const width = hydra_interactive_showcase_container.clientWidth;
    const height = hydra_interactive_showcase_container.clientHeight;
    hydra_interactive_showcase_camera.aspect = width / height;
    hydra_interactive_showcase_camera.updateProjectionMatrix();
    hydra_interactive_showcase_renderer.setSize(width, height);
  });
});

/// ==========================================================
/// ART GALLERY
/// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", (e) => {
    const categoryHeader = e.target.closest(".hydra_gallery_art_card-header, .category-toggle");
    if (categoryHeader) {
      const parentItem = categoryHeader.closest(".hydra_gallery_art_card-item") || categoryHeader.parentElement;
      if (parentItem) {
        const isActive = parentItem.classList.contains("active");
        
        document.querySelectorAll(".hydra_gallery_art_card-item").forEach(item => {
          item.classList.remove("active");
        });

        if (!isActive) {
          parentItem.classList.add("active");
        }
      }
    }
  });

  const modalOverlay = document.createElement("div");
  modalOverlay.id = "independent-image-modal";
  modalOverlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: hsla(200, 50%, 10%, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    backdrop-filter: blur(8px);
    padding: 1.5rem;
  `;

  const modalBox = document.createElement("div");
  modalBox.style.cssText = `
    position: relative;
    background: linear-gradient(180deg, hsla(240, 60%, 10%, 1), hsla(230, 65%, 13%, 1) 50%, hsla(220, 70%, 16%, 1));
    border: 4px solid hsla(200, 90%, 60%, 0.75);
    border-radius: 16px;
    padding: 1rem;
    box-shadow: 0 25px 50px -12px hsla(200, 100%, 10%, 0.25);
    width: 92vw;
    height: 92vh;
    max-width: none;
    max-height: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transform: scale(0.96);
    transition: transform 0.3s ease;
  `;

  const counterBadge = document.createElement("div");
  counterBadge.style.cssText = `
    position: absolute;
    top: 20px;
    left: 20px;
    background: hsla(235, 55%, 20%, 0.75);
    border: 3px solid hsla(200, 90%, 50%, 0.75);
    color: hsla(200, 3%, 100%, 1);
    font-size: 0.95rem;
    font-weight: 600;
    padding: 0.35rem 0.9rem;
    border-radius: 20px;
    z-index: 10;
  `;

  const imageWrapper = document.createElement("div");
  imageWrapper.style.cssText = `
    position: relative;
    width: 100%;
    height: calc(100% - 3.5rem);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  `;

  const modalImg = document.createElement("img");
  modalImg.style.cssText = `
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 8px;
    display: block;
  `;

  const modalVideo = document.createElement("video");
  modalVideo.style.cssText = `
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 8px;
    display: none;
  `;
  modalVideo.autoplay = true;
  modalVideo.muted = true;
  modalVideo.loop = true;
  modalVideo.playsInline = true;

  imageWrapper.appendChild(modalImg);
  imageWrapper.appendChild(modalVideo);

  const captionBar = document.createElement("div");
  captionBar.style.cssText = `
    height: 2rem;
    color: hsla(0, 0%, 100%, 0.9);
    font-size: 1rem;
    font-weight: 600;
    text-align: center;
    width: 100%;
    margin-top: 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `;

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "&times;";
  closeBtn.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    background: hsla(235, 55%, 20%, 0.75);
    border: 3px solid hsla(200, 90%, 50%, 0.75);
    color: hsla(200, 3%, 100%, 1);
    font-size: 1.6rem;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  `;

  const createArrowBtn = (direction) => {
    const btn = document.createElement("button");
    btn.innerHTML = direction === "prev" ? "&#10094;" : "&#10095;";
    btn.style.cssText = `
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      ${direction === "prev" ? "left: -25px;" : "right: -25px;"}
      background: hsla(235, 55%, 20%, 0.75);
      border: 3px solid hsla(200, 90%, 50%, 0.75);
      color: hsla(200, 3%, 100%, 1);
      font-size: 1.6rem;
      width: 55px;
      height: 55px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 20;
      box-shadow: 0 10px 25px hsla(214, 69%, 51%, 0.60);
    `;
    return btn;
  };

  const prevBtn = createArrowBtn("prev");
  const nextBtn = createArrowBtn("next");

  modalBox.appendChild(counterBadge);
  modalBox.appendChild(imageWrapper);
  modalBox.appendChild(captionBar);
  modalBox.appendChild(closeBtn);
  modalBox.appendChild(prevBtn);
  modalBox.appendChild(nextBtn);
  modalOverlay.appendChild(modalBox);
  document.body.appendChild(modalOverlay);

  let currentGroupThumbs = [];
  let currentIndex = 0;
  let isTransitioning = false;
  const cooldownTime = 625;

  const updateModalContent = () => {
    const activeThumb = currentGroupThumbs[currentIndex];
    if (activeThumb) {
      const videoSrc = activeThumb.getAttribute("data-video");
      const activeEl = videoSrc ? modalVideo : modalImg;
      const inactiveEl = videoSrc ? modalImg : modalVideo;

      activeEl.style.opacity = "0";
      activeEl.style.transform = "scale(0.97)";

      setTimeout(() => {
        inactiveEl.style.display = "none";
        activeEl.style.display = "block";

        if (videoSrc) {
          if (modalVideo.src !== videoSrc) {
            modalVideo.src = videoSrc;
          }
          modalVideo.play().catch(error => {
            if (error.name !== "AbortError") {
              console.error("Error al reproducir el video:", error);
            }
          });
        } else {
          modalVideo.pause();
          modalVideo.src = "";
          const fullSrc = activeThumb.getAttribute("data-full") || activeThumb.src;
          if (modalImg.src !== fullSrc) {
            modalImg.src = fullSrc;
          }
        }

        requestAnimationFrame(() => {
          activeEl.style.transition = "opacity 0.25s ease, transform 0.25s ease";
          activeEl.style.opacity = "1";
          activeEl.style.transform = "scale(1)";
        });
      }, 150);

      counterBadge.textContent = `${currentIndex + 1}/${currentGroupThumbs.length}`;
      
      let title = activeThumb.alt || activeThumb.getAttribute("data-title") || "";
      if (!title) {
        const sourceToCheck = videoSrc || activeThumb.src;
        const parts = sourceToCheck.split("/");
        title = parts[parts.length - 1].split(".")[0];
      }
      captionBar.textContent = title;
    }
  };

  const navigateGallery = (direction) => {
    if (isTransitioning || currentGroupThumbs.length === 0) return;
    isTransitioning = true;

    if (direction === "next") {
      currentIndex = (currentIndex + 1) % currentGroupThumbs.length;
    } else {
      currentIndex = (currentIndex - 1 + currentGroupThumbs.length) % currentGroupThumbs.length;
    }
    updateModalContent();

    setTimeout(() => {
      isTransitioning = false;
    }, cooldownTime);
  };

  const openModal = (clickedThumb) => {
    const categoryContainer = clickedThumb.closest(".hydra_gallery_art_card-item") || clickedThumb.closest("section") || document;
    currentGroupThumbs = Array.from(categoryContainer.querySelectorAll(".hydra_gallery_art_card-thumb"));
    
    if (currentGroupThumbs.length === 0) {
      currentGroupThumbs = Array.from(document.querySelectorAll(".hydra_gallery_art_card-thumb"));
    }

    currentIndex = currentGroupThumbs.indexOf(clickedThumb);
    if (currentIndex === -1) currentIndex = 0;

    isTransitioning = false; 
    updateModalContent();

    modalOverlay.style.opacity = "1";
    modalOverlay.style.pointerEvents = "auto";
    modalBox.style.transform = "scale(1)";
  };

  const closeModal = () => {
    modalOverlay.style.opacity = "0";
    modalOverlay.style.pointerEvents = "none";
    modalBox.style.transform = "scale(0.96)";

    modalVideo.pause();
    modalVideo.src = "";
    isTransitioning = false;
  };

  document.addEventListener("click", (e) => {
    const thumb = e.target.closest(".hydra_gallery_art_card-thumb");
    if (thumb) {
      e.preventDefault();
      openModal(thumb);
    }
  });

  closeBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navigateGallery("prev");
  });

  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navigateGallery("next");
  });

  document.addEventListener("keydown", (e) => {
    if (modalOverlay.style.pointerEvents === "auto") {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") navigateGallery("prev");
      if (e.key === "ArrowRight") navigateGallery("next");
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const hydra_gallery_art_container = document.getElementById("hydra_gallery_art_canvas-3d-container");
  let hydra_gallery_art_loader = document.getElementById("hydra_gallery_art_model-loader");

  if (!hydra_gallery_art_container) return;

  const hydra_gallery_art_models_list = [
    {
      path: 'hydra_material/models/vulak_anvil/vulak_anvil_dark_render.glb',
      name: 'Vulak Anvil Asset',
      animations: ['standard_mannequin', 'no_baseplate', 'anvil_animation']
    },
    {
      path: 'hydra_material/models/vulak_anvil/vulak_anvil_light_render.glb',
      name: 'Divine Marble Variant',
      animations: ['standard_mannequin', 'no_baseplate', 'anvil_animation']
    }
  ];

  let hydra_gallery_art_current_model_index = 0;

  const hydra_gallery_art_scene = new THREE.Scene();
  
  const hydra_gallery_art_camera = new THREE.PerspectiveCamera(
    45,
    hydra_gallery_art_container.clientWidth / hydra_gallery_art_container.clientHeight,
    0.1,
    1000
  );
  
  const hydra_gallery_art_default_camera_z = 3.25; 
  hydra_gallery_art_camera.position.set(0.2, 0.9, hydra_gallery_art_default_camera_z);
  hydra_gallery_art_camera.rotation.x = -0.375; 

  // Listener de audio de Three.js vinculado a la cámara
  const hydra_audio_listener = new THREE.AudioListener();
  hydra_gallery_art_camera.add(hydra_audio_listener);

  // Instancia del sonido sincronizable en la timeline de la escena 3D
  const sceneAudio = new THREE.Audio(hydra_audio_listener);
  const audioLoader = new THREE.AudioLoader();
  
  audioLoader.load('hydra_material/sounds/hammer_v2.mp3', function(buffer) {
    sceneAudio.setBuffer(buffer);
    sceneAudio.setLoop(true);
    sceneAudio.setVolume(0); // Inicia silenciado hasta hacer hover
  });

  let isReturningZoom2 = false;
  let zoomTimeout2 = null;

  const hydra_gallery_art_renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  hydra_gallery_art_renderer.setSize(hydra_gallery_art_container.clientWidth, hydra_gallery_art_container.clientHeight);
  hydra_gallery_art_renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  hydra_gallery_art_renderer.toneMapping = THREE.ReinhardToneMapping;
  hydra_gallery_art_renderer.toneMappingExposure = 1.5; 
  hydra_gallery_art_container.appendChild(hydra_gallery_art_renderer.domElement);

  const hydra_gallery_art_ambient_light = new THREE.AmbientLight(0xffffff, 0.5); 
  hydra_gallery_art_scene.add(hydra_gallery_art_ambient_light);

  const hydra_gallery_art_dir_light1 = new THREE.DirectionalLight(0xffffff, 3);
  hydra_gallery_art_dir_light1.position.set(-1, 10, 7);
  hydra_gallery_art_scene.add(hydra_gallery_art_dir_light1);

  const hydra_gallery_art_dirt_light = new THREE.DirectionalLight(0xffffff, 1); 
  hydra_gallery_art_dirt_light.position.set(-5, -5, -5);
  hydra_gallery_art_scene.add(hydra_gallery_art_dirt_light);

  const hydra_gallery_art_group = new THREE.Group();
  hydra_gallery_art_scene.add(hydra_gallery_art_group);

  let mixer2 = null;
  const hydra_gallery_art_clock = new THREE.Clock();
  const hydra_gallery_art_loader_instance = new THREE.GLTFLoader();

  let hydra_gallery_art_current_loaded_model = null;

  if (getComputedStyle(hydra_gallery_art_container).position === "static") {
    hydra_gallery_art_container.style.position = "relative";
  }

  // Control de volumen por hover en el contenedor
  hydra_gallery_art_container.addEventListener("mouseenter", () => {
    sceneAudio.setVolume(0.5);
    if (!sceneAudio.isPlaying && sceneAudio.buffer) {
      sceneAudio.play();
    }
  });

  hydra_gallery_art_container.addEventListener("mouseleave", () => {
    sceneAudio.setVolume(0);
  });

  const cornerArrowStyle = `
    position: absolute;
    bottom: 15px;
    background: hsla(255, 33%, 7%, 0.85);
    border: 1px solid hsla(241, 91%, 65%, 0.35);
    color: hsla(0, 0%, 100%, 1);
    font-size: 0.85rem;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(6px);
    box-shadow: 0 4px 10px hsla(0, 0%, 0%, 0.4);
    z-index: 10;
    transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
  `;

  const hydra_gallery_art_prev_model_btn = document.createElement("button");
  hydra_gallery_art_prev_model_btn.innerHTML = "&#10094;";
  hydra_gallery_art_prev_model_btn.style.cssText = cornerArrowStyle + " left: 15px;";

  const hydra_gallery_art_next_model_btn = document.createElement("button");
  hydra_gallery_art_next_model_btn.innerHTML = "&#10095;";
  hydra_gallery_art_next_model_btn.style.cssText = cornerArrowStyle + " right: 15px;";

  hydra_gallery_art_container.appendChild(hydra_gallery_art_prev_model_btn);
  hydra_gallery_art_container.appendChild(hydra_gallery_art_next_model_btn);

  function loadModelByIndex2(index) {
    if (hydra_gallery_art_current_loaded_model) {
      hydra_gallery_art_group.remove(hydra_gallery_art_current_loaded_model);
      hydra_gallery_art_current_loaded_model = null;
    }
    if (mixer2) {
      mixer2.stopAllAction();
      mixer2 = null;
    }

    if (sceneAudio.isPlaying) {
      sceneAudio.stop();
    }

    const hydra_gallery_art_model_data = hydra_gallery_art_models_list[index];

    if (!hydra_gallery_art_loader) {
      hydra_gallery_art_loader = document.createElement("div");
      hydra_gallery_art_loader.id = "hydra_gallery_art_model-loader";
      hydra_gallery_art_loader.style.cssText = `
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: hsla(240, 17%, 2%, 0.7);
        color: hsla(0, 0%, 100%, 1);
        font-family: inherit;
        font-weight: 600;
        z-index: 5;
        transition: opacity 0.4s ease;
      `;
      hydra_gallery_art_container.appendChild(hydra_gallery_art_loader);
    }
    hydra_gallery_art_loader.style.opacity = "1";
    hydra_gallery_art_loader.style.display = "flex";
    hydra_gallery_art_loader.textContent = `Loading interactive model... 0%`;

    hydra_gallery_art_loader_instance.load(
      hydra_gallery_art_model_data.path,
      (gltf) => {
        const hydra_gallery_art_model = gltf.scene;

        hydra_gallery_art_model.scale.set(1, 1, 1);
        hydra_gallery_art_model.rotation.y = Math.PI;

        const pivotWrapper = new THREE.Group();
        const box = new THREE.Box3().setFromObject(hydra_gallery_art_model);
        const center = box.getCenter(new THREE.Vector3());
        hydra_gallery_art_model.position.sub(center); 

        pivotWrapper.add(hydra_gallery_art_model);
        pivotWrapper.position.set(0.125, -0.275, 0.32);
        hydra_gallery_art_group.add(pivotWrapper);
        hydra_gallery_art_current_loaded_model = pivotWrapper;

        if (gltf.animations && gltf.animations.length > 0) {
          mixer2 = new THREE.AnimationMixer(hydra_gallery_art_model);
          hydra_gallery_art_model_data.animations.forEach(nombre => {
            const clip = THREE.AnimationClip.findByName(gltf.animations, nombre);
            if (clip) {
              const action = mixer2.clipAction(clip);
              action.play();
            }
          });
        }

        // Sincronizar el inicio del reproductor de audio interno al cargar el modelo
        if (sceneAudio.buffer) {
          sceneAudio.offset = 0;
          sceneAudio.play();
        }

        if (hydra_gallery_art_loader) {
          hydra_gallery_art_loader.style.opacity = "0";
          setTimeout(() => {
            if (hydra_gallery_art_loader) hydra_gallery_art_loader.remove();
            hydra_gallery_art_loader = null;
          }, 400);
        }
      },
      (xhr) => {
        if (xhr.total && hydra_gallery_art_loader) {
          const percent = (xhr.loaded / xhr.total) * 100;
          hydra_gallery_art_loader.textContent = `Loading interactive model... ${Math.round(percent)}%`;
        }
      },
      (error) => {
        console.error("Error al cargar el modelo 3D:", error);
        if (hydra_gallery_art_loader) hydra_gallery_art_loader.textContent = "Error loading model file.";
      }
    );
  }

  hydra_gallery_art_prev_model_btn.addEventListener("click", () => {
    hydra_gallery_art_current_model_index = (hydra_gallery_art_current_model_index - 1 + hydra_gallery_art_models_list.length) % hydra_gallery_art_models_list.length;
    loadModelByIndex2(hydra_gallery_art_current_model_index);
  });

  hydra_gallery_art_next_model_btn.addEventListener("click", () => {
    hydra_gallery_art_current_model_index = (hydra_gallery_art_current_model_index + 1) % hydra_gallery_art_models_list.length;
    loadModelByIndex2(hydra_gallery_art_current_model_index);
  });

  loadModelByIndex2(hydra_gallery_art_current_model_index);

  let isDragging2 = false;
  let prevMousePos2 = { x: 0, y: 0 };
  let isReturning2 = false; 

  hydra_gallery_art_container.addEventListener("mousedown", (e) => {
    if (e.target.closest('button')) return;
    isDragging2 = true;
    isReturning2 = false; 
    prevMousePos2 = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging2) return;
    const deltaX = e.clientX - prevMousePos2.x;
    const deltaY = e.clientY - prevMousePos2.y;
    
    hydra_gallery_art_group.rotation.y += deltaX * 0.008;
    hydra_gallery_art_group.rotation.x += deltaY * 0.008;
    
    prevMousePos2 = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener("mouseup", () => {
    if (isDragging2) {
      isDragging2 = false;
      isReturning2 = true; 
    }
  });

  hydra_gallery_art_container.addEventListener("touchstart", (e) => {
    if (e.target.closest('button')) return;
    if (e.touches.length === 1) {
      isDragging2 = true;
      isReturning2 = false;
      prevMousePos2 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  });

  window.addEventListener("touchmove", (e) => {
    if (!isDragging2 || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - prevMousePos2.x;
    const deltaY = e.touches[0].clientY - prevMousePos2.y;
    
    hydra_gallery_art_group.rotation.y += deltaX * 0.008;
    hydra_gallery_art_group.rotation.x += deltaY * 0.008;
    
    prevMousePos2 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });

  window.addEventListener("touchend", () => {
    if (isDragging2) {
      isDragging2 = false;
      isReturning2 = true; 
    }
  });

  hydra_gallery_art_container.addEventListener("wheel", (e) => {
    e.preventDefault();
    isReturningZoom2 = false;

    if (zoomTimeout2) clearTimeout(zoomTimeout2);

    hydra_gallery_art_camera.position.z += e.deltaY * 0.003;
    hydra_gallery_art_camera.position.z = Math.max(2.5, Math.min(9, hydra_gallery_art_camera.position.z));

    zoomTimeout2 = setTimeout(() => {
      isReturningZoom2 = true;
    }, 600);
  }, { passive: false });

  function animate2() {
    requestAnimationFrame(animate2);
    const delta = hydra_gallery_art_clock.getDelta();
    if (mixer2) mixer2.update(delta);

    if (isReturningZoom2) {
      hydra_gallery_art_camera.position.z += (hydra_gallery_art_default_camera_z - hydra_gallery_art_camera.position.z) * 0.05;

      if (Math.abs(hydra_gallery_art_camera.position.z - hydra_gallery_art_default_camera_z) < 0.001) {
        hydra_gallery_art_camera.position.z = hydra_gallery_art_default_camera_z;
        isReturningZoom2 = false;
      }
    }

    if (isReturning2) {
      hydra_gallery_art_group.rotation.x += (0 - hydra_gallery_art_group.rotation.x) * 0.05;
      hydra_gallery_art_group.rotation.y += (0 - hydra_gallery_art_group.rotation.y) * 0.05;

      if (Math.abs(hydra_gallery_art_group.rotation.x) < 0.001 && Math.abs(hydra_gallery_art_group.rotation.y) < 0.001) {
        hydra_gallery_art_group.rotation.x = 0;
        hydra_gallery_art_group.rotation.y = 0;
        isReturning2 = false;
      }
    }

    hydra_gallery_art_renderer.render(hydra_gallery_art_scene, hydra_gallery_art_camera);
  }
  animate2();

  function handleResize() {
    const width = hydra_gallery_art_container.clientWidth;
    const height = hydra_gallery_art_container.clientHeight;
    
    if (width > 0 && height > 0) {
      hydra_gallery_art_camera.aspect = width / height;
      hydra_gallery_art_camera.updateProjectionMatrix();
      hydra_gallery_art_renderer.setSize(width, height);
    }
  }

  window.addEventListener("resize", handleResize);

  const resizeObserver = new ResizeObserver(() => {
    handleResize();
  });
  resizeObserver.observe(hydra_gallery_art_container);
});

/// ==========================================================
/// TOOLS
/// ==========================================================


/// ==========================================================
/// PERSONAL ADDONS
/// ==========================================================



/// ==========================================================
/// PERSONAL PLUGINS
/// ==========================================================



/// ==========================================================
/// MARKETPLACE CONTRIBUTIONS
/// ==========================================================



/// ==========================================================
/// MCMODELS CONTRIBUTIONS
/// ==========================================================



/// ==========================================================
/// OTHER CONTRIBUTIONS
/// ==========================================================



/// ==========================================================
/// WORKFLOW
/// ==========================================================



/// ==========================================================
/// SOUND CONTROLLER
/// ==========================================================

// ==========================================
// CONFIGURACIÓN DE VOLUMEN NORMAL (0.0 a 1.0)
// ==========================================
// Configuración global de volumen
const AUDIO_NORMAL_VOLUME = 0.5; // Volumen de la música de fondo

// Control global exclusivo para la música de fondo
let hasUserInteracted = false;

document.addEventListener("DOMContentLoaded", function() {
  const audio = document.getElementById('backgroundAudio');
  const btn = document.getElementById('audioToggleBtn');
  
  if (audio && btn) {
    audio.volume = AUDIO_NORMAL_VOLUME;
    
    // Estado inicial visual: Encendido (ON) desde el inicio
    btn.setAttribute('data-muted', 'false');
    const waves = btn.querySelector('.audio-waves');
    const slash = btn.querySelector('.audio-slash');
    if (waves) waves.style.display = 'block';
    if (slash) slash.style.display = 'none';

    // Función que arranca la música de fondo ante la primera interacción del usuario
    const triggerAudioPlayback = () => {
      if (!hasUserInteracted) {
        hasUserInteracted = true;
        
        window.removeEventListener('click', triggerAudioPlayback);
        window.removeEventListener('wheel', triggerAudioPlayback);
        window.removeEventListener('keydown', triggerAudioPlayback);

        audio.muted = false;
        audio.volume = 0;
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            fadeInAudio(audio, AUDIO_NORMAL_VOLUME, 1000);
          }).catch(err => {
            console.log("Reproducción de música bloqueada por el navegador:", err);
            hasUserInteracted = false; 
          });
        }
      }
    };

    // Escuchadores globales solo para la música de fondo
    window.addEventListener('click', triggerAudioPlayback, { once: true });
    window.addEventListener('wheel', triggerAudioPlayback, { once: true });
    window.addEventListener('keydown', triggerAudioPlayback, { once: true });
  }
});

// Función para alternar manualmente con el botón de audio
function toggleAudioState() {
  hasUserInteracted = true; 
  const btn = document.getElementById('audioToggleBtn');
  const waves = btn.querySelector('.audio-waves');
  const slash = btn.querySelector('.audio-slash');
  const audio = document.getElementById('backgroundAudio');
  
  // Reproducir sonido al hacer clic en el botón de audio
  const clickSound = document.getElementById('1'); 
  if (clickSound) {
    clickSound.loop = false;          
    clickSound.pause();             
    clickSound.currentTime = 0;    
    clickSound.play().catch(error => {
      console.log("Reproducción de sonido de botón prevenida:", error);
    });
  }

  if (!audio || !btn) return;
  
  const isMuted = btn.getAttribute('data-muted') === 'true';
  btn.setAttribute('data-muted', !isMuted);

  if (!isMuted) {
    waves.style.display = 'none';
    slash.style.display = 'block';
    fadeOutAudio(audio, 1000);
  } else {
    waves.style.display = 'block';
    slash.style.display = 'none';
    
    audio.muted = false;
    audio.volume = 0;
    audio.play().then(() => {
      fadeInAudio(audio, AUDIO_NORMAL_VOLUME, 1000);
    }).catch(error => {
      console.log("Reproducción bloqueada:", error);
    });
  }
}

// Funciones auxiliares para el fundido gradual de la música
function fadeOutAudio(audioElement, duration) {
  const stepTime = 50;
  const steps = duration / stepTime;
  const volumeStep = audioElement.volume / steps;

  const fadeInterval = setInterval(() => {
    if (audioElement.volume > volumeStep) {
      audioElement.volume -= volumeStep;
    } else {
      audioElement.volume = 0;
      audioElement.pause();
      clearInterval(fadeInterval);
    }
  }, stepTime);
}

function fadeInAudio(audioElement, targetVolume, duration) {
  const stepTime = 50;
  const steps = duration / stepTime;
  const volumeStep = targetVolume / steps;

  const fadeInterval = setInterval(() => {
    if (audioElement.volume < targetVolume - volumeStep) {
      audioElement.volume += volumeStep;
    } else {
      audioElement.volume = targetVolume;
      clearInterval(fadeInterval);
    }
  }, stepTime);
}



// --- EFECTO HOVER EN TARJETAS (Independiente de la música) ---
document.addEventListener("DOMContentLoaded", () => {
  const hoverSound = document.getElementById("hoverSound");

  if (hoverSound) {
    hoverSound.volume = 0.125;
    let isCooldown = false;
    const cooldownTime = 525; // Cooldown en milisegundos

    const cards = document.querySelectorAll(
      ".hydra-main-page-card, .hydra_about_me_card, .hydra_skills_card, .hydra_card, .project-card, .hydra_gallery_art_card-item"
    );

    cards.forEach(card => {
      card.addEventListener("mouseenter", () => {
        if (isCooldown) return;

        isCooldown = true;
        hoverSound.currentTime = 0;
        hoverSound.play().catch(error => {
          // Si el navegador bloquea el audio de hover antes de cualquier interacción del usuario, lo ignoramos silenciosamente
        });

        setTimeout(() => {
          isCooldown = false;
        }, cooldownTime);
      });
    });
  }
});

// --- EFECTO DE CLIC EN CATEGORÍAS (Independiente de la música) ---
document.addEventListener("DOMContentLoaded", () => {
  const openSound = document.getElementById("openSound");

  if (openSound) openSound.volume = 0.25;

  const categoryTriggers = document.querySelectorAll(".gallery-category-toggle, .hydra_gallery_art_card-item");

  categoryTriggers.forEach(trigger => {
    trigger.addEventListener("click", () => {
      const parentContainer = trigger.closest(".gallery-category-container");
      if (parentContainer) {
        parentContainer.classList.toggle("active");
      }

      if (openSound) {
        openSound.currentTime = 0;
        openSound.play().catch(err => {
          // Manejo silencioso en caso de restricciones del navegador
        });
      }
    });
  });
});




document.addEventListener("DOMContentLoaded", () => {
  // 1. Define la ruta de tu archivo de sonido (mp3, wav, etc.)
  const switchSound = new Audio('hydra_material/sounds/tick.mp3'); 
  switchSound.volume = 0.6; // Ajusta el volumen si es necesario (de 0.0 a 1.0)

  // 2. Selecciona el input del switch (basado en la clase .model-switch del CSS[cite: 8])
  const modelSwitchInput = document.querySelector('.model-switch input[type="checkbox"]');

  if (modelSwitchInput) {
    modelSwitchInput.addEventListener('change', () => {
      // Reinicia el audio al principio por si se pulsa rápidamente varias veces
      switchSound.currentTime = 0;
      
      // Reproduce el sonido y maneja posibles restricciones del navegador
      switchSound.play().catch(error => {
        console.warn("La reproducción de audio fue bloqueada o falló:", error);
      });
    });
  }
});