class ThemeManager {
  constructor() {
    this.theme =
      localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    this.themeToggle = document.getElementById("themeToggle")
    this.init()
  }

  init() {
    this.setTheme(this.theme)
    this.themeToggle.addEventListener("click", () => this.toggleTheme())
  }

  setTheme(theme) {
    this.theme = theme
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("theme", theme)

    const icon = this.themeToggle.querySelector(".theme-icon")
    icon.textContent = theme === "dark" ? "☀️" : "🌙"
  }

  toggleTheme() {
    const newTheme = this.theme === "light" ? "dark" : "light"
    this.setTheme(newTheme)
  }
}

class MobileMenu {
  constructor() {
    this.toggle = document.getElementById("mobileToggle")
    this.menu = document.querySelector(".nav-menu")
    this.isOpen = false
    this.init()
  }

  init() {
    this.toggle.addEventListener("click", () => this.toggleMenu())

    this.menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => this.closeMenu())
    })
  }

  toggleMenu() {
    this.isOpen = !this.isOpen
    this.menu.style.display = this.isOpen ? "flex" : "none"
    this.toggle.classList.toggle("active", this.isOpen)
  }

  closeMenu() {
    this.isOpen = false
    this.menu.style.display = "none"
    this.toggle.classList.remove("active")
  }
}

class CounterAnimation {
  constructor() {
    this.counters = document.querySelectorAll(".stat-number")
    this.animated = false
    this.init()
  }

  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.animated) {
          this.animateCounters()
          this.animated = true
        }
      })
    })

    this.counters.forEach((counter) => observer.observe(counter))
  }

  animateCounters() {
    this.counters.forEach((counter) => {
      const target = Number.parseInt(counter.getAttribute("data-target"))
      const duration = 2000
      const step = target / (duration / 16)
      let current = 0

      const timer = setInterval(() => {
        current += step
        if (current >= target) {
          current = target
          clearInterval(timer)
        }
        counter.textContent = Math.floor(current)
      }, 16)
    })
  }
}

class SmoothScroll {
  constructor() {
    this.init()
  }

  init() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault()
        const target = document.querySelector(anchor.getAttribute("href"))
        if (target) {
          const offsetTop = target.offsetTop - 70
          window.scrollTo({
            top: offsetTop,
            behavior: "smooth",
          })
        }
      })
    })
  }
}

class NavbarScroll {
  constructor() {
    this.navbar = document.querySelector(".navbar")
    this.init()
  }

  init() {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 100) {
        this.navbar.style.background = "rgba(255, 255, 255, 0.98)"
        if (document.documentElement.getAttribute("data-theme") === "dark") {
          this.navbar.style.background = "rgba(26, 26, 26, 0.98)"
        }
      } else {
        this.navbar.style.background = "rgba(255, 255, 255, 0.95)"
        if (document.documentElement.getAttribute("data-theme") === "dark") {
          this.navbar.style.background = "rgba(26, 26, 26, 0.95)"
        }
      }
    })
  }
}

class Gallery {
  constructor() {
    this.items = document.querySelectorAll(".gallery-item")
    this.galleryGrid = document.querySelector(".gallery-grid")
    this.init()
  }

  async init() {
    await this.loadGalleryData()
    this.items = document.querySelectorAll(".gallery-item")
    this.items.forEach((item) => {
      item.addEventListener("click", () => {
        this.showModal(item)
      })
    })
  }

  async loadGalleryData() {
    try {
      const databaseResponse = await fetch("./database/database.json")
      const database = await databaseResponse.json()

      this.galleryGrid.innerHTML = ""

      for (const [key, jsonFile] of Object.entries(database)) {
        const configResponse = await fetch(`./database/${jsonFile}`)
        const config = await configResponse.json()

        const images = await this.loadImagesFromFolder(config.folder)

        images.forEach((imagePath) => {
          const galleryItem = this.createGalleryItem(imagePath, config.name)
          this.galleryGrid.appendChild(galleryItem)
        })
      }
    } catch (error) {
      console.error("Failed to load gallery data:", error)
    }
  }

  async loadImagesFromFolder(folderName) {
    const extensions = ["png", "jpg", "jpeg", "webp", "gif"]
    const images = []

    for (let i = 1; i <= 20; i++) {
      for (const ext of extensions) {
        try {
          const imagePath = `./gallery/${folderName}/${i}.${ext}`
          const response = await fetch(imagePath, { method: "HEAD" })
          if (response.ok) {
            images.push(imagePath)
            break
          }
        } catch (error) {
          continue
        }
      }
    }

    return images
  }

  createGalleryItem(imagePath, authorName) {
    const galleryItem = document.createElement("div")
    galleryItem.className = "gallery-item"
    galleryItem.innerHTML = `
      <div class="gallery-image">
        <img src="${imagePath}" alt="Furry artwork by ${authorName}" loading="lazy">
        <div class="gallery-overlay">
          <p>by ${authorName}</p>
        </div>
      </div>
    `
    return galleryItem
  }

  showModal(item) {
    const img = item.querySelector("img")
    const author = item.querySelector(".gallery-overlay p").textContent

    const modal = document.createElement("div")
    modal.className = "gallery-modal"
    modal.innerHTML = `
      <div class="modal-content">
        <span class="modal-close">&times;</span>
        <img src="${img.src}" alt="${img.alt}">
        <h3>${author}</h3>
        <button class="btn btn-primary">查看更多</button>
      </div>
    `

    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      opacity: 0;
      transition: opacity 0.3s ease;
    `

    const modalContent = modal.querySelector(".modal-content")
    modalContent.style.cssText = `
      background: var(--bg-color);
      padding: 40px;
      border-radius: 20px;
      text-align: center;
      max-width: 600px;
      width: 90%;
      transform: scale(0.8);
      transition: transform 0.3s ease;
    `

    const modalImg = modal.querySelector("img")
    modalImg.style.cssText = `
      max-width: 100%;
      max-height: 400px;
      border-radius: 10px;
      margin-bottom: 20px;
    `

    const modalClose = modal.querySelector(".modal-close")
    modalClose.style.cssText = `
      position: absolute;
      top: 15px;
      right: 20px;
      font-size: 2rem;
      cursor: pointer;
      color: var(--text-secondary);
    `

    document.body.appendChild(modal)

    setTimeout(() => {
      modal.style.opacity = "1"
      modalContent.style.transform = "scale(1)"
    }, 10)

    const closeModal = () => {
      modal.style.opacity = "0"
      modalContent.style.transform = "scale(0.8)"
      setTimeout(() => {
        document.body.removeChild(modal)
      }, 300)
    }

    modalClose.addEventListener("click", closeModal)
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal()
    })
  }
}

class ParticleEffect {
  constructor() {
    this.canvas = document.createElement("canvas")
    this.ctx = this.canvas.getContext("2d")
    this.particles = []
    this.init()
  }

  init() {
    this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            opacity: 0.1;
        `

    document.body.appendChild(this.canvas)
    this.resize()
    this.createParticles()
    this.animate()

    window.addEventListener("resize", () => this.resize())
  }

  resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  createParticles() {
    const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 15000)

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
      })
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.particles.forEach((particle) => {
      particle.x += particle.vx
      particle.y += particle.vy

      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1

      this.ctx.beginPath()
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      this.ctx.fillStyle = "#ff6b6b"
      this.ctx.fill()
    })

    requestAnimationFrame(() => this.animate())
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ThemeManager()
  new MobileMenu()
  new CounterAnimation()
  new SmoothScroll()
  new NavbarScroll()
  new Gallery()
  new ParticleEffect()

  document.body.style.opacity = "0"
  setTimeout(() => {
    document.body.style.transition = "opacity 0.5s ease"
    document.body.style.opacity = "1"
  }, 100)

  let mouseX = 0,
    mouseY = 0
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX
    mouseY = e.clientY
  })

  const floatingItems = document.querySelectorAll(".floating-item")
  setInterval(() => {
    floatingItems.forEach((item, index) => {
      const rect = item.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = (mouseX - centerX) * 0.01
      const deltaY = (mouseY - centerY) * 0.01

      item.style.transform = `translate(${deltaX}px, ${deltaY}px)`
    })
  }, 50)
})

document.addEventListener("click", (e) => {
  const heart = document.createElement("div")
  heart.innerHTML = "Furry!💖"
  heart.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        font-size: 1.5rem;
        pointer-events: none;
        z-index: 9999;
        animation: heartFloat 1s ease-out forwards;
    `

  if (!document.querySelector("#heartAnimation")) {
    const style = document.createElement("style")
    style.id = "heartAnimation"
    style.textContent = `
            @keyframes heartFloat {
                0% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-50px) scale(0.5);
                }
            }
        `
    document.head.appendChild(style)
  }

  document.body.appendChild(heart)
  setTimeout(() => {
    if (heart.parentNode) {
      heart.parentNode.removeChild(heart)
    }
  }, 1000)
})
