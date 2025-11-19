// 长图分享功能
class ShareImageGenerator {
    constructor() {
        this.isGenerating = false;
        this.options = {
            scale: 2, // 高清图倍数
            backgroundColor: '#ffffff',
            padding: 40,
            qrSize: 120,
            footerHeight: 180
        };
    }

    // 初始化
    init() {
        this.createShareButton();
        this.createModal();
    }

    // 创建分享按钮
    createShareButton() {
        // 检查是否是文章页面
        if (!this.isArticlePage()) return;

        // 检测现有返回顶部按钮的位置
        const existingTopLink = document.querySelector('.top-link');

        // 创建悬浮按钮容器
        const floatingContainer = document.createElement('div');
        floatingContainer.className = 'floating-actions-container';

        floatingContainer.style.cssText = `
            position: fixed;
            right: 20px;
            bottom: 60px;
            z-index: 999;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            opacity: 0;
            transform: scale(0.8) translateY(10px);
            animation: floatingContainerFadeIn 0.5s ease forwards;
            animation-delay: 1.5s;
        `;

        // 创建主按钮（更多选项按钮）
        const mainButton = document.createElement('button');
        mainButton.innerHTML = '⋯';
        mainButton.title = '更多选项';
        mainButton.className = 'floating-main-btn';

        mainButton.style.cssText = `
            background: var(--entry, #fff);
            color: var(--primary, #5a67d8);
            border: 1px solid var(--border, #e2e8f0);
            padding: 12px;
            border-radius: 50%;
            font-size: 20px;
            font-weight: 300;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            width: 52px;
            height: 52px;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            position: relative;
            z-index: 10;
        `;

        // 创建选项容器
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'floating-options';
        optionsContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
        `;

        // 创建返回顶部按钮
        const topButton = document.createElement('button');
        topButton.innerHTML = '↑';
        topButton.title = '返回顶部';
        topButton.className = 'floating-option-btn floating-top-btn';

        topButton.style.cssText = `
            background: var(--entry, #fff);
            color: var(--primary, #5a67d8);
            border: 1px solid var(--border, #e2e8f0);
            padding: 10px;
            border-radius: 50%;
            font-size: 18px;
            font-weight: 500;
            cursor: pointer;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            transform: scale(0);
        `;

        // 创建长图分享按钮
        const shareButton = document.createElement('button');
        shareButton.innerHTML = '📄';
        shareButton.title = '生成长图分享';
        shareButton.className = 'floating-option-btn floating-share-btn';

        shareButton.style.cssText = `
            background: var(--entry, #fff);
            color: var(--primary, #5a67d8);
            border: 1px solid var(--border, #e2e8f0);
            padding: 10px;
            border-radius: 50%;
            font-size: 16px;
            cursor: pointer;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            transform: scale(0);
        `;

        // 组装元素
        optionsContainer.appendChild(topButton);
        optionsContainer.appendChild(shareButton);
        floatingContainer.appendChild(optionsContainer);
        floatingContainer.appendChild(mainButton);

        // 如果存在现有的返回顶部按钮，隐藏它
        if (existingTopLink) {
            existingTopLink.style.display = 'none';
        }

        // 添加交互逻辑
        let isExpanded = false;

        const expandOptions = () => {
            if (isExpanded) return;
            isExpanded = true;

            optionsContainer.style.opacity = '1';
            optionsContainer.style.transform = 'translateY(0)';
            optionsContainer.style.pointerEvents = 'auto';

            // 逐个显示按钮，苹果风格动画
            setTimeout(() => {
                topButton.style.transform = 'scale(1)';
            }, 50);

            setTimeout(() => {
                shareButton.style.transform = 'scale(1)';
            }, 100);

            mainButton.innerHTML = '×';
            mainButton.style.transform = 'rotate(45deg)';
        };

        const collapseOptions = () => {
            if (!isExpanded) return;
            isExpanded = false;

            topButton.style.transform = 'scale(0)';
            shareButton.style.transform = 'scale(0)';

            setTimeout(() => {
                optionsContainer.style.opacity = '0';
                optionsContainer.style.transform = 'translateY(10px)';
                optionsContainer.style.pointerEvents = 'none';
            }, 200);

            mainButton.innerHTML = '⋯';
            mainButton.style.transform = 'rotate(0deg)';
        };

        // 添加事件监听器
        mainButton.addEventListener('mouseenter', expandOptions);

        floatingContainer.addEventListener('mouseleave', (e) => {
            // 检查鼠标是否离开了整个容器
            if (!floatingContainer.contains(e.relatedTarget)) {
                collapseOptions();
            }
        });

        topButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            collapseOptions();
        });

        shareButton.addEventListener('click', () => {
            this.generateShareImage();
            collapseOptions();
        });

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatingContainerFadeIn {
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }

            .floating-main-btn:hover {
                background: var(--primary, #5a67d8) !important;
                color: var(--entry, #fff) !important;
                transform: scale(1.05) !important;
                box-shadow: 0 6px 20px rgba(90, 103, 216, 0.3) !important;
            }

            .floating-option-btn:hover {
                background: var(--primary, #5a67d8) !important;
                color: var(--entry, #fff) !important;
                transform: scale(1.1) !important;
                box-shadow: 0 5px 15px rgba(90, 103, 216, 0.25) !important;
            }

            /* 隐藏社交媒体分享按钮 */
            .share-buttons,
            .post-share-buttons,
            .social-links,
            .social-icons {
                display: none !important;
            }

            /* 苹果风格按钮样式 */
            .apple-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                padding: 10px 16px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                outline: none;
                -webkit-tap-highlight-color: transparent;
                min-width: 100px;
            }

            .apple-btn-icon {
                font-size: 16px;
                line-height: 1;
            }

            .apple-btn-text {
                line-height: 1;
                white-space: nowrap;
            }

            .apple-btn-primary {
                background: var(--primary, #007AFF);
                color: white;
                box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
            }

            .apple-btn-primary:hover {
                background: var(--primary, #0056CC);
                box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4);
                transform: translateY(-1px);
            }

            .apple-btn-primary:active {
                background: var(--primary, #004499);
                box-shadow: 0 1px 4px rgba(0, 122, 255, 0.3);
                transform: translateY(0);
            }

            .apple-btn-secondary {
                background: var(--entry, #ffffff);
                color: var(--text, #333333);
                border: 1px solid var(--border, #d1d5db);
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }

            .apple-btn-secondary:hover {
                background: var(--background, #f9fafb);
                border-color: var(--primary, #007AFF);
                color: var(--primary, #007AFF);
                box-shadow: 0 2px 8px rgba(0, 122, 255, 0.2);
                transform: translateY(-1px);
            }

            .apple-btn-secondary:active {
                background: var(--background, #f3f4f6);
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                transform: translateY(0);
            }

            /* 响应式设计 */
            @media (max-width: 480px) {
                .apple-btn {
                    padding: 8px 12px;
                    font-size: 13px;
                    min-width: 88px;
                }

                .apple-btn-icon {
                    font-size: 14px;
                }

                .apple-btn-text {
                    font-size: 13px;
                }
            }

            /* 响应式设计 */
            @media (max-width: 768px) {
                .floating-actions-container {
                    right: 15px !important;
                    bottom: 50px !important;
                    gap: 10px !important;
                }

                .floating-main-btn {
                    width: 48px !important;
                    height: 48px !important;
                    font-size: 18px !important;
                }

                .floating-option-btn {
                    width: 40px !important;
                    height: 40px !important;
                    font-size: 14px !important;
                }
            }

            @media (max-width: 480px) {
                .floating-actions-container {
                    right: 12px !important;
                    bottom: 40px !important;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(floatingContainer);
    }

    // 创建模态框
    createModal() {
        const modal = document.createElement('div');
        modal.id = 'share-image-modal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            z-index: 10000;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: var(--entry, #fff);
            border: 1px solid var(--border, #e2e8f0);
            border-radius: 12px;
            padding: 24px;
            max-width: 90%;
            max-height: 90%;
            overflow: auto;
            position: relative;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            min-width: 400px;
        `;

        modalContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border, #e2e8f0); padding-bottom: 16px;">
                <h2 style="margin: 0; color: var(--text, #333); font-size: 18px; font-weight: 600;">📄 生成长图分享</h2>
                <button id="close-modal" style="background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text, #666); padding: 4px; border-radius: 4px; transition: background-color 0.2s;">×</button>
            </div>
            <div id="share-status" style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 15px; color: var(--text, #666); margin-bottom: 20px;">正在生成长图，请稍候...</div>
                <div style="width: 200px; height: 3px; background: var(--border, #e2e8f0); border-radius: 2px; margin: 0 auto;">
                    <div id="progress-bar" style="width: 0%; height: 100%; background: var(--primary, #5a67d8); border-radius: 2px; transition: width 0.3s ease;"></div>
                </div>
            </div>
            <div id="share-result" style="display: none; text-align: center;">
                <canvas id="share-canvas" style="max-width: 100%; border: 1px solid var(--border, #e2e8f0); border-radius: 12px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);"></canvas>
                <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
                    <button id="download-btn" class="apple-btn apple-btn-primary">
                        <span class="apple-btn-icon">📥</span>
                        <span class="apple-btn-text">下载图片</span>
                    </button>
                    <button id="copy-btn" class="apple-btn apple-btn-secondary">
                        <span class="apple-btn-icon">🔗</span>
                        <span class="apple-btn-text">复制链接</span>
                    </button>
                </div>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // 绑定事件
        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
            }
        });
    }

    // 检查是否是文章页面
    isArticlePage() {
        // 检查URL路径
        const path = window.location.pathname;
        console.log('ShareImage: Checking path:', path);
        const isArticle = path.includes('/posts/') && !path.includes('/page/');
        console.log('ShareImage: Is article page:', isArticle);
        return isArticle;
    }

    // 生成分享图片
    async generateShareImage() {
        if (this.isGenerating) return;

        this.isGenerating = true;
        this.showModal();
        this.updateProgress(0);

        try {
            // 1. 截取文章内容
            this.updateProgress(20);
            const articleCanvas = await this.captureArticle();

            // 2. 生成二维码
            this.updateProgress(60);
            const qrCanvas = await this.generateQRCode(window.location.href);

            // 3. 合成最终图片
            this.updateProgress(80);
            const finalCanvas = this.combineImage(articleCanvas, qrCanvas);

            // 4. 显示结果
            this.updateProgress(100);
            setTimeout(() => {
                this.showResult(finalCanvas);
            }, 500);

        } catch (error) {
            console.error('生成长图失败:', error);
            this.showError('生成失败，请重试');
        } finally {
            this.isGenerating = false;
        }
    }

    // 截取文章内容
    async captureArticle() {
        // 首先找到文章内容区域
        let articleElement = document.querySelector('.post-content') ||
                           document.querySelector('.post-single .content') ||
                           document.querySelector('article .content') ||
                           document.querySelector('article') ||
                           document.querySelector('main');

        if (!articleElement) {
            throw new Error('无法找到文章内容区域');
        }

        // 克隆元素以避免修改原始页面
        const articleClone = articleElement.cloneNode(true);

        // 移除所有图片以避免CORS问题
        const images = articleClone.querySelectorAll('img');
        images.forEach(img => img.remove());

        // 特殊处理iframe元素，替换为占位符
        const iframes = articleClone.querySelectorAll('iframe');
        iframes.forEach((iframe) => {
            const src = iframe.src || iframe.getAttribute('src');
            const width = iframe.style.width || iframe.width || '100%';
            const height = iframe.style.height || iframe.height || '400px';

            // 创建占位符div
            const placeholder = document.createElement('div');
            placeholder.style.cssText = `
                width: ${width};
                height: ${height};
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                background: #f8f9fa;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                margin: 1rem 0;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            `;

            placeholder.innerHTML = `
                <div style="font-size: 24px; margin-bottom: 8px;">🎯</div>
                <div style="font-size: 14px; color: #666; text-align: center; padding: 0 20px;">
                    <strong>交互式演示</strong><br>
                    <span style="font-size: 12px;">Slidev演示文稿</span><br>
                    <span style="font-size: 11px; color: #999;">请访问原文查看完整演示</span>
                </div>
                <div style="margin-top: 8px; font-size: 12px; color: #999;">
                    ${src}
                </div>
            `;

            // 替换iframe
            iframe.parentNode.replaceChild(placeholder, iframe);
        });

        // 记录需要隐藏的其他元素
        const elementsToHide = ['.toc', '.post-footer'];
        elementsToHide.forEach(selector => {
            const elements = articleClone.querySelectorAll(selector);
            elements.forEach(element => element.remove());
        });

        // 创建临时容器
        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `
            position: absolute;
            top: -10000px;
            left: -10000px;
            width: 800px;
            background: white;
            padding: 20px;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
        `;

        tempContainer.appendChild(articleClone);
        document.body.appendChild(tempContainer);

        try {
            // 等待渲染完成
            await new Promise(resolve => setTimeout(resolve, 300));

            const width = tempContainer.scrollWidth;
            const height = tempContainer.scrollHeight;

            console.log('截图尺寸:', { width, height, removedImages: images.length, iframeCount: iframes.length });

            // 简化配置，避免跨域问题
            const canvas = await html2canvas(tempContainer, {
                scale: this.options.scale,
                backgroundColor: '#ffffff',
                useCORS: false,
                allowTaint: false,
                foreignObjectRendering: false,
                logging: false,
                width: width,
                height: height,
                windowWidth: width,
                windowHeight: height,
                scrollX: 0,
                scrollY: 0,
                x: 0,
                y: 0,
                removeContainer: true,
                imageTimeout: 5000
            });

            console.log('截图完成，canvas尺寸:', { width: canvas.width, height: canvas.height });
            return canvas;

        } finally {
            // 清理临时容器
            if (tempContainer.parentNode) {
                tempContainer.parentNode.removeChild(tempContainer);
            }
        }
    }

    // 生成二维码
    generateQRCode(url) {
        return new Promise((resolve, reject) => {
            const size = this.options.qrSize * this.options.scale;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = size;
            canvas.height = size;

            // 创建临时div元素
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            document.body.appendChild(tempDiv);

            // 使用QRCode库生成二维码
            const qrcode = new QRCode(tempDiv, {
                text: url,
                width: size,
                height: size,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.M
            });

            // 等待二维码生成完成
            setTimeout(() => {
                try {
                    const qrImage = tempDiv.querySelector('img');
                    if (qrImage && qrImage.complete) {
                        // 绘制白色背景
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, size, size);

                        // 绘制二维码图像
                        ctx.drawImage(qrImage, 0, 0, size, size);
                    } else {
                        // 如果图像加载失败，使用canvas方法
                        const qrCanvas = tempDiv.querySelector('canvas');
                        if (qrCanvas) {
                            ctx.drawImage(qrCanvas, 0, 0, size, size);
                        }
                    }

                    // 清理临时元素
                    document.body.removeChild(tempDiv);
                    resolve(canvas);
                } catch (error) {
                    document.body.removeChild(tempDiv);
                    reject(error);
                }
            }, 100);
        });
    }

    // 合成图片
    combineImage(articleCanvas, qrCanvas) {
        const padding = this.options.padding * this.options.scale;
        const footerHeight = this.options.footerHeight * this.options.scale;

        const finalWidth = articleCanvas.width;
        const finalHeight = articleCanvas.height + padding + footerHeight;

        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = finalWidth;
        finalCanvas.height = finalHeight;

        const ctx = finalCanvas.getContext('2d');

        // 白色背景
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, finalWidth, finalHeight);

        // 绘制文章内容
        ctx.drawImage(articleCanvas, 0, 0);

        // 绘制底部区域
        const footerY = articleCanvas.height;
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, footerY, finalWidth, footerHeight);

        // 绘制分割线
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, footerY);
        ctx.lineTo(finalWidth, footerY);
        ctx.stroke();

        // 绘制二维码
        const qrX = finalWidth - qrCanvas.width - padding;
        const qrY = footerY + (footerHeight - qrCanvas.height) / 2;
        ctx.drawImage(qrCanvas, qrX, qrY);

        // 绘制文字信息
        ctx.fillStyle = '#333333';
        ctx.font = `bold ${16 * this.options.scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillText('扫码阅读原文', padding, footerY + 40 * this.options.scale);

        ctx.font = `${14 * this.options.scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillStyle = '#666666';
        ctx.fillText('来自 Gangjian Liu 的博客', padding, footerY + 70 * this.options.scale);

        // 绘制URL
        ctx.font = `${12 * this.options.scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillStyle = '#999999';
        const url = window.location.href;
        const maxWidth = qrX - padding * 2;
        ctx.fillText(this.truncateText(ctx, url, maxWidth), padding, footerY + 95 * this.options.scale);

        return finalCanvas;
    }

    // 文字截断
    truncateText(ctx, text, maxWidth) {
        const ellipsis = '...';
        let truncated = text;

        if (ctx.measureText(text).width <= maxWidth) {
            return text;
        }

        while (ctx.measureText(truncated + ellipsis).width > maxWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
        }

        return truncated + ellipsis;
    }

    // 显示模态框
    showModal() {
        document.getElementById('share-image-modal').style.display = 'flex';
        document.getElementById('share-status').style.display = 'block';
        document.getElementById('share-result').style.display = 'none';
    }

    // 隐藏模态框
    hideModal() {
        document.getElementById('share-image-modal').style.display = 'none';
    }

    // 更新进度
    updateProgress(percent) {
        document.getElementById('progress-bar').style.width = percent + '%';
    }

    // 显示结果
    showResult(canvas) {
        document.getElementById('share-status').style.display = 'none';
        document.getElementById('share-result').style.display = 'block';

        const resultCanvas = document.getElementById('share-canvas');
        resultCanvas.width = canvas.width;
        resultCanvas.height = canvas.height;

        const ctx = resultCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0);

        // 绑定下载按钮
        document.getElementById('download-btn').onclick = () => {
            this.downloadImage(canvas);
        };

        // 绑定复制按钮
        document.getElementById('copy-btn').onclick = () => {
            this.copyLink();
        };
    }

    // 显示错误
    showError(message) {
        document.getElementById('share-status').innerHTML = `
            <div style="color: #f44336; font-size: 16px;">
                <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
                <div>${message}</div>
                <button onclick="location.reload()" style="margin-top: 20px; background: #f44336; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">重试</button>
            </div>
        `;
    }

    // 下载图片
    downloadImage(canvas) {
        try {
            // 尝试创建高质量的PNG图片
            const dataURL = canvas.toDataURL('image/png', 1.0);

            const link = document.createElement('a');
            link.download = `blog-share-${Date.now()}.png`;
            link.href = dataURL;
            link.click();
        } catch (error) {
            console.error('下载图片失败:', error);

            // 如果因为CORS问题无法下载，提供备选方案
            this.showDownloadError();
        }
    }

    // 显示图片移除说明（用于提示用户为什么图片不在长图中）
    showImageRemovalNote() {
        const modal = document.getElementById('share-image-modal');
        const resultDiv = document.getElementById('share-result');
        const statusDiv = document.getElementById('share-status');

        // 显示说明信息
        statusDiv.style.display = 'block';
        statusDiv.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 32px; margin-bottom: 12px;">📝</div>
                <div style="color: var(--primary, #5a67d8); font-size: 15px; font-weight: 500; margin-bottom: 10px;">长图生成说明</div>
                <div style="color: #666; font-size: 13px; line-height: 1.5; max-width: 400px; margin: 0 auto;">
                    为确保图片可以正常下载，长图中已移除所有图片元素。<br>
                    您获得的是完整文本内容和结构的截图。
                </div>
            </div>
        `;

        resultDiv.style.display = 'none';
    }

    // 复制链接
    copyLink() {
        navigator.clipboard.writeText(window.location.href).then(() => {
            const btn = document.getElementById('copy-btn');
            const originalText = btn.textContent;
            btn.textContent = '已复制!';
            btn.style.background = '#4CAF50';

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '#2196F3';
            }, 2000);
        }).catch(() => {
            alert('复制失败，请手动复制链接');
        });
    }
}

// 立即隐藏原有的返回顶部按钮，避免闪烁
(function() {
    const originalTopLink = document.querySelector('.top-link');
    if (originalTopLink) {
        originalTopLink.style.display = 'none';
    }
})();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('ShareImage: DOMContentLoaded fired');
    // 等待其他库加载完成
    setTimeout(() => {
        console.log('ShareImage: Checking dependencies...');
        console.log('html2canvas available:', typeof html2canvas !== 'undefined');
        console.log('QRCode available:', typeof QRCode !== 'undefined');

        if (typeof html2canvas !== 'undefined' && typeof QRCode !== 'undefined') {
            console.log('ShareImage: All dependencies loaded, initializing...');
            new ShareImageGenerator().init();
        } else {
            console.warn('ShareImage: 依赖库未加载');
        }
    }, 1000);
});