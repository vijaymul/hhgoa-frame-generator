document.addEventListener("DOMContentLoaded", () => {
    const splashScreen = document.getElementById("splash-screen");
    const appContainer = document.getElementById("app-container");
    
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

    const resultImage = document.getElementById("result-image");
    const downloadBtn = document.getElementById("download-btn");
    const shareBtn = document.getElementById("share-btn");
    
    const canvas = document.getElementById("card-canvas");
    const ctx = canvas.getContext("2d");

    let cropper = null;
    let isGenerating = false;

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
        
        // Initial title and render
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

    // 3. Image Upload & Cropper Logic
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
                    // Timeout ensures we get the state after zoom completes
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

    // 4. Drawing Logic
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

                ctx.drawImage(bgImage, 0, 0, width, height);

                const centerX = width / 2;
                const centerY = height * 0.4;
                const radius = width * 0.18;
                
                ctx.save();
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.clip();
                
                // Draw Cropped Image or Placeholder
                if (croppedImageObj) {
                    ctx.drawImage(croppedImageObj, centerX - radius, centerY - radius, radius * 2, radius * 2);
                } else {
                    // Dark placeholder circle if no image uploaded yet
                    ctx.fillStyle = "#0c1410";
                    ctx.fill();
                    ctx.fillStyle = "#ffffff";
                    ctx.font = (width * 0.03) + "px 'Inter', sans-serif";
                    ctx.textAlign = "center";
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
                
                // Draw Name (Overlapping the circle slightly)
                const nameY = centerY + radius + (boxHeight / 4);
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                
                // Name Box
                ctx.fillStyle = "#0d2818";
                ctx.fillRect(width/2 - boxWidth/2, nameY - boxHeight/2, boxWidth, boxHeight);
                ctx.strokeStyle = "#f1c40f";
                ctx.lineWidth = 3;
                ctx.strokeRect(width/2 - boxWidth/2, nameY - boxHeight/2, boxWidth, boxHeight);

                ctx.fillStyle = "#ffffff";
                ctx.fillText(name, width / 2, nameY);

                // Draw Role
                const roleY = nameY + boxHeight/2 + (width * 0.05);
                ctx.fillStyle = "#f1c40f";
                ctx.font = "bold " + (width * 0.03) + "px 'Inter', sans-serif";
                ctx.fillText("⚡ " + role + " ⚡", width / 2, roleY);

                // Draw Title
                const titleY = roleY + (width * 0.04);
                ctx.fillStyle = "#ffffff";
                ctx.font = (width * 0.025) + "px 'Inter', sans-serif";
                ctx.fillText(title, width / 2, titleY);

                // Draw X Handle
                if (xHandle) {
                    const handleText = xHandle.startsWith('@') ? xHandle : '@' + xHandle;
                    ctx.fillStyle = "#a0b0a5";
                    ctx.font = (width * 0.02) + "px 'Inter', sans-serif";
                    ctx.fillText(handleText, width / 2, titleY + (width * 0.035));
                }

                // Reset text baseline for footer
                ctx.textBaseline = "alphabetic";

                // Draw Footer Details
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold " + (width * 0.025) + "px 'Inter', sans-serif";
                ctx.textAlign = "left";
                ctx.fillText("BUILDER ID", width * 0.25, height * 0.88);
                ctx.fillStyle = "#ff0066";
                ctx.fillText("#HH-GOA-2026", width * 0.25, height * 0.92);

                ctx.fillStyle = "#ffffff";
                ctx.textAlign = "right";
                ctx.fillText("CURRENTLY SHIPPING", width * 0.75, height * 0.88);
                ctx.fillStyle = "#ff0066";
                ctx.fillText("BUILDING THE FUTURE", width * 0.75, height * 0.92);

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

    // 5. Share on X
    shareBtn.addEventListener("click", () => {
        const text = encodeURIComponent(`Built my Hacker House Goa Builder Card! 🌴🚀\n\nExcited to build, ship, and connect with amazing builders in Goa.\n\n#FrameInGoa #HHGoa2026`);
        const url = `https://twitter.com/intent/tweet?text=${text}`;
        window.open(url, "_blank");
    });
});
