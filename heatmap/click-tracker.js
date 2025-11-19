// 点击热力图数据收集器
class HeatmapTracker {
  constructor(options = {}) {
    this.config = {
      enabled: true,
      debug: false,
      storageKey: 'heatmap-clicks',
      maxClicks: 1000,
      ...options
    };

    this.clicks = this.loadClicks();
    this.init();
  }

  init() {
    if (!this.config.enabled) return;

    // 监听点击事件
    document.addEventListener('click', this.handleClick.bind(this));

    // 延迟显示热力图（按住Alt键查看）
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Alt') this.showHeatmap();
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === 'Alt') this.hideHeatmap();
    });
  }

  handleClick(event) {
    const clickData = {
      x: event.clientX,
      y: event.clientY,
      pageX: event.pageX,
      pageY: event.pageY,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    this.addClick(clickData);

    if (this.config.debug) {
      console.log('Heatmap click recorded:', clickData);
    }
  }

  addClick(clickData) {
    this.clicks.push(clickData);

    // 限制存储数量
    if (this.clicks.length > this.config.maxClicks) {
      this.clicks = this.clicks.slice(-this.config.maxClicks);
    }

    this.saveClicks();
  }

  saveClicks() {
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(this.clicks));
    } catch (e) {
      console.warn('无法保存热力图数据:', e);
    }
  }

  loadClicks() {
    try {
      const data = localStorage.getItem(this.config.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('无法加载热力图数据:', e);
      return [];
    }
  }

  showHeatmap() {
    this.createHeatmapOverlay();
  }

  hideHeatmap() {
    const overlay = document.getElementById('heatmap-overlay');
    if (overlay) overlay.remove();
  }

  createHeatmapOverlay() {
    // 移除已存在的覆盖层
    this.hideHeatmap();

    const overlay = document.createElement('div');
    overlay.id = 'heatmap-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999999;
      background: transparent;
    `;

    // 创建Canvas绘制热力图
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 绘制热力图
    this.drawHeatmap(ctx, canvas.width, canvas.height);

    overlay.appendChild(canvas);
    document.body.appendChild(overlay);

    // 添加控制提示
    this.addControls(overlay);
  }

  drawHeatmap(ctx, width, height) {
    const currentUrl = window.location.href;
    const currentClicks = this.clicks.filter(click => click.url === currentUrl);

    if (currentClicks.length === 0) return;

    // 计算点击密度
    const heatmapData = {};
    const radius = 30;

    currentClicks.forEach(click => {
      const x = Math.floor(click.x / radius) * radius;
      const y = Math.floor(click.y / radius) * radius;
      const key = `${x},${y}`;

      heatmapData[key] = (heatmapData[key] || 0) + 1;
    });

    // 找出最大值用于归一化
    const maxIntensity = Math.max(...Object.values(heatmapData));

    // 绘制热力图
    Object.entries(heatmapData).forEach(([key, intensity]) => {
      const [x, y] = key.split(',').map(Number);
      const normalizedIntensity = intensity / maxIntensity;

      // 创建渐变
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

      if (normalizedIntensity > 0.7) {
        // 高频点击 - 红色
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      } else if (normalizedIntensity > 0.3) {
        // 中频点击 - 黄色
        gradient.addColorStop(0, 'rgba(255, 255, 0, 0.7)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
      } else {
        // 低频点击 - 蓝色
        gradient.addColorStop(0, 'rgba(0, 0, 255, 0.6)');
        gradient.addColorStop(0.5, 'rgba(0, 0, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 255, 0)');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    });
  }

  addControls(overlay) {
    const controls = document.createElement('div');
    controls.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 1000000;
      pointer-events: auto;
    `;

    const currentUrl = window.location.href;
    const currentClicks = this.clicks.filter(click => click.url === currentUrl);
    const totalClicks = this.clicks.length;

    controls.innerHTML = `
      <div>🔥 点击热力图</div>
      <div>当前页面: ${currentClicks.length} 次点击</div>
      <div>总计: ${totalClicks} 次点击</div>
      <div style="margin-top: 10px;">
        <button onclick="heatmapTracker.clearData()"
                style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
          清除数据
        </button>
      </div>
      <div style="margin-top: 5px; font-size: 10px; opacity: 0.7;">
        松开 Alt 键隐藏热力图
      </div>
    `;

    overlay.appendChild(controls);
  }

  clearData() {
    this.clicks = [];
    localStorage.removeItem(this.config.storageKey);
    this.hideHeatmap();
    console.log('热力图数据已清除');
  }

  exportData() {
    return {
      clicks: this.clicks,
      exportTime: new Date().toISOString(),
      version: '1.0'
    };
  }
}

// 全局实例
window.heatmapTracker = new HeatmapTracker({
  debug: false, // 设置为true查看调试信息
  maxClicks: 500
});