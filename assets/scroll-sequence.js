class ScrollTriggerImagesSequence extends HTMLElement {
    constructor() {
      super();
      this.canvas = this.querySelector('canvas');
      this.context = this.canvas.getContext('2d');
      this.items = this.querySelectorAll('.image-sequence-content-item');
      this.images = [];
      this.sequence = { frame: 0 }; // 动画状态对象
    }
  
    connectedCallback() {
      // 注册 GSAP
      gsap.registerPlugin(ScrollTrigger);
      
      // 1. 生成 URL 数组
      const totalFrames = parseInt(this.getAttribute('imagecount'));
      const startUrl = this.getAttribute('imagestarturl');
      const startId = this.getAttribute('imagestartid'); // "00001"
      
      for (let i = 1; i <= totalFrames; i++) {
        const img = new Image();
        // 正则替换：找到 startId 并替换为当前的 index
        // 这里的逻辑需要确保你的文件名 ID 位数是对齐的
        const currentId = i.toString().padStart(startId.length, '0');
        img.src = startUrl.replace(startId, currentId);
        this.images.push(img);
      }
  
      // 第一帧加载好后先画出来
      this.images[0].onload = () => this.render();
  
      // 2. 启动 ScrollTrigger
      this.initScroll();
    }
  
    initScroll() {
      // 动画核心
      let tl = gsap.timeline({
        scrollTrigger: {
          trigger: this,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5, // 柔和度
          pin: this.canvas, // 钉住 Canvas
          onUpdate: (self) => {
            this.checkTextVisibility(self.progress * 100);
          }
        }
      });
  
      // 序列帧动画
      tl.to(this.sequence, {
        frame: this.images.length - 1,
        snap: "frame",
        ease: "none",
        onUpdate: () => this.render() // 每一帧都重绘
      });
    }
  
    render() {
      const img = this.images[this.sequence.frame];
      if (img && img.complete) {
        // 简单的 drawImage，如果要 cover 效果需要计算比例
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
      }
    }
  
    // 3. 处理文字显隐 (复刻 data-progress 逻辑)
    checkTextVisibility(progress) {
      this.items.forEach(item => {
        const start = parseFloat(item.dataset.progressStart);
        const end = parseFloat(item.dataset.progressEnd);
        
        if (progress >= start && progress <= end) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
  }
  
  // 注册自定义组件
  customElements.define('scroll-trigger-images-sequence', ScrollTriggerImagesSequence);