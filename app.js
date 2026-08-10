document.addEventListener("DOMContentLoaded", () => {
    const splashScreen = document.getElementById("splash-screen");
    const appContainer = document.getElementById("app-container");
    const inputSection = document.getElementById("input-section");
    const resultSection = document.getElementById("result-section");
    const form = document.getElementById("generator-form");
    const photoUpload = document.getElementById("photo-upload");
    const previewImage = document.getElementById("preview-image");
    const resultImage = document.getElementById("result-image");
    const downloadBtn = document.getElementById("download-btn");
    const shareBtn = document.getElementById("share-btn");
    const resetBtn = document.getElementById("reset-btn");
    const canvas = document.getElementById("card-canvas");
    const ctx = canvas.getContext("2d");

    let uploadedImageObj = null;

    // 1. Splash Screen Logic
    setTimeout(() => {
        splashScreen.classList.add("hidden");
        appContainer.classList.remove("hidden");
    }, 3000);

    // 2. Handle Image Upload & Preview
    photoUpload.addEventListener("change", function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            uploadedImageObj = new Image();
            uploadedImageObj.onload = () => {
                previewImage.src = event.target.result;
                previewImage.style.display = "block";
            };
            uploadedImageObj.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    // 3. Generate ID Card
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        if (!uploadedImageObj) {
            alert("Please upload a photo first.");
            return;
        }

        const name = document.getElementById("builder-name").value.toUpperCase();
        const role = document.getElementById("builder-role").value.toUpperCase();

        const generateBtn = document.getElementById("generate-btn");
        const originalText = generateBtn.innerHTML;
        generateBtn.innerHTML = "Generating...";
        generateBtn.disabled = true;

        try {
            await generateCard(name, role);
            inputSection.classList.add("hidden");
            resultSection.classList.remove("hidden");
        } catch (error) {
            console.error("Error generating card:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
        }
    });

    async function generateCard(name, role) {
        return new Promise((resolve, reject) => {
            const bgImage = new Image();
            bgImage.crossOrigin = "Anonymous";
            // We use the generated background image
            bgImage.src = "bg.png";
            
            bgImage.onload = () => {
                // Set canvas size to match background
                const width = bgImage.width;
                const height = bgImage.height;
                canvas.width = width;
                canvas.height = height;

                // Draw background
                ctx.drawImage(bgImage, 0, 0, width, height);

                // Add dark overlay for better text readability at the top/bottom if needed
                // But let's assume the background is good as is, just draw text.
                
                // Draw Profile Picture (Circle in the middle)
                const centerX = width / 2;
                const centerY = height / 2.2; // Slightly above center
                const radius = width * 0.18; // 18% of width
                
                ctx.save();
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.clip();
                
                // Draw the uploaded image, scaled and centered to fit the circle
                const imgAspect = uploadedImageObj.width / uploadedImageObj.height;
                let drawWidth, drawHeight, drawX, drawY;
                
                if (imgAspect > 1) { // Landscape
                    drawHeight = radius * 2;
                    drawWidth = drawHeight * imgAspect;
                    drawX = centerX - drawWidth / 2;
                    drawY = centerY - radius;
                } else { // Portrait
                    drawWidth = radius * 2;
                    drawHeight = drawWidth / imgAspect;
                    drawX = centerX - radius;
                    drawY = centerY - drawHeight / 2;
                }
                
                ctx.drawImage(uploadedImageObj, drawX, drawY, drawWidth, drawHeight);
                ctx.restore();

                // Draw a border around the profile picture
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
                ctx.lineWidth = 12;
                ctx.strokeStyle = "#ff0066"; // Accent pink
                ctx.stroke();
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius + 8, 0, Math.PI * 2, true);
                ctx.lineWidth = 4;
                ctx.strokeStyle = "#f1c40f"; // Accent yellow
                ctx.stroke();

                // Draw Header Text (HACKER HOUSE GOA)
                ctx.textAlign = "center";
                ctx.fillStyle = "#f1c40f";
                ctx.font = "bold " + (width * 0.08) + "px 'Playfair Display', serif";
                ctx.fillText("HACKER HOUSE", width / 2, height * 0.15);
                
                ctx.fillStyle = "#ff0066";
                ctx.font = "bold " + (width * 0.05) + "px sans-serif";
                ctx.fillText("गोवा", width / 2, height * 0.22);
                
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold " + (width * 0.02) + "px 'Inter', sans-serif";
                ctx.letterSpacing = "5px"; // Note: letterSpacing in canvas requires modern browsers, we can simulate or ignore.
                ctx.fillText("28 - 31 OCT 2026", width / 2, height * 0.26);

                // Draw Name
                const nameY = height * 0.75;
                ctx.fillStyle = "#ffffff";
                
                // Draw name background box
                ctx.font = "bold " + (width * 0.045) + "px 'Inter', sans-serif";
                const nameMetrics = ctx.measureText(name);
                const boxWidth = Math.max(nameMetrics.width + 100, width * 0.5);
                const boxHeight = width * 0.08;
                
                ctx.fillStyle = "#0d2818"; // Dark green box
                ctx.fillRect(width/2 - boxWidth/2, nameY - boxHeight + (width*0.02), boxWidth, boxHeight);
                ctx.strokeStyle = "#f1c40f";
                ctx.lineWidth = 3;
                ctx.strokeRect(width/2 - boxWidth/2, nameY - boxHeight + (width*0.02), boxWidth, boxHeight);

                ctx.fillStyle = "#ffffff";
                ctx.fillText(name, width / 2, nameY);

                // Draw Role
                ctx.fillStyle = "#f1c40f"; // Yellow
                ctx.font = "bold " + (width * 0.03) + "px 'Inter', sans-serif";
                ctx.fillText("⚡ " + role + " ⚡", width / 2, nameY + height * 0.06);

                // Draw Footer / Badge details
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold " + (width * 0.025) + "px 'Inter', sans-serif";
                ctx.fillText("BUILDER ID", width * 0.25, height * 0.88);
                ctx.fillStyle = "#ff0066";
                ctx.fillText("#HH-GOA-" + Math.floor(1000 + Math.random() * 9000), width * 0.25, height * 0.92);

                ctx.fillStyle = "#ffffff";
                ctx.fillText("CURRENTLY SHIPPING", width * 0.75, height * 0.88);
                ctx.fillStyle = "#ff0066";
                ctx.fillText("BUILDING THE FUTURE", width * 0.75, height * 0.92);

                // Export to image element
                const dataUrl = canvas.toDataURL("image/png");
                resultImage.src = dataUrl;
                
                // Setup download button
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

    // 4. Share on X
    shareBtn.addEventListener("click", () => {
        // Twitter sharing usually takes a URL or text. Since we generate the image client-side, 
        // they can't attach it automatically via a web intent URL. 
        // We prompt them to copy/paste or save and share.
        // As a fallback, we create the pre-filled text.
        const text = encodeURIComponent("Built my Hacker House Goa Builder Card! 🌴🚀\n\nExcited to build, ship, and connect with amazing builders in Goa.\n\n#FrameInGoa #HHGoa2026");
        const url = `https://twitter.com/intent/tweet?text=${text}`;
        window.open(url, "_blank");
    });

    // 5. Reset
    resetBtn.addEventListener("click", () => {
        resultSection.classList.add("hidden");
        inputSection.classList.remove("hidden");
        form.reset();
        previewImage.style.display = "none";
        uploadedImageObj = null;
    });
});
