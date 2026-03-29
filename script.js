
/* 1 ЭКРАН */

const bugs = document.querySelectorAll(".bug")

let mouseX = window.innerWidth/2
let mouseY = window.innerHeight/2

document.addEventListener("mousemove", e=>{
mouseX = e.clientX
mouseY = e.clientY
})

const bugData = []

bugs.forEach(bug=>{

const rect = bug.getBoundingClientRect()

bugData.push({

el:bug,

baseX:rect.left,
baseY:rect.top,

noise:Math.random()*1000,
speed:0.02 + Math.random()*0.05,
range:1 + Math.random()*2

})

})

function animate(){

bugData.forEach(bug=>{

bug.noise += bug.speed

const jitterX = Math.sin(bug.noise) * bug.range
const jitterY = Math.cos(bug.noise) * bug.range

const dx = mouseX - bug.baseX
const dy = mouseY - bug.baseY

const angle = Math.atan2(dy,dx)

bug.el.style.transform =
`translate(${jitterX}px, ${jitterY}px) rotate(${angle}rad)`

})

requestAnimationFrame(animate)

}

animate()

document.addEventListener("DOMContentLoaded", () => {
  const tw1 = document.getElementById("tw1");
  const tw2 = document.getElementById("tw2");

  const text1 = " 2019–2023 годов."; 
  const text2 = "термитов.";

  let i = 0, j = 0;

  function typeFirst() {
    if (i < text1.length) {
      tw1.textContent += text1.charAt(i);
      i++;
      setTimeout(typeFirst, 70);
    } else {
      setTimeout(typeSecond, 300);
    }
  }

  function typeSecond() {
    if (j < text2.length) {
      tw2.textContent += text2.charAt(j);
      j++;
      setTimeout(typeSecond, 70);
    }
  }

  typeFirst();
});



/* 2 ЭКРАН */

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.querySelector(".overlay");
  const popupIntro = document.querySelector(".popup-intro");
  const popupPoison = document.querySelector(".popup-poison");
  const popupWin = document.querySelector(".popup-win");

  const player = document.querySelector(".player-bug");
  const foods = document.querySelectorAll(".food");
  const poisons = document.querySelectorAll(".poison");
  const walls = document.querySelectorAll(".wall");
  const mazeContainer = document.querySelector(".maze-container");

  if (!overlay || !popupIntro || !popupPoison || !popupWin || !player || !mazeContainer) {
    console.error("Не найдены нужные элементы для игры");
    return;
  }

  let state = "idle";
  let playerX = 0;
  let playerY = 0;
  let targetX = 0;
  let targetY = 0;
  let playerSize = 0;
  let eatenCount = 0;
  let buzzingPhase = 0;
  let winAnimationStarted = false;

  function getScreen2Config() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (w <= 414) {
      return {
        startLeft: "76vw",
        startTop: "82vh",
        playerWidth: "6vw",
        finishWidth: 120,
        finishHeight: 120,
        exitOffsetX: 80,
        exitOffsetY: -80
      };
    }

    if (w <= 768) {
      return {
        startLeft: "77vw",
        startTop: "83vh",
        playerWidth: "4.8vw",
        finishWidth: 130,
        finishHeight: 130,
        exitOffsetX: 90,
        exitOffsetY: -90
      };
    }

    if (w <= 1024) {
      return {
        startLeft: "82vw",
        startTop: "77vh",
        playerWidth: "4vw",
        finishWidth: 145,
        finishHeight: 145,
        exitOffsetX: 100,
        exitOffsetY: -100
      };
    }

    if (w <= 1280) {
      return {
        startLeft: "79vw",
        startTop: "84vh",
        playerWidth: "3.5vw",
        finishWidth: 160,
        finishHeight: 160,
        exitOffsetX: 110,
        exitOffsetY: -110
      };
    }

    if (w <= 1366 || h <= 768) {
      return {
        startLeft: "79.2vw",
        startTop: "84vh",
        playerWidth: "3.2vw",
        finishWidth: 170,
        finishHeight: 170,
        exitOffsetX: 115,
        exitOffsetY: -115
      };
    }

    return {
      startLeft: "79.5vw",
      startTop: "84vh",
      playerWidth: "3vw",
      finishWidth: 180,
      finishHeight: 180,
      exitOffsetX: 120,
      exitOffsetY: -120
    };
  }

  function rectsIntersect(a, b) {
    return (
      a.left < b.right &&
      a.right > b.left &&
      a.top < b.bottom &&
      a.bottom > b.top
    );
  }

  function resetFood() {
    foods.forEach((food) => {
      food.style.display = "block";
    });
    eatenCount = 0;
  }

  function applyPlayerStartPosition() {
    const config = getScreen2Config();

    player.style.left = config.startLeft;
    player.style.top = config.startTop;
    player.style.width = config.playerWidth;
    player.style.transform = "translate(0px, 0px) rotate(0deg) scaleX(1)";
  }

  function resetGame() {
    player.style.transition = "transform 0.2s ease, left 0s, top 0s";

    applyPlayerStartPosition();

    const playerRect = player.getBoundingClientRect();
    const containerRect = mazeContainer.getBoundingClientRect();

    playerX = playerRect.left - containerRect.left;
    playerY = playerRect.top - containerRect.top;
    targetX = playerX;
    targetY = playerY;
    playerSize = player.offsetWidth;

    winAnimationStarted = false;
    resetFood();
  }

  function showPopup(popup) {
    overlay.classList.add("active");
    popup.classList.add("active");
    state = "locked";
  }

  function hideAllPopups() {
    overlay.classList.remove("active");
    document.querySelectorAll(".popup").forEach((popup) => {
      popup.classList.remove("active");
    });
  }

  function getBugRectAt(x, y) {
    return {
      left: x,
      top: y,
      right: x + player.offsetWidth,
      bottom: y + player.offsetHeight
    };
  }

  function isCollidingWithWalls(x, y) {
    const bugRect = getBugRectAt(x, y);
    const containerRect = mazeContainer.getBoundingClientRect();

    for (const wall of walls) {
      const rect = wall.getBoundingClientRect();

      const wallRect = {
        left: rect.left - containerRect.left,
        top: rect.top - containerRect.top,
        right: rect.right - containerRect.left,
        bottom: rect.bottom - containerRect.top
      };

      if (rectsIntersect(bugRect, wallRect)) {
        return true;
      }
    }

    return false;
  }

  function checkFoodCollisions() {
    const playerRect = player.getBoundingClientRect();

    foods.forEach((food) => {
      if (food.style.display === "none") return;

      const foodRect = food.getBoundingClientRect();

      if (rectsIntersect(playerRect, foodRect)) {
        food.style.display = "none";
        eatenCount += 1;
        playerSize += 6;
        player.style.width = `${playerSize}px`;
      }
    });
  }

  function checkPoisonCollisions() {
    const playerRect = player.getBoundingClientRect();

    for (const poison of poisons) {
      const poisonRect = poison.getBoundingClientRect();

      if (rectsIntersect(playerRect, poisonRect)) {
        showPopup(popupPoison);
        return true;
      }
    }

    return false;
  }

  function startWinAnimation() {
    if (winAnimationStarted) return;

    const config = getScreen2Config();

    winAnimationStarted = true;
    state = "win-exit";

    const exitX = mazeContainer.clientWidth + config.exitOffsetX;
    const exitY = config.exitOffsetY;

    player.style.transition = "left 1.2s ease-in, top 1.2s ease-in, transform 0.2s ease";
    player.style.left = `${exitX}px`;
    player.style.top = `${exitY}px`;

    setTimeout(() => {
      showPopup(popupWin);
      player.style.transition = "transform 0.2s ease";
    }, 1250);
  }

  function checkWinCondition() {
    if (winAnimationStarted) return;
    if (eatenCount !== foods.length) return;

    const config = getScreen2Config();
    const playerRect = player.getBoundingClientRect();
    const containerRect = mazeContainer.getBoundingClientRect();

    const localPlayerRect = {
      left: playerRect.left - containerRect.left,
      top: playerRect.top - containerRect.top,
      right: playerRect.right - containerRect.left,
      bottom: playerRect.bottom - containerRect.top
    };

    const finishZone = {
      left: containerRect.width - config.finishWidth,
      top: 0,
      right: containerRect.width,
      bottom: config.finishHeight
    };

    if (rectsIntersect(localPlayerRect, finishZone)) {
      startWinAnimation();
    }
  }

  function updateIdleBuzz() {
    if (state !== "idle") return;

    buzzingPhase += 0.18;

    const offsetX = Math.sin(buzzingPhase * 1.7) * 2;
    const offsetY = Math.cos(buzzingPhase * 2.1) * 2;
    const rotate = Math.sin(buzzingPhase * 2.4) * 3;

    player.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotate}deg)`;
    player.style.cursor = "pointer";
    player.style.pointerEvents = "auto";
  }

  function updatePlayMovement() {
    if (state !== "play") return;

    const nextX = playerX + (targetX - playerX) * 0.1;
    const nextY = playerY + (targetY - playerY) * 0.1;

    if (!isCollidingWithWalls(nextX, playerY)) {
      playerX = nextX;
    }

    if (!isCollidingWithWalls(playerX, nextY)) {
      playerY = nextY;
    }

    const dx = targetX - playerX;
    const flip = dx < 0 ? -1 : 1;

    player.style.left = `${playerX}px`;
    player.style.top = `${playerY}px`;
    player.style.transform = `scaleX(${flip})`;

    checkFoodCollisions();

    if (checkPoisonCollisions()) return;

    checkWinCondition();
  }

  function animate() {
    updateIdleBuzz();
    updatePlayMovement();
    requestAnimationFrame(animate);
  }

  function updateTargetFromPointer(clientX, clientY) {
    if (state !== "play") return;

    const rect = mazeContainer.getBoundingClientRect();

    targetX = clientX - rect.left - player.offsetWidth / 2;
    targetY = clientY - rect.top - player.offsetHeight / 2;
  }

  mazeContainer.addEventListener("mousemove", (e) => {
    updateTargetFromPointer(e.clientX, e.clientY);
  });

  mazeContainer.addEventListener(
    "touchmove",
    (e) => {
      if (state !== "play") return;
      const touch = e.touches[0];
      if (!touch) return;
      updateTargetFromPointer(touch.clientX, touch.clientY);
    },
    { passive: true }
  );

  player.addEventListener("click", () => {
    if (state !== "idle") return;
    showPopup(popupIntro);
  });

  player.addEventListener("touchstart", () => {
    if (state !== "idle") return;
    showPopup(popupIntro);
  });

  popupIntro.addEventListener("click", () => {
    hideAllPopups();
    resetGame();
    state = "play";
  });

  popupIntro.addEventListener("touchstart", () => {
    hideAllPopups();
    resetGame();
    state = "play";
  });

  popupPoison.addEventListener("click", () => {
    hideAllPopups();
    resetGame();
    state = "idle";
  });

  popupPoison.addEventListener("touchstart", () => {
    hideAllPopups();
    resetGame();
    state = "idle";
  });

  popupWin.addEventListener("click", () => {
    hideAllPopups();
    resetGame();
    state = "idle";
  });

  popupWin.addEventListener("touchstart", () => {
    hideAllPopups();
    resetGame();
    state = "idle";
  });

  window.addEventListener("resize", () => {
    if (state === "idle" || state === "locked") {
      resetGame();
    }
  });

  resetGame();
  animate();
});

/* 3 ЭКРАН */

document.addEventListener("DOMContentLoaded", () => {
  const screen3 = document.querySelector(".screen3");
  const flyingBug = document.querySelector(".bugwwings-fly");
  const popup = document.querySelector(".popup-screen3");
  const overlay = document.querySelector(".overlay-screen3");
  const titleBugWrap = document.querySelector(".bugwwings-wrap");

  const artImages = document.querySelectorAll(".art-image");
  const captionSpans = document.querySelectorAll(".tw-caption");

  let bugStarted = false;
  let popupWasViewed = false;
  let captionsTyped = false;
  let typingStarted = false;

  titleBugWrap?.classList.remove("settled");

  function typeOne(span, speed = 26) {
    return new Promise((resolve) => {
      const text = span.dataset.text || "";
      let i = 0;

      span.textContent = "";
      span.classList.remove("done");

      function typing() {
        if (i < text.length) {
          span.textContent += text.charAt(i);
          i++;
          setTimeout(typing, speed);
        } else {
          span.classList.add("done");
          resolve();
        }
      }

      typing();
    });
  }

  async function startTyping() {
    if (captionsTyped || typingStarted) return;

    typingStarted = true;

    for (const span of captionSpans) {
      await typeOne(span, 26);
      await new Promise((r) => setTimeout(r, 70));
    }

    captionsTyped = true;
    startBug();
  }

  function startBug() {
    if (!flyingBug || bugStarted || popupWasViewed) return;

    bugStarted = true;

    flyingBug.style.display = "block";
    flyingBug.style.opacity = "1";
    flyingBug.classList.add("visible", "entering");

    setTimeout(() => {
      if (!popupWasViewed) {
        flyingBug.classList.remove("entering");
        flyingBug.classList.add("glow", "orbiting");
      }
    }, 2800);
  }

  function hideBug() {
    if (!flyingBug) return;

    flyingBug.classList.remove("visible", "entering", "glow", "orbiting", "returning");
    flyingBug.style.display = "none";
    flyingBug.style.opacity = "0";

    if (!popupWasViewed) {
      bugStarted = false;
    }
  }

  function openPopup(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    popup?.classList.add("active");
    overlay?.classList.add("active");
  }

  function closePopup() {
    popup?.classList.remove("active");
    overlay?.classList.remove("active");

    if (!popupWasViewed) {
      popupWasViewed = true;

      flyingBug?.classList.remove("orbiting", "glow");
      flyingBug?.classList.add("returning");

      setTimeout(() => {
        hideBug();
        titleBugWrap?.classList.add("settled");
      }, 1000);
    }
  }

  artImages.forEach((image) => {
    let interval = null;
    let isAnimating = false;

    function fadeTo(src, index) {
      if (isAnimating) return;

      isAnimating = true;
      image.style.opacity = "0.2";

      const temp = new Image();
      temp.src = src;

      temp.onload = () => {
        setTimeout(() => {
          image.src = src;
          image.dataset.index = index;
          image.style.opacity = "1";

          setTimeout(() => {
            isAnimating = false;
          }, 850);
        }, 200);
      };

      temp.onerror = () => {
        image.style.opacity = "1";
        isAnimating = false;
      };
    }

    image.addEventListener("mouseenter", () => {
      if (!popupWasViewed) return;

      const images = JSON.parse(image.dataset.images || "[]");
      if (images.length < 2) return;

      clearInterval(interval);

      interval = setInterval(() => {
        if (isAnimating) return;

        let i = Number(image.dataset.index || 0);
        i = (i + 1) % images.length;

        fadeTo(images[i], i);
      }, 1800);
    });

    image.addEventListener("mouseleave", () => {
      clearInterval(interval);

      const images = JSON.parse(image.dataset.images || "[]");
      if (!images.length) return;

      fadeTo(images[0], 0);
    });
  });

  flyingBug?.addEventListener("click", openPopup);
  overlay?.addEventListener("click", closePopup);
  popup?.addEventListener("click", closePopup);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        startTyping();
      } else {
        hideBug();
      }
    });
  }, { threshold: 0.6 });

  if (screen3) {
    observer.observe(screen3);
  }
});

/* 4 ЭКРАН */

/* мобильный адаптив по тапу*/
document.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth > 450) return;

  const phoneImages = document.querySelectorAll(".phone-card__image");

  phoneImages.forEach((image) => {
    image.addEventListener("click", () => {
      const images = JSON.parse(image.dataset.images || "[]");
      if (!images.length) return;

      let index = Number(image.dataset.index || 0);
      index = (index + 1) % images.length;

      image.src = images[index];
      image.dataset.index = index;
    });
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const bugTrigger = document.getElementById("bugTrigger");
  const bugPopup = document.getElementById("bugPopup");
  const popupOverlay = document.getElementById("popupOverlay");
  const holeButtons = document.querySelectorAll(".hole-btn");

  const holeImages = {
    0: [
      "assets/empty1.svg",
      "assets/filled11.png",
      "assets/filled12.png",
      "assets/filled13.png"
    ],
    1: [
      "assets/empty2.svg",
      "assets/filled21.png",
      "assets/filled22.png",
      "assets/filled23.png"
    ],
    2: [
      "assets/empty3.svg",
      "assets/filled31.png",
      "assets/filled32.png",
      "assets/filled33.png"
    ],
    3: [
      "assets/empty4.svg",
      "assets/filled41.png",
      "assets/filled42.png",
      "assets/filled43.png"
    ]
  };

  const holeState = {
    0: 0,
    1: 0,
    2: 0,
    3: 0
  };

  let popupClosed = false;
  let popupOpenedOnce = false;
  let spinningStarted = false;

  if (!bugTrigger || !bugPopup || !popupOverlay) {
    console.error("Screen 4: missing required elements");
    return;
  }

  holeButtons.forEach((button) => {
    button.classList.add("is-locked");
  });

  function lockScroll() {
    document.body.style.overflow = "hidden";
  }

  function unlockScroll() {
    document.body.style.overflow = "";
  }

  function openPopup() {
    bugPopup.classList.remove("is-hidden");
    lockScroll();
  }

  function closePopup() {
    bugPopup.classList.add("is-hidden");
    unlockScroll();
    popupClosed = true;

    holeButtons.forEach((button) => {
      button.classList.remove("is-locked");
    });
  }

  function checkAllFilled() {
    const allFilled = Object.values(holeState).every((value) => value > 0);

    if (allFilled && !spinningStarted) {
      bugTrigger.classList.add("screen4-spinning");
      spinningStarted = true;
    }
  }

  bugTrigger.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!popupOpenedOnce) {
      popupOpenedOnce = true;
      openPopup();
    }
  });

  popupOverlay.addEventListener("click", closePopup);
  bugPopup.addEventListener("click", closePopup);

  holeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!popupClosed) return;

      const holeId = button.dataset.hole;
      const img = button.querySelector(".hole-btn__img");
      const variants = holeImages[holeId];

      if (!img || !variants) return;

      if (holeState[holeId] < variants.length - 1) {
        holeState[holeId] += 1;
      } else {
        holeState[holeId] = 1;
      }

      img.src = variants[holeState[holeId]];
      checkAllFilled();
    });
  });
});

/* 7 ЭКРАН */
document.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth > 450) return;

  const phoneHoles = document.querySelectorAll(".screen7-phone__hole-btn");

  const holeVariants = [
    ["assets/empty1.svg", "assets/filled11.png", "assets/filled12.png", "assets/filled13.png"],
    ["assets/empty2.svg", "assets/filled21.png", "assets/filled22.png", "assets/filled23.png"],
    ["assets/empty3.svg", "assets/filled31.png", "assets/filled32.png", "assets/filled33.png"],
    ["assets/empty4.svg", "assets/filled41.png", "assets/filled42.png", "assets/filled43.png"]
  ];

  phoneHoles.forEach((button) => {
    const holeIndex = Number(button.dataset.phoneHole || 0);
    const img = button.querySelector(".screen7-phone__hole-img");
    if (!img) return;

    let currentIndex = 0;

    button.addEventListener("click", () => {
      const variants = holeVariants[holeIndex];
      if (!variants || !variants.length) return;

      currentIndex = (currentIndex + 1) % variants.length;
      img.src = variants[currentIndex];
    });
  });
});