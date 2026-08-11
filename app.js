document.addEventListener("DOMContentLoaded", () => {
    const splashScreen = document.getElementById("splash-screen");
    const appContainer = document.getElementById("app-container");
    const flipCard = document.getElementById("flip-card");
    
    // Inputs
    const photoUpload = document.getElementById("photo-upload");
    const imageToCrop = document.getElementById("image-to-crop");
    const cropperContainer = document.getElementById("cropper-container");
    const zoomInBtn = document.getElementById("zoom-in");
    const zoomOutBtn = document.getElementById("zoom-out");
    
    const nameInput = document.getElementById("builder-name");
    const roleInput = document.getElementById("builder-role");
    const titleInput = document.getElementById("builder-title");
    const rerollBtn = document.getElementById("reroll-btn");
    const xHandleInput = document.getElementById("x-handle");
    const btnFront = document.getElementById("btn-front");
    const btnBack = document.getElementById("btn-back");

    const resultImage = document.getElementById("result-image");
    const resultImageBack = document.getElementById("result-image-back");
    const downloadBtn = document.getElementById("download-btn");
    const shareBtn = document.getElementById("share-btn");
    
    const canvas = document.getElementById("card-canvas");
    const ctx = canvas.getContext("2d");

    let cropper = null;
    let isGenerating = false;
    
    // Unique ID for this session
    const builderId = Math.floor(1000 + Math.random() * 9000);

    // Fun Builder Titles
    const builderTitles = [
        "Nocturnal Hot-Reload Cowboy",
        "Console.log Connoisseur",
        "Div Centering Specialist",
        "Production Break Artist",
        "Stack Overflow Dependent",
        "Terminal Wizard",
        "Vim Exit Strategist",
        "10x Bug Creator",
        "Full Stack Magician",
        "CSS Whisperer",
        "Code Golf Champion"
    ];

    function getRandomTitle() {
        return builderTitles[Math.floor(Math.random() * builderTitles.length)];
    }

    // 1. Splash Screen Logic
    setTimeout(() => {
        splashScreen.classList.add("hidden");
        appContainer.classList.remove("hidden");
        
        titleInput.value = getRandomTitle();
        triggerRender();
    }, 3000);

    // 2. Real-time Listeners
    nameInput.addEventListener("input", triggerRender);
    roleInput.addEventListener("input", triggerRender);
    titleInput.addEventListener("input", triggerRender);
    xHandleInput.addEventListener("input", triggerRender);

    rerollBtn.addEventListener("click", () => {
        titleInput.value = getRandomTitle();
        triggerRender();
    });

    // 3. Card Flip Logic
    function updateFlipButtons() {
        if (flipCard.classList.contains("flipped")) {
            btnFront.classList.remove("active");
            btnBack.classList.add("active");
        } else {
            btnFront.classList.add("active");
            btnBack.classList.remove("active");
        }
    }

    flipCard.addEventListener("click", () => {
        flipCard.classList.toggle("flipped");
        updateFlipButtons();
    });

    if (btnFront && btnBack) {
        btnFront.addEventListener("click", () => {
            flipCard.classList.remove("flipped");
            updateFlipButtons();
        });

        btnBack.addEventListener("click", () => {
            flipCard.classList.add("flipped");
            updateFlipButtons();
        });
    }

    // 4. Image Upload & Cropper Logic
    photoUpload.addEventListener("change", function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            imageToCrop.src = event.target.result;
            cropperContainer.classList.remove("hidden");
            
            if (cropper) {
                cropper.destroy();
            }

            cropper = new Cropper(imageToCrop, {
                aspectRatio: 1,
                viewMode: 1,
                dragMode: 'move',
                autoCropArea: 1,
                restore: false,
                guides: false,
                center: false,
                highlight: false,
                cropBoxMovable: false,
                cropBoxResizable: false,
                toggleDragModeOnDblclick: false,
                ready() {
                    triggerRender();
                },
                cropend() {
                    triggerRender();
                },
                zoom() {
                    setTimeout(triggerRender, 100);
                }
            });
        };
        reader.readAsDataURL(file);
    });

    zoomInBtn.addEventListener("click", () => {
        if (cropper) {
            cropper.zoom(0.1);
            setTimeout(triggerRender, 100);
        }
    });
    
    zoomOutBtn.addEventListener("click", () => {
        if (cropper) {
            cropper.zoom(-0.1);
            setTimeout(triggerRender, 100);
        }
    });

    // 5. Drawing Logic
    async function triggerRender() {
        if (isGenerating) return;
        isGenerating = true;
        
        try {
            const name = nameInput.value.toUpperCase() || "YOUR NAME";
            const role = roleInput.value.toUpperCase() || "YOUR ROLE";
            const title = titleInput.value || "";
            const xHandle = xHandleInput.value.trim();
            
            let croppedImageObj = null;
            if (cropper) {
                const croppedCanvas = cropper.getCroppedCanvas({
                    width: 400,
                    height: 400,
                    imageSmoothingEnabled: true,
                    imageSmoothingQuality: 'high',
                });
                
                croppedImageObj = new Image();
                croppedImageObj.src = croppedCanvas.toDataURL();
                await new Promise((resolve) => croppedImageObj.onload = resolve);
            }

            await generateCard(name, role, title, xHandle, croppedImageObj);
            
            // Also generate the back of the card
            if (canvas.width > 0 && canvas.height > 0) {
                await generateBackCard(name, xHandle, canvas.width, canvas.height);
            }

        } catch (error) {
            console.error("Error rendering:", error);
        } finally {
            isGenerating = false;
        }
    }

    async function generateCard(name, role, title, xHandle, croppedImageObj) {
        return new Promise((resolve, reject) => {
            const bgImage = new Image();
            bgImage.crossOrigin = "Anonymous";
            bgImage.src = "bg.png";
            
            bgImage.onload = () => {
                const width = bgImage.width;
                const height = bgImage.height;
                canvas.width = width;
                canvas.height = height;

                // Dynamically set aspect ratio of the CSS card container to perfectly match the uploaded image
                if (flipCard) {
                    flipCard.style.aspectRatio = `${width} / ${height}`;
                }

                ctx.drawImage(bgImage, 0, 0, width, height);

                const centerX = width / 2;
                const centerY = height * 0.5;
                const radius = width * 0.18;
                
                ctx.save();
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.clip();
                
                if (croppedImageObj) {
                    ctx.drawImage(croppedImageObj, centerX - radius, centerY - radius, radius * 2, radius * 2);
                } else {
                    ctx.fillStyle = "#0c1410";
                    ctx.fill();
                    ctx.fillStyle = "#ffffff";
                    ctx.font = (width * 0.03) + "px 'Inter', sans-serif";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText("ADD PHOTO", centerX, centerY);
                }
                ctx.restore();

                // Draw Borders
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
                ctx.lineWidth = 12;
                ctx.strokeStyle = "#ff0066";
                ctx.stroke();
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius + 8, 0, Math.PI * 2, true);
                ctx.lineWidth = 4;
                ctx.strokeStyle = "#f1c40f";
                ctx.stroke();

                ctx.font = "bold " + (width * 0.045) + "px 'Inter', sans-serif";
                const nameMetrics = ctx.measureText(name);
                const boxWidth = Math.max(nameMetrics.width + 100, width * 0.5);
                const boxHeight = width * 0.08;
                
                const nameY = centerY + radius + (boxHeight / 4);
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                
                ctx.fillStyle = "#0d2818";
                ctx.fillRect(width/2 - boxWidth/2, nameY - boxHeight/2, boxWidth, boxHeight);
                ctx.strokeStyle = "#f1c40f";
                ctx.lineWidth = 3;
                ctx.strokeRect(width/2 - boxWidth/2, nameY - boxHeight/2, boxWidth, boxHeight);

                ctx.fillStyle = "#ffffff";
                ctx.fillText(name, width / 2, nameY);

                // Dynamic Data Panel
                const dataBoxTop = nameY + boxHeight/2;
                const dataBoxHeight = xHandle ? (width * 0.13) : (width * 0.10);
                
                ctx.fillStyle = "#0d2818";
                ctx.fillRect(width * 0.1, dataBoxTop, width * 0.8, dataBoxHeight);
                ctx.strokeStyle = "#164a2c";
                ctx.lineWidth = 2;
                ctx.strokeRect(width * 0.1, dataBoxTop, width * 0.8, dataBoxHeight);

                const roleY = dataBoxTop + (width * 0.04);
                ctx.fillStyle = "#f1c40f";
                ctx.font = "bold " + (width * 0.03) + "px 'Inter', sans-serif";
                ctx.fillText("⚡ " + role + " ⚡", width / 2, roleY);

                const titleY = roleY + (width * 0.04);
                ctx.fillStyle = "#ffffff";
                ctx.font = (width * 0.025) + "px 'Inter', sans-serif";
                ctx.fillText(title, width / 2, titleY);

                if (xHandle) {
                    const handleText = xHandle.startsWith('@') ? xHandle : '@' + xHandle;
                    ctx.fillStyle = "#a0b0a5";
                    ctx.font = (width * 0.02) + "px 'Inter', sans-serif";
                    ctx.fillText(handleText, width / 2, titleY + (width * 0.035));
                }

                // Footer Panel
                const footerTop = height * 0.87;
                const footerHeight = height - footerTop;
                
                ctx.fillStyle = "#0c1410";
                ctx.fillRect(0, footerTop, width, footerHeight);
                ctx.strokeStyle = "#ff0066";
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(0, footerTop);
                ctx.lineTo(width, footerTop);
                ctx.stroke();

                ctx.textBaseline = "alphabetic";

                const footerTextY1 = footerTop + (footerHeight * 0.4);
                const footerTextY2 = footerTop + (footerHeight * 0.7);

                ctx.fillStyle = "#ffffff";
                ctx.font = "bold " + (width * 0.025) + "px 'Inter', sans-serif";
                ctx.textAlign = "left";
                ctx.fillText("BUILDER ID", width * 0.1, footerTextY1);
                ctx.fillStyle = "#f1c40f";
                ctx.fillText("#HH-GOA-" + builderId, width * 0.1, footerTextY2);

                ctx.fillStyle = "#ffffff";
                ctx.textAlign = "right";
                ctx.fillText("CURRENTLY SHIPPING", width * 0.9, footerTextY1);
                ctx.fillStyle = "#f1c40f";
                ctx.fillText("BUILDING THE FUTURE", width * 0.9, footerTextY2);

                const dataUrl = canvas.toDataURL("image/png");
                resultImage.src = dataUrl;
                
                downloadBtn.onclick = () => {
                    const link = document.createElement("a");
                    link.download = `HH_Goa_2026_${name.replace(/\s+/g, '_')}.png`;
                    link.href = dataUrl;
                    link.click();
                };

                resolve();
            };
            bgImage.onerror = reject;
        });
    }

    async function generateBackCard(name, xHandle, width, height) {
        return new Promise((resolve) => {
            const canvasBack = document.getElementById("card-canvas-back");
            const ctxBack = canvasBack.getContext("2d");
            
            canvasBack.width = width;
            canvasBack.height = height;

            // Background
            ctxBack.fillStyle = "#06110a";
            ctxBack.fillRect(0, 0, width, height);
            
            // Border
            ctxBack.strokeStyle = "#164a2c";
            ctxBack.lineWidth = width * 0.02;
            ctxBack.strokeRect(width * 0.04, width * 0.04, width * 0.92, height - width * 0.08);

            // Header Text
            ctxBack.fillStyle = "#f1c40f";
            ctxBack.textAlign = "center";
            ctxBack.textBaseline = "middle";
            ctxBack.font = "bold " + (width * 0.06) + "px 'Playfair Display', serif";
            ctxBack.fillText("HACKER HOUSE GOA", width / 2, height * 0.15);

            ctxBack.fillStyle = "#ffffff";
            ctxBack.font = (width * 0.04) + "px 'Inter', sans-serif";
            ctxBack.fillText(name, width / 2, height * 0.25);

            // Fetch and draw QR Code
            // We use a public QR code API
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=https://hhgoa-frame-generator-eight.vercel.app/`;
            
            const qrImage = new Image();
            qrImage.crossOrigin = "Anonymous";
            qrImage.src = qrUrl;
            
            qrImage.onload = () => {
                const qrSize = width * 0.45;
                const qrX = width / 2 - qrSize / 2;
                const qrY = height * 0.35;
                
                // Draw white background for QR
                ctxBack.fillStyle = "#ffffff";
                ctxBack.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);
                ctxBack.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

                // Footer Text
                ctxBack.fillStyle = "#ff0066";
                ctxBack.font = "bold " + (width * 0.04) + "px 'Inter', sans-serif";
                ctxBack.fillText("#HH-GOA-" + builderId, width / 2, height * 0.88);
                
                ctxBack.fillStyle = "#a0b0a5";
                ctxBack.font = (width * 0.025) + "px 'Inter', sans-serif";
                ctxBack.fillText("Scan to connect", width / 2, height * 0.93);

                resultImageBack.src = canvasBack.toDataURL("image/png");
                resolve();
            };
            
            qrImage.onerror = () => {
                resultImageBack.src = canvasBack.toDataURL("image/png");
                resolve();
            };
        });
    }

    // 6. Share on X
    shareBtn.addEventListener("click", () => {
        const text = encodeURIComponent(`Built my Hacker House Goa Builder Card! 🌴🚀\n\nExcited to build, ship, and connect with amazing builders in Goa.\n\n#FrameInGoa #HHGoa2026`);
        const url = `https://twitter.com/intent/tweet?text=${text}`;
        window.open(url, "_blank");
    });
});
